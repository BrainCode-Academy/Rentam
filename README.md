# Rentam - Trusted Student & Affordable Housing (Nigeria)

Full-stack application for a student housing marketplace in Nigeria.

## Features
- **Frontend**: Clean UI with Bootstrap 5, primary color Deep Blue (#0A2647) and Orange (#FF7A00).
- **AI Assistant (Winner)**: Multilingual (English, Pidgin, Igbo) helper with Voice recognition (Web Speech API).
- **Backend**: Node.js, Express, MongoDB, JWT Auth.
- **Agent System**: Role-based access, property listing, and verification system.

## Project Structure
- `/frontend`: HTML/CSS/JS files.
  - `index.html`: Hero & Search.
  - `listings.html`: Filterable properties.
  - `details.html`: Property info & Agent contact.
  - `js/app.js`: AI logic and frontend interactions.
- `/backend`: Server logic.
  - `models/`: User & Property schemas.
  - `routes/`: Auth, Properties, Agents.
  - `.env`: Config (MongoDB URI & JWT Secret).

## Getting Started
1. **Backend**:
   - `cd backend`
   - `node server.js`
2. **Frontend**:
   - Open `frontend/index.html` in your browser.

## AI Assistant (Winner)
Click the robot icon on the bottom right to talk to Winner. You can type or use the microphone for voice input. Winner understands English, Pidgin, and Igbo!
