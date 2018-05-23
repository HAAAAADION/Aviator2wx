
import * as THREE from './libs/three.js';
import Sky from './modules/sky.js';
import Pilot from './modules/pilot.js';
import Sea from './modules/sea.js';
import airPlane from './modules/airplane.js';
import Cloud from './modules/cloud.js';
/**
 * 游戏主函数
 */
export default class Main {
  scene;
  camera;
  HEIGHT;
  WIDTH;
  renderer;
  container;
  mousePos = { x: 0, y: 0 };

  constructor() {
    this.createScene();
    this.createLights();
    this.createSea();
    this.createSky();
    this.createPlane();
    this.loop();
    document.addEventListener('touchmove', this.handleMouseMove.bind(this), false);
  }
  createScene() {
    // 获取场景的宽和高,用它们来设置相机的纵横比和渲染器的的尺寸
    this.HEIGHT = window.innerHeight;
    this.WIDTH = window.innerWidth;

    // 创建场景scene
    this.scene = new THREE.Scene();

    // 在场景中添加雾效; 颜色与css中背景颜色相同
    this.scene.fog = new THREE.Fog(0xf7d9aa, 100, 950);

    // 创建摄像机camera
    const aspectRatio = this.WIDTH / this.HEIGHT;
    const fieldOfView = 60;
    const nearPlane = 1;
    const farPlane = 10000;
    this.camera = new THREE.PerspectiveCamera(
      fieldOfView,
      aspectRatio,
      nearPlane,
      farPlane
    );

    // 设置摄像机的坐标
    this.camera.position.x = 0;
    this.camera.position.z = 200;
    this.camera.position.y = 100;

    const ctx = canvas.getContext('webgl')

    // 创建渲染器renderer
    this.renderer = new THREE.WebGLRenderer({
      // 允许背景透明，这样可以显示我们在css中定义的背景色
      alpha: true,

      // 开启抗锯齿效果; 性能变低,但是,因为我们的项目是基于低多边形的,应该还好
      antialias: true,
      context: ctx
    });

    // 定义渲染器的尺寸，此项目中它充满整个屏幕
    this.renderer.setSize(this.WIDTH, this.HEIGHT);

    // 启用阴影渲染
    this.renderer.shadowMap.enabled = true;


    // 监听屏幕：如果用户改变屏幕尺寸，必须更新摄像机和渲染器的尺寸
    window.addEventListener('resize', this.handleWindowResize, false);
  }
  createLights() {
    // 半球光HemisphereLight是渐变色光源；第一个参数是天空的颜色，第二个参数是地面的颜色，第三个参数是光源的强度
    const hemisphereLight = new THREE.HemisphereLight(0xaaaaaa, 0x000000, .9);

    // 平行光DirectionLight是从指定方向照射过来的光源。在此项目里用它来实现太阳光，所以它产生的光都是平行的
    const shadowLight = new THREE.DirectionalLight(0xffffff, .9);
    const ambientLight = new THREE.AmbientLight(0xdc8874, .5);

    // 设置光源的位置  
    shadowLight.position.set(150, 350, 350);

    // 允许投射阴影 
    shadowLight.castShadow = true;

    // 定义投射阴影的可见区域
    shadowLight.shadow.camera.left = -400;
    shadowLight.shadow.camera.right = 400;
    shadowLight.shadow.camera.top = 400;
    shadowLight.shadow.camera.bottom = -400;
    shadowLight.shadow.camera.near = 1;
    shadowLight.shadow.camera.far = 1000;

    // 定义阴影的分辨率; 越高越好，但性能也越低
    shadowLight.shadow.mapSize.width = 2048;
    shadowLight.shadow.mapSize.height = 2048;

    // 把光源添加到场景中激活它们
    this.scene.add(ambientLight);
    this.scene.add(hemisphereLight);
    this.scene.add(shadowLight);
  }
  createSea() {
    this.sea = new Sea();

    // 把它放到屏幕下方
    this.sea.mesh.position.y = -600;

    // 在场景中追加大海的Mesh对象
    this.scene.add(this.sea.mesh);
  }
  createSky() {
    this.sky = new Sky();
    this.sky.mesh.position.y = -600;
    this.scene.add(this.sky.mesh);
  }
  createPlane() {
    this.airplane = new airPlane();
    
    this.airplane.mesh.scale.set(.25, .25, .25);
    this.airplane.mesh.position.y = 100;
    this.scene.add(this.airplane.mesh);
  }
  loop() {
    // 转动螺旋桨、大海和天空
    // this.airplane.propeller.rotation.x += 0.3;
    this.sea.mesh.rotation.z += .005;
    this.sky.mesh.rotation.z += .01;

    this.updatePlane();
    this.sea.moveWaves();

    this.renderer.setClearColor(0xf7d9aa, 1.0);

    // 渲染场景
    this.renderer.render(this.scene, this.camera);

    // 再次调用loop函数
    requestAnimationFrame(this.loop.bind(this));
  }
  updatePlane() {
    var targetY = this.normalize(this.mousePos.y, -.75, .75, 25, 175);
    var targetX = this.normalize(this.mousePos.x, -.75, .75, -100, 100);

    // 在每帧通过添加剩余距离的一小部分的值移动飞机
    this.airplane.mesh.position.y += (targetY - this.airplane.mesh.position.y) * 0.1;

    // 剩余的距离按比例转动飞机
    this.airplane.mesh.rotation.z = (targetY - this.airplane.mesh.position.y) * 0.0128;
    this.airplane.mesh.rotation.x = (this.airplane.mesh.position.y - targetY) * 0.0064;

    this.airplane.propeller.rotation.x += 0.3;

    this.airplane.pilot.updateHairs();
  }
  normalize(v, vmin, vmax, tmin, tmax) {
    var nv = Math.max(Math.min(v, vmax), vmin);
    var dv = vmax - vmin;
    var pc = (nv - vmin) / dv;
    var dt = tmax - tmin;
    var tv = tmin + (pc * dt);
    return tv;
  }
  handleMouseMove(e) {
    var event = e.touches[0];
    // 将鼠标位置归一化到-1和1之间
    // 横轴的函数公式
    var tx = -1 + (event.clientX / this.WIDTH) * 2;

    // 对宗轴来说，我们需求反函数，因为2D的y轴和3D的y轴方向相反

    var ty = 1 - (event.clientY / this.HEIGHT) * 2;
    this.mousePos = { x: tx, y: ty };
  }
  handleWindowResize() {
    // 更新渲染器和摄像机的宽高
    this.HEIGHT = window.innerHeight;
    this.WIDTH = window.innerWidth;
    this.renderer.setSize(this.WIDTH, this.HEIGHT);
    this.camera.aspect = this.WIDTH / this.HEIGHT;
    this.camera.updateProjectionMatrix();
  }
}
