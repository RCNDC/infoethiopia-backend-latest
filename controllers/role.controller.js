const db = require("../models");

exports.getAllRoles = async (req, res) => {
    try {
        const roles = await db.Role.findAll();
        return res.status(200).json({ message: "Fetched roles successful", data: roles });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ err: "Something went wrong." });
    }
};

exports.createRole = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ err: "Role name is required" });

        const roleExists = await db.Role.findOne({ where: { name } });
        if (roleExists) return res.status(400).json({ err: "Role already exists" });

        const newRole = await db.Role.create({ name });
        return res.status(201).json({ message: "Role created successfully", data: newRole });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ err: "Error creating role" });
    }
};

exports.editRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        const role = await db.Role.findByPk(id);
        if (!role) return res.status(404).json({ err: "Role not found" });

        await role.update({ name });
        return res.status(200).json({ message: "Role updated successfully", data: role });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ err: "Error updating role" });
    }
};

exports.deleteRole = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if any staff member is using this role
        const staffCount = await db.Staff.count({ where: { roleId: id } });
        if (staffCount > 0) {
            return res.status(400).json({ err: "Cannot delete role while it is assigned to staff." });
        }

        const role = await db.Role.findByPk(id);
        if (!role) return res.status(404).json({ err: "Role not found" });

        await role.destroy();
        return res.status(200).json({ message: "Role deleted successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ err: "Error deleting role" });
    }
};
