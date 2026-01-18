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
      style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd", width: "100%" }}
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
