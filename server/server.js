const express = require("express");
const cors = require("cors");

const kanjiN5 = require("./data/kanjiN5");
const vocabUnits = require("./data/vocabulary");

const app = express();
const PORT = process.env.PORT || 5000;

// Gom dữ liệu kanji theo cấp độ. Sau này thêm N4, N3... chỉ cần thêm vào đây.
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

// Gắn id theo vị trí trong mảng gốc (để React dùng làm key), rồi xáo/cắt nếu cần
function prepareList(source, query) {
    let result = source.map((item, i) => ({ id: i + 1, ...item }));

    if (query.shuffle === "true") result = shuffle(result);

    const limit = parseInt(query.limit, 10);
    if (!Number.isNaN(limit) && limit > 0) result = result.slice(0, limit);

    return result;
}

// ---------- Chung ----------

app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
});

// ---------- Kanji ----------

// Danh sách cấp độ kanji đang có
app.get("/api/levels", (req, res) => {
    const levels = Object.keys(KANJI_BY_LEVEL).map((level) => ({
        level,
        total: KANJI_BY_LEVEL[level].length,
    }));
    res.json(levels);
});

// VD: GET /api/kanji?level=N5&shuffle=true&limit=20
app.get("/api/kanji", (req, res) => {
    const level = (req.query.level || "N5").toUpperCase();
    const data = KANJI_BY_LEVEL[level];

    if (!data) {
        return res.status(404).json({ error: `Chưa có dữ liệu cho cấp độ ${level}` });
    }

    res.json(prepareList(data, req.query));
});

// ---------- Từ vựng theo Unit ----------

// Danh sách Unit (không kèm danh sách từ)
app.get("/api/vocab/units", (req, res) => {
    const list = vocabUnits.map((u) => ({
        id: u.id,
        title: u.title,
        description: u.description,
        total: u.words.length,
    }));
    res.json(list);
});

// VD: GET /api/vocab/units/unit3?shuffle=true
app.get("/api/vocab/units/:unitId", (req, res) => {
    const unit = vocabUnits.find((u) => u.id === req.params.unitId);

    if (!unit) {
        return res.status(404).json({ error: `Không tìm thấy ${req.params.unitId}` });
    }

    res.json({
        id: unit.id,
        title: unit.title,
        description: unit.description,
        words: prepareList(unit.words, req.query),
    });
});

app.use((req, res) => {
    res.status(404).json({ error: "Không tìm thấy đường dẫn" });
});

app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
});