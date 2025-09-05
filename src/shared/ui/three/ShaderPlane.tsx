// src/shared/ui/three/ShaderPlane.tsx
'use client';

import * as THREE from 'three';
import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';

export default function ShaderPlane() {
  const { viewport, size } = useThree();
  const mesh = useRef<THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>>(null);

  // Uniforms tipados
  const uniforms = useMemo<
    {
      u_color: { value: THREE.Color };
      u_background: { value: THREE.Vector4 };
      u_speed: { value: number };
      u_detail: { value: number };
      u_time: { value: number };
      u_mouse: { value: THREE.Vector2 };
      u_resolution: { value: THREE.Vector2 };
    }
  >(
    () => ({
      u_color: { value: new THREE.Color(0x1ac6ff) },
      u_background: { value: new THREE.Vector4(0.0039, 0.0941, 0.1647, 1.0) },
      u_speed: { value: 0.252 },
      u_detail: { value: 0.225 },
      u_time: { value: 0 },
      u_mouse: { value: new THREE.Vector2(0.5, 0.5) },
      u_resolution: { value: new THREE.Vector2(1, 1) }, // inicia seguro
    }),
    []
  );

  const fragmentShader = useMemo(
    () => `
      precision highp float;
      uniform vec2 u_resolution;
      uniform float u_time;
      uniform vec3 u_color;
      uniform vec4 u_background;
      uniform float u_speed;
      uniform float u_detail;

      mat2 m(float a){
        float c=cos(a), s=sin(a);
        return mat2(c,-s,s,c);
      }

      float map(vec3 p){
        float t=u_time*u_speed;
        p.xz*=m(t*0.4);
        p.xy*=m(t*0.1);
        vec3 q=p*2.0+t;
        return length(p+vec3(sin((t*u_speed)*0.1)))*log(length(p)+0.9)
               +cos(q.x+sin(q.z+cos(q.y)))*0.5-1.0;
      }

      void main(){
        vec2 uv=(gl_FragCoord.xy-0.5*u_resolution.xy)/u_resolution.y;
        vec3 cl=vec3(0.0);
        float d=2.5;

        for(float i=0.; i<= (1. + 20.*u_detail); i++){
          vec3 p=vec3(0.0,0.0,4.0)+normalize(vec3(uv,-1.0))*d;
          float rz=map(p);
          float f=clamp((rz-map(p+0.1))*0.5,-0.1,1.0);
          vec3 l=vec3(0.1,0.3,0.4)+vec3(5.0,2.5,3.0)*f;
          cl=cl*l+smoothstep(2.5,0.0,rz)*0.6*l;
          d+=min(rz,1.0);
        }

        vec4 color=vec4(min(u_color,cl),1.0);
        color.r=max(u_background.r,color.r);
        color.g=max(u_background.g,color.g);
        color.b=max(u_background.b,color.b);
        gl_FragColor=color;
      }
    `,
    []
  );

  const vertexShader = useMemo(
    () => `
      void main(){
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    []
  );

  // Material criado via three.js (evita tipagem do <shaderMaterial /> no R3F)
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms,
        fragmentShader,
        vertexShader,
        glslVersion: THREE.GLSL1, // ok nos tipos de three
      }),
    [uniforms, fragmentShader, vertexShader]
  );

  useFrame(({ clock, mouse }) => {
    if (!mesh.current) return;
    // atualiza uniforms
    material.uniforms.u_time.value = clock.getElapsedTime();
    material.uniforms.u_mouse.value.set(mouse.x / 2 + 0.5, mouse.y / 2 + 0.5);

    const res = material.uniforms.u_resolution.value;
    if (res.x !== size.width || res.y !== size.height) {
      res.set(size.width, size.height);
    }
  });

  return (
    <mesh ref={mesh} scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1]} />
      {/* aplica o material diretamente */}
      <primitive object={material} attach="material" />
    </mesh>
  );
}
