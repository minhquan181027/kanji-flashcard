const { createClient } = require("@supabase/supabase-js");
const env = require("./env");

const options = {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
};

// Client quyền cao (service role) dùng để đọc/ghi database. Chỉ chạy ở server.
const supabaseAdmin = createClient(env.supabase.url, env.supabase.serviceRoleKey, options);

// Đăng ký / đăng nhập / làm mới phiên dùng client riêng (khóa anon) cho từng lần gọi.
// Nếu dùng chung client service role, phiên của người dùng sẽ ghi đè khóa service role
// và các truy vấn sau đó chạy với quyền của người đó.
const createAuthClient = () => createClient(env.supabase.url, env.supabase.anonKey, options);

module.exports = { supabaseAdmin, createAuthClient };