// src/components/FreeAIChat.jsx
import React, { useState, useRef, useEffect } from 'react';
import { 
  FaUser, 
  FaRobot, 
  FaSpinner,
  FaTrash,
  FaCopy,
  FaCheck,
  FaBolt,
  FaRegSmile,
  FaRegLightbulb,
  FaRocket,
  FaBrain,
  FaMagic,
  FaArrowRight
} from 'react-icons/fa';
import { BsStars, BsRobot } from 'react-icons/bs';
import { MdOutlineAutoAwesome, MdOutlineSmartToy } from 'react-icons/md';
import { AiOutlineSend, AiOutlineRobot } from 'react-icons/ai';
import { TbBrandOpenai } from 'react-icons/tb';
import axios from 'axios';

// ─── GROQ API CONFIG ───
const GROQ_API_KEY = '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';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

// ─── SUGGESTIONS ───
const SUGGESTIONS = [
  { icon: <FaRegLightbulb className="text-yellow-500" />, text: 'What is Timely Health?' },
  { icon: <FaRocket className="text-blue-500" />, text: 'How does attendance tracking work?' },
  { icon: <FaRegSmile className="text-green-500" />, text: 'Benefits of QR check-in system' },
  { icon: <FaBrain className="text-purple-500" />, text: 'Explain employee management' },
  { icon: <FaMagic className="text-pink-500" />, text: 'What features does HRMS have?' },
  { icon: <BsStars className="text-indigo-500" />, text: 'How to mark attendance?' },
];

// ─── GET CURRENT DATE/TIME ───
const getCurrentDateTime = () => {
  const now = new Date();
  const options = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short'
  };
  return now.toLocaleString('en-US', options);
};

const getCurrentDate = () => {
  const now = new Date();
  const options = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric'
  };
  return now.toLocaleString('en-US', options);
};

const FreeAIChat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // ─── SEND MESSAGE TO GROQ ───
  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setError('');
    setIsTyping(true);

    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);
    setMessages(prev => [...prev, { role: 'assistant', content: '...', loading: true }]);

    try {
      // ✅ Get current date/time
      const currentDate = getCurrentDate();
      const currentDateTime = getCurrentDateTime();

      const response = await axios.post(
        GROQ_API_URL,
        {
          model: GROQ_MODEL,
          messages: [
            { 
              role: 'system', 
              content: `You are a helpful, friendly, and knowledgeable AI assistant for Timely Health HRMS. 
              Provide clear, concise, and accurate responses. 
              
              IMPORTANT: Today's date is ${currentDate}. 
              Current date and time is ${currentDateTime}.
              
              If someone asks for the current date, time, or day, ALWAYS use this information: ${currentDate}.
              Be conversational and helpful. If you don't know something, say so honestly.
              You can answer questions about Timely Health, HRMS, attendance, employee management, and general topics.`
            },
            ...messages.map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: userMessage }
          ],
          temperature: 0.7,
          max_tokens: 2048,
        },
        {
          headers: {
            'Authorization': `Bearer ${GROQ_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const aiResponse = response.data?.choices?.[0]?.message?.content || 'No response generated.';

      setMessages(prev => prev.filter(msg => !msg.loading));
      setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);

    } catch (err) {
      console.error('❌ Error:', err);
      setMessages(prev => prev.filter(msg => !msg.loading));

      let errorMessage = 'Something went wrong. Please try again.';
      if (err.response?.data?.error?.message) {
        errorMessage = err.response.data.error.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `❌ ${errorMessage}` 
      }]);

    } finally {
      setLoading(false);
      setIsTyping(false);
    }
  };

  // ─── CLEAR CHAT ───
  const clearChat = () => {
    if (messages.length === 0) return;
    if (window.confirm('Clear all messages?')) {
      setMessages([]);
      setError('');
    }
  };

  // ─── COPY TO CLIPBOARD ───
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ─── HANDLE ENTER KEY ───
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // ─── HANDLE SUGGESTION CLICK ───
  const handleSuggestionClick = (text) => {
    setInput(text);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  // ─── FORMAT RESPONSE ───
  const formatResponse = (text) => {
    if (text === '...') return text;
    let formatted = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br />');
    return formatted;
  };

  // ─── RENDER ───
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/80 via-30% to-purple-50/60 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/80 backdrop-blur-2xl rounded-3xl shadow-2xl shadow-indigo-500/10 border border-white/70 overflow-hidden hover:shadow-3xl hover:shadow-indigo-500/20 transition-all duration-500">
          
          {/* ─── HEADER ─── */}
          <div className="relative p-5 border-b border-gray-100/80 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-pink-500/5 overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-400/10 to-purple-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-blue-400/10 to-cyan-400/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
            
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl blur-xl opacity-40 animate-pulse"></div>
                  <div className="relative w-14 h-14 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-500/30">
                    <TbBrandOpenai className="w-8 h-8 text-white" />
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
                  </div>
                </div>
                <div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Ingrain AI
                  </h2>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-500 flex items-center gap-1">
                      <FaBolt className="text-yellow-500 text-[8px]" />
                      Powered by Groq
                    </span>
                    <span className="text-[8px] text-gray-300">•</span>
                    <span className="text-[8px] text-emerald-600 font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                      Online
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {messages.length > 0 && (
                  <button
                    onClick={clearChat}
                    className="p-2.5 rounded-xl hover:bg-red-50 text-red-400 hover:text-red-600 transition-all duration-200 group"
                    title="Clear Chat"
                  >
                    <FaTrash className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ─── MESSAGES ─── */}
          <div className="h-[480px] overflow-y-auto p-5 space-y-4 bg-gradient-to-b from-transparent via-gray-50/20 to-gray-50/40">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full blur-2xl"></div>
                  <div className="relative w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center border-4 border-white shadow-xl">
                    <MdOutlineSmartToy className="w-14 h-14 text-indigo-500" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Hello! 👋</h3>
                <p className="text-sm text-gray-500 max-w-sm mb-6">
                  Ask me anything about Timely Health HRMS, attendance tracking, or any other topic!
                </p>
                
                {/* ─── SUGGESTIONS ─── */}
                <div className="flex flex-wrap gap-2 justify-center max-w-lg">
                  {SUGGESTIONS.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion.text)}
                      className="group px-4 py-2 text-xs bg-white/70 backdrop-blur-sm hover:bg-white border border-gray-200/50 hover:border-indigo-300 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-2 hover:scale-[1.02]"
                    >
                      <span className="text-base">{suggestion.icon}</span>
                      <span className="text-gray-700 group-hover:text-indigo-700 transition-colors">
                        {suggestion.text.length > 30 ? suggestion.text.substring(0, 30) + '...' : suggestion.text}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-3 ${
                    msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                  } animate-slide-up`}
                >
                  {/* ─── AVATAR ─── */}
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-indigo-500/25'
                        : 'bg-gradient-to-br from-emerald-500 to-green-500 shadow-emerald-500/25'
                    }`}
                  >
                    {msg.role === 'user' ? (
                      <FaUser className="w-4 h-4 text-white" />
                    ) : msg.loading ? (
                      <FaSpinner className="w-4 h-4 text-white animate-spin" />
                    ) : (
                      <AiOutlineRobot className="w-5 h-5 text-white" />
                    )}
                  </div>

                  {/* ─── MESSAGE BUBBLE ─── */}
                  <div
                    className={`max-w-[78%] px-4 py-3 rounded-2xl ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/20'
                        : 'bg-white/90 backdrop-blur-sm border border-gray-100 text-gray-800 shadow-md'
                    } ${msg.loading ? 'opacity-80' : ''}`}
                  >
                    {msg.loading ? (
                      <div className="flex items-center gap-2 min-w-[70px]">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
                          <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></span>
                          <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></span>
                        </div>
                        <span className="text-sm text-gray-500">Thinking...</span>
                      </div>
                    ) : (
                      <>
                        <div
                          className={`text-sm leading-relaxed whitespace-pre-wrap ${
                            msg.role === 'user' ? 'text-white' : 'text-gray-800'
                          }`}
                          dangerouslySetInnerHTML={{
                            __html: formatResponse(msg.content)
                          }}
                        />
                        {msg.role === 'assistant' && !msg.loading && (
                          <button
                            onClick={() => copyToClipboard(msg.content)}
                            className="mt-2 text-xs text-gray-400 hover:text-indigo-600 transition-colors flex items-center gap-1.5 group"
                          >
                            {copied ? (
                              <>
                                <FaCheck className="w-3 h-3 text-green-500" />
                                <span className="text-green-500">Copied!</span>
                              </>
                            ) : (
                              <>
                                <FaCopy className="w-3 h-3 group-hover:scale-110 transition-transform" />
                                <span className="group-hover:text-indigo-600 transition-colors">Copy</span>
                              </>
                            )}
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
            {error && (
              <div className="p-3 bg-red-50/90 backdrop-blur-sm rounded-xl border border-red-200 text-red-600 text-sm flex items-center gap-2 animate-slide-up">
                <span className="text-lg">⚠️</span>
                {error}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* ─── INPUT ─── */}
          <div className="p-4 border-t border-gray-100/80 bg-white/50 backdrop-blur-sm">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask Ingrain AI..."
                  className="w-full px-5 py-3.5 pr-12 text-sm border border-gray-200/80 rounded-2xl focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all bg-white/80 placeholder-gray-400"
                  disabled={loading}
                />
                {loading && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <FaSpinner className="w-4 h-4 text-indigo-500 animate-spin" />
                  </div>
                )}
              </div>
              <button
                onClick={sendMessage}
                disabled={!input.trim() || loading}
                className="px-6 py-3.5 rounded-2xl text-sm font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white shadow-lg shadow-indigo-500/25 transition-all duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-95 group"
              >
                {loading ? (
                  <FaSpinner className="w-4 h-4 animate-spin" />
                ) : (
                  <MdOutlineSmartToy className="w-5 h-5 group-hover:scale-110 transition-transform" />
                )}
                <span className="hidden sm:inline font-semibold">Ask AI</span>
              </button>
            </div>
            <div className="flex items-center justify-between mt-2 px-1">
              <p className="text-[8px] text-gray-400 flex items-center gap-1">
                <FaBolt className="text-yellow-400 text-[8px]" />
                Groq • Llama 3.3 • 70B
              </p>
              <p className="text-[8px] text-gray-400 flex items-center gap-1">
                <span className="w-1 h-1 bg-emerald-400 rounded-full"></span>
                {isTyping ? 'Typing...' : 'Ready'}
              </p>
            </div>
          </div>
        </div>

        {/* ─── FOOTER ─── */}
        <div className="text-center mt-4">
          <p className="text-[8px] text-gray-300 font-medium flex items-center justify-center gap-1">
            <MdOutlineSmartToy className="w-3 h-3 text-indigo-400" />
            Ingrain AI • Powered by Groq
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(12px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-slide-up {
          animation: slide-up 0.35s ease-out;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.95); }
        }
        .animate-pulse {
          animation: pulse 2s ease-in-out infinite;
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        .animate-bounce {
          animation: bounce 0.6s ease-in-out infinite;
        }
        code {
          background: rgba(0,0,0,0.06);
          padding: 2px 8px;
          border-radius: 6px;
          font-family: 'Courier New', monospace;
          font-size: 0.9em;
        }
        .text-white code {
          background: rgba(255,255,255,0.15);
        }
      `}</style>
    </div>
  );
};

export default FreeAIChat;