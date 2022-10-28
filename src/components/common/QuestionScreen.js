import React, { useState, useEffect } from 'react'
import { Observer } from 'mobx-react-lite'
import * as dayjs from 'dayjs'
import { makeStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Grid from '@material-ui/core/Grid'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import InputLabel from '@material-ui/core/InputLabel'
import MenuItem from '@material-ui/core/MenuItem'
import FormControl from '@material-ui/core/FormControl'
import Select from '@material-ui/core/Select'
import ClearIcon from '@material-ui/icons/Clear'

import { showToast } from './../../scripts/localActions'
import { logout, editUserDetails, getAllJobs } from './../../scripts/remoteActions'

const useStyles = makeStyles((theme) => ({
  formControlSelect: {
    margin: theme.spacing(1),
    minWidth: 220,
  },
}))

const QuestionScreen = ({ userStore, firstLogin, setVisiblity }) => {
  const classes = useStyles()
  const [allJobs, setAllJobs] = useState([])
  const [name, setName] = useState(userStore.currentUser.name)
  const [email] = useState(userStore.currentUser.email)
  const [address, setAddress] = useState(userStore.currentUser.address)
  const [phone, setPhone] = useState(userStore.currentUser.phone)
  const [dob, setDob] = useState(userStore.currentUser.dob)
  const [job, setJob] = useState(userStore.currentUser.jobConfig.id)
  const [eName, setEName] = useState(userStore.currentUser.emergencyContactName)
  const [ePhone, setEPhone] = useState(userStore.currentUser.emergencyContactNumber)
  const [canSubmit, setCanSubmit] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    getAllJobs()
      .then((snap) => {
        if (!snap.empty) {
          setAllJobs(
            snap.docs.map((doc) => ({
              ...doc.data(),
              id: doc.id,
            }))
          )
        }
      })
      .catch((err) => {
        console.error('getAllJobs\n', err)
      })
  }, [])

  useEffect(() => {
    if (
      !name?.trim() ||
      !address?.trim() ||
      !phone?.trim() ||
      !dob ||
      !job ||
      !eName?.trim() ||
      !ePhone?.trim()
    ) {
      setCanSubmit(false)
    } else {
      setCanSubmit(true)
    }
  }, [name, address, phone, dob, job, eName, ePhone])

  const handleSubmit = () => {
    setIsLoading(true)
    let jobApproved = true
    if (job !== userStore.currentUser.jobConfig.id) {
      jobApproved = false
    }
    editUserDetails(
      userStore.currentUser.id,
      name?.trim(),
      address?.trim(),
      phone?.trim(),
      dob,
      job,
      jobApproved,
      eName?.trim(),
      ePhone?.trim()
    )
      .then((res) => {
        showToast('User Info Updated Successfully.')
        window.location.reload()
      })
      .catch((err) => {
        setIsLoading(false)
        showToast('Something Went wrong updating user.', 'error')
      })
  }

  return (
    <Observer>
      {() => (
        <Grid
          container
          spacing={2}
          direction='column'
          alignItems='center'
          justify='center'
          style={{ minHeight: '80vh' }}>
          <Grid item xs={12} style={{ textAlign: 'center' }}>
            {firstLogin ? (
              <h2>Please fill the form below to continue.</h2>
            ) : (
              <h2>Edit Saved Information</h2>
            )}
          </Grid>
          <Grid item xs={12}>
            <Card style={{ minWidth: 290, textAlign: 'center', padding: '20px' }}>
              <CardContent>
                <Grid container spacing={4}>
                  {!firstLogin && (
                    <Grid item xs={12}>
                      <div style={{ textAlign: 'right' }}>
                        <ClearIcon
                          style={{ cursor: 'pointer' }}
                          onClick={() => setVisiblity(false)}
                        />
                      </div>
                    </Grid>
                  )}
                  <Grid item xs={12} md={6}>
                    <TextField
                      value={name}
                      label='Name'
                      variant='outlined'
                      onChange={(e) => setName(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      disabled={true}
                      type='email'
                      value={email}
                      label='Email'
                      variant='outlined'
                    />
                  </Grid>
                </Grid>
                <Grid container spacing={4}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      value={address}
                      label='Address'
                      variant='outlined'
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      type='tel'
                      value={phone}
                      label='Phone Number'
                      variant='outlined'
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </Grid>
                </Grid>
                <Grid container spacing={4}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label='Date Of Birth'
                      defaultValue={dob ? dayjs.unix(dob).format('YYYY-MM-DD') : ''}
                      type='date'
                      onChange={(e) => {
                        setDob(dayjs(e.target.value, 'YYYY-MM-DD').unix())
                      }}
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <div style={{ textAlign: 'center' }}>
                      <FormControl variant='outlined' className={classes.formControlSelect}>
                        <InputLabel id='access-search-label'>Job</InputLabel>
                        <Select
                          labelId='job-question-screen-label'
                          id='job-question-screen'
                          value={job}
                          onChange={(e) => setJob(e.target.value)}
                          label='Job'>
                          <MenuItem value=''>
                            <em>None</em>
                          </MenuItem>
                          {allJobs.map((job) => (
                            <MenuItem key={job.id} value={job.id}>
                              {job.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </div>
                  </Grid>
                </Grid>
                <br />
                <Grid item xs={12} style={{ textAlign: 'center' }}>
                  <h4>Emergency Contact Person Information:</h4>
                </Grid>
                <Grid container spacing={4}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      value={eName}
                      label='Name'
                      variant='outlined'
                      onChange={(e) => setEName(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      type='tel'
                      value={ePhone}
                      label='Phone Number'
                      variant='outlined'
                      onChange={(e) => setEPhone(e.target.value)}
                    />
                  </Grid>
                </Grid>
              </CardContent>
              <br />
              <Button
                disabled={!canSubmit || isLoading}
                variant='contained'
                color='primary'
                onClick={() => handleSubmit()}>
                Submit
              </Button>
            </Card>
          </Grid>
          <br />
          <Grid item xs={12}>
            <Button variant='contained' color='secondary' onClick={logout}>
              Logout
            </Button>
          </Grid>
        </Grid>
      )}
    </Observer>
  )
}

export default QuestionScreen
