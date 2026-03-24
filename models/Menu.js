module.exports = (sequelize, dataTypes) => {
    const Menu = sequelize.define("Menu", {
        id: {
            type: dataTypes.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true,
        },
        menuName: {
            type: dataTypes.STRING,
            allowNull: false,
        },
        route: {
            type: dataTypes.STRING,
            allowNull: true,
        },
        parent: {
            type: dataTypes.INTEGER,
            defaultValue: 0,
            allowNull: false,
        },
    }, {
        tableName: "Menus"
    });

    Menu.associate = (models) => {
        Menu.hasMany(models.RoleMenu, {
            foreignKey: "menuId",
        });
    };

    return Menu;
};
