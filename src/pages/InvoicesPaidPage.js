import React from 'react'
import { Observer } from 'mobx-react-lite'

import InvoicesPaid from '../components/InvoicesPaid'
import AuthChecker from '../components/common/AuthChecker'

const InvoicesPaidPage = () => {
  return <Observer>{() => <AuthChecker children={<InvoicesPaid />} />}</Observer>
}

export default InvoicesPaidPage
