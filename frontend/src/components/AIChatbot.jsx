import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';

const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hi! I'm your Campus Guardian AI. How are you feeling today?", sender: 'ai' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input.trim();
    setMessages(prev => [...prev, { text: userMsg, sender: 'user' }]);
    setInput('');
    setIsTyping(true);

    try {
      const { data } = await api.post('/api/chat/message', { message: userMsg });
      
      // Simulate slight delay for natural feel
      setTimeout(() => {
        setMessages(prev => [...prev, { text: data.reply, sender: 'ai', sentiment: data.sentiment }]);
        setIsTyping(false);
      }, 1000);
      
    } catch (error) {
      setIsTyping(false);
      setMessages(prev => [...prev, { text: "Sorry, I'm having trouble connecting to my neural network right now.", sender: 'ai' }]);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="bg-white w-80 sm:w-96 rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col mb-4"
            style={{ height: '500px', maxHeight: '70vh' }}
          >
            {/* Header */}
            <div className="bg-primary text-white p-4 flex justify-between items-center">
              <div>
                <h3 className="font-bold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                  Wellness Assistant
                </h3>
                <p className="text-xs text-primary-100 opacity-80">AI-Powered Support</p>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white hover:text-gray-200 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((msg, index) => (
                <motion.div 
                  initial={{ opacity: 0, x: msg.sender === 'user' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={index} 
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    msg.sender === 'user' 
                      ? 'bg-secondary text-white rounded-tr-sm' 
                      : 'bg-white border border-gray-200 text-gray-800 shadow-sm rounded-tl-sm'
                  }`}>
                    {msg.text}
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100 flex gap-2">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..." 
                className="flex-1 py-2 px-4 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-shadow"
              />
              <button 
                type="submit"
                disabled={!input.trim()}
                className="bg-primary text-white p-2 rounded-full w-10 h-10 flex items-center justify-center hover:bg-opacity-90 disabled:opacity-50 transition-colors"
              >
                <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      {!isOpen && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="bg-primary text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center hover:bg-opacity-90 transition-colors relative"
        >
          <span className="absolute top-0 right-0 w-4 h-4 bg-alert rounded-full border-2 border-white animate-pulse"></span>
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
        </motion.button>
      )}
    </div>
  );
};

export default AIChatbot;
