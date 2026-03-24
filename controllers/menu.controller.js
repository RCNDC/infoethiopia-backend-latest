const db = require("../models");

exports.addMenu = async (req, res) => {
    try {
        const { menuName, route, parent } = req.body;
        const newMenu = await db.Menu.create({
            menuName,
            route,
            parent: parent || 0,
        });
        return res.status(201).json({ message: "Menu created successfully", data: newMenu });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ err: "Error creating menu" });
    }
};

exports.getAllMenus = async (req, res) => {
    try {
        const menus = await db.Menu.findAll();
        return res.status(200).json({ message: "Menus fetched successfully", data: menus });
    } catch (error) {
        return res.status(500).json({ err: "Error fetching menus" });
    }
};

exports.assignMenuToRole = async (req, res) => {
    const { roleId, menuIds } = req.body; // menuIds is an array
    if (!roleId || !menuIds) return res.status(400).json({ err: "Missing roleId or menuIds" });

    try {
        // Delete existing assignments
        await db.RoleMenu.destroy({ where: { roleId } });

        // Create new assignments
        const assignments = menuIds.map(menuId => ({
            roleId,
            menuId,
        }));

        await db.RoleMenu.bulkCreate(assignments);
        return res.status(201).json({ message: "Menus assigned to role successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ err: "Error assigning menus" });
    }
};

exports.getRoleMenus = async (req, res) => {
    const { roleId } = req.params;
    try {
        const roleMenus = await db.RoleMenu.findAll({
            where: { roleId },
            include: [db.Menu],
        });
        // Return flat list of menus for this role
        const menus = roleMenus.map(rm => rm.Menu);
        return res.status(200).json({ message: "Role menus fetched successfully", data: menus });
    } catch (error) {
        return res.status(500).json({ err: "Error fetching role menus" });
    }
};
