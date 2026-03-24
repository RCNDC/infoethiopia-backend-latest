const db = require("./models");

const initialMenus = [
    { menuName: "Dashboard", route: "/admin" },
    { menuName: "Companies", route: "/admin/company" },
    { menuName: "Manage Requests", route: "/admin/requests" },
    { menuName: "Manage Call Center", route: "/admin/callcenter" },
    { menuName: "Categories", route: "/admin/catagories" },
    { menuName: "News", route: "/admin/news" },
    { menuName: "Users", route: "/admin/users" },
    { menuName: "Ads", route: "/admin/ads" },
    { menuName: "Manage Company News", route: "/admin/company-news" },
    { menuName: "Manage Job Post", route: "/admin/jobs" },
    { menuName: "Role", route: "/admin/role" },
    { menuName: "Menus", route: "/admin/menus" },
];

async function seedMenus() {
    try {
        await db.sequelize.sync(); // Ensure tables are created
        for (const menu of initialMenus) {
            const exists = await db.Menu.findOne({ where: { menuName: menu.menuName } });
            if (!exists) {
                await db.Menu.create(menu);
                console.log(`Created menu: ${menu.menuName}`);
            }
        }
        console.log("Seeding completed successfully.");
        process.exit(0);
    } catch (err) {
        console.error("Seeding failed:", err);
        process.exit(1);
    }
}

seedMenus();
