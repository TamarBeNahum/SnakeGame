// Astar.js

function aStar(start, target1, target2, value1, value2) {
    let openList = [];
    let closedList = [];
    openList.push(start);

    while (openList.length > 0) {
        let lowIndex = 0;
        for (let i = 0; i < openList.length; i++) {
            if (openList[i].f < openList[lowIndex].f) {
                lowIndex = i;
            }
        }
        let currentNode = openList[lowIndex];

        if ((currentNode.x === target1.x && currentNode.y === target1.y) || (currentNode.x === target2.x && currentNode.y === target2.y)) {
            let curr = currentNode;
            let path = [];
            while (curr.parent) {
                path.push(curr);
                curr = curr.parent;
            }
            return path.reverse();
        }

        openList.splice(lowIndex, 1);
        closedList.push(currentNode);

        let neighbors = getNeighbors(currentNode);
        for (let neighbor of neighbors) {
            if (inList(closedList, neighbor) || collision(neighbor, snake) || collision(neighbor, bombs)) {
                continue;
            }

            let gScore = currentNode.g + 1;
            let gScoreIsBest = false;

            if (!inList(openList, neighbor)) {
                gScoreIsBest = true;
                neighbor.h = Math.min(heuristic(neighbor, target1, value1), heuristic(neighbor, target2, value2));
                openList.push(neighbor);
            } else if (gScore < neighbor.g) {
                gScoreIsBest = true;
            }

            if (gScoreIsBest) {
                neighbor.parent = currentNode;
                neighbor.g = gScore;
                neighbor.f = neighbor.g + neighbor.h;
            }
        }
    }
    return [];
}

function getNeighbors(node) {
    let neighbors = [];
    let dirs = [
        { x: -1, y: 0 },
        { x: 1, y: 0 },
        { x: 0, y: -1 },
        { x: 0, y: 1 }
    ];
    for (let dir of dirs) {
        let neighbor = { x: node.x + dir.x * box, y: node.y + dir.y * box };
        if (neighbor.x >= 0 && neighbor.x < 18 * box && neighbor.y >= 0 && neighbor.y < 18 * box) {
            neighbors.push(neighbor);
        }
    }
    return neighbors;
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
