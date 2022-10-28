import React, { useState, useEffect } from 'react'
import { withRouter } from 'react-router-dom'
import { Observer } from 'mobx-react-lite'
import * as dayjs from 'dayjs'
import Container from '@material-ui/core/Container'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import TextField from '@material-ui/core/TextField'

import estimatorStore from './../store/EstimatorStore'

import AuthChecker from './../components/common/AuthChecker'
import CustomerInfo from './../components/CustomerInfo'
import EstimatorTool from './../components/EstimatorTool'
import CustomNote from './../components/CustomNote'
import TotalEstimate from './../components/TotalEstimate'
import Quote from './../components/Quote'

const EstimatorPage = (props) => {
  const [showQuote, setShowQuote] = useState(false)
  const [drafting, setDrafting] = useState(false)

  useEffect(() => {
    estimatorStore.resetStore()
  }, [])

  return (
    <Observer>
      {() => (
        <AuthChecker
          children={
            <div>
              {showQuote ? (
                <QuotePanel setShowQuote={setShowQuote} drafting={drafting} />
              ) : (
                <EstimateTool
                  setShowQuote={setShowQuote}
                  setDrafting={setDrafting}
                  parentProps={props}
                />
              )}
            </div>
          }
        />
      )}
    </Observer>
  )
}

const EstimateTool = ({ setShowQuote, setDrafting, parentProps }) => {
  useEffect(() => {
    estimatorStore.setCreatedAt(dayjs().startOf('day').unix())
  }, [])

  return (
    <Observer>
      {() => (
        <div style={{ marginTop: '20px' }}>
          <Container fixed>
            <Typography variant='h4' align='center' gutterBottom>
              Estimator Tool
            </Typography>
            <CustomerInfo context={'ESTIMATE'} />
            {(!parentProps.location?.state?.editMode || parentProps.location?.state?.duplicate) && (
              <div style={{ marginTop: 20, textAlign: 'right' }}>
                <TextField
                  label='Estimate Date'
                  value={dayjs.unix(estimatorStore.createdAt).format('YYYY-MM-DD')}
                  type='date'
                  onChange={(e) => {
                    estimatorStore.setCreatedAt(
                      dayjs(e.target.value, 'YYYY-MM-DD').startOf('day').unix()
                    )
                  }}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </div>
            )}
            <EstimatorTool />
            <CustomNote />
            <TotalEstimate context={'ESTIMATE'} />
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <Button
                variant='contained'
                style={{ marginRight: 10 }}
                onClick={() => {
                  setDrafting(true)
                  setShowQuote(true)
                }}
                disabled={Object.keys(estimatorStore.finalEstimates).length === 0}>
                {parentProps.location?.state?.editMode && !parentProps.location?.state?.duplicate
                  ? 'enregistrer les modifications'
                  : 'passer au brouillon'}
              </Button>
              <Button
                variant='contained'
                color='primary'
                onClick={() => {
                  setDrafting(false)
                  setShowQuote(true)
                }}
                disabled={Object.keys(estimatorStore.finalEstimates).length === 0}>
                générer Soumission
              </Button>
            </div>
          </Container>
        </div>
      )}
    </Observer>
  )
}

const QuotePanel = ({ setShowQuote, drafting }) => {
  return (
    <Observer>
      {() => (
        <div style={{ marginTop: '20px' }}>
          <Container fixed>
            <div
              style={{
                textAlign: 'left',
                marginTop: '20px',
                marginBottom: '20px',
              }}>
              <Button variant='contained' color='primary' onClick={() => setShowQuote(false)}>
                Back
              </Button>
            </div>
            <Quote context={'ESTIMATE'} drafting={drafting} />
          </Container>
        </div>
      )}
    </Observer>
  )
}

export default withRouter(EstimatorPage)
