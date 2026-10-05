import { useState } from "react";
import Home from "./components/Home";
import Practice from "./components/Practice";

export default function App() {
    const [page, setPage] = useState("home"); // "home" | "practice"

    return (
        <div className="app">
            {page === "home" && <Home onStart={() => setPage("practice")} />}
            {page === "practice" && <Practice onBack={() => setPage("home")} />}
        </div>
    );
}