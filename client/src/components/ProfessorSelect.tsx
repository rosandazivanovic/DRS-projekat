type Professor = { id: number; name: string };

type Props = {
  professors: Professor[];
  value: string;
  onChange: (v: string) => void;
};

export function ProfessorSelect({ professors, value, onChange }: Props) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={selectStyle}
    >
      <option value="">Svi profesori</option>
      {professors.map((p) => (
        <option key={p.id} value={p.id}>
          {p.name}
        </option>
      ))}
    </select>
  );
}

/* ----------------- Styles ----------------- */
const selectStyle: React.CSSProperties = {
  padding: 12,
  borderRadius: 12,
  border: "1px solid rgba(44,43,40,0.1)",
  width: "100%",
  fontSize: 14,
  background: "#fff",
  color: "#2c2b28",
  cursor: "pointer",
  fontWeight: 600,
  boxShadow: "inset 0 1px 0 rgba(0,0,0,0.02)",
  transition: "all 0.2s",
};