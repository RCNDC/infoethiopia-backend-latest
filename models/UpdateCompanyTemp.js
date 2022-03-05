module.exports = (sequelize, dataTypes) => {
  const TempCompanyFile = sequelize.define("TempCompanyFile", {
    Id: {
      type: dataTypes.UUID,
      defaultValue: dataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    name: {
      type: dataTypes.STRING,
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
      allowNull: false,
    },
    web: {
      type: dataTypes.STRING,
    },
    email: {
      type: dataTypes.STRING,
    },
    
    city: {
      type: dataTypes.STRING,
      // allowNull: false,
    },
    wereda: {
      type: dataTypes.STRING,
      // allowNull: false,
    },
    kebele: {
      type: dataTypes.STRING,
    },
    street_no: {
      type: dataTypes.STRING,
    },
    sub_city: {
      type: dataTypes.STRING,
    },
    state: {
      type: dataTypes.STRING,
    },
    location: {
      type: dataTypes.GEOMETRY("POINT"),
      // allowNull: false,
    },
    pobox: {
      type: dataTypes.STRING,
    },
    
  });
  TempCompanyFile.associate = (models) => {
    TempCompanyFile.belongsTo(models.Catagory, {
      foreignKey: {
        name: "catagoryId",
        allowNull: false,
      },
      onDelete: "cascade",
    });
    TempCompanyFile.belongsTo(models.Company, {
      foreignKey: {
        name: "companyId",
        allowNull: false,
      },
      onDelete: "cascade",
    });
  };
  return TempCompanyFile;
};
