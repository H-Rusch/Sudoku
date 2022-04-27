class Sudoku {
    constructor() {
        this.dimension = 9;

        this.board = Array(this.dimension).fill(null)
            .map(item => Array(this.dimension).fill(0));

        this.board[0][1] = 7;
        this.board[0][4] = 2;
        this.board[0][7] = 4;
        this.board[0][8] = 6;
        this.board[1][1] = 6;
        this.board[1][6] = 8;
        this.board[1][7] = 9;
        this.board[2][0] = 2;
        this.board[2][3] = 8;
        this.board[2][6] = 7;
        this.board[2][7] = 1;
        this.board[2][8] = 5;
        this.board[3][1] = 8;
        this.board[3][2] = 4;
        this.board[3][4] = 9;
        this.board[3][5] = 7;
        this.board[4][0] = 7;
        this.board[4][1] = 1;
        this.board[4][7] = 5;
        this.board[4][8] = 9;
        this.board[5][3] = 1;
        this.board[5][4] = 3;
        this.board[5][6] = 4;
        this.board[5][7] = 8;
        this.board[6][0] = 6;
        this.board[6][1] = 9;
        this.board[6][2] = 7;
        this.board[6][5] = 2;
        this.board[6][8] = 8;
        this.board[7][1] = 5;
        this.board[7][2] = 8;
        this.board[7][7] = 6;
        this.board[8][0] = 4;
        this.board[8][1] = 3;
        this.board[8][4] = 8;
        this.board[8][7] = 7;

        // TODO deep copy the starting array, so it can be solved from the start later
        this.startBoard = this.board.copyWithin;
    }

    makeGuess(x, y, guess) {
        if (!/^[0-9]$/.test(guess) && guess != "") {
            return;
        }

        guess = guess != "" ? guess : 0;

        this.board[y][x] = guess;
    }

    /* Check for conflicts in the sudoku. Conflictung coordinates are stored in an array and returned.*/
    checkConflicts() {
        const numbers = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, "1", "2", "3", "4", "5", "6", "7", "8", "9"]);
        var coordinates = [];

        // check for conflicts in rows
        for (let y = 0; y < this.dimension; y++) {
            let notFirstError = true;
            for (let x = 0; x < this.dimension - 1; x++) {
                if (!numbers.has(this.board[y][x])) {
                    continue;
                }

                for (let dx = x + 1; dx < this.dimension; dx++) {
                    if (this.board[y][x] == this.board[y][dx]) {
                        if (notFirstError) {
                            coordinates.push([x, y]);
                            notFirstError = false;
                        }
                        coordinates.push([dx, y]);
                    }
                }
            }
        }
        console.log(coordinates.length);

        // check for conflicts in columns
        for (let x = 0; x < this.dimension; x++) {
            let notFirstError = true;
            for (let y = 0; y < this.dimension - 1; y++) {
                if (!numbers.has(this.board[y][x])) {
                    continue;
                }

                for (let dy = y + 1; dy < this.dimension; dy++) {
                    if (this.board[y][x] == this.board[dy][x]) {
                        if (notFirstError) {
                            coordinates.push([x, y]);
                            notFirstError = false;
                        }
                        coordinates.push([x, dy]);
                    }
                }
            }
        }

        // check for conflicts in segments
        let row = 0;
        let col = 0;
        for (let segment = 0; segment < this.dimension; segment++) {
            let segmentNumbers = [];

            for (let y = row; y < row + 3; y++) {
                for (let x = col; x < col + 3; x++) {
                    segmentNumbers.push(this.board[y][x]);
                }
            }

            for (let k = 0; k < segmentNumbers.length - 1; k++) {
                let notFirstError = true;
                if (!numbers.has(segmentNumbers[k])) {
                    continue;
                }
                for (let l = k + 1; l < segmentNumbers.length; l++) {
                    if (segmentNumbers[k] == segmentNumbers[l]) {
                        if (notFirstError) {
                            coordinates.push([col + k % 3, row + Math.floor(k / 3)]);
                            notFirstError = false;
                        }

                        let rowOffset = Math.floor(l / 3);
                        let colOffset = 1;
                        if (l > 3) {
                            colOffset = l % 3;
                        }

                        coordinates.push([col + colOffset, row + rowOffset]);
                    }
                }
            }

            if (segment % 3 == 2) {
                row += 3;
                col = 0;
            } else {
                col += 3;
            }
        }

        return coordinates;
    }
}
