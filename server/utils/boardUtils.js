/**
 * @param {number} size 
 * @returns {Array} 
 */
const generateBoard = (size = 10) => {
    
    const shipTypes = [
        { type: 'carrier', size: 5 },
        { type: 'battleship', size: 4 },
        { type: 'cruiser', size: 3 },
        { type: 'submarine', size: 3 },
        { type: 'destroyer', size: 2 }
    ];

    const ships = [];
    const usedPositions = new Set();

    for (const shipType of shipTypes) {
        let placed = false;
        let attempts = 0;
        const maxAttempts = 100;

        while (!placed && attempts < maxAttempts) {
            attempts++;
            const isHorizontal = Math.random() < 0.5;
            const startX = Math.floor(Math.random() * size);
            const startY = Math.floor(Math.random() * size);


            if (canPlaceShip(startX, startY, shipType.size, isHorizontal, size, usedPositions)) {
                const positions = placeShip(startX, startY, shipType.size, isHorizontal, usedPositions);
                ships.push({
                    type: shipType.type,
                    positions: positions.map(pos => ({ ...pos, hit: false })),
                    direction: isHorizontal ? 'horizontal' : 'vertical'
                });
                placed = true;
            }
        }

        if (!placed) {
            throw new Error(`Could not place ${shipType.type} after ${maxAttempts} attempts`);
        }
    }

    return ships;
};

/**
 * @param {number} startX 
 * @param {number} startY 
 * @param {number} size 
 * @param {boolean} isHorizontal 
 * @param {number} boardSize 
 * @param {Set} usedPositions 
 * @returns {boolean} 
 */
const canPlaceShip = (startX, startY, size, isHorizontal, boardSize, usedPositions) => {
    for (let i = 0; i < size; i++) {
        const x = isHorizontal ? startX + i : startX;
        const y = isHorizontal ? startY : startY + i;

        
        if (x >= boardSize || y >= boardSize) {
            return false;
        }

       
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                const newX = x + dx;
                const newY = y + dy;
                if (newX >= 0 && newX < boardSize && newY >= 0 && newY < boardSize) {
                    const posKey = `${newX},${newY}`;
                    if (usedPositions.has(posKey)) {
                        return false;
                    }
                }
            }
        }
    }
    return true;
};


const placeShip = (startX, startY, size, isHorizontal, usedPositions) => {
    const positions = [];
    for (let i = 0; i < size; i++) {
        const x = isHorizontal ? startX + i : startX;
        const y = isHorizontal ? startY : startY + i;
        positions.push({ x, y });
        usedPositions.add(`${x},${y}`);
    }
    return positions;
};

module.exports = {
    generateBoard,
    canPlaceShip,
    placeShip
}; 