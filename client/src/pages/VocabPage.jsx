import { useEffect, useState } from "react";
import PracticeSession from "../components/PracticeSession";
import { fetchVocabUnit, fetchVocabUnits } from "../services/api";

// Từ càng dài thì chữ càng nhỏ để vừa thẻ
function wordSize(word) {
    if (word.length <= 2) return "6rem";
    if (word.length <= 4) return "4.5rem";
    return "2.8rem";
}

export default function VocabPage() {
    const [units, setUnits] = useState([]);
    const [session, setSession] = useState(null); // { title, words } khi đang luyện
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadUnits = async () => {
        try {
            setLoading(true);
            setError("");
            setUnits(await fetchVocabUnits());
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUnits();
    }, []);

    const startUnit = async (unitId) => {
        try {
            setError("");
            const unit = await fetchVocabUnit(unitId);
            setSession(unit);
        } catch (err) {
            setError(err.message);
        }
    };

    if (session) {
        return (
            <PracticeSession
                cards={session.words}
                batchSize={10}
                tall
                onExit={() => setSession(null)}
                renderFront={(w) => (
                    <>
                        {/* Không hiện hiragana nếu từ đã viết bằng hiragana (うち, いくら) */}
                        {w.hiragana !== w.word && (
                            <span className="front-reading">{w.hiragana}</span>
                        )}
                        <span className="word-big" style={{ fontSize: wordSize(w.word) }}>
                            {w.word}
                        </span>
                    </>
                )}
                renderBack={(w) => (
                    <>
                        {w.emoji && <span className="emoji">{w.emoji}</span>}
                        {/* Không hiện lại nếu từ đã viết bằng hiragana (うち, いくら) */}
                        {w.word !== w.hiragana && <span className="back-word">{w.word}</span>}
                        <span className="reading">{w.hiragana}</span>
                        <span className="romaji">{w.romaji}</span>
                        <span className="meaning">{w.meaning}</span>
                        <div className="example">
                            <p className="ex-jp">{w.example.jp}</p>
                            <p className="ex-romaji">{w.example.romaji}</p>
                            <p className="ex-vi">{w.example.vi}</p>
                        </div>
                    </>
                )}
            />
        );
    }

    return (
        <div className="page-menu">
            <h1>Từ vựng</h1>
            <p className="subtitle">Chọn một Unit để luyện</p>

            {loading && <p className="status">Đang tải...</p>}

            {error && (
                <div className="status">
                    <p className="error">{error}</p>
                    <button className="btn btn-primary" onClick={loadUnits}>Thử lại</button>
                </div>
            )}

            <div className="unit-list">
                {units.map((u) => (
                    <button key={u.id} className="menu-card unit-card" onClick={() => startUnit(u.id)}>
                        <h3>{u.title}</h3>
                        <p>{u.description}</p>
                        <span className="unit-count">{u.total} từ</span>
                    </button>
                ))}
            </div>
        </div>
    );
}