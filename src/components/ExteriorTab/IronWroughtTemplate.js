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

import { Constants } from '../../scripts/constants'
import { showToast, getRoundValEst, round } from '../../scripts/localActions'
import estimatorStore from '../../store/EstimatorStore'

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

const IronWroughtTemplate = ({ workCatKey, title, btnTitle, editMode, data, onClose }) => {
  const worksMap = estimatorStore.getWorksMap(workCatKey)
  const multi = Constants.multipliers[workCatKey]
  const classes = useStyles()
  const [name, setName] = useState('')
  const [steps, setSteps] = useState(0)
  const [railings, setRailings] = useState(0)
  const [notes, setNote] = useState('Sherwin - Williams 2 couches inclut dans le prix')
  const [prepWork, setPrepwork] = useState(
    workCatKey === 'metalIronWrought'
      ? "Gratter + grinder toute la rouille + Essuyer les surfaces avec de l'acétone + primer partout métal a nue"
      : "Gratter + grinder toute la rouille + Essuyer les surfaces avec de l'acétone"
  )
  const [color, setColor] = useState('')
  const [easy, setEasy] = useState({
    val: 0,
    stepsMultiplier: multi.easy.steps,
    railingsMultiplier: multi.easy.railings,
  })
  const [medium, setMedium] = useState({
    val: 0,
    stepsMultiplier: multi.medium.steps,
    railingsMultiplier: multi.medium.railings,
  })
  const [hard, setHard] = useState({
    val: 0,
    stepsMultiplier: multi.hard.steps,
    railingsMultiplier: multi.hard.railings,
  })
  const [finalEstimates, setFinalEstimates] = useState({})

  useEffect(() => {
    setStepsOrRailings(steps, 'steps')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [steps])

  useEffect(() => {
    setStepsOrRailings(railings, 'railings')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [railings])

  useEffect(() => {
    if (editMode) {
      setName(data?.work?.name || '')
      setSteps(data?.work?.steps || 0)
      setRailings(data?.work?.railings || 0)
      setNote(data?.work?.notes || '')
      setPrepwork(data?.work?.prepWork || '')
      setColor(data?.work?.color || '')
      let finalEstimatesObj = {}
      ;['easy', 'medium', 'hard'].forEach((key) => {
        if (data['work'][key]) {
          finalEstimatesObj[key] = data['work'][key]
        }
      })
      setFinalEstimates(finalEstimatesObj)
    }
  }, [editMode, data])

  const calFinalValue = (prevVal, val, context) => {
    let finalVal = 0
    if (context === 'steps') {
      finalVal = round(
        getRoundValEst(railings, prevVal['railingsMultiplier']) +
          getRoundValEst(val, prevVal['stepsMultiplier']),
        2
      )
    } else {
      finalVal = round(
        getRoundValEst(steps, prevVal['stepsMultiplier']) +
          getRoundValEst(val, prevVal['railingsMultiplier']),
        2
      )
    }
    return finalVal
  }

  const setStepsOrRailings = (val, context) => {
    if (context === 'steps') {
      setSteps(val)
    } else {
      setRailings(val)
    }
    setEasy((prev) => {
      return {
        ...prev,
        val: calFinalValue(prev, val, context),
      }
    })
    setMedium((prev) => {
      return {
        ...prev,
        val: calFinalValue(prev, val, context),
      }
    })
    setHard((prev) => {
      return {
        ...prev,
        val: calFinalValue(prev, val, context),
      }
    })
  }

  const setMultiplier = (key, multiplier) => {
    const finalState = {
      val: round(Math.round((steps * multiplier + Number.EPSILON) * 100) / 100, 2),
      multiplier,
    }
    if (key === 'easy') {
      setEasy(finalState)
    } else if (key === 'medium') {
      setMedium(finalState)
    } else if (key === 'hard') {
      setHard(finalState)
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
        steps,
        railings,
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
      estimatorStore.setFinalEstimate(workCatKey, {
        name,
        steps,
        railings,
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
    setSteps(0)
    setRailings(0)
    setNote('Sherwin - Williams 2 couches inclut dans le prix')
    setPrepwork('Gratter + grinder toute la rouille, Apprêt partout ou le métal et nu')
    setColor('')
    setEasy({
      val: 0,
      stepsMultiplier: multi.easy.steps,
      railingsMultiplier: multi.easy.railings,
    })
    setMedium({
      val: 0,
      stepsMultiplier: multi.medium.steps,
      railingsMultiplier: multi.medium.railings,
    })
    setHard({
      val: 0,
      stepsMultiplier: multi.hard.steps,
      railingsMultiplier: multi.hard.railings,
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
              {title}
            </Typography>
            <div className={classes.form}>
              <TextField
                label='Nom'
                type='text'
                variant='outlined'
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                }}
              />
              <TextField
                label='Marches'
                type='text'
                variant='outlined'
                value={steps}
                onChange={(e) => {
                  setStepsOrRailings(e.target.value, 'steps')
                }}
              />
              <TextField
                label='Rampes'
                type='text'
                variant='outlined'
                value={railings}
                onChange={(e) => {
                  setStepsOrRailings(e.target.value, 'railings')
                }}
              />
              <TextField
                label='Notes'
                type='text'
                variant='outlined'
                value={notes}
                onChange={(e) => {
                  setNote(e.target.value)
                }}
              />
              <TextField
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
                      Facile
                      <br />
                      <input
                        style={{ width: '40px', display: 'none' }}
                        onChange={(e) => setMultiplier('easy', e.target.value)}
                        defaultValue={easy.multiplier}
                      />
                    </StyledTableCell>
                    <StyledTableCell>
                      Moyen
                      <br />
                      <input
                        style={{ width: '40px', display: 'none' }}
                        onChange={(e) => setMultiplier('medium', e.target.value)}
                        defaultValue={medium.multiplier}
                      />
                    </StyledTableCell>
                    <StyledTableCell>
                      Hardcore
                      <br />
                      <input
                        style={{ width: '40px', display: 'none' }}
                        onChange={(e) => setMultiplier('hard', e.target.value)}
                        defaultValue={hard.multiplier}
                      />
                    </StyledTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell component='th' scope='row'>
                      <span style={{ fontSize: '30px', marginRight: '10px' }}>{easy.val}</span>
                      <AddCircleIcon
                        fontSize='small'
                        style={{ display: 'inline', cursor: 'pointer' }}
                        onClick={(e) => handleValSelect('easy', easy.val)}
                      />
                    </TableCell>
                    <TableCell component='th' scope='row'>
                      <span style={{ fontSize: '30px', marginRight: '10px' }}>{medium.val}</span>
                      <AddCircleIcon
                        fontSize='small'
                        style={{ display: 'inline', cursor: 'pointer' }}
                        onClick={(e) => handleValSelect('medium', medium.val)}
                      />
                    </TableCell>
                    <TableCell component='th' scope='row'>
                      <span style={{ fontSize: '30px', marginRight: '10px' }}>{hard.val}</span>
                      <AddCircleIcon
                        fontSize='small'
                        style={{ display: 'inline', cursor: 'pointer' }}
                        onClick={(e) => handleValSelect('hard', hard.val)}
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
                {btnTitle}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </Observer>
  )
}

export default IronWroughtTemplate
