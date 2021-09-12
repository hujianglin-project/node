// 解决跨域问题， 起一个8082的端口
const http = require('http')
// url.parse将req.url解析成一个对象
const URl = require('url')
const fs = require('fs')

http.createServer((req, res) => {
  console.log(req.headers.cookie, 222)
  // 设置跨域，也可以通过nginx配置,koa可以引入cors模块跨域
  // 允许前端访问的域名白名单, 一般写特定的域名
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin)
  // 设置允许通过的header信息, 这里自定义一个header sid
  res.setHeader('Access-Control-Allow-Headers', 'sid')
  // 设置允许通过的请求方式，这里只写GET，常用的值为'PUT,POST,GET,DELETE,OPTIONS'，参考it项目
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')

  // cookie跨域配置,注意设置这个的时候Access-Control-Allow-Origin不能为*
  res.setHeader("Access-Control-Allow-Credentials", true)
  
  //第二个参数为true时将query从字符串改成对象
  const url = URl.parse(req.url, true)

  // 不清楚题目意思，不过我猜测是假如是options请求，返回为ok, 不往下执行逻辑语句，
  // 但是其实options请求我们是不需要管理和干预
  // 思考。到底返回200还是204？204代表没有任何内容返回
  if (req.method === 'OPTIONS') {
    res.writeHead('204', `No Content`, {
      'Content-Type': 'preflight', //预检请求
      'Content-Length':  0
    })
    
    res.end()

    return
  }


  // 这里是同域的情况对比
  if (req.url === '/index') {
    // 采用异步读取方式, 同步加sync
    fs.readFile('./index.html', (err, data) => {
      if (err) return console.log(err)

      // 获取到的data数据格式基本上都是buffer流，需要转成string
      const response = data.toString()
      // 返回数据到前端显示
      // 设置响应头
      res.setHeader('Content-Type', 'text/html;charast=utf8')
      // 写入内容
      res.write(response)
      // end表示结束。之后不能写东西了
      res.end()
    })
  }
  // 思考如何RESTFul
  else if (url.pathname === '/createTxt') {
    // 获取所有参数
    const query = url.query
    // 拿到我想要的参数
    const { name, value } = query
    // 创建一个文件
    // fs.writeFile('文件路径'，'要写入的内容'，['编码']，'回调函数');
    // 写入的时候如果没有这个文件，会自动创建这个文件
    // 如果被写入的文件已存在内容，那么写入的话，会覆盖之前的内容，思考如何追加(流或者先读)
    // 写入数据的类型必须是字符串或buffer二进制数据 ，对象等数据写入后，接收的是数据类型
    // 回调函数中，只有err一个参数，写入错误即可判断调用

    fs.writeFile(`./${name}.txt`, value, 'utf-8', (err) => {
      if (err) return console.log(err)
      
      res.writeHead('200', `ok`, {
        'Content-Type': 'application/json'
      })

      // write跟send只支持string和buffer， 思考如何支持json
      res.write(JSON.stringify({
        code: 0,
        data: `文件生成成功，名字为${name}, 内容为${value}`
      }))
      res.end()
    })

  } else {
    res.statusCode = 404
    res.statusMessage = 'not found'
    res.setHeader('Content-Type', 'text/plain;charast=utf8')
    res.write('接口不存在，大哥检查一下')
    res.end()
  }

}).listen('8082', () => {
  console.log('服务启动成功, http://localhost:8082')
})

