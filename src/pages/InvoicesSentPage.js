import React from 'react'
import { Observer } from 'mobx-react-lite'

import InvoicesSent from '../components/InvoicesSent'
import AuthChecker from '../components/common/AuthChecker'

const InvoicesSentPage = () => {
  return <Observer>{() => <AuthChecker children={<InvoicesSent />} />}</Observer>
}

export default InvoicesSentPage
