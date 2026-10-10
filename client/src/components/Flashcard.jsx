// Thẻ lật dùng chung: nhận nội dung mặt trước (front) và mặt sau (back)
export default function Flashcard({ front, back, flipped, onFlip, tall = false }) {
    return (
        <div
            className={`flashcard ${tall ? "flashcard--tall" : ""} ${flipped ? "is-flipped" : ""}`}
            onClick={onFlip}
            role="button"
            tabIndex={0}
            aria-label="Lật thẻ"
        >
            <div className="flashcard-inner">
                <div className="flashcard-face flashcard-front">
                    {front}
                    <span className="hint">Bấm để xem nghĩa</span>
                </div>

                <div className="flashcard-face flashcard-back">{back}</div>
            </div>
        </div>
    );
}