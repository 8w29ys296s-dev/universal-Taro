import React from 'react';
import { useNavigate } from 'react-router-dom';

interface BottomNavProps {
  active: 'home' | 'journal' | 'store' | 'profile';
}

const BottomNav: React.FC<BottomNavProps> = ({ active }) => {
  const navigate = useNavigate();
  const items = [
    { id: 'home', icon: 'home', label: '首页', path: '/' },
    { id: 'journal', icon: 'auto_stories', label: '日志', path: '/journal' },
    { id: 'store', icon: 'storefront', label: '商店', path: '/store' },
    { id: 'profile', icon: 'person', label: '我的', path: '/profile' },
  ];

  return (
    <div className="fixed bottom-0 w-full z-50 glass-panel border-t border-white/5 pb-8 pt-3 px-6 rounded-t-3xl shadow-[0_-5px_20px_rgba(0,0,0,0.5)] bg-[#1a0b2e]/90 backdrop-blur-xl">
      <div className="flex justify-between items-end px-4">
        {items.map((item) => (
          <div 
            key={item.id}
            onClick={() => navigate(item.path)}
            className={`flex flex-1 flex-col items-center justify-end gap-1.5 cursor-pointer transition-all duration-300 ${active === item.id ? "" : "opacity-60 hover:opacity-100"}`}
          >
            <div className="relative flex items-center justify-center size-8">
              <span 
                className={`material-symbols-outlined text-2xl ${active === item.id ? "text-primary scale-110" : "text-white"}`} 
                style={{fontVariationSettings: active === item.id ? "'FILL' 1" : "'FILL' 0"}}
              >
                {item.icon}
              </span>
              {active === item.id && <div className="absolute -bottom-2 w-1 h-1 bg-primary rounded-full shadow-[0_0_8px_#f4c025]"></div>}
            </div>
            <p className={`${active === item.id ? "text-white font-bold" : "text-white/80 font-medium"} text-[10px] tracking-wider transition-all`}>{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BottomNav;
