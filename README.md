# Multi-Tenant CRM

A full-stack, multi-tenant Customer Relationship Management (CRM) platform built from scratch. Supports secure authentication, organization-level data isolation, role-based access control, and lead/customer/deal pipeline management.

**🔗 Live demo:** [https://multi-tenant-crm-fawn.vercel.app](https://multi-tenant-crm-fawn.vercel.app)

---

## Features

- **Multi-tenant architecture** — every organization's data (leads, customers, deals, users) is fully isolated. No organization can ever access another's data.
- **Secure authentication** — passwords hashed with bcrypt, sessions managed via JWT tokens.
- **Role-based access control (RBAC)** — four roles (Owner, Admin, Sales Manager, Sales Rep) with server-side enforced permissions, not just UI hiding.
- **Invitation-based team onboarding** — Owners/Admins generate secure, expiring invite links to add teammates directly into their organization with a specific role.
- **Lead & customer management** — create and track leads and customers per organization.
- **Sales pipeline** — deals move through stages (New → Contacted → Negotiating → Won/Lost) with live status updates.
- **Dashboard analytics** — real-time counts and pipeline value calculated directly from the database.
- **IDOR-protected APIs** — every API route verifies that requested resources actually belong to the authenticated user's organization before returning or modifying them.

---

## Tech Stack

| Layer          | Technology                          |
|----------------|--------------------------------------|
| Frontend       | Next.js 16 (App Router), React, TypeScript, Tailwind CSS |
| Backend        | Next.js API Routes                  |
| Database       | PostgreSQL (hosted on Neon)          |
| ORM            | Prisma                               |
| Authentication | JWT, bcrypt                          |
| Deployment     | Vercel                               |


---

## Architecture Notes

**Multi-tenancy:** Every table (`User`, `Lead`, `Customer`, `Deal`, `Invitation`) is scoped by `organizationId`. This value is never taken from client input — it's always derived from the verified JWT token on the server, preventing any possibility of cross-tenant data access.

**Authentication flow:**
1. User signs up → password is hashed with bcrypt → stored in PostgreSQL.
2. User logs in → password compared against hash → server issues a signed JWT containing `userId`, `organizationId`, and `role`.
3. Every subsequent request includes this token in the `Authorization: Bearer <token>` header.
4. A shared `getUserFromRequest()` helper verifies the token on every protected route.

**RBAC enforcement example:** Only users with `OWNER` or `ADMIN` roles can view the team member list or generate invitations — enforced server-side with a `403 Forbidden` response for unauthorized roles, not just hidden in the UI.

---

## Getting Started (Local Setup)

### Prerequisites
- Node.js 18+
- A PostgreSQL database (e.g. a free [Neon](https://neon.com) project)

### Setup

1. Clone the repo:
```bash
git clone https://github.com/rushil206/multi-tenant-crm.git
cd multi-tenant-crm
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root with:
DATABASE_URL="your-postgresql-connection-string"
JWT_SECRET="any-long-random-string"


4. Push the database schema:
```bash
npx prisma migrate dev
```

5. Run the development server:
```bash
npm run dev
```

6. Visit `http://localhost:3000`

---

## Project Structure
app/
├── api/
│ ├── auth/ # signup, login
│ ├── customers/ # customer CRUD
│ ├── dashboard/ # analytics/stats
│ ├── deals/ # deal CRUD + status updates
│ ├── leads/ # lead CRUD
│ └── organization/ # team members, invitations
├── dashboard/ # dashboard page
├── leads/ # leads page
├── customers/ # customers page
├── deals/ # deals page
├── settings/ # team settings page
├── login/ # login page
├── signup/ # signup page
└── lib/
├── auth.ts # JWT verification, role checks
└── api.ts # authenticated fetch helper
prisma/
└── schema.prisma # database schema


---

## Known Limitations / Future Improvements

- Invitations are returned as a direct link rather than emailed (no email service integrated yet)
- No edit/delete functionality for leads/customers yet — currently create + list only
- JWT is stored in `localStorage`; a production version would use httpOnly cookies for stronger XSS protection
- No automated tests yet

---

## License

This project was built as a personal learning/portfolio project.