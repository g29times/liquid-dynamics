import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';

interface LiquidGlassProps {
  width?: number;
  height?: number;
  initialX?: number;
  initialY?: number;
  refractionScale?: number;
  specularOpacity?: number;
  saturation?: number;
}

// Helper to check if point is inside capsule and get distance info
const getCapsuleInfo = (x: number, y: number, width: number, height: number) => {
  const borderRadius = height / 2;
  const centerY = height / 2;
  
  let isInside = false;
  let distFromEdge = 0;
  let normalX = 0;
  let normalY = 0;
  
  // Calculate distance to capsule edge
  // A capsule is a rectangle with semicircles on each end
  
  // Clamp x to the rectangular portion to find nearest point on centerline
  const clampedX = Math.max(borderRadius, Math.min(width - borderRadius, x));
  
  // Distance from centerline
  const dx = x - clampedX;
  const dy = y - centerY;
  const dist = Math.sqrt(dx * dx + dy * dy);
  
  if (dist <= borderRadius) {
    isInside = true;
    distFromEdge = (borderRadius - dist) / borderRadius;
    
    if (dist > 0.001) {
      // In the semicircular ends or near top/bottom edges
      if (x < borderRadius || x > width - borderRadius) {
        // In semicircular ends - normal points outward from semicircle center
        const semicircleCenter = x < borderRadius ? borderRadius : width - borderRadius;
        const sdx = x - semicircleCenter;
        const sdy = y - centerY;
        const sdist = Math.sqrt(sdx * sdx + sdy * sdy);
        if (sdist > 0.001) {
          normalX = sdx / sdist;
          normalY = sdy / sdist;
        }
      } else {
        // In rectangular middle - normal points up or down
        normalX = 0;
        normalY = dy > 0 ? 1 : -1;
      }
    }
  }
  
  return { isInside, distFromEdge: Math.min(1, distFromEdge), normalX, normalY, centerX: width / 2, centerY };
};

const LiquidGlass: React.FC<LiquidGlassProps> = ({
  width = 210,
  height = 150,
  initialX = 180,
  initialY = 80,
  refractionScale = 100,
  specularOpacity = 0.74,
  saturation = 16,
}) => {
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const [isDragging, setIsDragging] = useState(false);
  const [animationClass, setAnimationClass] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const filterId = useRef(`liquid-glass-filter-${Math.random().toString(36).substr(2, 9)}`);
  const wobbleIntervalRef = useRef<number | null>(null);

  // Generate combined displacement map (edge refraction + center magnification)
  const displacementMapUrl = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    const centerX = width / 2;
    const centerY = height / 2;
    const radiusX = width / 2;
    const radiusY = height / 2;

    // Fill with neutral gray first
    ctx.fillStyle = 'rgb(128, 128, 128)';
    ctx.fillRect(0, 0, width, height);

    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    // Create combined effect: edge refraction + center magnification
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const info = getCapsuleInfo(x, y, width, height);

        if (info.isInside) {
          // Edge refraction - stronger at edges, uses surface normal
          const edgeFactor = Math.pow(1 - info.distFromEdge, 2.5);
          const edgeR = info.normalX * edgeFactor * 80;
          const edgeG = info.normalY * edgeFactor * 80;
          
          // Center magnification - slight pull toward center, stronger in middle
          const dx = (x - centerX) / radiusX;
          const dy = (y - centerY) / radiusY;
          const centerFactor = Math.pow(info.distFromEdge, 2) * 0.12;
          const magR = -dx * centerFactor * 20;
          const magG = -dy * centerFactor * 20;
          
          // Combine both effects
          const r = Math.round(128 + edgeR + magR);
          const g = Math.round(128 + edgeG + magG);
          
          const idx = (y * width + x) * 4;
          data[idx] = Math.max(0, Math.min(255, r));
          data[idx + 1] = Math.max(0, Math.min(255, g));
          data[idx + 2] = 128;
          data[idx + 3] = 255;
        }
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
    return canvas.toDataURL();
  }, [width, height]);

  // Generate specular map
  const specularMapUrl = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    const borderRadius = height / 2;
    const centerX = width / 2;
    const centerY = height / 2;

    // Transparent background
    ctx.clearRect(0, 0, width, height);

    // Create capsule clip path
    ctx.beginPath();
    ctx.moveTo(borderRadius, 0);
    ctx.lineTo(width - borderRadius, 0);
    ctx.arc(width - borderRadius, centerY, borderRadius, -Math.PI / 2, Math.PI / 2);
    ctx.lineTo(borderRadius, height);
    ctx.arc(borderRadius, centerY, borderRadius, Math.PI / 2, -Math.PI / 2);
    ctx.closePath();
    ctx.clip();

    // Top highlight gradient
    const highlightGradient = ctx.createRadialGradient(
      width * 0.35, height * 0.25, 0,
      width * 0.35, height * 0.25, width * 0.5
    );
    highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
    highlightGradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.4)');
    highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    ctx.fillStyle = highlightGradient;
    ctx.fillRect(0, 0, width, height);

    // Rim light
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(borderRadius, 0);
    ctx.lineTo(width - borderRadius, 0);
    ctx.arc(width - borderRadius, centerY, borderRadius - 1, -Math.PI / 2, Math.PI / 2);
    ctx.lineTo(borderRadius, height);
    ctx.arc(borderRadius, centerY, borderRadius - 1, Math.PI / 2, -Math.PI / 2);
    ctx.closePath();
    ctx.stroke();

    return canvas.toDataURL();
  }, [width, height]);

  const triggerWobble = useCallback((count: number, isDuringDrag = false) => {
    let currentCount = 0;
    
    if (wobbleIntervalRef.current) {
      clearInterval(wobbleIntervalRef.current);
      wobbleIntervalRef.current = null;
    }
    
    const doWobble = () => {
      if (currentCount >= count) {
        if (wobbleIntervalRef.current) {
          clearInterval(wobbleIntervalRef.current);
          wobbleIntervalRef.current = null;
        }
        if (!isDuringDrag) {
          setAnimationClass('');
        }
        return;
      }
      
      setAnimationClass(isDuringDrag ? 'animate-liquid-drag-wobble' : 'animate-liquid-wobble');
      setTimeout(() => {
        if (!isDuringDrag) setAnimationClass('');
      }, isDuringDrag ? 350 : 450);
      currentCount++;
    };
    
    doWobble();
    wobbleIntervalRef.current = window.setInterval(doWobble, isDuringDrag ? 400 : 500);
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    setAnimationClass('animate-liquid-press');
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    // Store the offset from click position to element position
    dragStartRef.current = {
      x: clientX - position.x,
      y: clientY - position.y,
    };
    
    // Trigger wobbles while pressed - these will be liquid-drag-wobbles
    setTimeout(() => triggerWobble(3, true), 150);
  }, [position, triggerWobble]);

  const handleMouseMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDragging || !containerRef.current) return;
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const parentRect = containerRef.current.parentElement?.getBoundingClientRect();
    if (!parentRect) return;
    
    // Calculate new position relative to parent, accounting for initial click offset
    const newX = clientX - dragStartRef.current.x;
    const newY = clientY - dragStartRef.current.y;
    
    // Clamp to parent bounds
    const clampedX = Math.max(0, Math.min(parentRect.width - width, newX));
    const clampedY = Math.max(0, Math.min(parentRect.height - height, newY));
    
    setPosition({ x: clampedX, y: clampedY });
  }, [isDragging, width, height]);

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      
      // Clear any existing wobble interval
      if (wobbleIntervalRef.current) {
        clearInterval(wobbleIntervalRef.current);
        wobbleIntervalRef.current = null;
      }
      
      // Play release animation first
      setAnimationClass('animate-liquid-release');
      
      // Then trigger wobbles after release animation
      setTimeout(() => triggerWobble(3, false), 500);
    }
  }, [isDragging, triggerWobble]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleMouseMove);
      window.addEventListener('touchend', handleMouseUp);
    }
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  useEffect(() => {
    return () => {
      if (wobbleIntervalRef.current) {
        clearInterval(wobbleIntervalRef.current);
      }
    };
  }, []);

  const borderRadius = height / 2;

  return (
    <div
      ref={containerRef}
      className={`absolute z-10 cursor-grab active:cursor-grabbing select-none touch-none ${animationClass}`}
      style={{
        width,
        height,
        borderRadius,
        transform: `translateX(${position.x}px) translateY(${position.y}px)`,
        userSelect: 'none',
        touchAction: 'none',
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleMouseDown}
      draggable={false}
    >
      {/* SVG Filter Definition */}
      <svg 
        colorInterpolationFilters="sRGB" 
        style={{ display: 'none' }}
      >
        <defs>
          <filter id={filterId.current}>
            {/* Combined displacement (edge refraction + center magnification) */}
            <feImage
              href={displacementMapUrl}
              x="0"
              y="0"
              width={width}
              height={height}
              result="displacement_map"
              preserveAspectRatio="none"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="displacement_map"
              scale={refractionScale}
              xChannelSelector="R"
              yChannelSelector="G"
              result="displaced"
            />
            
            {/* Saturation boost for displaced content */}
            <feColorMatrix
              in="displaced"
              type="saturate"
              result="displaced_saturated"
              values={saturation.toString()}
            />
            
            {/* Specular highlight layer */}
            <feImage
              href={specularMapUrl}
              x="0"
              y="0"
              width={width}
              height={height}
              result="specular_layer"
              preserveAspectRatio="none"
            />
            <feComposite
              in="displaced_saturated"
              in2="specular_layer"
              operator="in"
              result="specular_saturated"
            />
            <feComponentTransfer in="specular_layer" result="specular_faded">
              <feFuncA type="linear" slope={specularOpacity} />
            </feComponentTransfer>
            
            {/* Blend layers */}
            <feBlend
              in="specular_saturated"
              in2="displaced"
              mode="normal"
              result="withSaturation"
            />
            <feBlend
              in="specular_faded"
              in2="withSaturation"
              mode="normal"
            />
          </filter>
        </defs>
      </svg>
      
      {/* Glass element with backdrop filter */}
      <div
        className="absolute inset-0 ring-1 ring-foreground/10"
        style={{
          borderRadius,
          backdropFilter: `url(#${filterId.current})`,
          WebkitBackdropFilter: `url(#${filterId.current})`,
          boxShadow: `
            0 4px 12px rgba(0, 0, 0, 0.15),
            0 2px 24px rgba(0, 0, 0, 0.2) inset,
            0 -2px 24px rgba(255, 255, 255, 0.15) inset
          `,
        }}
      />
    </div>
  );
};

export default LiquidGlass;
