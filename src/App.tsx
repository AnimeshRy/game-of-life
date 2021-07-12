import React, { useState, useCallback, useRef } from 'react';
import produce from 'immer';

const numRows = 50;
const numCols = 50;

const operations = [
    [0, 1],
    [0, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
    [-1, -1],
    [1, 0],
    [-1, 0],
];

const generateEmptyGrid = () => {
    const rows = [];
    for (let i = 0; i < numRows; i++) {
        rows.push(Array.from(Array(numCols), () => 0));
    }

    return rows;
};

const App: React.FC = () => {
    const [grid, setGrid] = useState(() => {
        return generateEmptyGrid();
    });

    const [running, setRunning] = useState(false);

    const runningRef = useRef(running);
    runningRef.current = running;

    const runSimulation = useCallback(() => {
        // memoize func
        if (!runningRef.current) {
            return;
        }
        setGrid((g) => {
            // g = original grid, gridCopy = the one we can mutate
            return produce(g, (gridCopy) => {
                for (let i = 0; i < numRows; i++) {
                    for (let j = 0; j < numCols; j++) {
                        let neighbors: number = 0;
                        operations.forEach(([x, y]) => {
                            const newI = i + x;
                            const newJ = j + y;
                            // checking if we go below or above bounds
                            if (
                                newI >= 0 &&
                                newI < numRows &&
                                newJ >= 0 &&
                                newJ < numCols
                            ) {
                                neighbors += g[newI][newJ];
                            }
                        });
                        // Rules
                        if (neighbors < 2 || neighbors > 3) {
                            gridCopy[i][j] = 0;
                        } else if (g[i][j] === 0 && neighbors === 3) {
                            gridCopy[i][j] = 1;
                        }
                    }
                }
            });
        });

        setTimeout(runSimulation, 100);
    }, []);

    return (
        <>
            <button
                onClick={() => {
                    setRunning(!running);
                    // Run only if currently not running simulation
                    if (!running) {
                        runningRef.current = true;
                        runSimulation();
                    }
                }}
            >
                {running ? 'stop' : 'start'}
            </button>
            <button
                onClick={() => {
                    const rows = [];
                    for (let i = 0; i < numRows; i++) {
                        rows.push(
                            Array.from(Array(numCols), () =>
                                Math.random() > 0.7 ? 1 : 0
                            )
                        );
                    }

                    setGrid(rows);
                }}
            >
                random
            </button>
            <button
                onClick={() => {
                    setGrid(generateEmptyGrid());
                }}
            >
                clear
            </button>
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${numCols}, 20px)`,
                }}
            >
                {grid.map((rows, i) =>
                    rows.map((col, k) => (
                        <div
                            key={`${i} - ${k}`}
                            onClick={() => {
                                // alter the gridCopy inside and immer will make a immutable change and make a new grid
                                const newGrid = produce(grid, (gridCopy) => {
                                    gridCopy[i][k] = grid[i][k] ? 0 : 1;
                                });
                                setGrid(newGrid);
                            }}
                            style={{
                                width: 20,
                                height: 20,
                                backgroundColor: grid[i][k]
                                    ? 'green'
                                    : undefined,
                                border: 'solid 1px black',
                            }}
                        />
                    ))
                )}
            </div>
        </>
    );
};

export default App;
