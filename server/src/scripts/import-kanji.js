// src/scripts/import-kanji.js
// CommonJS version — Hỗ trợ import N5, N4, N3... tự động
require('dotenv/config');
const { createClient } = require('@supabase/supabase-js');
const { join } = require('path');
const { existsSync } = require('fs');

// ====== LẤY LEVEL TỪ THAM SỐ DÒNG LỆNH ======
// Cách dùng:
//   node src/scripts/import-kanji.js       → Mặc định chạy N5
//   node src/scripts/import-kanji.js n4    → Chạy N4
//   node src/scripts/import-kanji.js N3    → Chạy N3
const levelArg = (process.argv[2] || 'n5').toLowerCase(); // mặc định n5
const levelCode = levelArg.toUpperCase(); // N5, N4...
const sortOrder = parseInt(levelArg.replace('n', '')) || 5; // 5, 4, 3...

// ====== ĐƯỜNG DẪN FILE DATA ======
// Lùi 2 cấp từ src/scripts ra tới server/data/kanji
const DATA_FILE = join(__dirname, '..', '..', 'data', 'kanji', `${levelArg}.js`);

if (!existsSync(DATA_FILE)) {
    console.error(`❌ Không tìm thấy file dữ liệu: ${DATA_FILE}`);
    process.exit(1);
}

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
);

async function importKanji() {
    console.log(`🚀 Bắt đầu import dữ liệu Kanji ${levelCode}...`);

    // 1. Khởi tạo hoặc lấy Level (N5, N4...)
    const { data: levelData, error: levelError } = await supabase
        .from('levels')
        .upsert({ code: levelCode, sort_order: sortOrder }, { onConflict: 'code' })
        .select('id')
        .single();

    if (levelError) throw new Error(`Lỗi khởi tạo Level ${levelCode}: ${levelError.message}`);
    const levelId = levelData.id;
    console.log(`✅ Đã lấy được level_id: ${levelId} (${levelCode})`);

    // 2. Load file dữ liệu
    const mod = require(DATA_FILE);
    const kanjiList = mod && mod.default ? mod.default : mod;

    if (!Array.isArray(kanjiList)) {
        throw new Error(`File ${levelArg}.js không export ra một mảng (Array).`);
    }
    console.log(`📦 Tìm thấy ${kanjiList.length} chữ Kanji cần import.`);

    // 3. Duyệt và insert từng chữ Kanji
    for (let i = 0; i < kanjiList.length; i++) {
        const item = kanjiList[i];
        const currentSortOrder = i + 1;

        // 3.1. Upsert vào bảng kanji
        const { data: kanjiData, error: kError } = await supabase
            .from('kanji')
            .upsert(
                {
                    level_id: levelId,
                    character: item.kanji,
                    han_viet: item.hanViet,
                    meaning: item.meaning,
                    sort_order: currentSortOrder,
                },
                { onConflict: 'character' } // Dựa vào chữ Hán để biết thêm mới hay cập nhật
            )
            .select('id')
            .single();

        if (kError) {
            console.error(`❌ Lỗi khi up chữ ${item.kanji}:`, kError.message);
            continue; // Bỏ qua chữ bị lỗi để chạy tiếp
        }

        const kanjiId = kanjiData.id;

        // 3.2. Xóa các examples cũ của chữ Kanji này (tránh nhân đôi data khi chạy lại)
        const { error: delError } = await supabase
            .from('kanji_examples')
            .delete()
            .eq('kanji_id', kanjiId);

        if (delError) {
            console.error(`❌ Lỗi khi xóa example cũ của ${item.kanji}:`, delError.message);
            continue;
        }

        // 3.3. Insert example mới
        const examplePayload = {
            kanji_id: kanjiId,
            vocabulary: item.vocabulary ?? null,
            example: item.example,
            romaji: item.romaji ?? null,
            translation: item.translation ?? null,
        };

        const { error: insError } = await supabase
            .from('kanji_examples')
            .insert(examplePayload);

        if (insError) {
            console.error(`❌ Lỗi khi thêm example cho ${item.kanji}:`, insError.message);
        } else {
            console.log(`  + Đã thêm: ${item.kanji} (${item.hanViet})`);
        }
    }

    console.log(`\n🎉 Xong! Đã import toàn bộ Kanji ${levelCode}.`);
}

// Chạy script
importKanji().catch(error => {
    console.error('❌ Lỗi nghiêm trọng:', error.message);
    process.exit(1);
});