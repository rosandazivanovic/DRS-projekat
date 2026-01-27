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
      style={{
        padding: 12,
        borderRadius: 12,
        border: "1px solid rgba(44,43,40,0.06)",
        width: "100%",
        fontSize: 14,
        background: "#fff",
        color: "#2c2b28",
      }}
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
