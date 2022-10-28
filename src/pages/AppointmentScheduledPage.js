import React from 'react'
import { Observer } from 'mobx-react-lite'

import AppointmentScheduled from '../components/AppointmentScheduled'
import AuthChecker from '../components/common/AuthChecker'

const AppointmentScheduledPage = () => {
  return <Observer>{() => <AuthChecker children={<AppointmentScheduled />} />}</Observer>
}

export default AppointmentScheduledPage
