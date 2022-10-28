import React, { useState, useEffect, Fragment } from 'react'
import { Link } from 'react-router-dom'
import * as dayjs from 'dayjs'
import axios from 'axios'
import { Scrollbars } from 'react-custom-scrollbars'
import { makeStyles } from '@material-ui/core/styles'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import { useTheme } from '@material-ui/core/styles'
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
import ButtonGroup from '@material-ui/core/ButtonGroup'
import CircularProgress from '@material-ui/core/CircularProgress'
import CheckCircleIcon from '@material-ui/icons/CheckCircle'
import CancelIcon from '@material-ui/icons/Cancel'
import EditIcon from '@material-ui/icons/Edit'
import FileCopyIcon from '@material-ui/icons/FileCopy'
import Checkbox from '@material-ui/core/Checkbox'
import DeleteIcon from '@material-ui/icons/Delete'
import GetAppIcon from '@material-ui/icons/GetApp'
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp'
import IconButton from '@material-ui/core/IconButton'

import ShowPDFModal from './common/ShowPDFModal'

import userStore from './../store/UserStore'
import appStore from './../store/AppStore'

import ClientLogsTable from './ClientLogsTable'
import ClientsAddEdit from './ClientAddEdit'
import DownloadCSVModal from './common/DownloadCSVModal'
import AssignToModal from './common/AssignToModal'
import InvoicePaidUnpaidConfirm from './common/InvoicePaidUnpaidConfirm'

import { Constants } from '../scripts/constants'
import Configs from '../scripts/configs'
import {
  searchClients,
  getInvoicesByInvoiceNo,
  getUserById,
  searchClientByEmail,
  getCleintById,
  addNewEventLog,
  removeInvoice,
  getInvoicesDraftByClientId,
  getInvoicesDraft,
  getInvoicesDraftByThreshold,
  changeInvoiceEmailStatus,
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
    marginLeft: theme.spacing(1),
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

const InvoicesDraft = () => {
  const classes = useStyles()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [invoicesDraft, setInvoicesDraft] = useState([])
  const [limit, setLimit] = useState(100)
  const [isLoading, setIsLoading] = useState(false)
  const [refresh, setRefresh] = useState(false)
  const [query, setQuery] = useState('')
  const [allowSearch] = useState(true)
  const [clientToEdit, setClientToEdit] = useState({})
  const [showClientEditModal, setShowClientEditModal] = useState(false)
  const [activeInvoice, setActiveInvoice] = useState({})
  const [showInvoicePaidUnpaidConfirm, setShowInvoicePaidUnpaidConfirm] = useState(false)
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
      setInvoicesDraftData(limit)
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
      setInvoicesDraftData(limit)
    }
    // return () => {
    //   clearTimeout(timeoutId)
    // }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

  const setInvoicesDraftData = async (resultLimit) => {
    try {
      setIsLoading(true)
      let requests = await getInvoicesDraft(resultLimit)
      requests.forEach((request) => {
        request.allInfo = JSON.parse(request.allInfo)
      })
      await Promise.all(
        requests.map(async (request) => {
          if (request.clientId) {
            let client = await getCleintById(request.clientId)
            if (client.exists) {
              client = client.data()
              client.id = request.clientId
              request['clientInfo'] = client
            }
          } else {
            let clientsData = await searchClientByEmail(request.generatedForEmail)
            if (clientsData.length !== 0) {
              request['clientInfo'] = clientsData[0]
            }
          }
        })
      )
      setIsLoading(false)
      setInvoicesDraft(requests)
    } catch (err) {
      setIsLoading(false)
      console.error(err)
      showToast('Something went wrong fetching invoices', 'error')
    }
  }

  const handleSearch = async (searchQuery) => {
    try {
      if (searchQuery !== '' && allowSearch) {
        let clientsData = []
        setIsLoading(true)
        if (isNumeric(searchQuery)) {
          let invoices = await getInvoicesByInvoiceNo(parseInt(searchQuery))
          invoices = invoices.filter((invoice) => !invoice.emailSent && !invoice.paid)
          invoices.forEach((request) => {
            request['allInfo'] = JSON.parse(request.allInfo)
          })
          await Promise.all(
            invoices.map(async (invoice) => {
              if (invoice.clientId) {
                let client = await getCleintById(invoice.clientId)
                if (client.exists) {
                  client = client.data()
                  client.id = invoice.clientId
                  invoice['clientInfo'] = client
                }
              } else {
                let clientsData = await searchClientByEmail(invoice.generatedForEmail)
                if (clientsData.length !== 0) {
                  invoice['clientInfo'] = clientsData[0]
                }
              }
            })
          )
          setInvoicesDraft(invoices)
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
              let invoicesDraft = await getInvoicesDraftByClientId(clientData.id, limit)
              invoicesDraft.forEach((request) => {
                request['allInfo'] = JSON.parse(request.allInfo)
                request['clientInfo'] = clientData
                finalRequests.push(request)
              })
            })
          )
          setInvoicesDraft(finalRequests)
        }
        setIsLoading(false)
      }
    } catch (err) {
      setIsLoading(false)
      console.error(err)
      showToast('Something went wrong searching invoices', 'error')
    }
  }

  const fetchCSVData = async () => {
    try {
      setIsLoading(true)
      let invoices = await getInvoicesDraftByThreshold(fromDateUnix, toDateUnix)
      await Promise.all(
        invoices.map(async (invoice) => {
          if (invoice.clientId) {
            let client = await getCleintById(invoice.clientId)
            if (client.exists) {
              client = client.data()
              client.id = invoice.clientId
              invoice['clientInfo'] = client
            }
          } else {
            let clientsData = await searchClientByEmail(invoice.generatedForEmail)
            if (clientsData.length !== 0) {
              invoice['clientInfo'] = clientsData[0]
            }
          }
        })
      )
      let finalCSVData = invoices.map((i) => {
        return {
          'Invoice No.': i?.invoiceNo,
          'Assigned To Name': i?.assignedToName,
          'Assigned To Email': i?.assignedToEmail,
          'Client Name': i?.clientInfo?.name,
          'Client Email': i?.clientInfo?.email,
          'Client Phone': i?.clientInfo?.phone,
          'Client Address': i?.clientInfo?.address,
          'Is Paid': i?.paid ? 'Yes' : 'No',
          'Price Without Taxes': calculatePriceWithoutTax(JSON.parse(i?.allInfo), 'INVOICE'),
          'Sent On': '-',
          'Paid On': '-',
        }
      })
      if (finalCSVData.length === 0) {
        finalCSVData.push({
          'Invoice No.': '',
          'Assigned To Name': '',
          'Assigned To Email': '',
          'Client Name': '',
          'Client Email': '',
          'Client Phone': '',
          'Client Address': '',
          'Is Paid': '',
          'Price Without Taxes': '',
          'Sent On': '',
          'Paid On': '',
        })
      }
      SetCSVData(finalCSVData)
      setIsLoading(false)
    } catch (err) {
      setIsLoading(false)
      console.error(err)
      showToast('Something went wrong fetching invoices', 'error')
    }
  }

  return (
    <div className={classes.root}>
      <Container fixed>
        <Grid container spacing={1}>
          <Grid item xs={12}>
            <Typography variant='h3' align='center' gutterBottom>
              Draft Invoices
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Paper className={classes.paper}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <InputBase
                    style={{ backgroundColor: appStore.darkMode ? '#303030' : '#f7f7f7' }}
                    className={classes.searchInput}
                    placeholder='Search By Client Name Or Email Or Invoice No.'
                    onChange={(e) => setQuery(e.target.value.trim())}
                  />
                </Grid>
                <Grid item xs={12} md={6} style={{ textAlign: isMobile ? 'center' : 'right' }}>
                  <FormControl variant='outlined' className={classes.formControl}>
                    <InputLabel id='number-of-invoices'>Show Entries</InputLabel>
                    <Select
                      labelId='number-of-invoices'
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
                  <InvoicesDraftTable
                    invoicesDraft={invoicesDraft}
                    setRefresh={setRefresh}
                    setShowClientEditModal={setShowClientEditModal}
                    setClientToEdit={setClientToEdit}
                    isLoading={isLoading}
                    setIsLoading={setIsLoading}
                    setActiveInvoice={setActiveInvoice}
                    setShowInvoicePaidUnpaidConfirm={setShowInvoicePaidUnpaidConfirm}
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
          fromDateUnix={fromDateUnix}
          toDateUnix={toDateUnix}
          setFromDateUnix={setFromDateUnix}
          setToDateUnix={setToDateUnix}
          CSVData={CSVData}
          setCSVData={SetCSVData}
          fetchCSVDataFunc={fetchCSVData}
          isLoading={isLoading}
          title='Download Draft Invoices CSV'
          fileName='Draft Invoices'
        />
      )}
      {showInvoicePaidUnpaidConfirm && (
        <InvoicePaidUnpaidConfirm
          onClose={() => setShowInvoicePaidUnpaidConfirm(false)}
          invoice={activeInvoice}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          setRefresh={setRefresh}
        />
      )}
    </div>
  )
}

const InvoicesDraftTable = ({
  invoicesDraft,
  setRefresh,
  setShowClientEditModal,
  setClientToEdit,
  isLoading,
  setIsLoading,
  setActiveInvoice,
  setShowInvoicePaidUnpaidConfirm,
  refresh,
}) => {
  const classes = useStyles()
  const [showPDF, setShowPDF] = useState(false)
  const [genPDF, setGenPDF] = useState(null)
  const [selectedRecords, setSelectedRecords] = useState([])
  const [openId, setOpenId] = useState('')
  const [showAssigningModal, setShowAssigningModal] = useState(false)

  const handleDelete = async () => {
    try {
      // eslint-disable-next-line no-restricted-globals
      if (confirm(`Are You Sure to delete ${selectedRecords.length} unpaid invoice(s)?`)) {
        showToast('Deleting...', 'info')
        setIsLoading(true)
        await Promise.all(
          selectedRecords.map(async (recordId) => {
            await removeInvoice(recordId)
            // Creating Event Log-------------------------------------------------------------------
            let targetType = Constants.Events.INVOICE_DELETED.Type
            let eventDesc = Constants.Events.INVOICE_DELETED.Desc
            let byId = userStore.currentUser.id
            let invoice = invoicesDraft.find((invoice) => invoice.id === recordId)
            invoice.allInfo = JSON.stringify(invoice.allInfo)
            delete invoice.clientInfo
            let forId = invoice ? invoice.clientId : ''
            let moreInfo = {
              prevObj: invoice,
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
      setIsLoading(false)
      showToast('Something went wrong while deleting', 'error')
      console.error(err)
    }
  }

  const handlePdfGen = async (currInvoiceId, allInfo, userId) => {
    try {
      setIsLoading(true)
      let userDoc = await getUserById(userId)
      if (userDoc.exists) {
        let res = await axios.post(`${Configs.FirebaseFunctionUrl}/generatePdfContent`, {
          allInfo,
          currInvoiceId,
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

  const handleMoveToSent = async () => {
    try {
      if (
        // eslint-disable-next-line no-restricted-globals
        confirm(`Are You Sure to move ${selectedRecords.length} record(s) to Sent?`)
      ) {
        showToast('Moving...', 'info')
        setIsLoading(true)
        await Promise.all(
          selectedRecords.map(async (recordId) => {
            await changeInvoiceEmailStatus(recordId, true)
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

  const onClose = () => {
    setGenPDF(null)
    setShowPDF(false)
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
        Total Results: {invoicesDraft.length}
        {selectedRecords.length !== 0 && (
          <div className='center-flex-row' style={{ marginTop: 20 }}>
            <Button
              variant='contained'
              color='secondary'
              size='small'
              style={{ float: 'right', marginRight: 10 }}
              disabled={isLoading}
              onClick={handleDelete}>
              <DeleteIcon />
            </Button>
            <Button
              variant='contained'
              color='secondary'
              size='small'
              disabled={isLoading}
              style={{ marginRight: 10 }}
              onClick={() => handleMoveToSent()}>
              Move To Sent
            </Button>
            <Button
              variant='contained'
              size='small'
              onClick={() => setShowAssigningModal(true)}
              disabled={isLoading}>
              Change Assign To
            </Button>
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
                      selectedRecords.length !== invoicesDraft.length
                    }
                    checked={
                      invoicesDraft.length !== 0 && selectedRecords.length === invoicesDraft.length
                    }
                    onChange={(e) => {
                      if (selectedRecords.length !== 0) {
                        setSelectedRecords([])
                      } else {
                        setSelectedRecords(invoicesDraft.map((rec) => rec.id))
                      }
                    }}
                  />
                </TableCell>
                <TableCell align='center'>
                  <b>Invoice No.</b>
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
                  <b>Paid</b>
                </TableCell>
                <TableCell align='center'>
                  <b>Price Without Taxes</b>
                </TableCell>
                <TableCell align='center'>
                  <b>Date</b>
                </TableCell>
                <TableCell align='center'>
                  <b>Paid On</b>
                </TableCell>
                <TableCell align='center'>
                  <b>Action</b>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {invoicesDraft.map((record) => (
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
                    <TableCell align='center'>{record.invoiceNo || '-'}</TableCell>
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
                    <TableCell align='center'>
                      {record.paid ? (
                        <CheckCircleIcon color='primary' />
                      ) : (
                        <CancelIcon color='secondary' />
                      )}
                    </TableCell>
                    <TableCell align='center'>
                      {calculatePriceWithoutTax(record.allInfo, 'INVOICE')}
                    </TableCell>
                    <TableCell align='center'>
                      {dayjs.unix(record.createdAt).format('DD MMMM YYYY')}
                    </TableCell>
                    <TableCell align='center'>
                      {record.paid ? dayjs.unix(record.paidOn).format('DD MMMM YYYY') : '-'}
                    </TableCell>
                    <TableCell align='center'>
                      <ButtonGroup variant='contained' color='primary'>
                        {!record.paid && (
                          <Link
                            to={{
                              pathname: Constants.jobsConfigs.allPaths.Tools.routes.Invoice.route,
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
                        )}
                        <Link
                          to={{
                            pathname: Constants.jobsConfigs.allPaths.Tools.routes.Invoice.route,
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
                      {!record.paid ? (
                        <>
                          <br />
                          <br />
                          <Button
                            variant='contained'
                            style={{
                              backgroundColor: !isLoading ? '#5ad412' : '#595959',
                              color: !isLoading ? '#ffffff' : '#707070',
                            }}
                            size='small'
                            onClick={() => {
                              setActiveInvoice(record)
                              setShowInvoicePaidUnpaidConfirm(true)
                            }}
                            disabled={isLoading}>
                            Paid
                          </Button>
                        </>
                      ) : (
                        <>
                          <br />
                          <br />
                          <Button
                            variant='contained'
                            color='secondary'
                            size='small'
                            onClick={() => {
                              setActiveInvoice(record)
                              setShowInvoicePaidUnpaidConfirm(true)
                            }}
                            disabled={isLoading}>
                            UnPaid
                          </Button>
                        </>
                      )}
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
                    <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={12}>
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
          recordType={'INVOICE'}
        />
      )}
    </Paper>
  )
}

export default InvoicesDraft
