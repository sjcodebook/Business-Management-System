import React from 'react'
import { Observer } from 'mobx-react-lite'

import EstimatesDraft from '../components/EstimatesDraft'
import AuthChecker from '../components/common/AuthChecker'

const EstimatesDraftPage = () => {
  return <Observer>{() => <AuthChecker children={<EstimatesDraft />} />}</Observer>
}

export default EstimatesDraftPage
