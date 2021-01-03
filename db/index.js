const Sequelize = require('sequelize') 
const env = require('dotenv')

const conf = require('./config')

env.config()
const sequelize = new Sequelize(conf.database , conf.username , conf.password , {
    host : conf.host,
    dialect : 'mysql',
    operatorsAliases : false
})


module.exports = sequelize