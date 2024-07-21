// A* Algorithm implementation for snake game pathfinding

function aStar(start, target1, target2, value1, value2) {
    let openList = []; // Nodes to be evaluated
    let closedList = []; // Nodes already evaluated
    openList.push(start); // Add the start node to the open list

    // Loop until there are no more nodes to evaluate
    while (openList.length > 0) {
        // Find the node with the lowest f value in the open list
        let lowIndex = 0;
        for (let i = 0; i < openList.length; i++) {
            if (openList[i].f < openList[lowIndex].f) {
                lowIndex = i;
            }
        }
        // Evaluated node
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
            if (inList(closedList, neighbor)) {
                continue;
            }

            // Calculate the g score for the neighbor
            let gScore = currentNode.g + 1; // Each move has a cost of 1

            // If the neighbor is not in the open list, add it and calculate its heuristic
            if (!inList(openList, neighbor) || (gScore < neighbor.g)) {
                // Calculate the heuristic for both fruits and take the minimum
                neighbor.h = Math.min(
                    heuristic(neighbor, target1, value1), // Heuristic for yellow fruit
                    heuristic(neighbor, target2, value2)  // Heuristic for red fruit
                );
                neighbor.g = gScore;
                neighbor.f = neighbor.g + neighbor.h;
                neighbor.parent = currentNode;
                openList.push(neighbor);
            }
        }
    }
    return []; // Return an empty array if no path is found
}

// Function to get the neighbors of the current node
function getNeighbors(node) {
    let neighbors = [];
    let dirs = [
        { x: -1, y: 0 }, // Move left
        { x: 1, y: 0 },  // Move right
        { x: 0, y: -1 }, // Move up
        { x: 0, y: 1 }   // Move down
    ];
    for (let dir of dirs) {
        // Calculate the neighbor's position by adding the direction to the current node's position
        let neighbor = { x: node.x + dir.x * box, y: node.y + dir.y * box };
        // Check if the neighbor is within the grid boundaries and not colliding with any objects
        if (neighbor.x >= 0 && neighbor.x < cols * box && neighbor.y >= 0 && neighbor.y < rows * box) {
            if (!collision(neighbor, aiSnake) && !collision(neighbor, playerSnake) && !collision(neighbor, bombs)) {
                neighbors.push(neighbor); // Add the valid neighbor to the list
            }
        }
    }
    return neighbors; // Return the list of valid neighbors
}

// Function to check if a node is in a list
function inList(list, node) {
    for (let item of list) {
        if (item.x === node.x && item.y === node.y) {
            return true;
        }
    }
    return false;
}

// Heuristic function to estimate the cost to reach the target
function heuristic(node, target) {
    const dangerRadius = 2*box; // 2 blocks radius
    const dangerWeight = 10; // Weight for danger

    // Calculate the Euclidean distance to the target
    let distance = Math.sqrt((node.x - target.x) ** 2 + (node.y - target.y) ** 2);

    // Add penalty for being close to the player's snake
    for (let segment of playerSnake) {
        let snakeDistance = Math.sqrt((node.x - segment.x) ** 2 + (node.y - segment.y) ** 2);
        if (snakeDistance < dangerRadius) {
            distance += (dangerRadius - snakeDistance) * dangerWeight;
        }
    }

    return distance;
}
