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
import FileCopyIcon from '@material-ui/icons/FileCopy'
import GetAppIcon from '@material-ui/icons/GetApp'
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp'
import IconButton from '@material-ui/core/IconButton'

import ShowPDFModal from './common/ShowPDFModal'
import InvoicePaidUnpaidConfirm from './common/InvoicePaidUnpaidConfirm'

import appStore from '../store/AppStore'

import ClientLogsTable from './ClientLogsTable'
import ClientsAddEdit from './ClientAddEdit'
import DownloadCSVModal from './common/DownloadCSVModal'

import { Constants } from '../scripts/constants'
import Configs from '../scripts/configs'
import {
  searchClients,
  getInvoicesPaidByClientId,
  getInvoicesByInvoiceNo,
  getInvoicesPaid,
  getUserById,
  searchClientByEmail,
  getCleintById,
  getPaidInvoicesByThreshold,
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

const InvoicesPaid = () => {
  const classes = useStyles()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [invoicesPaid, setInvoicesPaid] = useState([])
  const [limit, setLimit] = useState(100)
  const [isLoading, setIsLoading] = useState(false)
  const [refresh, setRefresh] = useState(false)
  const [query, setQuery] = useState('')
  const [allowSearch] = useState(true)
  const [activeInvoice, setActiveInvoice] = useState({})
  const [showInvoicePaidUnpaidConfirm, setShowInvoicePaidUnpaidConfirm] = useState(false)
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
      setInvoicesPaidData(limit)
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
      setInvoicesPaidData(limit)
    }
    // return () => {
    //   clearTimeout(timeoutId)
    // }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

  const setInvoicesPaidData = async (resultLimit) => {
    try {
      setIsLoading(true)
      let requests = await getInvoicesPaid(resultLimit)
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
      setInvoicesPaid(requests)
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
          invoices = invoices.filter((invoice) => invoice.paid)
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
          setInvoicesPaid(invoices)
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
              let invoicesPaid = await getInvoicesPaidByClientId(clientData.id, limit)
              invoicesPaid.forEach((request) => {
                request['allInfo'] = JSON.parse(request.allInfo)
                request['clientInfo'] = clientData
                finalRequests.push(request)
              })
            })
          )
          setInvoicesPaid(finalRequests)
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
      let invoices = await getPaidInvoicesByThreshold(fromDateUnix, toDateUnix)
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
          'Sent On': dayjs.unix(i?.createdAt).format('DD MMMM YYYY'),
          'Paid On': i?.paid ? dayjs.unix(i?.paidOn).format('DD MMMM YYYY') : '-',
        }
      })
      if (finalCSVData.length === 0) {
        finalCSVData.push({
          'Invoice No.': '',
          'Sent By Name': '',
          'Sent By Email': '',
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
              Invoices Paid
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
                  <InvoicesPaidTable
                    invoicesPaid={invoicesPaid}
                    setShowClientEditModal={setShowClientEditModal}
                    setClientToEdit={setClientToEdit}
                    isLoading={isLoading}
                    setIsLoading={setIsLoading}
                    setRefresh={setRefresh}
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
          title='Download Paid Invoices CSV'
          fileName='Paid Invoices'
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

const InvoicesPaidTable = ({
  invoicesPaid,
  setShowClientEditModal,
  setClientToEdit,
  isLoading,
  setIsLoading,
  setRefresh,
  setActiveInvoice,
  setShowInvoicePaidUnpaidConfirm,
  refresh,
}) => {
  const classes = useStyles()
  const [showPDF, setShowPDF] = useState(false)
  const [genPDF, setGenPDF] = useState(null)
  const [openId, setOpenId] = useState('')

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
        Total Results: {invoicesPaid.length}
      </Typography>
      <br />
      <TableContainer component={Paper}>
        <Scrollbars style={{ height: 800 }}>
          <Table className={classes.table} stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell />
                <TableCell align='center'>
                  <b>Invoice No.</b>
                </TableCell>
                <TableCell align='center'>
                  <b>By Name</b>
                </TableCell>
                <TableCell align='center'>
                  <b>Client Name</b>
                </TableCell>
                <TableCell align='center'>
                  <b>Client Email</b>
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
              {invoicesPaid.map((record) => (
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
                      {calculatePriceWithoutTax(record.allInfo, 'INVOICE')}
                    </TableCell>
                    <TableCell align='center'>
                      {dayjs.unix(record.createdAt).format('DD MMMM YYYY')}
                    </TableCell>
                    <TableCell align='center'>
                      {dayjs.unix(record.paidOn).format('DD MMMM YYYY')}
                    </TableCell>
                    <TableCell align='center'>
                      <ButtonGroup variant='contained' color='primary'>
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
    </Paper>
  )
}

export default InvoicesPaid
