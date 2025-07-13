import React, { useState } from "react";
import { apiCall } from "../../utils/api";
import RequireAuth from "../../Components/RequireAuth";

const ChatboxAI = () => {
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState("");
    const [loading, setLoading] = useState(false);
    const [showChat, setShowChat] = useState(false);

    const handleAsk = async () => {
        if (!question.trim()) return;
        setLoading(true);
        try {
            const response = await apiCall("/api/gemini/ask", {
                method: "POST",
                body: JSON.stringify({ question }),
                auth: true,
            });

            const result = await response.text();
            setAnswer(response.ok ? result : "❌ AI lỗi: " + result);
        } catch (error) {
            setAnswer("❌ Gọi API thất bại: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <RequireAuth allowedRoles={["CUSTOMER"]}>
            <>
                <button
                    className="fixed bottom-5 right-5 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-blue-700 z-[9999]"
                    onClick={() => setShowChat(prev => !prev)}
                >
                    💬 Chat AI
                </button>

                {showChat && (
                    <div className="fixed bottom-20 right-5 w-96 bg-white border shadow-lg rounded-xl z-[9999] p-4">
                        <div className="flex justify-between items-center mb-2">
                            <h2 className="text-lg font-semibold">AI Tư vấn</h2>
                            <button
                                onClick={() => setShowChat(false)}
                                className="text-gray-500 hover:text-red-500"
                            >
                                ✕
                            </button>
                        </div>
                        <textarea
                            rows={3}
                            className="w-full p-2 border rounded mb-2"
                            placeholder="Nhập câu hỏi..."
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                        />
                        <button
                            className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                            onClick={handleAsk}
                            disabled={loading}
                        >
                            {loading ? "Đang hỏi..." : "Gửi"}
                        </button>
                        <div
                            className="mt-2 p-2 border rounded bg-gray-50 min-h-[80px] text-sm max-h-60 overflow-y-auto whitespace-pre-wrap"
                            dangerouslySetInnerHTML={{ __html: answer }}
                        />
                    </div>
                )}
            </>
        </RequireAuth>
    );
};

export default ChatboxAI;
