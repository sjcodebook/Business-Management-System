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
  setListenerOnEstimatesRequestsByThreshold,
  setListenerOnEstimatesSentByThreshold,
  setListenerOnEstimatesSoldByThreshold,
  setListenerOnEstimatesLostByThreshold,
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

const Estimates = ({ chartWidth, setChartWidth }) => {
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
              <Tab label='Requests' />
              <Tab label='Sent' />
              <Tab label='Sold' />
              <Tab label='Lost' />
            </Tabs>
          </Paper>
          <br />
          <div style={{ marginLeft: 10, marginRight: 10 }}>
            {tabVal === 0 && (
              <EstimatesRequests chartWidth={chartWidth} setChartWidth={setChartWidth} />
            )}
            {tabVal === 1 && (
              <EstimatesSent chartWidth={chartWidth} setChartWidth={setChartWidth} />
            )}
            {tabVal === 2 && (
              <EstimatesSold chartWidth={chartWidth} setChartWidth={setChartWidth} />
            )}
            {tabVal === 3 && (
              <EstimatesLost chartWidth={chartWidth} setChartWidth={setChartWidth} />
            )}
          </div>
        </Paper>
      </Grid>
    </Grid>
  )
}

const EstimatesRequests = ({ chartWidth, setChartWidth }) => {
  const [estimatesRequests, setEstimatesRequests] = useState([])
  const [totalCount, setTotalCount] = useState(0)
  const [dateMap, setDateMap] = useState({})
  const [timePeriod, setTimePeriod] = useState(daysInCurrentWeek)
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
    let unsubscribeListenerOnEstimatesSoldByDays = setListenerOnEstimatesRequestsByThreshold(
      startThreshold,
      endThreshold,
      setEstimatesRequests,
      false
    )
    setTimeout(() => {
      setIsLoading(false)
    }, 800)
    return () => {
      if (typeof unsubscribeListenerOnEstimatesSoldByDays === 'function') {
        unsubscribeListenerOnEstimatesSoldByDays()
      }
    }
  }, [endThreshold, startThreshold])

  useEffect(() => {
    let dateMap = {}
    estimatesRequests.forEach((request) => {
      let normalisedDate = dayjs.unix(request.createdAt).startOf('day').unix()
      if (!dateMap[normalisedDate]) {
        dateMap[normalisedDate] = {
          count: 1,
        }
      } else {
        dateMap[normalisedDate]['count'] = dateMap[normalisedDate]['count'] + 1
      }
    })
    setDateMap(dateMap)
  }, [estimatesRequests])

  useEffect(() => {
    const startUnix =
      timePeriod === 0 ? startThreshold : dayjs().subtract(timePeriod, 'day').startOf('day').unix()
    const endUnix = timePeriod === 0 ? endThreshold : dayjs().endOf('day').unix()
    let newDateMap = {}
    const setNewDateMap = (key, date) => {
      if (date >= startUnix && date <= endUnix) {
        if (!newDateMap[key]) {
          newDateMap[key] = {
            count: dateMap[date]['count'],
          }
        } else {
          newDateMap[key] = {
            count: newDateMap[key]['count'] + dateMap[date]['count'],
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
          Total: {isLoading ? 'Loading...' : numberWithCommas(totalCount) + ' Leads'}
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
              name='number of estimates requests'
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

const constructEstimateDateMap = (estimates, key, setDateMap) => {
  let dateMap = {}
  estimates.forEach((estimate) => {
    let normalisedDate = dayjs.unix(estimate[key]).startOf('day').unix()
    let totalWithoutTax = calculatePriceWithoutTax(JSON.parse(estimate.allInfo), 'ESTIMATE', false)
    if (!dateMap[normalisedDate]) {
      dateMap[normalisedDate] = {
        sales: {
          absolute: 0,
          multiple: 0,
        },
        count: 1,
      }
      if (totalWithoutTax === 'Multiple products') {
        dateMap[normalisedDate]['sales']['multiple'] = 1
      } else {
        dateMap[normalisedDate]['sales']['absolute'] = round(totalWithoutTax, 2)
      }
    } else {
      if (totalWithoutTax === 'Multiple products') {
        dateMap[normalisedDate]['sales']['multiple'] =
          dateMap[normalisedDate]['sales']['multiple'] + 1
      } else {
        dateMap[normalisedDate]['sales']['absolute'] = round(
          dateMap[normalisedDate]['sales']['absolute'] + totalWithoutTax,
          2
        )
      }
      dateMap[normalisedDate]['count'] = dateMap[normalisedDate]['count'] + 1
    }
  })
  setDateMap(dateMap)
}

const constructEstimateData = (
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
          sales: dateMap[date]['sales'],
          count: dateMap[date]['count'],
        }
      } else {
        newDateMap[key] = {
          sales: {
            absolute: newDateMap[key]['sales']['absolute'] + dateMap[date]['sales']['absolute'],
            multiple: newDateMap[key]['sales']['multiple'] + dateMap[date]['sales']['multiple'],
          },
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
        sales: newDateMap[key]['sales'],
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

const EstimatesSent = ({ chartWidth, setChartWidth }) => {
  const [timePeriod, setTimePeriod] = useState(daysInCurrentWeek)
  const [sentEstimates, setSentEstimates] = useState([])
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
    let unsubscribeListenerOnEstimatesSentByDays = setListenerOnEstimatesSentByThreshold(
      startThreshold,
      endThreshold,
      setSentEstimates,
      false
    )
    setTimeout(() => {
      setIsLoading(false)
    }, 800)
    return () => {
      if (typeof unsubscribeListenerOnEstimatesSentByDays === 'function') {
        unsubscribeListenerOnEstimatesSentByDays()
      }
    }
  }, [endThreshold, startThreshold])

  useEffect(() => {
    constructEstimateDateMap(sentEstimates, 'emailSentAt', setDateMap)
  }, [sentEstimates])

  useEffect(() => {
    constructEstimateData(timePeriod, startThreshold, endThreshold, dateMap, setData, setTotalCount)
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
          Total: {isLoading ? 'Loading...' : numberWithCommas(totalCount) + ' Estimates Sent'}
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
              name='number of estimates sent'
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

const EstimatesSold = ({ chartWidth, setChartWidth }) => {
  const [timePeriod, setTimePeriod] = useState(daysInCurrentWeek)
  const [soldEstimates, setSoldEstimates] = useState([])
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
    let unsubscribeListenerOnEstimatesSoldByDays = setListenerOnEstimatesSoldByThreshold(
      startThreshold,
      endThreshold,
      setSoldEstimates,
      false
    )
    setTimeout(() => {
      setIsLoading(false)
    }, 800)
    return () => {
      if (typeof unsubscribeListenerOnEstimatesSoldByDays === 'function') {
        unsubscribeListenerOnEstimatesSoldByDays()
      }
    }
  }, [endThreshold, startThreshold])

  useEffect(() => {
    constructEstimateDateMap(soldEstimates, 'saleStatusUpdateAt', setDateMap)
  }, [soldEstimates])

  useEffect(() => {
    constructEstimateData(timePeriod, startThreshold, endThreshold, dateMap, setData, setTotalCount)
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
          Total: {isLoading ? 'Loading...' : numberWithCommas(totalCount) + ' Estimates Sold'}
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
              name='number of estimates sold'
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

const EstimatesLost = ({ chartWidth, setChartWidth }) => {
  const [timePeriod, setTimePeriod] = useState(daysInCurrentWeek)
  const [lostEstimates, setLostEstimates] = useState([])
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
    let unsubscribeListenerOnEstimatesLostByDays = setListenerOnEstimatesLostByThreshold(
      startThreshold,
      endThreshold,
      setLostEstimates,
      false
    )
    setTimeout(() => {
      setIsLoading(false)
    }, 800)
    return () => {
      if (typeof unsubscribeListenerOnEstimatesLostByDays === 'function') {
        unsubscribeListenerOnEstimatesLostByDays()
      }
    }
  }, [endThreshold, startThreshold])

  useEffect(() => {
    constructEstimateDateMap(lostEstimates, 'saleStatusUpdateAt', setDateMap)
  }, [lostEstimates])

  useEffect(() => {
    constructEstimateData(timePeriod, startThreshold, endThreshold, dateMap, setData, setTotalCount)
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
          Total: {isLoading ? 'Loading...' : numberWithCommas(totalCount) + ' Estimates Lost'}
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
              name='number of estimates lost'
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

export default Estimates
