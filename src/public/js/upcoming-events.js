document.addEventListener('DOMContentLoaded', () => {
    loadEvents();
    setupEventListeners();
});

// Get events from localStorage or initialize empty array
let events = JSON.parse(localStorage.getItem('events')) || [];

function loadEvents() {
    const container = document.getElementById('eventsContainer');
    const currentUser = JSON.parse(localStorage.getItem('user')); // Get current user info

    container.innerHTML = events.map(event => `
        <div class="glass-effect p-6 rounded-lg hover:shadow-lg transition-all">
            <div class="flex items-center gap-3 mb-4">
                <img src="${event.creator.avatar || '/images/default-avatar.png'}" alt="${event.creator.name}" 
                    class="w-10 h-10 rounded-full">
                <div>
                    <p class="font-medium">${event.creator.name}</p>
                    <p class="text-sm text-gray-500">Event Organizer</p>
                </div>
            </div>
            <h3 class="text-xl font-bold mb-2">${event.title}</h3>
            <p class="text-gray-600 mb-4">${event.description}</p>
            <div class="space-y-2 mb-4">
                <div class="flex items-center gap-2">
                    <i class="fas fa-calendar text-blue-500"></i>
                    <span>${new Date(event.date).toLocaleString()}</span>
                </div>
                <div class="flex items-center gap-2">
                    <i class="fas fa-map-marker-alt text-blue-500"></i>
                    <span>${event.location}</span>
                </div>
                <div class="flex items-center gap-2">
                    <i class="fas fa-users text-blue-500"></i>
                    <span>${event.currentParticipants}/${event.maxParticipants} participants</span>
                </div>
            </div>
            <div class="flex justify-between items-center">
                <span class="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm">
                    ${event.category}
                </span>
                ${currentUser?.id !== event.creator.id ? `
                    <button onclick="joinEvent(${event.id})" 
                        class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                        Join Event
                    </button>
                ` : `
                    <button onclick="editEvent(${event.id})" 
                        class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600">
                        Edit Event
                    </button>
                `}
            </div>
        </div>
    `).join('');
}

function setupEventListeners() {
    document.getElementById('searchEvent').addEventListener('input', filterEvents);
    document.getElementById('categoryFilter').addEventListener('change', filterEvents);
    document.getElementById('dateFilter').addEventListener('change', filterEvents);
    document.getElementById('createEventForm').addEventListener('submit', handleCreateEvent);
}

function filterEvents() {
    const searchTerm = document.getElementById('searchEvent').value.toLowerCase();
    const categoryFilter = document.getElementById('categoryFilter').value;
    const dateFilter = document.getElementById('dateFilter').value;

    const filteredEvents = events.filter(event => {
        const matchesSearch = event.title.toLowerCase().includes(searchTerm) ||
                            event.description.toLowerCase().includes(searchTerm);
        const matchesCategory = !categoryFilter || event.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const container = document.getElementById('eventsContainer');
    // Reuse the same rendering logic with filtered events
    container.innerHTML = filteredEvents.map(/* ... same mapping function as in loadEvents ... */);
}

function openCreateEventModal() {
    document.getElementById('createEventModal').classList.remove('hidden');
    document.getElementById('createEventModal').classList.add('flex');
}

function closeCreateEventModal() {
    document.getElementById('createEventModal').classList.add('hidden');
    document.getElementById('createEventModal').classList.remove('flex');
    document.getElementById('createEventForm').reset();
}

async function handleCreateEvent(e) {
    e.preventDefault();

    const currentUser = JSON.parse(localStorage.getItem('user'));
    if (!currentUser) {
        alert('Please login to create an event');
        return;
    }

    const newEvent = {
        id: Date.now(), // Use timestamp as unique ID
        title: document.getElementById('eventTitle').value,
        category: document.getElementById('eventCategory').value,
        date: document.getElementById('eventDateTime').value,
        location: document.getElementById('eventLocation').value,
        description: document.getElementById('eventDescription').value,
        maxParticipants: parseInt(document.getElementById('eventMaxParticipants').value),
        currentParticipants: 0,
        creator: {
            id: currentUser.id,
            name: currentUser.name,
            avatar: currentUser.avatar || '/images/default-avatar.png'
        }
    };

    try {
        // Add new event to the events array
        events.push(newEvent);
        // Save to localStorage
        localStorage.setItem('events', JSON.stringify(events));
        
        alert('Event created successfully!');
        closeCreateEventModal();
        loadEvents(); // Reload the events list
    } catch (error) {
        console.error('Error creating event:', error);
        alert('Failed to create event. Please try again.');
    }
}

async function joinEvent(eventId) {
    try {
        const eventIndex = events.findIndex(e => e.id === eventId);
        if (eventIndex === -1) {
            throw new Error('Event not found');
        }

        if (events[eventIndex].currentParticipants >= events[eventIndex].maxParticipants) {
            alert('Event is full!');
            return;
        }

        events[eventIndex].currentParticipants++;
        localStorage.setItem('events', JSON.stringify(events));
        
        alert('Successfully joined the event!');
        loadEvents();
    } catch (error) {
        console.error('Error joining event:', error);
        alert('Failed to join event. Please try again.');
    }
}

async function editEvent(eventId) {
    // Implement edit event functionality
    console.log('Editing event:', eventId);
} 