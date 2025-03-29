# 📝 Project 2 Writeup

**By Vivian & Timmons**

## 💻 What were some challenges you faced while making this app?

One of the biggest challenges we faced was managing the game state in a clean and modular way. Creating two independent 10×10 boards, randomly placing ships without overlap, and ensuring proper state updates after each player and AI move required thoughtful design. Integrating the Context API for global state was a learning curve, but ultimately helped us structure the logic cleanly.

Another challenge was handling layout responsiveness. We initially displayed the two game boards vertically on all screen sizes, but later wanted a layout where the boards would appear side-by-side on desktop and stack vertically on mobile. Achieving this required careful CSS work, especially with flex and media queries inside a fixed-width container.

Finally, debugging game logic (like avoiding repeated moves, checking game over status, etc.) across both boards was a bit tricky since a small bug in board mutation or move validation could break gameplay.

---

## 🌟 Given more time, what additional features, functional or design changes would you make?

If we had more time, we would have loved to:

- Implement the bonus drag-and-drop ship placement feature for the user’s board
- Add basic animations and sound effects when a ship is hit or missed
- Display a ship "health bar" or counter to visually track remaining ships
- Refactor the AI logic to simulate "focused targeting" instead of random clicks after a hit
- Persist high scores in localStorage or to a backend
- Improve accessibility by adding keyboard support and screen reader-friendly labels
- Integrate a design system or UI library like Material UI or TailwindCSS for more polished styling

---

## 🧠 What assumptions did you make while working on this assignment?

We assumed:

- The AI opponent does not require strategic targeting beyond random untried cells
- Players do not need to see a record of which ships remain (though this could be useful)
- The enemy ships are not visible at all on their board, even after the game ends
- Users are only playing one round at a time (no multi-game tracking or match history)
- The styling does not require support for very small screen sizes (e.g., under 400px wide)

---

## ⏱️ How long did this assignment take to complete?

We spent about **5 days** on this project. Each of us worked approximately **3–4 hours per day**, meaning the total time commitment was roughly **30–35 hours combined**.

---
