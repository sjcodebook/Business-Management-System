import React from 'react'
import { Observer } from 'mobx-react-lite'

import SoldEstimates from './../components/SoldEstimates'
import AuthChecker from './../components/common/AuthChecker'

const SoldPage = () => {
  return <Observer>{() => <AuthChecker children={<SoldEstimates />} />}</Observer>
}

export default SoldPage
