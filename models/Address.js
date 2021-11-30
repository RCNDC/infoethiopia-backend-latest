module.exports = (sequelize, dataTypes) => {
  const Address = sequelize.define("Address", {
    Id: {
      type: dataTypes.UUID,
      defaultValue: dataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
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
  Address.associate = (models) => {
    Address.belongsTo(models.Company, {
      foreignKey: {
        name: "companyId",
        allowNull: false,
      },
      onDelete: "cascade",
    });
  };
  return Address;
};
