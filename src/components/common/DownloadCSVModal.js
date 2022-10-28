import React, { useEffect, Fragment } from 'react'
import * as dayjs from 'dayjs'
import { Parser } from 'json2csv'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import { useTheme } from '@material-ui/core/styles'
import { DatePicker } from '@material-ui/pickers'
import Drawer from '@material-ui/core/Drawer'
import Button from '@material-ui/core/Button'
import Paper from '@material-ui/core/Paper'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import TextField from '@material-ui/core/TextField'
import GetAppIcon from '@material-ui/icons/GetApp'

import { Constants } from '../../scripts/constants'
import { showToast } from '../../scripts/localActions'
import { addNewEventLog } from '../../scripts/remoteActions'

import userStore from '../../store/UserStore'

const DownloadCSVModal = ({
  fromYear,
  toYear,
  setFromYear,
  setToYear,
  fromDateUnix,
  toDateUnix,
  setFromDateUnix,
  setToDateUnix,
  CSVData,
  setCSVData,
  fetchCSVDataFunc,
  title,
  fileName,
  onClose,
  isLoading,
  onlyYear,
}) => {
  const drawerPosition = 'bottom'
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  useEffect(() => {
    if (CSVData) {
      try {
        const json2csvParser = new Parser()
        const CSV = json2csvParser.parse(CSVData)
        const link = document.createElement('a')
        link.id = 'CSVDownloadLink'
        document.body.appendChild(link)
        const csvUrl = window.webkitURL.createObjectURL(new Blob([CSV], { type: 'text/csv' }))
        const formattedFileName = `${fileName}_${
          onlyYear ? dayjs(fromYear).get('year') : dayjs.unix(fromDateUnix).format('DD-MM-YYYY')
        }-${onlyYear ? dayjs(toYear).get('year') : dayjs.unix(toDateUnix).format('DD-MM-YYYY')}.csv`
        document.querySelector('#CSVDownloadLink').setAttribute('download', formattedFileName)
        document.querySelector('#CSVDownloadLink').setAttribute('href', csvUrl)
        document.querySelector('#CSVDownloadLink').click()
        document.body.removeChild(link)

        // Creating Event Log-------------------------------------------------------------------
        let targetType = Constants.Events.CSV_DOWNLOAD.Type
        let eventDesc = Constants.Events.CSV_DOWNLOAD.Desc
        let moreInfo = {
          prevObj: {},
          newObj: {
            fileName: formattedFileName,
            fileContent: JSON.stringify(CSVData),
          },
        }
        addNewEventLog(
          userStore.currentUser.id,
          userStore.currentUser.id,
          userStore.currentUser.id,
          targetType,
          eventDesc,
          moreInfo
        )
        //--------------------------------------------------------------------------------------

        setCSVData(null)
        showToast('Download Successfull!')
        onClose && onClose()
      } catch (err) {
        setCSVData(null)
        console.error(err)
        showToast('Something went wrong generating CSV', 'error')
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [CSVData])

  return (
    <Fragment>
      <Drawer anchor={drawerPosition} open={true} onClose={onClose}>
        <Paper
          className='center-flex-column'
          style={{ height: isMobile ? 400 : 300, overflow: 'hidden' }}>
          <Typography style={{ marginBottom: 50 }} variant='h4' align='center' gutterBottom>
            {title || 'Download CSV Panel'}
          </Typography>
          <Grid container spacing={0} style={{ marginBottom: 30 }}>
            <Grid item xs={12} sm={12} md={6}>
              <div
                style={{
                  textAlign: isMobile ? 'center' : 'right',
                  marginRight: isMobile ? 0 : 20,
                  marginBottom: isMobile ? 20 : 0,
                }}>
                {onlyYear ? (
                  <DatePicker
                    views={['year']}
                    label='Start Year'
                    value={fromYear}
                    onChange={setFromYear}
                  />
                ) : (
                  <TextField
                    label='Start Date'
                    value={dayjs.unix(fromDateUnix).format('YYYY-MM-DD')}
                    type='date'
                    onChange={(e) => {
                      setFromDateUnix(dayjs(e.target.value, 'YYYY-MM-DD').startOf('day').unix())
                    }}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                )}
              </div>
            </Grid>
            <Grid item xs={12} sm={12} md={6}>
              <div
                style={{ textAlign: isMobile ? 'center' : 'left', marginLeft: isMobile ? 0 : 20 }}>
                {onlyYear ? (
                  <DatePicker
                    views={['year']}
                    label='End Year'
                    value={toYear}
                    onChange={setToYear}
                  />
                ) : (
                  <TextField
                    label='End Date'
                    value={dayjs.unix(toDateUnix).format('YYYY-MM-DD')}
                    type='date'
                    onChange={(e) => {
                      setToDateUnix(dayjs(e.target.value, 'YYYY-MM-DD').endOf('day').unix())
                    }}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                )}
              </div>
            </Grid>
          </Grid>
          <Grid container spacing={0}>
            <Grid item xs={12}>
              <div style={{ textAlign: 'center' }}>
                <Button
                  variant='contained'
                  color='secondary'
                  disabled={isLoading}
                  onClick={() => fetchCSVDataFunc()}
                  startIcon={<GetAppIcon />}>
                  Download CSV
                </Button>
              </div>
            </Grid>
          </Grid>
        </Paper>
      </Drawer>
    </Fragment>
  )
}

export default DownloadCSVModal
