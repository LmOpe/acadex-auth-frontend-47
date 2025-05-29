# 📝ACADEX
A Django-based online quiz platform supporting lecturers and students. Lecturers can create and schedule quizzes for their courses, while students can attempt them and receive instant results. The system includes comprehensive test coverage using Pytest.

## 🚀 Features

### 👨‍🏫 Lecturer Features
- Create, schedule, and manage quizzes for courses they teach
- Add multiple-choice questions and answer options
- View all student attempts and results
- Monitor quiz performance and analytics

### 🎓 Student Features
- View upcoming and active quizzes
- Attempt quizzes within the scheduled duration
- Receive automatic grading and feedback upon submission
- Track personal quiz history and performance

### 🧪 Testing
- Full unit and integration tests with **Pytest**
- Test data setup with `conftest.py`
- Coverage reports for all major components
- Automated test fixtures for consistent testing

## 🧱 Project Structure

```
acadex/
├── acadex/                # Main project settings
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── quiz/                  # App containing models, views, and serializers
│   ├── models.py
│   ├── views.py
│   ├── serializers.py
│   └── urls.py
├── users/                 # App for student and lecturer user models
│   ├── models.py
│   ├── views.py
│   └── admin.py
├── tests/                 # Pytest-based unit/integration tests
│   ├── test_models.py
│   ├── test_views.py
│   └── test_serializers.py
├── conftest.py            # Test fixtures
├── manage.py
├── requirements.txt
└── README.md
```

## ⚙️ Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/online-quiz-system.git
cd online-quiz-system
```

### 2. Create a Virtual Environment
```bash
python -m venv venv
source venv/bin/activate  # On Windows use `venv\Scripts\activate`
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Environment Configuration
Create a `.env` file in the root directory:
```env
SECRET_KEY=your-secret-key-here
DEBUG=True
DATABASE_URL=sqlite:///db.sqlite3
```

### 5. Apply Migrations
```bash
python manage.py migrate
```

### 6. Create Superuser (Optional)
```bash
python manage.py createsuperuser
```

### 7. Run the Server
```bash
python manage.py runserver
```

The application will be available at `http://localhost:8000`

## 🧪 Running Tests

### Run All Tests
```bash
pytest -m coverage
```

### Run Tests with Coverage Report
```bash
pytest --cov=.
```

### Run Tests with Detailed Coverage
```bash
pytest --cov=. --cov-report=html
```

### Run Specific Test Files
```bash
pytest tests/test_models.py
pytest tests/test_views.py -v
```

## 🧰 Technologies Used

- **Python 3.x** - Core programming language
- **Django 4.x** - Web framework
- **Django REST Framework** - API development
- **Pytest** - Testing framework
- **SQLite/PostgreSQL** - Database options
- **HTML/CSS/JavaScript** - Frontend
- **Bootstrap** - UI framework (optional)

## 📂 Test Coverage

Our test suite covers:

- **Models**: Users, Courses, Quizzes, Questions, Answers, Attempts
- **API Views**: Quiz listing, submission, results
- **Serializers**: Data validation and transformation
- **Permissions**: Role-based access control
- **Time-based Logic**: Quiz deadlines, grace periods, scheduling
- **Authentication**: User login/logout, session management

## 🐳 Docker Setup (Optional)

### Using Docker Compose
```bash
docker-compose up --build
```

### Manual Docker Build
```bash
docker build -t quiz-system .
docker run -p 8000:8000 quiz-system
```

## 🚀 Production Deployment

For production deployment with Gunicorn and Nginx:

### 1. Install Production Dependencies
```bash
pip install gunicorn psycopg2-binary
```

### 2. Configure Gunicorn
```bash
gunicorn acadex.wsgi:application --bind 0.0.0.0:8000
```

### 3. Set Environment Variables
```bash
export DEBUG=False
export ALLOWED_HOSTS=yourdomain.com
```

## 📊 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/quizzes/` | List all available quizzes |
| POST | `/api/quizzes/` | Create new quiz (lecturers only) |
| GET | `/api/quizzes/{id}/` | Get quiz details |
| POST | `/api/quizzes/{id}/attempt/` | Submit quiz attempt |
| GET | `/api/attempts/` | Get user's quiz attempts |
| GET | `/api/results/{id}/` | View quiz results |

## ✅ To Do

- [ ] Add Admin functionality (user/course management)
- [ ] Enable real-time quiz updates with WebSockets
- [ ] Add support for file/image-based questions
- [ ] Export quiz results (CSV/PDF)
- [ ] Implement quiz analytics dashboard
- [ ] Add email notifications for quiz deadlines
- [ ] Support for different question types (essay, matching)
- [ ] Mobile-responsive design improvements

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

Built with ❤️ by **Lawal Muhammed Opeyemi**

## 📞 Support

If you have any questions or need help with setup, please:
- Open an issue on GitHub
- Contact the development team
