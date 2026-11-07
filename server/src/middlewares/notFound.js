module.exports = (req, res) => {
    res.status(404).json({ error: "Không tìm thấy đường dẫn" });
};