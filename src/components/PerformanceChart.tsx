import { TrendingUp } from "lucide-react";
import { useEthUsdPrice, formatWeiToUSD, weiToUsdNumber } from "~/utils/currency";

interface PerformanceDataPoint {
  date: Date;
  balance: string;
  type: string;
  vaultSymbol: string;
}

interface PerformanceChartProps {
  data: PerformanceDataPoint[];
}

export function PerformanceChart({ data }: PerformanceChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <TrendingUp className="mx-auto mb-2 h-12 w-12 text-gray-300" />
          <p className="text-sm text-gray-500">No performance data yet</p>
          <p className="text-xs text-gray-400">Make your first deposit to see your growth</p>
        </div>
      </div>
    );
  }

  const priceQuery = useEthUsdPrice();
  const toUSDNumber = (wei: string) => (priceQuery.data ? weiToUsdNumber(wei, priceQuery.data) : 0);
  const toUSD = (wei: string) => (priceQuery.data ? formatWeiToUSD(wei, priceQuery.data) : "...");

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Chart dimensions
  const width = 800;
  const height = 300;
  const padding = { top: 20, right: 20, bottom: 40, left: 60 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Calculate scales
  const minBalance = 0;
  const maxBalance = Math.max(...data.map(d => toUSDNumber(d.balance)));
  const balanceRange = maxBalance - minBalance;

  const firstPoint = data[0]!;
  const lastPointData = data[data.length - 1]!;
  const minTime = firstPoint.date.getTime();
  const maxTime = lastPointData.date.getTime();
  const timeRange = maxTime - minTime;

  // Scale functions
  const scaleX = (date: Date) => {
    if (timeRange === 0) return padding.left;
    return padding.left + ((date.getTime() - minTime) / timeRange) * chartWidth;
  };

  const scaleY = (balance: string) => {
    const value = toUSDNumber(balance);
    if (balanceRange === 0) return height - padding.bottom - chartHeight / 2;
    return height - padding.bottom - ((value - minBalance) / balanceRange) * chartHeight;
  };

  // Generate path for line and area
  const points = data.map(d => ({
    x: scaleX(d.date),
    y: scaleY(d.balance),
  }));

  const linePath = points.map((p, i) => 
    `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
  ).join(' ');

  const lastPoint = points[points.length - 1]!;
  const areaPath = `${linePath} L ${lastPoint.x} ${height - padding.bottom} L ${padding.left} ${height - padding.bottom} Z`;

  // Generate y-axis labels
  const yAxisSteps = 5;
  const yAxisLabels = Array.from({ length: yAxisSteps + 1 }, (_, i) => {
    const value = minBalance + (balanceRange * i / yAxisSteps);
    return {
      value: value.toFixed(2),
      y: height - padding.bottom - (chartHeight * i / yAxisSteps),
    };
  });

  return (
    <div className="overflow-x-auto rounded-2xl bg-white p-6 shadow-lg">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Investment Performance</h3>
            <p className="text-sm text-gray-600">Your cumulative balance over time</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Current Balance</p>
          <p className="text-2xl font-bold text-gray-900">
            ${data.length > 0 ? toUSD(lastPointData.balance) : "0.00"}
          </p>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        style={{ maxWidth: '100%', height: 'auto' }}
      >
        {/* Grid lines */}
        {yAxisLabels.map((label, i) => (
          <line
            key={i}
            x1={padding.left}
            y1={label.y}
            x2={width - padding.right}
            y2={label.y}
            stroke="#e5e7eb"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
        ))}

        {/* Area fill */}
        <defs>
          <linearGradient id="areaGradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#818cf8" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d={areaPath}
          fill="url(#areaGradient)"
        />

        {/* Line */}
        <path
          d={linePath}
          fill="none"
          stroke="#6366f1"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {points.map((point, i) => (
          <circle
            key={i}
            cx={point.x}
            cy={point.y}
            r="4"
            fill="#6366f1"
            stroke="white"
            strokeWidth="2"
          />
        ))}

        {/* Y-axis labels */}
        {yAxisLabels.map((label, i) => (
          <text
            key={i}
            x={padding.left - 10}
            y={label.y}
            textAnchor="end"
            alignmentBaseline="middle"
            className="text-xs fill-gray-600"
          >
            {label.value}
          </text>
        ))}

        {/* X-axis labels */}
        {data.filter((_, i) => i % Math.ceil(data.length / 6) === 0).map((d, i) => (
          <text
            key={i}
            x={scaleX(d.date)}
            y={height - padding.bottom + 20}
            textAnchor="middle"
            className="text-xs fill-gray-600"
          >
            {formatDate(d.date)}
          </text>
        ))}

        {/* Axis labels */}
        <text
          x={padding.left - 45}
          y={height / 2}
          textAnchor="middle"
          className="text-xs fill-gray-600 font-medium"
          transform={`rotate(-90 ${padding.left - 45} ${height / 2})`}
        >
          Balance (USD)
        </text>
      </svg>
    </div>
  );
}
