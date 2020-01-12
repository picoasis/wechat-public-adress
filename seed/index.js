const Koa = require('koa')
const Router = require('koa-router')
const static = require('koa-static')
const xml2js = require('xml2js');
const xmlParser = require('koa-xml-body');
const crypto = require('crypto');

const bodyParser = require('koa-bodyparser');
const wechat = require('co-wechat');
const url =require('url');
const conf = require('./conf')

const app = new Koa()
const router = new Router()
app.use(xmlParser())
app.use(bodyParser())
app.use(static(__dirname + '/'))
//验证
router.get('/wechat',ctx=>{
    console.log('微信认证...',ctx.url)
    const { query } = url.parse(ctx.url,true);
    const {signature,timestamp,nonce,echostr} = query;
    console.log('wechat',query);
    //使用本地token进行加密
    let str =[conf.token,timestamp,nonce].sort().join('');
    console.log('str',str);
    let strSha1 = crypto.createHash('sha1').update(str).digest('hex');

    console.log(`自己加密后的字符串为:${strSha1}`);
    console.log(`微信加密后的字符串为:${signature}`);
    console.log(`两者比较的结果为:${strSha1 == signature}`);
    
    //判断是否是来自微信服务器的认证信息
    if(signature == strSha1){
        ctx.body = echostr
    }else{
        ctx.body ="你不是微信"
    }

})

//接收信息
router.post('/wechat', ctx=>{
    
    const {xml:msg}=ctx.request.body;
    console.log('Recieve:',msg)
    const builder = new xml2js.Builder()
    const result =builder.buildObject({
        xml:{
            ToUserName:msg.FromUserName,
            FromUserName:msg.ToUserName,
            CreateTime:Date.now(),
            MsgType:msg.MsgType,
            Content:'Hello'+msg.Content
        }
    })
    ctx.body = result;
})
app.use(router.routes()); /*启动路由*/
app.use(router.allowedMethods());
app.listen(80);