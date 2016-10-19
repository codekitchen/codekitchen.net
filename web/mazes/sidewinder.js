import _ from 'underscore'

export default class Sidewinder {
  static on(grid) {
    for (let row of grid.eachRow()) {
      let run = []
      for (let cell of row) {
        run.push(cell)
        if (this.shouldCloseOut(cell)) {
          let member = _.sample(run)
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
    let atEastBoundary = !cell.east
    let atNorthBoundary = !cell.north
    return atEastBoundary || (!atNorthBoundary && Math.random() > 0.5)
  }
}
