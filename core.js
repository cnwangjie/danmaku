// Here are based on canvas
var $w = $(window) // w = windows * GLOBAL JQ short name
$('body').append('<canvas id="canvas" width="'+$w.width()+'" height="'+$w.height()+'" style="z-index:-1;position:absolute;top:0px;left:0px">')
var $c = $('canvas') // c = canvas * GLOBAL JQ short name
var ca = {
  x: $w.width(),
  y: $w.height(),
  dm: [

  ]
}

var star = {
  data: [],
  new: true,
  star: (n) => {
    if (star.data.length < n) {
      for (var i = star.data.length; i < n; i++) {
        if (star.new) {
          var size = Math.floor((30 * Math.random()))
        } else {
          var size = 1
        }
        star.data[i] = {
          x: Math.floor(($w.width() * Math.random())),
          y: Math.floor(($w.height() * Math.random())),
          color: '#'+Math.floor(16 * Math.random()).toString(16)+Math.floor(16 * Math.random()).toString(16)+Math.floor(16 * Math.random()).toString(16),
          size: size,
          die: false
        }
      }
    }
    star.new = false
    console.log('drawing star')
    for (var i = 0; i < n; i++) {
      if (star.data[i].die) {
        star.data[i].size -= 1;
      } else {
        star.data[i].size += 1;
      }
      ctx.fillStyle = star.data[i].color
      ctx.font = star.data[i].size+'px Arial'
      ctx.fillText('★', star.data[i].x, star.data[i].y)
      if (star.data[i].size > 29) {
        star.data[i].die = true
      }
      if (star.data[i].size == 0 && star.data[i].die) {
        star.data.splice(i, 1)
      }
    }
  }
}
var ctx = document.getElementById('canvas').getContext('2d')
$w.resize(() => {
  $c.css('width', $w.width())
  $c.css('height', $w.height())
})

ca.add = (data) => {
  data.v = Math.floor(data.msg.length / 3) + 5
  data.x = ca.x
  if (ca.dm.length == 0) {
    ca.dm[0] = []
    ca.dm[0].push(data)
    return
  } else {
    for (var i = 0; i < ca.dm.length; i++) {
      if (ca.dm[i].length == 0) {
        ca.dm[i] = []
        ca.dm[i].push(data)
        return
      } else if (ca.dm[i][ca.dm[i].length - 1].x < ca.x - 50) {
        ca.dm[i].push(data)
        return
      }
    }
    ca.dm[ca.dm.length] = []
    ca.dm[ca.dm.length].push(data)
  }
}

var draw = () => {
  star.star(350)
  for (var i = 0; i < ca.dm.length; i++) {
    for (var j = 0; j < ca.dm[i].length; j++) {
      // console.log('drawing')
      ca.dm[i][j].x -= ca.dm[i][j].v
      if (ca.dm[i][j].x < -100) {
        ca.dm[i].splice(j, 1)
      }

      ctx.font = '24px Arial'
      ctx.fillStyle = ca.dm[i][j].color
      ctx.fillText(ca.dm[i][j].msg, ca.dm[i][j].x, (i + 1) * 24)
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


var init = () => {
  // console.log('init')
  var i = 0
  // setInterval(() => {
  //   ca.add({msg: 'test'+i})
  //   i++
  // }, 1000)
  move()
}

init()
// c.mousemove((e) => {
//   console.log(e)
//   ctx.fillStyle = '#'+Math.floor(16 * Math.random()).toString(16)+Math.floor(16 * Math.random()).toString(16)+Math.floor(16 * Math.random()).toString(16)
//   ctx.font = Math.floor((60 * Math.random()))+'px Arial'
//   ctx.fillText('.', e.clientX, e.clientY)
// })


var starBackground = () => {
  for (var i=0; i< 100; i++) {
    ctx.fillStyle = '#'+Math.floor(16 * Math.random()).toString(16)+Math.floor(16 * Math.random()).toString(16)+Math.floor(16 * Math.random()).toString(16)
    ctx.font = Math.floor((60 * Math.random()))+'px Arial'
    ctx.fillText('+', Math.floor(($w.width() * Math.random())), Math.floor(($w.height() * Math.random())))
  }
}
//starBackground()

$('#sender').keydown(() => {
  if (event.which == 13) {
    var val = $('#sender').val()
    var color = $('#color').val()
    var data = {
      msg: val,
      color: color,
      time: Date.now()
    }
    ca.add(data)
    $('#sender').val('')
  }
})







if (false) {
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
