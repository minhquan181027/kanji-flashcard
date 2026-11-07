// Xáo trộn mảng (Fisher-Yates), không làm thay đổi mảng gốc
module.exports = function shuffle(array) {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
};