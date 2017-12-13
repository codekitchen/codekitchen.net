// @flow

import './orbits.css'

import Vector2D from './orbits/vector2d.js'

// trust that we know this is a canvas element
const canvas : HTMLCanvasElement = (document.getElementById('canvas') : any)
const box = document.getElementById('box')
const ctx = canvas.getContext("2d")

if (!box || !ctx) {
  document.write("your browser does not support the HTML Canvas element")
  throw "doh"
}

const Pi2 = Math.PI * 2

let zoom = 35000

const G = 6.67408e-11
// kerbin / mun
const m1 = 5.2915158e22
const m2 = 9.7599066e20
const M = m1 + m2
const r = 12000000.00
const massRatio = m1 / m2
const orbitalVel = Math.sqrt((G * M) / r)
const bary = r / (1 + massRatio)
const v1 = Math.sqrt((G * m2 * m2) / (r * M))
const v2 = Math.sqrt((G * m1 * m1) / (r * M))

function body(attrs) {
  return Object.assign({
    position: Vector2D.zero,
    velocity: Vector2D.zero,
    showOrbit: false,
    color: '',
    radius: 100000,
    mass: 500,
    k1: kempty(),
    k2: kempty(),
    k3: kempty(),
    k4: kempty(),
    kpos: Vector2D.zero,
    kvel: Vector2D.zero,
  }, attrs)
}

let kerbin = body({
  position: new Vector2D(0, bary),
  velocity: new Vector2D(-v1, 0),
  showOrbit: false,
  color: 'rgba(30, 110, 50, 200)',
  radius: 600000,
  mass: m1,
})

let mun = body({
  position: new Vector2D(0, -r + bary),
  velocity: new Vector2D(v2, 0),
  showOrbit: true,
  color: 'rgb(200, 200, 200)',
  radius: 200000,
  mass: m2,
})

let satVel = Math.sqrt((G * m1) / (2863330))
let satVelRel = Math.sqrt((G*m1*m1) / (2863330 * m1))
let sat1 = body({
  position: new Vector2D(2863330,0),
  velocity: new Vector2D(0,satVelRel+200),
  mass: 1000,
  radius: 70000,
  color: 'rgb(220,50,50)',
})

let munSatVel = Math.sqrt((G * m2) / (450000))
let munSat1 = body({
  position: new Vector2D(450000, mun.position.y),
  velocity: mun.velocity.add(new Vector2D(0, -munSatVel)),
  mass: 500,
  radius: 70000,
  color: 'rgb(50,220,50)',
})

let munSat2Vel = Math.sqrt((G * m2) / (1200000))
let munSat2 = body({
  position: new Vector2D(1200000, mun.position.y),
  velocity: mun.velocity.add(new Vector2D(0, -munSat2Vel)),
  mass: 500,
  radius: 70000,
  color: 'rgb(80,0,140)',
})

let entities = [
  kerbin,
  mun,
  sat1, munSat1, munSat2,
]

function kempty() {
  return { dpos: Vector2D.zero, dvel: Vector2D.zero }
}
const kemptyi = kempty()
function accelerate(storeTo, pullFrom, dt) {
  for (let entity of entities) {
    let from
    if (!pullFrom) {
      from = kemptyi
    } else {
      from = entity[pullFrom]
    }
    entity.kpos = entity.position.add(from.dpos.multiply(dt))
    entity.kvel = entity.velocity.add(from.dvel.multiply(dt))

    entity[storeTo].dpos = entity.kvel
    entity[storeTo].dvel = Vector2D.zero
  }

  for (let i = 0; i < entities.length; ++i) {
    let e1 = entities[i]
    for (let i2 = i + 1; i2 < entities.length; ++i2) {
      let e2 = entities[i2]
      let diff = e1.kpos.subtract(e2.kpos)
      let distance2 = diff.sqlen()
      let F = (G * e1.mass * e2.mass) / distance2
      e1[storeTo].dvel = e1[storeTo].dvel.add(diff.normalize().neg().multiply(F / e1.mass))
      e2[storeTo].dvel = e2[storeTo].dvel.add(diff.normalize().multiply(F / e2.mass))
    }
  }
}

let gameTime = 0
let lastTime = window.performance.now() / 1000
let timestep = 500.0
function update() {
  let curTime = window.performance.now() / 1000
  let dt = curTime - lastTime

  let totalTime = dt * timestep
  while (totalTime > 0) {
    dt = 1.0
    if (dt > totalTime) dt = totalTime

    accelerate('k1', null, 0)
    accelerate('k2', 'k1', dt * 0.5)
    accelerate('k3', 'k2', dt * 0.5)
    accelerate('k4', 'k3', dt)

    for (let entity of entities) {
      let dvel = entity.k1.dvel.add(entity.k2.dvel.add(entity.k3.dvel).multiply(2)).add(entity.k4.dvel).multiply(1/6)
      let dpos = entity.k1.dpos.add(entity.k2.dpos.add(entity.k3.dpos).multiply(2)).add(entity.k4.dpos).multiply(1/6)
      entity.velocity = entity.velocity.add(dvel.multiply(dt))
      entity.position = entity.position.add(dpos.multiply(dt))
    }

    gameTime += dt
    totalTime -= dt
  }

  lastTime = curTime
}

function draw() {
  update()

  const width = box.clientWidth
  const height = box.clientHeight

  canvas.width = width
  canvas.height = height
  ctx.clearRect(0, 0, width, height)

  ctx.save()

  ctx.translate(width/2, height/2)

  // draw lines
  for (let entity of entities) {
    if (entity.showOrbit) {
      ctx.strokeStyle = "rgb(255, 255, 255)"
      ctx.beginPath()
      ctx.arc(0, 0, entity.position.length() * 1/zoom, 0, Pi2)
      ctx.stroke()
    }
  }

  ctx.scale(1/zoom, 1/zoom)

  // draw shapes
  for (let entity of entities) {
    ctx.fillStyle = entity.color
    ctx.beginPath()
    ctx.arc(entity.position.x, entity.position.y, entity.radius, 0, Pi2)
    ctx.fill()
  }

  ctx.restore()

  ctx.fillStyle = 'rgb(255, 255, 255)'
  ctx.font = '16px monospace'
  ctx.fillText(`time: ${gameTime.toFixed(2)}`, 5, 15)
  ctx.fillText(`radius: ${mun.position.subtract(kerbin.position).length().toFixed(2)}`, 5, 30)
  ctx.fillText(`zoom ${zoom.toFixed(3)}`, 5, 45)

  ctx.beginPath()
  ctx.arc(width/2, height/2, 2, 0, Pi2)
  ctx.stroke()

  window.requestAnimationFrame(draw)
}

window.addEventListener('wheel', onWheelEvent, true)
function onWheelEvent(ev: WheelEvent) {
  ev.preventDefault()
  let movement = ev.deltaY * (zoom * 0.05)
  zoom += movement
  if (zoom < 0.1) zoom = 0.1
  if (zoom > 100000) zoom = 100000
}


draw()