// @flow
import _ from 'underscore'

import Distances from './distances.js'
import { assert } from '../flow';

export class Cell {
  row: number
  col: number
  links: Cell[]

  north: ?Cell
  south: ?Cell
  east: ?Cell
  west: ?Cell

  constructor(row: number, col: number) {
    this.row = row
    this.col = col
    this.links = []
  }

  link(cell: Cell, bidi: bool = true) {
    this.links.push(cell)
    if (bidi)
      cell.link(this, false)
  }

  unlink(cell: ?Cell, bidi: bool = true) {
    this.links = _.without(this.links, cell)
    if (bidi && cell)
      cell.unlink(this, false)
  }

  linked(otherCell: ?Cell) {
    if (!otherCell) return false
    return this.links.indexOf(otherCell) >= 0
  }

  neighbors() {
    return _.compact([this.north, this.south, this.east, this.west])
  }

  *distances() : Generator<Distances, Distances, void> {
    const distances = new Distances(this)
    let frontier = [this]
    while (frontier.length) {
      yield distances
      const newFrontier = []
      for (const cell of frontier) {
        for (const linked of cell.links) {
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

  distancesFull() : Distances {
    const dist = this.distances()
    let res = dist.next()
    while (!res.done)
      res = dist.next()
    return assert(res.value)
  }
}

export class Grid {
  rows: number
  cols: number
  size: number
  grid: Array<Cell[]>
  hue: number
  saturation: number
  distances: Distances

  constructor(rows: number, cols: number) {
    this.rows = rows
    this.cols = cols
    this.size = rows * cols
    this.grid = this.prepareGrid()
    this.configureCells()

    this.hue = _.random(360)
    this.saturation = _.random(40, 100)
  }

  prepareGrid() {
    return _.map(_.range(0, this.rows), (row) => {
      return _.map(_.range(0, this.cols), (col) => {
        return new Cell(row, col)
      })
    })
  }

  *eachRow(): Iterator<Cell[]> {
    for (const row of this.grid) {
      yield row
    }
  }

  *eachCell(): Iterator<Cell> {
    for (const row of this.eachRow()) {
      for (const cell of row) {
        if (cell) {
          yield(cell)
        }
      }
    }
  }

  rowSize(row: number) : number {
    return this.grid[row].length
  }

  get(row: number, col: number): ?Cell {
    if (row < 0 || row >= this.rows)
      return undefined
    if (col < 0 || col >= this.rowSize(row))
      return undefined
    return this.grid[row][col]
  }

  configureCells() {
    for (const cell of this.eachCell()) {
      const row = cell.row
      const col = cell.col
      cell.north = this.get(row-1, col)
      cell.south = this.get(row+1, col)
      cell.west  = this.get(row, col-1)
      cell.east  = this.get(row, col+1)
    }
  }

  randomCell(): Cell {
    return (this.get(_.random(0, this.rows-1), _.random(0, this.cols-1)): any)
  }

  deadends() {
    const list = []
    for (const cell of this.eachCell()) {
      if (cell.links.length == 1)
        list.push(cell)
    }
    return list
  }

  braid(p: number = 1.0) {
    for (const cell of _.shuffle(this.deadends())) {
      if (cell.links.length != 1 || Math.random() > p)
        continue

      const neighbors = _.filter(cell.neighbors(), n => !cell.linked(n))
      let best = _.filter(neighbors, n => n.links.length == 1)
      if (best.length == 0)
        best = neighbors
      const neighbor = _.sample(best)
      cell.link(neighbor)
    }
  }

  contentsOf(cell: Cell) {
    return ' '
  }

  backgroundColorFor(cell: Cell) {
    if (this.distances && this.distances.get(cell) !== undefined) {
      const distance = this.distances.get(cell) || 0
      let max = this.distances.maxDistance
      if (max === 0)
        max = 1

      const intensity = Math.round((max - distance) / max * 70) + 20
      return `hsl(${this.hue}, ${this.saturation}%, ${intensity}%)`
    }

    return null
  }
}
