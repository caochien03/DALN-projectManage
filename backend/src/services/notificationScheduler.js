const cron = require("node-cron");
const Task = require("../models/Task");
const notificationService = require("./notification.service");

class NotificationScheduler {
    static init() {
        // Chạy mỗi giờ để kiểm tra task sắp đến hạn
        cron.schedule("0 * * * *", async () => {
            console.log("🔔 Running notification scheduler...");
            await this.checkDueTasks();
        });

        // Chạy mỗi ngày lúc 9h sáng để kiểm tra task quá hạn
        cron.schedule("0 9 * * *", async () => {
            console.log("🔔 Running overdue task checker...");
            await this.checkOverdueTasks();
        });

        console.log("✅ Notification scheduler initialized");
    }

    // Kiểm tra task sắp đến hạn (trong vòng 24h)
    static async checkDueTasks() {
        try {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);

            const dueTasks = await Task.find({
                dueDate: {
                    $gte: new Date(),
                    $lte: tomorrow,
                },
                status: { $ne: "completed" },
                assignedTo: { $exists: true, $ne: null },
            }).populate("assignedTo", "name email");

            for (const task of dueTasks) {
                // Kiểm tra xem đã gửi thông báo chưa
                const existingNotification =
                    await notificationService.getNotificationByTaskAndType(
                        task._id,
                        "task_due",
                        task.assignedTo._id
                    );

                if (!existingNotification) {
                    await notificationService.createNotification({
                        user: task.assignedTo._id,
                        type: "task_due",
                        message: `Task "${
                            task.title
                        }" sắp đến hạn vào ${task.dueDate.toLocaleDateString(
                            "vi-VN"
                        )}`,
                        relatedTo: task._id,
                        onModel: "Task",
                    });
                }
            }

            console.log(`📅 Checked ${dueTasks.length} tasks due soon`);
        } catch (error) {
            console.error("❌ Error checking due tasks:", error);
        }
    }

    // Kiểm tra task quá hạn
    static async checkOverdueTasks() {
        try {
            const overdueTasks = await Task.find({
                dueDate: { $lt: new Date() },
                status: { $ne: "completed" },
                assignedTo: { $exists: true, $ne: null },
            }).populate("assignedTo", "name email");

            for (const task of overdueTasks) {
                // Kiểm tra xem đã gửi thông báo quá hạn chưa
                const existingNotification =
                    await notificationService.getNotificationByTaskAndType(
                        task._id,
                        "task_overdue",
                        task.assignedTo._id
                    );

                if (!existingNotification) {
                    await notificationService.createNotification({
                        user: task.assignedTo._id,
                        type: "task_due",
                        message: `⚠️ Task "${
                            task.title
                        }" đã quá hạn từ ${task.dueDate.toLocaleDateString(
                            "vi-VN"
                        )}`,
                        relatedTo: task._id,
                        onModel: "Task",
                    });
                }
            }

            console.log(`⚠️ Checked ${overdueTasks.length} overdue tasks`);
        } catch (error) {
            console.error("❌ Error checking overdue tasks:", error);
        }
    }

    // Kiểm tra project sắp đến hạn
    static async checkProjectDue() {
        try {
            const Project = require("../models/Project");
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 7); // 7 ngày trước deadline

            const dueProjects = await Project.find({
                endDate: {
                    $gte: new Date(),
                    $lte: tomorrow,
                },
                status: "open",
            }).populate("members.user", "name email");

            for (const project of dueProjects) {
                for (const member of project.members) {
                    await notificationService.createNotification({
                        user: member.user._id,
                        type: "task_due",
                        message: `Dự án "${project.name}" sắp đến hạn hoàn thành`,
                        relatedTo: project._id,
                        onModel: "Project",
                    });
                }
            }

            console.log(`📅 Checked ${dueProjects.length} projects due soon`);
        } catch (error) {
            console.error("❌ Error checking project due:", error);
        }
    }
}

module.exports = NotificationScheduler;
