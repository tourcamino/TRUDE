interface SparklineProps {
  values: number[];
  width?: number;
  height?: number;
  className?: string;
}

export function Sparkline({ values, width = 120, height = 32, className }: SparklineProps) {
  if (!values || values.length === 0) {
    return <div className={className ?? "h-8 w-32"} />;
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const stepX = width / (values.length - 1 || 1);
  const points = values.map((v, i) => {
    const x = i * stepX;
    const y = height - ((v - min) / range) * height;
    return `${x},${y}`;
  });

  const path = `M ${points[0]} L ${points.slice(1).join(" ")}`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className={className}>
      <path d={path} fill="none" stroke="#6366f1" strokeWidth={2} strokeLinecap="round" />
    </svg>
  );
}