import StandaloneLayout from "./layout"
import TopbarPlugin from "plugins/topbar-mock-instances"
import MockServerPlugin from "plugins/mock-server"
import ConfigsPlugin from "corePlugins/configs"

// the Standalone preset

export default [
  TopbarPlugin,
  MockServerPlugin,
  ConfigsPlugin,
  () => {
    return {
      components: { StandaloneLayout }
    }
  }
]
