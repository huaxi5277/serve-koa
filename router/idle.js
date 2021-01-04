const Router = require('koa-router')
const router = new Router() 
const entryPassword = require('../utils/entrypassword')
const jwt = require('jsonwebtoken')
const jwtAuth = require('koa-jwt')
const salt = 'huaxi!*aa'
const secret = 'its a secret '
// 引入数据库模型
const User = require('../model/User')

router.prefix('/api/idle')
router.get('/test' , jwtAuth({
     secret
}) ,  async(ctx , next)=>{
     console.log(ctx.state)
     ctx.body = 'hello idle'
})

router.post('/login' , async (ctx)=>{
   const {username , password , email} = ctx.request.body
   let resp = await User.findOne({email})
   if(!resp) {
        ctx.status = 200 
        ctx.body = {
             data : {
                  message : '未找到用户，请先注册'
             }
        }
   } else {
        // 进行登陆 派发token 前端保存
        let ret = resp.get()
        let compare = entryPassword(salt + password) 
        if(compare == ret.password) {
            ctx.status = 200 
            ctx.body = {
                 id : entryPassword(salt + ret.id),
                 user : username,
                 avator : ret.avator,
                 email : ret.email,
                 token : jwt.sign({
                      data : username,
                      email : ret.email,
                      exp : Math.floor(Date.now() / 1000) + 60 * 60 
                 },
               secret
                 )
            }
        } else {
          ctx.status = 200 
          ctx.body = {
               data : {
                    message : '密码错误'
               }
          }
        }
   }
})

// 注册 
router.post('/register' , async (ctx)=>{
     const {username , password , email} = ctx.request.body
     let resp = await User.findOne({email})
     if(!resp) {
          await User.create({
          username , 
          password : entryPassword(salt + password),
          email,
          salt
     })
      resp = await User.findOne({email})
      ctx.status = 200 
      ctx.body = {
           data : {
                message : '注册成功'
           }
      }
     } else {
          ctx.status = 200 
          ctx.body = {
               data : {
                    message : '用户已存在'
               }
          } 
     }

  })




module.exports = router