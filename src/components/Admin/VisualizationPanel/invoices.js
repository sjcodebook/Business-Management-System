import React, { useState, useEffect } from 'react'
import * as dayjs from 'dayjs'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { Scrollbars } from 'react-custom-scrollbars'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import Grid from '@material-ui/core/Grid'
import TextField from '@material-ui/core/TextField'

import {
  getDay,
  getWeekRange,
  round,
  numberWithCommas,
  calculatePriceWithoutTax,
} from '../../../scripts/localActions'
import {
  setListenerOnUnpaidInvoicesByThreshold,
  setListenerOnPaidInvoicesByThreshold,
} from '../../../scripts/remoteActions'

import appStore from '../../../store/AppStore'

import {
  TimePanel,
  ResizeBtn,
  daysInCurrentWeek,
  daysInYearToDate,
  daysInLastFourWeeks,
  daysInLastSixMonths,
  daysInLastThreeMonths,
  daysInLastTwelveMonths,
} from './common'

const Invoices = ({ chartWidth, setChartWidth }) => {
  const [tabVal, setTabVal] = useState(0)

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Paper style={{ backgroundColor: appStore.darkMode ? '#303030' : '#fcfcfc' }}>
          <Paper square style={{ backgroundColor: appStore.darkMode ? '#303030' : '#fcfcfc' }}>
            <Tabs
              value={tabVal}
              indicatorColor={appStore.darkMode ? 'secondary' : 'primary'}
              textColor={appStore.darkMode ? 'secondary' : 'primary'}
              variant='scrollable'
              scrollButtons='auto'
              onChange={(event, newValue) => {
                setTabVal(newValue)
              }}>
              <Tab label='Unpaid' />
              <Tab label='Paid' />
            </Tabs>
          </Paper>
          <br />
          <div style={{ marginLeft: 10, marginRight: 10 }}>
            {tabVal === 0 && (
              <UnpaidInvoices chartWidth={chartWidth} setChartWidth={setChartWidth} />
            )}
            {tabVal === 1 && <PaidInvoices chartWidth={chartWidth} setChartWidth={setChartWidth} />}
          </div>
        </Paper>
      </Grid>
    </Grid>
  )
}

const constructInvoiceDateMap = (invoices, key, setDateMap) => {
  let dateMap = {}
  invoices.forEach((invoice) => {
    let totalWithoutTax = calculatePriceWithoutTax(JSON.parse(invoice.allInfo), 'INVOICE', false)
    let normalisedDate = dayjs.unix(invoice[key]).startOf('day').unix()
    if (!dateMap[normalisedDate]) {
      dateMap[normalisedDate] = {
        revenue: totalWithoutTax,
        count: 1,
      }
    } else {
      dateMap[normalisedDate]['revenue'] = dateMap[normalisedDate]['revenue'] + totalWithoutTax
      dateMap[normalisedDate]['count'] = dateMap[normalisedDate]['count'] + 1
    }
  })
  setDateMap(dateMap)
}

const constructInvoiceData = (
  timePeriod,
  startThreshold,
  endThreshold,
  dateMap,
  setData,
  setTotalCount
) => {
  const startUnix =
    timePeriod === 0 ? startThreshold : dayjs().subtract(timePeriod, 'day').startOf('day').unix()
  const endUnix = timePeriod === 0 ? endThreshold : dayjs().endOf('day').unix()
  let newDateMap = {}
  const setNewDateMap = (key, date) => {
    if (date >= startUnix && date <= endUnix) {
      if (!newDateMap[key]) {
        newDateMap[key] = {
          revenue: dateMap[date]['revenue'],
          count: dateMap[date]['count'],
        }
      } else {
        newDateMap[key] = {
          revenue: newDateMap[key]['revenue'] + dateMap[date]['revenue'],
          count: newDateMap[key]['count'] + dateMap[date]['count'],
        }
      }
    }
  }
  if ([0, daysInCurrentWeek, daysInLastFourWeeks].includes(timePeriod)) {
    Object.keys(dateMap).forEach((date) => {
      let dayKey = `(${getDay(dayjs.unix(date).day(), true)}) ${dayjs.unix(date).format('DD MMM')}`
      setNewDateMap(dayKey, date)
    })
  }
  if ([daysInLastThreeMonths, daysInLastSixMonths].includes(timePeriod)) {
    Object.keys(dateMap).forEach((date) => {
      let weekKey = getWeekRange(date)
      setNewDateMap(weekKey, date)
    })
  }
  if ([daysInLastTwelveMonths, daysInYearToDate].includes(timePeriod)) {
    Object.keys(dateMap).forEach((date) => {
      let monthKey = dayjs.unix(date).format('MMM')
      setNewDateMap(monthKey, date)
    })
  }
  setData(
    Object.keys(newDateMap).map((key) => {
      return {
        date: key,
        revenue: round(newDateMap[key]['revenue'], 2),
        count: newDateMap[key]['count'],
      }
    })
  )
  setTotalCount(
    round(
      Object.values(newDateMap).reduce((acc, curr) => {
        return acc + curr.count
      }, 0),
      2
    )
  )
}

const UnpaidInvoices = ({ chartWidth, setChartWidth }) => {
  const [timePeriod, setTimePeriod] = useState(daysInCurrentWeek)
  const [unpaidInvoices, setUnpaidInvoices] = useState([])
  const [dateMap, setDateMap] = useState({})
  const [totalCount, setTotalCount] = useState(0)
  const [data, setData] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [startThreshold, setStartThreshold] = useState(
    dayjs().subtract(daysInYearToDate, 'day').startOf('day').unix()
  )
  const [endThreshold, setEndThreshold] = useState(dayjs().endOf('day').unix())

  useEffect(() => {
    setStartThreshold(
      dayjs()
        .subtract(timePeriod !== 0 ? daysInLastTwelveMonths : 30, 'day')
        .startOf('day')
        .unix()
    )
    setEndThreshold(dayjs().endOf('day').unix())
  }, [timePeriod])

  useEffect(() => {
    setIsLoading(true)
    let unsubscribeListenerOnUnpaidInvoicesByThreshold = setListenerOnUnpaidInvoicesByThreshold(
      startThreshold,
      endThreshold,
      setUnpaidInvoices,
      false
    )
    setTimeout(() => {
      setIsLoading(false)
    }, 800)
    return () => {
      if (typeof unsubscribeListenerOnUnpaidInvoicesByThreshold === 'function') {
        unsubscribeListenerOnUnpaidInvoicesByThreshold()
      }
    }
  }, [endThreshold, startThreshold])

  useEffect(() => {
    constructInvoiceDateMap(unpaidInvoices, 'createdAt', setDateMap)
  }, [unpaidInvoices])

  useEffect(() => {
    constructInvoiceData(timePeriod, startThreshold, endThreshold, dateMap, setData, setTotalCount)
  }, [timePeriod, dateMap, startThreshold, endThreshold])

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <TimePanel timePeriod={timePeriod} setTimePeriod={setTimePeriod} />
      </Grid>
      {timePeriod === 0 && (
        <Grid item xs={12}>
          <div style={{ textAlign: 'center' }}>
            <TextField
              label='Start Date'
              value={dayjs.unix(startThreshold).format('YYYY-MM-DD')}
              type='date'
              style={{ marginRight: 20 }}
              onChange={(e) => {
                setStartThreshold(dayjs(e.target.value, 'YYYY-MM-DD').startOf('day').unix())
              }}
              InputLabelProps={{
                shrink: true,
              }}
            />
            <TextField
              label='End Date'
              value={dayjs.unix(endThreshold).format('YYYY-MM-DD')}
              type='date'
              onChange={(e) => {
                setEndThreshold(dayjs(e.target.value, 'YYYY-MM-DD').endOf('day').unix())
              }}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </div>
        </Grid>
      )}
      <Grid item xs={12}>
        <Typography align='center' variant='h6' style={{ marginTop: 10 }}>
          Total: {isLoading ? 'Loading...' : numberWithCommas(totalCount) + ' Unpaid Invoices'}
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <ResizeBtn setChartWidth={setChartWidth} />
      </Grid>
      <Grid item xs={12}>
        <Scrollbars style={{ height: 550 }}>
          <AreaChart
            width={chartWidth}
            height={500}
            data={data}
            margin={{
              top: 30,
            }}>
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis dataKey='date' />
            <YAxis />
            <Tooltip labelStyle={{ color: '#303030' }} />
            <Area
              name='number of unpaid invoices'
              type='linear'
              dataKey='count'
              stroke={appStore.darkMode ? '#ef5f91' : '#8884d8'}
              fill={appStore.darkMode ? '#ef5f91' : '#8884d8'}
            />
            <Legend verticalAlign='bottom' height={5} />
          </AreaChart>
        </Scrollbars>
      </Grid>
    </Grid>
  )
}

const PaidInvoices = ({ chartWidth, setChartWidth }) => {
  const [timePeriod, setTimePeriod] = useState(daysInCurrentWeek)
  const [paidInvoices, setPaidInvoices] = useState([])
  const [dateMap, setDateMap] = useState({})
  const [totalCount, setTotalCount] = useState(0)
  const [data, setData] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [startThreshold, setStartThreshold] = useState(
    dayjs().subtract(daysInYearToDate, 'day').startOf('day').unix()
  )
  const [endThreshold, setEndThreshold] = useState(dayjs().endOf('day').unix())

  useEffect(() => {
    setStartThreshold(
      dayjs()
        .subtract(timePeriod !== 0 ? daysInLastTwelveMonths : 30, 'day')
        .startOf('day')
        .unix()
    )
    setEndThreshold(dayjs().endOf('day').unix())
  }, [timePeriod])

  useEffect(() => {
    setIsLoading(true)
    let unsubscribeListenerOnPaidInvoicesByThreshold = setListenerOnPaidInvoicesByThreshold(
      startThreshold,
      endThreshold,
      setPaidInvoices,
      false
    )
    setTimeout(() => {
      setIsLoading(false)
    }, 800)
    return () => {
      if (typeof unsubscribeListenerOnPaidInvoicesByThreshold === 'function') {
        unsubscribeListenerOnPaidInvoicesByThreshold()
      }
    }
  }, [endThreshold, startThreshold])

  useEffect(() => {
    constructInvoiceDateMap(paidInvoices, 'paidOn', setDateMap)
  }, [paidInvoices])

  useEffect(() => {
    constructInvoiceData(timePeriod, startThreshold, endThreshold, dateMap, setData, setTotalCount)
  }, [timePeriod, dateMap, startThreshold, endThreshold])

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <TimePanel timePeriod={timePeriod} setTimePeriod={setTimePeriod} />
      </Grid>
      {timePeriod === 0 && (
        <Grid item xs={12}>
          <div style={{ textAlign: 'center' }}>
            <TextField
              label='Start Date'
              value={dayjs.unix(startThreshold).format('YYYY-MM-DD')}
              type='date'
              style={{ marginRight: 20 }}
              onChange={(e) => {
                setStartThreshold(dayjs(e.target.value, 'YYYY-MM-DD').startOf('day').unix())
              }}
              InputLabelProps={{
                shrink: true,
              }}
            />
            <TextField
              label='End Date'
              value={dayjs.unix(endThreshold).format('YYYY-MM-DD')}
              type='date'
              onChange={(e) => {
                setEndThreshold(dayjs(e.target.value, 'YYYY-MM-DD').endOf('day').unix())
              }}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </div>
        </Grid>
      )}
      <Grid item xs={12}>
        <Typography align='center' variant='h6' style={{ marginTop: 10 }}>
          Total: {isLoading ? 'Loading...' : numberWithCommas(totalCount) + ' Paid Invoices'}
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <ResizeBtn setChartWidth={setChartWidth} />
      </Grid>
      <Grid item xs={12}>
        <Scrollbars style={{ height: 550 }}>
          <AreaChart
            width={chartWidth}
            height={500}
            data={data}
            margin={{
              top: 30,
            }}>
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis dataKey='date' />
            <YAxis />
            <Tooltip labelStyle={{ color: '#303030' }} />
            <Area
              name='number of paid invoices'
              type='linear'
              dataKey='count'
              stroke={appStore.darkMode ? '#ef5f91' : '#8884d8'}
              fill={appStore.darkMode ? '#ef5f91' : '#8884d8'}
            />
            <Legend verticalAlign='bottom' height={5} />
          </AreaChart>
        </Scrollbars>
      </Grid>
    </Grid>
  )
}

export default Invoices
