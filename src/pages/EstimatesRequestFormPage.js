import React, { useState } from 'react'
import { withRouter } from 'react-router-dom'
import { Observer } from 'mobx-react-lite'
import axios from 'axios'
import Grid from '@material-ui/core/Grid'
import Container from '@material-ui/core/Container'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'

import userStore from '../store/UserStore'

import Configs from '../scripts/configs'
import { showToast, isEmail } from '../scripts/localActions'

const EstimatesRequestFormPage = (props) => {
  return <Observer>{() => <EstimatesRequestForm />}</Observer>
}

const EstimatesRequestForm = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [msg, setMsg] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async () => {
    if (!email.trim() && !phone.trim()) {
      return showToast('Client should atleast have a email or phone.', 'error')
    }
    if (email.trim() && !isEmail(email.trim())) {
      return showToast('Client email not valid', 'error')
    }
    setIsLoading(true)
    await axios
      .post(`${Configs.FirebaseFunctionUrl}/addEstimateRequest`, {
        name,
        email,
        address,
        phone,
        message: msg,
        byId: userStore.isLoggedIn ? userStore.currentUser.id : Configs.systemUserId,
      })
      .then(() => {
        setIsLoading(false)
        resetForm()
        showToast('Estimate request added successfully.')
      })
      .catch((err) => {
        setIsLoading(false)
        console.error(err)
        showToast('Something went wrong adding estimates request', 'error')
      })
  }

  const resetForm = () => {
    setName('')
    setEmail('')
    setPhone('')
    setAddress('')
    setMsg('')
  }

  return (
    <Observer>
      {() => (
        <div style={{ marginTop: '20px' }}>
          <Container fixed>
            <Typography variant='h4' align='center' gutterBottom>
              Submit New Estimate Request
            </Typography>
            <Grid container spacing={1}>
              <Grid item xs={12} style={{ marginTop: 40 }}>
                <Grid container spacing={2} style={{ textAlign: 'center' }}>
                  <Grid item xs={12}>
                    <TextField
                      label='Name'
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      variant='outlined'
                      style={{ minWidth: 290 }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label='Email'
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      variant='outlined'
                      style={{ minWidth: 290 }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      type='tel'
                      label='Phone'
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      variant='outlined'
                      style={{ minWidth: 290 }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label='Address'
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      variant='outlined'
                      style={{ minWidth: 290 }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label='Message'
                      value={msg}
                      multiline
                      rowsMax={5}
                      rows={5}
                      onChange={(e) => setMsg(e.target.value)}
                      variant='outlined'
                      style={{ minWidth: 290 }}
                    />
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} style={{ marginTop: 20, textAlign: 'center' }}>
                <Button
                  variant='contained'
                  color='primary'
                  disabled={isLoading}
                  onClick={() => handleSubmit()}>
                  Submit Request
                </Button>
              </Grid>
            </Grid>
          </Container>
        </div>
      )}
    </Observer>
  )
}

export default withRouter(EstimatesRequestFormPage)
