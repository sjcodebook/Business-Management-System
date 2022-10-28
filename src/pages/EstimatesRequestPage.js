import React from 'react'
import { Observer } from 'mobx-react-lite'

import EstimatesRequest from './../components/EstimatesRequest'
import AuthChecker from './../components/common/AuthChecker'

const EstimatesRequestPage = () => {
  return <Observer>{() => <AuthChecker children={<EstimatesRequest />} />}</Observer>
}

export default EstimatesRequestPage
