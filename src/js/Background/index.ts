/* eslint-disable no-param-reassign */
import { IcosahedronGeometry, Mesh, MeshStandardMaterial } from 'three';
import { randInt } from 'three/src/math/MathUtils';
import { IRemovable } from '@anton.bobrov/vevet-init';
import { IProps } from './types';

export class Background {
  private get props() {
    return this._props;
  }

  private _meshes: Mesh[] = [];

  private _managerEvents: IRemovable[] = [];

  constructor(private _props: IProps) {
    const quantity = 20;

    const array = new Array(quantity).fill(0);

    const material = new MeshStandardMaterial({ color: _props.color });

    this._meshes = array.map(() => {
      const size = _props.size - randInt(0, _props.size / 2);

      const geometry = new IcosahedronGeometry(size, 0);

      const mesh = new Mesh(geometry, material);
      mesh.position.x = randInt(-3000, 3000);
      mesh.position.y = randInt(-3000, 3000);
      mesh.position.z = randInt(-1000, -200);

      return mesh;
    });

    this._meshes.forEach((object) => {
      _props.scene.add(object);
    });

    this._managerEvents.push(
      _props.manager.callbacks.add('render', () => this._render()),
    );
  }

  private _render() {
    const { easeMultiplier } = this._props.manager;

    const ease = 0.01 * easeMultiplier;

    this._meshes.forEach((mesh) => {
      mesh.rotation.x += ease;
      mesh.rotation.y += ease;
      mesh.rotation.z += ease;
    });
  }

  public destroy() {
    this._meshes.forEach((mesh) => {
      this._props.scene.remove(mesh);
    });
  }
}
