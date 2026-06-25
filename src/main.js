import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import './styles/main.css';
import { loadMemories } from './data/loader.js';
import { createRenderer } from './core/renderer.js';
import { createLoop } from './core/loop.js';
import { createCameraRig } from './core/camera-rig.js';
import { createStarfield } from './scene/starfield.js';
import { createGalaxy } from './scene/galaxy.js';
import { createNebula } from './scene/nebula.js';
import { createSun } from './scene/sun.js';
import { createTwins } from './scene/twins.js';
import { createComets } from './scene/comets.js';
import { createPlanets } from './scene/planets.js';
import { createPoints } from './scene/points.js';
import { createTagLayer } from './ui/tags.js';
import { loadShip } from './ship/ship.js';
import { createShipControls } from './ship/controls.js';
import { createViewMode } from './ship/view-mode.js';
import { createTrail } from './ship/trail.js';
import { createGallery } from './ui/gallery.js';
import { createUploadPanel } from './ui/upload-panel.js';
import { createHud } from './ui/hud.js';
import { createNav, createLoading } from './ui/nav.js';
import { createBgm } from './audio/bgm.js';

async function boot() {
  const app = document.getElementById('app');
  const loading = createLoading(app);
  const data = loadMemories();

  const { scene, camera, composer, renderer } = createRenderer(app);
  const loop = createLoop(composer);
  const rig = createCameraRig(camera);

  const orbit = new OrbitControls(camera, renderer.domElement);
  orbit.enabled = false;
  orbit.enablePan = false;
  orbit.enableDamping = true;
  orbit.dampingFactor = 0.08;
  orbit.rotateSpeed = 0.5;
  orbit.zoomSpeed = 0.6;
  orbit.minDistance = 30;
  orbit.maxDistance = 80;
  orbit.minPolarAngle = Math.PI * 0.22;
  orbit.maxPolarAngle = Math.PI * 0.62;

  const starfield = createStarfield();
  const galaxy = createGalaxy();
  const nebula = createNebula();
  const sun = createSun();
  const twins = createTwins();
  const comets = createComets();
  const planets = createPlanets(data.planets);
  const points = createPoints(data.points);

  scene.add(starfield.object, galaxy.object, nebula.object, sun.object, twins.object, comets.object, planets.object, points.object);

  const tags = createTagLayer(app);
  for (const m of planets.meshes) {
    tags.bind(m.planet, `${m.data.name} · ${m.data.owner}`, m.data.owner === 'cv' ? 'planet-tag' : 'planet-tag', m.data.appearance.size + 2);
  }
  for (const pt of points.meshes) {
    tags.bind(pt.group, pt.data.name, 'poi-tag', 4);
  }

  const shipApi = await loadShip();
  const ship = shipApi.object;
  ship.position.set(0, 20, 160);
  scene.add(ship);
  const controls = createShipControls(ship, renderer.domElement);
  const viewMode = createViewMode(ship, camera);
  const trail = createTrail(ship);
  scene.add(trail.object);

  const gallery = createGallery(scene);
  const uploadPanel = createUploadPanel(app);
  const hud = createHud(app, data.site);
  const nav = createNav(app);
  const bgm = createBgm();
  nav.muteBtn.addEventListener('click', () => {
    const muted = bgm.toggleMute();
    nav.muteBtn.textContent = muted ? '♪̸' : '♪';
  });
  nav.viewBtn.addEventListener('click', () => {
    const m = viewMode.toggle();
    hud.setTarget(m === 'cockpit' ? '— 舱内视角 —' : '— 自由航行 —');
  });
  nav.hudBtn.addEventListener('click', () => hud.toggleStyle());
  nav.uploadBtn.addEventListener('click', () => {
    if (!inPlanet) return;
    uploadPanel.open((card) => {
      const idx = gallery.addCard(card);
      gallery.focusCard(idx);
      nav.setHint('已加入这颗星球 ✓ 点击卡片放大');
    });
  });
  controls.bindJoystick(nav.joy, nav.knob);
  controls.bindThrottle(nav.throttle);

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let inPlanet = false;
  const savedCam = { pos: new THREE.Vector3(), quat: new THREE.Quaternion() };

  function pickList() {
    if (inPlanet) return gallery.getMeshes();
    const list = [];
    planets.meshes.forEach((m) => m.body && list.push(m.body));
    points.meshes.forEach((p) => list.push(p.marker));
    return list;
  }

  let downX = 0, downY = 0;
  renderer.domElement.addEventListener('pointerdown', (e) => { downX = e.clientX; downY = e.clientY; });
  renderer.domElement.addEventListener('pointerup', (e) => {
    if (Math.hypot(e.clientX - downX, e.clientY - downY) > 6) return;
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(pickList(), false);
    if (inPlanet) {
      if (!hits.length) { gallery.resume(); return; }
      const obj = hits[0].object;
      if (obj.userData.cardIndex !== undefined) gallery.focusCard(obj.userData.cardIndex);
      return;
    }
    if (!hits.length) return;
    const obj = hits[0].object;
    let planetId = obj.userData.planetId || obj.userData.linkPlanet;
    if (!planetId) return;
    enterPlanet(planetId);
  });

  function enterPlanet(planetId) {
    const entry = planets.meshes.find((m) => m.id === planetId);
    if (!entry) return;
    if (rig.isActive()) return;
    savedCam.pos.copy(camera.position);
    savedCam.quat.copy(camera.quaternion);
    controls.setEnabled(false);
    const center = new THREE.Vector3();
    entry.planet.getWorldPosition(center);
    hud.setTarget(`→ ${entry.data.name}`);
    rig.flyTo(center, 48, () => {
      gallery.open(entry.data, center);
      inPlanet = true;
      orbit.target.copy(center);
      orbit.enabled = true;
      orbit.update();
      nav.setInPlanet(true);
      nav.setHint('拖动转视角 · 点击卡片放大 · 返回宇宙退出');
      hud.setTarget(`◉ ${entry.data.name} · ${entry.data.owner}`);
    }, 1.8);
  }

  nav.backBtn.addEventListener('click', () => {
    if (!inPlanet || rig.isActive()) return;
    gallery.close();
    inPlanet = false;
    orbit.enabled = false;
    nav.setInPlanet(false);
    nav.setHint('点击星球进入记忆');
    rig.returnTo(savedCam.pos, savedCam.quat, () => {
      controls.setEnabled(true);
      hud.setTarget('— 自由航行 —');
    }, 1.4);
  });

  loop.add((t, dt) => {
    starfield.update(t);
    galaxy.update(t);
    nebula.update(t);
    sun.update(t);
    twins.update(t);
    comets.update(t);
    planets.update(t);
    points.update(t);
    blackhole.update(t);
    gallery.update(t, dt);

    const flying = rig.update(dt);
    let throttle = 0;
    if (!flying && !inPlanet) {
      throttle = controls.update(dt);
      viewMode.update(dt);
    }
    if (!flying && inPlanet) orbit.update();
    shipApi.update(t, throttle);
    trail.update(dt, throttle);
    hud.setSpeed(controls.velocity.length());
    tags.update(camera);
  });

  loop.start();
  loading.ready();
  loading.onEnter(() => {
    bgm.play();
  });
}

boot();
