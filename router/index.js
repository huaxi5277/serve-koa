const compose = require('koa-compose')
const glob = require('glob')
const path = require('path')

const registerRouter = ()=>{
    let routers = []   
    // router
    glob.sync(path.resolve(__dirname , './' , '**/*.js'))
    .filter(value => {
        return value.indexOf('index.js') == -1
    })
    .map(value =>{
        routers.push(require(value).routes())
        routers.push(require(value).allowedMethods())
    })
  return compose(routers)


}

module.exports  = registerRouter 



