import React from 'react'
import { Observer } from 'mobx-react-lite'

import EstimatesScheduled from '../components/EstimatesScheduled'
import AuthChecker from '../components/common/AuthChecker'

const EstimatesScheduledPage = () => {
  return <Observer>{() => <AuthChecker children={<EstimatesScheduled />} />}</Observer>
}

export default EstimatesScheduledPage
