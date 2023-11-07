import { Color, Object3D } from 'three';
import { WebglManager } from '../webgl/Manager';

export interface IProps {
  manager: WebglManager;
  scene: Object3D;
  srcs: string[];
  scale: number;
  color: Color;
}

export interface IShape {
  key: string;
  vertices: Float32Array;
}

export interface IWithLerp {
  current: number;
  target: number;
}
