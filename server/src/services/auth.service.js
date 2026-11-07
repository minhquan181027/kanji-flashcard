const { supabaseAdmin, createAuthClient } = require("../config/supabase");
const HttpError = require("../utils/httpError");
const { unwrap } = require("../utils/db");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/;
const PROFILE_COLUMNS = "id, username, display_name, role";

const toSession = (session) =>
    session
        ? {
            accessToken: session.access_token,
            refreshToken: session.refresh_token,
            expiresAt: session.expires_at ?? null,
        }
        : null;

const toUser = (id, email, profile) => ({
    id,
    email,
    username: profile?.username ?? null,
    displayName: profile?.display_name ?? null,
    role: profile?.role ?? "user",
});

async function fetchProfile(userId) {
    return unwrap(
        await supabaseAdmin.from("profiles").select(PROFILE_COLUMNS).eq("id", userId).maybeSingle(),
        "Không lấy được hồ sơ người dùng"
    );
}

function validateRegister({ email, password, username, displayName }) {
    const cleanEmail = String(email ?? "").trim().toLowerCase();
    const cleanUsername = String(username ?? "").trim();
    const cleanDisplayName = String(displayName ?? "").trim();

    if (!EMAIL_RE.test(cleanEmail)) throw new HttpError(400, "Email không hợp lệ");
    if (!USERNAME_RE.test(cleanUsername)) {
        throw new HttpError(400, "Tên đăng nhập gồm 3-20 ký tự: chữ không dấu, số hoặc dấu gạch dưới");
    }
    if (typeof password !== "string" || password.length < 8 || password.length > 72) {
        throw new HttpError(400, "Mật khẩu phải từ 8 đến 72 ký tự");
    }
    if (cleanDisplayName.length > 50) throw new HttpError(400, "Tên hiển thị tối đa 50 ký tự");

    return {
        email: cleanEmail,
        password,
        username: cleanUsername,
        displayName: cleanDisplayName || cleanUsername,
    };
}

function mapSignUpError(error) {
    if (error.code === "user_already_exists" || /already registered/i.test(error.message)) {
        return new HttpError(409, "Email này đã được đăng ký");
    }
    if (error.code === "weak_password") {
        return new HttpError(400, "Mật khẩu quá yếu, hãy dùng mật khẩu dài và khó đoán hơn");
    }
    if (error.code === "over_email_send_rate_limit" || error.status === 429) {
        return new HttpError(429, "Gửi quá nhiều yêu cầu, vui lòng thử lại sau");
    }
    console.error("signUp lỗi:", error.code, error.message);
    return new HttpError(400, "Không thể đăng ký, vui lòng kiểm tra lại thông tin");
}

async function register(input) {
    const { email, password, username, displayName } = validateRegister(input);

    // Kiểm tra trước để khỏi tạo tài khoản rồi mới phát hiện trùng tên đăng nhập
    const taken = unwrap(
        await supabaseAdmin.from("profiles").select("id").ilike("username", username).limit(1),
        "Không kiểm tra được tên đăng nhập"
    );
    if (taken.length > 0) throw new HttpError(409, "Tên đăng nhập đã được sử dụng");

    const { data, error } = await createAuthClient().auth.signUp({
        email,
        password,
        options: { data: { username, display_name: displayName } },
    });
    if (error) throw mapSignUpError(error);

    const user = data.user;
    // Email đã tồn tại: Supabase không báo lỗi mà trả về user không có identities
    if (!user || (Array.isArray(user.identities) && user.identities.length === 0)) {
        throw new HttpError(409, "Email này đã được đăng ký");
    }

    const { data: profile, error: profileError } = await supabaseAdmin
        .from("profiles")
        .upsert({ id: user.id, username, display_name: displayName }, { onConflict: "id" })
        .select("username, display_name, role")
        .single();

    if (profileError) {
        // Hoàn tác: xóa tài khoản vừa tạo để không bị "mồ côi" thiếu hồ sơ
        await supabaseAdmin.auth.admin.deleteUser(user.id);
        if (profileError.code === "23505") throw new HttpError(409, "Tên đăng nhập đã được sử dụng");
        console.error("Tạo profile lỗi:", profileError.message);
        throw new HttpError(500, "Không tạo được hồ sơ người dùng");
    }

    return {
        user: toUser(user.id, user.email, profile),
        session: toSession(data.session),
        // Project bật xác nhận email thì chưa có phiên đăng nhập ngay
        needsEmailConfirmation: !data.session,
    };
}

async function login({ email, password }) {
    const cleanEmail = String(email ?? "").trim().toLowerCase();
    if (!EMAIL_RE.test(cleanEmail) || typeof password !== "string" || !password) {
        throw new HttpError(400, "Vui lòng nhập email và mật khẩu");
    }

    const { data, error } = await createAuthClient().auth.signInWithPassword({
        email: cleanEmail,
        password,
    });

    if (error || !data?.session) {
        if (error?.code === "email_not_confirmed") {
            throw new HttpError(403, "Email chưa được xác nhận, hãy kiểm tra hộp thư của bạn");
        }
        throw new HttpError(401, "Email hoặc mật khẩu không đúng");
    }

    const profile = await fetchProfile(data.user.id);

    const { error: updateError } = await supabaseAdmin
        .from("profiles")
        .update({ last_login_at: new Date().toISOString() })
        .eq("id", data.user.id);
    if (updateError) console.error("Không cập nhật được last_login_at:", updateError.message);

    return {
        user: toUser(data.user.id, data.user.email, profile),
        session: toSession(data.session),
    };
}

async function refresh(refreshToken) {
    if (typeof refreshToken !== "string" || !refreshToken) {
        throw new HttpError(400, "Thiếu refreshToken");
    }

    const { data, error } = await createAuthClient().auth.refreshSession({
        refresh_token: refreshToken,
    });
    if (error || !data?.session) {
        throw new HttpError(401, "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");
    }

    return { session: toSession(data.session) };
}

async function getMe(authUser) {
    const profile = await fetchProfile(authUser.id);
    return toUser(authUser.id, authUser.email, profile);
}

module.exports = { register, login, refresh, getMe };