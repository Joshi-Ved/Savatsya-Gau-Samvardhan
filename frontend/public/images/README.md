# Icon Files - README

## Status: Placeholder Icons Required

The PWA is configured but needs actual icon files to be fully functional.

### What's Needed:

Three PNG icon files must be created and placed in this directory:

1. **icon-192.png** (192x192 pixels)
2. **icon-512.png** (512x512 pixels)  
3. **apple-touch-icon.png** (180x180 pixels)

### How to Create:

#### Quick Method (Using Placeholder):
1. Open `icon-placeholder.svg` in a browser
2. Take a screenshot or use an SVG-to-PNG converter
3. Resize to required dimensions:
   - 512x512 for icon-512.png
   - 192x192 for icon-192.png
   - 180x180 for apple-touch-icon.png

#### Recommended Online Tools:
- **CloudConvert**: https://cloudconvert.com/svg-to-png
- **Convertio**: https://convertio.co/svg-png/
- **SVGOMG**: https://jakearchibald.github.io/svgomg/

#### Professional Method:
1. Design your icon in Figma/Photoshop/Illustrator
2. Use brand colors and logo
3. Export as PNG with transparency
4. Save all three sizes in this directory

### Testing After Creation:

```bash
# Verify files exist
ls -la
# Should show:
# icon-192.png
# icon-512.png  
# apple-touch-icon.png
```

Then:
1. Refresh your browser
2. Check DevTools > Application > Manifest
3. Icons should load without errors
4. Try installing the PWA

### Brand Guidelines:

**Colors:**
- Primary: #8b6e4f (Earthy Brown)
- Background: #f5f0e8 (Cream)
- Accent: #cd853f (Terracotta)

**Design Tips:**
- Keep it simple and recognizable
- Ensure visibility at small sizes (192px)
- Works on both light/dark backgrounds
- Leave 10% padding from edges

---

**Current Status:** Using placeholder SVG - Convert to PNG for production use.

See `../../APP_ICONS_SETUP.md` for detailed instructions.
