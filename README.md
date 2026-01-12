# Liquid Glass Magnifying Glass 🔍

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Chrome Only](https://img.shields.io/badge/Browser-Chrome%20Only-orange.svg)

这是一个受 Apple WWDC 2025 **Liquid Glass** 设计语言启发的实验性前端效果。它不仅仅是一个简单的放大镜，而是通过物理折射定律（斯内尔定律）模拟了光线穿过弯曲玻璃表面的真实感。

[**✨ 在线演示 (仅限 Chrome)**](#) <!-- 替换为你的 Demo 链接 -->

## 🌟 特性

- **物理仿真折射**：基于斯内尔定律（Snell's Law）计算光线偏移，而非简单的 CSS 缩放。
- **SVG 位移贴图 (Displacement Maps)**：利用 `feDisplacementMap` 动态生成像素级偏移场。
- **Squircle 几何算法**：采用 Apple 偏爱的超椭圆（Squircle）算法处理边缘，确保折射过渡极其丝滑。
- **高光与深感**：集成了物理模拟的高光（Specular Highlights）和边缘光，增强玻璃质感。

## 🧪 技术原理

本项目将玻璃表面建模为一个数学函数 $f(x)$，通过以下步骤实现效果：
1. **预计算偏移场**：计算每个像素点因玻璃厚度和曲率产生的折射偏移量。
2. **归一化向量**：将偏移向量映射到 SVG 的 RGBA 通道（R=X轴偏移, G=Y轴偏移）。
3. **Backdrop Filter 渲染**：将生成的 SVG 滤镜应用到 `backdrop-filter: url(#...)`，对背景进行实时像素重排。

## 🚀 快速开始

### 安装
```bash
git clone https://github.com/your-username/liquid-glass-magnifier.git
cd liquid-glass-magnifier
# 如果有依赖项则执行安装，否则直接打开 index.html
```

### 基础用法
在 HTML 中引入滤镜定义，并在 CSS 中引用：

```css
.glass-lens {
  width: 300px;
  height: 120px;
  /* 核心：应用 SVG 滤镜 */
  backdrop-filter: url(#liquidGlassFilter);
  -webkit-backdrop-filter: url(#liquidGlassFilter);
}
```

## ⚠️ 浏览器兼容性

*   **Google Chrome / Chromium**: 完美支持（目前唯一支持将 SVG 滤镜用于 `backdrop-filter` 的浏览器内核）。
*   **Safari / Firefox**: 暂不支持 `backdrop-filter` 的 SVG 滤镜引用，将显示回退效果。

## 🛠 自定义参数

你可以通过调整以下参数来改变“玻璃”的材质：
- `Refractive Index` (折射率): 默认 1.51 (玻璃)。
- `Bezel Width` (边框宽度): 控制边缘弯曲的区域。
- `Surface Profile` (表面形状): 可选 Convex (凸面)、Concave (凹面) 或 Squircle。

## 📜 开源协议

基于 [MIT License](LICENSE) 开源。
