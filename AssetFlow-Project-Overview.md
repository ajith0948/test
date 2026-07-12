# AssetFlow — Enterprise Asset & Resource Management System

*Project overview and feature reference for team presentation*

---

## 1. What is AssetFlow

AssetFlow is a full-stack web application that helps an organization track every physical asset it owns — laptops, furniture, vehicles, shared equipment, meeting rooms — from the moment it's registered until it's retired, lost, or disposed. It replaces spreadsheet-based asset tracking with a single system where assets can be allocated to people or departments, transferred, booked as shared resources, sent for maintenance, physically audited, and reported on, all with role-appropriate visibility and approvals.

It was built by a four-person team in a hackathon, with each member owning a distinct module. The codebase is a single monorepo: a Node/Express/MongoDB backend and a React/Vite frontend.

## 2. The Problem It Solves

Organizations lose track of physical assets constantly: nobody knows who currently has the projector, maintenance requests get lost in email threads, meeting rooms get double-booked, and nobody finds out an asset went missing until the next physical stocktake — if one ever happens. AssetFlow centralizes all of that into one system with a clear chain of custody for every asset, self-service workflows for employees, and an audit trail for every action taken.

## 3. Team & Module Ownership

| Member | Ownership |
|---|---|
| Member 1 | Authentication, organization setup (departments & asset categories with custom fields), and overall integration of all four members' work |
| Member 2 | Asset registration and the allocation/transfer lifecycle |
| Member 3 | Resource booking and maintenance request management |
| Member 4 | Dashboard, asset audits, reports & analytics, notifications, and activity logs |

## 4. Technology Stack

**Backend:** Node.js, Express 5, MongoDB with Mongoose, JWT authentication (httpOnly cookie + Bearer token support), bcrypt password hashing, Multer + Cloudinary for file attachments, Helmet for security headers.

**Frontend:** React 18, Vite, Tailwind CSS, React Router v6, React Hook Form, React Hot Toast for notifications, Axios.

**Deployment:** Render (separate Node web service for the API and a static site for the frontend), with environment-driven CORS and API URL configuration so the same codebase runs locally and in production without changes.

## 5. System Architecture

The backend exposes a REST API under `/api`, organized by resource: `/auth`, `/departments`, `/categories`, `/employees`, `/assets`, `/allocations`, `/bookings`, `/maintenance`, `/audits`, `/reports`, `/dashboard`, `/notifications`, and `/logs`. Every route is protected by JWT-based authentication middleware, and sensitive actions are further gated by role-based authorization middleware.

The frontend is a single-page application. After login, every page lives inside a shared layout with role-aware navigation, and each page independently fetches from the API based on the logged-in user's role — the same "Allocation & Transfer" page, for example, renders a completely different set of forms and lists depending on whether the viewer is an Employee, a Department Head, an Asset Manager, or an Admin.

## 6. User Roles

AssetFlow has four roles, each with a different scope of authority:

- **Admin** — full access to everything: user/department/category setup, asset registration, allocation, approvals, audits, and reports.
- **Asset Manager** — the operational owner of the asset lifecycle: registers assets, allocates them, reviews transfer/return/maintenance/booking requests org-wide, runs audits.
- **Department Head** — has all the self-service abilities of an Employee, plus approval authority scoped to their own department (transfers, returns, and asset requests where the asset is held within their department).
- **Employee** — can view what's allocated to them, request assets, book shared resources, raise maintenance requests, and manage their own notifications — but cannot register assets or approve anything.

## 7. Core Features

### 7.1 Authentication & Organization Setup
Email/password signup with OTP email verification, login, forgot/reset password, and JWT session management. Admins configure the organization's departments (with a designated department head and active/inactive status) and asset categories. Categories can define **custom fields** — for example a "Laptops" category might add a "RAM" (integer) and "Under Warranty" (flag) field — which then dynamically appear on the asset registration form and are stored per-asset in a flexible `customFields` map.

### 7.2 Asset Management
Admins and Asset Managers register assets with a tag, name, category, serial number, acquisition cost/date, condition, location, department, and up to three file attachments (images, PDFs, or Word docs, stored via Cloudinary). Assets carry a lifecycle status — Available, Allocated, Reserved, Under Maintenance, Lost, Retired, or Disposed — that the system updates automatically as the asset moves through allocation, booking, maintenance, and audit workflows. The Asset Directory supports search, filtering by category/status/department/location, and pagination.

### 7.3 Allocation & Transfer
This is the heart of the "who has what" tracking:

- **Direct allocation** — an Asset Manager or Admin assigns any unowned (Available) asset directly to an employee or a department.
- **Self-service asset requests** — an Employee or Department Head can request an unowned asset be assigned to themselves (or, for a Department Head, to their whole department), which then goes to Admin/Asset Manager/Department Head for approval.
- **Transfers** — moving an asset that's already allocated to someone else, either requested by the current holder / an employee (self-service, requires approval) or filed directly by a manager on someone's behalf.
- **Returns** — an employee can request to hand an asset back (with condition notes), or a manager can mark it returned immediately; approved returns free the asset back to Available.
- All of the above are **role-scoped**: a Department Head only ever sees and approves requests for assets held within their own department; an Employee only sees their own holdings and requests; managers see everything.

### 7.4 Resource Booking
Certain assets (meeting rooms, projectors, vehicles) can be marked "shared/bookable." Any logged-in user can book one for a specific time window; the system prevents double-booking by checking for overlapping reservations before confirming. Bookings move through Upcoming → Ongoing → Completed automatically by time, or can be Cancelled by the owner or a manager.

### 7.5 Maintenance Management
Any user can raise a maintenance request against an asset, describing the issue and setting a priority (Low/Medium/High/Critical), with an optional photo. Admin, Asset Manager, or the relevant Department Head can approve (optionally assigning a technician, which takes the asset out of service as "Under Maintenance") or reject the request with a reason. Once work is done, an Asset Manager or Admin marks it resolved, and the asset automatically returns to "Allocated" or "Available" depending on whether it still has an active holder.

### 7.6 Asset Audit
Admins and Asset Managers can open an audit cycle scoped to the whole organization, a single department, or a specific location — the system automatically pulls in every active asset in that scope as an item to verify. During the audit, each item is marked Pending, Verified, Missing, or Damaged. Closing the cycle is a real business event: any item still marked "Missing" automatically flips that asset's status to "Lost," so a physical stocktake directly updates the source of truth.

### 7.7 Dashboard & Reports
The dashboard gives a real-time snapshot: assets available vs. allocated, assets currently in maintenance, active bookings, pending transfers, and a list of upcoming/overdue returns. The Reports & Analytics section breaks down assets by utilization status, maintenance requests by status, and allocations by status — all computed live from the database rather than pre-baked numbers.

### 7.8 Notifications & Activity Logs
Every significant event in the system — an asset being assigned to you, a transfer or maintenance request being approved or rejected, a booking confirmation or cancellation, an audit closing — generates an in-app notification for the relevant user, which they can mark read individually or all at once. In parallel, a full activity log records who did what across every module (Asset, Allocation, Booking, Maintenance, Audit), giving the organization a complete audit trail, filterable by module.

## 8. What Makes This a Complete System

Unlike a simple asset spreadsheet, AssetFlow enforces the full chain of custody automatically: an asset can't be double-allocated, double-booked, or silently disappear — every state change (allocate, transfer, return, book, send to maintenance, audit) is a tracked, role-gated action that updates the asset's single source-of-truth status and leaves a notification and activity-log trail behind it.

## 9. Possible Next Steps

Automated overdue-return and booking-reminder notifications on a schedule, richer audit creation (auditor assignment picker, bulk item import), exportable PDF/CSV reports, and a mobile-friendly view for on-the-floor asset scanning (e.g. QR codes per asset tag) are natural extensions beyond the hackathon scope.
