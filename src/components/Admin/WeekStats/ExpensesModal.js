import React, { useState, useEffect, Fragment } from 'react'
import dayjs from 'dayjs'
import { makeStyles } from '@material-ui/core/styles'
import { Scrollbars } from 'react-custom-scrollbars'
import { useTheme } from '@material-ui/core/styles'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import Paper from '@material-ui/core/Paper'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import Box from '@material-ui/core/Box'
import Modal from '@material-ui/core/Modal'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import CancelOutlinedIcon from '@material-ui/icons/CancelOutlined'
import Collapse from '@material-ui/core/Collapse'
import IconButton from '@material-ui/core/IconButton'
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp'
import CircularProgress from '@material-ui/core/CircularProgress'

import { precisionRound } from './../../../scripts/localActions'
import { fetchWeekExpenses, getUserById } from './../../../scripts/remoteActions'

import appStore from './../../../store/AppStore'

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(2),
    color: theme.palette.text.secondary,
  },
  Innerpaper: {
    padding: theme.spacing(2),
  },
  paperModal: {
    position: 'absolute',
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
}))

const getModalStyle = () => {
  const top = 50
  const left = 50

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
    borderRadius: 20,
  }
}

const ExpensesModal = ({ onClose, weekStart, weekEnd }) => {
  const classes = useStyles()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [modalStyle] = useState(getModalStyle())
  const [totalExpenses, setTotalExpenses] = useState(0)
  const [allInfo, setAllInfo] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setIsLoading(true)
    fetchWeekExpenses(weekStart, weekEnd)
      .then(async (res) => {
        res = res.filter((expense) => expense.isApproved)
        let infoObj = {}
        res.forEach((entry) => {
          if (!infoObj[entry.userId]) {
            infoObj[entry.userId] = {
              expenses: [],
              userInfo: {},
            }
          }
          infoObj[entry.userId]['expenses'].push(entry)
        })
        await Promise.all(
          Object.keys(infoObj).map(async (userId) => {
            let userDoc = await getUserById(userId)
            if (userDoc.exists) {
              infoObj[userId]['userInfo'] = userDoc.data()
            }
          })
        )
        setAllInfo(infoObj)
        setTotalExpenses(
          precisionRound(
            res
              .filter((expense) => expense.isActive && expense.isApproved)
              .reduce((acc, curr) => {
                return (curr.totalAmount || 0) + acc
              }, 0),
            2
          )
        )
        setIsLoading(false)
      })
      .catch((err) => {
        setIsLoading(false)
        setTotalExpenses(0)
        setAllInfo({})
      })
  }, [weekStart, weekEnd])

  return (
    <Modal open={true}>
      <Scrollbars>
        <div
          style={{
            ...modalStyle,
            width: isMobile ? '100%' : '90%',
            height: isMobile ? '100%' : '90%',
          }}
          className={classes.paperModal}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant='h4' align='left' gutterBottom>
                <CancelOutlinedIcon
                  style={{ float: 'right', cursor: 'pointer' }}
                  fontSize='large'
                  onClick={() => onClose()}
                />
                Week Expenses Info
              </Typography>
            </Grid>
            <Grid item xs={12}>
              {isLoading ? (
                <CircularProgress />
              ) : (
                <Paper style={{ backgroundColor: appStore.darkMode ? '#303030' : '#fcfcfc' }}>
                  <TableContainer component={Paper}>
                    <Scrollbars style={{ height: isMobile ? '80vh' : '70vh' }}>
                      <Table className={classes.table} stickyHeader>
                        <TableHead>
                          <TableRow>
                            <TableCell />
                            <TableCell align='center'>
                              <b>Nickname / Name</b>
                            </TableCell>
                            <TableCell align='center'>
                              <b>Total Approved Expenses</b>
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {Object.values(allInfo).map((info) => (
                            <Row key={JSON.stringify(info)} info={info} />
                          ))}
                          <TableCell align='center' />
                          <TableCell align='center' />
                          <TableCell
                            align='center'
                            style={{ backgroundColor: appStore.darkMode ? '#303030' : '#6FA0CC' }}>
                            <b>{'Total: $' + totalExpenses}</b>
                          </TableCell>
                        </TableBody>
                      </Table>
                    </Scrollbars>
                  </TableContainer>
                </Paper>
              )}
            </Grid>
          </Grid>
        </div>
      </Scrollbars>
    </Modal>
  )
}

const Row = ({ info }) => {
  const classes = useStyles()
  const [open, setOpen] = React.useState(false)

  return (
    <Fragment>
      <TableRow key={info.userInfo.uid} className={classes.rowRoot}>
        <TableCell>
          <IconButton aria-label='expand row' size='small' onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell align='center'>{info.userInfo.nickname || info.userInfo.name}</TableCell>
        <TableCell align='center'>
          {'$' +
            precisionRound(
              info.expenses
                .filter((expense) => expense.isActive && expense.isApproved)
                .reduce((acc, curr) => {
                  return (curr.totalAmount || 0) + acc
                }, 0),
              2
            )}
        </TableCell>
      </TableRow>
      <TableRow>
        {/* <TableCell /> */}
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
          <Collapse style={{ padding: 10 }} in={open} timeout='auto' unmountOnExit>
            <MoreInfoTable expenses={info.expenses} user={info.userInfo} />
          </Collapse>
        </TableCell>
      </TableRow>
    </Fragment>
  )
}

const MoreInfoTable = ({ expenses, user }) => {
  return (
    <Box
      margin={1}
      style={{
        backgroundColor: appStore.darkMode ? '#303030' : '#ececec',
        padding: 10,
        borderRadius: 10,
      }}>
      <Typography variant='h6' gutterBottom component='div'>
        More Information on <b>{user.nickname || user.name}</b>
      </Typography>
      <Table size='small' align='center'>
        <TableHead>
          <TableRow>
            <TableCell align='center'>
              <b>Expense Date</b>
            </TableCell>
            <TableCell align='center'>
              <b>Expense Name</b>
            </TableCell>
            <TableCell align='center'>
              <b>Expense Amount</b>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {expenses.map((entry) => (
            <TableRow key={entry.id}>
              <TableCell align='center'>
                {dayjs.unix(entry.forDate).format('(ddd) DD/MM/YYYY')}
              </TableCell>
              <TableCell align='center'>{entry.name || '-'}</TableCell>
              <TableCell align='center'>
                {entry.totalAmount ? '$' + precisionRound(entry.totalAmount, 2) : 0}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  )
}

export default ExpensesModal
