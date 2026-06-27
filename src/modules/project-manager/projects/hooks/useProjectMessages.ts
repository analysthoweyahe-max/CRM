import { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '../types/message.types';
import type { TeamMember }  from '../types/project.types';

const ME = { name: 'أحمد المنصور', initial: 'أ', color: 'bg-indigo-600' };

function seed(team: TeamMember[]): ChatMessage[] {
  const [a, b] = team;
  const msgs: ChatMessage[] = [
    {
      id: '1', isOwn: true,
      senderName: ME.name, senderInitial: ME.initial, senderColor: ME.color,
      text: 'صباح الخير فريق، اجتماع المتابعة الساعة 11.',
      time: '09:10', isRead: true,
    },
  ];
  if (a) msgs.push({
    id: '2', isOwn: false,
    senderName: a.name, senderInitial: a.initial, senderColor: a.color,
    text: 'تمام، التصاميم شبه جاهزة.',
    time: '09:15', isRead: true,
  });
  if (b) msgs.push({
    id: '3', isOwn: false,
    senderName: b.name, senderInitial: b.initial, senderColor: b.color,
    text: 'أعمل على دمج الواجهات الآن.',
    time: '09:30', isRead: true,
  });
  return msgs;
}

export function useProjectMessages(team: TeamMember[]) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => seed(team));
  const [text,     setText]     = useState('');
  const [search,   setSearch]   = useState('');
  const bottomRef               = useRef<HTMLDivElement>(null);
  const idRef                   = useRef(10);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const filtered = search.trim()
    ? messages.filter(m => m.text.includes(search.trim()))
    : messages;

  function send() {
    const trimmed = text.trim();
    if (!trimmed) return;
    const now = new Date();
    const hh  = String(now.getHours()).padStart(2, '0');
    const mm  = String(now.getMinutes()).padStart(2, '0');
    setMessages(prev => [...prev, {
      id: String(idRef.current++),
      isOwn: true,
      senderName:    ME.name,
      senderInitial: ME.initial,
      senderColor:   ME.color,
      text:    trimmed,
      time:    `${hh}:${mm}`,
      isRead:  false,
    }]);
    setText('');
  }

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  }

  return { filtered, text, setText, search, setSearch, send, handleKey, bottomRef };
}
