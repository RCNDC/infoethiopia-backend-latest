module.exports = (sequelize, dataTypes) => {
    const PasswordResetCode = sequelize.define("PasswordResetCode", {
        Id: {
            type: dataTypes.UUID,
            defaultValue: dataTypes.UUIDV4,
            allowNull: false,
            primaryKey: true,
        },
        email: {
            type: dataTypes.STRING,
            allowNull: false,
        },
        code: {
            type: dataTypes.STRING,
            allowNull: false,
        },
        expiresAt: {
            type: dataTypes.DATE,
            allowNull: false,
        },
        used: {
            type: dataTypes.BOOLEAN,
            defaultValue: false,
        },
    }, {
        tableName: "PasswordResetCodes",
        timestamps: true,
    });

    return PasswordResetCode;
};
