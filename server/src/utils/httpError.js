// Lỗi có mã HTTP, errorHandler sẽ trả đúng mã và thông báo này cho client.
class HttpError extends Error {
    constructor(status, message) {
        super(message);
        this.name = "HttpError";
        this.status = status;
    }
}

module.exports = HttpError;