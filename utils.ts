
export const formatTimestamp = (ts: number): string => {
  const date = new Date(ts * 1000);
  return date.toLocaleString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatMonthDay = (ts: number): string => {
  const date = new Date(ts * 1000);
  return date.toLocaleString('zh-CN', {
    month: 'numeric',
    day: 'numeric',
  });
};

export const getYear = (ts: number): number => {
  return new Date(ts * 1000).getFullYear();
};

export const getAvatarColor = (name: string): string => {
  const colors = [
    'bg-blue-500', 'bg-green-500', 'bg-purple-500', 
    'bg-pink-500', 'bg-yellow-500', 'bg-indigo-500', 'bg-red-500'
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};
