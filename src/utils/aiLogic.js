
export const getRandomUntriedTile = (board) => {
  const untriedTiles = [];

  board.forEach((row, x) => {
    row.forEach((tile, y) => {
      if (!tile.revealed) {
        untriedTiles.push([x, y]);
      }
    });
  });

  if (untriedTiles.length === 0) {
    return null;
  }

  const randomIndex = Math.floor(Math.random() * untriedTiles.length);
  return untriedTiles[randomIndex];
};
