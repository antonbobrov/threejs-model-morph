import { PCancelable } from '@anton.bobrov/vevet-init';
import { Mesh } from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { IShape } from './types';

const loader = new OBJLoader();

export const loadShape = (src: string) =>
  new PCancelable<IShape>((resolve, reject) => {
    loader.load(
      src,
      (result) => {
        let vertices: Float32Array | undefined;

        result.traverse((obj) => {
          if (obj instanceof Mesh) {
            vertices = obj.geometry.attributes.position.array;
          }
        });

        if (!vertices) {
          reject();

          return;
        }

        resolve({
          key: src,
          vertices,
        });
      },
      () => {},
      reject,
    );
  });
