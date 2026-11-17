interface BadgeProps {
  label: string;
  color?: 'green' | 'red' | 'yellow' | 'blue' | 'gray';
}

const COLORS = {
  green: '#4ec9b0', red: '#f14c4c', yellow: '#cca700', blue: '#4ea1ff', gray: '#888',
};

export function Badge({ label, color = 'gray' }: BadgeProps) {
  return (
    <span style={{
      display: 'inline-block',
      padding: '1px 7px',
      borderRadius: 10,
      fontSize: 10,
      fontWeight: 600,
      border: `1px solid ${COLORS[color]}`,
      color: COLORS[color],
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    }}>
      {label}
    </span>
  );
}
