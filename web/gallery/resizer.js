// @flow
export default class Resizer {
  renderer: any
  camera: any

  constructor(renderer: any, camera: any) {
    this.renderer = renderer
    this.camera = camera
    window.addEventListener('resize', () => this.resize(), false)
  }

  resize() {
    const width = window.innerWidth
    const height = window.innerHeight
    this.renderer.setSize(width, height)
    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
  }
}
