module.exports=(sequelize,dataTypes)=>{
    const CompanyImage = sequelize.define("CompanyImage", {
      Id: {
        type: dataTypes.UUID,
        defaultValue: dataTypes.UUIDV4,
        primaryKey: true,
      },
      imageURI: {
        type: dataTypes.STRING,
      },
    });
    CompanyImage.associate = (models) => {
      CompanyImage.belongsTo(models.Company, {
        foreignKey: {
          name: "companyId",
          allowNull: false,
        },
        onDelete: "cascade",
      });
    };
    return CompanyImage;
}