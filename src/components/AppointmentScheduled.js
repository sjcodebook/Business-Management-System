import React, { useState, useEffect, Fragment } from 'react'
import ReadMoreReact from 'read-more-react'
import { Link } from 'react-router-dom'
import { Scrollbars } from 'react-custom-scrollbars'
import * as dayjs from 'dayjs'
import { makeStyles } from '@material-ui/core/styles'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import { useTheme } from '@material-ui/core/styles'
import Container from '@material-ui/core/Container'
import Grid from '@material-ui/core/Grid'
import Collapse from '@material-ui/core/Collapse'
import Typography from '@material-ui/core/Typography'
import Paper from '@material-ui/core/Paper'
import InputBase from '@material-ui/core/InputBase'
import MenuItem from '@material-ui/core/MenuItem'
import FormControl from '@material-ui/core/FormControl'
import Select from '@material-ui/core/Select'
import InputLabel from '@material-ui/core/InputLabel'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Tooltip from '@material-ui/core/Tooltip'
import Button from '@material-ui/core/Button'
import CircularProgress from '@material-ui/core/CircularProgress'
import Checkbox from '@material-ui/core/Checkbox'
import IconButton from '@material-ui/core/IconButton'
import GetAppIcon from '@material-ui/icons/GetApp'
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp'
import DeleteIcon from '@material-ui/icons/Delete'

import ClientLogsTable from './ClientLogsTable'
import ClientsAddEdit from './ClientAddEdit'
import DownloadCSVModal from './common/DownloadCSVModal'
import AssignToModal from './common/AssignToModal'
import ScheduledForModal from './common/ScheduledForModal'

import { Constants } from './../scripts/constants'

import appStore from '../store/AppStore'
import userStore from '../store/UserStore'

import {
  getAppointmentScheduled,
  getCleintById,
  searchClients,
  getEstimatesRequestsByClientId,
  searchClientByEmail,
  addNewEventLog,
  getEstimatesRequestsByThreshold,
  removeEstimateRequest,
} from '../scripts/remoteActions'
import { showToast, getSearchingKeywords, isEmail } from '../scripts/localActions'

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    marginTop: 20,
  },
  paper: {
    padding: theme.spacing(2),
    color: theme.palette.text.secondary,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#f7f7f7',
    padding: '5px',
    height: '100%',
    width: '100%',
  },
  iconButton: {
    padding: 10,
    backgroundColor: '#f7f7f7',
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 140,
  },
  table: {
    minWidth: 650,
  },
  paperModal: {
    position: 'absolute',
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
}))

const AppointmentScheduled = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const classes = useStyles()
  const [appointmentScheduled, setAppointmentScheduled] = useState([])
  const [limit, setLimit] = useState(2000)
  const [isLoading, setIsLoading] = useState(false)
  const [refresh, setRefresh] = useState(false)
  const [query, setQuery] = useState('')
  const [allowSearch] = useState(true)
  const [clientToEdit, setClientToEdit] = useState({})
  const [showClientEditModal, setShowClientEditModal] = useState(false)
  const [showCSVDownloadDrawer, setShowCSVDownloadDrawer] = useState(false)
  const [fromDateUnix, setFromDateUnix] = useState(
    dayjs().subtract(1, 'month').startOf('day').unix()
  )
  const [toDateUnix, setToDateUnix] = useState(dayjs().unix())
  const [CSVData, SetCSVData] = useState(null)

  useEffect(() => {
    if (query !== '') {
      handleSearch(query)
    } else {
      setAppointmentScheduledData(limit)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limit, refresh])

  useEffect(() => {
    // setAllowSearch(false)
    // let timeoutId = setTimeout(() => {
    //   setAllowSearch(true)
    // }, 100)
    if (query !== '') {
      handleSearch(query)
    } else {
      setAppointmentScheduledData(limit)
    }
    // return () => {
    //   clearTimeout(timeoutId)
    // }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

  const setAppointmentScheduledData = async (resultLimit) => {
    try {
      setIsLoading(true)
      let leads = await getAppointmentScheduled(resultLimit)
      await Promise.all(
        leads.map(async (lead) => {
          if (lead.clientId) {
            let client = await getCleintById(lead.clientId)
            if (client.exists) {
              client = client.data()
              client.id = lead.clientId
              lead['clientInfo'] = client
            }
          }
        })
      )
      setIsLoading(false)
      setAppointmentScheduled(leads)
    } catch (err) {
      setIsLoading(false)
      console.error(err)
      showToast('Something went wrong fetching appointment scheduled', 'error')
    }
  }

  const handleSearch = async (searchQuery) => {
    try {
      if (searchQuery !== '' && allowSearch) {
        let clientsData = []
        setIsLoading(true)
        if (isEmail(searchQuery)) {
          clientsData = await searchClientByEmail(searchQuery)
        } else {
          const keywordChunk = getSearchingKeywords(searchQuery)
          if (keywordChunk.length !== 0) {
            clientsData = await searchClients(keywordChunk, limit)
          }
        }
        let finalRequests = []
        await Promise.all(
          clientsData.map(async (clientData) => {
            let estimatesRequest = await getEstimatesRequestsByClientId(clientData.id)
            estimatesRequest = estimatesRequest.filter(
              (request) => request.assignedToId && request.scheduledFor
            )
            estimatesRequest.forEach((request) => {
              request['clientInfo'] = clientData
              finalRequests.push(request)
            })
          })
        )
        setIsLoading(false)
        setAppointmentScheduled(finalRequests)
      }
    } catch (err) {
      setIsLoading(false)
      console.error(err)
      showToast('Something went wrong searching leads assigned', 'error')
    }
  }

  const fetchCSVData = async () => {
    try {
      setIsLoading(true)
      let requests = await getEstimatesRequestsByThreshold(fromDateUnix, toDateUnix)
      requests = requests.filter((request) => request.assignedToId && request.scheduledFor)
      await Promise.all(
        requests.map(async (request) => {
          let client = await getCleintById(request.clientId)
          if (client.exists) {
            client = client.data()
            client.id = request.clientId
            request['clientInfo'] = client
          }
        })
      )
      let finalCSVData = requests.map((r) => {
        return {
          'Assigned To Name': r?.assignedToName,
          'Assigned To Email': r?.assignedToEmail,
          'Client Name': r?.clientInfo?.name,
          'Client Email': r?.clientInfo?.email,
          'Client Phone': r?.clientInfo?.phone,
          'Client Address': r?.clientInfo?.address,
          'Client Message': r?.message,
          'Scheduled For': dayjs.unix(r?.scheduledFor).format('DD MMMM YYYY'),
          'Requested On': dayjs.unix(r?.createdAt).format('DD MMMM YYYY'),
        }
      })
      if (finalCSVData.length === 0) {
        finalCSVData.push({
          'Assigned To Name': '',
          'Assigned To Email': '',
          'Client Name': '',
          'Client Email': '',
          'Client Phone': '',
          'Client Address': '',
          'Client Message': '',
          'Scheduled For': '',
          'Requested On': '',
        })
      }
      SetCSVData(finalCSVData)
      setIsLoading(false)
    } catch (err) {
      setIsLoading(false)
      console.error(err)
      showToast('Something went wrong fetching estimates request', 'error')
    }
  }

  return (
    <div className={classes.root}>
      <Container fixed>
        <Grid container spacing={1}>
          <Grid item xs={12}>
            <Typography variant='h3' align='center' gutterBottom>
              Appointment Scheduled
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Paper className={classes.paper}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <InputBase
                    style={{
                      backgroundColor: appStore.darkMode ? '#303030' : '#f7f7f7',
                    }}
                    className={classes.searchInput}
                    placeholder='Search By Client Name Or Email'
                    onChange={(e) => setQuery(e.target.value.trim())}
                  />
                </Grid>
                <Grid item xs={12} md={6} style={{ textAlign: isMobile ? 'center' : 'right' }}>
                  <FormControl variant='outlined' className={classes.formControl}>
                    <InputLabel id='number-of-estimates'>Show Entries</InputLabel>
                    <Select
                      labelId='number-of-estimates'
                      value={limit}
                      onChange={(e) => setLimit(e.target.value)}
                      label='Show Entries'>
                      <MenuItem value={2000}>2000</MenuItem>
                      <MenuItem value={4000}>4000</MenuItem>
                      <MenuItem value={10000}>10000</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
              <br />
              <Grid container spacing={3}>
                <Grid
                  item
                  xs={isMobile ? 12 : 6}
                  style={{ textAlign: isMobile ? 'center' : 'left' }}>
                  <Tooltip title='Download CSV' placement='bottom'>
                    <span>
                      <Button
                        variant='contained'
                        size='small'
                        color='secondary'
                        onClick={() => setShowCSVDownloadDrawer(true)}
                        disabled={isLoading}>
                        <GetAppIcon />
                      </Button>
                    </span>
                  </Tooltip>
                </Grid>
                <Grid
                  item
                  xs={isMobile ? 12 : 6}
                  style={{ textAlign: isMobile ? 'center' : 'right' }}>
                  <Button
                    variant='contained'
                    size='small'
                    color='primary'
                    onClick={() => {
                      setRefresh((prevVal) => {
                        return !prevVal
                      })
                    }}
                    disabled={isLoading}>
                    Refresh
                  </Button>
                </Grid>
              </Grid>
              <br />
              <br />
              <Grid container spacing={1}>
                <Grid item xs={12}>
                  <AppointmentScheduledTable
                    appointmentScheduled={appointmentScheduled}
                    setRefresh={setRefresh}
                    setShowClientEditModal={setShowClientEditModal}
                    setClientToEdit={setClientToEdit}
                    isLoading={isLoading}
                    setIsLoading={setIsLoading}
                    refresh={refresh}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
        {showClientEditModal && (
          <ClientsAddEdit
            onClose={() => setShowClientEditModal(false)}
            setRefresh={setRefresh}
            modalMode={'EDIT'}
            clientToEdit={clientToEdit}
          />
        )}
        {showCSVDownloadDrawer && (
          <DownloadCSVModal
            onClose={() => setShowCSVDownloadDrawer(false)}
            fromDateUnix={fromDateUnix}
            toDateUnix={toDateUnix}
            setFromDateUnix={setFromDateUnix}
            setToDateUnix={setToDateUnix}
            CSVData={CSVData}
            setCSVData={SetCSVData}
            fetchCSVDataFunc={fetchCSVData}
            isLoading={isLoading}
            title='Download Appointment Scheduled CSV'
            fileName='Appointment Scheduled'
          />
        )}
      </Container>
    </div>
  )
}

const AppointmentScheduledTable = ({
  appointmentScheduled,
  setRefresh,
  setShowClientEditModal,
  setClientToEdit,
  isLoading,
  setIsLoading,
  refresh,
}) => {
  const classes = useStyles()
  const [selectedRecords, setSelectedRecords] = useState([])
  const [openId, setOpenId] = useState('')
  const [showAssigningModal, setShowAssigningModal] = useState(false)
  const [showScheduledForModal, setShowScheduledForModal] = useState(false)

  const handleDelete = async () => {
    try {
      // eslint-disable-next-line no-restricted-globals
      if (window.confirm(`Are You Sure to delete ${selectedRecords.length} record(s)?`)) {
        showToast('Deleting...', 'info')
        setIsLoading(true)
        await Promise.all(
          selectedRecords.map(async (recordId) => {
            await removeEstimateRequest(recordId)

            // Creating Event Log-------------------------------------------------------------------
            let targetType = Constants.Events.ESTIMATE_REQUEST_DELETED.Type
            let eventDesc = Constants.Events.ESTIMATE_REQUEST_DELETED.Desc
            let byId = userStore.currentUser.id
            let request = appointmentScheduled.find((request) => request.id === recordId)
            let forId = request ? request.clientInfo.id : ''
            let moreInfo = {
              prevObj: request,
              newObj: null,
            }
            await addNewEventLog(byId, forId, recordId, targetType, eventDesc, moreInfo)
            //--------------------------------------------------------------------------------------
          })
        )
        setSelectedRecords([])
        setRefresh((prevVal) => {
          return !prevVal
        })
        setIsLoading(false)
        showToast('Deleted Successfully')
      }
    } catch (err) {
      showToast('Something went wrong while deleting', 'error')
      console.error(err)
    }
  }

  const editClientHandler = (record) => {
    setClientToEdit(record)
    setShowClientEditModal(true)
  }

  return (
    <Paper>
      <br />
      <Typography variant='body1' color='textSecondary' align='center' gutterBottom>
        {isLoading && (
          <CircularProgress style={{ float: 'left', marginLeft: 15 }} size={25} color='secondary' />
        )}
        {selectedRecords.length !== 0 ? (
          <div className='center-flex-row'>
            <Button
              variant='contained'
              color='secondary'
              size='small'
              disabled={isLoading}
              onClick={() => setShowScheduledForModal(true)}>
              Change Schedule For
            </Button>
            <Button
              variant='contained'
              size='small'
              disabled={isLoading}
              style={{ marginLeft: 10 }}
              onClick={() => setShowAssigningModal(true)}>
              Change Assign To
            </Button>
            <Button
              variant='contained'
              color='secondary'
              size='small'
              style={{ marginLeft: 10 }}
              disabled={isLoading}
              onClick={handleDelete}>
              <DeleteIcon />
            </Button>
          </div>
        ) : (
          <>Total Results: {appointmentScheduled.length}</>
        )}
      </Typography>
      <br />
      <TableContainer component={Paper}>
        <Scrollbars style={{ height: 800 }}>
          <Table className={classes.table} stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell />
                <TableCell align='center' padding='checkbox'>
                  <Checkbox
                    indeterminate={
                      selectedRecords.length !== 0 &&
                      selectedRecords.length !== appointmentScheduled.length
                    }
                    checked={
                      appointmentScheduled.length !== 0 &&
                      selectedRecords.length === appointmentScheduled.length
                    }
                    onChange={(e) => {
                      if (selectedRecords.length !== 0) {
                        setSelectedRecords([])
                      } else {
                        setSelectedRecords(appointmentScheduled.map((rec) => rec.id))
                      }
                    }}
                  />
                </TableCell>
                <TableCell align='center'>
                  <b>Assigned To</b>
                </TableCell>
                <TableCell align='center'>
                  <b>Client Name</b>
                </TableCell>
                <TableCell align='center'>
                  <b>Client Email</b>
                </TableCell>
                <TableCell align='center'>
                  <b>Client Phone</b>
                </TableCell>
                <TableCell align='center'>
                  <b>Client Address</b>
                </TableCell>
                <TableCell align='center'>
                  <b>Scheduled For</b>
                </TableCell>
                <TableCell align='center'>
                  <b>Client Message</b>
                </TableCell>
                <TableCell align='center'>
                  <b>Action</b>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {appointmentScheduled.map((record) => (
                <Fragment>
                  <TableRow key={record.id}>
                    <TableCell>
                      <IconButton
                        aria-label='expand row'
                        size='small'
                        onClick={() =>
                          setOpenId((prevVal) => {
                            if (record.id === prevVal) {
                              return ''
                            }
                            return record.id
                          })
                        }>
                        {record.id === openId ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                      </IconButton>
                    </TableCell>
                    <TableCell align='center' padding='checkbox'>
                      <Checkbox
                        checked={selectedRecords.includes(record.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedRecords((prevVal) => {
                              return [...prevVal, record.id]
                            })
                          } else {
                            setSelectedRecords((prevVal) => {
                              return prevVal.filter((val) => val !== record.id)
                            })
                          }
                        }}
                      />
                    </TableCell>
                    <Tooltip title={record.assignedToEmail} placement='bottom'>
                      <TableCell align='center' style={{ cursor: 'pointer' }}>
                        {record.assignedToName}
                      </TableCell>
                    </Tooltip>
                    <Tooltip
                      title='Double click to see / edit the client details'
                      placement='bottom'>
                      <TableCell
                        align='center'
                        onDoubleClick={() => editClientHandler(record.clientInfo)}
                        style={{ cursor: 'pointer' }}>
                        {record.clientInfo.namePrefix ? record.clientInfo.namePrefix + ' ' : ''}
                        {record.clientInfo.name}
                      </TableCell>
                    </Tooltip>
                    <Tooltip
                      title='Double click to see / edit the client details'
                      placement='bottom'>
                      <TableCell
                        align='center'
                        onDoubleClick={() => editClientHandler(record.clientInfo)}
                        style={{ cursor: 'pointer' }}>
                        {record.clientInfo.email}
                      </TableCell>
                    </Tooltip>
                    <Tooltip
                      title='Double click to see / edit the client details'
                      placement='bottom'>
                      <TableCell
                        align='center'
                        onDoubleClick={() => editClientHandler(record.clientInfo)}
                        style={{ cursor: 'pointer' }}>
                        {record.clientInfo.phone}
                      </TableCell>
                    </Tooltip>
                    <Tooltip
                      title='Double click to see / edit the client details'
                      placement='bottom'>
                      <TableCell
                        align='center'
                        onDoubleClick={() => editClientHandler(record.clientInfo)}
                        style={{ cursor: 'pointer' }}>
                        {record.clientInfo.address}
                      </TableCell>
                    </Tooltip>
                    <TableCell align='center'>
                      {dayjs.unix(record.scheduledFor).format('DD MMMM YYYY')}
                    </TableCell>
                    <TableCell align='center'>
                      <ReadMoreReact text={record.message} readMoreText='... read more' />
                    </TableCell>
                    <TableCell align='center'>
                      <Link
                        to={{
                          pathname: Constants.jobsConfigs.allPaths.Tools.routes.Estimate.route,
                          state: {
                            clientId: record.clientId,
                            requestId: record.id,
                          },
                        }}
                        style={{ textDecoration: 'none' }}>
                        <Button
                          variant='contained'
                          color='primary'
                          size='small'
                          disabled={isLoading}>
                          Send Estimate
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    {/* <TableCell /> */}
                    <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={10}>
                      <Collapse
                        style={{ padding: 10 }}
                        in={record.id === openId}
                        timeout='auto'
                        unmountOnExit>
                        <ClientLogsTable
                          client={record.clientInfo || {}}
                          refresh={refresh}
                          setRefresh={setRefresh}
                          isLoading={isLoading}
                        />
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </Fragment>
              ))}
            </TableBody>
          </Table>
        </Scrollbars>
      </TableContainer>
      {showAssigningModal && (
        <AssignToModal
          onClose={() => setShowAssigningModal(false)}
          selectedRecords={selectedRecords}
          setSelectedRecords={setSelectedRecords}
          setRefresh={setRefresh}
          recordType={'ESTIMATE_REQUEST'}
        />
      )}
      {showScheduledForModal && (
        <ScheduledForModal
          onClose={() => setShowScheduledForModal(false)}
          selectedRecords={selectedRecords}
          setSelectedRecords={setSelectedRecords}
          setRefresh={setRefresh}
        />
      )}
    </Paper>
  )
}

export default AppointmentScheduled
