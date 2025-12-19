import { useMemo, useEffect, useRef, useState } from "react";
import { useTradeContext } from "@/contexts/TradeContext";
import { TradingCard } from "@/components/TradingCard";

declare global {
  interface Window {
    Chart: any;
  }
}

export default function Analytics() {
  const { trades } = useTradeContext();

  const [timeFilter, setTimeFilter] = useState<"all" | "week" | "month" | "custom">("all");
  const [customFrom, setCustomFrom] = useState<string>("");
  const [customTo, setCustomTo] = useState<string>("");

  // persist filter selection
  useEffect(() => {
    try {
      const saved = localStorage.getItem('tj_analytics_time_filter');
      const f = (saved as any) || '';
      if (f === 'week' || f === 'month' || f === 'custom' || f === 'all') setTimeFilter(f);
      const sf = localStorage.getItem('tj_analytics_from');
      const st = localStorage.getItem('tj_analytics_to');
      if (sf) setCustomFrom(sf);
      if (st) setCustomTo(st);
    } catch (e) {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('tj_analytics_time_filter', timeFilter);
      if (customFrom) localStorage.setItem('tj_analytics_from', customFrom);
      else localStorage.removeItem('tj_analytics_from');
      if (customTo) localStorage.setItem('tj_analytics_to', customTo);
      else localStorage.removeItem('tj_analytics_to');
    } catch (e) {}
  }, [timeFilter, customFrom, customTo]);

  const filteredTrades = useMemo(() => {
    if (!trades || trades.length === 0) return [] as typeof trades;
    const now = new Date();

    let start: Date | null = null;
    let end: Date | null = null;

    if (timeFilter === "week") {
      // start of current week (Monday)
      const d = new Date(now);
      const day = d.getDay();
      const diff = (day + 6) % 7; // days since Monday
      d.setDate(d.getDate() - diff);
      d.setHours(0,0,0,0);
      start = d;
      end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23,59,59,999);
    } else if (timeFilter === "month") {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      start.setHours(0,0,0,0);
      end = new Date(now.getFullYear(), now.getMonth()+1, 0, 23,59,59,999);
    } else if (timeFilter === "custom") {
      if (customFrom) {
        const f = new Date(customFrom);
        f.setHours(0,0,0,0);
        start = f;
      }
      if (customTo) {
        const t = new Date(customTo);
        t.setHours(23,59,59,999);
        end = t;
      }
    }

    return trades.filter(t => {
      if (!start && !end) return true; // all
      if (!t.date) return false;
      const td = new Date(t.date);
      if (start && td < start) return false;
      if (end && td > end) return false;
      return true;
    });
  }, [trades, timeFilter, customFrom, customTo]);

  const sessionRef = useRef<HTMLCanvasElement>(null);
  const modelRef = useRef<HTMLCanvasElement>(null);
  const gradeRef = useRef<HTMLCanvasElement>(null);
  const symbolRef = useRef<HTMLCanvasElement>(null);

  const chartRefs = useRef<{ session?: any; model?: any; grade?: any; symbol?: any }>({});

  const sessionData = useMemo(() => {
    const buckets: Record<string, { wins: number; losses: number; bes: number }> = {};
    filteredTrades.forEach(t => {
      const key = t.session || "Unknown";
      if (!buckets[key]) buckets[key] = { wins: 0, losses: 0, bes: 0 };
      if (t.realisedR > 0.0001) buckets[key].wins++;
      else if (t.realisedR < -0.0001) buckets[key].losses++;
      else buckets[key].bes++;
    });
    const labels = Object.keys(buckets);
    const winRates = labels.map(k => {
      const b = buckets[k];
      const total = b.wins + b.losses + b.bes;
      return total > 0 ? (b.wins / total) * 100 : 0;
    });
    return { labels, winRates };
  }, [filteredTrades]);

  const modelData = useMemo(() => {
    const buckets: Record<string, { wins: number; losses: number; bes: number }> = {};
    filteredTrades.forEach(t => {
      const key = t.model || "Unknown";
      if (!buckets[key]) buckets[key] = { wins: 0, losses: 0, bes: 0 };
      if (t.realisedR > 0.0001) buckets[key].wins++;
      else if (t.realisedR < -0.0001) buckets[key].losses++;
      else buckets[key].bes++;
    });
    const labels = Object.keys(buckets);
    const winRates = labels.map(k => {
      const b = buckets[k];
      const total = b.wins + b.losses + b.bes;
      return total > 0 ? (b.wins / total) * 100 : 0;
    });
    return { labels, winRates };
  }, [filteredTrades]);

  const gradeData = useMemo(() => {
    const buckets: Record<string, { wins: number; losses: number; bes: number }> = {};
    filteredTrades.forEach(t => {
      const key = t.setupGrade || "Unknown";
      if (!buckets[key]) buckets[key] = { wins: 0, losses: 0, bes: 0 };
      if (t.realisedR > 0.0001) buckets[key].wins++;
      else if (t.realisedR < -0.0001) buckets[key].losses++;
      else buckets[key].bes++;
    });
    const labels = Object.keys(buckets);
    const winRates = labels.map(k => {
      const b = buckets[k];
      const total = b.wins + b.losses + b.bes;
      return total > 0 ? (b.wins / total) * 100 : 0;
    });
    return { labels, winRates };
  }, [filteredTrades]);

  const symbolData = useMemo(() => {
    const buckets: Record<string, number> = {};
    filteredTrades.forEach(t => {
      const key = t.symbol || "Unknown";
      buckets[key] = (buckets[key] || 0) + (t.realisedR || 0);
    });
    const labels = Object.keys(buckets);
    const totals = labels.map(k => buckets[k]);
    return { labels, totals };
  }, [filteredTrades]);

  useEffect(() => {
    if (typeof window.Chart === "undefined") return;

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "rgba(5, 5, 5, 0.95)",
          titleColor: "#ffffff",
          bodyColor: "#b8b8b8",
          borderColor: "rgba(79, 195, 247, 0.5)",
          borderWidth: 1,
          padding: 10,
          cornerRadius: 8,
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          grid: { display: false },
          ticks: { color: "#9b9b9b", font: { size: 10 } }
        },
        x: {
          grid: { display: false },
          ticks: { color: "#9b9b9b", font: { size: 10 } }
        }
      }
    };

    // unified accent colors
    const accent = 'rgba(79,195,247,';

    if (sessionRef.current) {
      if (chartRefs.current.session) chartRefs.current.session.destroy();
      chartRefs.current.session = new window.Chart(sessionRef.current.getContext("2d"), {
        type: "bar",
        data: {
          labels: sessionData.labels,
          datasets: [{
            label: "Win Rate %",
            data: sessionData.winRates,
            backgroundColor: `${accent}0.7)`,
            borderColor: `${accent}1)` ,
            borderWidth: 1,
            borderRadius: 4,
          }]
        },
        options: chartOptions
      });
    }

    if (modelRef.current) {
      if (chartRefs.current.model) chartRefs.current.model.destroy();
      chartRefs.current.model = new window.Chart(modelRef.current.getContext("2d"), {
        type: "bar",
        data: {
          labels: modelData.labels,
          datasets: [{
            label: "Win Rate %",
            data: modelData.winRates,
            backgroundColor: `${accent}0.6)`,
            borderColor: `${accent}0.95)` ,
            borderWidth: 1,
            borderRadius: 4,
          }]
        },
        options: chartOptions
      });
    }

    if (gradeRef.current) {
      if (chartRefs.current.grade) chartRefs.current.grade.destroy();
      chartRefs.current.grade = new window.Chart(gradeRef.current.getContext("2d"), {
        type: "bar",
        data: {
          labels: gradeData.labels,
          datasets: [{
            label: "Win Rate %",
            data: gradeData.winRates,
            backgroundColor: `${accent}0.5)`,
            borderColor: `${accent}0.9)` ,
            borderWidth: 1,
            borderRadius: 4,
          }]
        },
        options: chartOptions
      });
    }

    if (symbolRef.current) {
      if (chartRefs.current.symbol) chartRefs.current.symbol.destroy();
      const colors = symbolData.totals.map(v => v >= 0 ? "rgba(0, 210, 138, 0.7)" : "rgba(255, 79, 79, 0.7)");
      chartRefs.current.symbol = new window.Chart(symbolRef.current.getContext("2d"), {
        type: "bar",
        data: {
          labels: symbolData.labels,
          datasets: [{
            label: "Total R",
            data: symbolData.totals,
            backgroundColor: colors,
            borderColor: colors.map(c => c.replace("0.7", "1")),
            borderWidth: 1,
            borderRadius: 4,
          }]
        },
        options: {
          ...chartOptions,
          scales: {
            ...chartOptions.scales,
            y: {
              ...chartOptions.scales.y,
              max: undefined,
            }
          }
        }
      });
    }

    return () => {
      Object.values(chartRefs.current).forEach(chart => chart?.destroy());
    };
  }, [sessionData, modelData, gradeData, symbolData]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <div>
        <h1 className="text-xl font-semibold tracking-wide uppercase">Analytics</h1>
        <p className="text-[0.82rem] text-[#b8b8b8]">
          Performance breakdown by session, model, grade, and symbol
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <button className={`filter-pill ${timeFilter === 'week' ? 'active' : ''}`} onClick={() => setTimeFilter('week')}>This Week</button>
          <button className={`filter-pill ${timeFilter === 'month' ? 'active' : ''}`} onClick={() => setTimeFilter('month')}>This Month</button>
          <button className={`filter-pill ${timeFilter === 'all' ? 'active' : ''}`} onClick={() => setTimeFilter('all')}>All Time</button>
          <button className={`filter-pill ${timeFilter === 'custom' ? 'active' : ''}`} onClick={() => setTimeFilter('custom')}>Custom</button>
        </div>

        {timeFilter === 'custom' && (
          <div className="flex items-center gap-2">
            <input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} className="bg-[#0a0a0a] border border-[rgba(60,60,60,0.95)] rounded-xl px-3 py-2 text-[0.82rem]" />
            <input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)} className="bg-[#0a0a0a] border border-[rgba(60,60,60,0.95)] rounded-xl px-3 py-2 text-[0.82rem]" />
            <button className="btn-ghost-trading" onClick={() => { /* no-op; changes are reactive */ }}>Apply</button>
          </div>
        )}
      </div>
      <div className="text-[0.82rem] text-[#b8b8b8]">
        {(() => {
          if (timeFilter === 'all') return 'Showing: All time';
          const fmt = (d?: string) => d || '--';
          if (timeFilter === 'week') {
            const now = new Date();
            const day = now.getDay();
            const diff = (day + 6) % 7;
            const start = new Date(now);
            start.setDate(now.getDate() - diff);
            start.setHours(0,0,0,0);
            return `Showing: ${start.toISOString().slice(0,10)} → ${now.toISOString().slice(0,10)}`;
          }
          if (timeFilter === 'month') {
            const now = new Date();
            const start = new Date(now.getFullYear(), now.getMonth(), 1);
            return `Showing: ${start.toISOString().slice(0,10)} → ${now.toISOString().slice(0,10)}`;
          }
          if (timeFilter === 'custom') {
            return `Showing: ${fmt(customFrom)} → ${fmt(customTo)}`;
          }
          return null;
        })()}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TradingCard title="Win Rate by Session" subtitle="Performance across trading sessions">
          <div className="h-[220px]">
            <canvas ref={sessionRef} data-testid="session-chart" />
          </div>
        </TradingCard>

        <TradingCard title="Win Rate by Model" subtitle="Performance by trading model/strategy">
          <div className="h-[220px]">
            <canvas ref={modelRef} data-testid="model-chart" />
          </div>
        </TradingCard>

        <TradingCard title="Win Rate by Setup Grade" subtitle="Performance by setup quality">
          <div className="h-[220px]">
            <canvas ref={gradeRef} data-testid="grade-chart" />
          </div>
        </TradingCard>

        <TradingCard title="Total R by Symbol" subtitle="Cumulative R per trading instrument">
          <div className="h-[220px]">
            <canvas ref={symbolRef} data-testid="symbol-chart" />
          </div>
        </TradingCard>
      </div>
    </div>
  );
}
