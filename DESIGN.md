# DESIGN.md  
## Meridian Asset Management Portal

## 1. Overview

The **Meridian Asset Management Portal** is a centralized web-based asset reporting and management system designed for **Meridian Asset Management** to monitor and manage real estate property portfolios efficiently.

The platform solves fragmented reporting workflows by providing structured, role-based access for:
- Administrators
- Managers
- Operators

The application is built using:
- Next.js
- Firebase
- Node.js

## 2. Design Goals
- Simplicity
- Real-Time Visibility
- Role-Based Security
- Low Operational Cost
- Scalability

## 3. User Roles & Permissions

### Admin
- Create/delete managers
- View all managers
- Create/delete projects
- Define total project properties

### Manager
- Create/delete operators
- Assign/reassign properties
- View all reporting activity
- Resolve incidents and maintenance tickets
- Access rent rolls and history

### Operator
- View assigned properties
- Raise/resolve maintenance tickets
- Raise/resolve incident reports
- Upload rent rolls and lease agreements
- View lease/rent details

## 4. System Architecture

### Frontend
Next.js for:
- Server-side rendering
- Fast routing
- Component modularity
- Scalability

### Backend
Firebase for:
- Authentication
- Firestore database
- Realtime synchronization
- Security rules

### User Provisioning
Node.js backend service using Firebase Admin SDK for creating users without interrupting active sessions.

## 5. Data Model

### Users
- uid
- role
- fullName
- email
- managerId

### Projects
- projectId
- name
- totalProperties

### Properties
- propertyId
- projectId
- unitNumber
- address
- propertyType
- operatorId
- managerId

### Tickets
- ticketId
- propertyId
- status
- createdAt
- resolvedAt

### Incidents
- incidentId
- propertyId
- status
- description

### Rent Rolls
- rentRollId
- propertyId
- fileUrl
- uploadedAt

### Leases
- leaseId
- propertyId
- agreementUrl
- startDate
- endDate
- monthlyRent

## 6. Submission Lifecycle

Maintenance / Incident:
Open → In Progress → Resolved

Rent Roll:
Pending → Uploaded → Validated

Property Assignment:
Created → Assigned → Reassigned

## 7. Scheduling Logic

Monthly reminders triggered via Firebase Cloud Functions:
- Executes on 1st of each month
- Detects missing uploads
- Creates dashboard alerts

## 8. Security

### Admin
Full system access

### Manager
Access limited to assigned operators and properties

### Operator
Access limited to assigned properties only

## 9. Technology Decisions

### Firebase
- Low cost
- Realtime
- Minimal backend maintenance

### Next.js
- Performance
- Structure
- Fast development

### Node.js
- Backend user provisioning

## 10. Future Enhancements
- Email/SMS notifications
- Analytics dashboards
- Audit logs
- CSV validation engine
- Mobile optimization

## 11. Conclusion

The Meridian Asset Management Portal provides a secure, scalable, low-cost solution for centralized asset reporting and operational visibility.


## 12. Current working features
- Admin login : meridianadmin@gmail.com
- Manager login : manager1@gmail.com
- Operator login : operator1@gmail.com
- password for all: 123456
- Admin can see the list of managers
- Manager can see the list of their operators
- Operators can see list of properties assigned to them
- Operatos can see lease start date, end date, monthly rent, total rent amount for next month( auto calculated)
- Operators can see active lease, and expiring this month lease
- Rest is required to be done.