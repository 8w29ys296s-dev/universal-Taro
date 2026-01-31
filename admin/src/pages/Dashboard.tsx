import { useEffect, useState } from 'react'
import { getDashboardStats, DashboardStats } from '../services/adminService'
import { Users, Coins, BookOpen, TrendingUp, Activity, Sparkles } from 'lucide-react'

export default function Dashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadStats()
    }, [])

    const loadStats = async () => {
        setLoading(true)
        const data = await getDashboardStats()
        setStats(data)
        setLoading(false)
    }

    const StatCard = ({
        icon: Icon,
        label,
        value,
        subValue,
        color
    }: {
        icon: any
        label: string
        value: string | number
        subValue?: string
        color: string
    }) => (
        <div className="glass-panel rounded-2xl p-6 hover:border-primary/30 transition-all duration-300 group">
            <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
                <TrendingUp className="w-4 h-4 text-green-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">{value}</div>
            <div className="text-sm text-white/50">{label}</div>
            {subValue && (
                <div className="mt-2 text-xs text-primary/80 bg-primary/10 px-2 py-1 rounded-full inline-block">
                    {subValue}
                </div>
            )}
        </div>
    )

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Sparkles className="w-12 h-12 text-primary animate-pulse" />
                    <p className="text-white/50">加载数据中...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex-1 p-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">数据仪表盘</h1>
                <p className="text-white/50">欢迎回来，这里是 Universal Tarot AI 的运营数据概览</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <StatCard
                    icon={Users}
                    label="总用户数"
                    value={stats?.totalUsers || 0}
                    subValue={`今日活跃 ${stats?.todayActiveUsers || 0}`}
                    color="bg-gradient-to-br from-purple-500 to-purple-700"
                />
                <StatCard
                    icon={Coins}
                    label="累计充值(金币)"
                    value={stats?.totalRevenue?.toLocaleString() || 0}
                    subValue={`今日 +${stats?.todayRevenue || 0}`}
                    color="bg-gradient-to-br from-primary to-amber-600"
                />
                <StatCard
                    icon={BookOpen}
                    label="占卜次数"
                    value={stats?.totalReadings?.toLocaleString() || 0}
                    subValue={`今日 ${stats?.todayReadings || 0} 次`}
                    color="bg-gradient-to-br from-blue-500 to-blue-700"
                />
            </div>

            {/* Activity Section */}
            <div className="glass-panel rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                    <Activity className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-semibold text-white">快速操作</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <a
                        href="/users"
                        className="p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors flex items-center gap-3 group"
                    >
                        <Users className="w-5 h-5 text-white/50 group-hover:text-primary transition-colors" />
                        <span className="text-white/70 group-hover:text-white transition-colors">管理用户</span>
                    </a>
                    <a
                        href="/transactions"
                        className="p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors flex items-center gap-3 group"
                    >
                        <Coins className="w-5 h-5 text-white/50 group-hover:text-primary transition-colors" />
                        <span className="text-white/70 group-hover:text-white transition-colors">查看交易</span>
                    </a>
                    <a
                        href="/readings"
                        className="p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors flex items-center gap-3 group"
                    >
                        <BookOpen className="w-5 h-5 text-white/50 group-hover:text-primary transition-colors" />
                        <span className="text-white/70 group-hover:text-white transition-colors">占卜记录</span>
                    </a>
                </div>
            </div>
        </div>
    )
}
