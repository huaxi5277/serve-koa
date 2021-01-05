const crypto = require('crypto')
const hash = (type , str ) => crypto.createHash(type).update(str).digest('hex')
const md5 = str => hash('md5' , str )
const entryPassword = (salt , password)=> md5(salt + password ) 
module.exports = entryPassword