import React from 'react';
import { useNavigate } from 'react-router-dom';

interface BackHeaderProps {
  title: string;
  onBack?: () => void;
  rightIcon?: string;
  onRightClick?: () => void;
}

const BackHeader: React.FC<BackHeaderProps> = ({ title, onBack, rightIcon, onRightClick }) => {
  const navigate = useNavigate();
  return (
    <div className="relative z-50 flex items-center justify-between px-4 pt-12 pb-4 glass-panel border-b-0 border-white/5 bg-gradient-to-b from-black/40 to-transparent shrink-0">
      <button 
        onClick={onBack || (() => navigate(-1))} 
        className="flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-white/10 active:bg-white/20 transition-colors border border-white/5 backdrop-blur-md"
      >
        <span className="material-symbols-outlined text-white" style={{fontSize: "20px"}}>arrow_back</span>
      </button>
      <div className="flex flex-col items-center flex-1 px-4">
          <h2 className="text-white text-lg font-bold leading-tight tracking-wide text-center drop-shadow-md">
            {title}
          </h2>
          <div className="h-0.5 w-6 bg-primary/50 mt-1 rounded-full opacity-60"></div>
      </div>
      {rightIcon ? (
         <button 
         onClick={onRightClick} 
         className="flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-white/10 active:bg-white/20 transition-colors border border-white/5 backdrop-blur-md"
       >
         <span className="material-symbols-outlined text-white" style={{fontSize: "20px"}}>{rightIcon}</span>
       </button>
      ) : <div className="size-10"></div>}
    </div>
  );
};

export default BackHeader;
