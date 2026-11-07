require("dotenv").config();

const required = ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_ANON_KEY"];
const missing = required.filter((name) => !process.env[name]);

if (missing.length > 0) {
    console.error(`❌ Thiếu biến môi trường: ${missing.join(", ")} (xem file .env.example)`);
    process.exit(1);
}

module.exports = {
    // PORT không cần khai báo: dev tự chạy cổng 5000, còn khi deploy thì nền tảng tự cấp
    port: Number(process.env.PORT) || 5000,
    nodeEnv: process.env.NODE_ENV || "development",
    // Domain frontend được phép gọi API, cách nhau bằng dấu phẩy.
    // Bỏ dấu "/" ở cuối vì trình duyệt gửi Origin không có dấu này, thừa dấu là bị CORS chặn.
    corsOrigins: (process.env.CORS_ORIGIN || "")
        .split(",")
        .map((s) => s.trim().replace(/\/+$/, ""))
        .filter(Boolean),
    trustProxy: process.env.TRUST_PROXY || "",
    masteryStreak: Number(process.env.MASTERY_STREAK) || 3,
    supabase: {
        url: process.env.SUPABASE_URL,
        serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
        anonKey: process.env.SUPABASE_ANON_KEY,
    },
};