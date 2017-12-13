// @flow
import _ from 'underscore'

import { Grid } from './grid.js'

export default class RecursiveDivision {
  grid: Grid
  maxRoomSize: number
  roomPct: number

  static on(grid: Grid) {
    (new RecursiveDivision(grid)).run()
  }

  constructor(grid: Grid) {
    this.grid = grid
    this.maxRoomSize = _.random(5)
    this.roomPct = _.random(6)
  }

  run() {
    // link all cells
    for (const cell of this.grid.eachCell()) {
      for (const n of cell.neighbors()) {
        cell.link(n, false)
      }
    }

    // build wall dividers
    this.divide(0, 0, this.grid.rows, this.grid.cols)
  }

  divide(row: number, col: number, height: number, width: number) {
    if (height <= 1 || width <= 1 || this.makeRoom(height, width))
      return

    if (height > width) {
      this.horizontal(row, col, height, width)
    } else {
      this.vertical(row, col, height, width)
    }
  }

  makeRoom(height: number, width: number) {
    return height < this.maxRoomSize && width < this.maxRoomSize && _.random(this.roomPct) == 0
  }

  horizontal(row: number, col: number, height: number, width: number) {
    const divideSouthOf = _.random(height-2)
    const passageAt = _.random(width-1)

    for (let x = 0; x < width; ++x) {
      if (passageAt == x)
        continue
      const cell = this.grid.get(row+divideSouthOf, col+x)
      if (cell)
        cell.unlink(cell.south)
    }

    this.divide(row, col, divideSouthOf + 1, width)
    this.divide(row + divideSouthOf + 1, col, height - divideSouthOf - 1, width)
  }

  vertical(row: number, col: number, height: number, width: number) {
    const divideEastOf = _.random(width-2)
    const passageAt = _.random(height-1)

    for (let y = 0; y < height; ++y) {
      if (passageAt == y)
        continue
      const cell = this.grid.get(row+y, col+divideEastOf)
      if (cell)
        cell.unlink(cell.east)
    }

    this.divide(row, col, height, divideEastOf + 1)
    this.divide(row, col + divideEastOf + 1, height, width - divideEastOf - 1)
  }
}
