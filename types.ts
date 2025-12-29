
export interface Contact {
  username: string;
  nickname: string;
  type: 'friend' | 'group';
  type_code: number;
}

export interface ContextRecord {
  local_id: number;
  message_content: string;
  real_sender_id: number;
  create_time: number;
}

export interface ChatRecord {
  local_id: number;
  message_content: string;
  real_sender_id: number;
  create_time: number;
  matched_phrases: string[];
  context_front_records: ContextRecord[];
  context_last_records: ContextRecord[];
}

export interface ChatData {
  contact: Contact;
  chat_records: ChatRecord[];
}
