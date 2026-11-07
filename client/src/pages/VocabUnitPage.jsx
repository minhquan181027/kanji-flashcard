import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { renderVocabBack, renderVocabFront } from "../components/cardViews";
import PracticeSession from "../components/PracticeSession";
import { useAuth } from "../context/AuthContext";
import { useAnswerSaver } from "../hooks/useAnswerSaver";
import { fetchVocabUnit } from "../services/api";

// Trang /vocabulary/:unitCode. Dùng key để đổi Unit là reset sạch trạng thái.
export default function VocabUnitPage() {
    const { unitCode } = useParams();
    return <VocabUnit key={unitCode} unitCode={unitCode} />;
}

function VocabUnit({ unitCode }) {
    const { user } = useAuth();
    const saveAnswer = useAnswerSaver("vocab");

    const [unit, setUnit] = useState(null); // null = đang tải
    const [practicing, setPracticing] = useState(false);
    const [error, setError] = useState("");

    const load = useCallback(async () => {
        try {
            setError("");
            setUnit(null);
            setUnit(await fetchVocabUnit(unitCode));
        } catch (err) {
            setError(err.message);
        }
    }, [unitCode]);

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
                onAnswer={saveAnswer}
                renderFront={renderVocabFront}
                renderBack={renderVocabBack}
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
                    {!user && (
                        <p className="login-hint">
                            <Link to="/login">Đăng nhập</Link> để lưu lại những từ bạn chưa nhớ và ôn lại sau.
                        </p>
                    )}
                </>
            )}
        </div>
    );
}