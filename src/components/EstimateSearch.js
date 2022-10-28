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

import ShowPDFModal from './common/ShowPDFModal'

import appStore from './../store/AppStore'

import ClientsAddEdit from './ClientAddEdit'

import { Constants } from './../scripts/constants'
import Configs from '../scripts/configs'
import {
  searchClients,
  getUserById,
  searchClientByEmail,
  getEstimatesByClientId,
  getEstimates,
  getCleintById,
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
    height: '150%',
    width: '100%',
  },
  table: {
    minWidth: 650,
  },
}))

const EstimateSearch = () => {
  const classes = useStyles()
  const [estimates, setEstimates] = useState([])
  const [limit] = useState(100)
  const [isLoading, setIsLoading] = useState(false)
  const [query, setQuery] = useState('')
  const [refresh, setRefresh] = useState(false)
  const [allowSearch] = useState(true)
  const [clientToEdit, setClientToEdit] = useState({})
  const [showClientEditModal, setShowClientEditModal] = useState(false)

  useEffect(() => {
    // setAllowSearch(false)
    // let timeoutId = setTimeout(() => {
    //   setAllowSearch(true)
    // }, 100)
    if (query !== '') {
      handleSearch(query)
    } else {
      setTimeout(() => {
        setEstimatesData()
      }, 1000)
    }
    // return () => {
    //   clearTimeout(timeoutId)
    // }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, refresh])

  const setEstimatesData = async () => {
    try {
      setIsLoading(true)
      let requests = await getEstimates()
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
          }
        })
      )
      setIsLoading(false)
      setEstimates(requests)
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
          setEstimates(estimates)
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
              let estimates = await getEstimatesByClientId(clientData.id, limit)
              estimates.forEach((request) => {
                request['allInfo'] = JSON.parse(request.allInfo)
                request['clientInfo'] = clientData
                finalRequests.push(request)
              })
            })
          )
          setEstimates(finalRequests)
        }
        setIsLoading(false)
      }
    } catch (err) {
      setIsLoading(false)
      console.error(err)
      showToast('Something went wrong searching estimates request', 'error')
    }
  }

  return (
    <Paper className={classes.paper}>
      <Typography variant='h4' color='textPrimary' align='left' gutterBottom>
        Search Estimate(s) {isLoading && <CircularProgress size={25} color='secondary' />}
      </Typography>
      <br />
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <InputBase
            style={{ backgroundColor: appStore.darkMode ? '#303030' : '#f7f7f7' }}
            className={classes.searchInput}
            placeholder='Search By Client Name Or Email Or Estimate No.'
            onChange={(e) => setQuery(e.target.value.trim())}
          />
        </Grid>
        <br />
        <br />
        <Grid item xs={12}>
          <EstimatesTable
            estimates={estimates}
            setShowClientEditModal={setShowClientEditModal}
            setClientToEdit={setClientToEdit}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
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
    </Paper>
  )
}

const EstimatesTable = ({
  estimates,
  setShowClientEditModal,
  setClientToEdit,
  isLoading,
  setIsLoading,
}) => {
  const classes = useStyles()
  const [showPDF, setShowPDF] = useState(false)
  const [genPDF, setGenPDF] = useState(null)

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

  return (
    <>
      <br />
      <Typography variant='body1' color='textSecondary' align='center' gutterBottom>
        Total Results: {estimates.length}
      </Typography>
      <br />
      <TableContainer component={Paper}>
        <Scrollbars style={{ height: 500 }}>
          <Table className={classes.table} stickyHeader>
            <TableHead>
              <TableRow>
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
                  <b>Client Phone</b>
                </TableCell>
                <TableCell align='center'>
                  <b>Email Sent</b>
                </TableCell>
                <TableCell align='center'>
                  <b>Date</b>
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
              {estimates.map((record) => (
                <TableRow key={record.id}>
                  <TableCell align='center'>{record.estimateNo || '-'}</TableCell>
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
                    {dayjs.unix(record.createdAt).format('DD MMMM YYYY')}
                  </TableCell>
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
              ))}
            </TableBody>
          </Table>
        </Scrollbars>
      </TableContainer>
      {showPDF && <ShowPDFModal pdfBuffer={genPDF} onClose={onClose} />}
    </>
  )
}

export default EstimateSearch
