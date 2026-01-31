import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Users from './pages/Users'
import Transactions from './pages/Transactions'
import Readings from './pages/Readings'
import './index.css'

function App() {
    return (
        <BrowserRouter>
            <div className="flex min-h-screen nebula-bg">
                <Sidebar />
                <main className="flex-1 overflow-auto">
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/users" element={<Users />} />
                        <Route path="/transactions" element={<Transactions />} />
                        <Route path="/readings" element={<Readings />} />
                    </Routes>
                </main>
            </div>
        </BrowserRouter>
    )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
)
