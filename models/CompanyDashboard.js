module.exports = (sequelize, dataTypes) => {
    const CompanyDashboard = sequelize.define("CompanyDashboard", {
        Id: {
            type: dataTypes.CHAR(36),
            defaultValue: dataTypes.UUIDV4,
            allowNull: false,
            primaryKey: true,
        },
        name: {
            type: dataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: dataTypes.STRING(1000),
            allowNull: false,
            defaultValue: "",
        },
        email: {
            type: dataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        password: {
            type: dataTypes.STRING,
            allowNull: false,
        },
        logo: {
            type: dataTypes.STRING,
            allowNull: false,
            defaultValue: "",
        },
    }, {
        tableName: 'companyDashboard'
    });

    return CompanyDashboard;
};
