import { useState, useMemo } from "react";
import { useTrades } from "@/contexts/TradeContext";
import { TradingCard } from "@/components/TradingCard";
import { StatCard } from "@/components/StatCard";
import { FilterPills } from "@/components/FilterPills";
import { Calendar } from "@/components/Calendar";
import { EquityCurveChart } from "@/components/EquityCurveChart";
import { WinLossChart } from "@/components/WinLossChart";
import { StreakIndicator } from "@/components/StreakIndicator";
import { computeStats, getFilteredTrades, formatR } from "@/lib/tradeUtils";

const FILTER_OPTIONS = [
  { id: "all", label: "All Time" },
  { id: "today", label: "Today" },
  { id: "week", label: "This Week" },
  { id: "month", label: "This Month" },
];

export default function Dashboard() {
  const { trades } = useTrades();
  const [filter, setFilter] = useState("all");

  const filteredTrades = useMemo(() => getFilteredTrades(trades, filter), [trades, filter]);
  const stats = useMemo(() => computeStats(filteredTrades), [filteredTrades]);

  const valueColor = (val: number) => {
    if (val > 0.0001) return "positive" as const;
    if (val < -0.0001) return "negative" as const;
    return "default" as const;
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-wide uppercase">Dashboard</h1>
          <p className="text-[0.82rem] text-[#b8b8b8]">
            Your trading performance at a glance
          </p>
        </div>
        <FilterPills options={FILTER_OPTIONS} activeId={filter} onChange={setFilter} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        <StatCard 
          label="Total R" 
          value={formatR(stats.totalR)} 
          valueColor={valueColor(stats.totalR)}
        />
        <StatCard 
          label="Trades" 
          value={stats.n} 
          subtext={`${stats.wins}W · ${stats.losses}L · ${stats.bes}BE`}
        />
        <StatCard 
          label="Win Rate" 
          value={`${stats.winrate.toFixed(1)}%`}
          valueColor={stats.winrate >= 50 ? "positive" : "negative"}
        />
        <StatCard 
          label="Avg R" 
          value={formatR(stats.avgR)}
          valueColor={valueColor(stats.avgR)}
        />
        <StatCard 
          label="Best Trade" 
          value={formatR(stats.bestR)}
          valueColor="positive"
        />
        <StatCard 
          label="Worst Trade" 
          value={formatR(stats.worstR)}
          valueColor="negative"
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        <StatCard 
          label="Profit Factor" 
          value={stats.profitFactor === Infinity ? "∞" : stats.profitFactor.toFixed(2)}
          valueColor={stats.profitFactor > 1 ? "positive" : "negative"}
        />
        <StatCard 
          label="Expectancy" 
          value={formatR(stats.expR)}
          valueColor={valueColor(stats.expR)}
        />
        <StatCard 
          label="Best Day" 
          value={formatR(stats.bestDay)}
          valueColor="positive"
        />
        <StatCard 
          label="Worst Day" 
          value={formatR(stats.worstDay)}
          valueColor="negative"
        />
        <StatCard 
          label="Max Drawdown" 
          value={formatR(-stats.maxDrawdown)}
          valueColor="negative"
        />
        <StatCard 
          label="Active Days" 
          value={stats.activeDays}
          subtext={`Avg ${formatR(stats.avgPerDay)}/day`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <TradingCard title="Equity Curve" subtitle="Cumulative R over time" className="lg:col-span-2">
          <EquityCurveChart trades={filteredTrades} />
        </TradingCard>

        <div className="space-y-4">
          <TradingCard title="Win/Loss Ratio" subtitle="Trade outcome distribution">
            <WinLossChart stats={stats} />
          </TradingCard>

          <TradingCard title="Streak Tracker" subtitle="Current and historical streaks">
            <StreakIndicator stats={stats} />
          </TradingCard>
        </div>
      </div>

      <TradingCard title="Calendar" subtitle="Daily R distribution for the month">
        <Calendar trades={trades} />
      </TradingCard>
    </div>
  );
}
