import * as THREE from 'three';

export function radialSprite(color, size, opacity = 1) {
  const cv = document.createElement('canvas');
  cv.width = cv.height = 128;
  const ctx = cv.getContext('2d');
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  const c = new THREE.Color(color);
  const r = Math.round(c.r * 255), gg = Math.round(c.g * 255), b = Math.round(c.b * 255);
  g.addColorStop(0, `rgba(${r},${gg},${b},1)`);
  g.addColorStop(0.4, `rgba(${r},${gg},${b},0.5)`);
  g.addColorStop(1, `rgba(${r},${gg},${b},0)`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(cv);
  const mat = new THREE.SpriteMaterial({
    map: tex, color: 0xffffff, transparent: true, opacity,
    blending: THREE.AdditiveBlending, depthWrite: false
  });
  const sp = new THREE.Sprite(mat);
  sp.scale.set(size, size, 1);
  return sp;
}

export function makeAtmosphere(radius, color) {
  const geo = new THREE.SphereGeometry(radius, 48, 48);
  const mat = new THREE.ShaderMaterial({
    transparent: true, side: THREE.BackSide, blending: THREE.AdditiveBlending, depthWrite: false,
    uniforms: { uColor: { value: new THREE.Color(color) } },
    vertexShader: `
      varying vec3 vN; varying vec3 vd;
      void main(){
        vN = normalize(normalMatrix * normal);
        vec4 mv = modelViewMatrix * vec4(position,1.0);
        vd = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `
      varying vec3 vN; varying vec3 vd; uniform vec3 uColor;
      void main(){
        float f = pow(1.0 - dot(vN, vd), 2.4);
        gl_FragColor = vec4(uColor, f);
      }`
  });
  return new THREE.Mesh(geo, mat);
}

export function makeRingTexture() {
  const cv = document.createElement('canvas');
  cv.width = 512; cv.height = 64;
  const ctx = cv.getContext('2d');
  for (let i = 0; i < 512; i++) {
    const t = i / 512;
    const band = 0.4 + 0.6 * Math.abs(Math.sin(t * 40) * Math.cos(t * 13));
    const a = 0.15 + 0.5 * band * (0.5 + 0.5 * Math.sin(t * 7));
    ctx.fillStyle = `rgba(245,225,180,${a.toFixed(3)})`;
    ctx.fillRect(i, 0, 1, 64);
  }
  const tex = new THREE.CanvasTexture(cv);
  return tex;
}

export function makeHalo(color, baseSize) {
  const sp = radialSprite(color, baseSize, 0.5);
  return sp;
}
