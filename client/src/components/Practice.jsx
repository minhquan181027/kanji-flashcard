import { useCallback, useEffect, useState } from "react";
import { fetchKanji } from "../services/api";
import Flashcard from "./Flashcard";

const BATCH_SIZE = 20; // mỗi nhóm luyện 20 từ

// Xáo trộn mảng, không làm đổi mảng gốc
function shuffle(array) {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}

export default function Practice({ onBack }) {
    const [allCards, setAllCards] = useState([]); // toàn bộ kanji đã xáo trộn
    const [offset, setOffset] = useState(0);      // số từ đã thuộc ở các nhóm trước
    const [round, setRound] = useState(1);        // vòng luyện trong nhóm hiện tại
    const [cards, setCards] = useState([]);       // các thẻ của vòng hiện tại
    const [index, setIndex] = useState(0);
    const [flipped, setFlipped] = useState(false);
    const [knownCount, setKnownCount] = useState(0);
    const [unknown, setUnknown] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Bắt đầu một vòng luyện với danh sách thẻ cho trước
    const startRound = useCallback((list, roundNo) => {
        setCards(list);
        setRound(roundNo);
        setIndex(0);
        setFlipped(false);
        setKnownCount(0);
        setUnknown([]);
    }, []);

    // Bắt đầu một nhóm 20 từ mới, tính từ vị trí newOffset
    const startBatch = useCallback(
        (all, newOffset) => {
            setOffset(newOffset);
            startRound(all.slice(newOffset, newOffset + BATCH_SIZE), 1);
        },
        [startRound]
    );

    // Tải toàn bộ kanji N5 từ server rồi bắt đầu nhóm đầu tiên
    const loadAll = useCallback(async () => {
        try {
            setLoading(true);
            setError("");
            const data = await fetchKanji({ level: "N5", shuffle: true });
            setAllCards(data);
            startBatch(data, 0);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [startBatch]);

    useEffect(() => {
        loadAll();
    }, [loadAll]);

    const finished = cards.length > 0 && index >= cards.length;
    const current = cards[index];

    const flip = useCallback(() => setFlipped((f) => !f), []);

    // Nhấn phím Space để lật thẻ
    useEffect(() => {
        if (!current || finished) return;
        const onKey = (e) => {
            if (e.code === "Space") {
                e.preventDefault();
                flip();
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [current, finished, flip]);

    const mark = (isKnown) => {
        if (isKnown) setKnownCount((k) => k + 1);
        else setUnknown((u) => [...u, current]);
        setFlipped(false);
        setIndex((i) => i + 1);
    };

    if (loading) return <p className="status">Đang tải...</p>;

    if (error) {
        return (
            <div className="status">
                <p className="error">{error}</p>
                <p>Kiểm tra server đã chạy ở cổng 5000 chưa.</p>
                <button className="btn btn-primary" onClick={loadAll}>Thử lại</button>
                <button className="btn" onClick={onBack}>Về trang chủ</button>
            </div>
        );
    }

    const total = allCards.length;
    const batchNo = Math.floor(offset / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(total / BATCH_SIZE);

    // ---------- Màn hình kết quả cuối vòng ----------
    if (finished) {
        const allKnown = unknown.length === 0;
        const batchEnd = offset + BATCH_SIZE;
        const hasMore = batchEnd < total;
        const learned = Math.min(batchEnd, total); // số từ đã thuộc sau nhóm này
        const nextCount = Math.min(BATCH_SIZE, total - batchEnd);

        return (
            <div className="result">
                <h2>
                    {allKnown
                        ? hasMore ? "Thuộc cả nhóm rồi!" : "Hoàn thành tất cả!"
                        : "Hết vòng luyện"}
                </h2>

                <p className="result-line">
                    Đã nhớ: <strong className="ok">{knownCount}</strong> &nbsp;|&nbsp;
                    Chưa nhớ: <strong className="bad">{unknown.length}</strong>
                </p>

                {allKnown && (
                    <p className="batch-info">
                        Đã thuộc {learned} / {total} từ
                    </p>
                )}

                {!allKnown && (
                    <>
                        <p className="batch-info">Luyện lại các từ này cho đến khi thuộc hết:</p>
                        <div className="unknown-list">
                            {unknown.map((c) => (
                                <span key={c.id} className="chip" title={`${c.hanViet} - ${c.meaning}`}>
                                    {c.kanji}
                                </span>
                            ))}
                        </div>
                    </>
                )}

                <div className="actions">
                    {!allKnown && (
                        <button
                            className="btn btn-primary"
                            onClick={() => startRound(shuffle(unknown), round + 1)}
                        >
                            Luyện lại {unknown.length} từ chưa thuộc
                        </button>
                    )}

                    {allKnown && hasMore && (
                        <button
                            className="btn btn-primary"
                            onClick={() => startBatch(allCards, batchEnd)}
                        >
                            Tiếp tục ({nextCount} từ tiếp theo)
                        </button>
                    )}

                    {allKnown && !hasMore && (
                        <button className="btn btn-primary" onClick={loadAll}>
                            Học lại từ đầu
                        </button>
                    )}

                    <button className="btn" onClick={onBack}>Trang chủ</button>
                </div>
            </div>
        );
    }

    // ---------- Màn hình luyện tập ----------
    const percent = Math.round((index / cards.length) * 100);

    return (
        <div className="practice">
            <div className="top-bar">
                <button className="btn btn-small" onClick={onBack}>← Thoát</button>
                <span className="counter">{index + 1} / {cards.length}</span>
            </div>

            <p className="batch-info">
                Nhóm {batchNo}/{totalBatches} · Vòng {round} · Đã thuộc {offset}/{total} từ
            </p>

            <div className="progress">
                <div className="progress-fill" style={{ width: `${percent}%` }} />
            </div>

            {/* key để mỗi thẻ mới được tạo lại, tránh thấy nghĩa thẻ mới khi đang lật về */}
            <Flashcard key={`${round}-${current.id}`} card={current} flipped={flipped} onFlip={flip} />

            <div className="actions">
                {flipped ? (
                    <>
                        <button className="btn btn-bad" onClick={() => mark(false)}>Chưa nhớ</button>
                        <button className="btn btn-ok" onClick={() => mark(true)}>Đã nhớ</button>
                    </>
                ) : (
                    <button className="btn btn-primary" onClick={flip}>Xem nghĩa</button>
                )}
            </div>
        </div>
    );
}