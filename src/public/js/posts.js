let currentPage = 1;
const postsPerPage = 10;

document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login';
        return;
    }

    loadPosts();
    setupFilterListeners();
});

function setupFilterListeners() {
    document.getElementById('typeFilter')?.addEventListener('change', () => applyFilters());
    document.getElementById('urgencyFilter')?.addEventListener('change', () => applyFilters());
    document.getElementById('statusFilter')?.addEventListener('change', () => applyFilters());
}

async function loadPosts(page = 1) {
    try {
        showLoading();
        const typeFilter = document.getElementById('typeFilter')?.value;
        const urgencyFilter = document.getElementById('urgencyFilter')?.value;
        const statusFilter = document.getElementById('statusFilter')?.value;

        const queryParams = new URLSearchParams({
            page,
            limit: postsPerPage,
            ...(typeFilter && { type: typeFilter }),
            ...(urgencyFilter && { urgency: urgencyFilter }),
            ...(statusFilter && { status: statusFilter })
        });

        const response = await fetch(`/api/posts?${queryParams}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch posts');
        }

        const data = await response.json();
        displayPosts(data.posts);
        displayPagination(data.currentPage, data.totalPages);
        hideLoading();
    } catch (error) {
        console.error('Error loading posts:', error);
        showNotification('Error loading posts', 'error');
        hideLoading();
    }
}

function displayPosts(posts) {
    const container = document.getElementById('postsContainer');
    if (!container) return;

    if (!posts.length) {
        container.innerHTML = `
            <div class="text-center py-8">
                <p class="text-gray-500">No posts found</p>
            </div>
        `;
        return;
    }

    container.innerHTML = posts.map(post => `
        <div class="glass-effect rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow mb-4">
            <div class="flex justify-between items-start">
                <div>
                    <h3 class="text-xl font-semibold text-gray-800">${post.title}</h3>
                    <p class="text-gray-600 mt-2">${post.content}</p>
                </div>
                <span class="badge ${getStatusBadgeClass(post.status)}">
                    <i class="fas ${getStatusIcon(post.status)} mr-1"></i>
                    ${post.status}
                </span>
            </div>
            <div class="mt-4 flex flex-wrap gap-2">
                <span class="badge badge-info">
                    <i class="fas fa-tag mr-1"></i>${post.type}
                </span>
                <span class="badge ${getUrgencyBadgeClass(post.urgency)}">
                    <i class="fas fa-exclamation-circle mr-1"></i>${post.urgency}
                </span>
                ${post.location ? `
                    <span class="badge badge-secondary">
                        <i class="fas fa-map-marker-alt mr-1"></i>${post.location}
                    </span>
                ` : ''}
            </div>
            <div class="mt-4 flex justify-between items-center text-sm text-gray-500">
                <span>
                    <i class="fas fa-user mr-1"></i>
                    ${post.isAnonymous ? 'Anonymous' : post.author?.name || 'Unknown'}
                </span>
                <span>
                    <i class="fas fa-clock mr-1"></i>
                    ${new Date(post.createdAt).toLocaleDateString()}
                </span>
            </div>
        </div>
    `).join('');
}

function displayPagination(currentPage, totalPages) {
    const pagination = document.getElementById('pagination');
    if (!pagination) return;

    let paginationHtml = '';

    if (totalPages > 1) {
        paginationHtml += `
            <button onclick="changePage(1)" class="px-3 py-1 rounded-md ${currentPage === 1 ? 'bg-blue-500 text-white' : 'bg-gray-200'}">
                <i class="fas fa-angle-double-left"></i>
            </button>
        `;

        for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalPages, currentPage + 2); i++) {
            paginationHtml += `
                <button onclick="changePage(${i})" class="px-3 py-1 rounded-md ${i === currentPage ? 'bg-blue-500 text-white' : 'bg-gray-200'}">
                    ${i}
                </button>
            `;
        }

        paginationHtml += `
            <button onclick="changePage(${totalPages})" class="px-3 py-1 rounded-md ${currentPage === totalPages ? 'bg-blue-500 text-white' : 'bg-gray-200'}">
                <i class="fas fa-angle-double-right"></i>
            </button>
        `;
    }

    pagination.innerHTML = paginationHtml;
}

function getStatusBadgeClass(status) {
    switch (status) {
        case 'OPEN': return 'badge-info';
        case 'IN_PROGRESS': return 'badge-warning';
        case 'COMPLETED': return 'badge-success';
        default: return 'badge-info';
    }
}

function getStatusIcon(status) {
    switch (status) {
        case 'OPEN': return 'fa-door-open';
        case 'IN_PROGRESS': return 'fa-spinner fa-spin';
        case 'COMPLETED': return 'fa-check-circle';
        default: return 'fa-info-circle';
    }
}

function getUrgencyBadgeClass(urgency) {
    switch (urgency) {
        case 'High': return 'badge-error';
        case 'Medium': return 'badge-warning';
        case 'Low': return 'badge-success';
        default: return 'badge-info';
    }
}

function changePage(page) {
    currentPage = page;
    loadPosts(page);
}

function applyFilters() {
    currentPage = 1;
    loadPosts(1);
}

function showLoading() {
    const container = document.getElementById('postsContainer');
    if (container) {
        container.innerHTML = `
            <div class="text-center py-8">
                <i class="fas fa-spinner fa-spin text-3xl text-blue-500"></i>
            </div>
        `;
    }
}

function hideLoading() {
    // Loading state is automatically removed when posts are displayed
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg ${
        type === 'success' ? 'bg-green-500' : 
        type === 'error' ? 'bg-red-500' : 
        'bg-blue-500'
    } text-white z-50`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
} 