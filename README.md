# 🐙 OctoFit Tracker

A social fitness app designed to help students stay active and compete with their peers.

![OctoFit Tracker Homepage](https://github.com/user-attachments/assets/f67dcbfe-8dcf-465b-b64e-003f1c31ca48)

## Features

OctoFit Tracker includes the following features:

### ✅ User Profiles
- **Student and Teacher accounts** with role-based functionality
- **Profile management** with username, email, grade, and join date
- **Personal statistics** tracking total points and activities completed

![Dashboard](https://github.com/user-attachments/assets/9d116c18-3e21-4fb2-8f5f-c1be09e16350)

### ✅ Activity Tracking
- **Log fitness activities** with type, duration, and intensity
- **Smart point calculation** based on activity type and intensity
- **Activity history** to monitor fitness progress over time
- **Multiple activity types**: Running, Walking, Cycling, Swimming, Strength Training, Yoga, Sports

### ✅ Team Creation and Management
- **Create fitness teams** with custom names and descriptions
- **Join existing teams** to collaborate on fitness goals
- **Team member tracking** and statistics
- **Collaborative goal achievement**

### ✅ Leaderboards
- **Individual student rankings** based on total points earned
- **Team leaderboards** showing top-performing groups
- **Real-time updates** as activities are logged
- **Competitive motivation** to encourage fitness participation

### ✅ Personalized Workout Suggestions
- **Smart recommendations** based on user activity history and experience level
- **Difficulty progression** from beginner to advanced workouts
- **Workout variety** including strength, cardio, and flexibility exercises
- **Detailed workout descriptions** with duration and difficulty levels

![Workout Suggestions](https://github.com/user-attachments/assets/b415ba9d-3cd2-4cbe-8995-5e7b329febb4)

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Node.js with Express.js
- **Data Storage**: JSON files (easily upgradeable to database)
- **Styling**: Modern responsive CSS with gradient themes
- **Architecture**: RESTful API design

## Installation & Setup

### Prerequisites
- Node.js (version 14 or higher)
- npm (Node Package Manager)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/SATYAMYADAV2004/Github_OctoFit-Tracker.git
   cd Github_OctoFit-Tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the application**
   ```bash
   npm start
   ```

4. **Open your browser**
   ```
   Navigate to http://localhost:3000
   ```

## Usage Guide

### Getting Started
1. **Register** a new account by choosing your role (Student or Teacher)
2. **Login** with your username
3. **Explore** the different sections using the navigation menu

### Logging Activities
1. Go to the **Activities** section
2. Select your activity type, duration, and intensity
3. Click **Log Activity** to earn points

### Creating/Joining Teams
1. Visit the **Teams** section
2. Either create a new team or join an existing one
3. Collaborate with teammates to achieve fitness goals

### Checking Progress
1. View your **Dashboard** for personal statistics
2. Check **Leaderboards** to see your ranking
3. Get **Workout Suggestions** for your next fitness session

## API Endpoints

### User Management
- `POST /api/users/register` - Register new user
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get specific user

### Activity Tracking
- `POST /api/activities` - Log new activity
- `GET /api/activities/:userId` - Get user activities

### Team Management
- `POST /api/teams` - Create new team
- `GET /api/teams` - Get all teams
- `POST /api/teams/:teamId/join` - Join team

### Leaderboards
- `GET /api/leaderboard/individual` - Individual rankings
- `GET /api/leaderboard/teams` - Team rankings

### Workouts
- `GET /api/workouts` - All available workouts
- `GET /api/workouts/suggestions/:userId` - Personalized suggestions

## Project Structure

```
Github_OctoFit-Tracker/
├── server.js              # Main server file
├── package.json           # Dependencies and scripts
├── public/                # Frontend files
│   ├── index.html        # Main HTML page
│   ├── css/
│   │   └── style.css     # Styling
│   └── js/
│       └── app.js        # Frontend JavaScript
├── data/                 # Data storage (auto-created)
│   ├── users.json       # User data
│   ├── activities.json  # Activity logs
│   ├── teams.json       # Team information
│   └── workouts.json    # Workout database
└── README.md            # This file
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Future Enhancements

- 📱 Mobile app development
- 🗄️ Database integration (MongoDB/PostgreSQL)
- 🔐 Enhanced authentication and security
- 📊 Advanced analytics and reporting
- 🏆 Achievement badges and rewards system
- 📱 Push notifications for motivation
- 🌐 Social media integration
- 📈 Progress visualization charts

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please open an issue on GitHub or contact the development team.

---

Built with ❤️ for student fitness and wellness