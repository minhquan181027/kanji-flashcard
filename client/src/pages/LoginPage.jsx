import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
    const { user, login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from || "/";

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    if (user) return <Navigate to={from} replace />;

    const onSubmit = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            setError("");
            await login(email, password);
            navigate(from, { replace: true });
        } catch (err) {
            setError(err.message);
            setSubmitting(false);
        }
    };

    return (
        <div className="auth-card">
            <h1>Đăng nhập</h1>
            <p className="subtitle">Đăng nhập để lưu tiến độ và ôn lại những từ hay quên</p>

            <form onSubmit={onSubmit} className="auth-form">
                <label className="form-field">
                    <span>Email</span>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                        required
                    />
                </label>

                <label className="form-field">
                    <span>Mật khẩu</span>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="current-password"
                        required
                    />
                </label>

                {error && <p className="form-error">{error}</p>}

                <button className="btn btn-primary btn-big" type="submit" disabled={submitting}>
                    {submitting ? "Đang đăng nhập..." : "Đăng nhập"}
                </button>
            </form>

            <p className="auth-switch">
                Chưa có tài khoản? <Link to="/register">Đăng ký</Link>
            </p>
        </div>
    );
}