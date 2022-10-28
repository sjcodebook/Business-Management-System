const Constants = {
  gmailOauthCreds: {
    'abc@xyz.com': {
      EMAIL: 'abc@xyz.com',
      REFRESH_TOKEN: 'xxxxxxxxxxxxx',
      CLIENT_SECRET: 'xxxxxxxxxxxxx',
      CLIENT_ID: 'xxxxxxxxxxxxx',
    },
  },
  SigData: {
    DEFAULT: {
      Name: 'ABC XYZ',
      Email: 'abc@xyz.com',
      Phone: '(000) 000-00000',
      Address: 'xxxxxxxxxxxx',
      ShowEndNote: true,
    },
  },
  SystemUserId: 'xxxxxxxxxxxx',
  Events: {
    NEW_ESTIMATE_REQUEST: {
      Type: 'NEW_ESTIMATE_REQUEST',
      Desc: 'New Estimate Request Submitted',
      ValidFor: 'CLIENT',
    },
    ESTIMATE_REQUEST_DELETED: {
      Type: 'ESTIMATE_REQUEST_DELETED',
      Desc: 'Estimate Request Deleted',
      ValidFor: 'CLIENT',
    },
    ESTIMATE_MOVE_FROM_SENT_TO_SOLD: {
      Type: 'ESTIMATE_MOVE_FROM_SENT_TO_SOLD',
      Desc: 'Moved from SENT to SOLD',
      ValidFor: 'CLIENT',
    },
    ESTIMATE_MOVE_FROM_SENT_TO_LOST: {
      Type: 'ESTIMATE_MOVE_FROM_SENT_TO_LOST',
      Desc: 'Moved from SENT to LOST',
      ValidFor: 'CLIENT',
    },
    ESTIMATE_MOVE_FROM_SOLD_TO_SENT: {
      Type: 'ESTIMATE_MOVE_FROM_SOLD_TO_SENT',
      Desc: 'Moved from SOLD to SENT',
      ValidFor: 'CLIENT',
    },
    ESTIMATE_MOVE_FROM_SOLD_TO_LOST: {
      Type: 'ESTIMATE_MOVE_FROM_SOLD_TO_LOST',
      Desc: 'Moved from SOLD to LOST',
      ValidFor: 'CLIENT',
    },
    ESTIMATE_MOVE_FROM_LOST_TO_SENT: {
      Type: 'ESTIMATE_MOVE_FROM_LOST_TO_SENT',
      Desc: 'Moved from LOST to SENT',
      ValidFor: 'CLIENT',
    },
    ESTIMATE_MOVE_FROM_LOST_TO_SOLD: {
      Type: 'ESTIMATE_MOVE_FROM_LOST_TO_SOLD',
      Desc: 'Moved from LOST to SOLD',
      ValidFor: 'CLIENT',
    },
    INVOICE_STATUS_CHANGE_TO_PAID: {
      Type: 'INVOICE_STATUS_CHANGE_TO_PAID',
      Desc: 'Marked as paid',
      ValidFor: 'CLIENT',
    },
    INVOICE_STATUS_CHANGE_TO_UNPAID: {
      Type: 'INVOICE_STATUS_CHANGE_TO_UNPAID',
      Desc: 'Marked as unpaid',
      ValidFor: 'CLIENT',
    },
    NEW_CLIENT_ADDED: {
      Type: 'NEW_CLIENT_ADDED',
      Desc: 'New client added',
      ValidFor: 'CLIENT',
    },
    CLIENT_INFO_EDITED: {
      Type: 'CLIENT_INFO_EDITED',
      Desc: 'Info changed',
      ValidFor: 'CLIENT',
    },
    CLIENT_DEACTIVATED: {
      Type: 'CLIENT_DEACTIVATED',
      Desc: 'Status changed to deactivated',
      ValidFor: 'CLIENT',
    },
    CLIENT_ACTIVATED: {
      Type: 'CLIENT_ACTIVATED',
      Desc: 'Status changed to activated',
      ValidFor: 'CLIENT',
    },
    TIME_TRACK_RECORD_DELETED: {
      Type: 'TIME_TRACK_RECORD_DELETED',
      Desc: 'Time track record deleted',
      ValidFor: 'EMPLOYEE',
    },
    TIME_TRACK_RECORD_INFO_EDITED: {
      Type: 'TIME_TRACK_RECORD_INFO_EDITED',
      Desc: 'Time track record info changed',
      ValidFor: 'EMPLOYEE',
    },
    EMPLOYEE_SALARY_UPDATED: {
      Type: 'EMPLOYEE_SALARY_UPDATED',
      Desc: 'Employee salary changed',
      ValidFor: 'EMPLOYEE',
    },
    EMPLOYEE_DEACTIVATED: {
      Type: 'EMPLOYEE_DEACTIVATED',
      Desc: 'Employee status changed to deactivated',
      ValidFor: 'EMPLOYEE',
    },
    EXPENSE_DEACTIVATED: {
      Type: 'EXPENSE_DEACTIVATED',
      Desc: 'Deleted',
      ValidFor: 'EMPLOYEE',
    },
    EXPENSE_APPROVED: {
      Type: 'EXPENSE_APPROVED',
      Desc: 'Approved',
      ValidFor: 'EMPLOYEE',
    },
    EXPENSE_DISAPPROVED: {
      Type: 'EXPENSE_DISAPPROVED',
      Desc: 'Disapproved',
      ValidFor: 'EMPLOYEE',
    },
    NEW_ESTIMATE_GENERATED: {
      Type: 'NEW_ESTIMATE_GENERATED',
      Desc: 'New estimate generated',
      ValidFor: 'CLIENT',
    },
    ESTIMATE_EDITED: {
      Type: 'ESTIMATE_EDITED',
      Desc: 'Estimate edited',
      ValidFor: 'CLIENT',
    },
    ESTIMATE_EMAIL_SENT: {
      Type: 'ESTIMATE_EMAIL_SENT',
      Desc: 'Estimate email sent successfully',
      ValidFor: 'CLIENT',
    },
    NEW_INVOICE_GENERATED: {
      Type: 'NEW_INVOICE_GENERATED',
      Desc: 'New invoice generated',
      ValidFor: 'CLIENT',
    },
    INVOICE_EDITED: {
      Type: 'INVOICE_EDITED',
      Desc: 'Invoice edited',
      ValidFor: 'CLIENT',
    },
    INVOICE_EMAIL_SENT: {
      Type: 'INVOICE_EMAIL_SENT',
      Desc: 'Invoice email sent successfully',
      ValidFor: 'CLIENT',
    },
    NEW_CUSTOM_CLIENT_NOTE: {
      Type: 'NEW_CUSTOM_CLIENT_NOTE',
      Desc: 'New client note added',
      ValidFor: 'CLIENT',
    },
  },
}

module.exports = Constants
