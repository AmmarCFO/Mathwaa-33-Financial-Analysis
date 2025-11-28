
import React from 'react';

export const Section: React.FC<{
  title: string;
  children: React.ReactNode;
  className?: string;
  titleColor?: string;
}> = ({ title, children, className, titleColor = 'text-white' }) => (
  <section className={`py-16 sm:py-20 lg:py-24 my-16 ${className}`}>
    <div className="max-w-4xl mx-auto px-4">
        <h2 className={`text-center text-3xl sm:text-4xl font-bold ${titleColor} mb-12 sm:mb-16 tracking-wide`}>{title}</h2>
        {children}
    </div>
  </section>
);

export const Metric: React.FC<{
  value: string;
  label: string;
  valueColor?: string;
  labelColor?: string;
}> = ({ value, label, valueColor = 'text-white', labelColor = 'text-white/80' }) => (
  <div className="text-center">
    <p className={`text-5xl sm:text-6xl lg:text-7xl font-extrabold ${valueColor} tracking-tight`}>{value}</p>
    <p className={`text-base sm:text-lg ${labelColor} mt-4 max-w-md mx-auto`}>{label}</p>
  </div>
);

interface ShareBreakdownProps {
  title: string;
  totalValue: number | { min: number; max: number };
  mathwaaSharePercentage: number;
  mathwaaLabel: string;
  investorLabel: string;
  formatCurrency: (value: number) => string;
  className?: string;
  valueClassName?: string;
}

export const ShareBreakdown: React.FC<ShareBreakdownProps> = ({
  title,
  totalValue,
  mathwaaSharePercentage,
  mathwaaLabel,
  investorLabel,
  formatCurrency,
  className = 'text-white',
  valueClassName = 'text-2xl',
}) => {
  const investorSharePercentage = 1 - mathwaaSharePercentage;

  const calculateShare = (value: number) => ({
    mathwaa: value * mathwaaSharePercentage,
    investor: value * investorSharePercentage
  });

  let mathwaaDisplay: string;
  let investorDisplay: string;

  if (typeof totalValue === 'number') {
    const shares = calculateShare(totalValue);
    mathwaaDisplay = formatCurrency(shares.mathwaa);
    investorDisplay = formatCurrency(shares.investor);
  } else {
    const minShares = calculateShare(totalValue.min);
    const maxShares = calculateShare(totalValue.max);
    mathwaaDisplay = `${formatCurrency(minShares.mathwaa)} to ${formatCurrency(maxShares.mathwaa)}`;
    investorDisplay = `${formatCurrency(minShares.investor)} to ${formatCurrency(maxShares.investor)}`;
  }
  
  const toRangeString = (display: string) => {
    if (display.includes('to')) {
        const parts = display.split(' to ');
        return (
            <span className="flex flex-col sm:flex-row sm:items-baseline justify-center sm:gap-2">
                <span>{parts[0]}</span>
                <span className="text-sm sm:text-base opacity-70 mx-1 sm:mx-0">to</span>
                <span>{parts[1]}</span>
            </span>
        )
    }
    return display;
  }

  return (
    <div className={`mt-12 text-center ${className}`}>
      <h4 className="text-lg font-bold tracking-wide opacity-80 mb-6">{title}</h4>
      <div className="flex flex-col md:flex-row justify-center items-stretch gap-4 md:gap-8">
        <div className="bg-white/10 p-6 rounded-xl w-full flex-1">
          <p className="text-sm uppercase opacity-70 mb-2">{mathwaaLabel}</p>
          <p className={`${valueClassName} font-bold`}>{toRangeString(mathwaaDisplay)}</p>
        </div>
        <div className="bg-white/10 p-6 rounded-xl w-full flex-1">
          <p className="text-sm uppercase opacity-70 mb-2">{investorLabel}</p>
          <p className={`${valueClassName} font-bold`}>{toRangeString(investorDisplay)}</p>
        </div>
      </div>
    </div>
  );
};

export const OccupancyRadial: React.FC<{
  percentage: number;
  label: string;
  subLabel: string;
  color: string;
}> = ({ percentage, label, subLabel, color }) => {
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="bg-white/50 p-6 rounded-2xl shadow-lg flex flex-col items-center justify-center text-center h-full transition-transform hover:scale-105 duration-300">
      <h3 className="text-lg font-bold text-[#4A2C5A] mb-6">{label}</h3>
      <div className="relative w-40 h-40 flex items-center justify-center mb-6">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="8"
          />
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <span className="absolute text-4xl font-extrabold text-[#4A2C5A]">{percentage}%</span>
      </div>
      <p className="text-sm font-semibold text-[#4A2C5A]/80">{subLabel}</p>
    </div>
  );
};
