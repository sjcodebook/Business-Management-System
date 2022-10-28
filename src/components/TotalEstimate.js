import React, { useState } from 'react'
import { Observer } from 'mobx-react-lite'
import randomstring from 'randomstring'
import SimpleReactLightbox, { SRLWrapper } from 'simple-react-lightbox'
import { makeStyles, withStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import MuiAccordion from '@material-ui/core/Accordion'
import MuiAccordionSummary from '@material-ui/core/AccordionSummary'
import MuiAccordionDetails from '@material-ui/core/AccordionDetails'
import CancelIcon from '@material-ui/icons/Cancel'
import EditIcon from '@material-ui/icons/Edit'

import ToolEditModal from './ToolEditModal'
import ToolsImagesModal from './ToolsImagesModal'

import appStore from './../store/AppStore'
import estimatorStore from './../store/EstimatorStore'

const useStyles = makeStyles((theme) => ({
  root: {
    minWidth: 275,
    marginTop: '50px',
  },
}))

const Accordion = withStyles({
  root: {
    border: '1px solid rgba(0, 0, 0, .125)',
    boxShadow: 'none',
    '&:not(:last-child)': {
      borderBottom: 0,
    },
    '&:before': {
      display: 'none',
    },
    '&$expanded': {
      margin: 'auto',
    },
  },
  expanded: {},
})(MuiAccordion)

const AccordionSummary = withStyles({
  root: {
    backgroundColor: 'rgba(0, 0, 0, .03)',
    borderBottom: '1px solid rgba(0, 0, 0, .125)',
    marginBottom: -1,
    minHeight: 56,
    '&$expanded': {
      minHeight: 56,
    },
  },
  content: {
    '&$expanded': {
      margin: '12px 0',
    },
  },
  expanded: {},
})(MuiAccordionSummary)

const AccordionDetails = withStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
  },
}))(MuiAccordionDetails)

const TotalEstimate = () => {
  const classes = useStyles()

  return (
    <Observer>
      {() => (
        <Card className={classes.root}>
          <CardContent>
            <Typography component='span' variant='h4' color='textPrimary' gutterBottom>
              Total
            </Typography>
            <div
              style={{
                float: 'right',
              }}>
              <Button color='secondary' onClick={() => (estimatorStore.finalEstimates = {})}>
                Reset
              </Button>
            </div>
            <TotalEstimateCard heading={'Interior Works'} workContext={'interiorWorks'} />
            <TotalEstimateCard heading={'Exterior Works'} workContext={'exteriorWorks'} />
            <TotalEstimateCard heading={'Custom Works'} workContext={'customWorks'} />
          </CardContent>
        </Card>
      )}
    </Observer>
  )
}

const TotalEstimateCard = ({ heading, workContext }) => {
  const [expanded, setExpanded] = useState(`panel${workContext}`)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showToolsImagesModal, setShowToolsImagesModal] = useState(false)
  const [activeWork, setActiveWork] = useState({})
  const [activeWorkKey, setActiveWorkKey] = useState('')
  const [activeValueId, setActiveValueId] = useState('')

  const handleChange = (panel) => (event, newExpanded) => {
    setExpanded(newExpanded ? panel : false)
  }

  const thumb = {
    position: 'relative',
    display: 'inline-flex',
    marginBottom: 8,
    marginRight: 8,
    width: 70,
    height: 60,
  }

  const thumbInner = {
    display: 'flex',
    minWidth: 0,
    overflow: 'hidden',
  }

  const thumbButton = {
    position: 'absolute',
    right: 2,
    bottom: 2,
    background: 'rgba(0,0,0,.8)',
    color: '#fff',
    border: 0,
    borderRadius: '.325em',
    cursor: 'pointer',
  }

  const img = {
    display: 'block',
    width: 'auto',
    height: '100%',
    borderRadius: 5,
  }

  return (
    <Observer>
      {() => (
        <div>
          {Object.keys(estimatorStore[workContext]).length !== 0 && (
            <Accordion
              style={{ marginTop: '20px' }}
              expanded={expanded === `panel${workContext}`}
              onChange={handleChange(`panel${workContext}`)}>
              <AccordionSummary
                aria-controls={`panel${workContext}-content`}
                id={`panel${workContext}-header`}>
                <Typography>{heading}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container style={{ justifyContent: 'center' }} spacing={3}>
                  {Object.keys(estimatorStore[workContext]).map((key) => {
                    let worksMap = estimatorStore[workContext][key]['worksMap']
                    return estimatorStore[workContext][key]['data'].map((work) => (
                      <Grid key={randomstring.generate()} item sm={12} md={6} lg={4}>
                        <Card
                          style={{
                            marginTop: '10px',
                            backgroundColor: `${appStore.darkMode ? '#303030' : '#e0f3ff'}`,
                          }}>
                          <CardContent style={{ textAlign: 'center' }}>
                            <Typography
                              component='span'
                              variant='h6'
                              color='textPrimary'
                              gutterBottom>
                              <EditIcon
                                style={{ float: 'right', cursor: 'pointer', color: '#3f51b5' }}
                                onClick={(e) => {
                                  setActiveWork({
                                    work,
                                    worksMap: estimatorStore[workContext][key]['worksMap'],
                                    workKey: key,
                                  })
                                  setShowEditModal(true)
                                }}
                              />
                              {worksMap.catName}
                            </Typography>
                            <List>
                              {Object.keys(work).map((workKey) => {
                                if (!['id', 'images'].includes(workKey)) {
                                  return (
                                    <ListItem
                                      style={{ textAlign: 'center' }}
                                      key={randomstring.generate()}>
                                      <ListItemText
                                        primary={worksMap[workKey] || workKey}
                                        secondary={work[workKey] ?? '-'}
                                      />
                                    </ListItem>
                                  )
                                }
                                return null
                              })}
                            </List>
                            <br />
                            <SimpleReactLightbox>
                              <SRLWrapper>
                                {(work.images || []).map((image) => {
                                  return (
                                    <div style={thumb} key={image}>
                                      <div style={thumbInner}>
                                        <a key={image} href={image} style={{ marginLeft: 10 }}>
                                          <img src={image} style={img} alt={'refrence_images'} />
                                        </a>
                                      </div>
                                      <button
                                        style={thumbButton}
                                        onClick={() => {
                                          estimatorStore.removeToolsImage(key, work.id, image)
                                        }}>
                                        x
                                      </button>
                                    </div>
                                  )
                                })}
                              </SRLWrapper>
                            </SimpleReactLightbox>
                            <br />
                            <Button
                              variant='contained'
                              size='small'
                              color='primary'
                              onClick={(e) => {
                                setActiveWorkKey(key)
                                setActiveValueId(work.id)
                                setShowToolsImagesModal(true)
                              }}>
                              Add Image(s)
                            </Button>
                            <br />
                            <br />
                            <Button
                              variant='contained'
                              color='secondary'
                              onClick={(e) => estimatorStore.removeFinalEstimate(key, work['id'])}>
                              <CancelIcon />
                            </Button>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))
                  })}
                </Grid>
              </AccordionDetails>
            </Accordion>
          )}
          {showEditModal && (
            <ToolEditModal activeWork={activeWork} onClose={() => setShowEditModal(false)} />
          )}
          {showToolsImagesModal && (
            <ToolsImagesModal
              workKey={activeWorkKey}
              valueId={activeValueId}
              onClose={() => setShowToolsImagesModal(false)}
            />
          )}
        </div>
      )}
    </Observer>
  )
}

export default TotalEstimate
