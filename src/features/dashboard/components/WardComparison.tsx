import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function WardComparison({ data }: { data: any[] }) {
  return (
    <div className="bg-bg-surface p-6 rounded-xl border border-border flex flex-col min-h-[300px]">
      <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-6">Ward Comparison</h3>
      
      {data.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-text-tertiary text-sm">No data available</div>
      ) : (
        <div className="flex-1 h-full min-h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 0, right: 0, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" horizontal={false} />
              <XAxis type="number" stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="ward" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} width={100} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#F9FAFB' }}
                cursor={{ fill: '#1F2937' }}
              />
              <Bar dataKey="open" name="Open Issues" fill="#F59E0B" radius={[0, 4, 4, 0]} barSize={12} />
              <Bar dataKey="resolved" name="Resolved Issues" fill="#10B981" radius={[0, 4, 4, 0]} barSize={12} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
