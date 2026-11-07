import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function HomePage() {
    const { user, summary } = useAuth();

    return (
        <div className="home">
            <div className="home-kanji">日本語</div>
            <h1>Học Tiếng Nhật</h1>
            <p className="subtitle">Chọn nội dung bạn muốn luyện bằng flashcard</p>

            <div className="home-cards">
                <Link to="/kanji/n5" className="menu-card">
                    <span className="menu-card-icon">漢</span>
                    <h3>Kanji</h3>
                    <p>Luyện theo cấp độ N5 → N1, kèm âm Hán Việt</p>
                </Link>

                <Link to="/vocabulary" className="menu-card">
                    <span className="menu-card-icon">語</span>
                    <h3>Từ vựng</h3>
                    <p>Học theo từng Unit, có câu ví dụ</p>
                </Link>

                <Link to="/review/kanji" className="menu-card">
                    <span className="menu-card-icon">復</span>
                    <h3>Kanji hay quên</h3>
                    <p>
                        {user ? `${summary?.kanji.hard ?? 0} chữ cần ôn lại` : "Đăng nhập để dùng"}
                    </p>
                </Link>

                <Link to="/review/vocab" className="menu-card">
                    <span className="menu-card-icon">習</span>
                    <h3>Từ vựng hay quên</h3>
                    <p>
                        {user ? `${summary?.vocab.hard ?? 0} từ cần ôn lại` : "Đăng nhập để dùng"}
                    </p>
                </Link>
            </div>
        </div>
    );
}