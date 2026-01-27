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
      style={{
        padding: 12,
        width: "100%",
        borderRadius: 12,
        border: "1px solid rgba(44,43,40,0.06)",
        fontSize: 14,
        background: "#fff",
        color: "#2c2b28",
        boxShadow: "inset 0 1px 0 rgba(0,0,0,0.02)",
      }}
    />
  );
}
