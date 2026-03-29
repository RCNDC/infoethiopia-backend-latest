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
        currentCompany: {
            type: dataTypes.STRING,
            allowNull: true,
            field: "currentCompany",
        },
        employmentType: {
            type: dataTypes.STRING(30),
            allowNull: true,
            field: "employmentType",
        },
        workCountry: {
            type: dataTypes.STRING(120),
            allowNull: true,
            field: "workCountry",
        },
        workCity: {
            type: dataTypes.STRING(120),
            allowNull: true,
            field: "workCity",
        },
        workMode: {
            type: dataTypes.STRING(30),
            allowNull: true,
            field: "workMode",
        },
        workPeriod: {
            type: dataTypes.STRING(255),
            allowNull: true,
            field: "workPeriod",
        },
        roleTitle: {
            type: dataTypes.STRING(255),
            allowNull: true,
            field: "roleTitle",
        },
        education: {
            type: dataTypes.TEXT("long"),
            allowNull: true,
            field: "education",
        },
        licensesAndCertifications: {
            type: dataTypes.TEXT("long"),
            allowNull: true,
            field: "licensesAndCertifications",
        },
        skills: {
            type: dataTypes.TEXT("long"),
            allowNull: true,
            field: "skills",
        },
        applicationStatus: {
            type: dataTypes.STRING(30),
            allowNull: false,
            defaultValue: "submitted",
            field: "applicationStatus",
        },
        reviewedAt: {
            type: dataTypes.DATE,
            allowNull: true,
            field: "reviewedAt",
        },
        statusUpdatedAt: {
            type: dataTypes.DATE,
            allowNull: true,
            field: "statusUpdatedAt",
        },
        companyMessage: {
            type: dataTypes.TEXT("long"),
            allowNull: true,
            field: "companyMessage",
        },
        lastEmailSubject: {
            type: dataTypes.STRING(255),
            allowNull: true,
            field: "lastEmailSubject",
        },
        lastEmailSentAt: {
            type: dataTypes.DATE,
            allowNull: true,
            field: "lastEmailSentAt",
        },
        archivedAt: {
            type: dataTypes.DATE,
            allowNull: true,
            field: "archivedAt",
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
            {
                fields: ["applicationStatus"],
            },
            {
                fields: ["archivedAt"],
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
