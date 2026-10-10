import { useCallback, useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import PracticeSession from "../components/PracticeSession";

import { fetchKanji } from "../services/api";

// Lấy cấp độ từ URL (/kanji/n5) rồi giao cho KanjiLevel.
// Dùng key={level} để đổi cấp độ là reset sạch trạng thái.
export default function KanjiPage() {
    const { level } = useParams();
    const lv = (level || "").toUpperCase();
    const LEVELS = ["N5", "N4", "N3", "N2", "N1"];
    if (!LEVELS.includes(lv)) return <Navigate to="/kanji/n5" replace />;
    return <KanjiLevel key={lv} level={lv} />;
}

function KanjiLevel({ level }) {
    const [data, setData] = useState(null); // null = đang tải
    const [practicing, setPracticing] = useState(false);
    const [error, setError] = useState("");

    const load = useCallback(async () => {
        try {
            setError("");
            setData(null);
            setData(await fetchKanji({ level, shuffle: true }));
        } catch (err) {
            setError(err.message);
        }
    }, [level]);

    useEffect(() => {
        load();
    }, [load]);

    if (practicing && data) {
        return (
            <PracticeSession
                cards={data}
                batchSize={20}
                tall
                onExit={() => setPracticing(false)}
                renderFront={(card) => <span className="kanji-big">{card.kanji}</span>}
                renderBack={(card) => (
                    <>
                        {/* Phần đầu: kanji nhỏ + Hán Việt + nghĩa */}
                        <span className="kanji-small">{card.kanji}</span>
                        <span className="han-viet">{card.hanViet}</span>
                        <span className="meaning">{card.meaning}</span>

                        {/* Từ vựng đi kèm */}
                        {card.vocabulary && (
                            <div className="back-section">
                                <span className="section-label">Từ vựng</span>
                                <p className="vocab-line">{card.vocabulary}</p>
                            </div>
                        )}

                        {/* Câu ví dụ */}
                        {card.example && (
                            <div className="back-section">
                                <span className="section-label">Ví dụ</span>
                                <p className="ex-jp">{card.example}</p>
                                {card.romaji && <p className="ex-romaji">{card.romaji}</p>}
                                {card.translation && <p className="ex-vi">{card.translation}</p>}
                            </div>
                        )}
                    </>
                )}
            />
        );
    }

    return (
        <div className="page-menu">
            <h1>Kanji {level}</h1>

            {error && (
                <div className="status">
                    <p className="error">{error}</p>
                    <button className="btn btn-primary" onClick={load}>Thử lại</button>
                </div>
            )}

            {!error && data === null && <p className="status">Đang tải...</p>}

            {!error && data && data.length === 0 && (
                <p className="status">Chưa có dữ liệu Kanji {level}, sẽ được cập nhật sau.</p>
            )}

            {!error && data && data.length > 0 && (
                <>
                    <p className="subtitle">
                        {data.length} chữ. Mỗi lượt luyện 20 chữ, chưa thuộc thì luyện lại, thuộc rồi thì học tiếp.
                    </p>
                    <button className="btn btn-primary btn-big" onClick={() => setPracticing(true)}>
                        Bắt đầu luyện tập
                    </button>
                </>
            )}
        </div>
    );
}