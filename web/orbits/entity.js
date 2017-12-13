// @flow

import Vector2D from './vector2d.js'

export default class Entity {
  position: Vector2D

  constructor(position: Vector2D) {
    this.position = position
  }
}