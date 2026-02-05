import { useEffect, useState } from "react";

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/>
    <path d="m21 21-4.35-4.35"/>
  </svg>
);

const RotateCcwIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="1 4 1 10 7 10"/>
    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
  </svg>
);

export default function FiltersBar({ onChange }: { onChange: (q: { search?: string; sort?: string }) => void }) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"new" | "old">("new");

  useEffect(() => {
    const t = setTimeout(() => onChange({ search: search.trim(), sort }), 250);
    return () => clearTimeout(t);
  }, [search, sort, onChange]);

  return (
    <div style={container}>
      <div style={searchContainer}>
        <span style={searchIconWrapper}>
          <SearchIcon />
        </span>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Pretraga po nazivu, profesoru ili opisu..."
          style={searchInput}
        />
      </div>
      
      <select 
        value={sort} 
        onChange={(e) => setSort(e.target.value as any)} 
        style={selectInput}
      >
        <option value="new">Najnovije</option>
        <option value="old">Najstarije</option>
      </select>
      
      <button 
        onClick={() => { setSearch(""); setSort("new"); }} 
        style={resetButton}
      >
        <RotateCcwIcon />
        Reset
      </button>
    </div>
  );
}

/* ----------------- Styles ----------------- */
const container: React.CSSProperties = {
  display: "flex",
  gap: 10,
  alignItems: "center",
};

const searchContainer: React.CSSProperties = {
  position: "relative",
  flex: 1,
};

const searchIconWrapper: React.CSSProperties = {
  position: "absolute",
  left: 12,
  top: "50%",
  transform: "translateY(-50%)",
  color: "#8b7762",
  display: "flex",
  alignItems: "center",
  pointerEvents: "none",
};

const searchInput: React.CSSProperties = {
  flex: 1,
  width: "100%",
  padding: "12px 12px 12px 40px",
  borderRadius: 10,
  border: "1px solid rgba(44,43,40,0.1)",
  background: "#fff",
  fontSize: 14,
  color: "#2c2b28",
  boxShadow: "inset 0 1px 0 rgba(0,0,0,0.02)",
  transition: "all 0.2s",
};

const selectInput: React.CSSProperties = {
  padding: 12,
  borderRadius: 10,
  border: "1px solid rgba(44,43,40,0.1)",
  background: "#fff",
  fontSize: 14,
  color: "#2c2b28",
  cursor: "pointer",
  fontWeight: 600,
  minWidth: 130,
};

const resetButton: React.CSSProperties = {
  padding: "12px 16px",
  borderRadius: 10,
  border: "1px solid rgba(44,43,40,0.12)",
  background: "#fff",
  fontWeight: 600,
  fontSize: 14,
  color: "#2c2b28",
  cursor: "pointer",
  transition: "all 0.2s",
  display: "flex",
  alignItems: "center",
  gap: 6,
};