function Danmaku(opt) {
  if (!(this instanceof Danmaku)) {
    throw new TypeError(`Class constructor Danmaku cannot be invoked without 'new'`)
  }
  opt = opt || {}
  const target = opt.target || document.body
  if (!(target instanceof Element)) {
    throw new TypeError('target must be an instance of Element, but', target)
  }
  this.width = opt.width || window.innerWidth
  this.height = opt.height || window.innerHeight
  this.autoplay = opt.autoplay === undefined ? true : opt.autoplay
  this.loop = opt.loop === undefined ? false : opt.loop
  this.loopInterval = opt.loopInterval || +Infinity
  this.autoresize = opt.autoresize === undefined ? false : opt.autoresize
  this.clearCanvasBeforeFrame = opt.clearCanvasBeforeFrame === undefined ? true : opt.clearCanvasBeforeFrame
  const createCanvas = () => {
    const canvas = document.createElement('canvas')
    canvas.width = this.width
    canvas.height = this.height
    canvas.style.position = 'absolute'
    canvas.style.top = 0
    canvas.style.left = 0
    canvas.style.zIndex = -1
    target.appendChild(canvas)
    return canvas
  }
  const canvas = target.tagName.toLowerCase() === 'canvas' ? this.target : createCanvas()
  const status = {
    start: Date.now(),
  }
  const pool = this.pool = []
  const _store = this._store = {
    stage: [],
    status,
  }
  const ctx = canvas.getContext('2d')

  const addToStage = data => {
    data._lastStageTime = Date.now()
    const stage = _store.stage
    data.v = (data.msg.length / 6 + 2.5) << 0
    data.x = this.width
    if (stage.length === 0) return stage.push([data])
    for (let i = 0; i < stage.length; i += 1) {
      if (stage[i].length === 0) return stage[i].push(data)
      if (stage[i][stage[i].length - 1].x < this.width - data.msg.length * 24) return stage[i].push(data)
      if ((i + 2) * 24 > this.height) return stage.reduce((r, i) => !r ? i : r.length < i.length ? r : i, null).push(data)
    }
    stage.push([data])
    return data
  }

  const shoot = this.shoot = data => {
    addToStage(data)
    pool.push(Object.assign({}, data, {time: Date.now() - _store.status.start}))
  }

  const cycle = () => {
    _store.stage = _store.stage.map(line => line.map(item => {
      if (item.x < -1 * item.msg.length * 24) return null
      else item.x -= item.v
      return item
    }).filter(i => i))
    const curTime = Date.now()
    if (!this.loop) return
    pool.filter(i => i.time && ((!i._lastStageTime && curTime - _store.status.start > i.time) || curTime - i._lastStageTime > this.loopInterval))
      .map(i => addToStage(i))
  }

  const draw = () => {
    if (!this._interval) return
    if (this.clearCanvasBeforeFrame) canvas.width = canvas.width
    ctx.font = '24px Arial'
    _store.stage.map((line, level) => line.map(item => {
      ctx.fillStyle = item.color
      ctx.fillText(item.msg, item.x, (level + 1) * 24)
    }))
    requestAnimationFrame(() => {
      draw()
    })
  }
  this._interval = null
  const start = this.start = () => {
    if (this._interval) return
    this._interval = setInterval(cycle, 20)
    draw()
  }
  const stop = this.stop = () => {
    if (this._interval) clearInterval(this._interval)
    this._interval = null
  }

  if (this.autoplay) start()
  if (this.autoresize) {
    window.addEventListener('resize', () => {
      canvas.width = this.width = window.innerWidth
      canvas.height = this.height = window.innerHeight
    })
  }

  const count = this.count = () => _store.stage.reduce((r, line) => r + line.length, 0)
}

Danmaku.toString = () => 'function Danmaku() { [native code] }'

Danmaku.prototype.defaultBackground = 'gray'