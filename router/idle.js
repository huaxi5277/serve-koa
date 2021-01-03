const Router = require('koa-router')
const router = new Router() 

// 引入数据库模型
const User = require('../model/User')

router.prefix('/api/idle')
router.get('/test' , async(ctx , next)=>{
     ctx.body = 'hello idle'
})

router.post('/login' , async (ctx)=>{
     console.log(ctx)
//    const {username , password} = ctx.body
//    ctx.body = {
//         username,
//         password
//    }
})


module.exports = router