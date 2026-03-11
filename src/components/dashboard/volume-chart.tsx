'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

const volumeData = [
  { month: 'Sep', volume: 18200 },
  { month: 'Oct', volume: 24800 },
  { month: 'Nov', volume: 31500 },
  { month: 'Dec', volume: 28700 },
  { month: 'Jan', volume: 35200 },
  { month: 'Feb', volume: 42100 },
  { month: 'Mar', volume: 53550 },
];

export default function VolumeChart() {
  return (
    <div className="lg:col-span-2 glass-card rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">Payment Volume</h3>
          <p className="text-sm text-slate-400">Monthly payment trends</p>
        </div>
        <div className="flex items-center gap-1 text-emerald-400 text-sm font-medium">
          <TrendingUp size={16} />
          +27%
        </div>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={volumeData}>
          <defs>
            <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
          <YAxis stroke="#64748b" fontSize={12} tickFormatter={( v ) => `$${v / 1000}k`} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '12px',
              color: '#e2e8f0',
            }}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={( value: any ) => [formatCurrency( Number( value ) ), 'Volume']}
          />
          <Area
            type="monotone"
            dataKey="volume"
            stroke="#6366f1"
            strokeWidth={2.5}
            fill="url(#volumeGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
