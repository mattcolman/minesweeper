/**
 * @author Matt Colman
 */

import {Grid} from './grid';
import {_} from 'lodash';
import {Bootstrap} from 'bootstrap';

class Game {

  constructor(config = {}) {
    this.numRows    = config.numRows    || 10
    this.numColumns = config.numColumns || 10
    this.numBombs   = config.numBombs   || 10

    this.symbols = {
      BOMB: 'glyphicon glyphicon-certificate bomb',
      HIT_BOMB: 'glyphicon glyphicon-certificate hit-bomb',
      FLAG: 'glyphicon glyphicon-flag flag',
      INCORRECT_FLAG: 'glyphicon glyphicon-thumbs-down open',
      CORRECT_FLAG: 'glyphicon glyphicon-thumbs-up open',
      OPEN: 'open',
      CLOSED: 'closed',
      EMPTY: 'empty'
    }

    this.bombs = []
    this.flags = []

    this.createBlocks()
    this.blocks = Array.from($('#game span')) // convert array-like to array
    this.addGrid()
    this.layBombs()
    this.addClickListener()
    // this.drawGrid()
  }

  createBlocks() {
    this.data = []
    for (var j = 0; j < this.numRows; j++) {
      this.data.push([])
      for (var i = 0; i < this.numColumns; i++) {
        this.data[j].push({isBomb: false, isFlag: false, number: 0, open: false})
        let form = `<span id="${i},${j}" class="${this.symbols.CLOSED}" aria-hidden="true"></span>`
        form = $(form)
        $('#game').append(form)
      };
    };
    let blockWidth = $("#game span").outerWidth(true)
    $('#game').width(this.numColumns*blockWidth)
    $('#game').height(this.numRows*blockWidth)
  }

  addGrid() {
    this.grid = new Grid(this.numColumns, this.numRows)
    this.grid.compare = function(a, b) {
      if (!a || !b) return false
      return a.innerHTML == b.innerHTML
    }

    let x,
        y;
    for (let block of this.blocks) {
      [x, y] = block.id.split(',')
      this.grid.setItem(x, y, block)
    }
  }

  // CLICK LISTENER / HANDLER
  addClickListener() {
    // disable the context menu
    $(document).on("contextmenu", "span", function(e){
      return false;
    });

    $('#game').mousedown((e)=>{
      if (e.target.id == 'game') return
      switch (e.which) {
        case 1:
          this.handleSingleClick(e.target)
          break;
        case 2:
          console.log('Middle Mouse button pressed.');
          break;
        case 3:
          this.handleRightClick(e.target)
          break;
        default:
          console.log('You have a strange Mouse!');
      }

      if (this.allBlocksMarked()) {
        if (this.checkFlags()) {
          this.win()
        } else {
          this.gameOver()
        }
      }
    });
  }

  handleSingleClick(target) {
    let data = this.getData(target)
    if (data.open || data.isFlag) return;
    let [x, y] = this.getXY(target)
    console.log('clicked on', x, y)
    if (data.isBomb) {
      target.className = this.symbols.HIT_BOMB
      this.bombs = _.without(this.bombs, target)
      this.gameOver()
    } else if (data.number > 0) {
      this.reveal(target)
    } else {
      this.reveal(target)
      this.cluster(x, y)
    }
  }

  handleRightClick(target) {
    let data = this.getData(target)
    if (!data.open || data.isFlag) {
      this.toggleFlag(target)
    }
  }

  layBombs() {
    var shuffledBlocks = _.shuffle(this.blocks)
    for (var i = 0; i < this.numBombs; i++) {
      this.placeBomb(shuffledBlocks[i])
    };
  }

  placeBomb(bomb) {
    var [x, y] = this.getXY(bomb)
    this.data[x][y].isBomb = true
    this.bombs.push(this.grid.getItem(x, y))
    let blocks = this.grid.getNeighbours(x, y)
    for (let block of blocks) {
      this.getData(block).number++
    }
  }

  toggleFlag(block) {
    console.log('place flag!!')
    let data = this.getData(block)
    data.isFlag = !data.isFlag
    if (data.isFlag) {
      block.className = this.symbols.FLAG
      this.flags.push(block)
    } else {
      block.className = this.symbols.CLOSED
      this.flags = _.without(this.flags, block)
    }
  }

  checkFlags() {
    var correct = true
    for (var flag of this.flags) {
      let data = this.getData(flag)
      if (!data.isBomb) {
        correct = false
        flag.className = this.symbols.INCORRECT_FLAG
      } else {
        flag.className = this.symbols.CORRECT_FLAG
      }
    }
    return correct;
  }

  allBlocksMarked() {
    var data
    for (var block of this.blocks) {
      data = this.getData(block)
      if (!data.open && !data.isFlag) return false;
    }
    return true;
  }

  reveal(block) {
    let data = this.getData(block)
    data.open = true
    if (data.isBomb) {
      block.className = this.symbols.BOMB
    } else if (data.number > 0) {
      block.className = `${this.symbols.OPEN} ${this.symbols.OPEN}${data.number}`
      $(block).text(data.number)
    } else {
      block.className = this.symbols.EMPTY
    }
  }

  cluster(x, y) {
    // look for corners first. The corners will only
    // reveal if they're empty, NOT if they're numbers.
    var corners = this.getCorners(x, y)
    for (var block of corners) {
      let [x, y] = this.getXY(block)
      let data = this.data[x][y]
      if (data.open == true) continue
      if (data.number == 0) {
        this.reveal(block)
        this.cluster(x, y)
      }
    }

    // reveal north, south, east and west. They will be
    // either empty or a number and we reveal regardless.
    var nesw = this.getNESW(x, y)
    for (var block of nesw) {
      let [x, y] = this.getXY(block)
      let data = this.data[x][y]
      if (data.open == true) continue
      this.reveal(block)
      if (data.number == 0) {
        this.cluster(x, y)
      }
    }

    // put flags back
    for (var flag of this.flags) {
      let data = this.getData(flag)
      data.open = false;
      data.isFlag = true;
      flag.className = this.symbols.FLAG;
    }
  }

  win() {
    $('#game').off()
    $('#result')[0].className = 'label label-success'
    $('#result').text('Winning!')
  }

  gameOver() {
    console.log("OH NO BOMB!!!!!!!!!!!!")
    $('#game').off()
    $('#result')[0].className = 'label label-danger'
    $('#result').text('Sad face :(')
    for (var bomb of this.bombs) {
      this.reveal(bomb)
    }
    this.checkFlags()
  }

  destroy() {
    $('#game').off()
    $('#game').empty()
    $('#result').empty()
  }

  // CUSTOM GRID FUNCTIONS
  getXY(block) {
    let [x, y] = block.id.split(',')
    return [parseInt(x), parseInt(y)]
  }

  getData(block) {
    let [x, y] = this.getXY(block)
    return this.data[x][y]
  }

  getCorners(x, y) {
    let arr = [
      this.grid.getItemAtDirection(x, y, 'nw'),
      this.grid.getItemAtDirection(x, y, 'ne'),
      this.grid.getItemAtDirection(x, y, 'se'),
      this.grid.getItemAtDirection(x, y, 'sw')
    ]
    return _.compact(arr)
  }

  getNESW(x, y) {
    let arr = [
      this.grid.getItemAtDirection(x, y, 'n'),
      this.grid.getItemAtDirection(x, y, 'e'),
      this.grid.getItemAtDirection(x, y, 's'),
      this.grid.getItemAtDirection(x, y, 'w')
    ]
    return _.compact(arr)
  }

  // DEBUG
  drawGrid() {
    var data,
        str,
        x,
        y;
    for (var block of this.blocks) {
      [x, y] = this.getXY(block)
      data = this.data[x][y]
      this.reveal(block)
    }
  }


}

export {Game};


