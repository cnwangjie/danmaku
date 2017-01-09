var danmaku = function(){
// Here are based on canvas
var $w = $(window)
// create canvas
$('body').append('<canvas id="danmaku-canvas" width="'+$w.width()+'" height="'+$w.height()+'" style="z-index:-1;position:fixed;left:0px;top:0%;bottom:0%;right:0px">')
var $c = $('#danmaku-canvas')

var ca = {
  start: Date.now(),
  circle: 10000,
  x: $w.width(),
  y: $w.height(),
  dm: [],
  pool: []
}

if (typeof(io) != 'undefined') {
// 创建与弹幕服务器的socket连接
var socket = io.connect('http://localhost:3000')

// 检测与弹幕服务器的连接情况
var timeout = setTimeout(() => {
    if (socket.disconnect && this.socket.io.reconnecting) {
        $('#danmaku-sender').remove()
        $('#danmaku-color').remove()
        $('.danmaku-footer').append('<p style="color:red">连接弹幕服务器超时</p>')
        delete socket
    }
}, 10000)

socket.on('connect', () => {
  let auth = {
    method: 'auth',
    domain: window.location.hostname,
    path: window.location.pathname
  }
  clearTimeout(timeout)
  socket.send(auth)
})

socket.on('system', (json) => {
  if (json.status == 'danger') {
    console.log(json)
    switch (json.code) {
      case 3:
        $('#danmaku-sender').remove()
        $('#danmaku-color').remove()
        $('.danmaku-footer').append('<p style="color:red">该域名尚未注册本服务</p>')
        delete socket
        break
      default:
        $('#danmaku-footer').append('<p id="danmaku-error-message" style="color:red">'+json.msg+'</p>')
        setTimeout(()=>{
            $('#danmaku-error-message').remove()
        }, 5000)
    }
  }
})

socket.on('add', (json) => {
  if ('length' in json) {
    for (let i = 0; i < json.length; i++) {
        json[i] = JSON.parse(json[i])
        ca.add(json[i])
    }
    ca.pool = json
  } else {
    ca.pool.push(json)
  }
})
} else {
    var socket = null
}

var cvs = document.getElementById('danmaku-canvas')
// create ctx
var ctx = cvs.getContext('2d')

// default setting
ctx.shadowColor = "gray"
ctx.shadowsOffsetX = 10
ctx.shadowsOffsetY = 10
ctx.shadowBlur = 10

// it is a plugin
// background stars
var star = {
  sum: ca.x * ca.y / 6E3 >> 0,
  switcher: true,
  data: [],
  new: true,

  // add new star
  add: (i) => {
    if (star.new) {
      // firstly create different size stars
      var size = Math.floor((30 * Math.random()))
    } else {
      var size = 1
    }
    star.data[i] = {
      x: Math.floor(($w.width() * Math.random())),
      y: Math.floor(($w.height() * Math.random())),
      color: '#'+Math.floor(16 * Math.random()).toString(16)+Math.floor(16 * Math.random()).toString(16)+Math.floor(16 * Math.random()).toString(16),
      size: size,
      dying: false
    }
    if (star.new) {
      if (Math.random() < 0.5) {
        star.data[i].dying = true
      }
    }
  },

  // drawing star
  star: (n) => {
    // n is the sum of the stars
    if (star.new) {
      for (var i = 0; i < n; i++) {
        star.add(i)
      }
      star.new = false
    }
    var died = []
    for (var i = 0; i < n; i++) {
      if (star.data[i].dying) {
        star.data[i].size -= 0.5
        star.data[i].x += 0.5
        star.data[i].y -= 0.5
      } else {
        star.data[i].size += 0.5;
      }
      ctx.fillStyle = star.data[i].color
      ctx.font = star.data[i].size+'px Arial'
      ctx.fillText('★', star.data[i].x, star.data[i].y)
      if (star.data[i].size > 29) {
        star.data[i].dying = true
        continue
      }
      if (star.data[i].size == 0 && star.data[i].dying) {
        died.push(i)
      }
    }
    for (var i = 0; i < died.length; i++) {
      star.add(died[i])
    }
  }
}

// let canvas size same as window
// $w.resize(() => {
//   $c.css('width', $w.width())
//   $c.css('height', $w.height())
// })

// add a new danmaku
ca.add = (data) => {
  // 弹幕飞行的速度
  data.v = Math.floor(data.msg.length / 6) + 2.5

  data.x = ca.x

  // 把弹幕往空的地方放，如果没有空位就出现在新的一行
  if (ca.dm.length == 0) {
    ca.dm.push([data])
    return
  } else {
    for (var i = 0; i < ca.dm.length; i++) {
      if (ca.dm[i].length == 0) {
        ca.dm[i] = [data]
        return
      } else if (ca.dm[i][ca.dm[i].length - 1].x < ca.x - 100) {
        ca.dm[i].push(data)
        return
      }
    }
    ca.dm.push([data])
  }
}

// draw on the canvas
ca.draw = () => {
  if (star.switcher) {
      star.star(star.sum)
  }

  ctx.font = '24px Arial'
  var del = []
  for (var i = 0; i < ca.dm.length; i++) {
    del[i] = []
    for (var j = 0; j < ca.dm[i].length; j++) {
      // console.log('drawing')
      ca.dm[i][j].x -= ca.dm[i][j].v
      if (ca.dm[i][j].x < -300) {
        // 将超出屏幕的弹幕删除
        // 靠后的先删除
        del[i].unshift(j)

      } else {
        ctx.fillStyle = ca.dm[i][j].color
        ctx.fillText(ca.dm[i][j].msg, ca.dm[i][j].x, (i + 1) * 24)
      }

    }
  }
  for (let i = 0; i < del.length; i++) {
    for (let j = 0; j < del[i].length; j++) {
      ca.dm[i].splice(del[i][j], 1)
    }
  }
  window.requestAnimationFrame(() => {
    cvs.width = cvs.width
    ca.draw()
  })

}

ca.shoot = () => {
    ca.draw()
}

// init danmaku
ca.init = () => {
  $('body').append('<div class="danmaku-footer" z-index="1">\
    <input id="danmaku-sender" placeholder="发射弹幕！"></input>\
    <input id="danmaku-color" value="#ffffff"></input>\
  </div>')
  $('.danmaku-footer').attr('style', 'background-color:rgba(1, 1, 1 , 0.65);position:fixed;left:0px;right:0px;bottom:0%;padding-bottom:7px;padding-top:7px;width:100%;text-align:center;z-index:2')
  if ('cxColor' in $('#danmaku-color')) {
      $('#danmaku-color').cxColor()
  } else {
      $('#danmaku-color').attr('type', 'color')
  }
  $('#danmaku-sender').attr('style', 'width:70%')
  $('#danmaku-sender').keydown(() => {
    if (event.which == 13) {
      var val = $('#danmaku-sender').val()
      var color = $('#danmaku-color').val()
      if (val == '') {
          return
      }
      var data = {
        msg: val,
        color: color,
        time: Date.now() - ca.start,
        truetime: Date.now()
      }

      if (socket.connected) {
        let json = {
            data: data,
            method: 'send'
        }
        socket.send(json)
      }
      // 发射弹幕
      ca.add(data)
      // 加入本地弹幕池
      ca.pool.push(data)
      $('#danmaku-sender').val('')
    }
  })
  // console.log('init')

  // local性能测试
  // var i = 0
  // setInterval(() => {
  //   ca.add({msg: 'test'+i, color: '#'+Math.floor(16 * Math.random()).toString(16)+Math.floor(16 * Math.random()).toString(16)+Math.floor(16 * Math.random()).toString(16)})
  //   i++
  // }, 10)

  // circle性能测试
  for (let i = 0; i < 100; i ++) {
    ca.pool.push({msg: '花式求star'+i, color: '#'+Math.floor(16 * Math.random()).toString(16)+Math.floor(16 * Math.random()).toString(16)+Math.floor(16 * Math.random()).toString(16), time: Math.random() * 1e5 >> 0})
  }
  for (let i = 0; i < 100; i ++) {
    ca.pool.push({msg: '跪求star啊啊！！', color: '#'+Math.floor(16 * Math.random()).toString(16)+Math.floor(16 * Math.random()).toString(16)+Math.floor(16 * Math.random()).toString(16), time: Math.random() * 1e5 >> 0})
  }
  for (let i = 0; i < 100; i ++) {
    ca.pool.push({msg: '好哥哥给我个star吧', color: '#'+Math.floor(16 * Math.random()).toString(16)+Math.floor(16 * Math.random()).toString(16)+Math.floor(16 * Math.random()).toString(16), time: Math.random() * 1e5 >> 0})
  }
  for (let i = 0; i < 20; i ++) {
    ca.pool.push({msg: '求你了给我个star吧求你了给我个star吧求你了给我个star吧', color: '#'+Math.floor(16 * Math.random()).toString(16)+Math.floor(16 * Math.random()).toString(16)+Math.floor(16 * Math.random()).toString(16), time: Math.random() * 1e5 >> 0})
  }

  // shoot !!!
  ca.shoot()

  // test
  ca.circler()
  setInterval(() => {
    if (Date.now() > ca.start + ca.circle) {
      ca.circler()
    }
  }, 10)
}


// 在socket获取到弹幕数据后执行circler()用于周期性循环发射弹幕
ca.circler = () => {
    for (var i = 0; i < ca.pool.length; i += 1) {
        if ('time' in ca.pool[i]) {

            ((data, time) => {
                setTimeout(() => {ca.add(data)}, time)
            })(ca.pool[i], ca.pool[i].time)
        }
    }
    ca.start = Date.now()
    ca.circle = ca.pool.length * 100 + 10E3// 每100条弹幕可以为弹幕周期+1s

}


ca.init()

// 跟随鼠标绘制随即图案
// c.mousemove((e) => {
//   console.log(e)
//   ctx.fillStyle = '#'+Math.floor(16 * Math.random()).toString(16)+Math.floor(16 * Math.random()).toString(16)+Math.floor(16 * Math.random()).toString(16)
//   ctx.font = Math.floor((60 * Math.random()))+'px Arial'
//   ctx.fillText('.', e.clientX, e.clientY)
// })

// 生成一个很花的背景图片
var starBackground = () => {
  for (var i=0; i< 100; i++) {
    ctx.fillStyle = '#'+Math.floor(16 * Math.random()).toString(16)+Math.floor(16 * Math.random()).toString(16)+Math.floor(16 * Math.random()).toString(16)
    ctx.font = Math.floor((60 * Math.random()))+'px Arial'
    ctx.fillText('+', Math.floor(($w.width() * Math.random())), Math.floor(($w.height() * Math.random())))
  }
}
// starBackground()

// API
this.ca = ca
this.star = star
this.ctx = ctx
this.socket = socket
}

var danmaku = new danmaku();






// saved for future
() => {
// following are baed on DOM
var data = [
]

// use for create test data
var test = (n) => {
  for (var i = 0; i < n; i++) {
    data.push({msg: 'test'+i})
  }
}
// test(100)
var id = 0
var init = () => {
  setInterval(() => {

    add(id)
  }, 1000)
}

// var ch = (id, data) => {
//   $('#danmu').append('<div class="danmu" id="'.id.'" style')
// }
var add = () => {

  $('#danmu').append('<div class="danmu" id="dm' + id + '">' + data[id].msg + '</div>')
  move('#dm' + id)
  id+=1
}

var move = (id) => {
  var l = $(window).width()
  var d = - $(id).width()
  setTimeout(() => {
    $(id).css('top', '0px')
  }, 33)
  var s = setInterval(() => {
    l-=4
    $(id).css('left', l+'px')

    if (l < d) {
      clearTimeout(s)
      $(id).remove()
    }
  }, 33)

}
// DOM danmu init function
// setTimeout(init(), 1000)
}
