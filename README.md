![Banner Image](https://webbrainsmedia.com/static/0790bdbe3714edd11d90cf341fcc1983/cafad/cover.png 'Banner Image')

Original Blog Post Link Written By Me => https://webbrainsmedia.com/blogs/business-management-system

Hey everyone 👋

I am open sourcing my first freelancing project which is this business management system for a canadian painting company. Today, all his company's day to day operations which includes Payrolls, Expenses, Invoices generation, Estimates generation, Time Tracking, Production Calendar, client emailing etc... are managed by this system. So, yeah it's not a toy project and it's not a simple CRUD app either 😅 as its been used actively in real life scenerio 😉.

**I am open sourcing this project because i want to help other developers who are struggling to get their first freelancing client or first dev job. I want to help them by providing a ready to use project which they can use to show their skills to their clients or future employers and get their first client or first dev job.**

This project is built using ReactJS + Material UI for client side, firebase DB for data storage, firebase auth for authentication, firebase nodejs functions for Backend APIs and is hosted on Firebase Hosting.

You can view the project demo here on this <a href="https://business-manager.webbrainsmedia.com/" target="_blank">Demo Link</a>

```
Admin Login Credentials =>

Email: admin@example.com
Password: password
```

# Steps to run this project locally:

- Run `yarn` to install deps.
- Setup firebase and install firebase CLI
- Login into firebase CLI
- Run `yarn start` to run the client
- Run `yarn serve` to run firebase functions

# .env File Example

```
REACT_APP_FIREBASE_API_KEY=xxxxxxxxxxxxxxxx
REACT_APP_FIREBASE_AUTH_DOMAIN=xxxxxxxxxxxxxxxx
REACT_APP_FIREBASE_PROJECT_ID=xxxxxxxxxxxxxxxx
REACT_APP_FIREBASE_STORAGE_BUCKET=xxxxxxxxxxxxxxxx
REACT_APP_FIREBASE_MESSAGE_SENDER_ID=xxxxxxxxxxxxxxxx
REACT_APP_FIREBASE_APP_ID=xxxxxxxxxxxxxxxx
REACT_APP_SYSTEM_USER_ID=xxxxxxxxxxxxxxxx


REACT_APP_DEV_FIREBASE_API_KEY=xxxxxxxxxxxxxxxx
REACT_APP_DEV_FIREBASE_AUTH_DOMAIN=xxxxxxxxxxxxxxxx
REACT_APP_DEV_FIREBASE_PROJECT_ID=xxxxxxxxxxxxxxxx
REACT_APP_DEV_FIREBASE_STORAGE_BUCKET=xxxxxxxxxxxxxxxx
REACT_APP_DEV_FIREBASE_MESSAGE_SENDER_ID=xxxxxxxxxxxxxxxx
REACT_APP_DEV_FIREBASE_APP_ID=xxxxxxxxxxxxxxxx
REACT_APP_DEV_SYSTEM_USER_ID=xxxxxxxxxxxxxxxx
```


# All Project Features Listed Below:

### 1. <ins>_Authentication Screen_</ins>:

- The login system uses the firebase auth for user authentication.

![Authentication Screen](https://webbrainsmedia.com/static/5ce83f7959aafc535ca0735f4de07404/29114/auth-screen.png 'Authentication Screen')

### 2. <ins>_Profile Screen_</ins>:

- This screen shows basic user profile details.

![Profile Screen](https://webbrainsmedia.com/static/86c4afd7923dd26aec6ce903089cc1eb/29114/profile-screen.png 'Profile Screen')

- User can update his profile details from this screen.

![Edit Profile Screen](https://webbrainsmedia.com/static/18bb37c85deea2c1e4246455725c94cf/29114/edit-profile-screen.png 'Edit Profile Screen')

### 3. <ins>_User Groups Panel_</ins>:

- This panel allows the admin to create new user groups (jobs) and edit all the privileges of each user group (job) such as which path this user group can access or which graph or any specific data is visible to them.

![User Groups Panel](https://webbrainsmedia.com/static/30c7c2dd1491a1ca8ddf4116eccfc4e5/9cea8/user-groups-panel.png 'User Groups Panel')

![Edit User Groups Panel](https://webbrainsmedia.com/static/17c464dc9d4c68de2a1858e45dd40932/ddb6a/edit-user-groups-panel.png 'Edit User Groups Panel')

The user after signing up for the first time has to select his user group (job) from the list of jobs available in the system and only after approval from the admin, User can access the privileges of that selected user group (job).

![User Info Row](https://webbrainsmedia.com/static/d8ff6141c58d1d40848b14ebf1ae6945/712f7/user-info-row.png 'User Info Row')

![Edit User Job](https://webbrainsmedia.com/static/af7ecc3d81afca40438add43445a2444/b04e4/edit-user-job.png 'Edit User Job')

### 4. <ins>_Live Events Logs Panel_</ins>:

- This panel shows details of all the live events logs of the system in real time.

![Live Events Logs Panel](https://webbrainsmedia.com/static/ac0f04da24fab1776b56be861cc4777a/f09ab/live-events-logs-panel.png 'Live Events Logs Panel')

### 5. <ins>_Sales and Revenue Graphs Panel_</ins>:

- This panel shows the Sales and Revenue graphs in real time. You can also Toggle the graph in the dynamic business quarters format.

![Sales Days Graph Panel](https://webbrainsmedia.com/static/fe039872092d0b6232c5fc91fa4f69e0/f87c7/sales-days-graph.png 'Sales Days Graph Panel')

![Sales Days Graph Custom Range Panel](https://webbrainsmedia.com/static/b643d0a0ceed249f25c5c71be72f4f1a/5a791/sales-days-custom-range-graph.png 'Sales Days Graph Custom Range Panel')

![Revenue Days Graph Panel](https://webbrainsmedia.com/static/9b8fd68813fcd1408920cb3ebca21305/8affb/revenue-days-custom-range-graph.png 'Revenue Days Graph Panel')

![Revenue Days Graph Custom Range Panel](https://webbrainsmedia.com/static/926cc0cfa2e0d2f92833c18981b86891/f87c7/revenue-days-graph.png 'Revenue Days Graph Custom Range Panel')

![Sales Quarter Graph](https://webbrainsmedia.com/static/e2145c69c84009248a8d1e0e420093f9/5a791/sales-quarter-graph.png 'Sales Quarter Graph')

![Revenue Quarter Graph](https://webbrainsmedia.com/static/0debfde41f6453f3bed239511c7dde16/669eb/revenue-quarter-graph.png 'Revenue Quarter Graph')

### 6. <ins>_Salaries and Expenses Panel_</ins>:

- This panel shows details of all the calculated salaries and expenses for a particular time period in real time. You can also click on any card to get the detailed view.

![Salary and Expenses View](https://webbrainsmedia.com/static/d349105aba825ccc2f7198289fc37cc6/91608/salary-and-expenses-view.png 'Salary and Expenses View')

![Salary and Expenses Detail View](https://webbrainsmedia.com/static/9afb028a656da72f0da15a7d0b9dec47/a303f/salary-and-expenses-detail-view.png 'Salary and Expenses Detail View')

### 7. <ins>_Data Visualization Panel_</ins>:

- This panel visualizes some crucial business data in the form of graphs.

![Estimates Visualization](https://webbrainsmedia.com/static/d1eaf787f0d43943da6973c3df133c0a/18c13/estimates-visualization.png 'Estimates Visualization')

![Invoices Visualization](https://webbrainsmedia.com/static/e1f6ba1d56e313c6b056c6c424931a25/ad997/invoices-visualization.png 'Invoices Visualization')

![Business Visualization](https://webbrainsmedia.com/static/743934de86e1787b28437014ba9b643e/6bfd0/business-visualization.png 'Business Visualization')

### 8. <ins>_Multiple Data Searching Panels_</ins>:

- The user search panel allows to search for any user details or to show all user details in the system. You can also approve or disapprove assigned job for any user from this panel.

![User Search Panel](https://webbrainsmedia.com/static/45bdc550a81f1251e6fdf065b22ded6a/54bf4/user-search.png 'User Search Panel')

- The Expense search panel allows to search for any Expense details for a particular time period. You can also approve or disapprove any expense by any user from this panel.

![Expense Search Panel](https://webbrainsmedia.com/static/678c9965585df6aecb4fa197aa054d73/46e51/expense-search.png 'Expense Search Panel')

- The Time Tracking search panel allows to search for any user's time logs for a particular time period.

![Time Track Search Panel](https://webbrainsmedia.com/static/044c46f6e19848368c804a101329ff1a/6bfd0/time-track-search.png 'Time Track Search Panel')

- This panel allows you to search for the generated estimates.

![Estimate Search Panel](https://webbrainsmedia.com/static/8ef2dd85ee9c6402916a372a28e86857/00d43/estimate-search.png 'Estimate Search Panel')

- This panel allows you to search for the generated invoices.

![Invoice Search Panel](https://webbrainsmedia.com/static/564b77e4a641933650f073a94ce86e29/18c13/invoice-search.png 'Invoice Search Panel')

### 9. <ins>_Time Tracking Tool For Employees_</ins>:

- This tool allows employees to log their login and logout time for a particular day. Employees can also add any expenses they have made onbehalf of the company for reimbursement and when the admin approves the expenses, the amount gets add up in their calculated payroll for the week.

![Time Tracker Tool](https://webbrainsmedia.com/static/80394feec19c930f8cc7f9c5d210fce2/29114/time-tracker-tool.png 'Time Tracker Tool')

### 10. <ins>_Estimate Generator_</ins>:

- This tool allows the admin to generate custom estimate pdf for the clients. The admin can also send the generated estimate to the client via email in the app itself.

![Estimate Generator](https://webbrainsmedia.com/static/1bb435ad8d4e9f4c24f601a3447deb81/29114/estimator-tool.png 'Estimate Generator')

### 11. <ins>_Invoice Generator_</ins>:

- This tool allows the admin to generate custom invoice pdf for the clients. The admin can also send the generated invoice to the client via email in the app itself.

![Invoice Generator](https://webbrainsmedia.com/static/4765df062cd23be8046463de542ed62e/29114/invoice-tool.png 'Invoice Generator')

### 12. <ins>_Client's Project Lifecycle_</ins>:

- Please checkout the flow diagram below to understand what goes on in the whole project lifecycle. I have also attatched all the tabs and tools that are used in the whole process.

![Client's Project Lifecycle](https://webbrainsmedia.com/static/126b5beeb8d623f61aa175559fa93c05/f79fa/client-project-lifecycle.png 'Client's Project Lifecycle')

![Funnel Menu Drawer](https://webbrainsmedia.com/static/5630e4f070ed5f089fe9921489487786/a9af1/funnel-menu-drawer.png 'Funnel Menu Drawer')

![Estimates Requests Tab](https://webbrainsmedia.com/static/cbccfba83bea01615ef26e24ee18c972/29114/estimates-request-tab.png 'Estimates Requests Tab')

![Leads Assigned Tab](https://webbrainsmedia.com/static/2b4f80d4d1c699d68e8700b46b5d7dbc/29114/leads-assigned-tab.png 'Leads Assigned Tab')

![Appointment Scheduled Tab](https://webbrainsmedia.com/static/1629368331ee889b2abf4f3e48a14e27/29114/appointment-scheduled-tab.png 'Appointment Scheduled Tab')

![Estimates Draft Tab](https://webbrainsmedia.com/static/da17ddc8d702766dfbd126cd038851d8/29114/draft-estimates-tab.png 'Estimates Draft Tab')

![Estimates Sent Tab](https://webbrainsmedia.com/static/ea8c4d04803a981069fd4777fc1adc17/29114/estimates-sent-tab.png 'Estimates Sent Tab')

![Estimates Sold Tab](https://webbrainsmedia.com/static/d74af4489d27ca5670fb4fa294351651/29114/sold-estimates-tab.png 'Estimates Sold Tab')

![Estimates Lost Tab](https://webbrainsmedia.com/static/49f003ceb520484595243871548ef3f0/29114/sale-lost-estimates-tab.png 'Estimates Lost Tab')

![Estimates Scheduled Tab](https://webbrainsmedia.com/static/0a3671aa52861ab05d950908bec40624/29114/estimates-scheduled-tab.png 'Estimates Scheduled Tab')

![Invoices draft Tab](https://webbrainsmedia.com/static/4be231e6d9f9cff9cd5d70b94af6c324/29114/draft-invoices-tab.png 'Invoices draft Tab')

![Invoices Sent Tab](https://webbrainsmedia.com/static/7479cf3d4241327cf9def78df3d68afe/29114/invoices-sent-tab.png 'Invoices Sent Tab')

![Invoices Paid Tab](https://webbrainsmedia.com/static/dc8ecf0fb00aa7ff5d7652a05a6a2b95/29114/invoices-paid-tab.png 'Invoices Paid Tab')

![Clients Tab](https://webbrainsmedia.com/static/ae0e276d14f86b42256807b963d158bf/29114/clients-tab.png 'Clients Tab')

![Production Calendar](https://webbrainsmedia.com/static/7ff02649d2668ec0f91f971f4c2fbea8/29114/production-calendar.png 'Production Calendar')

### 13. <ins>_Dark Mode_</ins>:

- The app supports dark mode too!!

![Dark Mode](https://webbrainsmedia.com/static/6d7ce741628dfaced977137205d997f2/29114/dark-mode.png 'Dark Mode')

### 14. <ins>_Mobile Responsive_</ins>:

- The app is 100% mobile responsive as well!!

![Mobile Responsive](https://webbrainsmedia.com/static/e1918b98b0ac8227b23b84f514bb847d/29229/mobile-responsive.png 'Mobile Responsive')

# Full Admin Dashboard Screenshot =>

![Admin Dashboard](https://webbrainsmedia.com/static/215c2350d889198feac5ceaae651552d/29114/admin-dash-screenshot.png 'Admin Dashboard')

Thanks for reading this far. I hope you liked the app. If you have any suggestions or feedback, please feel free to reach out to me.

Cheers 🍻!!
