module.exports = (sequelize, dataTypes) => {
  const User = sequelize.define("User", {
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
    lastName: {
      type: dataTypes.STRING,
      allowNull: false,
    },
    middleName: {
      type: dataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: dataTypes.STRING,
      unique: true,
    },
    phone_no: {
      type: dataTypes.STRING,
      // unique: true,
    },
    activate: {
      type: dataTypes.BOOLEAN,
      defaultValue: false,
    },
    code: {
      type: dataTypes.INTEGER,
    },
    password: {
      type: dataTypes.STRING,
      allowNull: false,
    },
    profilePicture: {
      type: dataTypes.STRING,
    },
  });

  return User;
};
