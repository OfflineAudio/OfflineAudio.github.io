import React from 'react';
import shallowEqual from 'react-pure-render/shallowEqual';

class PureComponent extends React.Component {

  // shouldComponentUpdate(nextProps, nextState) {
  //   // https://github.com/gaearon/react-pure-render#known-issues
  //   if (this.context.router) {
  //     const changed = this.pureComponentLastPath !== this.context.router.getCurrentPath();
  //     this.pureComponentLastPath = this.context.router.getCurrentPath();
  //     if (changed) return true;
  //   }

  //   const shouldUpdate =
  //     !shallowEqual(this.props, nextProps) ||
  //     !shallowEqual(this.state, nextState);

  //   return shouldUpdate;
  // }

}

PureComponent.contextTypes = {
  router: React.PropTypes.func
};

export default PureComponent;
