// scripts/import-vocab.js
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { readdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '..', 'data','vocabulary');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

function splitEmoji(word) {
  if (word.emoji) return { emoji: word.emoji, meaning: word.meaning };
  const match = word.meaning.match(
    /^(\p{Extended_Pictographic}(?:\uFE0F|\u200D\p{Extended_Pictographic})*)\s*—\s*(.+)$/u
  );
  if (match) return { emoji: match[1], meaning: match[2] };
  return { emoji: null, meaning: word.meaning };
}

async function loadAllUnits() {
  const files = await readdir(DATA_DIR);
  const unitFiles = files
    .filter(f => /^unit\d+\.js$/.test(f))
    .sort((a, b) => parseInt(a.match(/\d+/)[0]) - parseInt(b.match(/\d+/)[0]));

  const units = [];
  for (const file of unitFiles) {
    const mod = await import(pathToFileURL(join(DATA_DIR, file)).href);
    units.push(mod.default);
  }
  return units;
}

async function importUnit(unit) {
  console.log(`\n📦 ${unit.id} - ${unit.title}`);

  // 1. Upsert unit — FIX: chỉ rõ onConflict
  const { data: unitData, error: unitError } = await supabase
    .from('vocab_units')
    .upsert(
      { code: unit.id, title: unit.title, description: unit.description ?? null },
      { onConflict: 'code' }
    )
    .select('id')
    .single();

  if (unitError) throw new Error(`Unit ${unit.id}: ${unitError.message}`);
  const unitId = unitData.id;

  // 2. Chuẩn bị words
  const wordsPayload = unit.words.map((word, index) => {
    const { emoji, meaning } = splitEmoji(word);
    return {
      unit_id: unitId,
      word: word.word,
      hiragana: word.hiragana,
      romaji: word.romaji,
      meaning,
      emoji,
      sort_order: index + 1,
    };
  });

  // 3. Upsert words
  const { data: wordsData, error: wordsError } = await supabase
    .from('vocab_words')
    .upsert(wordsPayload, { onConflict: 'unit_id,word' })
    .select('id, word');

  if (wordsError) throw new Error(`Words ${unit.id}: ${wordsError.message}`);

  const wordIdMap = new Map(wordsData.map(w => [w.word, w.id]));

  // 4. DELETE + INSERT examples (FIX: không cần UNIQUE word_id)
  const wordIds = wordsData.map(w => w.id);

  const { error: delError } = await supabase
    .from('vocab_examples')
    .delete()
    .in('word_id', wordIds);

  if (delError) throw new Error(`Delete examples ${unit.id}: ${delError.message}`);

  const examplesPayload = unit.words
    .map(word => {
      const wordId = wordIdMap.get(word.word);
      if (!wordId) return null;
      return {
        word_id: wordId,
        example: word.example.jp,
        romaji: word.example.romaji ?? null,
        translation: word.example.vi ?? null,
      };
    })
    .filter(Boolean);

  const { error: insError } = await supabase
    .from('vocab_examples')
    .insert(examplesPayload);

  if (insError) throw new Error(`Insert examples ${unit.id}: ${insError.message}`);

  console.log(`✅ ${unit.words.length} từ, ${examplesPayload.length} ví dụ`);
}

async function main() {
  const units = await loadAllUnits();
  console.log(`🚀 Tìm thấy ${units.length} unit: ${units.map(u => u.id).join(', ')}`);
  for (const unit of units) {
    await importUnit(unit);
  }
  console.log('\n🎉 Xong!');
}

main().catch(error => {
  console.error('❌ Lỗi:', error.message);
  process.exit(1);
});