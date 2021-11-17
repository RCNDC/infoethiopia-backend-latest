module.exports=(sequelize,dataTypes)=>{
    const PhoneNumber = sequelize.define("PhoneNumber", {
      Id: {
        type: dataTypes.UUID,
        defaultValue: dataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      phone_no:{
          type:dataTypes.STRING,
          allowNull:false
      }
    });
     PhoneNumber.associate = (models) => {
       PhoneNumber.belongsTo(models.Company, {
         foreignKey: {
           name: "companyId",
           allowNull: false,
         },
         onDelete: "cascade",
       });
     };
    return PhoneNumber
}