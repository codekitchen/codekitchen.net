import _ from 'underscore'

export default class RecursiveDivision {
  static on(grid) {
    (new RecursiveDivision(grid)).run()
  }

  constructor(grid) {
    this.grid = grid
    this.maxRoomSize = _.random(5)
    this.roomPct = _.random(6)
  }

  run() {
    // link all cells
    for (let cell of this.grid.eachCell()) {
      for (let n of cell.neighbors()) {
        cell.link(n, false)
      }
    }

    // build wall dividers
    this.divide(0, 0, this.grid.rows, this.grid.cols)
  }

  divide(row, col, height, width) {
    if (height <= 1 || width <= 1 || this.makeRoom(height, width))
      return

    if (height > width) {
      this.horizontal(row, col, height, width)
    } else {
      this.vertical(row, col, height, width)
    }
  }

  makeRoom(height, width) {
    return height < this.maxRoomSize && width < this.maxRoomSize && _.random(this.roomPct) == 0
  }

  horizontal(row, col, height, width) {
    let divideSouthOf = _.random(height-2)
    let passageAt = _.random(width-1)

    for (var x = 0; x < width; ++x) {
      if (passageAt == x)
        continue
      let cell = this.grid.get(row+divideSouthOf, col+x)
      cell.unlink(cell.south)
    }

    this.divide(row, col, divideSouthOf + 1, width)
    this.divide(row + divideSouthOf + 1, col, height - divideSouthOf - 1, width)
  }

  vertical(row, col, height, width) {
    let divideEastOf = _.random(width-2)
    let passageAt = _.random(height-1)

    for (var y = 0; y < height; ++y) {
      if (passageAt == y)
        continue
      let cell = this.grid.get(row+y, col+divideEastOf)
      cell.unlink(cell.east)
    }

    this.divide(row, col, height, divideEastOf + 1)
    this.divide(row, col + divideEastOf + 1, height, width - divideEastOf - 1)
  }
}
