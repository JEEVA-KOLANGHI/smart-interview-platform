# Smart Interview Platform - Troubleshooting Guide

## ✅ Quick Health Check

### Check if Application is Running

**Backend (Server):**
- Should be running on: http://localhost:5000
- Test: Open http://localhost:5000 in browser
- Expected response: "Smart Interview Platform API is running..."

**Frontend (Client):**
- Should be running on: http://localhost:3000
- Test: Open http://localhost:3000 in browser
- Expected: Login page with tabs (Login/Register)

---

## 🔧 Common Issues & Solutions

### Issue 1: "Something is already running on port 3000"
**Cause:** Client is already running
**Solution:** This is actually GOOD! Your client is running. Just open http://localhost:3000

### Issue 2: "Failed to start test - No questions found"
**Cause:** No questions in database for selected topic/difficulty
**Solution:**
1. Login as admin
2. Go to Admin Panel
3. Add questions for the topic you want to test
4. Make sure to add multiple difficulty levels

### Issue 3: Blank page or loading forever
**Cause:** Backend not running or MongoDB connection failed
**Solution:**
1. Check backend terminal for errors
2. Verify MongoDB connection string in `server/.env`
3. Restart backend: `cd server && npm run dev`

### Issue 4: "Invalid token" or "Authorization denied"
**Cause:** Token expired or corrupted
**Solution:**
1. Clear localStorage: Open browser console (F12)
2. Run: `localStorage.clear()`
3. Refresh page and login again

### Issue 5: Profile page not loading
**Cause:** New routes not registered
**Solution:**
1. Hard refresh browser: Ctrl + Shift + R (or Cmd + Shift + R on Mac)
2. Clear browser cache
3. Restart client: Close npm start terminal and run again

---

## 🚀 Fresh Start (If Everything Breaks)

### Backend:
```bash
cd server
# Kill any existing process on port 5000
# On Windows:
netstat -ano | findstr :5000
# Note the PID and kill it:
taskkill /PID <PID> /F

# Start fresh
npm run dev
```

### Frontend:
```bash
cd client
# Kill any existing process on port 3000
# On Windows:
netstat -ano | findstr :3000
# Note the PID and kill it:
taskkill /PID <PID> /F

# Start fresh
npm start
```

---

## 📋 Pre-Flight Checklist

Before testing, ensure:

✅ MongoDB is accessible (check .env file)
✅ Backend server running (port 5000)
✅ Frontend client running (port 3000)
✅ At least one admin user created
✅ At least 10 questions added per topic
✅ Browser cache cleared if making code changes

---

## 🧪 Testing Steps

### 1. Register & Login
1. Go to http://localhost:3000
2. Click "Register" tab
3. Create account: name, email, password
4. Click "Login" tab
5. Login with credentials
6. Should redirect to Dashboard

### 2. Add Questions (Admin Only)
1. Navigate to Admin Panel
2. Fill question form:
   - Title: "What is a closure in JavaScript?"
   - Options: 4 options
   - Correct Answer: Select one option
   - Topic: JavaScript
   - Difficulty: Medium
3. Click "Add Question"
4. Repeat for different topics

### 3. Practice Questions
1. Navigate to Practice
2. Select filters (Topic: JavaScript, Difficulty: All)
3. Answer question
4. Click "Check Answer" to see feedback
5. Click bookmark button (★) to save
6. Navigate to next question

### 4. Take Mock Test
1. Navigate to Mock Test
2. Configure:
   - Topic: JavaScript
   - Difficulty: All
   - Questions: 5
   - Duration: 10 minutes
3. Click "Start Test"
4. Answer questions
5. Navigate using question numbers
6. Submit (or wait for auto-submit)
7. View results

### 5. View Analytics
1. Navigate to Analytics
2. Check overview stats
3. View smart insights
4. Check topic-wise performance

### 6. View Profile
1. Navigate to Profile
2. See your info and bookmarks
3. If you have incomplete tests, delete them

---

## 🐛 Debugging Tips

### Check Browser Console
1. Press F12 to open DevTools
2. Go to Console tab
3. Look for red error messages
4. Common errors:
   - "Network Error" → Backend not running
   - "401 Unauthorized" → Login again
   - "404 Not Found" → Check API endpoint spelling

### Check Server Terminal
Look for:
- ✅ "Server running on port 5000" → Good!
- ✅ "MongoDB connected successfully" → Good!
- ❌ "MongoServerError" → Check MongoDB URI
- ❌ "Error: Cannot find module" → Run `npm install`

### Check Client Terminal
Look for:
- ✅ "Compiled successfully!" → Good!
- ✅ "webpack compiled" → Good!
- ❌ "Module not found" → Missing import
- ❌ "Failed to compile" → Syntax error in code

---

## 📞 Still Having Issues?

### Quick Fixes:
1. **Restart everything**: Close all terminals, restart both server and client
2. **Clear everything**: `localStorage.clear()` in browser console
3. **Reinstall**: Delete `node_modules`, run `npm install` in both server and client
4. **Check versions**: Node.js v14+ required, npm v6+ required

### Check These Files:
- `server/.env` - MongoDB URI correct?
- `server/server.js` - All routes loaded?
- `client/src/App.js` - All routes defined?
- `client/src/services/api.js` - Correct base URL?

---

## ✅ Success Indicators

You'll know everything works when:
- ✅ Can register and login
- ✅ Can add questions as admin
- ✅ Can practice questions with filters
- ✅ Can bookmark questions
- ✅ Can take timed tests
- ✅ Can view analytics and insights
- ✅ Can see profile with bookmarks

---

## 🎯 Current Status

**Your application IS running if:**
- You have TWO terminal windows open
- One says "Server running on port 5000"
- One says "webpack compiled successfully"
- You can access http://localhost:3000

**Your application is NOT running if:**
- Terminals are closed
- You see error messages in red
- Cannot access http://localhost:3000

---

**Last Updated:** 2025-12-27
**Version:** 1.0.0 - Professional Full-Stack Edition
