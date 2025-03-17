# Multi-Level Category API (MERN Backend)

A backend system built with Node.js, Express, MongoDB (via Mongoose), and JWT authentication.

## Features

- JWT-based Authentication (Register/Login)
- CRUD for Nested Categories (multi-level/tree structure)
- MongoMemoryServer for testing
- Jest + Supertest test suite
- Inactive status cascades to subcategories

---

## 🛠️ Local Development Setup

### 1️⃣ Clone the repository
```bash
git clone https://github.com/KaranJaviya11/category-api-with-auth.git
cd your-repo
```

### 2️⃣ Install dependencies
```bash
npm install
```

### 3️⃣ Create `.env`
```env
JWT_SECRET=your_jwt_secret
PORT=5000
```

### 4️⃣ Start the application
```bash
npm start
```

The app will be running on `http://localhost:5000`

---

## API Endpoints

### Auth
- `POST /api/auth/register` – User registration
- `POST /api/auth/login` – User login & receive JWT

### Categories (requires JWT)
- `POST /api/category` – Create a category (supports nested via parent)
- `GET /api/category` – Fetch categories in tree structure
- `PUT /api/category/:id` – Update category (name or status)
- `DELETE /api/category/:id` – Delete category & reassign subcategories

---

## 🧪 Running Tests (Jest + Supertest + MongoMemoryServer)

### Run all tests
```bash
npm run test
```

Tests include:
- User registration/login
- JWT authentication flow
- Category creation, update, tree-fetching, delete operations
- Validation and error handling cases

---

## Notes
- This project uses **MongoMemoryServer** for in-memory testing.
- App defaults to running on `http://localhost:5000`

---
