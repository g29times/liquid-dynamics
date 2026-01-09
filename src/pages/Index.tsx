import { useState } from 'react';
import LiquidGlass from '@/components/LiquidGlass';
import ParameterSlider from '@/components/ParameterSlider';
import frogImage from '@/assets/frog.jpg';

const Index = () => {
  const [specularOpacity, setSpecularOpacity] = useState(0.74);
  const [saturation, setSaturation] = useState(16);
  const [refractionLevel, setRefractionLevel] = useState(1);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container max-w-5xl mx-auto px-4 py-12">
        {/* Header */}
        <h2 className="text-[27px] leading-7 font-bold mb-4">
          Magnifying Glass
        </h2>
        <p className="text-left sm:text-justify text-muted-foreground mb-2">
          This component actually uses two displacement maps: one for the refraction on the sides, 
          and one for the zooming, which has a stronger refraction effect.
        </p>
        <p className="text-left sm:text-justify text-muted-foreground mb-8">
          It also plays with shadows and scaling to create a more dynamic, interactive effect.
        </p>

        {/* Demo Container */}
        <div className="relative h-[440px] sm:h-[460px] rounded-xl border border-foreground/10 overflow-hidden select-none bg-background">
          {/* Content Grid */}
          <div className="absolute inset-0 grid grid-cols-1 sm:grid-cols-[1fr_46%] gap-6 sm:gap-10 p-6 sm:p-10">
            {/* Left Content */}
            <div className="flex flex-col justify-center">
              {/* Label */}
              <div className="flex items-center gap-3 text-accent">
                <span className="h-[2px] w-10 bg-current" />
                <span className="uppercase tracking-[0.25em] text-[11px] font-medium">
                  Optics Study
                </span>
              </div>
              
              {/* Title */}
              <h3 className="mt-4 text-[36px] sm:text-[54px] leading-[0.95] font-extrabold tracking-tight">
                Liquid&nbsp;Glass
                <span className="text-foreground/40">—</span>
                Precision&nbsp;Lens
              </h3>
              
              {/* Description */}
              <div className="mt-4 max-w-[60ch] text-[15px] sm:text-[16px] leading-relaxed text-foreground/70 space-y-3">
                <p>
                  Drag the capsule to bend the page. This lens is a compact SVG displacement 
                  rig that refracts whatever sits beneath it.
                </p>
                <p>
                  The field comes from a rounded bezel profile; pixels are pushed along its 
                  gradient, then topped with a subtle specular bloom for depth.
                </p>
                <p className="text-foreground/60">
                  Sweep across strong edges—high contrast makes the bend snap.
                </p>
              </div>
            </div>
            
            {/* Right Image */}
            <div className="relative hidden sm:block rounded-lg overflow-hidden ring-1 ring-foreground/10">
              <img
                src={frogImage}
                alt="Green frog on red post"
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover"
                draggable={false}
              />
            </div>
            
            {/* Photo Credit */}
            <div className="absolute right-3 bottom-1.5 hidden sm:block mt-1 text-right">
              <a
                href="https://unsplash.com/photos/green-frog-on-red-post-SVwOposMxHY"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-[9px] uppercase tracking-[0.15em] text-foreground/40 hover:text-foreground/60 transition-colors"
              >
                Photo: Stephanie LeBlanc / Unsplash
              </a>
            </div>
          </div>

          {/* Liquid Glass Lens */}
          <LiquidGlass
            width={210}
            height={150}
            initialX={180}
            initialY={80}
            refractionScale={refractionLevel * 100}
            specularOpacity={specularOpacity}
            saturation={saturation}
          />
        </div>

        {/* Parameter Controls */}
        <div className="mt-8 space-y-3 text-foreground/80">
          {/* Divider with label */}
          <div className="flex items-center gap-4">
            <div className="uppercase tracking-[0.14em] text-[10px] opacity-70 select-none">
              Parameters
            </div>
            <div className="h-px flex-1 bg-foreground/10" />
          </div>

          <ParameterSlider
            label="Specular Opacity"
            value={specularOpacity}
            min={0}
            max={1}
            step={0.01}
            displayValue={specularOpacity.toFixed(2)}
            onChange={setSpecularOpacity}
          />

          <ParameterSlider
            label="Specular Saturation"
            value={saturation}
            min={0}
            max={50}
            step={1}
            displayValue={saturation.toString()}
            onChange={setSaturation}
          />

          <ParameterSlider
            label="Refraction Level"
            value={refractionLevel}
            min={0}
            max={1}
            step={0.01}
            displayValue={refractionLevel.toFixed(2)}
            onChange={setRefractionLevel}
          />
        </div>
      </div>
    </div>
  );
};

export default Index;
