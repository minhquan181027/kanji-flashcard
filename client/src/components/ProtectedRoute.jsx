import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Trang chỉ dành cho người đã đăng nhập, chưa thì chuyển sang /login rồi quay lại sau
export default function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) return <p className="status">Đang kiểm tra đăng nhập...</p>;
    if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
    return children;
}