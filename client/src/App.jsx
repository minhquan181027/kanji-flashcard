import { Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import KanjiPage from "./pages/KanjiPage";
import VocabListPage from "./pages/VocabListPage";
import VocabUnitPage from "./pages/VocabUnitPage";

export default function App() {
    return (
        <div className="app">
            <Navbar />
            <main className="main">
                <Routes>
                    <Route path="/" element={<HomePage />} />

                    {/* Kanji theo cấp độ: /kanji → N5 */}
                    <Route path="/kanji" element={<Navigate to="/kanji/n5" replace />} />
                    <Route path="/kanji/:level" element={<KanjiPage />} />

                    {/* Từ vựng theo Unit: /vocabulary là danh sách, /vocabulary/unit3 là một Unit */}
                    <Route path="/vocabulary" element={<VocabListPage />} />
                    <Route path="/vocabulary/:unitId" element={<VocabUnitPage />} />

                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </main>
        </div>
    );
}