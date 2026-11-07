// Nội dung mặt trước / mặt sau của thẻ Kanji và Từ vựng.
// Dùng chung cho trang học thường và trang ôn tập để hai nơi luôn giống nhau.

// ---------- Kanji ----------
export const renderKanjiFront = (card) => <span className="kanji-big">{card.kanji}</span>;

export const renderKanjiBack = (card) => (
    <>
        <span className="kanji-small">{card.kanji}</span>
        <span className="han-viet">{card.hanViet}</span>
        <span className="meaning">{card.meaning}</span>

        {card.examples.map((ex, index) => (
            <div className="back-section" key={index}>
                {ex.vocabulary && (
                    <>
                        <span className="section-label">Từ vựng</span>
                        <p className="vocab-line">{ex.vocabulary}</p>
                    </>
                )}
                {ex.example && (
                    <>
                        <span className="section-label">Ví dụ</span>
                        <p className="ex-jp">{ex.example}</p>
                        {ex.romaji && <p className="ex-romaji">{ex.romaji}</p>}
                        {ex.translation && <p className="ex-vi">{ex.translation}</p>}
                    </>
                )}
            </div>
        ))}
    </>
);

// ---------- Từ vựng ----------
// Từ càng dài thì chữ càng nhỏ để vừa thẻ
function wordSize(word) {
    if (word.length <= 2) return "6rem";
    if (word.length <= 4) return "4.5rem";
    return "2.8rem";
}

export const renderVocabFront = (w) => (
    <>
        {/* Không hiện hiragana nếu từ đã viết bằng hiragana (うち, いくら) */}
        {w.hiragana !== w.word && <span className="front-reading">{w.hiragana}</span>}
        <span className="word-big" style={{ fontSize: wordSize(w.word) }}>
            {w.word}
        </span>
    </>
);

export const renderVocabBack = (w) => (
    <>
        {w.emoji && <span className="emoji">{w.emoji}</span>}
        {/* Không hiện lại nếu từ đã viết bằng hiragana (うち, いくら) */}
        {w.word !== w.hiragana && <span className="back-word">{w.word}</span>}
        <span className="reading">{w.hiragana}</span>
        <span className="romaji">{w.romaji}</span>
        <span className="meaning">{w.meaning}</span>

        {w.examples.map((ex, index) => (
            <div className="example" key={index}>
                <p className="ex-jp">{ex.example}</p>
                {ex.romaji && <p className="ex-romaji">{ex.romaji}</p>}
                {ex.translation && <p className="ex-vi">{ex.translation}</p>}
            </div>
        ))}
    </>
);