import { useCallback, useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { renderKanjiBack, renderKanjiFront } from "../components/cardViews";
import PracticeSession from "../components/PracticeSession";
import { LEVELS } from "../constants";
import { useAuth } from "../context/AuthContext";
import { useAnswerSaver } from "../hooks/useAnswerSaver";
import { fetchKanji } from "../services/api";

// Lấy cấp độ từ URL (/kanji/n5) rồi giao cho KanjiLevel.
// Dùng key={level} để đổi cấp độ là reset sạch trạng thái.
export default function KanjiPage() {
    const { level } = useParams();
    const lv = (level || "").toUpperCase();

    if (!LEVELS.includes(lv)) return <Navigate to="/kanji/n5" replace />;
    return <KanjiLevel key={lv} level={lv} />;
}

function KanjiLevel({ level }) {
    const { user } = useAuth();
    const saveAnswer = useAnswerSaver("kanji");

    const [data, setData] = useState(null); // null = đang tải
    const [practicing, setPracticing] = useState(false);
    const [error, setError] = useState("");

    const load = useCallback(async () => {
        try {
            setError("");
            setData(null);
            setData(await fetchKanji({ level, shuffle: true }));
        } catch (err) {
            setError(err.message);
        }
    }, [level]);

    useEffect(() => {
        load();
    }, [load]);

    if (practicing && data) {
        return (
            <PracticeSession
                cards={data}
                batchSize={20}
                tall
                onExit={() => setPracticing(false)}
                onAnswer={saveAnswer}
                renderFront={renderKanjiFront}
                renderBack={renderKanjiBack}
            />
        );
    }

    return (
        <div className="page-menu">
            <h1>Kanji {level}</h1>

            {error && (
                <div className="status">
                    <p className="error">{error}</p>
                    <button className="btn btn-primary" onClick={load}>Thử lại</button>
                </div>
            )}

            {!error && data === null && <p className="status">Đang tải...</p>}

            {!error && data && data.length === 0 && (
                <p className="status">Chưa có dữ liệu Kanji {level}, sẽ được cập nhật sau.</p>
            )}

            {!error && data && data.length > 0 && (
                <>
                    <p className="subtitle">
                        {data.length} chữ. Mỗi lượt luyện 20 chữ, chưa thuộc thì luyện lại, thuộc rồi thì học tiếp.
                    </p>
                    <button className="btn btn-primary btn-big" onClick={() => setPracticing(true)}>
                        Bắt đầu luyện tập
                    </button>
                    {!user && (
                        <p className="login-hint">
                            <Link to="/login">Đăng nhập</Link> để lưu lại những chữ bạn chưa nhớ và ôn lại sau.
                        </p>
                    )}
                </>
            )}
        </div>
    );
}