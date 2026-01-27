import { db } from './firebase-config.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { handleFileUpload } from './data-upload.js';

// --- STATE MANAGEMENT ---
// We keep a local copy of data to make the app fast (so we don't call Firebase on every click)
let appData = {
    rooms: [],
    tenants: [],
    settings: {}
};

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    initApp();
    setupEventListeners();
});

async function initApp() {
    const container = document.getElementById('appContainer');
    container.innerHTML = '<p>Loading latest data...</p>';

    try {
        await fetchAllData();
        renderDashboard(); // Default View
    } catch (error) {
        console.error("Error loading app:", error);
        container.innerHTML = '<p style="color:red">Error loading data. Check console.</p>';
    }
}

// --- 1. FETCH DATA FROM FIREBASE ---
async function fetchAllData() {
    console.log("Fetching fresh data from Firebase...");
    
    // Fetch Rooms
    const roomsSnap = await getDocs(collection(db, "rooms"));
    appData.rooms = roomsSnap.docs.map(doc => doc.data());

    // Fetch Tenants
    const tenantsSnap = await getDocs(collection(db, "tenants"));
    appData.tenants = tenantsSnap.docs.map(doc => doc.data());

    // Fetch Settings
    const settingsSnap = await getDocs(collection(db, "config"));
    settingsSnap.forEach(doc => {
        if(doc.id === 'globalSettings') appData.settings = doc.data();
    });

    console.log("Data loaded:", appData);
}

// --- 2. VIEW CONTROLLER ---
window.switchView = function(viewName) {
    // Update Title
    document.getElementById('pageTitle').innerText = viewName.charAt(0).toUpperCase() + viewName.slice(1);
    
    // Update Sidebar Active State
    document.querySelectorAll('.sidebar li').forEach(li => li.classList.remove('active'));
    // (Optional: Add logic here to highlight the specific list item)

    // Render Logic
    switch(viewName) {
        case 'dashboard': renderDashboard(); break;
        case 'rooms': renderRooms(); break;
        case 'tenants': renderTenants(); break;
        default: 
            document.getElementById('appContainer').innerHTML = `<h2>${viewName} Coming Soon</h2>`;
    }
};

// --- 3. RENDER DASHBOARD ---
function renderDashboard() {
    const container = document.getElementById('appContainer');
    
    // Calculations
    const totalRooms = appData.rooms.length;
    const occupiedRooms = appData.rooms.filter(r => r.status === 'occupied').length;
    const vacantRooms = totalRooms - occupiedRooms;
    
    // Calculate Total Expected Rent (Sum of all occupied room rents)
    let totalExpectedRent = 0;
    appData.rooms.forEach(room => {
        if (room.status === 'occupied') {
            totalExpectedRent += Number(room.rent || 0);
        }
    });

    // HTML
    container.innerHTML = `
        <div class="stats-container">
            <div class="stat-card">
                <h3>Total Rooms</h3>
                <p>${totalRooms}</p>
            </div>
            <div class="stat-card" style="border-left-color: #22c55e;">
                <h3>Occupied</h3>
                <p>${occupiedRooms}</p>
            </div>
            <div class="stat-card" style="border-left-color: #ef4444;">
                <h3>Vacant</h3>
                <p>${vacantRooms}</p>
            </div>
            <div class="stat-card" style="border-left-color: #f59e0b;">
                <h3>Expected Monthly Rent</h3>
                <p>₹${totalExpectedRent.toLocaleString('en-IN')}</p>
            </div>
        </div>

        <h3>Quick Room Status</h3>
        ${getRoomsGridHTML(true)} <!-- true = simplified view -->
    `;
}

// --- 4. RENDER ROOMS ---
function renderRooms() {
    const container = document.getElementById('appContainer');
    container.innerHTML = getRoomsGridHTML(false); // false = detailed view
}

// Helper to generate Room Cards
function getRoomsGridHTML(isSimple) {
    if (appData.rooms.length === 0) return '<p>No rooms found.</p>';

    let html = '<div class="rooms-grid">';
    
    appData.rooms.forEach(room => {
        // Find Tenant Name
        let tenantName = "Vacant";
        if (room.tenantId) {
            const tenant = appData.tenants.find(t => t.id === room.tenantId);
            if (tenant) tenantName = tenant.name;
        }

        html += `
            <div class="room-card ${room.status === 'occupied' ? 'occupied' : 'vacant'}">
                <div class="room-header">
                    <span class="room-number">${room.number}</span>
                    <span class="room-status">${room.status}</span>
                </div>
                <div class="room-details">
                    <p><strong>Rent:</strong> ₹${room.rent}</p>
                    <p><strong>Tenant:</strong> ${tenantName}</p>
                    ${!isSimple ? `<p><strong>Meter ID:</strong> ${room.meterInstallationId || 'N/A'}</p>` : ''}
                </div>
            </div>
        `;
    });

    html += '</div>';
    return html;
}

// --- 5. RENDER TENANTS ---
function renderTenants() {
    const container = document.getElementById('appContainer');
    let html = `
        <table style="width:100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden;">
            <thead style="background: #f1f5f9; text-align: left;">
                <tr>
                    <th style="padding: 12px;">Name</th>
                    <th style="padding: 12px;">Phone</th>
                    <th style="padding: 12px;">Move In</th>
                    <th style="padding: 12px;">Security Dep.</th>
                </tr>
            </thead>
            <tbody>
    `;

    appData.tenants.forEach(t => {
        html += `
            <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 12px; font-weight:bold;">${t.name}</td>
                <td style="padding: 12px;">${t.phone}</td>
                <td style="padding: 12px;">${t.moveInDate || '-'}</td>
                <td style="padding: 12px;">₹${t.initialSecurityDeposit || 0}</td>
            </tr>
        `;
    });

    html += '</tbody></table>';
    container.innerHTML = html;
}


// --- 6. UPLOAD LISTENER (Keep this from before) ---
function setupEventListeners() {
    const processFileBtn = document.getElementById('processFileBtn');
    const fileInput = document.getElementById('jsonFileInput');

    if (processFileBtn && fileInput) {
        processFileBtn.addEventListener('click', () => {
            const file = fileInput.files[0];
            if (confirm("This will overwrite database dat
