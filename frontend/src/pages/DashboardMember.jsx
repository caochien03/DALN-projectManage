import { useEffect, useState } from "react";
import { getUserProjects, getUserTasks } from "../services/user";
import axiosInstance from "../utils/axios";

export default function DashboardMember() {
    const [projects, setProjects] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [projectsRes, tasksRes, notiRes] = await Promise.all([
                    getUserProjects(),
                    getUserTasks(),
                    axiosInstance.get("/api/users/notifications"),
                ]);
                setProjects(projectsRes);
                setTasks(tasksRes);
                setNotifications(notiRes.data);
            } catch {
                // handle error
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const completedTasks = tasks.filter((t) => t.status === "completed").length;
    const totalTasks = tasks.length;

    if (loading) return <div>Đang tải...</div>;

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-xl font-bold mb-2">Dự án của bạn</h2>
                <ul>
                    {projects.map((p) => (
                        <li key={p._id}>
                            <b>{p.name}</b> - {p.status} - Tiến độ: {p.progress}
                            % - Kết thúc: {p.endDate?.slice(0, 10)}
                        </li>
                    ))}
                </ul>
            </div>
            <div>
                <h2 className="text-xl font-bold mb-2">Task của bạn</h2>
                <ul>
                    {tasks.map((t) => (
                        <li key={t._id}>
                            <b>{t.title}</b> ({t.status}) - Dự án:{" "}
                            {t.project?.name} - Hạn: {t.dueDate?.slice(0, 10)}
                        </li>
                    ))}
                </ul>
            </div>
            <div>
                <h2 className="text-xl font-bold mb-2">Tiến độ cá nhân</h2>
                <div>
                    {completedTasks}/{totalTasks} task hoàn thành
                    <div className="w-full bg-gray-200 rounded h-2 mt-1">
                        <div
                            className="bg-green-500 h-2 rounded"
                            style={{
                                width: `${
                                    totalTasks
                                        ? (completedTasks / totalTasks) * 100
                                        : 0
                                }%`,
                            }}
                        />
                    </div>
                </div>
            </div>
            <div>
                <h2 className="text-xl font-bold mb-2">Thông báo mới</h2>
                <ul>
                    {notifications.slice(0, 5).map((n) => (
                        <li key={n._id}>{n.message}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
