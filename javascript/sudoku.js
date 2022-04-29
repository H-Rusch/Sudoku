class Sudoku {
    numbers = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9]);

    constructor() {
        // 0: easy, 1: medium, 2: hard
        this.difficulty = 2;
        this.dimension = 9;

        this.solutions = 0;

        this.board = Array(this.dimension).fill(null)
            .map(_item => Array(this.dimension).fill(0));

        this.generateRandomBoard();
    }

    makeGuess(x, y, guess) {
        if (!/^[0-9]$/.test(guess) && guess != "") {
            return;
        }

        guess = guess != "" ? guess : 0;

        this.board[y][x] = parseInt(guess);
    }

    /* Check for conflicts in the sudoku. Conflictung coordinates are stored in an array and returned.*/
    checkConflicts(matrix) {
        var coordinates = [];

        // check for conflicts in rows
        for (let y = 0; y < this.dimension; y++) {
            let notFirstError = true;
            for (let x = 0; x < this.dimension - 1; x++) {
                if (!this.numbers.has(matrix[y][x])) {
                    continue;
                }

                for (let dx = x + 1; dx < this.dimension; dx++) {
                    if (matrix[y][x] == matrix[y][dx]) {
                        if (notFirstError) {
                            coordinates.push([x, y]);
                            notFirstError = false;
                        }
                        coordinates.push([dx, y]);
                    }
                }
            }
        }

        // check for conflicts in columns
        for (let x = 0; x < this.dimension; x++) {
            let notFirstError = true;
            for (let y = 0; y < this.dimension - 1; y++) {
                if (!this.numbers.has(matrix[y][x])) {
                    continue;
                }

                for (let dy = y + 1; dy < this.dimension; dy++) {
                    if (matrix[y][x] == matrix[dy][x]) {
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
                    segmentNumbers.push(matrix[y][x]);
                }
            }

            for (let k = 0; k < segmentNumbers.length - 1; k++) {
                let notFirstError = true;
                if (!this.numbers.has(segmentNumbers[k])) {
                    continue;
                }
                for (let l = k + 1; l < segmentNumbers.length; l++) {
                    if (segmentNumbers[k] == segmentNumbers[l]) {
                        if (notFirstError) {
                            coordinates.push([col + k % 3, row + Math.floor(k / 3)]);
                            notFirstError = false;
                        }

                        let rowOffset = Math.floor(l / 3);
                        let colOffset = l % 3;

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

    /* 
    Generate a random board with a number of prefilled values dependent on the selected difficulty. The 
    puzzle should still only have one solution and therefore the removed values are carefully selected. 
    */
    generateRandomBoard() {
        let matrix = Array(this.dimension).fill(null)
            .map(_item => Array(this.dimension).fill(0));

        // first fill top left, middle and bottom right segment, because they are not dependant on each other
        for (let offset = 0; offset < 3; offset++) {      
            let numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
            shuffle(numbers);
            for (let y = 0; y < 3; y++) {
                for (let x = 0; x < 3; x++) {
                    matrix[offset * 3 + y][offset * 3 + x] = numbers.pop();
                }
            }
        }

        // then fill the remaining spaces with backtracking
        this.solveBacktrack(matrix);

        // remove an amount of randomly selected tiles based on the selected difficulty
        var removeTiles = this.dimension * this.dimension;
        if (this.difficulty == 0) {
            removeTiles -= 36;
        } else if (this.difficulty == 1) {
            removeTiles -= 29;
        } else {
            removeTiles -= 22;
        }
        let coordinates = [];
        for (let y = 0; y < this.dimension; y++) {
            for (let x = 0; x < this.dimension; x++) {
                coordinates.push([x, y]);
            }
        }
        shuffle(coordinates);

        while (removeTiles > 0) {
            if (coordinates.length == 0) {
                console.warn("No more coordinates can be removed in order for the board to stilll be uniquely solveable.")
                break;
            }

            let [x, y] = coordinates.pop();
            let replaced = matrix[y][x];
            matrix[y][x] = 0;

            let solutions = this.countSolutions(deepcopy(matrix), 0);
            if (solutions != 1) {
                matrix[y][x] = replaced;
            } else {
                removeTiles -= 1;
            }
        }

        this.board = matrix;
    }

    /* Solve a sodoku board by backtracking. Select the tile with the least possible candidates when inserting a new value. */
    solveBacktrack(matrix) {
        let candidateMapping = this.fullCandidateMapping(matrix);
        // solution found
        if (candidateMapping.size == 0) {
            return true;
        }

        let key = this.findLeastCandidates(candidateMapping);
        let [x, y] = key.split(" ");
        // solution failed, board is in an incorrect state
        if (candidateMapping.get(key).length == 0) {
            return false;
        } 
        
        for (const n of candidateMapping.get(key)) {
            matrix[y][x] = n;

            if (this.solveBacktrack(matrix)) {
                return true;
            }

            matrix[y][x] = 0;
        }

        return false;
    }

    countSolutions(matrix, count) {
        // solution found
        if (this.checkFinished(matrix)) {
            return 1;
        }

        let candidateMapping = this.fullCandidateMapping(matrix);
        let key = this.findLeastCandidates(candidateMapping);
        let [x, y] = key.split(" ");
        // solution failed, board is in an incorrect state
        if (candidateMapping.get(key).length == 0) {
            return 0;
        } 
        
        for (const n of candidateMapping.get(key)) {
            matrix[y][x] = n;

            count += this.countSolutions(deepcopy(matrix), count);
            // more than one solution has been found
            if (count > 1) {
                break;
            }
        }

        return count;
    }

    /* Generate a full mapping of candidates for the empty fields in the matrix. */
    fullCandidateMapping(matrix) {
        let candidateMapping = new Map();

        for (let y = 0; y < matrix.length; y++) {
            for (let x = 0; x < matrix.length; x++) {
                if (matrix[y][x] == 0) {
                    candidateMapping.set(x + " " + y, this.findCellCandidates(matrix, x, y));
                }
            }
        }

        return candidateMapping;
    }

    /* Find a list of possible candidates for the specified coordinate. */
    findCellCandidates(matrix, x, y) {
        let encountered = new Set([]);

        // horizontal
        for (let dx = 0; dx < this.dimension; dx++) {
            if (matrix[y][dx] != 0) {
                encountered.add(matrix[y][dx]);
            }
        }

        // vertical 
        for (let dy = 0; dy < this.dimension; dy++) {
            if (matrix[dy][x] != 0) {
                encountered.add(matrix[dy][x]);
            }
        }

        // segment
        let row = Math.floor(y / 3) * 3;
        let col = Math.floor(x / 3) * 3;
        for (let dy = 0; dy < 3; dy++) {
            for (let dx = 0; dx < 3; dx++) {
                if (matrix[row + dy][col + dx] != 0) {
                    encountered.add(matrix[row + dy][col + dx]);
                }
            }
        }

        return difference(this.numbers, encountered);
    }

    findLeastCandidates(candidateMapping) {
        let minSize = Infinity;
        let minKey = null;
    
        candidateMapping.forEach((value, key) => {
            if (value.length < minSize) {
                minSize = value.length;
                minKey = key;
            }
        });
    
        return minKey;
    }

    checkFinished(matrix) {
        for (let y = 0; y < this.dimension; y++) {
            for (let x = 0; x < this.dimension; x++) {
                if (matrix[y][x] == 0) {
                    return false;
                }
            }
        }

        return this.checkConflicts(matrix).length == 0;
    }
}

function deepcopy(matrix) {
    let copy = Array(matrix.length).fill(null)
        .map(_item => Array(matrix[0].length).fill(0));

    for (let y = 0; y < matrix.length; y++) {
        for (let x = 0; x < matrix.length; x++) {
            copy[y][x] = matrix[y][x];
        }
    } 

    return copy;
}

function difference(set1, set2) {
    return [...set1].filter(element => !set2.has(element));
}

/**
 * Shuffles array in place.
 * @param {Array} a items An array containing the items.
 * https://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array
 */
 function shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}
