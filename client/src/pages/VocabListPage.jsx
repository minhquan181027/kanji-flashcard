import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchVocabUnits } from "../services/api";

// Trang /vocabulary: danh sách tất cả các Unit
export default function VocabListPage() {
    const [units, setUnits] = useState(null); // null = đang tải
    const [error, setError] = useState("");

    const load = useCallback(async () => {
        try {
            setError("");
            setUnits(null);
            setUnits(await fetchVocabUnits());
        } catch (err) {
            setError(err.message);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    return (
        <div className="page-menu">
            <h1>Từ vựng</h1>
            <p className="subtitle">Chọn một Unit để luyện</p>

            {error && (
                <div className="status">
                    <p className="error">{error}</p>
                    <button className="btn btn-primary" onClick={load}>Thử lại</button>
                </div>
            )}

            {!error && units === null && <p className="status">Đang tải...</p>}

            {!error && units && units.length === 0 && (
                <p className="status">Chưa có Unit từ vựng nào.</p>
            )}

            {!error && units && units.length > 0 && (
                <div className="unit-list">
                    {units.map((u) => (
                        <Link key={u.id} to={`/vocabulary/${u.id}`} className="menu-card unit-card">
                            <h3>{u.title}</h3>
                            <p>{u.description}</p>
                            <span className="unit-count">{u.total} từ</span>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}