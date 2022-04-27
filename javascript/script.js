var lastConflicts = new Set();

// Self executing function which generates the page content
$(function() {
    var sudoku = new Sudoku();

    drawBoard(sudoku);
    
});

/* Draw the board by creating the needed HTML elements in the DOM. */
function drawBoard(sudoku) {
    var dimension = sudoku.dimension;

    $("#game-container").append($("<div>", {id: "game-board"}));
    for (let y = 0; y < dimension; y++) {
        let rowId = "row-" + y;
        
        $("#game-board").append($("<div>", {id: rowId, class: "row"}));
        for (let x = 0; x < dimension; x++) {
            let value = sudoku.board[y][x];

            let cellId = y + "-" + x;
            let cellText = value != 0 ? value : "";
            let attributes = {type: "text", id: cellId, class: "cell", value: cellText, maxlength: 1};
            if (value != 0) {
                attributes["class"] += " prefilled";
                attributes["disabled"] = true;
            }

            $("#" + rowId).append( $("<input>", attributes));
            
            // Bind function to each tile which relays the guess to the sudoku game
            $("#" + cellId).on("input", function(event) {
                let element = $(this);

                // only accept numbers as input
                let guess = element.val().replace(/[^0-9]/, "");
                element.val(guess);                

                let cellId = element[0]["id"];
                let y = cellId[0];
                let x = cellId[2];

                sudoku.makeGuess(x, y, guess);

                markConflicts(sudoku.checkConflicts());
            });
        }
    }
};

/* Mark the conflicted cells. Also unmark the cells which conflict has been solved. */
function markConflicts(conflicts) {
    conflicts = conflicts.map(coordinate => "#" + coordinate[1] + "-" + coordinate[0]);
    conflicts = new Set(conflicts);

    conflicts.forEach(cellId => {
        $(cellId).addClass("conflicted");
    });

    let difference = [...lastConflicts].filter(id => !conflicts.has(id));
    difference.forEach(cellId => {
        $(cellId).removeClass("conflicted");
    });
    lastConflicts = conflicts;
};
