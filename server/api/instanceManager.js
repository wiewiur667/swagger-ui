'use strict'

import { Subject } from 'rxjs'
import Instance from './instance'
import DirHandler from './dirHandler'

import {config} from "./config"

var debug = require("debug")
var log = debug("app:devServer")

export default class InstanceManager {
  constructor () {
    this.actions = {
      ADD: 'ADD',
      REMOVE: 'REMOVE',
      UPDATE: 'UPDATE'
    }

    this.instances = []
    this.instancesEvents = new Subject()
  }

  fromFileWatcher (fileWatcher) {
    fileWatcher.subscribe(async (fileObject) => {
      let instance = new Instance(fileObject.file,{host: config.host})
      instance.events.subscribe((data) => {
        this.instancesEvents.next(data)
      })
      if (fileObject.event === DirHandler.events.ADD) {
        this.instances.push(instance)
        await instance.createHandler()
      } else if (fileObject.event === DirHandler.events.DELETE) {
        instance = this.instances.find(i=> i.file === fileObject.file)
        this._removeInstance(instance.id)
      }
    })
  }

  getInstance(id) {
    return this.instances.find(i=> i.id === id)
  }

  _removeInstance(id) {
    let instance = this.getInstance(id)
    instance.stop()
    this.instances.splice(this.instances.indexOf(instance),1)
    instance.remove()
  }
}
