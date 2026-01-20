# Quick Setup & Testing Guide

## 🚀 Installation & Setup

### 1. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Environment Setup

Make sure your `.env` file in the `backend` directory contains:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
```

### 3. Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

---

## 🧪 Testing the New Features

### 1. Testing Admin Live Activity

1. Open the app in two browser windows
2. Log in as an admin in one window
3. Navigate to `/admin/live-activity`
4. In the other window (as a regular user):
   - Browse products
   - Add items to cart
   - Search for products
   - View product details
5. Watch the live activity feed update in real-time in the admin window

### 2. Testing Dark Mode

1. Toggle dark mode using the theme switcher in the navbar
2. Navigate through admin pages:
   - `/admin` (Dashboard)
   - `/admin/live-activity`
   - `/admin/orders`
   - `/admin/users`
   - `/admin/products`
3. Verify consistent colors matching VS Code Night theme:
   - Background: `#1e1e1e`
   - Cards: `#252526`
   - Borders: `#3e3e42`
   - Primary blue: `#3794ff`

### 3. Testing Mobile Responsiveness

**On Desktop:**
1. Open DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M or Cmd+Shift+M)
3. Test various mobile sizes:
   - iPhone SE (375px)
   - iPhone 12 Pro (390px)
   - Pixel 5 (393px)
   - iPad (768px)

**Admin Panel Mobile:**
- Verify hamburger menu appears on mobile
- Test side menu sliding animation
- Check that all admin pages are usable on mobile
- Verify tables convert to cards on mobile (Orders page)

**PWA Install:**
1. Open in Chrome on mobile or desktop
2. Look for install prompt at the bottom
3. Click "Install" to add to home screen
4. Test offline functionality by disabling network

---

## 🔍 Verifying WebSocket Connection

1. Open browser DevTools (F12)
2. Go to **Network** tab
3. Filter by **WS** (WebSocket)
4. You should see a connection to `/ws`
5. Click on it to see messages being exchanged
6. When users perform actions, you'll see messages like:
   ```json
   {
     "type": "user_action",
     "actionType": "product_view",
     "payload": { "productId": "...", "productName": "..." },
     "user": "userId or Anonymous"
   }
   ```

---

## 🐛 Troubleshooting

### TypeScript Errors

If you see TypeScript errors after changes:

```bash
cd frontend
rm -rf node_modules/.vite
npm run dev
```

### WebSocket Not Connecting

1. Verify backend is running on correct port
2. Check CORS settings in `backend/index.js`
3. Make sure WebSocket is properly attached in backend
4. Check browser console for connection errors

### Dark Mode Not Working

1. Clear localStorage: `localStorage.clear()`
2. Refresh the page
3. Toggle dark mode again

### PWA Not Installing

1. Ensure you're using HTTPS (or localhost)
2. Check that `manifest.json` is accessible
3. Verify service worker registered successfully
4. Look for errors in DevTools Console

### Mobile Menu Not Opening

1. Verify Sheet component is imported correctly
2. Check that `lucide-react` icons are loaded
3. Clear browser cache
4. Test in incognito/private mode

---

## 📱 Testing PWA Features

### Install to Home Screen

**On Chrome (Desktop):**
1. Click the install icon in the address bar
2. Or use the install prompt that appears at bottom
3. App opens in standalone window

**On Chrome (Android):**
1. Tap the three dots menu
2. Select "Add to Home Screen"
3. App appears like a native app

**On Safari (iOS):**
1. Tap the share button
2. Select "Add to Home Screen"
3. Note: iOS has limited PWA support

### Testing Offline Mode

1. Install the PWA
2. Open the installed app
3. In DevTools, go to **Application** > **Service Workers**
4. Check "Offline"
5. Navigate through the app
6. Cached pages should still work
7. New pages show offline fallback

---

## ✅ Feature Checklist

### Admin Panel
- [ ] Dashboard displays stats correctly
- [ ] Live Activity page shows real-time updates
- [ ] Orders page shows all orders
- [ ] Users page displays user list
- [ ] Products page works (if implemented)
- [ ] Mobile menu works on small screens
- [ ] All pages are responsive

### Dark Mode
- [ ] Toggle switches between light/dark
- [ ] Admin sidebar has correct colors
- [ ] Cards use `#252526` background
- [ ] Text is readable (good contrast)
- [ ] Status badges have dark variants
- [ ] Borders are visible
- [ ] Icons have appropriate colors

### Mobile Features
- [ ] Responsive layout on all pages
- [ ] Touch targets are at least 44px
- [ ] Install prompt appears on Chrome
- [ ] PWA installs successfully
- [ ] Service worker registers
- [ ] Offline page works
- [ ] App manifest is valid
- [ ] Back button works correctly

### Live Activity
- [ ] Actions tracked when user browses
- [ ] Admin sees updates in real-time
- [ ] Active users count updates
- [ ] Activity feed scrolls properly
- [ ] Icons display correctly
- [ ] Timestamps are accurate

---

## 🎨 Visual Testing

### Dark Mode Visual Checks

Open each page in dark mode and verify:

**Dashboard:**
- [ ] Stats cards: `#252526` background
- [ ] Recent orders: readable text
- [ ] Quick actions: proper button colors

**Live Activity:**
- [ ] Activity cards: clear contrast
- [ ] Status badges: colored appropriately
- [ ] Metrics: easy to read

**Orders:**
- [ ] Mobile cards: well-formatted
- [ ] Desktop table: proper borders
- [ ] Status badges: visible

**Users:**
- [ ] Table rows: alternating colors work
- [ ] Search bar: dark background
- [ ] User avatars: proper contrast

---

## 📊 Performance Testing

### Load Times
1. Open DevTools Performance tab
2. Record page load
3. Check metrics:
   - First Contentful Paint < 1.5s
   - Time to Interactive < 3s
   - Lighthouse PWA score > 90

### WebSocket Performance
1. Monitor Network tab
2. Verify messages are efficient
3. Check no memory leaks with repeated actions
4. Activity feed should handle 50+ items smoothly

---

## 🚨 Common Issues & Solutions

### Issue: "lucide-react not found"
**Solution:** 
```bash
cd frontend
npm install lucide-react
```

### Issue: Dark mode colors not applying
**Solution:**
1. Check `tailwind.config.ts` has `darkMode: ["class"]`
2. Verify `index.css` has dark mode variables
3. Clear Tailwind cache: `rm -rf node_modules/.cache`

### Issue: WebSocket connection refused
**Solution:**
1. Verify backend is running
2. Check port 5000 is not in use
3. Review CORS configuration
4. Try connecting to `ws://localhost:5000/ws` directly

### Issue: PWA not updating
**Solution:**
1. Unregister service worker in DevTools
2. Clear cache and hard reload (Ctrl+Shift+R)
3. Update version in manifest.json
4. Reinstall the app

---

## 🎯 Success Criteria

Your implementation is successful when:

✅ Admin can see live user activity in real-time
✅ Dark mode uses consistent VS Code Night theme colors
✅ All admin pages work on mobile devices
✅ PWA installs and works offline
✅ Mobile menu is touch-friendly
✅ WebSocket connection is stable
✅ No console errors in production

---

## 📝 Next Steps

After verifying everything works:

1. **Test on real devices** (iOS, Android)
2. **Create app icons** (192x192, 512x512)
3. **Update manifest.json** with production URLs
4. **Deploy to production** environment
5. **Monitor WebSocket performance** in production
6. **Collect user feedback** on mobile experience

---

For any issues, refer to `IMPROVEMENTS_SUMMARY.md` for implementation details.
