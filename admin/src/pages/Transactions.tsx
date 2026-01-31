import { useEffect, useState } from 'react'
import { getTransactions, Transaction, exportToCSV } from '../services/adminService'
import { Filter, Download, Loader2, ArrowUpCircle, ArrowDownCircle, Gift, RefreshCw, Star } from 'lucide-react'

const typeConfig: Record<string, { label: string; color: string; icon: any }> = {
    initial: { label: '初始', color: 'text-blue-400', icon: Star },
    daily_bonus: { label: '每日奖励', color: 'text-green-400', icon: Gift },
    recharge: { label: '充值', color: 'text-primary', icon: ArrowUpCircle },
    consume: { label: '消费', color: 'text-red-400', icon: ArrowDownCircle },
    refund: { label: '退款', color: 'text-purple-400', icon: RefreshCw },
}

export default function Transactions() {
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)
    const [loading, setLoading] = useState(true)
    const [filters, setFilters] = useState<{ type?: string; dateFrom?: string; dateTo?: string }>({})
    const [showFilters, setShowFilters] = useState(false)

    useEffect(() => {
        loadTransactions()
    }, [page, filters])

    const loadTransactions = async () => {
        setLoading(true)
        const data = await getTransactions(page, 20, filters)
        setTransactions(data.transactions)
        setTotal(data.total)
        setLoading(false)
    }

    const handleExport = () => {
        exportToCSV(transactions.map(t => ({
            类型: typeConfig[t.type]?.label || t.type,
            用户: t.user_email,
            金额: t.amount,
            描述: t.description,
            时间: new Date(t.created_at).toLocaleString('zh-CN')
        })), 'transactions')
    }

    const TypeBadge = ({ type }: { type: string }) => {
        const config = typeConfig[type] || { label: type, color: 'text-white/50', icon: Star }
        const Icon = config.icon
        return (
            <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/5 ${config.color} text-sm`}>
                <Icon className="w-3.5 h-3.5" />
                {config.label}
            </span>
        )
    }

    return (
        <div className="flex-1 p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">交易流水</h1>
                    <p className="text-white/50">共 {total} 条记录</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${showFilters ? 'bg-primary/20 text-primary' : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                            }`}
                    >
                        <Filter className="w-4 h-4" />
                        筛选
                    </button>
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-xl transition-all"
                    >
                        <Download className="w-4 h-4" />
                        导出CSV
                    </button>
                </div>
            </div>

            {/* Filters */}
            {showFilters && (
                <div className="glass-panel rounded-2xl p-4 mb-6 flex flex-wrap gap-4">
                    <div>
                        <label className="block text-xs text-white/50 mb-1">交易类型</label>
                        <select
                            value={filters.type || ''}
                            onChange={(e) => setFilters({ ...filters, type: e.target.value || undefined })}
                            className="bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-white text-sm focus:outline-none focus:border-primary/50"
                        >
                            <option value="">全部</option>
                            {Object.entries(typeConfig).map(([key, { label }]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs text-white/50 mb-1">开始日期</label>
                        <input
                            type="date"
                            value={filters.dateFrom || ''}
                            onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value || undefined })}
                            className="bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-white text-sm focus:outline-none focus:border-primary/50"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-white/50 mb-1">结束日期</label>
                        <input
                            type="date"
                            value={filters.dateTo || ''}
                            onChange={(e) => setFilters({ ...filters, dateTo: e.target.value || undefined })}
                            className="bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-white text-sm focus:outline-none focus:border-primary/50"
                        />
                    </div>
                    <button
                        onClick={() => { setFilters({}); setPage(1) }}
                        className="self-end px-4 py-2 text-white/50 hover:text-white transition-colors text-sm"
                    >
                        清除筛选
                    </button>
                </div>
            )}

            {/* Table */}
            <div className="glass-panel rounded-2xl overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-white/10">
                            <th className="text-left p-4 text-white/50 font-medium">类型</th>
                            <th className="text-left p-4 text-white/50 font-medium">用户</th>
                            <th className="text-right p-4 text-white/50 font-medium">金额</th>
                            <th className="text-left p-4 text-white/50 font-medium">描述</th>
                            <th className="text-left p-4 text-white/50 font-medium">时间</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-white/50">
                                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                                    加载中...
                                </td>
                            </tr>
                        ) : transactions.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-white/50">
                                    暂无交易记录
                                </td>
                            </tr>
                        ) : (
                            transactions.map(t => (
                                <tr key={t.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                    <td className="p-4">
                                        <TypeBadge type={t.type} />
                                    </td>
                                    <td className="p-4 text-white/70 text-sm">{t.user_email}</td>
                                    <td className="p-4 text-right">
                                        <span className={t.amount >= 0 ? 'text-green-400' : 'text-red-400'}>
                                            {t.amount >= 0 ? '+' : ''}{t.amount}
                                        </span>
                                    </td>
                                    <td className="p-4 text-white/50 text-sm max-w-xs truncate">{t.description || '-'}</td>
                                    <td className="p-4 text-white/50 text-sm">
                                        {new Date(t.created_at).toLocaleString('zh-CN')}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {total > 20 && (
                <div className="flex justify-center gap-2 mt-6">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white/70 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        上一页
                    </button>
                    <span className="px-4 py-2 text-white/50">第 {page} 页 / 共 {Math.ceil(total / 20)} 页</span>
                    <button
                        onClick={() => setPage(p => p + 1)}
                        disabled={page * 20 >= total}
                        className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white/70 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        下一页
                    </button>
                </div>
            )}
        </div>
    )
}
