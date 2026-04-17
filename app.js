// MOCK DATABASE
let issuesDatabase = [
    { id: "CT-8201", category: "pothole", desc: "Huge crater causing accidents", loc: "Connaught Place, New Delhi", lat: 28.6315, lng: 77.2167, status: "open", dept: "Road Dept", date: "2 hours ago" },
    { id: "CT-8202", category: "garbage", desc: "Illegal dumping site", loc: "MG Road, Bangalore", lat: 12.9730, lng: 77.6016, status: "in-progress", dept: "Sanitation", date: "5 hours ago" },
    { id: "CT-8203", category: "water", desc: "Burst pipe flooding the walk", loc: "Andheri East, Mumbai", lat: 19.1136, lng: 72.8697, status: "resolved", dept: "Water supply", date: "1 day ago" },
    { id: "CT-8204", category: "light", desc: "Streetlight flickering", loc: "T Nagar, Chennai", lat: 13.0418, lng: 80.2341, status: "open", dept: "Energy Dept", date: "2 days ago" }
];

// CONFIG & MAPPINGS
const uiConfig = {
    categoryIcons: {
        "pothole": '<i class="fa-solid fa-road text-slate-600"></i>',
        "garbage": '<i class="fa-solid fa-trash text-slate-600"></i>',
        "water": '<i class="fa-solid fa-droplet text-slate-600"></i>',
        "light": '<i class="fa-regular fa-lightbulb text-slate-600"></i>'
    },
    statusStyles: {
        "open": "bg-red-50 text-red-700 border-red-200",
        "in-progress": "bg-orange-50 text-orange-700 border-orange-200",
        "resolved": "bg-emerald-50 text-emerald-700 border-emerald-200"
    },
    deptMap: {
        "pothole": "Road Repair Authority",
        "garbage": "Waste Management & Sanitation",
        "water": "Municipal Water Board",
        "light": "Public Infrastructure Dept"
    }
};

// --- GLOBAL APP LOGIC ---
let theMap = null;

function initApp() {
    setupFormInteractions();
    setupImageUpload();
    renderTable();
    updateStats();
}

// --- TAB NAVIGATION ---
function switchTab(tabName) {
    // Hide all
    document.getElementById('tab-citizen').classList.add('hidden');
    document.getElementById('tab-map').classList.add('hidden');
    document.getElementById('tab-admin').classList.add('hidden');
    
    // Reset Nav styling
    ['citizen', 'map', 'admin'].forEach(t => {
        const nav = document.getElementById('nav-' + t);
        nav.className = nav.className.replace('text-primary-600 bg-primary-50', 'text-slate-500');
    });

    // Show target
    document.getElementById('tab-' + tabName).classList.remove('hidden');
    
    // Highlight target nav
    const activeNav = document.getElementById('nav-' + tabName);
    activeNav.className = activeNav.className.replace('text-slate-500', 'text-primary-600 bg-primary-50');

    // Specific tab initializations
    if(tabName === 'map') {
        if(!theMap) setTimeout(initializeMap, 100);
    }
    if(tabName === 'admin') {
        renderTable();
    }
}

// --- NEW FEATURES ---
function setupImageUpload() {
    const fileInput = document.getElementById('image-upload');
    const dropzone = document.getElementById('dropzone');
    const preview = document.getElementById('image-preview');
    const content = document.getElementById('dropzone-content');
    const removeBtn = document.getElementById('remove-image');

    fileInput.addEventListener('change', function(e) {
        if(this.files && this.files[0]) {
            const reader = new FileReader();
            reader.onload = function(e) {
                preview.src = e.target.result;
                preview.classList.remove('hidden');
                content.classList.add('hidden');
                removeBtn.classList.remove('hidden');
            }
            reader.readAsDataURL(this.files[0]);
        }
    });

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropzone.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropzone.addEventListener(eventName, () => dropzone.classList.add('bg-primary-50', 'border-primary-400'), false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropzone.addEventListener(eventName, () => dropzone.classList.remove('bg-primary-50', 'border-primary-400'), false);
    });

    dropzone.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
        let dt = e.dataTransfer;
        let files = dt.files;
        if(files && files[0]) {
            fileInput.files = files;
            // trigger change event manually
            const event = new Event('change');
            fileInput.dispatchEvent(event);
        }
    }
}

window.removeImage = function(e) {
    if(e) e.preventDefault();
    const fileInput = document.getElementById('image-upload');
    const preview = document.getElementById('image-preview');
    const content = document.getElementById('dropzone-content');
    const removeBtn = document.getElementById('remove-image');
    
    fileInput.value = '';
    preview.src = '';
    preview.classList.add('hidden');
    content.classList.remove('hidden');
    removeBtn.classList.add('hidden');
}

window.getCurrentLocation = function() {
    const locInput = document.getElementById('issue-location');
    const iconBtn = document.getElementById('get-location-btn');
    
    if (navigator.geolocation) {
        iconBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
        navigator.geolocation.getCurrentPosition(
            function(position) {
                const lat = position.coords.latitude.toFixed(4);
                const lng = position.coords.longitude.toFixed(4);
                locInput.value = `📍 GPS: ${lat}, ${lng}`;
                iconBtn.innerHTML = '<i class="fa-solid fa-crosshairs text-green-500"></i>';
                setTimeout(() => iconBtn.innerHTML = '<i class="fa-solid fa-crosshairs"></i>', 3000);
            },
            function(error) {
                alert("Location access denied or unavailable.");
                iconBtn.innerHTML = '<i class="fa-solid fa-crosshairs text-red-500"></i>';
                setTimeout(() => iconBtn.innerHTML = '<i class="fa-solid fa-crosshairs"></i>', 3000);
            }
        );
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

// --- CITIZEN FORM LOGIC ---
function setupFormInteractions() {
    const categoryBtns = document.querySelectorAll('.category-btn');
    const hiddenCategory = document.getElementById('selected-category');
    const routeStep1 = document.getElementById('route-step-1');
    const routeStep2 = document.getElementById('route-step-2');
    const routeStep3 = document.getElementById('route-step-3');
    const categoryText = document.getElementById('route-category-text');
    const deptTarget = document.getElementById('route-dept-target');
    const routePulse = document.getElementById('route-pulse');

    // Category Selection Logic
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Reset all
            categoryBtns.forEach(b => {
                b.classList.remove('border-primary-500', 'bg-primary-50', 'shadow-md');
                b.classList.add('border-slate-300', 'bg-white');
            });
            
            // Highlight selected
            const currentBtn = e.currentTarget;
            currentBtn.classList.remove('border-slate-300', 'bg-white');
            currentBtn.classList.add('border-primary-500', 'bg-primary-50', 'shadow-md');
            
            const val = currentBtn.getAttribute('data-val');
            hiddenCategory.value = val;

            // Trigger Smart Router Visualization Animation
            
            // Step 1: Validating
            routeStep1.classList.remove('opacity-40');
            routeStep1.querySelector('.bg-slate-200').classList.replace('bg-slate-200', 'bg-blue-100');
            routeStep1.querySelector('i').classList.add('text-blue-600');
            
            setTimeout(() => {
                // Step 2: classification
                routeStep2.classList.remove('opacity-40');
                routeStep2.querySelector('.bg-slate-200').classList.replace('bg-slate-200', 'bg-purple-100');
                routeStep2.querySelector('i').classList.add('text-purple-600');
                categoryText.innerHTML = `<span class="font-bold text-slate-800">Detected:</span> ${val.toUpperCase()}`;
                
                setTimeout(() => {
                    // Step 3: Assigned
                    routeStep3.classList.remove('opacity-40');
                    routeStep3.querySelector('.bg-slate-200').classList.replace('bg-slate-200', 'bg-emerald-100');
                    routeStep3.querySelector('i').classList.add('text-emerald-600');
                    deptTarget.innerText = uiConfig.deptMap[val];
                    routePulse.classList.remove('hidden');
                }, 600);
            }, 600);
        });
    });

    // Form Submit Logic
    document.getElementById('report-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        if(!hiddenCategory.value) {
            alert('Please select an issue category.');
            return;
        }

        const reportBtn = e.target.querySelector('button[type="submit"]');
        const origText = reportBtn.innerHTML;
        
        // Show loading state
        reportBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i> PROCESSING...';
        
        setTimeout(() => {
            // Create new issue
            const newId = Math.floor(1000 + Math.random() * 9000);
            const newIssue = {
                id: "CT-" + newId,
                category: hiddenCategory.value,
                desc: document.getElementById('issue-desc').value || "No description provided.",
                loc: document.getElementById('issue-location').value,
                lat: 20.5937 + (Math.random() * 10 - 5), // Randomize around India center
                lng: 78.9629 + (Math.random() * 10 - 5),
                status: "open",
                dept: uiConfig.deptMap[hiddenCategory.value],
                date: "Just now"
            };

            // Add to "Database"
            issuesDatabase.unshift(newIssue);
            
            // Update UI Map & Stats
            if(theMap) { addMarkerToMap(newIssue); }
            updateStats();

            // Show success
            reportBtn.innerHTML = origText;
            document.getElementById('success-id').innerText = newId;
            const successMsg = document.getElementById('success-message');
            successMsg.classList.remove('hidden');
            
            // Reset Form
            this.reset();
            if(window.removeImage) window.removeImage();
            hiddenCategory.value = "";
            categoryBtns.forEach(b => b.className = "category-btn border border-slate-300 rounded-lg p-3 flex flex-col items-center justify-center gap-2 hover:border-primary-500 hover:text-primary-600 transition bg-white");
            
            // Reset Router UI
            [routeStep1, routeStep2, routeStep3].forEach(el => {
                el.classList.add('opacity-40');
                const iconBg = el.querySelector('.rounded-full');
                iconBg.className = "w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 z-10 shadow-sm border-2 border-white relative";
            });
            categoryText.innerHTML = "Awaiting input...";
            deptTarget.innerText = "Pending";
            routePulse.classList.add('hidden');

            setTimeout(() => successMsg.classList.add('hidden'), 5000);

        }, 1200);
    });
}

// --- MAP LOGIC (LEAFLET) ---
function initializeMap() {
    theMap = L.map('heatmap-container', { zoomControl: false }).setView([20.5937, 78.9629], 5);
    
    // Add custom beautiful map tiles (CartoDB Positron for modern look)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; CartoDB',
        subdomains: 'abcd',
        maxZoom: 20
    }).addTo(theMap);

    // Add Zoom Control to bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(theMap);

    // Add markers
    issuesDatabase.forEach(issue => addMarkerToMap(issue));
}

function addMarkerToMap(issue) {
    if(!theMap) return;

    // Determine marker pin color based on status
    let color = "#ef4444"; // red for open
    if(issue.status === 'in-progress') color = "#f97316"; // orange
    if(issue.status === 'resolved') color = "#10b981"; // green

    const iconHtml = `
        <div class="w-full h-full rounded-full flex items-center justify-center text-white" style="background-color: ${color};">
            ${issue.category === 'pothole' ? '<i class="fa-solid fa-road text-xs"></i>' : ''}
            ${issue.category === 'garbage' ? '<i class="fa-solid fa-trash text-xs"></i>' : ''}
            ${issue.category === 'water' ? '<i class="fa-solid fa-droplet text-xs"></i>' : ''}
            ${issue.category === 'light' ? '<i class="fa-solid fa-lightbulb text-xs"></i>' : ''}
        </div>
    `;

    const customIcon = L.divIcon({
        className: 'map-marker-custom',
        html: iconHtml,
        iconSize: [36, 36],
        iconAnchor: [18, 18]
    });

    const marker = L.marker([issue.lat, issue.lng], { icon: customIcon }).addTo(theMap);
    
    // Beautiful Popup
    const popupContent = `
        <div class="font-sans min-w-[200px]">
            <div class="flex items-center justify-between mb-2 pb-2 border-b">
                <span class="font-bold text-slate-800">${issue.id}</span>
                <span class="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${uiConfig.statusStyles[issue.status]} border">${issue.status.replace('-', ' ')}</span>
            </div>
            <p class="font-semibold text-sm mb-1">${issue.desc}</p>
            <p class="text-xs text-slate-500 mb-2"><i class="fa-solid fa-location-dot mr-1"></i> ${issue.loc}</p>
            <div class="bg-slate-50 p-2 rounded text-xs">
                <span class="font-semibold block text-slate-700 mb-1">Routed to:</span>
                <span class="text-primary-600 font-medium">${issue.dept}</span>
            </div>
        </div>
    `;
    marker.bindPopup(popupContent, { className: 'custom-popup rounded-xl' });
}

// --- ADMIN DASHBOARD LOGIC ---
function updateStats() {
    document.getElementById('stat-total').innerText = issuesDatabase.length;
    document.getElementById('stat-open').innerText = issuesDatabase.filter(i => i.status === 'open').length;
    document.getElementById('stat-progress').innerText = issuesDatabase.filter(i => i.status === 'in-progress').length;
    document.getElementById('stat-resolved').innerText = issuesDatabase.filter(i => i.status === 'resolved').length;
}

function renderTable() {
    const tableBody = document.getElementById('issues-table-body');
    const emptyState = document.getElementById('table-empty-state');
    const catFilter = document.getElementById('filter-category').value;
    const statFilter = document.getElementById('filter-status').value;

    tableBody.innerHTML = '';

    let filtered = issuesDatabase.filter(i => {
        const matchCat = catFilter === 'all' || i.category === catFilter;
        const matchStat = statFilter === 'all' || i.status === statFilter;
        return matchCat && matchStat;
    });

    if(filtered.length === 0) {
        emptyState.classList.remove('hidden');
        tableBody.parentElement.classList.add('hidden');
    } else {
        emptyState.classList.add('hidden');
        tableBody.parentElement.classList.remove('hidden');
        
        filtered.forEach(issue => {
            const statusClass = uiConfig.statusStyles[issue.status];
            
            const tr = document.createElement('tr');
            tr.className = "hover:bg-slate-50 transition-colors group";
            tr.innerHTML = `
                <td class="px-6 py-4 font-mono text-xs font-semibold text-slate-800">${issue.id}</td>
                <td class="px-6 py-4">
                    <div class="flex items-center">
                        <div class="w-10 h-10 rounded bg-slate-100 flex items-center justify-center mr-3 border border-slate-200">
                            ${uiConfig.categoryIcons[issue.category]}
                        </div>
                        <div>
                            <p class="font-semibold text-slate-800 group-hover:text-primary-600 transition truncate max-w-[200px]">${issue.desc}</p>
                            <p class="text-xs text-slate-500">${issue.date}</p>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4 text-xs text-slate-600"><i class="fa-solid fa-location-arrow text-slate-400 mr-1"></i> ${issue.loc}</td>
                <td class="px-6 py-4">
                    <span class="text-xs font-semibold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md border border-slate-200 inline-block">${issue.dept}</span>
                </td>
                <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                        <span class="capitalize text-xs font-bold px-2.5 py-1 rounded-full border ${statusClass}">
                            ${issue.status.replace('-', ' ')}
                        </span>
                        
                        <!-- Status Toggle Action -->
                        <button onclick="toggleStatus('${issue.id}')" class="text-slate-400 hover:text-primary-600 transition tooltip" title="Change Status">
                            <i class="fa-solid fa-arrows-rotate"></i>
                        </button>
                    </div>
                </td>
            `;
            tableBody.appendChild(tr);
        });
    }
}

function toggleStatus(id) {
    const idx = issuesDatabase.findIndex(i => i.id === id);
    if(idx > -1) {
        const current = issuesDatabase[idx].status;
        let next = 'open';
        if(current === 'open') next = 'in-progress';
        if(current === 'in-progress') next = 'resolved';
        
        issuesDatabase[idx].status = next;
        
        // Re-render
        renderTable();
        updateStats();
        
        // Update map marker if exists (Hackathon fast approach: just reinit map markers)
        if(theMap) {
            // Remove all markers
            theMap.eachLayer((layer) => {
                if (layer instanceof L.Marker) {
                    theMap.removeLayer(layer);
                }
            });
            // Re-add
            issuesDatabase.forEach(issue => addMarkerToMap(issue));
        }
    }
}

// Event Listeners for Filters
document.getElementById('filter-category').addEventListener('change', renderTable);
document.getElementById('filter-status').addEventListener('change', renderTable);

// Run Init
window.addEventListener('DOMContentLoaded', initApp);
