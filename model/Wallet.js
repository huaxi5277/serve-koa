//Wallet 模型 
const Sequelize = require('sequelize') 
const sequelize = require('../db')
const Wallet = sequelize.define('wallet' , {
    id : {
        type : Sequelize.INTEGER,
        autoIncrement : true , 
        allowNull : false,
        primaryKey : true 
    },
    money : Sequelize.STRING,
    way : Sequelize.INTEGER,
})

module.exports = Wallet