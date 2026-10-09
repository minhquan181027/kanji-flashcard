import { Link } from "react-router-dom";

export default function HomePage() {
    return (
        <div className="home">
            <div className="home-kanji">日本語</div>
            <h1>Học Tiếng Nhật</h1>
            <p className="subtitle">Chọn nội dung bạn muốn luyện bằng flashcard</p>

            <div className="home-cards">
                <Link to="/kanji" className="menu-card">
                    <span className="menu-card-icon">漢</span>
                    <h3>Kanji N5</h3>
                    <p>103 chữ, kèm âm Hán Việt</p>
                </Link>

                <Link to="/vocabulary" className="menu-card">
                    <span className="menu-card-icon">語</span>
                    <h3>Từ vựng</h3>
                    <p>Học theo từng Unit, có câu ví dụ</p>
                </Link>
            </div>
        </div>
    );
}