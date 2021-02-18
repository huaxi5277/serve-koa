//User 模型 

const Sequelize = require('sequelize') 
const sequelize = require('../db')
const User = sequelize.define('user' , {
    id : {
        type : Sequelize.INTEGER,
        autoIncrement : true , 
        allowNull : false,
        primaryKey : true 
    },
    username : Sequelize.STRING,
    email : Sequelize.STRING,
    password : Sequelize.STRING,
    salt : {
        type : Sequelize.STRING,
    },
    avator : {
        type : Sequelize.STRING,
        defaultValue : 'http://150.158.157.98:3000/public/avater.png'
    }
})

module.exports = User