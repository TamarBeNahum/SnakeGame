// Astar.js


function aStar(start, target1, target2, value1, value2) {
    let openList = []; // Nodes to be evaluated
    let closedList = []; // Nodes already evaluated
    openList.push(start); // Add the start node to the open list - { x: snakeX, y: snakeY, g: 0, f: 0 }

    // Loop until there are no more nodes to evaluate
    while (openList.length > 0) {
        // Find the node with the lowest f value in the open list
        let lowIndex = 0;
        for (let i = 0; i < openList.length; i++) {
            if (openList[i].f < openList[lowIndex].f) {
                lowIndex = i;
            }
        }
        //evaluated node
        let currentNode = openList[lowIndex];

        // If the current node is one of the targets, reconstruct the path and return it
        if ((currentNode.x === target1.x && currentNode.y === target1.y) || 
            (currentNode.x === target2.x && currentNode.y === target2.y)) {
            let curr = currentNode;
            let path = [];
            while (curr.parent) {
                path.push(curr);
                curr = curr.parent;
            }
            return path.reverse(); // Return the path in the correct order
        }

        // Move the current node from open to closed list
        openList.splice(lowIndex, 1);
        closedList.push(currentNode);

        // Get the neighbors of the current node
        let neighbors = getNeighbors(currentNode);
        for (let neighbor of neighbors) {
            // If the neighbor is in the closed list or collides with the snake or bombs, skip it
            if (inList(closedList, neighbor) || collision(neighbor, snake) || collision(neighbor, bombs)) {
                continue;
            }

            // Calculate the g score for the neighbor
            let gScore = currentNode.g + 1; // Each move has a cost of 1
            let gScoreIsBest = false;

            // If the neighbor is not in the open list, add it and calculate its heuristic
            if (!inList(openList, neighbor)) {
                gScoreIsBest = true;
                neighbor.h = Math.min(heuristic(neighbor, target1, value1), heuristic(neighbor, target2, value2));
                openList.push(neighbor);
            } else if (gScore < neighbor.g) { // If this path to the neighbor is better, use it
                gScoreIsBest = true;
            }

            // If this path is the best so far, update the neighbor's properties
            if (gScoreIsBest) {
                neighbor.parent = currentNode;
                neighbor.g = gScore;
                neighbor.f = neighbor.g + neighbor.h;
            }
        }
    }
    return []; // Return an empty array if no path is found
}

function getNeighbors(node) {
    let neighbors = [];
    let dirs = [
        { x: -1, y: 0 }, // Move left: decrease x by one box (32 pixels)
        { x: 1, y: 0 },  // Move right: increase x by one box (32 pixels)
        { x: 0, y: -1 }, // Move up: decrease y by one box (32 pixels)
        { x: 0, y: 1 }   // Move down: increase y by one box (32 pixels)
    ];
    for (let dir of dirs) {
        // Calculate the neighbor's position by adding the direction to the current node's position
        let neighbor = { x: node.x + dir.x * box, y: node.y + dir.y * box };
        // Check if the neighbor is within the grid boundaries (19 cells wide and 19 cells tall)
        if (neighbor.x >= 0 && neighbor.x < 19 * box && neighbor.y >= 0 && neighbor.y < 19 * box) {
            neighbors.push(neighbor); // Add the valid neighbor to the list
        }
    }
    return neighbors; // Return the list of valid neighbors
}


function inList(list, node) {
    for (let item of list) {
        if (item.x === node.x && item.y === node.y) {
            return true;
        }
    }
    return false;
}


function heuristic(node, target, value) {
    return Math.sqrt((node.x - target.x) ** 2 + (node.y - target.y) ** 2) / value;
}