import { useCallback, useEffect, useState } from "react";
import Flashcard from "./Flashcard";

// Xáo trộn mảng, không làm đổi mảng gốc
function shuffle(array) {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}

/**
 * Phiên luyện flashcard dùng chung cho Kanji và Từ vựng.
 *
 * Props:
 *  - cards:       mảng thẻ, mỗi thẻ có `id`
 *  - batchSize:   số thẻ mỗi nhóm
 *  - renderFront: (card) => nội dung mặt trước
 *  - renderBack:  (card) => nội dung mặt sau
 *  - onExit:      gọi khi bấm Thoát / Về menu
 *  - tall:        thẻ cao hơn (cho từ vựng có câu ví dụ)
 */
export default function PracticeSession({
    cards: sourceCards,
    batchSize = 20,
    renderFront,
    renderBack,
    onExit,
    tall = false,
}) {
    const [initial] = useState(() => shuffle(sourceCards));

    const [allCards, setAllCards] = useState(initial);               // toàn bộ thẻ đã xáo
    const [offset, setOffset] = useState(0);                          // số thẻ đã thuộc ở các nhóm trước
    const [round, setRound] = useState(1);                            // vòng luyện trong nhóm
    const [cards, setCards] = useState(() => initial.slice(0, batchSize)); // thẻ của vòng hiện tại
    const [index, setIndex] = useState(0);
    const [flipped, setFlipped] = useState(false);
    const [knownCount, setKnownCount] = useState(0);
    const [unknown, setUnknown] = useState([]);

    const startRound = useCallback((list, roundNo) => {
        setCards(list);
        setRound(roundNo);
        setIndex(0);
        setFlipped(false);
        setKnownCount(0);
        setUnknown([]);
    }, []);

    const startBatch = useCallback(
        (all, newOffset) => {
            setOffset(newOffset);
            startRound(all.slice(newOffset, newOffset + batchSize), 1);
        },
        [startRound, batchSize]
    );

    const restart = () => {
        const reshuffled = shuffle(sourceCards);
        setAllCards(reshuffled);
        startBatch(reshuffled, 0);
    };

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

    const total = allCards.length;
    const batchNo = Math.floor(offset / batchSize) + 1;
    const totalBatches = Math.ceil(total / batchSize);

    // ---------- Màn hình kết quả cuối vòng ----------
    if (finished) {
        const allKnown = unknown.length === 0;
        const batchEnd = offset + batchSize;
        const hasMore = batchEnd < total;
        const learned = Math.min(batchEnd, total);
        const nextCount = Math.min(batchSize, total - batchEnd);

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
                    <p className="batch-info">Đã thuộc {learned} / {total}</p>
                )}

                {!allKnown && (
                    <>
                        <p className="batch-info">Luyện lại các thẻ này cho đến khi thuộc hết:</p>
                        <div className="unknown-list">
                            {unknown.map((c) => (
                                <span key={c.id} className="chip">
                                    {c.kanji ?? c.word}
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
                            Luyện lại {unknown.length} thẻ chưa thuộc
                        </button>
                    )}

                    {allKnown && hasMore && (
                        <button className="btn btn-primary" onClick={() => startBatch(allCards, batchEnd)}>
                            Tiếp tục ({nextCount} thẻ tiếp theo)
                        </button>
                    )}

                    {allKnown && !hasMore && (
                        <button className="btn btn-primary" onClick={restart}>
                            Học lại từ đầu
                        </button>
                    )}

                    <button className="btn" onClick={onExit}>Về menu</button>
                </div>
            </div>
        );
    }

    // ---------- Màn hình luyện tập ----------
    const percent = Math.round((index / cards.length) * 100);

    return (
        <div className={`practice ${tall ? "practice--wide" : ""}`}>
            <div className="top-bar">
                <button className="btn btn-small" onClick={onExit}>← Thoát</button>
                <span className="counter">{index + 1} / {cards.length}</span>
            </div>

            <p className="batch-info">
                Nhóm {batchNo}/{totalBatches} · Vòng {round} · Đã thuộc {offset}/{total}
            </p>

            <div className="progress">
                <div className="progress-fill" style={{ width: `${percent}%` }} />
            </div>

            {/* key để mỗi thẻ mới được tạo lại, tránh thấy nghĩa thẻ mới khi đang lật về */}
            <Flashcard
                key={`${round}-${current.id}`}
                front={renderFront(current)}
                back={renderBack(current)}
                flipped={flipped}
                onFlip={flip}
                tall={tall}
            />

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