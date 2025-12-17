import { LayoutDashboard, FileText, BarChart3, Settings, TrendingUp } from "lucide-react";

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "trades", label: "Trades", icon: FileText },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "advanced", label: "Advanced Analytics", icon: TrendingUp },
  { id: "settings", label: "Settings", icon: Settings },
];

export function Sidebar({ currentPage, onPageChange }: SidebarProps) {
  return (
    <aside className="w-[230px] flex-shrink-0 border-r border-[#252525] flex flex-col p-4 sticky top-0 max-h-screen"
      style={{
        background: "radial-gradient(circle at top, #141414 0, #050505 45%, #020202 100%)",
        boxShadow: "12px 0 40px rgba(0, 0, 0, 0.9)",
      }}
    >
      <div className="flex flex-col gap-1.5 px-1.5 pb-2">
        <div className="flex items-center gap-2">
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
            style={{
              background: "radial-gradient(circle at 30% 10%, #ff9ece, transparent 55%), radial-gradient(circle at 70% 80%, #4fc3f7, transparent 55%), radial-gradient(circle at 50% 50%, #121212, #000000)",
              boxShadow: "0 0 18px rgba(255, 158, 206, 0.45)",
            }}
            data-testid="logo-pill"
          >
            TJ
          </div>
          <span className="text-[0.95rem] font-semibold tracking-wider uppercase">
            Trading Journal
          </span>
        </div>
        <p className="text-[0.72rem] text-[#b8b8b8]">
          R-based performance dashboard for prop trading. Local only. No login.
        </p>
        <span 
          className="text-[0.63rem] uppercase tracking-widest px-1.5 py-0.5 rounded-full w-fit"
          style={{
            background: "rgba(79, 195, 247, 0.1)",
            color: "#4fc3f7",
            border: "1px solid rgba(79, 195, 247, 0.6)",
          }}
        >
          Multi-Page · v2
        </span>
      </div>

      <div className="mt-3.5 flex-1 flex flex-col gap-4">
        <div>
          <div className="text-[0.7rem] uppercase tracking-wider text-[#b8b8b8] opacity-80 mb-1.5 px-1.5">
            Main
          </div>
          <div className="flex flex-col gap-1.5">
            {navItems.map((item) => {
              const isActive = currentPage === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onPageChange(item.id)}
                  data-testid={`nav-${item.id}`}
                  className="rounded-full border px-2.5 py-1.5 text-[0.8rem] flex items-center gap-2 cursor-pointer transition-all duration-150"
                  style={{
                    background: isActive 
                      ? "radial-gradient(circle at left, rgba(79, 195, 247, 0.14), rgba(8, 8, 8, 0.98))"
                      : "transparent",
                    borderColor: isActive ? "rgba(79, 195, 247, 0.9)" : "transparent",
                    color: isActive ? "#ffffff" : "#b8b8b8",
                    boxShadow: isActive ? "0 15px 35px rgba(79, 195, 247, 0.3)" : "none",
                  }}
                >
                  <div 
                    className="w-2 h-2 rounded-full transition-all duration-150"
                    style={{
                      background: "linear-gradient(135deg, #4fc3f7, #ff9ece)",
                      boxShadow: "0 0 10px rgba(79, 195, 247, 0.7)",
                      opacity: isActive ? 1 : 0,
                      transform: isActive ? "scale(1)" : "scale(0.4)",
                    }}
                  />
                  <Icon className="w-4 h-4" />
                  <span className="flex-1">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="pt-2.5 border-t border-[rgba(37,37,37,0.9)] mt-2.5 text-[0.7rem] text-[#b8b8b8] flex flex-col gap-1">
        <div 
          className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full w-fit"
          style={{
            border: "1px solid rgba(255, 158, 206, 0.5)",
            background: "rgba(255, 158, 206, 0.06)",
            color: "#ff9ece",
          }}
        >
          <span 
            className="w-1.5 h-1.5 rounded-full"
            style={{
              background: "linear-gradient(135deg, #4fc3f7, #ff9ece)",
              boxShadow: "0 0 10px rgba(79, 195, 247, 0.8)",
            }}
          />
          LocalStorage Save
        </div>
        <p className="text-[0.68rem]">
          Your data, dropdowns, and tags are stored only in this browser.
        </p>
      </div>
    </aside>
  );
}
