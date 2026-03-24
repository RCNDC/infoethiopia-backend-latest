module.exports = (sequelize, dataTypes) => {
    const CompaniesNews = sequelize.define("CompaniesNews", {
        Id: {
            type: dataTypes.UUID,
            defaultValue: dataTypes.UUIDV4,
            allowNull: false,
            primaryKey: true,
        },
        Body: {
            type: dataTypes.TEXT("long"),
            allowNull: false,
            field: "Body",
        },
        Title: {
            type: dataTypes.STRING,
            allowNull: false,
            field: "Title",
        },
        Author: {
            type: dataTypes.STRING,
            allowNull: false,
            field: "Author",
        },
        approved: {
            type: dataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: null,
            field: "approved",
        },
        status: {
            type: dataTypes.STRING,
            allowNull: true,
            defaultValue: "pending",
            field: "status",
        },
        companyID: {
            type: dataTypes.CHAR(36),
            allowNull: false,
            field: "companyID",
        }
    }, {
        tableName: "Companies News",
        timestamps: true,
    });

    CompaniesNews.associate = (models) => {
        CompaniesNews.belongsTo(models.Company, {
            foreignKey: {
                name: "companyID",
            },
            onDelete: "cascade",
        });
    };

    return CompaniesNews;
};
