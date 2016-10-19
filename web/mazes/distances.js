export default class Distances {
  constructor(root) {
    this.root = root
    this.cells = {}
    this.set(root, 0)
  }

  cellKey(cell) {
    return `${cell.row},${cell.col}`
  }

  get(cell) {
    return this.cells[this.cellKey(cell)]
  }

  set(cell, distance) {
    this.cells[this.cellKey(cell)] = distance
  }

  *pathTo(goalCell) {
    var current = goalCell

    let breadcrumbs = new Distances(this.root)
    let steps = []
    breadcrumbs.set(current, this.get(current))
    steps.push(current)

    while (current != this.root) {
      for (let neighbor of current.links) {
        if (this.get(neighbor) >= this.get(current))
          continue
        breadcrumbs.set(neighbor, this.get(neighbor))
        steps.push(neighbor)
        current = neighbor
        break
      }
    }

    let path = new Distances(this.root)
    for (var i = 0; i < steps.length; ++i) {
      path.set(steps[steps.length - 1 - i], i)
      yield path
    }

    return path
  }

  maxDistance() {
    return Math.max(...Object.values(this.cells))
  }
}
