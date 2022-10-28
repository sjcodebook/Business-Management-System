import React from 'react'
import { Observer } from 'mobx-react-lite'
import { makeStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import TextField from '@material-ui/core/TextField'

import estimatorStore from '../store/EstimatorStore'

const useStyles = makeStyles((theme) => ({
  cardRoot: {
    minWidth: 275,
    marginTop: '20px',
  },
  title: {
    fontSize: 20,
  },
}))

const CustomNote = () => {
  const classes = useStyles()

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
              Remarque personnalisée
            </Typography>
            <br />
            <br />
            <Grid container spacing={1}>
              <Grid item xs={12}>
                <TextField
                  label='Entrez votre note ici pour le client (Ajouter une virgule (,) pour la nouvelle ligne)'
                  type='text'
                  variant='outlined'
                  value={estimatorStore.customNote}
                  multiline
                  rows={3}
                  rowsMax={8}
                  style={{ width: '100%' }}
                  onChange={(e) => {
                    estimatorStore.customNote = e.target.value
                  }}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}
    </Observer>
  )
}

export default CustomNote
