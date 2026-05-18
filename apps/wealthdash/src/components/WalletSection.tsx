import React from 'react';

interface WalletSectionProps {
  title: string;
  icon: string;
  children: React.ReactNode;
}

const WalletSection = ({ title, icon, children }: WalletSectionProps) => {
  return (
    <section>
      <h3 className="font-headline-md text-headline-md text-on-surface mb-6 flex items-center gap-2">
        <span className="material-symbols-outlined text-secondary">{icon}</span>
        {title}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-card-gap">
        {children}
      </div>
    </section>
  );
};

export default WalletSection;
