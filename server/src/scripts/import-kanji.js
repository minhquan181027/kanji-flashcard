// scripts/import-kanji.js
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { pathToFileURL } from 'url';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
// Đường dẫn tới file chứa data kanji của bạn
const DATA_FILE = join(__dirname, '..', 'data', 'kanji', 'n5.js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
);

async function importKanji() {
    console.log('🚀 Bắt đầu import dữ liệu Kanji N5...');

    // 1. Khởi tạo hoặc lấy Level (N5)
    // Giả sử bạn dùng 'N5' làm code, sort_order là 5
    const { data: levelData, error: levelError } = await supabase
        .from('levels')
        .upsert({ code: 'N5', sort_order: 5 }, { onConflict: 'code' })
        .select('id')
        .single();

    if (levelError) throw new Error(`Lỗi khởi tạo Level: ${levelError.message}`);
    const levelId = levelData.id;
    console.log(`✅ Đã lấy được level_id: ${levelId} (N5)`);

    // 2. Load file dữ liệu JSON/JS
    const { default: kanjiList } = await import(pathToFileURL(DATA_FILE).href);
    console.log(`📦 Tìm thấy ${kanjiList.length} chữ Kanji cần import.`);

    // 3. Duyệt và insert từng chữ Kanji
    for (let i = 0; i < kanjiList.length; i++) {
        const item = kanjiList[i];
        const sortOrder = i + 1;

        // 3.1. Upsert vào bảng kanji
        const { data: kanjiData, error: kError } = await supabase
            .from('kanji')
            .upsert(
                {
                    level_id: levelId,
                    character: item.kanji,
                    han_viet: item.hanViet,
                    meaning: item.meaning,
                    sort_order: sortOrder,
                },
                { onConflict: 'character' } // Dựa vào cột character để biết là thêm mới hay cập nhật
            )
            .select('id')
            .single();

        if (kError) {
            console.error(`❌ Lỗi khi up chữ ${item.kanji}:`, kError.message);
            continue; // Bỏ qua chữ bị lỗi để chạy tiếp chữ khác
        }

        const kanjiId = kanjiData.id;

        // 3.2. Xóa các examples cũ của chữ Kanji này (để tránh bị nhân đôi dữ liệu khi chạy lại)
        const { error: delError } = await supabase
            .from('kanji_examples')
            .delete()
            .eq('kanji_id', kanjiId);

        if (delError) {
            console.error(`❌ Lỗi khi xóa example cũ của ${item.kanji}:`, delError.message);
            continue;
        }

        // 3.3. Insert example mới (Gộp chung vocabulary vào 1 câu insert)
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
            // Log cho vui mắt
            console.log(`  + Đã thêm: ${item.kanji} (${item.hanViet})`);
        }
    }

    console.log('\n🎉 Xong! Đã import toàn bộ Kanji N5.');
}

// Chạy script
importKanji().catch(error => {
    console.error('❌ Lỗi nghiêm trọng:', error.message);
    process.exit(1);
});