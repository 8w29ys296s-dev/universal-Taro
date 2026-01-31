import { useEffect, useState } from 'react'
import { getReadings, Reading, exportToCSV } from '../services/adminService'
import { Download, Loader2, Eye, X, BookOpen } from 'lucide-react'

export default function Readings() {
    const [readings, setReadings] = useState<Reading[]>([])
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)
    const [loading, setLoading] = useState(true)
    const [detailModal, setDetailModal] = useState<{ open: boolean; reading: Reading | null }>({ open: false, reading: null })

    useEffect(() => {
        loadReadings()
    }, [page])

    const loadReadings = async () => {
        setLoading(true)
        const data = await getReadings(page, 20)
        setReadings(data.readings)
        setTotal(data.total)
        setLoading(false)
    }

    const handleExport = () => {
        exportToCSV(readings.map(r => ({
            用户: r.user_email,
            牌阵: r.spread_name,
            问题: r.question || '-',
            语言: r.language,
            时间: new Date(r.created_at).toLocaleString('zh-CN')
        })), 'readings')
    }

    return (
        <div className="flex-1 p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">占卜记录</h1>
                    <p className="text-white/50">共 {total} 条占卜记录</p>
                </div>
                <button
                    onClick={handleExport}
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-xl transition-all"
                >
                    <Download className="w-4 h-4" />
                    导出CSV
                </button>
            </div>

            {/* Table */}
            <div className="glass-panel rounded-2xl overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-white/10">
                            <th className="text-left p-4 text-white/50 font-medium">用户</th>
                            <th className="text-left p-4 text-white/50 font-medium">牌阵</th>
                            <th className="text-left p-4 text-white/50 font-medium">问题</th>
                            <th className="text-left p-4 text-white/50 font-medium">时间</th>
                            <th className="text-center p-4 text-white/50 font-medium">操作</th>
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
                        ) : readings.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-white/50">
                                    暂无占卜记录
                                </td>
                            </tr>
                        ) : (
                            readings.map(r => (
                                <tr key={r.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                    <td className="p-4 text-white/70 text-sm">{r.user_email}</td>
                                    <td className="p-4">
                                        <span className="px-2 py-1 bg-purple-500/10 text-purple-400 rounded-lg text-sm">
                                            {r.spread_name}
                                        </span>
                                    </td>
                                    <td className="p-4 text-white max-w-xs truncate">{r.question || '-'}</td>
                                    <td className="p-4 text-white/50 text-sm">
                                        {new Date(r.created_at).toLocaleString('zh-CN')}
                                    </td>
                                    <td className="p-4 text-center">
                                        <button
                                            onClick={() => setDetailModal({ open: true, reading: r })}
                                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-lg transition-colors text-sm"
                                        >
                                            <Eye className="w-3 h-3" />
                                            查看
                                        </button>
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

            {/* Detail Modal */}
            {detailModal.open && detailModal.reading && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setDetailModal({ open: false, reading: null })} />
                    <div className="relative w-full max-w-2xl max-h-[80vh] glass-panel rounded-2xl p-6 overflow-y-auto">
                        <button
                            onClick={() => setDetailModal({ open: false, reading: null })}
                            className="absolute top-4 right-4 text-white/50 hover:text-white"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                                <BookOpen className="w-5 h-5 text-purple-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-white">{detailModal.reading.spread_name}</h3>
                                <p className="text-sm text-white/50">{detailModal.reading.user_email}</p>
                            </div>
                        </div>

                        {/* Question */}
                        {detailModal.reading.question && (
                            <div className="mb-6">
                                <h4 className="text-sm text-white/50 mb-2">提问</h4>
                                <p className="text-white bg-white/5 rounded-xl p-4">{detailModal.reading.question}</p>
                            </div>
                        )}

                        {/* Cards */}
                        <div className="mb-6">
                            <h4 className="text-sm text-white/50 mb-2">抽取的牌</h4>
                            <div className="flex flex-wrap gap-2">
                                {(detailModal.reading.cards || []).map((card: any, idx: number) => (
                                    <span key={idx} className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm">
                                        {card.name} {card.isReversed ? '(逆位)' : ''}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Interpretation */}
                        <div>
                            <h4 className="text-sm text-white/50 mb-2">AI解读</h4>
                            <div className="text-white/80 bg-white/5 rounded-xl p-4 whitespace-pre-wrap text-sm leading-relaxed max-h-60 overflow-y-auto">
                                {detailModal.reading.interpretation}
                            </div>
                        </div>

                        {/* Time */}
                        <div className="mt-6 pt-4 border-t border-white/10 text-sm text-white/40">
                            占卜时间: {new Date(detailModal.reading.created_at).toLocaleString('zh-CN')}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
