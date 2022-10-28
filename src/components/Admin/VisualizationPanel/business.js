import React, { useState, useEffect } from 'react'
import * as dayjs from 'dayjs'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { Scrollbars } from 'react-custom-scrollbars'
import Paper from '@material-ui/core/Paper'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import Grid from '@material-ui/core/Grid'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'

import {
  precisionRound,
  numberWithCommas,
  getDay,
  getWeekRange,
  round,
} from '../../../scripts/localActions'
import {
  setListenerOnApprovedExpensesByThreshold,
  setListenerOnEntriesByThreshold,
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

const Business = ({ chartWidth, setChartWidth }) => {
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
              <Tab label='Payroll' />
              <Tab label='Expenses' />
              <Tab label='WorkTime' />
            </Tabs>
          </Paper>
          <br />
          <div style={{ marginLeft: 10, marginRight: 10 }}>
            {tabVal === 0 && <Payroll chartWidth={chartWidth} setChartWidth={setChartWidth} />}
            {tabVal === 1 && <Expenses chartWidth={chartWidth} setChartWidth={setChartWidth} />}
            {tabVal === 2 && <WorkTime chartWidth={chartWidth} setChartWidth={setChartWidth} />}
          </div>
        </Paper>
      </Grid>
    </Grid>
  )
}

const Payroll = ({ chartWidth, setChartWidth }) => {
  const [timePeriod, setTimePeriod] = useState(daysInCurrentWeek)
  const [entries, setEntries] = useState([])
  const [dateMap, setDateMap] = useState({})
  const [totalAmt, setTotalAmt] = useState(0)
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
    setIsLoading(false)
    let unsubscribeListenerOnEntriesByThreshold = setListenerOnEntriesByThreshold(
      startThreshold,
      endThreshold,
      setEntries
    )
    setTimeout(() => {
      setIsLoading(false)
    }, 800)
    return () => {
      if (typeof unsubscribeListenerOnEntriesByThreshold === 'function') {
        unsubscribeListenerOnEntriesByThreshold()
      }
    }
  }, [endThreshold, startThreshold])

  useEffect(() => {
    let dateMap = {}
    entries.forEach((entry) => {
      let normalisedDate = dayjs.unix(entry.createdAt).startOf('day').unix()
      let totalSalary = entry.totalSalary && entry.totalSalary > 0 ? entry.totalSalary : 0
      if (!dateMap[normalisedDate]) {
        dateMap[normalisedDate] = parseFloat(precisionRound(totalSalary, 2))
      } else {
        dateMap[normalisedDate] = parseFloat(
          precisionRound(dateMap[normalisedDate] + totalSalary, 2)
        )
      }
    })
    setDateMap(dateMap)
  }, [entries])

  useEffect(() => {
    const startUnix =
      timePeriod === 0 ? startThreshold : dayjs().subtract(timePeriod, 'day').startOf('day').unix()
    const endUnix = timePeriod === 0 ? endThreshold : dayjs().endOf('day').unix()
    let newDateMap = {}
    const setNewDateMap = (key, date) => {
      if (date >= startUnix && date <= endUnix) {
        if (!newDateMap[key]) {
          newDateMap[key] = {
            totalValue: dateMap[date],
          }
        } else {
          newDateMap[key] = {
            totalValue: newDateMap[key]['totalValue'] + dateMap[date],
          }
        }
      }
    }
    if ([0, daysInCurrentWeek, daysInLastFourWeeks].includes(timePeriod)) {
      Object.keys(dateMap).forEach((date) => {
        let dayKey = `(${getDay(dayjs.unix(date).day(), true)}) ${dayjs
          .unix(date)
          .format('DD MMM')}`
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
          totalValue: round(newDateMap[key]['totalValue'], 2),
        }
      })
    )
    setTotalAmt(
      round(
        Object.values(newDateMap).reduce((acc, curr) => {
          return acc + curr.totalValue
        }, 0),
        2
      )
    )
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
          Total: {isLoading ? 'Loading...' : '$' + numberWithCommas(totalAmt)}
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
              name='payroll in $'
              type='linear'
              dataKey='totalValue'
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

const Expenses = ({ chartWidth, setChartWidth }) => {
  const [timePeriod, setTimePeriod] = useState(daysInCurrentWeek)
  const [expenses, setExpenses] = useState([])
  const [dateMap, setDateMap] = useState({})
  const [totalAmt, setTotalAmt] = useState(0)
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
    setIsLoading(false)
    let unsubscribeListenerOnExpensesByThreshold = setListenerOnApprovedExpensesByThreshold(
      startThreshold,
      endThreshold,
      setExpenses
    )
    setTimeout(() => {
      setIsLoading(false)
    }, 800)
    return () => {
      if (typeof unsubscribeListenerOnExpensesByThreshold === 'function') {
        unsubscribeListenerOnExpensesByThreshold()
      }
    }
  }, [endThreshold, startThreshold])

  useEffect(() => {
    let dateMap = {}
    expenses.forEach((expense) => {
      let normalisedDate = dayjs
        .unix(expense.forDate || expense.createdAt)
        .startOf('day')
        .unix()
      let totalAmount = expense.totalAmount && expense.totalAmount > 0 ? expense.totalAmount : 0
      if (!dateMap[normalisedDate]) {
        dateMap[normalisedDate] = parseFloat(precisionRound(totalAmount, 2))
      } else {
        dateMap[normalisedDate] = parseFloat(
          precisionRound(dateMap[normalisedDate] + totalAmount, 2)
        )
      }
    })
    setDateMap(dateMap)
  }, [expenses])

  useEffect(() => {
    const startUnix =
      timePeriod === 0 ? startThreshold : dayjs().subtract(timePeriod, 'day').startOf('day').unix()
    const endUnix = timePeriod === 0 ? endThreshold : dayjs().endOf('day').unix()
    let newDateMap = {}
    const setNewDateMap = (key, date) => {
      if (date >= startUnix && date <= endUnix) {
        if (!newDateMap[key]) {
          newDateMap[key] = {
            totalValue: dateMap[date],
          }
        } else {
          newDateMap[key] = {
            totalValue: newDateMap[key]['totalValue'] + dateMap[date],
          }
        }
      }
    }
    if ([0, daysInCurrentWeek, daysInLastFourWeeks].includes(timePeriod)) {
      Object.keys(dateMap).forEach((date) => {
        let dayKey = `(${getDay(dayjs.unix(date).day(), true)}) ${dayjs
          .unix(date)
          .format('DD MMM')}`
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
          totalValue: round(newDateMap[key]['totalValue'], 2),
        }
      })
    )
    setTotalAmt(
      round(
        Object.values(newDateMap).reduce((acc, curr) => {
          return acc + curr.totalValue
        }, 0),
        2
      )
    )
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
          Total: {isLoading ? 'Loading...' : '$' + numberWithCommas(totalAmt)}
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
              name='Expenses in $'
              type='linear'
              dataKey='totalValue'
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

const WorkTime = ({ chartWidth, setChartWidth }) => {
  const [timePeriod, setTimePeriod] = useState(daysInCurrentWeek)
  const [entries, setEntries] = useState([])
  const [dateMap, setDateMap] = useState({})
  const [totalHrs, setTotalHrs] = useState(0)
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
    setIsLoading(false)
    let unsubscribeListenerOnEntriesByThreshold = setListenerOnEntriesByThreshold(
      startThreshold,
      endThreshold,
      setEntries
    )
    setTimeout(() => {
      setIsLoading(false)
    }, 800)
    return () => {
      if (typeof unsubscribeListenerOnEntriesByThreshold === 'function') {
        unsubscribeListenerOnEntriesByThreshold()
      }
    }
  }, [endThreshold, startThreshold])

  useEffect(() => {
    let dateMap = {}
    entries.forEach((entry) => {
      let normalisedDate = dayjs.unix(entry.createdAt).startOf('day').unix()
      let duration = ((entry.exit || entry.actualExit) - entry.entry) / 3600
      duration = duration > 0 ? duration : 0
      if (!dateMap[normalisedDate]) {
        dateMap[normalisedDate] = parseFloat(precisionRound(duration, 2))
      } else {
        dateMap[normalisedDate] = parseFloat(precisionRound(dateMap[normalisedDate] + duration, 2))
      }
    })
    setDateMap(dateMap)
  }, [entries])

  useEffect(() => {
    const startUnix =
      timePeriod === 0 ? startThreshold : dayjs().subtract(timePeriod, 'day').startOf('day').unix()
    const endUnix = timePeriod === 0 ? endThreshold : dayjs().endOf('day').unix()
    let newDateMap = {}
    const setNewDateMap = (key, date) => {
      if (date >= startUnix && date <= endUnix) {
        if (!newDateMap[key]) {
          newDateMap[key] = {
            totalValue: dateMap[date],
          }
        } else {
          newDateMap[key] = {
            totalValue: newDateMap[key]['totalValue'] + dateMap[date],
          }
        }
      }
    }
    if ([0, daysInCurrentWeek, daysInLastFourWeeks].includes(timePeriod)) {
      Object.keys(dateMap).forEach((date) => {
        let dayKey = `(${getDay(dayjs.unix(date).day(), true)}) ${dayjs
          .unix(date)
          .format('DD MMM')}`
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
          totalValue: round(newDateMap[key]['totalValue'], 2),
        }
      })
    )
    setTotalHrs(
      round(
        Object.values(newDateMap).reduce((acc, curr) => {
          return acc + curr.totalValue
        }, 0),
        2
      )
    )
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
          Total: {isLoading ? 'Loading...' : numberWithCommas(totalHrs) + ' hrs'}
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
              name='worktime in hrs'
              type='linear'
              dataKey='totalValue'
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

export default Business
