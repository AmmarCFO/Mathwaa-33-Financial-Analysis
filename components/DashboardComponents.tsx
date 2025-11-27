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
