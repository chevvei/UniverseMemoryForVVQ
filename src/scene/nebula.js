import * as THREE from 'three';
import { COLOR } from '../config.js';

// 双色程序化星云：蓝(cv) + 粉(qq) 粒子云 + 柔化 shader
export function createNebula() {
  const g = new THREE.Group();
  const clusters = [
    { center: new THREE.Vector3(380, 30, -200), color: new THREE.Color(COLOR.ICE), count: 800, radius: 140 },
    { center: new THREE.Vector3(-300, -20, 320), color: new THREE.Color(COLOR.ROSE), count: 800, radius: 130 },
    { center: new THREE.Vector3(-150, 80, -450), color: new THREE.Color(COLOR.SUN), count: 500, radius: 100 },
  ];

  for (const c of clusters) {
    const pos = new Float32Array(c.count * 3);
    const aSize = new Float32Array(c.count);
    for (let i = 0; i < c.count; i++) {
      const r = c.radius * Math.cbrt(Math.random());
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = c.center.x + r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = c.center.y + r * Math.sin(phi) * Math.sin(theta) * 0.6;
      pos[i * 3 + 2] = c.center.z + r * Math.cos(phi);
      aSize[i] = 0.5 + Math.random() * 2.5;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('aSize', new THREE.BufferAttribute(aSize, 1));
    const mat = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: { uColor: { value: c.color }, uTime: { value: 0 } },
      vertexShader: `
        attribute float aSize; uniform float uTime; varying float vAlpha;
        void main(){
          vAlpha = 0.4 + 0.3 * sin(uTime * 0.5 + aSize * 3.0);
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = aSize * (300.0 / -mv.z);
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: `
        varying float vAlpha; uniform vec3 uColor;
        void main(){
          vec2 c = gl_PointCoord - 0.5; float d = length(c);
          if(d > 0.5) discard;
          float a = vAlpha * smoothstep(0.5, 0.0, d);
          gl_FragColor = vec4(uColor, a);
        }`
    });
    const points = new THREE.Points(geo, mat);
    g.add(points);
  }
  function update(t) {
    g.rotation.y = t * 0.004;
    for (const child of g.children) child.material.uniforms.uTime.value = t;
  }
  return { object: g, update };
}
