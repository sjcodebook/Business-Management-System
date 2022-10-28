import React from 'react'
import { Observer } from 'mobx-react-lite'

import Clients from './../components/Clients'
import AuthChecker from './../components/common/AuthChecker'

const ClientsPage = () => {
  return <Observer>{() => <AuthChecker children={<Clients />} />}</Observer>
}

export default ClientsPage
