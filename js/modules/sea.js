
import * as THREE from '../libs/three.js';
import COLOR from './color.js';

export default class Main extends COLOR {
  constructor() {
    super();
    this.Sea();
  }
  Sea() {
    // 创建一个圆柱形几何体Geometry;
    // 它的参数: 上表面半径，下表面半径，高度，对象的半径方向的细分线段数，对象的高度细分线段数
    const geom = new THREE.CylinderGeometry(600, 600, 800, 40, 10);

    // 让它在X轴上旋转
    geom.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));

    geom.mergeVertices();

    const l = geom.vertices.length;
    this.waves = [];

    for (var i = 0; i < l; i++) {
      // 获取每个顶点
      var v = geom.vertices[i];

      // 存储一些关联的数值
      this.waves.push({
        y: v.y,
        x: v.x,
        z: v.z,
        // 随机角度
        ang: Math.random() * Math.PI * 2,
        // 随机距离
        amp: 5 + Math.random() * 15,
        // 在0.016至0.048度/帧之间的随机速度
        speed: 0.016 + Math.random() * 0.032
      });
    };

    // 创建材质Material
    const mat = new THREE.MeshPhongMaterial({
      color: this.Colors.blue,
      transparent: true,
      opacity: .6,
      shading: THREE.FlatShading,
    });

    // 在Three.js里创建一个物体Object，我们必须创建一个Mesh对象，Mesh对象就是Geometry创建的框架贴上材质Material最后形成的总体。
    this.mesh = new THREE.Mesh(geom, mat);

    // 允许大海接收阴影
    this.mesh.receiveShadow = true;
  }
  moveWaves() {
    // 获取顶点
    var verts = this.mesh.geometry.vertices;
    var l = verts.length;

    for (var i = 0; i < l; i++) {
      var v = verts[i];

      // 获取关联的值
      var vprops = this.waves[i];

      // 更新顶点的位置
      v.x = vprops.x + Math.cos(vprops.ang) * vprops.amp;
      v.y = vprops.y + Math.sin(vprops.ang) * vprops.amp;

      // 下一帧自增一个角度
      vprops.ang += vprops.speed;
    }

    // 告诉渲染器代表大海的几何体发生改变
    // 事实上，为了维持最好的性能
    // Three.js会缓存几何体和忽略一些修改
    // 除非加上这句
    this.mesh.geometry.verticesNeedUpdate = true;

    this.mesh.rotation.z += .005;
  }
}
