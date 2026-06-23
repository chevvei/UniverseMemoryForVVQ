import * as THREE from 'three';

export function createOrbitPath(radius, color) {
  const N = 360;
  const pos = new Float32Array(N * 3);
  const off = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;
    pos[i * 3] = Math.cos(a) * radius;
    pos[i * 3 + 1] = 0;
    pos[i * 3 + 2] = Math.sin(a) * radius;
    off[i] = i / N;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('aOffset', new THREE.BufferAttribute(off, 1));
  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uTime: { value: 0 }, uColor: { value: new THREE.Color(color) } },
    vertexShader: `
      attribute float aOffset; varying float vB; uniform float uTime;
      void main(){
        float phase = fract(aOffset - uTime * 0.08);
        vB = smoothstep(0.0, 1.0, phase);
        gl_PointSize = 2.0 + vB * 2.4;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: `
      varying float vB; uniform vec3 uColor;
      void main(){
        vec2 c = gl_PointCoord - 0.5; float d = length(c);
        if(d > 0.5) discard;
        gl_FragColor = vec4(uColor, (0.12 + vB * 0.85) * (1.0 - d * 2.0));
      }`
  });
  const object = new THREE.Points(geo, mat);
  function update(t) { mat.uniforms.uTime.value = t; }
  return { object, update };
}
