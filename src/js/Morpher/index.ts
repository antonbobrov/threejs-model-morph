import {
  BufferAttribute,
  BufferGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
} from 'three';
import {
  IRemovable,
  Timeline,
  lerp,
  scoped,
  vevet,
  wrap,
} from '@anton.bobrov/vevet-init';
import { IAddEventListener, addEventListener } from 'vevet-dom';
import { IProps, IShape, IWithLerp } from './types';
import { loadShape } from './loadShape';

export class Morpher {
  private get props() {
    return this._props;
  }

  private _isDestroyed = false;

  private _shapes: IShape[] = [];

  private _group: Group;

  private _mesh?: Mesh;

  private _geometry?: BufferGeometry;

  private _vertices!: Float32Array;

  private _timeline?: Timeline;

  private _progress = 0;

  private _listeners: IAddEventListener[] = [];

  private _managerEvents: IRemovable[] = [];

  private _mouseX: IWithLerp = { current: 0, target: 0 };

  private _mouseY: IWithLerp = { current: 0, target: 0 };

  constructor(private _props: IProps) {
    this._group = new Group();
    _props.scene.add(this._group);

    this._listeners.push(
      addEventListener(window, 'mousemove', (event) =>
        this._handleMouseMove(event),
      ),
    );

    this._managerEvents.push(
      _props.manager.callbacks.add('render', () => this._render()),
    );

    Promise.all(_props.srcs.map((src) => loadShape(src)))
      .then((result) => {
        if (this._isDestroyed) {
          return;
        }

        this._handleLoad(result);
      })
      .catch((e) => {
        throw new Error(e);
      });
  }

  private _handleLoad(shapes: IShape[]) {
    const { scale, color } = this.props;
    this._shapes = shapes;

    const largestShape = [...this._shapes].sort(
      (a, b) => b.vertices.length - a.vertices.length,
    )[0];

    this._vertices = new Float32Array(largestShape.vertices);

    this._geometry = new BufferGeometry();
    this._geometry.setAttribute(
      'position',
      new BufferAttribute(this._vertices, 3),
    );
    this._geometry.computeVertexNormals();

    const material = new MeshStandardMaterial({ color });

    this._mesh = new Mesh(this._geometry, material);
    this._group.add(this._mesh);

    this._mesh.scale.set(scale, scale, scale);

    this._renderGeometry();
  }

  private _handleMouseMove(event: MouseEvent) {
    this._mouseX.target = scoped(event.clientX, [
      vevet.viewport.width / 2,
      vevet.viewport.width,
    ]);

    this._mouseY.target = scoped(event.clientY, [
      vevet.viewport.height / 2,
      vevet.viewport.height,
    ]);
  }

  public morph(index: number) {
    if (this._isDestroyed || this._shapes.length < index + 1) {
      return;
    }

    this._timeline?.destroy();

    const startProgress = this._progress;
    const targetProgress = index;
    const diffProgress = targetProgress - startProgress;

    this._timeline = new Timeline({ duration: 1000 });

    this._timeline.addCallback('progress', ({ easing }) => {
      this._progress = startProgress + diffProgress * easing;

      this._renderGeometry();
    });

    this._timeline.play();
  }

  private _render() {
    const { _mouseX: mouseX, _mouseY: mouseY, props, _group: group } = this;
    const { easeMultiplier } = props.manager;

    const ease = 0.1 * easeMultiplier;

    mouseX.current = lerp(mouseX.current, mouseX.target, ease);
    mouseY.current = lerp(mouseY.current, mouseY.target, ease);

    group.rotation.y = mouseX.current * Math.PI * 0.125;
    group.rotation.x = mouseY.current * Math.PI * 0.125;

    group.position.y = mouseX.current * 100;
    group.position.x = mouseY.current * 100;

    props.manager.camera.rotation.y = mouseX.current * Math.PI * -0.05;
    props.manager.camera.rotation.x = mouseY.current * Math.PI * -0.05;
  }

  private _renderGeometry() {
    if (!this._geometry || !this._mesh) {
      return;
    }

    const { _progress: progress } = this;

    // render mesh

    this._mesh.rotation.y = Math.PI * 2 * -progress;

    // render geometry

    const percent = progress - Math.floor(progress);
    const prevIndex = Math.floor(wrap(0, this._shapes.length, progress));
    const nextIndex = Math.round(wrap(0, this._shapes.length, prevIndex + 1));

    const prevVertices = this._shapes[prevIndex].vertices;
    const nextVertices = this._shapes[nextIndex].vertices;

    if (!prevVertices || !nextVertices) {
      return;
    }

    const geometryVertices = this._geometry.attributes.position;

    for (let i = 0; i < prevVertices.length; i += 3) {
      geometryVertices.array[i] = lerp(
        prevVertices[i],
        nextVertices[i] ?? 0,
        percent,
      );

      geometryVertices.array[i + 1] = lerp(
        prevVertices[i + 1],
        nextVertices[i + 1] ?? 0,
        percent,
      );

      geometryVertices.array[i + 2] = lerp(
        prevVertices[i + 2],
        nextVertices[i + 2] ?? 0,
        percent,
      );
    }

    geometryVertices.needsUpdate = true;
    this._geometry.computeVertexNormals();
  }

  public destroy() {
    this._isDestroyed = true;

    if (this._mesh) {
      this._group.remove(this._mesh);
    }

    this._timeline?.destroy();

    this._listeners.forEach((listener) => listener.remove());
    this._managerEvents.forEach((event) => event.remove());
  }
}
