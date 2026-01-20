# App Icons Setup Guide

## Required Icons for PWA

To complete the PWA setup, you need to create the following icons:

### Icon Sizes Needed:
- **192x192** - Standard Android icon
- **512x512** - High-res Android icon
- **180x180** - Apple Touch Icon (iOS)

### Icon Design Guidelines:

1. **Content:**
   - Use your brand logo/symbol
   - Ensure good visibility at small sizes
   - Use brand colors (#8b6e4f - Sawatsya Earth)
   
2. **Format:**
   - PNG format with transparency
   - Square canvas (1:1 ratio)
   - Minimum safe area: Leave 10% padding from edges

3. **Design Requirements:**
   - Clear and recognizable
   - Works on both light and dark backgrounds
   - No text (text should be in app name)

### File Locations:

Place the generated icons in:
```
frontend/public/images/
├── icon-192.png
├── icon-512.png
└── apple-touch-icon.png (180x180)
```

### Quick Creation Methods:

#### Option 1: Using Online Tools
1. **PWA Builder**: https://www.pwabuilder.com/imageGenerator
   - Upload your logo
   - Auto-generates all sizes
   - Download and place in public/images/

2. **Favicon.io**: https://favicon.io/favicon-converter/
   - Upload image
   - Select PWA package
   - Extract icons

#### Option 2: Using Design Software

**Figma/Sketch/Adobe XD:**
```
1. Create a 512x512 canvas
2. Add your logo/brand symbol
3. Center with ~10% padding
4. Export as:
   - icon-512.png (512x512)
   - icon-192.png (192x192)
   - apple-touch-icon.png (180x180)
```

**Photoshop:**
```
1. New file: 512x512, 300dpi
2. Add logo/symbol centered
3. Save As > PNG-24 with transparency
4. Image > Image Size to create 192x192
5. Repeat for 180x180
```

### Temporary Placeholder

Until you create icons, you can use a simple colored square:

1. Go to https://placeholder.com/
2. Generate: 
   - `512x512/8b6e4f/ffffff`
   - `192x192/8b6e4f/ffffff`
3. Add "S" or your initials as overlay
4. Save to respective locations

### Testing Icons

After adding icons:

1. **Clear cache and reload**
2. **Check manifest** at `/manifest.json`
3. **DevTools > Application > Manifest**
   - Verify icons load
   - Check for warnings
4. **Install PWA** and verify icon appears correctly

### Icon Checklist:

- [ ] icon-192.png created (192x192)
- [ ] icon-512.png created (512x512)
- [ ] apple-touch-icon.png created (180x180)
- [ ] Icons placed in `/public/images/`
- [ ] manifest.json references updated
- [ ] Icons visible in DevTools > Application
- [ ] PWA installs with correct icon
- [ ] Icon looks good on home screen

### Additional Assets (Optional):

**Splash Screens for iOS:**
- 1242x2688 (iPhone 12 Pro Max)
- 1125x2436 (iPhone 11 Pro)
- 828x1792 (iPhone 11)

**Maskable Icons:**
- 512x512 with safe zone for adaptive icons
- Android 8.0+ supports maskable icons
- Leave 20% safe zone from edges

### Current Manifest Configuration:

```json
{
  "icons": [
    {
      "src": "/images/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/images/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

### Brand Colors for Reference:

```
Primary: #8b6e4f (Sawatsya Earth)
Secondary: #6b8e23 (Sawatsya Leaf)
Accent: #cd853f (Sawatsya Terracotta)
Background: #f5f0e8 (Sawatsya Cream)
```

---

Once icons are created, the PWA will be fully functional and ready for production deployment!
