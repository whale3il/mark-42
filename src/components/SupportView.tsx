import React, { useState } from 'react';
import {
  Headphones,
  Send,
  Phone,
  Mail,
  Calendar,
  Building,
  CheckCircle2,
  Clock,
  Sparkles
} from 'lucide-react';
import { USER_PROFILE } from '../data/mockData';

export const SupportView: React.FC = () => {
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'advisor'; text: string; time: string }>>([
    {
      sender: 'advisor',
      text: 'Good morning, Mr. Wright. Marcus Sterling here. Your $25,000 disbursement to Axiom Neural cleared seamlessly this morning. How may my desk assist your portfolio today?',
      time: '09:12'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [callScheduled, setCallScheduled] = useState(false);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg = {
      sender: 'user' as const,
      text: inputText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // Simulate smart banking advisor response
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'advisor',
          text: `Understood, Mr. Wright. I have logged your instructions with our private treasury desk at 540 Madison Ave. We will ensure this is prioritized immediately and furnish full confirmation documentation.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }, 1400);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-neutral-100 font-sans">
          Private Wealth Concierge & Advisory Desk
        </h1>
        <p className="text-xs text-neutral-400 mt-0.5">
          Direct private line to your Senior Managing Director and treasury execution desk
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Real-time Concierge Messaging Interface */}
        <div className="lg:col-span-2 rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6 flex flex-col h-[520px]">
          {/* Partner status header */}
          <div className="flex items-center justify-between pb-4 border-b border-neutral-800/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center font-bold text-xs text-neutral-200">
                MS
              </div>
              <div>
                <div className="text-xs font-semibold text-neutral-100 flex items-center gap-2">
                  <span>{USER_PROFILE.relationshipManager.name}</span>
                  <span className="flex h-2 w-2 rounded-full bg-emerald-400" />
                </div>
                <div className="text-[11px] text-neutral-400">
                  {USER_PROFILE.relationshipManager.title} · Aureus Private Banking NY
                </div>
              </div>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              Live Encrypted Line
            </span>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto py-4 space-y-3">
            {messages.map((m, idx) => {
              const isMe = m.sender === 'user';
              return (
                <div
                  key={idx}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                      isMe
                        ? 'bg-emerald-500 text-neutral-950 font-medium'
                        : 'bg-neutral-950 border border-neutral-800 text-neutral-200'
                    }`}
                  >
                    {m.text}
                  </div>
                  <span className="mt-1 text-[10px] font-mono text-neutral-500 px-1">
                    {m.time}
                  </span>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex items-center gap-1.5 text-neutral-500 text-xs py-2 px-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] font-mono">Marcus Sterling is typing...</span>
              </div>
            )}
          </div>

          {/* Message Input Box */}
          <form onSubmit={handleSendMessage} className="pt-3 border-t border-neutral-800/80 flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Inquire regarding wires, foreign currency lines, or private placements..."
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-neutral-700"
            />
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-emerald-500 text-neutral-950 text-xs font-semibold hover:bg-emerald-400 transition-colors flex items-center gap-1.5"
            >
              <span>Transmit</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* Right Col: Private Banker Contact Card & Priority Calendar */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl border border-neutral-800 bg-neutral-900/50 space-y-4">
            <div className="text-xs font-semibold text-neutral-200">Direct Contact Coordinates</div>
            
            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-neutral-950/70 border border-neutral-800">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <div className="text-[10px] text-neutral-500 font-mono">Direct Dedicated Line</div>
                  <div className="font-mono text-neutral-200">{USER_PROFILE.relationshipManager.phone}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-neutral-950/70 border border-neutral-800">
                <Mail className="w-4 h-4 text-cyan-400 shrink-0" />
                <div>
                  <div className="text-[10px] text-neutral-500 font-mono">Confidential Email</div>
                  <div className="font-mono text-neutral-200 truncate">{USER_PROFILE.relationshipManager.email}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-neutral-950/70 border border-neutral-800">
                <Building className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <div className="text-[10px] text-neutral-500 font-mono">Managing Office</div>
                  <div className="text-neutral-200">{USER_PROFILE.relationshipManager.office}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl border border-neutral-800 bg-neutral-900/50 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-neutral-200">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span>Schedule Portfolio Strategy Briefing</span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Book a 30-minute private quarterly audit session covering liquid yields and syndicate distributions.
            </p>

            {callScheduled ? (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Briefing confirmed for Tomorrow at 14:00 EST.</span>
              </div>
            ) : (
              <button
                onClick={() => setCallScheduled(true)}
                className="w-full py-2.5 rounded-xl bg-neutral-850 hover:bg-neutral-800 text-neutral-200 text-xs font-medium transition-colors border border-neutral-750"
              >
                Request Briefing Call
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
