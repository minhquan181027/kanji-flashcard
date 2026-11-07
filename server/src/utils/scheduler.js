const DAY_MS = 24 * 60 * 60 * 1000;
const DEFAULT_EASE = 2.5;
const MIN_EASE = 1.3;
const EASE_PENALTY = 0.2;

/**
 * Tính trạng thái học mới sau một lần trả lời (phỏng theo SM-2, chỉ có đúng/sai).
 *
 * current:     dòng tiến độ hiện tại (null nếu lần đầu)
 * remembered:  true = "Đã nhớ", false = "Chưa nhớ"
 * masteryStreak: số lần đúng liên tiếp để từ "hay quên" chuyển thành "đã thuộc"
 *
 * Status:
 *   learning = đã học, chưa từng bấm "Chưa nhớ"
 *   hard     = vừa bấm "Chưa nhớ", nằm trong danh sách ôn tập
 *   mastered = từng là hard nhưng đã đúng đủ số lần liên tiếp
 */
function computeNext(current, remembered, now = new Date(), masteryStreak = 3) {
    const prev = {
        wrong_count: current?.wrong_count ?? 0,
        correct_count: current?.correct_count ?? 0,
        correct_streak: current?.correct_streak ?? 0,
        status: current?.status ?? "learning",
        ease_factor: Number(current?.ease_factor ?? DEFAULT_EASE),
        interval_days: current?.interval_days ?? 0,
    };
    const next = { ...prev };

    if (remembered) {
        next.correct_count = prev.correct_count + 1;
        next.correct_streak = prev.correct_streak + 1;

        if (next.correct_streak === 1) next.interval_days = 1;
        else if (next.correct_streak === 2) next.interval_days = 6;
        else next.interval_days = Math.max(1, Math.round(prev.interval_days * prev.ease_factor));

        if (prev.status === "hard" && next.correct_streak >= masteryStreak) next.status = "mastered";
    } else {
        next.wrong_count = prev.wrong_count + 1;
        next.correct_streak = 0;
        next.status = "hard";
        next.ease_factor = Math.max(MIN_EASE, Number((prev.ease_factor - EASE_PENALTY).toFixed(2)));
        next.interval_days = 0; // sai thì đến hạn ôn ngay
    }

    next.next_review_at = new Date(now.getTime() + next.interval_days * DAY_MS).toISOString();
    next.last_reviewed_at = now.toISOString();
    return next;
}

module.exports = { computeNext, DEFAULT_EASE, MIN_EASE };