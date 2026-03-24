module.exports = (sequelize, dataTypes) => {
    const RoleMenu = sequelize.define("RoleMenu", {
        id: {
            type: dataTypes.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true,
        },
        roleId: {
            type: dataTypes.INTEGER,
            allowNull: false,
        },
        menuId: {
            type: dataTypes.INTEGER,
            allowNull: false,
        },
        createdBy: {
            type: dataTypes.STRING,
            allowNull: true,
        },
        updatedBy: {
            type: dataTypes.STRING,
            allowNull: true,
        },
    }, {
        tableName: "RoleMenus"
    });

    RoleMenu.associate = (models) => {
        RoleMenu.belongsTo(models.Role, {
            foreignKey: "roleId",
        });
        RoleMenu.belongsTo(models.Menu, {
            foreignKey: "menuId",
        });
    };

    return RoleMenu;
};
