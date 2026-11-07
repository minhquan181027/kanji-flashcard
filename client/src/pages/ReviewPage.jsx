import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    renderKanjiBack,
    renderKanjiFront,
    renderVocabBack,
    renderVocabFront,
} from "../components/cardViews";
import PracticeSession from "../components/PracticeSession";
import { useAnswerSaver } from "../hooks/useAnswerSaver";
import { fetchReviewCards } from "../services/api";

// Mỗi loại ôn tập khác nhau ở tên gọi, kích thước nhóm và cách vẽ thẻ
const CONFIG = {
    kanji: {
        title: "Kanji hay quên",
        unit: "chữ",
        batchSize: 20,
        front: renderKanjiFront,
        back: renderKanjiBack,
        learnPath: "/kanji/n5",
    },
    vocab: {
        title: "Từ vựng hay quên",
        unit: "từ",
        batchSize: 10,
        front: renderVocabFront,
        back: renderVocabBack,
        learnPath: "/vocabulary",
    },
};

// Dùng chung cho /review/kanji và /review/vocab. key={type} để chuyển loại là reset sạch.
export default function ReviewPage({ type }) {
    return <ReviewSession key={type} type={type} />;
}

function ReviewSession({ type }) {
    const config = CONFIG[type];
    const saveAnswer = useAnswerSaver(type);

    const [cards, setCards] = useState(null); // null = đang tải
    const [practicing, setPracticing] = useState(false);
    const [error, setError] = useState("");

    const load = useCallback(async () => {
        try {
            setError("");
            setCards(null);
            setCards(await fetchReviewCards(type)); // quên nhiều nhất xếp trước
        } catch (err) {
            setError(err.message);
        }
    }, [type]);

    useEffect(() => {
        load();
    }, [load]);

    // Thoát phiên luyện thì tải lại danh sách vì có từ đã được coi là thuộc
    const exit = () => {
        setPracticing(false);
        load();
    };

    if (practicing && cards && cards.length > 0) {
        return (
            <PracticeSession
                cards={cards}
                batchSize={config.batchSize}
                tall
                shuffleCards={false}
                onExit={exit}
                onAnswer={saveAnswer}
                renderFront={config.front}
                renderBack={config.back}
            />
        );
    }

    return (
        <div className="page-menu">
            <h1>{config.title}</h1>

            {error && (
                <div className="status">
                    <p className="error">{error}</p>
                    <button className="btn btn-primary" onClick={load}>Thử lại</button>
                </div>
            )}

            {!error && cards === null && <p className="status">Đang tải...</p>}

            {!error && cards && cards.length === 0 && (
                <div className="status">
                    <p>
                        Hiện chưa có {config.unit} nào hay quên 🎉 Khi bạn bấm <strong>Chưa nhớ</strong> lúc
                        luyện, {config.unit} đó sẽ xuất hiện ở đây.
                    </p>
                    <Link to={config.learnPath} className="btn btn-primary">Đi luyện tập</Link>
                </div>
            )}

            {!error && cards && cards.length > 0 && (
                <>
                    <p className="subtitle">
                        Có <strong>{cards.length}</strong> {config.unit} cần ôn lại, {config.unit} quên nhiều
                        nhất xếp trước. Trả lời đúng 3 lần liên tiếp thì {config.unit} đó được coi là đã thuộc
                        và rời khỏi danh sách.
                    </p>
                    <button className="btn btn-primary btn-big" onClick={() => setPracticing(true)}>
                        Bắt đầu ôn tập
                    </button>
                </>
            )}
        </div>
    );
}