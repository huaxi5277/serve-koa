//Publish 模型 
const Sequelize = require('sequelize') 
const sequelize = require('../db')
const Address = sequelize.define('address' , {
    id : {
        type : Sequelize.INTEGER,
        autoIncrement : true , 
        allowNull : false,
        primaryKey : true 
    },
    name : Sequelize.STRING,
    phone : Sequelize.STRING ,
    region : Sequelize.STRING ,
    isDefault : Sequelize.BOOLEAN ,
    detailed : Sequelize.STRING,
    llid : Sequelize.STRING,
})

module.exports = Address