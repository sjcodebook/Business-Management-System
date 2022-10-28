import React, { useState, useEffect, useMemo } from 'react'
import * as dayjs from 'dayjs'
import randomstring from 'randomstring'
import { SRLWrapper, useLightbox } from 'simple-react-lightbox'
import { Scrollbars } from 'react-custom-scrollbars'
import { makeStyles } from '@material-ui/core/styles'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import { useTheme } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import Autocomplete from '@material-ui/lab/Autocomplete'
import RemoveIcon from '@material-ui/icons/Remove'
import AddIcon from '@material-ui/icons/Add'
import CheckCircleIcon from '@material-ui/icons/CheckCircle'
import CancelIcon from '@material-ui/icons/Cancel'
import Divider from '@material-ui/core/Divider'

import SplitButton from './../../components/common/SplitButton'

import {
  precisionRound,
  getInitialWeekStart,
  getInitialWeekEnd,
  getOrdinal,
  getMonth,
  handleWeekChange,
  showToast,
} from '../../scripts/localActions'
import {
  setListenerOnExpenses,
  changeExpenseApproveStatus,
  changeExpenseStatus,
  addNewEventLog,
} from '../../scripts/remoteActions'
import { Constants } from '../../scripts/constants'

import userStore from '../../store/UserStore'
import appStore from '../../store/AppStore'

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(2),
    color: theme.palette.text.secondary,
  },
  Innerpaper: {
    padding: theme.spacing(2),
  },
}))

const ExpensesPanel = ({ users }) => {
  let unsubscribeListenerOnExpenses = null
  const classes = useStyles()
  const [email, setEmail] = useState('')
  const [weekStart, setWeekStart] = useState(getInitialWeekStart(Constants.ResetDay))
  const [weekEnd, setWeekEnd] = useState(getInitialWeekEnd(weekStart))
  const [isLoading, setIsLoading] = useState(false)
  const [approvedExpensesTotal, setApprovedExpensesTotal] = useState(0)
  const [expenses, setExpenses] = useState(null)
  const [allUsers, setAllUsersInfo] = useState([])
  const [resetKey, setResetKey] = useState(randomstring.generate())

  useEffect(() => {
    if (users) {
      setAllUsersInfo(users)
    }
  }, [users])

  useEffect(() => {
    if (expenses) {
      setApprovedExpensesTotal(
        expenses
          .filter((expense) => expense.isActive && expense.isApproved)
          .reduce((acc, curr) => {
            return (curr.totalAmount || 0) + acc
          }, 0)
      )
      expenses.forEach((expense) => {
        expense.user = allUsers.find((user) => user.uid === expense.userId)
      })
    }
  }, [allUsers, expenses])

  const handleReset = () => {
    setEmail('')
    setWeekStart(getInitialWeekStart(Constants.ResetDay))
    setWeekEnd(getInitialWeekEnd(weekStart))
    setIsLoading(false)
    setExpenses(null)
    setApprovedExpensesTotal(0)
    setResetKey(randomstring.generate())
  }

  const handleSubmit = () => {
    setIsLoading(true)
    if (unsubscribeListenerOnExpenses) {
      unsubscribeListenerOnExpenses()
    }
    let user = allUsers.find((user) => user.email === email)
    unsubscribeListenerOnExpenses = setListenerOnExpenses(
      weekStart,
      weekEnd,
      setExpenses,
      user ? user.uid : null
    )
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }

  return (
    <Paper className={classes.paper}>
      <Typography variant='h4' color='textPrimary' align='left' gutterBottom>
        Search Expense(s)
        <Button color='secondary' onClick={() => handleReset()}>
          Reset
        </Button>
      </Typography>
      <Paper
        style={{ backgroundColor: appStore.darkMode ? '#303030' : '#fcfcfc' }}
        className={classes.Innerpaper}>
        <Grid container spacing={4}>
          <Grid item xs={12} sm={12} md={6}>
            <div style={{ textAlign: 'center' }}>
              <Autocomplete
                key={resetKey}
                options={allUsers}
                onInputChange={(e, val, res) => {
                  if (res === 'reset') {
                    setEmail((val.split(' (')[1] || '').split(')')[0])
                  }
                }}
                loading={!users}
                getOptionLabel={(option) => `${option.name} (${option.email})`}
                renderInput={(params) => (
                  <TextField {...params} label='Search By Name' variant='outlined' />
                )}
              />
            </div>
          </Grid>
          <Grid item xs={12} sm={12} md={6}>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <div style={{ textAlign: 'center' }}>
                  <h1>
                    <RemoveIcon
                      onClick={() =>
                        handleWeekChange('prev', weekStart, weekEnd, setWeekStart, setWeekEnd)
                      }
                      style={{ cursor: 'pointer' }}
                    />
                  </h1>
                </div>
              </Grid>
              <Grid item xs={4}>
                <div style={{ textAlign: 'center' }}>
                  <h2>
                    Week of {dayjs.unix(weekStart).startOf('week').get('date')}
                    {getOrdinal(dayjs.unix(weekStart).startOf('week').get('date'))} of{' '}
                    {getMonth(dayjs.unix(weekStart).startOf('week').month())}
                    {dayjs.unix(weekStart).get('year') !== dayjs().get('year')
                      ? ` '${dayjs.unix(weekStart).startOf('week').format('YY')}`
                      : ''}
                  </h2>
                </div>
              </Grid>
              <Grid item xs={4}>
                <div style={{ textAlign: 'center' }}>
                  <h1>
                    <AddIcon
                      onClick={() =>
                        handleWeekChange('next', weekStart, weekEnd, setWeekStart, setWeekEnd)
                      }
                      style={{ cursor: 'pointer' }}
                    />
                  </h1>
                </div>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <div style={{ textAlign: 'center' }}>
              <Button
                variant='contained'
                color='primary'
                disabled={isLoading}
                onClick={() => handleSubmit()}>
                Search Expense(s)
              </Button>
            </div>
          </Grid>
        </Grid>
      </Paper>
      {expenses && (
        <ExpenseRecords
          expenses={expenses}
          approvedExpensesTotal={approvedExpensesTotal}
          allUsers={allUsers}
        />
      )}
    </Paper>
  )
}

const ExpenseRecords = ({ expenses, approvedExpensesTotal, allUsers }) => {
  const classes = useStyles()
  const theme = useTheme()
  const { openLightbox } = useLightbox()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [refresh, setRefresh] = useState(false)
  const [activeExpense, setActiveExpense] = useState({})
  const [showImages, setShowImages] = useState(false)
  const [imageLoading, setImageLoading] = useState(false)
  const [resetKey, setResetKey] = useState(randomstring.generate())

  const approvedOptions = [
    {
      name: 'Disapprove',
      id: 'disapprove',
    },
  ]
  const disapprovedOptions = [
    {
      name: 'Approve',
      id: 'approve',
    },
    {
      name: 'Delete',
      id: 'delete',
    },
  ]

  useEffect(() => {
    expenses.forEach((expense) => {
      expense.user = allUsers.find((user) => user.uid === expense.userId)
    })
  }, [allUsers, expenses, refresh])

  useEffect(() => {
    if (imageLoading && showImages) {
      openLightbox()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeExpense.id, showImages, openLightbox])

  const handleApproveStatusChng = async (expense, status) => {
    try {
      await changeExpenseApproveStatus(expense.id, status)
      // Creating Event Log-------------------------------------------------------------------
      let event = status ? Constants.Events.EXPENSE_APPROVED : Constants.Events.EXPENSE_DISAPPROVED
      let targetType = event.Type
      let eventDesc = event.Desc
      let byId = userStore.currentUser.id
      let moreInfo = {
        prevObj: {
          ...expense,
          isApproved: !status,
        },
        newObj: {
          ...expense,
          isApproved: status,
        },
      }
      addNewEventLog(byId, expense.userId, expense.id, targetType, eventDesc, moreInfo)
      //--------------------------------------------------------------------------------------
      setRefresh((prevVal) => !prevVal)
    } catch (err) {
      showToast('Something Went Wrong Changing Status', 'error')
      console.err(err)
    }
  }

  const handleClick = async (actionObj) => {
    setResetKey(randomstring.generate())
    setImageLoading(true)
    await new Promise((resolve, reject) => {
      setActiveExpense(actionObj)
      setTimeout(() => {
        resolve()
      }, 200)
    })
    setShowImages(true)
  }

  const handleMenuItemClick = (actionObj, eventId) => {
    if (eventId === 'approve') {
      handleApproveStatusChng(actionObj, true)
    } else if (eventId === 'disapprove') {
      handleApproveStatusChng(actionObj, false)
    } else if (eventId === 'delete') {
      // eslint-disable-next-line no-restricted-globals
      if (confirm('Are you sure to delete this expense?')) {
        changeExpenseStatus(actionObj.id, false).then((res) => {
          // Creating Event Log-------------------------------------------------------------------
          let targetType = Constants.Events.EXPENSE_DEACTIVATED.Type
          let eventDesc = Constants.Events.EXPENSE_DEACTIVATED.Desc
          let byId = userStore.currentUser.id
          let moreInfo = {
            prevObj: {
              ...actionObj,
              isActive: true,
            },
            newObj: {
              ...actionObj,
              isActive: false,
            },
          }
          addNewEventLog(byId, actionObj.userId, actionObj.id, targetType, eventDesc, moreInfo)
          //--------------------------------------------------------------------------------------
        })
      }
    }
  }

  const getFormattedExpenseDetail = (expense) => {
    let dayjsObj = dayjs.unix(expense.forDate || expense.createdAt)
    let finalStr = `${dayjsObj.get('date')}${getOrdinal(dayjsObj.get('date'))} ${getMonth(
      dayjsObj.month()
    )} ${dayjsObj.get('year') !== dayjs().get('year') ? "'" + dayjsObj.format('YY') : ''} - ${
      expense.user ? expense.user.nickname || expense.user.name : ' Loading...'
    }${expense.name ? ' - ' + expense.name : ''} - $${expense.totalAmount} `
    return finalStr
  }

  const expenseSRLWrapper = useMemo(
    () => (
      <SRLWrapper
        key={resetKey}
        callbacks={{
          onLightboxOpened: () => setImageLoading(false),
          onLightboxClosed: () => setShowImages(false),
        }}>
        <div
          style={{
            textAlign: 'left',
            marginTop: 40,
          }}>
          {activeExpense.images &&
            activeExpense.images.map((image) => {
              return (
                <a key={image} href={image} style={{ marginLeft: 10 }}>
                  <img
                    src={image}
                    style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: 5,
                    }}
                    alt={getFormattedExpenseDetail(activeExpense)}
                  />
                </a>
              )
            })}
        </div>
      </SRLWrapper>
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeExpense.images, activeExpense.name, resetKey]
  )

  if (expenses.length === 0) {
    return (
      <Paper className={classes.paper} style={{ textAlign: 'center' }}>
        <h2>No Record Found</h2>
      </Paper>
    )
  }

  return (
    <Paper className={classes.paper}>
      <div style={{ textAlign: 'center' }}>
        <h2>Approved Expenses Total: ${precisionRound(approvedExpensesTotal, 2)}</h2>
      </div>
      <Paper
        style={{ backgroundColor: appStore.darkMode ? '#303030' : '#fcfcfc' }}
        className={classes.Innerpaper}>
        <Scrollbars style={{ height: 600 }}>
          {expenses.map((expense, i) => {
            return (
              <div key={expense.id}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={9}>
                    <div style={{ textAlign: isMobile ? 'center' : 'left' }}>
                      <span style={{ fontSize: 25 }}>{getFormattedExpenseDetail(expense)}</span>
                      {expense.isApproved ? (
                        <CheckCircleIcon fontSize='small' style={{ color: '#60e315' }} />
                      ) : (
                        <CancelIcon fontSize='small' style={{ color: '#f50157' }} />
                      )}
                    </div>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <SplitButton
                      disabled={imageLoading}
                      actionObj={expense}
                      handleClick={handleClick}
                      handleMenuItemClick={handleMenuItemClick}
                      options={expense.isApproved ? approvedOptions : disapprovedOptions}
                      mainButtonText={'Show Images'}
                    />
                  </Grid>
                </Grid>
                <br />
                <Divider />
                <br />
              </div>
            )
          })}
        </Scrollbars>
      </Paper>
      <br />
      <div style={{ display: 'none' }}>{expenseSRLWrapper}</div>
    </Paper>
  )
}

export default ExpensesPanel
