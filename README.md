Live link: https://www.api.bestbuyersview.com/
pickhub-amazon/controllers/authController.js (login & getMe)
pickhub-amazon/middleware/auth.js (authenticateAdmin)
pickhub-amazon/routes/api.js (route /api/auth/login)

<!-- 🔐 PART 1: AUTHENTICATION (Proving Who You Are) -->

Authentication = Proving your identity
Like showing your ID card at hotel reception to prove you are who you say you are.
FRONTEND (You at reception):
"Hi, I'm naimaa2it@gmail.com and my password is admin123"
BACKEND (Hotel Reception):
"Let me check our records... ✅ Yes, you're registered!"
"Here's your room key (JWT Token) - use this to access your room"
What's a JWT Token?
A JWT Token is like a Hotel Room Key Card:
// Your JWT Token contains:
{
"email": "naimaa2it@gmail.com",
"role": "admin",
"expires": "24 hours"
}
// Signed with: JWT_SECRET (hotel's master key)

<!-- PART 2: AUTHORIZATION (What You're Allowed to Do) -->

What is Authorization?
Authorization = Checking your permissions
Like the hotel checking if your room key can access:
Your room ✅
Swimming pool ✅
Other guests' rooms ❌

 <!-- PART 3: HOW FRONTEND & BACKEND CONNECT -->

1. Login Process:
   YOU (Frontend) → BACKEND
   "Can I login? Email: naimaa2it@gmail.com, Password: admin123"
   BACKEND → YOU (Frontend)
   "✅ Success! Here's your token: eyJhbGciOiJIUzI1NiIs... (room key)"
   FRONTEND stores token in localStorage (keeps room key in pocket)

2. Accessing Protected Areas:
   YOU → BACKEND (want to see dashboard)
   "GET /api/dashboard" + "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
   BACKEND Security Guard:

- "Ah, you have a valid room key!"
- "Let me decode it... you're naimaa2it@gmail.com"
- "OK, here's your dashboard data: {...}"

3. Without Token:
   YOU → BACKEND (no token)
   "GET /api/dashboard"
   BACKEND Security Guard:

FRONTEND (Client) BACKEND (Server) DATABASE
| | |
| 1. POST /login | |
| {email, password} | → Checks credentials | → Verify user
| | |
| ← Returns JWT Token | |
| (Room Key) | |
| | |
| 2. GET /dashboard | |
| + Authorization Header | → authenticateAdmin |
| + Bearer Token | → Verifies JWT Token |
| | → If valid: proceed |
| ← Returns dashboard data| → If invalid: 401 error |






/** 
* Paste one or more documents here
*/
{
  "title": "10 Things to Look For When Buying a Smartphone in 2025",
  "slug": "10-things-to-look-for-when-buying-a-smartphone-in-2025",
  "description": "Choosing a phone used to be a ‘go and grab one with the highest specs under budget’ thing. But buying a smartphone in 2025 is no longer just about picking the device with the biggest screen or the most megapixels. Smartphones have evolved into all-in-one gadgets that handle communication, entertainment, work, payments, and even health tracking. With new technologies like 5G, eSIM, AI-driven cameras, and foldable displays entering the mainstream, choosing the right phone has become both exciting and challenging. Whether you’re a casual user or a power-hungry gamer, knowing which factors matter most will save you money and help you get the best value.\n\n10 Things to Look For on Smartphone Purchase\nBudget\nPerformance\nBattery Life & Charging Speed\nDisplay Size & Type\nCamera Quality\nStorage Options\n5G & Connectivity\nOperating System & Updates\neSIM & Future-Proofing\nExtra Features",
  "excerpt": "Buying a smartphone in 2025 isn’t just about high specs, it’s about choosing the right mix of budget, performance, battery life, camera quality, and future-ready features like 5G, eSIM, and more. This mobile phone buying guide explores the 10 most important factors you should consider before making your next purchase in Bangladesh, helping you find a phone that truly fits your lifestyle.",
  "author": {
    "name": "Naima",
    "avatar": "",
    "bio": "Web developer",
    "_id": {
      "$oid": "691af78620ed19f43e04a521"
    }
  },
  "categories": [
    {
      "name": "Tools",
      "slug": "tools"
    },
    {
      "name": "Tech",
      "slug": "tech"
    }
  ],
  "tags": [
    "Smartphone",
    "Tools",
    "Technology",
    "phone"
  ],
  "content": [],
  "featuredImage": {
    "url": "data:image/jpeg;base64,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",
    "alt": "10 Things to Look For When Buying a Smartphone in 2025",
    "_id": {
      "$oid": "695a46ac2860cbe38e39cec4"
    }
  },
  "seo": {
    "title": "10 Things to Look For When Buying a Smartphone in 2025",
    "description": "Buying a smartphone in 2025 isn’t just about high specs, it’s about choosing the right mix of budget, performance, battery life, camera quality, and future-ready features like 5G, eSIM, and more. This mobile phone buying guide explores the 10 most important factors you should consider before making your next purchase in Bangladesh, helping you find a phone that truly fits your lifestyle.",
    "keywords": [],
    "_id": {
      "$oid": "695a46ac2860cbe38e39cec3"
    }
  },
  "isFeatured": false,
  "published": true,
  "datePublished": {
    "$date": "2025-11-17T10:23:02.867Z"
  },
  "dateModified": {
    "$date": "2026-01-04T10:53:32.804Z"
  },
  "contentImages": [],
  "createdAt": {
    "$date": "2025-11-17T10:23:02.867Z"
  },
  "updatedAt": {
    "$date": "2026-01-04T10:53:32.804Z"
  },
  "__v": 0
}















