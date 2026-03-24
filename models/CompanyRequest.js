module.exports = (sequelize, dataTypes) => {
    const CompanyRequest = sequelize.define("CompanyRequest", {
        Id: {
            type: dataTypes.UUID,
            defaultValue: dataTypes.UUIDV4,
            allowNull: false,
            primaryKey: true,
        },
        // Company Info
        name: {
            type: dataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: dataTypes.TEXT,
            allowNull: true,
        },
        email: {
            type: dataTypes.STRING,
            allowNull: true,
        },
        password: {
            type: dataTypes.STRING,
            allowNull: true,
        },
        web: {
            type: dataTypes.STRING,
            allowNull: true,
        },
        catagoryId: {
            type: dataTypes.STRING,
            allowNull: true,
        },
        logo: {
            type: dataTypes.STRING,
            allowNull: true,
        },
        licence: {
            type: dataTypes.STRING,
            allowNull: true,
        },
        slug: {
            type: dataTypes.STRING,
            allowNull: true,
        },

        // Address Details
        city: {
            type: dataTypes.STRING,
            allowNull: true,
        },
        state: {
            type: dataTypes.STRING,
            allowNull: true,
        },
        street: {
            type: dataTypes.STRING,
            allowNull: true,
        },
        kebele: {
            type: dataTypes.STRING,
            allowNull: true,
        },
        woreda: {
            type: dataTypes.STRING,
            allowNull: true,
        },
        subCity: {
            type: dataTypes.STRING,
            allowNull: true,
        },
        pobox: {
            type: dataTypes.STRING,
            allowNull: true,
        },

        // Contact Details
        phone: {
            type: dataTypes.STRING,
            allowNull: true,
        },
        officePhone: {
            type: dataTypes.STRING,
            allowNull: true,
        },
        fax: {
            type: dataTypes.STRING,
            allowNull: true,
        },

        approved: {
            type: dataTypes.BOOLEAN,
            defaultValue: false,
        },
        status: {
            type: dataTypes.STRING,
            defaultValue: "pending", // pending, approved, rejected
        }
    }, {
        tableName: "companyRequests"
    });

    CompanyRequest.associate = (models) => {
        CompanyRequest.belongsTo(models.Catagory, {
            foreignKey: "catagoryId",
        });
    };

    return CompanyRequest;
};
