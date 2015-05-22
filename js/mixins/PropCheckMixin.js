const PropCheckMixin = {
  componentWillMount() {
    this.validateProps(this.props)
  },

  componentWillReceiveProps(nextProps) {
    this.validateProps(nextProps)
  },

  validateProps(props) {
    const { displayName, propTypes } = this.constructor

    for (let prop in props) {
      if (!propTypes[prop]) {
        console.warn(`You set a property "${prop}" on Component "${displayName}" but did not provide a PropType declaration for this prop.`)
      }
    }
  }
}

export default PropCheckMixin
