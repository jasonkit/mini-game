var Input = {
  state: {},
};

Input.get_state = function (identifier) {
  if (identifier in Input.state) {
    return Input.state[identifier];
  } else {
    return false;
  }
};

Input.handle_keydown = function (e) {
  Input.state[e.key] = true;

  var key_handler = "handle_" + e.key + "_down";

  if ((key_handler in Input) && (typeof Input[key_handler] === "function")) {
    Input[key_handler]();
  }
};

Input.handle_keyup = function (e) {
  Input.state[e.key] = false;

  var key_handler = "handle_" + e.key + "_up";

  if ((key_handler in Input) && (typeof Input[key_handler] === "function")) {
    Input[key_handler]();
  }
};

Input.init = function () {
  document.body.addEventListener("keydown", Input.handle_keydown);
  document.body.addEventListener("keyup", Input.handle_keyup);
};
var Renderer = {
  canvas: null,
  context: null,
  draw: function () {},
};

Renderer.init = function (canvas_id, width, height) {
  Renderer.canvas = document.getElementById(canvas_id);
  Renderer.canvas.width = width;
  Renderer.canvas.height = height;

  Renderer.context = Renderer.canvas.getContext("2d");
};
var Shape = {
  data: [],
  num_shape: 7,
};

Shape.color = ["#4FD9FF", "#F8B21C", "#1964B5", "#c33b01", "#9df736", "#9119ea", "#FFEA51"];

Shape.size = [[1, 4], [2, 3], [2, 3], [2, 3], [2, 3], [2, 3], [2, 2]];

Shape.data = [
// I
[
	[[0, 0], [0, -1], [0, -2], [0, -3]],
	[[-1, 0], [0, 0], [1, 0], [2, 0]],
],

// L
[
	[[0, -2], [0, -1], [0, 0], [1, 0]],
	[[-1, 0], [-1, -1], [0, -1], [1, -1]],
	[[0, -2], [1, -2], [1, -1], [1, 0]],
	[[-1, 0], [0, 0], [1, 0], [1, -1]],
],

// Reserved L
[
	[[0, 0], [1, 0], [1, -1], [1, -2]],
	[[-1, -1], [-1, 0], [0, 0], [1, 0]],
	[[1, -2], [0, -2], [0, -1], [0, 0]],
	[[-1, -1], [0, -1], [1, -1], [1, 0]],
],

// Z
[
	[[0, 0], [0, -1], [1, -1], [1, -2]],
	[[0, -1], [1, -1], [1, 0], [2, 0]],
],

// Reserved Z
[
	[[0, -2], [0, -1], [1, -1], [1, 0]],
	[[0, 0], [1, 0], [1, -1], [2, -1]],
],

// T
[
	[[0, 0], [0, -1], [0, -2], [1, -1]],
	[[-1, -1], [0, -1], [1, -1], [0, 0]],
	[[0, 0], [0, -1], [0, -2], [-1, -1]],
	[[-1, 0], [0, 0], [1, 0], [0, -1]],
],

// Square
[
	[[0, 0], [1, 0], [0, -1], [1, -1]],
],
];

Shape.get_random_shape_idx = function () {
  return Math.floor(Math.random() * Shape.num_shape);
};

Shape.get_shape_data = function (idx, ori) {
  return Shape.data[idx][ori];
};
var GameState = {
  pos: {
    x: 0,
    y: 0
  },
  shape: {
    id: 0,
    ori: 0
  },
  next_shape_id: 0,
  map: [],
  level: 1,
  score: 0,
  last_loop_time: null,
  num_cleared_line: 0,
  state: "start",
};

GameState.get_interval = function () {
  return Math.round((Tetris.base_interval / this.level));
};

GameState.reset_map = function () {
  var w = Tetris.width;
  var h = Tetris.height + Tetris.hidden_height;

  this.map = [];

  var x, y;
  for (y = 0; y < h; y++) {
    this.map.push([]);
    for (x = 0; x < w; x++) {
      this.map[y].push(0);
    }
  }
};

GameState.reset_shape = function () {
  this.pos.x = (Tetris.width - 1) >> 1;
  this.pos.y = Tetris.hidden_height - 1;
  this.shape.id = Shape.get_random_shape_idx();
  this.shape.ori = 0;
};

GameState.reset_score = function () {
  this.score = 0;
  this.num_cleared_line = 0;
  this.level = 1;
};

GameState.get_next_shape = function () {
  this.pos.x = (Tetris.width - 1) >> 1;
  this.pos.y = Tetris.hidden_height - 1;
  this.shape.id = this.next_shape_id;
  this.shape.ori = 0;
  this.next_shape_id = Shape.get_random_shape_idx();
};

GameState.init = function () {
  this.reset_shape();
  this.reset_map();
  this.reset_score();
  this.state = "start";
};

GameState.transverse_map = function (fn, afn, range) {
  var w = Tetris.width;
  var h = Tetris.height + Tetris.hidden_height;
  var x, y;

  var acc = null;

  if (range === undefined) {
    range = [0, h - 1];
  }

  if (range[0] < 0) {
    range[0] = 0;
  } else if (range[0] >= h) {
    range[0] = h - 1;
  }

  if (range[1] < range[0]) {
    range[1] = range[0];
  } else if (range[1] >= h) {
    range[1] = h - 1;
  }

  for (y = range[0]; y <= range[1]; y++) {
    for (x = 0; x < w; x++) {
      if (typeof afn === "function") {
        acc = afn(fn(x, y, GameState.map[y][x]), acc);
      } else {
        fn(x, y, GameState.map[y][x]);
      }
    }
  }

  if (typeof afn === "function") {
    return acc;
  }
};

GameState.transverse_shape_location = function (fn, afn) {
  var pos = GameState.pos;
  var shape = GameState.shape;

  var shape_data = Shape.get_shape_data(shape.id, shape.ori);

  var acc = null;

  var i;
  for (i = 0; i < shape_data.length; i++) {
    var x = pos.x + shape_data[i][0];
    var y = pos.y + shape_data[i][1];

    if (typeof afn === "function") {
      acc = afn(fn(x, y), acc);
    } else {
      fn(x, y);
    }
  }

  if (typeof afn === "function") {
    return acc;
  }
};

GameState.solidify = function () {
  this.transverse_shape_location(function (x, y) {
    GameState.map[y][x] = GameState.shape.id + 1;
  });
};

GameState.check_game_over = function () {
  return (this.map[Tetris.hidden_height][4] > 0 || this.map[Tetris.hidden_height][5] > 0);
};

GameState.increase_score = function (lines) {

  this.score += Tetris.line_score[lines - 1] * this.level;
  this.num_cleared_line += lines;
  this.level = Math.floor(this.num_cleared_line / 10) + 1;

  if (this.level > 100) {
    this.level = 100;
  }
};
var DrawRoutine = {
  tile_offset: {
    x: 140,
    y: 40
  },
};

DrawRoutine.draw_block_internal = function (x, y, c) {
  var ctx = Renderer.context;
  var saved_style = ctx.fillStyle;
  var bs = Tetris.block_size;

  var color = parseInt(c.substr(1), 16);
  color = [(color & 0xff0000) >> 16, (color & 0xff00) >> 8, color & 0xff];

  var border_color = [];
  var highlight_color = [];
  var i;
  for (i = 0; i < 3; i++) {
    var b = color[i] * 0.8;
    var h = color[i] * 1.35;

    if (h > 255) {
      h = 255;
    }

    border_color[i] = Math.round(b);
    highlight_color[i] = Math.round(h);
  }

  var grd = ctx.createRadialGradient(x + (bs >> 1), y + (bs >> 1), 10,
    x + (bs >> 1), y + (bs >> 1), 1.5);
  grd.addColorStop(0, c);
  grd.addColorStop(1, "rgb(" + highlight_color.join(",") + ")");

  ctx.fillStyle = "rgb(" + border_color.join(",") + ")";
  ctx.fillRect(x, y, bs, bs);
  ctx.fillStyle = grd;
  ctx.fillRect(x + 1, y + 1, bs - 2, bs - 2);
  ctx.fillStyle = saved_style;
};

DrawRoutine.draw_block = function (x, y, c) {
  var tile_offset = DrawRoutine.tile_offset;
  var bs = Tetris.block_size;
  var pixel_x = tile_offset.x + x * bs;
  var pixel_y = tile_offset.y + y * bs;

  DrawRoutine.draw_block_internal(pixel_x, pixel_y, c);
};

DrawRoutine.draw_shape = function () {
  GameState.transverse_shape_location(function (x, y) {
    if (y - Tetris.hidden_height >= 0) {
      DrawRoutine.draw_block(x, y - Tetris.hidden_height, Shape.color[GameState.shape.id]);
    }
  });
};

DrawRoutine.draw_round_corner_box = function (x, y, width, height, radius) {
  var ctx = Renderer.context;

  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  ctx.fill();
};

DrawRoutine.draw_next_shape = function () {
  var offset = {
    x: 460,
    y: 60
  };
  var ctx = Renderer.context;

  ctx.fillStyle = "#777";

  ctx.font = "bold 20px sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("NEXT", offset.x, offset.y);

  offset.y += 10;

  DrawRoutine.draw_round_corner_box(offset.x, offset.y, 120, 120, 10);

  var sid = GameState.next_shape_id;
  var shape_data = Shape.get_shape_data(sid, 0);
  var bs = Tetris.block_size;
  var i;

  offset.x += 40;
  offset.y += 80;

  for (i = 0; i < shape_data.length; i++) {
    var x = shape_data[i][0] * bs + offset.x;
    var y = shape_data[i][1] * bs + offset.y;

    if (Shape.size[sid][0] == 1) {
      x += bs >> 1;
    }

    if (Shape.size[sid][1] == 3) {
      y -= bs >> 1;
    } else if (Shape.size[sid][1] == 2) {
      y -= bs;
    }

    DrawRoutine.draw_block_internal(x, y, Shape.color[sid]);
  }
};

DrawRoutine.draw_value = function (x, y, caption, value) {
  var offset = {
    x: x,
    y: y + 30
  };
  var ctx = Renderer.context;

  ctx.fillStyle = "#777";
  ctx.font = "bold 20px sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(caption, offset.x, offset.y);

  offset.y += 10;
  DrawRoutine.draw_round_corner_box(offset.x, offset.y, 120, 30, 10);

  ctx.fillStyle = "#333";
  ctx.font = "bold 15px sans-serif";
  ctx.textAlign = "right";
  offset.y += 20;
  offset.x += 110;
  ctx.fillText(value, offset.x, offset.y);
};

DrawRoutine.draw_overlay_text = function (text) {
  var offset = {
    x: 360,
    y: 180
  };
  var ctx = Renderer.context;

  ctx.fillStyle = "rgba(64,64,64,0.75)";
  ctx.fillRect(0, offset.y, 720, 100);

  offset.y += 110;
  ctx.fillStyle = "#EEE";
  ctx.font = "bold 100px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";
  ctx.fillText(text, offset.x, offset.y);
};

DrawRoutine.draw = function () {
  var ctx = this.context;

  ctx.fillStyle = "#333";
  ctx.fillRect(0, 0, 720, 480);

  tile_offset = DrawRoutine.tile_offset;

  ctx.fillStyle = "#777";
  ctx.fillRect(tile_offset.x, tile_offset.y, 200, 400);

  GameState.transverse_map(function (x, y, v) {
    if (v) {
      y -= Tetris.hidden_height;
      DrawRoutine.draw_block(x, y, Shape.color[v - 1]);
    }
  }, null, [Tetris.hidden_height, Tetris.hidden_height + Tetris.height - 1]);

  DrawRoutine.draw_shape();
  DrawRoutine.draw_next_shape();
  DrawRoutine.draw_value(460, 190, "SCORE", GameState.score);
  DrawRoutine.draw_value(460, 260, "LINES", GameState.num_cleared_line);
  DrawRoutine.draw_value(460, 330, "LEVEL", GameState.level - 1);
};
function GameTimer(routine, interval) {
  var self = this;

  this.routine = routine;
  this.interval = interval;
  this.timer_id = null;

  this.start = function () {
    self.timer_id = setInterval(self.routine, self.interval);
  };

  this.stop = function () {
    if (self.timer_id !== null) {
      clearInterval(self.timer_id);
    }
  };
}
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
  Input.handle_ArrowLeft_down = function () {
    if (GameState.state === "in-game") {
      move_shape(-1, 0);
      Renderer.draw();
    }
  };

  Input.handle_ArrowRight_down = function () {
    if (GameState.state === "in-game") {
      move_shape(1, 0);
      Renderer.draw();
    }
  };

  Input.handle_ArrowDown_down = function () {
    if (GameState.state === "in-game") {
      move_shape(0, 1);
      Renderer.draw();
    }
  };

  Input.handle_ArrowUp_down = function () {
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
