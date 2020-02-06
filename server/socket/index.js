import Instance from "../api/instance"
import fs from "fs"
import { distinctUntilKeyChanged, distinct } from "rxjs/operators"

export default class Socket {
  constructor(io, instanceManager) {
    this.io = io
    this.instanceManager = instanceManager
  }

  connected() {
    var that = this
    this.io.on("connection", (socket) => {
      socket.emit("listInstances", that.instanceManager.instances.map(i => Instance.getClearedInstance(i)))
      this.listenToGetSpecFile(socket, that.instanceManager)
      this.listenToInstanceAction(socket, that.instanceManager)

      this.onInstancesUpdate(that.instanceManager, (instances) =>
        socket.emit("instancesUpdated", instances.map(i => Instance.getClearedInstance(i)))
      )
    })
  }

  listenToGetSpecFile(socket, instanceManager) {
    socket.on("getSpecFile", async (id, ackFn) => {
      let instance = instanceManager.instances.find(i => i.id == id);
      if (instance) {
        fs.readFile(instance.file, 'utf8', (err, contents) => {
          if (err) {
            ackFn("error")
            return
          }
          ackFn(contents)
        })
      }
    })
  }

  onInstancesUpdate(instanceManager, callback) {
    instanceManager.instancesEvents.subscribe(instances => {
      callback([instances])
    })
  }

  listenToInstanceAction(socket, instanceManager) {
    socket.on("instanceAction", async ({id, action}, ackFn)=> {
      const instance = instanceManager.instances.find(i=> i.id == id)
      switch(action) {
        case "RESTART":
          instance.restart()
          ackFn()
        break
        case "STOP":
          instance.stop()
          ackFn()
        break
      }
    })
  }
}