function checkAuth() {
    const protectedRoutes = ['/dashboard', '/posts', '/create', '/kindness-map'];
    const currentPath = window.location.pathname;
    const token = localStorage.getItem('token');

    if (protectedRoutes.includes(currentPath) && !token) {
        window.location.href = '/login';
        return false;
    }

    if ((currentPath === '/login' || currentPath === '/register') && token) {
        window.location.href = '/dashboard';
        return false;
    }

    return true;
}

// Add this to prevent infinite redirects
let lastRedirectTime = 0;
function safeRedirect(url) {
    const now = Date.now();
    if (now - lastRedirectTime > 1000) { // Prevent redirects within 1 second
        lastRedirectTime = now;
        window.location.href = url;
    }
} 