import React, { useState, useEffect, Fragment } from 'react'
import { Link } from 'react-router-dom'
import * as dayjs from 'dayjs'
import axios from 'axios'
import { Scrollbars } from 'react-custom-scrollbars'
import { makeStyles } from '@material-ui/core/styles'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import { useTheme } from '@material-ui/core/styles'
import { DatePicker } from '@material-ui/pickers'
import Container from '@material-ui/core/Container'
import Grid from '@material-ui/core/Grid'
import Tooltip from '@material-ui/core/Tooltip'
import Typography from '@material-ui/core/Typography'
import Paper from '@material-ui/core/Paper'
import Collapse from '@material-ui/core/Collapse'
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
import Button from '@material-ui/core/Button'
import CircularProgress from '@material-ui/core/CircularProgress'
import Popper from '@material-ui/core/Popper'
import PopupState, { bindToggle, bindPopper } from 'material-ui-popup-state'
import Fade from '@material-ui/core/Fade'
import ButtonGroup from '@material-ui/core/ButtonGroup'
import Checkbox from '@material-ui/core/Checkbox'
import EditIcon from '@material-ui/icons/Edit'
import FileCopyIcon from '@material-ui/icons/FileCopy'
import GetAppIcon from '@material-ui/icons/GetApp'
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp'
import IconButton from '@material-ui/core/IconButton'

import ShowPDFModal from './common/ShowPDFModal'
import AssignToModal from './common/AssignToModal'

import userStore from '../store/UserStore'
import appStore from '../store/AppStore'

import ClientLogsTable from './ClientLogsTable'
import ClientsAddEdit from './ClientAddEdit'
import DownloadCSVModal from './common/DownloadCSVModal'

import { Constants } from '../scripts/constants'
import Configs from '../scripts/configs'
import {
  searchClients,
  getEstimatesScheduledByClientId,
  changeEstimateSaleStatus,
  getEstimatesScheduled,
  getUserById,
  searchClientByEmail,
  getCleintById,
  addNewEventLog,
  getEstimatesScheduledByThreshold,
  changeEstimateScheduledDate,
  getEstimatesByEstimateNo,
} from '../scripts/remoteActions'
import {
  showToast,
  getSearchingKeywords,
  isEmail,
  calculatePriceWithoutTax,
  isNumeric,
} from '../scripts/localActions'

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
}))

const EstimatesScheduled = () => {
  const classes = useStyles()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [estimatesScheduled, setEstimatesScheduled] = useState([])
  const [limit, setLimit] = useState(100)
  const [isLoading, setIsLoading] = useState(false)
  const [refresh, setRefresh] = useState(false)
  const [query, setQuery] = useState('')
  const [allowSearch] = useState(true)
  const [clientToEdit, setClientToEdit] = useState({})
  const [showClientEditModal, setShowClientEditModal] = useState(false)
  const [showCSVDownloadDrawer, setShowCSVDownloadDrawer] = useState(false)
  const [fromYear, setFromYear] = useState(dayjs().add(1, 'year').toDate())
  const [toYear, setToYear] = useState(dayjs().add(2, 'year').toDate())
  const [CSVData, SetCSVData] = useState(null)

  useEffect(() => {
    if (query !== '') {
      handleSearch(query)
    } else {
      setEstimatesScheduledData(limit)
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
      setEstimatesScheduledData(limit)
    }
    // return () => {
    //   clearTimeout(timeoutId)
    // }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

  const setEstimatesScheduledData = async (resultLimit) => {
    try {
      setIsLoading(true)
      let estimates = await getEstimatesScheduled(resultLimit)
      estimates.forEach((estimates) => {
        estimates.allInfo = JSON.parse(estimates.allInfo)
      })
      await Promise.all(
        estimates.map(async (estimates) => {
          let client = await getCleintById(estimates.clientId)
          if (client.exists) {
            client = client.data()
            client.id = estimates.clientId
            estimates['clientInfo'] = client
          }
        })
      )
      setIsLoading(false)
      setEstimatesScheduled(estimates)
    } catch (err) {
      setIsLoading(false)
      console.error(err)
      showToast('Something went wrong fetching estimates', 'error')
    }
  }

  const handleSearch = async (searchQuery) => {
    try {
      if (searchQuery !== '' && allowSearch) {
        let clientsData = []
        setIsLoading(true)
        if (isNumeric(searchQuery)) {
          let estimates = await getEstimatesByEstimateNo(parseInt(searchQuery))
          estimates = estimates.filter(
            (estimate) => estimate.emailSent && estimate.saleStatus === 'SCHEDULED'
          )
          estimates.forEach((request) => {
            request['allInfo'] = JSON.parse(request.allInfo)
          })
          await Promise.all(
            estimates.map(async (estimate) => {
              if (estimate.clientId) {
                let client = await getCleintById(estimate.clientId)
                if (client.exists) {
                  client = client.data()
                  client.id = estimate.clientId
                  estimate['clientInfo'] = client
                }
              } else {
                let clientsData = await searchClientByEmail(estimate.generatedForEmail)
                if (clientsData.length !== 0) {
                  estimate['clientInfo'] = clientsData[0]
                }
              }
            })
          )
          setEstimatesScheduled(estimates)
        } else {
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
              let estimatesScheduled = await getEstimatesScheduledByClientId(clientData.id, limit)
              estimatesScheduled.forEach((request) => {
                request['allInfo'] = JSON.parse(request.allInfo)
                request['clientInfo'] = clientData
                finalRequests.push(request)
              })
            })
          )
          setEstimatesScheduled(finalRequests)
        }
        setIsLoading(false)
      }
    } catch (err) {
      setIsLoading(false)
      console.error(err)
      showToast('Something went wrong searching estimates', 'error')
    }
  }

  const fetchCSVData = async () => {
    try {
      setIsLoading(true)
      let estimates = await getEstimatesScheduledByThreshold(
        dayjs(fromYear).get('year'),
        dayjs(toYear).get('year')
      )
      await Promise.all(
        estimates.map(async (estimate) => {
          let client = await getCleintById(estimate.clientId)
          if (client.exists) {
            client = client.data()
            client.id = estimate.clientId
            estimate['clientInfo'] = client
          }
        })
      )
      let finalCSVData = estimates.map((e) => {
        return {
          'Assigned To Name': e?.assignedToName,
          'Assigned To Email': e?.assignedToEmail,
          'Client Name': e?.clientInfo?.name,
          'Client Email': e?.clientInfo?.email,
          'Client Phone': e?.clientInfo?.phone,
          'Client Address': e?.clientInfo?.address,
          'Total Before Taxes': calculatePriceWithoutTax(JSON.parse(e?.allInfo)),
          'Scheduled For': e?.scheduledFor,
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
          'Total Before Taxes': '',
          'Scheduled For': '',
        })
      }
      SetCSVData(finalCSVData)
      setIsLoading(false)
    } catch (err) {
      setIsLoading(false)
      console.error(err)
      showToast('Something went wrong fetching estimates', 'error')
    }
  }

  return (
    <div className={classes.root}>
      <Container fixed>
        <Grid container spacing={1}>
          <Grid item xs={12}>
            <Typography variant='h3' align='center' gutterBottom>
              Estimates Scheduled
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Paper className={classes.paper}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <InputBase
                    style={{ backgroundColor: appStore.darkMode ? '#303030' : '#f7f7f7' }}
                    className={classes.searchInput}
                    placeholder='Search By Client Name Or Email Or Estimate No.'
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
                      <MenuItem value={100}>100</MenuItem>
                      <MenuItem value={200}>200</MenuItem>
                      <MenuItem value={400}>400</MenuItem>
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
                  <EstimatesScheduledTable
                    estimatesScheduled={estimatesScheduled}
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
      </Container>
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
          fromYear={fromYear}
          toYear={toYear}
          setFromYear={setFromYear}
          setToYear={setToYear}
          CSVData={CSVData}
          setCSVData={SetCSVData}
          fetchCSVDataFunc={fetchCSVData}
          isLoading={isLoading}
          title='Download Estimates Scheduled CSV'
          fileName='Estimates Scheduled'
          onlyYear={true}
        />
      )}
    </div>
  )
}

const EstimatesScheduledTable = ({
  estimatesScheduled,
  setRefresh,
  setShowClientEditModal,
  setClientToEdit,
  isLoading,
  setIsLoading,
  refresh,
}) => {
  const classes = useStyles()
  const [showPDF, setShowPDF] = useState(false)
  const [genPDF, setGenPDF] = useState(null)
  const [selectedRecords, setSelectedRecords] = useState([])
  const [showScheduler, setShowScheduler] = useState(false)
  const [newScheduleDate, setNewScheduleDate] = useState(dayjs().add(1, 'year'))
  const [openId, setOpenId] = useState('')
  const [showAssigningModal, setShowAssigningModal] = useState(false)

  const handleStatusChange = async (status) => {
    try {
      if (
        // eslint-disable-next-line no-restricted-globals
        confirm(
          `Are You Sure to move ${selectedRecords.length} record(s) to ${Constants.EstimateStatus[status]}?`
        )
      ) {
        showToast('Moving...', 'info')
        setIsLoading(true)
        await Promise.all(
          selectedRecords.map(async (recordId) => {
            let changedEstimateKeys = await changeEstimateSaleStatus(recordId, status)

            // Creating Event Log-------------------------------------------------------------------
            let moveEvent
            if (status === 'NONE') {
              moveEvent = Constants.Events.ESTIMATE_MOVE_FROM_SCHEDULED_TO_SENT
            } else if (status === 'SALE_LOST') {
              moveEvent = Constants.Events.ESTIMATE_MOVE_FROM_SCHEDULED_TO_LOST
            } else if (status === 'SOLD') {
              moveEvent = Constants.Events.ESTIMATE_MOVE_FROM_SCHEDULED_TO_SOLD
            }
            let targetType = moveEvent.Type
            let eventDesc = moveEvent.Desc
            let byId = userStore.currentUser.id
            let estimate = estimatesScheduled.find((estimate) => estimate.id === recordId)
            estimate.allInfo = JSON.stringify(estimate.allInfo)
            delete estimate.clientInfo
            let forId = estimate.clientId
            let moreInfo = {
              prevObj: estimate,
              newObj: {
                ...estimate,
                ...changedEstimateKeys,
              },
            }
            await addNewEventLog(byId, forId, estimate.id, targetType, eventDesc, moreInfo)
            //--------------------------------------------------------------------------------------
          })
        )
        setSelectedRecords([])
        setRefresh((prevVal) => {
          return !prevVal
        })
        setIsLoading(false)
        showToast('Moved Successfully')
      }
    } catch (err) {
      setIsLoading(false)
      showToast('Something went wrong while moving', 'error')
      console.error(err)
    }
  }

  const handlePdfGen = async (currEstimateId, allInfo, userId) => {
    try {
      setIsLoading(true)
      let userDoc = await getUserById(userId)
      if (userDoc.exists) {
        let res = await axios.post(`${Configs.FirebaseFunctionUrl}/generatePdfContent`, {
          allInfo,
          currEstimateId,
          user: userDoc.data(),
          timeZone: dayjs.tz.guess(),
        })
        setGenPDF(res.data.buffer)
        setShowPDF(true)
      }
      setIsLoading(false)
    } catch (err) {
      console.error(err)
      showToast('Something Went wrong generating PDF', 'error')
      setGenPDF(null)
      setShowPDF(false)
      setIsLoading(false)
    }
  }

  const onClose = () => {
    setGenPDF(null)
    setShowPDF(false)
  }

  const editClientHandler = (record) => {
    setClientToEdit(record)
    setShowClientEditModal(true)
  }

  const handleScheduledDateChange = async () => {
    try {
      showToast('Changing Scheduled Date...', 'info')
      setIsLoading(true)
      await Promise.all(
        selectedRecords.map(async (recordId) => {
          let changedEstimateKeys = await changeEstimateScheduledDate(
            recordId,
            newScheduleDate.year()
          )

          // Creating Event Log-------------------------------------------------------------------
          let targetType = Constants.Events.ESTIMATE_SCHEDULED_DATE_CHANGED.Type
          let eventDesc = Constants.Events.ESTIMATE_SCHEDULED_DATE_CHANGED.Desc
          let byId = userStore.currentUser.id
          let estimate = estimatesScheduled.find((estimate) => estimate.id === recordId)
          estimate.allInfo = JSON.stringify(estimate.allInfo)
          delete estimate.clientInfo
          let forId = estimate.clientId
          let moreInfo = {
            prevObj: estimate,
            newObj: {
              ...estimate,
              ...changedEstimateKeys,
            },
          }
          await addNewEventLog(byId, forId, estimate.id, targetType, eventDesc, moreInfo)
          //--------------------------------------------------------------------------------------
        })
      )
      setSelectedRecords([])
      setRefresh((prevVal) => {
        return !prevVal
      })
      setShowScheduler(false)
      setIsLoading(false)
      showToast('Scheduled Date Changed Successfully')
    } catch (err) {
      setIsLoading(false)
      showToast('Something went wrong while changing scheduled date', 'error')
      console.error(err)
    }
  }

  return (
    <Paper>
      <br />
      <Typography variant='body1' color='textSecondary' align='center' gutterBottom>
        {isLoading && (
          <CircularProgress style={{ float: 'left', marginLeft: 15 }} size={25} color='secondary' />
        )}
        {selectedRecords.length !== 0 ? (
          <>
            {showScheduler ? (
              <div className='center-flex-column'>
                <DatePicker
                  views={['year']}
                  label='New Scheduled Year'
                  value={newScheduleDate.toDate()}
                  onChange={setNewScheduleDate}
                />
                <br />
                <Button
                  variant='contained'
                  color='primary'
                  size='small'
                  style={{}}
                  onClick={() => handleScheduledDateChange()}>
                  Edit
                </Button>
                <Button
                  // variant='contained'
                  color='secondary'
                  size='small'
                  style={{ marginTop: 10 }}
                  onClick={() => setShowScheduler(false)}>
                  Cancel
                </Button>
              </div>
            ) : (
              <div className='center-flex-row'>
                <PopupState variant='popper'>
                  {(popupState) => (
                    <div>
                      <Button
                        variant='contained'
                        color='secondary'
                        size='small'
                        {...bindToggle(popupState)}>
                        Move To...
                      </Button>
                      <Popper {...bindPopper(popupState)} transition style={{ zIndex: 10 }}>
                        {({ TransitionProps }) => (
                          <Fade {...TransitionProps} timeout={350}>
                            <Paper>
                              <ButtonGroup>
                                <Button>
                                  <Button
                                    variant='contained'
                                    color='primary'
                                    size='small'
                                    onClick={() => handleStatusChange('SOLD')}
                                    disabled={isLoading}>
                                    {Constants.EstimateStatus['SOLD']}
                                  </Button>
                                </Button>
                                <Button>
                                  <Button
                                    variant='contained'
                                    color='secondary'
                                    size='small'
                                    onClick={() => handleStatusChange('SALE_LOST')}
                                    disabled={isLoading}>
                                    {Constants.EstimateStatus['SALE_LOST']}
                                  </Button>
                                </Button>
                                <Button>
                                  <Button
                                    variant='contained'
                                    size='small'
                                    onClick={() => handleStatusChange('NONE')}
                                    disabled={isLoading}>
                                    {Constants.EstimateStatus['NONE']}
                                  </Button>
                                </Button>
                              </ButtonGroup>
                            </Paper>
                          </Fade>
                        )}
                      </Popper>
                    </div>
                  )}
                </PopupState>
                <Button
                  variant='contained'
                  size='small'
                  style={{ marginLeft: 10 }}
                  onClick={() => setShowAssigningModal(true)}>
                  Change Assign To
                </Button>
                <Button
                  variant='contained'
                  color='primary'
                  size='small'
                  style={{ marginLeft: 10 }}
                  onClick={() => setShowScheduler(true)}>
                  Edit Schedule
                </Button>
              </div>
            )}
          </>
        ) : (
          <span>Total Results: {estimatesScheduled.length}</span>
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
                      selectedRecords.length !== estimatesScheduled.length
                    }
                    checked={
                      estimatesScheduled.length !== 0 &&
                      selectedRecords.length === estimatesScheduled.length
                    }
                    onChange={(e) => {
                      if (selectedRecords.length !== 0) {
                        setSelectedRecords([])
                      } else {
                        setSelectedRecords(estimatesScheduled.map((rec) => rec.id))
                      }
                    }}
                  />
                </TableCell>
                <TableCell align='center'>
                  <b>Estimate No</b>
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
                  <b>Scheduled For</b>
                </TableCell>
                <TableCell align='center'>
                  <b>Total Before Taxes</b>
                </TableCell>
                <TableCell align='center'>
                  <b>Action</b>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {estimatesScheduled.map((record) => (
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
                    <TableCell align='center'>{record.estimateNo || '-'}</TableCell>
                    <Tooltip title={record.assignedToEmail} placement='left'>
                      <TableCell align='center'>{record.assignedToName}</TableCell>
                    </Tooltip>
                    <Tooltip
                      title='Double click to see / edit the client details'
                      placement='bottom'>
                      <TableCell
                        align='center'
                        onDoubleClick={() => editClientHandler(record?.clientInfo)}
                        style={{ cursor: 'pointer' }}>
                        {record?.clientInfo?.namePrefix ? record?.clientInfo?.namePrefix + ' ' : ''}{' '}
                        {record?.clientInfo?.name}
                      </TableCell>
                    </Tooltip>
                    <Tooltip
                      title='Double click to see / edit the client details'
                      placement='bottom'>
                      <TableCell
                        align='center'
                        onDoubleClick={() => editClientHandler(record?.clientInfo)}
                        style={{ cursor: 'pointer' }}>
                        {record?.clientInfo?.email}
                      </TableCell>
                    </Tooltip>
                    <TableCell align='center'>{record.scheduledFor}</TableCell>
                    <TableCell align='center'>{calculatePriceWithoutTax(record.allInfo)}</TableCell>
                    <TableCell align='center'>
                      <ButtonGroup variant='contained' color='primary'>
                        <Link
                          to={{
                            pathname: Constants.jobsConfigs.allPaths.Tools.routes.Estimate.route,
                            state: {
                              clientId: record.clientId,
                              editMode: true,
                              recordId: record.id,
                              duplicate: false,
                            },
                          }}
                          style={{
                            textDecoration: 'none',
                            backgroundColor: '#ef0256',
                          }}>
                          <Tooltip title='Edit' placement='bottom'>
                            <Button size='small'>
                              <EditIcon fontSize='small' style={{ color: '#ffffff' }} />
                            </Button>
                          </Tooltip>
                        </Link>
                        <Link
                          to={{
                            pathname: Constants.jobsConfigs.allPaths.Tools.routes.Estimate.route,
                            state: {
                              clientId: record.clientId,
                              editMode: true,
                              recordId: record.id,
                              duplicate: true,
                            },
                          }}
                          style={{
                            textDecoration: 'none',
                            backgroundColor: '#3f51b5',
                          }}>
                          <Tooltip title='Duplicate' placement='bottom'>
                            <Button size='small'>
                              <FileCopyIcon fontSize='small' style={{ color: '#ffffff' }} />
                            </Button>
                          </Tooltip>
                        </Link>
                      </ButtonGroup>
                      <br />
                      <br />
                      <Button
                        variant='contained'
                        size='small'
                        onClick={() => handlePdfGen(record.id, record.allInfo, record.assignedToId)}
                        disabled={isLoading}>
                        PDF
                      </Button>
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
      {showPDF && <ShowPDFModal pdfBuffer={genPDF} onClose={onClose} />}
      {showAssigningModal && (
        <AssignToModal
          onClose={() => setShowAssigningModal(false)}
          selectedRecords={selectedRecords}
          setSelectedRecords={setSelectedRecords}
          setRefresh={setRefresh}
          recordType={'ESTIMATE'}
        />
      )}
    </Paper>
  )
}

export default EstimatesScheduled
