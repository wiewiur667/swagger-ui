export const UPDATE_INSTANCES = "instance_update_instances"
export const REMOVE_INSTANCES = "instance_remove_instances"
export const RESTART_INSTANCE = "instance_restart_instance"
export const STOP_INSTANCE = "instance_stop_instance"
export const LIST_INSTANCES = "instance_list_instances"
export const SET_CURRENT_INSTANCE = "instance_set_current_instance"

export function listInstances(instances) {
  return {
    type: LIST_INSTANCES,
    payload: instances
  }
}

export function setCurrentInstance(instance) {
  return {
    type: SET_CURRENT_INSTANCE,
    payload: instance
  }
}

export function updateInstances(instance) {
  return {
    type: UPDATE_INSTANCES,
    payload: instance
  }
}

export function removeInstances(instance) {
  return {
    type: REMOVE_INSTANCES,
    payload: instance
  }
}

export function restartInstance(id) {
  return ({socketIO}) => {
    socketIO.emit("instanceAction", {id: id, action: "RESTART"},()=> {
      return
    })
  }
}

export function stopInstance(id) {
  return ({socketIO}) => {
    socketIO.emit("instanceAction", { id: id, action: "STOP" }, ()=> {
      return
    })
  }
}
