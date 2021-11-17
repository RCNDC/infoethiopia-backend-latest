module.exports = (sequelize, dataTypes) => {
  const SocialMedia = sequelize.define("SocialMedia", {
    Id: {
      type: dataTypes.UUID,
      defaultValue: dataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    social_media: {
      type: dataTypes.STRING,
      allowNull: false,
    },
  });
  SocialMedia.associate = (models) => {
    SocialMedia.belongsTo(models.Company, {
      foreignKey: {
        name: "companyId",
        allowNull: false,
      },
      onDelete: "cascade",
    });
  };
  return SocialMedia;
};
