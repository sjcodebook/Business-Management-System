const functions = require('firebase-functions')
const admin = require('firebase-admin')

admin.initializeApp()

module.exports = {
  functions: functions,
  admin: admin,
}
