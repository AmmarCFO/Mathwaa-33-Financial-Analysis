import React from 'react';

const Header: React.FC<{ onToggleLanguage: () => void }> = ({ onToggleLanguage }) => {
  return (
    <header className="sticky top-0 z-50 bg-[#F1ECE6]/80 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center">
             <span className="text-3xl font-bold text-[#4A2C5A] tracking-tight">Mathwaa</span>
          </div>
          <button 
            onClick={onToggleLanguage}
            className="px-4 py-2 text-sm font-semibold text-[#4A2C5A] bg-[#A99484]/30 rounded-md hover:bg-[#A99484]/50 transition-colors"
          >
            العربية
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;