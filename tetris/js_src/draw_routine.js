var DrawRoutine = {
	tile_offset: {x:140, y:40},
};

DrawRoutine.draw_block_internal = function (x,y,c)
{
	var ctx = Renderer.context;
	var saved_style = ctx.fillStyle;
	var bs = Tetris.block_size;

	var color = parseInt(c.substr(1),16);
	color = [(color&0xff0000)>>16, (color&0xff00)>>8, color&0xff];
	
	var border_color = [];
	var highlight_color = [];
	var i;
	for (i=0; i<3; i++) {
		var b = color[i]*0.8;
		var h = color[i]*1.35;

		if (h > 255) {
			h = 255;
		}

		border_color[i] = Math.round(b);
		highlight_color[i] = Math.round(h);
	}	

	var grd = ctx.createRadialGradient(x + (bs>>1), y + (bs>>1), 10,
									   x + (bs>>1), y + (bs>>1), 1.5);
	grd.addColorStop(0, c);
	grd.addColorStop(1,"rgb("+highlight_color.join(",")+")");

	ctx.fillStyle = "rgb("+border_color.join(",")+")";
	ctx.fillRect(x, y, bs, bs);
	ctx.fillStyle = grd;
	ctx.fillRect(x + 1, y + 1, bs-2, bs-2);
	ctx.fillStyle = saved_style; 
};

DrawRoutine.draw_block = function(x,y,c)
{
	var tile_offset = DrawRoutine.tile_offset;
	var bs = Tetris.block_size;
	var pixel_x = tile_offset.x + x*bs;
	var pixel_y = tile_offset.y + y*bs;

	DrawRoutine.draw_block_internal(pixel_x, pixel_y, c);
};

DrawRoutine.draw_shape = function() {
	GameState.transverse_shape_location(function(x,y) {
		if (y-Tetris.hidden_height >= 0) {
			DrawRoutine.draw_block(x, y-Tetris.hidden_height, Shape.color[GameState.shape.id]);
		}
	});
};

DrawRoutine.draw_round_corner_box = function(x, y, width, height, radius)
{
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
}

DrawRoutine.draw_next_shape = function () 
{
	var offset = {x:460, y:60};	
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

	for (i=0; i<shape_data.length; i++) {
		var x = shape_data[i][0]*bs + offset.x;
		var y = shape_data[i][1]*bs + offset.y;

		if (Shape.size[sid][0] == 1) {
			x += bs>>1;
		}

		if (Shape.size[sid][1] == 3) {
			y -= bs>>1;
		}else if (Shape.size[sid][1] == 2) {
			y -= bs;
		}

		DrawRoutine.draw_block_internal(x,y,Shape.color[sid]);
	}
};

DrawRoutine.draw_value = function (x,y, caption, value)
{
	var offset = {x:x, y:y+30};
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

DrawRoutine.draw_overlay_text = function (text)
{
	var offset = {x:360, y:180};
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
	ctx.fillRect(0,0,720,480);

	tile_offset = DrawRoutine.tile_offset
	
	ctx.fillStyle = "#777"
	ctx.fillRect(tile_offset.x, tile_offset.y, 200, 400);

	GameState.transverse_map(function(x,y,v){
		if(v) {
			y -= Tetris.hidden_height;
			DrawRoutine.draw_block(x, y, Shape.color[v-1]);
		}
	}, null, [Tetris.hidden_height, Tetris.hidden_height + Tetris.height - 1]);

	DrawRoutine.draw_shape();
	DrawRoutine.draw_next_shape();
	DrawRoutine.draw_value(460,190, "SCORE", GameState.score);
	DrawRoutine.draw_value(460,260, "LINES", GameState.num_cleared_line);
	DrawRoutine.draw_value(460,330, "LEVEL", GameState.level-1);
};

