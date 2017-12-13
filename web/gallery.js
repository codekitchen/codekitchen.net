// @flow
import { Scene, PerspectiveCamera, WebGLRenderer, AmbientLight, SpotLight, Vector3, AxisHelper, PCFSoftShadowMap, SpotLightHelper, MeshLambertMaterial } from 'three'
import { BoxGeometry, MeshStandardMaterial, Mesh } from 'three'
import { Raycaster, Vector2 } from 'three'
import ColladaLoader from 'three-collada-loader'

import _ from 'underscore'

import { assert } from './flow.js'
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

const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000)
camera.position.set(4, 5.5, -4)
camera.lookAt(new Vector3(5, 5.5, -6))
window.camera = camera

const renderer = window.renderer = new WebGLRenderer({ antialias: false })
renderer.setPixelRatio(Math.floor(window.devicePixelRatio))
renderer.shadowMap.enabled = true
renderer.shadowMap.type = PCFSoftShadowMap

assert(document.body).appendChild(renderer.domElement)

const raycaster = new Raycaster()

// webvr
import 'webvr-polyfill/src/main'
import VRControls from './webvr/VRControls'
import VREffect from './webvr/VREffect'

let inVR = false
const controls = new VRControls(camera, console.log)
const effect = window.effect = new VREffect(renderer, console.log)
effect.setSize(window.innerWidth, window.innerHeight)

const vrModeControl: HTMLElement = assert(document.querySelector("#controls #vr-mode"))
function vrModeClickEvent(event: MouseEvent) {
  event.preventDefault()
  effect.setFullScreen(true)
  controls.usePoseOrientation = true
  inVR = true
}
vrModeControl.addEventListener('click', vrModeClickEvent, false)

const resizer = new Resizer(effect, camera)
let targetPos

function animate() {
  effect.requestAnimationFrame(animate)

  const display = effect.getVRDisplay()
  const canVR = !inVR && display && display.capabilities.canPresent
  const controlsEl = assert(document.querySelector('#controls'))
  if (canVR) {
    controlsEl.style.display = 'block'
  } else {
    controlsEl.style.display = 'none'
  }

  if (targetPos && camera.position.distanceToSquared(targetPos) > 0.01) {
    const dir = targetPos.clone().sub(camera.position).normalize().multiplyScalar(0.1)
    camera.position.add(dir)
  }
  controls.update()

  if (effect)
    effect.render(scene, camera)
  else
    renderer.render(scene, camera)
}

animate()


function click(clickPos: { clientX: number, clientY: number }) {
  let mouse: Vector2
  if (inVR) {
    mouse = new Vector2(0, 0)
  } else {
    mouse = new Vector2(
      // calculate mouse position in normalized device coordinates
      // (-1 to +1) for both components
      ( clickPos.clientX / window.innerWidth ) * 2 - 1,
      - ( clickPos.clientY / window.innerHeight ) * 2 + 1
    )
  }
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
