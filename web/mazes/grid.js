import _ from 'underscore'

import Distances from './distances.js'

class Cell {
  constructor(row, col) {
    this.row = row
    this.col = col
    this.links = []
  }

  link(cell, bidi = true) {
    this.links.push(cell)
    if (bidi)
      cell.link(this, false)
  }

  linked(otherCell) {
    return this.links.indexOf(otherCell) >= 0
  }

  neighbors() {
    return _.compact([this.north, this.south, this.east, this.west])
  }

  *distances() {
    let distances = new Distances(this)
    var frontier = [this]
    while (frontier.length) {
      yield distances
      let newFrontier = []
      for (let cell of frontier) {
        for (let linked of cell.links) {
          if (distances.get(linked) !== undefined)
            continue
          distances.set(linked, distances.get(cell)+1)
          newFrontier.push(linked)
        }
      }
      frontier = newFrontier
    }
    return distances
  }

  distancesFull() {
    let dist = this.distances()
    var res = dist.next()
    while (!res.done)
      res = dist.next()
    return res.value
  }
}

export default class Grid {
  constructor(rows, cols) {
    this.rows = rows
    this.cols = cols
    this.grid = this.prepareGrid()
    this.configureCells()

    this.hue = _.random(360)
    this.saturation = _.random(40, 100)
    this.size = this.rows * this.cols
  }

  prepareGrid() {
    return _.map(_.range(0, this.rows), (row) => {
      return _.map(_.range(0, this.cols), (col) => {
        return new Cell(row, col)
      })
    })
  }

  *eachRow() {
    for (let row of this.grid) {
      yield row
    }
  }

  *eachCell() {
    for (let row of this.eachRow()) {
      for (let cell of row) {
        if (cell) {
          yield(cell)
        }
      }
    }
  }

  rowSize(row) {
    this.grid[row].length
  }

  get(row, col) {
    if (row < 0 || row >= this.rows)
      return undefined
    if (col < 0 || col >= this.rowSize(row))
      return undefined
    return this.grid[row][col]
  }

  configureCells() {
    for (let cell of this.eachCell()) {
      let row = cell.row
      let col = cell.col
      cell.north = this.get(row-1, col)
      cell.south = this.get(row+1, col)
      cell.west  = this.get(row, col-1)
      cell.east  = this.get(row, col+1)
    }
  }

  randomCell() {
    return this.get(_.random(0, this.rows-1), _.random(0, this.cols-1))
  }

  contentsOf(cell) {
    return ' '
  }

  backgroundColorFor(cell) {
    if (this.distances && this.distances.get(cell) !== undefined) {
      let distance = this.distances.get(cell)
      var max = this.distances.maxDistance
      if (max === 0)
        max = 1

      let intensity = Math.round((max - distance) / max * 70) + 20
      // let dark = Math.round(255 * intensity)
      // let bright = Math.round(128 + (127 * intensity))
      // return `rgb(${dark}, ${bright}, ${dark})`
      return `hsl(${this.hue}, ${this.saturation}%, ${intensity}%)`
    }

    return null
  }
}
