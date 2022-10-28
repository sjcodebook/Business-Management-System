import React from 'react'
import { Observer } from 'mobx-react-lite'

import TimeTracker from './../components/TimeTracker'
import AuthChecker from './../components/common/AuthChecker'

const TimeTrackerPage = () => {
  return <Observer>{() => <AuthChecker children={<TimeTracker />} />}</Observer>
}

export default TimeTrackerPage
