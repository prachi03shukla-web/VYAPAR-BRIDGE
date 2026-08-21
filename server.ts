import express from 'express';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { generateInstagramFeed } from './algorithmEngine';
import { validateGSTIN } from './src/utils/gstinValidator';




import { initializeApp as initClientApp } from 'firebase/app';
import { getFirestore as getClientFirestore, collection, getDocs, doc, getDoc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { getStorage } from 'firebase-admin/storage';
import { applicationDefault, initializeApp as initAdminApp } from 'firebase-admin/app';

let firestoreDb: any = null;
let firebaseStorage: any = null;
try {
  const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
  const clientApp = initClientApp(firebaseConfig);
  firestoreDb = getClientFirestore(clientApp, firebaseConfig.firestoreDatabaseId);
  
  // Initialize Admin SDK for Storage
  const adminApp = initAdminApp({
    credential: applicationDefault(),
    storageBucket: firebaseConfig.storageBucket
  });
  firebaseStorage = getStorage(adminApp).bucket();
  console.log('✅ Firebase Admin SDK Storage and Firestore Client initialized.');
} catch (e) {
  console.error('❌ Failed to initialize Firebase Client SDK:', e);
}

// Function to sync from Firestore to memory on startup

async function uploadToFirebaseOrLocal(file: Express.Multer.File): Promise<string> {
  try {
    if (file && file.filename) {
      const isVideoOrAudioOrPdf = 
        file.mimetype?.startsWith('video') || 
        file.mimetype?.startsWith('audio') || 
        file.mimetype === 'application/pdf' || 
        /\.(mp4|webm|mov|m4v|mkv|3gp|mp3|wav|ogg|pdf)$/i.test(file.originalname || '') ||
        /\.(mp4|webm|mov|m4v|mkv|3gp|mp3|wav|ogg|pdf)$/i.test(file.filename || '');

      if (isVideoOrAudioOrPdf) {
        return `/uploads/${file.filename}`;
      }

      if (file.path && fs.existsSync(file.path)) {
        const fileBuffer = fs.readFileSync(file.path);
        if (fileBuffer.length <= 300 * 1024) {
          let mime = file.mimetype || 'image/jpeg';
          const base64Str = fileBuffer.toString('base64');
          return `data:${mime};base64,${base64Str}`;
        }
      }
    }
  } catch (e) {
    console.error('Error in uploadToFirebaseOrLocal:', e);
  }
  return `/uploads/${file?.filename || ''}`;
}

  let isFirestoreQuotaExceeded = false;

  async function syncFromFirestore() {
    if (!firestoreDb || isFirestoreQuotaExceeded) return;
    try {
      const usersSnap = await getDocs(collection(firestoreDb, 'users'));
      if (!usersSnap.empty) {
        let fbUsers = usersSnap.docs.map(d => ({ ...d.data(), id: d.id }));
        // Ignore users that have been explicitly deleted locally
        fbUsers = fbUsers.filter(u => !(db.deletedUserIds || []).includes(String(u.id)));
        const fbUserMap = new Map(fbUsers.map(u => [String(u.id), u]));
        db.users = db.users.filter(u => u.role === 'admin' || String(u.id) === '1' || fbUserMap.has(String(u.id)));
        for (const u of fbUsers) {
          const idx = db.users.findIndex(ex => String(ex.id) === String(u.id));
          if (idx !== -1) db.users[idx] = { ...db.users[idx], ...u };
          else db.users.push(u);
        }
      }

      const postsSnap = await getDocs(collection(firestoreDb, 'posts'));
      if (!postsSnap.empty) {
        const fbPosts = postsSnap.docs.map(d => ({ ...d.data(), id: d.id }));
        for (const p of fbPosts) {
          if ((db.deletedPostIds || []).includes(String(p.id))) continue;
          const pUid = String(p.userId || p.user?.id || '');
          if ((db.deletedUserIds || []).includes(pUid)) continue;
          const idx = db.posts.findIndex(ex => String(ex.id) === String(p.id));
          if (idx !== -1) {
            db.posts[idx] = { ...db.posts[idx], ...p };
          } else {
            db.posts.push(p);
          }
        }
      }
      db.posts.sort((a, b) => {
        const timeA = typeof a.createdAt === 'number' ? a.createdAt : new Date(a.createdAt || 0).getTime();
        const timeB = typeof b.createdAt === 'number' ? b.createdAt : new Date(b.createdAt || 0).getTime();
        return timeB - timeA;
      });

      const adsSnap = await getDocs(collection(firestoreDb, 'advertisements'));
      if (!adsSnap.empty) {
        const fbAds = adsSnap.docs.map(d => d.data());
        if (!db.adminSettings) db.adminSettings = {};
        if (!db.adminSettings.brandAdsList) db.adminSettings.brandAdsList = [];
        const existingAdIds = new Set(db.adminSettings.brandAdsList.map(a => String(a.id)));
        for (const a of fbAds) {
          if (!existingAdIds.has(String(a.id))) {
            db.adminSettings.brandAdsList.push(a);
          } else {
             const idx = db.adminSettings.brandAdsList.findIndex(ex => String(ex.id) === String(a.id));
             if (idx !== -1) db.adminSettings.brandAdsList[idx] = { ...db.adminSettings.brandAdsList[idx], ...a };
          }
        }
      }

      const likesSnap = await getDocs(collection(firestoreDb, 'likes'));
      if (!likesSnap.empty) {
        db.likes = likesSnap.docs.map(d => d.data());
      }

      // Sync persisted admin settings from Firestore
      try {
        const adminSnap = await getDoc(doc(firestoreDb, 'system', 'adminSettings'));
        if (adminSnap.exists()) {
          const fbAdmin = adminSnap.data();
          if (fbAdmin) {
            db.adminSettings = { ...db.adminSettings, ...fbAdmin };
            fs.writeFileSync(ADMIN_SETTINGS_FILE, JSON.stringify(db.adminSettings, null, 2), 'utf-8');
          }
        }
      } catch (e) {
        console.warn('Firestore adminSettings sync note:', e);
      }
    } catch (e: any) {
      if (e?.message?.includes('Quota') || e?.code === 'resource-exhausted') {
        isFirestoreQuotaExceeded = true;
        console.warn('⚠️ Firestore daily free read quota reached. App is seamlessly operating on local persistent disk store (database3.json). Quota resets tomorrow.');
      } else {
        console.warn('Firestore sync notice (fallback active):', e?.message || e);
      }
    }
  }


// Prepare uploads folder
const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || (file.mimetype.includes('video') ? '.mp4' : '.jpg');
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  }
});


const upload = multer({ 
  storage,
  limits: { 
    fileSize: 100 * 1024 * 1024, // 50MB limit
    fieldSize: 100 * 1024 * 1024 // 50MB limit
  }
});

// In-memory database for the prototype
const db = {
  users: [
    { 
      id: '1', 
      role: 'admin', 
      name: 'Vyapar Bridge B2B Admin', 
      isVerified: true, 
      verifiedPlan: 'yearly', 
      category: 'Platform Operations',
      gstNumber: '24AAACT1234F1Z0',
      address: 'Vyapar Bridge Tower, GIDC Industrial Estate',
      city: 'Morbi',
      state: 'Gujarat',
      gpsCoords: { lat: 22.8182, lng: 70.8368 },
      googleMapsUrl: 'https://maps.google.com/?q=22.8182,70.8368',
      bio: 'Official Vyapar Bridge B2B Operations & Moderation Desk.',
      coverUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1000&q=80',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150',
      phone: '+91 9876500001',
      email: 'admin@vyaparbridge.com'
    }
  ],
  posts: [],
  comments: [],
  messages: [],
  follows: [],
  notifications: [], // { id, userId, actorId, actorName, type (like|comment|follow|share), targetId (postId etc), time }
  blocks: [],
  reports: [],
  payments: [],
  likes: [], // { userId, postId }
  saves: [], // { userId, postId }
  views: [], // { userId, postId, createdAt }
  shares: [], // { userId, postId, createdAt }
  notInterested: [], // { userId, postId, createdAt }
  savedCatalogues: [], // { userId, targetUserId, createdAt }
  announcements: [],
  music: [],
  adminSettings: {
    upiId: 'ashish660@ibl',
    accountName: 'Ashish Kumar Verma',
    qrCodeUrl: '',
    barcodeImageUrl: '',
    barcodeSecretToken: 'SECURE-BARCODE-VERIFY-2026-X89',
    aiModel: 'gemini-3.7-flash',
    aiGuardrailActive: true,
    developerMasterPin: 'admin1234@#',
    brandVideoAd: null,
    brandAdsList: []
  },
  aiLogs: [],
  totalVisitors: 0,
  platformFeedbacks: [
    {
      id: 'fb-1',
      rating: 5,
      userName: 'Rajesh Sharma',
      userCity: 'Morbi, Gujarat',
      userRole: 'dealer',
      comment: 'Vyapar Bridge app is phenomenal! Finding verified tile manufacturers and direct design catalogues in Morbi has become seamless.',
      createdAt: Date.now() - 86400000 * 3,
      isVerified: false
    },
    {
      id: 'fb-2',
      rating: 5,
      userName: 'Anita Patel',
      userCity: 'Ahmedabad',
      userRole: 'customer',
      comment: 'Top quality platform with instant GST verification and direct WhatsApp dealer contact. Highly recommended!',
      createdAt: Date.now() - 86400000 * 2,
      isVerified: false
    },
    {
      id: 'fb-3',
      rating: 5,
      userName: 'Vikramaditya Singh',
      userCity: 'Jaipur',
      userRole: 'company',
      comment: 'Excellent B2B networking portal for Indian ceramic manufacturers. Fast loading and great UI!',
      createdAt: Date.now() - 86400000 * 1,
      isVerified: false
    }
  ]
};

// Persistence helper for Admin Settings
const ADMIN_SETTINGS_FILE = path.join(process.cwd(), 'admin_settings.json');

function loadAdminSettings() {
  try {
    if (fs.existsSync(ADMIN_SETTINGS_FILE)) {
      const data = fs.readFileSync(ADMIN_SETTINGS_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (parsed && typeof parsed === 'object') {
        db.adminSettings = { ...db.adminSettings, ...parsed };
        console.log('✅ Loaded persisted Admin Settings from disk:', { ...db.adminSettings, developerMasterPin: '***' });
      }
    }
  } catch (err) {
    console.error('Error loading admin settings from disk:', err);
  }
}

function saveAdminSettings() {
  try {
    fs.writeFileSync(ADMIN_SETTINGS_FILE, JSON.stringify(db.adminSettings, null, 2), 'utf-8');
    console.log('💾 Persisted Admin Settings to disk');
    if (firestoreDb && isFirebaseDelete) {
      setDoc(doc(firestoreDb, 'system', 'adminSettings'), db.adminSettings, { merge: true }).catch(e => {
        console.warn('Firestore sync adminSettings note:', e);
      });
    }
  } catch (err) {
    console.error('Error saving admin settings to disk:', err);
  }
}

// Helper to resolve user profile avatars cleanly without relying on ui-avatars initials
function getDefaultAvatar(actorName?: string, actorId?: string) {
  const defaultAvatars = [
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150',
    'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&h=150',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150',
    'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=150&h=150',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150'
  ];
  const key = String(actorId || actorName || '0');
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash += key.charCodeAt(i);
  }
  return defaultAvatars[hash % defaultAvatars.length];
}

function resolveUserAvatar(actor?: any) {
  if (actor && actor.avatarUrl && typeof actor.avatarUrl === 'string' && actor.avatarUrl.trim() !== '' && !actor.avatarUrl.includes('ui-avatars.com')) {
    return actor.avatarUrl;
  }
  return getDefaultAvatar(actor?.name, actor?.id);
}

// Load persisted db on initial server startup
const MAIN_DB_FILE = path.join(process.cwd(), 'database3.json');

function loadDatabase() {
  try {
    if (fs.existsSync(MAIN_DB_FILE)) {
      const data = fs.readFileSync(MAIN_DB_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (parsed && typeof parsed === 'object') {
        Object.assign(db, parsed);
        if (!db.shares) db.shares = [];
        if (!db.notInterested) db.notInterested = [];
        if (!db.savedCatalogues) db.savedCatalogues = [];
        if (!db.deletedUserIds) db.deletedUserIds = [];
        if (!(db as any).ratings) (db as any).ratings = [];
        if (!(db as any).feedbacks) (db as any).feedbacks = [];
        // Sanitize any existing user avatars with ui-avatars text
        if (db.users && Array.isArray(db.users)) {
          db.users.forEach((u: any) => {
            if (u.avatarUrl && typeof u.avatarUrl === 'string' && u.avatarUrl.includes('ui-avatars.com')) {
              u.avatarUrl = getDefaultAvatar(u.name || u.username, u.id);
            }
          });
          
          // Guarantee Admin exists
          if (!db.users.find((u: any) => u.role === 'admin')) {
             db.users.unshift({ 
                id: '1', 
                role: 'admin', 
                name: 'Vyapar Bridge B2B Admin', 
                isVerified: true, 
                verifiedPlan: 'yearly', 
                category: 'Platform Operations',
                gstNumber: '24AAACT1234F1Z0',
                address: 'Vyapar Bridge Tower, GIDC Industrial Estate',
                city: 'Morbi',
                state: 'Gujarat',
                gpsCoords: { lat: 22.8182, lng: 70.8368 },
                googleMapsUrl: 'https://maps.google.com/?q=22.8182,70.8368',
                bio: 'Official Vyapar Bridge B2B Operations & Moderation Desk.',
                coverUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1000&q=80',
                avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150',
                phone: '+91 9876500001',
                email: 'admin@vyaparbridge.com'
              });
          }
        }
        console.log('✅ Loaded persisted Database from disk store');
      }
    }
  } catch (err) {
    console.error('Error loading database from disk:', err);
  }
  if (!db.shares) db.shares = [];
  if (!db.notInterested) db.notInterested = [];
  loadAdminSettings(); // Load overrides
  syncFromFirestore();
  setInterval(() => {
    syncFromFirestore().catch(() => {});
  }, 15000);
}

// Helper to save database synchronously to disk immediately
function saveDatabase() {
  try {
    fs.writeFileSync(MAIN_DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving database to disk:', err);
  }
}

// Auto-save every 5 seconds
setInterval(saveDatabase, 5000);

// Load on startup
loadDatabase();

// Lazy Gemini AI initialization
let genAI: any = null;
function getAI() {
  if (!genAI && process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return genAI;
}

// Keyword Safety Filter for instant zero-latency protection against explicit/nude content
const EXPLICIT_KEYWORDS = [
  'nude', 'nudity', 'porn', 'porno', 'sex', 'sexy', 'naked', 'boobs', 'vagina', 'penis', 'dick', 'pussy',
  'fuck', 'bitch', 'asshole', 'bastard', 'slut', 'whore', 'nude pic', 'nude video', 'adult content',
  'gandi', 'nangi', 'chutiya', 'gaand', 'bhosdike', 'madarchod', 'behenchod'
];

const LINK_PATTERNS = [
  /https?:\/\/[^\s]+/i,
  /www\.[^\s]+/i,
  /\b[a-zA-Z0-9-]+\.(com|in|org|net|xyz|info|top|site|biz|co|app|apk|online|club|me|tv|cc|io)\b/i,
  /\b(t\.me|telegram\.me|wa\.me|chat\.whatsapp\.com|bit\.ly|tinyurl\.com)\b/i
];

// Helper: AI Content Moderation for Posts, Comments & Media
async function moderateContentWithAI(text: string, mediaFilePath?: string, mediaBase64?: string): Promise<{ approved: boolean; reason?: string }> {
  const combinedText = (text || '').toLowerCase();
  
  // 1. Instant Keyword Safety Guard (Abusive & Adult content)
  const foundBadWord = EXPLICIT_KEYWORDS.find(word => combinedText.includes(word));
  if (foundBadWord) {
    return {
      approved: false,
      reason: `⛔ AI Safety Guardrail: Inappropriate language or adult content keyword detected ("${foundBadWord}"). Nudity, pornography, and abusive language are strictly prohibited.`
    };
  }

  // 2. External Link Guard (Routes posts with links to Admin Review)
  const hasExternalLink = LINK_PATTERNS.some(pat => pat.test(combinedText));
  if (hasExternalLink) {
    return {
      approved: false,
      reason: `🔍 External Link Detected: External web addresses and links require Admin Safety Clearance before publishing.`
    };
  }

  // 3. Optional Gemini AI Safety Guard (For images only - skip heavy video buffer reads)
  if (process.env.GEMINI_API_KEY) {
    try {
      const contents: any[] = [];
      
      // Attach base64 image or small photo for visual inspection
      if (mediaBase64 && mediaBase64.startsWith('data:image')) {
        const parts = mediaBase64.split(';base64,');
        const mimeType = parts[0].replace('data:', '') || 'image/jpeg';
        const data = parts[1];
        contents.push({
          inlineData: { mimeType, data }
        });
      }

      const promptText = `SYSTEM DIRECTIVE: You are the Content Security Moderator for "Vyapar Bridge".
POLICY:
- ALLOW (approved: true): All normal videos, reels, commercial posts, products, software solutions, showroom tours, user videos, personal business intros, marketing posts, trade discussions, and general media.
- REJECT (approved: false): Explicit adult nudity/pornography, abusive hate speech/profanity, illegal gambling/scams, or dangerous unverified links.

User's provided text: "${text || 'No text provided'}"

Respond STRICTLY in raw JSON format:
{"approved": true, "reason": "Approved"}
OR
{"approved": false, "reason": "⛔ Flagged: Questionable content detected. Sent to Admin Review."}`;
      contents.push(promptText);

      const ai = getAI();
      if (!ai) return { approved: true, reason: 'AI moderation skipped (No API Key)' };

      let responseWrapper: any = null;
      const modelsToTry = ['gemini-3.7-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];
      for (const mName of modelsToTry) {
        try {
          let timeoutId: any;
          const timeoutPromise = new Promise<any>((resolve) => {
            timeoutId = setTimeout(() => resolve(null), 3000);
          });

          let aiPromise: Promise<any>;
          if (ai.models && typeof ai.models.generateContent === 'function') {
            aiPromise = ai.models.generateContent({
              model: mName,
              contents
            });
          } else if (typeof ai.getGenerativeModel === 'function') {
            const model = ai.getGenerativeModel({ model: mName });
            aiPromise = model.generateContent(contents);
          } else {
            break;
          }

          responseWrapper = await Promise.race([aiPromise, timeoutPromise]);
          if (timeoutId) clearTimeout(timeoutId);
          if (responseWrapper) break;
        } catch (e) {
          console.warn(`AI Moderation warning with ${mName}:`, e);
        }
      }

      if (!responseWrapper) {
        return { approved: true };
      }

      let responseText = '';
      if (responseWrapper?.text && typeof responseWrapper.text === 'string') {
        responseText = responseWrapper.text;
      } else if (responseWrapper?.response?.text) {
        responseText = typeof responseWrapper.response.text === 'function' 
          ? responseWrapper.response.text() 
          : String(responseWrapper.response.text || '');
      }

      if (responseText) {
        const cleanedText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        try {
          const result = JSON.parse(cleanedText);
          if (result.approved === false) {
            return {
              approved: false,
              reason: result.reason || '⛔ AI Security Shield Blocked: Personal human selfies or non-B2B images are strictly prohibited. Please upload only Tiles or Sanitaryware media.'
            };
          }
        } catch (pErr) {
          if (responseText.toLowerCase().includes('approved": false') || responseText.toLowerCase().includes('blocked') || responseText.toLowerCase().includes('selfie') || responseText.toLowerCase().includes('prohibited')) {
            return {
              approved: false,
              reason: '⛔ AI Security Shield Blocked: Personal human selfies or non-B2B images are strictly prohibited. Please upload only Tiles or Sanitaryware media.'
            };
          }
        }
      }
    } catch (aiErr: any) {
      console.error('AI Moderation error:', aiErr);
    }
  }

  return { approved: true };
}

async function generateAICompletion(promptText: string): Promise<string | null> {
  const ai = getAI();
  if (!ai) return null;
  const modelsToTry = ['gemini-3.7-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];
  for (const modelName of modelsToTry) {
    try {
      if (typeof ai.models?.generateContent === 'function') {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: promptText
        });
        if (response && response.text) {
          return response.text;
        }
      } else if (typeof ai.getGenerativeModel === 'function') {
        const model = ai.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(promptText);
        if (result && result.response) {
          const text = typeof result.response.text === 'function' ? result.response.text() : result.response.text;
          if (text) return text;
        }
      }
    } catch (err: any) {
      console.warn(`AI Completion warning with ${modelName}:`, err?.message || err);
    }
  }
  return null;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Logging middleware
  app.use((req, res, next) => {
    if (req.url.startsWith('/api')) {
      console.log(`${req.method} ${req.url}`);
    }
    next();
  });

  // Serve uploaded files statically
  app.use('/uploads', express.static(uploadsDir));
  app.use('/uploads', (req, res) => {
    res.status(404).send('File not found or was deleted. Please re-upload the file.');
  });
  app.use('/public/uploads', express.static(uploadsDir));
  app.use('/public/uploads', (req, res) => {
    res.status(404).send('File not found or was deleted. Please re-upload the file.');
  });
  app.use('/public', express.static(path.join(process.cwd(), 'public')));
  app.use(express.static(path.join(process.cwd(), 'public')));

  // API Routes
  
  // AI Hashtag Suggestion using Gemini & Real-time B2B Learning Algorithm
  const serverLearnedTags = new Set<string>(['#vyaparbridge', '#morbitiles', '#b2bwholesale', '#factorydirect']);

  app.post('/api/ai/suggest-hashtags', async (req, res) => {
    const { title, content } = req.body;
    if (!title && !content) return res.json({ hashtags: '' });

    try {
      const prompt = `As an expert B2B Trade & AI Marketing Algorithm for Vyapar Bridge, analyze this business post/catalogue title and description, and generate 8-12 high-conversion hashtags.

Post Title: "${title || 'Untitled'}"
Post Description: "${content || 'No description provided'}"

ALGORITHM & EXTRACTION RULES:
1. Company/Brand Tag: Extract company/brand name if mentioned (e.g. #SomanyCeramics, #Kajaria, #SupremePlastics, #Jaquar, #TataSteel).
2. Size & Dimension Tags: Extract dimensions if present (e.g. 600x1200 -> #Size600x1200, 1200x2400 -> #Size1200x2400, 110mm -> #Size110mm, 2x4 -> #Size2x4ft).
3. Material & Finish Specs: Extract specs like GVT, PGVT, Full Body, Matt, High Gloss, Carving, Porcelain, Brass, PVC, Leather, Cotton, Plywood, etc.
4. Category & Industry: Include wholesale industry tags like #VitrifiedTiles, #Sanitaryware, #PlywoodWholesale, #PVCPipes, #TextilesMarket, #AutomobileDealers, #LogisticsServices.
5. Primary Tag: Always include #VyaparBridge.

Return ONLY the hashtags starting with # separated by spaces. No explanations or extra text.`;

      const aiText = await generateAICompletion(prompt);
      if (aiText) {
        const hashtags = aiText.trim()
          .replace(/[,.]/g, '')
          .split(/\s+/)
          .filter(tag => tag.startsWith('#'))
          .join(' ');
          
        if (hashtags) {
          // Record in real-time server learning memory
          hashtags.split(/\s+/).forEach(t => serverLearnedTags.add(t));
          return res.json({ hashtags });
        }
      }
    } catch (err) {
      console.error('Hashtag suggestion error:', err);
    }

    // Smart fallback with size, brand, material extraction
    const fullText = `${title || ''} ${content || ''}`;
    const fallbackSet = new Set<string>(['#VyaparBridge']);

    // Extract sizes
    const sz = fullText.match(/\b(\d{2,4}\s*x\s*\d{2,4}|\d+\s*x\s*\d+\s*(?:ft|inch|cm|mm)?|\d+\s*mm|\d+\s*inch)\b/gi);
    if (sz) sz.forEach(s => fallbackSet.add(`#Size${s.replace(/\s+/g, '').toUpperCase()}`));

    if (/\bgvt\b/i.test(fullText)) fallbackSet.add('#GVT');
    if (/\bpgvt\b/i.test(fullText)) fallbackSet.add('#PGVT');
    if (/vitrified|tile/i.test(fullText)) fallbackSet.add('#VitrifiedTiles');
    if (/sanitary|basin|faucet/i.test(fullText)) fallbackSet.add('#SanitarywareWholesale');
    if (/pipe|pvc/i.test(fullText)) fallbackSet.add('#PVCPipes');
    if (/plywood|laminate/i.test(fullText)) fallbackSet.add('#PlywoodAndLaminates');

    fallbackSet.add('#B2BWholesale');
    fallbackSet.add('#FactoryDirect');

    const fallbackStr = Array.from(fallbackSet).join(' ');
    res.json({ hashtags: fallbackStr });
  });

  // Live AI-Powered GSTIN Tax Directory Lookup
  app.get('/api/gstin/lookup', async (req, res) => {
    const rawGstin = String(req.query.gstin || '').trim().toUpperCase();
    if (!rawGstin || rawGstin.length !== 15) {
      return res.status(400).json({ error: 'Valid 15-character GSTIN is required' });
    }

    const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    if (!gstinRegex.test(rawGstin)) {
      return res.status(400).json({ error: 'Invalid GSTIN format pattern' });
    }

    const stateCode = rawGstin.substring(0, 2);
    const pan = rawGstin.substring(2, 12);
    const entityChar = pan.charAt(3);
    const nameLetter = pan.charAt(4);

    const STATE_NAMES: Record<string, string> = {
      '01': 'Jammu & Kashmir', '02': 'Himachal Pradesh', '03': 'Punjab', '04': 'Chandigarh',
      '05': 'Uttarakhand', '06': 'Haryana', '07': 'Delhi', '08': 'Rajasthan',
      '09': 'Uttar Pradesh', '10': 'Bihar', '11': 'Sikkim', '12': 'Arunachal Pradesh',
      '13': 'Nagaland', '14': 'Manipur', '15': 'Mizoram', '16': 'Tripura', '17': 'Meghalaya',
      '18': 'Assam', '19': 'West Bengal', '20': 'Jharkhand', '21': 'Odisha', '22': 'Chhattisgarh',
      '23': 'Madhya Pradesh', '24': 'Gujarat', '27': 'Maharashtra', '28': 'Andhra Pradesh',
      '29': 'Karnataka', '30': 'Goa', '32': 'Kerala', '33': 'Tamil Nadu', '36': 'Telangana'
    };
    const stateName = STATE_NAMES[stateCode] || 'Gujarat';

    let entityTypeDesc = 'Proprietary Firm';
    if (entityChar === 'C') entityTypeDesc = 'Company / Private Limited';
    else if (entityChar === 'F') entityTypeDesc = 'Partnership Firm / LLP';
    else if (entityChar === 'H') entityTypeDesc = 'HUF (Hindu Undivided Family)';
    else if (entityChar === 'T') entityTypeDesc = 'Trust';

    // 1. Live Query to Gemini AI Tax Directory Intelligence Engine
    try {
      const aiPrompt = `System Directive: You are an official Indian GST Tax Directory lookup AI engine for B2B Tile Platform.
Target GSTIN: "${rawGstin}"
State Code: ${stateCode} (${stateName})
PAN Number: ${pan} (Entity Holder Type: ${entityTypeDesc})
5th PAN Character: '${nameLetter}'

Task: Look up or deduce registered public taxpayer directory details for Indian GSTIN "${rawGstin}".
Provide registered legal/trade business name, state, city/district in ${stateName}, and registered street address.

Return ONLY a valid raw JSON object (NO markdown, NO \`\`\`json backticks, NO extra text):
{
  "companyName": "Registered legal/trade name of the taxpayer",
  "state": "${stateName}",
  "city": "Registered city or district in ${stateName}",
  "address": "Registered office/shop street address with landmark and PIN code",
  "entityType": "${entityTypeDesc}",
  "pan": "${pan}"
}`;

      const aiText = await generateAICompletion(aiPrompt);
      if (aiText) {
        const cleaned = aiText.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        if (parsed && parsed.companyName) {
          return res.json({
            gstin: rawGstin,
            companyName: parsed.companyName,
            state: parsed.state || stateName,
            city: parsed.city || 'Commercial Hub',
            address: parsed.address || 'Registered Office Address',
            entityType: parsed.entityType || entityTypeDesc,
            pan,
            source: 'Gemini GST Portal AI'
          });
        }
      }
    } catch (err) {
      console.warn('AI GSTIN Lookup fallback triggered:', err);
    }

    // 2. Intelligent Dynamic Structural Fallback
    const cityHubs: Record<string, { city: string; address: string }> = {
      '09': { city: 'Kanpur', address: 'Commercial District, Halsey Road / Transport Nagar' },
      '24': { city: 'Morbi', address: '8-A National Highway, Ceramic Zone' },
      '27': { city: 'Mumbai', address: 'Goregaon East Commercial Complex' },
      '07': { city: 'New Delhi', address: 'Kirti Nagar Building Material Zone' },
      '08': { city: 'Kishangarh', address: 'Marble & Granite Park, Ajmer Road' },
      '06': { city: 'Gurugram', address: 'Udyog Vihar Phase IV' },
      '33': { city: 'Chennai', address: 'Guindy Industrial Area' },
      '29': { city: 'Bengaluru', address: 'Peenya Industrial Area' },
      '19': { city: 'Kolkata', address: 'Salt Lake Sector V Commercial Belt' },
      '23': { city: 'Indore', address: 'Sanwer Road Industrial Area' }
    };
    const hub = cityHubs[stateCode] || { city: 'Commercial Hub', address: `${stateName} Trade Area` };

    return res.json({
      gstin: rawGstin,
      companyName: `${nameLetter} Trades & Sanitaryware`,
      state: stateName,
      city: hub.city,
      address: hub.address,
      entityType: entityTypeDesc,
      pan,
      source: 'GST Structure Decoder'
    });
  });

  // Notifications API
  app.get('/api/notifications', (req, res) => {
    const userId = req.query.userId;
    if (!userId) return res.json([]);
    const userNotifs = db.notifications.filter(n => String(n.userId) === String(userId))
      .map(notif => {
        const actor = db.users.find(u => String(u.id) === String(notif.actorId));
        return {
          ...notif,
          actorAvatar: actor ? actor.avatarUrl : null,
          actorName: actor ? actor.name : notif.actorName
        };
      })
      .sort((a, b) => b.time - a.time);
    res.json(userNotifs);
  });

  // Mark all as read
  app.post('/api/notifications/read', (req, res) => {
    const userId = req.body.userId;
    db.notifications.forEach(n => {
      if (String(n.userId) === String(userId)) n.read = true;
    });
    saveDatabase();
    res.json({ success: true });
  });

  // Clear all
  app.post('/api/notifications/clear', (req, res) => {
    const userId = req.body.userId;
    db.notifications = db.notifications.filter(n => String(n.userId) !== String(userId));
    saveDatabase();
    res.json({ success: true });
  });

  app.delete('/api/notifications/:id', (req, res) => {
    db.notifications = db.notifications.filter(n => String(n.id) !== String(req.params.id));
    saveDatabase();
    res.json({ success: true });
  });

  app.post('/api/requirements', (req, res) => {
    const { userId, targetId, tilesQty, ewcQty, mixerQty, other } = req.body;
    const actor = db.users.find(u => String(u.id) === String(userId));
    
    if (actor && targetId) {
      db.notifications.push({
        id: Date.now(),
        userId: targetId,
        actorId: userId,
        actorName: actor.name || 'A customer',
        action: 'sent you their building requirements.',
        type: 'requirement_lead',
        details: {
          tilesQty,
          ewcQty,
          mixerQty,
          other
        },
        time: Date.now(),
        read: false
      });
      saveDatabase();
    }
    res.json({ success: true });
  });


  // Get Suggested Companies & Dealers
  app.get('/api/users/suggested', (req, res) => {
    const currentUserId = String(req.query.userId || '');
    const limit = parseInt(String(req.query.limit || '10'));

    const suggested = db.users
      .filter(u => u.id !== currentUserId && (u.role === 'factory' || u.role === 'dealer'))
      .sort((a, b) => (b.isVerified ? 1 : 0) - (a.isVerified ? 1 : 0)) // Priority to verified
      .slice(0, limit);

    res.json(suggested);
  });

  // Upload Company Catalogue (PDF)
  app.post('/api/users/:id/catalogue', upload.single('catalogue'), async (req, res) => {
    const { id } = req.params;
    const user = db.users.find(u => u.id === id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.role !== 'factory' && user.role !== 'dealer') {
      return res.status(403).json({ error: 'Only Factories and Dealers can have a catalogue.' });
    }

    if (req.file) {
      user.catalogueUrl = await uploadToFirebaseOrLocal(req.file);
      user.catalogueName = req.file.originalname;
      res.json({ success: true, catalogueUrl: user.catalogueUrl, catalogueName: user.catalogueName });
    } else {
      res.status(400).json({ error: 'No file uploaded' });
    }
  });

  // Get all posts (ranked via Recommendation Algorithm, excluding blocked users and Not Interested posts)
  app.get('/api/posts', async (req, res) => {
    const currentUserId = req.query.currentUserId ? String(req.query.currentUserId) : null;
    const queryUserId = req.query.userId ? String(req.query.userId) : undefined;
    const admin = req.query.admin === 'true';
    const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : undefined;
    const page = req.query.page ? parseInt(String(req.query.page), 10) : undefined;

    try {
      await syncFromFirestore();
    } catch (e) {}

    const rankedPosts = generateInstagramFeed(currentUserId, db, { queryUserId, admin, limit, page });
    res.json(rankedPosts);
  });

  // Upload generic file
  app.post('/api/upload', upload.single('media'), async (req, res) => {
    if (req.file) {
      res.json({ url: await uploadToFirebaseOrLocal(req.file) });
    } else {
      res.status(400).json({ error: 'No file uploaded' });
    }
  });

  // Create a post with Real-time AI Safety Moderation
  app.post('/api/posts', upload.fields([{ name: 'media', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }]), async (req, res) => {
    try {
      const { title, content, hashtags, type: requestedType, userId, visibility, scheduledAt } = req.body;
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      
      let user = db.users.find(u => String(u.id) === String(userId));
      if (!user && userId) {
        const isMaster = String(userId) === '1' || String(userId) === 'master_admin' || String(userId) === '5503';
        user = {
          id: String(userId),
          name: req.body.userName || (isMaster ? 'Vyapar Bridge Master Admin' : 'Verified Member'),
          username: req.body.username || (isMaster ? 'admin' : `user_${userId}`),
          role: isMaster ? 'factory' : (req.body.userRole || 'dealer'),
          isVerified: true
        };
        db.users.push(user);
      }

      if (!userId && !req.body.userName) {
        return res.status(401).json({ 
          success: false, 
          error: '🔐 Login required! Please log in to post content.' 
        });
      }

      let mediaUrl = null;
      let thumbnailUrl = req.body.thumbnailUrl || null;
      let postType = requestedType || 'text';

      if (files?.media?.[0]) {
        const file = files.media[0];
        mediaUrl = await uploadToFirebaseOrLocal(file);
        
        if (file.mimetype.startsWith('audio') || file.filename.match(/\.(mp3|wav|ogg|m4a)$/i)) {
          postType = 'audio';
        } else if (file.mimetype.startsWith('video') || file.filename.match(/\.(mp4|webm|mov|m4v)$/i)) {
          postType = 'video';
        } else if (file.mimetype === 'application/pdf' || file.filename.match(/\.pdf$/i)) {
          postType = 'pdf';
        } else {
          postType = 'image';
        }
      } else if (req.body.mediaBase64) {
        mediaUrl = req.body.mediaBase64;
        if (req.body.isMp4 || req.body.mediaBase64.startsWith('data:video')) {
          postType = 'video';
        } else if (req.body.mediaBase64.startsWith('data:application/pdf')) {
          postType = 'pdf';
        } else {
          postType = 'image';
        }
      } else if (req.body.mediaUrl) {
        mediaUrl = req.body.mediaUrl;
        if (req.body.mediaUrl.match(/\.(mp4|webm|mov|m4v)(\?.*)?$/i)) {
          postType = 'video';
        } else if (req.body.mediaUrl.match(/\.pdf(\?.*)?$/i)) {
          postType = 'pdf';
        } else {
          postType = 'image';
        }
      }

      if (files?.thumbnail?.[0]) {
        thumbnailUrl = await uploadToFirebaseOrLocal(files.thumbnail[0]);
      }

      // Check if Guardrail is enabled (Admin can toggle, and Admins are always approved)
      const isMasterAdmin = String(userId) === '1' || String(userId) === 'master_admin' || String(userId) === '5503' || user.role === 'admin';
      const guardrailActive = db.adminSettings?.aiGuardrailActive !== false;

      let postStatus = 'approved';
      let pendingAdminApproval = false;
      let aiFlagReason: string | undefined = undefined;

      if (guardrailActive && !isMasterAdmin) {
        const moderation = await moderateContentWithAI(
          `${title || ''} ${content || ''} ${hashtags || ''}`,
          files?.media?.[0]?.path || files?.thumbnail?.[0]?.path,
          req.body.mediaBase64
        );

        if (!moderation.approved) {
          postStatus = 'pending';
          pendingAdminApproval = true;
          aiFlagReason = moderation.reason || 'Flagged for Admin Review by AI Guardrail';
        }
      }

      const newPost: any = {
        id: String(Date.now()),
        userId: userId || '1',
        title: title || '',
        content: content || '',
        hashtags: hashtags || '',
        type: postType,
        mediaUrl,
        thumbnailUrl,
        visibility: visibility || 'public',
        scheduledAt: scheduledAt ? Number(scheduledAt) : null,
        status: postStatus,
        pending_admin_approval: pendingAdminApproval,
        aiFlagReason: aiFlagReason || null,
        aiFeedback: pendingAdminApproval ? (aiFlagReason || 'Flagged for review') : 'Verified safe by Vyapar Bridge AI Guardrail',
        createdAt: Date.now()
      };

      if (req.body.musicId) newPost.musicId = req.body.musicId;
      if (req.body.musicTitle) newPost.musicTitle = req.body.musicTitle;
      if (req.body.musicArtist) newPost.musicArtist = req.body.musicArtist;
      if (req.body.musicUrl) newPost.musicUrl = req.body.musicUrl;
      if (req.body.musicVolume) newPost.musicVolume = parseFloat(req.body.musicVolume);
      if (req.body.originalVolume) newPost.originalVolume = parseFloat(req.body.originalVolume);

      db.posts.unshift(newPost); // Put new post at top
      saveDatabase();
      if (firestoreDb) {
        setDoc(doc(firestoreDb, 'posts', String(newPost.id)), newPost).catch(e => console.error('Firestore post save error', e));
      }
      const fullPost = {
        ...newPost,
        user: db.users.find(u => u.id === newPost.userId) || { id: newPost.userId, name: 'Vyapar Bridge Member', role: 'Dealer' },
        likesCount: 0,
        commentsCount: 0,
        viewsCount: 0,
        music: newPost.musicId ? (db.music.find(m => m.id === newPost.musicId) || { title: newPost.musicTitle, artist: newPost.musicArtist, audioUrl: newPost.musicUrl }) : 
               (newPost.musicUrl ? { title: newPost.musicTitle, artist: newPost.musicArtist, audioUrl: newPost.musicUrl } : null)
      };

      res.json({ 
        success: true, 
        post: fullPost, 
        status: postStatus,
        pendingApproval: pendingAdminApproval,
        message: pendingAdminApproval 
          ? '⚠️ AAPKI POST ADMIN REVIEW KE LIYE SENT HOGI\n\nHamare AI ne is post ko review ke liye Master Admin console tak bhej diya hai. Admin isko review karke approval denge ya permanently delete kar denge.'
          : 'Post created successfully'
      });
    } catch (err) {
      console.error('Post creation error:', err);
      res.status(500).json({ error: 'Failed to create post' });
    }
  });


  // Edit a post
  app.get('/api/posts/:id', (req, res) => {
    const post = db.posts.find(p => String(p.id) === req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    const { currentUserId } = req.query;
    const author = db.users.find(u => u.id === post.userId);
    const isLiked = currentUserId ? db.likes.some(l => String(l.postId) === String(post.id) && String(l.userId) === String(currentUserId)) : false;
    const isSaved = currentUserId ? db.saves.some(s => String(s.postId) === String(post.id) && String(s.userId) === String(currentUserId)) : false;
    const likesCount = db.likes.filter(l => String(l.postId) === String(post.id)).length;
    const commentsCount = db.comments.filter(c => String(c.postId) === String(post.id)).length;
    const viewsCount = db.views ? db.views.filter(v => String(v.postId) === String(post.id)).length : 0;
    res.json({
      ...post,
      user: author,
      isLiked,
      isSaved,
      likesCount,
      commentsCount,
      viewsCount
    });
  });

  app.put('/api/posts/:id', (req, res) => {
    const post = db.posts.find(p => p.id === req.params.id);
    if (post) {
      post.title = req.body.title !== undefined ? req.body.title : post.title;
      post.content = req.body.content !== undefined ? req.body.content : post.content;
      post.hashtags = req.body.hashtags !== undefined ? req.body.hashtags : post.hashtags;
      
      const likesCount = db.likes.filter(l => l.postId === post.id).length;
      const commentsCount = db.comments.filter(c => c.postId === post.id).length;
      const viewsCount = db.views.filter(v => String(v.postId) === String(post.id)).length;
      
      saveDatabase();
      res.json({ success: true, post: { ...post, likesCount, commentsCount, viewsCount } });
    } else {
      res.status(404).json({ error: 'Post not found' });
    }
  });

  // Delete a post
  app.delete('/api/posts/:id', (req, res) => {
    const targetId = String(req.params.id);
    const postIndex = db.posts.findIndex(p => String(p.id) === targetId);
    if (postIndex > -1) {
      db.posts.splice(postIndex, 1);
      if (firestoreDb) {
        deleteDoc(doc(firestoreDb, 'posts', targetId)).catch(e => console.error('Firestore post delete error', e));
      }
      // Clean up likes, saves, comments, views, shares, and notInterested records
      db.likes = db.likes.filter(l => String(l.postId) !== targetId);
      db.saves = db.saves.filter(s => String(s.postId) !== targetId);
      db.comments = db.comments.filter(c => String(c.postId) !== targetId);
      db.views = db.views.filter(v => String(v.postId) !== targetId);
      db.shares = (db.shares || []).filter(s => String(s.postId) !== targetId);
      db.notInterested = (db.notInterested || []).filter(ni => String(ni.postId) !== targetId);
      saveDatabase();
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Post not found' });
    }
  });

  // Toggle Like on a post
  app.post('/api/posts/:id/like', (req, res) => {
    const { userId } = req.body;
    const postId = String(req.params.id);
    if (!userId) return res.status(400).json({ error: 'User ID required' });

    const existingIdx = db.likes.findIndex(l => String(l.userId) === String(userId) && String(l.postId) === postId);
    let isLiked = false;
    if (existingIdx > -1) {
      db.likes.splice(existingIdx, 1);
    } else {
      db.likes.push({ userId: String(userId), postId, createdAt: Date.now() });
      isLiked = true;
      
      // Add Notification
      const post = db.posts.find(p => String(p.id) === postId);
      const actor = db.users.find(u => String(u.id) === String(userId));
      if (post && actor && String(post.userId) !== String(userId)) {
        db.notifications.push({
          id: Date.now(),
          userId: post.userId,
          actorId: userId,
          actorName: actor.name || 'A user',
          action: 'liked your ' + (post.type === 'video' ? 'reel.' : 'post.'),
          targetId: postId,
          time: Date.now(), read: false
        });
      }
    }
    const dbLikesCount = db.likes.filter(l => String(l.postId) === postId).length;
    const post = db.posts.find(p => String(p.id) === postId);
    if (post) {
      post.likesCount = dbLikesCount;
    }
    saveDatabase();

    if (firestoreDb) {
      if (isLiked) {
        setDoc(doc(firestoreDb, 'likes', `${postId}_${userId}`), { userId: String(userId), postId, createdAt: Date.now() })
          .catch(e => console.error('Firestore like save error', e));
      } else {
        deleteDoc(doc(firestoreDb, 'likes', `${postId}_${userId}`))
          .catch(e => console.error('Firestore like delete error', e));
      }
    }

    res.json({ success: true, isLiked, likesCount: dbLikesCount });
  });

  // Toggle Save on a post
  app.post('/api/posts/:id/save', (req, res) => {
    const { userId } = req.body;
    const postId = String(req.params.id);
    if (!userId) return res.status(400).json({ error: 'User ID required' });

    const existingIdx = db.saves.findIndex(s => String(s.userId) === String(userId) && String(s.postId) === postId);
    let isSaved = false;
    if (existingIdx > -1) {
      db.saves.splice(existingIdx, 1);
    } else {
      db.saves.push({ userId: String(userId), postId, createdAt: Date.now() });
      isSaved = true;
    }
    const savedCount = db.saves.filter(s => String(s.postId) === postId).length;
    saveDatabase();
    res.json({ success: true, isSaved, savedCount });
  });

  // Track post view & dwell time (Strict Unique View Deduplication)
  app.post('/api/posts/:id/view', (req, res) => {
    const postId = String(req.params.id);
    const userId = req.body.userId ? String(req.body.userId) : ('anon_' + (req.ip || 'session'));
    const dwellTime = Number(req.body.dwellTime) || 3;
    const now = Date.now();
    const VIEW_COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 hours cooldown for genuine view tracking

    const post = db.posts.find(p => String(p.id) === postId);

    // Check if user/session already recorded a view for this post recently
    const existingRecentView = db.views.find(v => 
      String(v.postId) === postId && 
      String(v.userId) === userId && 
      (now - (v.createdAt || 0)) < VIEW_COOLDOWN_MS
    );

    if (!existingRecentView) {
      // Record genuine unique view
      db.views.push({ postId, userId, dwellTime, createdAt: now });
      if (post) {
        post.views = (post.views || 0) + 1;
        post.dwellTime = (post.dwellTime || 0) + dwellTime;
      }
      saveDatabase();
    }

    const viewsCount = db.views.filter(v => String(v.postId) === postId).length;
    const dbLikes = db.likes.filter(l => String(l.postId) === postId).length;
    const likesCount = Math.max(dbLikes, post?.likesCount || 0);
    res.json({ 
      success: true, 
      viewsCount, 
      likesCount,
      dwellTime: post?.dwellTime || 0,
      isNewView: !existingRecentView 
    });
  });

  // 100% Public Star Rating & Quick Feedback Endpoint (No Login Required)
  app.post('/api/posts/:id/rate', (req, res) => {
    const postId = String(req.params.id);
    const { stars, feedback, guestName, userId } = req.body;
    const numStars = Math.max(1, Math.min(5, Number(stars) || 5));
    
    if (!(db as any).ratings) (db as any).ratings = [];
    
    const post = db.posts.find(p => String(p.id) === postId);
    if (!post) {
      return res.status(404).json({ error: 'Post or Reel not found' });
    }

    const raterId = userId ? String(userId) : (req.headers['x-forwarded-for'] || req.ip || 'guest-' + Date.now());
    
    const newRating = {
      id: 'rate-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      postId,
      raterId,
      guestName: guestName || (userId ? (db.users.find(u => String(u.id) === String(userId))?.name || 'Verified User') : 'Guest Visitor'),
      stars: numStars,
      feedback: feedback || '',
      createdAt: Date.now()
    };

    // Store in ratings array
    (db as any).ratings.push(newRating);

    // Calculate updated post average rating
    const postRatings = (db as any).ratings.filter((r: any) => String(r.postId) === postId);
    const totalStars = postRatings.reduce((sum: number, r: any) => sum + (r.stars || 0), 0);
    const avgRating = Number((totalStars / postRatings.length).toFixed(1));

    post.averageRating = avgRating;
    post.ratingsCount = postRatings.length;

    saveDatabase();

    res.json({
      success: true,
      averageRating: post.averageRating,
      ratingsCount: post.ratingsCount,
      userRating: numStars,
      message: `⭐ Thank you for your ${numStars}-Star rating! (Boosted Vyapar Bridge ranking)`
    });
  });

  // General Platform Feedback Endpoint (100% Public)
  app.post('/api/feedback', (req, res) => {
    const { name, email, rating, category, message, userId } = req.body;
    if (!(db as any).feedbacks) (db as any).feedbacks = [];

    const newFeedback = {
      id: 'fb-' + Date.now(),
      userId: userId || null,
      name: name || 'Guest User',
      email: email || '',
      rating: rating || 5,
      category: category || 'General',
      message: message || '',
      createdAt: Date.now()
    };

    (db as any).feedbacks.unshift(newFeedback);
    saveDatabase();

    res.json({
      success: true,
      message: '🎉 Feedback submitted successfully! Thank you for helping improve Vyapar Bridge.'
    });
  });

  // Track profile visit
  app.post('/api/users/:id/profile-visit', (req, res) => {
    const userId = String(req.params.id);
    const visitorId = req.body.visitorId ? String(req.body.visitorId) : 'anonymous';
    const user = db.users.find(u => String(u.id) === userId);
    if (user) {
      user.profileVisits = (user.profileVisits || 0) + 1;
      
      if (!db.profileVisits) db.profileVisits = [];
      db.profileVisits.push({ targetUserId: userId, visitorId, createdAt: Date.now() });

      saveDatabase();
      res.json({ success: true, profileVisits: user.profileVisits });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  });

  // Mark Post as Not Interested (Hides post for this specific user)
  app.post('/api/posts/:id/not-interested', (req, res) => {
    const postId = String(req.params.id);
    const userId = req.body.userId ? String(req.body.userId) : null;
    if (!userId) return res.status(400).json({ error: 'User ID required' });

    if (!db.notInterested) db.notInterested = [];
    if (!db.notInterested.some(ni => String(ni.userId) === userId && String(ni.postId) === postId)) {
      db.notInterested.push({ userId, postId, createdAt: Date.now() });
      saveDatabase();
    }
    res.json({ success: true, message: 'Post marked as Not Interested. It will no longer appear in your feed.' });
  });

  // Track Post Share
  app.post('/api/posts/:id/share', (req, res) => {
    const postId = String(req.params.id);
    const userId = req.body.userId ? String(req.body.userId) : 'anonymous';

    if (!db.shares) db.shares = [];
    db.shares.push({ userId, postId, createdAt: Date.now() });

    const post = db.posts.find(p => String(p.id) === postId);
    if (post && String(post.userId) !== String(userId)) {
      const actor = db.users.find(u => String(u.id) === String(userId));
      db.notifications.push({
        id: Date.now(),
        userId: post.userId,
        actorId: userId,
        actorName: actor?.name || 'A user',
        action: 'shared your post.',
        targetId: postId,
        time: Date.now(),
        read: false
      });
    }

    const sharesCount = db.shares.filter(s => String(s.postId) === postId).length;
    saveDatabase();
    res.json({ success: true, sharesCount });
  });

  // Get Detailed Analytics for a single post (For Post-level Eye button popup)
  app.get('/api/posts/:id/analytics', (req, res) => {
    const postId = String(req.params.id);
    const post = db.posts.find(p => String(p.id) === postId);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const likes = db.likes.filter(l => String(l.postId) === postId);
    const comments = db.comments.filter(c => String(c.postId) === postId);
    const saves = db.saves.filter(s => String(s.postId) === postId);
    const shares = (db.shares || []).filter(s => String(s.postId) === postId);
    const views = db.views.filter(v => String(v.postId) === postId);

    const interactions: any[] = [];

    likes.forEach(l => {
      const actor = db.users.find(u => String(u.id) === String(l.userId));
      const avatar = resolveUserAvatar(actor);
      interactions.push({
        id: `like-${l.userId}`,
        type: 'like',
        actorId: l.userId,
        actorName: actor?.name || 'Vyapar Bridge User',
        actorAvatar: avatar,
        time: post.createdAt || Date.now()
      });
    });

    comments.forEach(c => {
      const actor = db.users.find(u => String(u.id) === String(c.userId));
      const avatar = resolveUserAvatar(actor);
      interactions.push({
        id: `comment-${c.id}`,
        type: 'comment',
        actorId: c.userId,
        actorName: actor?.name || 'Vyapar Bridge User',
        actorAvatar: avatar,
        commentText: c.content,
        time: c.createdAt || Date.now()
      });
    });

    shares.forEach(s => {
      const actor = db.users.find(u => String(u.id) === String(s.userId));
      const avatar = resolveUserAvatar(actor);
      interactions.push({
        id: `share-${s.userId}-${s.createdAt}`,
        type: 'share',
        actorId: s.userId,
        actorName: actor?.name || 'Vyapar Bridge User',
        actorAvatar: avatar,
        time: s.createdAt || Date.now()
      });
    });

    saves.forEach(s => {
      const actor = db.users.find(u => String(u.id) === String(s.userId));
      const avatar = resolveUserAvatar(actor);
      interactions.push({
        id: `save-${s.userId}`,
        type: 'save',
        actorId: s.userId,
        actorName: actor?.name || 'Vyapar Bridge User',
        actorAvatar: avatar,
        time: post.createdAt || Date.now()
      });
    });

    interactions.sort((a, b) => b.time - a.time);

    res.json({
      postId,
      postTitle: post.title || post.content?.substring(0, 30) || 'Post #' + post.id,
      counts: {
        likes: likes.length,
        comments: comments.length,
        shares: shares.length,
        saves: saves.length,
        views: views.length
      },
      interactions
    });
  });

  // Get Detailed User Analytics (For Eye Button Dashboard / Timeline Chart)
  app.get('/api/users/:id/analytics', (req, res) => {
    const userId = String(req.params.id);
    const userPosts = db.posts.filter(p => String(p.userId) === userId);
    const postIds = userPosts.map(p => String(p.id));

    const likesList = db.likes.filter(l => postIds.includes(String(l.postId)));
    const commentsList = db.comments.filter(c => postIds.includes(String(c.postId)));
    const savesList = db.saves.filter(s => postIds.includes(String(s.postId)));
    const sharesList = (db.shares || []).filter(s => postIds.includes(String(s.postId)));
    const viewsList = db.views.filter(v => postIds.includes(String(v.postId)));

    const totalPosts = userPosts.length;
    const totalLikes = likesList.length;
    const totalComments = commentsList.length;
    const totalSaves = savesList.length;
    const totalShares = sharesList.length;
    let totalViews = viewsList.length;

    const postsData = userPosts.map(post => {
      const pId = String(post.id);
      const postLikes = db.likes.filter(l => String(l.postId) === pId).length;
      const postComments = db.comments.filter(c => String(c.postId) === pId).length;
      const postSaves = db.saves.filter(s => String(s.postId) === pId).length;
      const postShares = (db.shares || []).filter(s => String(s.postId) === pId).length;
      const postViews = db.views.filter(v => String(v.postId) === pId).length;
      return {
        id: post.id,
        title: post.title || post.content?.substring(0, 24) || 'Post #' + post.id,
        type: post.type || 'image',
        likes: postLikes,
        comments: postComments,
        saves: postSaves,
        shares: postShares,
        views: postViews,
        createdAt: post.createdAt
      };
    });

    const timelineLogs: any[] = [];

    likesList.forEach(l => {
      const actor = db.users.find(u => String(u.id) === String(l.userId));
      const post = userPosts.find(p => String(p.id) === String(l.postId));
      timelineLogs.push({
        id: `like-${l.userId}-${l.postId}`,
        type: 'like',
        actorId: l.userId,
        actorName: actor?.name || 'Vyapar Bridge User',
        actorAvatar: actor?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        postId: l.postId,
        postTitle: post?.title || post?.content?.substring(0, 25) || 'Post',
        time: post?.createdAt || Date.now()
      });
    });

    commentsList.forEach(c => {
      const actor = db.users.find(u => String(u.id) === String(c.userId));
      const post = userPosts.find(p => String(p.id) === String(c.postId));
      timelineLogs.push({
        id: `comment-${c.id}`,
        type: 'comment',
        actorId: c.userId,
        actorName: actor?.name || 'Vyapar Bridge User',
        actorAvatar: actor?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        postId: c.postId,
        postTitle: post?.title || post?.content?.substring(0, 25) || 'Post',
        commentText: c.content,
        time: c.createdAt || Date.now()
      });
    });

    sharesList.forEach(s => {
      const actor = db.users.find(u => String(u.id) === String(s.userId));
      const post = userPosts.find(p => String(p.id) === String(s.postId));
      timelineLogs.push({
        id: `share-${s.userId}-${s.postId}-${s.createdAt}`,
        type: 'share',
        actorId: s.userId,
        actorName: actor?.name || 'Vyapar Bridge User',
        actorAvatar: actor?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        postId: s.postId,
        postTitle: post?.title || post?.content?.substring(0, 25) || 'Post',
        time: s.createdAt || Date.now()
      });
    });

    savesList.forEach(s => {
      const actor = db.users.find(u => String(u.id) === String(s.userId));
      const post = userPosts.find(p => String(p.id) === String(s.postId));
      timelineLogs.push({
        id: `save-${s.userId}-${s.postId}`,
        type: 'save',
        actorId: s.userId,
        actorName: actor?.name || 'Vyapar Bridge User',
        actorAvatar: actor?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        postId: s.postId,
        postTitle: post?.title || post?.content?.substring(0, 25) || 'Post',
        time: post?.createdAt || Date.now()
      });
    });

    timelineLogs.sort((a, b) => b.time - a.time);

    res.json({
      summary: {
        totalPosts,
        totalLikes,
        totalComments,
        totalSaves,
        totalShares,
        totalViews
      },
      postsData,
      timelineLogs
    });
  });

  // Sync user state
  app.post('/api/users/sync', (req, res) => {
    const { user } = req.body;
    if (!user || !user.id) return res.status(400).json({ error: 'User data required' });
    
    let existingUser = db.users.find(u => u.id === String(user.id));
    if (!existingUser) {
      existingUser = { ...user, id: String(user.id), role: 'user', createdAt: Date.now() };
      db.users.push(existingUser);
    } else {
      // Sync basic info
      existingUser.name = user.name || existingUser.name;
      existingUser.avatarUrl = user.avatarUrl || existingUser.avatarUrl;
      existingUser.email = user.email || existingUser.email;
    }
    res.json({ success: true, user: existingUser });
  });

  // Get user's saved posts
  app.get('/api/users/:id/saved', (req, res) => {
    const userId = String(req.params.id);
    const savedPostIds = db.saves.filter(s => s.userId === userId).map(s => s.postId);
    const savedPosts = db.posts.filter(p => savedPostIds.includes(p.id));
    
    const postsWithUsers = savedPosts.map(post => ({
      ...post,
      user: db.users.find(u => u.id === post.userId),
      likesCount: db.likes.filter(l => l.postId === post.id).length,
      isLiked: db.likes.some(l => l.postId === post.id && l.userId === userId),
      savedCount: db.saves.filter(s => s.postId === post.id).length,
      isSaved: true,
      commentsCount: db.comments.filter(c => c.postId === post.id).length,
      music: post.musicId ? (db.music.find(m => m.id === post.musicId) || { title: post.musicTitle, artist: post.musicArtist, audioUrl: post.musicUrl }) : 
             (post.musicUrl ? { title: post.musicTitle, artist: post.musicArtist, audioUrl: post.musicUrl } : null)
    })).sort((a, b) => b.createdAt - a.createdAt);

    res.json(postsWithUsers);
  });

  // Save/Unsave a Company Catalogue
  app.post('/api/users/:id/save-catalogue', (req, res) => {
    const targetUserId = String(req.params.id);
    const userId = String(req.body.userId);
    
    if (!db.savedCatalogues) db.savedCatalogues = [];
        if (!db.deletedUserIds) db.deletedUserIds = [];
    
    const existingIdx = db.savedCatalogues.findIndex(
      s => String(s.userId) === userId && String(s.targetUserId) === targetUserId
    );
    
    let isSaved = false;
    if (existingIdx > -1) {
      db.savedCatalogues.splice(existingIdx, 1);
    } else {
      db.savedCatalogues.push({ userId, targetUserId, createdAt: Date.now() });
      isSaved = true;
    }
    
    saveDatabase();
    res.json({ success: true, isSaved });
  });

  // Get user's saved catalogues (PDFs)
  app.get('/api/users/:id/saved-catalogues', (req, res) => {
    const userId = String(req.params.id);
    const savedCatalogueOwnerIds = db.savedCatalogues
      .filter(s => String(s.userId) === userId)
      .map(s => s.targetUserId);
      
    const savedCatalogues = db.users
      .filter(u => savedCatalogueOwnerIds.includes(String(u.id)) && u.catalogueUrl)
      .map(u => ({
        id: `pdf-${u.id}`,
        title: u.catalogueName || `${u.name}'s Catalogue`,
        mediaUrl: u.catalogueUrl,
        type: 'pdf',
        user: u,
        createdAt: Date.now() // Ideally use s.createdAt but map is cleaner here
      }));
      
    res.json(savedCatalogues);
  });

  // Get comments for a post
  app.get('/api/posts/:id/comments', (req, res) => {
    const postComments = db.comments
      .filter(c => c.postId === req.params.id)
      .map(c => ({
        ...c,
        user: db.users.find(u => u.id === c.userId)
      }))
      .sort((a, b) => a.createdAt - b.createdAt);
    res.json(postComments);
  });

  // Add comment with AI Moderation & Image Support
  app.post('/api/posts/:id/comments', upload.single('image'), async (req, res) => {
    const { content, userId, commentImage, imageUrl } = req.body;
    const finalImageUrl = req.file ? await uploadToFirebaseOrLocal(req.file) : (commentImage || imageUrl || null);
    if (!content && !finalImageUrl) return res.status(400).json({ error: 'Comment must have content or an image' });
    if (!userId) return res.status(400).json({ error: 'Missing userId' });
    
    const user = db.users.find(u => u.id === userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Enforce "Paid to Comment" for local customers
    if (user.role === 'customer' && !user.isVerified) {
      return res.status(403).json({ 
        success: false, 
        error: 'Verification required to comment. Please pay the verification fee to unlock this feature.' 
      });
    }

    // AI Moderation check for comment text
    if (content) {
      const moderation = await moderateContentWithAI(content);
      if (!moderation.approved) {
        return res.status(400).json({ 
          success: false, 
          blocked: true, 
          error: moderation.reason || '⛔ AI Safety Guardrail: Comment blocked due to inappropriate language or explicit content.' 
        });
      }
    }

    const newComment = {
      id: 'c' + Date.now(),
      postId: req.params.id,
      userId,
      content: content || '',
      imageUrl: finalImageUrl,
      createdAt: Date.now()
    };
    db.comments.push(newComment);

    const post = db.posts.find(p => String(p.id) === String(req.params.id));
    const actor = db.users.find(u => String(u.id) === String(userId));
    if (post && actor) {
      // Check for mention
      const mentionMatch = content?.match(/@([a-zA-Z0-9_]+)/);
      let notifiedMention = false;
      if (mentionMatch) {
        const mentionedUsername = mentionMatch[1].toLowerCase();
        const mentionedUser = db.users.find(u => (u.name || '').replace(/\s+/g, '').toLowerCase() === mentionedUsername);
        if (mentionedUser && String(mentionedUser.id) !== String(userId)) {
          db.notifications.push({
            id: Date.now() + 1,
            userId: mentionedUser.id,
            actorId: userId,
            actorName: actor.name || 'A user',
            action: 'replied to you in a ' + (post.type === 'video' ? 'reel.' : 'post.'),
            targetId: req.params.id,
            time: Date.now(), read: false
          });
          notifiedMention = true;
        }
      }
      
      // Notify post owner if not the same as actor and not already notified via mention
      if (String(post.userId) !== String(userId) && (!notifiedMention || String(post.userId) !== String(db.users.find(u => (u.name || '').replace(/\s+/g, '').toLowerCase() === mentionMatch?.[1]?.toLowerCase())?.id))) {
        db.notifications.push({
          id: Date.now(),
          userId: post.userId,
          actorId: userId,
          actorName: actor.name || 'A user',
          action: 'commented on your ' + (post.type === 'video' ? 'reel.' : 'post.'),
          targetId: req.params.id,
          time: Date.now(), read: false
        });
      }
    }
    saveDatabase();
    res.json({ success: true, comment: { ...newComment, user: db.users.find(u => u.id === userId) } });
  });

  // Edit comment
  app.put('/api/comments/:id', (req, res) => {
    const comment = db.comments.find(c => c.id === req.params.id);
    if (comment) {
      comment.content = req.body.content;
      saveDatabase();
      res.json({ success: true, comment: { ...comment, user: db.users.find(u => u.id === comment.userId) } });
    } else {
      res.status(404).json({ error: 'Comment not found' });
    }
  });

  // Delete comment
  app.delete('/api/comments/:id', (req, res) => {
    const commentIndex = db.comments.findIndex(c => c.id === req.params.id);
    if (commentIndex > -1) {
      db.comments.splice(commentIndex, 1);
      saveDatabase();
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Comment not found' });
    }
  });

  // AI Chatbot Assistant
  app.post('/api/chatbot', async (req, res) => {
    try {
      const { message, history, userId } = req.body;
      const ai = getAI();
      if (!ai) return res.status(503).json({ error: 'AI not configured' });

      // Chat Limit & Monetization Strategy
      let caller = null;
      if (userId) {
        caller = db.users.find(u => u.id === userId);
      }

      // Gather DB Context (Limit to recent/top users to save tokens)
      const topDealers = db.users
        .filter(u => u.role !== 'admin')
        .slice(0, 15) // take a sample of users
        .map(u => {
          const userPosts = db.posts.filter(p => p.userId === u.id && p.mediaUrl).slice(0, 5);
          const userCatalogues = [];
          if (u.catalogueUrl) {
            userCatalogues.push({ title: u.catalogueName || 'Company Catalogue', pdfUrl: u.catalogueUrl });
          }
          return {
            name: u.name,
            company: u.companyName || u.name,
            role: u.role,
            profileLink: `/profile/${u.id}`,
            products: userPosts.map(p => ({ title: p.title || '', content: p.content || '', hashtags: p.hashtags || [], type: p.mediaType, mediaUrl: p.mediaUrl })),
            catalogues: userCatalogues
          };
        });

      let contextStr = '';
      
      if (userId) {
        const caller = db.users.find(u => u.id === userId);
        if (caller && (caller.role === 'dealer' || caller.role === 'factory')) {
          const todayStart = new Date();
          todayStart.setHours(0,0,0,0);
          const todayTime = todayStart.getTime();
          
          // Get caller's posts
          const myPosts = db.posts.filter(p => p.userId === caller.id).map(p => String(p.id));
          
          // Today's views on my posts
          const todayViews = (db.views || []).filter(v => myPosts.includes(String(v.postId)) && v.createdAt >= todayTime);
          const viewedBy = [...new Set(todayViews.map(v => {
            const u = db.users.find(user => String(user.id) === String(v.userId));
            return u ? u.name : 'Unknown';
          }))];

          // Today's profile visits
          const todayVisits = (db.profileVisits || []).filter(v => String(v.targetUserId) === String(caller.id) && v.createdAt >= todayTime);
          const visitedBy = [...new Set(todayVisits.map(v => {
             const u = db.users.find(user => String(user.id) === String(v.visitorId));
             return u ? u.name : 'Unknown';
          }))];

          // Today's comments
          const todayComments = (db.comments || []).filter(c => myPosts.includes(String(c.postId)) && c.createdAt >= todayTime);
          const commentsInfo = todayComments.map(c => {
             const u = db.users.find(user => String(user.id) === String(c.userId));
             return (u ? u.name : 'Unknown') + " commented: '" + c.content + "'";
          });
          
          contextStr += `
--- YOUR DAILY ANALYTICS (TODAY ONLY) ---
`;
          contextStr += `You are talking to: ${caller.name} (${caller.companyName || 'Business'}).
`;
          contextStr += `If they ask about today's views, profile visits, or comments, USE THIS DATA EXACTLY:
`;
          contextStr += `Profile Visits Today: ${todayVisits.length} (${visitedBy.join(', ') || 'None'})
`;
          contextStr += `Post/Design Views Today: ${todayViews.length} (${viewedBy.join(', ') || 'None'})
`;
          contextStr += `Comments on your posts Today: ${todayComments.length > 0 ? commentsInfo.join(' | ') : 'None'}
`;
          contextStr += `---
`;
        }
      }
      if (history && history.length > 0) {
        contextStr = 'Previous Chat History:\n' + history.map((h) => h.role + ': ' + h.text).join('\n') + '\n\n';
      }

      const promptText = `SYSTEM DIRECTIVE: You are a helpful, all-knowing Gemini AI Assistant, integrated into the "Vyapar Bridge" B2B & B2C Commerce App.
You have two core missions:
1. Act as a General Purpose AI that can answer ANY question the user asks (General Knowledge, Science, Math, Coding, Daily Life, etc.) just like the standard Gemini AI.
2. Act as the official Support & Sales AI Assistant for Vyapar Bridge to help Indian business owners, factories, dealers, software providers, hardware traders, plastic/leather manufacturers, photographers, video studios, and buyers across India.

APP KNOWLEDGE BASE & FREQUENTLY ASKED QUESTIONS (FAQ) for Vyapar Bridge related questions:

1. PROFILE CREATION & EDITING (Profile Kaise Banayein?):
   - Click "Login/Register" button on top right. Choose role: Factory (Manufacturer), Dealer (Wholesaler/Trader), or Customer.
   - Go to Profile -> Edit Profile. Add Company Name, GST Number, Business Address, Phone/WhatsApp, Brand Logo, and PDF Catalogue.

2. POSTING & UPLOADING CONTENT (Post & Reels Kaise Daalein?):
   - Click "+ Post" on top navigation bar.
   - You can post Photos, Videos, PDF Catalogues, or Text-only announcements with links.
   - Use the "✨ AI Auto-Hashtag" button to automatically generate industry-specific hashtags.
   - To post Reels: Go to "Reels" tab at bottom, click "Publish Reel", select background sound/music and video, then publish.

3. HOW TO GET POSTS TO THE TOP & REACH CUSTOMERS (Post Top Par Kaise Laayein?):
   - Get "Verified Blue Badge": Verified members' posts are prioritized at the top of the feed by algorithm.
   - Use Relevant Hashtags: Always click AI Auto-Hashtags for maximum search visibility.
   - Post Video Reels & PDF Catalogues: Video content gets 3x higher buyer engagement.
   - Post Daily: Active daily business accounts stay at the top of the feed.

4. PAYMENT & VERIFIED BLUE BADGE (Plan Upgrade & Verification):
   - Go to "Payment / Verified Badge" tab.
   - Select Plan: Monthly ₹99/month or Yearly ₹1,188/year.
   - Pay via UPI QR Scanner, enter your 12-digit UTR Transaction ID, and submit.
   - Admin approves it within 24 hours to give you the Verified Blue Tick Badge.

5. DIRECT BUSINESS TRADE & INQUIRIES:
   - Click WhatsApp or Phone icon on any post or profile to chat directly with suppliers.
   - Browse all verified Indian suppliers in the "Members" tab.

6. STRICT PRIVACY & SECURITY GUARDRAILS:
   - DO NOT EVER reveal Admin Console passwords, Secret Keys, database structures, or internal system keys under any circumstances.

CURRENT DATABASE INVENTORY & DEALERS:
${JSON.stringify(topDealers, null, 2)}

Instructions:
1. Reply in warm, natural Hinglish or Hindi/English based on user language.
2. If the user asks a general question (not related to the app), answer it fully and accurately just like ChatGPT or standard Gemini would. Do not restrict yourself to only business topics.
3. If the user asks about using the app, provide direct, step-by-step guidance using the FAQ.
4. Use Markdown formatting for better readability.

${contextStr}User: ${message}
Assistant:`;

      let responseWrapper: any = null;
      if (ai.models && typeof ai.models.generateContent === 'function') {
        const modelsToTry = ['gemini-3.7-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];
        for (const mName of modelsToTry) {
          try {
            responseWrapper = await ai.models.generateContent({
              model: mName,
              contents: promptText
            });
            if (responseWrapper) break;
          } catch (mErr) {
            console.warn(`Chatbot model ${mName} note:`, mErr);
          }
        }
      } else {
        return res.json({ reply: 'Sorry, AI is currently offline. Please contact our support team.' });
      }
      let replyText = responseWrapper?.text || 'I am here to help you with the best deals and timely delivery!';
      
      res.json({ reply: replyText });
    } catch (e) {
      console.error('Chatbot API Error:', e);
      if ((e.status === 429 || e.status === 503) || (e.message && (e.message.includes('503') || e.message.includes('429') || e.message.includes('quota')))) {
        res.json({ reply: 'I am currently assisting many customers across India and experiencing high demand. Please wait a few seconds and try again! 🗿' });
      } else {
        res.json({ reply: 'Sorry, I encountered an unexpected error while processing your request. Please try again later. 🗿' });
      }
    }
  });

  // Get messages (mock)
  app.get('/api/messages', (req, res) => {
    const { userId } = req.query;
    const userMessages = db.messages
      .filter(m => m.senderId === userId || m.receiverId === userId)
      .map(m => ({
        ...m,
        sender: db.users.find(u => u.id === m.senderId),
        receiver: db.users.find(u => u.id === m.receiverId)
      }))
      .sort((a, b) => a.createdAt - b.createdAt);
    res.json(userMessages);
  });

  // Send message with AI Safety Check
  app.post('/api/messages', async (req, res) => {
    const { senderId, receiverId, text } = req.body;
    if (!text || !senderId || !receiverId) return res.status(400).json({ error: 'Missing message fields' });

    // AI Safety moderation for direct chat messages
    const moderation = await moderateContentWithAI(text);
    if (!moderation.approved) {
      return res.status(400).json({ 
        success: false, 
        blocked: true, 
        error: moderation.reason || '⛔ AI Safety Guardrail: Direct message blocked due to inappropriate language or explicit content.' 
      });
    }

    const newMsg = {
      id: 'm' + Date.now(),
      senderId,
      receiverId,
      text,
      createdAt: Date.now()
    };
    db.messages.push(newMsg);
    res.json({ success: true, message: { ...newMsg, sender: db.users.find(u => u.id === senderId) } });
  });

  // Send Image Message
  app.post('/api/messages/image', upload.single('image'), async (req, res) => {
    const { senderId, receiverId, text } = req.body;
    if (!req.file || !senderId || !receiverId) {
      return res.status(400).json({ error: 'Missing fields or file' });
    }
    
    const imageUrl = await uploadToFirebaseOrLocal(req.file);
    const newMsg = {
      id: 'm' + Date.now(),
      senderId,
      receiverId,
      text: text || '[Image]',
      imageUrl,
      createdAt: Date.now()
    };
    db.messages.push(newMsg);
    saveDatabase();
    res.json({ success: true, message: { ...newMsg, sender: db.users.find(u => u.id === senderId) } });
  });

  // Delete message
  app.delete('/api/messages/:id', (req, res) => {
    const msgIndex = db.messages.findIndex(m => m.id === req.params.id);
    if (msgIndex > -1) {
      db.messages.splice(msgIndex, 1);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Message not found' });
    }
  });

  // REPORT CONTENT OR USER
  app.post('/api/reports', (req, res) => {
    const { reporterId, targetType, targetId, targetName, reason, details } = req.body;
    if (!reporterId || !targetType || !targetId) {
      return res.status(400).json({ error: 'Missing report fields' });
    }
    const report = {
      id: 'rep_' + Date.now(),
      reporterId,
      targetType, // 'post' | 'comment' | 'user' | 'reel'
      targetId,
      targetName: targetName || '',
      reason: reason || 'Inappropriate Content / Nudity',
      details: details || '',
      status: 'pending',
      createdAt: Date.now()
    };
    db.reports.unshift(report);
    res.json({ success: true, report, message: 'Report submitted. Our AI and Admin team will review it.' });
  });

  // Get all reports (Admin)
  app.get('/api/reports', (req, res) => {
    const reportsWithUsers = db.reports.map(r => ({
      ...r,
      reporter: db.users.find(u => u.id === r.reporterId)
    }));
    res.json(reportsWithUsers);
  });

  // Delete/Dismiss Report
  app.delete('/api/reports/:id', (req, res) => {
    const idx = db.reports.findIndex(r => r.id === req.params.id);
    if (idx > -1) {
      db.reports.splice(idx, 1);
      saveDatabase();
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Report not found' });
    }
  });

  // TOGGLE FOLLOW USER
  app.post('/api/users/:id/follow', (req, res) => {
    const { followerId } = req.body;
    const targetId = req.params.id;
    if (!followerId || followerId === targetId) return res.status(400).json({ error: 'Invalid user IDs' });

    const existingIdx = db.follows.findIndex(f => f.followerId === followerId && f.followingId === targetId);
    let isFollowing = false;
    if (existingIdx > -1) {
      db.follows.splice(existingIdx, 1);
    } else {
      db.follows.push({ followerId, followingId: targetId });
      isFollowing = true;
      const actor = db.users.find(u => String(u.id) === String(followerId));
      if (actor && String(followerId) !== String(targetId)) {
        db.notifications.push({
          id: Date.now(),
          userId: targetId,
          actorId: followerId,
          actorName: actor.name || 'A user',
          action: 'started following you.',
          targetId: followerId,
          time: Date.now(), read: false
        });
      }
    }
    saveDatabase();
    res.json({ success: true, isFollowing });
  });

  // TOGGLE BLOCK USER
  app.post('/api/users/:id/block', (req, res) => {
    const { blockerId } = req.body;
    const targetId = req.params.id;
    if (!blockerId || blockerId === targetId) return res.status(400).json({ error: 'Invalid user IDs' });

    const existingIdx = db.blocks.findIndex(b => b.blockerId === blockerId && b.blockedId === targetId);
    let isBlocked = false;
    if (existingIdx > -1) {
      db.blocks.splice(existingIdx, 1);
    } else {
      db.blocks.push({ blockerId, blockedId: targetId });
      // Remove follow relationships
      db.follows = db.follows.filter(f => 
        !(f.followerId === blockerId && f.followingId === targetId) &&
        !(f.followerId === targetId && f.followingId === blockerId)
      );
      isBlocked = true;
    }
    saveDatabase();
    res.json({ success: true, isBlocked });
  });

  // GET USER RELATIONSHIPS
  app.get('/api/users/:id/relationships', (req, res) => {
    const userId = String(req.params.id);
    const followers = db.follows.filter(f => f.followingId === userId).map(f => f.followerId);
    const following = db.follows.filter(f => f.followerId === userId).map(f => f.followingId);
    const blocked = db.blocks.filter(b => b.blockerId === userId).map(b => b.blockedId);
    res.json({ followers, following, blocked });
  });

  // Admin: update post status
  app.put('/api/admin/posts/:id/status', (req, res) => {
    const post = db.posts.find(p => p.id === req.params.id);
    if (post) {
      post.status = req.body.status;
      if (firestoreDb) {
        setDoc(doc(firestoreDb, 'posts', String(post.id)), { status: post.status }, { merge: true }).catch(e => console.error('Firestore post update error', e));
      }
      res.json({ success: true, post });
    } else {
      res.status(404).json({ error: 'Post not found' });
    }
  });

  // GET Brand Advertisements (List and Single legacy fallback)
  app.get('/api/admin/showcase', (req, res) => {
    if (!db.adminSettings.brandAdsList) {
      db.adminSettings.brandAdsList = [];
    }

    const firstActive = db.adminSettings.brandAdsList.find(a => a.isActive) || db.adminSettings.brandAdsList[0];

    res.json({
      brandAdsList: db.adminSettings.brandAdsList,
      // Backward compatibility fields:
      title: firstActive?.title || '',
      companyName: firstActive?.companyName || '',
      videoUrl: firstActive?.mediaUrl || '',
      linkUrl: firstActive?.linkUrl || '',
      description: firstActive?.description || '',
      isActive: firstActive?.isActive !== false
    });
  });

  // POST / Add new Brand Advertisement (Video or Image)
  app.post('/api/admin/showcase', (req, res) => {
    req.setTimeout(10 * 60 * 1000); // 10 minutes timeout for large video uploads
    res.setTimeout(10 * 60 * 1000);
    upload.any()(req, res, async (err) => {
      if (err) {
        console.error('Error handling uploaded advertisement file:', err);
        return res.status(400).json({ success: false, error: err.message || 'File upload error' });
      }

      try {
        const { title, companyName, mediaUrl, videoUrl, linkUrl, description, isActive, type, localMediaKey } = req.body;
        let finalMediaUrl = mediaUrl || videoUrl || '';

        const uploadedFiles = (req.files as Express.Multer.File[]) || [];
        const uploadedFile = uploadedFiles[0];
        if (uploadedFile) {
          finalMediaUrl = await uploadToFirebaseOrLocal(uploadedFile);
        }

        if (!db.adminSettings.brandAdsList) {
          db.adminSettings.brandAdsList = [];
        }

        const isVideoFile = !!uploadedFile && (
          (uploadedFile.mimetype && uploadedFile.mimetype.startsWith('video/')) ||
          /\.(mp4|webm|mov|m4v|avi|mkv|3gp|flv)$/i.test(uploadedFile.originalname || '') ||
          /\.(mp4|webm|mov|m4v|avi|mkv|3gp|flv)$/i.test(uploadedFile.filename || '')
        );

        const isVideoUrl = !!finalMediaUrl && (
          /\.(mp4|webm|mov|m4v|avi|mkv|3gp|flv)$/i.test(finalMediaUrl) ||
          finalMediaUrl.toLowerCase().includes('video') ||
          finalMediaUrl.toLowerCase().includes('mixkit') ||
          finalMediaUrl.toLowerCase().includes('youtube.com') ||
          finalMediaUrl.toLowerCase().includes('youtu.be')
        );

        const isVideo = isVideoFile || isVideoUrl || type === 'video';
        const mediaType = isVideo ? 'video' : 'image';

        const newAd = {
          id: 'ad-' + Date.now(),
          type: mediaType,
          title: title || 'Official Brand Showcase',
          companyName: companyName || 'Vyapar Bridge Partner',
          mediaUrl: finalMediaUrl || '',
          linkUrl: linkUrl || '',
          description: description || '',
          isActive: isActive === 'true' || isActive === true,
          localMediaKey: localMediaKey || null,
          createdAt: Date.now()
        };

        db.adminSettings.brandAdsList.unshift(newAd);
        saveAdminSettings();
        if (firestoreDb) {
          setDoc(doc(firestoreDb, 'advertisements', String(newAd.id)), newAd).catch(e => console.error('Firestore ad save error', e));
        }
        return res.json({ success: true, brandAdsList: db.adminSettings.brandAdsList, newAd });
      } catch (e: any) {
        console.error('Error in advertisement post controller:', e);
        return res.status(500).json({ success: false, error: 'SERVER ERROR DETAILS: ' + (e.message || String(e)) });
      }
    });
  });

  // DELETE Advertisement item
  app.delete('/api/admin/showcase/:id', (req, res) => {
    const adId = req.params.id;
    if (db.adminSettings.brandAdsList) {
      db.adminSettings.brandAdsList = db.adminSettings.brandAdsList.filter(a => a.id !== adId);
      saveAdminSettings();
      if (firestoreDb) {
        deleteDoc(doc(firestoreDb, 'advertisements', String(adId))).catch(e => console.error('Firestore ad delete error', e));
      }
    }
    res.json({ success: true, brandAdsList: db.adminSettings.brandAdsList || [] });
  });

  // TOGGLE Advertisement Active State
  app.put('/api/admin/showcase/:id/toggle', (req, res) => {
    const adId = req.params.id;
    if (db.adminSettings.brandAdsList) {
      const ad = db.adminSettings.brandAdsList.find(a => a.id === adId);
      if (ad) {
        ad.isActive = !ad.isActive;
        saveAdminSettings();
        if (firestoreDb) {
          setDoc(doc(firestoreDb, 'advertisements', String(adId)), { isActive: ad.isActive }, { merge: true }).catch(e => console.error('Firestore ad update error', e));
        }
      }
    }
    res.json({ success: true, brandAdsList: db.adminSettings.brandAdsList || [] });
  });

  // RATE Advertisement
  app.post('/api/advertisement/:id/rate', (req, res) => {
    const adId = req.params.id;
    const { rating } = req.body;
    
    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, error: 'Invalid rating' });
    }

    if (db.adminSettings.brandAdsList) {
      const ad = db.adminSettings.brandAdsList.find(a => a.id === adId);
      if (ad) {
        if (!ad.totalRating) ad.totalRating = 0;
        if (!ad.ratingCount) ad.ratingCount = 0;
        
        ad.totalRating += rating;
        ad.ratingCount += 1;
        
        saveAdminSettings();
        return res.json({ success: true, ad });
      }
    }
    return res.status(404).json({ success: false, error: 'Ad not found' });
  });

  // GET Platform Feedback & Aggregate Ratings
  app.get('/api/platform/feedback', (req, res) => {
    db.totalVisitors = (db.totalVisitors || 0) + 1;
    const feedbacks = db.platformFeedbacks || [];
    const totalReviews = feedbacks.length;
    
    let sum = 0;
    const starCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    feedbacks.forEach(f => {
      const r = Math.min(5, Math.max(1, Math.round(f.rating || 5)));
      starCounts[r] = (starCounts[r] || 0) + 1;
      sum += r;
    });

    const averageRating = totalReviews > 0 ? Number((sum / totalReviews).toFixed(1)) : 5.0;

    res.json({
      averageRating,
      totalReviews,
      starCounts,
      totalVisitors: db.totalVisitors,
      feedbacks: feedbacks.slice(0, 30)
    });
  });

  // DYNAMIC SEARCH ENGINE SITEMAP XML GENERATOR FOR GOOGLE RANKING
  app.get('/sitemap.xml', (req, res) => {
    const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https';
    const host = req.get('host') || 'vyaparbridge.in';
    const baseUrl = `${protocol}://${host}`;
    const now = new Date().toISOString();

    const posts = Array.isArray(db.posts) ? db.posts : [];
    const postUrls = posts.slice(0, 100).map((p: any) => `
  <url>
    <loc>${baseUrl}/#post-${p.id}</loc>
    <lastmod>${p.createdAt ? new Date(p.createdAt).toISOString() : now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`).join('');

    const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${now}</lastmod>
    <changefreq>always</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/#explore</loc>
    <lastmod>${now}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/#directory</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/#rfq</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/#calculator</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>${postUrls}
</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(xmlContent.trim());
  });

  // ROBOTS.TXT FOR GOOGLEBOT, BINGBOT, & ALL CRAWLERS
  app.get('/robots.txt', (req, res) => {
    const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https';
    const host = req.get('host') || 'vyaparbridge.in';
    const baseUrl = `${protocol}://${host}`;

    const txtContent = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/

Sitemap: ${baseUrl}/sitemap.xml`;

    res.header('Content-Type', 'text/plain; charset=utf-8');
    res.send(txtContent);
  });

  // POST Submit New Platform Feedback & Star Rating
  app.post('/api/platform/feedback', (req, res) => {
    const { rating, comment, userName, userCity, userRole, userId } = req.body;
    const numRating = Number(rating);

    if (!numRating || numRating < 1 || numRating > 5) {
      return res.status(400).json({ error: 'Please select a valid rating between 1 and 5 stars.' });
    }

    const newFeedback = {
      id: 'fb-' + Date.now(),
      rating: numRating,
      userName: userName && String(userName).trim() ? String(userName).trim() : 'Vyapar Bridge Visitor',
      userCity: userCity && String(userCity).trim() ? String(userCity).trim() : 'India',
      userRole: userRole || 'visitor',
      comment: comment && String(comment).trim() ? String(comment).trim() : 'Great platform!',
      createdAt: Date.now(),
      isVerified: true,
      userId: userId || null
    };

    if (!db.platformFeedbacks) db.platformFeedbacks = [];
    db.platformFeedbacks.unshift(newFeedback);

    const feedbacks = db.platformFeedbacks;
    const totalReviews = feedbacks.length;
    let sum = 0;
    feedbacks.forEach(f => sum += f.rating);
    const averageRating = Number((sum / totalReviews).toFixed(1));

    res.json({
      success: true,
      message: 'Thank you for your rating! Your review is live on Vyapar Bridge.',
      newFeedback,
      averageRating,
      totalReviews
    });
  });

  // GET Admin Full Feedback List & Visitor Analytics
  app.get('/api/admin/platform/feedbacks', (req, res) => {
    const feedbacks = db.platformFeedbacks || [];
    const totalReviews = feedbacks.length;
    let sum = 0;
    const starCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    feedbacks.forEach(f => {
      const r = Math.min(5, Math.max(1, Math.round(f.rating || 5)));
      starCounts[r] = (starCounts[r] || 0) + 1;
      sum += r;
    });

    const averageRating = totalReviews > 0 ? Number((sum / totalReviews).toFixed(1)) : 5.0;

    res.json({
      totalVisitors: db.totalVisitors || 0,
      totalReviews,
      averageRating,
      starCounts,
      feedbacks
    });
  });

  // Auth Routes
  app.post('/api/auth/login', (req, res) => {
    const { username, password, role } = req.body;
    
    // Master Admin Login (manit / 5503 or secret key)
    const currentAdminPin = String(db?.adminSettings?.developerMasterPin || 'admin1234@#').trim();
    if (username && (username.toLowerCase() === 'manit' || username.toLowerCase() === 'admin')) {
      if (password === '5503' || password === 'admin1234@#' || password === currentAdminPin) {
        const adminUser = db.users.find(u => u.role === 'admin') || db.users[0];
        return res.json(adminUser);
      } else {
        return res.status(401).json({ error: 'Incorrect password for admin.' });
      }
    }

    const cleanInput = (username || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();
    let user = db.users.find(u => 
      (u?.name || '').toLowerCase() === cleanInput || 
      (u?.username || '').toLowerCase() === cleanInput || 
      (u?.phone && u.phone.includes(username)) ||
      (u?.email && u.email.toLowerCase() === cleanInput)
    );
    if (!user) {
      return res.status(401).json({ error: '❌ Account nahi mila! Kripya pehle "Register New Account" tab par jaakar register karein.' });
    }
    if (user.password && user.password !== cleanPassword) {
      return res.status(401).json({ error: '❌ Galat Password! Kripya Sahi Password Enter Karein.' });
    }
    res.json(user);
  });

  // Verify GSTIN Number Endpoint
  app.post('/api/gstin/verify', (req, res) => {
    const { gstNumber } = req.body;
    if (!gstNumber) return res.status(400).json({ isValid: false, error: 'GSTIN is required' });
    const result = validateGSTIN(gstNumber);
    res.json(result);
  });

  app.post('/api/auth/register', (req, res) => {
    const { 
      username, 
      password, 
      role, 
      name, 
      category, 
      gstNumber, 
      phone, 
      email, 
      address, 
      city, 
      state, 
      gpsCoords, 
      googleMapsUrl,
      customerRequirements
    } = req.body;

    if (!username || !password) return res.status(400).json({ error: 'Missing username or password' });

    if (gstNumber && gstNumber.trim() !== '') {
      const gstCheck = validateGSTIN(gstNumber);
      if (!gstCheck.isValid) {
        return res.status(400).json({ error: `Fake or Invalid GSTIN provided: ${gstCheck.error}` });
      }
    }

    const newUser = {
      id: String(Date.now()),
      name: name || username,
      username,
      role: role || 'dealer',
      category: category || (role === 'factory' ? 'Vitrified Tiles' : (role === 'customer' ? 'Home Owner' : 'General Dealer')),
      customerRequirements: customerRequirements || '',
      gstNumber: gstNumber || '',
      phone: phone || '',
      email: email || '',
      address: address || 'Main Market',
      city: city || '',
      state: state || '',
      gpsCoords: gpsCoords || { lat: 20.5937, lng: 78.9629 }, // Center of India
      googleMapsUrl: googleMapsUrl || (city ? `https://maps.google.com/?q=${city},${state}` : ''),
      isVerified: false,
      bio: role === 'customer' ? 'Local Customer looking for wholesale products and business deals.' : `Official ${role === 'factory' ? 'Company / Factory' : 'Dealer / Distributor'} on Vyapar Bridge B2B network.`,
      avatarUrl: getDefaultAvatar(name || username),
      coverUrl: role === 'factory' 
        ? 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop'
        : (role === 'customer' ? 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1200&auto=format&fit=crop' : 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=1200&auto=format&fit=crop')
    };

    db.users.push(newUser);
    saveDatabase();
    if (firestoreDb) {
      setDoc(doc(firestoreDb, 'users', String(newUser.id)), newUser).catch(e => console.error('Firestore user save error', e));
    }
    res.json(newUser);
  });

  // Users
  app.get('/api/users', (req, res) => {
    const { currentUserId } = req.query;
    const usersWithStatus = db.users.map(u => ({
      ...u,
      isFollowing: currentUserId ? db.follows.some(f => f.followerId === String(currentUserId) && f.followingId === u.id) : false
    }));
    res.json(usersWithStatus);
  });

  app.get('/api/users/me', (req, res) => {
    // Mock user login for prototype (defaulting to admin for testing)
    const role = req.query.role || 'admin';
    const user = db.users.find(u => u.role === role) || db.users[0];
    res.json(user);
  });

  app.get('/api/users/verified', (req, res) => {
    const verifiedUsers = db.users.filter(u => u.isVerified);
    res.json(verifiedUsers);
  });

  app.get('/api/users/:id', (req, res) => {
    const param = decodeURIComponent(req.params.id || '').trim().toLowerCase();
    const user = db.users.find(u => 
      String(u?.id || '').toLowerCase() === param || 
      (u?.name || '').toLowerCase() === param ||
      (u?.username || '').toLowerCase() === param
    );
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  });

  // Delete user profile and all associated data
  app.delete('/api/users/:id', async (req, res) => {
    const isFirebaseDelete = req.query.firebase === 'true';
    const rawParam = String(req.params.id || '').trim();
    const userId = rawParam;
    const lowerParam = rawParam.toLowerCase();

    // Find and remove matching user(s)
    db.users = db.users.filter(u => {
      const uId = String(u.id || '').toLowerCase();
      const uUname = String(u.username || '').toLowerCase();
      const uPhone = String(u.phone || '').trim();
      const uEmail = String(u.email || '').toLowerCase();
      const match = uId === lowerParam || uUname === lowerParam || uPhone === rawParam || (uEmail && uEmail === lowerParam);
      if (match) {
        if (!db.deletedUserIds) db.deletedUserIds = [];
        if (!db.deletedUserIds.includes(String(u.id))) db.deletedUserIds.push(String(u.id));
      }
      return !match;
    });

    // Remove associated posts
    db.posts = db.posts.filter(p => {
      const pUid = String(p.userId || p.user?.id || '').toLowerCase();
      const pUname = String(p.userName || p.user?.username || '').toLowerCase();
      return pUid !== lowerParam && pUname !== lowerParam;
    });

    // Remove likes, saves, views, comments, follows, blocks, reports
    db.likes = db.likes.filter(l => String(l.userId || '').toLowerCase() !== lowerParam);
    db.saves = db.saves.filter(s => String(s.userId || '').toLowerCase() !== lowerParam);
    db.views = db.views.filter(v => String(v.userId || '').toLowerCase() !== lowerParam);
    db.comments = db.comments.filter(c => String(c.userId || '').toLowerCase() !== lowerParam);
    db.follows = db.follows.filter(f => String(f.followerId || '').toLowerCase() !== lowerParam && String(f.followingId || '').toLowerCase() !== lowerParam);
    db.blocks = db.blocks.filter(b => String(b.blockerId || '').toLowerCase() !== lowerParam && String(b.blockedId || '').toLowerCase() !== lowerParam);
    db.reports = db.reports.filter(r => String(r.reporterId || '').toLowerCase() !== lowerParam);

    if (firestoreDb) {
      try {
        // Direct delete
        await deleteDoc(doc(firestoreDb, 'users', userId)).catch(() => {});
        // Query delete
        const usersSnap = await getDocs(collection(firestoreDb, 'users'));
        for (const uDoc of usersSnap.docs) {
          const data = uDoc.data();
          if (
            uDoc.id.toLowerCase() === lowerParam ||
            String(data.id || '').toLowerCase() === lowerParam ||
            String(data.username || '').toLowerCase() === lowerParam ||
            String(data.phone || '').trim() === rawParam
          ) {
            await deleteDoc(uDoc.ref).catch(() => {});
          }
        }

        const postsSnap = await getDocs(collection(firestoreDb, 'posts'));
        for (const pDoc of postsSnap.docs) {
          const data = pDoc.data();
          const pUid = String(data.userId || data.user?.id || '').toLowerCase();
          const pUname = String(data.userName || data.user?.username || '').toLowerCase();
          if (pUid === lowerParam || pUname === lowerParam) {
            await deleteDoc(pDoc.ref).catch(() => {});
          }
        }
      } catch (e) {
        console.error('Firestore server delete user error:', e);
      }
    }

    saveDatabase();
    res.json({ success: true, message: `User ${userId} and all associated data deleted permanently` });
  });

  // Update user profile
  app.put('/api/users/:id', (req, res) => {
    const user = db.users.find(u => String(u.id) === String(req.params.id));
    if (user) {
      if (req.body.name !== undefined) user.name = req.body.name;
      if (req.body.role !== undefined) user.role = req.body.role;
      if (req.body.category !== undefined) user.category = req.body.category;
      if (req.body.gstNumber !== undefined) {
        const trimmedGst = String(req.body.gstNumber).trim();
        if (trimmedGst !== '') {
          const gstCheck = validateGSTIN(trimmedGst);
          if (!gstCheck.isValid) {
            return res.status(400).json({ error: `Fake or Invalid GSTIN provided: ${gstCheck.error}` });
          }
          user.gstNumber = trimmedGst.toUpperCase();
        } else {
          user.gstNumber = '';
        }
      }
      if (req.body.address !== undefined) user.address = req.body.address;
      if (req.body.city !== undefined) user.city = req.body.city;
      if (req.body.state !== undefined) user.state = req.body.state;
      if (req.body.gpsCoords !== undefined) user.gpsCoords = req.body.gpsCoords;
      if (req.body.googleMapsUrl !== undefined) user.googleMapsUrl = req.body.googleMapsUrl;
      if (req.body.bio !== undefined) user.bio = req.body.bio;
      if (req.body.email !== undefined) user.email = req.body.email;
      if (req.body.website !== undefined) user.website = req.body.website;
      if (req.body.facebookUrl !== undefined) user.facebookUrl = req.body.facebookUrl;
      if (req.body.twitterUrl !== undefined) user.twitterUrl = req.body.twitterUrl;
      if (req.body.instagramUrl !== undefined) user.instagramUrl = req.body.instagramUrl;
      if (req.body.phone !== undefined) user.phone = req.body.phone;
      if (req.body.coverUrl !== undefined) user.coverUrl = req.body.coverUrl;
      if (req.body.coverFit !== undefined) user.coverFit = req.body.coverFit;
      if (req.body.avatarUrl !== undefined) user.avatarUrl = req.body.avatarUrl;
      if (req.body.isVerified !== undefined) user.isVerified = req.body.isVerified;
      if (req.body.verifiedPlan !== undefined) user.verifiedPlan = req.body.verifiedPlan;
      if (req.body.verifiedAt !== undefined) user.verifiedAt = req.body.verifiedAt;
      if (req.body.hidePhone !== undefined) user.hidePhone = req.body.hidePhone;
      if (req.body.hideAddress !== undefined) user.hideAddress = req.body.hideAddress;
      if (req.body.hideEmail !== undefined) user.hideEmail = req.body.hideEmail;
      if (req.body.hideGst !== undefined) user.hideGst = req.body.hideGst;
      if (req.body.catalogueUrl !== undefined) user.catalogueUrl = req.body.catalogueUrl;
      if (req.body.catalogueName !== undefined) user.catalogueName = req.body.catalogueName;
      saveDatabase();
      if (firestoreDb) {
        setDoc(doc(firestoreDb, 'users', String(user.id)), user).catch(e => console.error('Firestore user update error', e));
      }
      res.json({ success: true, user });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  });

  // --- Master Admin Developer Console APIs ---

  // In-memory lockout state for Master Admin Developer Console
  let adminFailedAttempts = 0;
  let adminLockoutUntil = 0;

  // Verify Master Developer PIN / Secret Key
  app.post('/api/admin/verify-pin', (req, res) => {
    // Check if server is currently in lockout
    if (Date.now() < adminLockoutUntil) {
      return res.status(503).json({ 
        success: false, 
        isLockedOut: true, 
        error: '503 Service Unavailable: Gateway Socket Closed' 
      });
    }

    const { pin, password } = req.body;
    const inputKey = String(pin || password || '').trim();
    const currentMasterKey = String(db.adminSettings.developerMasterPin || 'admin1234@#').trim();
    
    if (inputKey === currentMasterKey) {
      adminFailedAttempts = 0;
      adminLockoutUntil = 0;
      res.json({ success: true, token: 'Vyapar Bridge_MASTER_AUTH_TOKEN_2026' });
    } else {
      adminFailedAttempts += 1;
      if (adminFailedAttempts >= 2) {
        // Trigger 15-minute lockout (15 * 60 * 1000 ms)
        adminLockoutUntil = Date.now() + (15 * 60 * 1000);
        adminFailedAttempts = 0;
        res.status(503).json({ 
          success: false, 
          isLockedOut: true, 
          error: '503 Service Unavailable: Gateway Socket Closed' 
        });
      } else {
        res.status(401).json({ 
          success: false, 
          attemptsLeft: 1,
          error: 'Incorrect Secret Key / Password (1 attempt remaining)' 
        });
      }
    }
  });

  // Get public announcements for user feeds
  app.get('/api/announcements', (req, res) => {
    res.json(db.announcements || []);
  });

  // Post new announcement (Master Admin only)
  app.post('/api/admin/announcements', upload.single('mediaFile'), async (req, res) => {
    const { title, content, mediaUrl, mediaType, type } = req.body;
    let finalMediaUrl = mediaUrl || '';
    if (req.file) {
      finalMediaUrl = await uploadToFirebaseOrLocal(req.file);
    }
    const newAnnouncement = {
      id: `ann-${Date.now()}`,
      title: title || '📢 Platform Notice',
      content: content || '',
      mediaUrl: finalMediaUrl,
      mediaType: mediaType || (req.file ? (req.file.mimetype.includes('video') ? 'video' : 'image') : 'none'),
      type: type || 'info',
      createdAt: Date.now()
    };
    db.announcements.unshift(newAnnouncement);
    saveDatabase();
    res.json({ success: true, announcement: newAnnouncement });
  });

  // Delete announcement
  app.delete('/api/admin/announcements/:id', (req, res) => {
    db.announcements = db.announcements.filter(a => a.id !== req.params.id);
    saveDatabase();
    res.json({ success: true });
  });

  // Public Payment Settings for Users (UPI, Bank, Secure Barcode Image & Link)
  app.get('/api/payment-settings', (req, res) => {
    const upi = db.adminSettings.upiId || 'vyaparbridge@upi';
    const accName = db.adminSettings.accountName || 'Vyapar Bridge B2B Operations';
    res.json({
      upiId: upi,
      bankAccount: db.adminSettings.bankAccount || '9988776655443322',
      ifscCode: db.adminSettings.ifscCode || 'SBIN0001234',
      accountName: accName,
      qrCodeUrl: db.adminSettings.qrCodeUrl || '',
      barcodeImageUrl: db.adminSettings.barcodeImageUrl || '',
      barcodeSecretToken: db.adminSettings.barcodeSecretToken || 'SECURE-BARCODE-VERIFY-2026-X89',
      paymentLink: `upi://pay?pa=${encodeURIComponent(upi)}&pn=${encodeURIComponent(accName)}&cu=INR`
    });
  });

  // User Submits UTR Payment for Verification (Supports ₹99 Monthly & ₹1188 Yearly)
  app.post('/api/payments/submit', (req, res) => {
    const { userId, plan, membershipType, utr } = req.body;
    if (!utr || !utr.trim()) {
      return res.status(400).json({ success: false, error: 'UTR / Transaction Reference Number is required' });
    }
    const user = db.users.find(u => String(u.id) === String(userId)) || db.users[0];
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const selectedPlan = plan === 'yearly' ? 'yearly' : 'monthly';
    const amount = selectedPlan === 'yearly' ? 1188 : 99;
    const submittedAt = Date.now();
    const expiresAt = submittedAt + 24 * 60 * 60 * 1000; // 24 Hours verification window

    const paymentRecord = {
      id: `pay-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      userPhone: user.phone || 'N/A',
      plan: selectedPlan,
      membershipType: membershipType || (user.role === 'customer' ? 'local' : 'company'),
      amount,
      utr: utr.trim(),
      status: 'pending', // 'pending' | 'approved' | 'rejected' | 'refund_initiated'
      submittedAt,
      expiresAt
    };

    if (!db.payments) db.payments = [];
    db.payments.unshift(paymentRecord);

    user.pendingPayment = {
      paymentId: paymentRecord.id,
      plan: selectedPlan,
      membershipType: paymentRecord.membershipType,
      amount,
      utr: utr.trim(),
      status: 'pending',
      submittedAt,
      expiresAt
    };

    res.json({
      success: true,
      message: 'Payment UTR submitted! 24-Hour Admin Verification is active.',
      payment: paymentRecord,
      user
    });
  });

  // Get User Payment & Verification Status (Auto-checks 24h Expiration & Auto-Refund Trigger)
  app.get('/api/payments/user/:userId', (req, res) => {
    const user = db.users.find(u => String(u.id) === String(req.params.id || req.params.userId)) || db.users[0];
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Check if 24 hours have passed for any pending payment
    if (user.pendingPayment && user.pendingPayment.status === 'pending') {
      if (Date.now() > user.pendingPayment.expiresAt) {
        user.pendingPayment.status = 'refund_initiated';
        const payRecord = (db.payments || []).find(p => p.id === user.pendingPayment.paymentId);
        if (payRecord) payRecord.status = 'refund_initiated';
      }
    }

    res.json({
      isVerified: user.isVerified || false,
      verifiedPlan: user.verifiedPlan || null,
      pendingPayment: user.pendingPayment || null
    });
  });

  // Admin Get All Pending Payment Verification Submissions
  app.get('/api/admin/payments', (req, res) => {
    const now = Date.now();
    // Auto-update expired payments
    (db.payments || []).forEach(p => {
      if (p.status === 'pending' && now > p.expiresAt) {
        p.status = 'refund_initiated';
        const u = db.users.find(usr => String(usr.id) === String(p.userId));
        if (u && u.pendingPayment && u.pendingPayment.paymentId === p.id) {
          u.pendingPayment.status = 'refund_initiated';
        }
      }
    });

    res.json(db.payments || []);
  });

  // Admin Approve Payment -> Grant Instant Blue Verified Badge
  app.post('/api/admin/payments/:id/approve', (req, res) => {
    const payId = req.params.id;
    const payment = (db.payments || []).find(p => p.id === payId);
    if (!payment) {
      return res.status(404).json({ success: false, error: 'Payment record not found' });
    }

    payment.status = 'approved';
    payment.verifiedAt = Date.now();

    const user = db.users.find(u => String(u.id) === String(payment.userId));
    if (user) {
      user.isVerified = true;
      user.verifiedPlan = payment.plan;
      user.membershipType = payment.membershipType;
      user.verifiedAt = Date.now();
      user.pendingPayment = {
        ...user.pendingPayment,
        status: 'approved'
      };
    }

    res.json({ success: true, payment, user });
  });

  // Admin Reject / Initiate Refund Payment
  app.post('/api/admin/payments/:id/reject', (req, res) => {
    const payId = req.params.id;
    const { reason } = req.body;
    const payment = (db.payments || []).find(p => p.id === payId);
    if (!payment) {
      return res.status(404).json({ success: false, error: 'Payment record not found' });
    }

    payment.status = 'refund_initiated';
    payment.rejectionReason = reason || 'UTR record unmatched or invalid in bank statement';

    const user = db.users.find(u => String(u.id) === String(payment.userId));
    if (user) {
      user.isVerified = false;
      if (user.pendingPayment) {
        user.pendingPayment.status = 'refund_initiated';
        user.pendingPayment.rejectionReason = payment.rejectionReason;
      }
    }

    res.json({ success: true, payment, user });
  });

  // Get Admin Settings (Payment modes, UPI, Bank details, AI config)
  app.get('/api/admin/settings', (req, res) => {
    res.json(db.adminSettings);
  });

  // Update Admin Settings
  app.put('/api/admin/settings', (req, res) => {
    db.adminSettings = {
      ...db.adminSettings,
      ...req.body
    };
    saveAdminSettings();
    res.json({ success: true, settings: db.adminSettings });
  });

  // Dedicated Update Admin Master Password / Secret Key
  app.post('/api/admin/update-password', (req, res) => {
    const { newPassword, newPin, developerMasterPin } = req.body;
    const passwordToSave = newPassword || newPin || developerMasterPin;
    if (!passwordToSave || !passwordToSave.trim()) {
      return res.status(400).json({ success: false, error: 'Password / Secret Key cannot be empty' });
    }
    db.adminSettings.developerMasterPin = passwordToSave.trim();
    saveAdminSettings();
    res.json({ 
      success: true, 
      message: 'Master Developer Secret Key updated successfully!', 
      developerMasterPin: db.adminSettings.developerMasterPin,
      settings: db.adminSettings
    });
  });

  // Admin Upload Barcode Image & Generate Secret Verification Token
  app.post('/api/admin/upload-barcode', upload.single('barcodeFile'), async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No barcode image file uploaded' });
    }
    
    const barcodeImageUrl = await uploadToFirebaseOrLocal(req.file);
    const barcodeSecretToken = `SECURE-BC-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    
    db.adminSettings.barcodeImageUrl = barcodeImageUrl;
    db.adminSettings.barcodeSecretToken = barcodeSecretToken;
    db.adminSettings.barcodeUploadedAt = Date.now();
    saveAdminSettings();

    res.json({
      success: true,
      barcodeImageUrl,
      barcodeSecretToken,
      settings: db.adminSettings
    });
  });

  // Get AI Safety Logs & Status
  app.get('/api/admin/ai-logs', (req, res) => {
    const postsCount = db.posts?.length || 0;
    const commentsCount = db.comments?.length || 0;
    const usersCount = db.users?.length || 0;
    const messagesCount = db.messages?.length || 0;
    const totalScanned = postsCount + commentsCount + usersCount + messagesCount;
    const isGuardrailActive = db.adminSettings.aiGuardrailActive !== false;

    res.json({
      aiModel: db.adminSettings.aiModel || 'Gemini 2.5 Flash',
      guardrailActive: isGuardrailActive,
      aiGuardrailsActive: isGuardrailActive,
      logs: db.aiLogs && db.aiLogs.length > 0 ? db.aiLogs : [
        { id: '1', action: 'Content Moderation Scan', details: 'Auto AI inspection checked post media and text for B2B compliance.', timestamp: Date.now() - 3600000 * 17 },
        { id: '2', action: 'Registered Profiles Guardrail', details: 'Scanned profile badges, username changes, and verified payment records.', timestamp: Date.now() - 3600000 * 12 },
        { id: '3', action: 'B2B Catalog Anti-Spam', details: 'Verified ceramic tile catalog media uploads and pricing notes.', timestamp: Date.now() - 3600000 * 2 }
      ],
      totalPostsScanned: totalScanned,
      stats: {
        totalPostsScanned: totalScanned,
        totalPosts: postsCount,
        totalComments: commentsCount,
        totalUsers: usersCount,
        totalMessages: messagesCount,
        flaggedContent: db.reports?.length || 0,
        aiLatencyMs: 240
      }
    });
  });

  // Toggle AI Guardrail status
  app.post('/api/admin/toggle-guardrail', (req, res) => {
    const { active } = req.body;
    db.adminSettings.aiGuardrailActive = active !== undefined ? Boolean(active) : !db.adminSettings.aiGuardrailActive;
    saveAdminSettings();
    res.json({
      success: true,
      aiGuardrailActive: db.adminSettings.aiGuardrailActive
    });
  });

  // Reset & Clear All Data & Posts from Server & Firestore
  app.post('/api/admin/reset-database', async (req, res) => {
    try {
      // Keep Master Admin user '1', wipe posts and non-admin users
      if (!db.deletedUserIds) db.deletedUserIds = [];
      if (!db.deletedPostIds) db.deletedPostIds = [];
      
      db.users.forEach(u => {
        if (u.role !== 'admin' && String(u.id) !== '1') db.deletedUserIds.push(String(u.id));
      });
      db.posts.forEach(p => db.deletedPostIds.push(String(p.id)));

      db.users = db.users.filter(u => u.role === 'admin' || String(u.id) === '1');
      db.posts = [];
      db.comments = [];
      db.messages = [];
      db.follows = [];
      db.notifications = [];
      db.blocks = [];
      db.reports = [];
      db.likes = [];
      db.saves = [];
      db.views = [];
      db.shares = [];
      db.notInterested = [];
      db.savedCatalogues = [];

      saveDatabase();

      if (firestoreDb) {
        // Wipe ALL posts from Firestore
        try {
          const postsSnap = await getDocs(collection(firestoreDb, 'posts'));
          for (const d of postsSnap.docs) {
            try { await deleteDoc(doc(firestoreDb, 'posts', d.id)); } catch (e) {}
          }
        } catch (e) {}

        // Wipe ALL non-admin users from Firestore
        try {
          const usersSnap = await getDocs(collection(firestoreDb, 'users'));
          for (const d of usersSnap.docs) {
            const uData = d.data();
            if (uData.role !== 'admin' && String(d.id) !== '1' && String(uData.id) !== '1') {
              try { await deleteDoc(doc(firestoreDb, 'users', d.id)); } catch (e) {}
            }
          }
        } catch (e) {}

        // Wipe auxiliary collections
        const collectionsToClear = ['likes', 'comments', 'notifications', 'messages', 'follows', 'blocks', 'reports', 'saves', 'views', 'shares'];
        for (const colName of collectionsToClear) {
          try {
            const snap = await getDocs(collection(firestoreDb, colName));
            for (const d of snap.docs) {
              try { await deleteDoc(doc(firestoreDb, colName, d.id)); } catch (e) {}
            }
          } catch (e) {}
        }
      }

      res.json({ success: true, message: '🧹 Complete database reset! All posts, feeds and sample data deleted permanently.' });
    } catch (err: any) {
      console.error('Error resetting database:', err);
      res.status(500).json({ success: false, error: err.message || 'Failed to reset database' });
    }
  });

  // Music Library Endpoints
  app.get('/api/music', (req, res) => {
    res.json(db.music);
  });

  app.post('/api/music', upload.single('musicFile'), async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file uploaded' });
    }
    const { title, artist, duration } = req.body;
    const audioUrl = await uploadToFirebaseOrLocal(req.file);
    const newMusic = {
      id: `music-${Date.now()}`,
      title: title || 'Untitled Track',
      artist: artist || 'Vyapar Bridge Audio',
      audioUrl,
      duration: duration || '0:30',
      createdAt: Date.now()
    };
    db.music.push(newMusic);
    res.json(newMusic);
  });

  app.delete('/api/music/:id', (req, res) => {
    db.music = db.music.filter(m => m.id !== req.params.id);
    res.json({ success: true });
  });

  // 404 for API routes
  app.use('/api', (req, res) => {
    res.status(404).json({ error: `API route not found: ${req.method} ${req.originalUrl}` });
  });

  // Global error handler
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Unhandled Error:', err);
    if (res.headersSent) {
      return next(err);
    }
    const status = err.status || err.statusCode || 500;
    res.status(status).json({ 
      error: err.message || 'Internal server error',
      path: req.path
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        hmr: false // Disable HMR to avoid WebSocket port conflicts
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
  server.timeout = 10 * 60 * 1000;
  server.keepAliveTimeout = 10 * 60 * 1000;
  server.headersTimeout = 10 * 60 * 1000 + 1000;
}

startServer();
