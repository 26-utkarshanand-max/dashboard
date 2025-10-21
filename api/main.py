from flask import Flask, request, jsonify
from flask_cors import CORS
import yfinance as yf
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend requests

@app.route('/api/financial-analysis/<ticker>', methods=['GET'])
def get_financial_analysis(ticker):
    try:
        # Create yfinance Ticker object
        stock = yf.Ticker(ticker.upper())
        
        # Get stock info
        info = stock.info
        
        # Get financial statements
        income_stmt = stock.financials
        balance_sheet = stock.balance_sheet
        cash_flow = stock.cashflow
        
        # Get historical price data
        hist = stock.history(period="1y")
        
        # Calculate key financial ratios
        analysis = {
            'company_name': info.get('longName', ticker.upper()),
            'ticker': ticker.upper(),
            'current_price': info.get('currentPrice', 0),
            'market_cap': info.get('marketCap', 0),
            'pe_ratio': info.get('trailingPE', 0),
            'pb_ratio': info.get('priceToBook', 0),
            'debt_to_equity': info.get('debtToEquity', 0),
            'roe': info.get('returnOnEquity', 0),
            'revenue_growth': info.get('revenueGrowth', 0),
            'profit_margin': info.get('profitMargins', 0),
            'dividend_yield': info.get('dividendYield', 0),
            'beta': info.get('beta', 0),
            '52_week_high': info.get('fiftyTwoWeekHigh', 0),
            '52_week_low': info.get('fiftyTwoWeekLow', 0),
            'volume': info.get('volume', 0),
            'avg_volume': info.get('averageVolume', 0)
        }
        
        # Add recent performance data
        if not hist.empty:
            recent_close = hist['Close'].iloc[-1]
            month_ago_close = hist['Close'].iloc[-21] if len(hist) >= 21 else hist['Close'].iloc[0]
            
            analysis['1_month_change'] = ((recent_close - month_ago_close) / month_ago_close) * 100
            analysis['price_history'] = hist['Close'].tail(30).tolist()
            analysis['dates'] = hist.index.tail(30).strftime('%Y-%m-%d').tolist()
        
        # Financial health score (simple calculation)
        score = 0
        if analysis['pe_ratio'] and 0 < analysis['pe_ratio'] < 25: score += 1
        if analysis['pb_ratio'] and 0 < analysis['pb_ratio'] < 3: score += 1
        if analysis['debt_to_equity'] and analysis['debt_to_equity'] < 1: score += 1
        if analysis['roe'] and analysis['roe'] > 0.1: score += 1
        if analysis['profit_margin'] and analysis['profit_margin'] > 0.1: score += 1
        
        analysis['financial_health_score'] = f"{score}/5"
        
        return jsonify({
            'success': True,
            'data': analysis
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat()
    })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
