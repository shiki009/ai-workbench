export function disposeObject(obj) {
  if (!obj) return;
  if (obj.geometry) obj.geometry.dispose();
  if (obj.material) {
    if (Array.isArray(obj.material)) {
      obj.material.forEach(disposeMaterial);
    } else {
      disposeMaterial(obj.material);
    }
  }
  if (obj.children) {
    for (let i = obj.children.length - 1; i >= 0; i--) {
      disposeObject(obj.children[i]);
    }
  }
}

function disposeMaterial(mat) {
  if (!mat) return;
  for (const key of Object.keys(mat)) {
    const val = mat[key];
    if (val && typeof val.dispose === 'function') {
      val.dispose();
    }
  }
  mat.dispose();
}

export function removeFromScene(scene, obj) {
  scene.remove(obj);
  disposeObject(obj);
}
