import prettyMilliseconds from 'pretty-ms'
import Resizer from 'react-image-file-resizer'
import * as EmailValidator from 'email-validator'
import { toast } from 'react-toastify'
import * as dayjs from 'dayjs'
import { StripChar } from 'stripchar'
import { removeStopwords } from 'stopword'
import phone from 'phone'

import { Constants } from './constants'

export const showToast = (msg = '', mode = 'success') => {
  if (mode === 'error') {
    return toast.error(msg, {
      position: 'top-right',
      autoClose: 4000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    })
  } else if (mode === 'warning') {
    return toast.warn(msg, {
      position: 'top-right',
      autoClose: 4000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    })
  } else if (mode === 'info') {
    return toast.info(msg, {
      position: 'top-right',
      autoClose: 4000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    })
  } else {
    return toast.success(msg, {
      position: 'top-right',
      autoClose: 4000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    })
  }
}

export const getRoundValEst = (val = 0, prevMultiplier) => {
  return Math.round((val * prevMultiplier + Number.EPSILON) * 100) / 100
}

export const round = (number, decimalPlaces) => {
  const factorOfTen = Math.pow(10, decimalPlaces)
  return Math.round(number * factorOfTen) / factorOfTen
}

export const precisionRound = (number, decimalPlaces) => {
  return Number(
    Math.round(parseFloat(number + 'e' + decimalPlaces)) + 'e-' + decimalPlaces
  ).toFixed(decimalPlaces)
}

export const getOrdinal = (day) => {
  if (day > 3 && day < 21) return 'th'
  switch (day % 10) {
    case 1:
      return 'st'
    case 2:
      return 'nd'
    case 3:
      return 'rd'
    default:
      return 'th'
  }
}

export const getMonth = (monthIndex) => {
  return [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ][monthIndex]
}

export const getDay = (dayIndex, short = false) => {
  if (short) {
    return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayIndex]
  } else {
    return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thrusday', 'Friday', 'Saturday'][dayIndex]
  }
}

export const getCustomTime = () => {
  let currentTime = dayjs().unix()
  let hourStart = dayjs().startOf('hour').unix()
  let fifteenthMin = dayjs().startOf('hour').add(15, 'minute').unix()
  let thirteethMin = dayjs().startOf('hour').add(30, 'minute').unix()
  let fortyfifthMin = dayjs().startOf('hour').add(45, 'minute').unix()
  let hourEnd = dayjs().endOf('hour').unix() + 1
  if (currentTime >= hourStart && currentTime <= fifteenthMin) {
    if (currentTime <= hourStart + 360) {
      return hourStart
    } else {
      return fifteenthMin
    }
  } else if (currentTime > fifteenthMin && currentTime <= thirteethMin) {
    if (currentTime <= fifteenthMin + 360) {
      return fifteenthMin
    } else {
      return thirteethMin
    }
  } else if (currentTime > thirteethMin && currentTime <= fortyfifthMin) {
    if (currentTime <= thirteethMin + 360) {
      return thirteethMin
    } else {
      return fortyfifthMin
    }
  } else if (currentTime > fortyfifthMin && currentTime <= hourEnd) {
    if (currentTime <= fortyfifthMin + 360) {
      return fortyfifthMin
    } else {
      return hourEnd
    }
  } else {
    return currentTime
  }
}

export const getSearchableKeywords = (string = '', limit = 2000) => {
  let searchableKeywords = []
  let strippedWord = StripChar.RSspecChar(string.toLowerCase(), '__').replace(/__/g, ' ')
  let words = [...new Set(removeStopwords(strippedWord.split(' ')))].filter((word) => word)
  words.forEach((word) => {
    let splits = word.split('').map((ch, i) => {
      if (i === 0) {
        return ch
      } else {
        let str = ''
        for (let j = 0; j <= i; j++) {
          str = str + word[j]
        }
        return str
      }
    })
    searchableKeywords.push(...splits)
  })
  words.forEach((word, i) => {
    if (i !== words.length - 1) {
      let splits = []
      for (let s = i + 1; s < words.length; s++) {
        if (splits.length === 0) {
          splits.push(word + ' ' + words[s])
        } else {
          splits.push(splits[splits.length - 1] + ' ' + words[s])
        }
      }
      searchableKeywords.push(...splits)
    }
  })
  return searchableKeywords.slice(0, limit)
}

export const getSearchingKeywords = (string = '') => {
  let strippedWord = StripChar.RSspecChar(string.toLowerCase(), '__').replace(/__/g, ' ')
  return [...new Set(removeStopwords(strippedWord.split(' ')))].filter((w) => w).slice(0, 10)
}

export const getArrayOfArrays = (originalArray, chunkSize) => {
  const arrayOfArrays = []
  for (let i = 0; i < originalArray.length; i += chunkSize) {
    arrayOfArrays.push(originalArray.slice(i, i + chunkSize))
  }
  return arrayOfArrays
}

export const isEmail = (string = '') => {
  return EmailValidator.validate(string)
}

export const isPhoneNumber = (string = '') => {
  if (phone(string) && phone(string).length !== 0) {
    return true
  }
  return false
}

export const isNumeric = (string = '') => {
  if (typeof string != 'string') return false
  return !isNaN(string) && !isNaN(parseFloat(string))
}

export const calculatePriceWithoutTax = (allInfo, context = 'ESTIMATE', toDollarStr = true) => {
  if (context === 'ESTIMATE') {
    let price = 'Multiple products'
    if (allInfo && allInfo.totalDue) {
      let cal = allInfo.tableData.reduce((total, curr) => {
        return total + round(curr.priceWithoutTaxRaw[0] || 0, 2)
      }, 0)
      price = toDollarStr ? '$' + round(cal, 2) : round(cal, 2)
    }
    return price
  } else if (context === 'INVOICE') {
    let price = toDollarStr ? '$0' : 0
    if (allInfo && allInfo.totalDue) {
      let cal = allInfo.tableData.reduce((total, curr) => {
        return (
          total +
          round(
            (curr.priceTotalRaw[0] || 0) - (curr.gstTaxPrice[0] || 0) - (curr.qstTaxPrice[0] || 0),
            2
          )
        )
      }, 0)
      price = toDollarStr ? '$' + round(cal, 2) : round(cal, 2)
    }
    return price
  }
}

export const calculateTaxes = (allInfo, context = 'ESTIMATE') => {
  if (context === 'ESTIMATE') {
    let taxes = 'Multiple products'
    if (allInfo && allInfo.totalDue) {
      let cal = allInfo.tableData.reduce((total, curr) => {
        return total + round(curr.taxPrice[0] || 0, 2)
      }, 0)
      taxes = '$' + round(cal, 2)
    }
    return taxes
  } else if (context === 'INVOICE') {
    let taxes = '$0'
    let cal = allInfo.tableData.reduce((total, curr) => {
      return total + round((curr.gstTaxPrice[0] || 0) + (curr.qstTaxPrice[0] || 0), 2)
    }, 0)
    taxes = '$' + round(cal, 2)
    return taxes
  }
}

export const handleWeekChange = (action, weekStart, weekEnd, setWeekStart, setWeekEnd) => {
  if (action === 'prev') {
    setWeekEnd(dayjs.unix(weekStart).subtract(1, 'day').endOf('day').unix())
    setWeekStart((prevVal) => {
      return dayjs.unix(prevVal).subtract(1, 'week').startOf('day').unix()
    })
  } else if (action === 'next') {
    setWeekStart(dayjs.unix(weekEnd).add(1, 'day').startOf('day').unix())
    setWeekEnd((prevVal) => {
      return dayjs.unix(prevVal).add(1, 'week').endOf('day').unix()
    })
  }
}

export const getInitialWeekStart = (resetDay = Constants.ResetDay) => {
  // resetDay => 0: Sun, 1: Mon, 2: Tue, 3: Wed, 4: Thu, 5: Fri, 6: Sat
  return dayjs().unix() < dayjs().startOf('week').add(resetDay, 'days').startOf('day').unix()
    ? dayjs().subtract(1, 'week').startOf('week').add(resetDay, 'days').startOf('day').unix()
    : dayjs().startOf('week').add(resetDay, 'days').startOf('day').unix()
}

export const getInitialWeekEnd = (weekStart) => {
  return dayjs.unix(weekStart).add(1, 'week').subtract(1, 'day').endOf('day').unix()
}

export const getWeekRange = (dateUnix) => {
  let dayjsObj = dayjs.unix(dateUnix)
  let currMonth = dayjsObj.format('MMM')
  let date = dayjsObj.date()
  if (date >= 1 && date <= 7) {
    return `01 ${currMonth} - 07 ${currMonth}`
  } else if (date >= 8 && date <= 14) {
    return `08 ${currMonth} - 14 ${currMonth}`
  } else if (date >= 15 && date <= 21) {
    return `15 ${currMonth} - 21 ${currMonth}`
  } else {
    return `22 ${currMonth} - ${dayjsObj.endOf('month').get('date')} ${currMonth}`
  }
}

export const resizeFile = (file) => {
  return new Promise((resolve) => {
    Resizer.imageFileResizer(
      file,
      1000,
      1000,
      'JPEG',
      100,
      0,
      (uri) => {
        resolve(uri)
      },
      'file'
    )
  })
}

export const renameFile = (originalFile, newName) => {
  return new File([originalFile], newName, {
    type: originalFile.type,
    lastModified: originalFile.lastModified,
  })
}

export const toTitleCase = (str) => {
  return str.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  })
}

export const toCamelCase = (str) => {
  return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function (match, index) {
    if (+match === 0) return '' // or if (/\s+/.test(match)) for white spaces
    return index === 0 ? match.toLowerCase() : match.toUpperCase()
  })
}

export const truncateString = (str, num) => {
  if (str.length > num) {
    return str.slice(0, num) + '...'
  } else {
    return str
  }
}

export const numberWithCommas = (x) => {
  return x.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,')
}

export const getPrettyMs = (miliSec, vanilla = false) => {
  let formatedMs = prettyMilliseconds(miliSec)
  if (vanilla) {
    return formatedMs
  }
  if (formatedMs.indexOf('d') > -1) {
    let chunksByDays = formatedMs.split('d')
    let daysInHrs = parseInt(chunksByDays[0]) * 24
    if (formatedMs.indexOf('h') > -1) {
      let chunksByHours = chunksByDays[1].split('h')
      let additionalHrs = parseInt(chunksByHours[0])
      return `${daysInHrs + additionalHrs}h${chunksByHours[1]}`
    } else {
      return `${daysInHrs}h${chunksByDays[1]}`
    }
  }
  return formatedMs
}

export const asyncForEach = (array, callback, done) => {
  const runAndWait = (i) => {
    if (i === array.length) return done()
    return callback(array[i], () => runAndWait(i + 1))
  }
  return runAndWait(0)
}

export const constructEventDesc = (event, withClientInfo = false) => {
  let finalDesc = ''
  if (event.targetType === 'NEW_ESTIMATE_REQUEST') {
    finalDesc = withClientInfo
      ? `📩 ${event?.forInfo?.name} submitted new estimate request${
          event?.moreInfo?.newObj?.message ? ': ' + event?.moreInfo?.newObj?.message : ''
        }`
      : `📩 Submitted new estimate request${
          event?.moreInfo?.newObj?.message ? ': ' + event?.moreInfo?.newObj?.message : ''
        }`
  } else if (event.targetType === 'ESTIMATE_REQUEST_DELETED') {
    finalDesc = withClientInfo
      ? `📩🗑️ Deleted ${event?.forInfo?.name}'s estimate request${
          event?.moreInfo?.prevObj?.message ? ': ' + event?.moreInfo?.prevObj?.message : ''
        }`
      : `📩🗑️ Deleted estimate request${
          event?.moreInfo?.prevObj?.message ? ': ' + event?.moreInfo?.prevObj?.message : ''
        }`
  } else if (
    [
      'ESTIMATE_MOVE_FROM_SENT_TO_SOLD',
      'ESTIMATE_MOVE_FROM_SENT_TO_LOST',
      'ESTIMATE_MOVE_FROM_SENT_TO_SCHEDULED',
      'ESTIMATE_MOVE_FROM_SOLD_TO_SENT',
      'ESTIMATE_MOVE_FROM_SOLD_TO_LOST',
      'ESTIMATE_MOVE_FROM_SOLD_TO_SCHEDULED',
      'ESTIMATE_MOVE_FROM_LOST_TO_SENT',
      'ESTIMATE_MOVE_FROM_LOST_TO_SOLD',
      'ESTIMATE_MOVE_FROM_LOST_TO_SCHEDULED',
      'ESTIMATE_MOVE_FROM_SCHEDULED_TO_SENT',
      'ESTIMATE_MOVE_FROM_SCHEDULED_TO_SOLD',
      'ESTIMATE_MOVE_FROM_SCHEDULED_TO_LOST',
    ].includes(event.targetType)
  ) {
    finalDesc = withClientInfo
      ? `📜↔️ ${event?.forInfo?.name}'s estimate ${
          event?.moreInfo?.newObj.estimateNo ? `(${event?.moreInfo?.newObj.estimateNo})` : ''
        } worth ${calculatePriceWithoutTax(
          JSON.parse(event?.moreInfo?.newObj?.allInfo)
        )} (before tax) ${event.eventDesc}`
      : `📜↔️ Estimate ${
          event?.moreInfo?.newObj.estimateNo ? `(${event?.moreInfo?.newObj.estimateNo})` : ''
        } worth ${calculatePriceWithoutTax(
          JSON.parse(event?.moreInfo?.newObj?.allInfo)
        )} (before tax) ${event.eventDesc}`
  } else if (
    ['INVOICE_STATUS_CHANGE_TO_PAID', 'INVOICE_STATUS_CHANGE_TO_UNPAID'].includes(event.targetType)
  ) {
    let emoji = event.targetType === 'INVOICE_STATUS_CHANGE_TO_PAID' ? '💰📈' : '💸📉'
    finalDesc = withClientInfo
      ? `${emoji} ${event?.forInfo?.name}'s invoice (${
          event?.moreInfo?.newObj?.invoiceNo
        }) worth ${calculatePriceWithoutTax(
          JSON.parse(event?.moreInfo?.newObj?.allInfo),
          'INVOICE'
        )} (before tax) ${event.eventDesc}`
      : `${emoji} Invoice (${event?.moreInfo?.newObj?.invoiceNo}) worth ${calculatePriceWithoutTax(
          JSON.parse(event?.moreInfo?.newObj?.allInfo),
          'INVOICE'
        )} (before tax) ${event.eventDesc}`
  } else if (event.targetType === 'NEW_CLIENT_ADDED') {
    finalDesc = withClientInfo
      ? `👨➕ ${event?.forInfo?.name} added as new client `
      : `👨➕ Added as new client`
  } else if (event.targetType === 'CLIENT_INFO_EDITED') {
    finalDesc = withClientInfo ? `👨🖊️ ${event?.forInfo?.name}'s info edited` : `👨🖊️ Info edited`
  } else if (['CLIENT_DEACTIVATED', 'CLIENT_ACTIVATED'].includes(event.targetType)) {
    finalDesc = withClientInfo
      ? `👨 ${event?.forInfo?.name}'s ${event.eventDesc}`
      : `👨 ${event.eventDesc}`
  } else if (event.targetType === 'TIME_TRACK_RECORD_DELETED') {
    finalDesc = withClientInfo
      ? `⏲️🗑️ ${event?.forInfo?.nickname || event?.forInfo?.name}'s time track record worth $${
          event?.moreInfo?.prevObj?.totalSalary
        } deleted`
      : `⏲️🗑️ Time track record worth $${event?.moreInfo?.prevObj?.totalSalary} deleted`
  } else if (event.targetType === 'TIME_TRACK_RECORD_INFO_EDITED') {
    finalDesc = withClientInfo
      ? `⏲️🖊️ ${
          event?.forInfo?.nickname || event?.forInfo?.name
        }'s time track record info changed. Total Salary: $${
          event?.moreInfo?.prevObj?.totalSalary
        } -> $${event?.moreInfo?.newObj?.totalSalary} (old -> new)`
      : `⏲️🖊️ Time track record info changed. Total Salary: $${event?.moreInfo?.prevObj?.totalSalary} -> $${event?.moreInfo?.newObj?.totalSalary} (old -> new)`
  } else if (event.targetType === 'ADMIN_ADDED') {
    finalDesc = `🥷➕ New admin added: ${event?.forInfo?.nickname || event?.forInfo?.name}`
  } else if (event.targetType === 'ADMIN_REMOVED') {
    finalDesc = `🥷❌ Admin removed: ${event?.forInfo?.nickname || event?.forInfo?.name}`
  } else if (event.targetType === 'EMPLOYEE_SALARY_UPDATED') {
    finalDesc = withClientInfo
      ? `👷💰 ${event?.forInfo?.nickname || event?.forInfo?.name}'s salary changed from $${
          event?.moreInfo?.prevObj?.salary
        }/hr to $${event?.moreInfo?.newObj?.salary}/hr`
      : `👷💰 Salary changed from $${event?.moreInfo?.prevObj?.salary}/hr to $${event?.moreInfo?.newObj?.salary}/hr`
  } else if (event.targetType === 'EMPLOYEE_DEACTIVATED') {
    finalDesc = withClientInfo
      ? `👷🗑️ ${event?.forInfo?.nickname || event?.forInfo?.name}'s status changed to deactivated`
      : `👷🗑️ Status changed to deactivated`
  } else if (
    ['EXPENSE_DEACTIVATED', 'EXPENSE_APPROVED', 'EXPENSE_DISAPPROVED'].includes(event.targetType)
  ) {
    finalDesc = withClientInfo
      ? `🏭 ${event?.forInfo?.nickname || event?.forInfo?.name}'s expense ${
          event?.moreInfo?.newObj?.name
        } worth $${event?.moreInfo?.newObj?.totalAmount} ${event.eventDesc}`
      : `🏭 Expense worth $${event?.moreInfo?.newObj?.totalAmount} ${event.eventDesc}`
  } else if (event.targetType === 'NEW_ESTIMATE_GENERATED') {
    let tbt = calculatePriceWithoutTax(JSON.parse(event?.moreInfo?.newObj?.allInfo))
    finalDesc = withClientInfo
      ? `📜 New estimate ${
          event?.moreInfo?.newObj.estimateNo ? `(${event?.moreInfo?.newObj.estimateNo})` : ''
        } generated for ${event?.forInfo?.name} ${
          tbt === 'Multiple products'
            ? 'containing multiple products'
            : `totalling ${tbt} (before tax)`
        }`
      : `📜 New estimate ${
          event?.moreInfo?.newObj.estimateNo ? `(${event?.moreInfo?.newObj.estimateNo})` : ''
        } generated ${
          tbt === 'Multiple products'
            ? 'containing multiple products'
            : `totalling ${tbt} (before tax)`
        }`
  } else if (event.targetType === 'ESTIMATE_EDITED') {
    let prevTbt = calculatePriceWithoutTax(JSON.parse(event?.moreInfo?.prevObj?.allInfo))
    let newTbt = calculatePriceWithoutTax(JSON.parse(event?.moreInfo?.newObj?.allInfo))
    finalDesc = withClientInfo
      ? `📜 ${event?.forInfo?.name}'s estimate ${
          event?.moreInfo?.newObj.estimateNo ? `(${event?.moreInfo?.newObj.estimateNo})` : ''
        } edited from ${
          prevTbt === 'Multiple products'
            ? 'containing multiple products'
            : `totalling ${prevTbt} (before tax)`
        } to ${
          newTbt === 'Multiple products'
            ? 'containing multiple products'
            : `totalling ${newTbt} (before tax)`
        }`
      : `📜 Estimate ${
          event?.moreInfo?.newObj.estimateNo ? `(${event?.moreInfo?.newObj.estimateNo})` : ''
        } edited from ${
          prevTbt === 'Multiple products'
            ? 'containing multiple products'
            : `totalling ${prevTbt} (before tax)`
        } to ${
          newTbt === 'Multiple products'
            ? 'containing multiple products'
            : `totalling ${newTbt} (before tax)`
        }`
  } else if (event.targetType === 'ESTIMATE_EMAIL_SENT') {
    let tbt = calculatePriceWithoutTax(JSON.parse(event?.moreInfo?.newObj?.allInfo))
    finalDesc = withClientInfo
      ? `📜 Email sent to ${event?.forInfo?.name} with estimate ${
          event?.moreInfo?.newObj.estimateNo ? `(${event?.moreInfo?.newObj.estimateNo})` : ''
        } ${
          tbt === 'Multiple products'
            ? 'containing multiple products'
            : `totalling ${tbt} (before tax)`
        }`
      : `📜 Email sent with estimate ${
          event?.moreInfo?.newObj.estimateNo ? `(${event?.moreInfo?.newObj.estimateNo})` : ''
        } ${
          tbt === 'Multiple products'
            ? 'containing multiple products'
            : `totalling ${tbt} (before tax)`
        }`
  } else if (event.targetType === 'NEW_INVOICE_GENERATED') {
    finalDesc = withClientInfo
      ? `🧾 New invoice (${event?.moreInfo?.newObj?.invoiceNo}) generated for ${
          event?.forInfo?.name
        } totalling ${calculatePriceWithoutTax(
          JSON.parse(event?.moreInfo?.newObj?.allInfo),
          'INVOICE'
        )} (before tax)`
      : `🧾 New invoice (${
          event?.moreInfo?.newObj?.invoiceNo
        }) generated totalling ${calculatePriceWithoutTax(
          JSON.parse(event?.moreInfo?.newObj?.allInfo),
          'INVOICE'
        )} (before tax)`
  } else if (event.targetType === 'INVOICE_EDITED') {
    let prevTbt = calculatePriceWithoutTax(JSON.parse(event?.moreInfo?.prevObj?.allInfo), 'INVOICE')
    let newTbt = calculatePriceWithoutTax(JSON.parse(event?.moreInfo?.newObj?.allInfo), 'INVOICE')
    finalDesc = withClientInfo
      ? `🧾 ${event?.forInfo?.name}'s invoice (${event?.moreInfo?.newObj?.invoiceNo}) edited from totalling ${prevTbt} (before tax) to totalling ${newTbt} (before tax)`
      : `🧾 Invoice (${event?.moreInfo?.newObj?.invoiceNo}) edited from totalling ${prevTbt} (before tax) to totalling ${newTbt} (before tax)`
  } else if (event.targetType === 'INVOICE_DELETED') {
    let prevTbt = calculatePriceWithoutTax(JSON.parse(event?.moreInfo?.prevObj?.allInfo), 'INVOICE')
    finalDesc = withClientInfo
      ? `🧾🗑️ ${event?.forInfo?.name}'s unpaid invoice (${event?.moreInfo?.prevObj?.invoiceNo}) worth ${prevTbt} (before tax) Deleted`
      : `🧾🗑️ unpaid Invoice (${event?.moreInfo?.prevObj?.invoiceNo}) worth ${prevTbt} (before tax) Deleted`
  } else if (event.targetType === 'INVOICE_EMAIL_SENT') {
    finalDesc = withClientInfo
      ? `🧾 Email sent to ${event?.forInfo?.name} with invoice (${
          event?.moreInfo?.newObj?.invoiceNo
        }) totalling ${calculatePriceWithoutTax(
          JSON.parse(event?.moreInfo?.newObj?.allInfo),
          'INVOICE'
        )} (before tax)`
      : `🧾 Email sent with invoice (${
          event?.moreInfo?.newObj?.invoiceNo
        }) totalling ${calculatePriceWithoutTax(
          JSON.parse(event?.moreInfo?.newObj?.allInfo),
          'INVOICE'
        )} (before tax)`
  } else if (event.targetType === 'NEW_CUSTOM_CLIENT_NOTE') {
    finalDesc = withClientInfo
      ? `🗒️ Note added for ${event?.forInfo?.name}: ${event?.moreInfo?.newObj?.customNote}`
      : '🗒️' + event?.moreInfo?.newObj?.customNote
  } else if (event.targetType === 'CSV_DOWNLOAD') {
    finalDesc = `📥 Downloaded CSV File Named: ${event?.moreInfo?.newObj?.fileName}`
  } else if (event.targetType === 'ESTIMATE_SCHEDULED_DATE_CHANGED') {
    let newTbt = calculatePriceWithoutTax(JSON.parse(event?.moreInfo?.newObj?.allInfo))
    finalDesc = withClientInfo
      ? `📜⏲️🖊️ ${event?.forInfo?.name}'s estimate ${
          event?.moreInfo?.newObj.estimateNo ? `(${event?.moreInfo?.newObj.estimateNo})` : ''
        } ${
          newTbt === 'Multiple products'
            ? 'containing multiple products'
            : `totalling ${newTbt} (before tax)`
        } scheduled date shifted from ${event?.moreInfo?.prevObj?.scheduledFor} to ${
          event?.moreInfo?.newObj?.scheduledFor
        }`
      : `📜⏲️🖊️ Estimate ${
          event?.moreInfo?.newObj.estimateNo ? `(${event?.moreInfo?.newObj.estimateNo})` : ''
        } ${
          newTbt === 'Multiple products'
            ? 'containing multiple products'
            : `totalling ${newTbt} (before tax)`
        } scheduled date shifted from ${event?.moreInfo?.prevObj?.scheduledFor} to ${
          event?.moreInfo?.newObj?.scheduledFor
        }`
  } else if (event.targetType === 'NEW_JOB_ADDED') {
    finalDesc = `👔 New job added: ${event?.moreInfo?.newObj?.label}`
  } else if (event.targetType === 'JOB_UPDATED') {
    finalDesc = `👔🖊️ Job configs updated: ${event?.moreInfo?.newObj?.label}`
  } else if (event.targetType === 'JOB_DELETED') {
    finalDesc = `👔🗑️ Job deleted: ${event?.moreInfo?.prevObj?.label}`
  } else if (event.targetType === 'JOB_APPROVED') {
    finalDesc = `👔✅ Job approved: ${event?.forInfo?.nickname || event?.forInfo?.name} (${
      event?.moreInfo?.newObj?.job?.label
    })`
  } else if (event.targetType === 'JOB_DISAPPROVED') {
    finalDesc = `👔❌ Job Disapproved: ${event?.forInfo?.nickname || event?.forInfo?.name} (${
      event?.moreInfo?.newObj?.job?.label
    })`
  } else if (event.targetType === 'UPDATE_ASSIGNED_TO_FOR_ESTIMATE') {
    let newTbt = calculatePriceWithoutTax(JSON.parse(event?.moreInfo?.newObj?.allInfo))
    finalDesc = withClientInfo
      ? `📜👷 ${event?.forInfo?.name}'s estimate ${
          event?.moreInfo?.newObj.estimateNo ? `(${event?.moreInfo?.newObj.estimateNo})` : ''
        } ${
          newTbt === 'Multiple products'
            ? 'containing multiple products'
            : `totalling ${newTbt} (before tax)`
        } is now being assigned to ${event?.moreInfo?.newObj?.assignedToName} from ${
          event?.moreInfo?.prevObj?.assignedToName
        }`
      : `📜👷 Estimate ${
          event?.moreInfo?.newObj.estimateNo ? `(${event?.moreInfo?.newObj.estimateNo})` : ''
        } ${
          newTbt === 'Multiple products'
            ? 'containing multiple products'
            : `totalling ${newTbt} (before tax)`
        } is now being assigned to ${event?.moreInfo?.newObj?.assignedToName} from ${
          event?.moreInfo?.prevObj?.assignedToName
        }`
  } else if (event.targetType === 'UPDATE_ASSIGNED_TO_FOR_INVOICE') {
    finalDesc = withClientInfo
      ? `🧾👷 ${event?.forInfo?.name}'s invoice (${
          event?.moreInfo?.newObj?.invoiceNo
        }) totalling ${calculatePriceWithoutTax(
          JSON.parse(event?.moreInfo?.newObj?.allInfo),
          'INVOICE'
        )} (before tax) is now being assigned to ${event?.moreInfo?.newObj?.assignedToName} from ${
          event?.moreInfo?.prevObj?.assignedToName
        }`
      : `🧾👷 Invoice (${event?.moreInfo?.newObj?.invoiceNo}) totalling ${calculatePriceWithoutTax(
          JSON.parse(event?.moreInfo?.newObj?.allInfo),
          'INVOICE'
        )} (before tax) is now being assigned to ${event?.moreInfo?.newObj?.assignedToName} from ${
          event?.moreInfo?.prevObj?.assignedToName
        }`
  } else if (event.targetType === 'UPDATE_ASSIGNED_TO_FOR_ESTIMATE_REQUEST') {
    finalDesc = withClientInfo
      ? `📩👷 ${event?.forInfo?.name}'s estimate request is assigned to ${event?.moreInfo?.newObj?.assignedToName}`
      : `📩👷 Estimate request is assigned to ${event?.moreInfo?.newObj?.assignedToName}`
  } else if (event.targetType === 'UPDATE_SCHEDULED_DATE_FOR_ESTIMATE_REQUEST') {
    finalDesc = withClientInfo
      ? `📩👷 ${event?.forInfo?.name}'s estimate request is scheduled for ${dayjs
          .unix(event?.moreInfo?.newObj?.scheduledFor)
          .format('DD-MM-YYYY')}`
      : `📩👷 Estimate request is scheduled for ${dayjs
          .unix(event?.moreInfo?.newObj?.scheduledFor)
          .format('DD-MM-YYYY')}`
  } else if (event.targetType === 'NEW_TEAM_ADDED') {
    finalDesc = `🧑‍🤝‍🧑 New team added: ${event?.moreInfo?.newObj?.label}`
  } else if (event.targetType === 'TEAM_UPDATED') {
    finalDesc = `🧑‍🤝‍🧑🖊️ Team configs updated: ${event?.moreInfo?.newObj?.label}`
  } else if (event.targetType === 'TEAM_DELETED') {
    finalDesc = `🧑‍🤝‍🧑🗑️ Team deleted: ${event?.moreInfo?.prevObj?.label}`
  }

  return toTitleCase(finalDesc)
}
