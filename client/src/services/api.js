// Mọi lệnh gọi API tới server Express nằm ở đây.
// Khi dev, Vite proxy /api sang cổng 5000. Khi deploy tách riêng, đặt VITE_API_URL
// (ví dụ https://api.ten-mien.com) rồi build lại client.
const BASE = `${import.meta.env.VITE_API_URL || ""}/api`;
const SESSION_KEY = "kf_session";

export class ApiError extends Error {
    constructor(status, message) {
        super(message);
        this.name = "ApiError";
        this.status = status; // 0 = không kết nối được server
    }
}

// ---------- Phiên đăng nhập (lưu trong localStorage) ----------
export function loadSession() {
    try {
        return JSON.parse(localStorage.getItem(SESSION_KEY));
    } catch {
        return null;
    }
}

export function saveSession(session) {
    try {
        if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
        else localStorage.removeItem(SESSION_KEY);
    } catch {
        // localStorage bị chặn thì bỏ qua, người dùng chỉ phải đăng nhập lại
    }
}

// AuthContext đăng ký hàm này để biết khi nào phiên hết hạn hẳn
let onAuthLost = () => { };
export function setAuthLostHandler(handler) {
    onAuthLost = handler;
}

// ---------- Làm mới access token khi hết hạn ----------
let refreshing = null; // nhiều request cùng gặp 401 thì chỉ làm mới một lần

function refreshSession() {
    if (refreshing) return refreshing;

    const current = loadSession();
    if (!current?.refreshToken) return Promise.resolve(null);

    refreshing = (async () => {
        try {
            const res = await fetch(`${BASE}/auth/refresh`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ refreshToken: current.refreshToken }),
            });
            if (!res.ok) return null;
            const data = await res.json();
            saveSession(data.session);
            return data.session;
        } catch {
            return null;
        } finally {
            refreshing = null;
        }
    })();

    return refreshing;
}

// ---------- Hàm gọi API chung ----------
async function request(path, { method = "GET", body, auth = true, retry = true } = {}) {
    const headers = {};
    if (body !== undefined) headers["Content-Type"] = "application/json";

    const session = auth ? loadSession() : null;
    if (session?.accessToken) headers.Authorization = `Bearer ${session.accessToken}`;

    let res;
    try {
        res = await fetch(`${BASE}${path}`, {
            method,
            headers,
            body: body !== undefined ? JSON.stringify(body) : undefined,
        });
    } catch {
        throw new ApiError(0, "Không kết nối được tới server");
    }

    // Token hết hạn: thử làm mới một lần rồi gọi lại
    if (res.status === 401 && session && retry) {
        const fresh = await refreshSession();
        if (fresh) return request(path, { method, body, auth, retry: false });
        saveSession(null);
        onAuthLost();
    }

    const data = await res.json().catch(() => null);
    if (!res.ok) throw new ApiError(res.status, data?.error || "Có lỗi xảy ra, vui lòng thử lại");
    return data;
}

// ---------- Nội dung (công khai) ----------
export function fetchKanji({ level = "N5", shuffle = true, limit } = {}) {
    const params = new URLSearchParams({ level, shuffle: String(shuffle) });
    if (limit) params.set("limit", String(limit));
    return request(`/kanji?${params.toString()}`, { auth: false });
}

export const fetchVocabUnits = () => request("/vocab/units", { auth: false });

export const fetchVocabUnit = (code, { shuffle = true } = {}) =>
    request(`/vocab/units/${encodeURIComponent(code)}?shuffle=${shuffle}`, { auth: false });

// ---------- Tài khoản ----------
export const registerUser = (payload) =>
    request("/auth/register", { method: "POST", body: payload, auth: false });

export const loginUser = (payload) =>
    request("/auth/login", { method: "POST", body: payload, auth: false });

export const fetchMe = () => request("/auth/me");

// ---------- Tiến độ và ôn tập (cần đăng nhập) ----------
export const recordAnswer = ({ type, itemId, remembered }) =>
    request("/progress/answer", { method: "POST", body: { type, itemId, remembered } });

export const fetchReviewSummary = () => request("/review/summary");

export const fetchReviewCards = (type, { shuffle = false, limit } = {}) => {
    const params = new URLSearchParams({ shuffle: String(shuffle) });
    if (limit) params.set("limit", String(limit));
    return request(`/review/${type}?${params.toString()}`);
};