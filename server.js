const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Data storage (using JSON files for simplicity)
const DATA_DIR = './data';
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const ACTIVITIES_FILE = path.join(DATA_DIR, 'activities.json');
const TEAMS_FILE = path.join(DATA_DIR, 'teams.json');
const WORKOUTS_FILE = path.join(DATA_DIR, 'workouts.json');

// Initialize data directory and files
function initializeData() {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR);
    }
    
    if (!fs.existsSync(USERS_FILE)) {
        fs.writeFileSync(USERS_FILE, '[]');
    }
    
    if (!fs.existsSync(ACTIVITIES_FILE)) {
        fs.writeFileSync(ACTIVITIES_FILE, '[]');
    }
    
    if (!fs.existsSync(TEAMS_FILE)) {
        fs.writeFileSync(TEAMS_FILE, '[]');
    }
    
    if (!fs.existsSync(WORKOUTS_FILE)) {
        const defaultWorkouts = [
            { id: 1, name: "Beginner Push-ups", type: "strength", duration: 10, difficulty: "easy", description: "Start with wall push-ups, progress to knee push-ups" },
            { id: 2, name: "Running Intervals", type: "cardio", duration: 20, difficulty: "medium", description: "Alternate between jogging and walking" },
            { id: 3, name: "Yoga Flow", type: "flexibility", duration: 15, difficulty: "easy", description: "Basic yoga poses for flexibility" },
            { id: 4, name: "Strength Circuit", type: "strength", duration: 30, difficulty: "hard", description: "Full body strength training circuit" }
        ];
        fs.writeFileSync(WORKOUTS_FILE, JSON.stringify(defaultWorkouts, null, 2));
    }
}

// Helper functions for data management
function readJsonFile(filePath) {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

function writeJsonFile(filePath, data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// User Management APIs
app.post('/api/users/register', (req, res) => {
    const { username, email, role, grade } = req.body;
    const users = readJsonFile(USERS_FILE);
    
    // Check if user already exists
    if (users.find(user => user.username === username || user.email === email)) {
        return res.status(400).json({ error: 'User already exists' });
    }
    
    const newUser = {
        id: Date.now(),
        username,
        email,
        role: role || 'student', // student or teacher
        grade: grade || null,
        joinDate: new Date().toISOString(),
        totalPoints: 0,
        activitiesCompleted: 0
    };
    
    users.push(newUser);
    writeJsonFile(USERS_FILE, users);
    
    res.json({ message: 'User registered successfully', user: newUser });
});

app.get('/api/users', (req, res) => {
    const users = readJsonFile(USERS_FILE);
    res.json(users);
});

app.get('/api/users/:id', (req, res) => {
    const users = readJsonFile(USERS_FILE);
    const user = users.find(u => u.id === parseInt(req.params.id));
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
});

// Activity Tracking APIs
app.post('/api/activities', (req, res) => {
    const { userId, type, duration, intensity, points } = req.body;
    const activities = readJsonFile(ACTIVITIES_FILE);
    const users = readJsonFile(USERS_FILE);
    
    const newActivity = {
        id: Date.now(),
        userId: parseInt(userId),
        type,
        duration: parseInt(duration),
        intensity,
        points: parseInt(points),
        date: new Date().toISOString()
    };
    
    activities.push(newActivity);
    writeJsonFile(ACTIVITIES_FILE, activities);
    
    // Update user stats
    const userIndex = users.findIndex(u => u.id === parseInt(userId));
    if (userIndex !== -1) {
        users[userIndex].totalPoints += parseInt(points);
        users[userIndex].activitiesCompleted += 1;
        writeJsonFile(USERS_FILE, users);
    }
    
    res.json({ message: 'Activity logged successfully', activity: newActivity });
});

app.get('/api/activities/:userId', (req, res) => {
    const activities = readJsonFile(ACTIVITIES_FILE);
    const userActivities = activities.filter(a => a.userId === parseInt(req.params.userId));
    res.json(userActivities);
});

// Team Management APIs
app.post('/api/teams', (req, res) => {
    const { name, description, createdBy } = req.body;
    const teams = readJsonFile(TEAMS_FILE);
    
    const newTeam = {
        id: Date.now(),
        name,
        description,
        createdBy: parseInt(createdBy),
        members: [parseInt(createdBy)],
        totalPoints: 0,
        createdDate: new Date().toISOString()
    };
    
    teams.push(newTeam);
    writeJsonFile(TEAMS_FILE, teams);
    
    res.json({ message: 'Team created successfully', team: newTeam });
});

app.get('/api/teams', (req, res) => {
    const teams = readJsonFile(TEAMS_FILE);
    res.json(teams);
});

app.post('/api/teams/:teamId/join', (req, res) => {
    const { userId } = req.body;
    const teams = readJsonFile(TEAMS_FILE);
    
    const teamIndex = teams.findIndex(t => t.id === parseInt(req.params.teamId));
    if (teamIndex === -1) {
        return res.status(404).json({ error: 'Team not found' });
    }
    
    if (!teams[teamIndex].members.includes(parseInt(userId))) {
        teams[teamIndex].members.push(parseInt(userId));
        writeJsonFile(TEAMS_FILE, teams);
    }
    
    res.json({ message: 'Joined team successfully', team: teams[teamIndex] });
});

// Leaderboard APIs
app.get('/api/leaderboard/individual', (req, res) => {
    const users = readJsonFile(USERS_FILE);
    const leaderboard = users
        .filter(user => user.role === 'student')
        .sort((a, b) => b.totalPoints - a.totalPoints)
        .slice(0, 10);
    res.json(leaderboard);
});

app.get('/api/leaderboard/teams', (req, res) => {
    const teams = readJsonFile(TEAMS_FILE);
    const users = readJsonFile(USERS_FILE);
    
    // Calculate team points
    const teamsWithPoints = teams.map(team => {
        const teamPoints = team.members.reduce((total, memberId) => {
            const user = users.find(u => u.id === memberId);
            return total + (user ? user.totalPoints : 0);
        }, 0);
        
        return {
            ...team,
            totalPoints: teamPoints
        };
    });
    
    const leaderboard = teamsWithPoints
        .sort((a, b) => b.totalPoints - a.totalPoints)
        .slice(0, 10);
    
    res.json(leaderboard);
});

// Workout Suggestions APIs
app.get('/api/workouts', (req, res) => {
    const workouts = readJsonFile(WORKOUTS_FILE);
    res.json(workouts);
});

app.get('/api/workouts/suggestions/:userId', (req, res) => {
    const users = readJsonFile(USERS_FILE);
    const activities = readJsonFile(ACTIVITIES_FILE);
    const workouts = readJsonFile(WORKOUTS_FILE);
    
    const user = users.find(u => u.id === parseInt(req.params.userId));
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    
    const userActivities = activities.filter(a => a.userId === parseInt(req.params.userId));
    const recentActivityTypes = userActivities.slice(-5).map(a => a.type);
    
    // Simple recommendation logic
    let suggestions = workouts;
    if (user.activitiesCompleted < 5) {
        suggestions = workouts.filter(w => w.difficulty === 'easy');
    } else if (user.activitiesCompleted < 15) {
        suggestions = workouts.filter(w => w.difficulty !== 'hard');
    }
    
    // Vary workout types
    if (recentActivityTypes.filter(t => t === 'cardio').length > 2) {
        suggestions = suggestions.filter(w => w.type !== 'cardio');
    }
    
    res.json(suggestions.slice(0, 3));
});

// Initialize data and start server
initializeData();

app.listen(PORT, () => {
    console.log(`OctoFit Tracker server running on port ${PORT}`);
});