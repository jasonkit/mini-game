var Renderer = {
	canvas: null,
	context: null,
	draw: function() {},
};

Renderer.init = function (canvas_id, width, height)
{
	Renderer.canvas = document.getElementById(canvas_id);
	Renderer.canvas.width = width;
	Renderer.canvas.height = height;

	Renderer.context = Renderer.canvas.getContext("2d");
};

