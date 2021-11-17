module.exports=(sequelize,dataTypes)=>{
    const Fax = sequelize.define("Fax", {
      Id: {
        type: dataTypes.UUID,
        defaultValue: dataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      fax:{
          type:dataTypes.STRING,
          allowNull:false
      }
    });
    Fax.associate = (models) => {
      Fax.belongsTo(models.Company, {
        foreignKey: {
          name: "companyId",
          allowNull: false,
        },
        onDelete: "cascade",
      });
    };
    return Fax

}