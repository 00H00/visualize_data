
//import * as THREE from './three.module.js';
//import {OrbitControls} from './OrbitControls.js';

import * as THREE from 'https://cdn.skypack.dev/three@0.129.0'
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js'

/* global 変数 */
let canvas;
let renderer;
let scene;
let camera;
let colors = [
	new THREE.Color(0x0168b3),
	new THREE.Color(0x5e4694),
	new THREE.Color(0x222584),
	new THREE.Color(0xcc528b),
	new THREE.Color(0xc4a6ca),
	new THREE.Color(0x8f253b),
	new THREE.Color(0x88b83e),
	new THREE.Color(0x604439),
	new THREE.Color(0x797c85),
	new THREE.Color(0xf74023),
	new THREE.Color(0x00984b),
	new THREE.Color(0xc7ddae)
]

// 光源によらない球体のマテリアルを作成する関数
// Arg 1: THREE.Color
// phongモデル
function createSphereMaterial(material_color){

	// 頂点シェーダ
	// normalMatrix,projectionMatrixなどはThree.js側から提供される組み込み変数
	const vertex_shader = `
		varying vec3 transformed_normal;
		void main(){
			transformed_normal = normalMatrix * normal;
			gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
		}
	`

	// フラッグメントシェーダ（GLSL）
	// Three.jsでは組み込み変数が定義されており，
	// 視点座標はcameraPositionでアクセスできる．
	// 視点座標に光源があるとして，ADSシェーダを実装している
	// uniform変数 colorはマテリアル作成時に渡す
	const fragment_shader = `
		uniform vec3 color;
		varying vec3 transformed_normal;
		const float ambient = 0.4;
		void main(){
			vec4 lightDirection = vec4(cameraPosition,1.0);
			vec3 invLight = normalize(viewMatrix*lightDirection).xyz;
			vec3 invEye = normalize(viewMatrix*vec4(cameraPosition,0.0)).xyz;
			vec3 halfLE = normalize(invLight+invEye);
			float diffuse = clamp(dot(transformed_normal,invLight),0.1,0.8);
			float specular = pow(clamp(dot(transformed_normal,halfLE),0.0,0.99),10.0);
			gl_FragColor = (diffuse + specular + ambient)* vec4(color,1.0);
		}
	`
	//　フラッグメントシェーダで使用するuniform変数
	const uniforms = {
		color: { value: material_color }
	}

	return new THREE.ShaderMaterial({
		vertexShader : vertex_shader,
		fragmentShader : fragment_shader,
		uniforms
	});
}

// メイン関数
function main(){
	canvas = document.getElementById('canvas');
	renderer = new THREE.WebGLRenderer({canvas,antialias:true,preserveDrawingBuffer: true });

	// カメラオブジェクトの設定
	const fov = 75;
	const aspect = 2;
	const near = 0.1;
	const far = 100;
	camera = new THREE.PerspectiveCamera(fov,aspect,near,far);
	camera.lookAt(0,0,0);
	camera.position.set(1.2,1.2,1.2);

	// orbit controller
	const controls = new OrbitControls(camera,renderer.domElement);

	// scene
	scene = new THREE.Scene();
	renderer.render(scene,camera);

	// 軸の設定
	const axes = new THREE.AxesHelper(2.0);
	scene.add(axes);

	// draw scene here
	function render(time){

		const canvas = renderer.domElement;
		const width = canvas.clientWidth
		const height = canvas.clientHeight;

		if(canvas.width !== width || canvas.height !== height){
			renderer.setSize(width,height,false);

			camera.aspect = width / height;
			camera.updateProjectionMatrix();
		}


		const {cx,cy,cz} = {
			cx:camera.position.x,
			cy:camera.position.y,
			cz:camera.position.z
		};
		// 単位球の裏側のオブジェクトは見えないようにする
		for(let obj of scene.children){
			// 軸は除外
			if(obj.type == "AxesHelper" || obj.name == "volo")
				continue;
			const {x,y,z} = obj.position;
			// 見えるか見えないか判定し，見えるかどうかを設定
			obj.visible = (x-cx)*x + (y-cy)*y + (z-cz)*z < 0;
		}

		renderer.render(scene,camera);
		requestAnimationFrame(render);
	}

	requestAnimationFrame(render);
}

main();

// 実験データを入力するボタンが押され，ファイルを受け取ったときに呼ばれる関数
function onResultFileInputButtonClicked(e){
	let file = e.target.files[0];

	let reader = new FileReader();
	reader.readAsText(file);

	// ボロノイ図を作成するときに必要な固有ベクトルと色のラベルを保持する
	let eigenvector_with_label = [ ];

	reader.onload = function(){
		const texts = reader.result.split(/\r\n|\n/); // 正規表現で改行文字を表現しないと\rが残る
		let nline = texts.length;
		let index = 0;

		// カンマ区切りの行から座標などを数値に変換する
		const line2xyztype = function(line){
			let data = line.split(',');
			return {
				x : Number.parseFloat(data[0]).toFixed(20),
				y : Number.parseFloat(data[1]).toFixed(20),
				z : Number.parseFloat(data[2]).toFixed(20),
				type : Number.parseInt(data[3]), // 固有ベクトルの区別用のラベル
			}
		};

		// Z固有ベクトルを１行づつ読み取る
		while(texts[index] && index < nline){
			if(texts[index].startsWith("#")){ // #で始まる行はコメント，無視
				index++;
				continue;
			}
			let {x,y,z,type} = line2xyztype(texts[index])
			let e = new THREE.Mesh(
				new THREE.SphereBufferGeometry(0.045,30,30),
				createSphereMaterial(colors[type])
			);
			e.position.set(x,y,z);
			scene.add(e);
			eigenvector_with_label.push([e,type]);

			index++;
		}

		// 空行をずらす
		index++;

		// 1行ごとに初期値の解析と表示
		let geometry = new THREE.SphereBufferGeometry(0.014,30,30);
		while(texts[index] && index < nline){
			if(texts[index].startsWith("#")){
				index++;
				continue;
			}
			let {x,y,z,type} = line2xyztype(texts[index]);
			for(const [e,label] of eigenvector_with_label){
				if(label == type){
					let v = new THREE.Mesh(
						geometry,
						e.material
					);
					v.position.set(x,y,z);
					scene.add(v);
				}
			}

			index++;
		}

/*
 * three.js のバージョンr125でGeometryが削除されてしまったので，ジオメトリの面を取得できなくなった
 *
		// ボロノイ図の追加
		let voloFlag = true;
		if(voloFlag){
			// 半径１の球を作成，400*400分割
			const geometry = new THREE.SphereGeometry(1,400,400);
			console.log(geometry)
			for(let face of geometry.faces){
				for(let abc of [face.a,face.b,face.c]){
					let vertex = geometry.vertices[abc];
					let dist = 1e10;
					let index = 1e10;
					for(let [e,label] of eigenvector_with_label){
						if(dist > e.position.distanceTo(vertex)){
							dist = e.position.distanceTo(vertex);
							index = label;
						}
					}
					face.vertexColors.push(colors[index]);
				}
			}
			const material = new THREE.MeshBasicMaterial(
				{vertexColors: THREE.VertexColors}
			);
			const volo = new THREE.Mesh(geometry,material);
			scene.add(volo);

			volo.name = "volo"; // 名前を付ける
		}
*/

	}
}

// canvasの画面をキャプチャしダウンロードする関数
let onSaveButtonClicked = function(e){
  let a = document.createElement('a');
  a.href = canvas.toDataURL('image/png',0.85);
  a.download = ' image.png';
  a.click();
}

document.getElementById('savebtn').addEventListener('click',onSaveButtonClicked);
document.getElementById('file_result').addEventListener('change',onResultFileInputButtonClicked,false)
