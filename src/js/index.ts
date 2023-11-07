import { AmbientLight, Color, PointLight } from 'three';
import '../styles/index.scss';
import { WebglManager } from './webgl/Manager';
import { Morpher } from './Morpher';
import { Background } from './Background';

const manager = new WebglManager('#scene', {
  cameraProps: {
    fov: 60,
    perspective: 2000,
  },
});
manager.play();

manager.scene.background = new Color(0xaaaaaa);

const light = new PointLight(0xffffff, 1, 0, 0);
light.position.set(0, 500, 500);
manager.scene.add(light);

const ambient = new AmbientLight(0xffffff, 0.25);
manager.scene.add(ambient);

// eslint-disable-next-line no-new
new Background({
  manager,
  scene: manager.scene,
  color: new Color(0xffffff),
  size: 50,
});

const morpher = new Morpher({
  manager,
  scene: manager.scene,
  srcs: ['bulb.obj', 'spanner.obj', 'plane.obj'],
  scale: 400,
  color: new Color(0xffffff),
});

const hoverElements = document.querySelectorAll('.js-morph-hover');
hoverElements.forEach((element) => {
  const indexAttr = element.getAttribute('data-index');
  if (!indexAttr) {
    return;
  }

  const index = parseInt(indexAttr, 10);

  element.addEventListener('mouseenter', () => {
    morpher.morph(index);
  });
});
