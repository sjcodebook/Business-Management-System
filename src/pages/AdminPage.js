import React from 'react'
import { Observer } from 'mobx-react-lite'

import AdminDash from '../components/Admin/AdminDash'
import AuthChecker from '../components/common/AuthChecker'

const AdminPage = () => {
  return <Observer>{() => <AuthChecker children={<AdminDash />} />}</Observer>
}

export default AdminPage
