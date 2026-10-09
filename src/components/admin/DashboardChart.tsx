'use client';

import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, CartesianGrid, Dot } from 'recharts';

interface DashboardChartProps {
  data: { month: string; value: number }[];
  maxValue: number;
}

export function DashboardChart({ data, maxValue }: DashboardChartProps) {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1b1b1f] border border-[#262629] p-3 rounded-lg shadow-xl text-sm">
          <p className="text-[#99907c] mb-1">{payload[0].payload.month}</p>
          <p className="text-[#e4e1e7] font-semibold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#D4AF37]"></span>
            {payload[0].value} Inscripciones
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomizedDot = (props: any) => {
    const { cx, cy, value } = props;
    if (value === maxValue && maxValue > 0) {
      return (
        <g>
          <circle cx={cx} cy={cy} r={6} fill="#D4AF37" />
          <circle cx={cx} cy={cy} r={12} fill="#D4AF37" opacity={0.3} className="animate-pulse" />
        </g>
      );
    }
    return <circle cx={cx} cy={cy} r={4} fill="#17171a" stroke="#D4AF37" strokeWidth={2} />;
  };

  return (
    <div className="w-full h-[250px] mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="month" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#99907c', fontSize: 12, fontWeight: 500 }} 
            dy={10} 
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#262629', strokeWidth: 1, strokeDasharray: '4 4' }} />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#D4AF37"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorValue)"
            activeDot={{ r: 6, fill: '#D4AF37', stroke: '#17171a', strokeWidth: 2 }}
            dot={<CustomizedDot />}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
