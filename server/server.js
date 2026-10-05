const express = require("express");
const cors = require("cors");

const kanjiN5 = require("./data/kanjiN5.js");

const app = express();
const PORT = process.env.PORT || 5000;

// Gom dữ liệu theo cấp độ. Sau này thêm N4, N3... chỉ cần thêm vào đây.
const KANJI_BY_LEVEL = {
    N5: kanjiN5,
};

app.use(cors());
app.use(express.json());

// Xáo trộn mảng (Fisher-Yates), không làm thay đổi mảng gốc
function shuffle(array) {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}

// Kiểm tra server còn sống
app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
});

// Danh sách cấp độ đang có
app.get("/api/levels", (req, res) => {
    const levels = Object.keys(KANJI_BY_LEVEL).map((level) => ({
        level,
        total: KANJI_BY_LEVEL[level].length,
    }));
    res.json(levels);
});

// Lấy kanji theo cấp độ
// VD: GET /api/kanji?level=N5&shuffle=true&limit=20
app.get("/api/kanji", (req, res) => {
    const level = (req.query.level || "N5").toUpperCase();
    const data = KANJI_BY_LEVEL[level];

    if (!data) {
        return res.status(404).json({ error: `Chưa có dữ liệu cho cấp độ ${level}` });
    }

    let result = req.query.shuffle === "true" ? shuffle(data) : [...data];

    const limit = parseInt(req.query.limit, 10);
    if (!Number.isNaN(limit) && limit > 0) {
        result = result.slice(0, limit);
    }

    // Thêm id theo vị trí trong mảng gốc để React dùng làm key
    const withId = result.map((item) => ({
        id: data.indexOf(item) + 1,
        ...item,
    }));

    res.json(withId);
});

app.get("/", (req, res) => {
    res.json({
        message: "Kanji Flashcard API is running!"
    });
});

app.use((req, res) => {
    res.status(404).json({ error: "Không tìm thấy đường dẫn" });
});

app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
});