import React from "react"
import PropTypes from "prop-types"

export default class InstanceContoller extends React.Component {

  constructor(props, context) {
    super(props, context)

    this.state = {currentInstance: null}
  }

  componentWillReceiveProps() {
    this.setState((state, props)=>{
      console.log(props);
    })
  }

  stopInstance(){
    let currentInstanceId = this.props.instanceServerSelectors.currentInstanceId()
    this.props.instanceServerActions.stopInstance(currentInstanceId)
  }

  restartInstance() {
    let currentInstanceId = this.props.instanceServerSelectors.currentInstanceId()
    this.props.instanceServerActions.restartInstance(currentInstanceId)
  }
  

  render() {
    let currentInstanceId = this.props.instanceServerSelectors.currentInstanceId()
    let currentInstance = this.props.instanceServerSelectors.instances().find(i=> i.id == currentInstanceId)
    const url = window.location.origin + "/api/mock/" + currentInstance.id + "/"
    let isWorking = currentInstance.status === "WORKING"

    return (
      <div className="instance-controller">
        <div className="row">
          <div className="instance-info ">
            <a href={url}>{url}</a>
            <span>Status: {currentInstance.status}</span>
          </div>
          <div className="instance-url">
          </div>
          <div className="instance-buttons">
            <button className="btn btn-restart" onClick={(e)=> this.restartInstance(e)}>Restart</button>
            {isWorking && 
              <button className="btn btn-stop" onClick={(e)=> this.stopInstance(e)}>STOP</button>
            }
          </div>
        </div>
        <div className="instance-log row"><pre>{currentInstance.log.join("\r\n")}</pre></div>
      </div>
      
    )
  }
}

InstanceContoller.propTypes = {
  instanceServerSelectors: PropTypes.object.isRequired,
  instanceServerActions: PropTypes.object.isRequired,
}