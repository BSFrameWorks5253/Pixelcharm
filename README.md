# 🔮 Pixelcharm — Creative Canvas & Photo Magic (Desktop Suite)

> **The Flagship Native Desktop Creative Suite for the Anything Apps Ecosystem**  
> Fusing Canva’s fluid vector layout scenegraph and magnetic smart guides with Photoshop’s raster layer compositing, non-destructive adjustments, real-time RGB histograms, and multi-layer `.psd` / `.psb` file support. Built natively with **Electron + Vite + React 19 + TypeScript**.

---

## 📷 Adobe Camera Raw Filter & Photoshop Dialogs

* **Camera Raw Filter (`Ctrl+Shift+A`)**:
  - Full-screen high-precision raw processor dialog.
  - **Basic Tab**: White balance (Temp Kelvin & Tint), Tone (Exposure, Contrast, Highlights, Shadows, Whites, Blacks), Presence (Texture, Clarity, Dehaze, Vibrance, Saturation).
  - **Detail Tab**: Sharpening Amount and Gaussian Blur radius.
  - **Effects Tab**: Vignette, Sepia, Grayscale, Invert.
  - **Interactive Before / After Split View** (`Y` key toggle) to inspect real-time edits against the unadjusted source.
  - Real-time RGB and Luminance Histogram with clipping detection.
* **Levels Dialog (`Ctrl+L`)**:
  - Live Input Levels (Black point, Gamma midtone curve, White point) and Auto balance.
* **Hue/Saturation Dialog (`Ctrl+U`)**:
  - Continuous Hue rotation (-180° to +180°), Saturation, and Lightness with color spectrum bar.
* **Quick Keyboard Invert (`Ctrl+I`) & Desaturate (`Ctrl+Shift+U`)**.

---

## ⌨️ Exact Photoshop Keyboard Shortcuts Reference

| Shortcut | Action |
| :--- | :--- |
| **`Ctrl+Shift+A`** | Open **Camera Raw Filter** |
| **`Ctrl+J`** | **Duplicate Layer** (Standard Photoshop) |
| **`Ctrl+L`** | Open **Levels Dialog** |
| **`Ctrl+U`** | Open **Hue/Saturation Dialog** |
| **`Ctrl+I`** | **Invert Colors** |
| **`Ctrl+Shift+U`** | **Desaturate** (Convert to Black & White) |
| **`Ctrl+Z`** | **Undo** |
| **`Ctrl+Y`** | **Redo** |
| **`Ctrl+0`** | **Fit on Screen** |
| **`Ctrl+1`** | **100% Actual Pixels** |
| **`Ctrl++` / `Ctrl+=`** | **Zoom In** |
| **`Ctrl+-`** | **Zoom Out** |
| **`Ctrl+]` / `Ctrl+[`** | Bring Layer Forward / Send Backward |
| **`Ctrl+Shift+]` / `[`** | Bring Layer to Front / Send to Back |
| **`[` and `]`** | **Decrease / Increase Brush Size** |
| **`D`** | **Reset Default Colors** (Black Foreground, White Background) |
| **`X`** | **Swap Foreground & Background Colors** |
| **`Space` (Hold)** | **Hand Tool Pan** |
| **`V`, `M`, `L`, `C`, `B`, `T`, `U`, `H`** | Tool shortcuts (Move, Marquee, Lasso, Crop, Brush, Type, Shapes, Hand) |

---

## 🎨 Exact Adobe Photoshop UI Replica

* **Top Photoshop Menu Bar**: Classic `File  Edit  Image  Layer  Type  Select  Filter  View  Help` menus with standard keyboard shortcuts.
* **Photoshop Contextual Options Bar**: Changes dynamically based on active tool (Move Tool alignment controls, Brush size/opacity/mode, Type font family/size/color, Shape fill/stroke).
* **Document Tab Bar**: Clean tab framing (`Pixycharm Masterpiece.psd @ 85% (RGB/8#)`).
* **Canvas Rulers**: Precision top horizontal and left vertical pixel rulers with grid tick marks.
* **Classic Vertical Photoshop Toolbar**: Single-column / dual-column collapsible strip featuring:
  - Move Tool (`V`), Marquee (`M`), Lasso (`L`), Crop (`C`), Eyedropper (`I`), Healing (`J`), Brush (`B`), Clone Stamp (`S`), History Brush (`Y`), Eraser (`E`), Pen (`P`), Type (`T`), Path Selection (`A`), Shapes (`U`), Hand (`H`), Zoom (`Z`).
  - **Photoshop Dual Overlapped Color Squares**: Foreground & background color boxes with quick swap (`X`) and default black/white reset (`D`).
* **Photoshop Multi-Tab Right Dock**:
  - Upper: `[Color]` (with spectrum ramp bar), `[Swatches]`, `[Histogram]` (live RGB channels).
  - Middle: `[Adjustments]` (16 iconic adjustment preset icons), `[Properties]`.
  - Lower: `[Layers]` (Kind filters, Blend Mode dropdown, Opacity, Fill, Lock, eyeball visibility, checkerboard thumbnails, plus the signature bottom action strip: `Link`, `fx`, `Mask`, `Group`, `New Layer`, `Delete`).
  - `[Channels]` (`RGB`, `Red`, `Green`, `Blue`) and `[History]` (Undo stack).
* **Bottom Status Bar**: Document dimensions, zoom level (`85%`), and active tool hint.

* **Native Windows Window**: High-performance Electron desktop app with a dark obsidian shell ($1440 \times 920$, minimum $1024 \times 700$), hardware acceleration, and memory isolation.
* **Native Windows File Dialogs**: Direct integration with Windows Explorer dialogs for opening and saving `.psd`, `.psb`, `.psdt`, `.pixycharm`, and image files.
* **Windows Shell / CLI Association**: Double-click any `.psd` or `.pixycharm` file in Windows Explorer to open it directly into the desktop studio.
* **Native Desktop Shortcuts**: `Ctrl+O` (Open), `Ctrl+S` (Save Project), `Ctrl+Z` (Undo), `Ctrl+Y` (Redo), `Ctrl++`/`Ctrl+-` (Zoom), `F11` (Fullscreen).

---

## 🎨 The Brand & Logo: Pixycharm

* **Name**: **Pixycharm**  
  * *"Pixy"*: The digital pixel — raster precision, microscopic color channels, and photographic manipulation (Photoshop).  
  * *"Charm"*: Enchantment & delight — effortless vector layouts, sparkling aesthetics, and creative flow (Canva).

* **The Logo Mark**:
  * **Adobe Precision Architecture**: A deep obsidian squircle with neon glass beveling framing a crisp geometric **"A"** prism in electric Photoshop Cyan (`#00F5FF`) and Creative Blue (`#3B82F6`).
  * **Canva Stardust Ribbon**: An unbroken fluid looping ribbon forming a dynamic **"C"** in radiant Fuchsia (`#FF2E93`) and Magenta.
  * **The Pixie Charm Starburst**: A 4-point diamond sparkle at the epicenter of the mark, flanked by floating pixie stardust.

---

## ⚡ Core Capabilities

1. **Full Photoshop File Support (`.psd`, `.psb`, `.psdt`):**
   - Import native Photoshop files with all layers, positions ($x, y$), dimensions, and folder trees.
   - Text layer extraction preserving typography, font size, and color.
   - 12 Photoshop blend modes (Multiply, Screen, Overlay, Color Dodge, Difference, etc.).
   - Export back to genuine multi-layer `.psd` files.

2. **Canva-Style Smart Direct Manipulation:**
   - 8-point interactive resize handles with `Shift`-constrain aspect ratio lock.
   - Smooth rotation stem lever.
   - Real-time magnetic smart guide snapping to canvas center, edges, and other layers.

3. **Photoshop-Grade Raster Adjustments & Histogram:**
   - Tone & Exposure: Brightness, Contrast, Exposure, Saturation, Vibrance.
   - Color Grading: Warmth (Color Temp), Tint, Hue Shift ($0\text{--}360^\circ$).
   - Convolution Kernels: Gaussian Blur, $3 \times 3$ Unsharp Mask Sharpening, Invert, Sepia, Grayscale.
   - Live 256-bin RGB & Luminance Histogram Widget.
   - 8 Curated Presets: Cinematic, Vintage, Dramatic B&W, Vibrant, Golden Hour, Cyberpunk, Matte.

4. **Canva Vector Shapes & Typography:**
   - Rich typography (Inter, Space Grotesk, Playfair Display, Outfit, JetBrains Mono).
   - Vector shapes: Rectangles, rounded rects, circles, triangles, stars, polygons.
   - Freehand brush digital painting (`B`) and instant template presets.

5. **Production Utilities & Export:**
   - 40-step Undo / Redo history stack (`Ctrl+Z`, `Ctrl+Y`).
   - High-res export to PNG (with transparency), JPEG, WebP, and multi-layer PSD.
   - Project save / load via `.pixelcharm` files.

---

## 🚀 Universal Anything Ecosystem Loader & Splash Synchronization

Pixelcharm is fully integrated with the **Anything Ecosystem Universal Loader Receiver**:

1. **Dynamic Resolution Priority**:
   - **CLI Override**: `--loader-config="<path>"` passed via CLI arguments.
   - **Global Directory**: `%APPDATA%\Anything\loaders\pixelcharm.json` synchronized from Anything Hub.
   - **Local Release Fallback**: Bundled `loader-config.json` in the application root directory.
2. **Liquid Glass Startup Experience**:
   - 720×440 frameless transparent window with live artwork rendering, dark vignette, custom monogram badge (`PC`), version badge, product tagline, artist attribution, and synchronized progress bar.
   - **Zero Flashing**: The main editor window is created silently in the background (`show: false`) and smoothly revealed and focused only after the splash duration completes.
3. **Full Customization**:
   - Live updates to artwork, duration, gradient themes, product titles, and taglines configured in Anything Hub reflect immediately upon next startup.

---

## 🚀 Launching the Desktop Application

* **Double-click [`START_DESKTOP_APP.bat`](file:///c:/Users/Burhanuddin/OneDrive/Desktop/Anything/Anything%20Apps/New%20Folder/START_DESKTOP_APP.bat)** (or [`LAUNCH_STUDIO.bat`](file:///c:/Users/Burhanuddin/OneDrive/Desktop/Anything/Anything%20Apps/New%20Folder/LAUNCH_STUDIO.bat)) to launch the native desktop application immediately.
* Or run from terminal:
  ```bash
  npm start
  ```
* For desktop hot-reload development mode:
  ```bash
  npm run dev
  ```
