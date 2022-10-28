import React, { useState, useEffect } from 'react'
import dayjs from 'dayjs'
import { makeStyles } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'

import SalaryModal from './SalaryModal'
import ExpensesModal from './ExpensesModal'
import TotalModal from './TotalModal'

import {
  precisionRound,
  handleWeekChange,
  getInitialWeekStart,
  getInitialWeekEnd,
  getOrdinal,
  getMonth,
  numberWithCommas,
} from './../../../scripts/localActions'
import { fetchWeekEntries, setListenerOnExpenses } from './../../../scripts/remoteActions'
import { Constants } from './../../../scripts/constants'

import appStore from './../../../store/AppStore'

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(2),
    color: theme.palette.text.secondary,
  },
  Innerpaper: {
    padding: theme.spacing(2),
  },
}))

const WeekStats = () => {
  const classes = useStyles()
  const [expenses, setExpenses] = useState([])
  const [totalSalary, setTotalSalary] = useState(0)
  // const [totalTime, setTotalTime] = useState(0)
  const [weekStart, setWeekStart] = useState(getInitialWeekStart(Constants.ResetDay))
  const [weekEnd, setWeekEnd] = useState(getInitialWeekEnd(weekStart))
  const [approvedExpensesTotal, setApprovedExpensesTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [showSalaryModal, setShowSalaryModal] = useState(false)
  const [showExpensesModal, setShowExpensesModal] = useState(false)
  const [showTotalModal, setShowTotalModal] = useState(false)

  useEffect(() => {
    setIsLoading(true)
    fetchWeekEntries(weekStart, weekEnd)
      .then((res) => {
        // setTotalTime(
        //   getPrettyMs(
        //     res.reduce((acc, curr) => {
        //       return (curr.exit ? curr.exit - curr.entry : 0) + acc
        //     }, 0) * 1000
        //   )
        // )
        setTotalSalary(
          parseFloat(
            precisionRound(
              res.reduce((acc, curr) => {
                return (curr.totalSalary || 0) + acc
              }, 0),
              2
            )
          )
        )
        setIsLoading(false)
      })
      .catch((err) => {
        setIsLoading(false)
        setTotalSalary('Something went wrong.')
      })
  }, [weekStart, weekEnd])

  useEffect(() => {
    setApprovedExpensesTotal(
      parseFloat(
        precisionRound(
          expenses
            .filter((expense) => expense.isActive && expense.isApproved)
            .reduce((acc, curr) => {
              return (curr.totalAmount || 0) + acc
            }, 0),
          2
        )
      )
    )
  }, [expenses])

  useEffect(() => {
    let unsubscribeListenerOnExpenses = setListenerOnExpenses(weekStart, weekEnd, setExpenses)
    return () => {
      unsubscribeListenerOnExpenses()
    }
  }, [weekStart, weekEnd])

  return (
    <Paper className={classes.paper}>
      <Typography variant='h4' color='textPrimary' align='left' gutterBottom>
        Week of {dayjs.unix(weekStart).get('date')}
        {getOrdinal(dayjs.unix(weekStart).get('date'))} {getMonth(dayjs.unix(weekStart).month())} to{' '}
        {dayjs.unix(weekEnd).get('date')}
        {getOrdinal(dayjs.unix(weekEnd).get('date'))} {getMonth(dayjs.unix(weekEnd).month())}
      </Typography>
      <Paper
        style={{ backgroundColor: appStore.darkMode ? '#303030' : '#fcfcfc' }}
        className={classes.Innerpaper}>
        <h2>All Employees: </h2>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Card style={{ cursor: 'pointer' }} onClick={() => setShowSalaryModal(true)}>
              <CardContent>
                <div style={{ textAlign: 'center' }}>
                  <h2>Salary:</h2>
                  <h2>${numberWithCommas(precisionRound(totalSalary, 2))}</h2>
                </div>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card style={{ cursor: 'pointer' }} onClick={() => setShowExpensesModal(true)}>
              <CardContent>
                <div style={{ textAlign: 'center' }}>
                  <h2>Expenses:</h2>
                  <h2>${numberWithCommas(precisionRound(approvedExpensesTotal, 2))}</h2>
                </div>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card style={{ cursor: 'pointer' }} onClick={() => setShowTotalModal(true)}>
              <CardContent>
                <div style={{ textAlign: 'center' }}>
                  <h2>Total ( Salary + Expenses ):</h2>
                  <h2>
                    ${numberWithCommas(precisionRound(totalSalary + approvedExpensesTotal, 2))}
                  </h2>
                </div>
              </CardContent>
            </Card>
          </Grid>
          {/* <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <div style={{ textAlign: 'center' }}>
                  <h2>Work Time:</h2>
                  <h2>{totalTime}</h2>
                </div>
              </CardContent>
            </Card>
          </Grid> */}
        </Grid>
        <br />
        <Grid container spacing={4}>
          <Grid item xs={6}>
            <div style={{ textAlign: 'left' }}>
              <Button
                variant='contained'
                color='primary'
                disabled={isLoading}
                onClick={() =>
                  handleWeekChange('prev', weekStart, weekEnd, setWeekStart, setWeekEnd)
                }>
                Prev Week
              </Button>
            </div>
          </Grid>
          <Grid item xs={6}>
            {weekStart !== dayjs().startOf('week').add(4, 'days').unix() && (
              <div style={{ textAlign: 'right' }}>
                <Button
                  variant='contained'
                  color='primary'
                  disabled={isLoading}
                  onClick={() =>
                    handleWeekChange('next', weekStart, weekEnd, setWeekStart, setWeekEnd)
                  }>
                  Next Week
                </Button>
              </div>
            )}
          </Grid>
        </Grid>
      </Paper>
      {showSalaryModal && (
        <SalaryModal
          onClose={() => setShowSalaryModal(false)}
          weekStart={weekStart}
          weekEnd={weekEnd}
        />
      )}
      {showExpensesModal && (
        <ExpensesModal
          onClose={() => setShowExpensesModal(false)}
          weekStart={weekStart}
          weekEnd={weekEnd}
        />
      )}
      {showTotalModal && (
        <TotalModal
          onClose={() => setShowTotalModal(false)}
          weekStart={weekStart}
          weekEnd={weekEnd}
        />
      )}
    </Paper>
  )
}

export default WeekStats
