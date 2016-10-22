import { Scene, PerspectiveCamera, WebGLRenderer, AmbientLight, SpotLight, Vector3, AxisHelper, PCFSoftShadowMap, SpotLightHelper, MeshLambertMaterial } from 'three'
import { BoxGeometry, MeshStandardMaterial, Mesh } from 'three'
import { Raycaster, Vector2 } from 'three'
import ColladaLoader from 'three-collada-loader'

import _ from 'underscore'

import Resizer from './gallery/resizer.js'

import './gallery.css'

let scene = new Scene()
scene.add(new AmbientLight(0xffffff, 0.5))

scene.add(new AxisHelper(4))

let loader = new ColladaLoader()
loader.options.convertUpAxis = true
loader.load('room1.dae', model => { model.scene.scale.set(0.0833, 0.0833, 0.0833); scene.add(model.scene)
scene.updateMatrixWorld(true)
model.scene.traverse(obj => {
obj.receiveShadow = true
obj.castShadow = true
if (obj.material instanceof MeshLambertMaterial) {
  obj.material = new MeshStandardMaterial({ color: obj.material.color })
}
})
scene.traverse(obj => {
  for (let nameAttr of obj.name.split("_")) {
    let [name, value] = nameAttr.split("-")
    if (name && value) {
      obj.userData[name] = value
      switch (name) {
      case "light":
        obj.receiveShadow = obj.castShadow = false
        obj.traverse(child => { child.castShadow = false })
        obj.traverse(child => { if (child.material && child.material.emissive) { child.material = child.material.clone(); child.material.emissive.set(0xffffff) } })
        let light = new SpotLight(0xffffff)
        // light.position.set(0, 0, 0)
        // obj.add(light)
        // light.updateMatrixWorld()
        light.position.copy(obj.getWorldPosition())
        scene.add(light)
        light.target.position.copy(obj.getWorldPosition())
        light.target.position.y = 0
        light.target.updateMatrixWorld()
        // light.target = window.cube
        // light.angle = Math.PI/6
        light.castShadow = true
        light.shadow.mapSize.x = 2048
        light.shadow.mapSize.y = 2048
        light.shadow.radius = 2
        light.shadow.bias = -0.0001
        light.decay = 2
        light.penumbra = 0.1
        // light.distance = 25
        let spotlightHelper = new SpotLightHelper(light)
        scene.add(spotlightHelper)
      }
    }
  }
})
})

var geometry = new BoxGeometry( 2, 5.666, 2 );
var material = new MeshStandardMaterial( { color: 0x00ff00 } );
var cube = new Mesh( geometry, material );
cube.position.set(10, 5.665/2, -15)
cube.castShadow = true
cube.receiveShadow = true
window.cube = cube

scene.add( cube );


let camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000)
camera.position.set(4, 5.5, -4)
camera.lookAt(new Vector3(5, 5.5, -6))
window.camera = camera

let renderer = new WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.shadowMap.enabled = true
renderer.shadowMap.type = PCFSoftShadowMap

document.body.appendChild(renderer.domElement)

let resizer = new Resizer(renderer, camera)

var raycaster = new Raycaster()
var targetPos

function animate() {
  window.requestAnimationFrame(animate)

  if (targetPos && camera.position.distanceToSquared(targetPos) > 0.01) {
    let dir = targetPos.clone().sub(camera.position).normalize().multiplyScalar(0.1)
    camera.position.add(dir)
  }
  camera.lookAt(cube.position)

  renderer.render(scene, camera)
}

animate()


function click(event) {
  var clickPos
  if (event.changedTouches) {
    clickPos = event.changedTouches.item(0)
  } else {
    clickPos = event
  }
  let mouse = new Vector2(
    // calculate mouse position in normalized device coordinates
    // (-1 to +1) for both components
    ( clickPos.clientX / window.innerWidth ) * 2 - 1,
    - ( clickPos.clientY / window.innerHeight ) * 2 + 1
  )
  raycaster.setFromCamera( mouse, camera )
  let intersects = raycaster.intersectObjects( scene.children, true)
  let floor = _.find(intersects, i => { return i.object instanceof Mesh })
  if (floor) {
    targetPos = floor.point.clone()
    targetPos.y = 5.5
    console.log(targetPos)
  }
}

document.body.addEventListener('mouseup', click)
document.body.addEventListener('touchend', click)
