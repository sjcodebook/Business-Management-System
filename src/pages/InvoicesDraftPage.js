import React from 'react'
import { Observer } from 'mobx-react-lite'

import InvoicesDraft from '../components/InvoicesDraft'
import AuthChecker from '../components/common/AuthChecker'

const InvoicesDraftPage = () => {
  return <Observer>{() => <AuthChecker children={<InvoicesDraft />} />}</Observer>
}

export default InvoicesDraftPage
