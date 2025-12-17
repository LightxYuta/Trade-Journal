import { useState, useMemo } from "react";
import { Plus, X, Filter, Trash2, Edit2 } from "lucide-react";
import { useTrades } from "@/contexts/TradeContext";
import { TradingCard } from "@/components/TradingCard";
import { classifyOutcome, formatDate, formatR } from "@/lib/tradeUtils";
import type { Trade } from "@shared/schema";

export default function Trades() {
  const { trades, settings, addTrade, deleteTrade } = useTrades();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [filterSession, setFilterSession] = useState("");
  const [filterModel, setFilterModel] = useState("");
  const [filterAccount, setFilterAccount] = useState("");
  const [filterPosition, setFilterPosition] = useState("");
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    symbol: "",
    account: "",
    model: "",
    session: "",
    entryTF: "",
    position: "Long",
    riskPercent: "",
    realisedR: "",
    maxR: "",
    setupGrade: "",
    keyLevels: [] as string[],
    mistakes: [] as string[],
    screenshots: "",
    notes: "",
  });

  const filteredTrades = useMemo(() => {
    return trades.filter(t => {
      if (filterSession && t.session !== filterSession) return false;
      if (filterModel && t.model !== filterModel) return false;
      if (filterAccount && t.account !== filterAccount) return false;
      if (filterPosition && t.position !== filterPosition) return false;
      if (filterFrom && t.date && t.date < filterFrom) return false;
      if (filterTo && t.date && t.date > filterTo) return false;
      return true;
    });
  }, [trades, filterSession, filterModel, filterAccount, filterPosition, filterFrom, filterTo]);

  const clearFilters = () => {
    setFilterSession("");
    setFilterModel("");
    setFilterAccount("");
    setFilterPosition("");
    setFilterFrom("");
    setFilterTo("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.date || !formData.symbol || !formData.realisedR) {
      alert("Please fill Date, Symbol, and Realised R.");
      return;
    }

    const realisedR = parseFloat(formData.realisedR);
    if (isNaN(realisedR)) {
      alert("Realised R must be a number.");
      return;
    }

    let riskPercent = null;
    if (formData.riskPercent) {
      riskPercent = parseFloat(formData.riskPercent);
      if (isNaN(riskPercent)) {
        alert("Risk % must be a number.");
        return;
      }
    }

    let maxR = realisedR;
    if (formData.maxR) {
      const parsed = parseFloat(formData.maxR);
      if (!isNaN(parsed)) maxR = parsed;
    }

    addTrade({
      date: formData.date,
      symbol: formData.symbol.toUpperCase(),
      account: formData.account,
      model: formData.model,
      session: formData.session,
      entryTF: formData.entryTF,
      position: formData.position,
      riskPercent,
      realisedR,
      maxR,
      setupGrade: formData.setupGrade,
      keyLevels: formData.keyLevels,
      mistakes: formData.mistakes,
      screenshots: formData.screenshots,
      notes: formData.notes,
      createdAt: Date.now(),
    });

    setFormData({
      ...formData,
      symbol: "",
      realisedR: "",
      maxR: "",
      riskPercent: "",
      notes: "",
      screenshots: "",
      keyLevels: [],
      mistakes: [],
    });
    setIsFormOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this trade?")) {
      deleteTrade(id);
    }
  };

  const toggleTag = (field: "keyLevels" | "mistakes", value: string) => {
    setFormData(prev => {
      const arr = prev[field];
      if (arr.includes(value)) {
        return { ...prev, [field]: arr.filter(v => v !== value) };
      }
      return { ...prev, [field]: [...arr, value] };
    });
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-wide uppercase">Trades</h1>
          <p className="text-[0.82rem] text-[#b8b8b8]">
            {trades.length} total trade{trades.length === 1 ? "" : "s"} logged
          </p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="btn-trading"
          data-testid="button-add-trade"
        >
          <Plus className="w-4 h-4" />
          Add Trade
        </button>
      </div>

      <TradingCard 
        title="Filters" 
        subtitle="Filter your trade history"
        headerActions={
          <button onClick={clearFilters} className="btn-ghost-trading text-[0.78rem]" data-testid="button-clear-filters">
            Clear
          </button>
        }
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          <div>
            <label className="text-[0.7rem] text-[#b8b8b8] uppercase tracking-wide block mb-1">Session</label>
            <select
              value={filterSession}
              onChange={(e) => setFilterSession(e.target.value)}
              className="w-full bg-[#0a0a0a] border border-[rgba(60,60,60,0.95)] rounded-xl px-3 py-2 text-[0.82rem]"
              data-testid="filter-session"
            >
              <option value="">All</option>
              {settings.sessions?.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[0.7rem] text-[#b8b8b8] uppercase tracking-wide block mb-1">Model</label>
            <select
              value={filterModel}
              onChange={(e) => setFilterModel(e.target.value)}
              className="w-full bg-[#0a0a0a] border border-[rgba(60,60,60,0.95)] rounded-xl px-3 py-2 text-[0.82rem]"
              data-testid="filter-model"
            >
              <option value="">All</option>
              {settings.models?.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[0.7rem] text-[#b8b8b8] uppercase tracking-wide block mb-1">Account</label>
            <select
              value={filterAccount}
              onChange={(e) => setFilterAccount(e.target.value)}
              className="w-full bg-[#0a0a0a] border border-[rgba(60,60,60,0.95)] rounded-xl px-3 py-2 text-[0.82rem]"
              data-testid="filter-account"
            >
              <option value="">All</option>
              {settings.accounts?.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[0.7rem] text-[#b8b8b8] uppercase tracking-wide block mb-1">Position</label>
            <select
              value={filterPosition}
              onChange={(e) => setFilterPosition(e.target.value)}
              className="w-full bg-[#0a0a0a] border border-[rgba(60,60,60,0.95)] rounded-xl px-3 py-2 text-[0.82rem]"
              data-testid="filter-position"
            >
              <option value="">All</option>
              <option value="Long">Long</option>
              <option value="Short">Short</option>
            </select>
          </div>
          <div>
            <label className="text-[0.7rem] text-[#b8b8b8] uppercase tracking-wide block mb-1">From</label>
            <input
              type="date"
              value={filterFrom}
              onChange={(e) => setFilterFrom(e.target.value)}
              className="w-full bg-[#0a0a0a] border border-[rgba(60,60,60,0.95)] rounded-xl px-3 py-2 text-[0.82rem]"
              data-testid="filter-from"
            />
          </div>
          <div>
            <label className="text-[0.7rem] text-[#b8b8b8] uppercase tracking-wide block mb-1">To</label>
            <input
              type="date"
              value={filterTo}
              onChange={(e) => setFilterTo(e.target.value)}
              className="w-full bg-[#0a0a0a] border border-[rgba(60,60,60,0.95)] rounded-xl px-3 py-2 text-[0.82rem]"
              data-testid="filter-to"
            />
          </div>
        </div>
      </TradingCard>

      <TradingCard title="Trade Log" subtitle={`${filteredTrades.length} trade${filteredTrades.length === 1 ? "" : "s"} matching filters`}>
        <div className="overflow-x-auto">
          <table className="w-full text-[0.78rem]">
            <thead>
              <tr className="text-left text-[0.72rem] text-[#b8b8b8] uppercase tracking-wider">
                <th className="pb-2 pr-3">#</th>
                <th className="pb-2 pr-3">Date</th>
                <th className="pb-2 pr-3">Symbol</th>
                <th className="pb-2 pr-3">Position</th>
                <th className="pb-2 pr-3">Realised R</th>
                <th className="pb-2 pr-3">Max R</th>
                <th className="pb-2 pr-3">Account</th>
                <th className="pb-2 pr-3">Model</th>
                <th className="pb-2 pr-3">Session</th>
                <th className="pb-2 pr-3">Grade</th>
                <th className="pb-2 pr-3">Notes</th>
                <th className="pb-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTrades.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-8 text-center text-[#b8b8b8]">
                    No trades match the current filters. Add trades or clear filters.
                  </td>
                </tr>
              ) : (
                filteredTrades.map((t, idx) => {
                  const outcome = classifyOutcome(t.realisedR);
                  const outcomeClass = outcome === "Win" ? "win" : outcome === "Loss" ? "loss" : "be";
                  
                  return (
                    <tr 
                      key={t.id} 
                      className="border-t border-[rgba(50,50,50,0.95)]"
                      data-testid={`trade-row-${t.id}`}
                    >
                      <td className="py-2 pr-3">{idx + 1}</td>
                      <td className="py-2 pr-3">{formatDate(t.date)}</td>
                      <td className="py-2 pr-3 font-medium">{t.symbol}</td>
                      <td className="py-2 pr-3">{t.position}</td>
                      <td className="py-2 pr-3">
                        <span className={`font-semibold ${
                          t.realisedR > 0 ? "text-[#00d28a]" : t.realisedR < 0 ? "text-[#ff4f4f]" : "text-[#b8b8b8]"
                        }`}>
                          {formatR(t.realisedR)}
                        </span>
                        <span className={`badge-outcome ${outcomeClass} ml-1.5`}>{outcome}</span>
                      </td>
                      <td className="py-2 pr-3">{formatR(t.maxR || t.realisedR)}</td>
                      <td className="py-2 pr-3 text-[#b8b8b8]">{t.account}</td>
                      <td className="py-2 pr-3 text-[#b8b8b8]">{t.model}</td>
                      <td className="py-2 pr-3 text-[#b8b8b8]">{t.session}</td>
                      <td className="py-2 pr-3">{t.setupGrade}</td>
                      <td className="py-2 pr-3 text-[#b8b8b8] max-w-[150px] truncate">{t.notes}</td>
                      <td className="py-2">
                        <button
                          onClick={() => handleDelete(t.id)}
                          className="text-[#ff4f4f] p-1"
                          data-testid={`delete-trade-${t.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </TradingCard>

      {isFormOpen && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={(e) => e.target === e.currentTarget && setIsFormOpen(false)}
        >
          <div 
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[22px] border border-[rgba(40,40,40,0.95)] p-5"
            style={{
              background: "radial-gradient(circle at top left, #161616 0, #050505 45%, #020202 100%)",
              boxShadow: "0 18px 45px rgba(0, 0, 0, 0.9)",
            }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold uppercase tracking-wide">Log New Trade</h2>
              <button onClick={() => setIsFormOpen(false)} className="text-[#b8b8b8]" data-testid="close-form">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[0.72rem] text-[#b8b8b8] uppercase tracking-wide block mb-1">Date *</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full bg-[#0a0a0a] border border-[rgba(60,60,60,0.95)] rounded-xl px-3 py-2 text-[0.85rem]"
                    data-testid="input-date"
                  />
                </div>
                <div>
                  <label className="text-[0.72rem] text-[#b8b8b8] uppercase tracking-wide block mb-1">Symbol *</label>
                  <input
                    type="text"
                    value={formData.symbol}
                    onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                    placeholder="e.g. EURUSD"
                    className="w-full bg-[#0a0a0a] border border-[rgba(60,60,60,0.95)] rounded-xl px-3 py-2 text-[0.85rem]"
                    data-testid="input-symbol"
                  />
                </div>
                <div>
                  <label className="text-[0.72rem] text-[#b8b8b8] uppercase tracking-wide block mb-1">Position</label>
                  <select
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="w-full bg-[#0a0a0a] border border-[rgba(60,60,60,0.95)] rounded-xl px-3 py-2 text-[0.85rem]"
                    data-testid="input-position"
                  >
                    <option value="Long">Long</option>
                    <option value="Short">Short</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[0.72rem] text-[#b8b8b8] uppercase tracking-wide block mb-1">Realised R *</label>
                  <input
                    type="text"
                    value={formData.realisedR}
                    onChange={(e) => setFormData({ ...formData, realisedR: e.target.value })}
                    placeholder="e.g. 2 or -1"
                    className="w-full bg-[#0a0a0a] border border-[rgba(60,60,60,0.95)] rounded-xl px-3 py-2 text-[0.85rem]"
                    data-testid="input-realised-r"
                  />
                </div>
                <div>
                  <label className="text-[0.72rem] text-[#b8b8b8] uppercase tracking-wide block mb-1">Max R</label>
                  <input
                    type="text"
                    value={formData.maxR}
                    onChange={(e) => setFormData({ ...formData, maxR: e.target.value })}
                    placeholder="Optional"
                    className="w-full bg-[#0a0a0a] border border-[rgba(60,60,60,0.95)] rounded-xl px-3 py-2 text-[0.85rem]"
                    data-testid="input-max-r"
                  />
                </div>
                <div>
                  <label className="text-[0.72rem] text-[#b8b8b8] uppercase tracking-wide block mb-1">Risk %</label>
                  <input
                    type="text"
                    value={formData.riskPercent}
                    onChange={(e) => setFormData({ ...formData, riskPercent: e.target.value })}
                    placeholder="e.g. 0.5"
                    className="w-full bg-[#0a0a0a] border border-[rgba(60,60,60,0.95)] rounded-xl px-3 py-2 text-[0.85rem]"
                    data-testid="input-risk-percent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-[0.72rem] text-[#b8b8b8] uppercase tracking-wide block mb-1">Account</label>
                  <select
                    value={formData.account}
                    onChange={(e) => setFormData({ ...formData, account: e.target.value })}
                    className="w-full bg-[#0a0a0a] border border-[rgba(60,60,60,0.95)] rounded-xl px-3 py-2 text-[0.85rem]"
                    data-testid="input-account"
                  >
                    <option value="">Select</option>
                    {settings.accounts?.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[0.72rem] text-[#b8b8b8] uppercase tracking-wide block mb-1">Model</label>
                  <select
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className="w-full bg-[#0a0a0a] border border-[rgba(60,60,60,0.95)] rounded-xl px-3 py-2 text-[0.85rem]"
                    data-testid="input-model"
                  >
                    <option value="">Select</option>
                    {settings.models?.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[0.72rem] text-[#b8b8b8] uppercase tracking-wide block mb-1">Session</label>
                  <select
                    value={formData.session}
                    onChange={(e) => setFormData({ ...formData, session: e.target.value })}
                    className="w-full bg-[#0a0a0a] border border-[rgba(60,60,60,0.95)] rounded-xl px-3 py-2 text-[0.85rem]"
                    data-testid="input-session"
                  >
                    <option value="">Select</option>
                    {settings.sessions?.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[0.72rem] text-[#b8b8b8] uppercase tracking-wide block mb-1">Setup Grade</label>
                  <select
                    value={formData.setupGrade}
                    onChange={(e) => setFormData({ ...formData, setupGrade: e.target.value })}
                    className="w-full bg-[#0a0a0a] border border-[rgba(60,60,60,0.95)] rounded-xl px-3 py-2 text-[0.85rem]"
                    data-testid="input-setup-grade"
                  >
                    <option value="">Select</option>
                    {settings.setupGrades?.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[0.72rem] text-[#b8b8b8] uppercase tracking-wide block mb-1.5">Key Levels</label>
                <div className="flex flex-wrap gap-1.5">
                  {settings.keyLevels?.map(kl => (
                    <button
                      key={kl}
                      type="button"
                      onClick={() => toggleTag("keyLevels", kl)}
                      className={`small-pill-trading ${formData.keyLevels.includes(kl) ? "!border-[#ffd76e] !text-[#ffd76e]" : ""}`}
                      data-testid={`tag-keylevel-${kl}`}
                    >
                      {kl}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[0.72rem] text-[#b8b8b8] uppercase tracking-wide block mb-1.5">Mistakes</label>
                <div className="flex flex-wrap gap-1.5">
                  {settings.mistakes?.map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => toggleTag("mistakes", m)}
                      className={`small-pill-trading ${formData.mistakes.includes(m) ? "!border-[#ff4f4f] !text-[#ff4f4f]" : ""}`}
                      data-testid={`tag-mistake-${m}`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[0.72rem] text-[#b8b8b8] uppercase tracking-wide block mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  className="w-full bg-[#0a0a0a] border border-[rgba(60,60,60,0.95)] rounded-xl px-3 py-2 text-[0.85rem] resize-none"
                  data-testid="input-notes"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button type="submit" className="btn-trading flex-1" data-testid="button-submit-trade">
                  <Plus className="w-4 h-4" />
                  Log Trade
                </button>
                <button 
                  type="button" 
                  onClick={() => setIsFormOpen(false)} 
                  className="btn-ghost-trading flex-1"
                  data-testid="button-cancel"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
