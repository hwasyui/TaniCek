
# TaniCek

TaniCek is a fullstack web application for monitoring, AI analysis, and agricultural activity management. This project consists of a frontend (React), backend (Node.js/Express), and backend-py (Python for face recognition).

## Project Structure

```
TaniCek/
├── backend/         # Node.js/Express Backend
│   ├── app.js
│   ├── index.js
│   ├── package.json
│   ├── config/
│   ├── controllers/
│   ├── cronJobs/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── utils/
├── backend-py/      # Python Service (Face Recognition)
│   ├── face_service.py
│   ├── test.jpg
│   └── ...
├── frontend/        # React + Vite Frontend
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
└── README.md        # Documentation
```

## Main Features

- **Developer Dashboard**: Monitor users, machines, activity logs, and AI analysis.
- **User & Admin Management**: Add, edit, delete users/admins, upload image for face recognition.
- **Company & Machine Management**: Manage company and machine data, filter users by company.
- **AI Analysis History**: View AI analysis history, group by date/machine, card background color based on status (low/medium/high/critical).
- **Activity Logs**: User activity history, including location and weather details.
- **Face Recognition**: Python service integration for admin/user face verification.

## Installation & Setup

### 1. Clone Repository
```bash
git clone https://github.com/hwasyui/TaniCek.git
cd TaniCek
```

### 2. Setup Backend (Node.js)
```bash
cd backend
npm install
npm start
```
Configure environment variables (e.g., .env) for database and API keys as needed.

### 3. Setup Backend-Py (Python)
```bash
cd backend-py
pip install -r requirements.txt
python face_service.py
```
Make sure Python 3.x and all required libraries are installed.

### 4. Setup Frontend (React)
```bash
cd frontend
npm install
npm run dev
```
Access the app at `http://localhost:5173` (default Vite).

## Usage

1. **Login as Admin/Developer**: Sign in with a registered account.
2. **Dashboard**: View summary of users, machines, logs, and AI analysis.
3. **User/Admin Management**: Add users/admins, upload photo, edit data, delete users.
4. **Company & Machine Management**: Manage company and machine data, filter users by company.
5. **AI Analysis History**: View AI analysis history, group by date/machine, card color by status.
6. **Activity Logs**: View user activity details, location, weather, and related machine.
7. **Face Recognition**: Upload/capture photo for face verification during admin/user registration.

## Main API Endpoints

- `POST /auth/login` - Login user/admin
- `GET /companies/:id/users` - Get users by company
- `GET /ai-analysis` - Get AI analysis data
- `POST /user` - Add user/admin (with image)
- `GET /userlog` - Get user activity logs
- `POST /machine` - Add machine

## Technologies

- **Frontend**: React, Vite, TailwindCSS
- **Backend**: Node.js, Express, MongoDB, Passport.js
- **Backend-Py**: Python, OpenCV, face_recognition

## Contribution

1. Fork the repository
2. Create a feature branch (`git checkout -b your-feature`)
3. Commit and push your changes
4. Create a Pull Request

## License

This project is for educational and internal development purposes.


---

## 👨‍💻 Developer Team

Meet the passionate team behind TaniCek:

| Name                       | Role                | Tech Stacks Used                          |
|----------------------------|---------------------|-------------------------------------------|
| **Alif Elang Abhipraya**   | Fullstack Developer | React, Vite, Node.js, Express, MongoDB, Passport  |
| **Alia Nurul Aziiza**      | Fullstack Developer | React, Vite, TailwindCSS |
| **Angelita Suti Whiharto** | Fullstack Developer | React, Vite, Node.js, Python, OpenCV, face_recognition  |

We work together to deliver a robust, scalable, and user-friendly agricultural management platform. Each member contributes to both frontend and backend, ensuring seamless integration and innovative features.

---



