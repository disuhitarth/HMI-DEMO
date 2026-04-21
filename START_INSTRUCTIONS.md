# How to Start the Meghna QC Vision System

Whenever you want to run this project again in the future, follow these exact steps. You will need **two separate terminal windows**.

## Terminal 1: Start the Backend (AI & Camera)
Open a new terminal and run these commands to start the Python server:

```bash
# 1. Navigate to the backend folder
cd "/Users/bolo/websites/Meghna Project/meghna-qc-vision/backend"

# 2. Activate the virtual environment
source venv/bin/activate

# 3. Start the server
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
*Note: Make sure your Mac's camera permissions are still enabled for the Terminal. If the camera light turns green, the backend is working correctly!*

---

## Terminal 2: Start the Frontend (UI Dashboard)
Open a second terminal window (press `Cmd + T` or open a new one) and run these commands:

```bash
# 1. Navigate to the frontend folder
cd "/Users/bolo/websites/Meghna Project/meghna-qc-vision/frontend"

# 2. Start the development server
npm run dev
```

---

## View the App

Once both terminals are running without errors, open your web browser and go to:
👉 **[http://localhost:3000](http://localhost:3000)**

*(Optional) If you want to show the demo to someone on their phone over the internet, open a 3rd terminal and run `ngrok http 8000` to temporarily expose the backend API, then update the frontend constants.*
