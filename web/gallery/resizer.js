export default class Resizer {
  renderer: any
  camera: any

  constructor(renderer, camera) {
    this.renderer = renderer
    this.camera = camera
    window.addEventListener('resize', () => this.resize(), false)
  }

  resize() {
    let width = window.innerWidth
    let height = window.innerHeight
    this.renderer.setSize(width, height)
    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
  }
}
