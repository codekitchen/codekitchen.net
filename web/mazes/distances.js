// @flow
import { Cell } from './grid.js'

export default class Distances {
  root: Cell
  cells: { [key: string]: number }
  maxDistance: number

  constructor(root: Cell) {
    this.root = root
    this.cells = {}
    this.maxDistance = 0
    this.set(root, 0)
  }

  cellKey(cell: Cell) {
    return `${cell.row},${cell.col}`
  }

  get(cell: Cell): number {
    return this.cells[this.cellKey(cell)]
  }

  set(cell: Cell, distance: number) {
    if (distance > this.maxDistance)
      this.maxDistance = distance
    this.cells[this.cellKey(cell)] = distance
  }

  *pathTo(goalCell: Cell): Generator<Distances, Distances, void> {
    let current = goalCell

    const breadcrumbs = new Distances(this.root)
    const steps = []
    breadcrumbs.set(current, this.get(current))
    steps.push(current)

    while (current != this.root) {
      for (const neighbor of current.links) {
        if (this.get(neighbor) >= this.get(current))
          continue
        breadcrumbs.set(neighbor, this.get(neighbor))
        steps.push(neighbor)
        current = neighbor
        break
      }
    }

    const path = new Distances(this.root)
    for (let i = 0; i < steps.length; ++i) {
      path.set(steps[steps.length - 1 - i], i)
      yield path
    }

    return path
  }
}
