import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { APP_CONFIG } from '../../../lib/config';

export function CategoryChart({ data }: { data: { category: string, count: number }[] }) {
  const COLORS = ['#4F46E5', '#F59E0B', '#10B981', '#EF4444', '#8B5CF6', '#EC4899'];

  return (
    <div className="bg-bg-surface p-6 rounded-xl border border-border h-full flex flex-col">
      <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-4">Issues by Category</h3>
      
      {data.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-text-tertiary text-sm">No data available</div>
      ) : (
        <div className="flex-1 min-h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="count"
                nameKey="category"
                isAnimationActive={true}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                 contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#F9FAFB' }}
                 itemStyle={{ color: '#F9FAFB' }}
                 formatter={(value: number) => [value, 'Issues']}
                 labelFormatter={(label) => String(label).replace('_', ' ')}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-2 mt-4 max-h-[100px] overflow-y-auto">
         {data.map((entry, index) => (
            <div key={entry.category} className="flex items-center gap-2 text-xs">
               <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
               <span className="text-text-secondary truncate">{entry.category.replace('_', ' ')}</span>
               <span className="ml-auto font-mono text-text-primary">{entry.count}</span>
            </div>
         ))}
      </div>
    </div>
  );
}
