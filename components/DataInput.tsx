import React, { useState } from 'react';
import { ChatData } from '../types';
import { ICONS, RAW_DATA } from '../constants';

interface DataInputProps {
  onDataSubmit: (data: ChatData[]) => void;
}

export const DataInput: React.FC<DataInputProps> = ({ onDataSubmit }) => {
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    try {
      const parsed = JSON.parse(inputValue);
      
      // 验证数据格式
      if (!Array.isArray(parsed)) {
        throw new Error('数据必须是数组格式');
      }

      // 基本验证
      parsed.forEach((item, index) => {
        if (!item.contact || !item.chat_records) {
          throw new Error(`第 ${index + 1} 项数据格式不正确：缺少 contact 或 chat_records`);
        }
        if (!item.contact.username || !item.contact.nickname) {
          throw new Error(`第 ${index + 1} 项数据格式不正确：contact 缺少必要字段`);
        }
      });

      // 保存到 localStorage
      localStorage.setItem('chatData', JSON.stringify(parsed));
      onDataSubmit(parsed);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '数据格式错误，请检查 JSON 格式');
    }
  };

  const handleLoadExample = () => {
    // 加载示例数据（使用 constants.tsx 中的 RAW_DATA）
    setInputValue(JSON.stringify(RAW_DATA, null, 2));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="bg-indigo-600 dark:bg-indigo-700 px-8 py-6 border-b border-indigo-700 dark:border-indigo-800">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <ICONS.MessageCircle />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">聊天洞察 Pro</h1>
              <p className="text-indigo-100 text-sm mt-1">请输入您的聊天数据</p>
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                数据输入（JSON 格式）
              </label>
              <button
                onClick={handleLoadExample}
                className="text-xs px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              >
                加载示例
              </button>
            </div>
            <textarea
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                setError(null);
              }}
              placeholder='请输入 JSON 格式的聊天数据，例如：\n[\n  {\n    "contact": {\n      "username": "user123",\n      "nickname": "用户名",\n      "type": "friend",\n      "type_code": 1\n    },\n    "chat_records": []\n  }\n]'
              className="w-full h-96 p-4 border-2 border-slate-200 dark:border-slate-700 rounded-xl font-mono text-sm bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900 outline-none resize-none transition-all"
            />
            {error && (
              <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                  <span className="font-bold">⚠️</span>
                  {error}
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleSubmit}
              disabled={!inputValue.trim()}
              className="flex-1 px-6 py-3 bg-indigo-600 dark:bg-indigo-500 text-white rounded-xl font-semibold hover:bg-indigo-700 dark:hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg hover:shadow-xl"
            >
              提交数据
            </button>
          </div>

          <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
            <h4 className="text-sm font-bold text-amber-800 dark:text-amber-300 mb-2 flex items-center gap-2">
              💡 使用提示
            </h4>
            <ul className="text-xs text-amber-700 dark:text-amber-400 space-y-1 list-disc list-inside">
              <li>数据格式必须符合 ChatData[] 类型定义</li>
              <li>每个联系人都需要包含 contact 和 chat_records 字段</li>
              <li>数据会自动保存到本地存储，下次打开时会自动加载</li>
              <li>可以点击"加载示例"查看数据格式示例</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

