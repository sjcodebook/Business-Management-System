import React from 'react'
import { Observer } from 'mobx-react-lite'

import ProductionCalendar from './../components/ProductionCalendar'
import AuthChecker from './../components/common/AuthChecker'

const ProductionCalendarPage = () => {
  return <Observer>{() => <AuthChecker children={<ProductionCalendar />} />}</Observer>
}

export default ProductionCalendarPage
