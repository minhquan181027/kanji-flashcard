const shuffle = require("../utils/shuffle");
const progressService = require("./progress.service");
const kanjiService = require("./kanji.service");
const vocabService = require("./vocab.service");

const CARD_SERVICES = { kanji: kanjiService, vocab: vocabService };

// Thẻ của các mục hay quên, kèm số lần sai. Mặc định quên nhiều nhất xếp trước.
async function getHardCards(userId, type, { shuffle: doShuffle, limit, dueOnly }) {
    let items = await progressService.listHard(userId, type, { dueOnly });

    if (doShuffle) items = shuffle(items);
    if (limit) items = items.slice(0, limit);

    const cards = await CARD_SERVICES[type].getCardsByIds(items.map((i) => i.itemId));

    return items
        .filter((item) => cards.has(item.itemId))
        .map((item) => ({
            ...cards.get(item.itemId),
            wrongCount: item.wrongCount,
            correctStreak: item.correctStreak,
        }));
}

module.exports = { getHardCards };