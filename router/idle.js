const Router = require('koa-router')
const router = new Router() 
const entryPassword = require('../utils/entrypassword')
const jwt = require('jsonwebtoken')
const jwtAuth = require('koa-jwt')
const jwtDecode = require('jwt-decode')
const salt = 'huaxi!*aa'
const secret = 'its a secret '
// 引入数据库模型
const User = require('../model/User')

router.prefix('/idle')
router.get('/test' , jwtAuth({
     secret
}) ,  async(ctx , next)=>{
     console.log(ctx.state)
     ctx.body = 'hello idle'
})

router.post('/login' , async (ctx)=>{
   const {username , password , email} = ctx.request.body
   let resp = await User.findOne({where : {email : email , username  : username}})
   if(!resp) {
        ctx.status = 200 
        ctx.body = {
          code : 404 , 
          message : '未找到用户，请先注册'
        }
   } else {
        // 进行登陆 派发token 前端保存
        let ret = resp.get()
        let compare = entryPassword(salt + password) 
        if(compare == ret.password) {
            ctx.status = 200 
            ctx.body = {
                 code  : 200 , 
                 message : '登陆成功',
                 id : entryPassword(salt + ret.id),
                 user : username,
                 avator : ret.avator,
                 email : ret.email,
                 token : jwt.sign({
                      data : username,
                      email : ret.email,
                      avator : ret.avator,
                      exp : Math.floor(Date.now() / 1000) + 60 * 60 
                 },
               secret
                 )
            }
        } else {
          ctx.status = 200 
          ctx.body = {
               code  : 400,
               message : '密码错误'
          }
        }
   }
})

// 注册 
router.post('/register' , async (ctx)=>{
     const {username , password , email} = ctx.request.body
     console.log(email)
     let resp = await User.findOne({where : {email : email}})
     if(!resp) {
          await User.create({
          username , 
          password : entryPassword(salt + password),
          email,
          salt
     })
      resp = await User.findOne({where : {email : email}})
      ctx.status = 200 
      ctx.body = {
           code : 200 ,
          message : '注册成功'
      }
     } else {
          ctx.status = 200 
          ctx.body = {
               code  : 500,
               message : '用户已存在'
          } 
     }

  })



  // 登陆成功之后 用token 来获取当前的用户信息
   router.get('/current' , jwtAuth({secret}) , async (ctx)=>{
        ctx.body = {
             ...ctx.state.user
        }
   })

module.exports = router