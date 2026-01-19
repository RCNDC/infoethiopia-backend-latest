module.exports = (sequelize, dataTypes) => {
    const JobPost = sequelize.define("JobPost", {
        Id: {
            type: dataTypes.UUID,
            defaultValue: dataTypes.UUIDV4,
            allowNull: false,
            primaryKey: true,
        },
        body: {
            type: dataTypes.TEXT("long"),
            allowNull: false,
        },
        title: {
            type: dataTypes.STRING,
            allowNull: false,
        },
        headingImage: {
            type: dataTypes.STRING,
            allowNull: false,
        },
        author: {
            type: dataTypes.STRING,
            allowNull: false,
        },
        licence: {
            type: dataTypes.STRING,
        },
        approved: {
            type: dataTypes.BOOLEAN,
            defaultValue: true,
        },
    });
    JobPost.associate = (models) => {
        JobPost.belongsTo(models.Company, {
            foreignKey: {
                name: "companyId",
                // allowNull: false,
            },
            onDelete: "cascade",
        });
    };
    return JobPost;
};
