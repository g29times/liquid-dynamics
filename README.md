# Liquid Glass Magnifying Glass 🔍

A high-fidelity, physics-based refraction effect for the web, inspired by Apple's **Liquid Glass** design language introduced at WWDC 2025.

This project implements a realistic "Precision Lens" using SVG Displacement Maps and Snell's Law to simulate how light actually bends through curved glass.

## ✨ Features

- **Physics-Based Refraction:** Uses Snell's Law to calculate ray displacement based on surface curvature.
- **Advanced Geometry:** Supports "Squircle" (Superellipse) profiles for smooth, organic edge transitions.
- **Specular Highlights:** Integrated rim lighting (specular bloom) to simulate surface reflectivity.
- **Dynamic Interaction:** Fully draggable and interactive lens that refracts underlying DOM content in real-time.

## 🚀 How it Works

Unlike traditional CSS `scale()` magnifiers, this effect uses an **SVG Displacement Map** (`<feDisplacementMap>`). 

1. **Surface Function:** We define a mathematical height map of the lens (Convex/Squircle).
2. **Ray Tracing:** We calculate the incident angle for every point on the lens and determine the pixel offset based on the refractive index ($n \approx 1.5$).
3. **Vector Field:** These offsets are encoded into the Red and Green channels of an SVG filter.
4. **Backdrop Filter:** The filter is applied via `backdrop-filter: url(#id)`, distorting the actual pixels of the UI beneath it.

## ⚠️ Browser Compatibility

- **Chrome / Edge / Chromium:** Full support.
- **Safari / Firefox:** Currently limited. This project relies on using SVG filters within the CSS `backdrop-filter` property, a feature currently exclusive to Chromium-based browsers.

## 🛠️ Installation & Usage

```bash
# Clone the repository
git clone https://github.com/your-username/liquid-glass-magnifier.git

# Navigate to the project
cd liquid-glass-magnifier

# Open index.html in Chrome (or use a local dev server)
```

### Basic Implementation

```html
<div class="glass-lens"></div>

<style>
.glass-lens {
  width: 300px;
  height: 120px;
  /* The magic happens here */
  backdrop-filter: url(#liquid-glass-filter);
  border-radius: 60px;
}
</style>
```

## 🧪 Experimental Note

This is a proof-of-concept. 
- **Performance:** Dynamic resizing of the lens requires re-calculating the displacement map, which can be computationally expensive.
- **Resolution:** The displacement is limited by 8-bit color channels (256 levels of precision).

## 📄 License

MIT License. Feel free to use it in your own experiments!
