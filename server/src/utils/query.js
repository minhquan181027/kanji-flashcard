// Đọc ?shuffle=true&limit=20 từ query string
function parseListQuery(query) {
    const limit = Number.parseInt(query.limit, 10);
    return {
        shuffle: query.shuffle === "true",
        limit: Number.isNaN(limit) || limit <= 0 ? null : limit,
    };
}

module.exports = { parseListQuery };