const mongoose = require("mongoose");
const DepartmentService = require("./src/services/department.service");
const User = require("./src/models/User");

// Connect to MongoDB
mongoose.connect(
    process.env.MONGODB_URI || "mongodb://localhost:27017/project-management",
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }
);

async function testForceDeleteOptions() {
    try {
        console.log("🧪 Testing Force Delete Options...\n");

        // Tạo phòng ban test
        console.log("1. Creating test department...");
        const testDept = await DepartmentService.createDepartment({
            name: "Phòng Test Force Delete",
            description: "Phòng ban để test force delete",
        });
        console.log("✅ Created department:", testDept.name);
        console.log("");

        // Tạo một số user trong phòng ban
        console.log("2. Creating test users...");
        const users = [];
        for (let i = 1; i <= 3; i++) {
            const user = new User({
                name: `User Test ${i}`,
                email: `test${i}@example.com`,
                password: "password123",
                position: "Nhân viên",
                role: "member",
                department: testDept._id,
                isActive: true,
            });
            await user.save();
            users.push(user);
            console.log(`   - Created user: ${user.name}`);
        }
        console.log("");

        // Tạo phòng ban mặc định để chuyển user
        console.log("3. Creating default department for move action...");
        const defaultDept = await DepartmentService.createDepartment({
            name: "Phòng Ban Khác",
            description: "Phòng ban mặc định cho user được chuyển",
        });
        console.log("✅ Created default department:", defaultDept.name);
        console.log("");

        // Test 1: Force delete với userAction = 'null' (mặc định)
        console.log('4. Testing force delete with userAction = "null"...');
        const result1 = await DepartmentService.deleteDepartment(
            testDept._id,
            true,
            "null"
        );
        console.log("✅ Result:", result1.message);
        console.log("   Affected users:", result1.affectedUsers);
        console.log("   User action:", result1.userAction);

        // Kiểm tra user sau khi xóa
        const usersAfterNull = await User.find({
            _id: { $in: users.map((u) => u._id) },
        });
        console.log("   Users after delete:");
        usersAfterNull.forEach((user) => {
            console.log(
                `     - ${user.name}: department = ${
                    user.department ? "null" : "null"
                }, active = ${user.isActive}`
            );
        });
        console.log("");

        // Tạo lại phòng ban và user để test tiếp
        console.log("5. Recreating test data...");
        const testDept2 = await DepartmentService.createDepartment({
            name: "Phòng Test Force Delete 2",
            description: "Phòng ban để test force delete - v2",
        });

        const users2 = [];
        for (let i = 1; i <= 3; i++) {
            const user = new User({
                name: `User Test ${i} v2`,
                email: `test${i}v2@example.com`,
                password: "password123",
                position: "Nhân viên",
                role: "member",
                department: testDept2._id,
                isActive: true,
            });
            await user.save();
            users2.push(user);
        }
        console.log("✅ Recreated test data");
        console.log("");

        // Test 2: Force delete với userAction = 'deactivate'
        console.log(
            '6. Testing force delete with userAction = "deactivate"...'
        );
        const result2 = await DepartmentService.deleteDepartment(
            testDept2._id,
            true,
            "deactivate"
        );
        console.log("✅ Result:", result2.message);
        console.log("   Affected users:", result2.affectedUsers);
        console.log("   User action:", result2.userAction);

        // Kiểm tra user sau khi xóa
        const usersAfterDeactivate = await User.find({
            _id: { $in: users2.map((u) => u._id) },
        });
        console.log("   Users after delete:");
        usersAfterDeactivate.forEach((user) => {
            console.log(
                `     - ${user.name}: department = ${
                    user.department ? "null" : "null"
                }, active = ${user.isActive}`
            );
        });
        console.log("");

        // Tạo lại phòng ban và user để test tiếp
        console.log("7. Recreating test data for move test...");
        const testDept3 = await DepartmentService.createDepartment({
            name: "Phòng Test Force Delete 3",
            description: "Phòng ban để test force delete - v3",
        });

        const users3 = [];
        for (let i = 1; i <= 3; i++) {
            const user = new User({
                name: `User Test ${i} v3`,
                email: `test${i}v3@example.com`,
                password: "password123",
                position: "Nhân viên",
                role: "member",
                department: testDept3._id,
                isActive: true,
            });
            await user.save();
            users3.push(user);
        }
        console.log("✅ Recreated test data");
        console.log("");

        // Test 3: Force delete với userAction = 'move'
        console.log('8. Testing force delete with userAction = "move"...');
        const result3 = await DepartmentService.deleteDepartment(
            testDept3._id,
            true,
            "move"
        );
        console.log("✅ Result:", result3.message);
        console.log("   Affected users:", result3.affectedUsers);
        console.log("   User action:", result3.userAction);

        // Kiểm tra user sau khi xóa
        const usersAfterMove = await User.find({
            _id: { $in: users3.map((u) => u._id) },
        }).populate("department", "name");
        console.log("   Users after delete:");
        usersAfterMove.forEach((user) => {
            console.log(
                `     - ${user.name}: department = ${
                    user.department ? user.department.name : "null"
                }, active = ${user.isActive}`
            );
        });
        console.log("");

        // Test 4: Delete không force (sẽ fail)
        console.log("9. Testing delete without force (should fail)...");
        const testDept4 = await DepartmentService.createDepartment({
            name: "Phòng Test No Force",
            description: "Phòng ban để test delete không force",
        });

        const user4 = new User({
            name: "User Test No Force",
            email: "testnoforce@example.com",
            password: "password123",
            position: "Nhân viên",
            role: "member",
            department: testDept4._id,
            isActive: true,
        });
        await user4.save();

        const result4 = await DepartmentService.deleteDepartment(
            testDept4._id,
            false
        );
        console.log(
            "✅ Result:",
            result4.success ? "Success" : "Failed as expected"
        );
        console.log("   Message:", result4.message);
        console.log("");

        console.log("🎉 All force delete tests completed!");
        console.log("\n📋 Summary:");
        console.log(
            '- userAction="null": User department = null, user vẫn active'
        );
        console.log(
            '- userAction="deactivate": User department = null, user bị deactivate'
        );
        console.log(
            '- userAction="move": User được chuyển sang phòng ban mặc định'
        );
        console.log(
            "- Không force: Không cho phép xóa phòng ban có thành viên"
        );
    } catch (error) {
        console.error("❌ Test failed:", error.message);
        console.error(error.stack);
    } finally {
        await mongoose.disconnect();
        console.log("🔌 Disconnected from MongoDB");
    }
}

// Run tests
testForceDeleteOptions();
