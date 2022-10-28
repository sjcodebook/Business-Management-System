import React, { useState, useEffect } from 'react'
import { Observer } from 'mobx-react-lite'
import { makeStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'

import { showToast, round } from '../../scripts/localActions'
import estimatorStore from '../../store/EstimatorStore'

const useStyles = makeStyles((theme) => ({
  cardRoot: {
    minWidth: 275,
    marginTop: '20px',
  },
  title: {
    fontSize: 20,
  },
  form: {
    textAlign: 'left',
    '& .MuiTextField-root': {
      margin: theme.spacing(1),
    },
  },
}))

const CustomExterior = ({ editMode, data, onClose }) => {
  const classes = useStyles()
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [notes, setNote] = useState('Sherwin - Williams 2 couches inclut dans le prix')
  const [prepWork, setPrepwork] = useState('')
  const [color, setColor] = useState('')

  useEffect(() => {
    if (editMode) {
      setName(data?.work?.name || '')
      setPrice(data?.work?.price || '')
      setNote(data?.work?.notes || '')
      setPrepwork(data?.work?.prepWork || '')
      setColor(data?.work?.color || '')
    }
  }, [editMode, data])

  const handleSubmit = () => {
    if (editMode) {
      estimatorStore.updateFinalEstimate(data.workKey, data.work.id, {
        name,
        price: round(price, 2),
        notes,
        prepWork,
        color,
      })
      showToast('Updated Successfully')
      if (onClose) {
        onClose()
      }
    } else {
      showToast('Added Successfully')
      estimatorStore.setFinalEstimate('customExterior', {
        name,
        price: round(price, 2),
        notes,
        prepWork,
        color,
      })
      resetVal()
    }
  }

  const resetVal = () => {
    setName('')
    setPrice('')
    setNote('Sherwin - Williams 2 couches inclut dans le prix')
    setPrepwork('')
    setColor('')
  }

  return (
    <Observer>
      {() => (
        <Card className={classes.cardRoot}>
          <CardContent>
            <Typography
              component={'span'}
              className={classes.title}
              color='textPrimary'
              gutterBottom>
              Custom Exterior Work
            </Typography>
            <div className={classes.form}>
              <TextField
                id='outlined-custom-ext-name-input'
                label='Name'
                type='text'
                variant='outlined'
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                }}
              />
              <TextField
                id='outlined-custom-ext-price-input'
                label='Price'
                type='text'
                variant='outlined'
                value={price}
                onChange={(e) => {
                  setPrice(e.target.value)
                }}
              />
              <TextField
                id='outlined-custom-ext-notes-input'
                label='Notes'
                type='text'
                variant='outlined'
                value={notes}
                onChange={(e) => {
                  setNote(e.target.value)
                }}
              />
              <TextField
                id='outlined-custom-ext-prep-input'
                label='Prep Work'
                type='text'
                variant='outlined'
                value={prepWork}
                onChange={(e) => {
                  setPrepwork(e.target.value)
                }}
              />
              <TextField
                label='Couleur'
                type='text'
                variant='outlined'
                value={color}
                onChange={(e) => {
                  setColor(e.target.value)
                }}
              />
            </div>

            <div style={{ textAlign: 'center' }}>
              <Button
                variant='contained'
                color='primary'
                style={{ marginTop: '20px' }}
                disabled={name === ''}
                onClick={(e) => handleSubmit()}>
                {editMode ? 'Update Custom Exterior Work' : 'Add Custom Exterior Work'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </Observer>
  )
}

export default CustomExterior
