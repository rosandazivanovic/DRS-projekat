const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/>
    <path d="m21 21-4.35-4.35"/>
  </svg>
);

type Props = {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
};

export function SearchBar({ value, onChange, placeholder }: Props) {
  return (
    <div style={searchContainer}>
      <span style={searchIconWrapper}>
        <SearchIcon />
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? "Pretraga po nazivu kursa ili profesoru…"}
        style={searchInput}
      />
    </div>
  );
}

/* ----------------- Styles ----------------- */
const searchContainer: React.CSSProperties = {
  position: "relative",
  width: "100%",
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
  padding: "12px 12px 12px 40px",
  width: "100%",
  borderRadius: 12,
  border: "1px solid rgba(44,43,40,0.1)",
  fontSize: 14,
  background: "#fff",
  color: "#2c2b28",
  boxShadow: "inset 0 1px 0 rgba(0,0,0,0.02)",
  transition: "all 0.2s",
};