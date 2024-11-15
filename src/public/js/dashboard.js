let dashboardInitialized = false;

async function initializeDashboard() {
    if (window.location.pathname !== '/dashboard') return;
    
    if (dashboardInitialized) return;
    
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.replace('/login');
            return;
        }

        dashboardInitialized = true;
        await Promise.all([
            fetchDashboardData(),
            fetchUserProfile(),
            fetchRecentPosts()
        ]);
    } catch (error) {
        console.error('Error initializing dashboard:', error);
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.replace('/login');
        }
    }
}

async function fetchDashboardData() {
    try {
        const response = await fetch('/api/dashboard/stats', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Cache-Control': 'no-cache'
            }
        });

        if (!response.ok) throw new Error('Failed to fetch dashboard data');

        const data = await response.json();
        updateDashboardUI(data);
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
    }
}

async function fetchUserProfile() {
    try {
        const response = await fetch('/api/users/profile', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        const user = await response.json();
        
        const profileHtml = `
            <div class="text-center">
                <div class="mb-4">
                    <img src="/images/default-avatar.png" 
                         alt="Profile" 
                         class="w-24 h-24 rounded-full mx-auto">
                </div>
                <h3 class="text-xl font-semibold">${user.name}</h3>
                <p class="text-gray-500">${user.email}</p>
                <div class="mt-4">
                    <p class="text-sm text-gray-600">${user.bio || 'No bio added yet'}</p>
                    <p class="text-sm text-gray-600 mt-2">
                        <i class="fas fa-map-marker-alt mr-1"></i>
                        ${user.location || 'Location not set'}
                    </p>
                </div>
                <button onclick="editProfile()" class="btn btn-primary mt-4">
                    <i class="fas fa-edit mr-1"></i>Edit Profile
                </button>
            </div>
        `;
        
        document.getElementById('userProfile').innerHTML = profileHtml;
    } catch (error) {
        console.error('Error fetching user profile:', error);
    }
}

async function fetchRecentPosts() {
    try {
        const response = await fetch('/api/posts?limit=5', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        const posts = await response.json();
        
        const postsHtml = posts.map(post => `
            <div class="post-card">
                <div class="flex justify-between items-start">
                    <div>
                        <h3 class="text-lg font-semibold">${post.title}</h3>
                        <p class="text-gray-600 text-sm">${post.content.substring(0, 100)}...</p>
                    </div>
                    <span class="badge ${getStatusBadgeClass(post.status)}">
                        ${post.status}
                    </span>
                </div>
                <div class="mt-4 flex justify-between items-center">
                    <span class="text-sm text-gray-500">
                        ${new Date(post.createdAt).toLocaleDateString()}
                    </span>
                    <a href="/posts/${post.id}" class="text-blue-500 hover:text-blue-600">
                        View Details →
                    </a>
                </div>
            </div>
        `).join('');
        
        document.getElementById('recentPosts').innerHTML = postsHtml;
    } catch (error) {
        console.error('Error fetching recent posts:', error);
    }
}

function getStatusBadgeClass(status) {
    switch (status) {
        case 'OPEN':
            return 'badge-info';
        case 'IN_PROGRESS':
            return 'badge-warning';
        case 'COMPLETED':
            return 'badge-success';
        default:
            return 'badge-info';
    }
}

function logout() {
    localStorage.removeItem('token');
    window.location.href = '/login';
}

function editProfile() {
    window.location.href = '/profile/edit';
}

let charts = {
    totalActs: null,
    activeRequests: null,
    completedActs: null,
    activity: null,
    category: null
};

function initializeCharts(data) {
    // Destroy existing charts
    Object.values(charts).forEach(chart => {
        if (chart) chart.destroy();
    });

    // Mini line charts for stats
    const miniChartConfig = {
        type: 'line',
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { display: false },
                y: { display: false }
            },
            elements: {
                point: { radius: 0 },
                line: { tension: 0.4 }
            }
        }
    };

    // Total Acts Chart
    charts.totalActs = new Chart(document.getElementById('totalActsChart'), {
        ...miniChartConfig,
        data: {
            labels: data.activityData.labels,
            datasets: [{
                data: data.activityData.newActs,
                borderColor: '#3B82F6',
                fill: false
            }]
        }
    });

    // Active Requests Chart
    charts.activeRequests = new Chart(document.getElementById('activeRequestsChart'), {
        ...miniChartConfig,
        data: {
            labels: data.activityData.labels,
            datasets: [{
                data: data.activityData.newActs,
                borderColor: '#10B981',
                fill: false
            }]
        }
    });

    // Completed Acts Chart
    charts.completedActs = new Chart(document.getElementById('completedActsChart'), {
        ...miniChartConfig,
        data: {
            labels: data.activityData.labels,
            datasets: [{
                data: data.activityData.completedActs,
                borderColor: '#8B5CF6',
                fill: false
            }]
        }
    });

    // Activity Overview Chart
    charts.activity = new Chart(document.getElementById('activityChart'), {
        type: 'bar',
        data: {
            labels: data.activityData.labels,
            datasets: [
                {
                    label: 'New Acts',
                    data: data.activityData.newActs,
                    backgroundColor: 'rgba(59, 130, 246, 0.5)',
                    borderColor: 'rgba(59, 130, 246, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Completed Acts',
                    data: data.activityData.completedActs,
                    backgroundColor: 'rgba(139, 92, 246, 0.5)',
                    borderColor: 'rgba(139, 92, 246, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 20
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });

    // Category Distribution Chart
    charts.category = new Chart(document.getElementById('categoryChart'), {
        type: 'doughnut',
        data: {
            labels: data.categoryData.map(cat => cat.label),
            datasets: [{
                data: data.categoryData.map(cat => cat.value),
                backgroundColor: [
                    'rgba(59, 130, 246, 0.5)',
                    'rgba(16, 185, 129, 0.5)',
                    'rgba(139, 92, 246, 0.5)',
                    'rgba(107, 114, 128, 0.5)'
                ],
                borderColor: [
                    'rgba(59, 130, 246, 1)',
                    'rgba(16, 185, 129, 1)',
                    'rgba(139, 92, 246, 1)',
                    'rgba(107, 114, 128, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        usePointStyle: true,
                        padding: 20
                    }
                }
            }
        }
    });
}

// Add this function to handle profile picture upload
async function uploadProfilePicture(file) {
    try {
        const formData = new FormData();
        formData.append('profilePicture', file);

        const response = await fetch('/api/users/profile/picture', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: formData
        });

        const data = await response.json();

        if (response.ok) {
            // Update profile picture in UI
            document.getElementById('profileImage').src = data.imageUrl;
            showNotification('Profile picture updated successfully', 'success');
        } else {
            showNotification(data.message || 'Failed to update profile picture', 'error');
        }
    } catch (error) {
        console.error('Error uploading profile picture:', error);
        showNotification('Error uploading profile picture', 'error');
    }
}

// Add this function to show notifications
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg ${
        type === 'success' ? 'bg-green-500' : 
        type === 'error' ? 'bg-red-500' : 
        'bg-blue-500'
    } text-white`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

// Add this function to handle profile picture change
function handleProfilePictureChange(event) {
    const file = event.target.files[0];
    if (file) {
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            showNotification('File size should be less than 5MB', 'error');
            return;
        }
        if (!file.type.startsWith('image/')) {
            showNotification('Please upload an image file', 'error');
            return;
        }
        uploadProfilePicture(file);
    }
}

// Add this function to your existing dashboard.js
function loadUserEvents() {
    const userEvents = [
        {
            title: "Community Food Drive",
            date: "2024-04-15",
            time: "10:00 AM - 11:00 AM",
            role: "Volunteer",
            status: "Confirmed"
        }
        // Add more registered events
    ];

    const container = document.getElementById('userEvents');
    container.innerHTML = userEvents.map(event => `
        <div class="flex items-center justify-between p-4 bg-white rounded-lg shadow">
            <div>
                <h3 class="font-bold">${event.title}</h3>
                <p class="text-gray-600">${event.date} | ${event.time}</p>
                <p class="text-sm">Role: ${event.role}</p>
            </div>
            <div>
                <span class="px-3 py-1 bg-green-100 text-green-800 rounded-full">
                    ${event.status}
                </span>
            </div>
        </div>
    `).join('');
}

// Call this function when the dashboard loads
document.addEventListener('DOMContentLoaded', () => {
    // ... existing dashboard initialization code ...
    loadUserEvents();
}); 