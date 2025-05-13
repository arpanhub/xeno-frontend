# ⚛️ Mini CRM Frontend

This is the **React frontend** for the **Mini CRM Platform**, built with modern tech like **Vite**, **TailwindCSS**, **React Router**, **Zustand**, and more. It is designed to work seamlessly with the backend (`mini-crm-backend`).

---

## 🚀 Tech Stack

- **React 18** – Core UI library
- **Vite** – Fast build tool
- **TailwindCSS** – Utility-first styling
- **Axios** – API calls
- **React Router** – Client-side routing
- **Headless UI & Heroicons** – Beautiful UI components
- **Recharts** – Data visualizations
- **React Hot Toast** – Toast notifications

---

## ⚙️ Getting Started

### 📦 Install Dependencies

```bash
cd frontend
npm install
```

### 🏗️ Start Development Server

```bash
npm run dev
```
This will start the Vite development server, and you can access the app at `http://localhost:5173`.
### 📦 Build for Production

```bash
npm run build
```
This will create an optimized build of the app in the `dist` folder.
### 📦 Preview Production Build

```bash
npm run preview
```
This will start a local server to preview the production build.
### 📦 Linting

```bash
npm run lint
```
This will run ESLint to check for code quality and style issues.
### 📦 Formatting

```bash
npm run format
```
### 🔧 Set Up Environment
If needed, create a .env file for API base URLs or other env-specific values:

```
VITE_API_URL=http://yourbackendapi:4713/api
```