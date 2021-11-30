module.exports = (sequelize, dataTypes) => {
  const Ad = sequelize.define("Ad", {
    Id: {
      type: dataTypes.UUID,
      defaultValue: dataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    adSpace: {
      type: dataTypes.STRING,
      allowNull: false,
    },
    imageURI: {
      type: dataTypes.STRING,
      allowNull: false,
    },
  });
  // Ad.associate = (models) => {
  //   Ad.hasMany(models.AdImage, {
  //     foreignKey: {
  //       name: "adId",
  //       allowNull: false,
  //     },
  //     onDelete: "cascade",
  //   });
  // };
  return Ad;
};
