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

	switch_(other, speed_) {
		let my_x = this.x;
		let my_y = this.y;
		let not_x = other.x;
		let not_y = other.y;

		const not_step_x = (this.x - other.x) / (speed_ / 25);
		const my_step_x = (other.x - this.x) / (speed_ / 25);
		const not_step_y = (this.y - other.y) / (speed_ / 25);
		const my_step_y = (other.y - this.y) / (speed_ / 25);

		const my_xi = setInterval(() => {
			if ((my_step_x >= 0 && this.x >= not_x) || (my_step_x < 0 && this.x <= not_x)) {
				if (this.x != not_x) {
					this.x = not_x;
				}
				window.clearInterval(my_xi);
			} else {
				this.x += my_step_x;
			}
		}, 25);

		const my_yi = setInterval(() => {
			if ((my_step_y >= 0 && this.y >= not_y) || (my_step_y < 0 && this.y <= not_y)) {
				if (this.y != not_y) {
					this.y = not_y;
				}
				window.clearInterval(my_yi);
			} else {
				this.y += my_step_y;
			}
		}, 25);

		const not_xi = setInterval(() => {
			if ((not_step_x >= 0 && other.x >= my_x) || (not_step_x < 0 && other.x <= my_x)) {
				if (other.x != my_x) {
					other.x = my_x;
				}
				window.clearInterval(not_xi);
			} else {
				other.x += not_step_x;
			}
		}, 25);

		const not_yi = setInterval(() => {
			if ((not_step_y >= 0 && other.y >= my_y) || (not_step_y < 0 && other.y <= my_y)) {
				if (other.y != my_y) {
					other.y = my_y;
				}
				window.clearInterval(not_yi);
			} else {
				other.y += not_step_y;
			}
		}, 25);
	}
}

function alert_(msg, time) {
	alert_div.innerHTML = msg;
	alert_div.style.top = 0;
	setTimeout(() => {
		alert_div.style.top = "-20vh";
	}, time);
}

function calc_score() {
	return Math.round((hard_mode_chance + hard_mode_number * 10) * 2500 * (hard_mode ? 1 : 0) + combination_length * squares.length * (-0.01 * max_time + 52));
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
	ctx.clearRect(0, 0, canvas_size, canvas_size);
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
	best_score.innerHTML = Math.max(parseInt(best_score.textContent), calc_score());

	combination.forEach((i, i_i) => {
		setTimeout(() => {
			squares[i].pulse("rgb(0, 0, 255)", speed);
		}, i_i * speed * 1.1);
	});

	let switched = 0;
	if (hard_mode && Math.random() < hard_mode_chance) {
		for (let i = 0; i < hard_mode_number; ++i) {
			let a, b;
			do {
				a = Math.floor(Math.random() * squares.length);
				b = Math.floor(Math.random() * squares.length);
			} while (a == b);
			setTimeout(() => {
				squares[b].switch_(squares[a], speed * (size * 0.3125));
			}, (i * 1.5 + combination_length) * speed * (size * 0.3125));
			switched += speed;
		}
	}
	setTimeout(() => {
		listen = true;
	}, (combination_length + hard_mode_number) * speed * (size * 0.3125) + switched);
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
	best_score.innerHTML = Math.max(parseInt(best_score.textContent), calc_score());
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

var size = 3;
const sizer = document.getElementById("size");
sizer.onchange = () => {
	size = parseInt(sizer.value);
	if (size < 2) {
		size = 2;
		sizer.value = 2;
	} else if (size > 10) {
		size = 10;
		sizer.value = 10;
	}
	ctx.clearRect(0, 0, canvas_size, canvas_size);
	gen(size, size);
};

const hard_mode_input = document.getElementById("hard-mode");
const hard_mode_probability = document.getElementById("hard-mode-chance");
const hard_mode_chance_label = document.getElementById("hard-mode-chance-label");
const hard_mode_number_input = document.getElementById("hard-mode-number");
const hard_mode_number_label = document.getElementById("hard-mode-number-label");
var hard_mode_chance = 0.2;
var hard_mode_number = 1;
var hard_mode = false;
hard_mode_input.onchange = () => {
	hard_mode = hard_mode_input.checked;
	if (hard_mode) {
		hard_mode_probability.disabled = false;
		hard_mode_chance_label.style.color = "#000000";
		hard_mode_number_input.disabled = false;
		hard_mode_number_label.style.color = "#000000";
	} else {
		hard_mode_probability.disabled = true;
		hard_mode_chance_label.style.color = "#999999";
		hard_mode_number_input.disabled = true;
		hard_mode_number_label.style.color = "#999999";
	}
};
hard_mode_probability.onchange = () => {
	hard_mode_chance = parseInt(hard_mode_probability.value) / 100;
	if (hard_mode_chance < 0.01) {
		hard_mode_chance = 0.01;
		hard_mode_probability.value = 1;
	} else if (hard_mode_chance > 1) {
		hard_mode_chance = 1;
		hard_mode_probability.value = 100;
	}
};

hard_mode_number_input.onchange = () => {
	hard_mode_number = parseInt(hard_mode_number_input.value);
	if (hard_mode_number < 1) {
		hard_mode_number = 1;
		hard_mode_number_input.value = 1;
	} else if (hard_mode_number > 15) {
		hard_mode_number = 15;
		hard_mode_number_input.value = 15;
	}
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
