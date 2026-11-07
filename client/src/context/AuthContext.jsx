import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
    fetchMe,
    fetchReviewSummary,
    loadSession,
    loginUser,
    registerUser,
    saveSession,
    setAuthLostHandler,
} from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(() => Boolean(loadSession())); // đang kiểm tra phiên cũ
    const [summary, setSummary] = useState(null); // { kanji: {hard, mastered}, vocab: {...} }
    const timer = useRef(null);

    // Phiên hết hạn hẳn (làm mới token thất bại)
    useEffect(() => {
        setAuthLostHandler(() => {
            setUser(null);
            setSummary(null);
        });
    }, []);

    // Mở trang: nếu còn phiên cũ thì lấy lại thông tin người dùng
    useEffect(() => {
        if (!loadSession()) return;
        fetchMe()
            .then(setUser)
            .catch(() => { }) // hết phiên thì api.js đã tự xử lý
            .finally(() => setLoading(false));
    }, []);

    const refreshSummary = useCallback(() => {
        fetchReviewSummary()
            .then(setSummary)
            .catch(() => { });
    }, []);

    // Gọi liên tục khi đang luyện thì gộp lại, chỉ cập nhật sau 0,8 giây yên tĩnh
    const refreshSummarySoon = useCallback(() => {
        clearTimeout(timer.current);
        timer.current = setTimeout(refreshSummary, 800);
    }, [refreshSummary]);

    useEffect(() => {
        if (user) refreshSummary();
    }, [user, refreshSummary]);

    const login = useCallback(async (email, password) => {
        const data = await loginUser({ email, password });
        saveSession(data.session);
        setUser(data.user);
        return data.user;
    }, []);

    const register = useCallback(async (payload) => {
        const data = await registerUser(payload);
        if (data.session) {
            saveSession(data.session);
            setUser(data.user);
        }
        return data;
    }, []);

    const logout = useCallback(() => {
        saveSession(null);
        setUser(null);
        setSummary(null);
    }, []);

    const value = useMemo(
        () => ({ user, loading, summary, login, register, logout, refreshSummary, refreshSummarySoon }),
        [user, loading, summary, login, register, logout, refreshSummary, refreshSummarySoon]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth phải được dùng bên trong <AuthProvider>");
    return ctx;
}