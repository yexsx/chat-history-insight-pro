
import React, { useState, useMemo } from 'react';
import { ChatData } from '../types';
import { ICONS } from '../constants';
import { getAvatarColor } from '../utils';
import { useTheme } from '../contexts/ThemeContext';

interface SidebarProps {
  data: ChatData[];
  selectedId: string | null;
  onSelect: (username: string) => void;
  onClearData?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ data, selectedId, onSelect, onClearData }) => {
  const { theme, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) {
      return data;
    }
    const query = searchQuery.toLowerCase().trim();
    return data.filter(item => 
      item.contact.nickname.toLowerCase().includes(query) ||
      item.contact.username.toLowerCase().includes(query)
    );
  }, [data, searchQuery]);

  return (
    <aside className="w-72 md:w-80 border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex flex-col h-full overflow-hidden">
      <div className="p-3 md:p-4 border-b border-slate-100 dark:border-slate-700">
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <h1 className="text-lg md:text-xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <ICONS.MessageCircle />
            <span className="hidden sm:inline">聊天洞察</span>
            <span className="sm:hidden">洞察</span>
          </h1>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 transition-colors"
            title={theme === 'light' ? '切换到暗色模式' : '切换到亮色模式'}
          >
            {theme === 'light' ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/>
                <line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            )}
          </button>
        </div>
        <div className="mt-3 md:mt-4 relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
            <ICONS.Search />
          </span>
          <input
            type="text"
            placeholder="搜索联系人..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 md:pl-10 pr-3 md:pr-4 py-1.5 md:py-2 bg-slate-100 dark:bg-slate-700 border-none rounded-lg text-xs md:text-sm focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all outline-none text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500"
          />
        </div>
        {onClearData && (
          <button
            onClick={onClearData}
            className="mt-2 md:mt-3 w-full px-3 md:px-4 py-1.5 md:py-2 text-[10px] md:text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
          >
            <span className="hidden sm:inline">清除数据并重新输入</span>
            <span className="sm:hidden">清除数据</span>
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="px-2 py-3 md:py-4">
          <h2 className="px-3 md:px-4 text-[10px] md:text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
            联系人与群组 ({filteredData.length}{searchQuery && ` / ${data.length}`})
          </h2>
          {filteredData.length > 0 ? (
            filteredData.map((item) => {
            const isActive = selectedId === item.contact.username;
            const hasRecords = item.chat_records.length > 0;
            
            return (
              <button
                key={item.contact.username}
                onClick={() => onSelect(item.contact.username)}
                className={`w-full flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 rounded-xl transition-all mb-1 text-left ${
                  isActive 
                    ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' 
                    : 'hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                <div className={`w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center text-white font-bold shrink-0 text-sm md:text-base ${getAvatarColor(item.contact.nickname)}`}>
                  {item.contact.nickname[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center gap-2">
                    <span className="font-semibold truncate text-sm md:text-base">
                      {item.contact.nickname}
                    </span>
                    {item.contact.type === 'group' && (
                      <span className="text-[9px] md:text-[10px] px-1 md:px-1.5 py-0.5 bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300 rounded uppercase font-bold shrink-0">
                        G
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] md:text-xs truncate opacity-70 dark:opacity-80">
                    {hasRecords 
                      ? `${item.chat_records.length} 条匹配`
                      : '暂无记录'}
                  </p>
                </div>
              </button>
            );
            })
          ) : (
            <div className="px-4 py-8 text-center">
              <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center text-slate-300 dark:text-slate-500 mx-auto mb-3">
                <ICONS.Search />
              </div>
              <p className="text-sm text-slate-400 dark:text-slate-500">
                {searchQuery ? '未找到匹配的联系人' : '暂无联系人'}
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
