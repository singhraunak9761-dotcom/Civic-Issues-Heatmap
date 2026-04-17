# CivicTrace - Civic Issue Heatmap

**CivicTrace** is a smart civic issue reporting and heatmap platform designed for municipalities and citizens. This minimum viable product (MVP) serves as a hackathon showcase, featuring a mobile-friendly prototype to report local issues, a live heatmap for visualization, and an authority dashboard for municipal management.

## 🚀 Features

### 1. Citizen Interface
- **Mobile-first reporting form:** Easily report civic issues (Potholes, Garbage, Water leaks, Streetlights).
- **Photo Evidence:** Drag-and-drop or click to upload visual evidence.
- **Geolocation Integration:** Automatically fetches current GPS location or allows manual entry.
- **Smart Routing Simulation:** Visualizes how AI would instantly categorize and route an issue to the relevant department based on input data.

### 2. Live Heatmap
- **Interactive Map:** Built using Leaflet.js and CartoDB Positron maps.
- **Dynamic Pointers:** Displays reported issues clearly on the map of India.
- **Visual Status Tracking:** Color-coded pins (Red: Open, Orange: In Progress, Green: Resolved).
- **Pop-ups:** Tap/click any pin to see detailed issue information, ID, and routing status.

### 3. Authority Dashboard
- **Key Performance Indicators (KPIs):** Track total, open, in-progress, and resolved reports at a glance.
- **Issue Management:** Interactive data table representing all active complaints.
- **Filtering:** Quickly filter issues by category (Roads, Sanitation, Water) or exact status.
- **One-Click Updates:** Seamlessly toggle and update issue statuses.

## 🛠️ Tech Stack

- **HTML5 & Vanilla JavaScript**: Core structure and application logic (No complex framework required for the prototype).
- **Tailwind CSS**: Used via CDN for rapid, responsive, and beautiful styling out of the box.
- **Leaflet.js**: Lightweight, open-source library for interactive maps.
- **FontAwesome**: Icons for beautiful UI/UX layout.

## 💻 How to Run Locally

Because this prototype is entirely frontend-driven (using mock databases for easy hackathon demonstration), setting it up is incredibly quick.

1. **Clone the repository** (or download the source files).
2. Ensure all three core files are in the same directory:
   - `index1.html`
   - `style.css`
   - `app.js`
3. **Open `index1.html`** directly in any modern web browser (Google Chrome, Firefox, Safari, Edge). Let the browser execute the app locally!

## 📌 Project Structure

- `index1.html` - The main UI structural file containing the tabs for Citizen Report, Map, and the Admin Dashboard.
- `app.js` - Contains the mock database, Leaflet map initialization focused on India, DOM interaction logic, and dynamic UI updates.
- `style.css` - Custom CSS supplements for custom map markers, clean dropzones, smooth animations, and scrollbars.

## 🌟 Hackathon Context
This MVP currently operates in a "Live Simulation Mode" with a pre-seeded mock database. Currently, it automatically assigns new simulated tickets to coordinates within India to demonstrate how a municipality could visualize incoming localized reports.
