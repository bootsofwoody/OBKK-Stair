import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const views = new WeakMap();

export async function mount(host, modelUrl) {
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    host.append(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf7f7f6);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x777777, 2));
    const keyLight = new THREE.DirectionalLight(0xffffff, 2);
    keyLight.position.set(2, 4, 3);
    scene.add(keyLight);

    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 1000);
    camera.position.set(1, 1, 1);
    const controls = new OrbitControls(camera, renderer.domElement);

    const render = () => renderer.render(scene, camera);
    controls.addEventListener('change', render);

    const resize = () => {
        const width = host.clientWidth;
        const height = host.clientHeight;
        if (width === 0 || height === 0) {
            return;
        }
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height, false);
        render();
    };

    const observer = new ResizeObserver(resize);
    observer.observe(host);
    resize();

    const view = { renderer, controls, observer, camera, bounds: null, model: null };
    views.set(host, view);

    try {
        const { scene: model } = await new GLTFLoader().loadAsync(modelUrl);
        const bounds = new THREE.Box3().setFromObject(model);
        if (bounds.isEmpty()) {
            disposeModel(model);
            unmount(host);
            return 'The GLB contains no displayable geometry.';
        }

        view.model = model;
        view.bounds = bounds.getBoundingSphere(new THREE.Sphere());
        scene.add(model);
        reset(host);
        render();
        return null;
    } catch (error) {
        console.error('Unable to load the site model.', error);
        unmount(host);
        return 'Site model unavailable. Place base.glb in wwwroot/models and reload.';
    }
}

export function reset(host) {
    const view = views.get(host);
    if (!view?.bounds) {
        return;
    }

    const { camera, controls, bounds } = view;
    const radius = Math.max(bounds.radius, 0.01);
    const verticalHalfFov = THREE.MathUtils.degToRad(camera.fov / 2);
    const horizontalHalfFov = Math.atan(Math.tan(verticalHalfFov) * camera.aspect);
    const distance = 1.08 * radius / Math.sin(Math.min(verticalHalfFov, horizontalHalfFov));

    controls.target.copy(bounds.center);
    controls.minDistance = 0.04 * radius;
    controls.maxDistance = Math.max(12 * radius, distance * 2);
    camera.near = 0.002 * radius;
    camera.far = controls.maxDistance + 4 * radius;
    camera.updateProjectionMatrix();
    camera.position.copy(new THREE.Vector3(1, 0.85, 1.25).setLength(distance).add(bounds.center));
    controls.update();
}

export function unmount(host) {
    const view = views.get(host);
    if (!view) {
        return;
    }

    view.observer.disconnect();
    view.controls.dispose();
    if (view.model) {
        disposeModel(view.model);
    }
    view.renderer.dispose();
    view.renderer.domElement.remove();
    views.delete(host);
}

function disposeModel(model) {
    const geometries = new Set();
    const materials = new Set();
    model.traverse(object => {
        if (object.geometry) geometries.add(object.geometry);
        if (object.material) {
            const objectMaterials = Array.isArray(object.material) ? object.material : [object.material];
            objectMaterials.forEach(material => materials.add(material));
        }
    });
    const textures = new Set();
    materials.forEach(material => {
        Object.values(material).filter(value => value?.isTexture).forEach(texture => textures.add(texture));
        material.dispose();
    });
    textures.forEach(texture => texture.dispose());
    geometries.forEach(geometry => geometry.dispose());
}
