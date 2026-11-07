import { useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { recordAnswer } from "../services/api";

// Trả về hàm lưu đáp án cho PracticeSession.
// Chưa đăng nhập thì trả về undefined: vẫn học được nhưng không lưu tiến độ.
export function useAnswerSaver(type) {
    const { user, refreshSummarySoon } = useAuth();

    const save = useCallback(
        async (card, remembered) => {
            await recordAnswer({ type, itemId: card.id, remembered });
            refreshSummarySoon();
        },
        [type, refreshSummarySoon]
    );

    return user ? save : undefined;
}