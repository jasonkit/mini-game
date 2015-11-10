var Tetris = {
  width: 10,
  height: 20,
  hidden_height: 4,

  block_size: 20,
  line_score: [400, 1000, 3000, 12000],
  base_interval: 800,
};

function do_game_over() {
  game_timer.stop();
  DrawRoutine.draw_overlay_text("GAME OVER");
  Renderer.draw = function () {};
  GameState.state = "gameover";
}

function is_position_valid(x, y, sid, sori) {
  var saved_pos = GameState.pos;
  var saved_shape = GameState.shape;

  GameState.pos = {
    x: x,
    y: y
  };
  GameState.shape = {
    id: sid,
    ori: sori
  };

  var num_valid = GameState.transverse_shape_location(function (x, y) {
      if (x < 0 || x >= Tetris.width) {
        return 0;
      } else if (y >= Tetris.height + Tetris.hidden_height) {
        return 0;
      } else {
        return (GameState.map[y][x] === 0) ? 1 : 0;
      }
    },
    function (v, a) {
      return a + v;
    });

  GameState.pos = saved_pos;
  GameState.shape = saved_shape;

  return (num_valid === 4);
}

function move_shape(delta_x, delta_y) {
  var pos = GameState.pos;
  var shape = GameState.shape;

  if (is_position_valid(pos.x + delta_x, pos.y + delta_y, shape.id, shape.ori)) {
    GameState.pos.x += delta_x;
    GameState.pos.y += delta_y;
    return true;
  } else {
    return false;
  }
}

function rotate_shape() {
  var pos = GameState.pos;
  var shape = GameState.shape;

  var possible_offset = [[0, 0], [-1, 0], [1, 0], [0, -1], [-1, -1], [1, -1]];
  var next_ori = (shape.ori + 1) % Shape.data[shape.id].length;

  var i;
  for (i = 0; i < possible_offset.length; i++) {
    var x = pos.x + possible_offset[i][0];
    var y = pos.y + possible_offset[i][1];
    if (is_position_valid(x, y, shape.id, next_ori)) {
      GameState.pos.x = x;
      GameState.pos.y = y;
      GameState.shape.ori = next_ori;
      break;
    }
  }
}

function get_filled_row() {
  var filled_row = [];
  var range = [GameState.pos.y, GameState.pos.y - 4];

  for (i = GameState.pos.y - 3; i <= GameState.pos.y; i++) {
    var n = GameState.transverse_map(function (x, y, v) {
        return (GameState.map[y][x] > 0) ? 1 : 0;
      },
      function (v, a) {
        return v + a;
      }, [i, i]);

    if (n === Tetris.width) {
      filled_row.push(i);
    }
  }

  return filled_row;
}

function remove_filled_row(filled_row) {
  var i;
  var offset = 0;

  filled_row.sort();

  for (i = 0; i < filled_row.length; i++) {
    GameState.map.splice(filled_row[i] - offset, 1);
    offset++;
  }

  var tmp = [];
  for (i = 0; i < Tetris.width; i++) {
    tmp.push(0);
  }

  for (i = 0; i < offset; i++) {
    GameState.map.unshift(tmp.concat([]));
  }
}

function game_loop() {
  if (GameState.last_loop_time === null) {
    GameState.last_loop_time = new Date();
  }

  var cur_time = new Date();
  var prev_time = GameState.last_loop_time;

  if (cur_time - prev_time >= GameState.get_interval()) {

    if (!move_shape(0, 1)) {
      GameState.solidify();

      var filled_row = get_filled_row();

      if (filled_row.length > 0) {
        remove_filled_row(filled_row);
        GameState.increase_score(filled_row.length);
      }

      if (GameState.check_game_over()) {
        do_game_over();
      }

      GameState.get_next_shape();
    }

    Renderer.draw();
    GameState.last_loop_time = cur_time;
  }
}

var game_loop_timer_id = 0;

function setup_key_handler() {
  Input.handle_Left_down = function () {
    if (GameState.state === "in-game") {
      move_shape(-1, 0);
      Renderer.draw();
    }
  };

  Input.handle_Right_down = function () {
    if (GameState.state === "in-game") {
      move_shape(1, 0);
      Renderer.draw();
    }
  };

  Input.handle_Down_down = function () {
    if (GameState.state === "in-game") {
      move_shape(0, 1);
      Renderer.draw();
    }
  };

  Input.handle_Up_down = function () {
    if (GameState.state === "in-game") {
      rotate_shape();
      Renderer.draw();
    }
  };

  Input.handle_Enter_down = function () {
    switch (GameState.state) {
    case "start":
      Renderer.draw();
      game_timer.start();
      GameState.state = "in-game";
      break;

    case "in-game":
      game_timer.stop();
      DrawRoutine.draw_overlay_text("PAUSE");
      Renderer.draw = function () {};
      GameState.state = "pause";
      break;

    case "pause":
      Renderer.draw = DrawRoutine.draw;
      Renderer.draw();
      game_timer.start();
      GameState.state = "in-game";
      break;

    case "gameover":
      Renderer.draw = DrawRoutine.draw;
      GameState.init();
      Renderer.draw();
      DrawRoutine.draw_overlay_text("READY?");
      break;
    }
  };
}

var game_timer;

window.addEventListener("load", function () {
  Renderer.init("tetris-canvas", 720, 480);
  Renderer.draw = DrawRoutine.draw;
  Input.init();
  setup_key_handler();
  game_timer = new GameTimer(game_loop, 1);

  GameState.init();
  Renderer.draw();

  DrawRoutine.draw_overlay_text("READY?");
});
