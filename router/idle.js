const Router = require('koa-router')
const router = new Router() 
const entryPassword = require('../utils/entrypassword')
const jwt = require('jsonwebtoken')
const jwtAuth = require('koa-jwt')
const jwtDecode = require('jwt-decode')
const formidable = require('koa-formidable')
const path = require('path')
const file = path.join(__dirname , '../public/upload')
const salt = 'huaxi!*aa'
const secret = 'its a secret '
// 引入数据库模型
const User = require('../model/User')
const Publish = require('../model/Publish')
const Chat = require('../model/Chat')
const Address = require('../model/Address')
const Wallet = require('../model/Wallet')
const Order = require('../model/Order')
User.hasMany(Publish)   // Publish 中 有 User 的 Id 
Publish.belongsTo(User , {    // 删除 User 的 时候 Publish 也 自动删除 
     constraints : true,
     onDelete : 'CASCADE'
})

User.hasMany(Chat)   // Publish 中 有 User 的 Id 
Chat.belongsTo(User , {    // 删除 User 的 时候 Publish 也 自动删除 
     constraints : true,
     onDelete : 'CASCADE'
})
User.hasMany(Order,{
     as : 'Order', 
})   // Publish 中 有 User 的 Id 
Order.belongsTo(User , {   // 删除 User 的 时候 Publish 也 自动删除 
     constraints : true,
     onDelete : 'CASCADE'
})


User.hasMany(Address , {
     as : 'Address'
})   // Address 中 有 User 的 Id 
Address.belongsTo(User , {    // 删除 User 的 时候 Publish 也 自动删除 
     constraints : true,
     onDelete : 'CASCADE'
})


User.hasOne(Wallet)

Wallet.belongsTo(User , {
     constraints : true,
     onDelete : 'CASCADE'
})




const multer = require('koa-multer')
let storage = multer.diskStorage({
    //配置上传文件需要存放的位置
    destination:function(req,file,cb){
        cb(null,path.join(__dirname,'../public/upload'));
    },
    //配置文件名
    filename:function (req,file,cb) {
        let time = Date.now();
        cb(null, Date.now() + "-" + file.originalname);
    }
});
//创建一个multer对象用来处理文件上传
//multer 可以帮我们解析 content-type:mulipart/form-data这种方式提交的请求数据



var upload = multer({
    storage:storage
});

const fs = require('fs')
// 封装自己的创建文件夹函数 
const mkdirs = (path , callback)=>{
     fs.exists(path , (exists)=>{
         if(exists) {
             callback()
         } else {
             // 创建 文件夹 
             fs.mkdir(path , (err)=>{
                 if(err) {
                     throw err
                 }
                 callback()
             })
         }
     }) 
}

router.prefix('/idle')
router.get('/test' , async(ctx , next)=>{
     ctx.body = 'hello idle'
})

router.post('/login' , async (ctx)=>{
   const { password , email} = ctx.request.body
   let resp = await User.findOne({where : {email : email }})
   if(!resp) {
        ctx.status = 200 
        ctx.body = {
          code : 10404 , 
          message : '未找到用户，请先注册'
        }
   } else {
        // 进行登陆 派发token 前端保存
        let ret = resp.get()
        let compare = entryPassword(salt + password) 
        if(compare == ret.password) {
            ctx.status = 200 
            ctx.body = {
                 code  : 10200 , 
                 message : '登陆成功',
                 id : entryPassword(salt + ret.id),
                 avator : ret.avator,
                 email : ret.email,
                 username : ret.username,
                 token : jwt.sign({
                      data : ret.username,
                      email : ret.email,
                      exp : Math.floor(Date.now() / 1000) + 60 * 60 
                 },
               secret
                 )
            }
        } else {
          ctx.status = 200 
          ctx.body = {
               code  : 10400,
               message : '密码错误'
          }
        }
   }
})

// 注册 
router.post('/register' , async (ctx)=>{
     const {username , password , email} = ctx.request.body
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
           code : 10200 ,
          message : '注册成功'
      }
     } else {
          ctx.status = 200 
          ctx.body = {
               code  : 10500,
               message : '用户已存在'
          } 
     }

  })
  // 登陆成功之后 用token 来获取当前的用户信息
   router.get('/current' , jwtAuth({secret}) , async (ctx)=>{
        let user = await User.findOne({where : {
          email : ctx.state.user.email,
          username : ctx.state.user.data
     }})
     if(user.get()) {
          user = user.get()
        ctx.body = {
             ...ctx.state.user,
             avator : user.avator
        }
     } else {
          ctx.body = {} 
     }
   })
   // 修改密码
   router.post('/reviewpassword' , jwtAuth({
        secret 
   }) , async (ctx)=>{
        const {id , oldpassword , newpassword} = ctx.request.body 
        let user = await User.findOne({where : {
             email : ctx.state.user.email,
             username : ctx.state.user.data
        }})
        if(user) {
             user = user.get()
           let cropryId = entryPassword(salt + user.id)
           if(cropryId == id ) {
               if(entryPassword(salt + oldpassword) != user.password) {
                    let newpass = entryPassword(salt + newpassword) 
                    if(newpass == entryPassword(salt + oldpassword)) {
                         ctx.body = {
                              code : 10111 ,
                              message : '新密码与旧密码不能一致'
                         }
                    } else {
                         let res =   await User.update({
                              password : newpass  
                          } , {
                               where : {
                                    email : ctx.state.user.email,
                                    username : ctx.state.user.data 
                               }
                          })
                          if(res) {
                               ctx.body = {
                                    code : 11111 ,
                                    message : '修改成功'
                               }
                          } else {
                               ctx.body = {
                                    code : 10011 ,
                                    message : '更改失败,稍后再试'
                               } 
                          }
                    }
                   
               } else {
                    ctx.body = {
                         code : 10010 ,
                         message : '密码错误'
                    }
               }
           } else {
               ctx.body = {
                    code : 00000 ,
                    message : '非法操作'
               }
           }
        }

   })
   // 修改头像
   router.post('/reviewavator' , upload.single('avatar') ,jwtAuth({
        secret
   }) , async (ctx)=>{
    let user = await User.findOne({where : {
         email : ctx.state.user.email,
         username : ctx.state.user.data
    }})
    if(user) {
     user = user.get()
     let res =  await User.update({
          avator: "http://localhost:3000/public/" + ctx.req.file.filename
      } , {
           where : {
                email : ctx.state.user.email,
                username : ctx.state.user.data 
           }
      })
      if(res) {
           // 去修改
           ctx.body = {
                code : 11111 ,
                message : '修改成功',
                avator : "http://localhost:3000/public/" + ctx.req.file.filename
           }
      } else {
           ctx.body = {
                code : 10011 ,
                message : '更改失败,稍后再试'
           } 
      }
    } else {
         ctx.body = {
              message : "修改失败",
              code : 10500 
         }
    }
   })

   
   router.get('/', ctx => {
     ctx.body = `<html>
           <form action="/idle/userpublish" method="POST" enctype="multipart/form-data">
           <input type="text" name="title">
           <input type="file" name="image0" multiple maxlength="3">
           <input type="file" name="image1" multiple maxlength="3">
           <input type="file" name="image2" multiple maxlength="3">
           <input type="submit">
          </form>
      </html>`
})

let temp = []

// 用户上传
   router.post('/userpublish' ,  upload.single('images') ,jwtAuth({
     secret
}) , async (ctx)=>{
     if(ctx.req.body.status) {

          // 最后一张图片写入数据库
          // 先找到用户 
          let user = await User.findOne({where : {
               email : ctx.state.user.email,
               username : ctx.state.user.data
          }})
          await user.createPublish({
               price : ctx.req.body.price,
               content : ctx.req.body.content,
               images1 : temp[0],
               images2 : temp[1],
               images3 : "http://localhost:3000/public/upload/" + ctx.req.file.filename,
               itemity :  ctx.req.body.itemity,
               name : ctx.state.user.data,
               isSell : ctx.req.body.isSell
          })
          temp = [] 
          ctx.body = {
               serverStatus : 10200,
               code : 11111,
               msg : '上传成功'
          }
     } else {
         temp.push("http://localhost:3000/public/upload/" + ctx.req.file.filename)
         ctx.body = {
          continue : true 
         } 
     }
})

// router.post('/userpublish' , async (ctx)=>{
//      const {request} = ctx 
//      let form = formidable.parse(request) 
//      function formImage() {
//          return new Promise((resolve , reject)=>{
//              form((opt , {fields , files})=>{
//                  console.log(files['images'])
//                  let filename = files['images'].name;
//                  let uploadDir = 'public/upload/';
//                   let avatarName = Date.now() + '_' + filename;
//                   mkdirs(file, function() {
//                       let readStream = fs.createReadStream(files['images']._writeStream)
//                       let writeStream = fs.createWriteStream(uploadDir + avatarName);
//                       readStream.pipe(writeStream);
//                       resolve('http://localhost:3000' + '/' + uploadDir + avatarName)
//                       // http://localhost:6001/public/upload/1513523744257_WX20171205-150757.png
//                  })
//              })
//          })
//      }
//      let url = await formImage()
//      ctx.body = {
//          url
//      }
//  })

// 获取全部商品 
// , jwtAuth({secret})  
router.get('/allproduction' , jwtAuth({secret})  ,   async (ctx)=>{
     let id = ctx.request.query.id
     let publish = await  Publish.findAll({where : {
          isSell : 0
     }})
     let len = publish.length
       publish = await  Publish.findAll({ where : {isSell : 0 } ,   offset: parseInt(id),limit: 2})
      ctx.body = {
          publish,
          len
      } 
})

router.get('/allproductionFifty' , jwtAuth({secret})  ,   async (ctx)=>{
     let id = ctx.request.query.id
     let publish = await  Publish.findAll()
     let len = publish.length
       publish = await  Publish.findAll({offset: parseInt(id),limit: 5})
      ctx.body = {
          publish,
          len
      }
     
})

//  根据商品分类获取商品 
// , jwtAuth({secret})  
router.get('/classifyproduction' , jwtAuth({secret})  ,   async (ctx)=>{
     let id = ctx.request.query.id
     let primaryKey = ctx.request.query.primaryKey
     let publish = await  Publish.findAll({
          where : {
               itemity : primaryKey
          }
     })
     let len = publish.length
       publish = await  Publish.findAll({
            where : {
               itemity : primaryKey
            }
       },  {offset: parseInt(id),limit: 2})
      ctx.body = {
          publish,
          len
      }
     
})
//  根据商品id获取商品 
// , jwtAuth({secret})  
router.get('/pidGetProduction' , jwtAuth({secret})  ,   async (ctx)=>{
     let pid = ctx.request.query.pid
     let  production = await  Publish.findOne({
            where : {
               id : pid
            }
       })
       let uid = production.get().userId
       let user = await User.findOne({
            where : {
                id : uid 
            }
       })
       let entryId = entryPassword(salt + user.get().id)
       
      ctx.body = {
          production,
          user,
          entryId
      }
     
})

router.post('/friend_User' , jwtAuth({secret})  ,   async (ctx)=>{
     let f_name = ctx.request.body.f_name
       let user = await User.findOne({
            where : {
               username : f_name
            }
       })
       let entryId = entryPassword(salt + user.get().id)
       
      ctx.body = {
          avator : user.get().avator , 
          entryId
      }
     
})



// 聊天相关的接口 
router.post('/userChat' , jwtAuth({
     secret
}), async (ctx)=>{
     let data = JSON.parse(ctx.request.body.data )
     let user = await User.findOne({where : {
          email : ctx.state.user.email,
          username : ctx.state.user.data
     }})
     await user.createChat({
          uid : data.uid,
          user_name:data.user_name,
          face:  data.face,
          type: data.type,
          msg: data.msg.content,
          isChat : Number(data.isChat),
          time : data.time,
          friend_name : data.friend_name,
     })
     ctx.body = {
          type : true
     }
})


// 获取聊天消息

router.post('/getChat' , jwtAuth({
     secret
}) , async (ctx)=>{
     const {user_name , friend_name} = ctx.request.body
     let user = await User.findOne({where : {
          email : ctx.state.user.email,
          username : ctx.state.user.data
     }})
     let chat = await Chat.findAll()
     ctx.body = {
          chat
     }
})
// 所有消息变为以读

router.post('/messageHaveRead' , jwtAuth({
     secret
}) , async (ctx)=>{
     const {user_name , friend_name} = ctx.request.body
     let chat = await Chat.findAll({
          where : {
             user_name , 
             friend_name ,
             isChat : 0 
          }
     })
     console.log(chat)
     if(chat.length <= 0 ) {
          chat = await Chat.findAll({
               where : {
                  user_name : friend_name  , 
                  friend_name :  user_name ,
                  isChat : 0 
               }
          })
     }
     
     chat.forEach(async (c,i)=>{
     c.isChat = 1 
     await c.save()
     })
     ctx.body = {
          code  : 200 , 
          msg : true 
     }
})

// 获取当前登录的用户-----> 好友的聊天消息记录


router.post('/getCurrentUserChat' , jwtAuth({
     secret
}) , async (ctx)=>{
     const {user_name} = ctx.request.body
     let chat = await Chat.findAll({
          where : {
               user_name,
          }
     })
     let aboutUC = await Chat.findAll({
          where : {
               friend_name : user_name,
          }
     })
     ctx.body = {
          chat : chat.concat(aboutUC)
     }
})


// 用户保存地址 
router.post('/userAddress' , jwtAuth({
     secret
}) , async (ctx)=>{
     const {name , tel , isDefault , detailed , region} = ctx.request.body
     let user = await User.findOne({where : {
          email : ctx.state.user.email,
          username : ctx.state.user.data
     }})
     await user.createAddress({
          name,
          phone : tel,
          isDefault,
          detailed,
          region,
          llid : entryPassword(salt + Math.random()*20)
     })
     ctx.body = {
          callback : true
     } 
})

// 用户获取地址
router.get('/getUserAddress' , jwtAuth({
     secret
}) , async (ctx)=>{
     let user = await User.findOne({where : {
          email : ctx.state.user.email,
          username : ctx.state.user.data
     }})
     let addr = await user.getAddress()
     ctx.body = {
          addr
     } 
})

// 根据id 获取地址 

router.post('/getUserAddressThoughtId' , jwtAuth({
     secret
}) , async (ctx)=>{
     const {id} = ctx.request.body
     let addr = await Address.findOne({
          where : {
               llid : id,
          }
     })
     ctx.body = {
          addr
     }
})

// 根据id 删除地址 

router.post('/userDelAddress' , jwtAuth({
     secret
}) , async (ctx)=>{
     const {id} = ctx.request.body
     let addr = await Address.destroy({
          where : {
               llid : id,
          }
     })
     ctx.body = {
          addr
     }
})
// 根据id 更新地址 
router.post('/userUpdateAddress' , jwtAuth({
     secret
}) , async (ctx)=>{
     const {id ,name , tel , isDefault , detailed , region} = ctx.request.body
     let addr = await Address.update({
          name,
          phone : tel,
          isDefault,
          detailed,
          region,
     },{
          where : {
               llid : id,
          }
     })
     ctx.body = {
          addr
     }
})

// 用户创建钱包 

router.get('/createWallet' , jwtAuth({
     secret
}) , async (ctx)=>{
     let user = await User.findOne({where : {
          email : ctx.state.user.email,
          username : ctx.state.user.data
     }})
     let result = await user.createWallet() 
     if(result) {
          ctx.body = {
               result  : true 
          }
     } else {
          ctx.body = {
               result  : false
          }
     }
})

// 查找属于当前用户的钱包
router.get('/getUserWallet' , jwtAuth({
     secret
}) , async (ctx)=>{
     let user = await User.findOne({where : {
          email : ctx.state.user.email,
          username : ctx.state.user.data
     }})
     let result = await user.getWallet()
     ctx.body = {
          result
     }
})

// 充值
router.post('/depositUser' , jwtAuth({
     secret
}) , async (ctx)=>{
     const {way , money} = ctx.request.body
     let user = await User.findOne({where : {
          email : ctx.state.user.email,
          username : ctx.state.user.data
     }})
     let result = await user.getWallet()
     // 更新表
     if(result.money) {
     result.money = (parseFloat(result.money) +  parseFloat(money)).toString() 
     }else {
     result.money = money 
     }
     result.way = way
     res = await result.save()
     ctx.body = {
          msg : res ? true : false 
     }
})

// 消费
router.post('/consumeUser' , jwtAuth({
     secret
}) , async (ctx)=>{
     const {way , money} = ctx.request.body
     let user = await User.findOne({where : {
          email : ctx.state.user.email,
          username : ctx.state.user.data
     }})
     let result = await user.getWallet()
     // 更新表
     if(result.money!=0) {
     result.money = (parseFloat(result.money) -  parseFloat(money)).toString() 
     }else {
     result.money = 0 
     }
     result.way = way
     res = await result.save()
     ctx.body = {
          msg : res ? true : false 
     }
})



// 用户订单相关 
router.post('/userCreateOrder' , jwtAuth({
     secret
}) , async (ctx)=>{
     const {isPay , way , ORDERUUID , price , content , itemity,phone,who,address,image} = ctx.request.body
     let user = await User.findOne({where : {
          email : ctx.state.user.email,
          username : ctx.state.user.data
     }})
     let result =  await user.createOrder({
          isPay,
          way,
          ORDERUUID,
          price : parseInt(price),
          content,
          itemity : parseInt(itemity),
          phone,
          who,
          address,
          image
     })
     ctx.body = {
          result
     }
})

// 用户订单相关 
router.post('/userUpdateOrderStatus' , jwtAuth({
     secret
}) , async (ctx)=>{
     const {isPay , way , ORDERUUID , price , content , itemity,phone,who,address,money} = ctx.request.body
     console.log(money)
     let order = await Order.findOne({
          where : {
               price,
               content,
               itemity,
          }
     })
     let product = await Publish.findOne({
             where : {
               price,
               content,
               itemity,
               isSell : 0 
             }
     })
     order.isPay = isPay
     order.way = way
     await order.save()
     product.isSell = 1 
     await product.save()
     let user = await User.findOne({where : {
          email : ctx.state.user.email,
          username : ctx.state.user.data
     }})
     let wallet = await user.getWallet()
     wallet.money =  wallet.money - money 
     await wallet.save()
     ctx.body = {
          msg : true
     }
})
// 用户查找订单是否重复
router.post('/userFindOrder' , jwtAuth({
     secret
}) , async (ctx)=>{
     const {isPay , way , ORDERUUID , price , content , itemity,phone,who,address} = ctx.request.body
     let order = await Order.findOne({
          where : {
               price,
               content,
               itemity,
          }
     })
     if(order){
          ctx.body = {
               callback : true 
          }
     } else {
          ctx.body = {
               callback : false 
          }
     }
})

// 获取用户的全部订单
router.get('/userAllOrder' , jwtAuth({
     secret
}) , async (ctx)=>{
     
     let user = await User.findOne({where : {
          email : ctx.state.user.email,
          username : ctx.state.user.data
     }})
     let order = await user.getOrder()
     ctx.body = {
          order
     }
})

module.exports = router