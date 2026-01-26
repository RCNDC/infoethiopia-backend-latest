module.exports = (sequelize, dataTypes) => {
    const ApprovedJob = sequelize.define("ApprovedJob", {
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
            type: dataTypes.INTEGER,
            defaultValue: 1,
        },
        companyId: {
            type: dataTypes.UUID,
            field: "companyId",
        }
    }, {
        tableName: "Approved Job",
        timestamps: true,
    });
    ApprovedJob.associate = (models) => {
        ApprovedJob.belongsTo(models.Company, {
            foreignKey: {
                name: "companyId",
            },
            onDelete: "cascade",
        });
    };
    return ApprovedJob;
};
