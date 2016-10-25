// @flow
import { Cell } from './grid.js'

export default class Distances {
  root: Cell
  cells: Map<Cell, number>
  maxDistance: number

  constructor(root: Cell) {
    this.root = root
    this.cells = new Map()
    this.maxDistance = 0
    this.set(root, 0)
  }

  get(cell: Cell): ?number {
    return this.cells.get(cell)
  }

  // call this to assert that we know this cell is set
  getN(cell: Cell): number {
    return (this.cells.get(cell): any)
  }

  set(cell: Cell, distance: number) {
    if (distance > this.maxDistance)
      this.maxDistance = distance
    this.cells.set(cell, distance)
  }

  *pathTo(goalCell: Cell): Generator<Distances, Distances, void> {
    let current = goalCell

    const breadcrumbs = new Distances(this.root)
    const steps = []
    breadcrumbs.set(current, this.getN(current))
    steps.push(current)

    while (current != this.root) {
      for (const neighbor of current.links) {
        if (this.getN(neighbor) >= this.getN(current))
          continue
        breadcrumbs.set(neighbor, this.getN(neighbor))
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
