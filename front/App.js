import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [ticker, setTicker] = useState('');
  const [financialData, setFinancialData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchFinancialData = async (symbol) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`http://localhost:5000/api/financial-analysis/${symbol}`);
      const data = await response.json();
      
      if (data.success) {
        setFinancialData(data.data);
      } else {
        setError(data.error || 'Failed to fetch data');
      }
    } catch (err) {
      setError('Failed to connect to backend API');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (ticker.trim()) {
      fetchFinancialData(ticker.trim().toUpperCase());
    }
  };

  const formatNumber = (num) => {
    if (!num) return 'N/A';
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
    return typeof num === 'number' ? `$${num.toFixed(2)}` : num;
  };

  const formatPercentage = (num) => {
    if (!num && num !== 0) return 'N/A';
    return `${(num * 100).toFixed(2)}%`;
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>Financial Dashboard</h1>
        <p>Analyze company financials with Yahoo Finance data</p>
      </header>

      <main className="main-content">
        <form onSubmit={handleSubmit} className="ticker-form">
          <div className="input-group">
            <input
              type="text"
              value={ticker}
              onChange={(e) => setTicker(e.target.value)}
              placeholder="Enter stock ticker (e.g., AAPL, MSFT, GOOGL)"
              className="ticker-input"
              disabled={loading}
            />
            <button type="submit" disabled={loading || !ticker.trim()} className="analyze-btn">
              {loading ? 'Analyzing...' : 'Analyze'}
            </button>
          </div>
        </form>

        {error && (
          <div className="error-message">
            <h3>Error</h3>
            <p>{error}</p>
          </div>
        )}

        {financialData && (
          <div className="dashboard">
            <div className="company-header">
              <h2>{financialData.company_name} ({financialData.ticker})</h2>
              <div className="current-price">
                <span className="price">{formatNumber(financialData.current_price)}</span>
                <span className={`change ${financialData['1_month_change'] >= 0 ? 'positive' : 'negative'}`}>
                  {financialData['1_month_change'] && financialData['1_month_change'] !== 'N/A' 
                    ? `${financialData['1_month_change'] >= 0 ? '+' : ''}${financialData['1_month_change'].toFixed(2)}%` 
                    : 'N/A'} (1M)
                </span>
              </div>
            </div>

            <div className="metrics-grid">
              <div className="metric-card">
                <h3>Market Overview</h3>
                <div className="metric-item">
                  <span className="label">Market Cap:</span>
                  <span className="value">{formatNumber(financialData.market_cap)}</span>
                </div>
                <div className="metric-item">
                  <span className="label">Volume:</span>
                  <span className="value">{financialData.volume?.toLocaleString() || 'N/A'}</span>
                </div>
                <div className="metric-item">
                  <span className="label">Avg Volume:</span>
                  <span className="value">{financialData.avg_volume?.toLocaleString() || 'N/A'}</span>
                </div>
                <div className="metric-item">
                  <span className="label">Beta:</span>
                  <span className="value">{financialData.beta || 'N/A'}</span>
                </div>
              </div>

              <div className="metric-card">
                <h3>Valuation Ratios</h3>
                <div className="metric-item">
                  <span className="label">P/E Ratio:</span>
                  <span className="value">{financialData.pe_ratio || 'N/A'}</span>
                </div>
                <div className="metric-item">
                  <span className="label">P/B Ratio:</span>
                  <span className="value">{financialData.pb_ratio || 'N/A'}</span>
                </div>
                <div className="metric-item">
                  <span className="label">Debt/Equity:</span>
                  <span className="value">{financialData.debt_to_equity || 'N/A'}</span>
                </div>
              </div>

              <div className="metric-card">
                <h3>Profitability</h3>
                <div className="metric-item">
                  <span className="label">ROE:</span>
                  <span className="value">{financialData.roe ? formatPercentage(financialData.roe) : 'N/A'}</span>
                </div>
                <div className="metric-item">
                  <span className="label">Profit Margin:</span>
                  <span className="value">{financialData.profit_margin ? formatPercentage(financialData.profit_margin) : 'N/A'}</span>
                </div>
                <div className="metric-item">
                  <span className="label">Revenue Growth:</span>
                  <span className="value">{financialData.revenue_growth ? formatPercentage(financialData.revenue_growth) : 'N/A'}</span>
                </div>
                <div className="metric-item">
                  <span className="label">Dividend Yield:</span>
                  <span className="value">{financialData.dividend_yield ? formatPercentage(financialData.dividend_yield) : 'N/A'}</span>
                </div>
              </div>

              <div className="metric-card">
                <h3>52-Week Range</h3>
                <div className="metric-item">
                  <span className="label">52W High:</span>
                  <span className="value">{formatNumber(financialData['52_week_high'])}</span>
                </div>
                <div className="metric-item">
                  <span className="label">52W Low:</span>
                  <span className="value">{formatNumber(financialData['52_week_low'])}</span>
                </div>
                <div className="metric-item">
                  <span className="label">Health Score:</span>
                  <span className="value health-score">{financialData.financial_health_score}</span>
                </div>
              </div>
            </div>

            {financialData.price_history && financialData.dates && (
              <div className="chart-section">
                <h3>30-Day Price History</h3>
                <div className="simple-chart">
                  <div className="chart-info">
                    <p>Price range over last 30 days:</p>
                    <span>Low: {formatNumber(Math.min(...financialData.price_history))}</span>
                    <span>High: {formatNumber(Math.max(...financialData.price_history))}</span>
                    <span>Latest: {formatNumber(financialData.price_history[financialData.price_history.length - 1])}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>Powered by Yahoo Finance API | Data delayed by 15-20 minutes</p>
      </footer>
    </div>
  );
}

export default App;
