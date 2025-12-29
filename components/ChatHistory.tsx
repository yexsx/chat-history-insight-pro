
import React from 'react';
import { ChatRecord, ContextRecord } from '../types';
import { formatTimestamp, getAvatarColor } from '../utils';
import { ICONS } from '../constants';

interface ChatHistoryProps {
  record: ChatRecord;
}

const MessageItem: React.FC<{ 
  msg: ContextRecord | ChatRecord; 
  isMatch?: boolean;
}> = ({ msg, isMatch }) => {
  // Simple logic to guess sender name if possible from content
  const contentParts = msg.message_content.split(':');
  const hasSenderPrefix = contentParts.length > 1 && contentParts[0].length < 15;
  const senderName = hasSenderPrefix ? contentParts[0] : (msg.real_sender_id === 1 ? '我' : `用户 ${msg.real_sender_id}`);
  const displayContent = hasSenderPrefix ? contentParts.slice(1).join(':') : msg.message_content;

  return (
    <div className={`flex gap-2 md:gap-3 mb-4 md:mb-6 ${isMatch ? 'scale-[1.01] md:scale-[1.02] transform' : ''}`}>
      <div className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-[10px] md:text-xs text-white shrink-0 mt-1 ${getAvatarColor(senderName)}`}>
        {senderName[0]}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 md:gap-2 mb-1 flex-wrap">
          <span className="text-xs md:text-sm font-bold text-slate-700 dark:text-slate-200">{senderName}</span>
          <span className="text-[9px] md:text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
            <ICONS.Clock />
            {formatTimestamp(msg.create_time)}
          </span>
        </div>
        <div className={`p-2.5 md:p-3 rounded-xl md:rounded-2xl relative ${
          isMatch 
            ? 'bg-indigo-600 dark:bg-indigo-700 text-white shadow-lg ring-4 ring-indigo-100 dark:ring-indigo-900' 
            : 'bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200'
        }`}>
          <p className="text-xs md:text-sm whitespace-pre-wrap leading-relaxed">
            {displayContent}
          </p>
          {isMatch && 'matched_phrases' in msg && (
            <div className="mt-1.5 md:mt-2 flex flex-wrap gap-1">
              {(msg as ChatRecord).matched_phrases.map((phrase, idx) => (
                <span key={idx} className="bg-white/20 text-[9px] md:text-[10px] px-1 md:px-1.5 py-0.5 rounded flex items-center gap-0.5 md:gap-1">
                  <ICONS.Tag />
                  {phrase}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const ChatHistory: React.FC<ChatHistoryProps> = ({ record }) => {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-slate-50/50 dark:bg-slate-900/50 rounded-xl md:rounded-2xl p-4 md:p-6 pb-6 md:pb-8 border border-slate-100 dark:border-slate-700">
        <div className="space-y-2 mb-6 md:mb-8 text-center">
          <div className="inline-block px-2 md:px-3 py-0.5 md:py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-[9px] md:text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            Context Preview (ID: {record.local_id})
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
        {/* Front Context */}
        {record.context_front_records.map((msg) => (
          <MessageItem key={msg.local_id} msg={msg} />
        ))}

        {/* The Matched Message */}
        <div className="relative my-6 md:my-10">
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t border-dashed border-indigo-300 dark:border-indigo-700"></div>
          <div className="relative flex justify-center">
            <span className="bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 px-3 md:px-4 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-tighter">
              Matched Content
            </span>
          </div>
        </div>
        
        <MessageItem msg={record} isMatch />

        <div className="relative my-6 md:my-10">
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t border-dashed border-slate-200 dark:border-slate-600"></div>
          <div className="relative flex justify-center">
            <span className="bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-400 px-3 md:px-4 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-tighter">
              Following Context
            </span>
          </div>
        </div>

        {/* Last Context */}
        {record.context_last_records.map((msg) => (
          <MessageItem key={msg.local_id} msg={msg} />
        ))}
        </div>
      </div>
    </div>
  );
};
