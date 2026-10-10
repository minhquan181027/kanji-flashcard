import { useEffect, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

import { fetchVocabUnits } from "../services/api";

// Menu xổ xuống: rê chuột vào là hiện danh sách (trên điện thoại thì chạm để mở)
// items: [{ to, label }]
function NavDropdown({ label, basePath, items, emptyText = "Chưa có dữ liệu" }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    const { pathname } = useLocation();
    const active = pathname.startsWith(basePath);

    // Đóng menu khi chuyển trang
    useEffect(() => {
        setOpen(false);
    }, [pathname]);

    // Bấm ra ngoài thì đóng menu
    useEffect(() => {
        const onClickOutside = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener("mousedown", onClickOutside);
        return () => document.removeEventListener("mousedown", onClickOutside);
    }, []);

    return (
        <div
            className="dropdown"
            ref={ref}
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
        >
            <button
                type="button"
                className={`nav-link dropdown-toggle ${active ? "active" : ""}`}
                onClick={() => setOpen(true)}
                aria-haspopup="menu"
                aria-expanded={open}
            >
                {label} <span className="caret">▾</span>
            </button>

            {open && (
                <div className="dropdown-menu" role="menu">
                    {items.length === 0 && <span className="dropdown-empty">{emptyText}</span>}
                    {items.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) => "dropdown-item" + (isActive ? " active" : "")}
                            role="menuitem"
                        >
                            {item.label}
                        </NavLink>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function Navbar() {
    const [units, setUnits] = useState([]);

    // Lấy danh sách Unit từ server để hiện trong menu "Từ vựng"
    useEffect(() => {
        fetchVocabUnits()
            .then(setUnits)
            .catch(() => setUnits([]));
    }, []);

    const LEVELS = ["N5", "N4", "N3", "N2", "N1"];
    const kanjiItems = LEVELS.map((level) => ({
        to: `/kanji/${level.toLowerCase()}`,
        label: level,
    }));

    const vocabItems = units.map((u) => ({
        to: `/vocabulary/${u.id}`,
        label: u.title,
    }));

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
                    <NavDropdown label="Kanji" basePath="/kanji" items={kanjiItems} />
                    <NavDropdown
                        label="Từ vựng"
                        basePath="/vocabulary"
                        items={vocabItems}
                        emptyText="Chưa có Unit nào"
                    />
                </nav>
            </div>
        </header>
    );
}