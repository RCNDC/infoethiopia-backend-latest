module.exports=(sequelize,dataTypes)=>{
    const Service = sequelize.define("Service", {
      Id: {
        type: dataTypes.UUID,
        defaultValue: dataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      name:{
          type:dataTypes.STRING,
          allowNull:false
      }
    });
     Service.associate = (models) => {
       Service.belongsTo(models.Company, {
         foreignKey: {
           name: "companyId",
           allowNull: false,
         },
         onDelete: "cascade",
       });
     };
    return Service
}