import * as actions from "./actions"
import reducers from "./reducers"
import * as selectors from "./selectors"
import InstanceController from "./instanceController"

import socketIOClient from "socket.io-client"

export default function(system) {
  return {
    afterLoad(system) {
      this.rootInjects = this.rootInjects || {}
      const io = socketIOClient("http://127.0.0.1:3000/socket")
      this.rootInjects.socketIO = io
      
      io.on("connect", ()=> {
        console.log("connected");
      })

      io.on("listInstances", (instances)=> {
        system.instanceServerActions.listInstances(instances)
      })

      io.on("getSpecFileResponse", (spec)=> {
        system.instanceServerActions.setSpecFile(spec)
      })

      io.on("instancesUpdated", (instances)=> {
        instances.forEach(i=>{
          system.instanceServerActions.updateInstances([i])
          if(i.status === "REMOVED") {
            system.instanceServerActions.removeInstances([i])
            system.instanceServerActions.setCurrentInstance(system.instanceServerSelectors.instances()[0].id)
          }
        })
      })
    },
    components: {
      InstanceController: InstanceController
    },
    statePlugins: {
      instanceServer: {
        reducers,
        actions,
        selectors
      },
      spec: {
        actions: {
          socketFetchSpec : (id) =>  ({socketIO, specActions}) =>  {
            specActions.updateLoadingStatus("loading")
            socketIO.emit("getSpecFile", id, (response)=> {
              specActions.updateSpec(response)
              specActions.updateLoadingStatus("success")
              
            })

            return
          }
        }
      }
    }
  }
}