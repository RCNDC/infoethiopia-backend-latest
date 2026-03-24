module.exports = (sequelize, dataTypes) => {
    const JobPost = sequelize.define("JobPost", {
        Id: {
            type: dataTypes.UUID,
            defaultValue: dataTypes.UUIDV4,
            allowNull: false,
            primaryKey: true,
        },
        Body: {
            type: dataTypes.TEXT("long"),
            field: "Body",
        },
        Title: {
            type: dataTypes.STRING,
            field: "Title",
        },
        Author: {
            type: dataTypes.STRING,
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
        companyId: {
            type: dataTypes.UUID,
            field: "companyId",
        }
    }, {
        tableName: "Job Post",
        timestamps: true,
    });
    JobPost.associate = (models) => {
        JobPost.belongsTo(models.Company, {
            foreignKey: {
                name: "companyId",
            },
            onDelete: "cascade",
        });
        JobPost.hasMany(models.JobApplicant, {
            foreignKey: {
                name: "jobPostId",
                allowNull: false,
            },
            onDelete: "cascade",
        });
    };
    return JobPost;
};
