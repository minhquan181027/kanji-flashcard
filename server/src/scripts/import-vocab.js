// scripts/import-vocab.js — CJS
require('dotenv/config');
const { createClient } = require('@supabase/supabase-js');
const { readdir } = require('fs/promises');
const { join } = require('path');

// FIX: Lùi 2 cấp từ src/scripts ra tới server/data/vocabulary
const DATA_DIR = join(__dirname, '..', '..', 'data', 'vocabulary');

// Chọn unit (Mặc định chỉ chạy unit8)
const args = process.argv.slice(2);
const RUN_ALL = args.includes('--all');
const WANTED = new Set(
  args.filter(a => a !== '--all').map(a => a.toLowerCase().replace(/\.(js|cjs)$/, ''))
);
if (!RUN_ALL && WANTED.size === 0) WANTED.add('unit8');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

function splitEmoji(word) {
  if (word.emoji) return { emoji: word.emoji, meaning: word.meaning };
  if (!word.meaning) return { emoji: null, meaning: word.meaning ?? null };
  const match = word.meaning.match(
    /^(\p{Extended_Pictographic}(?:\uFE0F|\u200D\p{Extended_Pictographic})*)\s*—\s*(.+)$/u
  );
  if (match) return { emoji: match[1], meaning: match[2] };
  return { emoji: null, meaning: word.meaning };
}

async function loadUnitsToImport() {
  const files = await readdir(DATA_DIR);
  let unitFiles = files.filter(f => /^unit\d+\.(js|cjs)$/.test(f));

  if (!RUN_ALL) {
    unitFiles = unitFiles.filter(f => WANTED.has(f.replace(/\.(js|cjs)$/, '').toLowerCase()));
  }

  unitFiles.sort((a, b) => parseInt(a.match(/\d+/)[0]) - parseInt(b.match(/\d+/)[0]));

  if (!RUN_ALL) {
    for (const w of WANTED) {
      if (!unitFiles.some(f => f.replace(/\.(js|cjs)$/, '').toLowerCase() === w)) {
        console.warn(`⚠️ Không tìm thấy file cho "${w}" trong ${DATA_DIR}`);
      }
    }
  }

  const units = [];
  for (const file of unitFiles) {
    const mod = require(join(DATA_DIR, file));
    const unit = mod && mod.default ? mod.default : mod;
    if (!unit || !unit.id) {
      console.warn(`⚠️ ${file} không export unit hợp lệ (thiếu id), bỏ qua.`);
      continue;
    }
    units.push(unit);
  }
  return units;
}

async function importUnit(unit) {
  console.log(`\n📦 ${unit.id} - ${unit.title}`);
  const unitNumber = parseInt(unit.id.match(/\d+/)?.[0] || 0);

  // 1. Upsert unit
  const { data: unitData, error: unitError } = await supabase
    .from('vocab_units')
    .upsert(
      { code: unit.id, title: unit.title, description: unit.description ?? null, sort_order: unitNumber },
      { onConflict: 'code' }
    )
    .select('id')
    .single();
  if (unitError) throw new Error(`Unit ${unit.id}: ${unitError.message}`);
  const unitId = unitData.id;

  if (!unit.words || unit.words.length === 0) {
    console.log(`⚠️ ${unit.id} không có từ vựng, xoá từ cũ (nếu có).`);
    const { error } = await supabase.from('vocab_words').delete().eq('unit_id', unitId);
    if (error) throw new Error(`Delete old words ${unit.id}: ${error.message}`);
    return;
  }

  // 2. Upsert words
  const wordsPayload = unit.words.map((word, index) => {
    const { emoji, meaning } = splitEmoji(word);
    return {
      unit_id: unitId,
      word: word.word,
      hiragana: word.hiragana ?? null,
      romaji: word.romaji ?? null,
      meaning,
      emoji,
      sort_order: index + 1,
    };
  });

  const { data: wordsData, error: wordsError } = await supabase
    .from('vocab_words')
    .upsert(wordsPayload, { onConflict: 'unit_id,word' })
    .select('id, word');
  if (wordsError) throw new Error(`Words ${unit.id}: ${wordsError.message}`);
  if (!wordsData || wordsData.length === 0) {
    throw new Error(`Words ${unit.id}: upsert trả về rỗng (kiểm tra UNIQUE(unit_id, word))`);
  }

  const wordIdMap = new Map(wordsData.map(w => [w.word, w.id]));
  const wordIds = wordsData.map(w => w.id);

  // 3. Xoá từ stale không còn trong source
  const sourceWordList = wordsData.map(w => `"${w.word.replace(/"/g, '\\"')}"`).join(',');
  const { error: delStaleErr } = await supabase
    .from('vocab_words')
    .delete()
    .eq('unit_id', unitId)
    .not('word', 'in', `(${sourceWordList})`);
  if (delStaleErr) console.warn(`⚠️ Không xoá được từ stale: ${delStaleErr.message}`);

  // 4. Delete + Insert examples
  const { error: delError } = await supabase
    .from('vocab_examples')
    .delete()
    .in('word_id', wordIds);
  if (delError) throw new Error(`Delete examples ${unit.id}: ${delError.message}`);

  const examplesPayload = unit.words
    .map(word => {
      const wordId = wordIdMap.get(word.word);
      const ex = word.example;
      if (!wordId || !ex?.jp) return null;
      return { word_id: wordId, example: ex.jp, romaji: ex.romaji ?? null, translation: ex.vi ?? null };
    })
    .filter(Boolean);

  if (examplesPayload.length > 0) {
    const { error: insError } = await supabase.from('vocab_examples').insert(examplesPayload);
    if (insError) throw new Error(`Insert examples ${unit.id}: ${insError.message}`);
  }

  console.log(
    `✅ ${wordsPayload.length} từ, ${examplesPayload.length} ví dụ` +
    (unit.words.length > wordsPayload.length
      ? ` (bỏ qua ${unit.words.length - wordsPayload.length} từ thiếu dữ liệu)`
      : '')
  );
}

async function main() {
  const units = await loadUnitsToImport();
  if (units.length === 0) return console.log('⚠️ Không có unit nào để import.');
  console.log(`🚀 Sẽ import ${units.length} unit: ${units.map(u => u.id).join(', ')}`);

  let ok = 0, failed = 0;
  for (const unit of units) {
    try { await importUnit(unit); ok++; }
    catch (err) { failed++; console.error(`❌ ${unit.id} lỗi: ${err.message}`); }
  }
  console.log(`\n🎉 Xong! Thành công: ${ok}, lỗi: ${failed}`);
  if (failed > 0) process.exit(1);
}

main().catch(error => {
  console.error('❌ Lỗi:', error.message);
  process.exit(1);
});