import React, { useEffect, useState } from 'react'
import { withRouter, Link } from 'react-router-dom'
import { Observer } from 'mobx-react-lite'
import randomstring from 'randomstring'
import * as dayjs from 'dayjs'
import { makeStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import Grid from '@material-ui/core/Grid'
import InputBase from '@material-ui/core/InputBase'
import CardContent from '@material-ui/core/CardContent'
import TextField from '@material-ui/core/TextField'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Checkbox from '@material-ui/core/Checkbox'
import RemoveIcon from '@material-ui/icons/Remove'
import AddIcon from '@material-ui/icons/Add'
import CircularProgress from '@material-ui/core/CircularProgress'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import FormControl from '@material-ui/core/FormControl'
import Select from '@material-ui/core/Select'
import InputLabel from '@material-ui/core/InputLabel'
import MenuItem from '@material-ui/core/MenuItem'

import ClientsAddEdit from './ClientAddEdit'

import { Constants } from './../scripts/constants'
import { showToast, getSearchingKeywords, isEmail } from './../scripts/localActions'
import {
  getCleintById,
  searchClients,
  searchClientByEmail,
  getEstimateById,
  getInvoiceById,
} from './../scripts/remoteActions'

import appStore from './../store/AppStore'
import estimatorStore from './../store/EstimatorStore'

const useStyles = makeStyles((theme) => ({
  root: {
    minWidth: 275,
  },
  form: {
    textAlign: 'center',
    '& .MuiTextField-root': {
      margin: theme.spacing(1),
      width: '90%',
    },
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: '60%',
    maxWidth: '90%',
  },
  searchInput: {
    marginLeft: theme.spacing(1),
    padding: '5px',
    height: '100%',
    width: '100%',
  },
}))

const CustomerInfo = (props) => {
  const classes = useStyles()
  const [clients, setClients] = useState([])
  const [query, setQuery] = useState('')
  const [clientSelected, setClientSelected] = useState(false)
  const [autoFilled, setAutofilled] = useState(false)
  const [allowSearch] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [allAddresses, setAllAddresses] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [refresh, setRefresh] = useState(false)
  const [clientToEdit, setClientToEdit] = useState({})

  useEffect(() => {
    if (props.location.state && props.location.state.clientId) {
      if (props.location.state.editMode) {
        if (props.context === 'INVOICE') {
          getInvoiceById(props.location.state.recordId)
            .then((doc) => {
              if (doc.exists) {
                let docData = doc.data()
                if (docData.allData) {
                  let allData = JSON.parse(docData.allData)
                  estimatorStore.setCustInfoAndFinalEstimate(
                    allData.customerInfo,
                    allData.finalEstimates,
                    allData.customNote || ''
                  )
                }
              }
            })
            .catch((err) => {
              console.error(`getInvoiceById. Error:\n${err}`)
              return showToast('Something went wrong fetching invoice', 'error')
            })
        } else if (props.context === 'ESTIMATE') {
          getEstimateById(props.location.state.recordId)
            .then((doc) => {
              if (doc.exists) {
                let docData = doc.data()
                if (docData.allData) {
                  let allData = JSON.parse(docData.allData)
                  estimatorStore.setCustInfoAndFinalEstimate(
                    allData.customerInfo,
                    allData.finalEstimates,
                    allData.customNote || ''
                  )
                }
              }
            })
            .catch((err) => {
              console.error(`getEstimateById. Error:\n${err}`)
              return showToast('Something went wrong fetching estimate', 'error')
            })
        }
      }
      getCleintById(props.location.state.clientId)
        .then((doc) => {
          if (doc.exists) {
            let docData = doc.data()
            docData.id = doc.id
            estimatorStore.customerInfo.id = doc.id
            estimatorStore.customerInfo.name = docData.name || ''
            estimatorStore.customerInfo.address = docData.address || ''
            estimatorStore.customerInfo.phone = docData.phone || ''
            estimatorStore.customerInfo.email = docData.email || ''
            setClientSelected(true)
            setAutofilled(true)
            setClientToEdit(docData)
          }
        })
        .catch((err) => {
          return showToast('Something went wrong fetching client info.', 'error')
        })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh])

  useEffect(() => {
    if (estimatorStore.customerInfo.id) {
      setClientSelected(true)
    }
  }, [refresh])

  useEffect(() => {
    setAllAddresses([estimatorStore.customerInfo.address])
    if (estimatorStore.customerInfo.id) {
      getCleintById(estimatorStore.customerInfo.id)
        .then((doc) => {
          if (doc.exists) {
            let docData = doc.data()
            docData.id = doc.id
            estimatorStore.customerInfo.id = doc.id
            estimatorStore.customerInfo.name = docData.name || ''
            estimatorStore.customerInfo.address = docData.address || ''
            estimatorStore.customerInfo.phone = docData.phone || ''
            estimatorStore.customerInfo.email = docData.email || ''
            setClientToEdit(docData)
            if (docData.otherAddresses) {
              setAllAddresses([estimatorStore.customerInfo.address, ...docData.otherAddresses])
            }
          }
        })
        .catch((err) => {
          return showToast('Something went wrong fetching client info.', 'error')
        })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estimatorStore.customerInfo.id, refresh])

  useEffect(() => {
    // setAllowSearch(false)
    // let timeoutId = setTimeout(() => {
    //   setAllowSearch(true)
    // }, 100)
    if (query !== '') {
      handleSearch(query)
    }
    // return () => {
    //   clearTimeout(timeoutId)
    // }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

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
            clientsData = await searchClients(keywordChunk)
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

  const handleClick = (op) => {
    if (op === 'SUB') {
      if (estimatorStore.customerInfo.paymentsInfo.length <= 1) {
        return showToast('There should be atleast one payment info.', 'error')
      }
      estimatorStore.customerInfo.paymentsInfo.pop()
      return
    }
    estimatorStore.customerInfo.paymentsInfo.push({
      id: randomstring.generate(),
      paymentAmount: 0,
      paymentDate: dayjs().format('DD-MM-YYYY'),
    })
    return
  }

  return (
    <Observer>
      {() => (
        <Card className={classes.root}>
          <CardContent>
            <div className={classes.form}>
              {clientSelected ? (
                <>
                  {!autoFilled && (
                    <h5
                      onClick={() => setClientSelected(false)}
                      style={{
                        textDecoration: 'underline',
                        color: `${appStore.darkMode ? '#f50157' : '#3776f1'}`,
                        cursor: 'pointer',
                        textAlign: 'right',
                      }}>
                      Change Client
                    </h5>
                  )}
                  <h5
                    onClick={() => setShowModal(true)}
                    style={{
                      textDecoration: 'underline',
                      color: `${appStore.darkMode ? '#f50157' : '#3776f1'}`,
                      cursor: 'pointer',
                      textAlign: 'right',
                    }}>
                    Edit This Client Info
                  </h5>
                  <Grid container spacing={0}>
                    <Grid item xs={12} lg={3}>
                      <TextField
                        id='outlined-cust-name-input'
                        disabled={true}
                        label='Nom'
                        type='text'
                        variant='outlined'
                        value={estimatorStore.customerInfo.name}
                      />
                    </Grid>
                    <Grid item xs={12} lg={3}>
                      <FormControl variant='outlined' className={classes.formControl}>
                        <InputLabel id='cust-addresses'>Adresse</InputLabel>
                        <Select
                          labelId='cust-addresses'
                          value={estimatorStore.customerInfo.address}
                          onChange={(e) => {
                            estimatorStore.customerInfo.address = e.target.value
                          }}
                          label='Adresse'>
                          {allAddresses.map((add) => (
                            <MenuItem value={add}>{add}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} lg={3}>
                      <TextField
                        id='outlined-cust-phone-input'
                        disabled={true}
                        label='Téléphone'
                        type='tel'
                        variant='outlined'
                        value={estimatorStore.customerInfo.phone}
                      />
                    </Grid>
                    <Grid item xs={12} lg={3}>
                      <TextField
                        id='outlined-cust-email-input'
                        disabled={true}
                        label='Email'
                        type='email'
                        variant='outlined'
                        value={estimatorStore.customerInfo.email}
                      />
                    </Grid>
                  </Grid>
                  {props.context === 'ESTIMATE' && (
                    <>
                      <br />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={estimatorStore.customerInfo.hideTotalBox}
                            onChange={(e) => {
                              estimatorStore.customerInfo.hideTotalBox = e.target.checked
                            }}
                            name='HideTotalCheckbox'
                            color='secondary'
                          />
                        }
                        label='Hide Total Box'
                      />
                    </>
                  )}
                  <br />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={estimatorStore.customerInfo.warranty}
                        onChange={(e) => {
                          estimatorStore.customerInfo.warranty = e.target.checked
                        }}
                        name='TravauxCheckbox'
                        color='primary'
                      />
                    }
                    label='Travaux Garantie 2 ans'
                  />
                  <br />
                  <br />
                  <TextField
                    id='filled-cust-deposit-input'
                    label='Deposited Amount'
                    type='text'
                    variant='outlined'
                    value={estimatorStore.customerInfo.depositAmt}
                    style={{ width: 275 }}
                    onChange={(e) => {
                      estimatorStore.customerInfo.depositAmt = e.target.value
                    }}
                  />
                  {props.context === 'INVOICE' && (
                    <div>
                      {estimatorStore.customerInfo.paymentsInfo.map((pinfo) => (
                        <div key={pinfo.id}>
                          <br />
                          <TextField
                            id='filled-cust-payment-input'
                            label='Payment Amount'
                            type='text'
                            variant='outlined'
                            value={pinfo.paymentAmount}
                            style={{ width: 275 }}
                            onChange={(e) => {
                              pinfo.paymentAmount = e.target.value
                            }}
                          />
                          <TextField
                            id='filled-cust-payment-date-input'
                            label='Payment Date'
                            type='date'
                            defaultValue={dayjs().format('YYYY-MM-DD')}
                            style={{ width: 275 }}
                            onChange={(e) => {
                              pinfo.paymentDate = dayjs(e.target.value, 'YYYY-MM-DD').format(
                                'DD-MM-YYYY'
                              )
                            }}
                            InputLabelProps={{
                              shrink: true,
                            }}
                          />
                          <br />
                        </div>
                      ))}
                      <AddIcon
                        style={{ marginRight: '20px', marginTop: '10px', cursor: 'pointer' }}
                        onClick={() => handleClick('ADD')}
                      />
                      <RemoveIcon
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleClick('SUB')}
                      />
                      <br />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={estimatorStore.customerInfo.paid}
                            onChange={(e) => {
                              estimatorStore.customerInfo.paid = e.target.checked
                            }}
                            name='PaidCheckbox'
                            color='primary'
                          />
                        }
                        label='Paid'
                      />
                    </div>
                  )}
                </>
              ) : (
                <Grid container spacing={0}>
                  <Grid item xs={12}>
                    <InputBase
                      className={classes.searchInput}
                      placeholder='Search By Client Name Or Email'
                      onChange={(e) => setQuery(e.target.value.trim())}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    {isLoading ? (
                      <CircularProgress />
                    ) : (
                      <List component='nav' aria-label='secondary mailbox folders'>
                        {clients.map((client) => (
                          <ListItem
                            key={client.id}
                            button
                            onClick={() => {
                              estimatorStore.customerInfo.id = client.id || ''
                              estimatorStore.customerInfo.name = client.name || ''
                              estimatorStore.customerInfo.address = client.address || ''
                              estimatorStore.customerInfo.phone = client.phone || ''
                              estimatorStore.customerInfo.email = client.email || ''
                              setClientSelected(true)
                            }}>
                            <ListItemText primary={`${client.name} (${client.email})`} />
                          </ListItem>
                        ))}
                      </List>
                    )}
                    <br />
                    <Link
                      to={{
                        pathname: Constants.jobsConfigs.allPaths.Others.routes.Clients.route,
                      }}>
                      <h5
                        onClick={() => setClientSelected(false)}
                        style={{
                          textDecoration: 'underline',
                          color: `${appStore.darkMode ? '#f50157' : '#3776f1'}`,
                          cursor: 'pointer',
                          textAlign: 'right',
                        }}>
                        Add New Client
                      </h5>
                    </Link>
                  </Grid>
                </Grid>
              )}
            </div>
          </CardContent>
          {showModal && (
            <ClientsAddEdit
              onClose={() => setShowModal(false)}
              setRefresh={setRefresh}
              modalMode={'EDIT'}
              clientToEdit={clientToEdit}
            />
          )}
        </Card>
      )}
    </Observer>
  )
}

export default withRouter(CustomerInfo)
