

# 🚀 ProConnect Backend

**ProConnect** is a modern marketplace application connecting clients with service providers. This repository hosts the **robust and scalable Backend Service**, built using **TypeScript, Express, and MongoDB**.

---

## 🔗 Live Demo & Source Code

| Name                 | Type                | Link                                                                     |
| -------------------- | ------------------- | ------------------------------------------------------------------------ |
| **Live Application** | Frontend Deployment | [Frontend Live](https://pro-connect-frontend.vercel.app)                 |
| **Backend API**      | API Deployment      | [Backend Live](https://pro-connect-backend.vercel.app)                   |
| **Frontend Source**  | GitHub Repository   | [ProConnect-Frontend](https://github.com/arman-miaa/ProConnect-Frontend) |
| **Backend Source**   | GitHub Repository   | [ProConnect-Backend](https://github.com/arman-miaa/ProConnect-Backend)   |

---

## 🛠️ Tech Stack

| Category            | Technology          | Version       | Purpose                      |
| ------------------- | ------------------- | ------------- | ---------------------------- |
| **Language**        | TypeScript          | 5.8.3         | Type safety & scalability    |
| **Runtime**         | Node.js             | -             | JavaScript runtime           |
| **Framework**       | Express.js          | 5.1.0         | Web framework                |
| **Database**        | MongoDB             | -             | NoSQL document DB            |
| **ORM**             | Mongoose            | 8.16.1        | MongoDB modeling             |
| **Validation**      | Zod                 | 3.25.74       | Schema validation            |
| **Authentication**  | JWT & Bcryptjs      | 9.0.2 & 3.0.3 | Secure login & hashing       |
| **Payment Gateway** | SSLCommerz          | -             | Payment processing           |
| **File Upload**     | Cloudinary & Multer | 2.8.0 & 2.0.2 | File storage & upload        |
| **Email Service**   | Nodemailer          | 7.0.11        | Email sending                |
| **HTTP Client**     | Axios               | 1.13.2        | API requests                 |
| **Utilities**       | CORS, Cookie-Parser | -             | Security & cookie management |

---

## ✨ Key Features

* **🔐 User Authentication & Authorization:** JWT-based login, registration, role-based access (Admin, Seller, Client)
* **🛠️ Service Management:** Full CRUD operations for services with validation & error handling
* **📦 Order Processing:** Place, track, and manage orders
* **💳 Payment Gateway Integration:** SSLCommerz support, transaction tracking & status management
* **⭐ Review & Rating System:** Leave reviews, ratings with moderation support
* **📊 Admin Dashboard:** Analytics, user & transaction management, report oversight
* **💰 Wallet & Withdrawal:** Wallet tracking, earnings withdrawal with transaction history
* **✉️ Messaging System:** User-to-user messaging for communication and support
* **📑 Transaction Tracking:** Complete financial audit trail
* **⚡ Robust Error Handling:** Global error handler, custom AppError, Mongoose & Zod validation support
* **🧩 Custom Middleware:** Authentication checks, request validation, error & CORS handling

---

## 📂 Project Structure

```
src/
├── app.ts                      # Express app setup
├── server.ts                   # DB connection & server start
├── app/
│   ├── config/                 # Environment & upload configs
│   ├── errorHelpers/           # Custom error handling
│   ├── helpers/                # Error response helpers
│   ├── interfaces/             # TypeScript interfaces
│   ├── middlewares/            # Authentication, validation, error & 404 handlers
│   ├── modules/                # Feature modules (M-C-S)
│   │   ├── admin/              # Dashboard & analytics
│   │   ├── auth/               # Authentication
│   │   ├── order/              # Orders
│   │   ├── payment/            # Payment processing
│   │   ├── service/            # Services
│   │   ├── review/             # Ratings & reviews
│   │   ├── transaction/        # Transactions
│   │   ├── user/               # Users
│   │   ├── wallet/             # Wallet
│   │   ├── withdrawal/         # Withdrawals
│   │   ├── utility-messages/   # Messaging
│   │   ├── report/             # Reports
│   │   └── ssl/                # SSLCommerz integration
│   ├── routes/                 # Routes
│   └── utils/                  # Utility functions
├── tsconfig.json               # TypeScript config
└── vercel.json                 # Vercel deployment config
```

---

## ⚙️ Local Setup Guide

### Prerequisites

* Node.js v18+
* npm or pnpm
* MongoDB server or MongoDB Atlas

### 1️⃣ Installation

```bash
git clone https://github.com/arman-miaa/ProConnect-Backend.git
cd ProConnect-Backend
pnpm install   # or npm install
```

### 2️⃣ Environment Variables

Create `.env` in root:

```bash
PORT=5000
NODE_ENV=development
DATABASE_URL=<mongodb_connection_string>
JWT_SECRET=<your_jwt_secret>
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=<name>
CLOUDINARY_API_KEY=<key>
CLOUDINARY_API_SECRET=<secret>
SSL_STORE_ID=<ssl_id>
SSL_STORE_PASSWORD=<ssl_password>
EMAIL_USER=<email>
EMAIL_PASSWORD=<password>
EMAIL_FROM=noreply@proconnect.com
FRONTEND_URL=http://localhost:3000
```

### 3️⃣ Run Development

```bash
pnpm run dev   # or npm run dev
```

### 4️⃣ Build & Production

```bash
pnpm run build
pnpm start
```

---

## 📜 Available Scripts

| Script    | Description                             | Command          |
| --------- | --------------------------------------- | ---------------- |
| **dev**   | Run development server with live reload | `pnpm run dev`   |
| **build** | Compile TS to JS (`/dist`)              | `pnpm run build` |
| **start** | Run production build                    | `pnpm start`     |
| **lint**  | ESLint check                            | `pnpm run lint`  |
| **test**  | Run tests (not configured)              | `pnpm run test`  |

---

## 🔑 Key Dependencies

* **Express.js**: RESTful APIs & middleware
* **Mongoose**: MongoDB modeling
* **TypeScript**: Type safety
* **JWT & Bcryptjs**: Secure auth
* **Zod**: Runtime validation
* **Cloudinary & Multer**: File uploads
* **Nodemailer**: Email sending
* **Axios**: API requests
* **CORS & Cookie-Parser**: Security & session

---

## 🤝 Contributing

1. Fork repository
2. `git checkout -b feature/awesome-feature`
3. Commit changes `git commit -m "feat: Added awesome feature"`
4. Push `git push origin feature/awesome-feature`
5. Open Pull Request

---

## 👤 Author

**Arman Mia** - [GitHub](https://github.com/arman-miaa)

---

## 📄 License

ISC License – See `LICENSE` file

