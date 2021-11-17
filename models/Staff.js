module.exports = (sequelize, dataTypes) => {
  const Staff = sequelize.define("Staff", {
    Id: {
      type: dataTypes.UUID,
      defaultValue: dataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    firstName: {
      type: dataTypes.STRING,
      allowNull: false,
    },
    middleName: {
      type: dataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: dataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: dataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: dataTypes.STRING,
      allowNull: false,
    },
    city: {
      type: dataTypes.STRING,
      allowNull: false,
    },
    wereda: {
      type: dataTypes.STRING,
      allowNull: false,
    },
    subCity: {
      type: dataTypes.STRING,
      allowNull: false,
    },
    username: {
      type: dataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    password: {
      type: dataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: dataTypes.INTEGER,
      allowNull: false,
    },
  });
  Staff.associate = (models) => {
    Staff.hasMany(models.RecentCompany, {
      foreignKey: {
        name: "callCenterId",
        allowNull: false,
      },
      onDelete: "cascade",
    });
  };
  return Staff;
};
