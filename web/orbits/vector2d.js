// @flow

export default class Vector2D {
  x: number
  y: number

  static zero: Vector2D = new Vector2D(0, 0)

  constructor(x: number, y: number) {
    this.x = x
    this.y = y
  }

  add(v2: Vector2D | number) {
    if (typeof v2 === 'number') {
      return new Vector2D(this.x + v2, this.y + v2)
    }
    return new Vector2D(this.x + v2.x, this.y + v2.y)
  }

  subtract(v2: Vector2D) {
    if (typeof v2 === 'number') {
      return new Vector2D(this.x - v2, this.y - v2)
    }
    return new Vector2D(this.x - v2.x, this.y - v2.y)
  }

  multiply(v2: Vector2D | number) {
    if (typeof v2 === 'number') {
      return new Vector2D(this.x * v2, this.y * v2)
    }
    return new Vector2D(this.x * v2.x, this.y * v2.y)
  }

  neg() {
    return new Vector2D(-this.x, -this.y)
  }

  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y)
  }

  normalize() {
    let len = this.length()
    return new Vector2D(this.x / len, this.y / len)
  }

  sqlen() {
    return this.x * this.x + this.y * this.y
  }
}