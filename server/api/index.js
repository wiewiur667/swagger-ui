/* eslint-disable semi */
import InstanceManager from "./instanceManager"
import Instance from "./instance"
import Socket from "../socket";

const proxy = require("express-http-proxy");
const { Router } = require("express");

const DirHandler = require("./dirHandler").default;
const router = Router();

var debug = require("debug")
var log = debug("app:devServer")


const init = (io) => {

  const dirHandler = new DirHandler("schemas")
  const instanceManager = new InstanceManager();
  const socket = new Socket(io, instanceManager);

  dirHandler.watchFiles("../../schemas");

  instanceManager.fromFileWatcher(dirHandler.changesAndAdditions)

  socket.connected();

  //Function that handles requests and redirects to selected prism instance
  router.use("/mock/:apiIdOrName/*", proxy((req) => {
    const params = req.params;
    const instanceIdAndPort = instanceManager.instances.map((a) => { return { id: a.id, port: a.port } })
    if (instanceIdAndPort.length === 0) {
      req.statusCode = 404;
      return req.hostname;
    }
    try {
      const targetPort = instanceIdAndPort.find(a => a.id === params.apiIdOrName).port
      const host = req.hostname + ":" + (targetPort == null ? 3100 : targetPort)
      return host
    } catch (err) {
      req.statusCode = 500;
      return req.hostname
    }
  },
  {
    memoizeHost: false,
    parseReqBody: false,
    proxyReqPathResolver: (req) => {
      return new Promise((resolve, reject) => {
        if (req.statusCode === 404) {
          reject("Api not Found")
        }
        const id = req.params.apiIdOrName;
        const instance = instanceManager.instances.find(i => i.id === id)
        if (instance && instance.status === Instance.statusType.ERROR) {
          reject(instance.error)
        }
        
        let target = req.baseUrl.split(id+"/")[1];

        resolve("/" + target)
      })
    }
  }
  ))

  router.get("/instances", function (req, res) {
    res.json(
      instanceManager.instances.map(a => Instance.getClearedInstance(a))
    )
  })

  router.get("/instances/:id/:action", async function (req, res) {
    const instance = instanceManager.instances.find(a => a.id === req.params.id)
    if (instance != null) {
      switch (req.params.action) {
        case "restart":
          await instance.restart()
          break;
        case "stop":
          await instance.stop()
          break;
        default:
          res.status(500)
          res.json(Instance.getClearedInstance(instance))
      }

      res.status(200)
      res.send()
    } else {
      res.status(404)
      res.send("Instance not found")
    }
  })
}

module.exports = {
  router,
  init
}
