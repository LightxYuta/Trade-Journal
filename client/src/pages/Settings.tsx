import { useState } from "react";
import { X, Plus, Trash2, AlertTriangle } from "lucide-react";
import { useTradeContext } from "@/contexts/TradeContext";
import { TradingCard } from "@/components/TradingCard";

type SettingsKey = "accounts" | "models" | "sessions" | "entryTFs" | "setupGrades" | "keyLevels" | "mistakes";

const SETTINGS_CONFIG: { key: SettingsKey; label: string }[] = [
  { key: "accounts", label: "Accounts" },
  { key: "models", label: "Models" },
  { key: "sessions", label: "Sessions" },
  { key: "entryTFs", label: "Entry TFs" },
  { key: "setupGrades", label: "Setup Grades" },
  { key: "keyLevels", label: "Key Levels" },
  { key: "mistakes", label: "Mistakes" },
];

export default function Settings() {
  const { settings, updateSettings, resetSettings, clearAllTrades, fullReset } = useTradeContext();
  const [editingKey, setEditingKey] = useState<SettingsKey | null>(null);
  const [editValues, setEditValues] = useState<string[]>([]);

  const openEditor = (key: SettingsKey) => {
    setEditingKey(key);
    setEditValues([...(settings[key] || [])]);
  };

  const closeEditor = () => {
    setEditingKey(null);
    setEditValues([]);
  };

  const saveSettings = () => {
    if (!editingKey) return;
    const filtered = editValues.filter(v => v.trim());
    updateSettings({ [editingKey]: filtered });
    closeEditor();
  };

  const addValue = () => {
    setEditValues([...editValues, ""]);
  };

  const removeValue = (index: number) => {
    setEditValues(editValues.filter((_, i) => i !== index));
  };

  const updateValue = (index: number, value: string) => {
    const newValues = [...editValues];
    newValues[index] = value;
    setEditValues(newValues);
  };

  const handleResetSettings = () => {
    if (confirm("Reset dropdowns & tags to defaults? This will not delete trades.")) {
      resetSettings();
    }
  };

  const handleClearTrades = () => {
    if (confirm("Delete all journal data from this browser? This cannot be undone.")) {
      clearAllTrades();
    }
  };

  const handleFullReset = () => {
    if (confirm("Full reset: delete all settings AND trades? This cannot be undone.")) {
      fullReset();
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <div>
        <h1 className="text-xl font-semibold tracking-wide uppercase">Settings</h1>
        <p className="text-[0.82rem] text-[#b8b8b8]">
          Customize your journal dropdowns, tags, and preferences
        </p>
      </div>

      <TradingCard title="Dropdown & Tag Options" subtitle="Configure values for trade logging">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {SETTINGS_CONFIG.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => openEditor(key)}
              className="p-3 rounded-xl border border-[rgba(60,60,60,0.95)] text-left transition-all duration-150"
              style={{ background: "rgba(10, 10, 10, 0.96)" }}
              data-testid={`config-${key}`}
            >
              <div className="text-[0.82rem] font-medium mb-1">{label}</div>
              <div className="text-[0.72rem] text-[#b8b8b8]">
                {settings[key]?.length || 0} items
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {settings[key]?.slice(0, 3).map((v, i) => (
                  <span key={i} className="chip-trading">{v}</span>
                ))}
                {(settings[key]?.length || 0) > 3 && (
                  <span className="chip-trading">+{settings[key]!.length - 3}</span>
                )}
              </div>
            </button>
          ))}
        </div>
      </TradingCard>

      <TradingCard title="Data Management" subtitle="Reset or clear your journal data">
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-xl border border-[rgba(60,60,60,0.95)]" style={{ background: "rgba(10, 10, 10, 0.96)" }}>
            <div className="flex-1">
              <div className="text-[0.85rem] font-medium">Reset Settings Only</div>
              <div className="text-[0.75rem] text-[#b8b8b8]">
                Reset dropdowns and tags to defaults. Your trades will not be affected.
              </div>
            </div>
            <button
              onClick={handleResetSettings}
              className="btn-ghost-trading border border-[rgba(90,90,90,0.9)]"
              data-testid="reset-settings-only"
            >
              Reset Settings
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-xl border border-[rgba(255,79,79,0.3)]" style={{ background: "rgba(255, 79, 79, 0.05)" }}>
            <div className="flex-1">
              <div className="text-[0.85rem] font-medium flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[#ff4f4f]" />
                Clear All Trades
              </div>
              <div className="text-[0.75rem] text-[#b8b8b8]">
                Delete all trade data from this browser. This cannot be undone.
              </div>
            </div>
            <button
              onClick={handleClearTrades}
              className="btn-ghost-trading border border-[rgba(255,79,79,0.5)] text-[#ff4f4f]"
              data-testid="clear-all"
            >
              <Trash2 className="w-4 h-4" />
              Clear Trades
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-xl border border-[rgba(255,79,79,0.5)]" style={{ background: "rgba(255, 79, 79, 0.08)" }}>
            <div className="flex-1">
              <div className="text-[0.85rem] font-medium flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[#ff4f4f]" />
                Full Reset
              </div>
              <div className="text-[0.75rem] text-[#b8b8b8]">
                Delete ALL data including trades and settings. This cannot be undone.
              </div>
            </div>
            <button
              onClick={handleFullReset}
              className="btn-ghost-trading border border-[rgba(255,79,79,0.7)] text-[#ff4f4f]"
              data-testid="clear-all-settings-and-data"
            >
              <Trash2 className="w-4 h-4" />
              Full Reset
            </button>
          </div>
        </div>
      </TradingCard>

      <TradingCard title="About" subtitle="Trading Journal information">
        <div className="space-y-2 text-[0.82rem]">
          <div className="flex items-center gap-2">
            <span className="text-[#b8b8b8]">Version:</span>
            <span 
              className="text-[0.72rem] uppercase tracking-widest px-2 py-0.5 rounded-full"
              style={{
                background: "rgba(79, 195, 247, 0.1)",
                color: "#4fc3f7",
                border: "1px solid rgba(79, 195, 247, 0.6)",
              }}
            >
              React · v2.0
            </span>
          </div>
          <div className="text-[#b8b8b8]">
            R-based performance dashboard for prop trading. All data is stored locally in your browser.
          </div>
          <div className="flex items-center gap-2 mt-3">
            <span 
              className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[0.72rem]"
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
            </span>
          </div>
        </div>
      </TradingCard>

      {editingKey && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={(e) => e.target === e.currentTarget && closeEditor()}
        >
          <div 
            className="w-full max-w-md max-h-[80vh] overflow-y-auto rounded-[22px] border border-[rgba(40,40,40,0.95)] p-5"
            style={{
              background: "radial-gradient(circle at top left, #161616 0, #050505 45%, #020202 100%)",
              boxShadow: "0 18px 45px rgba(0, 0, 0, 0.9)",
            }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold uppercase tracking-wide">
                Edit {SETTINGS_CONFIG.find(c => c.key === editingKey)?.label}
              </h2>
              <button onClick={closeEditor} className="text-[#b8b8b8]" data-testid="close-config">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 mb-4" data-testid="config-list">
              {editValues.map((value, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => updateValue(index, e.target.value)}
                    className="flex-1 bg-[#0a0a0a] border border-[rgba(60,60,60,0.95)] rounded-xl px-3 py-2 text-[0.85rem]"
                    data-testid={`config-input-${index}`}
                  />
                  <button
                    onClick={() => removeValue(index)}
                    className="text-[#ff4f4f] p-2"
                    data-testid={`config-delete-${index}`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={addValue}
              className="w-full mb-4 btn-ghost-trading border border-dashed border-[rgba(90,90,90,0.9)] py-2.5"
              data-testid="config-add"
            >
              <Plus className="w-4 h-4" />
              Add Item
            </button>

            <div className="flex gap-2">
              <button onClick={saveSettings} className="btn-trading flex-1" data-testid="config-save">
                Save Changes
              </button>
              <button onClick={closeEditor} className="btn-ghost-trading flex-1" data-testid="config-cancel">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
