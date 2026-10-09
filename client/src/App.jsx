import { Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import KanjiPage from "./pages/KanjiPage";
import VocabPage from "./pages/VocabPage";

export default function App() {
    return (
        <div className="app">
            <Navbar />
            <main className="main">
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/kanji" element={<KanjiPage />} />
                    <Route path="/vocabulary" element={<VocabPage />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </main>
        </div>
    );
}