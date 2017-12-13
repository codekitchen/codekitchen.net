// @flow
import _ from 'underscore'
import { Grid, Cell } from './grid';

export default class Sidewinder {
  static on(grid: Grid) {
    for (const row of grid.eachRow()) {
      const run: Cell[] = []
      for (const cell of row) {
        run.push(cell)
        if (this.shouldCloseOut(cell)) {
          const member: Cell = _.sample(run)
          if (member.north)
            member.link(member.north)
          run.length = 0
        } else if (cell.east) {
          cell.link(cell.east)
        }
      }
    }
  }

  static shouldCloseOut(cell: Cell) {
    const atEastBoundary = !cell.east
    const atNorthBoundary = !cell.north
    return atEastBoundary || (!atNorthBoundary && Math.random() > 0.5)
  }
}
