import React, { useState, useEffect, Fragment } from 'react'
import { Link, withRouter } from 'react-router-dom'
import * as dayjs from 'dayjs'
import qs from 'qs'
import { Scrollbars } from 'react-custom-scrollbars'
import { makeStyles } from '@material-ui/core/styles'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import { useTheme } from '@material-ui/core/styles'
import Container from '@material-ui/core/Container'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import Tooltip from '@material-ui/core/Tooltip'
import Collapse from '@material-ui/core/Collapse'
import IconButton from '@material-ui/core/IconButton'
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
import Button from '@material-ui/core/Button'
import CircularProgress from '@material-ui/core/CircularProgress'
import CheckCircleIcon from '@material-ui/icons/CheckCircle'
import CancelIcon from '@material-ui/icons/Cancel'
import Divider from '@material-ui/core/Divider'
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp'
import Checkbox from '@material-ui/core/Checkbox'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import DeleteIcon from '@material-ui/icons/Delete'
import RestoreFromTrashOutlinedIcon from '@material-ui/icons/RestoreFromTrashOutlined'
import Popper from '@material-ui/core/Popper'
import PopupState, { bindToggle, bindPopper } from 'material-ui-popup-state'
import Fade from '@material-ui/core/Fade'
import ButtonGroup from '@material-ui/core/ButtonGroup'
import GetAppIcon from '@material-ui/icons/GetApp'

import ClientsAddEdit from './ClientAddEdit'
import ClientLogsTable from './ClientLogsTable'
import DownloadCSVModal from './common/DownloadCSVModal'

import userStore from './../store/UserStore'
import appStore from './../store/AppStore'

import { Constants } from './../scripts/constants'
import {
  searchClients,
  getClients,
  getCleintById,
  searchClientByEmail,
  updateClientActiveStatus,
  addNewEventLog,
  getClientsByThreshold,
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
  modalPaper: {
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #211b30',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(4, 6, 4),
    borderRadius: 5,
  },
}))

const Clients = (props) => {
  const classes = useStyles()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [clients, setClients] = useState([])
  const [limit, setLimit] = useState(100)
  const [isLoading, setIsLoading] = useState(false)
  const [refresh, setRefresh] = useState(false)
  const [query, setQuery] = useState('')
  const [allowSearch] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState('')
  const [clientToEdit, setClientToEdit] = useState({})
  const [getIsActiveClient, setGetIsActiveClient] = useState(true)
  const [showCSVDownloadDrawer, setShowCSVDownloadDrawer] = useState(false)
  const [fromDateUnix, setFromDateUnix] = useState(
    dayjs().subtract(1, 'month').startOf('day').unix()
  )
  const [toDateUnix, setToDateUnix] = useState(dayjs().unix())
  const [CSVData, SetCSVData] = useState(null)

  useEffect(() => {
    if (props.location.search) {
      let search = qs.parse(props.location.search.substring(1))
      if (search.s) {
        setQuery(search.s)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (query !== '') {
      handleSearch(query)
    } else {
      setClientsData(limit)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limit, refresh, getIsActiveClient])

  useEffect(() => {
    // setAllowSearch(false)
    // let timeoutId = setTimeout(() => {
    //   setAllowSearch(true)
    // }, 100)
    if (query !== '') {
      handleSearch(query)
    } else {
      setClientsData(limit)
    }
    // return () => {
    //   clearTimeout(timeoutId)
    // }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

  const setClientsData = async (resultLimit) => {
    try {
      setIsLoading(true)
      let requests = await getClients(resultLimit, getIsActiveClient)
      setIsLoading(false)
      setClients(requests)
    } catch (err) {
      setIsLoading(false)
      console.error(err)
      showToast('Something went wrong fetching clients', 'error')
    }
  }

  const handleSearch = async (searchQuery) => {
    try {
      searchQuery = searchQuery.trim()
      if (searchQuery !== '' && allowSearch) {
        let clientsData = []
        setIsLoading(true)
        if (isEmail(searchQuery)) {
          clientsData = await searchClientByEmail(searchQuery)
        } else if (searchQuery.startsWith('#')) {
          let clientId = searchQuery.split('#')[1] || null
          if (clientId) {
            let clientDoc = await getCleintById(clientId)
            if (clientDoc.exists) {
              clientsData = [clientDoc.data()]
            }
          }
        } else {
          const keywordChunk = getSearchingKeywords(searchQuery)
          if (keywordChunk.length !== 0) {
            clientsData = await searchClients(keywordChunk, limit)
          }
        }
        setIsLoading(false)
        setClients(clientsData)
      }
    } catch (err) {
      setIsLoading(false)
      console.error(err)
      showToast('Something went wrong searching for client', 'error')
    }
  }

  const fetchCSVData = async () => {
    try {
      setIsLoading(true)
      let clients = await getClientsByThreshold(fromDateUnix, toDateUnix)
      let finalCSVData = clients.map((c) => {
        return {
          'Client Name': c?.name,
          'Client Email': c?.email,
          'Client Phone': c?.phone,
          'Client Address': c?.address,
          'Added On': dayjs.unix(c?.createdAt).format('DD MMMM YYYY'),
        }
      })
      if (finalCSVData.length === 0) {
        finalCSVData.push({
          'Client Name': '',
          'Client Email': '',
          'Client Phone': '',
          'Client Address': '',
          'Added On': '',
        })
      }
      SetCSVData(finalCSVData)
      setIsLoading(false)
    } catch (err) {
      setIsLoading(false)
      console.error(err)
      showToast('Something went wrong fetching clients', 'error')
    }
  }

  return (
    <div className={classes.root}>
      <Container fixed>
        <Grid container spacing={1}>
          <Grid item xs={12}>
            <Typography variant='h3' align='center' gutterBottom>
              Clients
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Paper className={classes.paper}>
              <Grid container spacing={0}>
                <Grid item xs={12} style={{ textAlign: 'right' }}>
                  <Button
                    variant='contained'
                    color='secondary'
                    size='large'
                    onClick={() => {
                      setModalMode('ADD')
                      setShowModal(true)
                      setClientToEdit({})
                    }}
                    disabled={isLoading}>
                    Add New Client
                  </Button>
                </Grid>
              </Grid>
              <br />
              <Divider />
              <br />
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <InputBase
                    style={{ backgroundColor: appStore.darkMode ? '#303030' : '#f7f7f7' }}
                    value={query}
                    className={classes.searchInput}
                    placeholder='Search By Client Name Or Email'
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <div style={{ textAlign: isMobile ? 'center' : 'right', marginTop: 15 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={getIsActiveClient}
                          onChange={(e) => setGetIsActiveClient(e.target.checked)}
                          color='primary'
                        />
                      }
                      label='Show Active Clients'
                    />
                  </div>
                </Grid>
                <Grid item xs={12} md={4} style={{ textAlign: isMobile ? 'center' : 'right' }}>
                  <FormControl variant='outlined' className={classes.formControl}>
                    <InputLabel id='number-of-clients'>Show Entries</InputLabel>
                    <Select
                      labelId='number-of-clients'
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
                  <ClientsTable
                    clients={clients}
                    setShowModal={setShowModal}
                    setModalMode={setModalMode}
                    setClientToEdit={setClientToEdit}
                    refresh={refresh}
                    setRefresh={setRefresh}
                    isLoading={isLoading}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
        {showModal && (
          <ClientsAddEdit
            onClose={() => setShowModal(false)}
            setRefresh={setRefresh}
            modalMode={modalMode}
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
            title='Download Clients CSV'
            fileName='Clients'
          />
        )}
      </Container>
    </div>
  )
}

const ClientsTable = ({
  clients,
  setShowModal,
  setModalMode,
  setClientToEdit,
  refresh,
  setRefresh,
  isLoading,
}) => {
  const classes = useStyles()

  return (
    <Paper>
      <br />
      <Typography variant='body1' color='textSecondary' align='center' gutterBottom>
        {isLoading && (
          <CircularProgress style={{ float: 'left', marginLeft: 15 }} size={25} color='secondary' />
        )}
        Total Results: {clients.length}
      </Typography>
      <br />
      <TableContainer component={Paper}>
        <Scrollbars style={{ height: 800 }}>
          <Table className={classes.table} stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell />
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
                  <b>Active Client</b>
                </TableCell>
                <TableCell align='center'>
                  <b>Added On</b>
                </TableCell>
                <TableCell align='center'>
                  <b>Action</b>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {clients.map((record) => (
                <MainInfoTable
                  key={record.id}
                  record={record}
                  setModalMode={setModalMode}
                  setClientToEdit={setClientToEdit}
                  setShowModal={setShowModal}
                  refresh={refresh}
                  setRefresh={setRefresh}
                  isLoading={isLoading}
                />
              ))}
            </TableBody>
          </Table>
        </Scrollbars>
      </TableContainer>
    </Paper>
  )
}

const MainInfoTable = ({
  record,
  setModalMode,
  setClientToEdit,
  setShowModal,
  refresh,
  setRefresh,
  isLoading,
}) => {
  const [open, setOpen] = useState(false)

  const handleClientStatusChange = async (client, isActive) => {
    try {
      await updateClientActiveStatus(client.id, isActive)

      // Creating Event Log-------------------------------------------------------------------
      let event = client.isActive
        ? Constants.Events.CLIENT_DEACTIVATED
        : Constants.Events.CLIENT_ACTIVATED
      let targetType = event.Type
      let eventDesc = event.Desc
      let moreInfo = {
        prevObj: {
          isActive: client.isActive,
        },
        newObj: {
          isActive,
        },
      }
      await addNewEventLog(
        userStore.currentUser.id,
        client.id,
        client.id,
        targetType,
        eventDesc,
        moreInfo
      )
      //--------------------------------------------------------------------------------------

      setRefresh((prevVal) => !prevVal)
      showToast('Client status changed successfully')
    } catch (err) {
      console.error(err)
      showToast('Something went wrong changing client status', 'error')
    }
  }

  const editClientHandler = (record) => {
    setModalMode('EDIT')
    setClientToEdit(record)
    setShowModal(true)
  }

  return (
    <Fragment>
      <TableRow>
        <TableCell>
          <IconButton aria-label='expand row' size='small' onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <Tooltip title='Double click to see / edit the client details' placement='bottom'>
          <TableCell
            align='center'
            onDoubleClick={() => editClientHandler(record)}
            style={{ cursor: 'pointer' }}>
            {record.namePrefix ? record.namePrefix + ' ' : ''} {record.name}
          </TableCell>
        </Tooltip>
        <Tooltip title='Double click to see / edit the client details' placement='bottom'>
          <TableCell
            align='center'
            onDoubleClick={() => editClientHandler(record)}
            style={{ cursor: 'pointer' }}>
            {record.email}
          </TableCell>
        </Tooltip>
        <Tooltip title='Double click to see / edit the client details' placement='bottom'>
          <TableCell
            align='center'
            onDoubleClick={() => editClientHandler(record)}
            style={{ cursor: 'pointer' }}>
            {record.phone}
          </TableCell>
        </Tooltip>
        <Tooltip title='Double click to see / edit the client details' placement='bottom'>
          <TableCell
            align='center'
            onDoubleClick={() => editClientHandler(record)}
            style={{ cursor: 'pointer' }}>
            {record.address}
          </TableCell>
        </Tooltip>
        <TableCell align='center'>
          {record.isActive ? <CheckCircleIcon color='primary' /> : <CancelIcon color='secondary' />}
        </TableCell>
        <TableCell align='center'>{dayjs.unix(record.createdAt).format('DD MMMM YYYY')}</TableCell>
        <TableCell align='center'>
          <PopupState variant='popper'>
            {(popupState) => (
              <div>
                <Button variant='contained' size='small' {...bindToggle(popupState)}>
                  Send...
                </Button>
                <Popper {...bindPopper(popupState)} transition>
                  {({ TransitionProps }) => (
                    <Fade {...TransitionProps} timeout={350}>
                      <Paper>
                        <ButtonGroup>
                          <Button>
                            <Link
                              to={{
                                pathname:
                                  Constants.jobsConfigs.allPaths.Tools.routes.Estimate.route,
                                state: {
                                  clientId: record.id,
                                },
                              }}
                              style={{ textDecoration: 'none' }}>
                              <Button variant='contained' size='small' disabled={isLoading}>
                                Estimate
                              </Button>
                            </Link>
                          </Button>
                          <Button>
                            <Link
                              to={{
                                pathname: Constants.jobsConfigs.allPaths.Tools.routes.Invoice.route,
                                state: {
                                  clientId: record.id,
                                },
                              }}
                              style={{ textDecoration: 'none' }}>
                              <Button variant='contained' size='small' disabled={isLoading}>
                                Invoice
                              </Button>
                            </Link>
                          </Button>
                        </ButtonGroup>
                      </Paper>
                    </Fade>
                  )}
                </Popper>
              </div>
            )}
          </PopupState>
          <br />
          <Button
            variant='contained'
            color='secondary'
            size='small'
            disabled={isLoading}
            onClick={() => handleClientStatusChange(record, !record.isActive)}>
            {record.isActive ? <DeleteIcon /> : <RestoreFromTrashOutlinedIcon />}
          </Button>
        </TableCell>
      </TableRow>
      <TableRow>
        {/* <TableCell /> */}
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={10}>
          <Collapse style={{ padding: 10 }} in={open} timeout='auto' unmountOnExit>
            <ClientLogsTable
              client={record}
              refresh={refresh}
              setRefresh={setRefresh}
              isLoading={isLoading}
            />
          </Collapse>
        </TableCell>
      </TableRow>
    </Fragment>
  )
}

export default withRouter(Clients)
