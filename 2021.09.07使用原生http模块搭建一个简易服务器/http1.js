// 引入http模块，起一个服务
const http = require('http')
// 引入fs模块，返回index.html的内容，达到访问8081服务的页面的目的
const fs = require('fs')
// 引入path模块，因为node环境中的文件地址不一定跟本地看到的一样, 这里加不加问题不大
// 思考：path.resolve，跟path.join的区别，webpack里面常用path
const path = require('path')

// 开启一个服务器并且指定端口
http.createServer((req, res) => {
  // 获取访问路径
  const url = req.url
  console.log(url, '获取的路径')

  // 如果url是index，则去找index.html文件.注意路径是带/的
  if (url === '/index') {
    // 采用异步读取方式, 同步加sync
    fs.readFile(path.resolve(__dirname, './index.html'), (err, data) => {
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
  } else {
    // 其他页面就是404， 设置请求头，返回值，
    // res.end()每个请求都必须要调用的方法，
    // 结束请求，告诉服务器该响应的报文头，内容等等全部已经响应完毕
    // 要不然就会得不到响应，请求超时。必须写在最后，之后的write不生效了
    // 1、单独写
    // 设置http响应状态码
    // res.statusCode = 404 
    // 设置http响应状态码对应的消息, 注意不能是中文
    // res.statusMessage = 'Not Found'
    // res.setHeader('Content-Type', 'text/plain;charset=utf8')
    // res.end()
    // 一起写，做区分，写2

    // res.setHeader，res.writeHead设置响应报文头，建议写在最前面
    // 因为即便我们不设置响应报文头，系统也会默认有响应报文头，并且默认发送给浏览器，
    // 当已经发送过响应报文头，不能通过res.setHeader()来设置，否则会报错 

    res.writeHead('404', 'Not Found2', {
      'Content-Type': 'text/plain;charset=utf8'
    })
    res.write('404，页面路径错了，检查一下')
    res.write('\nwrite可以写多个')
    
    // end与write区别。end在请求头中添加了，context-type返回类型， 
    res.end('\n我也可以写东西，当做最后一个write')

    // end之后的write写入不生效了而且会报错，因为end已经结束了
    // res.write('\nend之后的内容')
  }

  

}).listen(8081, () => {
  // 起一个8081的服务，思考，如果端口占用，如何判断出来并且端口+1，比如8081倍占用，就起到8082
  console.log('服务已启动，http://localhost:8081')
})

// 原生起服务跟框架最大的区别，就是框架内部封装简化了，所以我们用框架开发特别快，
// 但是原生node也需要了解，是基础