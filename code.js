var canvas;
var context;
var width, height;
var boardInfo = [2];
var board = [[]];
var counter = 0;
var hasDropping = false;
var piece = [[], []];
var keydown = false;
var keyup = false;
var currentPieceNumber = undefined;
var currentPiecePosition = 0;
var pieces = [
	//4 long
	[
		[[0, 0], [1, 0], [2, 0], [3, 0]],
		[[1, 0], [1, 1], [1, 2], [1, 3]],
		[[0, 0], [1, 0], [2, 0], [3, 0]],
		[[2, 0], [2, 1], [2, 2], [2, 3]]
	],
	// S
	[
		[[0, 1], [1, 0], [1, 1], [2, 0]],
		[[1, 0], [1, 1], [2, 1], [2, 2]],
		[[0, 1], [1, 0], [1, 1], [2, 0]],
		[[1, 0], [1, 1], [2, 1], [2, 2]]
	],
	//Z
	[
		[[0, 0], [1, 0], [1, 1], [2, 1]],
		[[0, 1], [0, 2], [1, 0], [1, 1]],
		[[0, 0], [1, 0], [1, 1], [2, 1]],
		[[0, 1], [0, 2], [1, 0], [1, 1]]
	],
	//O
	[
		[[0, 0], [0, 1], [1, 0], [1, 1]],
		[[0, 0], [0, 1], [1, 0], [1, 1]],
		[[0, 0], [0, 1], [1, 0], [1, 1]],
		[[0, 0], [0, 1], [1, 0], [1, 1]]
	], [
		[[0, 1], [1, 0], [1, 1], [2, 1]],
		[[1, 0], [1, 1], [1, 2], [2, 1]],
		[[0, 1], [1, 1], [1, 2], [2, 1]],
		[[0, 1], [1, 0], [1, 1], [1, 2]]
	]
];
var savedPiece = undefined;

var ghost = [];
var eventLock = false;

function init() {
	canvas = document.getElementsByTagName('canvas')[0];
	if (canvas.getContext) {
		context = canvas.getContext('2d');
		context.canvas.width = 300;
		context.canvas.height = 600;
		width = canvas.width;
		height = canvas.height;
	}
	boardInfo[0] = "black";
	boardInfo[1] = "green";
	boardInfo[2] = "blue";
	boardInfo[3] = "rgba(255,255,255, 0.7)";
	for (let x = 0; x <= 10; x++) {
		board[x] = [];
		for (let y = 0; y <= 20; y++) {
			board[x][y] = 0;
		}
	}
}

function loop() {
	clearScreen();
	if (!hasDropping) {
		let copyPieces = deepCopy(pieces);
		currentPieceNumber = Math.floor(Math.random() * ((pieces.length)));
		piece = copyPieces[currentPieceNumber][0];
		addPieceToBoard(piece);
		hasDropping = true;
		createGhost(piece);
	}
	if (counter > 20) {
		autoDrop();
		counter = 0;
	} else {
		counter = counter + 1;
	}
	draw();
	requestAnimationFrame(loop);
}

function addPieceToBoard(piece) {
	for (let i = 0; i < piece.length; i++) {
		let pieceX = piece[i][0];
		let pieceY = piece[i][1];
		board[pieceX][pieceY] = 1;
	}
}

function draw() {
	for (let x = 0; x <= 10; x++) {
		for (let y = 0; y <= 20; y++) {
			context.fillStyle = boardInfo[board[x][y]];
			context.fillRect((x * 30), (y * 30), 25, 25)
		}
	}
}

function delCurPiece() {
	for (let piecePart = 0; piecePart <= piece.length - 1; piecePart++) {
		let x = piece[piecePart][0];
		let y = piece[piecePart][1];
		board[x][y] = 0;
	}
}

function savePiece() {
	if (savedPiece === undefined) {
		savedPiece = currentPieceNumber;
		delCurPiece();
		hasDropping = false;
	} else {
		let saveEx = currentPieceNumber;
		delCurPiece();
		piece = deepCopy(pieces)[savedPiece][0];
		currentPieceNumber = savedPiece;
		savedPiece = saveEx;
		addPieceToBoard(piece);
		createGhost(piece);
	}
}

function autoDrop() {
	let canDo = true;
	for (let x = 0; x <= 10; x++) {
		for (let y = 20; y >= 0; y--) {
			if (!checkPieceMax(x, y)) {
				canDo = false;
			}
		}
	}
	for (let x = 0; x <= 10; x++) {
		for (let y = 20; y >= 0; y--) {
			if (board[x][y + 1] !== undefined) {
				if (board[x][y] === 1) {
					if (y + 1 !== 20 && canDo) {
						board[x][y + 1] = 1;
						board[x][y] = 0;
						for (let pieceX = 0; pieceX < piece.length; pieceX++) {
							if (x === piece[pieceX][0] && y === piece[pieceX][1]) {
								piece[pieceX][0] = x;
								piece[pieceX][1] = y + 1;
							}
						}
					} else {
						for (let x = 0; x <= 10; x++) {
							for (let y = 20; y >= 0; y--) {
								if (board[x][y] === 1) {
									board[x][y] = 2;
								}
							}
						}
						removeLines();
						hasDropping = false;
						piece = [];
						currentPiecePosition = 0;
						break;
					}
				}
			}
		}
	}
}

function removeLines() {
	eventLock = true;
	for (let y = 20; y >= 0; y--) {
		let counter = 0;
		for (let x = 0; x <= 10; x++) {
			if (board[x][y] === 2) {
				counter += 1;
			}
		}
		if (counter === 10) {
			for (let y2 = y; y2 >= 0; y2--) {
				for (let x2 = 0; x2 <= 10; x2++) {
					if (y2 !== 0) {
						board[x2][y2] = board[x2][y2 - 1]
					} else {
						board[x2][y2] = 0;
					}
				}
			}
			y++;
		}
	}
	eventLock = false;
}

function checkPieceMax(x, y) {
	for (let pieceX = 0; pieceX < piece.length; pieceX++) {
		if (x === piece[pieceX][0] && y === piece[pieceX][1]) {
			if (board[x][y + 1] === 2 || y === 19) {
				return false;
			}
		}
	}
	return true;
}

function clearScreen() {
	context.clearRect(0, 0, canvas.width, canvas.height);
}

document.addEventListener('keydown', function (event) {
	if (!eventLock) {
		//space
		if (keydown === false) {
			if (event.keyCode === 32) {
				keydown = true;
				move('fastdown');
				document.addEventListener('keyup', (ev) => {
					if (ev.keyCode === 32) {
						keydown = false
					}
				});
			}
		}
		if (keyup === false) {
			if (event.keyCode === 38) {
				move('up');
				createGhost(piece);
				keyup = true;
				window.setTimeout(() => {
					keyup = false
				}, 100);
			}
		}

		if (event.keyCode === 67) {
			savePiece();
		}
	}
});
KeyboardController({
	38: function () {
		move('up');
		createGhost(piece);
	}
}, 1000);
KeyboardController({
	37: function () {
		move('left');
		createGhost(piece);
	},
	39: function () {
		move('right');
		createGhost(piece);
	},
	40: function () {
		move('down');
	}
}, 125);

function move(location) {
	switch (location) {
		case 'up':
			let allNew = [];
			for (let piecePart = 0; piecePart <= piece.length - 1; piecePart++) {
				let pieceX = piece[piecePart][0];
				let pieceY = piece[piecePart][1];
				let copyPieces = deepCopy(pieces);
				let old = copyPieces[currentPieceNumber][currentPiecePosition];
				let newPiece;
				if (currentPiecePosition == 3) {
					newPiece = copyPieces[currentPieceNumber][0];
				} else {
					newPiece = copyPieces[currentPieceNumber][currentPiecePosition + 1];
				}
				let differenceX = newPiece[piecePart][0] - old[piecePart][0];
				let differenceY = newPiece[piecePart][1] - old[piecePart][1];
				let newX = pieceX + differenceX;
				let newY = pieceY + differenceY;
				allNew[piecePart] = [newX, newY];
			}
			let upallowed = true;
			for (let newpart = 0; newpart <= allNew.length - 1; newpart++) {
				if (!checknewpiecewithboard(allNew[newpart])) {
					upallowed = false;
					break;
				}
			}
			if (upallowed) {
				for (let y = 0; y <= 20; y++) {
					for (let x = 0; x <= 10; x++) {
						if (board[x][y] === 1) {
							board[x][y] = 0;
						}
					}
				}
				for (let i = 0; i < allNew.length; i++) {
					board[allNew[i][0]][allNew[i][1]] = 1;
				}
				piece = deepCopy(allNew);
				if (currentPiecePosition < 3) {
					currentPiecePosition += 1;
				} else {
					currentPiecePosition = 0;
				}
			}
			break;
		case 'down':
			down();
			break;
		case 'left':
			let canleft = true;
			for (let piecePart = 0; piecePart <= piece.length - 1; piecePart++) {
				let pieceX = piece[piecePart][0];
				let pieceY = piece[piecePart][1];
				if (!checknewpiecewithboard([pieceX - 1, pieceY])) {
					canleft = false;
				}
				if (pieceX === 0) {
					canleft = false;
				}
			}
			if (canleft) {
				for (let piecePart = 0; piecePart <= piece.length - 1; piecePart++) {
					let pieceX = piece[piecePart][0];
					let pieceY = piece[piecePart][1];
					board[pieceX][pieceY] = 0;
					board[pieceX - 1][pieceY] = 1;
					piece[piecePart][0] -= 1;
				}
			}
			break;
		case 'right':
			let canright = true;
			for (let piecePart = 0; piecePart <= piece.length - 1; piecePart++) {
				let pieceX = piece[piecePart][0];
				let pieceY = piece[piecePart][1];
				if (!checknewpiecewithboard([pieceX + 1, pieceY])) {
					canright = false;
				}
				if (pieceX === 9) {
					canright = false;
				}
			}
			if (canright) {
				for (let piecePart = piece.length - 1; piecePart >= 0; piecePart--) {
					let pieceX = piece[piecePart][0];
					let pieceY = piece[piecePart][1];
					board[pieceX][pieceY] = 0;
					board[pieceX + 1][pieceY] = 1;
					piece[piecePart][0] += 1;
				}
			}
			break;
		case 'fastdown':
			deleteGhost();
			counter = 21;
			for (let t = 0; t < 21; t++) {
				down();
			}
			break;
	}
}

function down() {
	let candown = true;
	for (let piecePart = piece.length - 1; piecePart >= 0; piecePart--) {
		let pieceX = piece[piecePart][0];
		let pieceY = piece[piecePart][1];
		if (!checknewpiecewithboard([pieceX, pieceY + 1])) {
			candown = false;
		}
		if (pieceY === 19) {
			candown = false;
		}
	}
	if (candown) {
		for (let piecePart = piece.length - 1; piecePart >= 0; piecePart--) {
			let pieceX = piece[piecePart][0];
			let pieceY = piece[piecePart][1];
			board[pieceX][pieceY] = 0;
			board[pieceX][pieceY + 1] = 1;
			piece[piecePart][1] += 1;
		}
	}
}

function checknewpiecewithboard(pieceLocation) {
		if (pieceLocation[0] < 0 || pieceLocation[0] > 9) {
		return false;
	}
	if (pieceLocation[1] < 0 || pieceLocation[1] > 19) {
		return false;
	}
	if (board[pieceLocation[0]][pieceLocation[1]] === 2) {
		return false;
	}
	return true;
}


document.addEventListener("DOMContentLoaded", function (event) {
	init();
	loop();
});

function deepCopy(arr) {
	var len = arr.length;
	var newArr = new Array(len);
	for (var i = 0; i < len; i++) {
		if (Array.isArray(arr[i])) {
			newArr[i] = deepCopy(arr[i]);
		} else {
			newArr[i] = arr[i];
		}
	}
	return newArr;
}

function deleteGhost() {
	for (let piecePart = ghost.length - 1; piecePart >= 0; piecePart--) {
		let pieceX = ghost[piecePart][0];
		let pieceY = ghost[piecePart][1];
		if (board[pieceX][pieceY] === 3) {
			board[pieceX][pieceY] = 0;
		}
	}
}

function createGhost(currentPiece) {
	deleteGhost();
	let currentPieceDeepCopy = deepCopy(currentPiece);
	let save = [];
	for (let i = 0; i < 20; i++) {
		let candown = true;
		for (let piecePart = currentPieceDeepCopy.length - 1; piecePart >= 0; piecePart--) {
			let pieceX = currentPieceDeepCopy[piecePart][0];
			let pieceY = currentPieceDeepCopy[piecePart][1];
			if (board[pieceX][pieceY + 1] === 2) {
				candown = false;
			}
			if (pieceY === 19) {
				candown = false;
			}
		}
		if (candown) {
			for (let piecePart = currentPieceDeepCopy.length - 1; piecePart >= 0; piecePart--) {
				let pieceX = currentPieceDeepCopy[piecePart][0];
				let pieceY = currentPieceDeepCopy[piecePart][1];
				save[piecePart] = [pieceX, pieceY + 1];
				currentPieceDeepCopy[piecePart][1] += 1;
			}
		}
	}
	for (let piecePart = save.length - 1; piecePart >= 0; piecePart--) {
		let pieceX = save[piecePart][0];
		let pieceY = save[piecePart][1];
		ghost[piecePart] = [pieceX, pieceY];
		board[pieceX][pieceY] = 3;
	}
}

function KeyboardController(keys, repeat) {
	if (!eventLock) {
		// Lookup of key codes to timer ID, or null for no repeat
		//
		var timers = {};	// When key is pressed and we don't already think it's pressed, call the
		// key action callback and set a timer to generate another one after a delay
		//
		document.onkeydown = function (event) {
			var key = (event || window.event).keyCode;
			if (!(key in keys))
				return true;
			if (!(key in timers)) {
				timers[key] = null;
				keys[key]();
				if (repeat !== 0)
					timers[key] = setInterval(keys[key], repeat);
			}
			return false;
		};	// Cancel timeout and mark key as released on keyup
		//
		document.onkeyup = function (event) {
			var key = (event || window.event).keyCode;
			if (key in timers) {
				if (timers[key] !== null)
					clearInterval(timers[key]);
				delete timers[key];
			}
		};	// When window is unfocused we may not get key events. To prevent this
		// causing a key to 'get stuck down', cancel all held keys
		//
		window.onblur = function () {
			for (key in timers)
				if (timers[key] !== null)
					clearInterval(timers[key]);
			timers = {};
		};
	}
};