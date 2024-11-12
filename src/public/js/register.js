let currentStep = 1;
const totalSteps = 3;

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    if (token) {
        window.location.href = '/dashboard';
        return;
    }

    // Get the selected role from localStorage
    const selectedRole = localStorage.getItem('selectedRole');
    if (selectedRole) {
        document.querySelector(`[data-role="${selectedRole}"]`)?.classList.add('selected');
    }

    updateStepIndicators();
});

function selectRole(role) {
    // Remove selected class from all options
    document.querySelectorAll('.role-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    // Add selected class to chosen option
    document.querySelector(`[data-role="${role}"]`).classList.add('selected');
    localStorage.setItem('selectedRole', role);
}

function nextStep() {
    if (currentStep === 1 && !localStorage.getItem('selectedRole')) {
        showError('Please select a role to continue');
        return;
    }

    if (currentStep < totalSteps) {
        document.getElementById(`step${currentStep}`).classList.add('hidden');
        currentStep++;
        document.getElementById(`step${currentStep}`).classList.remove('hidden');
        updateStepIndicators();
        updateButtons();
    } else {
        handleRegistration();
    }
}

function prevStep() {
    if (currentStep > 1) {
        document.getElementById(`step${currentStep}`).classList.add('hidden');
        currentStep--;
        document.getElementById(`step${currentStep}`).classList.remove('hidden');
        updateStepIndicators();
        updateButtons();
    }
}

function updateStepIndicators() {
    document.querySelectorAll('.step').forEach((step, index) => {
        if (index + 1 < currentStep) {
            step.classList.add('completed');
            step.classList.remove('active');
        } else if (index + 1 === currentStep) {
            step.classList.add('active');
            step.classList.remove('completed');
        } else {
            step.classList.remove('active', 'completed');
        }
    });
}

function updateButtons() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    prevBtn.classList.toggle('hidden', currentStep === 1);
    nextBtn.textContent = currentStep === totalSteps ? 'Complete Registration' : 'Next';
}

async function handleRegistration(event) {
    if (event) event.preventDefault();
    
    try {
        // Get form data
        const formData = {
            role: localStorage.getItem('selectedRole'),
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            password: document.getElementById('password').value,
            bio: document.getElementById('bio').value,
            location: document.getElementById('location').value,
            interests: Array.from(document.querySelectorAll('input[name="interests"]:checked')).map(cb => cb.value)
        };

        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        const data = await response.json();
        console.log("Data:", data);
        if (response.ok) {
            // Show success popup with custom styling
            const popup = createPopup({
                title: 'Registration Successful! 🎉',
                message: 'Your account has been created successfully. Redirecting to login...',
                type: 'success'
            });
            
            document.body.appendChild(popup);

            // Redirect to login page after 3 seconds
            setTimeout(() => {
                window.location.href = '/login';
            }, 3000);
        } else {
            createPopup({
                title: 'Registration Failed',
                message: data.message || 'Registration failed. Please try again.',
                type: 'error'
            });
        }
    } catch (error) {
        console.error('Registration error:', error);
        createPopup({
            title: 'Error',
            message: 'An error occurred during registration',
            type: 'error'
        });
    }
}

function createPopup({ title, message, type = 'success' }) {
    // Create popup container
    const popup = document.createElement('div');
    popup.className = `fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
        ${type === 'success' ? 'bg-white' : 'bg-white'} 
        rounded-lg shadow-2xl z-50 p-6 max-w-md w-full mx-4 border-t-4
        ${type === 'success' ? 'border-green-500' : 'border-red-500'}`;
    
    // Add content
    popup.innerHTML = `
        <div class="text-center">
            <div class="w-16 h-16 rounded-full bg-${type === 'success' ? 'green' : 'red'}-100 mx-auto mb-4 flex items-center justify-center">
                <i class="fas ${type === 'success' ? 'fa-check' : 'fa-times'} text-2xl text-${type === 'success' ? 'green' : 'red'}-500"></i>
            </div>
            <h3 class="text-xl font-bold mb-2 text-gray-800">${title}</h3>
            <p class="text-gray-600">${message}</p>
            ${type === 'success' ? '<div class="mt-3"><div class="loader"></div></div>' : ''}
        </div>
    `;

    // Add animation styles
    popup.style.animation = 'fadeInScale 0.3s ease-out forwards';

    // Add overlay
    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 bg-black bg-opacity-50 z-40';
    overlay.style.animation = 'fadeIn 0.3s ease-out forwards';
    document.body.appendChild(overlay);

    // Add animation styles to document
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeInScale {
            from { 
                opacity: 0; 
                transform: translate(-50%, -50%) scale(0.95);
            }
            to { 
                opacity: 1; 
                transform: translate(-50%, -50%) scale(1);
            }
        }
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        .loader {
            width: 40px;
            height: 40px;
            border: 3px solid #f3f3f3;
            border-top: 3px solid #3498db;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);

    return popup;
}

// Add event listener to registration form
document.addEventListener('DOMContentLoaded', () => {
    const registrationForm = document.getElementById('registrationForm');
    if (registrationForm) {
        registrationForm.addEventListener('submit', handleRegistration);
    }
});

function showError(message) {
    const errorMessage = document.getElementById('errorMessage');
    if (errorMessage) {
        errorMessage.textContent = message;
        errorMessage.classList.remove('hidden');
        setTimeout(() => {
            errorMessage.classList.add('hidden');
        }, 3000);
    }
}