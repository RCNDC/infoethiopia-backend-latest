module.exports = (sequelize, dataTypes) => {
    const ApprovedCompanyNews = sequelize.define("ApprovedCompanyNews", {
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
        Approved: {
            type: dataTypes.TINYINT(1),
            defaultValue: 1,
            field: "Approved",
        },
        companyId: {
            type: dataTypes.CHAR(255),
            allowNull: true,
            field: "companyId",
        }
    }, {
        tableName: "ApprovedCompanyNews",
        timestamps: true,
    });

    ApprovedCompanyNews.associate = (models) => {
        ApprovedCompanyNews.belongsTo(models.Company, {
            foreignKey: {
                name: "companyId",
            },
            onDelete: "cascade",
        });
    };

    return ApprovedCompanyNews;
};
