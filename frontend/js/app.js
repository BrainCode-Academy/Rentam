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
document.addEventListener('DOMContentLoaded', () => {
    updateNavbar();
    
    // Check for dashboard protection
    const path = window.location.pathname;
    if (path.includes('user-dashboard')) requireAuth('user');
    if (path.includes('admin-dashboard')) requireAuth('admin');

    // Populate Index Search Dropdown
    const indexSelect = document.querySelector('.search-select');
    if (indexSelect) {
        indexSelect.innerHTML = `<option selected value="">Select State / Institution</option>`;
        universitiesList.forEach(uni => {
            indexSelect.innerHTML += `<option value="${uni}">${uni}</option>`;
        });
    }

    // Populate Listings.html Sidebar Checkboxes
    const filterSidebar = document.querySelector('.filter-location-list');
    if (filterSidebar) {
        filterSidebar.innerHTML = '';
        universitiesList.forEach((uni, idx) => {
            filterSidebar.innerHTML += `
                <div class="form-check">
                    <input class="form-check-input loc-checkbox" type="checkbox" value="${uni}" id="loc${idx}">
                    <label class="form-check-label" for="loc${idx}">${uni}</label>
                </div>
            `;
        });
        
        // --- 3a. Handle URL Parameters for Searches ---
        const urlParams = new URLSearchParams(window.location.search);
        const urlLoc = urlParams.get('location');
        const urlType = urlParams.get('type');
        const urlPrice = urlParams.get('price');

        if (urlLoc || urlType || urlPrice) {
            // Apply initial filter based on URL
            const initialFiltered = mockProperties.filter(p => {
                const matchesLocation = !urlLoc || p.location.includes(urlLoc);
                const matchesType = !urlType || p.type === urlType;
                const matchesPrice = !urlPrice || p.price <= parseInt(urlPrice);
                return matchesLocation && matchesType && matchesPrice;
            });
            renderProperties(initialFiltered);
            
            // Set values in sidebar UI if possible
            if (urlLoc) {
                const cb = Array.from(document.querySelectorAll('.loc-checkbox')).find(c => c.value === urlLoc);
                if (cb) cb.checked = true;
            }
            if (urlPrice && document.getElementById('priceRange')) {
                document.getElementById('priceRange').value = urlPrice;
            }
        } else {
            renderProperties(mockProperties);
        }
    }
});


// --- 4. FILTERING LOGIC (For listings.html) ---
function applyFilters() {
    // 1. Get Checked Locations
    const locCheckboxes = document.querySelectorAll('.loc-checkbox:checked');
    const selectedLocations = Array.from(locCheckboxes).map(cb => cb.value);

    // 2. Get Price
    const maxPrice = document.getElementById('priceRange') ? parseInt(document.getElementById('priceRange').value) : 1000000;
    
    if(document.getElementById('priceDisplay')) {
        document.getElementById('priceDisplay').innerText = `₦${maxPrice.toLocaleString()}`;
    }

    // 3. Filter the Mock Properties Array
    const filtered = mockProperties.filter(p => {
        const matchesLocation = selectedLocations.length === 0 || selectedLocations.includes(p.location);
        const matchesPrice = p.price <= maxPrice;
        return matchesLocation && matchesPrice;
    });

    // 4. Re-render
    renderProperties(filtered);
}

// Add event listener to price range slider if it exists
document.addEventListener('input', (e) => {
    if (e.target.id === 'priceRange') {
        applyFilters();
    }
});

function triggerFilter() {
    applyFilters();
}

function resetFilters() {
    document.querySelectorAll('.loc-checkbox').forEach(cb => cb.checked = false);
    if(document.getElementById('priceRange')) document.getElementById('priceRange').value = 1000000;
    renderProperties(mockProperties);
}

function renderProperties(properties) {
    const container = document.getElementById('listings-container');
    if (!container) return; // Only run on listings.html

    if (properties.length === 0) {
        container.innerHTML = `<div class="col-12 text-center py-5">
            <h4 class="text-muted">Oops! No properties found matching this criteria.</h4>
            <br>
            <button class="btn btn-primary" onclick="resetFilters()">Clear Filters</button>
        </div>`;
        return;
    }

    container.innerHTML = properties.map(p => `
        <div class="col-md-6 mb-4">
            <div class="card property-card h-100">
                <img src="${p.image}" class="card-img-top" alt="Property">
                <div class="card-body">
                    <div class="d-flex justify-content-between mb-2">
                        <span class="badge bg-success">Verified</span>
                        <span class="price-tag fw-bold" style="color: var(--secondary-color)">₦${p.price.toLocaleString()}/yr</span>
                    </div>
                    <h5 class="card-title fw-bold">${p.title}</h5>
                    <p class="text-muted small"><i class="fas fa-map-marker-alt text-primary"></i> Near ${p.location}</p>
                    <a href="details.html" class="btn btn-outline-primary btn-sm w-100 mt-2">View Details</a>
                </div>
            </div>
        </div>
    `).join('');
}


// --- 4. AI AGENT "WINNER" LOGIC ---
const chatWindow = document.getElementById('chat-window');
const chatContent = document.getElementById('chat-content');
const userInput = document.getElementById('user-input');

function toggleChat() {
    chatWindow.style.display = chatWindow.style.display === 'flex' ? 'none' : 'flex';
}

function sendMessage() {
    const text = userInput.value.trim();
    if (!text) return;
    appendMessage('user', text);
    userInput.value = '';

    setTimeout(() => {
        handleAIResponse(text);
    }, 1000);
}

function appendMessage(sender, htmlContent) {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message', sender);
    msgDiv.innerHTML = htmlContent;
    chatContent.appendChild(msgDiv);
    chatContent.scrollTop = chatContent.scrollHeight;
    
    if (sender === 'winner') {
        const cleanText = htmlContent.replace(/<[^>]+>/g, ' '); // remove HTML tags
        speak(cleanText);
    }
}

async function handleAIResponse(input) {
    try {
        appendMessage('winner', '<div class="spinner-border spinner-border-sm text-secondary" role="status"></div><small class="ms-2">Thinking...</small>');
        
        // Remove typing indicator before appending real response
        const messages = chatContent.querySelectorAll('.message.winner');
        const lastMessage = messages[messages.length - 1];

        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: input })
        });
        
        if (!response.ok) {
            throw new Error('API Error');
        }

        const data = await response.json();
        if(lastMessage) lastMessage.remove(); // clear loading spinner
        appendMessage('winner', data.response);
        
    } catch (err) {
        console.error("Backend fetch failed. Falling back to local offline customer care.", err);
        const messages = chatContent.querySelectorAll('.message.winner');
        if (messages.length > 0) messages[messages.length - 1].remove();
        
        // --- OFFLINE CUSTOMER CARE & SEARCH FALLBACK ---
        const lowerInput = input.toLowerCase();
        
        if (lowerInput.includes('hello') || lowerInput.includes('hi')) {
            appendMessage('winner', "Hello! I am Winner, Rentam's official Customer Care AI. How can I assist you today with finding a property?");
            return;
        }

        if (lowerInput.includes('agent') || lowerInput.includes('register')) {
            appendMessage('winner', "To become an agent and list your properties, click on the **'Register as Agent'** link at the top or bottom of the page. You'll need to submit your details for our Admin to verify.");
            return;
        }

        // Try local search
        const matchedUni = universitiesList.find(uni => lowerInput.includes(uni.toLowerCase().split(' ')[0])); 
        if (matchedUni || lowerInput.includes('house') || lowerInput.includes('hostel')) {
            if (matchedUni) {
                const results = mockProperties.filter(p => p.location === matchedUni);
                if (results.length > 0) {
                    let html = `I found ${results.length} properties around **${matchedUni}**!<br><br>`;
                    results.slice(0, 2).forEach(p => {
                        html += `
                        <div class="bg-white p-2 rounded text-dark shadow-sm mb-2" style="font-size: 13px;">
                            <img src="${p.image}" class="img-fluid rounded mb-1" style="height: 80px; width: 100%; object-fit: cover;">
                            <strong>${p.title}</strong><br>
                            <span class="text-danger fw-bold">₦${p.price.toLocaleString()}</span>
                        </div>`;
                    });
                    html += `<a href="listings.html" class="btn btn-sm btn-primary mt-2">See all matching properties</a>`;
                    appendMessage('winner', html);
                } else {
                    appendMessage('winner', `I'm sorry, I don't see anything explicitly inside "${matchedUni}" at this exact moment. Feel free to browse our main listings page!`);
                }
            } else {
                appendMessage('winner', "We have hundreds of verified hostels and apartments! Name a specific university (e.g. UNILAG, UNN, or FUTO) so I can help filter them for you.");
            }
            return;
        }

        // General Customer Care
        appendMessage('winner', "I'm always here to help. You can ask me to find a house at a specific school, check property prices, or guide you on how to become a registered agent.");
    }
}

userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

// --- 5. SPEECH & VOICE RECOGNITION API ---
function speak(text) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel(); // Stop current speech if any
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-NG'; // Nigerian English matching local context
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
    
    // UI feedback for listening
    userInput.placeholder = "Listening...";
    recognition.start();

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        userInput.value = transcript;
        userInput.placeholder = "Type your message...";
        sendMessage();
    };

    recognition.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        userInput.placeholder = "Type your message...";
    };
    
    recognition.onend = () => {
        userInput.placeholder = "Type your message...";
    };
}
