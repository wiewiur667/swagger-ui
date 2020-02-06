import { fromJS } from "immutable"
import update from "react-addons-update"

import {
  UPDATE_INSTANCES,
  LIST_INSTANCES,
  SET_CURRENT_INSTANCE,
  STOP_INSTANCE,
  REMOVE_INSTANCES
} from "./actions"

export default {

  [UPDATE_INSTANCES]: (state, action) => {
    let instances = action.payload

    let updatedInstances = state.get("instances").map(stateInstance => {
      let payloadInstance = instances.find(a => a.id === stateInstance.id)
      if (payloadInstance) {
        return update(stateInstance, { $merge: payloadInstance })
      }
      return stateInstance
    })

    instances.forEach(i => {
      if (!updatedInstances.find(a => a.id === i.id)) {
        updatedInstances = update(updatedInstances, { $push: [i] })
      }
    })

    return state.set("instances", updatedInstances)
  },

  [REMOVE_INSTANCES]: (state, action)=> {
    let instances = action.payload
    let updatedInstances = state.get("instances").filter(si=> {
      return !instances.some(i=> i.id == si.id)
    })

    if(updatedInstances.length) {
      return state.set("instances", updatedInstances)
    }

    return state
  },

  [LIST_INSTANCES]: (state, action) => {
    return state.set("instances", action.payload)
  },

  [SET_CURRENT_INSTANCE]: (state, action) => {
    return state.set("currentInstance", action.payload)
  },

  [STOP_INSTANCE]: (state, payload) => {
    let id = payload.payload.id
    let updatedInstances = state.get("instances").filter(i => i.id != id)
    return state.set("instances", updatedInstances)
  }

  // [UPDATE_INSTANCE]: (state, payload) => state.set("instances", fromJS(payload)),

  // [RESTART_INSTANCE]: (state, payload) => state.set("instances", fromJS(payload)),



  //TODO: do list
}
