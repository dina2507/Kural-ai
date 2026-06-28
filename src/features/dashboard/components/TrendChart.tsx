import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function TrendChart({ data }: { data: any[] }) {
  return (
    <div className="bg-bg-surface p-6 rounded-xl border border-border h-full flex flex-col">
      <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-6">Weekly Trend</h3>
      
      {data.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-text-tertiary text-sm">No data available</div>
      ) : (
        <div className="flex-1 min-h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorReported" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
              <XAxis dataKey="week" stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#F9FAFB' }}
                itemStyle={{ color: '#F9FAFB' }}
              />
              <Area type="monotone" dataKey="reported" name="Reported" stroke="#4F46E5" strokeWidth={2} fillOpacity={1} fill="url(#colorReported)" />
              <Area type="monotone" dataKey="resolved" name="Resolved" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorResolved)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
