import React, { useState, useEffect, Fragment } from 'react'
import ReadMoreReact from 'read-more-react'
import * as dayjs from 'dayjs'
import { makeStyles } from '@material-ui/core/styles'
import { Scrollbars } from 'react-custom-scrollbars'
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
import AddCircleIcon from '@material-ui/icons/AddCircle'
import TextField from '@material-ui/core/TextField'
import Modal from '@material-ui/core/Modal'
import Divider from '@material-ui/core/Divider'
import CancelOutlinedIcon from '@material-ui/icons/CancelOutlined'
import LinearProgress from '@material-ui/core/LinearProgress'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import DeleteIcon from '@material-ui/icons/Delete'
import Checkbox from '@material-ui/core/Checkbox'
import GetAppIcon from '@material-ui/icons/GetApp'
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp'
import IconButton from '@material-ui/core/IconButton'

import ClientLogsTable from './ClientLogsTable'
import ClientsAddEdit from './ClientAddEdit'
import DownloadCSVModal from './common/DownloadCSVModal'
import AssignToModal from './common/AssignToModal'

import userStore from './../store/UserStore'
import appStore from './../store/AppStore'

import { Constants } from './../scripts/constants'
import {
  getEstimatesRequests,
  getCleintById,
  searchClients,
  getEstimatesRequestsByClientId,
  removeEstimateRequest,
  searchClientByEmail,
  searchClientByPhone,
  createNewClient,
  addNewEstimateRequest,
  editClient,
  addNewEventLog,
  getEstimatesRequestsByThreshold,
} from './../scripts/remoteActions'
import {
  showToast,
  getSearchableKeywords,
  getSearchingKeywords,
  isEmail,
} from './../scripts/localActions'

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

const EstimatesRequest = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const classes = useStyles()
  const [estimatesRequest, setEstimatesRequest] = useState([])
  const [limit, setLimit] = useState(2000)
  const [isLoading, setIsLoading] = useState(false)
  const [refresh, setRefresh] = useState(false)
  const [query, setQuery] = useState('')
  const [allowSearch] = useState(true)
  const [clientToEdit, setClientToEdit] = useState({})
  const [showModal, setShowModal] = useState(false)
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
      setEstimatesRequestData(limit)
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
      setEstimatesRequestData(limit)
    }
    // return () => {
    //   clearTimeout(timeoutId)
    // }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

  const setEstimatesRequestData = async (resultLimit) => {
    try {
      setIsLoading(true)
      let requests = await getEstimatesRequests(resultLimit)
      await Promise.all(
        requests.map(async (request) => {
          if (request.clientId) {
            let client = await getCleintById(request.clientId)
            if (client.exists) {
              client = client.data()
              client.id = request.clientId
              request['clientInfo'] = client
            }
          }
        })
      )
      setIsLoading(false)
      setEstimatesRequest(requests)
    } catch (err) {
      setIsLoading(false)
      console.error(err)
      showToast('Something went wrong fetching estimates request', 'error')
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
              (request) => !request.assignedToId && !request.scheduledFor
            )
            estimatesRequest.forEach((request) => {
              request['clientInfo'] = clientData
              finalRequests.push(request)
            })
          })
        )
        setIsLoading(false)
        setEstimatesRequest(finalRequests)
      }
    } catch (err) {
      setIsLoading(false)
      console.error(err)
      showToast('Something went wrong searching estimates request', 'error')
    }
  }

  const fetchCSVData = async () => {
    try {
      setIsLoading(true)
      let requests = await getEstimatesRequestsByThreshold(fromDateUnix, toDateUnix, false)
      requests = requests.filter((request) => !request.assignedToId && !request.scheduledFor)
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
          'Client Name': r?.clientInfo?.name,
          'Client Email': r?.clientInfo?.email,
          'Client Phone': r?.clientInfo?.phone,
          'Client Address': r?.clientInfo?.address,
          'Client Message': r?.message,
          'Requested On': dayjs.unix(r?.createdAt).format('DD MMMM YYYY'),
        }
      })
      if (finalCSVData.length === 0) {
        finalCSVData.push({
          'Client Name': '',
          'Client Email': '',
          'Client Phone': '',
          'Client Address': '',
          'Client Message': '',
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
              Estimates Request
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Paper className={classes.paper}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <InputBase
                    style={{ backgroundColor: appStore.darkMode ? '#303030' : '#f7f7f7' }}
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
                  <EstimatesRequestsTable
                    estimatesRequest={estimatesRequest}
                    setRefresh={setRefresh}
                    setShowModal={setShowModal}
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
        {showModal && (
          <AddNewEstimateRequestModal onClose={() => setShowModal(false)} setRefresh={setRefresh} />
        )}
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
            title='Download Estimate Requests CSV'
            fileName='Estimate Requests'
          />
        )}
      </Container>
    </div>
  )
}

const EstimatesRequestsTable = ({
  estimatesRequest,
  setRefresh,
  setShowClientEditModal,
  setClientToEdit,
  setShowModal,
  isLoading,
  setIsLoading,
  refresh,
}) => {
  const classes = useStyles()
  const [selectedRecords, setSelectedRecords] = useState([])
  const [openId, setOpenId] = useState('')
  const [showAssigningModal, setShowAssigningModal] = useState(false)

  const handleDelete = async () => {
    try {
      // eslint-disable-next-line no-restricted-globals
      if (confirm(`Are You Sure to delete ${selectedRecords.length} record(s)?`)) {
        showToast('Deleting...', 'info')
        setIsLoading(true)
        await Promise.all(
          selectedRecords.map(async (recordId) => {
            await removeEstimateRequest(recordId)

            // Creating Event Log-------------------------------------------------------------------
            let targetType = Constants.Events.ESTIMATE_REQUEST_DELETED.Type
            let eventDesc = Constants.Events.ESTIMATE_REQUEST_DELETED.Desc
            let byId = userStore.currentUser.id
            let request = estimatesRequest.find((request) => request.id === recordId)
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
              size='small'
              disabled={isLoading}
              onClick={() => setShowAssigningModal(true)}>
              Assign To
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
          <div className='center-flex-row' style={{ justifyContent: 'space-between' }}>
            <div></div>
            Total Results: {estimatesRequest.length}
            <AddCircleIcon
              style={{ marginRight: 15, cursor: 'pointer' }}
              fontSize='large'
              color='secondary'
              onClick={() => setShowModal(true)}
            />
          </div>
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
                      selectedRecords.length !== estimatesRequest.length
                    }
                    checked={
                      estimatesRequest.length !== 0 &&
                      selectedRecords.length === estimatesRequest.length
                    }
                    onChange={(e) => {
                      if (selectedRecords.length !== 0) {
                        setSelectedRecords([])
                      } else {
                        setSelectedRecords(estimatesRequest.map((rec) => rec.id))
                      }
                    }}
                  />
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
                  <b>Date</b>
                </TableCell>
                <TableCell align='center'>
                  <b>Client Message</b>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {estimatesRequest.map((record) => (
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
                      {dayjs.unix(record.createdAt).format('DD MMMM YYYY')}
                    </TableCell>
                    <TableCell align='center'>
                      <ReadMoreReact text={record.message} readMoreText='... read more' />
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
    </Paper>
  )
}

const AddNewEstimateRequestModal = ({ onClose, setRefresh }) => {
  const classes = useStyles()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [open] = useState(true)
  const [modalStyle] = useState(getModalStyle())
  const [isLoading, setIsLoading] = useState(false)
  const [clients, setClients] = useState([])
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [msg, setMsg] = useState('')

  const handleSearch = async (searchQuery) => {
    try {
      setClients([])
      if (searchQuery !== '') {
        let clientsData = []
        setIsLoading(true)
        if (isEmail(searchQuery)) {
          clientsData = await searchClientByEmail(searchQuery)
        } else {
          const keywordChunk = getSearchingKeywords(searchQuery)
          if (keywordChunk.length !== 0) {
            clientsData = await searchClients(keywordChunk)
          }
        }
        setClients(clientsData)
        setIsLoading(false)
      }
    } catch (err) {
      setIsLoading(false)
      console.error(err)
      showToast('Something went wrong searching estimates request', 'error')
    }
  }

  const handleSubmit = async () => {
    try {
      if (!email.trim() && !phone.trim()) {
        return showToast('Client should either have email or phone.', 'error')
      }
      if (email.trim() && !isEmail(email.trim())) {
        return showToast('Client email not valid', 'error')
      }
      let clientId = null
      let clientsData = []
      if (email) {
        clientsData = await searchClientByEmail(email.trim())
      } else {
        clientsData = await searchClientByPhone(phone.trim())
      }
      if (clientsData.length !== 0) {
        clientId = clientsData[0].id
      }
      let clientInfo = {
        name,
        email,
        address,
        phone,
        isActive: true,
        isContactable: true,
      }
      if (!clientId) {
        Object.keys(clientInfo).forEach((key) => {
          if (typeof clientInfo[key] === 'string') {
            clientInfo[key] = clientInfo[key].trim()
          }
        })
        clientInfo.searchableKeywords = getSearchableKeywords(clientInfo.name, 2000)
        let clientDoc = await createNewClient(clientInfo)
        clientId = clientDoc.id
        // Creating Event Log-------------------------------------------------------------------
        let targetType = Constants.Events.NEW_CLIENT_ADDED.Type
        let eventDesc = Constants.Events.NEW_CLIENT_ADDED.Desc
        let moreInfo = {
          prevObj: null,
          newObj: clientDoc,
        }
        await addNewEventLog(
          userStore.currentUser.id,
          clientId,
          clientId,
          targetType,
          eventDesc,
          moreInfo
        )
        //--------------------------------------------------------------------------------------
      } else {
        await editClient(clientId, clientInfo)
      }

      let request = await addNewEstimateRequest(clientId, msg.trim())

      // Creating Event Log-------------------------------------------------------------------
      await addNewEventLog(
        userStore.currentUser.id,
        clientId,
        request.id,
        Constants.Events.NEW_ESTIMATE_REQUEST.Type,
        Constants.Events.NEW_ESTIMATE_REQUEST.Desc,
        {
          prevObj: null,
          newObj: request,
        }
      )
      //--------------------------------------------------------------------------------------

      showToast('Estimate request added successfully.')
      setRefresh((prevVal) => {
        return !prevVal
      })
      onClose()
    } catch (err) {
      console.error(err)
      showToast('Something went wrong adding estimates request', 'error')
    }
  }

  return (
    <Modal open={open} style={{}}>
      <Scrollbars>
        <div
          style={{
            ...modalStyle,
            width: isMobile ? '90%' : '50%',
          }}
          className={classes.paperModal}>
          <Grid container spacing={1}>
            <Grid item xs={12}>
              <Typography variant='h4' align='left' gutterBottom>
                <CancelOutlinedIcon
                  style={{ float: 'right', cursor: 'pointer' }}
                  fontSize='large'
                  onClick={() => onClose()}
                />
                Add New Estimate Request
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Divider />
              <br />
              <InputBase
                style={{ backgroundColor: appStore.darkMode ? '#303030' : '#f7f7f7' }}
                className={classes.searchInput}
                placeholder='Search By Client Name Or Email'
                onChange={(e) => handleSearch(e.target.value.trim())}
              />
            </Grid>
            {isLoading && (
              <Grid item xs={12} style={{ marginTop: 20 }}>
                <LinearProgress />
              </Grid>
            )}
            {clients.length !== 0 && (
              <Grid item xs={12} style={{ marginTop: 20 }}>
                <Scrollbars style={{ height: 120 }}>
                  <List component='nav'>
                    {clients.map((client) => (
                      <ListItem
                        key={client.id}
                        button
                        onClick={() => {
                          setName(client.name || '')
                          setEmail(client.email || '')
                          setPhone(client.phone || '')
                          setAddress(client.address || '')
                        }}>
                        <ListItemText
                          primary={`${client.name} ${client.email && `(${client.email})`}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Scrollbars>
              </Grid>
            )}
            <Grid item xs={12} style={{ marginTop: 40 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label='Client Name'
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    variant='outlined'
                    style={{ width: '100%' }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label='Client Email'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    variant='outlined'
                    style={{ width: '100%' }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    type='tel'
                    label='Client Phone'
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    variant='outlined'
                    style={{ width: '100%' }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label='Client Address'
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    variant='outlined'
                    style={{ width: '100%' }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label='Client Message'
                    value={msg}
                    multiline
                    rowsMax={isMobile ? 3 : 5}
                    onChange={(e) => setMsg(e.target.value)}
                    variant='outlined'
                    style={{ width: '100%' }}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12} style={{ marginTop: 20, textAlign: 'center' }}>
              <Button variant='contained' color='primary' onClick={() => handleSubmit()}>
                Add
              </Button>
            </Grid>
          </Grid>
        </div>
      </Scrollbars>
    </Modal>
  )
}

export default EstimatesRequest
