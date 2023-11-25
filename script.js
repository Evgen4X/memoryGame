class Square {
	constructor(x, y, width, height, color, id, text = false) {
		this.x = x;
		this.y = y;
		this.w = width;
		this.h = height;
		this.color = color;
		this.id = id;
		this.text = text;
	}

	draw(canvas) {
		canvas.fillStyle = this.color;
		canvas.fillRect(this.x, this.y, this.w, this.h);
		if (this.text) {
			canvas.fillStyle = "rgb(0, 0, 0)";
			canvas.font = Math.min(this.h, this.w) / 3 + "px serif";
			canvas.fillText(this.id + 1, this.x + this.w / 5, this.y + this.h / 2);
		}
	}

	collide_point(x, y) {
		return x >= this.x && x <= this.x + this.w && y >= this.y && y <= this.y + this.h;
	}

	pulse(color, time) {
		let prev = this.color;
		this.color = color;
		setTimeout(() => {
			this.color = prev;
		}, time);
	}
}

function alert_(msg, time) {
	alert_div.innerHTML = msg;
	alert_div.style.top = 0;
	setTimeout(() => {
		alert_div.style.top = "-20vh";
	}, time);
}

function gen(columns, rows) {
	const width = canvas_size / columns;
	const height = canvas_size / rows;
	squares = [];
	for (let i = 0; i < rows; ++i) {
		for (let j = 0; j < columns; ++j) {
			let square = new Square(10 + j * width, 10 + i * height, width - 20, height - 20, "rgb(100, 100, 100)", i * columns + j, false);
			squares.push(square);
		}
	}
}

function update() {
	squares.forEach((square) => {
		square.draw(ctx);
	});
	if (listen) {
		time_left -= 25;
		if (time_left <= 0) {
			lose();
		}
	}
	timer.style.width = (time_left / max_time) * 100 + "vw";
}

function show(restart = false) {
	time_left = max_time;
	if (restart) {
		combination = [];
		for (let i = 0; i < combination_length; ++i) {
			combination.push(Math.floor(Math.random() * squares.length));
		}
	} else {
		combination.push(Math.floor(Math.random() * squares.length));
	}

	best_clicks.innerHTML = Math.max(parseInt(best_clicks.textContent), combination_length);
	best_score.innerHTML = Math.max(parseInt(best_score.textContent), Math.round(combination_length * squares.length * (-0.01 * max_time + 52)));

	combination.forEach((i, i_i) => {
		setTimeout(() => {
			squares[i].pulse("rgb(0, 0, 255)", speed);
		}, i_i * speed * 1.1);
	});

	setTimeout(() => {
		listen = true;
	}, combination_length * speed);
}

function win() {
	timer.width = "100vw";
	listen = false;
	squares.forEach((square) => {
		if (square.id != combination[combination_length - 1]) {
			square.color = "rgb(100, 100, 100)";
			square.pulse("rgb(0, 255, 0)", speed);
		}
	});
	combination_length++;
	combination_pos = 0;
}

function lose() {
	listen = false;
	alert_(`You lose with score of ${combination_length}!`, 2000);
	best_score.innerHTML = Math.max(parseInt(best_score.textContent), Math.round(combination_length * squares.length * (-0.01 * max_time + 52)));
	best_clicks.innerHTML = Math.max(parseInt(best_clicks.textContent), combination_length);
	combination_length = 1;
	combination_pos = 0;
	combination = [];
}

function canvas_react(event) {
	if (!listen) {
		return;
	}
	let x = event.clientX - canvas.getBoundingClientRect().left;
	let y = event.clientY - canvas.getBoundingClientRect().top;
	squares.forEach((square) => {
		if (square.collide_point(x, y)) {
			time_left = max_time;
			if (combination[combination_pos] == square.id) {
				square.color = "rgb(100, 100, 100)";
				square.pulse("rgb(0, 255, 0)", speed);
				combination_pos++;
				if (combination_pos == combination.length) {
					win();
				}
			} else {
				square.color = "rgb(100, 100, 100)";
				square.pulse("rgb(255, 0, 0)", speed);
				lose();
			}
			return;
		}
	});
}

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const canvas_size = canvas.offsetWidth;
var speed = 200;
var squares = [];
var combination = [];
var combination_length = 1;
var listen = false;
var combination_pos = 0;

const speed_input = document.getElementById("speed");
speed_input.onchange = () => {
	speed = parseInt(speed_input.value);
};

const alert_div = document.getElementById("alert");
const best_score = document.getElementById("best-score-score");
const best_clicks = document.getElementById("best-score-clicks");

canvas.addEventListener("click", canvas_react);

var size;
const sizer = document.getElementById("size");
sizer.onchange = () => {
	size = parseInt(sizer.value);
	ctx.clearRect(0, 0, canvas_size, canvas_size);
	gen(size, size);
};

gen(3, 3);

setInterval(update, 25);
var time_left = 2000;
var max_time = 2000;
const time_input = document.getElementById("time-input");
time_input.onchange = () => {
	time_left = parseInt(time_input.value);
	max_time = parseInt(time_input.value);
};

const timer = document.getElementById("timer");
