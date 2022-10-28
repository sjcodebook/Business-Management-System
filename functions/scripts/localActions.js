const stripchar = require('stripchar').StripChar
const sw = require('stopword')

const getMonthInFrench = (monthIndex) => {
  return [
    'janvier',
    'février',
    'mars',
    'avril',
    'mai',
    'juin',
    'juillet',
    'août',
    'septembre',
    'octobre',
    'novembre',
    'décembre',
  ][monthIndex]
}

const getSearchableKeywords = (string = '', limit = 2000) => {
  let searchableKeywords = []
  let strippedWord = stripchar.RSspecChar(string.toLowerCase(), '__').replace(/__/g, ' ')
  let words = [...new Set(sw.removeStopwords(strippedWord.split(' ')))].filter((word) => word)
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

module.exports = {
  getSearchableKeywords,
  getMonthInFrench,
}
