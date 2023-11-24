function gen(cols, rows, width) {
	let html = "";
	for (let i = 0; i < rows; ++i) {
		html += `<div class="row" pos="${i}">`;
		for (let j = 0; j < cols; ++j) {
			html += `<div class="box" pos="${i}, ${j}" style="width: ${width}; height: ${width}"></div>`;
		}
		html += "</div>";
	}

	board.innerHTML = html;
}

function start() {
	combination = [];
	for (let i = 0; i < level; ++i) {
		combination.push(`${Math.floor(Math.random() * 5)}, ${Math.floor(Math.random() * 5)}`);
	}

	display();
}

function pulse(pos, color) {
	let target = document.querySelector(`.box[pos="${pos}"]`);
	console.log(target);
	target.animate(
		{
			backgroundColor: color,
			backgroundColor: "#878787",
		},
		{duration: 2000}
	);
}

function display() {
	for (let i = 0; i < level; ++i) {
		setTimeout(() => {
			pulse(combination[i], "#ff0000");
		}, i * 2000 + "ms");
	}
}

const board = document.getElementById("board");
var level = 1;
var combination = [];

gen(5, 5, "10vw");
