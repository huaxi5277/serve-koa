//Publish 模型 
const Sequelize = require('sequelize') 
const sequelize = require('../db')
const Publish = sequelize.define('publish' , {
    id : {
        type : Sequelize.INTEGER,
        autoIncrement : true , 
        allowNull : false,
        primaryKey : true 
    },
    price : Sequelize.STRING,
    content : {
        type : Sequelize.STRING,
        allowNull : false,
        defaultValue : ''
    },
    images1 : Sequelize.STRING ,
    images2 : Sequelize.STRING ,
    images3 : Sequelize.STRING ,
    itemity : Sequelize.INTEGER,
    name : Sequelize.STRING,
})

module.exports = Publish