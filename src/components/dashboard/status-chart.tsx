'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import type { Payment } from '@/lib/types';

const PIE_COLORS = ['#6366f1', '#3b82f6', '#f59e0b', '#10b981', '#ef4444'];

interface StatusChartProps {
  payments: Payment[];
}

export default function StatusChart( { payments }: StatusChartProps ) {
  const statusDistribution = [
    { name: 'Draft', value: payments.filter( ( p ) => p.status === 'draft' ).length },
    { name: 'Scheduled', value: payments.filter( ( p ) => p.status === 'scheduled' ).length },
    { name: 'Processing', value: payments.filter( ( p ) => p.status === 'processing' ).length },
    { name: 'Settled', value: payments.filter( ( p ) => p.status === 'settled' ).length },
    { name: 'Failed', value: payments.filter( ( p ) => p.status === 'failed' ).length },
  ].filter( ( d ) => d.value > 0 );

  return (
    <div className="glass-card rounded-2xl p-6">
      <h3 className="text-lg font-semibold text-white mb-2">Status Distribution</h3>
      <p className="text-sm text-slate-400 mb-4">Current payment statuses</p>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={statusDistribution}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={80}
            paddingAngle={4}
            dataKey="value"
          >
            {statusDistribution.map( ( _, index ) => (
              <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
            ) )}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '12px',
              color: '#e2e8f0',
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap gap-3 mt-2 justify-center">
        {statusDistribution.map( ( item, i ) => (
          <div key={item.name} className="flex items-center gap-1.5 text-xs text-slate-400">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
            />
            {item.name}
          </div>
        ) )}
      </div>
    </div>
  );
}
