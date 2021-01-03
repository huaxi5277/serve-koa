const Router = require('koa-router')
const router = new Router() 

router.prefix('/api/idle')
router.get('/test' , async(ctx , next)=>{
     ctx.body = 'hello idle'
})


module.exports = router