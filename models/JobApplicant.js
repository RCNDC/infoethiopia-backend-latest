module.exports = (sequelize, dataTypes) => {
    const JobApplicant = sequelize.define("JobApplicant", {
        Id: {
            type: dataTypes.UUID,
            defaultValue: dataTypes.UUIDV4,
            allowNull: false,
            primaryKey: true,
        },
        fullName: {
            type: dataTypes.STRING,
            allowNull: false,
            field: "fullName",
        },
        email: {
            type: dataTypes.STRING,
            allowNull: false,
            field: "email",
        },
        phone: {
            type: dataTypes.STRING(30),
            allowNull: true,
            field: "phone",
        },
        cvLink: {
            type: dataTypes.STRING(1000),
            allowNull: true,
            field: "cvLink",
        },
        cvFileId: {
            type: dataTypes.STRING(255),
            allowNull: true,
            field: "cvFileId",
        },
        cvMessageId: {
            type: dataTypes.STRING(255),
            allowNull: true,
            field: "cvMessageId",
        },
        jobPostId: {
            type: dataTypes.UUID,
            allowNull: false,
            field: "jobPostId",
        },
    }, {
        tableName: "Job Applicants",
        timestamps: true,
        indexes: [
            {
                fields: ["jobPostId"],
            },
            {
                unique: true,
                fields: ["jobPostId", "email"],
            },
        ],
    });

    JobApplicant.associate = (models) => {
        JobApplicant.belongsTo(models.JobPost, {
            foreignKey: {
                name: "jobPostId",
                allowNull: false,
            },
            onDelete: "cascade",
        });
    };

    return JobApplicant;
};
