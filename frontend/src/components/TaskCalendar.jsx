import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import "react-big-calendar/lib/css/react-big-calendar.css";
import vi from "date-fns/locale/vi";

const locales = {
    vi: vi,
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
    getDay,
    locales,
});

// Hàm lấy màu theo trạng thái
const getStatusColor = (status) => {
    switch (status) {
        case "todo":
            return "#3b82f6"; // blue-500
        case "in_progress":
            return "#f59e42"; // yellow-400 (cam)
        case "review":
            return "#a78bfa"; // purple-400
        case "completed":
            return "#22c55e"; // green-500
        default:
            return "#64748b"; // gray-600
    }
};

export default function TaskCalendar({ tasks, onTaskClick }) {
    // Map tasks to events
    const events = tasks.map((task) => ({
        id: task._id,
        title: task.title,
        start: new Date(task.startDate),
        end: new Date(task.dueDate),
        resource: task,
        allDay: true, // Luôn hiển thị ở dòng All-day
    }));

    // Custom màu cho từng event
    const eventPropGetter = (event) => {
        const color = getStatusColor(event.resource.status);
        return {
            style: {
                backgroundColor: color,
                borderRadius: "6px",
                color: "#fff",
                border: "none",
                display: "block",
            },
        };
    };

    return (
        <div className="bg-white rounded-xl shadow p-4">
            <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 600 }}
                onSelectEvent={(event) =>
                    onTaskClick && onTaskClick(event.resource)
                }
                views={["month", "week", "day"]}
                popup
                eventPropGetter={eventPropGetter}
                messages={{
                    today: "Hôm nay",
                    previous: "Trước",
                    next: "Sau",
                    month: "Tháng",
                    week: "Tuần",
                    day: "Ngày",
                    agenda: "Lịch biểu",
                    date: "Ngày",
                    time: "Giờ",
                    event: "Công việc",
                    noEventsInRange: "Không có công việc nào",
                }}
            />
        </div>
    );
}
