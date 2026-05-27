/**
 * BMI DATA DASHBOARD - REACT COMPONENT
 * 
 * Usage:
 * 1. Place in: pages/dashboard.tsx (or app/dashboard/page.tsx for App Router)
 * 2. npm install recharts date-fns
 * 3. The API automatically connects to /api/bmi-dashboard
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface DataRecord {
  id: string;
  brand: string;
  platform: string;
  author: string;
  content: string;
  sentiment: 'Positiv' | 'Neutral' | 'Negativ';
  sentimentScore: number;
  url: string;
  date: string;
  rating: string;
  dataQuality: {
    confidenceScore: number;
    isVerified: boolean;
  };
}

interface DashboardData {
  success: boolean;
  timestamp: string;
  data: {
    total: number;
    returned: number;
    records: DataRecord[];
  };
  statistics: {
    byBrand: Record<string, number>;
    bySentiment: Record<string, number>;
    byPlatform: Record<string, number>;
    averageConfidence: number;
  };
}

const SENTIMENT_COLORS = {
  Positiv: '#10B981',
  Neutral: '#6B7280',
  Negativ: '#EF4444',
};

const PLATFORM_COLORS = {
  'Google Maps': '#4285F4',
  'Forum/Web': '#FF9900',
  'YouTube': '#FF0000',
};

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    brand: '',
    platform: '',
    sentiment: '',
    dateFrom: '',
    dateTo: '',
  });

  // Fetch data with filters
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        if (filters.brand) params.append('brand', filters.brand);
        if (filters.platform) params.append('platform', filters.platform);
        if (filters.sentiment) params.append('sentiment', filters.sentiment);
        if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
        if (filters.dateTo) params.append('dateTo', filters.dateTo);

        const response = await fetch(`/api/bmi-dashboard?${params}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
          throw new Error(`API Error: ${response.statusText}`);
        }

        const json = (await response.json()) as DashboardData;
        setData(json);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters]);

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4 mx-auto"></div>
          Loading Dashboard...
        </div>
      </div>
    );

  if (error || !data)
    return (
      <div className="flex items-center justify-center h-screen bg-red-50">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Error</h2>
          <p className="text-gray-700">{error || 'No data available'}</p>
        </div>
      </div>
    );

  const sentimentData = Object.entries(data.statistics.bySentiment).map(([key, value]) => ({
    name: key,
    value,
    color: SENTIMENT_COLORS[key as keyof typeof SENTIMENT_COLORS],
  }));

  const brandData = Object.entries(data.statistics.byBrand).map(([brand, count]) => ({
    brand,
    count,
  }));

  const platformData = Object.entries(data.statistics.byPlatform).map(([platform, count]) => ({
    platform,
    count,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">📊 BMI Data Dashboard</h1>
        <p className="text-slate-400">
          Last updated: {new Date(data.timestamp).toLocaleString('de-DE')}
        </p>
        <p className="text-slate-400">
          Data Quality Score: {data.statistics.averageConfidence.toFixed(1)}%
        </p>
      </div>

      {/* Filters */}
      <div className="bg-slate-800 rounded-lg shadow-xl p-6 mb-8 border border-slate-700">
        <h2 className="text-lg font-semibold text-white mb-4">🔍 Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Brand</label>
            <select
              value={filters.brand}
              onChange={(e) => setFilters({ ...filters, brand: e.target.value })}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Brands</option>
              {Object.keys(data.statistics.byBrand).map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Platform</label>
            <select
              value={filters.platform}
              onChange={(e) => setFilters({ ...filters, platform: e.target.value })}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Platforms</option>
              {Object.keys(data.statistics.byPlatform).map((platform) => (
                <option key={platform} value={platform}>
                  {platform}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Sentiment</label>
            <select
              value={filters.sentiment}
              onChange={(e) => setFilters({ ...filters, sentiment: e.target.value })}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Sentiments</option>
              <option value="Positiv">Positiv</option>
              <option value="Neutral">Neutral</option>
              <option value="Negativ">Negativ</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">From</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">To</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg shadow-xl p-6 border border-blue-500">
          <div className="text-blue-200 text-sm font-medium">Total Records</div>
          <div className="text-4xl font-bold text-white mt-2">{data.data.total}</div>
        </div>

        <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-lg shadow-xl p-6 border border-green-500">
          <div className="text-green-200 text-sm font-medium">Positive Sentiment</div>
          <div className="text-4xl font-bold text-white mt-2">
            {data.statistics.bySentiment.Positiv || 0}
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-600 to-yellow-700 rounded-lg shadow-xl p-6 border border-yellow-500">
          <div className="text-yellow-200 text-sm font-medium">Neutral</div>
          <div className="text-4xl font-bold text-white mt-2">
            {data.statistics.bySentiment.Neutral || 0}
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-lg shadow-xl p-6 border border-red-500">
          <div className="text-red-200 text-sm font-medium">Negative Sentiment</div>
          <div className="text-4xl font-bold text-white mt-2">
            {data.statistics.bySentiment.Negativ || 0}
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Sentiment Distribution */}
        <div className="bg-slate-800 rounded-lg shadow-xl p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">📈 Sentiment Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={sentimentData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {sentimentData.map((entry) => (
                  <Cell key={`cell-${entry.name}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* By Brand */}
        <div className="bg-slate-800 rounded-lg shadow-xl p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">🏭 By Brand</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={brandData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis dataKey="brand" stroke="#94A3B8" />
              <YAxis stroke="#94A3B8" />
              <Tooltip contentStyle={{ backgroundColor: '#1E293B', border: 'none', borderRadius: '8px', color: '#FFF' }} />
              <Bar dataKey="count" fill="#3B82F6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* By Platform */}
        <div className="bg-slate-800 rounded-lg shadow-xl p-6 border border-slate-700 lg:col-span-2">
          <h3 className="text-lg font-semibold text-white mb-4">🌐 By Platform</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={platformData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis dataKey="platform" stroke="#94A3B8" />
              <YAxis stroke="#94A3B8" />
              <Tooltip contentStyle={{ backgroundColor: '#1E293B', border: 'none', borderRadius: '8px', color: '#FFF' }} />
              <Bar dataKey="count" fill="#8B5CF6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Records Table */}
      <div className="bg-slate-800 rounded-lg shadow-xl overflow-hidden border border-slate-700">
        <div className="p-6 border-b border-slate-700">
          <h3 className="text-lg font-semibold text-white">
            📋 Recent Records ({data.data.returned} of {data.data.total})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-700 text-slate-200">
              <tr>
                <th className="px-6 py-3 text-left">Date</th>
                <th className="px-6 py-3 text-left">Brand</th>
                <th className="px-6 py-3 text-left">Platform</th>
                <th className="px-6 py-3 text-left">Sentiment</th>
                <th className="px-6 py-3 text-left">Content</th>
                <th className="px-6 py-3 text-left">Confidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {data.data.records.map((record) => (
                <tr key={record.id} className="hover:bg-slate-700 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-slate-300">{record.date}</td>
                  <td className="px-6 py-4 font-medium text-white">{record.brand}</td>
                  <td className="px-6 py-4 text-slate-300">{record.platform}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${{
                        Positiv: 'bg-green-900 text-green-200',
                        Neutral: 'bg-gray-900 text-gray-200',
                        Negativ: 'bg-red-900 text-red-200',
                      }[record.sentiment]}`}
                    >
                      {record.sentiment}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-300 max-w-xs truncate">{record.content}</td>
                  <td className="px-6 py-4 text-slate-300">
                    {record.dataQuality.confidenceScore.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
