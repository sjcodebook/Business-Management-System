export const Constants = {
  ResetDay: 4, // 0: Sun, 1: Mon, 2: Tue, 3: Wed, 4: Thu, 5: Fri, 6: Sat
  CalendlyUrl: 'https://calendly.com/xxxxx/',
  UsersWithSendEmailAccess: ['abc@xyz.com'],
  jobsConfigs: {
    allPaths: {
      Tools: {
        id: 'Tools',
        label: 'Tools',
        selectable: true,
        routes: {
          Estimate: {
            id: 'Estimate',
            label: 'Estimator Tool',
            route: '/estimate',
            selectable: true,
          },
          Invoice: {
            id: 'Invoice',
            label: 'Invoice Tool',
            route: '/invoice',
            selectable: true,
          },
          Timer: {
            id: 'Timer',
            label: 'Track Timer Tool',
            route: '/timer',
            selectable: true,
          },
        },
      },
      Leads: {
        id: 'Leads',
        label: 'Leads',
        selectable: true,
        routes: {
          EstimatesRequest: {
            id: 'EstimatesRequest',
            label: 'Requests',
            route: '/estimates-requests',
            selectable: true,
          },
          AppointmentScheduled: {
            id: 'AppointmentScheduled',
            label: 'Appointment Scheduled',
            route: '/appointment-scheduled',
            selectable: true,
          },
          LeadsAssigned: {
            id: 'LeadsAssigned',
            label: 'Leads Assigned',
            route: '/leads-assigned',
            selectable: true,
          },
        },
      },
      Estimates: {
        id: 'Estimates',
        label: 'Estimates',
        selectable: true,
        routes: {
          EstimatesDraft: {
            id: 'EstimatesDraft',
            label: 'Draft',
            route: '/estimates-draft',
            selectable: true,
          },
          EstimatesSent: {
            id: 'EstimatesSent',
            label: 'Sent',
            route: '/estimates-sent',
            selectable: true,
          },
          Sold: {
            id: 'Sold',
            label: 'Sold',
            route: '/sold',
            selectable: true,
          },
          SaleLost: {
            id: 'SaleLost',
            label: 'Lost',
            route: '/sale-lost',
            selectable: true,
          },
          EstimatesScheduled: {
            id: 'EstimatesScheduled',
            label: 'Next Year',
            route: '/estimates-scheduled',
            selectable: true,
          },
        },
      },
      Invoices: {
        id: 'Invoices',
        label: 'Invoices',
        selectable: true,
        routes: {
          InvoicesDraft: {
            id: 'InvoicesDraft',
            label: 'Draft',
            route: '/invoices-draft',
            selectable: true,
          },
          InvoicesSent: {
            id: 'InvoicesSent',
            label: 'Sent',
            route: '/invoices-sent',
            selectable: true,
          },
          InvoicesPaid: {
            id: 'InvoicesPaid',
            label: 'Paid',
            route: '/invoices-paid',
            selectable: true,
          },
        },
      },
      ProjectPipeline: {
        id: 'ProjectPipeline',
        label: 'Project Pipeline',
        selectable: true,
        routes: {
          ProductionCalendar: {
            id: 'ProductionCalendar',
            label: 'Production Calendar',
            route: '/prod-calendar',
            selectable: true,
          },
        },
      },
      Others: {
        id: 'Others',
        label: 'Others',
        selectable: true,
        routes: {
          Clients: {
            id: 'Clients',
            label: 'Clients',
            route: '/clients',
            selectable: true,
          },
          Home: {
            id: 'Home',
            label: 'Home',
            route: '/',
            selectable: false,
          },
          Admin: {
            id: 'Admin',
            label: 'Home',
            route: '/admin',
            selectable: false,
          },
          Login: {
            id: 'Login',
            label: 'Login',
            route: '/login',
            selectable: false,
          },
          Profile: {
            id: 'Profile',
            label: 'My Profile',
            route: '/profile',
            selectable: false,
          },
          ContactInfo: {
            id: 'ContactInfo',
            label: 'Contacts',
            route: '/contact-info',
            selectable: false,
          },
          EstimatesRequestForm: {
            id: 'EstimatesRequestForm',
            label: 'Estimates Request Form',
            route: '/estimates-request-form',
            selectable: false,
          },
        },
      },
    },
    defaultPaths: ['Home', 'Timer'],
    allCards: {
      SalesChart: {
        id: 'SalesChart',
        label: 'Sales Chart',
        selectable: true,
      },
      RevenueChart: {
        id: 'RevenueChart',
        label: 'Revenue Chart',
        selectable: true,
      },
    },
    allActions: {
      AccessOthersData: {
        id: 'AccessOthersData',
        label: "Can Access Other's data",
        selectable: true,
      },
      AssignableToLeads: {
        id: 'AssignableToLeads',
        label: 'Can Be Assigned Leads',
        selectable: true,
      },
    },
  },
  multipliers: {
    gst: 1.05,
    qst: 1.09975,
    tax: 1.14975,
    kitchenCabinets: {
      clientSC: 75,
      clientDA: 85,
      all: 100,
    },
    residentialRegular: {
      oneSheen: {
        floor: 2.35,
        wall: 0.55,
      },
      twoSheens: {
        floor: 2.6,
        wall: 0.65,
      },
      threeSheens: {
        floor: 3,
        wall: 0.9,
      },
      primerOneSheen: {
        floor: 3.25,
        wall: 0.7,
      },
      primerTwoSheens: {
        floor: 3.5,
        wall: 0.9,
      },
      primerThreeSheens: {
        floor: 3.85,
        wall: 1,
      },
      ceiling: {
        threshold: 9,
        increment: 0.1, //10%
      },
    },
    commercialRegular: {
      oneSheen: {
        floor: 2.35,
        wall: 0.55,
      },
      twoSheens: {
        floor: 2.6,
        wall: 0.65,
      },
      threeSheens: {
        floor: 3,
        wall: 0.9,
      },
      primerOneSheen: {
        floor: 3.25,
        wall: 0.7,
      },
      primerTwoSheens: {
        floor: 3.5,
        wall: 0.9,
      },
      primerThreeSheens: {
        floor: 3.85,
        wall: 1,
      },
      ceiling: {
        threshold: 9,
        increment: 0.1, //10%
      },
    },
    metalIronWrought: {
      easy: {
        steps: 75,
        railings: 63,
      },
      medium: {
        steps: 77,
        railings: 65,
      },
      hard: {
        steps: 80,
        railings: 70,
      },
    },
    woodIronWrought: {
      easy: {
        steps: 75,
        railings: 63,
      },
      medium: {
        steps: 77,
        railings: 65,
      },
      hard: {
        steps: 80,
        railings: 70,
      },
    },
    houseSiding: {
      oneSheen: 2.35,
      twoSheens: 2.6,
      threeSheens: 3,
      primerOneSheen: 3.25,
      primerTwoSheens: 3.5,
      primerThreeSheens: 3.85,
    },
    commercialExterior: {
      oneSheen: 2.35,
      twoSheens: 2.6,
      threeSheens: 3,
      primerOneSheen: 3.25,
      primerTwoSheens: 3.5,
      primerThreeSheens: 3.85,
    },
  },
  EstimateStatus: {
    SALE_LOST: 'Lost',
    SCHEDULED: 'Next Year',
    SOLD: 'Sold',
    NONE: 'Sent',
  },
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
    ESTIMATE_MOVE_FROM_SENT_TO_SCHEDULED: {
      Type: 'ESTIMATE_MOVE_FROM_SENT_TO_SCHEDULED',
      Desc: 'Moved from SENT to SCHEDULED',
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
    ESTIMATE_MOVE_FROM_SOLD_TO_SCHEDULED: {
      Type: 'ESTIMATE_MOVE_FROM_SOLD_TO_SCHEDULED',
      Desc: 'Moved from SOLD to SCHEDULED',
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
    ESTIMATE_MOVE_FROM_LOST_TO_SCHEDULED: {
      Type: 'ESTIMATE_MOVE_FROM_LOST_TO_SCHEDULED',
      Desc: 'Moved from LOST to SCHEDULED',
      ValidFor: 'CLIENT',
    },
    ESTIMATE_MOVE_FROM_SCHEDULED_TO_SENT: {
      Type: 'ESTIMATE_MOVE_FROM_SCHEDULED_TO_SENT',
      Desc: 'Moved from SCHEDULED to SENT',
      ValidFor: 'CLIENT',
    },
    ESTIMATE_MOVE_FROM_SCHEDULED_TO_SOLD: {
      Type: 'ESTIMATE_MOVE_FROM_SCHEDULED_TO_SOLD',
      Desc: 'Moved from SCHEDULED to SOLD',
      ValidFor: 'CLIENT',
    },
    ESTIMATE_MOVE_FROM_SCHEDULED_TO_LOST: {
      Type: 'ESTIMATE_MOVE_FROM_SCHEDULED_TO_LOST',
      Desc: 'Moved from SCHEDULED to LOST',
      ValidFor: 'CLIENT',
    },
    ESTIMATE_SCHEDULED_DATE_CHANGED: {
      Type: 'ESTIMATE_SCHEDULED_DATE_CHANGED',
      Desc: 'Estimate scheduled date changed',
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
    ADMIN_ADDED: {
      Type: 'ADMIN_ADDED',
      Desc: 'New admin added',
      ValidFor: 'EMPLOYEE',
    },
    ADMIN_REMOVED: {
      Type: 'ADMIN_REMOVED',
      Desc: 'New admin removed',
      ValidFor: 'EMPLOYEE',
    },
    JOB_APPROVED: {
      Type: 'JOB_APPROVED',
      Desc: 'Job approved',
      ValidFor: 'EMPLOYEE',
    },
    JOB_DISAPPROVED: {
      Type: 'JOB_DISAPPROVED',
      Desc: 'Job disapproved',
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
    INVOICE_DELETED: {
      Type: 'INVOICE_DELETED',
      Desc: 'Invoice deleted',
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
    CSV_DOWNLOAD: {
      Type: 'CSV_DOWNLOAD',
      Desc: 'Downloaded CSV file',
      ValidFor: 'EMPLOYEE',
    },
    NEW_JOB_ADDED: {
      Type: 'NEW_JOB_ADDED',
      Desc: 'New job added',
      ValidFor: 'EMPLOYEE',
    },
    JOB_UPDATED: {
      Type: 'JOB_UPDATED',
      Desc: 'Job updated',
      ValidFor: 'EMPLOYEE',
    },
    JOB_DELETED: {
      Type: 'JOB_DELETED',
      Desc: 'Job deleted',
      ValidFor: 'EMPLOYEE',
    },
    UPDATE_ASSIGNED_TO_FOR_ESTIMATE: {
      Type: 'UPDATE_ASSIGNED_TO_FOR_ESTIMATE',
      Desc: 'Update assigned to for estimate',
      ValidFor: 'CLIENT',
    },
    UPDATE_ASSIGNED_TO_FOR_INVOICE: {
      Type: 'UPDATE_ASSIGNED_TO_FOR_INVOICE',
      Desc: 'Update assigned to for invoice',
      ValidFor: 'CLIENT',
    },
    UPDATE_ASSIGNED_TO_FOR_ESTIMATE_REQUEST: {
      Type: 'UPDATE_ASSIGNED_TO_FOR_ESTIMATE_REQUEST',
      Desc: 'Update assigned to for estimate request',
      ValidFor: 'CLIENT',
    },
    UPDATE_SCHEDULED_DATE_FOR_ESTIMATE_REQUEST: {
      Type: 'UPDATE_SCHEDULED_DATE_FOR_ESTIMATE_REQUEST',
      Desc: 'Update scheduled date for estimate request',
      ValidFor: 'CLIENT',
    },
    NEW_TEAM_ADDED: {
      Type: 'NEW_TEAM_ADDED',
      Desc: 'New team added',
      ValidFor: 'EMPLOYEE',
    },
    TEAM_UPDATED: {
      Type: 'TEAM_UPDATED',
      Desc: 'Team updated',
      ValidFor: 'EMPLOYEE',
    },
    TEAM_DELETED: {
      Type: 'TEAM_DELETED',
      Desc: 'Team deleted',
      ValidFor: 'EMPLOYEE',
    },
  },
}
