import { useEffect, useState } from "react";

export default function FiltersBar({ onChange }: { onChange: (q: { search?: string; sort?: string }) => void }) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"new" | "old">("new");

  useEffect(() => {
    const t = setTimeout(() => onChange({ search: search.trim(), sort }), 250);
    return () => clearTimeout(t);
  }, [search, sort, onChange]);

  return (
    <div style={container}>
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Pretraga po nazivu, profesoru ili opisu..."
        style={searchInput}
      />
      
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

const searchInput: React.CSSProperties = {
  flex: 1,
  padding: 12,
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
};