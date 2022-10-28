import React, { useState, useEffect } from 'react'
import * as dayjs from 'dayjs'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { Scrollbars } from 'react-custom-scrollbars'
import { makeStyles } from '@material-ui/core/styles'
import { useTheme } from '@material-ui/core/styles'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import TextField from '@material-ui/core/TextField'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import Switch from '@material-ui/core/Switch'
import Grid from '@material-ui/core/Grid'
import CircularProgress from '@material-ui/core/CircularProgress'
import AddIcon from '@material-ui/icons/Add'
import RemoveIcon from '@material-ui/icons/Remove'

import {
  round,
  calculatePriceWithoutTax,
  getWeekRange,
  getDay,
  numberWithCommas,
} from '../scripts/localActions'
import {
  setListenerOnEstimatesSoldByDays,
  setListenerOnPaidInvoicesByThreshold,
} from '../scripts/remoteActions'

import userStore from '../store/UserStore'
import appStore from '../store/AppStore'

const quarterOfYear = require('dayjs/plugin/quarterOfYear')
dayjs.extend(quarterOfYear)

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(2),
  },
  Innerpaper: {
    padding: theme.spacing(1),
  },
}))

const daysInCurrentWeek = dayjs().day() + 1
const daysInYearToDate = dayjs().diff(dayjs().startOf('year'), 'days')
const daysInLastFourWeeks = dayjs().diff(dayjs().subtract(4, 'weeks'), 'days')
const daysInLastThreeMonths = dayjs().diff(dayjs().subtract(3, 'months'), 'days')
const daysInLastSixMonths = dayjs().diff(dayjs().subtract(6, 'months'), 'days')
const daysInLastTwelveMonths = dayjs().diff(dayjs().subtract(12, 'months'), 'days')

const SalesRevenueChart = () => {
  const classes = useStyles()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [chartWidth, setChartWidth] = useState(isMobile ? 500 : 1100)
  const [quarterly, setQuarterly] = useState(false)
  const [accessTabs, setAccessTabs] = useState([])
  const [tabVal, setTabVal] = useState(false)

  const indexMap = {
    SalesChart: 0,
    RevenueChart: 1,
  }

  useEffect(() => {
    let final = []
    if (userStore.currentUser.isAdmin) {
      final = ['SalesChart', 'RevenueChart']
    } else {
      userStore.currentUser.jobConfig?.cards.forEach((c) => {
        if (['SalesChart', 'RevenueChart'].includes(c)) {
          final.push(c)
        }
      })
    }
    setTabVal(final.length === 0 ? false : indexMap[final[0]])
    setAccessTabs(final)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    setChartWidth(isMobile ? 500 : 1100)
  }, [isMobile])

  if (accessTabs.length === 0) {
    return null
  }

  return (
    <Paper className={classes.paper}>
      <div>
        <Grid component='label' container alignItems='center' justify='flex-end' spacing={0}>
          <Grid item>Days</Grid>
          <Grid item>
            <Switch
              checked={quarterly}
              onChange={(e) => setQuarterly(e.target.checked)}
              name='checkedA'
              inputProps={{ 'aria-label': 'secondary checkbox' }}
            />
          </Grid>
          <Grid item>Quarters</Grid>
        </Grid>
      </div>
      <Paper
        style={{ backgroundColor: appStore.darkMode ? '#303030' : '#fcfcfc' }}
        className={classes.Innerpaper}>
        <Paper>
          <Tabs
            value={tabVal}
            indicatorColor={tabVal === 0 ? 'primary' : 'secondary'}
            textColor={tabVal === 0 ? 'primary' : 'secondary'}
            variant='scrollable'
            scrollButtons='auto'
            onChange={(event, newValue) => {
              setTabVal(newValue)
            }}>
            <Tab label='Sales' disabled={!accessTabs.includes('SalesChart')} />
            <Tab label='Revenue' disabled={!accessTabs.includes('RevenueChart')} />
          </Tabs>
        </Paper>
        <br />
        <div style={{ marginLeft: 10, marginRight: 10 }}>
          {tabVal === 0 && (
            <>
              {quarterly ? (
                <RenderSalesChartQuarter
                  chartWidth={chartWidth}
                  setChartWidth={setChartWidth}
                  quarterly={quarterly}
                />
              ) : (
                <RenderSalesChartDays
                  chartWidth={chartWidth}
                  setChartWidth={setChartWidth}
                  quarterly={quarterly}
                />
              )}
            </>
          )}
          {tabVal === 1 && (
            <>
              {quarterly ? (
                <RenderRevenueChartQuarter
                  chartWidth={chartWidth}
                  setChartWidth={setChartWidth}
                  quarterly={quarterly}
                />
              ) : (
                <RenderRevenueChartDays
                  chartWidth={chartWidth}
                  setChartWidth={setChartWidth}
                  quarterly={quarterly}
                />
              )}
            </>
          )}
        </div>
      </Paper>
    </Paper>
  )
}

const ResizeBtn = ({ setChartWidth }) => {
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

const TimePanel = ({ timePeriod, setTimePeriod, color, quarterly }) => {
  if (quarterly) {
    const startOfYear = dayjs().startOf('year')
    const quarter = dayjs().quarter()
    const quarterMap = {
      1: {
        label: 'Jan-Mar',
        value: `${startOfYear.unix()}-${startOfYear.add(2, 'month').endOf('month').unix()}-QUARTER`,
      },
      2: {
        label: 'Apr-Jun',
        value: `${startOfYear.add(3, 'month').startOf('month').unix()}-${startOfYear
          .add(5, 'month')
          .endOf('month')
          .unix()}-QUARTER`,
      },
      3: {
        label: 'Jul-Sep',
        value: `${startOfYear.add(6, 'month').startOf('month').unix()}-${startOfYear
          .add(8, 'month')
          .endOf('month')
          .unix()}-QUARTER`,
      },
      4: {
        label: 'Oct-Dec',
        value: `${startOfYear.add(9, 'month').startOf('month').unix()}-${startOfYear
          .add(11, 'month')
          .endOf('month')
          .unix()}-QUARTER`,
      },
    }
    let tabsArr = []
    tabsArr.push({
      label: dayjs().format('MMM'),
      value: `${dayjs().startOf('month').unix()}-${dayjs().endOf('month').unix()}-MONTH`,
    })
    for (let i = quarter; i >= 1; i--) {
      tabsArr.push(quarterMap[i])
    }
    tabsArr.push({
      label: dayjs().subtract(1, 'year').format('YYYY'),
      value: `${dayjs().subtract(1, 'year').startOf('year').unix()}-${dayjs()
        .subtract(1, 'year')
        .endOf('year')
        .unix()}-YEAR`,
    })
    tabsArr.push({
      label: dayjs().format('YYYY'),
      value: `${startOfYear.unix()}-${dayjs().endOf('year').unix()}-YEAR`,
    })

    return (
      <Tabs
        value={timePeriod}
        indicatorColor={color}
        textColor={color}
        variant='scrollable'
        scrollButtons='auto'
        onChange={(event, newValue) => {
          setTimePeriod(newValue)
        }}>
        {tabsArr.map((tab) => (
          <Tab key={JSON.stringify(tab)} label={tab.label} value={tab.value} />
        ))}
      </Tabs>
    )
  } else {
    return (
      <Tabs
        value={timePeriod}
        indicatorColor={color}
        textColor={color}
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
    )
  }
}

const DataFormater = (number) => {
  return '$' + numberWithCommas(number)
}

const CustomSalesTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ backgroundColor: '#fff', borderRadius: 5, padding: '5px 10px 5px' }}>
        <p style={{ color: '#0c0c0c' }}>{`${label}`}</p>
        <p
          style={{
            color: '#7c89d1',
          }}>{`Sold ${payload[0].payload.count} Estimate(s) worth $${numberWithCommas(
          round(payload[0].payload.sales.absolute, 2)
        )}`}</p>
      </div>
    )
  }

  return null
}

const RenderSalesChartDays = ({ chartWidth, setChartWidth, quarterly }) => {
  // const theme = useTheme()
  const [timePeriod, setTimePeriod] = useState(daysInYearToDate)
  const [soldEstimates, setSoldEstimates] = useState([])
  const [dateMap, setDateMap] = useState({})
  const [data, setData] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [totalAmt, setTotalAmt] = useState(0)
  const [startThreshold, setStartThreshold] = useState(
    dayjs().subtract(daysInLastTwelveMonths, 'day').startOf('day').unix()
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
    let unsubscribeListenerOnEstimatesSoldByDays = setListenerOnEstimatesSoldByDays(
      startThreshold,
      endThreshold,
      setSoldEstimates
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
    soldEstimates.forEach((estimate) => {
      let normalisedDate = dayjs.unix(estimate.saleStatusUpdateAt).startOf('day').unix()
      let totalWithoutTax = calculatePriceWithoutTax(
        JSON.parse(estimate.allInfo),
        'ESTIMATE',
        false
      )
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
  }, [soldEstimates])

  useEffect(() => {
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
          sales: newDateMap[key]['sales'],
          count: newDateMap[key]['count'],
        }
      })
    )
    setTotalAmt(
      round(
        Object.values(newDateMap).reduce((acc, curr) => {
          return acc + curr.sales.absolute
        }, 0),
        2
      )
    )
  }, [timePeriod, dateMap, startThreshold, endThreshold])

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <TimePanel
          timePeriod={timePeriod}
          setTimePeriod={setTimePeriod}
          color='primary'
          quarterly={quarterly}
        />
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
        <Scrollbars style={{ height: 420 }}>
          {/* {isLoading ? (
            <div style={{ textAlign: 'center', marginTop: 150 }}>
              <CircularProgress color='secondary' />
            </div>
          ) : ( */}
          <BarChart
            width={chartWidth}
            height={400}
            data={data}
            margin={{
              top: 30,
              left: 40,
            }}>
            <CartesianGrid strokeDasharray='3 3' />
            {/* <XAxis
                dataKey='date'
                label={{
                  value: 'Dates ->',
                  position: 'insideBottomRight',
                  offset: 0,
                  fill: theme.palette.text.secondary,
                }}
              />
              <YAxis
                label={{
                  value: 'Amount ($) ->',
                  angle: -90,
                  position: 'insideLeft',
                  fill: theme.palette.text.secondary,
                }}
              /> */}
            <XAxis dataKey='date' />
            <YAxis tickFormatter={DataFormater} />
            <Tooltip labelStyle={{ color: '#303030' }} content={<CustomSalesTooltip />} />
            <Bar
              name='Sales'
              type='monotone'
              dataKey='sales.absolute'
              stroke='#141a39'
              fill='#7c89d1'
            />
          </BarChart>
          {/* )} */}
        </Scrollbars>
      </Grid>
    </Grid>
  )
}

const RenderSalesChartQuarter = ({ chartWidth, setChartWidth, quarterly }) => {
  // const theme = useTheme()
  const [timePeriod, setTimePeriod] = useState(
    `${dayjs().startOf('year').unix()}-${dayjs().endOf('year').unix()}-YEAR`
  )
  const [soldEstimates, setSoldEstimates] = useState([])
  const [dateMap, setDateMap] = useState({})
  const [data, setData] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [totalAmt, setTotalAmt] = useState(0)

  useEffect(() => {
    const startThreshold = dayjs().subtract(1, 'year').startOf('year').unix()
    const endThreshold = dayjs().add(2, 'month').endOf('month').unix()
    setIsLoading(true)
    let unsubscribeListenerOnEstimatesSoldByDays = setListenerOnEstimatesSoldByDays(
      startThreshold,
      endThreshold,
      setSoldEstimates
    )
    setTimeout(() => {
      setIsLoading(false)
    }, 800)
    return () => {
      if (typeof unsubscribeListenerOnEstimatesSoldByDays === 'function') {
        unsubscribeListenerOnEstimatesSoldByDays()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    let dateMap = {}
    soldEstimates.forEach((estimate) => {
      let normalisedDate = dayjs.unix(estimate.saleStatusUpdateAt).startOf('day').unix()
      let totalWithoutTax = calculatePriceWithoutTax(
        JSON.parse(estimate.allInfo),
        'ESTIMATE',
        false
      )
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
  }, [soldEstimates])

  useEffect(() => {
    let timeArr = timePeriod.split('-')
    let startUnix = parseInt(timeArr[0])
    let endUnix = parseInt(timeArr[1])
    let context = timeArr[2]
    let newDateMap = {}
    if (context === 'YEAR' || context === 'QUARTER') {
      Object.keys(dateMap).forEach((date) => {
        let monthKey = dayjs.unix(date).format('MMM')
        if (date >= startUnix && date <= endUnix) {
          if (!newDateMap[monthKey]) {
            newDateMap[monthKey] = {
              sales: dateMap[date]['sales'],
              count: dateMap[date]['count'],
            }
          } else {
            newDateMap[monthKey] = {
              sales: {
                absolute:
                  newDateMap[monthKey]['sales']['absolute'] + dateMap[date]['sales']['absolute'],
                multiple:
                  newDateMap[monthKey]['sales']['multiple'] + dateMap[date]['sales']['multiple'],
              },
              count: newDateMap[monthKey]['count'] + dateMap[date]['count'],
            }
          }
        }
      })
    } else if (context === 'MONTH') {
      Object.keys(dateMap).forEach((date) => {
        let weekKey = getWeekRange(date)
        if (date >= startUnix && date <= endUnix) {
          if (!newDateMap[weekKey]) {
            newDateMap[weekKey] = {
              sales: dateMap[date]['sales'],
              count: dateMap[date]['count'],
            }
          } else {
            newDateMap[weekKey] = {
              sales: {
                absolute:
                  newDateMap[weekKey]['sales']['absolute'] + dateMap[date]['sales']['absolute'],
                multiple:
                  newDateMap[weekKey]['sales']['multiple'] + dateMap[date]['sales']['multiple'],
              },
              count: newDateMap[weekKey]['count'] + dateMap[date]['count'],
            }
          }
        }
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
    setTotalAmt(
      round(
        Object.values(newDateMap).reduce((acc, curr) => {
          return acc + curr.sales.absolute
        }, 0),
        2
      )
    )
  }, [timePeriod, dateMap])

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <TimePanel
          timePeriod={timePeriod}
          setTimePeriod={setTimePeriod}
          color='primary'
          quarterly={quarterly}
        />
      </Grid>
      <Grid item xs={12}>
        <Typography align='center' variant='h6' style={{ marginTop: 10 }}>
          Total: {isLoading ? 'Loading...' : '$' + numberWithCommas(totalAmt)}
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <ResizeBtn setChartWidth={setChartWidth} />
      </Grid>
      <Grid item xs={12}>
        <Scrollbars style={{ height: 420 }}>
          {/* {isLoading ? (
            <div style={{ textAlign: 'center', marginTop: 150 }}>
              <CircularProgress color='secondary' />
            </div>
          ) : ( */}
          <BarChart
            width={chartWidth}
            height={400}
            data={data}
            margin={{
              top: 30,
              left: 40,
            }}>
            <CartesianGrid strokeDasharray='3 3' />
            {/* <XAxis
                dataKey='date'
                label={{
                  value: 'Dates ->',
                  position: 'insideBottomRight',
                  offset: 0,
                  fill: theme.palette.text.secondary,
                }}
              />
              <YAxis
                label={{
                  value: 'Amount ($) ->',
                  angle: -90,
                  position: 'insideLeft',
                  fill: theme.palette.text.secondary,
                }}
              /> */}
            <XAxis dataKey='date' />
            <YAxis tickFormatter={DataFormater} />
            <Tooltip labelStyle={{ color: '#303030' }} content={<CustomSalesTooltip />} />
            <Bar
              name='Sales'
              type='monotone'
              dataKey='sales.absolute'
              stroke='#141a39'
              fill='#7c89d1'
            />
          </BarChart>
          {/* )} */}
        </Scrollbars>
      </Grid>
    </Grid>
  )
}

const CustomRevenueTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ backgroundColor: '#fff', borderRadius: 5, padding: '5px 10px 5px' }}>
        <p style={{ color: '#0c0c0c' }}>{`${label}`}</p>
        <p
          style={{
            color: '#ef5f91',
          }}>{`Generated Revenue of $${numberWithCommas(round(payload[0].payload.revenue, 2))} on ${
          payload[0].payload.count
        } invoice(s)`}</p>
      </div>
    )
  }

  return null
}

const RenderRevenueChartDays = ({ chartWidth, setChartWidth, quarterly }) => {
  // const theme = useTheme()
  const [timePeriod, setTimePeriod] = useState(daysInYearToDate)
  const [data, setData] = useState([])
  const [paidInvoices, setPaidInvoices] = useState([])
  const [dateMap, setDateMap] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [totalAmt, setTotalAmt] = useState(0)
  const [startThreshold, setStartThreshold] = useState(
    dayjs().subtract(daysInLastTwelveMonths, 'day').startOf('day').unix()
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
    const startThreshold = dayjs().subtract(daysInLastTwelveMonths, 'day').startOf('day').unix()
    const endThreshold = dayjs().endOf('day').unix()
    setIsLoading(true)
    let unsubscribeListenerOnPaidInvoicesByDays = setListenerOnPaidInvoicesByThreshold(
      startThreshold,
      endThreshold,
      setPaidInvoices
    )
    setTimeout(() => {
      setIsLoading(false)
    }, 800)
    return () => {
      if (typeof unsubscribeListenerOnPaidInvoicesByDays === 'function') {
        unsubscribeListenerOnPaidInvoicesByDays()
      }
    }
  }, [endThreshold, startThreshold])

  useEffect(() => {
    let dateMap = {}
    paidInvoices.forEach((invoice) => {
      let totalWithoutTax = calculatePriceWithoutTax(JSON.parse(invoice.allInfo), 'INVOICE', false)
      let normalisedDate = dayjs.unix(invoice.paidOn).startOf('day').unix()
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
  }, [paidInvoices])

  useEffect(() => {
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
          revenue: round(newDateMap[key]['revenue'], 2),
          count: newDateMap[key]['count'],
        }
      })
    )
    setTotalAmt(
      round(
        Object.values(newDateMap).reduce((acc, curr) => {
          return acc + curr.revenue
        }, 0),
        2
      )
    )
  }, [timePeriod, dateMap, startThreshold, endThreshold])

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <TimePanel
          timePeriod={timePeriod}
          setTimePeriod={setTimePeriod}
          color='secondary'
          quarterly={quarterly}
        />
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
        <Scrollbars style={{ height: 420 }}>
          {isLoading ? (
            <div style={{ textAlign: 'center', marginTop: 150 }}>
              <CircularProgress color='secondary' />
            </div>
          ) : (
            <BarChart
              width={chartWidth}
              height={400}
              data={data}
              margin={{
                top: 30,
                left: 40,
              }}>
              <CartesianGrid strokeDasharray='3 3' />
              {/* <XAxis
                dataKey='date'
                label={{
                  value: 'Dates ->',
                  position: 'insideBottomRight',
                  offset: 0,
                  fill: theme.palette.text.secondary,
                }}
              />
              <YAxis
                label={{
                  value: 'Amount ($) ->',
                  angle: -90,
                  position: 'insideLeft',
                  fill: theme.palette.text.secondary,
                }}
              /> */}
              <XAxis dataKey='date' />
              <YAxis tickFormatter={DataFormater} />
              <Tooltip labelStyle={{ color: '#303030' }} content={<CustomRevenueTooltip />} />
              <Bar
                name='Revenue'
                type='monotone'
                dataKey='revenue'
                stroke='#740c30'
                fill='#ef5f91'
              />
            </BarChart>
          )}
        </Scrollbars>
      </Grid>
    </Grid>
  )
}

const RenderRevenueChartQuarter = ({ chartWidth, setChartWidth, quarterly }) => {
  // const theme = useTheme()
  const [timePeriod, setTimePeriod] = useState(
    `${dayjs().startOf('year').unix()}-${dayjs().endOf('year').unix()}-YEAR`
  )
  const [data, setData] = useState([])
  const [paidInvoices, setPaidInvoices] = useState([])
  const [dateMap, setDateMap] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [totalAmt, setTotalAmt] = useState(0)

  useEffect(() => {
    const startThreshold = dayjs().subtract(1, 'year').startOf('year').unix()
    const endThreshold = dayjs().add(2, 'month').endOf('month').unix()
    setIsLoading(true)
    let unsubscribeListenerOnPaidInvoicesByDays = setListenerOnPaidInvoicesByThreshold(
      startThreshold,
      endThreshold,
      setPaidInvoices
    )
    setTimeout(() => {
      setIsLoading(false)
    }, 800)
    return () => {
      if (typeof unsubscribeListenerOnPaidInvoicesByDays === 'function') {
        unsubscribeListenerOnPaidInvoicesByDays()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    let dateMap = {}
    paidInvoices.forEach((invoice) => {
      let totalWithoutTax = calculatePriceWithoutTax(JSON.parse(invoice.allInfo), 'INVOICE', false)
      let normalisedDate = dayjs.unix(invoice.paidOn).startOf('day').unix()
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
  }, [paidInvoices])

  useEffect(() => {
    let timeArr = timePeriod.split('-')
    let startUnix = parseInt(timeArr[0])
    let endUnix = parseInt(timeArr[1])
    let context = timeArr[2]
    let newDateMap = {}
    if (context === 'YEAR' || context === 'QUARTER') {
      Object.keys(dateMap).forEach((date) => {
        let monthKey = dayjs.unix(date).format('MMM')
        if (date >= startUnix && date <= endUnix) {
          if (!newDateMap[monthKey]) {
            newDateMap[monthKey] = {
              revenue: dateMap[date]['revenue'],
              count: dateMap[date]['count'],
            }
          } else {
            newDateMap[monthKey] = {
              revenue: newDateMap[monthKey]['revenue'] + dateMap[date]['revenue'],
              count: newDateMap[monthKey]['count'] + dateMap[date]['count'],
            }
          }
        }
      })
    } else if (context === 'MONTH') {
      Object.keys(dateMap).forEach((date) => {
        let weekKey = getWeekRange(date)
        if (date >= startUnix && date <= endUnix) {
          if (!newDateMap[weekKey]) {
            newDateMap[weekKey] = {
              revenue: dateMap[date]['revenue'],
              count: dateMap[date]['count'],
            }
          } else {
            newDateMap[weekKey] = {
              revenue: newDateMap[weekKey]['revenue'] + dateMap[date]['revenue'],
              count: newDateMap[weekKey]['count'] + dateMap[date]['count'],
            }
          }
        }
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
    setTotalAmt(
      round(
        Object.values(newDateMap).reduce((acc, curr) => {
          return acc + curr.revenue
        }, 0),
        2
      )
    )
  }, [timePeriod, dateMap])

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <TimePanel
          timePeriod={timePeriod}
          setTimePeriod={setTimePeriod}
          color='secondary'
          quarterly={quarterly}
        />
      </Grid>
      <Grid item xs={12}>
        <Typography align='center' variant='h6' style={{ marginTop: 10 }}>
          Total: {isLoading ? 'Loading...' : '$' + numberWithCommas(totalAmt)}
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <ResizeBtn setChartWidth={setChartWidth} />
      </Grid>
      <Grid item xs={12}>
        <Scrollbars style={{ height: 420 }}>
          {isLoading ? (
            <div style={{ textAlign: 'center', marginTop: 150 }}>
              <CircularProgress color='secondary' />
            </div>
          ) : (
            <BarChart
              width={chartWidth}
              height={400}
              data={data}
              margin={{
                top: 30,
                left: 40,
              }}>
              <CartesianGrid strokeDasharray='3 3' />
              {/* <XAxis
                dataKey='date'
                label={{
                  value: 'Dates ->',
                  position: 'insideBottomRight',
                  offset: 0,
                  fill: theme.palette.text.secondary,
                }}
              />
              <YAxis
                label={{
                  value: 'Amount ($) ->',
                  angle: -90,
                  position: 'insideLeft',
                  fill: theme.palette.text.secondary,
                }}
              /> */}
              <XAxis dataKey='date' />
              <YAxis tickFormatter={DataFormater} />
              <Tooltip labelStyle={{ color: '#303030' }} content={<CustomRevenueTooltip />} />
              <Bar
                name='Revenue'
                type='monotone'
                dataKey='revenue'
                stroke='#740c30'
                fill='#ef5f91'
              />
            </BarChart>
          )}
        </Scrollbars>
      </Grid>
    </Grid>
  )
}

export default SalesRevenueChart
