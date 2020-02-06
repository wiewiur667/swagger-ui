import React, { cloneElement } from "react"
import PropTypes from "prop-types"

//import "./topbar.less"
import Logo from "./logo_small.svg"
import {parseSearch, serializeSearch} from "../../core/utils"

export default class Topbar extends React.Component {

  static propTypes = {
    layoutActions: PropTypes.object.isRequired
  }

  constructor(props, context) {
    super(props, context)
    this.state = {initialized: false, instances: [], selectedInstance: null }
  }

  componentWillReceiveProps() {
    this.setState((state, props)=> {
      let instances = props.instanceServerSelectors.instances() || []
      if(instances.length) {
        
        if(this.state.initialized === false){
          var selectedInstanceId = instances[0].id
          this.selectSpec(selectedInstanceId)
        }
        
        return {
          initialized: true,
          instances: instances, 
          selectedInstance: selectedInstanceId 
        }
      }

      return {}
    })
  }

  selectSpec(id) {
    this.props.specActions.socketFetchSpec(id)
    this.setSelectedSpec(id)
    this.props.instanceServerActions.setCurrentInstance(id)
  }

  onSpecSelect = (e) => {
    let id = e.target.value
    this.selectSpec(id)
    e.preventDefault()
  }

  setSelectedSpec = (selectedInstanceId) => {
    if(selectedInstanceId)
    {
      const isAvailable = this.state.instances.find(i=> i.id == selectedInstanceId)
      if(isAvailable) {
        this.setState({selectedInstance: selectedInstanceId})
      }
    }
  }

  render() {
    let { getComponent, specSelectors } = this.props
    const Link = getComponent("Link")

    let isLoading = specSelectors.loadingStatus() === "loading"
    let isFailed = specSelectors.loadingStatus() === "failed"

    let inputStyle = {}
    if(isFailed) inputStyle.color = "red"
    if(isLoading) inputStyle.color = "#aaa"


    let control = []
    if(this.state.instances.length){
      const instances = this.state.instances.map(i=> {
        return {
          id: i.id,
          file: i.file
        }
      })
      
      if(instances) {
        let rows = []
        instances.forEach((inst, i) => {
          let fileArr = inst.file.split("\\")
          let name = fileArr[fileArr.length-1]
          rows.push(<option key={i} value={inst.id}>{name}</option>)
        })
  
        control.push(
          <label className="select-label" htmlFor="select"><span>Select a definition</span>
            <select id="select" disabled={isLoading} onChange={ this.onSpecSelect } value={this.state.selectedInstance || undefined}>
              {rows}
            </select>
          </label>
        )
      }

    }else {
      control.push(
        <label className="select-label" htmlFor="select"><span>Select a definition</span>
          <select id="select" disabled={isLoading}>
            <option>No instances</option>
          </select>
        </label>
      )
    }
    

    return (
      <div className="topbar">
        <div className="wrapper">
          <div className="topbar-wrapper">
            <Link>
              <img height="40" src={ Logo } alt="Swagger UI"/>
            </Link>
            <form className="download-url-wrapper">
              {control.map((el, i) => cloneElement(el, { key: i }))}
            </form>
          </div>
        </div>
      </div>
    )
  }
}

Topbar.propTypes = {
  instanceServerActions: PropTypes.object.isRequired,
  instanceServerSelectors: PropTypes.object.isRequired,
  specSelectors: PropTypes.object.isRequired,
  specActions: PropTypes.object.isRequired,
  getComponent: PropTypes.func.isRequired,
  getConfigs: PropTypes.func.isRequired
}
