const koa = require('koa')
const static = require('koa-static')
const fs =require('fs')
const formidable = require('koa-formidable')
const path = require('path')
const router = require('koa-router')()
const app = new koa() 
const bodyparser = require('koa-bodyparser')


app.use(bodyparser())

const mkdirs = (dirname , callback)=>{

    fs.exists(dirname , function(exisits){
        if(exisits) {
            callback()
        } else {
            mkdirs(path.dirname(dirname) , function(){
                fs.mkdir(dirname , callback)
            })
        }
    })
}
app.use(static(__dirname)) 




router.get('/test' , async(ctx)=>{
    ctx.body = {
        msg : 'test '
    }
})


router.post('/idle/images' , async (ctx)=>{
    const {request} = ctx 
    let form = formidable.parse(request) 
    function formImage() {
        return new Promise((resolve , reject)=>{
            form((opt , {fields , files})=>{
                let url = fields.url;
                let articleId = fields.articleId;
                let filename = files.file.name;
                console.log(files.file.path);
                let uploadDir = 'public/upload/';
    	        let avatarName = Date.now() + '_' + filename;
    	        mkdirs('public/upload', function() {
                	fs.renameSync(files.file.path, uploadDir + avatarName); //重命名
                	resolve('http://localhost:3000' + '/' + uploadDir + avatarName)
                	// http://localhost:6001/public/upload/1513523744257_WX20171205-150757.png
                })
            })
        })
    }
    let url = await formImage()
    ctx.body = {
        url
    }
} )








app.use(router.routes())
app.use(router.allowedMethods())
app.listen(3000)