import * as THREE from 'three';
import { radialSprite } from './_helpers.js';

export function createBlackhole({ position = new THREE.Vector3(0, 60, -520), radius = 16 } = {}) {
  const root = new THREE.Group();
  root.position.copy(position);

  // 事件视界：纯黑球
  const core = new THREE.Mesh(
    new THREE.SphereGeometry(radius, 48, 48),
    new THREE.MeshBasicMaterial({ color: 0x000000 })
  );
  root.add(core);

  // 吸积盘：旋转色带 shader
  const disk = new THREE.Mesh(
    new THREE.RingGeometry(radius * 1.3, radius * 3.6, 128, 1),
    new THREE.ShaderMaterial({
      transparent: true, side: THREE.DoubleSide, depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uTime: { value: 0 } },
      vertexShader: `
        varying vec2 vUv; varying float vR;
        void main(){
          vUv = uv;
          vR = length(position.xy);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
        }`,
      fragmentShader: `
        varying vec2 vUv; varying float vR; uniform float uTime;
        void main(){
          float ang = atan(vUv.y - 0.5, vUv.x - 0.5);
          float swirl = sin(ang * 6.0 + uTime * 3.0 - vR * 0.4);
          float heat = smoothstep(0.0, 1.0, 1.0 - vUv.y);
          vec3 cInner = vec3(1.0, 0.95, 0.8);
          vec3 cOuter = vec3(1.0, 0.45, 0.12);
          vec3 col = mix(cOuter, cInner, heat);
          float a = (0.45 + 0.35 * swirl) * smoothstep(1.0, 0.2, vUv.y);
          gl_FragColor = vec4(col, a);
        }`
    })
  );
  disk.rotation.x = Math.PI / 2.1;
  root.add(disk);

  // 引力透镜光环：细高亮环
  const lens = new THREE.Mesh(
    new THREE.RingGeometry(radius * 1.02, radius * 1.18, 96),
    new THREE.MeshBasicMaterial({
      color: 0xffe6c0, transparent: true, opacity: 0.7,
      side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false
    })
  );
  root.add(lens);

  // 外部微光
  root.add(radialSprite(0xffcaa0, radius * 9, 0.18));

  function update(t) {
    disk.material.uniforms.uTime.value = t;
    disk.rotation.z = t * 0.25;
    lens.quaternion.copy(disk.quaternion); // 占位：保证 lens 随盘朝向并使 update 非空
  }

  return { object: root, update };
}
