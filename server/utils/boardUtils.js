/**
 * 生成游戏棋盘
 * @param {number} size - 棋盘大小（默认10x10）
 * @returns {Array} - 生成的棋盘数组
 */
const generateBoard = (size = 10) => {
    // 创建空棋盘
    const board = Array(size).fill().map(() => Array(size).fill(0));
    
    // 定义船只类型及其大小
    const ships = [
        { type: 'carrier', size: 5 },
        { type: 'battleship', size: 4 },
        { type: 'cruiser', size: 3 },
        { type: 'submarine', size: 3 },
        { type: 'destroyer', size: 2 }
    ];

    // 为每种船只分配位置
    ships.forEach(ship => {
        let placed = false;
        while (!placed) {
            // 随机选择起始位置
            const startX = Math.floor(Math.random() * size);
            const startY = Math.floor(Math.random() * size);
            
            // 随机选择方向（水平或垂直）
            const isHorizontal = Math.random() < 0.5;
            
            // 检查是否可以放置船只
            if (canPlaceShip(board, startX, startY, ship.size, isHorizontal, size)) {
                placeShip(board, startX, startY, ship.size, isHorizontal, ship.type);
                placed = true;
            }
        }
    });

    return board;
};

/**
 * 检查是否可以在指定位置放置船只
 * @param {Array} board - 棋盘数组
 * @param {number} startX - 起始X坐标
 * @param {number} startY - 起始Y坐标
 * @param {number} size - 船只大小
 * @param {boolean} isHorizontal - 是否水平放置
 * @param {number} boardSize - 棋盘大小
 * @returns {boolean} - 是否可以放置
 */
const canPlaceShip = (board, startX, startY, size, isHorizontal, boardSize) => {
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
                    if (board[newY][newX] !== 0) {
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
 * @param {Array} board - 棋盘数组
 * @param {number} startX - 起始X坐标
 * @param {number} startY - 起始Y坐标
 * @param {number} size - 船只大小
 * @param {boolean} isHorizontal - 是否水平放置
 * @param {string} shipType - 船只类型
 */
const placeShip = (board, startX, startY, size, isHorizontal, shipType) => {
    for (let i = 0; i < size; i++) {
        const x = isHorizontal ? startX + i : startX;
        const y = isHorizontal ? startY : startY + i;
        board[y][x] = shipType;
    }
};

module.exports = {
    generateBoard
}; 