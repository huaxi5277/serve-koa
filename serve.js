const koa = require('koa')
const static = require('koa-static')
const bodyParser = require('koa-bodyparser')
const registerRouter = require('./router')
const sequelize = require('./db')
const app = new koa()


app.use(static(__dirname + '/'))     // 使用静态文件
app.use(bodyParser())




app.use(registerRouter())
app.listen(3000 , ()=>{
    console.log('server is listening')
})



