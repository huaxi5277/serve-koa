//Order 模型 
const Sequelize = require('sequelize') 
const sequelize = require('../db')
const Order = sequelize.define('order' , {
    id : {
        type : Sequelize.INTEGER,
        autoIncrement : true , 
        allowNull : false,
        primaryKey : true 
    },
    isPay : Sequelize.BOOLEAN,
    way : Sequelize.INTEGER,
    ORDERUUID :  Sequelize.INTEGER,
    price : Sequelize.STRING,
    content : {
        type : Sequelize.STRING,
        allowNull : false,
        defaultValue : ''
    },
    itemity : Sequelize.INTEGER,
    phone : Sequelize.STRING,
    address : Sequelize.STRING,
    who : Sequelize.STRING,
    image : Sequelize.STRING,
})

module.exports = Order