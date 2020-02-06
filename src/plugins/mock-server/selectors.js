const state = state => state

export const instances = state => {
  return state.get("instances")
}

export const currentInstanceId = state => {
  return state.get("currentInstance")
}

export const specFile = state => {
  return state.get("currentSpecFile")
}