

# 🚀 Connect Site Backend
Backend for ProConnect - A Freelance Service Marketplace Application. It provides RESTful APIs for user authentication, service management, order processing, payment integration, reviews, admin dashboard, wallet management, messaging, and transaction tracking.



## 🔗 Live Demo & Source Code

* **Frontend Live Demo:** [Connect Live](https://pro-connect-frontend.vercel.app)
* **Backend Live Demo:** [Connect API](https://pro-connect-backend.vercel.app)
* **Frontend Source Code:** [Connect Frontend](https://github.com/shagar619/Connect-Site-Frontend)
* **Backend Source Code:** [Connect Backend](https://github.com/shagar619/Connect-Site-Backend)


## 🛠️ Tech Stack

* **Runtime:** Node.js
* **Framework:** Express.js
* **Database:** MongoDB with Mongoose


## ✨ Key Features

* User Authentication (JWT)
* Service Listings & Management
* Order Processing & Tracking
* Payment Integration (SSLCommerz)
* Ratings & Reviews
* Admin Dashboard & Analytics
* Wallet & Transaction Management
* Messaging System
* RESTful API Design
* Input Validation with Zod


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
git clone https://proconnect-backend.vercel.app/api/v1
cd Connect-Backend
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

**Shagar Ahmed** - [GitHub](https://github.com/shagar619)

---

## 📄 License

ISC License – See `LICENSE` file

