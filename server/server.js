let app = require('express')()
let io = require('socket.io')(server)
let rds = require('redis').createClient(6379, '127.0.0.1', {})
let async = require('async')
io.on('connection', (socket) => {
    socket.domain = null
    socket.path = null
    socket.on('message', (json) => {
        if (json.method == 'auth') {
            // 验证身份
            let domain = json.domain
            async.waterfall([
                (cb) => {
                    rds.get('site-'+domain, (err, site) => {
                        if (err) {
                            console.log(err)
                            socket.emit('system', {status: 'danger', code: 5, msg: 'internet server error'})
                            return
                        } else if (site == null) {
                            socket.emit('system', {status: 'danger', code: 3, msg: 'domain has not register'})
                            return
                        } else {
                            socket.domain = json.domain
                            socket.path = json.path
                            cb(null, site)
                        }
                    })
                },
                (site, cb) => {
                    site = JSON.parse(site)
                    rds.smembers('path-'+site.domain, (err, paths) => {
                        if (err) {
                            console.log(err)
                            socket.emit('system', {status: 'danger', code: 5, msg: 'internet server error'})
                            return
                        } else {
                            cb(null)
                        }
                    })
                },
                (cb) => {
                    rds.sadd('path-'+json.domain, json.path)
                    rds.smembers('pool-'+json.domain+json.path, (err, dms) => {
                        if (err) {
                            console.log(err)
                            socket.emit('system', {status: 'danger', code: 5, msg: 'internet server error'})
                            return
                        } else if (dms == null) {
                            return
                        } else {
                            cb(null, dms)
                        }
                    })
                },
                (dms, cb) => {
                    socket.emit('add', dms)
                }
            ])

        }

        if (json.method == 'send') {
            // 先验证身份
            if (socket.path) {
                if ('data' in json) {
                    rds.sadd('pool-'+socket.domain+socket.path, JSON.stringify(json.data))
                    io.sockets.emit('add', json.data)

                    return
                }
            }

            return
        }
    })
})

server.listen(3000) // socket port
