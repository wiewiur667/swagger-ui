var path = require("path")
var express = require("express")
var webpack = require("webpack")
var debug = require("debug")
var config = require("../webpack/dev.babel.js").default

import Socket from "./socket"

//var browserSync = require("browser-sync")

var socketIo = require("socket.io")
var http = require("http")

debug.enable("app:*")

var app = express()
var compiler = webpack(config)
var log = debug("app:devServer")

// app.use(history({ verbose: false }));

log("Enabling webpack dev middleware.")
app.use(require("webpack-dev-middleware")(compiler, {
  publicPath: "/",
  hot: true,
  quiet: false,
  noInfo: false,
  lazy: false,
  stats: {
    colors: true
  }
}))
app.use(require("webpack-hot-middleware")(compiler))

app.get("/", (req, res)=> {
  res.sendFile(path.join(__dirname, "../", "dev-helpers", "index.html"));
})

var api = require("./api")

app.use("/api", api.router)

var port = 3000
var hostname = "localhost"

var server = http.createServer(app)

var io = socketIo(server)
var instancesIo = io.of("/socket")

api.init(instancesIo)

server.listen(port, hostname, (err) => {
  if (err) {
    log(err)
    return
  }
  log(`Server is now running at http://${hostname}:${port}.`)
})

// var bsPort = 4000
// var bsUI = 4040
// var bsWeInRe = 4444

// browserSync.init({
//   proxy: `${hostname}:${port}`,
//   port: bsPort,
//   ui: {
//     port: bsUI,
//     weinre: { port: bsWeInRe },
//   },
// })