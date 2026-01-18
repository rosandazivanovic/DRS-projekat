type Props = {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
};

export function SearchBar({ value, onChange, placeholder }: Props) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder ?? "Pretraga po nazivu kursa ili profesoru…"}
      style={{ padding: 10, width: "100%", borderRadius: 10, border: "1px solid #ddd" }}
    />
  );
}
