/**
 * Function to find the shortest path to one of the two targets using the A* algorithm.
 *
 * @param start   The starting node for the pathfinding.
 * @param target1 The first target node.
 * @param target2 The second target node.
 * @param value1  The value associated with the first target for heuristic calculation.
 * @param value2  The value associated with the second target for heuristic calculation.
 * @return        The shortest path to one of the targets as an array of nodes.
 */
function aStar(start, target1, target2, value1, value2) {
    let openList = []; // Nodes to be evaluated
    let closedList = []; // Nodes already evaluated
    openList.push(start);

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
            return path.reverse();
        }

        // Move the current node from open to closed list
        openList.splice(lowIndex, 1);
        closedList.push(currentNode);

        let neighbors = getNeighbors(currentNode);
        for (let neighbor of neighbors) {
            // If the neighbor is in the closed list, skip it
            if (inList(closedList, neighbor)) {
                continue;
            }

            // Calculate the g score for the neighbor
            let gScore = currentNode.g + 1; // Each move has a cost of 1

            // If the neighbor is not in the open list or the new gScore is lower, update the neighbor
            if (!inList(openList, neighbor)) {
                openList.push(neighbor);
            } else if (gScore >= neighbor.g) {
                continue; // Skip this neighbor if the new gScore is not lower
            }

            neighbor.h = heuristic(neighbor, target1, value1, target2, value2);
            neighbor.g = gScore;
            neighbor.f = neighbor.g + neighbor.h;
            neighbor.parent = currentNode;
        }
    }
    return []; // Return an empty array if no path is found
}

/**
 * Function to get the neighbors of the current node.
 *
 * @param node The current node for which neighbors are to be found.
 * @return     An array of valid neighboring nodes.
 */
function getNeighbors(node) {
    let neighbors = [];
    let dirs = [
        { x: -1, y: 0 }, // Move left
        { x: 1, y: 0 },  // Move right
        { x: 0, y: -1 }, // Move up
        { x: 0, y: 1 }   // Move down
    ];
    for (let dir of dirs) {

        let neighbor = { x: node.x + dir.x * box, y: node.y + dir.y * box };
        // Check if the neighbor is within the grid boundaries and not colliding with any objects
        if (neighbor.x >= 0 && neighbor.x < cols * box && neighbor.y >= 0 && neighbor.y < rows * box) {
            if (!collision(neighbor, aiSnake) && !collision(neighbor, playerSnake) && !collision(neighbor, bombs)) {
                neighbors.push(neighbor);
            }
        }
    }
    return neighbors;
}

/**
 * Function to check if a node is in a list.
 *
 * @param list The list to check against.
 * @param node The node to check for.
 * @return     True if the node is in the list, false otherwise.
 */
function inList(list, node) {
    for (let item of list) {
        if (item.x === node.x && item.y === node.y) {
            return true;
        }
    }
    return false;
}

/**
 * Heuristic function to estimate the cost to reach the targets.
 *
 * @param node   The current node.
 * @param target1 The first target node.
 * @param value1  The value associated with the first target for heuristic calculation.
 * @param target2 The second target node.
 * @param value2  The value associated with the second target for heuristic calculation.
 * @return       The minimum estimated cost to reach one of the targets.
 */
function heuristic(node, target1, value1, target2, value2) {
    const dangerRadius = 2 * box; // 2 blocks radius - for the danger zone (close to the playerSnake)
    const dangerWeight = 10; // Weight for danger

    // Calculate the Euclidean distance to the targets and adjust by the values associated
    let distance1 = euclideanDistance(node, target1) / value1;
    let distance2 = euclideanDistance(node, target2) / value2;

    // Add penalty for being close to the player's snake for both targets
    for (let segment of playerSnake) {
        let snakeDistance1 = euclideanDistance(node, segment);
        if (snakeDistance1 < dangerRadius) {
            distance1 += (dangerRadius - snakeDistance1) * dangerWeight;
        }
        let snakeDistance2 = euclideanDistance(node, segment);
        if (snakeDistance2 < dangerRadius) {
            distance2 += (dangerRadius - snakeDistance2) * dangerWeight;
        }
    }

    // Return the minimum distance to either target
    return Math.min(distance1, distance2);
}

/**
 * Function to calculate the Euclidean distance between two nodes.
 *
 * @param node1 The first node.
 * @param node2 The second node.
 * @return      The Euclidean distance between the two nodes.
 */
function euclideanDistance(node1, node2) {
    return Math.sqrt((node1.x - node2.x) ** 2 + (node1.y - node2.y) ** 2);
}