# Interactive3DWidget

A React component featuring an interactive 3D wood-textured cube built using Three.js and Vite.  
Users can rotate the cube by dragging or using touch gestures, with adjustable rotation speed.

---

## Table of Contents

- [Demo](#demo)
- [Features](#features)
- [Installation](#installation)
- [Running the Project](#running-the-project)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [WebGL Support](#webgl-support)
- [Troubleshooting](#troubleshooting)
- [Technologies](#technologies)
- [License](#license)

---

## Demo

Run the project locally and open it in your browser to see the interactive 3D cube in action.

---

## Features

- Interactive 3D cube with wood texture
- Drag or touch to rotate cube on X and Y axes
- Adjustable automatic rotation speed with slider
- Responsive canvas adapting to container size
- Loading spinner while 3D scene initializes
- Graceful fallback UI if WebGL is unsupported

---

## Installation

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher recommended)
- npm (comes bundled with Node.js) or yarn

### Steps

1. Clone the repository:

```bash
git clone <repository-url>
cd <repository-folder>
npm install
# or
yarn install
npm run dev
# or
yarn dev
http://localhost:5173
