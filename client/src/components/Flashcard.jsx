// Thẻ lật: mặt trước là kanji, mặt sau là Hán Việt + nghĩa
export default function Flashcard({ card, flipped, onFlip }) {
    return (
        <div
            className={`flashcard ${flipped ? "is-flipped" : ""}`}
            onClick={onFlip}
            role="button"
            tabIndex={0}
            aria-label="Lật thẻ"
        >
            <div className="flashcard-inner">
                <div className="flashcard-face flashcard-front">
                    <span className="kanji-big">{card.kanji}</span>
                    <span className="hint">Bấm để xem nghĩa</span>
                </div>

                <div className="flashcard-face flashcard-back">
                    <span className="kanji-small">{card.kanji}</span>
                    <span className="han-viet">{card.hanViet}</span>
                    <span className="meaning">{card.meaning}</span>
                </div>
            </div>
        </div>
    );
}