import { Subject } from "rxjs"
import path from "path"

const { exec } = require("child_process")
const uuid = require("uuid/v5")
const getPort = require("get-port")

export default class Instance {
  constructor (file, options) {
    this.id = uuid(path.parse(file).base, "35d71609-d7d1-4028-a017-a11c03d53e4e")
    this.file = file
    this.port = null
    this.handler = null
    this.status = null
    this.error = null

    this.options = {
      host: "127.0.0.1",
      portRange: [4000, 65535],
      url: null
    }

    if(options){
      Object.assign(this.options, options)
    }
    
    this.events = new Subject()

    this._updateStatus(this.status)
  }

  static get statusType () {
    return Object.freeze({
      CREATED: "CREATED",
      REMOVED: "REMOVED",
      UNKNOWN: "UNKNOWN",
      RESTARTING: "RESTARTING",
      SPINNING_UP: "SPINNING_UP",
      WORKING: "WORKING",
      STOPPED: "STOPPED",
      ERROR: "ERROR",
      FAILED: "FAILED"
    })
  }

  async createHandler (file = this.file) {
    this.error = null
    this._updateStatus(Instance.statusType.SPINNING_UP)

    this.port = await getPort({ host: this.options.host, port: getPort.makeRange(this.options.portRange[0], this.options.portRange[1]) })

    const command = `prism mock -p ${this.port} "${this.file}"`
    const prism = await exec(command)

    prism.stdout.on("data", (data) => {
      if (data.indexOf("Prism is listening") > 0) {
        const prismPort = /:(\d{3,})/.exec(data)[1]

        if (parseInt(prismPort) === this.port) {
          this.handler = prism

          this._updateStatus(Instance.statusType.WORKING)
        }
      } else if (data.indexOf("fatal") > 0) {
        this.error = data
        this._updateStatus(Instance.statusType.ERROR)
      }
    })

    prism.stderr.on("data", (data) => {
      this.error = data
      this._updateStatus(Instance.statusType.ERROR)
    })
  }

  async restart () {
    this.stop()
    this._updateStatus(Instance.statusType.RESTARTING)
    this.handler = null
    this.port = null
    await this.createHandler(this.port)
  }

  stop () {
    try {
      if (this.handler.kill("SIGINT") === true) {
        this.handler = null
        this.port = null
        this._updateStatus(Instance.statusType.STOPPED)
        return true
      } else {
        this.error = "Failed to stop"
        this._updateStatus(Instance.statusType.FAILED)
        return false
      }
    } catch (err) {
      return false
    }
  }

  remove() {
    this._updateStatus(Instance.statusType.REMOVED)
  }

  _updateStatus (status) {
    this.status = status
    this.events.next(this)
  }

  static getClearedInstance (instance) {
    return {
      id: instance.id,
      file: instance.file,
      port: instance.port,
      status: instance.status,
      error: instance.error,
      url: instance.url
    }
  }
}
