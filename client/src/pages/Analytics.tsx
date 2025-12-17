import { useMemo, useEffect, useRef } from "react";
import { useTrades } from "@/contexts/TradeContext";
import { TradingCard } from "@/components/TradingCard";

declare global {
  interface Window {
    Chart: any;
  }
}

export default function Analytics() {
  const { trades } = useTrades();

  const sessionRef = useRef<HTMLCanvasElement>(null);
  const modelRef = useRef<HTMLCanvasElement>(null);
  const gradeRef = useRef<HTMLCanvasElement>(null);
  const symbolRef = useRef<HTMLCanvasElement>(null);

  const chartRefs = useRef<{ session?: any; model?: any; grade?: any; symbol?: any }>({});

  const sessionData = useMemo(() => {
    const buckets: Record<string, { wins: number; losses: number; bes: number }> = {};
    trades.forEach(t => {
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
  }, [trades]);

  const modelData = useMemo(() => {
    const buckets: Record<string, { wins: number; losses: number; bes: number }> = {};
    trades.forEach(t => {
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
  }, [trades]);

  const gradeData = useMemo(() => {
    const buckets: Record<string, { wins: number; losses: number; bes: number }> = {};
    trades.forEach(t => {
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
  }, [trades]);

  const symbolData = useMemo(() => {
    const buckets: Record<string, number> = {};
    trades.forEach(t => {
      const key = t.symbol || "Unknown";
      buckets[key] = (buckets[key] || 0) + (t.realisedR || 0);
    });
    const labels = Object.keys(buckets);
    const totals = labels.map(k => buckets[k]);
    return { labels, totals };
  }, [trades]);

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
          grid: { color: "rgba(37, 37, 37, 0.5)" },
          ticks: { color: "#888888", font: { size: 10 } }
        },
        x: { 
          grid: { display: false },
          ticks: { color: "#888888", font: { size: 10 } }
        }
      }
    };

    if (sessionRef.current) {
      if (chartRefs.current.session) chartRefs.current.session.destroy();
      chartRefs.current.session = new window.Chart(sessionRef.current.getContext("2d"), {
        type: "bar",
        data: {
          labels: sessionData.labels,
          datasets: [{
            label: "Win Rate %",
            data: sessionData.winRates,
            backgroundColor: "rgba(79, 195, 247, 0.7)",
            borderColor: "rgba(79, 195, 247, 1)",
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
            backgroundColor: "rgba(255, 158, 206, 0.7)",
            borderColor: "rgba(255, 158, 206, 1)",
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
            backgroundColor: "rgba(255, 215, 110, 0.7)",
            borderColor: "rgba(255, 215, 110, 1)",
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
