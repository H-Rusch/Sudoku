# Sudoku
In this project I implemented the game Sudoku in Javascript. The goal for this project was to be able to make a playable game, supporting the player by giving hints about conflicting values, solving given puzzles and generating new ones.

## Solving Algorithm
In order to solve the puzzle a recursive backtracking algorithm is used. This algorithm selects the unfilled tile with the least possible candidates (valid values) and tries to fill it with every candidate. That way possible conflicts happen rather faster than later which speeds up the algorithm because less states are being considered. 

## Generating Algorithm
The first step to generating a Sudoku-puzzle is to generate the solution for that puzzle. Three of the 3x3 segments can be chosen, so they don't share a row or a column with any other chosen segment. The segments were selected in that specific way because in that arrangement their tiles can not stand in conflict with each. Those segments are then filled with the values of [1,9] in a random arrangement. From there on the normal solving algorithm can be used to generate the final solution. 

Now the second step is to remove values from this solution to generate the puzzle. The first idea was just to take away a set number of randomly selected values to generate the new puzzle. But this approach had the unfortunate effect to generate puzzles which were not unique. So when taking away a value the algorithm has to first check whether the puzzle still only has one solution after removing the value. If the puzzle would become ambiguous, the selected value can not be removed and another value has o be selected. To check if the puzzle has only one solution the solving algorithm was altered slightly in order to count the amount of solutions which are possible from a specific starting point. 

Currently when generating puzzles of a desired difficulty, the difficulty is only derived from the amount of values missing at the start. A better approach would be to rate the puzzle based on the techniques which have to be used to solve the puzzle.
