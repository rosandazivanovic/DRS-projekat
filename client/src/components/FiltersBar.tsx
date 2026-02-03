import { useEffect, useState } from "react";

export default function FiltersBar({ onChange }: { onChange: (q: { search?: string; sort?: string }) => void }) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"new" | "old">("new");

  useEffect(() => {
    const t = setTimeout(() => onChange({ search: search.trim(), sort }), 250);
    return () => clearTimeout(t);
  }, [search, sort, onChange]);

  return (
    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Pretraga po nazivu, profesoru ili opisu..."
        style={{ flex: 1, padding: 10, borderRadius: 10, border: "1px solid rgba(44,43,40,0.06)", background: "#fff" }}
      />
      <select value={sort} onChange={(e) => setSort(e.target.value as any)} style={{ padding: 10, borderRadius: 10, border: "1px solid rgba(44,43,40,0.06)", background: "#fff" }}>
        <option value="new">Najnovije</option>
        <option value="old">Najstarije</option>
      </select>
      <button onClick={() => { setSearch(""); setSort("new"); }} style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid rgba(44,43,40,0.06)", background: "#fff" }}>Reset</button>
    </div>
  );
}
