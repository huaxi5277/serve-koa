//Publish 模型 
const Sequelize = require('sequelize') 
const sequelize = require('../db')
const Chat = sequelize.define('chat' , {
    id : {
        type : Sequelize.INTEGER,
        autoIncrement : true , 
        allowNull : false,
        primaryKey : true 
    },
    msg : Sequelize.STRING,
    type : Sequelize.STRING ,
    time : Sequelize.STRING ,
    face : Sequelize.STRING ,
    user_name : Sequelize.STRING,
    friend_name : Sequelize.STRING,
    uid : Sequelize.INTEGER,
    isChat : Sequelize.INTEGER,
})

module.exports = Chat