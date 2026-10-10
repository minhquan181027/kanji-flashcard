import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import PracticeSession from "../components/PracticeSession";
import { fetchVocabUnit } from "../services/api";

// Từ càng dài thì chữ càng nhỏ để vừa thẻ
function wordSize(word) {
    if (word.length <= 2) return "6rem";
    if (word.length <= 4) return "4.5rem";
    return "2.8rem";
}

// Trang /vocabulary/:unitId. Dùng key để đổi Unit là reset sạch trạng thái.
export default function VocabUnitPage() {
    const { unitId } = useParams();
    return <VocabUnit key={unitId} unitId={unitId} />;
}

function VocabUnit({ unitId }) {
    const [unit, setUnit] = useState(null); // null = đang tải
    const [practicing, setPracticing] = useState(false);
    const [error, setError] = useState("");

    const load = useCallback(async () => {
        try {
            setError("");
            setUnit(null);
            setUnit(await fetchVocabUnit(unitId));
        } catch (err) {
            setError(err.message);
        }
    }, [unitId]);

    useEffect(() => {
        load();
    }, [load]);

    if (practicing && unit) {
        return (
            <PracticeSession
                cards={unit.words}
                batchSize={10}
                tall
                onExit={() => setPracticing(false)}
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
            {error && (
                <div className="status">
                    <h1>Từ vựng</h1>
                    <p className="error">{error}</p>
                    <button className="btn btn-primary" onClick={load}>Thử lại</button>
                    <Link to="/vocabulary" className="btn">Xem danh sách Unit</Link>
                </div>
            )}

            {!error && unit === null && <p className="status">Đang tải...</p>}

            {!error && unit && (
                <>
                    <h1>Từ vựng {unit.title}</h1>
                    <p className="subtitle">
                        {unit.description} · {unit.words.length} từ. Mỗi lượt luyện 10 từ, chưa thuộc thì
                        luyện lại, thuộc rồi thì học tiếp.
                    </p>
                    <button className="btn btn-primary btn-big" onClick={() => setPracticing(true)}>
                        Bắt đầu luyện tập
                    </button>
                </>
            )}
        </div>
    );
}