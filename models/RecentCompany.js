module.exports = (sequelize, dataTypes) => {
  const RecentCompany = sequelize.define("RecentCompany", {
    Id: {
      type: dataTypes.UUID,
      defaultValue: dataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
  });
  RecentCompany.associate = (models) => {
    RecentCompany.belongsTo(models.Company, {
      foreignKey: {
        name: "companyId",
        allowNull: false,
      },
      onDelete: "cascade",
    });
    RecentCompany.associate = (models) => {
      RecentCompany.belongsTo(models.Staff, {
        foreignKey: {
          name: "callCenterId",
          allowNull: false,
        },
        onDelete: "cascade",
      });
    };
  };

  return RecentCompany;
};
