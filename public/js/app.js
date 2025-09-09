// Global state
let currentUser = null;
let currentSection = 'auth';

// API Base URL
const API_BASE = window.location.origin + '/api';

// DOM Elements
const sections = {
    auth: document.getElementById('auth'),
    dashboard: document.getElementById('dashboard'),
    activities: document.getElementById('activities'),
    teams: document.getElementById('teams'),
    leaderboard: document.getElementById('leaderboard'),
    workouts: document.getElementById('workouts')
};

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    checkUserSession();
});

// Setup event listeners
function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = e.target.getAttribute('href').substring(1);
            navigateToSection(section);
        });
    });

    // Forms
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('activityForm').addEventListener('submit', handleActivitySubmit);
    document.getElementById('teamForm').addEventListener('submit', handleTeamCreation);

    // Leaderboard tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tab = e.target.getAttribute('data-tab');
            switchLeaderboardTab(tab);
        });
    });
}

// Navigation
function navigateToSection(section) {
    if (!currentUser && section !== 'auth') {
        showMessage('Please login first!', 'error');
        return;
    }

    // Hide all sections
    Object.values(sections).forEach(sec => sec.classList.add('hidden'));
    
    // Show selected section
    if (sections[section]) {
        sections[section].classList.remove('hidden');
        currentSection = section;
        
        // Load data for specific sections
        switch(section) {
            case 'dashboard':
                loadDashboard();
                break;
            case 'activities':
                loadActivities();
                break;
            case 'teams':
                loadTeams();
                break;
            case 'leaderboard':
                loadLeaderboards();
                break;
            case 'workouts':
                loadWorkouts();
                break;
        }
    }
}

// Authentication
async function handleRegister(e) {
    e.preventDefault();
    
    const formData = {
        username: document.getElementById('regUsername').value,
        email: document.getElementById('regEmail').value,
        role: document.getElementById('regRole').value,
        grade: document.getElementById('regGrade').value
    };

    try {
        const response = await fetch(`${API_BASE}/users/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();
        
        if (response.ok) {
            showMessage('Registration successful! You can now login.', 'success');
            document.getElementById('registerForm').reset();
        } else {
            showMessage(data.error || 'Registration failed', 'error');
        }
    } catch (error) {
        showMessage('Network error. Please try again.', 'error');
    }
}

async function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('loginUsername').value;
    
    try {
        const response = await fetch(`${API_BASE}/users`);
        const users = await response.json();
        
        const user = users.find(u => u.username === username);
        
        if (user) {
            currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(user));
            showMessage('Login successful!', 'success');
            navigateToSection('dashboard');
        } else {
            showMessage('User not found. Please register first.', 'error');
        }
    } catch (error) {
        showMessage('Network error. Please try again.', 'error');
    }
}

function checkUserSession() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        navigateToSection('dashboard');
    }
}

// Dashboard
async function loadDashboard() {
    if (!currentUser) return;
    
    try {
        // Update user info
        const response = await fetch(`${API_BASE}/users/${currentUser.id}`);
        const updatedUser = await response.json();
        currentUser = updatedUser;
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        
        // Update dashboard elements
        document.getElementById('userPoints').textContent = currentUser.totalPoints;
        document.getElementById('userActivities').textContent = currentUser.activitiesCompleted;
        document.getElementById('profileUsername').textContent = currentUser.username;
        document.getElementById('profileRole').textContent = currentUser.role;
        document.getElementById('profileGrade').textContent = currentUser.grade || 'N/A';
        document.getElementById('profileJoinDate').textContent = new Date(currentUser.joinDate).toLocaleDateString();
        
        // Get user rank
        const leaderboardResponse = await fetch(`${API_BASE}/leaderboard/individual`);
        const leaderboard = await leaderboardResponse.json();
        const userRank = leaderboard.findIndex(user => user.id === currentUser.id) + 1;
        document.getElementById('userRank').textContent = userRank || '-';
        
    } catch (error) {
        showMessage('Error loading dashboard', 'error');
    }
}

// Activities
async function handleActivitySubmit(e) {
    e.preventDefault();
    
    const formData = {
        userId: currentUser.id,
        type: document.getElementById('activityType').value,
        duration: document.getElementById('activityDuration').value,
        intensity: document.getElementById('activityIntensity').value,
        points: calculatePoints(
            document.getElementById('activityType').value,
            document.getElementById('activityDuration').value,
            document.getElementById('activityIntensity').value
        )
    };

    try {
        const response = await fetch(`${API_BASE}/activities`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();
        
        if (response.ok) {
            showMessage('Activity logged successfully!', 'success');
            document.getElementById('activityForm').reset();
            loadActivities();
        } else {
            showMessage(data.error || 'Failed to log activity', 'error');
        }
    } catch (error) {
        showMessage('Network error. Please try again.', 'error');
    }
}

function calculatePoints(type, duration, intensity) {
    let basePoints = parseInt(duration);
    
    // Activity type multiplier
    const typeMultipliers = {
        'running': 1.5,
        'cycling': 1.3,
        'swimming': 1.8,
        'strength': 1.4,
        'yoga': 1.1,
        'walking': 1.0,
        'sports': 1.6
    };
    
    // Intensity multiplier
    const intensityMultipliers = {
        'low': 1.0,
        'medium': 1.3,
        'high': 1.6
    };
    
    return Math.round(basePoints * (typeMultipliers[type] || 1) * (intensityMultipliers[intensity] || 1));
}

async function loadActivities() {
    if (!currentUser) return;
    
    try {
        const response = await fetch(`${API_BASE}/activities/${currentUser.id}`);
        const activities = await response.json();
        
        const container = document.getElementById('recentActivities');
        container.innerHTML = '';
        
        if (activities.length === 0) {
            container.innerHTML = '<p>No activities logged yet. Start by logging your first activity!</p>';
            return;
        }
        
        activities.slice(-10).reverse().forEach(activity => {
            const activityElement = document.createElement('div');
            activityElement.className = 'activity-item';
            activityElement.innerHTML = `
                <div class="activity-info">
                    <span><strong>${activity.type}</strong></span>
                    <span>${activity.duration} min</span>
                    <span>${activity.intensity} intensity</span>
                    <span>${new Date(activity.date).toLocaleDateString()}</span>
                </div>
                <div class="activity-points">${activity.points} pts</div>
            `;
            container.appendChild(activityElement);
        });
    } catch (error) {
        showMessage('Error loading activities', 'error');
    }
}

// Teams
async function handleTeamCreation(e) {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('teamName').value,
        description: document.getElementById('teamDescription').value,
        createdBy: currentUser.id
    };

    try {
        const response = await fetch(`${API_BASE}/teams`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();
        
        if (response.ok) {
            showMessage('Team created successfully!', 'success');
            document.getElementById('teamForm').reset();
            loadTeams();
        } else {
            showMessage(data.error || 'Failed to create team', 'error');
        }
    } catch (error) {
        showMessage('Network error. Please try again.', 'error');
    }
}

async function loadTeams() {
    try {
        const response = await fetch(`${API_BASE}/teams`);
        const teams = await response.json();
        
        const container = document.getElementById('teamsList');
        container.innerHTML = '';
        
        if (teams.length === 0) {
            container.innerHTML = '<p>No teams available. Create the first team!</p>';
            return;
        }
        
        teams.forEach(team => {
            const teamElement = document.createElement('div');
            teamElement.className = 'team-item';
            teamElement.innerHTML = `
                <h4>${team.name}</h4>
                <p>${team.description}</p>
                <p><strong>Members:</strong> ${team.members.length}</p>
                <p><strong>Created:</strong> ${new Date(team.createdDate).toLocaleDateString()}</p>
                ${!team.members.includes(currentUser.id) ? 
                    `<button onclick="joinTeam(${team.id})">Join Team</button>` : 
                    '<span style="color: green;">✓ Already a member</span>'
                }
            `;
            container.appendChild(teamElement);
        });
    } catch (error) {
        showMessage('Error loading teams', 'error');
    }
}

async function joinTeam(teamId) {
    try {
        const response = await fetch(`${API_BASE}/teams/${teamId}/join`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId: currentUser.id })
        });

        const data = await response.json();
        
        if (response.ok) {
            showMessage('Joined team successfully!', 'success');
            loadTeams();
        } else {
            showMessage(data.error || 'Failed to join team', 'error');
        }
    } catch (error) {
        showMessage('Network error. Please try again.', 'error');
    }
}

// Leaderboards
function switchLeaderboardTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.leaderboard-tab').forEach(tab => tab.classList.remove('active'));
    
    document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
    document.getElementById(`${tab}Leaderboard`).classList.add('active');
    
    if (tab === 'individual') {
        loadIndividualLeaderboard();
    } else {
        loadTeamLeaderboard();
    }
}

async function loadLeaderboards() {
    loadIndividualLeaderboard();
}

async function loadIndividualLeaderboard() {
    try {
        const response = await fetch(`${API_BASE}/leaderboard/individual`);
        const leaderboard = await response.json();
        
        const container = document.getElementById('individualList');
        container.innerHTML = '';
        
        leaderboard.forEach((user, index) => {
            const userElement = document.createElement('div');
            userElement.className = 'leaderboard-item';
            userElement.innerHTML = `
                <span class="rank">#${index + 1}</span>
                <span class="user-name">${user.username}</span>
                <span class="points">${user.totalPoints} pts</span>
            `;
            container.appendChild(userElement);
        });
    } catch (error) {
        showMessage('Error loading individual leaderboard', 'error');
    }
}

async function loadTeamLeaderboard() {
    try {
        const response = await fetch(`${API_BASE}/leaderboard/teams`);
        const leaderboard = await response.json();
        
        const container = document.getElementById('teamsList');
        container.innerHTML = '';
        
        leaderboard.forEach((team, index) => {
            const teamElement = document.createElement('div');
            teamElement.className = 'leaderboard-item';
            teamElement.innerHTML = `
                <span class="rank">#${index + 1}</span>
                <span class="user-name">${team.name}</span>
                <span class="points">${team.totalPoints} pts</span>
            `;
            container.appendChild(teamElement);
        });
    } catch (error) {
        showMessage('Error loading team leaderboard', 'error');
    }
}

// Workouts
async function loadWorkouts() {
    try {
        // Load personalized suggestions
        const suggestionsResponse = await fetch(`${API_BASE}/workouts/suggestions/${currentUser.id}`);
        const suggestions = await suggestionsResponse.json();
        
        const suggestionsContainer = document.getElementById('personalizedWorkouts');
        suggestionsContainer.innerHTML = '';
        
        if (suggestions.length === 0) {
            suggestionsContainer.innerHTML = '<p>Complete some activities to get personalized suggestions!</p>';
        } else {
            const suggestionsGrid = document.createElement('div');
            suggestionsGrid.className = 'workout-grid';
            suggestions.forEach(workout => {
                suggestionsGrid.appendChild(createWorkoutCard(workout));
            });
            suggestionsContainer.appendChild(suggestionsGrid);
        }
        
        // Load all workouts
        const workoutsResponse = await fetch(`${API_BASE}/workouts`);
        const allWorkouts = await workoutsResponse.json();
        
        const allContainer = document.getElementById('allWorkouts');
        const allGrid = document.createElement('div');
        allGrid.className = 'workout-grid';
        
        allWorkouts.forEach(workout => {
            allGrid.appendChild(createWorkoutCard(workout));
        });
        
        allContainer.innerHTML = '';
        allContainer.appendChild(allGrid);
        
    } catch (error) {
        showMessage('Error loading workouts', 'error');
    }
}

function createWorkoutCard(workout) {
    const card = document.createElement('div');
    card.className = 'workout-card';
    card.innerHTML = `
        <h4>${workout.name}</h4>
        <div class="workout-meta">
            <span class="workout-type">${workout.type}</span>
            <span class="workout-duration">${workout.duration} min</span>
            <span class="workout-difficulty">${workout.difficulty}</span>
        </div>
        <div class="workout-description">${workout.description}</div>
    `;
    return card;
}

// Utility functions
function showMessage(message, type) {
    // Remove existing messages
    document.querySelectorAll('.message').forEach(msg => msg.remove());
    
    const messageElement = document.createElement('div');
    messageElement.className = `message ${type}`;
    messageElement.textContent = message;
    
    document.querySelector('.container').insertBefore(messageElement, document.querySelector('.container').firstChild);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        messageElement.remove();
    }, 5000);
}

// Logout function (can be called from console or added to UI)
function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    navigateToSection('auth');
    showMessage('Logged out successfully', 'success');
}