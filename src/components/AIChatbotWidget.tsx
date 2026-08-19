import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, Loader2, Sparkles, SendHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BRAND_LOGO_SRC, BRAND_NAME } from '../constants/brandLogo';

export const AIChatbotWidget: React.FC = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; text: string }[]>([
    {
      role: 'assistant',
      text: '🙏 **Namaste! Main Vyapar Bridge AI Assistant hoon.**\n\nAap mujhse Vyapar Bridge App use karne, Profile banana, Post top par lane, Payment & Verification, aur India ke B2B Trade (Software, Hardware, Plastics, Leather, Textiles, FMCG, Ceramics, etc.) ke baare mein kuch bhi pooch sakte hain!'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  const quickPrompts = [
    "👤 Profile kaise banaye?",
    "📝 Post top par kaise laaye?",
    "📢 Post/Reel kaise dalein?",
    "💳 Payment & Verified Badge"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleLinkClick = (e: React.MouseEvent<HTMLDivElement>) => {
    let target = e.target as HTMLElement;
    while (target && target.tagName !== 'A') {
      if (target === e.currentTarget) break;
      target = target.parentElement as HTMLElement;
    }
    if (target && target.tagName === 'A') {
      const href = target.getAttribute('href');
      if (href) {
        e.preventDefault();
        if (href.startsWith('/')) {
          navigate(href);
          setIsOpen(false);
        } else {
          window.open(href, '_blank', 'noopener,noreferrer');
        }
      }
    }
  };

  // Comprehensive, intelligent Hindi/Hinglish/English AI Assistant Engine for Vyapar Bridge App Usage & Trade
  const generateCommerceAIResponse = (userQuery: string): string => {
    const raw = userQuery.toLowerCase().trim();
    const q = raw.replace(/[^\w\s]/gi, '');

    // 1. Greetings & Pleasantries
    if (
      q === 'hi' ||
      q === 'hello' ||
      q === 'hey' ||
      q === 'namaste' ||
      q === 'pranam' ||
      q === 'ram ram' ||
      q.includes('kaise ho') ||
      q.includes('kese ho') ||
      q.includes('how are you') ||
      q.includes('good morning') ||
      q.includes('good evening') ||
      q.includes('good afternoon')
    ) {
      return `🙏 **Namaste! Main Vyapar Bridge AI Assistant hoon.**\n\nAapko kis cheez me help chahiye?\n\n1. 👤 **Profile kaise banaye / Edit karein**\n2. 📢 **Post ya Reel kaise daalein**\n3. 🔝 **Post top par kaise laaye aur customers paayein**\n4. 💳 **Plan upgrade aur Blue Verified Badge kaise lein**\n5. 🏭 **Factory rates aur Direct Trade connects**\n\nBataiye, aapko kya samajhna hai?`;
    }

    // 2. Profile Creation & Setup Guide
    if (
      q.includes('profile') ||
      q.includes('account') ||
      q.includes('register') ||
      q.includes('sign up') ||
      q.includes('login') ||
      q.includes('gst') ||
      q.includes('company name') ||
      q.includes('logo') ||
      q.includes('catalogue')
    ) {
      return `👤 **Vyapar Bridge par Profile Setup Guide:**\n\n1. **Register / Login:** Top right par **Login/Register** button dabayein. Apna Phone Number, Password aur Role select karein:\n   - 🏭 **Company / Factory** (Manufacturers & Brands)\n   - 🏪 **Dealer / Distributor** (Wholesalers & Traders)\n   - 🛒 **Local Customer** (Buyers)\n2. **Business Details:** Profile page par jaakar **Edit Profile** par click karein:\n   - Apna **Company Name** aur Address dalein.\n   - **GST Number** add karein (GST Verified Badge ke liye).\n   - Apna **Brand Logo** aur **PDF Catalogue** upload karein.\n3. **Direct Contact:** Apna WhatsApp number dalein taaki buyers aapko direct Call/Message kar sakein!`;
    }

    // 3. How to Post & Upload Content (Text, Image, Video, PDF, Reel)
    if (
      q.includes('post') ||
      q.includes('upload') ||
      q.includes('reel') ||
      q.includes('video') ||
      q.includes('photo') ||
      q.includes('image') ||
      q.includes('pdf') ||
      q.includes('link') ||
      q.includes('hashtag') ||
      q.includes('tags')
    ) {
      return `📢 **Vyapar Bridge par Post aur Reel Kaise Daalein?**\n\n1. **New Post (Feed):**\n   - Top bar par **+ Post** button dabayein.\n   - Photo, Video, PDF Catalogue, ya **keval Business Text & Website Link** dalein.\n   - ✨ **AI Auto-Hashtags:** Auto-Tag button dabayein, Gemini AI aapke business ke hisab se best hashtags auto-generate kar dega!\n2. **Reels Publishing:**\n   - Bottom menu me **Reels** tab par jayein aur Publish Reel dabayein.\n   - Official Background Music / Sound select karein aur volume adjust karke publish karein!`;
    }

    // 4. How to Get Post on Top & Reach Maximum Customers
    if (
      q.includes('top') ||
      q.includes('viral') ||
      q.includes('rank') ||
      q.includes('views') ||
      q.includes('reach') ||
      q.includes('customer') ||
      q.includes('cstmr') ||
      q.includes('grahak') ||
      q.includes('sale') ||
      q.includes('lead') ||
      q.includes('feed me')
    ) {
      return `🚀 **Post ko Top Par Laane aur Customers Tak Pahunchane Ke 5 Tarike:**\n\n1. 💙 **Verified Blue Badge (Most Important):**\n   - Verified Members ki posts algorithm top par prioritize karta hai. Payment tab se Verified Badge active karein.\n2. 🏷️ **AI B2B Hashtags:**\n   - Post banate waqt **AI Auto-Hashtags** zaroor use karein (jaise #Software, #Hardware, #Tiles, #Wholesale, #Plastics).\n3. 🎥 **Video Reels Upload Karein:**\n   - Video Reels ko 3x zyada engagement milti hai. Apne products ki short video reels daalein.\n4. 📄 **PDF Catalogues Share Karein:**\n   - Complete product catalogue upload karein taaki dealers direct bulk query bhej sakein.\n5. 🔄 **Daily Active Posting:**\n   - Har din kam se kam 1-2 naye designs ya price updates post karein. Active profiles feed par sabse upar rehti hain!`;
    }

    // 5. Payment, Plan Upgrade & Verified Badge
    if (
      q.includes('payment') ||
      q.includes('pay') ||
      q.includes('badge') ||
      q.includes('verified') ||
      q.includes('utr') ||
      q.includes('plan') ||
      q.includes('subscription') ||
      q.includes('price') ||
      q.includes('rupee') ||
      q.includes('paisa')
    ) {
      return `💳 **Payment & Verified Blue Badge Guide:**\n\n1. Navigation Bar se **Payment / Verified Badge** tab par jayein.\n2. Apna Plan Chuniye:\n   - **Monthly Verified Plan:** ₹99 / month\n   - **Yearly Platinum Plan:** ₹1,188 / year\n3. Scanner / UPI QR par payment karein.\n4. Screen par 12-digit **UTR Transaction ID** enter karke Submit karein.\n5. Admin Console 24 hours me verify karke aapke profile par **Verified Blue Tick Badge** activate kar dega!`;
    }

    // 6. Direct Trade, Inquiries & Deals
    if (
      q.includes('dealer') ||
      q.includes('distributor') ||
      q.includes('wholesale') ||
      q.includes('buy') ||
      q.includes('khareed') ||
      q.includes('contact') ||
      q.includes('whatsapp') ||
      q.includes('phone')
    ) {
      return `🤝 **Vyapar Bridge Direct Trade & Business Connect:**\n\n1. **Direct Whatsapp & Call:** Feed me kisi bhi post par **WhatsApp** ya **Phone** icon click karke direct manufacturer/dealer se baat karein.\n2. **Members Directory:** All India verified manufacturers, software providers, hardware dealers, plastics, textiles suppliers ki list **Members** tab me dekhein.\n3. **Submit Requirement:** Bottom Requirement form se apni bulk demand post karein, suppliers khud aapko call karenge!`;
    }

    // 7. General Multi-Industry Trade Pricing & Rates
    if (
      q.includes('rate') ||
      q.includes('bhav') ||
      q.includes('kitne ka') ||
      q.includes('cost') ||
      q.includes('morbi') ||
      q.includes('factory') ||
      q.includes('tiles') ||
      q.includes('hardware') ||
      q.includes('software') ||
      q.includes('plastic') ||
      q.includes('leather')
    ) {
      return `🏭 **Vyapar Bridge Multi-Industry B2B Rate Index:**\n\n- 🧱 **Tiles & Ceramics (600x1200 GVT):** ₹22 - ₹36 / sq.ft\n- 🚽 **Sanitaryware One-Piece Closet:** ₹1,800 - ₹3,500 / pc\n- 💻 **B2B Billing & POS Software:** Factory Direct Custom Plans\n- 🔩 **Hardware & Power Tools:** Bulk Wholesale Factory Discount\n- 🧪 **Plastic & Polymers Raw Material:** Ex-Factory Bulk Quotes\n- 👞 **Leather & Footwear Goods:** Kanpur/Agra Wholesale Rates\n\nDirect factory rates ke liye **Members** tab se Verified Manufacturer se baat karein!`;
    }

    // 8. General Intelligent Fallback
    return `🤝 **Vyapar Bridge AI Support Assistant:**\n\nAapka sawal: *"${userQuery}"*\n\nMain aapki help kar sakta hoon:\n- 👤 **Profile kaise banayein aur setup karein**\n- 📢 **Post aur Video Reels kaise daalein**\n- 🔝 **Post top par kaise laayein aur customers paayein**\n- 💳 **Verified Badge aur Payment UTR kaise submit karein**\n- 🤝 **Direct Dealers aur Manufacturers se connect karein**\n\nBataiye aapko isme se kis cheez ki detail chahiye?`;
  };

  const handleSend = async (textToSend?: string) => {
    const userText = (textToSend || input).trim();
    if (!userText || isLoading) return;

    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text: userText }]);
    setIsLoading(true);

    try {
      const history = messages.map((m) => ({ role: m.role, text: m.text }));
      let responseReceived = false;

      // 1. Try server endpoint if backend is available
      try {
        const response = await fetch('/api/chatbot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: userText,
            history,
            userId: JSON.parse(localStorage.getItem('Vyapar Bridge_user') || '{}')?.id
          })
        });

        if (response.ok) {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            if (data.reply && !data.reply.includes('AI not configured') && !data.reply.includes('Limit Reached')) {
              setMessages((prev) => [...prev, { role: 'assistant', text: data.reply }]);
              responseReceived = true;
            }
          }
        }
      } catch (apiErr) {
        // Fall through to instant smart on-device engine
      }

      // 2. If server didn't provide a direct answer, use smart conversational AI engine
      if (!responseReceived) {
        await new Promise((res) => setTimeout(res, 400));
        const aiAnswer = generateCommerceAIResponse(userText);
        setMessages((prev) => [...prev, { role: 'assistant', text: aiAnswer }]);
      }
    } catch (error) {
      console.warn('AI chat handled with fallback:', error);
      const aiAnswer = generateCommerceAIResponse(userText);
      setMessages((prev) => [...prev, { role: 'assistant', text: aiAnswer }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      drag
      dragMomentum={false}
      onDragStart={() => {
        isDraggingRef.current = true;
      }}
      onDragEnd={() => {
        setTimeout(() => {
          isDraggingRef.current = false;
        }, 150);
      }}
      className="fixed bottom-6 right-4 z-[9999] flex flex-col items-end pointer-events-auto select-none"
    >
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="mb-4 w-[92vw] sm:w-96 bg-zinc-900 text-white rounded-2xl shadow-2xl border border-amber-500/40 overflow-hidden flex flex-col max-h-[520px]"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700 p-3.5 flex items-center justify-between text-white shadow-md">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 bg-black/40 rounded-full flex items-center justify-center border border-amber-300 p-0.5 shadow-inner">
                  <img
                    src={BRAND_LOGO_SRC}
                    alt="AI Logo"
                    className="w-full h-full object-cover rounded-full bg-white"
                  />
                </div>
                <div>
                  <h3 className="font-bold text-sm leading-tight flex items-center gap-1.5">
                    <span>{BRAND_NAME} AI</span>
                    <span className="px-1.5 py-0.2 bg-black/40 border border-amber-300/50 rounded-full text-[9px] text-amber-200">
                      LIVE
                    </span>
                  </h3>
                  <p className="text-amber-100 text-[11px]">B2B App Guide & Support Assistant</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-black/30 rounded-full transition-colors active:scale-95 cursor-pointer text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 p-3.5 overflow-y-auto bg-zinc-950/90 space-y-3 min-h-[280px] max-h-[340px]">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  onClick={handleLinkClick}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm whitespace-pre-wrap leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black font-semibold rounded-tr-none shadow-md'
                        : 'bg-zinc-900 border border-amber-500/30 text-zinc-100 rounded-tl-none shadow-sm'
                    }`}
                  >
                    <div
                      className="chatbot-message-content"
                      dangerouslySetInnerHTML={{
                        __html: msg.text
                          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                          .replace(/\*(.*?)\*/g, '<em>$1</em>')
                          .replace(/\[([^\]]*)\]\(([^)]+)\)/g, '<a href="$2" class="text-amber-400 font-semibold underline hover:text-amber-300 mx-0.5">$1</a>')
                          .replace(/\n/g, '<br />')
                      }}
                    />
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-zinc-900 border border-amber-500/30 rounded-2xl rounded-tl-none px-3.5 py-2.5 shadow-sm flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
                    <span className="text-xs text-zinc-400">Vyapar AI is thinking...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompt Chips */}
            <div className="px-3 py-2 bg-zinc-900/80 border-t border-zinc-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {quickPrompts.map((prompt, pIdx) => (
                <button
                  key={pIdx}
                  onClick={() => handleSend(prompt)}
                  disabled={isLoading}
                  className="whitespace-nowrap px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 active:scale-95 border border-zinc-700 hover:border-amber-500/50 rounded-full text-[10px] sm:text-xs text-zinc-300 hover:text-amber-300 transition-all cursor-pointer disabled:opacity-50"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Input Area */}
            <div className="p-2.5 bg-zinc-900 border-t border-zinc-800">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center space-x-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask 'profile kaise banaye', 'post top kaise kare'..."
                  className="flex-1 bg-zinc-800 text-white placeholder-zinc-400 text-xs sm:text-sm rounded-full px-3.5 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all border border-zinc-700"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="p-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      <button
        type="button"
        onClick={() => {
          if (!isDraggingRef.current) {
            setIsOpen((prev) => !prev);
          }
        }}
        className="w-14 h-14 bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 text-black rounded-full shadow-[0_0_25px_rgba(245,158,11,0.6)] hover:shadow-[0_0_35px_rgba(245,158,11,0.9)] hover:scale-105 active:scale-95 flex items-center justify-center border-2 border-amber-300 transition-transform cursor-grab active:cursor-grabbing relative touch-none"
        aria-label="Open Vyapar Bridge AI Assistant"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-black" />
        ) : (
          <div className="relative flex items-center justify-center">
            <Bot className="w-7 h-7 text-black drop-shadow" />
            <span className="absolute -top-1 -right-2 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border border-black"></span>
            </span>
          </div>
        )}
      </button>
    </motion.div>
  );
};
