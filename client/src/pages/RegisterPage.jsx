import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RegisterPage() {
    const { user, register } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        email: "",
        username: "",
        displayName: "",
        password: "",
        confirm: "",
    });
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const [submitting, setSubmitting] = useState(false);

    if (user) return <Navigate to="/" replace />;

    const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

    const onSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (form.password !== form.confirm) {
            setError("Mật khẩu nhập lại không khớp");
            return;
        }

        try {
            setSubmitting(true);
            const result = await register({
                email: form.email,
                username: form.username,
                displayName: form.displayName,
                password: form.password,
            });

            if (result.needsEmailConfirmation) {
                // Project Supabase bật xác nhận email: chưa đăng nhập ngay được
                setNotice("Đăng ký thành công! Hãy kiểm tra email để xác nhận tài khoản, sau đó đăng nhập.");
                setSubmitting(false);
            } else {
                navigate("/", { replace: true });
            }
        } catch (err) {
            setError(err.message);
            setSubmitting(false);
        }
    };

    if (notice) {
        return (
            <div className="auth-card">
                <h1>Đăng ký</h1>
                <p className="form-notice">{notice}</p>
                <Link to="/login" className="btn btn-primary">Đến trang đăng nhập</Link>
            </div>
        );
    }

    return (
        <div className="auth-card">
            <h1>Đăng ký</h1>
            <p className="subtitle">Tạo tài khoản để lưu tiến độ học của riêng bạn</p>

            <form onSubmit={onSubmit} className="auth-form">
                <label className="form-field">
                    <span>Email</span>
                    <input type="email" value={form.email} onChange={update("email")} autoComplete="email" required />
                </label>

                <label className="form-field">
                    <span>Tên đăng nhập</span>
                    <input
                        type="text"
                        value={form.username}
                        onChange={update("username")}
                        autoComplete="username"
                        minLength={3}
                        maxLength={20}
                        pattern="[a-zA-Z0-9_]+"
                        title="3-20 ký tự: chữ không dấu, số hoặc dấu gạch dưới"
                        required
                    />
                </label>

                <label className="form-field">
                    <span>Tên hiển thị (không bắt buộc)</span>
                    <input type="text" value={form.displayName} onChange={update("displayName")} maxLength={50} />
                </label>

                <label className="form-field">
                    <span>Mật khẩu (ít nhất 8 ký tự)</span>
                    <input
                        type="password"
                        value={form.password}
                        onChange={update("password")}
                        autoComplete="new-password"
                        minLength={8}
                        maxLength={72}
                        required
                    />
                </label>

                <label className="form-field">
                    <span>Nhập lại mật khẩu</span>
                    <input
                        type="password"
                        value={form.confirm}
                        onChange={update("confirm")}
                        autoComplete="new-password"
                        required
                    />
                </label>

                {error && <p className="form-error">{error}</p>}

                <button className="btn btn-primary btn-big" type="submit" disabled={submitting}>
                    {submitting ? "Đang tạo tài khoản..." : "Đăng ký"}
                </button>
            </form>

            <p className="auth-switch">
                Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
            </p>
        </div>
    );
}