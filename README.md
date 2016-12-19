danmaku
======

A simple danmaku engine build on canvas.

> Author : Wang Jie <i@i8e.net>

### Usage

 - require `JQuery`
 - require `danmaku.js`
 - DONE!
 - if you want the color selecter more pretty you can require `cxcolor`
 - if you want use a socket connection to the danmaku server you can require `socketio` and the `\core` path of this repository has a template socket server

### Todo

 - [ ] improve the performance
 - [x] basically realize the uniform insert like niconico
 - [x] fix bug about flash when disappear
 - [ ] input box style and the color select box
 - [x] danmaku engine back-end
 - [x] socket to the back-end

### APIs

you can use global variable `danmaku` , following are some tips

#### danmaku.ca

it's the core member of the danmaku . method `damaku.ca.add(data)` will send a danmaku to screen directly but not to the danmaku pool . the member `damaku.ca.pool` is the danmaku pool , you can push a object in it and the next circle it will be shooted

#### danmaku.star

it's a plugin can cover the background full of stars , you can set the boolean `danmaku.star.switcher` to turn on or turn off it

#### danmaku.ctx

it's the content of canvas

#### damaku.socket

if the socketio was required it will the socket object

#### ...

you can use custom css and javascript to achieve more features
