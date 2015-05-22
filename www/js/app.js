/* global React, Route, DefaultRoute */
import core_js from 'core-js'
import React from 'react'
import Router from 'react-router'
import routes from './routes'
// const a11y = require('react-a11y')
// a11y()

Notification.requestPermission(permission => ({}))

Router.run(routes, Router.HistoryLocation, function (Handler) {
  React.render(<Handler/>, document.body)
})
