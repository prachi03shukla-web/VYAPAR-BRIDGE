import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, Loader2, Sparkles, SendHorizontal, Settings, Key, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BRAND_LOGO_SRC, BRAND_NAME } from '../constants/brandLogo';

export const AIChatbotWidget: React.FC = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [customApiKey, setCustomApiKey] = useState(() => localStorage.getItem('user_gemini_api_key') || '');
  const [keySavedToast, setKeySavedToast] = useState(false);

  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; text: string }[]>([
    {
      role: 'assistant',
      text: '🙏 **Namaste! Main Vyapar Bridge Gemini AI Assistant hoon.**\n\nAap mujhse Vyapar Bridge App use karne, Profile banana, Post top par lane, Payment & Verification ke alawa **General Knowledge, Business Strategy, Science, Coding ya koi bhi sawal** pooch sakte hain!'
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
  }, [messages, isOpen, isSettingsOpen]);

  const saveCustomKey = () => {
    if (customApiKey.trim()) {
      localStorage.setItem('user_gemini_api_key', customApiKey.trim());
    } else {
      localStorage.removeItem('user_gemini_api_key');
    }
    setKeySavedToast(true);
    setTimeout(() => {
      setKeySavedToast(false);
      setIsSettingsOpen(false);
    }, 1200);
  };

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

  // Direct Gemini REST API Call for Vercel Client-Side Real AI
  const callGeminiDirectly = async (userQuery: string, history: { role: string; text: string }[]): Promise<string | null> => {
    const apiKey = (
      customApiKey ||
      import.meta.env.VITE_GEMINI_API_KEY ||
      process.env.GEMINI_API_KEY ||
      process.env.VITE_GEMINI_API_KEY ||
      localStorage.getItem('user_gemini_api_key') ||
      ''
    ).trim();

    if (!apiKey) return null;

    const systemInstruction = `You are a helpful, all-knowing Gemini AI Assistant integrated into "Vyapar Bridge" - India's B2B & B2C Multi-Industry Business Network.

Your core capabilities:
1. General Knowledge AI: You can answer ANY general question the user asks (Science, Math, Coding, Business, History, Daily Life, Jokes, Marketing, etc.) just like standard Google Gemini or ChatGPT.
2. Vyapar Bridge App Support: You provide direct, helpful answers to Indian business owners, factories, dealers, software providers, hardware traders, plastics/leather manufacturers, photographers, video studios, and buyers.

APP FREQUENTLY ASKED QUESTIONS (FAQ):
- Profile Creation: Click "Login/Register", select role (Factory, Dealer, Customer). Go to Profile -> Edit Profile to add Company Name, GST Number, Logo & PDF Catalogue.
- Posting & Reels: Click "+ Post" on top bar. Upload Photos, Videos, PDF Catalogues, or Text. Click "✨ AI Auto-Hashtag" for auto hashtags. For Reels, go to "Reels" tab, click "Publish Reel".
- Getting Posts to Top: Get Verified Blue Badge (Payment tab), use AI hashtags, post video reels, and stay active daily.
- Payment & Blue Badge: Go to "Payment / Verified Badge" tab. Select Plan (Monthly ₹99, Yearly ₹1,188). Scan UPI QR, enter 12-digit UTR ID. Verified within 24 hours.
- Direct Trade & Contact: Click WhatsApp or Phone icon on any post or profile to chat directly. Browse all verified Indian suppliers in "Members" tab.

Instructions:
- Reply in warm, conversational Hindi / Hinglish / English depending on the user's input language.
- Format responses cleanly with bolding (**text**) and bullet points where helpful.
- If the user asks general questions unrelated to the app, answer completely and accurately like standard Gemini AI.`;

    const conversationText = history.slice(-6).map(h => `${h.role.toUpperCase()}: ${h.text}`).join('\n');
    const fullPrompt = `${systemInstruction}\n\n${conversationText ? 'CONVERSATION HISTORY:\n' + conversationText + '\n\n' : ''}USER QUESTION: ${userQuery}\nASSISTANT:`;

    const modelsToTry = ['gemini-3.7-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];

    for (const model of modelsToTry) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: fullPrompt }] }]
          })
        });

        if (res.ok) {
          const data = await res.json();
          const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (candidateText && candidateText.trim()) {
            return candidateText.trim();
          }
        }
      } catch (e) {
        console.warn(`Gemini direct API model ${model} attempt note:`, e);
      }
    }

    return null;
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
      return `👤 **Vyapar Bridge Profile Setup & GST Verification Guide:**\n\n1. **Register / Login:** Top right par **Login/Register** button dabayein. Phone Number, Password aur Role select karein:\n   - 🏭 **Company / Factory** (Manufacturers & Brands)\n   - 🏪 **Dealer / Distributor** (Wholesalers & Traders)\n   - 🛒 **Customer** (Buyers)\n2. **Business Details:** Profile page par **Edit Profile** click karein:\n   - Company Name aur Address dalein.\n   - **GST Number** add karein (GST Verified Badge ke liye).\n   - Brand Logo aur **PDF Catalogue** upload karein.\n3. **Direct Contact & Protection:** Customer inquiries ke direct leads unlock karne ke liye Verified Badge zaroor active karein!`;
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
      q.includes('guardrail')
    ) {
      return `📢 **Vyapar Bridge par Post aur Reel Kaise Daalein?**\n\n1. **New Post (Feed):**\n   - Top bar par **+ Post** button dabayein.\n   - Photo, Video, PDF Catalogue, ya **keval Business Text & Website Link** dalein.\n   - ✨ **AI Auto-Hashtags:** Auto-Tag button dabayein, Gemini AI aapke business ke hisab se best hashtags auto-generate kar dega!\n2. **Background Fast Publishing:**\n   - Publish button dabate hi post background me upload hoti rehti hai. Upload hone par aapko **Bubble Sound** notification aayega!\n3. **🛡️ AI Guardrail Note:**\n   - Vyapar Bridge strictly B2B commercial network hai. Personal selfies ya non-business content allowed nahi hai. Commercial products, machinery aur trade materials post karein.`;
    }

    // 4. Comments, Lead Contact Protection & Privacy
    if (
      q.includes('comment') ||
      q.includes('contact') ||
      q.includes('phone') ||
      q.includes('number') ||
      q.includes('mask') ||
      q.includes('deal') ||
      q.includes('privacy') ||
      q.includes('lead')
    ) {
      return `🔒 **Public Comments & Lead Contact Protection Policy:**\n\n1. **Contact Protection:** Public comments me phone numbers mask ho jaate hain taaki commercial leads leak na hon.\n2. **Customer Inquiries:** Customers directly **Inquire / Trade Connect** button se merchant ke sath verified direct conversation kar sakte hain.\n3. **Monetized Business Safety:** Isse merchants aur buyers dono ke beech genuine verified commercial deals secure hoti hain.`;
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
      q.includes('leather') ||
      q.includes('photo') ||
      q.includes('video') ||
      q.includes('camera') ||
      q.includes('studio')
    ) {
      return `🏭 **Vyapar Bridge Multi-Industry B2B Rate Index:**\n\n- 🧱 **Tiles & Ceramics (600x1200 GVT):** ₹22 - ₹36 / sq.ft\n- 🚽 **Sanitaryware One-Piece Closet:** ₹1,800 - ₹3,500 / pc\n- 📸 **Product & Catalog Photography:** ₹150 - ₹500 / product shoot\n- 🚁 **Industrial & Drone Videography:** ₹5,000 - ₹25,000 / day shoot\n- 💻 **B2B Billing & POS Software:** Factory Direct Custom Plans\n- 🔩 **Hardware & Power Tools:** Bulk Wholesale Factory Discount\n- 🧪 **Plastic & Polymers Raw Material:** Ex-Factory Bulk Quotes\n- 👞 **Leather & Footwear Goods:** Kanpur/Agra Wholesale Rates\n\nDirect factory rates ke liye **Members** tab se Verified Manufacturer se baat karein!`;
    }

    // 8. General Intelligent Fallback
    return `🤖 **Vyapar Bridge Gemini AI:**\n\nAap vyapar bridge ke kisi bhi feature (Profile, Post, Reel, Verification) ke baare me pooch sakte hain!\n\n💡 **Tip for Vercel:** Agar aap Vercel par full Gemini AI capabilities chahte hain, to Chat Header par ⚙️ **Settings** icon dabakar apni Gemini API Key paste karein!`;
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
        // Fall through to client-side direct Gemini call
      }

      // 2. If server endpoint was not available, try direct client-side Gemini REST API
      if (!responseReceived) {
        const directReply = await callGeminiDirectly(userText, history);
        if (directReply) {
          setMessages((prev) => [...prev, { role: 'assistant', text: directReply }]);
          responseReceived = true;
        }
      }

      // 3. Fallback to smart conversational AI engine
      if (!responseReceived) {
        await new Promise((res) => setTimeout(res, 300));
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
            className="mb-4 w-[92vw] sm:w-96 bg-zinc-900 text-white rounded-2xl shadow-2xl border border-amber-500/40 overflow-hidden flex flex-col max-h-[530px]"
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
                    <span>{BRAND_NAME} Gemini AI</span>
                    <span className="px-1.5 py-0.2 bg-black/40 border border-amber-300/50 rounded-full text-[9px] text-amber-200">
                      LIVE
                    </span>
                  </h3>
                  <p className="text-amber-100 text-[11px]">General Knowledge & B2B AI Guide</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                  title="Gemini API Key Settings"
                  className="p-1.5 hover:bg-black/30 rounded-full transition-colors active:scale-95 cursor-pointer text-white"
                >
                  <Settings className="w-4 h-4 text-amber-200 hover:text-white" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-black/30 rounded-full transition-colors active:scale-95 cursor-pointer text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Settings Overlay View */}
            {isSettingsOpen ? (
              <div className="p-4 bg-zinc-950 text-xs space-y-3 min-h-[300px]">
                <div className="flex items-center gap-2 text-amber-400 font-bold border-b border-zinc-800 pb-2">
                  <Key className="w-4 h-4" />
                  <span>Gemini API Key Setup (Vercel & Client)</span>
                </div>
                <p className="text-zinc-300 leading-relaxed">
                  Agar aapne app Vercel par deploy ki hai, to yahan apni Google Gemini API Key add karke pure <strong>Gemini AI</strong> ko live activate kar sakte hain:
                </p>
                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">Gemini API Key:</label>
                  <input
                    type="password"
                    value={customApiKey}
                    onChange={(e) => setCustomApiKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
                {keySavedToast && (
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
                    <Check className="w-4 h-4" /> Key Saved Successfully! Activating Gemini AI...
                  </div>
                )}
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsSettingsOpen(false)}
                    className="px-3 py-1.5 bg-zinc-800 text-zinc-300 rounded-lg hover:bg-zinc-700 cursor-pointer"
                  >
                    Back to Chat
                  </button>
                  <button
                    type="button"
                    onClick={saveCustomKey}
                    className="px-4 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-bold rounded-lg hover:from-amber-400 hover:to-yellow-400 cursor-pointer shadow"
                  >
                    Save Key
                  </button>
                </div>
              </div>
            ) : (
              <>
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
                        <span className="text-xs text-zinc-400">Vyapar Gemini AI is thinking...</span>
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
                      placeholder="Ask anything (App guide, Science, Math, Business)..."
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
              </>
            )}
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
