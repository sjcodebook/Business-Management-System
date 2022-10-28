import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import * as dayjs from 'dayjs'
import axios from 'axios'
import { Scrollbars } from 'react-custom-scrollbars'
import { makeStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import Tooltip from '@material-ui/core/Tooltip'
import Typography from '@material-ui/core/Typography'
import Paper from '@material-ui/core/Paper'
import InputBase from '@material-ui/core/InputBase'
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

import ShowPDFModal from './common/ShowPDFModal'
import InvoicePaidUnpaidConfirm from './common/InvoicePaidUnpaidConfirm'

import userStore from './../store/UserStore'
import appStore from './../store/AppStore'

import ClientsAddEdit from './ClientAddEdit'

import { Constants } from '../scripts/constants'
import Configs from '../scripts/configs'
import {
  searchClients,
  getInvoicesByInvoiceNo,
  getUserById,
  searchClientByEmail,
  getInvoicesByClientId,
  getInvoices,
  getCleintById,
  addNewEventLog,
  removeInvoice,
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
    height: '150%',
    width: '100%',
  },
  table: {
    minWidth: 650,
  },
}))

const InvoiceSearch = () => {
  const classes = useStyles()
  const [invoices, setInvoices] = useState([])
  const [limit] = useState(100)
  const [isLoading, setIsLoading] = useState(false)
  const [query, setQuery] = useState('')
  const [refresh, setRefresh] = useState(false)
  const [allowSearch] = useState(true)
  const [clientToEdit, setClientToEdit] = useState({})
  const [showClientEditModal, setShowClientEditModal] = useState(false)
  const [activeInvoice, setActiveInvoice] = useState({})
  const [showInvoicePaidUnpaidConfirm, setShowInvoicePaidUnpaidConfirm] = useState(false)

  useEffect(() => {
    // setAllowSearch(false)
    // let timeoutId = setTimeout(() => {
    //   setAllowSearch(true)
    // }, 100)
    if (query !== '') {
      handleSearch(query)
    } else {
      setTimeout(() => {
        setInvoicesData([])
      }, 1000)
    }
    // return () => {
    //   clearTimeout(timeoutId)
    // }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, refresh])

  const setInvoicesData = async () => {
    try {
      setIsLoading(true)
      let requests = await getInvoices()
      requests.forEach((request) => {
        request.allInfo = JSON.parse(request.allInfo)
      })
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
      setIsLoading(false)
      setInvoices(requests)
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
          setInvoices(invoices)
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
              let invoices = await getInvoicesByClientId(clientData.id, limit)
              invoices.forEach((request) => {
                request['allInfo'] = JSON.parse(request.allInfo)
                request['clientInfo'] = clientData
                finalRequests.push(request)
              })
            })
          )
          setInvoices(finalRequests)
        }
        setIsLoading(false)
      }
    } catch (err) {
      setIsLoading(false)
      console.error(err)
      showToast('Something went wrong searching invoices', 'error')
    }
  }

  return (
    <Paper className={classes.paper}>
      <Typography variant='h4' color='textPrimary' align='left' gutterBottom>
        Search Invoice(s) {isLoading && <CircularProgress size={25} color='secondary' />}
      </Typography>
      <br />
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <InputBase
            style={{ backgroundColor: appStore.darkMode ? '#303030' : '#f7f7f7' }}
            className={classes.searchInput}
            placeholder='Search By Client Name Or Email Or Invoice No.'
            onChange={(e) => setQuery(e.target.value.trim())}
          />
        </Grid>
        <br />
        <br />
        <Grid item xs={12}>
          <InvoicesTable
            invoices={invoices}
            setShowClientEditModal={setShowClientEditModal}
            setClientToEdit={setClientToEdit}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            setRefresh={setRefresh}
            setActiveInvoice={setActiveInvoice}
            setShowInvoicePaidUnpaidConfirm={setShowInvoicePaidUnpaidConfirm}
          />
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
      {showInvoicePaidUnpaidConfirm && (
        <InvoicePaidUnpaidConfirm
          onClose={() => setShowInvoicePaidUnpaidConfirm(false)}
          invoice={activeInvoice}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          setRefresh={setRefresh}
        />
      )}
    </Paper>
  )
}

const InvoicesTable = ({
  invoices,
  setShowClientEditModal,
  setClientToEdit,
  isLoading,
  setIsLoading,
  setRefresh,
  setActiveInvoice,
  setShowInvoicePaidUnpaidConfirm,
}) => {
  const classes = useStyles()
  const [showPDF, setShowPDF] = useState(false)
  const [genPDF, setGenPDF] = useState(null)
  const [selectedRecords, setSelectedRecords] = useState([])

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
            let invoice = invoices.find((invoice) => invoice.id === recordId)
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

  const onClose = () => {
    setGenPDF(null)
    setShowPDF(false)
  }

  const editClientHandler = (record) => {
    setClientToEdit(record)
    setShowClientEditModal(true)
  }

  return (
    <>
      <br />
      <Typography variant='body1' color='textSecondary' align='center' gutterBottom>
        Total Results: {invoices.length}
        {selectedRecords.length !== 0 && (
          <Button
            variant='contained'
            color='secondary'
            size='small'
            style={{ float: 'right', marginRight: 15, bottom: 2 }}
            disabled={isLoading}
            onClick={handleDelete}>
            <DeleteIcon />
          </Button>
        )}
      </Typography>
      <br />
      <TableContainer component={Paper}>
        <Scrollbars style={{ height: 500 }}>
          <Table className={classes.table} stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell align='center' padding='checkbox'>
                  <Checkbox
                    indeterminate={
                      selectedRecords.length !== 0 && selectedRecords.length !== invoices.length
                    }
                    checked={invoices.length !== 0 && selectedRecords.length === invoices.length}
                    onChange={(e) => {
                      if (selectedRecords.length !== 0) {
                        setSelectedRecords([])
                      } else {
                        setSelectedRecords(invoices.filter((rec) => !rec.paid).map((rec) => rec.id))
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
                  <b>Client Phone</b>
                </TableCell>
                <TableCell align='center'>
                  <b>Email Sent</b>
                </TableCell>
                <TableCell>
                  <b>Paid</b>
                </TableCell>
                <TableCell>
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
              {invoices.map((record) => (
                <TableRow key={record.id}>
                  <TableCell align='center' padding='checkbox'>
                    {!record?.paid && (
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
                    )}
                  </TableCell>
                  <TableCell align='center'>{record.invoiceNo || '-'}</TableCell>
                  <Tooltip title={record.assignedToEmail} placement='left'>
                    <TableCell align='center'>{record.assignedToName}</TableCell>
                  </Tooltip>
                  <Tooltip title='Double click to see / edit the client details' placement='bottom'>
                    <TableCell
                      align='center'
                      onDoubleClick={() => editClientHandler(record?.clientInfo)}
                      style={{ cursor: 'pointer' }}>
                      {record?.clientInfo?.namePrefix ? record?.clientInfo?.namePrefix + ' ' : ''}{' '}
                      {record?.clientInfo?.name}
                    </TableCell>
                  </Tooltip>
                  <Tooltip title='Double click to see / edit the client details' placement='bottom'>
                    <TableCell
                      align='center'
                      onDoubleClick={() => editClientHandler(record?.clientInfo)}
                      style={{ cursor: 'pointer' }}>
                      {record?.clientInfo?.email}
                    </TableCell>
                  </Tooltip>
                  <Tooltip title='Double click to see / edit the client details' placement='bottom'>
                    <TableCell
                      align='center'
                      onDoubleClick={() => editClientHandler(record?.clientInfo)}
                      style={{ cursor: 'pointer' }}>
                      {record?.clientInfo?.phone}
                    </TableCell>
                  </Tooltip>
                  <TableCell align='center'>
                    {record.emailSent ? (
                      <CheckCircleIcon color='primary' />
                    ) : (
                      <CancelIcon color='secondary' />
                    )}
                  </TableCell>
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
              ))}
            </TableBody>
          </Table>
        </Scrollbars>
      </TableContainer>
      {showPDF && <ShowPDFModal pdfBuffer={genPDF} onClose={onClose} />}
    </>
  )
}

export default InvoiceSearch
