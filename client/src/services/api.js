
// Lấy URL backend từ file .env
const API_URL = import.meta.env.VITE_API_URL;

// Gọi API tới server Express
async function getJson(url, errorMessage) {
    const res = await fetch(`${API_URL}${url}`);

    if (!res.ok) throw new Error(errorMessage);

    return res.json();
}

// ----- Kanji -----
export function fetchKanji({ level = "N5", shuffle = true, limit } = {}) {
    const params = new URLSearchParams({
        level,
        shuffle: String(shuffle),
    });

    if (limit) params.set("limit", String(limit));

    return getJson(
        `/api/kanji?${params.toString()}`,
        "Không lấy được dữ liệu kanji từ server"
    );
}

// ----- Từ vựng theo Unit -----
export function fetchVocabUnits() {
    return getJson(
        "/api/vocab/units",
        "Không lấy được danh sách Unit"
    );
}

export function fetchVocabUnit(unitId, { shuffle = true } = {}) {
    return getJson(
        `/api/vocab/units/${unitId}?shuffle=${shuffle}`,
        "Không lấy được từ vựng của Unit này"
    );
}

