import { Color, Object3D } from 'three';
import { WebglManager } from '../webgl/Manager';

export interface IProps {
  manager: WebglManager;
  scene: Object3D;
  color: Color;
  size: number;
}
