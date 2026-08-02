import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: number;
}

export default function Logo({ className = '', showText = true, size = 40 }: LogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform duration-300 hover:scale-105"
      >
        <defs>
          <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0E2A6D" />
            <stop offset="100%" stopColor="#0A1E4F" />
          </linearGradient>
          <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F5D076" />
            <stop offset="50%" stopColor="#D9A441" />
            <stop offset="100%" stopColor="#B38025" />
          </linearGradient>
        </defs>
        
        {/* Shield Background with Navy & Gold Gradient */}
        <path
          d="M50 10 L84 27 V55 C84 72 50 86 50 86 C50 86 16 72 16 55 V27 L50 10 Z"
          fill="url(#shieldGrad)"
          stroke="url(#goldGrad)"
          strokeWidth="4"
          strokeLinejoin="round"
        />
        
        {/* Inner Dotted Border */}
        <path
          d="M50 16 L78 30 V52 C78 66 50 78 50 78 C50 78 22 66 22 52 V30 L50 16 Z"
          fill="none"
          stroke="#D9A441"
          strokeWidth="1.5"
          strokeDasharray="2 3"
        />
        
        {/* Open Book representing Education */}
        <path
          d="M32 44 C41 41 49 44 50 45 C51 44 59 41 68 44 V62 C59 59 51 62 50 63 C49 62 41 59 32 62 Z"
          fill="#FFFFFF"
          stroke="url(#goldGrad)"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <path
          d="M50 45 V63"
          stroke="#0E2A6D"
          strokeWidth="2"
        />
        
        {/* Star representing Excellence */}
        <polygon
          points="50,23 53,29 60,29 55,33 57,39 50,35 43,39 45,33 40,29 47,29"
          fill="url(#goldGrad)"
        />
      </svg>
      
      {showText && (
        <div className="flex flex-col">
          <span className="font-heading font-extrabold text-sm tracking-[0.02em] uppercase text-[#0E2A6D] dark:text-white leading-tight">
            Mount Zion
          </span>
          <span className="font-body text-[10px] font-medium text-slate-500 dark:text-slate-400 tracking-normal leading-tight">
            College of Engg & Tech
          </span>
        </div>
      )}
    </div>
  );
}
