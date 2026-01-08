# DeepValueHunter

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- npm (comes with Node.js)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/MannyFigs/DeepValueHunter.git
   cd DeepValueHunter
   ```

2. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```

### Running the Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Accessing from Mobile (Same Network)

The dev server also exposes a network URL. Check the terminal output for something like:
```
Network: http://192.168.x.x:5173/
```

Use this URL to access the app from your phone (must be on the same WiFi network).

### Build for Production

```bash
npm run build
```

The built files will be in the `frontend/dist` folder.
