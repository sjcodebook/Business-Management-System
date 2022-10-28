import React from 'react'
import { Observer } from 'mobx-react-lite'

import EstimatesSent from './../components/EstimatesSent'
import AuthChecker from './../components/common/AuthChecker'

const EstimatesSentPage = () => {
  return <Observer>{() => <AuthChecker children={<EstimatesSent />} />}</Observer>
}

export default EstimatesSentPage
