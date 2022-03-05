module.exports = (sequelize, dataTypes) => {
  const Catagory = sequelize.define("Catagory", {
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
    image: {
      type: dataTypes.STRING,
      allowNull: false,
    },
  });
  Catagory.associate = (models) => {
    Catagory.hasMany(models.Company, {
      foreignKey: {
        name: "catagoryId",
        // allowNull: false,
      },
      onDelete: "cascade",
    });
    Catagory.hasMany(models.TempCompanyFile, {
      foreignKey: {
        name: "catagoryId",
        allowNull: false,
      },
      onDelete: "cascade",
    });
    Catagory.hasMany(models.Catagory, {
      as: "children",
      foreignKey: "parentId",
      onDelete: "cascade",
    });
    Catagory.belongsTo(models.Catagory, {
      as: "parent",
      foreignKey: "parentId",
      onDelete: "cascade",
    });
  };
  return Catagory;
}; 
