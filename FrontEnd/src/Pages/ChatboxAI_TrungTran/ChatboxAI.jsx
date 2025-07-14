import React, { useState, useRef } from "react";
import { apiCall } from "../../utils/api";
import RequireAuth from "../../Components/RequireAuth";

const ChatboxAI = () => {
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState("");
    const [loading, setLoading] = useState(false);
    const [showChat, setShowChat] = useState(false);
    // Button position state
    const [buttonPosition, setButtonPosition] = useState({ x: window.innerWidth - 100, y: window.innerHeight - 100 });
    const [buttonDragging, setButtonDragging] = useState(false);
    const [buttonRel, setButtonRel] = useState({ x: 0, y: 0 });
    const buttonRef = useRef(null);
    // Chatbox position state
    const [chatPosition, setChatPosition] = useState({ x: window.innerWidth - 420, y: window.innerHeight - 420 });
    const [chatDragging, setChatDragging] = useState(false);
    const [chatRel, setChatRel] = useState({ x: 0, y: 0 });
    const chatRef = useRef(null);
    // Resize chatbox state
    const [chatSize, setChatSize] = useState({ width: 384, height: 420 }); // 96*4=384px
    const [resizing, setResizing] = useState(false);
    const resizeRel = useRef({ x: 0, y: 0, width: 384, height: 420 });

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

    // Button drag handlers
    const dragStartPos = useRef({ x: 0, y: 0 });
    const onButtonMouseDown = (e) => {
        if (e.button !== 0) return;
        const rect = buttonRef.current.getBoundingClientRect();
        setButtonDragging(true);
        setButtonRel({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        dragStartPos.current = { x: e.clientX, y: e.clientY };
        e.stopPropagation();
        e.preventDefault();
    };
    const onButtonMouseUp = (e) => {
        if (!buttonDragging) return;
        setButtonDragging(false);
        // Nếu di chuyển nhỏ hơn 5px thì coi là click
        const dx = Math.abs(e.clientX - dragStartPos.current.x);
        const dy = Math.abs(e.clientY - dragStartPos.current.y);
        if (dx < 5 && dy < 5) {
            handleOpenChat();
        }
    };
    const onButtonMouseMove = (e) => {
        if (!buttonDragging) return;
        setButtonPosition({
            x: Math.min(Math.max(e.clientX - buttonRel.x, 0), window.innerWidth - 80),
            y: Math.min(Math.max(e.clientY - buttonRel.y, 0), window.innerHeight - 80),
        });
        e.stopPropagation();
        e.preventDefault();
    };
    React.useEffect(() => {
        if (buttonDragging) {
            window.addEventListener("mousemove", onButtonMouseMove);
            window.addEventListener("mouseup", onButtonMouseUp);
        } else {
            window.removeEventListener("mousemove", onButtonMouseMove);
            window.removeEventListener("mouseup", onButtonMouseUp);
        }
        return () => {
            window.removeEventListener("mousemove", onButtonMouseMove);
            window.removeEventListener("mouseup", onButtonMouseUp);
        };
    }, [buttonDragging, buttonRel]);

    // Khi mở chatbox, đặt vị trí chatbox đúng vị trí icon, ẩn icon
    const handleOpenChat = () => {
        setShowChat(true);
        // Chatbox xuất hiện tại vị trí icon, điều chỉnh để không tràn
        let x = Math.max(Math.min(buttonPosition.x, window.innerWidth - 400), 0);
        let y = Math.max(Math.min(buttonPosition.y, window.innerHeight - 100), 0);
        setChatPosition({ x, y });
    };
    // Khi đóng chatbox, hiện lại icon đúng vị trí cũ
    const handleCloseChat = () => {
        // Đặt lại vị trí icon về đúng vị trí chatbox vừa đóng
        setButtonPosition({
            x: Math.max(Math.min(chatPosition.x, window.innerWidth - 80), 0),
            y: Math.max(Math.min(chatPosition.y, window.innerHeight - 80), 0),
        });
        setShowChat(false);
    };

    // Chatbox drag handlers
    const onChatMouseDown = (e) => {
        if (e.button !== 0) return;
        const rect = chatRef.current.getBoundingClientRect();
        setChatDragging(true);
        setChatRel({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        e.stopPropagation();
        e.preventDefault();
    };
    const onChatMouseUp = () => setChatDragging(false);
    const onChatMouseMove = (e) => {
        if (!chatDragging) return;
        setChatPosition({
            x: Math.max(Math.min(e.clientX - chatRel.x, window.innerWidth - 400), 0),
            y: Math.max(Math.min(e.clientY - chatRel.y, window.innerHeight - 100), 0), // 100 để luôn thấy header
        });
        e.stopPropagation();
        e.preventDefault();
    };
    React.useEffect(() => {
        if (chatDragging) {
            window.addEventListener("mousemove", onChatMouseMove);
            window.addEventListener("mouseup", onChatMouseUp);
        } else {
            window.removeEventListener("mousemove", onChatMouseMove);
            window.removeEventListener("mouseup", onChatMouseUp);
        }
        return () => {
            window.removeEventListener("mousemove", onChatMouseMove);
            window.removeEventListener("mouseup", onChatMouseUp);
        };
    }, [chatDragging, chatRel]);

    // Resize handlers
    const onResizeMouseDown = (e) => {
        e.stopPropagation();
        e.preventDefault();
        setResizing(true);
        resizeRel.current = {
            x: e.clientX,
            y: e.clientY,
            width: chatSize.width,
            height: chatSize.height,
        };
    };
    const onResizeMouseMove = (e) => {
        if (!resizing) return;
        let newWidth = resizeRel.current.width + (e.clientX - resizeRel.current.x);
        let newHeight = resizeRel.current.height + (e.clientY - resizeRel.current.y);
        // Giới hạn min/max
        newWidth = Math.max(320, Math.min(newWidth, window.innerWidth - chatPosition.x - 20));
        newHeight = Math.max(300, Math.min(newHeight, window.innerHeight - chatPosition.y - 20));
        setChatSize({ width: newWidth, height: newHeight });
    };
    const onResizeMouseUp = () => setResizing(false);
    React.useEffect(() => {
        if (resizing) {
            window.addEventListener("mousemove", onResizeMouseMove);
            window.addEventListener("mouseup", onResizeMouseUp);
        } else {
            window.removeEventListener("mousemove", onResizeMouseMove);
            window.removeEventListener("mouseup", onResizeMouseUp);
        }
        return () => {
            window.removeEventListener("mousemove", onResizeMouseMove);
            window.removeEventListener("mouseup", onResizeMouseUp);
        };
    }, [resizing]);

    return (
        <RequireAuth allowedRoles={["CUSTOMER"]}>
            <>
                {/* Draggable Chat Button - chỉ hiện khi chưa mở chatbox */}
                {!showChat && (
                    <button
                        ref={buttonRef}
                        className="fixed bg-gradient-to-r from-blue-500 to-purple-600 text-white w-16 h-16 rounded-full shadow-xl hover:scale-105 transition-transform z-[9999] flex items-center justify-center text-2xl font-bold cursor-move border-4 border-white"
                        style={{ left: buttonPosition.x, top: buttonPosition.y, cursor: buttonDragging ? 'grabbing' : 'grab', boxShadow: "0 4px 24px 0 rgba(59,130,246,0.2)" }}
                        onMouseDown={onButtonMouseDown}
                        // onClick={e => { if (!buttonDragging) handleOpenChat(); }}
                        title="Chat AI"
                    >
                        💬
                    </button>
                )}

                {/* Draggable Chatbox - chỉ hiện khi showChat */}
                {showChat && (
                    <div
                        ref={chatRef}
                        className="fixed z-[9999] bg-white border border-gray-200 shadow-2xl rounded-2xl flex flex-col"
                        style={{
                            left: chatPosition.x,
                            top: chatPosition.y,
                            cursor: chatDragging ? 'grabbing' : 'default',
                            width: chatSize.width,
                            height: chatSize.height,
                            minWidth: 320,
                            minHeight: 300,
                            maxWidth: window.innerWidth - chatPosition.x - 20,
                            maxHeight: window.innerHeight - chatPosition.y - 20,
                        }}
                    >
                        {/* Header - draggable */}
                        <div
                            className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-2xl cursor-move select-none"
                            onMouseDown={onChatMouseDown}
                            style={{ userSelect: 'none' }}
                        >
                            <span className="text-white font-bold text-lg flex items-center gap-2">
                                <span role="img" aria-label="chat">🤖</span> AI Tư vấn
                            </span>
                            <button
                                onClick={handleCloseChat}
                                className="text-white hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
                                style={{ fontSize: 20, fontWeight: 'bold' }}
                            >
                                ×
                            </button>
                        </div>
                        {/* Chat body */}
                        <div className="flex-1 flex flex-col p-4 gap-2 bg-gray-50 overflow-y-auto" style={{ minHeight: 180 }}>
                            <textarea
                                rows={3}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 resize-none mb-2 bg-white"
                                placeholder="Nhập câu hỏi cho AI..."
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAsk(); } }}
                            />
                            <button
                                className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:scale-105 transition-transform disabled:opacity-50"
                                onClick={handleAsk}
                                disabled={loading}
                            >
                                {loading ? "Đang hỏi..." : "Gửi"}
                            </button>
                            <div
                                className="mt-2 p-3 border border-gray-200 rounded-lg bg-white min-h-[80px] text-sm max-h-60 overflow-y-auto whitespace-pre-wrap shadow-inner"
                                dangerouslySetInnerHTML={{ __html: answer }}
                            />
                        </div>
                        {/* Resize handle */}
                        <div
                            onMouseDown={onResizeMouseDown}
                            className="absolute right-2 bottom-2 w-5 h-5 cursor-nwse-resize z-50 flex items-end justify-end"
                            style={{ userSelect: 'none' }}
                        >
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 16L16 4M8 16H16V8" stroke="#888" strokeWidth="2" strokeLinecap="round"/></svg>
                        </div>
                    </div>
                )}
            </>
        </RequireAuth>
    );
};

export default ChatboxAI;
