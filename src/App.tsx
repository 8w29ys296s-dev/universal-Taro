import React, { useState, useEffect, useRef, createContext, useContext } from 'react';
import { HashRouter as Router, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import BottomNav from './components/BottomNav';
import BackHeader from './components/BackHeader';
import { SPREADS, MOCK_CARDS, CARD_BACK_IMAGE, STORE_ITEMS, UNLOCK_THRESHOLD, ENDOWED_PROGRESS } from './constants';
import { getTarotInterpretation } from './services/geminiService';
import { SpreadType, Card, Reading, SpreadConfig } from './types';
import { Sparkles, Lock, Mail, ArrowRight, User, Coins, LogOut, CheckCircle2, Loader2, Star } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

// --- I18n Constants ---
type Language = 'zh' | 'en';

const translations: Record<Language, Record<string, string>> = {
    zh: {
        'app.title': '你好, 寻道者',
        'app.quote': '"星辰指引方向，内心映照真理。此刻的困惑，或许正是通往智慧的钥匙。"',
        'app.select_spread': '选择牌阵开始占卜',
        'app.balance': '余额',
        'app.disclaimer': '仅供娱乐 • 结果仅供参考',
        'bonus.title': '每日星辰馈赠',
        'bonus.desc': '宇宙能量为你汇聚，愿今日指引常伴。',
        'bonus.btn': '收下祝福',
        'store.title': '星辰商店',
        'store.current': '当前金币',
        'store.coins': '金币',
        'store.gift': '送',
        'store.success': '充值成功',
        'store.return_reading': '继续之前的占卜',
        'store.unlock_title': '命运轨迹',
        'store.unlock_desc': '累计获得金币以解锁 56 张小阿卡纳牌库',
        'store.unlocked': '全牌库已觉醒',
        'store.locked_status': '觉醒进度 {current}/{target}',
        'store.endowed': '✨ 初始星尘已注入',
        'funds.title': '能量不足',
        'funds.desc': '您的金币不足以开启本次占卜。\n请前往商店获取更多星辰能量。',
        'funds.later': '稍后再说',
        'funds.recharge': '前往充值',
        'guide.title': '提问引导',
        'guide.subtitle': '聚焦你的能量',
        'guide.text': '深呼吸，让思绪沉淀，向宇宙发问',
        'guide.placeholder': '输入你的问题……\n\n例如：\n最近我的事业会有什么转机？\n我和他的关系将会如何发展？',
        'guide.start': '开始占卜',
        'payment.gathering': '正在汇聚命运能量...',
        'shuffle.title': '洗牌',
        'shuffle.text': '洗牌中 - 感受能量流动',
        'shuffle.stop': '停止',
        'draw.draw_next': '请抽取第 {n} 张牌...',
        'draw.complete': '抽取完成，正在解析...',
        'draw.daily_label': '今日指引',
        'reading.title': '牌面解读',
        'reading.ai_analysis': 'AI 深度解析',
        'reading.loading': 'AI 正在通灵牌意...',
        'reading.save': '保存',
        'reading.saved': '已保存(取消)',
        'reading.share': '分享签文',
        'reading.share_title': '🔮 宇宙塔罗指引',
        'reading.share_question': '❓ 问题',
        'reading.share_spread': '📜 牌阵',
        'reading.share_guidance': '✨ 指引摘要',
        'reading.copy_success': '签文已复制，快去分享吧',
        'reading.delete_confirm': '确定要将此记录从日志中移除吗？',
        'reading.removed': '已从日志移除',
        'reading.saved_toast': '已保存至日志',
        'reading.upright': '正位',
        'reading.reversed': '逆位',
        'reading.skip_typing': '跳过动画',
        'journal.title': '占卜日志',
        'journal.empty': '暂无占卜记录',
        'journal.delete_confirm': '确定要删除这条占卜记录吗？',
        'journal.deleted': '已删除',
        'settings.title': '系统设置',
        'settings.music': '背景音乐',
        'settings.haptic': '触感反馈',
        'settings.notification': '每日运势提醒',
        'profile.title': '个人中心',
        'profile.login': '点击登录',
        'profile.recharge': '充值',
        'profile.journal': '我的占卜日志',
        'profile.settings': '系统设置',
        'profile.contact': '联系客服',
        'profile.logout': '退出登录',
        'profile.delete': '注销账户 (Delete Account)',
        'profile.logout_confirm': '确定要退出登录吗？',
        'profile.delete_confirm': '警告：此操作将永久删除您的账户数据且无法恢复。是否继续？',
        'login.title': '连接能量',
        'login.subtitle': '开启你的专属星辰旅程',
        'login.method_phone': '手机号',
        'login.method_email': '邮箱',
        'login.phone': '手机号码',
        'login.email': '邮箱地址',
        'login.code': '验证码',
        'login.get_code': '获取验证码',
        'login.btn': '开启旅程',
        'login.agree_prefix': '我已阅读并同意',
        'login.terms': '《用户协议》',
        'login.privacy': '《隐私政策》',
        'login.agree_suffix': '，并知悉本应用仅供娱乐。',
        'terms.title': '用户协议与隐私政策',
        'terms.content': '欢迎使用 Universal Tarot AI。\n\n1. 本应用提供的塔罗解读仅供娱乐和心理咨询参考，不构成任何法律、医疗或财务建议。\n\n2. 我们重视您的隐私。您的占卜记录仅保存在本地设备上，除非您主动分享。\n\n3. 严禁使用本应用进行任何非法活动。\n\n4. 未成年人请在监护人陪同下使用。',
        'toast.phone_err': '请输入有效的手机号',
        'toast.email_err': '请输入有效的邮箱地址',
        'toast.code_err': '请输入验证码',
        'toast.code_sent': '验证码已发送: 1234',
        'toast.login_success': '登录成功',
        'toast.logout': '已安全退出',
        'nav.home': '首页',
        'nav.journal': '日志',
        'nav.store': '商店',
        'nav.profile': '我的',
        'unlock.congrats': '宇宙校准完成',
        'unlock.message': '小阿卡纳已融入您的命运牌库',
        'unlock.continue': '继续旅程'
    },
    en: {
        'app.title': 'Hello, Seeker',
        'app.quote': '"The stars guide the way, the heart reflects the truth. Your confusion is the key to wisdom."',
        'app.select_spread': 'Select a Spread',
        'app.balance': 'Balance',
        'app.disclaimer': 'Entertainment Only • Results for Reference',
        'bonus.title': 'Daily Gift',
        'bonus.desc': 'Cosmic energy gathers for you. May guidance be with you.',
        'bonus.btn': 'Claim Gift',
        'store.title': 'Star Store',
        'store.current': 'Current Balance',
        'store.coins': 'Coins',
        'store.gift': 'Bonus',
        'store.success': 'Recharge Successful',
        'store.return_reading': 'Continue Reading',
        'store.unlock_title': 'Destiny Progression',
        'store.unlock_desc': 'Accumulate coins to unlock the 56 Minor Arcana Cards',
        'store.unlocked': 'Full Deck Awakened',
        'store.locked_status': 'Awakening {current}/{target}',
        'store.endowed': '✨ Ancient Stardust Infused',
        'funds.title': 'Low Energy',
        'funds.desc': 'Insufficient coins for this reading.\nPlease visit the store.',
        'funds.later': 'Not Now',
        'funds.recharge': 'Recharge',
        'guide.title': 'Focus Energy',
        'guide.subtitle': 'Focus Your Intent',
        'guide.text': 'Breathe deeply, settle your thoughts, and ask the universe.',
        'guide.placeholder': 'Type your question here...\n\nExample:\nWhat changes are coming in my career?\nHow will my relationship develop?',
        'guide.start': 'Start Reading',
        'payment.gathering': 'Gathering Destiny Energy...',
        'shuffle.title': 'Shuffle',
        'shuffle.text': 'Shuffling - Feel the Flow',
        'shuffle.stop': 'Stop',
        'draw.draw_next': 'Draw Card {n}...',
        'draw.complete': 'Drawing Complete, Interpreting...',
        'draw.daily_label': 'Daily Guide',
        'reading.title': 'Interpretation',
        'reading.ai_analysis': 'AI Deep Analysis',
        'reading.loading': 'AI is channeling the meaning...',
        'reading.save': 'Save',
        'reading.saved': 'Saved (Undo)',
        'reading.share': 'Share',
        'reading.share_title': '🔮 Universal Tarot',
        'reading.share_question': '❓ Question',
        'reading.share_spread': '📜 Spread',
        'reading.share_guidance': '✨ Guidance',
        'reading.copy_success': 'Copied to clipboard!',
        'reading.delete_confirm': 'Remove this reading from journal?',
        'reading.removed': 'Removed from journal',
        'reading.saved_toast': 'Saved to journal',
        'reading.upright': 'Upright',
        'reading.reversed': 'Reversed',
        'reading.skip_typing': 'Skip Animation',
        'journal.title': 'Journal',
        'journal.empty': 'No readings yet',
        'journal.delete_confirm': 'Delete this reading record?',
        'journal.deleted': 'Deleted',
        'settings.title': 'Settings',
        'settings.music': 'Music',
        'settings.haptic': 'Haptics',
        'settings.notification': 'Daily Notification',
        'profile.title': 'Profile',
        'profile.login': 'Tap to Login',
        'profile.recharge': 'Add Funds',
        'profile.journal': 'My Journal',
        'profile.settings': 'Settings',
        'profile.contact': 'Support',
        'profile.logout': 'Logout',
        'profile.delete': 'Delete Account',
        'profile.logout_confirm': 'Are you sure you want to logout?',
        'profile.delete_confirm': 'WARNING: This will permanently delete your account data. Continue?',
        'login.title': 'Connect',
        'login.subtitle': 'Start your cosmic journey',
        'login.method_phone': 'Phone',
        'login.method_email': 'Email',
        'login.phone': 'Phone Number',
        'login.email': 'Email Address',
        'login.code': 'Code',
        'login.get_code': 'Get Code',
        'login.btn': 'Login',
        'login.agree_prefix': 'I agree to ',
        'login.terms': 'Terms',
        'login.privacy': 'Privacy Policy',
        'login.agree_suffix': '. Entertainment purposes only.',
        'terms.title': 'Terms & Privacy',
        'terms.content': 'Welcome to Universal Tarot AI.\n\n1. Readings are for entertainment and reference only. Not professional advice.\n\n2. We respect your privacy. Data is stored locally unless shared.\n\n3. Illegal use is prohibited.\n\n4. Minors should use with guardian supervision.',
        'toast.phone_err': 'Invalid phone number',
        'toast.email_err': 'Invalid email address',
        'toast.code_err': 'Enter verification code',
        'toast.code_sent': 'Code sent: 1234',
        'toast.login_success': 'Login Success',
        'toast.logout': 'Logged out',
        'nav.home': 'Home',
        'nav.journal': 'Journal',
        'nav.store': 'Store',
        'nav.profile': 'Profile',
        'unlock.congrats': 'Universal Alignment Complete',
        'unlock.message': 'The Minor Arcana have joined your destiny.',
        'unlock.continue': 'Continue Journey'
    }
};

// --- Language Context ---
interface LanguageContextType {
    lang: Language;
    setLang: (lang: Language) => void;
    t: (key: string, params?: Record<string, any>) => string;
}

const LanguageContext = createContext<LanguageContextType>({
    lang: 'zh',
    setLang: () => {},
    t: (key) => key
});

const useLanguage = () => useContext(LanguageContext);

// --- Constants ---
const INITIAL_BALANCE = 30; // UPDATED: Set to 30 as requested
const DAILY_LOGIN_BONUS = 10;
const MUSIC_URL = "https://cdn.pixabay.com/audio/2022/10/25/audio_517409292a.mp3"; 

// --- Haptic Feedback Helper ---
const triggerHaptic = () => {
    try {
        const settings = JSON.parse(localStorage.getItem('user_settings') || '{}');
        const isHapticEnabled = settings.haptic !== false;
        
        if (isHapticEnabled && navigator.vibrate) {
            navigator.vibrate(10);
        }
    } catch (e) { }
};

const triggerStrongHaptic = () => {
    try {
        if (navigator.vibrate) {
            navigator.vibrate([50, 30, 50, 30, 100]);
        }
    } catch (e) {}
}

// --- Global State Helper (Local Storage Wrapper) ---
const getUserBalance = () => {
    const saved = localStorage.getItem('user_balance');
    return saved ? parseInt(saved) : INITIAL_BALANCE;
};

const setUserBalance = (amount: number) => {
    localStorage.setItem('user_balance', amount.toString());
    window.dispatchEvent(new Event('balance_updated'));
};

const getUserTotalRecharge = () => {
    const saved = localStorage.getItem('user_total_recharge');
    if (!saved) {
        localStorage.setItem('user_total_recharge', ENDOWED_PROGRESS.toString());
        return ENDOWED_PROGRESS;
    }
    return parseFloat(saved);
};

const addToTotalRecharge = (amount: number) => {
    const current = getUserTotalRecharge();
    localStorage.setItem('user_total_recharge', (current + amount).toString());
    window.dispatchEvent(new Event('balance_updated')); 
};

const getReadings = (): Reading[] => {
    const saved = localStorage.getItem('user_readings');
    return saved ? JSON.parse(saved) : [];
};

const saveReading = (reading: Reading) => {
    const readings = getReadings();
    readings.unshift(reading);
    localStorage.setItem('user_readings', JSON.stringify(readings));
    window.dispatchEvent(new Event('readings_updated'));
};

const deleteReading = (id: string) => {
    const readings = getReadings().filter(r => r.id !== id);
    localStorage.setItem('user_readings', JSON.stringify(readings));
    window.dispatchEvent(new Event('readings_updated'));
};

interface AuthData {
    identifier: string; // phone or email
    type: 'phone' | 'email';
    id: string;
    loginTime: string;
}

const getAuth = (): AuthData | null => {
    const saved = localStorage.getItem('user_auth');
    if (!saved) return null;
    try {
        const parsed = JSON.parse(saved);
        if (parsed.phone && !parsed.identifier) {
            return { identifier: parsed.phone, type: 'phone', id: parsed.id, loginTime: parsed.loginTime };
        }
        return parsed;
    } catch {
        return null;
    }
};

const setAuth = (identifier: string, type: 'phone' | 'email') => {
    const authData: AuthData = { 
        identifier, 
        type,
        id: Date.now().toString(),
        loginTime: new Date().toISOString() 
    };
    localStorage.setItem('user_auth', JSON.stringify(authData));
    window.dispatchEvent(new Event('auth_updated'));
};

const clearAuth = () => {
    localStorage.removeItem('user_auth');
    window.dispatchEvent(new Event('auth_updated'));
};

const getSettings = () => {
    const saved = localStorage.getItem('user_settings');
    return saved ? JSON.parse(saved) : { music: true, haptic: true, notification: false };
};

const saveSettings = (settings: any) => {
    localStorage.setItem('user_settings', JSON.stringify(settings));
    window.dispatchEvent(new Event('settings_updated'));
};

const showToast = (message: string, icon: string = 'info') => {
    const feedback = document.createElement('div');
    feedback.className = 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#1a0b2e]/90 text-white px-6 py-4 rounded-xl z-[100] backdrop-blur-md flex flex-col items-center animate-[shimmer_0.3s_ease-out] border border-primary/20 shadow-2xl pointer-events-none';
    feedback.innerHTML = `<span class="material-symbols-outlined text-primary text-3xl mb-2">${icon}</span><p class="text-sm font-medium tracking-wide text-center whitespace-nowrap">${message}</p>`;
    document.body.appendChild(feedback);
    setTimeout(() => feedback.remove(), 2000);
};

// --- Components ---

const ScrollToTop = () => {
    const { pathname } = useLocation();
    useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
    return null;
};

const BackgroundMusic = () => {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        const audio = new Audio(MUSIC_URL);
        audio.loop = true;
        audio.volume = 0.3;
        audioRef.current = audio;

        const attemptPlay = () => {
             audio.play().then(() => {
                setIsPlaying(true);
            }).catch(e => {
                const startAudio = () => {
                    const currentSettings = getSettings();
                    if (currentSettings.music) {
                        audio.play();
                        setIsPlaying(true);
                    }
                    document.removeEventListener('click', startAudio);
                    document.removeEventListener('touchstart', startAudio);
                };
                document.addEventListener('click', startAudio);
                document.addEventListener('touchstart', startAudio);
            });
        };

        const checkSettingsAndPlay = () => {
            const settings = getSettings();
            if (settings.music && !document.hidden) {
               attemptPlay();
            } else {
                audio.pause();
                setIsPlaying(false);
            }
        };

        const handleVisibilityChange = () => {
            const settings = getSettings();
            if (document.hidden) {
                audio.pause();
            } else if (settings.music) {
                audio.play().catch(() => {}); 
            }
        };

        checkSettingsAndPlay();
        window.addEventListener('settings_updated', checkSettingsAndPlay);
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            audio.pause();
            audio.src = '';
            window.removeEventListener('settings_updated', checkSettingsAndPlay);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    return null;
};

const NebulaProgress = ({ current, target, isEndowed }: { current: number, target: number, isEndowed: boolean }) => {
    const progress = Math.min((current / target) * 100, 100);
    const isUnlocked = current >= target;
    const getGradient = () => {
        if (isUnlocked) return 'linear-gradient(90deg, #f4c025, #ffebb7)';
        if (progress > 80) return 'linear-gradient(90deg, #9333ea, #f4c025)';
        return 'linear-gradient(90deg, #3b0764, #9333ea)';
    };

    return (
        <div className="relative w-full h-4 bg-[#0f0518] rounded-full overflow-hidden border border-white/10 shadow-inner">
            <div className="absolute inset-0 opacity-30" style={{backgroundImage: 'radial-gradient(white 1px, transparent 1px)', backgroundSize: '10px 10px'}}></div>
            <div className="absolute top-0 left-0 h-full transition-all duration-[1500ms] ease-out relative overflow-hidden" style={{ width: `${progress}%`, background: getGradient() }}>
                <div className="absolute inset-0 animate-[shimmer_2s_linear_infinite] bg-white/20"></div>
                {progress > 80 && <div className="absolute right-0 top-0 h-full w-4 bg-white/60 blur-[4px] animate-pulse"></div>}
            </div>
            {isEndowed && !isUnlocked && <div className="absolute top-0 bottom-0 w-0.5 bg-white/30 z-10" style={{ left: `${(ENDOWED_PROGRESS / target) * 100}%` }}></div>}
        </div>
    );
};

const GrandUnlockOverlay = ({ onClose }: { onClose: () => void }) => {
    const { t } = useLanguage();
    
    useEffect(() => {
        triggerStrongHaptic();
        const audio = new Audio("https://cdn.pixabay.com/audio/2022/03/09/audio_a7e2335f60.mp3"); 
        audio.volume = 0.5;
        audio.play().catch(() => {});
    }, []);

    return (
        <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black/95 backdrop-blur-2xl animate-in fade-in duration-1000">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent animate-pulse-slow pointer-events-none"></div>
            <div className="relative z-50 flex flex-col items-center">
                <div className="relative size-64 mb-8 pointer-events-none">
                    <div className="absolute inset-0 border-2 border-white/10 rounded-full animate-[spin_10s_linear_infinite]"></div>
                    <div className="absolute inset-4 border border-primary/30 rounded-full animate-[spin_15s_linear_infinite_reverse]"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="material-symbols-outlined text-8xl text-primary animate-[bounce_3s_infinite] drop-shadow-[0_0_30px_rgba(244,192,37,0.8)]">auto_awesome</span>
                    </div>
                    {Array.from({length: 8}).map((_, i) => (
                        <div key={i} className="absolute size-2 bg-white rounded-full top-1/2 left-1/2" style={{ animation: `float 2s ease-in-out infinite ${i * 0.2}s`, transform: `rotate(${i * 45}deg) translateX(100px)` }}></div>
                    ))}
                </div>
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-primary to-white animate-shimmer mb-4 text-center px-6">{t('unlock.congrats')}</h1>
                <p className="text-white/70 text-center max-w-xs mb-10 leading-relaxed font-light">{t('unlock.message')}</p>
                <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="px-8 py-4 bg-gradient-to-r from-primary to-[#b4860b] text-[#1a0b2e] font-bold rounded-full shadow-[0_0_30px_rgba(244,192,37,0.4)] hover:scale-105 transition-transform cursor-pointer relative z-50">{t('unlock.continue')}</button>
            </div>
        </div>
    );
};

const DailyBonusModal = ({ onClose }: { onClose: () => void }) => {
    const { t } = useLanguage();
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative w-full max-w-sm bg-[#1a0b2e] border border-primary/30 rounded-2xl p-8 flex flex-col items-center text-center shadow-[0_0_50px_rgba(244,192,37,0.2)] animate-[float_4s_ease-in-out_infinite]">
                <div className="absolute -top-12"><div className="relative size-24"><div className="absolute inset-0 bg-primary/40 blur-xl rounded-full animate-pulse"></div><div className="relative size-24 bg-gradient-to-br from-primary to-[#b4860b] rounded-full border-4 border-[#1a0b2e] flex items-center justify-center shadow-lg"><span className="material-symbols-outlined text-4xl text-[#1a0b2e]" style={{fontVariationSettings: "'FILL' 1"}}>calendar_month</span></div></div></div>
                <h2 className="text-2xl font-bold text-white mt-8 mb-2">{t('bonus.title')}</h2>
                <p className="text-[#bab29c] text-sm mb-6">{t('bonus.desc')}</p>
                <div className="flex items-center gap-2 text-4xl font-bold text-primary mb-8 drop-shadow-[0_0_10px_rgba(244,192,37,0.5)]"><span>+{DAILY_LOGIN_BONUS}</span><span className="material-symbols-outlined text-3xl" style={{fontVariationSettings: "'FILL' 1"}}>monetization_on</span></div>
                <button onClick={onClose} className="w-full py-3.5 bg-gradient-to-r from-primary to-[#eab308] text-[#1a0b2e] font-bold rounded-xl hover:brightness-110 active:scale-95 transition-all shadow-lg">{t('bonus.btn')}</button>
            </div>
        </div>
    );
};

const InsufficientFundsModal = ({ onClose, onGoStore }: { onClose: () => void, onGoStore: () => void }) => {
    const { t } = useLanguage();
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative w-full max-w-sm bg-[#1a0b2e] border border-red-500/30 rounded-2xl p-6 flex flex-col items-center text-center shadow-[0_0_50px_rgba(239,68,68,0.2)] animate-pulse-slow">
                <div className="size-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4"><span className="material-symbols-outlined text-3xl text-red-400">sentiment_dissatisfied</span></div>
                <h2 className="text-xl font-bold text-white mb-2">{t('funds.title')}</h2>
                <p className="text-[#bab29c] text-sm mb-6 whitespace-pre-line">{t('funds.desc')}</p>
                <div className="flex gap-3 w-full"><button onClick={onClose} className="flex-1 py-3 bg-white/5 text-white/70 font-bold rounded-xl hover:bg-white/10 transition-all">{t('funds.later')}</button><button onClick={onGoStore} className="flex-1 py-3 bg-gradient-to-r from-primary to-[#eab308] text-[#1a0b2e] font-bold rounded-xl hover:brightness-110 shadow-lg">{t('funds.recharge')}</button></div>
            </div>
        </div>
    );
};

const ConfirmModal = ({ message, onConfirm, onCancel }: { message: string, onConfirm: () => void, onCancel: () => void }) => (
    <div className="fixed inset-0 z-[200] flex items-center justify-center px-4 animate-in fade-in duration-200">
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onCancel}></div>
        <div className="relative w-full max-w-xs bg-[#1a0b2e] border border-white/20 rounded-2xl p-6 flex flex-col items-center text-center shadow-2xl">
            <div className="size-12 rounded-full bg-white/10 flex items-center justify-center mb-4"><span className="material-symbols-outlined text-2xl text-white">priority_high</span></div>
            <h3 className="text-lg font-bold text-white mb-2">Confirm</h3>
            <p className="text-white/70 text-sm mb-6">{message}</p>
            <div className="flex gap-3 w-full"><button onClick={onCancel} className="flex-1 py-2.5 bg-white/5 text-white/70 font-bold rounded-xl hover:bg-white/10 transition-all">Cancel</button><button onClick={onConfirm} className="flex-1 py-2.5 bg-red-500/20 text-red-400 border border-red-500/30 font-bold rounded-xl hover:bg-red-500/30 transition-all">Confirm</button></div>
        </div>
    </div>
);

const ContactModal = ({ email, onClose }: { email: string, onClose: () => void }) => {
    const { t, lang } = useLanguage();
    const handleCopy = () => { navigator.clipboard.writeText(email); showToast(lang === 'zh' ? '已复制邮箱地址' : 'Email copied', 'content_copy'); triggerHaptic(); onClose(); };
    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-4 animate-in fade-in duration-200">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative w-full max-w-xs bg-[#1a0b2e] border border-white/20 rounded-2xl p-6 flex flex-col items-center text-center shadow-2xl">
                <div className="size-12 rounded-full bg-green-500/10 flex items-center justify-center mb-4"><span className="material-symbols-outlined text-2xl text-green-400">mail</span></div>
                <h3 className="text-lg font-bold text-white mb-2">{t('profile.contact')}</h3>
                <p className="text-white/70 text-sm mb-6 select-all font-mono bg-white/5 p-2 rounded-lg break-all">{email}</p>
                <div className="flex gap-3 w-full"><button onClick={onClose} className="flex-1 py-2.5 bg-white/5 text-white/70 font-bold rounded-xl hover:bg-white/10 transition-all">{lang === 'zh' ? '关闭' : 'Close'}</button><button onClick={handleCopy} className="flex-1 py-2.5 bg-green-500/20 text-green-400 border border-green-500/30 font-bold rounded-xl hover:bg-green-500/30 transition-all">{lang === 'zh' ? '复制' : 'Copy'}</button></div>
            </div>
        </div>
    );
};

const TermsModal = ({ onClose }: { onClose: () => void }) => {
    const { t } = useLanguage();
    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-4 animate-in fade-in duration-200">
             <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
             <div className="relative w-full max-w-sm bg-[#1a0b2e] border border-white/20 rounded-2xl p-6 flex flex-col shadow-2xl max-h-[80vh]">
                <h3 className="text-xl font-bold text-white mb-4 text-center">{t('terms.title')}</h3>
                <div className="overflow-y-auto pr-2 mb-6 text-white/70 text-sm leading-relaxed whitespace-pre-line">{t('terms.content')}</div>
                <button onClick={onClose} className="w-full py-3 bg-gradient-to-r from-primary to-[#eab308] text-[#1a0b2e] font-bold rounded-xl">OK</button>
             </div>
        </div>
    );
};

const ImageZoomModal = ({ image, onClose }: { image: string, onClose: () => void }) => (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-[shimmer_0.3s_ease-out]" onClick={onClose}>
        <div className="absolute inset-0 bg-black/90 backdrop-blur-xl"></div>
        <div className="relative z-10 w-full max-w-md animate-[float_6s_ease-in-out_infinite]">
            <img src={image} alt="Card Zoom" className="w-full rounded-2xl shadow-[0_0_50px_rgba(244,192,37,0.3)] border border-primary/30" onClick={(e) => e.stopPropagation()} />
            <p className="text-center text-white/50 text-sm mt-6 tracking-widest"><span className="material-symbols-outlined align-middle mr-1 text-sm">touch_app</span>Tap to close</p>
        </div>
        <button className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors"><span className="material-symbols-outlined text-4xl">close</span></button>
    </div>
);

const TypewriterText = ({ text, onComplete }: { text: string, onComplete: () => void }) => {
    const safeText = text || '';
    const [displayedText, setDisplayedText] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);
    const speed = 20; 

    const finish = () => { setDisplayedText(safeText); setCurrentIndex(safeText.length); onComplete(); };

    useEffect(() => {
        if (currentIndex < safeText.length) {
            const timeout = setTimeout(() => {
                if (safeText[currentIndex] === '<') {
                    const closingIndex = safeText.indexOf('>', currentIndex);
                    if (closingIndex !== -1) {
                        setDisplayedText(prev => prev + safeText.substring(currentIndex, closingIndex + 1));
                        setCurrentIndex(closingIndex + 1);
                        return;
                    }
                }
                setDisplayedText(prev => prev + safeText[currentIndex]);
                setCurrentIndex(prev => prev + 1);
            }, speed);
            return () => clearTimeout(timeout);
        } else {
            onComplete();
        }
    }, [currentIndex, safeText, speed, onComplete]);

    return (<div onClick={finish} className="cursor-pointer"><div dangerouslySetInnerHTML={{ __html: displayedText.replace(/\n/g, '<br/>') }} />{currentIndex < safeText.length && <span className="inline-block w-2 h-4 bg-primary ml-1 animate-pulse align-middle"></span>}</div>);
};

// --- Starmail Login Modal (Fixed Interaction) ---
const LoginModal = ({ isOpen, onClose, onLogin }: { isOpen: boolean; onClose: () => void; onLogin: (email: string) => void }) => {
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  // Stop propagation to prevent backdrop close
  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleSendCode = (e: React.MouseEvent) => {
    e.preventDefault(); 
    if (email.length < 3) return; // Simple validation
    
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('code');
    }, 1000);
  };

  const handleVerify = (e: React.MouseEvent) => {
    e.preventDefault();
    if (code.length === 0) return; 
    
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLogin(email);
      onClose();
    }, 1000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-4 font-sans">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          
          {/* Modal Content */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            onClick={handleModalClick} // Stop propagation
            className="relative w-full max-w-md bg-[#1a0b2e] border border-white/10 rounded-2xl p-8 overflow-hidden shadow-[0_0_50px_rgba(124,58,237,0.3)] z-50"
          >
            {/* Visuals */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-transparent pointer-events-none"></div>
            <div className="absolute -top-20 -left-20 w-40 h-40 bg-purple-600/30 rounded-full blur-[60px]"></div>
            
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(244,192,37,0.2)]">
                <Sparkles className="text-[#f4c025] w-8 h-8 animate-pulse" />
              </div>

              <h2 className="text-2xl font-bold text-white mb-2 tracking-wide font-display">
                {step === 'email' ? 'Link Your Soul' : 'Cosmic Verification'}
              </h2>
              
              <p className="text-white/40 text-xs mb-8 tracking-wider uppercase">
                Universal Access Protocol
              </p>

              {step === 'email' ? (
                <div className="w-full space-y-6 animate-in slide-in-from-right-8 fade-in duration-300">
                  <div className="text-left">
                    <label className="text-[#f4c025] text-xs font-bold tracking-widest uppercase mb-2 block pl-1">
                      Starmail Address
                    </label>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-[#f4c025] transition-colors">
                        <Mail size={18} />
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="cosmos@example.com"
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-[#f4c025]/50 focus:bg-white/10 transition-all font-sans"
                        autoFocus
                      />
                    </div>
                    <p className="text-white/40 text-[10px] mt-3 leading-relaxed text-center font-light px-2">
                      请输入你的星际投递地址 (Email)，接收宇宙的指引。
                    </p>
                  </div>

                  <button
                    type="button" 
                    onClick={handleSendCode}
                    disabled={email.length < 3 || loading}
                    className="w-full py-4 bg-gradient-to-r from-[#f4c025] to-[#ca8a04] text-[#1a0b2e] font-bold rounded-xl shadow-lg hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {loading ? <Loader2 className="animate-spin" /> : <>Send Starlight Code <ArrowRight size={18} /></>}
                  </button>
                </div>
              ) : (
                <div className="w-full space-y-6 animate-in slide-in-from-right-8 fade-in duration-300">
                  <div className="text-left">
                    <label className="text-[#f4c025] text-xs font-bold tracking-widest uppercase mb-2 block pl-1">
                      Verification Code
                    </label>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-[#f4c025] transition-colors">
                        <Lock size={18} />
                      </div>
                      <input
                        type="text" 
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="000000"
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-[#f4c025]/50 focus:bg-white/10 transition-all font-sans tracking-[0.5em] text-center font-bold text-lg"
                        autoFocus
                        maxLength={6}
                      />
                    </div>
                  </div>

                  <button
                    type="button" 
                    onClick={handleVerify}
                    disabled={loading} 
                    className="w-full py-4 bg-gradient-to-r from-[#f4c025] to-[#ca8a04] text-[#1a0b2e] font-bold rounded-xl shadow-lg hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {loading ? <Loader2 className="animate-spin" /> : <>Connect to Source <Star size={18} fill="currentColor" /></>}
                  </button>
                  
                  <button type="button" onClick={() => setStep('email')} className="text-xs text-white/30 hover:text-white transition-colors w-full text-center py-2">
                    Use different starmail
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// --- Pages ---

const HomePage = () => {
    const navigate = useNavigate();
    const { t, lang, setLang } = useLanguage();
    const [balance, setBalance] = useState(getUserBalance());
    const [showDailyBonus, setShowDailyBonus] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);

    useEffect(() => {
        const handleStorageChange = () => setBalance(getUserBalance());
        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('balance_updated', handleStorageChange);

        const checkDailyLogin = () => {
            const lastLoginDate = localStorage.getItem('last_login_date');
            const today = new Date().toDateString();

            if (lastLoginDate !== today) {
                const currentBalance = getUserBalance();
                const isFreshUser = localStorage.getItem('user_balance') === null;
                
                // Endowed Progress Initialization check
                // If user has no record of total recharge, give them the endowment
                const totalRecharge = localStorage.getItem('user_total_recharge');
                if(!totalRecharge) {
                    localStorage.setItem('user_total_recharge', ENDOWED_PROGRESS.toString());
                }

                if (!isFreshUser) {
                    setUserBalance(currentBalance + DAILY_LOGIN_BONUS);
                    setShowDailyBonus(true);
                } else {
                    setUserBalance(INITIAL_BALANCE);
                }
                localStorage.setItem('last_login_date', today);
            }
        };

        checkDailyLogin();
        
        const preloadImages = () => {
            const images = [CARD_BACK_IMAGE, ...MOCK_CARDS.map(c => c.image)];
            images.forEach(src => {
                const img = new Image();
                img.src = src;
            });
        };
        setTimeout(preloadImages, 1000);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('balance_updated', handleStorageChange);
        };
    }, []);

    const toggleLang = () => {
        triggerHaptic();
        setLang(lang === 'zh' ? 'en' : 'zh');
    };

    const handleNavigate = (path: string, state?: any) => {
        triggerHaptic();
        navigate(path, state);
    }

    // Interaction Guard Logic
    const handleSpreadClick = (spreadId: string) => {
        triggerHaptic();
        const auth = getAuth();
        // STRICT AUTH GUARD: Must be logged in to proceed to question/payment
        if (!auth) {
            setShowLoginModal(true);
            return;
        }
        navigate('/guide', { state: { spreadId: spreadId } });
    };

    // Helper to handle login from Modal
    const handleLoginSuccess = (email: string) => {
        setAuth(email, 'email');
        showToast(t('toast.login_success'), 'check_circle');
    };

    return (
        <div className="bg-background-dark font-display text-white min-h-[100dvh] relative overflow-hidden">
            {showDailyBonus && <DailyBonusModal onClose={() => setShowDailyBonus(false)} />}
            <LoginModal 
                isOpen={showLoginModal} 
                onClose={() => setShowLoginModal(false)} 
                onLogin={handleLoginSuccess}
            />
            
            <div className="fixed inset-0 z-0 pointer-events-none nebula-bg"></div>
            <div className="relative flex h-full min-h-[100dvh] w-full flex-col pb-24 z-10">
                <div className="pt-16 px-6 pb-8">
                    <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-2xl animate-pulse">auto_awesome</span>
                            <h1 className="text-3xl font-bold text-white tracking-tight shadow-sm">{t('app.title')}</h1>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={toggleLang} className="flex items-center justify-center size-8 rounded-full bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white transition-all">
                                <span className="text-xs font-bold">{lang === 'zh' ? 'En' : '中'}</span>
                            </button>
                            <div onClick={() => handleNavigate('/store')} className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 backdrop-blur-md border border-primary/30 shadow-[0_0_12px_rgba(244,192,37,0.15)] hover:bg-white/10 transition-colors">
                                <span className="material-symbols-outlined text-primary text-[18px]" style={{fontVariationSettings: "'FILL' 1"}}>monetization_on</span>
                                <span className="text-xs font-medium text-white/90 tracking-wide">{t('app.balance')}: <span className="text-primary font-bold ml-0.5">{balance}</span></span>
                            </div>
                        </div>
                    </div>
                    <div className="pl-4 border-l-2 border-primary/40">
                        <p className="text-[#bab29c] text-sm italic leading-relaxed">
                            {t('app.quote')}
                        </p>
                    </div>
                </div>
                <div className="flex-1 px-6 flex flex-col">
                    <h2 className="text-white text-lg font-bold mb-5 flex items-center gap-2">
                        <span className="w-1 h-5 rounded-full bg-primary inline-block shadow-[0_0_10px_rgba(244,192,37,0.6)]"></span>
                        {t('app.select_spread')}
                    </h2>
                    <div className="flex flex-col gap-4">
                        {Object.values(SPREADS).map((spread: SpreadConfig) => (
                            <button 
                                key={spread.id}
                                onClick={() => handleSpreadClick(spread.id)} 
                                className="glass-panel w-full p-0 rounded-2xl text-left group hover:border-primary/40 transition-all duration-300"
                            >
                                <div className="relative overflow-hidden rounded-2xl p-5 flex items-center gap-5">
                                    <div className="size-16 rounded-xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center border border-white/10 shadow-inner shrink-0 group-hover:scale-105 transition-transform">
                                        <span className="material-symbols-outlined text-3xl text-primary drop-shadow-md">
                                            {spread.id === 'daily' ? 'crop_portrait' : spread.id === 'three_card' ? 'view_column' : 'pentagon'}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-xl font-bold text-white mb-1">{lang === 'zh' ? spread.name : spread.nameEn}</h3>
                                        <p className="text-[#bab29c] text-xs mb-2 truncate">{lang === 'zh' ? spread.description : spread.descriptionEn}</p>
                                        <span className="bg-primary/10 border border-primary/20 backdrop-blur-sm inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] text-primary/90 font-medium">
                                            <span className="material-symbols-outlined text-[10px]">
                                                monetization_on
                                            </span>
                                            {`${spread.cost} ${t('store.coins')}/One`}
                                        </span>
                                    </div>
                                    <div className="size-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors shrink-0">
                                        <span className="material-symbols-outlined text-white/50">chevron_right</span>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                    
                    <p className="text-[10px] text-white/30 text-center mt-8 pb-4">
                        {t('app.disclaimer')}
                    </p>
                </div>
                <BottomNav active="home" />
            </div>
        </div>
    );
};

const QuestionGuide = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useLanguage();
    const spreadId = location.state?.spreadId || 'daily';
    const spread = SPREADS[spreadId];
    const [question, setQuestion] = useState("");
    const [showNoFundsModal, setShowNoFundsModal] = useState(false);

    const handleStart = () => {
        triggerHaptic();
        if (!spread) return;
        
        const currentBalance = getUserBalance();
        let actualCost = spread.cost;
        
        if (currentBalance < actualCost) {
            setShowNoFundsModal(true);
            return;
        }

        navigate('/payment', { state: { spreadId, question } });
    };

    return (
        <div className="relative flex h-full min-h-[100dvh] w-full flex-col bg-background-dark overflow-x-hidden">
            {showNoFundsModal && (
                <InsufficientFundsModal 
                    onClose={() => setShowNoFundsModal(false)}
                    onGoStore={() => navigate('/store', { state: { returnTo: location.pathname, returnState: { spreadId, question } } })}
                />
            )}
            
            <div className="fixed inset-0 z-0 pointer-events-none bg-gradient-to-b from-[#2e1065] via-[#1e1b4b] to-[#0f172a] opacity-90"></div>
            <div className="relative z-10 flex flex-col h-full min-h-[100dvh]">
                <BackHeader title={t('guide.title')} rightIcon="help" onBack={() => navigate('/')} />
                <div className="flex-1 flex flex-col px-6 py-4 pb-32">
                    <div className="text-center mb-6 mt-4">
                        <h1 className="text-2xl font-light text-white/90 mb-2">{t('guide.subtitle')}</h1>
                        <p className="text-sm text-indigo-200/60 font-light">{t('guide.text')}</p>
                    </div>
                    <div className="w-full mb-8 relative group">
                        <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-indigo-500/20 opacity-0 group-hover:opacity-100 transition duration-500 blur"></div>
                        <div className="relative">
                            <textarea 
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                                className="glass-panel w-full resize-none rounded-2xl text-white bg-transparent focus:outline-0 focus:ring-1 focus:ring-primary/50 border-white/10 min-h-[220px] placeholder:text-white/30 p-6 text-lg font-normal leading-relaxed shadow-lg animate-breathing-glow transition-all duration-300" 
                                placeholder={t('guide.placeholder')}
                            ></textarea>
                            <span className="material-symbols-outlined absolute bottom-4 right-4 text-white/10 pointer-events-none select-none text-3xl">auto_awesome</span>
                        </div>
                    </div>
                </div>
                <div className="fixed bottom-0 w-full z-50">
                    <div className="absolute bottom-[90px] left-0 right-0 px-6 flex justify-center pointer-events-none">
                        <button 
                            onClick={handleStart}
                            className="pointer-events-auto shadow-[0_0_30px_rgba(244,192,37,0.4)] flex w-full max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-14 bg-gradient-to-r from-[#f4c025] to-[#eab308] text-[#1a1625] text-lg font-bold tracking-wide hover:brightness-110 active:scale-[0.98] transition-all duration-200"
                        >
                            <span className="mr-2 material-symbols-outlined font-bold">playing_cards</span>
                            <span>{t('guide.start')} ({spread?.cost} {t('store.coins')})</span>
                        </button>
                    </div>
                    <BottomNav active="home" />
                </div>
            </div>
        </div>
    );
};

const PaymentScreen = () => {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const location = useLocation();
    const { spreadId, question } = location.state || { spreadId: 'daily', question: '' };
    const spread = SPREADS[spreadId];
    
    const deductionPerformedRef = useRef(false);

    useEffect(() => {
        if (!deductionPerformedRef.current) {
            const currentBalance = getUserBalance();
            if (currentBalance >= spread.cost) {
                setUserBalance(currentBalance - spread.cost);
                deductionPerformedRef.current = true;
            } else {
                 navigate('/store');
                 return;
            }
        }
        const timer = setTimeout(() => {
            navigate('/shuffle', { state: { spreadId, question }, replace: true });
        }, 2400);

        return () => clearTimeout(timer);
    }, [navigate, spreadId, question, spread.cost]);

    return (
        <div className="relative flex h-screen w-full flex-col bg-background-dark overflow-hidden">
            <button 
                onClick={() => navigate(-1)}
                className="absolute top-12 left-6 z-50 flex items-center justify-center size-10 rounded-full bg-black/20 text-white/70 hover:bg-black/40 hover:text-white transition-all backdrop-blur-md border border-white/5"
            >
                <span className="material-symbols-outlined" style={{fontSize: "20px"}}>close</span>
            </button>

            <div className="absolute inset-0 z-0">
               <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-mystic-purple/80 via-background-dark to-deep-space"></div>
               <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-[100px]"></div>
            </div>
            <div className="relative z-10 flex flex-col h-full w-full justify-center items-center">
                <div className="relative size-64 flex items-center justify-center mb-8">
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-[60px] animate-pulse-slow"></div>
                    <div className="relative size-32 animate-float">
                        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary via-[#D4A010] to-[#8E6A05] shadow-[0_0_30px_rgba(244,192,37,0.4)] opacity-80 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                            <span className="material-symbols-outlined text-background-dark/80 drop-shadow-sm" style={{fontSize: "64px"}}>monetization_on</span>
                        </div>
                        <div className="absolute top-0 right-0 w-2 h-2 bg-primary rounded-full animate-ping"></div>
                        <div className="absolute bottom-2 left-2 w-1.5 h-1.5 bg-white rounded-full animate-ping delay-100"></div>
                    </div>
                </div>
                <div className="flex flex-col items-center animate-shimmer">
                    <h1 className="text-primary tracking-tight text-[40px] font-bold leading-none px-4 text-center drop-shadow-[0_0_15px_rgba(244,192,37,0.5)]">
                        -{spread?.cost} <span className="text-3xl font-body">{t('store.coins')}</span>
                    </h1>
                </div>
                <div className="mt-8 px-8 py-3 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                    <p className="text-white/80 text-sm font-medium tracking-wider text-center flex items-center gap-2 font-body">
                        <span className="material-symbols-outlined animate-spin" style={{fontSize: "16px"}}>auto_awesome</span>
                        {t('payment.gathering')}
                    </p>
                </div>
            </div>
        </div>
    );
};

const ShuffleScreen = () => {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const location = useLocation();
    const { spreadId, question } = location.state || { spreadId: 'daily', question: '' };

    return (
        <div className="relative flex h-screen w-full flex-col overflow-hidden nebula-bg">
            <BackHeader title={t('shuffle.title')} onBack={() => navigate('/guide', { state: { spreadId, question } })} />
            <div className="flex-1 flex flex-col items-center justify-center relative w-full overflow-hidden">
                <div className="relative w-full h-[400px] flex justify-center items-center">
                    <div className="absolute w-44 h-72 rounded-xl bg-[#1a1625] border border-primary/20 rotate-[-15deg] translate-y-4 -translate-x-4 opacity-40 blur-[1px] animate-pulse"></div>
                    <div className="absolute w-44 h-72 rounded-xl bg-[#1a1625] border border-primary/20 rotate-[12deg] translate-y-2 translate-x-3 opacity-60 blur-[0.5px] animate-pulse delay-75"></div>
                    <div className="absolute w-44 h-72 rounded-xl bg-[#1a1625] border-[1.5px] border-primary/60 shadow-[0_0_30px_rgba(244,192,37,0.2)] z-10 flex flex-col items-center justify-center overflow-hidden animate-float">
                        <div className="absolute inset-0 opacity-40 bg-cover bg-center mix-blend-soft-light" style={{backgroundImage: `url(${CARD_BACK_IMAGE})`}}></div>
                        <div className="absolute inset-3 border border-primary/20 rounded-lg flex flex-col items-center justify-center">
                            <span className="material-symbols-outlined text-primary/40 text-5xl animate-spin" style={{animationDuration: '3s'}}>auto_awesome</span>
                        </div>
                    </div>
                </div>
                <div className="mt-8 mb-8">
                    <p className="text-white/70 text-xs font-light tracking-[0.2em] text-center flex items-center justify-center gap-2">
                        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></span>
                        {t('shuffle.text')}
                        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></span>
                    </p>
                </div>
            </div>
            <div className="relative z-40 w-full flex flex-col items-center pb-32 px-4">
                <button 
                    onClick={() => { triggerHaptic(); navigate('/draw', { state: { spreadId, question } }); }}
                    className="relative group"
                >
                    <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full scale-110 opacity-50 group-active:opacity-100 transition-opacity"></div>
                    <div className="relative size-20 rounded-full glass-panel border-[1.5px] border-primary flex flex-col items-center justify-center gap-0.5 shadow-[0_0_20px_rgba(244,192,37,0.3)] hover:scale-105 active:scale-95 transition-all">
                        <span className="material-symbols-outlined text-primary text-3xl animate-[spin_4s_linear_infinite]">sync</span>
                        <span className="text-primary text-[11px] font-bold tracking-widest mt-0.5">{t('shuffle.stop')}</span>
                    </div>
                </button>
            </div>
            <BottomNav active="home" />
        </div>
    );
};

const DrawScreen = () => {
    const navigate = useNavigate();
    const { t, lang } = useLanguage();
    const location = useLocation();
    const { spreadId, question } = location.state || { spreadId: 'daily', question: '' };
    const spread = SPREADS[spreadId];
    
    const [drawnCards, setDrawnCards] = useState<Card[]>([]);
    
    const drawCard = () => {
        triggerHaptic();
        
        // UNLOCK LOGIC: Switch pool based on threshold
        const totalRecharge = getUserTotalRecharge();
        const isMinorUnlocked = totalRecharge >= UNLOCK_THRESHOLD;
        
        // Filter cards based on unlock status
        // Major Arcana have purely numeric IDs '0'...'21', Minor have 'w_ace', 'w_10' etc.
        const availablePool = MOCK_CARDS.filter(c => {
            if (isMinorUnlocked) return true; // All cards
            return !isNaN(Number(c.id)); // Only numeric IDs (Major Arcana)
        });

        // Filter out already drawn
        const remaining = availablePool.filter(c => !drawnCards.find(dc => dc.id === c.id));
        
        if (remaining.length === 0) return { ...MOCK_CARDS[0], isUpright: true }; // Fallback

        const random = remaining[Math.floor(Math.random() * remaining.length)];
        const isUpright = Math.random() > 0.2; 
        return { ...random, isUpright };
    };

    const handleDeckClick = () => {
        if (drawnCards.length < spread.cardCount) {
            const newCard = drawCard();
            const newDrawn = [...drawnCards, newCard];
            setDrawnCards(newDrawn);
            
            if (newDrawn.length === spread.cardCount) {
                setTimeout(() => {
                    navigate('/reading', { state: { spreadId, question, cards: newDrawn }, replace: true });
                }, 1000);
            }
        }
    };

    const spreadPositions = lang === 'zh' ? spread.positions : spread.positionsEn;
    const spreadName = lang === 'zh' ? spread.name : spread.nameEn;

    const renderSlots = () => {
        if (spreadId === 'daily') {
             return (
                <div className="flex flex-col items-center justify-center w-full h-full">
                     <div className={`relative w-[200px] aspect-[2/3] rounded-xl border-2 border-dashed ${drawnCards[0] ? 'border-primary border-solid' : 'border-primary/30'} bg-white/5 flex flex-col items-center justify-center backdrop-blur-sm shadow-[0_0_30px_rgba(244,192,37,0.1)] transition-all duration-500`}>
                        {drawnCards[0] ? (
                            <div className="w-full h-full rounded-xl bg-cover bg-center animate-flip" style={{backgroundImage: `url(${CARD_BACK_IMAGE})`}}></div>
                        ) : (
                            <span className="material-symbols-outlined text-primary/40 animate-pulse text-5xl">shutter_speed</span>
                        )}
                     </div>
                     <p className="mt-4 text-primary font-bold text-sm tracking-widest uppercase">{t('draw.daily_label')}</p>
                </div>
             );
        }

        if (spreadId === 'three_card') {
            return (
                <div className="flex gap-4 items-center justify-center w-full px-2">
                    {spreadPositions.map((pos, idx) => (
                        <div key={idx} className="flex flex-col items-center gap-2 w-1/3">
                            <div className={`relative w-full aspect-[2/3] rounded-lg border border-dashed ${drawnCards[idx] ? 'border-primary border-solid shadow-[0_0_15px_rgba(244,192,37,0.3)]' : 'border-white/20 bg-white/5'} flex items-center justify-center transition-all duration-300`}>
                                 {drawnCards[idx] ? (
                                    <div className="w-full h-full rounded-lg bg-cover bg-center" style={{backgroundImage: `url(${CARD_BACK_IMAGE})`}}></div>
                                 ) : (
                                     <span className="text-white/20 font-bold">{idx + 1}</span>
                                 )}
                            </div>
                            <p className={`text-[10px] font-bold tracking-widest uppercase ${drawnCards[idx] ? 'text-primary' : 'text-white/40'}`}>{pos}</p>
                        </div>
                    ))}
                </div>
            )
        }
        
        if (spreadId === 'hexagram') {
             const positionsStyle = [
                 { top: '15%', left: '50%' }, // 1. Top (Up-Tri tip)
                 { top: '75%', left: '85%' }, // 2. Bottom Right (Up-Tri corner)
                 { top: '75%', left: '15%' }, // 3. Bottom Left (Up-Tri corner)
                 { top: '85%', left: '50%' }, // 4. Bottom (Down-Tri tip)
                 { top: '25%', left: '15%' }, // 5. Top Left (Down-Tri corner)
                 { top: '25%', left: '85%' }, // 6. Top Right (Down-Tri corner)
                 { top: '50%', left: '50%' }, // 7. Center
             ];
             
             return (
                 <div className="relative w-full h-[360px] max-w-[340px] mx-auto">
                     <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30 z-0" viewBox="0 0 100 100" preserveAspectRatio="none">
                         <polygon points="50,15 85,75 15,75" fill="none" stroke="#f4c025" strokeWidth="0.5" />
                         <polygon points="50,85 15,25 85,25" fill="none" stroke="#f4c025" strokeWidth="0.5" />
                     </svg>
                     
                     {spreadPositions.map((pos, idx) => {
                         const style = positionsStyle[idx];
                         const isCenter = idx === 6;
                         const transform = 'translate(-50%, -50%)';
                         return (
                             <div 
                                key={idx} 
                                className={`absolute w-[45px] h-[70px] ${isCenter ? 'w-[55px] h-[85px] z-10' : 'z-1'}`}
                                style={{ ...style, transform }}
                             >
                                 <div className={`w-full h-full rounded border ${drawnCards[idx] ? 'border-primary shadow-[0_0_10px_rgba(244,192,37,0.5)]' : 'border-white/20 bg-white/5 border-dashed'} flex items-center justify-center transition-all duration-300`}>
                                     {drawnCards[idx] ? (
                                         <div className="w-full h-full rounded bg-cover bg-center" style={{backgroundImage: `url(${CARD_BACK_IMAGE})`}}></div>
                                     ) : (
                                         <span className="text-[10px] text-white/30">{idx+1}</span>
                                     )}
                                 </div>
                             </div>
                         )
                     })}
                 </div>
             )
        }
    };

    const deckCards = 22; 
    
    return (
        <div className="relative flex h-screen w-full flex-col bg-background-dark overflow-hidden">
            <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#3a206e] via-[#110b1f] to-[#05030a]"></div>
            <BackHeader title={spreadName} />
            
            <main className="flex-1 flex flex-col items-center justify-center w-full px-4 pb-20 relative z-10">
                {renderSlots()}
                <div className="mt-8 text-center">
                    <h3 className="text-white/90 text-sm font-bold tracking-wide leading-relaxed drop-shadow-md animate-pulse">
                        {drawnCards.length < spread.cardCount ? t('draw.draw_next').replace('{n}', (drawnCards.length + 1).toString()) : t('draw.complete')}
                    </h3>
                </div>
            </main>

            <div className="fixed bottom-0 left-0 right-0 h-48 z-40 flex justify-center items-end pb-8 overflow-visible pointer-events-none">
                <div className="relative h-20 w-full max-w-sm mx-auto flex justify-center items-end">
                    {Array.from({ length: deckCards }).map((_, i) => {
                        const offset = i - (deckCards - 1) / 2;
                        const rotate = offset * 2.5;
                        const translateY = Math.abs(offset) * 2;
                        const xOffset = offset * 14; 

                        return (
                            <div 
                                key={i}
                                onClick={handleDeckClick}
                                className="absolute bottom-0 w-20 h-32 rounded-lg shadow-2xl border border-[#f4c025]/30 bg-[#1e152f] cursor-pointer origin-bottom transition-all duration-300 hover:-translate-y-6 hover:scale-110 hover:z-50 group pointer-events-auto"
                                style={{
                                    transform: `translateX(${xOffset}px) translateY(${translateY}px) rotate(${rotate}deg)`,
                                    zIndex: i,
                                }}
                            >
                                <div className="absolute inset-0.5 rounded-lg border border-[#f4c025]/10 card-back-pattern opacity-80 group-hover:opacity-100 transition-opacity"></div>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-lg"></div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

const ReadingScreen = () => {
    const navigate = useNavigate();
    const { t, lang } = useLanguage();
    const location = useLocation();
    
    const state = location.state as { 
        spreadId: SpreadType, 
        question: string, 
        cards: Card[],
        id?: string,
        interpretation?: string,
        reading?: Reading 
    } | null;

    const { spreadId, question, cards, id, interpretation: passedInterpretation, reading: passedReading } = state || {
        spreadId: 'daily',
        question: '',
        cards: [],
        id: undefined,
        interpretation: undefined,
        reading: undefined
    };

    const spread = SPREADS[spreadId as string];
    
    const [interpretation, setInterpretation] = useState<string>(passedInterpretation || (passedReading ? passedReading.interpretation : ''));
    const [loading, setLoading] = useState(!passedInterpretation && !passedReading);
    const [isTyping, setIsTyping] = useState(!passedInterpretation && !passedReading); 
    const [isSaved, setIsSaved] = useState(!!id || !!passedReading);
    const [currentReadingId, setCurrentReadingId] = useState<string | undefined>(id || (passedReading ? passedReading.id : undefined));
    const [zoomedImage, setZoomedImage] = useState<string | null>(null);
    const [showConfirm, setShowConfirm] = useState<{message: string, action: () => void} | null>(null);

    const spreadPositions = lang === 'zh' ? spread?.positions : spread?.positionsEn;
    const spreadName = lang === 'zh' ? spread?.name : spread?.nameEn;

    useEffect(() => {
        if (!state) {
            navigate('/', { replace: true });
        }
    }, [state, navigate]);

    useEffect(() => {
        if (state && !passedInterpretation && !passedReading && cards && cards.length > 0 && spread) {
            const fetchInterpretation = async () => {
                const sName = lang === 'zh' ? spread.name : spread.nameEn;
                const sPos = lang === 'zh' ? spread.positions : spread.positionsEn;
                const text = await getTarotInterpretation(sName, question, cards, sPos, lang);
                setInterpretation(text);
                setLoading(false);
            };
            fetchInterpretation();
        }
    }, [state, cards, passedInterpretation, passedReading, question, spread, lang]); 

    if (!state) return null;
    
    const displayCards = cards || (passedReading ? passedReading.cards : []);
    const displaySpreadId = spreadId || (passedReading ? passedReading.spreadType : 'daily');
    
    const handleSaveToggle = () => {
        if (loading) return;
        triggerHaptic();

        if (isSaved && currentReadingId) {
            setShowConfirm({
                message: t('reading.delete_confirm'),
                action: () => {
                    deleteReading(currentReadingId);
                    setIsSaved(false);
                    setCurrentReadingId(undefined);
                    showToast(t('reading.removed'), 'delete');
                    setShowConfirm(null);
                }
            });
        } else {
            const newId = Date.now().toString();
            const newReading: Reading = {
                id: newId,
                date: new Date().toISOString(),
                spreadType: displaySpreadId,
                spreadName: spreadName || (passedReading ? passedReading.spreadName : ''),
                question: question || (lang === 'zh' ? "无问题的指引" : "General Guidance"),
                cards: displayCards,
                interpretation: interpretation
            };
            saveReading(newReading);
            setIsSaved(true);
            setCurrentReadingId(newId);
            showToast(t('reading.saved_toast'), 'book');
        }
    };

    const handleShare = async () => {
        triggerHaptic();
        const shareText = `${t('reading.share_title')}\n\n` +
            `${t('reading.share_spread')}：${spreadName || (passedReading ? passedReading.spreadName : '')}\n` +
            `${t('reading.share_question')}：${question || (passedReading ? passedReading.question : '')}\n\n` +
            displayCards.map((c, i) => `${i+1}. ${lang === 'zh' ? c.name : c.nameEn} (${c.isUpright ? t('reading.upright') : t('reading.reversed')})`).join('\n') +
            `\n\n${t('reading.share_guidance')}：\n${interpretation.replace(/<[^>]*>/g, '').substring(0, 100)}...\n\n` +
            `From Universal Tarot AI`;

        try {
            if (navigator.share) {
                await navigator.share({
                    title: t('reading.share_title'),
                    text: shareText,
                });
            } else {
                await navigator.clipboard.writeText(shareText);
                showToast(t('reading.copy_success'), 'content_copy');
            }
        } catch (err) {
             await navigator.clipboard.writeText(shareText);
             showToast(t('reading.copy_success'), 'content_copy');
        }
    };
    
    const renderCardDisplay = () => {
        if (displaySpreadId === 'daily') {
            return (
                <div className="w-full flex justify-center mb-6 mt-4 relative">
                    <div className="relative w-[180px] aspect-[2/3] rounded-xl shadow-[0_0_40px_rgba(244,192,37,0.3)] z-10 transform hover:scale-105 active:scale-95 transition-all duration-300 cursor-zoom-in" onClick={() => setZoomedImage(displayCards[0].image)}>
                        <div 
                            className={`w-full h-full rounded-xl bg-cover bg-center border border-primary/30 relative overflow-hidden transition-transform duration-500 ${displayCards[0].isUpright ? '' : 'rotate-180'}`} 
                            style={{backgroundImage: `url(${displayCards[0].image})`}}
                        >
                             <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 to-transparent"></div>
                        </div>
                        <div className="absolute -bottom-6 w-full text-center px-2">
                            <span className="text-white font-display font-bold text-lg tracking-wider drop-shadow-md block">{lang === 'zh' ? displayCards[0].name : displayCards[0].nameEn}</span>
                            <span className={`text-xs uppercase tracking-widest font-bold ${displayCards[0].isUpright ? 'text-primary' : 'text-red-400'}`}>{displayCards[0].isUpright ? t('reading.upright') : t('reading.reversed')}</span>
                        </div>
                    </div>
                </div>
            );
        }
        
        if (displaySpreadId === 'three_card') {
             return (
                 <div className="w-full px-4 pt-4 pb-2 shrink-0 flex justify-center">
                     <div className="flex justify-between items-start gap-3 max-w-[340px] w-full">
                         {displayCards.map((card, idx) => (
                             <div key={idx} className="flex flex-col items-center gap-2 w-1/3 group">
                                 <div 
                                    className="relative w-full aspect-[2/3] rounded-lg border border-white/10 shadow-lg cursor-zoom-in active:scale-95 transition-transform"
                                    onClick={() => setZoomedImage(card.image)}
                                 >
                                     <div className={`w-full h-full bg-cover bg-center rounded-lg ${card.isUpright ? '' : 'rotate-180'}`} style={{backgroundImage: `url(${card.image})`}}></div>
                                     <div className="absolute -bottom-2 -right-2 bg-black/80 rounded-full w-5 h-5 flex items-center justify-center text-[10px] text-primary border border-primary/30">{idx+1}</div>
                                 </div>
                                 <div className="text-center">
                                     <p className="text-[10px] text-white/50">{spreadPositions ? spreadPositions[idx] : idx+1}</p>
                                     <p className={`text-xs font-bold ${card.isUpright ? 'text-primary' : 'text-red-400'}`}>{lang === 'zh' ? card.name : card.nameEn} {card.isUpright ? '' : '(R)'}</p>
                                 </div>
                             </div>
                         ))}
                     </div>
                 </div>
             )
        }

        if (displaySpreadId === 'hexagram') {
             return (
                 <div className="relative w-full h-[200px] mb-4">
                     <div className="absolute inset-0 flex items-center justify-center">
                         <div className="grid grid-cols-3 gap-2 scale-75">
                            {displayCards.slice(0,3).map((c,i) => (
                                <div key={i} onClick={() => setZoomedImage(c.image)} className={`w-12 h-20 bg-cover bg-center rounded border border-white/20 cursor-zoom-in active:scale-90 transition-transform ${c.isUpright ? '' : 'rotate-180'}`} style={{backgroundImage: `url(${c.image})`}}></div>
                            ))}
                            <div className="col-span-3 flex justify-center">
                                <div onClick={() => setZoomedImage(displayCards[6].image)} className={`w-14 h-24 bg-cover bg-center rounded border border-primary shadow-[0_0_15px_rgba(244,192,37,0.5)] cursor-zoom-in active:scale-90 transition-transform ${displayCards[6].isUpright ? '' : 'rotate-180'}`} style={{backgroundImage: `url(${displayCards[6].image})`}}></div>
                            </div>
                            {displayCards.slice(3,6).map((c,i) => (
                                <div key={i+3} onClick={() => setZoomedImage(c.image)} className={`w-12 h-20 bg-cover bg-center rounded border border-white/20 cursor-zoom-in active:scale-90 transition-transform ${c.isUpright ? '' : 'rotate-180'}`} style={{backgroundImage: `url(${c.image})`}}></div>
                            ))}
                         </div>
                     </div>
                     <p className="absolute bottom-0 w-full text-center text-xs text-white/40 italic">点击卡牌查看大图</p>
                 </div>
             )
        }
    };

    return (
        <div className="bg-background-dark text-white font-sans h-screen flex flex-col overflow-hidden">
             {zoomedImage && <ImageZoomModal image={zoomedImage} onClose={() => setZoomedImage(null)} />}
             {showConfirm && (
                <ConfirmModal 
                    message={showConfirm.message} 
                    onConfirm={showConfirm.action} 
                    onCancel={() => setShowConfirm(null)} 
                />
             )}
             
             <div className="fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/40 via-background-dark to-black pointer-events-none"></div>
             <BackHeader 
                title={t('reading.title')} 
                rightIcon="home" 
                onRightClick={() => navigate('/', { replace: true })}
            />
             
             <main className="flex-1 w-full px-4 py-2 overflow-hidden flex flex-col min-h-0 relative z-10">
                 {renderCardDisplay()}
                 
                 <div className="glass-panel rounded-2xl p-6 h-full overflow-y-auto hide-scrollbar flex flex-col gap-4 shadow-inner relative border-t border-white/10">
                     {loading ? (
                         <div className="flex flex-col items-center justify-center py-10 gap-4">
                             <div className="size-10 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                             <p className="text-sm text-primary/80 animate-pulse">{t('reading.loading')}</p>
                         </div>
                     ) : (
                        <>
                            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/5 justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary text-xl">auto_awesome</span>
                                    <h2 className="text-lg font-bold text-white">{t('reading.ai_analysis')}</h2>
                                </div>
                                {isTyping && (
                                    <span className="text-[10px] text-white/30 animate-pulse">{t('reading.skip_typing')}</span>
                                )}
                            </div>
                            <div className="prose prose-invert prose-sm max-w-none text-gray-200 leading-relaxed font-light text-justify">
                                {passedInterpretation || passedReading ? (
                                     <div dangerouslySetInnerHTML={{ __html: interpretation.replace(/\n/g, '<br/>') }} />
                                ) : (
                                    <TypewriterText text={interpretation} onComplete={() => setIsTyping(false)} />
                                )}
                            </div>
                            <div className="h-12"></div>
                        </>
                     )}
                 </div>
             </main>
             
             <div className="w-full px-6 py-4 flex gap-4 shrink-0 glass-panel border-t border-white/10 z-20">
                <button 
                    onClick={handleSaveToggle} 
                    disabled={loading || isTyping}
                    className={`flex-1 py-3 px-4 rounded-xl border transition-all flex items-center justify-center gap-2 ${isSaved ? 'bg-red-500/10 text-red-400 border-red-500/30' : 'bg-white/5 hover:bg-white/10 text-white/90 border-white/10'} disabled:opacity-50`}
                >
                    <span className="material-symbols-outlined" style={{fontSize: "20px"}}>{isSaved ? 'delete' : 'bookmark'}</span>
                    <span className="text-sm font-medium">{isSaved ? t('reading.saved') : t('reading.save')}</span>
                </button>
                <button 
                    onClick={handleShare}
                    disabled={loading || isTyping}
                    className="flex-1 py-3 px-4 rounded-xl bg-primary text-background-dark hover:bg-[#ffcf3d] transition-all flex items-center justify-center gap-2 font-bold shadow-[0_0_20px_rgba(244,192,37,0.3)] disabled:opacity-50"
                >
                    <span className="material-symbols-outlined" style={{fontSize: "20px"}}>share</span>
                    <span className="text-sm">{t('reading.share')}</span>
                </button>
            </div>
        </div>
    );
};

const JournalScreen = () => {
    const { t } = useLanguage();
    const [readings, setReadings] = useState<Reading[]>([]);
    const [showConfirm, setShowConfirm] = useState<{message: string, action: () => void} | null>(null);

    useEffect(() => {
        setReadings(getReadings());
        const handleUpdate = () => setReadings(getReadings());
        window.addEventListener('readings_updated', handleUpdate);
        return () => window.removeEventListener('readings_updated', handleUpdate);
    }, []);

    const navigate = useNavigate();

    const handleOpenReading = (reading: Reading) => {
        triggerHaptic();
        navigate('/reading', { 
            state: { 
                spreadId: reading.spreadType, 
                question: reading.question, 
                cards: reading.cards,
                id: reading.id, 
                interpretation: reading.interpretation,
                reading: reading 
            } 
        });
    };
    
    const handleDeleteItem = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        triggerHaptic();
        setShowConfirm({
            message: t('journal.delete_confirm'),
            action: () => {
                deleteReading(id);
                showToast(t('journal.deleted'), 'delete');
                setShowConfirm(null);
            }
        });
    };

    return (
        <div className="bg-background-dark min-h-[100dvh] relative pb-24">
            {showConfirm && <ConfirmModal message={showConfirm.message} onConfirm={showConfirm.action} onCancel={() => setShowConfirm(null)} />}
            <BackHeader title={t('journal.title')} />
            <div className="p-4 flex flex-col gap-4">
                 {readings.length === 0 ? (
                     <div className="flex flex-col items-center justify-center py-20 opacity-50">
                         <span className="material-symbols-outlined text-6xl mb-4">auto_stories</span>
                         <p>{t('journal.empty')}</p>
                     </div>
                 ) : (
                    readings.map((reading) => (
                        <div key={reading.id} onClick={() => handleOpenReading(reading)} className="glass-panel p-4 rounded-xl flex gap-4 cursor-pointer hover:bg-white/5 transition-colors group relative">
                            <div className="w-16 h-24 bg-cover bg-center rounded border border-white/10 shrink-0" style={{backgroundImage: `url(${reading.cards[0].image})`}}></div>
                            <div className="flex-1 min-w-0 pr-12">
                                <div className="flex justify-between items-baseline mb-1">
                                    <h3 className="text-white font-bold truncate pr-2">{reading.spreadName}</h3>
                                    <span className="text-primary text-[10px] shrink-0">{new Date(reading.date).toLocaleDateString()}</span>
                                </div>
                                <p className="text-white/80 text-xs italic mb-2 truncate">"{reading.question}"</p>
                                <p className="text-white/50 text-xs line-clamp-2">{reading.interpretation.replace(/<[^>]*>?/gm, '')}</p>
                            </div>
                            <button onClick={(e) => handleDeleteItem(e, reading.id)} className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full text-white/20 hover:text-red-400 hover:bg-white/10 transition-colors z-20"><span className="material-symbols-outlined text-[24px]">delete</span></button>
                        </div>
                    ))
                 )}
            </div>
            <BottomNav active="journal" />
        </div>
    );
};

const SettingsScreen = () => {
    const { t } = useLanguage();
    const [settings, setSettings] = useState(getSettings());
    const toggleSetting = (key: string) => {
        triggerHaptic();
        const newSettings = { ...settings, [key]: !settings[key] };
        setSettings(newSettings);
        saveSettings(newSettings);
        if (key === 'haptic' && newSettings[key] && navigator.vibrate) navigator.vibrate(50);
    };
    return (
        <div className="bg-background-dark min-h-[100dvh] relative pb-24 font-display">
            <BackHeader title={t('settings.title')} />
            <div className="p-4 flex flex-col gap-4 mt-2">
                {[{ key: 'music', label: t('settings.music'), icon: 'music_note' }, { key: 'haptic', label: t('settings.haptic'), icon: 'vibration' }, { key: 'notification', label: t('settings.notification'), icon: 'notifications' }].map(item => (
                    <div key={item.key} className="glass-panel p-4 rounded-xl flex justify-between items-center"><div className="flex items-center gap-3"><span className="material-symbols-outlined text-white/60">{item.icon}</span><span className="text-white font-medium">{item.label}</span></div><div onClick={() => toggleSetting(item.key)} className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors duration-300 ${settings[item.key] ? 'bg-primary' : 'bg-white/20'}`}><div className={`absolute top-1 bottom-1 w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-sm ${settings[item.key] ? 'left-7' : 'left-1'}`}></div></div></div>
                ))}
                <div className="mt-4 px-2"><p className="text-xs text-white/30 text-center">Version 1.0.0 (Beta)</p></div>
            </div>
        </div>
    );
};

const LoginScreen = () => {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const [loginMethod, setLoginMethod] = useState<'phone' | 'email'>('phone');
    const [identifier, setIdentifier] = useState(''); 
    const [code, setCode] = useState('');
    const [timer, setTimer] = useState(0);
    const [agreed, setAgreed] = useState(false);
    const [showTerms, setShowTerms] = useState(false);

    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (timer > 0) interval = setInterval(() => setTimer(t => t - 1), 1000);
        return () => clearInterval(interval);
    }, [timer]);

    const handleSendCode = () => { setTimer(60); showToast(t('toast.code_sent'), 'sms'); };
    const handleLogin = () => { triggerHaptic(); if (!agreed) { showToast('Please agree to terms', 'assignment_late'); return; } if (!code) { showToast(t('toast.code_err'), 'lock'); return; } setAuth(identifier, loginMethod); showToast(t('toast.login_success'), 'check_circle'); setTimeout(() => navigate('/profile', { replace: true }), 1000); };

    return (
        <div className="relative flex h-screen w-full flex-col bg-background-dark overflow-hidden font-display">
            {showTerms && <TermsModal onClose={() => setShowTerms(false)} />}
            <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-[#3a206e] via-[#1a0b2e] to-black"></div>
            <button onClick={() => navigate(-1)} className="absolute top-12 left-6 z-50 flex size-10 items-center justify-center rounded-full bg-white/5 text-white/70 hover:bg-white/10 transition-all border border-white/5"><span className="material-symbols-outlined" style={{fontSize: "20px"}}>arrow_back</span></button>
            <div className="relative z-10 flex flex-col justify-center h-full px-8 pb-20">
                <div className="mb-8"><h1 className="text-4xl font-bold text-white mb-2">{t('login.title')}</h1><p className="text-white/50 text-sm">{t('login.subtitle')}</p></div>
                <div className="flex p-1 bg-white/5 rounded-xl border border-white/10 mb-6 relative"><div className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-primary rounded-lg transition-all duration-300 shadow-lg ${loginMethod === 'phone' ? 'left-1' : 'left-[calc(50%+3px)]'}`}></div><button onClick={() => { setLoginMethod('phone'); setIdentifier(''); }} className={`flex-1 py-2 text-sm font-bold z-10 transition-colors ${loginMethod === 'phone' ? 'text-background-dark' : 'text-white/60'}`}>{t('login.method_phone')}</button><button onClick={() => { setLoginMethod('email'); setIdentifier(''); }} className={`flex-1 py-2 text-sm font-bold z-10 transition-colors ${loginMethod === 'email' ? 'text-background-dark' : 'text-white/60'}`}>{t('login.method_email')}</button></div>
                <div className="flex flex-col gap-6"><div className="space-y-4"><div className="glass-panel rounded-xl px-4 py-3 flex items-center gap-3 border border-white/10 focus-within:border-primary/50 transition-colors"><span className="material-symbols-outlined text-white/40">{loginMethod === 'phone' ? 'smartphone' : 'mail'}</span><input type={loginMethod === 'phone' ? 'tel' : 'email'} placeholder={loginMethod === 'phone' ? t('login.phone') : t('login.email')} value={identifier} onChange={e => setIdentifier(e.target.value)} className="bg-transparent border-none outline-none text-white w-full placeholder:text-white/20 focus:ring-0 p-0" /></div><div className="glass-panel rounded-xl px-4 py-3 flex items-center gap-3 border border-white/10 focus-within:border-primary/50 transition-colors"><span className="material-symbols-outlined text-white/40">lock</span><input type="number" placeholder={t('login.code')} value={code} onChange={e => setCode(e.target.value)} className="bg-transparent border-none outline-none text-white w-full placeholder:text-white/20 focus:ring-0 p-0" /><button onClick={handleSendCode} disabled={timer > 0} className="shrink-0 text-primary text-sm font-bold disabled:text-white/30">{timer > 0 ? `${timer}s` : t('login.get_code')}</button></div></div><div className="flex items-start gap-3 px-1"><div onClick={() => setAgreed(!agreed)} className={`mt-0.5 size-4 rounded border flex items-center justify-center transition-colors cursor-pointer ${agreed ? 'bg-primary border-primary' : 'border-white/30 bg-transparent'}`}>{agreed && <span className="material-symbols-outlined text-black text-[12px] font-bold">check</span>}</div><p className="text-xs text-white/50 leading-relaxed select-none">{t('login.agree_prefix')} <span onClick={() => setShowTerms(true)} className="text-primary hover:underline cursor-pointer">{t('login.terms')}</span> & <span onClick={() => setShowTerms(true)} className="text-primary hover:underline cursor-pointer">{t('login.privacy')}</span>{t('login.agree_suffix')}</p></div><button onClick={handleLogin} className="w-full h-14 bg-gradient-to-r from-primary to-[#eab308] rounded-xl text-[#1a0b2e] text-lg font-bold tracking-wide shadow-[0_0_20px_rgba(244,192,37,0.3)] hover:brightness-110 active:scale-[0.98] transition-all">{t('login.btn')}</button></div></div>
        </div>
    );
};

const ProfileScreen = () => {
    const navigate = useNavigate();
    const { t, lang, setLang } = useLanguage();
    const [auth, setAuthData] = useState<AuthData | null>(getAuth());
    const [balance, setBalance] = useState(getUserBalance());
    const [showContact, setShowContact] = useState(false);
    const [termsOpen, setTermsOpen] = useState(false);
    const [settings, setSettings] = useState(getSettings());

    useEffect(() => {
        const handleAuthUpdate = () => setAuthData(getAuth());
        const handleBalanceUpdate = () => setBalance(getUserBalance());
        window.addEventListener('auth_updated', handleAuthUpdate);
        window.addEventListener('balance_updated', handleBalanceUpdate);
        return () => { window.removeEventListener('auth_updated', handleAuthUpdate); window.removeEventListener('balance_updated', handleBalanceUpdate); };
    }, []);

    const toggleSetting = (key: string) => { const newSettings = { ...settings, [key]: !settings[key] }; setSettings(newSettings); saveSettings(newSettings); triggerHaptic(); };
    const handleLogout = () => { if(window.confirm(t('profile.logout_confirm'))) { clearAuth(); showToast(t('toast.logout'), 'logout'); } };
    const handleDeleteAccount = () => { if(window.confirm(t('profile.delete_confirm'))) { clearAuth(); localStorage.clear(); window.location.reload(); } };
    const getMaskedIdentifier = () => { if (!auth) return ''; if (auth.type === 'email') { const [name, domain] = auth.identifier.split('@'); return `${name.substring(0, 1)}***@${domain}`; } return auth.identifier.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2'); };

    return (
        <div className="bg-background-dark min-h-[100dvh] relative pb-24 font-display">
            {showContact && <ContactModal email="dove00001@icloud.com" onClose={() => setShowContact(false)} />}
            {termsOpen && <TermsModal onClose={() => setTermsOpen(false)} />}
            <BackHeader title={t('profile.title')} />
            <div className="flex flex-col items-center pt-8 px-6">
                <div className="relative mb-6"><div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse"></div><div className="relative size-24 rounded-full bg-[#1a0b2e] border-2 border-primary/30 flex items-center justify-center overflow-hidden shadow-2xl">{auth ? <span className="text-3xl font-bold text-white bg-primary/20 size-full flex items-center justify-center">{auth.identifier.substring(0, 1).toUpperCase()}</span> : <span className="material-symbols-outlined text-4xl text-white/20">person</span>}</div></div>
                {auth ? (
                    <div className="text-center w-full mb-8"><div className="flex items-center justify-center gap-2 mb-1"><span className="material-symbols-outlined text-white/60 text-lg">{auth.type === 'email' ? 'mail' : 'smartphone'}</span><h2 className="text-2xl font-bold text-white">{getMaskedIdentifier()}</h2></div><p className="text-white/40 text-xs uppercase tracking-widest mb-6">ID: {auth.id.substring(0,8)}</p><div className="glass-panel p-5 rounded-xl flex items-center justify-between mx-auto max-w-xs border-primary/20 bg-gradient-to-r from-white/5 to-transparent"><div className="flex flex-col items-start"><span className="text-xs text-[#bab29c]">{t('store.current')}</span><span className="text-2xl font-bold text-primary">{balance}</span></div><button onClick={() => navigate('/store')} className="px-4 py-1.5 bg-primary/10 text-primary text-xs font-bold rounded-full border border-primary/30">{t('profile.recharge')}</button></div></div>
                ) : (
                    <div className="text-center w-full mb-8"><h2 className="text-xl font-bold text-white mb-2">Guest</h2><button onClick={() => navigate('/login')} className="mt-4 px-8 py-3 bg-white text-[#1a0b2e] font-bold rounded-full shadow-lg hover:scale-105 transition-transform">{t('profile.login')}</button></div>
                )}
                <div className="w-full flex flex-col gap-3">
                    <button onClick={() => navigate('/journal')} className="glass-panel p-4 rounded-xl flex justify-between items-center hover:bg-white/5 group transition-all"><div className="flex items-center gap-3"><div className="size-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400"><span className="material-symbols-outlined text-lg">auto_stories</span></div><span className="text-white text-sm">{t('profile.journal')}</span></div><span className="material-symbols-outlined text-white/20 group-hover:text-white/60 text-lg">chevron_right</span></button>
                    <div className="glass-panel rounded-xl p-0 overflow-hidden mb-2">
                        <div className="p-4 border-b border-white/5 flex items-center justify-between"><div className="flex items-center gap-3"><div className="size-8 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400"><span className="material-symbols-outlined text-lg">translate</span></div><span className="text-white font-medium text-sm">Language</span></div><button onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')} className="text-primary font-bold text-xs border border-primary/30 rounded px-2 py-1">{lang === 'zh' ? '中文' : 'English'}</button></div>
                        <div className="p-4 border-b border-white/5 flex items-center justify-between"><div className="flex items-center gap-3"><div className="size-8 rounded-full bg-white/10 flex items-center justify-center"><span className="material-symbols-outlined text-white/70 text-lg">music_note</span></div><span className="text-white font-medium text-sm">{t('settings.music')}</span></div><div onClick={() => toggleSetting('music')} className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${settings.music ? 'bg-primary' : 'bg-white/20'}`}><div className={`absolute top-0.5 size-4 rounded-full bg-white transition-all ${settings.music ? 'left-5.5' : 'left-0.5'}`}></div></div></div>
                        <div className="p-4 flex items-center justify-between"><div className="flex items-center gap-3"><div className="size-8 rounded-full bg-white/10 flex items-center justify-center"><span className="material-symbols-outlined text-white/70 text-lg">vibration</span></div><span className="text-white font-medium text-sm">{t('settings.haptic')}</span></div><div onClick={() => toggleSetting('haptic')} className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${settings.haptic ? 'bg-primary' : 'bg-white/20'}`}><div className={`absolute top-0.5 size-4 rounded-full bg-white transition-all ${settings.haptic ? 'left-5.5' : 'left-0.5'}`}></div></div></div>
                    </div>
                    <button onClick={() => setShowContact(true)} className="glass-panel p-4 rounded-xl flex justify-between items-center hover:bg-white/5 group transition-all"><div className="flex items-center gap-3"><div className="size-8 rounded-full bg-green-500/10 flex items-center justify-center text-green-400"><span className="material-symbols-outlined text-lg">support_agent</span></div><span className="text-white text-sm">{t('profile.contact')}</span></div><span className="material-symbols-outlined text-white/20 group-hover:text-white/60 text-lg">chevron_right</span></button>
                    <button onClick={() => setTermsOpen(true)} className="glass-panel p-4 rounded-xl flex justify-between items-center hover:bg-white/5 group transition-all"><div className="flex items-center gap-3"><div className="size-8 rounded-full bg-white/10 flex items-center justify-center text-white/70"><span className="material-symbols-outlined text-lg">description</span></div><span className="text-white/80 text-sm">{t('login.terms')} & {t('login.privacy')}</span></div><span className="material-symbols-outlined text-white/30">chevron_right</span></button>
                    {auth && (<><button onClick={handleLogout} className="glass-panel p-4 rounded-xl flex justify-between items-center hover:bg-white/5 group transition-all mt-4"><span className="text-white/80 text-sm pl-2">{t('profile.logout')}</span><span className="material-symbols-outlined text-white/20 text-lg">logout</span></button><button onClick={handleDeleteAccount} className="p-4 rounded-xl flex justify-center items-center hover:bg-red-500/10 transition-all mt-1"><span className="text-red-500/60 text-xs">{t('profile.delete')}</span></button></>)}
                </div>
            </div>
            <BottomNav active="profile" />
        </div>
    );
};

const StoreScreen = () => {
     const navigate = useNavigate();
     const { t, lang } = useLanguage();
     const [balance, setBalance] = useState(getUserBalance());
     const [totalRecharge, setTotalRecharge] = useState(getUserTotalRecharge());
     const [showUnlockAnimation, setShowUnlockAnimation] = useState(false);

     useEffect(() => {
        const handleUpdate = () => {
            setBalance(getUserBalance());
            setTotalRecharge(getUserTotalRecharge());
        };
        window.addEventListener('balance_updated', handleUpdate);
        return () => window.removeEventListener('balance_updated', handleUpdate);
     }, []);

     const handlePurchase = (item: any) => {
         const currentBal = getUserBalance();
         setUserBalance(currentBal + item.coins + item.bonus);
         
         // Behavioral Economics: Trigger Grand Unlock if crossing threshold
         const currentTotal = getUserTotalRecharge();
         const rechargeValue = item.coins + item.bonus; 
         
         const newTotal = currentTotal + rechargeValue;
         
         if (currentTotal < UNLOCK_THRESHOLD && newTotal >= UNLOCK_THRESHOLD) {
             setShowUnlockAnimation(true);
         }

         addToTotalRecharge(rechargeValue);
         
         showToast(t('store.success'), 'check_circle');
         triggerHaptic();
     };

     const isUnlocked = totalRecharge >= UNLOCK_THRESHOLD;
     const isEndowed = totalRecharge >= ENDOWED_PROGRESS && totalRecharge < UNLOCK_THRESHOLD && !localStorage.getItem('endowed_consumed');
     
     const unlockTarget = UNLOCK_THRESHOLD;
     const currentProgressDisplay = totalRecharge.toFixed(0);

     return (
        <div className="bg-background-dark min-h-screen pb-24 relative overflow-hidden">
            {showUnlockAnimation && <GrandUnlockOverlay onClose={() => setShowUnlockAnimation(false)} />}

            <div className="pt-12 px-6 pb-4">
                 <h1 className="text-2xl font-bold text-white mb-6">{t('store.title')}</h1>
                 
                 {/* Balance Card */}
                 <div className="w-full bg-gradient-to-r from-[#f4c025] to-[#b4860b] rounded-2xl p-6 mb-4 shadow-lg relative overflow-hidden">
                      <div className="absolute right-[-20px] top-[-20px] opacity-20">
                          <span className="material-symbols-outlined text-[120px]">monetization_on</span>
                      </div>
                      <p className="text-[#1a0b2e]/70 font-bold text-sm mb-1">{t('store.current')}</p>
                      <h2 className="text-[#1a0b2e] text-4xl font-bold">{balance}</h2>
                 </div>

                 {/* BEHAVIORAL: Goal Gradient Progress Card */}
                 <div className={`w-full rounded-2xl p-6 mb-8 relative overflow-hidden border transition-all duration-500 ${isUnlocked ? 'bg-gradient-to-br from-[#2e1065] to-[#0f0518] border-primary/50 shadow-[0_0_20px_rgba(244,192,37,0.2)]' : 'glass-panel border-white/10'}`}>
                      <div className="flex justify-between items-start mb-4 relative z-10">
                          <div>
                              <h3 className={`font-bold text-lg ${isUnlocked ? 'text-primary' : 'text-white'}`}>{t('store.unlock_title')}</h3>
                              <p className="text-xs text-white/50">{t('store.unlock_desc')}</p>
                          </div>
                          <div className={`size-10 rounded-full flex items-center justify-center transition-colors duration-500 ${isUnlocked ? 'bg-primary text-[#1a0b2e]' : 'bg-white/10 text-white/30'}`}>
                              <span className="material-symbols-outlined">{isUnlocked ? 'lock_open' : 'lock'}</span>
                          </div>
                      </div>
                      
                      {isUnlocked ? (
                          <div className="relative z-10 animate-fade-in">
                              <p className="text-primary font-bold text-sm flex items-center gap-2">
                                  <span className="material-symbols-outlined text-sm">verified</span>
                                  {t('store.unlocked')}
                              </p>
                          </div>
                      ) : (
                          <div className="relative z-10">
                              <div className="flex justify-between text-xs text-white/70 mb-2">
                                  <span>{t('store.locked_status').replace('{current}', `${currentProgressDisplay}`).replace('{target}', `${unlockTarget}`)}</span>
                              </div>
                              
                              {/* The Nebula Progress Bar */}
                              <NebulaProgress current={totalRecharge} target={UNLOCK_THRESHOLD} isEndowed={true} />
                              
                              {/* Endowed Progress Feedback */}
                              {isEndowed && (
                                  <p className="text-[10px] text-primary/80 mt-2 flex items-center gap-1 animate-pulse">
                                      <span className="material-symbols-outlined text-[12px]">auto_awesome</span>
                                      {t('store.endowed')}
                                  </p>
                              )}
                          </div>
                      )}
                      
                      {/* Decorative Background */}
                      <div className="absolute -bottom-4 -right-4 opacity-10 rotate-12">
                          <span className="material-symbols-outlined text-8xl">style</span>
                      </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                     {STORE_ITEMS.map((item) => (
                         <button 
                            key={item.id}
                            onClick={() => handlePurchase(item)}
                            className="glass-panel p-4 rounded-xl flex flex-col items-center relative group overflow-hidden border border-white/10 hover:border-primary/50 transition-all"
                         >
                            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            
                            <span 
                                className="material-symbols-outlined text-4xl text-primary mb-2 drop-shadow-[0_0_10px_rgba(244,192,37,0.5)] group-hover:scale-110 transition-transform duration-300" 
                                style={{fontVariationSettings: "'FILL' 1"}}
                            >
                                monetization_on
                            </span>

                            <div className="text-white font-bold text-lg">{item.coins} <span className="text-xs font-normal">{t('store.coins')}</span></div>
                            {item.bonus > 0 && <div className="text-green-400 text-xs font-bold mb-2">+{item.bonus} {t('store.gift')}</div>}
                            
                            {/* Price Display */}
                            <div className="mt-auto px-4 py-1.5 bg-white/10 rounded-full text-white font-bold text-sm group-hover:bg-primary group-hover:text-background-dark transition-colors">
                                {lang === 'zh' ? `¥${item.priceCn}` : `$${item.price}`}
                            </div>
                         </button>
                     ))}
                 </div>
            </div>
            <BottomNav active="store" />
        </div>
     );
};

const App = () => {
    const [lang, setLang] = useState<Language>('zh');
  
    const t = (key: string, params?: Record<string, any>) => {
        let text = translations[lang][key] || key;
        if (params) {
            Object.entries(params).forEach(([k, v]) => {
                text = text.replace(`{${k}}`, v);
            });
        }
        return text;
    };
  
    return (
      <LanguageContext.Provider value={{ lang, setLang, t }}>
        <Router>
          <ScrollToTop />
          <BackgroundMusic />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/guide" element={<QuestionGuide />} />
            <Route path="/payment" element={<PaymentScreen />} />
            <Route path="/shuffle" element={<ShuffleScreen />} />
            <Route path="/draw" element={<DrawScreen />} />
            <Route path="/reading" element={<ReadingScreen />} />
            <Route path="/journal" element={<JournalScreen />} />
            <Route path="/store" element={<StoreScreen />} />
            <Route path="/profile" element={<ProfileScreen />} />
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/settings" element={<SettingsScreen />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </LanguageContext.Provider>
    );
  };
  
export default App;