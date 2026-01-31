import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Users, Receipt, BookOpen, Settings, Sparkles } from 'lucide-react'

const navItems = [
    { to: '/', icon: LayoutDashboard, label: '仪表盘' },
    { to: '/users', icon: Users, label: '用户管理' },
    { to: '/transactions', icon: Receipt, label: '交易流水' },
    { to: '/readings', icon: BookOpen, label: '占卜记录' },
]

export default function Sidebar() {
    return (
        <aside className="w-64 min-h-screen bg-[#0f0518]/80 border-r border-white/10 flex flex-col">
            {/* Logo */}
            <div className="p-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-amber-600 flex items-center justify-center shadow-lg shadow-primary/20">
                        <Sparkles className="w-5 h-5 text-background-dark" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-white">Tarot Admin</h1>
                        <p className="text-xs text-white/40">后台管理系统</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1">
                {navItems.map(item => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                                ? 'bg-primary/10 text-primary border border-primary/20'
                                : 'text-white/60 hover:bg-white/5 hover:text-white'
                            }`
                        }
                    >
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-white/10">
                <div className="text-xs text-white/30 text-center">
                    Universal Tarot AI © 2026
                </div>
            </div>
        </aside>
    )
}
