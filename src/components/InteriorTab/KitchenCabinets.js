import React, { useState, useEffect } from 'react'
import { Observer } from 'mobx-react-lite'
import randomstring from 'randomstring'
import { makeStyles, withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import TextField from '@material-ui/core/TextField'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Paper from '@material-ui/core/Paper'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import Button from '@material-ui/core/Button'
import AddCircleIcon from '@material-ui/icons/AddCircle'
import DeleteIcon from '@material-ui/icons/Delete'

import { showToast, getRoundValEst, round } from './../../scripts/localActions'
import { Constants } from './../../scripts/constants'
import estimatorStore from './../../store/EstimatorStore'

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
    marginTop: '50px',
  },
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
  table: {
    minWidth: 650,
  },
}))

const StyledTableCell = withStyles((theme) => ({
  head: {
    backgroundColor: '#7aa3f3',
    color: theme.palette.common.black,
  },
  body: {
    fontSize: 14,
  },
}))(TableCell)

const KitchenCabinets = ({ editMode, data, onClose }) => {
  const worksMap = estimatorStore.getWorksMap('kitchenCabinets')
  const multi = Constants.multipliers.kitchenCabinets
  const classes = useStyles()
  const [name, setName] = useState('')
  const [cabinets, setCabinets] = useState(0)
  const [notes, setNote] = useState('Sherwin - Williams 2 couches inclut dans le prix')
  const [prepWork, setPrepwork] = useState('')
  const [color, setColor] = useState('')
  const [clientSC, setClientSC] = useState({
    val: 0,
    multiplier: multi.clientSC,
  })
  const [clientDA, setClientDA] = useState({
    val: 0,
    multiplier: multi.clientDA,
  })
  const [all, setAll] = useState({
    val: 0,
    multiplier: multi.all,
  })
  const [finalEstimates, setFinalEstimates] = useState({})

  useEffect(() => {
    if (editMode) {
      setName(data?.work?.name || '')
      setCabinets(data?.work?.cabinets || '')
      setNote(data?.work?.notes || '')
      setPrepwork(data?.work?.prepWork || '')
      setColor(data?.work?.color || '')
      setKitchenCabinets(data?.work?.cabinets || '')
      let finalEstimatesObj = {}
      ;['clientSC', 'clientDA', 'all'].forEach((key) => {
        if (data['work'][key]) {
          finalEstimatesObj[key] = data['work'][key]
        }
      })
      setFinalEstimates(finalEstimatesObj)
    }
  }, [editMode, data])

  const setKitchenCabinets = (cabinets) => {
    setCabinets(cabinets)
    setClientSC((prev) => {
      let multiplier = prev.multiplier
      return {
        val: round(getRoundValEst(cabinets, multiplier), 2),
        multiplier,
      }
    })
    setClientDA((prev) => {
      let multiplier = prev.multiplier
      return {
        val: round(getRoundValEst(cabinets, multiplier), 2),
        multiplier,
      }
    })
    setAll((prev) => {
      let multiplier = prev.multiplier
      return {
        val: round(getRoundValEst(cabinets, multiplier), 2),
        multiplier,
      }
    })
  }

  const setMultiplier = (key, multiplier) => {
    const finalState = {
      val: round(getRoundValEst(cabinets, multiplier), 2),
      multiplier,
    }
    if (key === 'clientSC') {
      setClientSC(finalState)
    } else if (key === 'clientDA') {
      setClientDA(finalState)
    } else if (key === 'all') {
      setAll(finalState)
    }
  }

  const handleValSelect = (key, val) => {
    if (val === 0) {
      showToast('Cannot Add Zero Value', 'error')
      return
    }
    let newVal = {
      ...finalEstimates,
    }
    newVal[key] = val
    setFinalEstimates(newVal)
  }

  const handleValDeselect = (key) => {
    let newVal = {
      ...finalEstimates,
    }
    delete newVal[key]
    setFinalEstimates(newVal)
  }

  const handleSubmit = () => {
    if (editMode) {
      estimatorStore.updateFinalEstimate(data.workKey, data.work.id, {
        name,
        cabinets,
        notes,
        prepWork,
        color,
        ...finalEstimates,
      })
      showToast('Updated Successfully')
      if (onClose) {
        onClose()
      }
    } else {
      showToast('Added Successfully')
      estimatorStore.setFinalEstimate('kitchenCabinets', {
        name,
        cabinets,
        notes,
        prepWork,
        color,
        ...finalEstimates,
      })
      resetVal()
    }
  }

  const resetVal = () => {
    setName('')
    setCabinets(0)
    setNote('Sherwin - Williams 2 couches inclut dans le prix')
    setPrepwork('')
    setColor('')
    setClientSC({
      val: 0,
      multiplier: multi.clientSC,
    })
    setClientDA({
      val: 0,
      multiplier: multi.clientDA,
    })
    setAll({
      val: 0,
      multiplier: multi.all,
    })
    setFinalEstimates({})
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
              Cabinets de Cuisines
            </Typography>
            <div className={classes.form}>
              <TextField
                id='outlined-kitchen-name-input'
                label='Nom'
                type='text'
                variant='outlined'
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                }}
              />
              <TextField
                id='outlined-kitchen-cabinets-input'
                label='Nombre de cabinets'
                type='text'
                variant='outlined'
                value={cabinets}
                onChange={(e) => {
                  setKitchenCabinets(e.target.value)
                }}
              />
              <TextField
                id='outlined-kitchen-notes-input'
                label='Notes'
                type='text'
                variant='outlined'
                value={notes}
                onChange={(e) => {
                  setNote(e.target.value)
                }}
              />
              <TextField
                id='outlined-kitchen-prep-input'
                label='Préparation'
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
            <TableContainer component={Paper} style={{ marginTop: '20px' }}>
              <Table className={classes.table} aria-label='simple table'>
                <TableHead>
                  <TableRow>
                    <StyledTableCell>
                      Clients SC
                      <br />
                      <input
                        style={{ width: '40px', display: 'none' }}
                        onChange={(e) => setMultiplier('clientSC', e.target.value)}
                        defaultValue={clientSC.multiplier}
                      />
                    </StyledTableCell>
                    <StyledTableCell>
                      Clients DA
                      <br />
                      <input
                        style={{ width: '40px', display: 'none' }}
                        onChange={(e) => setMultiplier('clientDA', e.target.value)}
                        defaultValue={clientDA.multiplier}
                      />
                    </StyledTableCell>
                    <StyledTableCell>
                      All
                      <br />
                      <input
                        style={{ width: '40px', display: 'none' }}
                        onChange={(e) => setMultiplier('all', e.target.value)}
                        defaultValue={all.multiplier}
                      />
                    </StyledTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell component='th' scope='row'>
                      <span style={{ fontSize: '30px', marginRight: '10px' }}>{clientSC.val}</span>
                      <AddCircleIcon
                        fontSize='small'
                        style={{ display: 'inline', cursor: 'pointer' }}
                        onClick={(e) => handleValSelect('clientSC', clientSC.val)}
                      />
                    </TableCell>
                    <TableCell component='th' scope='row'>
                      <span style={{ fontSize: '30px', marginRight: '10px' }}>{clientDA.val}</span>
                      <AddCircleIcon
                        fontSize='small'
                        style={{ display: 'inline', cursor: 'pointer' }}
                        onClick={(e) => handleValSelect('clientDA', clientDA.val)}
                      />
                    </TableCell>
                    <TableCell component='th' scope='row'>
                      <span style={{ fontSize: '30px', marginRight: '10px' }}>{all.val}</span>
                      <AddCircleIcon
                        fontSize='small'
                        style={{ display: 'inline', cursor: 'pointer' }}
                        onClick={(e) => handleValSelect('all', all.val)}
                      />
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
            {Object.keys(finalEstimates).length !== 0 && (
              <Card className={classes.cardRoot}>
                <CardContent>
                  <Typography component={'span'} color='textPrimary' gutterBottom>
                    <b>Final Values:</b>
                  </Typography>
                  <List component='nav'>
                    {Object.keys(finalEstimates).map((key) => {
                      return (
                        <ListItem key={randomstring.generate()}>
                          <ListItemText>
                            <span style={{ fontSize: '20px', marginRight: '10px' }}>
                              <b>{worksMap[key] || key}</b>: {finalEstimates[key]}
                            </span>
                            <DeleteIcon
                              fontSize='small'
                              style={{ display: 'inline', cursor: 'pointer' }}
                              onClick={(e) => handleValDeselect(key)}
                            />
                          </ListItemText>
                        </ListItem>
                      )
                    })}
                  </List>
                </CardContent>
              </Card>
            )}
            <div style={{ textAlign: 'center' }}>
              <Button
                variant='contained'
                color='primary'
                style={{ marginTop: '20px' }}
                disabled={Object.keys(finalEstimates).length === 0 || name === ''}
                onClick={(e) => handleSubmit()}>
                {editMode ? 'Mettre à jour Cabinets de Cuisines' : 'Ajouter Cabinets de Cuisines'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </Observer>
  )
}

export default KitchenCabinets
