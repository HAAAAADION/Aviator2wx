
import * as THREE from '../libs/three.js';
import COLOR from './color.js';

export default class Main extends COLOR {
  constructor() {
    super();
    this.Cloud();
  }
  Cloud() {
    // 创建一个空的容器用来存放不同部分的云
    this.mesh = new THREE.Object3D();

    // 创建一个立方体;复制多个，来创建云
    var geom = new THREE.BoxGeometry(20, 20, 20);

    // 创建云的材质，简单的白色
    var mat = new THREE.MeshPhongMaterial({
      color: this.Colors.white,
    });

    // 随机定义要复制的几何体数量
    var nBlocs = 3 + Math.floor(Math.random() * 3);
    for (var i = 0; i < nBlocs; i++) {

      // 给复制的几何体创建Mesh对象
      var m = new THREE.Mesh(geom, mat);

      // 给每个立方体随机的设置位置和角度
      m.position.x = i * 15;
      m.position.y = Math.random() * 10;
      m.position.z = Math.random() * 10;
      m.rotation.z = Math.random() * Math.PI * 2;
      m.rotation.y = Math.random() * Math.PI * 2;

      // 随机的设置立方体的尺寸
      var s = .1 + Math.random() * .9;
      m.scale.set(s, s, s);

      // 允许每朵云生成投影和接收投影
      m.castShadow = true;
      m.receiveShadow = true;

      // 把该立方体追加到上面我们创建的容器中
      this.mesh.add(m);
    }
  }
}
