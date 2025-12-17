interface FilterPillsProps {
  options: { id: string; label: string }[];
  activeId: string;
  onChange: (id: string) => void;
}

export function FilterPills({ options, activeId, onChange }: FilterPillsProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((option) => {
        const isActive = activeId === option.id;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            data-testid={`filter-${option.id}`}
            className="filter-pill"
            style={{
              borderColor: isActive ? "rgba(255, 215, 110, 0.9)" : "rgba(90, 90, 90, 0.9)",
              background: isActive 
                ? "radial-gradient(circle at top left, rgba(255, 215, 110, 0.15), rgba(10, 10, 10, 0.98))"
                : "rgba(10, 10, 10, 0.96)",
              color: isActive ? "#ffffff" : "#b8b8b8",
              boxShadow: isActive ? "0 10px 28px rgba(255, 215, 110, 0.28)" : "none",
            }}
          >
            <span 
              className="w-1.5 h-1.5 rounded-full transition-all duration-150"
              style={{
                background: "#ffd76e",
                boxShadow: isActive ? "0 0 18px rgba(255, 215, 110, 0.8)" : "none",
                opacity: isActive ? 1 : 0,
                transform: isActive ? "scale(1)" : "scale(0.3)",
              }}
            />
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
