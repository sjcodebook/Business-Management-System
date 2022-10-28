import React from 'react'
import { Observer } from 'mobx-react-lite'

import SaleLostEstimates from './../components/SaleLostEstimates'
import AuthChecker from './../components/common/AuthChecker'

const SaleLostPage = () => {
  return <Observer>{() => <AuthChecker children={<SaleLostEstimates />} />}</Observer>
}

export default SaleLostPage
