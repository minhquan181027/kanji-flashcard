const HttpError = require("../utils/httpError");

// Mọi lỗi cuối cùng đều đi qua đây. Lỗi không lường trước chỉ trả thông báo chung, chi tiết ghi vào log.
// eslint-disable-next-line no-unused-vars
module.exports = (err, req, res, next) => {
    if (res.headersSent) return next(err);

    if (err.type === "entity.parse.failed") {
        return res.status(400).json({ error: "Dữ liệu gửi lên không phải JSON hợp lệ" });
    }
    if (err.type === "entity.too.large") {
        return res.status(413).json({ error: "Dữ liệu gửi lên quá lớn" });
    }

    if (err instanceof HttpError) {
        if (err.status >= 500) console.error(`[${err.status}] ${err.message}`, err.details || "");
        return res.status(err.status).json({ error: err.message });
    }

    console.error(err);
    res.status(500).json({ error: "Lỗi máy chủ, vui lòng thử lại sau" });
};