import { createClient } from '@supabase/supabase-js'

// ⚠️ 后台管理使用 service_role key 绕过 RLS
// 此key仅用于内部管理，不可暴露到客户端
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials. Check .env.local file.')
}

export const supabase = createClient(supabaseUrl || '', supabaseServiceKey || '', {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// ==================== 类型定义 ====================

export interface User {
  id: string
  email: string
  created_at: string
  balance: number
  total_recharge: number
}

export interface Transaction {
  id: string
  user_id: string
  user_email?: string
  type: 'initial' | 'daily_bonus' | 'recharge' | 'consume' | 'refund'
  amount: number
  recharge_value: number
  description: string | null
  reference_id: string | null
  created_at: string
}

export interface Reading {
  id: string
  user_id: string
  user_email?: string
  spread_type: string
  spread_name: string
  question: string | null
  cards: any
  interpretation: string
  language: string
  created_at: string
}

export interface DashboardStats {
  totalUsers: number
  totalRevenue: number
  totalReadings: number
  todayActiveUsers: number
  todayRevenue: number
  todayReadings: number
}

// ==================== API 函数 ====================

/**
 * 获取仪表盘统计数据
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  const today = new Date().toISOString().split('T')[0]

  // 获取用户总数
  const { count: totalUsers } = await supabase
    .from('user_profiles')
    .select('*', { count: 'exact', head: true })

  // 获取充值总额
  const { data: rechargeData } = await supabase
    .from('transactions')
    .select('amount')
    .eq('type', 'recharge')

  const totalRevenue = rechargeData?.reduce((sum, t) => sum + t.amount, 0) || 0

  // 获取占卜总数
  const { count: totalReadings } = await supabase
    .from('readings')
    .select('*', { count: 'exact', head: true })

  // 今日活跃用户（有交易或占卜）
  const { data: todayTransactions } = await supabase
    .from('transactions')
    .select('user_id')
    .gte('created_at', today)

  const { data: todayReadingsData } = await supabase
    .from('readings')
    .select('user_id')
    .gte('created_at', today)

  const todayUserIds = new Set([
    ...(todayTransactions?.map(t => t.user_id) || []),
    ...(todayReadingsData?.map(r => r.user_id) || [])
  ])

  // 今日充值
  const { data: todayRechargeData } = await supabase
    .from('transactions')
    .select('amount')
    .eq('type', 'recharge')
    .gte('created_at', today)

  const todayRevenue = todayRechargeData?.reduce((sum, t) => sum + t.amount, 0) || 0

  return {
    totalUsers: totalUsers || 0,
    totalRevenue,
    totalReadings: totalReadings || 0,
    todayActiveUsers: todayUserIds.size,
    todayRevenue,
    todayReadings: todayReadingsData?.length || 0
  }
}

/**
 * 获取用户列表（带余额）
 */
export async function getUsers(page = 1, pageSize = 20, search = ''): Promise<{ users: User[], total: number }> {
  // 获取用户列表
  const { data: authUsers, error } = await supabase.auth.admin.listUsers({
    page,
    perPage: pageSize
  })

  if (error) {
    console.error('Failed to list users:', error)
    return { users: [], total: 0 }
  }

  // 获取余额信息
  const userIds = authUsers.users.map(u => u.id)
  const { data: balances } = await supabase
    .from('user_balance')
    .select('*')
    .in('user_id', userIds)

  const balanceMap = new Map(balances?.map(b => [b.user_id, b]) || [])

  const users: User[] = authUsers.users
    .filter(u => !search || u.email?.toLowerCase().includes(search.toLowerCase()))
    .map(u => ({
      id: u.id,
      email: u.email || 'Unknown',
      created_at: u.created_at,
      balance: balanceMap.get(u.id)?.balance || 0,
      total_recharge: balanceMap.get(u.id)?.total_recharge || 0
    }))

  return {
    users,
    total: authUsers.users.length
  }
}

/**
 * 获取交易流水
 */
export async function getTransactions(
  page = 1,
  pageSize = 20,
  filters: { type?: string, userId?: string, dateFrom?: string, dateTo?: string } = {}
): Promise<{ transactions: Transaction[], total: number }> {
  let query = supabase
    .from('transactions')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })

  if (filters.type) {
    query = query.eq('type', filters.type)
  }
  if (filters.userId) {
    query = query.eq('user_id', filters.userId)
  }
  if (filters.dateFrom) {
    query = query.gte('created_at', filters.dateFrom)
  }
  if (filters.dateTo) {
    query = query.lte('created_at', filters.dateTo + 'T23:59:59')
  }

  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const { data, count, error } = await query.range(from, to)

  if (error) {
    console.error('Failed to get transactions:', error)
    return { transactions: [], total: 0 }
  }

  // 获取用户邮箱
  const userIds = [...new Set(data?.map(t => t.user_id) || [])]
  const emailMap = await getUserEmails(userIds)

  const transactions: Transaction[] = (data || []).map(t => ({
    ...t,
    user_email: emailMap.get(t.user_id) || 'Unknown'
  }))

  return {
    transactions,
    total: count || 0
  }
}

/**
 * 获取占卜记录
 */
export async function getReadings(
  page = 1,
  pageSize = 20,
  userId?: string
): Promise<{ readings: Reading[], total: number }> {
  let query = supabase
    .from('readings')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })

  if (userId) {
    query = query.eq('user_id', userId)
  }

  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const { data, count, error } = await query.range(from, to)

  if (error) {
    console.error('Failed to get readings:', error)
    return { readings: [], total: 0 }
  }

  // 获取用户邮箱
  const userIds = [...new Set(data?.map(r => r.user_id) || [])]
  const emailMap = await getUserEmails(userIds)

  const readings: Reading[] = (data || []).map(r => ({
    ...r,
    user_email: emailMap.get(r.user_id) || 'Unknown'
  }))

  return {
    readings,
    total: count || 0
  }
}

/**
 * 手动充值
 */
export async function manualRecharge(userId: string, coins: number, description = '管理员手动充值'): Promise<boolean> {
  const { error } = await supabase
    .from('transactions')
    .insert({
      user_id: userId,
      type: 'recharge',
      amount: coins,
      recharge_value: coins,
      description
    })

  if (error) {
    console.error('Failed to recharge:', error)
    return false
  }

  return true
}

/**
 * 获取用户邮箱映射
 */
async function getUserEmails(userIds: string[]): Promise<Map<string, string>> {
  if (userIds.length === 0) return new Map()

  const { data } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 1000
  })

  const map = new Map<string, string>()
  data?.users.forEach(u => {
    if (userIds.includes(u.id)) {
      map.set(u.id, u.email || 'Unknown')
    }
  })

  return map
}

/**
 * 导出CSV
 */
export function exportToCSV(data: any[], filename: string) {
  if (data.length === 0) return

  const headers = Object.keys(data[0])
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(h => JSON.stringify(row[h] ?? '')).join(','))
  ].join('\n')

  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`
  link.click()
}

/**
 * 删除用户账号
 */
export async function deleteUser(userId: string): Promise<boolean> {
  const { error } = await supabase.auth.admin.deleteUser(userId)

  if (error) {
    console.error('Failed to delete user:', error)
    return false
  }

  return true
}
