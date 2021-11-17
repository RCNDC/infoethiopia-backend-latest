module.exports = (sequelize, dataTypes) => {
  const OfficeNumber = sequelize.define("OfficeNumber", {
    Id: {
      type: dataTypes.UUID,
      defaultValue: dataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    office_no: {
      type: dataTypes.STRING,
      allowNull: false,
    },
  });
  OfficeNumber.associate = (models) => {
    OfficeNumber.belongsTo(models.Company, {
      foreignKey: {
        name: "companyId",
        allowNull: false,
      },
      onDelete: "cascade",
    });
  };
  return OfficeNumber;
};
