# **SOFTWARE REQUIREMENTS SPECIFICATION (SRS)**

# **Employee Management System (EMS)**

**Version:** 1.0

**Document Type:** Software Requirement Specification (SRS)

**Project Type:** Enterprise Web Application

---

# **1\. Introduction**

## **1.1 Purpose**

The purpose of this document is to define the functional and non-functional requirements for the Employee Management System (EMS). This document serves as the primary reference for business stakeholders, developers, testers, UI/UX designers, and project managers throughout the software development lifecycle.

The system will automate employee-related business processes, reduce manual work, improve operational efficiency, and provide centralized access to employee information.

---

## **1.2 Project Overview**

The Employee Management System is a web-based application designed to manage the complete employee lifecycle within an organization.

The system will provide separate portals for HR, Managers, Employees, and System Administrators, enabling secure access to employee information, attendance, leave management, payroll, performance tracking, company announcements, documents, and reports.

The application will maintain centralized employee records while providing role-based access to ensure data security and operational efficiency.

---

## **1.3 Objectives**

The system aims to:

* Digitize employee records.  
* Eliminate manual HR processes.  
* Improve employee self-service capabilities.  
* Automate attendance management.  
* Automate leave approval workflows.  
* Manage payroll efficiently.  
* Improve employee performance tracking.  
* Maintain organizational hierarchy.  
* Improve communication through announcements and notifications.  
* Generate accurate reports for management.  
  ---

  # **2\. Project Scope**

The Employee Management System shall provide the following functionalities:

* User Authentication  
* Dashboard  
* Employee Management  
* Department Management  
* Designation Management  
* Attendance Management  
* Leave Management  
* Shift Management  
* Holiday Management  
* Payroll Management  
* Performance Management  
* Recruitment Management  
* Asset Management  
* Employee Documents  
* Company Announcements  
* Reports  
* Notifications  
* User Management  
* System Settings  
* Audit Logs  
  ---

  # **3\. Target Users**

The application shall support the following users:

* Super Administrator  
* HR Administrator  
* Department Manager  
* Team Leader (Optional)  
* Employee  
* Finance/Payroll Executive (Optional)  
  ---

  # **4\. User Roles and Permissions**

  ## **4.1 Super Administrator**

  ### **Description**

The Super Administrator has unrestricted access to every module in the application.

### **Responsibilities**

* Create company profile  
* Manage all users  
* Configure system settings  
* Manage departments  
* Manage designations  
* Configure attendance policies  
* Configure leave policies  
* Configure payroll settings  
* Generate reports  
* View audit logs  
* Assign permissions  
* Manage master data  
  ---

  ## **4.2 HR Administrator**

  ### **Description**

Responsible for all employee-related activities.

### **Permissions**

* Add Employee  
* Edit Employee  
* Delete Employee  
* Activate Employee  
* Deactivate Employee  
* Approve Leave  
* Manage Attendance  
* Upload Employee Documents  
* Manage Holidays  
* Process Payroll  
* Generate HR Reports  
* Send Company Announcements  
  ---

  ## **4.3 Manager**

  ### **Description**

Responsible for managing employees within their reporting hierarchy.

### **Permissions**

* View Team Members  
* Approve Leave Requests  
* Reject Leave Requests  
* View Team Attendance  
* Submit Performance Reviews  
* Assign Goals  
* View Team Reports

Managers cannot:

* Delete employees  
* Process payroll  
* Modify company settings  
* Change department structures  
  ---

  ## **4.4 Employee**

  ### **Description**

Employees can access only their own information.

### **Permissions**

* View Personal Profile  
* Update Personal Information  
* Apply Leave  
* Cancel Leave (Before Approval)  
* View Attendance  
* Download Payslips  
* View Company Announcements  
* Upload Personal Documents  
* Update Bank Details (Subject to HR Approval)  
* Download Tax Documents

Employees cannot:

* View other employees' information  
* Approve leave  
* Generate payroll  
* Access administration modules  
  ---

  # **5\. Technology Stack**

| Layer | Technology |
| ----- | ----- |
| Frontend | React.js (Vite) |
| Styling | Tailwind CSS |
| Backend | PHP REST API |
| Database | MySQL |
| Authentication | JWT |
| File Storage | Local / Cloud Storage |
| API Testing | Postman |
| Version Control | Git |
| Deployment | Apache / Nginx |

  ---

  # **6\. Assumptions**

* Every employee will have a unique Employee ID.  
* Every employee will have a unique email address.  
* Every employee belongs to one department.  
* Every employee has one designation.  
* Every employee reports to one manager.  
* Attendance is maintained daily.  
* Payroll is processed monthly.  
* Employees can only access their own records.  
* HR has permission to modify employee information.  
* System administrators have unrestricted access.  
  ---

  # **7\. Constraints**

* Internet connection is required.  
* Browser-based application.  
* Responsive design for desktop and mobile.  
* Data shall be stored in MySQL.  
* Authentication shall be role-based.  
* Passwords shall be encrypted.  
* Audit logs shall be maintained.  
  ---

  # **8\. Business Goals**

The application should:

* Reduce HR manual work by at least 80%.  
* Improve employee productivity.  
* Reduce paperwork.  
* Improve reporting accuracy.  
* Improve approval turnaround time.  
* Maintain centralized employee information.  
* Increase data security.  
* Provide transparency in attendance and leave processes.  
  ---

  # **9\. High-Level Modules**

The application consists of the following modules:

1. Authentication  
2. Dashboard  
3. Employee Management  
4. Department Management  
5. Designation Management  
6. Attendance Management  
7. Leave Management  
8. Shift Management  
9. Holiday Management  
10. Payroll Management  
11. Performance Management  
12. Recruitment Management  
13. Asset Management  
14. Employee Documents  
15. Announcements  
16. Reports  
17. Notifications  
18. User Management  
19. Settings  
20. Audit Logs

# **10\. Module 1 – Authentication**

## **10.1 Module Overview**

The Authentication module is responsible for verifying user identity and providing secure access to the Employee Management System. Every user must authenticate before accessing the application.

---

# **10.2 Actors**

* Super Admin  
* HR Admin  
* Manager  
* Employee

---

# **10.3 Features**

* Login  
* Logout  
* Forgot Password  
* Reset Password  
* Change Password  
* Remember Me  
* Session Management  
* Role-Based Access  
* Account Locking  
* Password Encryption

---

# **10.4 Login**

## **Description**

Users can log in using their registered email address and password.

### **Required Fields**

| Field | Type | Mandatory |
| ----- | ----- | ----- |
| Email | Email | Yes |
| Password | Password | Yes |

### **Validations**

* Email cannot be empty.  
* Password cannot be empty.  
* Email must be in valid format.  
* Password is case-sensitive.  
* Inactive users cannot log in.  
* Deleted users cannot log in.

### **Business Rules**

* Passwords must be encrypted in the database.  
* JWT token shall be generated after successful login.  
* Login time shall be recorded.  
* Last login shall be updated.  
* User role shall determine accessible modules.

### **Success Message**

Login Successful.

### **Error Messages**

* Invalid Email Address.  
* Incorrect Password.  
* Account Disabled.  
* Session Expired.  
* User Not Found.

---

# **10.5 Forgot Password**

## **Description**

Users can reset their password if forgotten.

### **Workflow**

User enters registered email

↓

System verifies email

↓

OTP or Reset Link sent

↓

User verifies

↓

Creates new password

↓

Login using new password

### **Business Rules**

* Reset link expires after 15 minutes.  
* Link can be used only once.  
* Previous passwords cannot be reused (last 5).

---

# **10.6 Change Password**

Users can change password after login.

### **Required Fields**

* Current Password  
* New Password  
* Confirm Password

### **Validation**

* Current password must match.  
* New password and confirm password must match.  
* Password must contain:  
  * Minimum 8 characters  
  * One uppercase letter  
  * One lowercase letter  
  * One number  
  * One special character

---

# **10.7 Logout**

### **Description**

Terminates user session.

### **Business Rules**

* JWT token becomes invalid.  
* User redirected to Login page.  
* Session history recorded.

---

# **10.8 Session Management**

* Session timeout after 30 minutes of inactivity.  
* Multiple login sessions configurable.  
* Auto logout on timeout.  
* Refresh token support.

---

# **10.9 Acceptance Criteria**

* User can login successfully.  
* Invalid credentials display proper error.  
* Password reset works.  
* Logout terminates session.  
* Unauthorized users cannot access protected pages.

---

# **11\. Module 2 – Dashboard**

## **11.1 Module Overview**

The Dashboard provides role-specific information, KPIs, pending actions, and shortcuts immediately after login.

Each role will have a customized dashboard.

---

# **11.2 Dashboard Types**

* Super Admin Dashboard  
* HR Dashboard  
* Manager Dashboard  
* Employee Dashboard

---

# **11.3 Super Admin Dashboard**

### **Widgets**

* Total Employees  
* Active Employees  
* Inactive Employees  
* New Joiners  
* Employees on Leave  
* Today's Attendance  
* Attendance Percentage  
* Monthly Payroll Status  
* Total Departments  
* Total Designations  
* Company Announcements  
* Pending Approvals

### **Charts**

* Employee Growth  
* Attendance Trend  
* Department Distribution  
* Leave Statistics

---

# **11.4 HR Dashboard**

### **Widgets**

* New Employees  
* Pending Leave Requests  
* Today's Attendance  
* Upcoming Birthdays  
* Upcoming Work Anniversaries  
* Missing Attendance  
* Pending Document Verification  
* Payroll Status  
* Employee Count by Department

Quick Actions

* Add Employee  
* Approve Leave  
* Upload Announcement  
* Process Payroll

---

# **11.5 Manager Dashboard**

### **Widgets**

* Team Members  
* Team Attendance  
* Pending Leave Requests  
* Upcoming Birthdays  
* Performance Reviews Pending  
* Employees Working From Home

Quick Actions

* Approve Leave  
* View Team Attendance  
* Submit Performance Review

---

# **11.6 Employee Dashboard**

### **Widgets**

* Today's Attendance  
* Attendance Summary  
* Leave Balance  
* Pending Leave Requests  
* Upcoming Holidays  
* Recent Announcements  
* Assigned Assets  
* Upcoming Birthdays  
* Payslip Download  
* Profile Completion Percentage

Quick Actions

* Check In  
* Check Out  
* Apply Leave  
* Update Profile  
* Download Payslip

---

# **11.7 Dashboard Notifications**

Users shall receive notifications for:

* Leave Approval  
* Leave Rejection  
* Payroll Generated  
* Attendance Reminder  
* Birthday Wishes  
* Work Anniversary  
* Company Announcement  
* Document Expiry  
* Asset Return Reminder

---

# **11.8 Business Rules**

* Dashboard data shall be loaded according to the logged-in user's role.  
* Users shall only see data they are authorized to access.  
* Dashboard statistics shall update in real time or on refresh.  
* Pending approvals shall be displayed prominently.  
* Notifications shall be sorted by latest first.

---

# **11.9 Acceptance Criteria**

* Dashboard loads within 3 seconds.  
* Widgets display accurate information.  
* Users only see authorized data.  
* Notifications appear correctly.  
* Charts display current system data.

# **12\. Module 3 – Employee Management**

---

# **12.1 Module Overview**

The Employee Management module is the core component of the Employee Management System. It enables HR and authorized administrators to maintain the complete employee lifecycle from onboarding to exit.

This module stores personal, official, organizational, payroll, and document-related information for every employee.

---

# **12.2 Actors**

* Super Admin  
* HR Admin  
* Manager (View Only)  
* Employee (Own Profile Only)

---

# **12.3 Features**

* Add Employee  
* View Employee  
* Edit Employee  
* Delete/Deactivate Employee  
* Search Employee  
* Filter Employee  
* Employee Profile  
* Employee Documents  
* Employment History  
* Reporting Hierarchy  
* Employee Status  
* Import Employees  
* Export Employees

---

# **12.4 Employee List Screen**

The employee listing page shall display:

* Employee ID  
* Employee Name  
* Profile Photo  
* Department  
* Designation  
* Reporting Manager  
* Email  
* Mobile Number  
* Employment Type  
* Status  
* Date of Joining

### **Actions**

* View  
* Edit  
* Delete  
* Activate  
* Deactivate  
* Export

---

# **12.5 Search & Filters**

Users should be able to search employees using:

* Employee ID  
* Employee Name  
* Email  
* Mobile Number

Filters:

* Department  
* Designation  
* Employment Type  
* Reporting Manager  
* Status (Active/Inactive)  
* Joining Date  
* Location

Sorting:

* Employee Name  
* Employee ID  
* Joining Date  
* Department

---

# **12.6 Add Employee**

## **Description**

HR can register a new employee in the organization.

---

## **Personal Information**

| Field | Mandatory |
| ----- | ----- |
| First Name | Yes |
| Last Name | Yes |
| Gender | Yes |
| Date of Birth | Yes |
| Blood Group | No |
| Marital Status | No |
| Nationality | No |
| Personal Email | Yes |
| Mobile Number | Yes |
| Alternate Mobile | No |
| Emergency Contact | Yes |
| Address | Yes |

---

## **Official Information**

| Field | Mandatory |
| ----- | ----- |
| Employee ID | Auto Generated |
| Employee Code | Auto Generated |
| Company Email | Yes |
| Department | Yes |
| Designation | Yes |
| Reporting Manager | Yes |
| Branch | Yes |
| Location | Yes |
| Employment Type | Yes |
| Joining Date | Yes |
| Probation Period | Optional |
| Employee Status | Active |

---

## **Bank Details**

* Bank Name  
* Account Number  
* IFSC Code  
* Branch Name  
* Account Holder Name

---

## **Salary Details**

* Basic Salary  
* HRA  
* Allowances  
* Bonus  
* PF Number  
* ESI Number  
* Professional Tax  
* Salary Structure

---

## **Document Upload**

Employees may upload:

* Aadhaar Card  
* PAN Card  
* Passport  
* Driving License  
* Resume  
* Educational Certificates  
* Experience Certificates  
* Offer Letter  
* Appointment Letter  
* Relieving Letter

Supported Formats:

* PDF  
* JPG  
* JPEG  
* PNG

Maximum File Size:

10 MB per document.

---

# **12.7 Business Rules**

* Employee ID shall be generated automatically.  
* Company Email must be unique.  
* Personal Email cannot be duplicated.  
* Mobile Number cannot be duplicated.  
* Employee cannot report to themselves.  
* Every employee must belong to one department.  
* Every employee must have one designation.  
* Every employee shall have one reporting manager.  
* Only HR and Super Admin can create employees.  
* Managers cannot create employee records.  
* Deleted employees shall become "Inactive" instead of being permanently removed.

---

# **12.8 Validations**

First Name

* Mandatory  
* Minimum 2 characters  
* Maximum 50 characters

Last Name

* Mandatory  
* Alphabetic characters only

Email

* Mandatory  
* Valid email format  
* Unique

Mobile Number

* Exactly 10 digits  
* Numeric only  
* Unique

Joining Date

* Cannot be a future date unless creating a future joining record.

Date of Birth

* Employee must be at least 18 years old.

---

# **12.9 Edit Employee**

HR can update:

* Personal Details  
* Official Details  
* Bank Details  
* Salary Details  
* Documents

System shall record:

* Updated By  
* Updated Date  
* Previous Value  
* New Value

All updates must be stored in the Audit Log.

---

# **12.10 View Employee**

The profile page shall contain:

### **Personal Details**

* Name  
* Profile Photo  
* Gender  
* DOB  
* Contact Details

### **Official Details**

* Employee ID  
* Department  
* Designation  
* Reporting Manager  
* Joining Date  
* Employment Type

### **Attendance Summary**

* Present Days  
* Absent Days  
* Late Entries  
* Leave Taken

### **Leave Summary**

* Leave Balance  
* Leave History

### **Payroll Summary**

* Salary Structure  
* Latest Payslip

### **Documents**

* Uploaded Files  
* Verification Status

### **Assets**

* Laptop  
* Mobile  
* ID Card  
* Other Assigned Assets

---

# **12.11 Employee Status**

Possible statuses:

* Active  
* Inactive  
* Probation  
* Notice Period  
* Resigned  
* Terminated  
* Retired

Business Rule:

Inactive employees cannot log in.

---

# **12.12 Employee Import**

Supported Format:

Excel (.xlsx)

Fields Required:

* Employee Name  
* Department  
* Designation  
* Email  
* Mobile  
* Joining Date

Validation:

* Duplicate employees shall be rejected.  
* Invalid rows shall be displayed with error messages.

---

# **12.13 Employee Export**

Export Formats:

* Excel  
* PDF  
* CSV

Export should support:

* Current Page  
* Selected Employees  
* All Employees

---

# **12.14 Workflow**

HR Login

↓

Click "Add Employee"

↓

Enter Employee Details

↓

Upload Documents

↓

Assign Department

↓

Assign Designation

↓

Assign Reporting Manager

↓

Save Employee

↓

Employee ID Generated

↓

Welcome Email Sent

↓

Employee Receives Login Credentials

↓

Employee Completes Profile

---

# **12.15 Notifications**

The system shall notify:

Employee

* Welcome Email  
* Account Created  
* Password Setup

HR

* Employee Successfully Added

Manager

* New Team Member Assigned

---

# **12.16 Acceptance Criteria**

* HR can successfully create an employee.  
* Employee ID is generated automatically.  
* Duplicate email addresses are not allowed.  
* Duplicate mobile numbers are not allowed.  
* Employee appears in the Employee List immediately after creation.  
* Welcome email is sent successfully.  
* Audit log is created for every employee creation and update.  
* Unauthorized users cannot access employee management.

# **13\. Module 4 – Attendance Management**

---

# **13.1 Module Overview**

The Attendance Management module is responsible for recording and managing employee attendance. It enables employees to check in and check out, records working hours, tracks breaks, calculates late arrivals and overtime, and provides attendance reports for HR and management.

Attendance data shall be used for payroll processing, leave calculation, and performance analysis.

---

# **13.2 Actors**

* Super Admin  
* HR Admin  
* Manager  
* Employee

---

# **13.3 Features**

* Check In  
* Check Out  
* Break Start  
* Break End  
* Daily Attendance  
* Monthly Attendance  
* Attendance Calendar  
* Attendance History  
* Attendance Correction  
* Manual Attendance  
* Attendance Approval  
* Overtime Calculation  
* Attendance Reports

---

# **13.4 Attendance Status**

The system shall support the following attendance statuses:

* Present  
* Absent  
* Half Day  
* Late  
* Early Exit  
* Work From Home  
* On Leave  
* Holiday  
* Weekend  
* Missed Check-In  
* Missed Check-Out

---

# **13.5 Check In**

## **Description**

Employees can mark their attendance by clicking the **Check In** button.

### **Fields**

| Field | Auto / Manual |
| ----- | ----- |
| Employee ID | Auto |
| Employee Name | Auto |
| Date | Auto |
| Check-In Time | Auto |
| Location (Optional) | Auto |
| Device Information | Auto |

### **Business Rules**

* Employees can check in only once per day.  
* Check-in time is recorded automatically.  
* Duplicate check-ins are not allowed.  
* Check-in is allowed only for active employees.  
* Attendance record is created immediately after successful check-in.

---

# **13.6 Check Out**

Employees can mark the end of their working day.

### **Business Rules**

* Check-out is allowed only after check-in.  
* Check-out time is recorded automatically.  
* Total working hours are calculated.  
* Attendance record is updated after successful check-out.

---

# **13.7 Break Management**

Employees may record break times.

### **Features**

* Start Break  
* End Break

### **Business Rules**

* Break duration is deducted from total working hours.  
* Multiple breaks are allowed if enabled in system settings.  
* Total break time is displayed in attendance history.

---

# **13.8 Working Hours**

The system shall calculate:

* Total Working Hours  
* Total Break Time  
* Net Working Hours  
* Overtime Hours

Formula:

Net Working Hours \= (Check-Out Time \- Check-In Time) \- Break Duration

---

# **13.9 Attendance Calendar**

Employees shall be able to view monthly attendance in calendar format.

Each day shall display:

* Present  
* Absent  
* Leave  
* Holiday  
* Weekend  
* Half Day  
* Work From Home

---

# **13.10 Attendance History**

The attendance history page shall display:

* Date  
* Check-In Time  
* Check-Out Time  
* Break Duration  
* Working Hours  
* Attendance Status  
* Overtime  
* Remarks

Filters:

* Date Range  
* Month  
* Year  
* Attendance Status

---

# **13.11 Manual Attendance**

HR/Admin can manually add or modify attendance.

### **Reasons**

* Biometric Failure  
* Forgot Check-In  
* Forgot Check-Out  
* System Downtime  
* Official Duty  
* Remote Work Approval

Every manual modification shall require a reason and be recorded in the Audit Log.

---

# **13.12 Attendance Correction Request**

Employees can request attendance corrections.

### **Workflow**

Employee submits correction request

↓

Manager reviews request

↓

HR verifies

↓

Approved / Rejected

↓

Attendance updated (if approved)

---

# **13.13 Late Arrival Rules**

The system shall identify late arrivals based on shift timing.

Example:

Shift Start: 09:00 AM

Grace Time: 10 Minutes

If Check-In \> 09:10 AM

Status \= Late

---

# **13.14 Early Exit Rules**

Employees leaving before the minimum working hours shall be marked as **Early Exit**.

Example:

Required Working Hours: 8 Hours

Worked: 6 Hours

Status \= Early Exit

---

# **13.15 Overtime**

The system shall calculate overtime automatically.

Example Rule:

* Standard Working Hours \= 8 Hours  
* Additional Approved Hours \= Overtime

Only approved overtime shall be considered during payroll processing.

---

# **13.16 Attendance Reports**

Reports available:

* Daily Attendance Report  
* Monthly Attendance Report  
* Employee Attendance Report  
* Department Attendance Report  
* Late Arrival Report  
* Overtime Report  
* Missing Attendance Report

Export Formats:

* PDF  
* Excel  
* CSV

---

# **13.17 Notifications**

The system shall send notifications for:

* Missed Check-In  
* Missed Check-Out  
* Attendance Correction Approved  
* Attendance Correction Rejected  
* Late Arrival Warning  
* Overtime Approval

Notification Channels:

* In-App  
* Email (Optional)

---

# **13.18 Business Rules**

* Attendance can only be marked once per working day.  
* Employees cannot modify attendance directly.  
* Attendance corrections require approval.  
* Holidays and weekends are automatically marked.  
* Leave-approved days shall automatically appear as "On Leave".  
* Inactive employees cannot mark attendance.  
* Attendance records shall be retained for audit purposes.

---

# **13.19 Validations**

* Check-Out cannot occur before Check-In.  
* Break End cannot occur before Break Start.  
* Duplicate attendance records are not allowed.  
* Future dates cannot be selected for attendance.  
* Attendance corrections require a valid reason.

---

# **13.20 Acceptance Criteria**

* Employee can successfully check in and check out.  
* Working hours are calculated accurately.  
* Break time is deducted correctly.  
* Attendance status is updated automatically.  
* HR can approve or reject correction requests.  
* Reports display accurate attendance information.  
* Unauthorized users cannot modify attendance.  
* Every attendance modification is logged in the Audit Log.

# **14\. Module 5 – Leave Management**

---

# **14.1 Module Overview**

The Leave Management module enables employees to request leave, managers to review and approve requests, and HR to maintain leave policies and balances. The system shall automate leave calculations, approval workflows, and leave history while ensuring compliance with company policies.

---

# **14.2 Actors**

* Super Admin  
* HR Admin  
* Manager  
* Employee

---

# **14.3 Features**

* Leave Types Management  
* Leave Policy Configuration  
* Leave Balance Management  
* Apply Leave  
* Edit Leave Request (Before Approval)  
* Cancel Leave  
* Approve / Reject Leave  
* Leave Calendar  
* Leave History  
* Leave Reports  
* Leave Notifications

---

# **14.4 Leave Types**

The system shall support configurable leave types such as:

* Casual Leave (CL)  
* Sick Leave (SL)  
* Earned Leave (EL)  
* Maternity Leave  
* Paternity Leave  
* Marriage Leave  
* Bereavement Leave  
* Comp-Off  
* Work From Home (Optional)  
* Loss of Pay (LOP)

HR shall be able to create, edit, activate, or deactivate leave types.

---

# **14.5 Leave Balance**

The system shall maintain leave balances for each employee.

Example:

| Leave Type | Annual Allocation |
| ----- | ----- |
| Casual Leave | 12 Days |
| Sick Leave | 12 Days |
| Earned Leave | 15 Days |

Displayed Information:

* Total Leave  
* Used Leave  
* Remaining Leave  
* Pending Approval  
* Expired Leave

---

# **14.6 Apply Leave**

## **Description**

Employees can submit leave requests through the system.

### **Required Fields**

| Field | Mandatory |
| ----- | ----- |
| Leave Type | Yes |
| From Date | Yes |
| To Date | Yes |
| Number of Days | Auto |
| Half Day | Optional |
| Reason | Yes |
| Supporting Document | Optional |

---

# **14.7 Leave Calculation**

The system shall automatically calculate:

* Total Leave Days  
* Working Days  
* Holidays  
* Weekends  
* Remaining Balance

Example:

From: 01-Jul-2026

To: 05-Jul-2026

Weekend: 02 Days

Leave Count \= 3 Days

---

# **14.8 Leave Workflow**

Employee submits leave request

↓

Manager Review

↓

Approve / Reject

↓

If Required → HR Verification

↓

Leave Balance Updated

↓

Employee Notified

---

# **14.9 Leave Approval**

Managers shall be able to:

* View Pending Requests  
* View Employee Leave Balance  
* View Team Leave Calendar  
* Approve Leave  
* Reject Leave  
* Add Approval Comments

HR can override approvals when authorized.

---

# **14.10 Leave Rejection**

If rejected:

* Leave balance remains unchanged.  
* Employee receives a rejection notification.  
* Rejection reason is mandatory.  
* Employee may submit a new request.

---

# **14.11 Leave Cancellation**

Employees can cancel leave only if:

* Leave has not started.  
* Leave is not already cancelled.  
* Company cancellation policy permits it.

Cancelled approved leave shall restore the employee's leave balance automatically.

---

# **14.12 Half-Day Leave**

The system shall support:

* First Half  
* Second Half

Business Rules:

* Two half-day leaves on the same date equal one full-day leave.  
* Half-day leave cannot be combined with Work From Home on the same date unless company policy allows it.

---

# **14.13 Comp-Off**

Employees may earn Comp-Off for approved extra working days.

Business Rules:

* HR/Admin configures eligibility.  
* Comp-Off has an expiry period.  
* Expired Comp-Off cannot be used.

---

# **14.14 Leave Calendar**

The leave calendar shall display:

* Employee Name  
* Leave Dates  
* Leave Type  
* Department  
* Status

Filters:

* Department  
* Employee  
* Month  
* Leave Type

---

# **14.15 Leave History**

The employee shall be able to view:

* Leave Type  
* Applied Date  
* Leave Period  
* Number of Days  
* Status  
* Approver  
* Approval Date  
* Remarks

---

# **14.16 Business Rules**

* Leave cannot be applied for invalid date ranges.  
* From Date cannot be greater than To Date.  
* Leave balance must be available before approval.  
* Leave requests overlapping existing approved leave shall be rejected.  
* Employees cannot apply leave after the configured deadline (if enabled).  
* Public holidays and weekends shall be excluded from leave calculation based on company policy.  
* Leave balances shall update automatically after approval.  
* Loss of Pay (LOP) shall apply when paid leave balance is insufficient and company policy permits.

---

# **14.17 Validations**

* Leave Type is mandatory.  
* From Date is mandatory.  
* To Date is mandatory.  
* Reason is mandatory.  
* From Date cannot be after To Date.  
* Leave dates cannot overlap existing approved leave.  
* Leave balance validation shall occur before approval.  
* Supporting documents are mandatory for leave types that require proof (e.g., Sick Leave over a configured number of days).

---

# **14.18 Notifications**

The system shall notify:

Employee

* Leave Submitted  
* Leave Approved  
* Leave Rejected  
* Leave Cancelled

Manager

* New Leave Request  
* Leave Cancellation Request

HR

* Leave Approval Completed  
* Leave Balance Exception

Notification Channels:

* In-App  
* Email (Optional)

---

# **14.19 Reports**

Available Reports:

* Leave Summary Report  
* Employee Leave Report  
* Department Leave Report  
* Monthly Leave Report  
* Leave Balance Report  
* Leave Approval Report

Export Formats:

* PDF  
* Excel  
* CSV

---

# **14.20 Acceptance Criteria**

* Employees can apply for leave successfully.  
* Leave balance is validated before approval.  
* Approval and rejection workflows function correctly.  
* Leave balances update automatically after approval or cancellation.  
* Notifications are sent to the appropriate users.  
* Leave history displays accurate information.  
* Reports generate correctly with selected filters.  
* All leave actions are recorded in the Audit Log.

# **15\. Module 6 – Payroll Management**

---

# **15.1 Module Overview**

The Payroll Management module is responsible for processing employee salaries based on attendance, leave records, salary structures, statutory deductions, and company policies. It enables HR and Payroll Administrators to generate monthly payroll, calculate earnings and deductions, approve payroll, and publish payslips.

---

# **15.2 Actors**

* Super Admin  
* HR Admin  
* Payroll Executive (Optional)  
* Employee (View Payslip Only)

---

# **15.3 Features**

* Salary Structure Management  
* Payroll Processing  
* Monthly Payroll Generation  
* Earnings & Deductions Calculation  
* Statutory Deductions  
* Payslip Generation  
* Payroll Approval  
* Payroll Locking  
* Payroll Reports

---

# **15.4 Salary Structure**

Each employee shall have a salary structure consisting of:

### **Earnings**

* Basic Salary  
* House Rent Allowance (HRA)  
* Dearness Allowance (DA) (Optional)  
* Conveyance Allowance  
* Medical Allowance  
* Special Allowance  
* Bonus  
* Incentives  
* Overtime Pay (if applicable)  
* Other Allowances

### **Deductions**

* Provident Fund (PF)  
* Employee State Insurance (ESI)  
* Professional Tax (PT)  
* Income Tax (TDS)  
* Loss of Pay (LOP)  
* Loan Recovery (Optional)  
* Other Deductions

The salary structure may differ based on employee grade or designation.

---

# **15.5 Payroll Cycle**

The system shall support configurable payroll cycles such as:

* Monthly (Default)  
* Weekly (Optional)  
* Bi-Weekly (Optional)

For monthly payroll, salary shall be generated once per calendar month.

---

# **15.6 Payroll Processing**

### **Workflow**

Select Payroll Month

↓

Fetch Eligible Employees

↓

Retrieve Attendance

↓

Retrieve Approved Leaves

↓

Calculate Working Days

↓

Calculate Earnings

↓

Calculate Deductions

↓

Generate Salary

↓

Payroll Review

↓

Payroll Approval

↓

Publish Payslips

---

# **15.7 Payroll Calculation**

The payroll calculation shall consider:

* Basic Salary  
* Attendance  
* Approved Leave  
* Loss of Pay (LOP)  
* Overtime  
* Incentives  
* Bonus  
* Statutory Deductions

Example Formula:

Gross Salary \= Total Earnings

Net Salary \= Gross Salary \- Total Deductions

---

# **15.8 Payslip**

The generated payslip shall include:

### **Employee Information**

* Employee ID  
* Employee Name  
* Department  
* Designation  
* Payroll Month

### **Earnings**

* Basic Salary  
* HRA  
* Allowances  
* Bonus  
* Incentives  
* Overtime

### **Deductions**

* PF  
* ESI  
* PT  
* TDS  
* LOP  
* Other Deductions

### **Summary**

* Gross Salary  
* Total Deductions  
* Net Salary

Employees shall be able to download their payslips in PDF format.

---

# **15.9 Payroll Approval**

Before publishing payroll:

* Payroll shall be reviewed by HR.  
* Payroll shall be approved by an authorized approver.  
* Once approved, payroll shall be locked.  
* Locked payroll cannot be edited without reopening by Super Admin.

---

# **15.10 Business Rules**

* Payroll shall be processed only for active employees.  
* Attendance and approved leave shall be considered in salary calculations.  
* Unapproved leave shall not be treated as paid leave unless company policy specifies otherwise.  
* Loss of Pay (LOP) shall be deducted when applicable.  
* Payroll cannot be generated twice for the same employee and payroll period.  
* Payroll modifications after approval require authorized reopening.  
* Every payroll action shall be recorded in the Audit Log.

---

# **15.11 Validations**

* Payroll month is mandatory.  
* Salary structure must exist before payroll processing.  
* Attendance records must be available.  
* Duplicate payroll generation is not allowed.  
* Net salary cannot be negative.  
* Payroll approval requires an authorized user.

---

# **15.12 Payroll Reports**

Available Reports:

* Monthly Payroll Report  
* Salary Register  
* Earnings Report  
* Deductions Report  
* LOP Report  
* Overtime Report  
* Department-wise Payroll Report

Export Formats:

* PDF  
* Excel  
* CSV

---

# **15.13 Notifications**

The system shall notify:

Employee

* Payroll Generated  
* Payslip Available

HR

* Payroll Processing Completed  
* Payroll Approval Pending

Super Admin

* Payroll Published

Notification Channels:

* In-App  
* Email (Optional)

---

# **15.14 Acceptance Criteria**

* Payroll is generated successfully for eligible employees.  
* Salary calculations are accurate based on configured rules.  
* Payslips are generated and available for download.  
* Duplicate payroll generation is prevented.  
* Payroll approval and locking function correctly.  
* Reports display accurate payroll information.  
* All payroll activities are recorded in the Audit Log.

# **16\. Module 7 – Department Management**

---

# **16.1 Module Overview**

The Department Management module enables administrators to create and manage departments within the organization. Departments are used to organize employees, assign managers, generate reports, and control workflows.

---

# **16.2 Actors**

* Super Admin  
* HR Admin

Managers and Employees shall have view-only access where applicable.

---

# **16.3 Features**

* Create Department  
* Update Department  
* Delete Department  
* View Department  
* Assign Department Head  
* Department Status Management  
* Department Employee List

---

# **16.4 Department Details**

| Field | Mandatory |
| ----- | ----- |
| Department Code | Auto Generated |
| Department Name | Yes |
| Department Head | Optional |
| Description | Optional |
| Status (Active/Inactive) | Yes |
| Created Date | Auto |
| Created By | Auto |

---

# **16.5 Create Department**

HR/Admin shall be able to create a new department.

### **Business Rules**

* Department name must be unique.  
* Department code shall be generated automatically.  
* Department status defaults to Active.  
* Department can exist without a department head.

---

# **16.6 Edit Department**

HR/Admin can modify:

* Department Name  
* Department Head  
* Description  
* Status

All changes shall be recorded in the Audit Log.

---

# **16.7 Delete Department**

A department cannot be deleted if employees are assigned to it.

### **Workflow**

Attempt Delete

↓

Check Employee Count

↓

If Employees Exist → Display Error

↓

If No Employees → Delete Department

---

# **16.8 View Department**

The department profile shall display:

* Department Code  
* Department Name  
* Department Head  
* Number of Employees  
* Status  
* Created Date  
* Last Updated Date

---

# **16.9 Business Rules**

* Duplicate department names are not allowed.  
* Departments with active employees cannot be deleted.  
* Inactive departments cannot be assigned to new employees.  
* Department head must be an active employee.

---

# **16.10 Validations**

* Department Name is mandatory.  
* Department Name must be unique.  
* Status is mandatory.

---

# **16.11 Reports**

* Department List  
* Employee Count by Department  
* Active vs Inactive Departments

Export:

* PDF  
* Excel  
* CSV

---

# **16.12 Acceptance Criteria**

* Department can be created successfully.  
* Duplicate names are rejected.  
* Departments with employees cannot be deleted.  
* Reports display accurate department information.

---

# **17\. Module 8 – Designation Management**

---

# **17.1 Module Overview**

The Designation Management module is used to define job titles within the organization. Each employee shall be assigned one designation based on their role and department.

---

# **17.2 Actors**

* Super Admin  
* HR Admin

---

# **17.3 Features**

* Create Designation  
* Edit Designation  
* Delete Designation  
* Assign Department  
* Activate/Deactivate Designation

---

# **17.4 Designation Details**

| Field | Mandatory |
| ----- | ----- |
| Designation Code | Auto Generated |
| Designation Name | Yes |
| Department | Yes |
| Description | Optional |
| Status | Yes |

---

# **17.5 Create Designation**

HR/Admin shall be able to create designations.

Examples:

* Software Engineer  
* Senior Software Engineer  
* QA Engineer  
* HR Executive  
* Team Lead  
* Project Manager  
* Business Analyst

---

# **17.6 Business Rules**

* Designation name must be unique within a department.  
* Designation code shall be auto-generated.  
* Inactive designations cannot be assigned to employees.  
* One designation may belong to one department.

---

# **17.7 Edit Designation**

Editable Fields:

* Designation Name  
* Department  
* Description  
* Status

Audit logs shall capture all modifications.

---

# **17.8 Delete Designation**

The system shall prevent deletion if employees are currently assigned to the designation.

---

# **17.9 Validations**

* Designation Name is mandatory.  
* Department is mandatory.  
* Duplicate designations within the same department are not allowed.

---

# **17.10 Reports**

* Designation List  
* Employees by Designation  
* Department-wise Designations

Export Formats:

* PDF  
* Excel  
* CSV

---

# **17.11 Acceptance Criteria**

* Designations can be created successfully.  
* Duplicate entries are prevented.  
* Assigned designations cannot be deleted.  
* Reports display accurate designation data.

# **18\. Module 9 – Shift Management**

---

# **18.1 Module Overview**

The Shift Management module enables the organization to define working shifts, assign shifts to employees, manage rotational schedules, configure working hours, and support attendance and payroll calculations. It ensures employees are assigned the correct working schedule based on department, role, or location.

---

# **18.2 Actors**

* Super Admin  
* HR Admin  
* Manager (View Only)  
* Employee (View Assigned Shift Only)

---

# **18.3 Features**

* Create Shift  
* Update Shift  
* Delete Shift  
* Assign Shift to Employee  
* Bulk Shift Assignment  
* Shift Rotation  
* Weekly Off Configuration  
* Night Shift Support  
* Shift Calendar  
* Shift History

---

# **18.4 Shift Details**

| Field | Mandatory |
| ----- | ----- |
| Shift Code | Auto Generated |
| Shift Name | Yes |
| Shift Start Time | Yes |
| Shift End Time | Yes |
| Break Duration | Yes |
| Grace Time | Yes |
| Working Hours | Auto |
| Weekly Off | Yes |
| Shift Type (General/Night/Flexible) | Yes |
| Status | Yes |

---

# **18.5 Create Shift**

HR/Admin can create multiple shifts.

Examples:

* General Shift (09:00 AM – 06:00 PM)  
* Morning Shift (06:00 AM – 03:00 PM)  
* Evening Shift (02:00 PM – 11:00 PM)  
* Night Shift (10:00 PM – 07:00 AM)  
* Flexible Shift

---

# **18.6 Shift Assignment**

Employees can be assigned shifts:

* Individually  
* Department-wise  
* Team-wise  
* Branch-wise  
* Through Bulk Upload

Every employee shall have one active shift at a time unless multiple-shift support is enabled.

---

# **18.7 Shift Rotation**

The system shall support rotational shift schedules.

Example:

Week 1 → Morning Shift

Week 2 → Evening Shift

Week 3 → Night Shift

The rotation schedule shall automatically update employee assignments based on the configured cycle.

---

# **18.8 Weekly Off Configuration**

HR/Admin shall configure:

* Sunday  
* Saturday  
* Alternate Saturday  
* Custom Weekly Off  
* Rotational Weekly Off

The weekly off shall be considered during attendance and leave calculations.

---

# **18.9 Business Rules**

* Shift timings determine attendance calculations.  
* Grace period shall be configurable.  
* Employees cannot have overlapping active shifts.  
* Shift changes shall not affect already processed payroll unless reopened.  
* Night shifts crossing midnight shall be handled correctly.  
* All shift assignments and changes shall be recorded in the Audit Log.

---

# **18.10 Validations**

* Shift Name is mandatory.  
* Shift timings are mandatory.  
* End Time must be after Start Time unless it is a night shift.  
* Duplicate Shift Names are not allowed.  
* Grace Time cannot exceed the configured maximum.

---

# **18.11 Reports**

* Shift List Report  
* Employee Shift Report  
* Shift Assignment History  
* Department-wise Shift Report

Export Formats:

* PDF  
* Excel  
* CSV

---

# **18.12 Notifications**

The system shall notify:

Employee

* Shift Assigned  
* Shift Changed

Manager

* Team Shift Updated

HR

* Shift Assignment Completed

---

# **18.13 Acceptance Criteria**

* Shifts can be created and updated successfully.  
* Employees can be assigned shifts individually or in bulk.  
* Attendance calculations use the assigned shift timings.  
* Shift reports display accurate information.  
* Unauthorized users cannot modify shift data.

---

# **19\. Module 10 – Holiday Management**

---

# **19.1 Module Overview**

The Holiday Management module allows HR to configure company holidays, public holidays, regional holidays, and optional holidays. Holidays shall automatically affect attendance, leave calculations, and payroll processing.

---

# **19.2 Actors**

* Super Admin  
* HR Admin  
* Employee (View Only)

---

# **19.3 Features**

* Create Holiday  
* Edit Holiday  
* Delete Holiday  
* Holiday Calendar  
* Public Holidays  
* Regional Holidays  
* Optional Holidays  
* Holiday Notifications

---

# **19.4 Holiday Details**

| Field | Mandatory |
| ----- | ----- |
| Holiday Name | Yes |
| Holiday Date | Yes |
| Holiday Type | Yes |
| Applicable Location | Optional |
| Description | Optional |
| Status | Yes |

---

# **19.5 Holiday Types**

The system shall support:

* National Holiday  
* State Holiday  
* Company Holiday  
* Festival Holiday  
* Optional Holiday

---

# **19.6 Business Rules**

* Holidays shall be displayed in the company calendar.  
* Employees cannot mark attendance on company holidays unless explicitly permitted.  
* Approved holidays shall be excluded from leave calculations where company policy requires.  
* Duplicate holiday dates for the same location shall not be allowed.

---

# **19.7 Validations**

* Holiday Name is mandatory.  
* Holiday Date is mandatory.  
* Duplicate holiday entries are not allowed.  
* Past holidays cannot be edited once payroll for that period is finalized unless authorized.

---

# **19.8 Holiday Calendar**

The holiday calendar shall display:

* Holiday Name  
* Date  
* Day  
* Holiday Type  
* Location  
* Description

Users shall be able to filter by:

* Year  
* Location  
* Holiday Type

---

# **19.9 Reports**

* Holiday List  
* Annual Holiday Calendar  
* Location-wise Holiday Report

Export Formats:

* PDF  
* Excel  
* CSV

---

# **19.10 Notifications**

The system shall send reminders before upcoming holidays (configurable).

Examples:

* Upcoming Company Holiday  
* Festival Holiday Reminder

---

# **19.11 Acceptance Criteria**

* HR can create, edit, and delete holidays.  
* Holiday calendar displays accurate information.  
* Holidays are considered in attendance and leave calculations according to configured business rules.  
* Duplicate holiday dates are prevented.  
* Holiday reports are generated successfully.

**20\. Overall Non-Functional Requirements**

* Performance  
* Security  
* Scalability  
* Browser compatibility  
* Backup & Recovery  
* Logging

**21\. Assumptions & Constraints**

**22\. Phase 1 Deliverables**

**23\. Out of Scope (Phase 2\)**

