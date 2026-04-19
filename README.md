# Smart Tourist Safety Monitoring & Incident Response System

An AI-powered proactive safety system designed to monitor tourist movements and detect emergencies (high-speed accidents, medical distress, etc.) in real-time.

## 🚀 System Architecture
This project follows a **Microservices Architecture**:
- **Frontend:** React-based dashboard for authorities and a PWA for tourists.
- **Backend:** Node.js/Express API for user management and real-time alerts.
- **AI Service:** Python (FastAPI) service running Hybrid Forest models.

## 🧠 AI Models Used
The system utilizes a **Hybrid Detection Logic**:
- **Isolation Forest:** For detecting unsupervised anomalies in movement patterns.
- **Random Forest:** For classifying incidents based on trained historical data.
- **Accuracy:** Achieved 97% accuracy during training on 3,500 simulated scenarios.

## 🛠️ Tech Stack
- **Languages:** Python, JavaScript
- **Frameworks:** FastAPI, React.js, Node.js
- **AI/ML:** Scikit-learn, Joblib, Pandas
- **Database:** MongoDB (for location logs and incidents)
- **Containerization:** Docker & Docker Compose

## 📋 How to Run
1. **AI Service:** - `cd ai-service`
   - `pip install -r requirements.txt`
   - `uvicorn app.main:app --port 8000`
2. **Backend:** - `cd backend`
   - `npm install`
   - `npm start`
