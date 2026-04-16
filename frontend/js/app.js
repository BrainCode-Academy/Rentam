// --- 1. GLOBAL PROPERTY DATABASE (Simulates Backend for immediate UI/AI) ---
const universitiesList = [
    "UNILAG", "OAU", "UNN", "ABU Zaria", "UNIZIK", "Nwafor Orizu College, Nsugbe", "UNIPORT", "FUTO", "UI", "UNIBEN",
    "Covenant University", "Babcock University", "UNILORIN", "FUTA", "FUTMINNA", "UNIABUJA", "BUK Kano", "UNICAL", "UNIJOS", "UNIUYO",
    "LASU", "OOU", "DELSU", "RSU", "AAU Ekpoma", "AAUA", "EKSU", "NSUK", "KWASU", "ESUT", "KUST", "IMSU", "KASU", "ABSU", "COOU",
    "UNIMAID", "UDUSOK", "FUNAAB", "MOUAU", "FUPRE", "ABUAD", "Igbo Eze North COE", "FCE Akoka", "Fed Poly Nekede", "YABATECH",
    "Kaduna Poly", "Fed Poly Oko", "IMT Enugu", "Auchi Poly", "NDU"
];

// Generate 100 properties (2 for each school) dynamically for frontend UI if the backend isn't connected
const mockProperties = [];
const sampleImages = [
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500",
    "https://images.unsplash.com/photo-1554995207-c18c203602cb?w=500",
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500",
    "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=500",
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500"
];

universitiesList.forEach((uni, index) => {
    mockProperties.push({
        id: index * 2 + 1,
        title: `Premium Self-Contain Near ${uni}`,
        price: 150000 + (Math.floor(Math.random() * 50) * 1000), // Random prices
        location: uni,
        type: 'self-contain',
        image: sampleImages[index % 5]
    });
    mockProperties.push({
        id: index * 2 + 2,
        title: `Student Hostel space at ${uni}`,
        price: 80000 + (Math.floor(Math.random() * 40) * 1000), 
        location: uni,
        type: 'hostel',
        image: sampleImages[(index + 1) % 5]
    });
});

// --- 2. SESSION & AUTH MANAGEMENT ---
function getAuthData() {
    const token = localStorage.getItem('rentamToken');
    const role = localStorage.getItem('rentamRole');
    const name = localStorage.getItem('rentamName');
    return { token, role, name };
}

function updateNavbar() {
    const { token, role, name } = getAuthData();
    const authSection = document.getElementById('auth-section');
    if (!authSection) return;

    if (token) {
        let dashboardPage = 'user-dashboard.html';
        if (role === 'admin') dashboardPage = 'admin-dashboard.html';
        if (role === 'agent') dashboardPage = 'agent-dashboard.html';

        authSection.innerHTML = `
            <li class="nav-item">
                <a class="nav-link px-3 fw-bold" href="${dashboardPage}">
                    <i class="fas fa-user-circle me-1"></i> ${name.split(' ')[0]}
                </a>
            </li>
            <li class="nav-item">
                <a class="nav-link btn btn-outline-danger btn-sm ms-lg-3 py-1" href="#" onclick="logout()">Logout</a>
            </li>
        `;
    }
}

function logout() {
    localStorage.removeItem('rentamToken');
    localStorage.removeItem('rentamRole');
    localStorage.removeItem('rentamName');
    alert('Logged out successfully');
    window.location.href = 'index.html';
}

function requireAuth(roleRequired = null) {
    const { token, role } = getAuthData();
    if (!token) {
        window.location.href = 'login.html';
        return false;
    }
    if (roleRequired && role !== roleRequired) {
        alert('Unauthorized access');
        window.location.href = 'index.html';
        return false;
    }
    return true;
}

// --- 3. INITIALIZE DOM DROPDOWNS & SIDEBARS ---
document.addEventListener('DOMContentLoaded', async () => {
    updateNavbar();
    
    // Check for dashboard protection
    const path = window.location.pathname;
    if (path.includes('user-dashboard')) requireAuth('user');
    if (path.includes('admin-dashboard')) requireAuth('admin');
    if (path.includes('agent-dashboard')) requireAuth('agent');

    // Populate Index Search Dropdown
    const indexSelect = document.querySelector('.search-select');
    if (indexSelect) {
        indexSelect.innerHTML = `<option selected value="">Select State / Institution</option>`;
        universitiesList.forEach(uni => {
            const option = document.createElement('option');
            option.value = uni;
            option.textContent = uni;
            indexSelect.appendChild(option);
        });
    }

    // Populate Listings.html Sidebar Checkboxes
    const filterSidebar = document.querySelector('.filter-location-list');
    const listingsContainer = document.getElementById('listings-container');

    if (filterSidebar) {
        filterSidebar.innerHTML = '';
        universitiesList.forEach((uni, idx) => {
            filterSidebar.innerHTML += `
                <div class="form-check">
                    <input class="form-check-input loc-checkbox" type="checkbox" value="${uni}" id="loc${idx}" onchange="applyFilters()">
                    <label class="form-check-label" for="loc${idx}">${uni}</label>
                </div>
            `;
        });
    }

    // Fetch and Render Properties
    if (listingsContainer || document.getElementById('featured-listings')) {
        await fetchAndRenderProperties();
    }
});

async function fetchAndRenderProperties() {
    const listingsContainer = document.getElementById('listings-container');
    const featuredContainer = document.getElementById('featured-listings');
    
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const location = urlParams.get('location');
        const type = urlParams.get('type');
        const price = urlParams.get('price');

        let apiUrl = '/api/properties?status=active';
        if (location) apiUrl += `&location=${encodeURIComponent(location)}`;
        if (type) apiUrl += `&type=${encodeURIComponent(type)}`;
        if (price) apiUrl += `&maxPrice=${price}`;

        const response = await fetch(apiUrl);
        let properties = [];
        
        if (response.ok) {
            properties = await response.json();
        }

        // Fallback to Mocks if DB is empty or backend is down (for demo purposes)
        if (properties.length === 0) {
            console.log("No backend properties found, using mocks.");
            properties = mockProperties;
            
            // Filter mocks if URL params exist
            if (location || type || price) {
                properties = properties.filter(p => {
                    const matchesLocation = !location || p.location.includes(location);
                    const matchesType = !type || p.type === type;
                    const matchesPrice = !price || p.price <= parseInt(price);
                    return matchesLocation && matchesType && matchesPrice;
                });
            }
        }

        if (listingsContainer) renderProperties(properties, 'listings-container');
        if (featuredContainer) renderProperties(properties.slice(0, 6), 'featured-listings');

    } catch (err) {
        console.error("Error fetching properties:", err);
        if (listingsContainer) renderProperties(mockProperties, 'listings-container');
        if (featuredContainer) renderProperties(mockProperties.slice(0, 6), 'featured-listings');
    }
}


// --- 4. FILTERING LOGIC (For listings.html) ---
async function applyFilters() {
    const listingsContainer = document.getElementById('listings-container');
    if (!listingsContainer) return;

    // Get Checked Locations
    const locCheckboxes = document.querySelectorAll('.loc-checkbox:checked');
    const selectedLocations = Array.from(locCheckboxes).map(cb => cb.value);

    // Get Price
    const maxPrice = document.getElementById('priceRange') ? parseInt(document.getElementById('priceRange').value) : 1000000;
    
    if(document.getElementById('priceDisplay')) {
        document.getElementById('priceDisplay').innerText = `₦${maxPrice.toLocaleString()}`;
    }

    // Since we want dynamic filtering, we fetch from API or filter local list
    // For now, let's filter the current view or re-fetch with query params
    const type = new URLSearchParams(window.location.search).get('type');
    
    let apiUrl = `/api/properties?status=active&maxPrice=${maxPrice}`;
    if (selectedLocations.length > 0) apiUrl += `&location=${encodeURIComponent(selectedLocations[0])}`; // Simplifying for now
    if (type) apiUrl += `&type=${encodeURIComponent(type)}`;

    try {
        const response = await fetch(apiUrl);
        let properties = [];
        if (response.ok) properties = await response.json();

        if (properties.length === 0) {
            // Fallback filtering on mocks
            properties = mockProperties.filter(p => {
                const matchesLocation = selectedLocations.length === 0 || selectedLocations.includes(p.location);
                const matchesPrice = p.price <= maxPrice;
                return matchesLocation && matchesPrice;
            });
        }
        renderProperties(properties, 'listings-container');
    } catch (err) {
        const properties = mockProperties.filter(p => {
            const matchesLocation = selectedLocations.length === 0 || selectedLocations.includes(p.location);
            const matchesPrice = p.price <= maxPrice;
            return matchesLocation && matchesPrice;
        });
        renderProperties(properties, 'listings-container');
    }
}

function renderProperties(properties, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (properties.length === 0) {
        container.innerHTML = `<div class="col-12 text-center py-5">
            <h4 class="text-muted">Oops! No properties found.</h4>
            <br>
            <button class="btn btn-primary" onclick="window.location.href='listings.html'">View All</button>
        </div>`;
        return;
    }

    container.innerHTML = properties.map(p => {
        const image = p.image || (p.images && p.images.length > 0 ? p.images[0] : 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500');
        const price = p.price ? p.price.toLocaleString() : 'N/A';
        
        return `
        <div class="col-lg-4 col-md-6 mb-4">
            <div class="card property-card h-100">
                <div class="position-relative">
                    <img src="${image}" class="card-img-top" alt="${p.title}">
                    <div class="position-absolute top-0 end-0 p-2">
                        <span class="badge ${p.status === 'verified' ? 'bg-success' : 'bg-primary'}">${p.status === 'active' ? 'Verified' : 'New'}</span>
                    </div>
                </div>
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <span class="price-tag fw-bold">₦${price}/yr</span>
                    </div>
                    <h5 class="card-title fw-bold text-truncate">${p.title}</h5>
                    <p class="text-muted small mb-3"><i class="fas fa-map-marker-alt text-primary me-1"></i> ${p.location}</p>
                    <hr>
                    <div class="d-flex justify-content-between align-items-center">
                        <small class="text-muted text-truncate" style="max-width: 120px;">
                            <i class="fas fa-user-tie me-1"></i> ${p.agent && p.agent.name ? p.agent.name : 'Verified Agent'}
                        </small>
                        <a href="details.html?id=${p._id || p.id}" class="btn btn-outline-primary btn-sm rounded-pill">View Details</a>
                    </div>
                </div>
            </div>
        </div>
    `;}).join('');
}


// --- 4. AI AGENT "WINNER" LOGIC & INJECTION ---
function injectChatComponent() {
    if (document.getElementById('winner-chat-bubble')) return;

    const chatContainer = document.createElement('div');
    chatContainer.innerHTML = `
        <div id="winner-chat-bubble" onclick="toggleChat()" style="position: fixed; bottom: 30px; right: 30px; width: auto; padding: 12px 24px; background: linear-gradient(135deg, #FF7A00, #ff9a3d); border-radius: 30px; display: flex; justify-content: center; align-items: center; color: white; font-size: 16px; font-weight: 600; cursor: pointer; box-shadow: 0 4px 15px rgba(255, 122, 0, 0.4); z-index: 2000; transition: all 0.3s ease;">
            <i class="fas fa-robot me-2"></i>
            <span>Winner AI</span>
        </div>

        <div id="chat-window" style="position: fixed; bottom: 100px; right: 30px; width: 350px; height: 500px; background: white; border-radius: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.2); z-index: 2000; display: none; flex-direction: column; overflow: hidden; animation: slideUp 0.3s ease;">
            <div style="background: #0A2647; color: white; padding: 15px; display: flex; justify-content: space-between; align-items: center;">
                <span><i class="fas fa-robot me-2"></i> Winner AI (Customer Care)</span>
                <button class="btn btn-sm text-white" onclick="toggleChat()"><i class="fas fa-times"></i></button>
            </div>
            <div id="chat-content" style="flex: 1; padding: 15px; overflow-y: auto; background: #f8f9fa;">
                <div class="message winner" style="background: #e9ecef; padding: 12px; border-radius: 15px 15px 15px 0; margin-bottom: 12px; font-size: 14px; align-self: flex-start;">
                    <strong>Winner:</strong><br>
                    Hello! I'm Winner, your Rentam AI assistant. <br><br>
                    How can I help you find a house today?
                </div>
            </div>
            <div style="padding: 15px; border-top: 1px solid #eee; display: flex; gap: 10px;">
                <input type="text" id="user-input" class="form-control form-control-sm" placeholder="Ask about hostels/prices...">
                <button class="btn btn-primary btn-sm" onclick="sendMessage()"><i class="fas fa-paper-plane"></i></button>
                <button class="btn btn-outline-secondary btn-sm" onclick="startVoice()"><i class="fas fa-microphone"></i></button>
            </div>
        </div>
    `;
    document.body.appendChild(chatContainer);

    // Style for animation
    const style = document.createElement('style');
    style.innerHTML = `
        @keyframes slideUp { from { transform: translateY(50px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .message.user { background: #0A2647; color: white; padding: 12px; border-radius: 15px 15px 0 15px; margin-bottom: 12px; align-self: flex-end; margin-left: auto; font-size: 14px; max-width: 85%; }
        .message.winner { background: #e9ecef; color: #333; padding: 12px; border-radius: 15px 15px 15px 0; margin-bottom: 12px; align-self: flex-start; font-size: 14px; max-width: 85%; }
        #chat-content { display: flex; flex-direction: column; }
    `;
    document.head.appendChild(style);
}

function toggleChat() {
    const chatWindow = document.getElementById('chat-window');
    chatWindow.style.display = chatWindow.style.display === 'flex' ? 'none' : 'flex';
}

function sendMessage() {
    const userInput = document.getElementById('user-input');
    const text = userInput.value.trim();
    if (!text) return;
    appendMessage('user', text);
    userInput.value = '';

    setTimeout(() => {
        handleAIResponse(text);
    }, 800);
}

function appendMessage(sender, text) {
    const chatContent = document.getElementById('chat-content');
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message', sender);
    msgDiv.innerHTML = `<strong>${sender === 'winner' ? 'Winner' : 'You'}:</strong><br>${text}`;
    chatContent.appendChild(msgDiv);
    chatContent.scrollTop = chatContent.scrollHeight;
    
    if (sender === 'winner') {
        const cleanText = text.replace(/<[^>]+>/g, ' '); 
        speak(cleanText);
    }
}

async function handleAIResponse(input) {
    const chatContent = document.getElementById('chat-content');
    try {
        const typingId = 'typing-' + Date.now();
        const typingDiv = document.createElement('div');
        typingDiv.id = typingId;
        typingDiv.classList.add('message', 'winner');
        typingDiv.innerHTML = `<span class="spinner-grow spinner-grow-sm" role="status"></span> Thinking...`;
        chatContent.appendChild(typingDiv);
        chatContent.scrollTop = chatContent.scrollHeight;

        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: input })
        });
        
        document.getElementById(typingId).remove();

        if (response.ok) {
            const data = await response.json();
            appendMessage('winner', data.response);
        } else {
            throw new Error('API');
        }
        
    } catch (err) {
        // Remove typing indicator if exists
        const typing = chatContent.querySelector('.spinner-grow');
        if (typing) typing.parentElement.remove();

        // LOCAL INTELLIGENT FALLBACK
        const lower = input.toLowerCase();
        if (lower.includes('price') || lower.includes('cost')) {
            appendMessage('winner', "Hostels usually range from ₦80,000 to ₦150,000 per year, while Self-Contains are between ₦180,000 and ₦350,000 depending on the location.");
        } else if (lower.includes('register') || lower.includes('agent')) {
            appendMessage('winner', "To list your properties, join as an **Agent**! Click the 'Become an Agent' link in the menu to submit your ID for verification.");
        } else if (lower.includes('help') || lower.includes('winner')) {
            appendMessage('winner', "I am Winner, your housing assistant. I can help you search for hostels at any Nigerian university. Which school are you interested in?");
        } else {
            appendMessage('winner', "I'm checking our database for that! In the meantime, you can explore the 'Find House' page for all available listings.");
        }
    }
}

// --- 5. SPEECH & VOICE RECOGNITION API ---
function speak(text) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-NG';
        window.speechSynthesis.speak(utterance);
    }
}

function startVoice() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        alert("Your browser does not support voice recognition.");
        return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-NG';
    const userInput = document.getElementById('user-input');
    userInput.placeholder = "Listening...";
    recognition.start();
    recognition.onresult = (event) => {
        userInput.value = event.results[0][0].transcript;
        sendMessage();
    };
    recognition.onend = () => { userInput.placeholder = "Ask something..."; };
}

// Ensure Chat is injected on every page
document.addEventListener('DOMContentLoaded', injectChatComponent);
document.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && document.activeElement.id === 'user-input') sendMessage();
});
