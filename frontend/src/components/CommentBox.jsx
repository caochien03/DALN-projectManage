import { useState, useEffect, useRef } from "react";
import {
    getTaskComments,
    addTaskComment,
    getProjectComments,
    addProjectComment,
    deleteComment,
} from "../services/comment";
import { toast } from "react-toastify";

// members: [{_id, name, ...}] để gợi ý mention
export default function CommentBox({ type, id, members = [], currentUser }) {
    const [comments, setComments] = useState([]);
    const [content, setContent] = useState("");
    const [mentions, setMentions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showMention, setShowMention] = useState(false);
    const [mentionQuery, setMentionQuery] = useState("");
    const textareaRef = useRef();

    // Lấy danh sách bình luận
    const fetchComments = async () => {
        setLoading(true);
        try {
            let data = [];
            if (type === "task") data = await getTaskComments(id);
            else data = await getProjectComments(id);
            setComments(data);
        } catch {
            toast.error("Không thể tải bình luận");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComments();
        // eslint-disable-next-line
    }, [id]);

    // Log members để debug mention
    useEffect(() => {
        console.log("members", members);
    }, [members]);

    // Xử lý nhập @ để gợi ý mention
    const handleInput = (e) => {
        const value = e.target.value;
        setContent(value);
        const cursor = e.target.selectionStart;
        const lastAt = value.lastIndexOf("@", cursor - 1);
        if (lastAt !== -1) {
            const afterAt = value.slice(lastAt + 1, cursor);
            setMentionQuery(afterAt);
            setShowMention(true);
        } else {
            setShowMention(false);
            setMentionQuery("");
        }
    };

    // Chọn user để mention
    const handleSelectMention = (user) => {
        // Thay thế @query bằng @Tên
        const cursor = textareaRef.current.selectionStart;
        const value = content;
        const lastAt = value.lastIndexOf("@", cursor - 1);
        const before = value.slice(0, lastAt + 1);
        const after = value.slice(cursor);
        setContent(before + user.name + " " + after);
        setMentions((prev) => Array.from(new Set([...prev, user._id])));
        setShowMention(false);
        setMentionQuery("");
        setTimeout(() => textareaRef.current.focus(), 0);
    };

    // Gửi bình luận
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim()) return;
        try {
            if (type === "task") {
                await addTaskComment(id, content, mentions);
            } else {
                await addProjectComment(id, content, mentions);
            }
            setContent("");
            setMentions([]);
            fetchComments();
        } catch {
            toast.error("Không gửi được bình luận");
        }
    };

    // Xóa bình luận
    const handleDelete = async (commentId) => {
        if (!window.confirm("Bạn có chắc muốn xóa bình luận này?")) return;
        try {
            await deleteComment(commentId);
            toast.success("Đã xóa bình luận");
            fetchComments();
        } catch {
            toast.error("Không xóa được bình luận");
        }
    };

    // Gợi ý mention
    const mentionList = members.filter((m) =>
        m.name.toLowerCase().includes(mentionQuery.toLowerCase())
    );

    return (
        <div className="bg-white rounded shadow p-4 mt-6">
            <h3 className="font-bold mb-2">Bình luận</h3>
            {loading ? (
                <div>Đang tải...</div>
            ) : (
                <div className="space-y-3 mb-4">
                    {comments.length === 0 && <div>Chưa có bình luận nào</div>}
                    {comments.map((c) => (
                        <div
                            key={c._id}
                            className="border-b pb-2 flex justify-between items-start"
                        >
                            <div>
                                <div className="font-semibold text-sm">
                                    {c.author?.name || "Người dùng"}{" "}
                                    <span className="text-xs text-gray-400">
                                        {new Date(c.createdAt).toLocaleString()}
                                    </span>
                                </div>
                                <div className="text-sm mt-1 whitespace-pre-line">
                                    {renderContentWithMentions(
                                        c.content,
                                        c.mentions,
                                        members
                                    )}
                                </div>
                            </div>
                            {(currentUser?.role === "admin" ||
                                String(currentUser?._id) ===
                                    String(c.author?._id)) && (
                                <button
                                    className="text-xs text-red-500 hover:underline ml-2"
                                    onClick={() => handleDelete(c._id)}
                                >
                                    Xóa
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
            <form onSubmit={handleSubmit} className="flex flex-col gap-2">
                <textarea
                    ref={textareaRef}
                    value={content}
                    onChange={handleInput}
                    rows={2}
                    className="border rounded px-2 py-1 w-full"
                    placeholder="Nhập bình luận... (gõ @ để mention)"
                />
                {showMention && mentionQuery && mentionList.length > 0 && (
                    <div className="border rounded bg-white shadow absolute z-50 mt-10 max-h-40 overflow-y-auto">
                        {mentionList.map((user) => (
                            <div
                                key={user._id}
                                className="px-3 py-1 hover:bg-indigo-100 cursor-pointer"
                                onClick={() => handleSelectMention(user)}
                            >
                                @{user.name}
                            </div>
                        ))}
                    </div>
                )}
                <div className="flex justify-end">
                    <button
                        type="submit"
                        className="bg-indigo-600 text-white px-4 py-1 rounded hover:bg-indigo-700"
                        disabled={!content.trim()}
                    >
                        Gửi
                    </button>
                </div>
            </form>
        </div>
    );
}

// Hiển thị mention nổi bật trong nội dung bình luận
function renderContentWithMentions(content, mentions, members) {
    if (!mentions || mentions.length === 0) return content;
    let result = content;
    mentions.forEach((userId) => {
        const user = members.find((m) => m._id === userId);
        if (user) {
            // Tô đậm tên được mention
            const regex = new RegExp(`@${user.name}(?!\\w)`, "g");
            result = result.replace(
                regex,
                `<span class="text-indigo-600 font-semibold">@${user.name}</span>`
            );
        }
    });
    // Dùng dangerouslySetInnerHTML khi render
    return <span dangerouslySetInnerHTML={{ __html: result }} />;
}
