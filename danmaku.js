// Here are based on canvas
var $w = $(window)
// create canvas
$('body').append('<canvas id="danmaku-canvas" width="'+$w.width()+'" height="'+$w.height()+'" style="z-index:-1;position:absolute;left:0px;top:0px;bottom:0px;right:0px">')
var $c = $('#danmaku-canvas')
var ca = {
  x: $w.width(),
  y: $w.height(),
  dm: [
  ]
}

// create ctx
var ctx = document.getElementById('danmaku-canvas').getContext('2d')

// default setting
ctx.shadowColor = "gray"
ctx.shadowsOffsetX = 10
ctx.shadowsOffsetY = 10
ctx.shadowBlur = 10

// background stars
var star = {
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
        star.data[i].size -= 1;
        star.data[i].x++
        star.data[i].y--
      } else {
        star.data[i].size += 1;
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
  data.v = Math.floor(data.msg.length / 3) + 5
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
var draw = () => {
  if (star.switcher) {
      star.star(75)
  }

  ctx.font = '24px Arial'
  for (var i = 0; i < ca.dm.length; i++) {
    for (var j = 0; j < ca.dm[i].length; j++) {
      // console.log('drawing')
      ca.dm[i][j].x -= ca.dm[i][j].v
      if (ca.dm[i][j].x < -100) {
        ca.dm[i].splice(j, 1)

      } else {
        ctx.fillStyle = ca.dm[i][j].color
        ctx.fillText(ca.dm[i][j].msg, ca.dm[i][j].x, (i + 1) * 24)
      }

    }
  }
}

var move = () => {
  setInterval(() => {
    // console.log('looping')
    ctx.clearRect(0, 0, ca.x, ca.y)
    draw()
  }, 50)
}

// init danmaku
var init = () => {
  $('body').append('<div class="danmaku-footer" z-index="1">\
    <input id="danmaku-sender" placeholder="发射弹幕！"></input>\
    <input id="danmaku-color" type="color" value="#ffffff"></input>\
  </div>')
  $('.danmaku-footer').attr('style', 'background-color:rgba(1, 1, 1 , 0.65);position:absolute;left:0px;right:0px;bottom:0px;padding-bottom:7px;padding-top:7px;width:100%;text-align:center')
  $('#danmaku-sender').attr('style', 'width:70%')
  $('#danmaku-sender').keydown(() => {
    if (event.which == 13) {
      var val = $('#danmaku-sender').val()
      var color = $('#danmaku-color').val()
      var data = {
        msg: val,
        color: color,
        time: Date.now()
      }
      ca.add(data)
      $('#danmaku-sender').val('')
    }
  })
  // console.log('init')

  // 性能测试
  // var i = 0
  // setInterval(() => {
  //   ca.add({msg: 'test'+i, color: '#'+Math.floor(16 * Math.random()).toString(16)+Math.floor(16 * Math.random()).toString(16)+Math.floor(16 * Math.random()).toString(16)})
  //   i++
  // }, 10)
  move()
}

init()

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
