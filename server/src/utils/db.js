const HttpError = require("./httpError");
const chunk = require("./chunk");

const PAGE_SIZE = 1000; // Supabase mặc định chỉ trả tối đa 1000 dòng mỗi lần
const ID_CHUNK_SIZE = 200; // chia nhỏ danh sách id trong .in() để URL không quá dài

// Biến lỗi của Supabase thành HttpError(500), giữ lại mã lỗi Postgres để nơi gọi xử lý riêng
function dbError(error, message) {
    const err = new HttpError(500, message);
    err.code = error.code;
    err.details = error.message;
    return err;
}

function unwrap({ data, error }, message = "Lỗi truy vấn cơ sở dữ liệu") {
    if (error) throw dbError(error, message);
    return data;
}

async function countOf(query, message = "Lỗi truy vấn cơ sở dữ liệu") {
    const { count, error } = await query;
    if (error) throw dbError(error, message);
    return count ?? 0;
}

// Lấy toàn bộ dòng, tự chia trang. buildQuery phải tạo query MỚI mỗi lần gọi và có .order()
async function fetchAll(buildQuery, message) {
    const rows = [];
    for (let from = 0; ; from += PAGE_SIZE) {
        const page = unwrap(await buildQuery().range(from, from + PAGE_SIZE - 1), message);
        rows.push(...page);
        if (page.length < PAGE_SIZE) break;
    }
    return rows;
}

// Lấy các dòng theo danh sách id (chia lô). buildQuery(part) trả về query có .in(...) và .order(...)
async function fetchByIds(ids, buildQuery, message) {
    const rows = [];
    for (const part of chunk(ids, ID_CHUNK_SIZE)) {
        rows.push(...(await fetchAll(() => buildQuery(part), message)));
    }
    return rows;
}

module.exports = { dbError, unwrap, countOf, fetchAll, fetchByIds };