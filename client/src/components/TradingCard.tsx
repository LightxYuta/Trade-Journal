import type { ReactNode } from "react";

interface TradingCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  headerActions?: ReactNode;
}

export function TradingCard({ title, subtitle, children, className = "", headerActions }: TradingCardProps) {
  return (
    <div 
      className={`card-glow rounded-[22px] border border-[rgba(40,40,40,0.95)] p-3.5 relative overflow-hidden ${className}`}
      style={{
        background: "radial-gradient(circle at top left, #161616 0, #050505 45%, #020202 100%)",
        boxShadow: "0 18px 45px rgba(0, 0, 0, 0.9)",
      }}
    >
      <div className="relative z-10">
        <div className="flex justify-between items-center gap-2.5 mb-2 flex-wrap">
          <div>
            <div className="text-[0.9rem] font-semibold uppercase tracking-wider">{title}</div>
            {subtitle && <div className="text-[0.78rem] text-[#b8b8b8]">{subtitle}</div>}
          </div>
          {headerActions && <div className="flex items-center gap-2">{headerActions}</div>}
        </div>
        {children}
      </div>
    </div>
  );
}
