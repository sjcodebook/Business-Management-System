import React from 'react'
import { Observer } from 'mobx-react-lite'

import LeadsAssigned from '../components/LeadsAssigned'
import AuthChecker from '../components/common/AuthChecker'

const LeadsAssignedPage = () => {
  return <Observer>{() => <AuthChecker children={<LeadsAssigned />} />}</Observer>
}

export default LeadsAssignedPage
