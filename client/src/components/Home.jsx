export default function Home({ onStart }) {
    return (
        <div className="home">
            <div className="home-kanji">漢字</div>
            <h1>Luyện Kanji</h1>
            <p className="subtitle">Flashcard Kanji N5 với âm Hán Việt</p>
            <button className="btn btn-primary btn-big" onClick={onStart}>
                Luyện tập
            </button>
        </div>
    );
}