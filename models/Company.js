module.exports = (sequelize, dataTypes) => {
  const Company = sequelize.define("Company", {
    Id: {
      type: dataTypes.UUID,
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
      // allowNull: false,
    },
    logo: {
      type: dataTypes.STRING,
      // allowNull: false,
    },
    licence: {
      type: dataTypes.STRING,
      // allowNull: false,
    },
    web: {
      type: dataTypes.STRING,
    },
    email: {
      type: dataTypes.STRING,
    },
    approved: {
      type: dataTypes.BOOLEAN,
      defaultValue: true,
    },
    slug: {
      type: dataTypes.STRING,
      allowNull: true,
    },
  });
  Company.associate = (models) => {
    Company.hasMany(models.Fax, {
      foreignKey: {
        name: "companyId",
        allowNull: false,
      },
      onDelete: "cascade",
    });
    Company.hasOne(models.Address, {
      foreignKey: {
        name: "companyId",
        allowNull: false,
      },
      onDelete: "cascade",
    });
    Company.hasMany(models.Service, {
      foreignKey: {
        name: "companyId",
        allowNull: false,
      },
      onDelete: "cascade",
    });
    Company.hasMany(models.PhoneNumber, {
      foreignKey: {
        name: "companyId",
        allowNull: false,
      },
      onDelete: "cascade",
    });
    Company.hasMany(models.OfficeNumber, {
      foreignKey: {
        name: "companyId",
        allowNull: false,
      },
      onDelete: "cascade",
    });
    Company.hasMany(models.SocialMedia, {
      foreignKey: {
        name: "companyId",
        allowNull: false,
      },
      onDelete: "cascade",
    });
    Company.hasMany(models.TempCompanyFile, {
      foreignKey: {
        name: "companyId",
        allowNull: false,
      },
      onDelete: "cascade",
    });
    Company.hasMany(models.CompanyImage, {
      foreignKey: {
        name: "companyId",
        allowNull: false,
      },
      onDelete: "cascade",
    });
    Company.hasMany(models.News, {
      foreignKey: {
        name: "companyId",
        // allowNull: false,
      },
      onDelete: "cascade",
    });
    Company.hasOne(models.RecentCompany, {
      foreignKey: {
        name: "companyId",
        allowNull: false,
      },
      onDelete: "cascade",
    });
    Company.belongsTo(models.Catagory, {
      foreignKey: {
        name: "catagoryId",
        // allowNull: false,
      },
      onDelete: "cascade",
    });
  };
  return Company;
};
