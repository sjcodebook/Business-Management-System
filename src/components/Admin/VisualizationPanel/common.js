import React from 'react'
import * as dayjs from 'dayjs'
import AddIcon from '@material-ui/icons/Add'
import RemoveIcon from '@material-ui/icons/Remove'
import Paper from '@material-ui/core/Paper'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'

import appStore from '../../../store/AppStore'

export const daysInCurrentWeek = dayjs().day() + 1
export const daysInYearToDate = dayjs().diff(dayjs().startOf('year'), 'days')
export const daysInLastFourWeeks = dayjs().diff(dayjs().subtract(4, 'weeks'), 'days')
export const daysInLastThreeMonths = dayjs().diff(dayjs().subtract(3, 'months'), 'days')
export const daysInLastSixMonths = dayjs().diff(dayjs().subtract(6, 'months'), 'days')
export const daysInLastTwelveMonths = dayjs().diff(dayjs().subtract(12, 'months'), 'days')

export const ResizeBtn = ({ setChartWidth }) => {
  return (
    <div style={{ textAlign: 'right' }}>
      <RemoveIcon
        fontSize='small'
        style={{ cursor: 'pointer', marginRight: 15 }}
        onClick={() => {
          setChartWidth((prevVal) => prevVal - 50)
        }}
      />
      <AddIcon
        fontSize='small'
        style={{ cursor: 'pointer' }}
        onClick={() => {
          setChartWidth((prevVal) => prevVal + 50)
        }}
      />
    </div>
  )
}

export const TimePanel = ({ timePeriod, setTimePeriod }) => {
  return (
    <Paper square style={{ backgroundColor: appStore.darkMode ? '#303030' : '#fcfcfc' }}>
      <Tabs
        value={timePeriod}
        indicatorColor={appStore.darkMode ? 'secondary' : 'primary'}
        textColor={appStore.darkMode ? 'secondary' : 'primary'}
        variant='scrollable'
        scrollButtons='auto'
        onChange={(event, newValue) => {
          setTimePeriod(newValue)
        }}>
        <Tab label='Current Week' value={daysInCurrentWeek} />
        <Tab label='Last 4 Weeks' value={daysInLastFourWeeks} />
        <Tab label='Last 3 months' value={daysInLastThreeMonths} />
        <Tab label='Last 6 months' value={daysInLastSixMonths} />
        <Tab label='Last 12 months' value={daysInLastTwelveMonths} />
        <Tab label='Year To Date' value={daysInYearToDate} />
        <Tab label='Custom Range' value={0} />
      </Tabs>
    </Paper>
  )
}
