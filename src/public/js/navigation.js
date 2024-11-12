document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
});

function checkAuth() {
    const token = localStorage.getItem('token');
    const protectedRoutes = ['/dashboard', '/posts', '/create'];
    const currentPath = window.location.pathname;

    if (protectedRoutes.includes(currentPath) && !token) {
        window.location.href = '/login';
    }

    if (['/login', '/register'].includes(currentPath) && token) {
        return;
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
}

window.logout = logout;

// Navigation state management
const navState = {
    isLoggedIn: () => Boolean(localStorage.getItem('token')),
    currentUser: () => JSON.parse(localStorage.getItem('user') || '{}')
};

// Update navigation based on auth state
function updateNavigation() {
    const nav = document.querySelector('nav');
    if (!nav) return;

    nav.innerHTML = `
        <div class="max-w-6xl mx-auto px-4">
            <div class="flex justify-between">
                <div class="flex space-x-7">
                    <a href="/" class="flex items-center py-4">
                        <span class="font-semibold text-blue-500 text-lg">HeartLink</span>
                    </a>
                    <div class="flex items-center space-x-4">
                        <a href="/about" class="py-2 px-3 text-gray-500 hover:text-gray-700">About</a>
                        <a href="/kindness-map" class="py-2 px-3 text-gray-500 hover:text-gray-700">Kindness Map</a>
                        <a href="/stories" class="py-2 px-3 text-gray-500 hover:text-gray-700">Stories</a>
                        ${navState.isLoggedIn() ? `
                            <a href="/dashboard" class="py-2 px-3 text-gray-500 hover:text-gray-700">Dashboard</a>
                            <a href="/posts" class="py-2 px-3 text-gray-500 hover:text-gray-700">Posts</a>
                        ` : ''}
                    </div>
                </div>
                <div class="flex items-center space-x-3">
                    ${navState.isLoggedIn() ? `
                        <a href="/create" class="py-2 px-4 bg-green-500 text-white rounded hover:bg-green-600">Create Post</a>
                        <button onclick="logout()" class="py-2 px-4 text-gray-500 hover:text-gray-700">Logout</button>
                    ` : `
                        <a href="/login" class="py-2 px-4 text-gray-500 hover:text-gray-700">Log in</a>
                        <a href="/register" class="py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600">Join Now</a>
                    `}
                </div>
            </div>
        </div>
    `;
}