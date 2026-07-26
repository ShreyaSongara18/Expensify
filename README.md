# 🪙 Expensify - MERN Expense Tracker

A comprehensive **Expense Tracker Web Application** built using the **MERN Stack (MongoDB, Express.js, React.js, Node.js)**. The application helps users manage their daily expenses, set monthly budgets, visualize spending trends, and generate PDF reports that can be sent via email.

---

## 🚀 Features

- 🔐 **User Authentication** – Secure user registration and login.
- 💰 **Budget Management** – Create and manage category-wise monthly budgets.
- 📊 **Interactive Dashboard** – Visualize expenses using dynamic charts.
- 💸 **Expense Tracking** – Add, delete, and categorize expenses.
- 📄 **PDF Report Generation** – Download detailed monthly expense reports.
- 📧 **Email Reports** – Send generated PDF reports directly to users via email.
- 👤 **Profile Management** – Personalized dashboard for each user.

---

## 🛠️ Tech Stack

### Frontend
- React.js
- Redux Toolkit
- Tailwind CSS
- Chart.js
- React Chart.js 2
- Axios
- React Router DOM

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- Nodemailer
- jsPDF
- jsPDF-AutoTable
- bcrypt

---

## 📂 Project Structure

```text
Expensify/
├── backend/
│   ├── controller/
│   ├── db/
│   ├── router/
│   ├── utils/
│   ├── index.js
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── redux/
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
│
└── README.md
```

---

## 💻 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/ShreyaSongara18/Expensify.git
cd Expensify
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Configure Environment Variables

Copy `backend/.env.example` to `backend/.env` inside the `backend` folder and configure the following variables:

```env
PORT=4000
MONGO_URI=your_mongodb_connection_string
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
JWT_SECRET=your_jwt_secret_key_here
```

> **Security Note:** Never commit your `.env` file to version control. It is already included in `backend/.gitignore`. You can generate a random secret key for `JWT_SECRET` using `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.

### 4. Start the Backend Server

```bash
npm start
```

The backend server will run at:

```
http://localhost:4000
```

### 5. Install Frontend Dependencies

Open a new terminal:

```bash
cd frontend
npm install
```

### 6. Start the Frontend

```bash
npm start
```

The application will open at:

```
http://localhost:3000
```

---

## 🔮 Future Enhancements

- 🌙 Dark Mode
- 📱 Fully Responsive Mobile UI
- 💳 Multiple Currency Support
- 📈 Advanced Expense Analytics
- 🤖 AI-based Expense Insights

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository.
2. Create a new feature branch.
3. Commit your changes.
4. Push your branch.
5. Open a Pull Request.

---

## 📄 License

This project is licensed under the **MIT License**.

---

## 👩‍💻 Author

**Shreya Songara**

- GitHub: https://github.com/ShreyaSongara18
- LinkedIn: https://www.linkedin.com/in/shreya-songara-a60b75312