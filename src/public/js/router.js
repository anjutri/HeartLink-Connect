// Simple client-side router
class Router {
    constructor() {
        this.routes = {
            '/': 'index.html',
            '/login': 'login.html',
            '/register': 'register.html',
            '/dashboard': 'dashboard.html',
            '/about': 'about.html',
            '/kindness-map': 'kindness-map.html',
            '/stories': 'stories.html',
            '/posts': 'posts.html'
        };

        // Handle navigation clicks
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-nav]')) {
                e.preventDefault();
                const path = e.target.getAttribute('data-nav');
                this.navigateTo(path);
            }
        });
    }

    navigateTo(pathname) {
        const token = localStorage.getItem('token');
        const protectedRoutes = ['/dashboard', '/posts', '/kindness-map', '/stories'];
        
        if (protectedRoutes.includes(pathname) && !token) {
            window.location.href = '/login';
            return;
        }

        window.location.href = pathname;
    }
}

// Initialize router
const router = new Router();
window.router = router;