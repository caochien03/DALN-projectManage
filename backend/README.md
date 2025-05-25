# Express.js Backend with MongoDB

This is a basic Express.js application with MongoDB integration.

## Prerequisites

-   Node.js (v14 or higher)
-   MongoDB (local installation or MongoDB Atlas account)

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file in the root directory with the following variables:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/myapp
```

3. Start the development server:

```bash
npm run dev
```

The server will start on http://localhost:5000

## Project Structure

-   `src/index.js` - Main application file
-   `.env` - Environment variables
-   `package.json` - Project dependencies and scripts
