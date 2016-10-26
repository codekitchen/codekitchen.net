// @flow
import { Scene, PerspectiveCamera, WebGLRenderer, AmbientLight, SpotLight, Vector3, AxisHelper, PCFSoftShadowMap, SpotLightHelper, MeshLambertMaterial } from 'three'
import { BoxGeometry, MeshStandardMaterial, Mesh } from 'three'
import { Raycaster, Vector2 } from 'three'
import ColladaLoader from 'three-collada-loader'

import _ from 'underscore'

import Resizer from './gallery/resizer.js'

import './gallery.css'

const scene = new Scene()
scene.add(new AmbientLight(0xffffff, 1.0))

// scene.add(new AxisHelper(4))

const loader = new ColladaLoader()
loader.options.convertUpAxis = true
loader.load('gallery.dae', model => { model.scene.scale.set(0.0833, 0.0833, 0.0833); scene.add(model.scene)
  window.model = model
  console.log(model)
scene.updateMatrixWorld(true)
model.scene.traverse(obj => {
obj.receiveShadow = true
obj.castShadow = true
if (obj.material instanceof MeshLambertMaterial) {
  // the collada importer uses lambert, but that uses per-vertex instead of per-pixel lighting
  obj.material = new MeshStandardMaterial(_.pick(obj.material, 'color', 'map', 'lightMap', 'lightMapIntensity', 'aoMap', 'aoMapIntensity', 'emissive', 'emissiveMap', 'emissiveIntensity', 'alphaMap', 'envMap', 'refractionRatio', 'fog', 'wireframe', 'wireframeLinewidth', 'wireframeLinecap', 'wireframeLinejoin', 'vertexColors', 'skinning', 'morphTargets', 'morphNormals'))
}
})
scene.traverse(obj => {
  for (const nameAttr of obj.name.split("_")) {
    const [name, value] = nameAttr.split("-")
    if (name && value) {
      obj.userData[name] = value
      switch (name) {
      case "light":
        obj.receiveShadow = obj.castShadow = false
        obj.traverse(child => { child.castShadow = false })
        obj.traverse(child => { if (child.material && child.material.emissive) { child.material = child.material.clone(); child.material.emissive.set(0xffffff) } })
        const light = new SpotLight(0xffffff)
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
        const spotlightHelper = new SpotLightHelper(light)
        scene.add(spotlightHelper)
      }
    }
  }
})
})

// const geometry = new BoxGeometry( 2, 5.666, 2 );
// const material = new MeshStandardMaterial( { color: 0x00ff00 } );
// const cube = new Mesh( geometry, material );
// cube.position.set(10, 5.665/2, -15)
// cube.castShadow = true
// cube.receiveShadow = true
// window.cube = cube
//
// scene.add( cube );


const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000)
camera.position.set(4, 5.5, -4)
camera.lookAt(new Vector3(5, 5.5, -6))
window.camera = camera

const renderer = window.renderer = new WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.shadowMap.enabled = true
renderer.shadowMap.type = PCFSoftShadowMap

document.body.appendChild(renderer.domElement)

const resizer = new Resizer(renderer, camera)

const raycaster = new Raycaster()
let targetPos

function animate() {
  window.requestAnimationFrame(animate)

  if (targetPos && camera.position.distanceToSquared(targetPos) > 0.01) {
    const dir = targetPos.clone().sub(camera.position).normalize().multiplyScalar(0.1)
    camera.position.add(dir)
  }
  // camera.lookAt(cube.position)

  renderer.render(scene, camera)
}

animate()


function click(clickPos: { clientX: number, clientY: number }) {
  const mouse = new Vector2(
    // calculate mouse position in normalized device coordinates
    // (-1 to +1) for both components
    ( clickPos.clientX / window.innerWidth ) * 2 - 1,
    - ( clickPos.clientY / window.innerHeight ) * 2 + 1
  )
  raycaster.setFromCamera( mouse, camera )
  const intersects = raycaster.intersectObjects( scene.children, true)
  const floor = _.find(intersects, i => { return i.object instanceof Mesh })
  if (floor) {
    targetPos = floor.point.clone()
    targetPos.y = 5.5
    console.log(targetPos)
  }
}

const canvas = renderer.domElement
let lastX
let didMove = false

function dragMove(event: MouseEvent) {
  event.preventDefault()
  let dy = event.clientX - lastX
  lastX = event.clientX
  didMove = true

  // camera.rotateX(dx)
  camera.rotateY((dy / renderer.getSize().width) * 2)
}
function dragStop(event: MouseEvent) {
  event.preventDefault()
  canvas.removeEventListener('mousemove', dragMove, false)
  canvas.removeEventListener('mouseup', dragStop, false)
  canvas.removeEventListener('mouseout', dragStop, false)
  if (!didMove) {
    click(event)
  }
}
function dragStart(event: MouseEvent) {
  didMove = false
  event.preventDefault()
  lastX = event.clientX
  canvas.addEventListener('mousemove', dragMove, false)
  canvas.addEventListener('mouseup', dragStop, false)
  canvas.addEventListener('mouseout', dragStop, false)
}
function touchStart(event: TouchEvent) {
  didMove = false
  event.preventDefault()
  const touch = event.touches.item(0)
  if (!touch) return
  lastX = touch.clientX
  canvas.addEventListener('touchmove', touchMove, false)
  canvas.addEventListener('touchend', touchEnd, false)
}
function touchMove(event: TouchEvent) {
  event.preventDefault()
  const touch = event.touches.item(0)
  if (!touch) return
  let dy = touch.clientX - lastX
  lastX = touch.clientX
  didMove = true

  camera.rotateY((dy / renderer.getSize().width) * 2)
}
function touchEnd(event: TouchEvent) {
  event.preventDefault()
  canvas.removeEventListener('touchmove', touchMove, false)
  canvas.removeEventListener('touchend', touchEnd, false)
  const touch = event.changedTouches.item(0)
  if (!touch) return
  if (!didMove) {
    click(touch)
  }
}
canvas.addEventListener('mousedown', dragStart, false)
canvas.addEventListener('touchstart', touchStart, false)

let lastOrientX = null
function deviceMoved(event: any) {
  const evX = event.gamma
  if (lastOrientX !== null) {
    const dx = evX - lastOrientX
    camera.rotation.y = evX * (Math.PI / 180)
    // console.log(camera.rotation.y)
  }
  lastOrientX = evX
}
// window.addEventListener('deviceorientation', deviceMoved, false)
