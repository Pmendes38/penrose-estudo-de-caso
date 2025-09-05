'use client';

import dynamic from 'next/dynamic';
import { useIsMobile } from '@/shared/hooks/use-is-mobile';

const Canvas = dynamic(() => import('@react-three/fiber').then(m => m.Canvas), { ssr: false });
const ShaderPlane = dynamic(() => import('./ShaderPlane'), { ssr: false });

export default function HeroBackground() {
  const isMobile = useIsMobile(768);
  if (isMobile) return null;

  return (
    <Canvas camera={{ fov: 75, near: 0.1, far: 1000, position: [0, 0, 5] }}>
      {/* Suspense opcional: o dynamic já cuida */}
      <ShaderPlane />
    </Canvas>
  );
}
