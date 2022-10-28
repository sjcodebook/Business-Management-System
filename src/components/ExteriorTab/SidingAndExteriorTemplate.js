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
import { showToast, round } from '../../scripts/localActions'
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

const SidingAndExteriorTemplate = ({ workCatKey, title, btnTitle, editMode, data, onClose }) => {
  const worksMap = estimatorStore.getWorksMap(workCatKey)
  const multi = Constants.multipliers[workCatKey]
  const classes = useStyles()
  const [name, setName] = useState('')
  const [floor, setFloor] = useState(0)
  const [notes, setNote] = useState('Sherwin - Williams 2 couches inclut dans le prix')
  const [prepWork, setPrepwork] = useState('')
  const [color, setColor] = useState('')
  const [oneSheen, setOneSheen] = useState({
    val: 0,
    multiplier: multi.oneSheen,
  })
  const [twoSheens, setTwoSheens] = useState({
    val: 0,
    multiplier: multi.twoSheens,
  })
  const [threeSheens, setThreeSheens] = useState({
    val: 0,
    multiplier: multi.threeSheens,
  })
  const [primerOneSheen, setPrimerOneSheen] = useState({
    val: 0,
    multiplier: multi.primerOneSheen,
  })
  const [primerTwoSheens, setPrimerTwoSheens] = useState({
    val: 0,
    multiplier: multi.primerTwoSheens,
  })
  const [primerThreeSheens, setPrimerThreeSheens] = useState({
    val: 0,
    multiplier: multi.primerThreeSheens,
  })
  const [finalEstimates, setFinalEstimates] = useState({})

  useEffect(() => {
    if (editMode) {
      setName(data?.work?.name || '')
      setFloor(data?.work?.floor || 0)
      setNote(data?.work?.notes || '')
      setPrepwork(data?.work?.prepWork || '')
      setColor(data?.work?.color || '')
      setSidingAndExtFloor(data?.work?.floor || 0)
      let finalEstimatesObj = {}
      ;[
        'oneSheen',
        'twoSheens',
        'threeSheens',
        'primerOneSheen',
        'primerTwoSheens',
        'primerThreeSheens',
      ].forEach((key) => {
        if (data['work'][key]) {
          finalEstimatesObj[key] = data['work'][key]
        }
      })
      setFinalEstimates(finalEstimatesObj)
    }
  }, [editMode, data])

  const setSidingAndExtFloor = (floor) => {
    setFloor(floor)
    setOneSheen((prev) => {
      let multiplier = prev.multiplier
      return {
        val: round(Math.round((floor * multiplier + Number.EPSILON) * 100) / 100, 2),
        multiplier,
      }
    })
    setTwoSheens((prev) => {
      let multiplier = prev.multiplier
      return {
        val: round(Math.round((floor * multiplier + Number.EPSILON) * 100) / 100, 2),
        multiplier,
      }
    })
    setThreeSheens((prev) => {
      let multiplier = prev.multiplier
      return {
        val: round(Math.round((floor * multiplier + Number.EPSILON) * 100) / 100, 2),
        multiplier,
      }
    })
    setPrimerOneSheen((prev) => {
      let multiplier = prev.multiplier
      return {
        val: round(Math.round((floor * multiplier + Number.EPSILON) * 100) / 100, 2),
        multiplier,
      }
    })
    setPrimerTwoSheens((prev) => {
      let multiplier = prev.multiplier
      return {
        val: round(Math.round((floor * multiplier + Number.EPSILON) * 100) / 100, 2),
        multiplier,
      }
    })
    setPrimerThreeSheens((prev) => {
      let multiplier = prev.multiplier
      return {
        val: round(Math.round((floor * multiplier + Number.EPSILON) * 100) / 100, 2),
        multiplier,
      }
    })
  }

  const setMultiplier = (key, multiplier) => {
    const finalState = {
      val: round(Math.round((floor * multiplier + Number.EPSILON) * 100) / 100, 2),
      multiplier,
    }
    if (key === 'oneSheen') {
      setOneSheen(finalState)
    } else if (key === 'twoSheens') {
      setTwoSheens(finalState)
    } else if (key === 'threeSheens') {
      setThreeSheens(finalState)
    } else if (key === 'primerOneSheen') {
      setPrimerOneSheen(finalState)
    } else if (key === 'primerTwoSheens') {
      setPrimerTwoSheens(finalState)
    } else if (key === 'primerThreeSheens') {
      setPrimerThreeSheens(finalState)
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
        floor,
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
        floor,
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
    setFloor(0)
    setNote('Sherwin - Williams 2 couches inclut dans le prix')
    setPrepwork('')
    setColor('')
    setOneSheen({
      val: 0,
      multiplier: multi.oneSheen,
    })
    setTwoSheens({
      val: 0,
      multiplier: multi.twoSheens,
    })
    setThreeSheens({
      val: 0,
      multiplier: multi.threeSheens,
    })
    setPrimerOneSheen({
      val: 0,
      multiplier: multi.primerOneSheen,
    })
    setPrimerTwoSheens({
      val: 0,
      multiplier: multi.primerTwoSheens,
    })
    setPrimerThreeSheens({
      val: 0,
      multiplier: multi.primerThreeSheens,
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
                label='Name'
                type='text'
                variant='outlined'
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                }}
              />
              <TextField
                label='Floor SQ/FT'
                type='text'
                variant='outlined'
                value={floor}
                onChange={(e) => {
                  setSidingAndExtFloor(e.target.value)
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
            <TableContainer component={Paper} style={{ marginTop: '20px' }}>
              <Table className={classes.table} aria-label='simple table'>
                <TableHead>
                  <TableRow>
                    <StyledTableCell>
                      1 Sheen
                      <br />
                      <input
                        style={{ width: '40px', display: 'none' }}
                        onChange={(e) => setMultiplier('oneSheen', e.target.value)}
                        defaultValue={oneSheen.multiplier}
                      />
                    </StyledTableCell>
                    <StyledTableCell>
                      2 Sheens
                      <br />
                      <input
                        style={{ width: '40px', display: 'none' }}
                        onChange={(e) => setMultiplier('twoSheens', e.target.value)}
                        defaultValue={twoSheens.multiplier}
                      />
                    </StyledTableCell>
                    <StyledTableCell>
                      3 Sheens
                      <br />
                      <input
                        style={{ width: '40px', display: 'none' }}
                        onChange={(e) => setMultiplier('threeSheens', e.target.value)}
                        defaultValue={threeSheens.multiplier}
                      />
                    </StyledTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell component='th' scope='row'>
                      <span style={{ fontSize: '30px', marginRight: '10px' }}>{oneSheen.val}</span>
                      <AddCircleIcon
                        fontSize='small'
                        style={{ display: 'inline', cursor: 'pointer' }}
                        onClick={(e) => handleValSelect('oneSheen', oneSheen.val)}
                      />
                    </TableCell>
                    <TableCell component='th' scope='row'>
                      <span style={{ fontSize: '30px', marginRight: '10px' }}>{twoSheens.val}</span>
                      <AddCircleIcon
                        fontSize='small'
                        style={{ display: 'inline', cursor: 'pointer' }}
                        onClick={(e) => handleValSelect('twoSheens', twoSheens.val)}
                      />
                    </TableCell>
                    <TableCell component='th' scope='row'>
                      <span style={{ fontSize: '30px', marginRight: '10px' }}>
                        {threeSheens.val}
                      </span>
                      <AddCircleIcon
                        fontSize='small'
                        style={{ display: 'inline', cursor: 'pointer' }}
                        onClick={(e) => handleValSelect('threeSheens', threeSheens.val)}
                      />
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
            <TableContainer component={Paper} style={{ marginTop: '20px' }}>
              <Table className={classes.table} aria-label='simple table'>
                <TableHead>
                  <TableRow>
                    <StyledTableCell>
                      Primer + 1 Sheen
                      <br />
                      <input
                        style={{ width: '40px', display: 'none' }}
                        onChange={(e) => setMultiplier('primerOneSheen', e.target.value)}
                        defaultValue={primerOneSheen.multiplier}
                      />
                    </StyledTableCell>
                    <StyledTableCell>
                      Primer + 2 Sheens
                      <br />
                      <input
                        style={{ width: '40px', display: 'none' }}
                        onChange={(e) => setMultiplier('primerTwoSheens', e.target.value)}
                        defaultValue={primerTwoSheens.multiplier}
                      />
                    </StyledTableCell>
                    <StyledTableCell>
                      Primer + 3 Sheens
                      <br />
                      <input
                        style={{ width: '40px', display: 'none' }}
                        onChange={(e) => setMultiplier('primerThreeSheens', e.target.value)}
                        defaultValue={primerThreeSheens.multiplier}
                      />
                    </StyledTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell component='th' scope='row'>
                      <span style={{ fontSize: '30px', marginRight: '10px' }}>
                        {primerOneSheen.val}
                      </span>
                      <AddCircleIcon
                        fontSize='small'
                        style={{ display: 'inline', cursor: 'pointer' }}
                        onClick={(e) => handleValSelect('primerOneSheen', primerOneSheen.val)}
                      />
                    </TableCell>
                    <TableCell component='th' scope='row'>
                      <span style={{ fontSize: '30px', marginRight: '10px' }}>
                        {primerTwoSheens.val}
                      </span>
                      <AddCircleIcon
                        fontSize='small'
                        style={{ display: 'inline', cursor: 'pointer' }}
                        onClick={(e) => handleValSelect('primerTwoSheens', primerTwoSheens.val)}
                      />
                    </TableCell>
                    <TableCell component='th' scope='row'>
                      <span style={{ fontSize: '30px', marginRight: '10px' }}>
                        {primerThreeSheens.val}
                      </span>
                      <AddCircleIcon
                        fontSize='small'
                        style={{ display: 'inline', cursor: 'pointer' }}
                        onClick={(e) => handleValSelect('primerThreeSheens', primerThreeSheens.val)}
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

export default SidingAndExteriorTemplate
