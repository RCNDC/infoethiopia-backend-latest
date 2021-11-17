module.exports = (sequelize, dataTypes) => {
  const News = sequelize.define("News", {
    Id: {
      type: dataTypes.UUID,
      defaultValue: dataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    body: {
      type: dataTypes.TEXT("long"),
      allowNull: false,
    },
    title: {
      type: dataTypes.STRING,
      allowNull: false,
    },
    headingImage: {
      type: dataTypes.STRING,
      allowNull: false,
    },
    author: {
      type: dataTypes.STRING,
      allowNull: false,
    },
  });
  return News;
};
