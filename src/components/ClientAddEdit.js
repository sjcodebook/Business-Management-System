import React, { useState, useEffect } from 'react'
import { Scrollbars } from 'react-custom-scrollbars'
import { makeStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import Modal from '@material-ui/core/Modal'
import Divider from '@material-ui/core/Divider'
import Checkbox from '@material-ui/core/Checkbox'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import CancelOutlinedIcon from '@material-ui/icons/CancelOutlined'
import InputAdornment from '@material-ui/core/InputAdornment'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import { useTheme } from '@material-ui/core/styles'
import MonetizationOnOutlinedIcon from '@material-ui/icons/MonetizationOnOutlined'
import Autocomplete from '@material-ui/lab/Autocomplete'
import InputLabel from '@material-ui/core/InputLabel'
import MenuItem from '@material-ui/core/MenuItem'
import FormControl from '@material-ui/core/FormControl'
import Select from '@material-ui/core/Select'

import userStore from './../store/UserStore'

import {
  searchClientByEmail,
  getUsers,
  createNewClient,
  editClient,
  addNewEventLog,
} from '../scripts/remoteActions'
import { showToast, isEmail, getSearchableKeywords } from '../scripts/localActions'
import { Constants } from './../scripts/constants'

const getModalStyle = () => {
  const top = 50
  const left = 50

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
    borderRadius: 20,
    overflowY: 'scroll',
    overflowX: 'hidden',
  }
}

const useStyles = makeStyles((theme) => ({
  paper: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: theme.palette.background.paper,
    borderRadius: 5,
    boxShadow: theme.shadows[5],
    padding: 20,
    textAlign: 'center',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  margin: {
    margin: theme.spacing(1),
  },
  formControl: {
    minWidth: 90,
  },
}))

const ClientsAddEdit = ({ onClose, setRefresh, modalMode, clientToEdit }) => {
  const classes = useStyles()
  const [namePrefix, setNamePrefix] = useState(clientToEdit?.namePrefix || '')
  const [name, setName] = useState(clientToEdit?.name || '')
  const [email, setEmail] = useState(clientToEdit?.email || '')
  const [address, setAddress] = useState(clientToEdit?.address || '')
  const [otherAddresses, setOtherAddresses] = useState(clientToEdit?.otherAddresses || [])
  const [companyName, setCompanyName] = useState(clientToEdit?.companyName || '')
  const [title, setTitle] = useState(clientToEdit?.title || '')
  const [website, setWebsite] = useState(clientToEdit?.website || '')
  const [phone, setPhone] = useState(clientToEdit?.phone || '')
  const [homeNumber, setHomeNumber] = useState(clientToEdit?.homeNumber || '')
  const [officeNumber, setOfficeNumber] = useState(clientToEdit?.officeNumber || '')
  const [faxNumber, setFaxNumber] = useState(clientToEdit?.faxNumber || '')
  const [leadSource, setLeadSource] = useState(clientToEdit?.leadSource || '')
  const [leadVal, setLeadVal] = useState(clientToEdit?.leadVal || '')
  const [leadSetBy, setIsLeadSetBy] = useState(clientToEdit?.leadSetBy || '')
  const [closeProb, setCloseProb] = useState(clientToEdit?.closeProb || '')
  const [contactWay, setContactWay] = useState(clientToEdit?.contactWay || '')
  const [contactTime, setContactTime] = useState(clientToEdit?.contactTime || '')
  const [interestedIn, setInterestedIn] = useState(clientToEdit?.interestedIn || '')
  const [buildingType, setBuildingType] = useState(clientToEdit?.buildingType || '')
  const [isActive, setIsActive] = useState(
    clientToEdit ? (Object.keys(clientToEdit).length !== 0 ? clientToEdit.isActive : true) : true
  )
  const [isLoading, setIsLoading] = useState(false)
  const [modalStyle] = useState(getModalStyle)
  const [open] = useState(true)
  const [allUsers, setAllUsersInfo] = useState([])
  const [usersLoaded, setUsersLoaded] = useState(false)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  useEffect(() => {
    getUsers()
      .then((snapshot) => {
        if (!snapshot.empty) {
          setAllUsersInfo(snapshot.docs.map((doc) => doc.data()))
          setUsersLoaded(true)
        }
      })
      .catch((err) => {
        setUsersLoaded(false)
        showToast('Something went wrong fetching users', 'error')
      })
  }, [])

  const handleSubmit = async () => {
    try {
      if (!name.trim() || !email.trim() || !address.trim() || !phone.trim()) {
        showToast(
          'Name, Email, Address and Mobile Number Cannot Be Empty. Please check and try again.',
          'error'
        )
        return
      }
      if (!isEmail(email.trim())) {
        showToast('Email not valid', 'error')
        return
      }
      let clientInfo = {
        namePrefix,
        name,
        email,
        address,
        otherAddresses: otherAddresses.filter((add) => add),
        phone,
        companyName,
        title,
        website,
        homeNumber,
        officeNumber,
        faxNumber,
        leadSource,
        leadVal,
        closeProb,
        contactWay,
        contactTime,
        interestedIn,
        buildingType,
        isActive,
        leadSetBy,
      }
      Object.keys(clientInfo).forEach((key) => {
        if (typeof clientInfo[key] === 'string') {
          clientInfo[key] = clientInfo[key].trim()
        }
      })
      clientInfo.searchableKeywords = getSearchableKeywords(clientInfo.name, 2000)
      setIsLoading(true)
      let clientsData = await searchClientByEmail(clientInfo.email).catch((err) => {
        console.error(err)
        showToast('Something went wrong searching client by email.', 'error')
        throw new Error(err)
      })
      let byPassEmailCheck = false
      if (modalMode === 'EDIT' && clientToEdit.email === clientInfo.email) {
        byPassEmailCheck = true
      }
      if (!byPassEmailCheck && clientsData.length !== 0) {
        setIsLoading(false)
        return showToast('Client with this email already exists', 'error')
      }
      let clientDoc, targetType, eventDesc, moreInfo
      if (modalMode === 'ADD') {
        clientDoc = await createNewClient(clientInfo).catch((err) => {
          console.error(err)
          showToast('Something went wrong adding client.', 'error')
          throw new Error(err)
        })
        targetType = Constants.Events.NEW_CLIENT_ADDED.Type
        eventDesc = Constants.Events.NEW_CLIENT_ADDED.Desc
        moreInfo = {
          prevObj: null,
          newObj: clientDoc,
        }
        setIsLoading(false)
        showToast('Client added successfully!')
        onClose()
        setRefresh((prevVal) => !prevVal)
      } else {
        clientDoc = await editClient(clientToEdit.id, clientInfo).catch((err) => {
          console.error(err)
          showToast('Something went wrong editing client.', 'error')
        })
        targetType = Constants.Events.CLIENT_INFO_EDITED.Type
        eventDesc = Constants.Events.CLIENT_INFO_EDITED.Desc
        moreInfo = {
          prevObj: clientToEdit,
          newObj: clientDoc,
        }
        setIsLoading(false)
        showToast('Client edited successfully!')
        onClose()
        setRefresh((prevVal) => !prevVal)
      }

      // Creating Event Log-------------------------------------------------------------------
      await addNewEventLog(
        userStore.currentUser.id,
        clientDoc.id,
        clientDoc.id,
        targetType,
        eventDesc,
        moreInfo
      )
      //--------------------------------------------------------------------------------------
    } catch (err) {
      setIsLoading(false)
      console.error(err)
      showToast('Something went wrong', 'error')
    }
  }

  return (
    <Modal open={open}>
      <div
        style={{
          ...modalStyle,
          width: isMobile ? '95%' : '55%',
          height: '80vh',
        }}
        className={classes.paper}>
        <Scrollbars style={{ height: '75vh' }}>
          <Grid container spacing={1}>
            <Grid item xs={12}>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 10px 0px 10px',
                }}>
                <Typography variant='h4'>
                  {modalMode === 'ADD' ? 'Add New Client Panel' : 'Edit Client Panel'}
                </Typography>
                <CancelOutlinedIcon
                  style={{ cursor: 'pointer' }}
                  fontSize='large'
                  onClick={() => onClose()}
                />
              </div>
            </Grid>
            <Grid item xs={12}>
              <br />
              <Divider />
              <br />
              <Grid container spacing={1}>
                <Grid item xs={12} md={6}>
                  <div className='center-flex-row'>
                    <FormControl variant='outlined' className={classes.formControl}>
                      <InputLabel id='client-name-prefix'>Prefix</InputLabel>
                      <Select
                        labelId='client-name-prefix'
                        value={namePrefix}
                        onChange={(e) => setNamePrefix(e.target.value)}
                        label='Prefix'>
                        <MenuItem value={'Mr.'}>Mr.</MenuItem>
                        <MenuItem value={'Mrs.'}>Mrs.</MenuItem>
                        <MenuItem value={'Miss.'}>Miss.</MenuItem>
                      </Select>
                    </FormControl>
                    <TextField
                      label='Client Name'
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      variant='outlined'
                      style={{ minWidth: '55%', marginLeft: 10 }}
                    />
                  </div>
                  <br />
                  <TextField
                    type='email'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    label='Client Email'
                    variant='outlined'
                    style={{ width: '70%' }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    type='tel'
                    label='Mobile Number'
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    variant='outlined'
                    style={{ width: '70%' }}
                  />
                  <br />
                  <br />
                  <TextField
                    label='Client Address'
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    variant='outlined'
                    style={{ width: '70%' }}
                  />
                </Grid>
              </Grid>
              <br />
              <Divider />
              <br />
              <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label='Other Address 1 (optional)'
                    value={otherAddresses[0] || ''}
                    onChange={(e) => {
                      setOtherAddresses((prevVal) => {
                        let newVal = [...prevVal]
                        newVal[0] = e.target.value
                        return newVal
                      })
                    }}
                    variant='outlined'
                    style={{ width: '70%' }}
                  />
                  <br />
                  <br />
                  <TextField
                    label='Other Address 2 (optional)'
                    value={otherAddresses[1] || ''}
                    onChange={(e) => {
                      setOtherAddresses((prevVal) => {
                        let newVal = [...prevVal]
                        newVal[1] = e.target.value
                        return newVal
                      })
                    }}
                    variant='outlined'
                    style={{ width: '70%' }}
                  />
                  <br />
                  <br />
                  <TextField
                    label='Other Address 3 (optional)'
                    value={otherAddresses[2] || ''}
                    onChange={(e) => {
                      setOtherAddresses((prevVal) => {
                        let newVal = [...prevVal]
                        newVal[2] = e.target.value
                        return newVal
                      })
                    }}
                    variant='outlined'
                    style={{ width: '70%' }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    type='tel'
                    label='Home Number (optional)'
                    value={homeNumber}
                    onChange={(e) => setHomeNumber(e.target.value)}
                    variant='outlined'
                    style={{ width: '70%' }}
                  />
                  <br />
                  <br />
                  <TextField
                    type='tel'
                    label='Office Number (optional)'
                    value={officeNumber}
                    onChange={(e) => setOfficeNumber(e.target.value)}
                    variant='outlined'
                    style={{ width: '70%' }}
                  />
                  <br />
                  <br />
                  <TextField
                    type='tel'
                    label='Fax Number (optional)'
                    value={faxNumber}
                    onChange={(e) => setFaxNumber(e.target.value)}
                    variant='outlined'
                    style={{ width: '70%' }}
                  />
                </Grid>
              </Grid>
              <br />
              <Divider />
              <br />
              <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label='Company Name (optional)'
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    variant='outlined'
                    style={{ width: '70%' }}
                  />
                  <br />
                  <br />
                  <TextField
                    label='Website (optional)'
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    variant='outlined'
                    style={{ width: '70%' }}
                  />
                  <br />
                  <br />
                  <TextField
                    label='Lead Source (optional)'
                    value={leadSource}
                    onChange={(e) => setLeadSource(e.target.value)}
                    variant='outlined'
                    style={{ width: '70%' }}
                  />
                  <br />
                  <br />
                  {usersLoaded ? (
                    <Autocomplete
                      options={allUsers}
                      defaultValue={() => {
                        for (let i = 0; i < allUsers.length; i++) {
                          if (allUsers[i].uid === leadSetBy) {
                            return allUsers[i]
                          }
                        }
                      }}
                      style={{ width: '70%', margin: 'auto' }}
                      onInputChange={(e, val, res) => {
                        if (res === 'reset') {
                          setIsLeadSetBy(val.split('#')[1] || '')
                        }
                      }}
                      getOptionLabel={(option) => `${option.name} (${option.email}) #${option.uid}`}
                      renderInput={(params) => (
                        <TextField {...params} label='Lead Set By (optional)' variant='outlined' />
                      )}
                    />
                  ) : (
                    'Loading...'
                  )}
                  <br />
                  <TextField
                    type='number'
                    label='Est. Lead Value (optional)'
                    value={leadVal}
                    onChange={(e) => setLeadVal(e.target.value)}
                    variant='outlined'
                    style={{ width: '70%' }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position='start'>
                          <MonetizationOnOutlinedIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <br />
                  <br />
                  <TextField
                    type='number'
                    label='Close Probability (optional)'
                    value={closeProb}
                    onChange={(e) => setCloseProb(e.target.value)}
                    variant='outlined'
                    style={{ width: '70%' }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position='end'>
                          <span style={{ color: 'black', fontWeight: 'normal' }}>%</span>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label='Title (optional)'
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    variant='outlined'
                    style={{ width: '70%' }}
                  />
                  <br />
                  <br />
                  <TextField
                    label='Interested In (optional)'
                    value={interestedIn}
                    onChange={(e) => setInterestedIn(e.target.value)}
                    variant='outlined'
                    style={{ width: '70%' }}
                  />
                  <br />
                  <br />
                  <TextField
                    label='Building Type (optional)'
                    value={buildingType}
                    onChange={(e) => setBuildingType(e.target.value)}
                    variant='outlined'
                    style={{ width: '70%' }}
                  />
                  <br />
                  <br />
                  <TextField
                    label='Best way to contact (optional)'
                    value={contactWay}
                    onChange={(e) => setContactWay(e.target.value)}
                    variant='outlined'
                    style={{ width: '70%' }}
                  />
                  <br />
                  <br />
                  <TextField
                    label='Best time to contact (optional)'
                    value={contactTime}
                    onChange={(e) => setContactTime(e.target.value)}
                    variant='outlined'
                    style={{ width: '70%' }}
                  />
                  <br />
                  <br />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={isActive}
                        onChange={(e) => setIsActive(e.target.checked)}
                        color='primary'
                        size='normal'
                      />
                    }
                    label={<span style={{ fontSize: 12 }}>Active Client</span>}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <br />
          <Divider />
          <br />
          <Button
            size='normal'
            disabled={isLoading}
            onClick={handleSubmit}
            variant='contained'
            color='primary'
            style={{ marginTop: 20 }}>
            {modalMode === 'ADD' ? 'Add Client' : 'Edit Client'}
          </Button>
          <br /> <br /> <br />
        </Scrollbars>
      </div>
    </Modal>
  )
}

export default ClientsAddEdit
