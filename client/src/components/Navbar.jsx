import { NavLink } from "react-router-dom";

export default function Navbar() {
    const linkClass = ({ isActive }) => "nav-link" + (isActive ? " active" : "");

    return (
        <header className="navbar">
            <div className="navbar-inner">
                <NavLink to="/" className="brand">
                    <span className="brand-mark">漢</span>
                    <span className="brand-text">Học Tiếng Nhật</span>
                </NavLink>

                <nav className="nav-links">
                    <NavLink to="/" end className={linkClass}>Trang chủ</NavLink>
                    <NavLink to="/kanji" className={linkClass}>Kanji</NavLink>
                    <NavLink to="/vocabulary" className={linkClass}>Từ vựng</NavLink>
                </nav>
            </div>
        </header>
    );
}