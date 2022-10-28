import React, { useState, useEffect } from 'react'
import { Observer } from 'mobx-react-lite'
import * as dayjs from 'dayjs'
import SimpleReactLightbox, { SRLWrapper } from 'simple-react-lightbox'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import { Scrollbars } from 'react-custom-scrollbars'
import { useTheme } from '@material-ui/core/styles'
import { makeStyles } from '@material-ui/core/styles'
import Container from '@material-ui/core/Container'
import Paper from '@material-ui/core/Paper'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import CircularProgress from '@material-ui/core/CircularProgress'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'
import AddCircleOutlinedIcon from '@material-ui/icons/AddCircleOutlined'
import CheckCircleIcon from '@material-ui/icons/CheckCircle'
import CancelIcon from '@material-ui/icons/Cancel'
import Divider from '@material-ui/core/Divider'
import DeleteIcon from '@material-ui/icons/Delete'

import {
  showToast,
  getOrdinal,
  getMonth,
  precisionRound,
  getCustomTime,
  handleWeekChange,
  getInitialWeekStart,
  getInitialWeekEnd,
  getPrettyMs,
} from './../scripts/localActions'
import {
  fetchUserWeekEntries,
  fetchActiveEntry,
  createLoginEntry,
  createLogoutEntry,
  setListenerOnExpenses,
  changeExpenseStatus,
} from './../scripts/remoteActions'
import { Constants } from './../scripts/constants'

import appStore from './../store/AppStore'
import userStore from './../store/UserStore'

import ExpenseModal from './../components/ExpenseModal'

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    marginTop: 20,
  },
  paper: {
    padding: theme.spacing(2),
    color: theme.palette.text.secondary,
  },
  Innerpaper: {
    padding: theme.spacing(2),
  },
  table: {
    minWidth: 650,
  },
}))

const TimeTracker = () => {
  const classes = useStyles()
  const [weekStart, setWeekStart] = useState(getInitialWeekStart(Constants.ResetDay))
  const [weekEnd, setWeekEnd] = useState(getInitialWeekEnd(weekStart))
  const [userWeekEntries, setUserWeekEntries] = useState([])
  const [refreshWeekEntries, setRefreshWeekEntries] = useState(false)
  const [expenses, setExpenses] = useState([])
  const [approvedExpensesTotal, setApprovedExpensesTotal] = useState(0)
  const [totalWeekSalary, setTotalWeekSalary] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    _fetchUserWeekEntries(weekStart, weekEnd)
    let unsubscribeListenerOnExpenses = setListenerOnExpenses(
      weekStart,
      weekEnd,
      setExpenses,
      userStore.currentUser.id
    )
    return () => {
      unsubscribeListenerOnExpenses()
    }
  }, [weekStart, weekEnd, refreshWeekEntries])

  useEffect(() => {
    setApprovedExpensesTotal(
      expenses
        .filter((expense) => expense.isActive && expense.isApproved)
        .reduce((acc, curr) => {
          return (curr.totalAmount || 0) + acc
        }, 0)
    )
  }, [expenses])

  const _fetchUserWeekEntries = (newWeekStart, newWeekEnd) => {
    setIsLoading(true)
    fetchUserWeekEntries(userStore.currentUser.id, newWeekStart, newWeekEnd)
      .then((res) => {
        setIsLoading(false)
        setUserWeekEntries(res)
        setTotalWeekSalary(
          res.reduce((acc, curr) => {
            return (curr.totalSalary || 0) + acc
          }, 0)
        )
      })
      .catch((err) => {
        setIsLoading(false)
        showToast('Something Went wrong fetching user entries.', 'error')
      })
  }

  return (
    <Observer>
      {() => (
        <div className={classes.root}>
          <Container fixed>
            <Grid container spacing={5}>
              <Grid item xs={12}>
                <Typography variant='h3' align='center' gutterBottom>
                  Time Tracker For {userStore.currentUser.name}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <ActiveEntry
                  setRefreshWeekEntries={setRefreshWeekEntries}
                  isLoading={isLoading}
                  setIsLoading={setIsLoading}
                  setWeekStart={setWeekStart}
                  setWeekEnd={setWeekEnd}
                />
              </Grid>
              <Grid item xs={12}>
                <ExtraExpenses
                  isLoading={isLoading}
                  setWeekStart={setWeekStart}
                  setWeekEnd={setWeekEnd}
                  weekStart={weekStart}
                  weekEnd={weekEnd}
                />
              </Grid>
              <Grid item xs={12}>
                <WeekEntries
                  userWeekEntries={userWeekEntries}
                  isLoading={isLoading}
                  setWeekStart={setWeekStart}
                  setWeekEnd={setWeekEnd}
                  weekStart={weekStart}
                  weekEnd={weekEnd}
                  totalWeekSalary={totalWeekSalary}
                  approvedExpensesTotal={approvedExpensesTotal}
                />
              </Grid>
            </Grid>
          </Container>
        </div>
      )}
    </Observer>
  )
}

const ActiveEntry = ({
  setRefreshWeekEntries,
  isLoading,
  setIsLoading,
  setWeekStart,
  setWeekEnd,
}) => {
  const classes = useStyles()
  const [activeEntry, setActiveEntry] = useState(null)
  const [disableLoginBtn, setDisableLoginBtn] = useState(false)
  const [disableLogoutBtn, setDisableLogoutBtn] = useState(false)
  const [showLunchPopUp, setShowLunchPopUp] = useState(false)
  const [breakDur, setBreakDur] = useState(localStorage.getItem('lunchBreakDur') || 30)

  useEffect(() => {
    fetchActiveEntryForUser()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchActiveEntryForUser = () => {
    setIsLoading(true)
    fetchActiveEntry(userStore.currentUser.id)
      .then((res) => {
        setIsLoading(false)
        setActiveEntry(res[0] || null)
      })
      .catch((err) => {
        setIsLoading(false)
        showToast('Something Went wrong fetching user active entry.', 'error')
      })
  }

  const handleClick = (context) => {
    if (context === 'loginEntry') {
      setDisableLoginBtn(true)
      createLoginEntry(userStore.currentUser.id, getCustomTime())
        .then((res) => {
          let initialWeekStart = getInitialWeekStart(Constants.ResetDay)
          setDisableLoginBtn(false)
          showToast('Login Entry created successfully!')
          fetchActiveEntryForUser()
          setWeekStart(initialWeekStart)
          setWeekEnd(getInitialWeekEnd(initialWeekStart))
          setRefreshWeekEntries((prev) => !prev)
        })
        .catch((err) => {
          setDisableLoginBtn(false)
          showToast('Something Went wrong creating entry.', 'error')
        })
    } else if (context === 'logoutEntry') {
      setShowLunchPopUp(true)
    }
  }

  const handleLogoutEntry = (isLunchBreak) => {
    let actualExit = getCustomTime()
    let finalTime = actualExit
    let lunchBreakDur = null
    if (isLunchBreak) {
      if (![15, 30, 45, 60].includes(parseInt(breakDur))) {
        showToast('Lunch Duration Not Valid.', 'error')
        return
      }
      lunchBreakDur = breakDur
      localStorage.setItem('lunchBreakDur', breakDur)
      finalTime = dayjs.unix(finalTime).subtract(breakDur, 'minute').unix()
    }
    setDisableLogoutBtn(true)
    createLogoutEntry(
      userStore.currentUser.id,
      activeEntry.id,
      finalTime,
      actualExit,
      userStore.currentUser.salary,
      isLunchBreak,
      lunchBreakDur ? parseInt(lunchBreakDur) : null
    )
      .then((res) => {
        let initialWeekStart = getInitialWeekStart(Constants.ResetDay)
        setDisableLogoutBtn(false)
        showToast('Logout Entry created successfully!')
        fetchActiveEntryForUser()
        setWeekStart(initialWeekStart)
        setWeekEnd(getInitialWeekEnd(initialWeekStart))
        setRefreshWeekEntries((prev) => !prev)
        setShowLunchPopUp(false)
      })
      .catch((err) => {
        setDisableLogoutBtn(false)
        showToast('Something Went wrong creating entry.', 'error')
      })
  }

  return (
    <Observer>
      {() => (
        <Paper className={classes.paper}>
          <Typography variant='h6' color='textPrimary' align='left' gutterBottom>
            (Salary: ${userStore.currentUser.salary}/hr)
          </Typography>
          <Paper
            style={{ backgroundColor: appStore.darkMode ? '#303030' : '#fcfcfc' }}
            className={classes.Innerpaper}>
            {isLoading ? (
              <Grid container spacing={5}>
                <Grid item xs={12} sm={12} md={4}>
                  <CircularProgress color='secondary' size={25} />
                </Grid>
              </Grid>
            ) : (
              <>
                {showLunchPopUp ? (
                  <Grid container spacing={5}>
                    <Grid item xs={12}>
                      <Typography variant='h6' align='center' gutterBottom>
                        Have you taken a lunch break?
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <div style={{ textAlign: 'center' }}>
                        <Select value={breakDur} onChange={(e) => setBreakDur(e.target.value)}>
                          <MenuItem value={15}>15 Min.</MenuItem>
                          <MenuItem value={30}>30 Min.</MenuItem>
                          <MenuItem value={45}>45 Min.</MenuItem>
                          <MenuItem value={60}>1 Hr.</MenuItem>
                        </Select>
                      </div>
                    </Grid>
                    <Grid item xs={12}>
                      <div style={{ textAlign: 'center', marginBottom: 10 }}>
                        <Button
                          variant='contained'
                          color='secondary'
                          onClick={() => handleLogoutEntry(true)}
                          style={{ marginRight: 10 }}>
                          Yes, I Did
                        </Button>
                        <Button variant='contained' onClick={() => handleLogoutEntry(false)}>
                          No, I didn't
                        </Button>
                      </div>
                    </Grid>
                  </Grid>
                ) : (
                  <Grid container spacing={5}>
                    <Grid item xs={12} sm={12} md={4}>
                      <Typography color='secondary' variant='h6' align='center' gutterBottom>
                        {dayjs().format('dddd DD')}
                        {getOrdinal(dayjs().get('date'))}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={12} md={4}>
                      {activeEntry ? (
                        <Typography color='secondary' variant='h6' align='center' gutterBottom>
                          {dayjs.unix(activeEntry.entry).format('HH:mm:ss')}
                        </Typography>
                      ) : (
                        <div style={{ textAlign: 'center' }}>
                          <Button
                            variant='contained'
                            color='secondary'
                            disabled={disableLoginBtn}
                            onClick={() => handleClick('loginEntry')}>
                            Create Login Entry
                          </Button>
                        </div>
                      )}
                    </Grid>
                    <Grid item xs={12} sm={12} md={4}>
                      {!activeEntry ? (
                        <div style={{ textAlign: 'center' }}>
                          <Button variant='contained' color='secondary' disabled={true}>
                            Create Logout Entry
                          </Button>
                        </div>
                      ) : (
                        <div style={{ textAlign: 'center' }}>
                          <Button
                            variant='contained'
                            color='secondary'
                            disabled={disableLogoutBtn}
                            onClick={() => handleClick('logoutEntry')}>
                            Create Logout Entry
                          </Button>
                        </div>
                      )}
                    </Grid>
                  </Grid>
                )}
              </>
            )}
          </Paper>
        </Paper>
      )}
    </Observer>
  )
}

export const ExtraExpenses = ({ setWeekStart, setWeekEnd, weekStart, weekEnd, isLoading }) => {
  const classes = useStyles()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [showModal, setShowModal] = useState(false)
  const [expenses, setExpenses] = useState([])

  useEffect(() => {
    let unsubscribeListenerOnExpenses = setListenerOnExpenses(
      weekStart,
      weekEnd,
      setExpenses,
      userStore.currentUser.id
    )
    return () => {
      unsubscribeListenerOnExpenses()
    }
  }, [weekEnd, weekStart])

  const onClose = () => {
    setShowModal(false)
  }

  return (
    <Observer>
      {() => (
        <Paper className={classes.paper}>
          <Grid container spacing={0}>
            <Grid item xs={12} sm={12} md={9}>
              <Typography variant='h4' color='textPrimary' align='left' gutterBottom>
                Expenses{' '}
                {dayjs.unix(weekStart).startOf('week').unix() < dayjs().startOf('week').unix()
                  ? `(Week of ${dayjs.unix(weekStart).startOf('week').get('date')}${getOrdinal(
                      dayjs.unix(weekStart).startOf('week').get('date')
                    )}${' '}${getMonth(dayjs.unix(weekStart).startOf('week').month())}${
                      dayjs.unix(weekStart).get('year') !== dayjs().get('year')
                        ? " '" + dayjs.unix(weekStart).format('YY')
                        : ''
                    })`
                  : ''}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={12} md={3}>
              <div style={{ textAlign: isMobile ? 'center' : 'right' }}>
                <Button variant='contained' color='primary' onClick={() => setShowModal(true)}>
                  <AddCircleOutlinedIcon style={{ marginRight: 10 }} />
                  Add New Expense
                </Button>
              </div>
            </Grid>
          </Grid>
          <br />
          <Paper
            style={{ backgroundColor: appStore.darkMode ? '#303030' : '#fcfcfc' }}
            className={classes.Innerpaper}>
            <Scrollbars style={{ height: 300 }}>
              {expenses.map((expense, i) => {
                return (
                  <>
                    <Grid key={expense.id} container spacing={1}>
                      <Grid item xs={12}>
                        <span style={{ fontSize: 25 }}>
                          {dayjs.unix(expense.forDate || expense.createdAt).get('date')}
                          {getOrdinal(
                            dayjs.unix(expense.forDate || expense.createdAt).get('date')
                          )}{' '}
                          {getMonth(dayjs.unix(expense.forDate || expense.createdAt).month())}
                          {dayjs.unix(expense.forDate || expense.createdAt).get('year') !==
                          dayjs().get('year')
                            ? ` '${dayjs
                                .unix(expense.forDate || expense.createdAt)
                                .startOf('week')
                                .format('YY')}`
                            : ''}
                          {' - '}
                          {expense.name || ''} {expense.name && ' - '} ${expense.totalAmount}{' '}
                        </span>
                        {expense.isApproved ? (
                          <CheckCircleIcon fontSize='small' style={{ color: '#60e315' }} />
                        ) : (
                          <CancelIcon fontSize='small' style={{ color: '#f50157' }} />
                        )}
                        {!expense.isApproved && (
                          <DeleteIcon
                            onClick={() => {
                              // eslint-disable-next-line no-restricted-globals
                              if (confirm('Are you sure to delete this expense?')) {
                                changeExpenseStatus(expense.id, false)
                              }
                            }}
                            color='secondary'
                            fontSize='small'
                            style={{ float: 'right', cursor: 'pointer' }}
                          />
                        )}
                      </Grid>
                      <Grid item xs={12}>
                        <SimpleReactLightbox>
                          <SRLWrapper>
                            {expense.images.map((image) => {
                              return (
                                <a key={image} href={image} style={{ marginLeft: 10 }}>
                                  <img
                                    src={image}
                                    style={{ width: '50px', height: '50px', borderRadius: 5 }}
                                    alt={expense.name || ''}
                                  />
                                </a>
                              )
                            })}
                          </SRLWrapper>
                        </SimpleReactLightbox>
                      </Grid>
                    </Grid>
                    <br />
                    <Divider />
                    <br />
                  </>
                )
              })}
              {expenses.length === 0 && (
                <div style={{ textAlign: 'center' }}>No Expense Recorded</div>
              )}
            </Scrollbars>
          </Paper>
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
          {showModal && <ExpenseModal onClose={() => onClose()} />}
        </Paper>
      )}
    </Observer>
  )
}

const WeekEntries = ({
  userWeekEntries,
  isLoading,
  setWeekStart,
  setWeekEnd,
  weekStart,
  weekEnd,
  totalWeekSalary,
  approvedExpensesTotal,
}) => {
  const classes = useStyles()

  return (
    <Observer>
      {() => (
        <Paper className={classes.paper}>
          <Typography variant='h4' color='textPrimary' align='left' gutterBottom>
            Week of {dayjs.unix(weekStart).startOf('week').get('date')}
            {getOrdinal(dayjs.unix(weekStart).startOf('week').get('date'))}{' '}
            {getMonth(dayjs.unix(weekStart).startOf('week').month())}{' '}
            {dayjs.unix(weekStart).get('year') !== dayjs().get('year')
              ? `'${dayjs.unix(weekStart).startOf('week').format('YY')}`
              : ''}{' '}
            {isLoading && <CircularProgress size={25} color='secondary' />}
          </Typography>
          <>
            <TableContainer component={Paper}>
              <Scrollbars style={{ height: 600 }}>
                <Table className={classes.table} stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell align='center'>
                        <b>Date</b>
                      </TableCell>
                      <TableCell align='center'>
                        <b>Start Time</b>
                      </TableCell>
                      <TableCell align='center'>
                        <b>Finish Time</b>
                      </TableCell>
                      <TableCell align='center'>
                        <b>Duration</b>
                      </TableCell>
                      <TableCell align='center'>
                        <b>LunchBreak</b>
                      </TableCell>
                      <TableCell align='center'>
                        <b>LunchBreak Duration</b>
                      </TableCell>
                      <TableCell align='center'>
                        <b>Salary</b>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {userWeekEntries
                      .filter((entry) => !entry.isActive)
                      .map((entry) => (
                        <TableRow key={entry.id}>
                          <TableCell align='center'>
                            {dayjs.unix(entry.createdAt).format('dddd DD')}
                            {getOrdinal(dayjs.unix(entry.createdAt).get('date'))}
                          </TableCell>
                          <TableCell align='center'>
                            {dayjs.unix(entry.entry).format('HH:mm')}
                          </TableCell>
                          <TableCell align='center'>
                            {entry.actualExit
                              ? dayjs.unix(entry.actualExit).format('HH:mm')
                              : 'N/A'}
                          </TableCell>
                          <TableCell align='center'>
                            {getPrettyMs((entry.exit - entry.entry) * 1000)}
                          </TableCell>
                          <TableCell align='center'>{entry.lunchBreak ? 'Yes' : 'No'}</TableCell>
                          <TableCell align='center'>
                            {entry.lunchBreakDur ? entry.lunchBreakDur + 'm' : 'N/A'}
                          </TableCell>
                          <TableCell align='center'>
                            <b>
                              {`$${precisionRound(entry.totalSalary, 2)} ($${precisionRound(
                                entry.salary,
                                2
                              )}/hr)`}
                            </b>
                          </TableCell>
                        </TableRow>
                      ))}
                    <TableRow>
                      <TableCell align='center' />
                      <TableCell align='center' />
                      <TableCell align='center' />
                      <TableCell align='center' />
                      <TableCell align='center' />
                      <TableCell
                        align='center'
                        style={{ backgroundColor: appStore.darkMode ? '#303030' : '#6FA0CC' }}>
                        <b>Total</b>
                      </TableCell>
                      <TableCell
                        align='center'
                        style={{ backgroundColor: appStore.darkMode ? '#303030' : '#6FA0CC' }}>
                        <b>${precisionRound(totalWeekSalary, 2)}</b>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell align='center' />
                      <TableCell align='center' />
                      <TableCell align='center' />
                      <TableCell align='center' />
                      <TableCell align='center' />
                      <TableCell
                        align='center'
                        style={{ backgroundColor: appStore.darkMode ? '#303030' : '#6FA0CC' }}>
                        <b>Approved Expenses</b>
                      </TableCell>
                      <TableCell
                        align='center'
                        style={{ backgroundColor: appStore.darkMode ? '#303030' : '#6FA0CC' }}>
                        <b>+ ${precisionRound(approvedExpensesTotal, 2)}</b>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell align='center' />
                      <TableCell align='center' />
                      <TableCell align='center' />
                      <TableCell align='center' />
                      <TableCell align='center' />
                      <TableCell
                        align='center'
                        style={{ backgroundColor: appStore.darkMode ? '#303030' : '#6FA0CC' }}>
                        <b>Calculated Week Salary</b>
                      </TableCell>
                      <TableCell
                        align='center'
                        style={{ backgroundColor: appStore.darkMode ? '#303030' : '#6FA0CC' }}>
                        <b> = ${precisionRound(totalWeekSalary + approvedExpensesTotal, 2)}</b>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Scrollbars>
            </TableContainer>
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
          </>
        </Paper>
      )}
    </Observer>
  )
}

export default TimeTracker
