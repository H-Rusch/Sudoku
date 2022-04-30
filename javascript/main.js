var lastConflicts = new Set();
var sudoku = new Sudoku();

// Self executing function which fills the pages content
$(document).ready(function () {
    bindUiActions();
    populateBoard(true);


});


function bindUiActions() {
    $("#difficulty-selection").hide();

    // function for each tile
    for (let y = 0; y < sudoku.dimension; y++) {
        for (let x = 0; x < sudoku.dimension; x++) {
            let cellId = y + "-" + x;

            $("#" + cellId).on("input", function (event) {
                let element = $(this);

                // only accept numbers as input
                let guess = element.val().replace(/[^1-9]/, "");
                element.val(guess);

                let cellId = element[0]["id"];
                let y = cellId[0];
                let x = cellId[2];

                sudoku.makeGuess(x, y, guess);

                markConflicts(sudoku.checkConflicts(sudoku.board));
            });
        }
    }

    // generate new - buttons
    $("#random").on("click", function () {
        if ($("#difficulty-selection").is(":hidden")) {
            $("#difficulty-selection").slideToggle("Fast");
        }
    });
    $("#easy").on("click", function () { selectDifficulty(0) });
    $("#medium").on("click", function () { selectDifficulty(1) });
    $("#hard").on("click", function () { selectDifficulty(2) });

    // solve current - button
    $("#solve").on("click", function () { solveBoard() });

    // clear - button
    $("#clear").on("click", function () { clearBoard() });
};

function selectDifficulty(diff) {
    $("#difficulty-selection").slideToggle("Fast");
    sudoku.difficulty = diff;

    sudoku.generateRandomBoard();
    populateBoard(true);

    hideAlert();
}

function solveBoard() {
    let board = deepcopy(sudoku.board);
    if (sudoku.solveBacktrack(board)) {
        hideAlert();
        sudoku.startingBoard = sudoku.board;
        populateBoard(true);
        sudoku.setBoard(board);
        populateBoard(false);
    } else {
        showAlert("No solution found for this board.");
    }
}

function clearBoard() {
    sudoku.clearBoard();
    populateBoard(true);

    hideAlert();
}

function populateBoard(initial) {
    for (let y = 0; y < sudoku.dimension; y++) {
        for (let x = 0; x < sudoku.dimension; x++) {
            let cellId = "#" + y + "-" + x;
            let value = sudoku.startingBoard[y][x];
            let cellText = value != 0 ? value : "";

            let element = $(cellId);
            element.val(cellText);

            if (initial) {
                if (value != 0) {
                    element.addClass("prefilled");
                    element.prop("disabled", true);
                } else {
                    element.removeClass("prefilled");
                    element.prop("disabled", false);
                }
            }
        }
    }
    sudoku.setBoard(sudoku.startingBoard);

    markConflicts(sudoku.checkConflicts(sudoku.board));
};

/* Mark the conflicted cells. Also unmark the cells which conflict has been solved. */
function markConflicts(conflicts) {
    conflicts = conflicts.map(coordinate => "#" + coordinate[1] + "-" + coordinate[0]);
    conflicts = new Set(conflicts);

    conflicts.forEach(cellId => {
        $(cellId).addClass("conflicted");
    });

    let difference = [...lastConflicts].filter(cellId => !conflicts.has(cellId));
    difference.forEach(cellId => {
        $(cellId).removeClass("conflicted");
    });
    lastConflicts = conflicts;
};

function showAlert(message) {
    let element = $("#alert-message");
    if (element.is(":hidden")) {
        element.show();
        element.text(message);
    }
}

function hideAlert() {
    let element = $("#alert-message");
    if (!element.is(":hidden")) {
        element.hide();
        element.text("");
    }
}
