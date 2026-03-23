# ⚡ AI Flow Assignment — MERN + React Flow

A full-stack app where you type a prompt into a node, click **Run Flow**, and the AI response appears in the connected node. Built with **MongoDB · Express · React · React Flow · OpenRouter**.

---

## 📁 Project Structure

```
mern-app/
├── backend/
│   ├── server.js          ← Express API server
│   ├── package.json
│   └── .env               ← Add your API keys here (never commit this)
└── frontend/
    ├── index.html
    ├── vite.config.js
    ├── src/
    │   ├── App.jsx        ← Main component + React Flow canvas
    │   ├── FlowNodes.jsx  ← Custom InputNode & ResultNode
    │   ├── main.jsx
    │   └── index.css
    └── package.json
```

---

## 🚀 Setup Instructions

### Prerequisites
- **Node.js** v18+
- **MongoDB** running locally OR a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster
- A free [OpenRouter](https://openrouter.ai) account (free tier, no credit card needed)

---

### Step 1 — Get your API Keys

1. **OpenRouter** → Sign up at https://openrouter.ai → go to **Keys** → click **Create Key** → copy it
2. **MongoDB Atlas** → Sign up at https://mongodb.com/atlas → create a free **M0 cluster** → go to **Database Access** → create a user → click **Connect** → copy the connection string

---

### Step 2 — Configure the Backend

Create a `.env` file inside the `backend/` folder:

```
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxxxxx
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/aiflow
PORT=5000
```



---

### Step 3 — Install & Run the Backend

```bash
cd backend
npm install
node server.js
```

You should see:
```
🚀 Server running on http://localhost:5000
✅ MongoDB connected
```

---

### Step 4 — Install & Run the Frontend

Open a **new terminal**:

```bash
cd frontend
npm install
npm run dev
```

The app opens at **http://localhost:5173**

> The `vite.config.js` proxy forwards all `/api/...` requests to the backend automatically — no CORS issues.

---

## 🎮 How to Use

1. **Type** a question into the purple **Prompt Input** node
2. Click **▶ Run Flow** in the top bar
3. Watch the edge animate while the AI thinks
4. The **AI Response** node fills in with the answer
5. Click **Save to DB** to persist the prompt + response to MongoDB

---

## 🔌 API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/ask-ai` | `{ prompt }` → `{ answer }` |
| POST | `/api/save` | `{ prompt, response }` → saves to MongoDB |
| GET | `/api/history` | Returns last 20 saved flows |

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite, React Flow (@xyflow/react) |
| Backend | Node.js, Express |
| Database | MongoDB, Mongoose |
| AI | OpenRouter (free tier) |

---

## 🔧 Switching the AI Model

In `backend/server.js`, change the `model` field:

```js
model: "openrouter/auto"          // auto-picks any working free model
// or
model: "google/gemma-3-27b-it:free"
// or
model: "meta-llama/llama-3.3-70b-instruct:free"
```

Browse all free models at https://openrouter.ai/models?q=free
