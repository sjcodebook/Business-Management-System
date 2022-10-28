import React from 'react'
import { Observer } from 'mobx-react-lite'

import ContactInfo from '../components/ContactInfo'
import AuthChecker from '../components/common/AuthChecker'

const ContactInfoPage = () => {
  return <Observer>{() => <AuthChecker children={<ContactInfo />} />}</Observer>
}

export default ContactInfoPage
