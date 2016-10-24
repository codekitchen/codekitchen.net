// @flow
import _ from 'underscore'

export default class Sidewinder {
  static on(grid) {
    for (const row of grid.eachRow()) {
      const run = []
      for (const cell of row) {
        run.push(cell)
        if (this.shouldCloseOut(cell)) {
          const member = _.sample(run)
          if (member.north)
            member.link(member.north)
          run.length = 0
        } else {
          cell.link(cell.east)
        }
      }
    }
  }

  static shouldCloseOut(cell) {
    const atEastBoundary = !cell.east
    const atNorthBoundary = !cell.north
    return atEastBoundary || (!atNorthBoundary && Math.random() > 0.5)
  }
}
