// Gọi API lấy kanji từ server Express (đã proxy qua Vite nên chỉ cần /api)
export async function fetchKanji({ level = "N5", shuffle = true, limit } = {}) {
    const params = new URLSearchParams({ level, shuffle: String(shuffle) });
    if (limit) params.set("limit", String(limit));

    const res = await fetch(`/api/kanji?${params.toString()}`);
    if (!res.ok) {
        throw new Error("Không lấy được dữ liệu kanji từ server");
    }
    return res.json();
}