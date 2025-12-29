
import React, { useState, useMemo, useEffect } from 'react';
import { ICONS } from './constants';
import { Sidebar } from './components/Sidebar';
import { ChatHistory } from './components/ChatHistory';
import { KeywordStats } from './components/KeywordStats';
import { DataInput } from './components/DataInput';
import { ThemeProvider } from './contexts/ThemeContext';
import { ChatData, ChatRecord } from './types';
import { formatTimestamp, formatMonthDay, getYear } from './utils';

type ViewMode = 'records' | 'stats';

const AppContent: React.FC = () => {
  const [chatData, setChatData] = useState<ChatData[]>([]);
  const [hasData, setHasData] = useState<boolean>(false);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [selectedRecordId, setSelectedRecordId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('records');

  useEffect(() => {
    // 从 localStorage 加载数据
    const savedData = localStorage.getItem('chatData');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setChatData(parsed);
        setHasData(true);
        if (parsed.length > 0) {
          setSelectedContactId(parsed[0].contact.username);
        }
      } catch (err) {
        console.error('加载数据失败:', err);
      }
    }
  }, []);

  const handleDataSubmit = (data: ChatData[]) => {
    setChatData(data);
    setHasData(true);
    if (data.length > 0) {
      setSelectedContactId(data[0].contact.username);
    }
  };

  const selectedChatData = useMemo(() => {
    return chatData.find(d => d.contact.username === selectedContactId) || null;
  }, [chatData, selectedContactId]);

  const activeRecord = useMemo(() => {
    if (!selectedChatData || selectedRecordId === null) return null;
    return selectedChatData.chat_records.find(r => r.local_id === selectedRecordId) || null;
  }, [selectedChatData, selectedRecordId]);

  const groupedRecords = useMemo(() => {
    if (!selectedChatData) return [];
    const groups: { [year: number]: ChatRecord[] } = {};
    selectedChatData.chat_records.forEach(record => {
      const year = getYear(record.create_time);
      if (!groups[year]) {
        groups[year] = [];
      }
      groups[year].push(record);
    });
    // 按年份降序排序（最新的年份在前）
    return Object.entries(groups)
      .sort(([a], [b]) => Number(b) - Number(a))
      .map(([year, records]) => ({
        year: Number(year),
        records: records.sort((a, b) => b.create_time - a.create_time) // 按时间降序
      }));
  }, [selectedChatData]);

  const handleContactSelect = (id: string) => {
    setSelectedContactId(id);
    setSelectedRecordId(null); // Reset record on contact change
  };

  const handleClearData = () => {
    if (confirm('确定要清除所有数据吗？这将删除本地存储的数据。')) {
      localStorage.removeItem('chatData');
      setChatData([]);
      setHasData(false);
      setSelectedContactId(null);
      setSelectedRecordId(null);
    }
  };

  if (!hasData) {
    return <DataInput onDataSubmit={handleDataSubmit} />;
  }

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-900 overflow-hidden">
      <Sidebar 
        data={chatData} 
        selectedId={selectedContactId} 
        onSelect={handleContactSelect}
        onClearData={handleClearData}
      />

      <main className="flex-1 flex flex-col overflow-hidden">
        {selectedChatData ? (
          <>
            <header className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-8 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 flex items-center justify-center font-bold">
                  {selectedChatData.contact.nickname[0]}
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-none">
                    {selectedChatData.contact.nickname}
                  </h2>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-tight">
                    {selectedChatData.contact.type === 'group' ? 'Group Chat' : 'Direct Messages'} • ID: {selectedChatData.contact.username}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('records')}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      viewMode === 'records'
                        ? 'bg-white dark:bg-slate-600 text-indigo-600 dark:text-indigo-300 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    聊天记录
                  </button>
                  <button
                    onClick={() => setViewMode('stats')}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      viewMode === 'stats'
                        ? 'bg-white dark:bg-slate-600 text-indigo-600 dark:text-indigo-300 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    统计图表
                  </button>
                </div>
              </div>
            </header>

            {viewMode === 'records' ? (
              <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                {/* Record List */}
                <div className="w-full md:w-80 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden shrink-0">
                  <div className="p-4 border-b border-slate-50 dark:border-slate-700">
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">关键词匹配项</span>
                  </div>
                  <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                    {selectedChatData.chat_records.length > 0 ? (
                      groupedRecords.map((group) => (
                        <div key={group.year} className="mb-4">
                          <div className="px-4 py-2 mb-2 sticky top-0 bg-white dark:bg-slate-800 z-10">
                            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                              {group.year} 年
                            </h3>
                          </div>
                          {group.records.map((record) => (
                            <button
                              key={record.local_id}
                              onClick={() => setSelectedRecordId(record.local_id)}
                              className={`w-full p-4 mb-2 rounded-xl text-left transition-all border ${
                                selectedRecordId === record.local_id
                                  ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-100 dark:border-indigo-800 shadow-sm ring-1 ring-indigo-200 dark:ring-indigo-800'
                                  : 'hover:bg-slate-50 dark:hover:bg-slate-700 border-transparent text-slate-600 dark:text-slate-300'
                              }`}
                            >
                              <p className="text-sm font-medium line-clamp-2 mb-2 leading-relaxed">
                                {record.message_content}
                              </p>
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
                                  <ICONS.Clock />
                                  {formatMonthDay(record.create_time)}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="flex flex-wrap gap-1">
                                  {record.matched_phrases.map((p, i) => (
                                    <span key={i} className="px-1.5 py-0.5 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold rounded">
                                      {p}
                                    </span>
                                  ))}
                                </div>
                                <span className="text-[10px] text-slate-400 dark:text-slate-500">#{record.local_id}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-center p-6">
                        <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center text-slate-300 dark:text-slate-500 mb-3">
                          <ICONS.Clock />
                        </div>
                        <p className="text-sm text-slate-400 dark:text-slate-500">此联系人暂无关键词匹配记录</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Detail View */}
                <div className="flex-1 bg-white dark:bg-slate-800 overflow-y-auto custom-scrollbar p-4 md:p-8">
                  {activeRecord ? (
                    <ChatHistory record={activeRecord} />
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                      <div className="w-20 h-20 bg-slate-50 dark:bg-slate-700 rounded-full flex items-center justify-center mb-6">
                        <ICONS.User />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">请选择一个对话记录</h3>
                      <p className="text-sm max-w-xs text-center mt-2">
                        从左侧列表中点击任意匹配的消息，即可查看其完整的上下文信息。
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-hidden">
                <KeywordStats data={selectedChatData} />
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900">
            <div className="p-12 bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700 text-center max-w-md">
              <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <ICONS.MessageCircle />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">欢迎使用聊天洞察</h2>
              <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
                这是一个结构化的聊天记录查看器。您可以根据联系人过滤对话，并通过预定义的关键词快速定位重要内容。
              </p>
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-800 text-left">
                <h4 className="text-sm font-bold text-amber-800 dark:text-amber-300 mb-1 flex items-center gap-2">
                  💡 使用提示
                </h4>
                <p className="text-xs text-amber-700 dark:text-amber-400 leading-normal">
                  左侧边栏展示了所有联系人。带有数字角标的联系人包含系统提取的关键词匹配项。
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
};

export default App;
