# Financial Dashboard

A full-stack financial dashboard application that connects to Yahoo Finance to display real-time stock market data and company information.

## Overview

This project consists of:
- **Backend**: FastAPI server using yfinance for financial data
- **Frontend**: React application for interactive data visualization

## Features

- Real-time stock data from Yahoo Finance
- Company information and financial metrics
- Interactive dashboard interface
- RESTful API endpoints

## Project Structure

```
dashboard/
├── api/          # Backend (FastAPI + yfinance)
├── front/        # Frontend (React)
└── README.md     # This file
```

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd api
   ```

2. Install Python dependencies:
   ```bash
   pip install fastapi uvicorn yfinance
   ```
   
   Or if you have a requirements.txt:
   ```bash
   pip install -r requirements.txt
   ```

3. Run the FastAPI server:
   ```bash
   uvicorn main:app --reload
   ```
   
   The API will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd front
   ```

2. Install Node.js dependencies:
   ```bash
   npm install
   ```
   
   Required packages:
   - React
   - Axios (for API calls)
   - Other React dependencies

3. Start the development server:
   ```bash
   npm start
   ```
   
   The application will open at `http://localhost:3000`

## Running the Application

1. **Start the backend** (in one terminal):
   ```bash
   cd api
   uvicorn main:app --reload
   ```

2. **Start the frontend** (in another terminal):
   ```bash
   cd front
   npm start
   ```

3. Open your browser and navigate to `http://localhost:3000`

## API Endpoints

- `/company`: Get company information and stock data
- Additional endpoints as defined in the FastAPI backend

## Technologies Used

### Backend
- **Python 3.x**
- **FastAPI**: Modern, fast web framework for building APIs
- **yfinance**: Yahoo Finance API wrapper for financial data
- **Uvicorn**: ASGI server for running FastAPI

### Frontend
- **Node.js**
- **React**: JavaScript library for building user interfaces
- **Axios**: HTTP client for API requests

## Deployment

### Backend Deployment

1. Set up a Python environment on your server
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run with Uvicorn:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8000
   ```
   
   Or use a production ASGI server like Gunicorn:
   ```bash
   gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app
   ```

### Frontend Deployment

1. Build the React application:
   ```bash
   cd front
   npm run build
   ```

2. Deploy the `build` folder to:
   - Static hosting (Netlify, Vercel, GitHub Pages)
   - Cloud platforms (AWS S3, Google Cloud Storage)
   - Or serve with Nginx/Apache

### Environment Variables

Make sure to configure:
- API base URL in the frontend
- CORS settings in the backend
- Any API keys if required

## Development

- Backend API documentation available at `http://localhost:8000/docs` (FastAPI Swagger UI)
- Use `--reload` flag during development for auto-restart on code changes

## License

MIT License

## Author

26-utkarshanand-max
