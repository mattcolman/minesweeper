/**
 * @author Matt Colman
 */

import {Game} from './game';

(function() {
  var init = function() {
    let Difficulty = {

      easy: {
        numRows: 5,
        numColumns: 5,
        numBombs: 4
      },

      medium: {
        numRows: 10,
        numColumns: 10,
        numBombs: 15
      },

      hard: {
        numRows: 15,
        numColumns: 15,
        numBombs: 30
      }
    }

    var game;

    $('#buttons button').click((e)=> {
      if (game) game.destroy()
      game = new Game(Difficulty[e.target.id])
      window.Minesweeper = game;
    })

  }

  init()
})();



