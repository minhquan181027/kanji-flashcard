import { Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import HomePage from "./pages/HomePage";
import KanjiPage from "./pages/KanjiPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ReviewPage from "./pages/ReviewPage";
import VocabListPage from "./pages/VocabListPage";
import VocabUnitPage from "./pages/VocabUnitPage";

export default function App() {
    return (
        <div className="app">
            <Navbar />
            <main className="main">
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />

                    {/* Kanji theo cấp độ: /kanji tự chuyển sang N5 */}
                    <Route path="/kanji" element={<Navigate to="/kanji/n5" replace />} />
                    <Route path="/kanji/:level" element={<KanjiPage />} />

                    {/* Từ vựng theo Unit: /vocabulary là danh sách, /vocabulary/unit3 là một Unit */}
                    <Route path="/vocabulary" element={<VocabListPage />} />
                    <Route path="/vocabulary/:unitCode" element={<VocabUnitPage />} />

                    {/* Ôn tập những từ hay quên (cần đăng nhập) */}
                    <Route path="/review" element={<Navigate to="/review/kanji" replace />} />
                    <Route
                        path="/review/kanji"
                        element={<ProtectedRoute><ReviewPage type="kanji" /></ProtectedRoute>}
                    />
                    <Route
                        path="/review/vocab"
                        element={<ProtectedRoute><ReviewPage type="vocab" /></ProtectedRoute>}
                    />

                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </main>
        </div>
    );
}