import { useState } from "react";
import { useTradeContext } from "@/contexts/TradeContext";
import { calculateMistakeStats } from "@/lib/mistakeAnalytics";

export default function Mistakes() {
  const { trades } = useTradeContext();
  const [selectedSession, setSelectedSession] = useState<string>("all");
  const [selectedModel, setSelectedModel] = useState<string>("all");
const sessions = ["all", "Asia", "London", "New York"];
const [dateFilter, setDateFilter] = useState<
  "all" | "week" | "month" | "custom"
>("all");

const [fromDate, setFromDate] = useState<string>("");
const [toDate, setToDate] = useState<string>("");

const models = [
  "all",
  ...Array.from(
    new Set(
      trades
        .map((t) => t.model)
        .filter((m): m is string => Boolean(m))
    )
  ),
];

  const filteredTrades = trades.filter((trade) => {
  const sessionMatch =
    selectedSession === "all" || trade.session === selectedSession;

  const modelMatch =
    selectedModel === "all" || trade.model === selectedModel;

  // ---- DATE FILTER ----
  let dateMatch = true;
  const tradeDate = new Date(trade.date);

  const now = new Date();

  if (dateFilter === "week") {
    const weekAgo = new Date();
    weekAgo.setDate(now.getDate() - 7);
    dateMatch = tradeDate >= weekAgo;
  }

  if (dateFilter === "month") {
    const monthAgo = new Date();
    monthAgo.setMonth(now.getMonth() - 1);
    dateMatch = tradeDate >= monthAgo;
  }

  if (dateFilter === "custom" && fromDate && toDate) {
    const from = new Date(fromDate);
    const to = new Date(toDate);
    dateMatch = tradeDate >= from && tradeDate <= to;
  }

  return sessionMatch && modelMatch && dateMatch;
});

  const mistakeStats = calculateMistakeStats(filteredTrades).sort(
    (a, b) => a.totalR - b.totalR // most negative first
  );

  const rankedMistakes = mistakeStats.map((m, index) => ({
  ...m,
  priority: index + 1,
}));

  const totalMistakeR = mistakeStats.reduce((sum, m) => sum + m.totalR, 0);

const worstMistake = mistakeStats[0];
const mostFrequent = [...mistakeStats].sort(
  (a, b) => b.trades - a.trades
)[0];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Mistakes</h1>
      <p className="text-sm opacity-60 mb-4">
  These mistakes cost you{" "}
  <span className="text-red-400 font-medium">
    {totalMistakeR.toFixed(2)}R
  </span>
</p>

<div className="grid grid-cols-4 gap-4 mb-8">
  <div className="rounded-xl border border-[#252525] p-4">
    <p className="text-xs opacity-60">Worst Mistake</p>
    <p className="text-lg font-semibold text-red-400">
      {worstMistake?.mistake ?? "-"}
    </p>
  </div>

  <div className="rounded-xl border border-[#252525] p-4">
    <p className="text-xs opacity-60">Total R Lost</p>
    <p className="text-lg font-semibold text-red-400">
      {totalMistakeR.toFixed(2)}R
    </p>
  </div>

  <div className="rounded-xl border border-[#252525] p-4">
    <p className="text-xs opacity-60">Most Frequent</p>
    <p className="text-lg font-semibold">
      {mostFrequent?.mistake ?? "-"}
    </p>
  </div>

  <div className="rounded-xl border border-[#252525] p-4">
    <p className="text-xs opacity-60">Worst Expectancy</p>
    <p className="text-lg font-semibold text-red-400">
      {worstMistake?.expectancy.toFixed(2)}
    </p>
  </div>
</div>

      <div className="flex gap-4 mb-6">
  <div>
    <label className="block text-xs opacity-60 mb-1">Session</label>
    <select
      value={selectedSession}
      onChange={(e) => setSelectedSession(e.target.value)}
      className="bg-[#111] border border-[#252525] rounded-lg px-3 py-2 text-sm"
    >
      {sessions.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  </div>

  <div>
    <label className="block text-xs opacity-60 mb-1">Model</label>
    <select
      value={selectedModel}
      onChange={(e) => setSelectedModel(e.target.value)}
      className="bg-[#111] border border-[#252525] rounded-lg px-3 py-2 text-sm"
    >
      {models.map((m) => (
        <option key={m} value={m}>
          {m}
        </option>
      ))}
    </select>
  </div><div>
  <label className="block text-xs opacity-60 mb-1">Date</label>
  <select
    value={dateFilter}
    onChange={(e) => setDateFilter(e.target.value as any)}
    className="bg-[#111] border border-[#252525] rounded-lg px-3 py-2 text-sm"
  >
    <option value="all">All Time</option>
    <option value="week">This Week</option>
    <option value="month">This Month</option>
    <option value="custom">Custom</option>
  </select>
</div>

  {dateFilter === "custom" && (
    <>
      <div>
        <label className="block text-xs opacity-60 mb-1">From</label>
        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          className="bg-[#111] border border-[#252525] rounded-lg px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-xs opacity-60 mb-1">To</label>
        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          className="bg-[#111] border border-[#252525] rounded-lg px-3 py-2 text-sm"
        />
      </div>
    </>
  )}

</div>

      {mistakeStats.length === 0 ? (
        <p className="opacity-60">No mistakes logged yet.</p>
      ) : (
        <div className="rounded-xl border border-[#252525] overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#111] text-left">
              <tr>
  <th className="p-3 opacity-60">#</th>
  <th className="p-3">Mistake</th>
  <th className="p-3">Trades</th>
  <th className="p-3">Win %</th>
  <th className="p-3">Total R</th>
  <th className="p-3">Expectancy</th>
</tr>
            </thead>

            <tbody>
              {rankedMistakes.map((m) => {
                const winRate =
                  m.trades > 0 ? ((m.wins / m.trades) * 100).toFixed(0) : "0";

                return (
                  <tr
                    key={m.mistake}
                    className="border-t border-[#252525] hover:bg-[#111]"
                  >
                    <td className="p-3 font-mono opacity-60">
  {m.priority}
</td>

                    <td className="p-3 font-medium">
  <div className="flex flex-col gap-1">
    <span>{m.mistake}</span>

    <div className="w-full h-1 rounded bg-[#1a1a1a] overflow-hidden">
      <div
        className="h-full bg-red-500"
        style={{
          width: `${Math.min(
            Math.abs(m.totalR) * 25,
            100
          )}%`,
        }}
      />
    </div>
  </div>
</td>

                    <td className="p-3">{m.trades}</td>
                    <td className="p-3">{winRate}%</td>
                    <td
                      className={`p-3 ${
                        m.totalR >= 0 ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {m.totalR.toFixed(2)}
                    </td>
                    <td className="p-3">{m.expectancy.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Scenario analysis: What if */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-3">Scenario analysis - What if you were not a retard.</h2>

        {/* compute comparison metrics */}
        {(() => {
          const all = filteredTrades;
          const noMistakes = filteredTrades.filter(
            (t) =>
              !t.mistakes?.length ||
              t.mistakes.some(
                (m) => m && m.trim().toLowerCase() === "normal model loss"
              )
          );

          const compute = (arr: typeof filteredTrades) => {
            const total = arr.length;
            const wins = arr.filter((t) => (t.realisedR || 0) > 0).length;
            const losses = arr.filter((t) => (t.realisedR || 0) < 0).length;
            const winRate = total > 0 ? (wins / total) * 100 : 0;
            const totalR = arr.reduce((s, t) => s + (t.realisedR || 0), 0);
            const expectancy = total > 0 ? totalR / total : 0;

            // max consecutive loss (by chronological order)
            const sorted = [...arr].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            let maxConsecLoss = 0;
            let cur = 0;
            for (const t of sorted) {
              if ((t.realisedR || 0) < 0) {
                cur++;
                if (cur > maxConsecLoss) maxConsecLoss = cur;
              } else {
                cur = 0;
              }
            }

            return { total, wins, losses, winRate, totalR, expectancy, maxConsecLoss };
          };

          const a = compute(all);
          const b = compute(noMistakes);

          const rows: Array<{ key: string; label: string; a: string; b: string }> = [
            { key: 'total', label: 'Total trades', a: String(a.total), b: String(b.total) },
            { key: 'wins', label: 'Wins', a: String(a.wins), b: String(b.wins) },
            { key: 'losses', label: 'Losses', a: String(a.losses), b: String(b.losses) },
            { key: 'winrate', label: 'Win rate', a: a.winRate.toFixed(1) + '%', b: b.winRate.toFixed(1) + '%' },
            { key: 'totalR', label: 'Total R', a: a.totalR.toFixed(2) + 'R', b: b.totalR.toFixed(2) + 'R' },
            { key: 'ev', label: 'Expected EV', a: a.expectancy.toFixed(2), b: b.expectancy.toFixed(2) },
            { key: 'mcl', label: 'Max consecutive loss', a: String(a.maxConsecLoss), b: String(b.maxConsecLoss) },
          ];

          return (
            <div
              className="rounded-2xl p-5 mt-2 shadow-lg"
              style={{
                border: '1.5px solid rgba(139,92,246,0.18)',
                background: 'linear-gradient(180deg, rgba(24,16,32,0.92), rgba(16,12,24,0.96))',
                boxShadow: '0 8px 40px 0 rgba(139,92,246,0.10), 0 1.5px 0 0 rgba(139,92,246,0.10)'
              }}
            >
              <div className="mb-4 text-base font-semibold text-[#d9c8ff] tracking-wide flex items-center gap-2">
                <span className="text-lg font-mono text-[#b8b8ff]">★</span>
                Scenario Comparison
              </div>
              <div className="mb-2 text-xs opacity-70">Current filtered trades vs. the same dataset excluding mistakes (including <span className='text-purple-300 font-semibold'>Normal Model Loss</span>).</div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm table-fixed border-separate border-spacing-y-1">
                  <thead>
                    <tr className="text-left bg-[rgba(139,92,246,0.08)]">
                      <th className="p-3 opacity-70 w-1/12 text-center">#</th>
                      <th className="p-3 opacity-70 w-5/12">Metric</th>
                      <th className="p-3 w-1/4 text-center">All trades</th>
                      <th className="p-3 w-1/4 text-center">Without mistakes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r, idx) => {
                      // Dramatic effect: highlight improvement, fade negative, add numbering
                      let highlight = '';
                      let icon = null;
                      if (r.key !== 'total' && r.key !== 'mcl') {
                        const aNum = parseFloat(r.a);
                        const bNum = parseFloat(r.b);
                        if (!isNaN(aNum) && !isNaN(bNum)) {
                          if (bNum > aNum) {
                            highlight = 'text-[#a78bfa] font-bold';
                            icon = <span className="ml-1 text-purple-300">▲</span>;
                          } else if (bNum < aNum) {
                            highlight = 'text-[#f87171] font-bold';
                            icon = <span className="ml-1 text-red-400">▼</span>;
                          }
                        }
                      }
                      return (
                        <tr key={r.key} className={`rounded-lg ${idx % 2 === 0 ? 'bg-[rgba(139,92,246,0.04)]' : ''}`}> 
                          <td className="p-3 text-center text-xs text-[#b8b8ff] font-mono">{idx + 1}</td>
                          <td className="p-3 opacity-80 font-medium">{r.label}</td>
                          <td className="p-3 font-mono text-center text-[#cfcfcf]">{r.a}</td>
                          <td className={`p-3 font-mono text-center transition-all duration-200 ${highlight}`}>{r.b}{icon}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
