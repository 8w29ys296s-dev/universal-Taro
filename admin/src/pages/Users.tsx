import { useEffect, useState } from 'react'
import { getUsers, User, manualRecharge, exportToCSV, deleteUser } from '../services/adminService'
import { Search, Coins, Download, Plus, X, Check, Loader2, Trash2, AlertTriangle } from 'lucide-react'

export default function Users() {
    const [users, setUsers] = useState<User[]>([])
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(true)

    // 充值弹窗状态
    const [rechargeModal, setRechargeModal] = useState<{ open: boolean; user: User | null }>({ open: false, user: null })
    const [rechargeAmount, setRechargeAmount] = useState('')
    const [recharging, setRecharging] = useState(false)

    // 删除弹窗状态
    const [deleteModal, setDeleteModal] = useState<{ open: boolean; user: User | null }>({ open: false, user: null })
    const [deleting, setDeleting] = useState(false)

    useEffect(() => {
        loadUsers()
    }, [page])

    const loadUsers = async () => {
        setLoading(true)
        const data = await getUsers(page, 20, search)
        setUsers(data.users)
        setTotal(data.total)
        setLoading(false)
    }

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        setPage(1)
        loadUsers()
    }

    const handleRecharge = async () => {
        if (!rechargeModal.user || !rechargeAmount) return

        setRecharging(true)
        const success = await manualRecharge(
            rechargeModal.user.id,
            parseInt(rechargeAmount),
            `管理员手动充值 ${rechargeAmount} 金币`
        )
        setRecharging(false)

        if (success) {
            setRechargeModal({ open: false, user: null })
            setRechargeAmount('')
            loadUsers() // 刷新列表
        }
    }

    const handleExport = () => {
        exportToCSV(users.map(u => ({
            邮箱: u.email,
            余额: u.balance,
            累计充值: u.total_recharge,
            注册时间: new Date(u.created_at).toLocaleString('zh-CN')
        })), 'users')
    }

    const handleDelete = async () => {
        if (!deleteModal.user) return

        setDeleting(true)
        const success = await deleteUser(deleteModal.user.id)
        setDeleting(false)

        if (success) {
            setDeleteModal({ open: false, user: null })
            loadUsers() // 刷新列表
        }
    }

    return (
        <div className="flex-1 p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">用户管理</h1>
                    <p className="text-white/50">共 {total} 位注册用户</p>
                </div>
                <button
                    onClick={handleExport}
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-xl transition-all"
                >
                    <Download className="w-4 h-4" />
                    导出CSV
                </button>
            </div>

            {/* Search */}
            <form onSubmit={handleSearch} className="mb-6">
                <div className="relative max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="搜索邮箱..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:border-primary/50"
                    />
                </div>
            </form>

            {/* Table */}
            <div className="glass-panel rounded-2xl overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-white/10">
                            <th className="text-left p-4 text-white/50 font-medium">邮箱</th>
                            <th className="text-right p-4 text-white/50 font-medium">余额</th>
                            <th className="text-right p-4 text-white/50 font-medium">累计充值</th>
                            <th className="text-left p-4 text-white/50 font-medium">注册时间</th>
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
                        ) : users.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-white/50">
                                    暂无用户数据
                                </td>
                            </tr>
                        ) : (
                            users.map(user => (
                                <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                    <td className="p-4 text-white">{user.email}</td>
                                    <td className="p-4 text-right">
                                        <span className="text-primary font-medium">{user.balance}</span>
                                        <span className="text-white/30 ml-1">币</span>
                                    </td>
                                    <td className="p-4 text-right text-white/70">{user.total_recharge}</td>
                                    <td className="p-4 text-white/50 text-sm">
                                        {new Date(user.created_at).toLocaleString('zh-CN')}
                                    </td>
                                    <td className="p-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => setRechargeModal({ open: true, user })}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors text-sm"
                                            >
                                                <Plus className="w-3 h-3" />
                                                充值
                                            </button>
                                            <button
                                                onClick={() => setDeleteModal({ open: true, user })}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors text-sm"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                                删除
                                            </button>
                                        </div>
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
                    <span className="px-4 py-2 text-white/50">第 {page} 页</span>
                    <button
                        onClick={() => setPage(p => p + 1)}
                        disabled={page * 20 >= total}
                        className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white/70 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        下一页
                    </button>
                </div>
            )}

            {/* Recharge Modal */}
            {rechargeModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setRechargeModal({ open: false, user: null })} />
                    <div className="relative w-full max-w-md glass-panel rounded-2xl p-6">
                        <button
                            onClick={() => setRechargeModal({ open: false, user: null })}
                            className="absolute top-4 right-4 text-white/50 hover:text-white"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                                <Coins className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-white">手动充值</h3>
                                <p className="text-sm text-white/50">{rechargeModal.user?.email}</p>
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm text-white/50 mb-2">充值金额(金币)</label>
                            <input
                                type="number"
                                value={rechargeAmount}
                                onChange={(e) => setRechargeAmount(e.target.value)}
                                placeholder="输入金币数量"
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-white/30 focus:outline-none focus:border-primary/50"
                            />
                        </div>

                        <button
                            onClick={handleRecharge}
                            disabled={!rechargeAmount || recharging}
                            className="w-full py-3 bg-gradient-to-r from-primary to-amber-600 text-background-dark font-semibold rounded-xl hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {recharging ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <Check className="w-5 h-5" />
                                    确认充值
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* Delete Confirm Modal */}
            {deleteModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setDeleteModal({ open: false, user: null })} />
                    <div className="relative w-full max-w-md glass-panel rounded-2xl p-6">
                        <button
                            onClick={() => setDeleteModal({ open: false, user: null })}
                            className="absolute top-4 right-4 text-white/50 hover:text-white"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                                <AlertTriangle className="w-5 h-5 text-red-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-white">删除账号</h3>
                                <p className="text-sm text-white/50">{deleteModal.user?.email}</p>
                            </div>
                        </div>

                        <p className="text-white/70 mb-6">
                            确定要删除此用户吗？此操作将永久删除该用户的所有数据，<span className="text-red-400 font-medium">无法恢复</span>。
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteModal({ open: false, user: null })}
                                className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white/70 font-semibold rounded-xl transition-all"
                            >
                                取消
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={deleting}
                                className="flex-1 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {deleting ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        <Trash2 className="w-4 h-4" />
                                        确认删除
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
