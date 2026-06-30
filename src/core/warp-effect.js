import * as THREE from 'three';
import { COLOR } from '../config.js';

// 超光速跃迁径向模糊后处理 pass（高速时启用）
export function createWarpEffect() {
  const ice = new THREE.Color(COLOR.ICE);
  const rose = new THREE.Color(COLOR.ROSE);

  const geo = new THREE.PlaneGeometry(2, 2);
  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, depthTest: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uIntensity: { value: 0 },
      uColorA: { value: ice },
      uColorB: { value: rose },
      uTime: { value: 0 }
    },
    vertexShader: `
      varying vec2 vUv;
      void main(){ vUv = uv; gl_Position = vec4(position, 1.0); }`,
    fragmentShader: `
      varying vec2 vUv; uniform float uIntensity; uniform float uTime;
      uniform vec3 uColorA; uniform vec3 uColorB;
      void main(){
        vec2 c = vUv - 0.5;
        float d = length(c);
        // 径向速度线
        float ang = atan(c.y, c.x);
        float streak = sin(ang * 60.0 + uTime * 8.0) * 0.5 + 0.5;
        streak = pow(streak, 3.0);
        // 径向渐变（中心暗边缘亮）
        float radial = smoothstep(0.1, 0.5, d);
        vec3 col = mix(uColorA, uColorB, sin(ang * 2.0 + uTime) * 0.5 + 0.5);
        float a = uIntensity * radial * streak * 0.25;
        gl_FragColor = vec4(col, a);
      }`
  });
  const mesh = new THREE.Mesh(geo, mat);
  const root = new THREE.Group();
  root.add(mesh);
  root.visible = false;

  let currentIntensity = 0;
  function setWarp(speed, maxSpeed) {
    const ratio = speed / maxSpeed;
    const target = ratio > 0.85 ? Math.min(1, (ratio - 0.85) / 0.15) : 0;
    root.visible = target > 0.01 || currentIntensity > 0.01;
    // 平滑过渡
    currentIntensity += (target - currentIntensity) * 0.08;
    mat.uniforms.uIntensity.value = currentIntensity;
  }

  function update(t) {
    if (root.visible) mat.uniforms.uTime.value = t;
  }

  return { object: root, update, setWarp };
}
