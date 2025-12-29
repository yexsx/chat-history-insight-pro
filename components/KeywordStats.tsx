
import React, { useMemo, useState } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { ChatData } from '../types';
import { getYear } from '../utils';
import { ICONS } from '../constants';

interface KeywordStatsProps {
  data: ChatData | null;
}

type TimeDimension = 'day' | 'week' | 'month';
interface TimeSeriesData {
  date: string;
  [keyword: string]: string | number;
}

const COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b',
  '#10b981', '#3b82f6', '#ef4444', '#14b8a6',
  '#f97316', '#a855f7'
];

export const KeywordStats: React.FC<KeywordStatsProps> = ({ data }) => {
  const [timeDimension, setTimeDimension] = useState<TimeDimension>('month');
  const [viewType, setViewType] = useState<'trend' | 'distribution'>('trend');

  // 统计所有关键词及其出现次数
  const keywordCounts = useMemo(() => {
    if (!data) return [];
    
    const counts: { [key: string]: number } = {};
    data.chat_records.forEach(record => {
      record.matched_phrases.forEach(phrase => {
        counts[phrase] = (counts[phrase] || 0) + 1;
      });
    });

    return Object.entries(counts)
      .map(([keyword, count]) => ({ keyword, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // 只显示前10个
  }, [data]);

  // 按时间维度统计关键词趋势
  const timeSeriesData = useMemo(() => {
    if (!data) return [];

    const timeMap: { [key: string]: { [keyword: string]: number } } = {};
    const allKeywords = new Set<string>();

    data.chat_records.forEach(record => {
      const date = new Date(record.create_time * 1000);
      let timeKey: string;

      if (timeDimension === 'day') {
        timeKey = date.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' });
      } else if (timeDimension === 'week') {
        const weekStart = new Date(date);
        const dayOfWeek = date.getDay();
        weekStart.setDate(date.getDate() - dayOfWeek);
        const year = weekStart.getFullYear();
        const firstDayOfYear = new Date(year, 0, 1);
        const daysDiff = Math.floor((weekStart.getTime() - firstDayOfYear.getTime()) / (24 * 60 * 60 * 1000));
        const weekNumber = Math.ceil((daysDiff + firstDayOfYear.getDay() + 1) / 7);
        timeKey = `${year}年第${weekNumber}周`;
      } else {
        timeKey = date.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit' });
      }

      if (!timeMap[timeKey]) {
        timeMap[timeKey] = {};
      }

      record.matched_phrases.forEach(phrase => {
        allKeywords.add(phrase);
        timeMap[timeKey][phrase] = (timeMap[timeKey][phrase] || 0) + 1;
      });
    });

    // 获取前5个最频繁的关键词
    const topKeywords = keywordCounts.slice(0, 5).map(k => k.keyword);

    // 构建时间序列数据
    const sortedTimeKeys = Object.keys(timeMap).sort();
    return sortedTimeKeys.map(timeKey => {
      const item: TimeSeriesData = { date: timeKey };
      topKeywords.forEach(keyword => {
        item[keyword] = timeMap[timeKey][keyword] || 0;
      });
      return item;
    });
  }, [data, timeDimension, keywordCounts]);

  // 按年份统计关键词分布
  const yearlyDistribution = useMemo(() => {
    if (!data) return [];

    const yearMap: { [year: number]: { [keyword: string]: number } } = {};
    
    data.chat_records.forEach(record => {
      const year = getYear(record.create_time);
      if (!yearMap[year]) {
        yearMap[year] = {};
      }
      record.matched_phrases.forEach(phrase => {
        yearMap[year][phrase] = (yearMap[year][phrase] || 0) + 1;
      });
    });

    const topKeywords = keywordCounts.slice(0, 5).map(k => k.keyword);
    return Object.entries(yearMap)
      .sort(([a], [b]) => Number(b) - Number(a))
      .map(([year, keywords]) => {
        const item: { year: string; [key: string]: string | number } = { year: `${year}年` };
        topKeywords.forEach(keyword => {
          item[keyword] = keywords[keyword] || 0;
        });
        return item;
      });
  }, [data, keywordCounts]);

  if (!data || data.chat_records.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
        <div className="w-20 h-20 bg-slate-50 dark:bg-slate-700 rounded-full flex items-center justify-center mb-6">
          <ICONS.BarChart />
        </div>
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">暂无统计数据</h3>
        <p className="text-sm max-w-xs text-center mt-2">
          该联系人暂无关键词匹配记录，无法生成统计图表。
        </p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto custom-scrollbar p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
        {/* 标题和控制栏 */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 md:mb-6 gap-3">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-200 mb-1">
              关键词统计
            </h2>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">
              {data.contact.nickname} • 共 {data.chat_records.length} 条匹配记录
            </p>
          </div>
        </div>

        {/* 视图切换 */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-4 mb-4 md:mb-6">
          <div className="flex items-center gap-1 md:gap-2 bg-slate-100 dark:bg-slate-700 rounded-lg p-0.5 md:p-1">
            <button
              onClick={() => setViewType('trend')}
              className={`px-3 md:px-4 py-1.5 md:py-2 rounded-md text-xs md:text-sm font-medium transition-colors ${
                viewType === 'trend'
                  ? 'bg-white dark:bg-slate-600 text-indigo-600 dark:text-indigo-300 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              趋势分析
            </button>
            <button
              onClick={() => setViewType('distribution')}
              className={`px-3 md:px-4 py-1.5 md:py-2 rounded-md text-xs md:text-sm font-medium transition-colors ${
                viewType === 'distribution'
                  ? 'bg-white dark:bg-slate-600 text-indigo-600 dark:text-indigo-300 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              分布统计
            </button>
          </div>

          {viewType === 'trend' && (
            <div className="flex items-center gap-1 md:gap-2 bg-slate-100 dark:bg-slate-700 rounded-lg p-0.5 md:p-1">
              <button
                onClick={() => setTimeDimension('day')}
                className={`px-2 md:px-3 py-1 md:py-1.5 rounded-md text-[10px] md:text-xs font-medium transition-colors ${
                  timeDimension === 'day'
                    ? 'bg-white dark:bg-slate-600 text-indigo-600 dark:text-indigo-300 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                按日
              </button>
              <button
                onClick={() => setTimeDimension('week')}
                className={`px-2 md:px-3 py-1 md:py-1.5 rounded-md text-[10px] md:text-xs font-medium transition-colors ${
                  timeDimension === 'week'
                    ? 'bg-white dark:bg-slate-600 text-indigo-600 dark:text-indigo-300 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                按周
              </button>
              <button
                onClick={() => setTimeDimension('month')}
                className={`px-2 md:px-3 py-1 md:py-1.5 rounded-md text-[10px] md:text-xs font-medium transition-colors ${
                  timeDimension === 'month'
                    ? 'bg-white dark:bg-slate-600 text-indigo-600 dark:text-indigo-300 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                按月
              </button>
            </div>
          )}
        </div>

        {/* 关键词频率排行榜 */}
        <div className="bg-white dark:bg-slate-800 rounded-xl md:rounded-2xl p-4 md:p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
          <h3 className="text-base md:text-lg font-bold text-slate-800 dark:text-slate-200 mb-3 md:mb-4 flex items-center gap-2">
            <ICONS.Tag />
            关键词频率 Top 10
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            {keywordCounts.map((item, index) => (
              <div
                key={item.keyword}
                className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                  COLORS[index % COLORS.length]
                }`}>
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {item.keyword}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    出现 {item.count} 次
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                    {item.count}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 趋势图表 */}
        {viewType === 'trend' && timeSeriesData.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-xl md:rounded-2xl p-4 md:p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
            <h3 className="text-base md:text-lg font-bold text-slate-800 dark:text-slate-200 mb-3 md:mb-4 flex items-center gap-2">
              <ICONS.LineChart />
              关键词趋势分析
            </h3>
            <ResponsiveContainer width="100%" height={300} className="md:h-[400px]">
              <LineChart data={timeSeriesData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-700" />
                <XAxis
                  dataKey="date"
                  stroke="#64748b"
                  className="dark:stroke-slate-400"
                  tick={{ fill: '#64748b' }}
                />
                <YAxis
                  stroke="#64748b"
                  className="dark:stroke-slate-400"
                  tick={{ fill: '#64748b' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                {keywordCounts.slice(0, 5).map((item, index) => (
                  <Line
                    key={item.keyword}
                    type="monotone"
                    dataKey={item.keyword}
                    stroke={COLORS[index % COLORS.length]}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* 分布统计 */}
        {viewType === 'distribution' && (
          <>
            {/* 柱状图 - 按年份分布 */}
            {yearlyDistribution.length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-xl md:rounded-2xl p-4 md:p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                <h3 className="text-base md:text-lg font-bold text-slate-800 dark:text-slate-200 mb-3 md:mb-4 flex items-center gap-2">
                  <ICONS.BarChart />
                  按年份分布
                </h3>
                <ResponsiveContainer width="100%" height={300} className="md:h-[400px]">
                  <BarChart data={yearlyDistribution} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-700" />
                    <XAxis
                      dataKey="year"
                      stroke="#64748b"
                      className="dark:stroke-slate-400"
                      tick={{ fill: '#64748b' }}
                    />
                    <YAxis
                      stroke="#64748b"
                      className="dark:stroke-slate-400"
                      tick={{ fill: '#64748b' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    {keywordCounts.slice(0, 5).map((item, index) => (
                      <Bar
                        key={item.keyword}
                        dataKey={item.keyword}
                        fill={COLORS[index % COLORS.length]}
                        radius={[4, 4, 0, 0]}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* 饼图 - 关键词占比 */}
            {keywordCounts.length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-xl md:rounded-2xl p-4 md:p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                <h3 className="text-base md:text-lg font-bold text-slate-800 dark:text-slate-200 mb-3 md:mb-4 flex items-center gap-2">
                  <ICONS.PieChart />
                  关键词占比分布
                </h3>
                <ResponsiveContainer width="100%" height={300} className="md:h-[400px]">
                  <PieChart>
                    <Pie
                      data={keywordCounts.slice(0, 8)}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ keyword, percent }) => `${keyword}: ${(percent * 100).toFixed(1)}%`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {keywordCounts.slice(0, 8).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

