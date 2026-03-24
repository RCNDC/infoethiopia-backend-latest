module.exports = (sequelize, dataTypes) => {
    const Role = sequelize.define("Role", {
        id: {
            type: dataTypes.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true,
        },
        name: {
            type: dataTypes.STRING,
            allowNull: false,
            unique: true,
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
        tableName: "Roles"
    });

    Role.associate = (models) => {
        Role.hasMany(models.Staff, {
            foreignKey: "roleId",
        });
        Role.hasMany(models.RoleMenu, {
            foreignKey: "roleId",
            onDelete: "CASCADE",
        });
    };

    return Role;
};
