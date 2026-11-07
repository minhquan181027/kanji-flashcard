const test = require("node:test");
const assert = require("node:assert/strict");
const { computeNext, MIN_EASE } = require("../src/utils/scheduler");

const NOW = new Date("2026-01-01T00:00:00.000Z");

test("lần đầu trả lời đúng: vẫn là learning, hẹn ôn sau 1 ngày", () => {
    const next = computeNext(null, true, NOW);
    assert.equal(next.status, "learning");
    assert.equal(next.correct_streak, 1);
    assert.equal(next.interval_days, 1);
    assert.equal(next.next_review_at, "2026-01-02T00:00:00.000Z");
});

test("bấm Chưa nhớ: thành hard, mất chuỗi đúng, đến hạn ôn ngay", () => {
    const next = computeNext({ status: "learning", correct_streak: 2, wrong_count: 0 }, false, NOW);
    assert.equal(next.status, "hard");
    assert.equal(next.wrong_count, 1);
    assert.equal(next.correct_streak, 0);
    assert.equal(next.interval_days, 0);
    assert.equal(next.next_review_at, NOW.toISOString());
});

test("từ hard trả lời đúng đủ 3 lần liên tiếp thì thành mastered", () => {
    let row = computeNext(null, false, NOW); // hard
    row = computeNext(row, true, NOW, 3);
    assert.equal(row.status, "hard");
    row = computeNext(row, true, NOW, 3);
    assert.equal(row.status, "hard");
    row = computeNext(row, true, NOW, 3);
    assert.equal(row.status, "mastered");
});

test("đang đúng 2 lần mà sai một lần thì phải đếm lại từ đầu", () => {
    let row = computeNext(null, false, NOW);
    row = computeNext(row, true, NOW, 3);
    row = computeNext(row, true, NOW, 3);
    row = computeNext(row, false, NOW, 3);
    assert.equal(row.status, "hard");
    assert.equal(row.correct_streak, 0);
});

test("mastered mà sai thì quay lại hard", () => {
    const next = computeNext({ status: "mastered", correct_streak: 5 }, false, NOW);
    assert.equal(next.status, "hard");
});

test("khoảng cách ôn: 1 ngày, 6 ngày, rồi nhân với hệ số dễ", () => {
    let row = computeNext(null, true, NOW);
    assert.equal(row.interval_days, 1);
    row = computeNext(row, true, NOW);
    assert.equal(row.interval_days, 6);
    row = computeNext(row, true, NOW);
    assert.equal(row.interval_days, 15); // 6 x 2.5
});

test("hệ số dễ giảm khi sai nhưng không thấp hơn mức tối thiểu", () => {
    let row = null;
    for (let i = 0; i < 20; i++) row = computeNext(row, false, NOW);
    assert.equal(row.ease_factor, MIN_EASE);
    assert.equal(row.wrong_count, 20);
});