import path from 'path'
import { Observable, merge, fromEvent, from } from 'rxjs'
import { distinctUntilChanged, map } from 'rxjs/operators'
import chokidar from 'chokidar'

var debug = require("debug")
var log = debug("app:devServer")

export default class DirHandler {
  constructor (relativeDir) {
    this.directory = path.join(__dirname, relativeDir)
    this.changesAndAdditions = new Observable()
  }

  static get events () {
    return Object.freeze({
      ADD: 'ADD',
      DELETE: 'DELETE'
    })
  }

  watchFiles (relativeDir = this.directory) {
    log("Watching files")
    const p = path.isAbsolute(relativeDir) ? relativeDir : path.join(__dirname, relativeDir)
    const dirWatcher = chokidar.watch(path.join(p, '*.yaml|*.json'))

    const newFiles$ = fromEvent(dirWatcher, 'add')
    const removedFiles$ = fromEvent(dirWatcher, 'unlink')

    const changes$ =
      merge(
        newFiles$.pipe(map((a) => { return { event: DirHandler.events.ADD, file: a[0] } })),
        removedFiles$.pipe(map((a) => { return { event: DirHandler.events.DELETE, file: a } }))
      )
        .pipe(distinctUntilChanged())

    this.changesAndAdditions = from(changes$)

    return this.changesAndAdditions
  }
}
