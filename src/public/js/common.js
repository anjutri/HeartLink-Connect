// Common navigation component
function initializeCommonUI() {
    // Add navigation to all pages
    const nav = document.querySelector('nav');
    if (nav) {
        nav.innerHTML = createNavigation();
    }

    // Add footer to all pages
    const footer = document.querySelector('footer');
    if (footer) {
        footer.innerHTML = createFooter();
    }
}

function createNavigation() {
    const token = localStorage.getItem('token');
    return `
        <div class="glass-effect shadow-lg">
            <div class="max-w-6xl mx-auto px-4">
                <div class="flex justify-between items-center py-4">
                    <div class="flex items-center space-x-4">
                        <a href="/" class="flex items-center space-x-2">
                            <i class="fas fa-heart text-red-500 text-2xl"></i>
                            <span class="font-bold text-2xl text-blue-600">HeartLink</span>
                        </a>
                        <div class="flex items-center space-x-4">
                            <a href="/about" class="nav-link">About</a>
                            <a href="/kindness-map" class="nav-link">Kindness Map</a>
                            <a href="/stories" class="nav-link">Stories</a>
                            ${token ? `
                                <a href="/dashboard" class="nav-link">Dashboard</a>
                                <a href="/posts" class="nav-link">Posts</a>
                                <a href="/create-post" class="nav-link">Create Post</a>
                            ` : ''}
                        </div>
                    </div>
                    <div class="flex items-center space-x-4">
                        ${token ? `
                            
                            <button onclick="logout()" class="btn btn-secondary">Logout</button>
                        ` : `
                            <a href="/login" class="nav-link">Log in</a>
                            <a href="/register" class="btn btn-primary">Join Now</a>
                        `}
                    </div>
                </div>
            </div>
        </div>
    `;
}

function createFooter() {
    return `
        <div class="glass-effect mt-8">
            <div class="max-w-6xl mx-auto px-4 py-6">
                <div class="text-center">
                    <p class="text-gray-600 mb-2">© 2024 HeartLink. All rights reserved.</p>
                    <p class="text-sm text-gray-500">
                        Academic Project - AKS UNIVERSITY, SATNA<br>
                        5th BTECH (CSE)<br>
                        Submitted by: Anjali Tripathi (B2255R10106169)
                    </p>
                </div>
            </div>
        </div>
    `;
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeCommonUI); 