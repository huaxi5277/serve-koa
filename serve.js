const koa = require('koa')
const static = require('koa-static')
const router = require('koa-router')()
const bodyParser = require('koa-bodyparser')
const registerRouter = require('./router')
const sequelize = require('./db')
const app = new koa()


app.use(static(__dirname + '/'))     // 使用静态文件
app.use(bodyParser())

// 请求拦截 

sequelize.sync().then(async ret=>{
    console.log('mysql serve is linstening')
}).catch(e=>{
    throw e 
})


router.post('/api' , async ctx=>{
    console.log(ctx.request)
})


app.use(registerRouter())
app.use(router.routes())
app.use(router.allowedMethods())
app.listen(3000 , ()=>{
    console.log('server is listening')
})



