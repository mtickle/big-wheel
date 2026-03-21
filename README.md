# 🎡 The Big Wheel Simulator

A high-fidelity, interactive React simulation of the legendary "Big Wheel" from television's longest-running game show. Built with a focus on mathematical accuracy, frame-perfect SVG animations, and a retro 1970s aesthetic.

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)

## 🕹️ Features

* **Mechanical Physics:** A 500px SVG wheel utilizing `requestAnimationFrame` and CSS transitions to ensure zero "jumping" during state handovers.
* **Stationary Cabinet Design:** The wheel spins while the 40-bulb chaser-light array and mechanical pointer remain fixed to the frame, just like the real set.
* **Modular "Aisle 3" Architecture:** Fully decoupled components for the Wheel, Scoreboard, Game Logs, and Controls.
* **AI Strategy Testing:** Built to test the "Wife's 65-Rule"—statistically analyzing whether staying on 0.65 is superior to the traditional 0.70 threshold.
* **Retro Glitz:** Features 70s-style gradients, metallic finishes, and animated chaser lights that pulse during spins.

## 🛠️ Technical Deep Dive: The "Teleport" Fix

One of the biggest challenges was syncing the visual CSS transition with the React state. When the wheel stops, the app performs a **Zero-Frame Reset**:
1.  The wheel calculates the `landedIndex` based on local variables to avoid closure staleness.
2.  `transitionEnabled` is toggled to `false`.
3.  A `requestAnimationFrame` hook snaps the `rotation` back to `0deg` while simultaneously updating the `topIndex` (the segment labels).
4.  The result: To the user, the wheel never moves, but the underlying data is perfectly reset for the next spin.

## 🚀 Installation

1.  **Clone the repo:**
    ```bash
    git clone [https://github.com/yourusername/big-wheel-sim.git](https://github.com/yourusername/big-wheel-sim.git)
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Spin the wheel:**
    ```bash
    npm run dev
    ```

## 📐 The Math

The wheel is divided into exactly 20 segments of **18°** each. 
$$Index = (\text{topIndex} + \text{steps}) \pmod{20}$$

The "Spin Again" logic is currently set to a manual toggle, allowing you to simulate different contestant strategies in real-time.

---
*Created with a touch of wit and a lot of grease.*
