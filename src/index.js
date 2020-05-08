import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

class Square extends React.Component {
  render () {
    return (
      <div className='square empty' data-coords={this.props.coords}></div>
    )
  }
}

class Board extends React.Component {
  allowDrop(e){
    e.preventDefault();
  }
  makeSquare(coords) {
    return <Square key={coords} coords={coords}/>
  }
  dropHandler(e) {
    const length = e.dataTransfer.getData('length')
    const name = e.dataTransfer.getData('name')
    const coords = e.target.dataset.coords
    if ( hasEnoughSpace(coords, length, 'vertical') ) {
      placeShip(name, length, coords, 'vertical')
      document.getElementById(name).draggable = false
      document.getElementById(name).style.opacity = 0
    }
  }
  render () {
    let squares = []
    for (let i = 9; i >= 0; i--) {
      for (let j = 0; j <= 9; j++) {
        squares.push(this.makeSquare([j, i]))
      }
    }
    return (
      <div className='board' onDragOver={this.allowDrop} onDrop={this.dropHandler}>{squares}</div>
    )
}
}

class Ship extends React.Component {
  drag(e) {
    e.dataTransfer.setData("length", e.target.dataset.size);
    e.dataTransfer.setData("name", e.target.id);
  }
  renderSquares(i) {
    let squares = []
    for (let j = 0; j < i; j++) {
      squares.push(<Square key={j}/>)
    }
    return squares
  }
  render () {
    return (
      <div className='ship' id={this.props.name} data-size={this.props.size} draggable='true' onDragStart={this.drag}>
        {this.renderSquares(this.props.size)}
      </div>
    )
  }
}

class Game extends React.Component {
  renderBoard() {
    return <Board />
  }
  renderShips() {
    let shipRows = []
    shipRows.push(
      <Ship key='destroyer' name='destroyer' size={2}/>
    )
    shipRows.push(
      <Ship key='submarine' name='submarine' size={3}/>
    )
    shipRows.push(
      <Ship key='cruiser' name='cruiser' size={3}/>
    )
    shipRows.push(
      <Ship key='battleship' name='battleship' size={4}/>
    )
    shipRows.push(
      <Ship key='carrier' name='carrier' size={5}/>
    )
    return shipRows
  }
  render () {
    return (
      <div className='container-main'>
      <div className='header'>Place your ships!</div>
      <div className='container-board'>
      <div className='playerBoard'>{this.renderBoard()}</div>
      <div className='placeShips'>{this.renderShips()}</div>
      </div>
      </div>
    )
  }
}

ReactDOM.render(
  <Game />,
  document.getElementById('root')
)

/* game helpers */

function findAdjacentNodes(coords) {
  let adjacentNodes = []
  const x = parseInt(coords[0])
  const y = parseInt(coords[2])
  adjacentNodes.push(document.querySelector(`[data-coords='${x+1},${y+1}']`))
  adjacentNodes.push(document.querySelector(`[data-coords='${x-1},${y-1}']`))
  adjacentNodes.push(document.querySelector(`[data-coords='${x},${y+1}']`))
  adjacentNodes.push(document.querySelector(`[data-coords='${x},${y-1}']`))
  adjacentNodes.push(document.querySelector(`[data-coords='${x-1},${y+1}']`))
  adjacentNodes.push(document.querySelector(`[data-coords='${x+1},${y-1}']`))
  adjacentNodes.push(document.querySelector(`[data-coords='${x-1},${y}']`))
  adjacentNodes.push(document.querySelector(`[data-coords='${x+1},${y}']`))
  return adjacentNodes
}

function hasEnoughSpace(coords, length, orientation = 'horizontal') {
  let enoughSpace = true
  let adjacentNodes = findAdjacentNodes(coords)
  const x = parseInt(coords[0])
  const y = parseInt(coords[2])
  const parentNode = document.querySelector(`[data-coords='${x},${y}']`)
  adjacentNodes.forEach (node => {
    if (node === null || (!node.classList.contains('empty') && node.classList[1] !== parentNode.classList[1])) {
      enoughSpace = false
    }
  })
  for (let i = 1; i < length; i++){
    let node; 
    node = document.querySelector(`[data-coords='${x},${y-i}']`)
    if (orientation === 'horizontal') {
    node = document.querySelector(`[data-coords='${x+i},${y}']`)
    }
    if (node === null || !node.classList.contains('empty')) {
      enoughSpace = false
      break
    }
  }
  return enoughSpace
}

function removeOldShipSpaces(name) {
  const nodes = document.querySelectorAll(`.${name}`)
    nodes.forEach(node => {
      node.classList.remove(`${name}`)
      node.classList.add('empty')
    })

}

function changeShipOrientation(e) {
  const coords = e.target.dataset.coords
  const length = e.target.dataset.length
  const name = e.target.dataset.name
  if (hasEnoughSpace(coords, length)) {
    removeOldShipSpaces(name)
    placeShip(name, length, coords, 'horizontal')
  }
}

function placeShip(name, length, coords, orientation) {
  for (let i = 0; i < length; i++) {
    let x;
    let y;
    if (orientation === 'vertical') {
    x = parseInt(coords[0])
    y = parseInt(coords[2]) - i
    } else {
      x = parseInt(coords[0]) + i
      y = parseInt(coords[2])
    }
    const node = document.querySelector(`[data-coords='${x},${y}']`)
    node.classList.add(`${name}`)
    node.classList.remove('empty')
    if (i === 0) {
      node.dataset.length = length
      node.dataset.orientation = orientation
      node.dataset.name = name
      node.addEventListener('click', changeShipOrientation)
    }
  }
}