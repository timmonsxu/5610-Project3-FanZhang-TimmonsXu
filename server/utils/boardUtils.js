/**
 * 生成游戏棋盘
 * @param {number} size - 棋盘大小（默认10x10）
 * @returns {Array} - 生成的船只数组
 */
const generateBoard = (size = 10) => {
    // 定义船只类型及其大小
    const shipTypes = [
        { type: 'carrier', size: 5 },
        { type: 'battleship', size: 4 },
        { type: 'cruiser', size: 3 },
        { type: 'submarine', size: 3 },
        { type: 'destroyer', size: 2 }
    ];

    const ships = [];
    const usedPositions = new Set();

    // 为每种船只分配位置
    for (const shipType of shipTypes) {
        let placed = false;
        let attempts = 0;
        const maxAttempts = 100;

        while (!placed && attempts < maxAttempts) {
            attempts++;
            const isHorizontal = Math.random() < 0.5;
            const startX = Math.floor(Math.random() * size);
            const startY = Math.floor(Math.random() * size);

            // 检查是否可以放置船只
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
 * 检查是否可以在指定位置放置船只
 * @param {number} startX - 起始X坐标
 * @param {number} startY - 起始Y坐标
 * @param {number} size - 船只大小
 * @param {boolean} isHorizontal - 是否水平放置
 * @param {number} boardSize - 棋盘大小
 * @param {Set} usedPositions - 已使用的位置集合
 * @returns {boolean} - 是否可以放置
 */
const canPlaceShip = (startX, startY, size, isHorizontal, boardSize, usedPositions) => {
    for (let i = 0; i < size; i++) {
        const x = isHorizontal ? startX + i : startX;
        const y = isHorizontal ? startY : startY + i;

        // 检查是否超出边界
        if (x >= boardSize || y >= boardSize) {
            return false;
        }

        // 检查周围是否有其他船只
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

/**
 * 在棋盘上放置船只
 * @param {number} startX - 起始X坐标
 * @param {number} startY - 起始Y坐标
 * @param {number} size - 船只大小
 * @param {boolean} isHorizontal - 是否水平放置
 * @param {Set} usedPositions - 已使用的位置集合
 * @returns {Array} - 船只的所有位置数组
 */
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