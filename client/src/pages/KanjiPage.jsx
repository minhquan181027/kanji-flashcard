import { useState } from "react";
import PracticeSession from "../components/PracticeSession";
import { fetchKanji } from "../services/api";

export default function KanjiPage() {
    const [cards, setCards] = useState(null); // null = đang ở màn hình menu
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const start = async () => {
        try {
            setLoading(true);
            setError("");
            const data = await fetchKanji({ level: "N5", shuffle: true });
            setCards(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (cards) {
        return (
            <PracticeSession
                cards={cards}
                batchSize={20}
                onExit={() => setCards(null)}
                renderFront={(card) => <span className="kanji-big">{card.kanji}</span>}
                renderBack={(card) => (
                    <>
                        <span className="kanji-small">{card.kanji}</span>
                        <span className="han-viet">{card.hanViet}</span>
                        <span className="meaning">{card.meaning}</span>
                    </>
                )}
            />
        );
    }

    return (
        <div className="page-menu">
            <h1>Kanji N5</h1>
            <p className="subtitle">Mỗi lượt luyện 20 chữ. Chưa thuộc thì luyện lại, thuộc rồi thì học tiếp.</p>

            {error && <p className="error">{error}</p>}

            <button className="btn btn-primary btn-big" onClick={start} disabled={loading}>
                {loading ? "Đang tải..." : "Bắt đầu luyện tập"}
            </button>
        </div>
    );
}