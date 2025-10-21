import React, { useState } from 'react';
import './App.css';

// Helper formatters
const formatCurrency = (num) => {
  if (num === null || num === undefined || Number.isNaN(num)) return 'N/A';
  const n = Number(num);
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(2)}K`;
  return `$${n.toFixed(2)}`;
};

const formatPercent = (num) => {
  if (num === null || num === undefined || Number.isNaN(num)) return 'N/A';
  const n = Number(num);
  // backend may send values either 0-1 or 0-100; normalize if needed
  return `${Math.abs(n) <= 1 ? (n * 100).toFixed(2) : n.toFixed(2)}%`;
};

function App() {
  const [ticker, setTicker] = useState('AAPL');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Point to FastAPI backend /company endpoint
  const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8000';

  const fetchCompany = async (symbol) => {
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const url = `${API_BASE}/company?ticker=${encodeURIComponent(symbol)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json);
    } catch (e) {
      setError(e.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const sym = ticker.trim().toUpperCase();
    if (!sym) return;
    fetchCompany(sym);
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>Financial Dashboard</h1>
        <p>Analyze companies via FastAPI + Yahoo Finance</p>
      </header>

      <main className="main-content">
        <form className="ticker-form" onSubmit={onSubmit}>
          <div className="input-group">
            <input
              type="text"
              value={ticker}
              onChange={(e) => setTicker(e.target.value)}
              placeholder="Enter stock ticker (e.g., AAPL, MSFT)"
              className="ticker-input"
              disabled={loading}
            />
            <button className="analyze-btn" type="submit" disabled={loading}>
              {loading ? 'Loading…' : 'Analyze'}
            </button>
          </div>
        </form>

        {error && (
          <div className="error-message">{String(error)}</div>
        )}

        {data && (
          <div className="dashboard">
            {/* Header with price and change */}
            <section className="company-header">
              <h2>{data.company?.name || data.company_name || data.ticker}</h2>
              <div className="current-price">
                <span className="price">{formatCurrency(data.market_data?.current_price ?? data.current_price)}</span>
                {(() => {
                  const ch = data.market_data?.change_percent ?? data["1_month_change"];
                  if (ch === undefined || ch === null) return null;
                  const pct = Math.abs(ch) <= 1 ? ch * 100 : ch;
                  const cls = pct >= 0 ? 'positive' : 'negative';
                  const label = `${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%`;
                  return <span className={`change ${cls}`}>{label}</span>;
                })()}
              </div>
              <div className="subline">{data.ticker}</div>
            </section>

            {/* Market Overview */}
            <section className="card-grid">
              <div className="metric-card">
                <h3>Market Overview</h3>
                <div className="metric-item"><span className="label">Market Cap</span><span className="value">{formatCurrency(data.market_data?.market_cap ?? data.market_cap)}</span></div>
                <div className="metric-item"><span className="label">Volume</span><span className="value">{(data.market_data?.volume ?? data.volume)?.toLocaleString?.() || 'N/A'}</span></div>
                <div className="metric-item"><span className="label">Avg Volume</span><span className="value">{(data.market_data?.avg_volume ?? data.avg_volume)?.toLocaleString?.() || 'N/A'}</span></div>
                <div className="metric-item"><span className="label">Beta</span><span className="value">{data.key_metrics?.beta ?? data.beta ?? 'N/A'}</span></div>
              </div>

              <div className="metric-card">
                <h3>Valuation Ratios</h3>
                <div className="metric-item"><span className="label">P/E</span><span className="value">{data.key_metrics?.pe_ratio ?? data.pe_ratio ?? 'N/A'}</span></div>
                <div className="metric-item"><span className="label">P/B</span><span className="value">{data.key_metrics?.pb_ratio ?? data.pb_ratio ?? 'N/A'}</span></div>
                <div className="metric-item"><span className="label">Debt/Equity</span><span className="value">{data.key_metrics?.debt_to_equity ?? data.debt_to_equity ?? 'N/A'}</span></div>
              </div>

              <div className="metric-card">
                <h3>Profitability</h3>
                <div className="metric-item"><span className="label">ROE</span><span className="value">{data.key_metrics?.roe ? formatPercent(data.key_metrics.roe) : (data.roe ? formatPercent(data.roe) : 'N/A')}</span></div>
                <div className="metric-item"><span className="label">Profit Margin</span><span className="value">{data.key_metrics?.profit_margin ? formatPercent(data.key_metrics.profit_margin) : (data.profit_margin ? formatPercent(data.profit_margin) : 'N/A')}</span></div>
                <div className="metric-item"><span className="label">Revenue Growth</span><span className="value">{data.key_metrics?.revenue_growth ? formatPercent(data.key_metrics.revenue_growth) : (data.revenue_growth ? formatPercent(data.revenue_growth) : 'N/A')}</span></div>
                <div className="metric-item"><span className="label">Dividend Yield</span><span className="value">{data.key_metrics?.dividend_yield ? formatPercent(data.key_metrics.dividend_yield) : (data.dividend_yield ? formatPercent(data.dividend_yield) : 'N/A')}</span></div>
              </div>

              <div className="metric-card">
                <h3>52-Week Range</h3>
                <div className="metric-item"><span className="label">High</span><span className="value">{formatCurrency(data.market_data?.week_52_high ?? data["52_week_high"])}</span></div>
                <div className="metric-item"><span className="label">Low</span><span className="value">{formatCurrency(data.market_data?.week_52_low ?? data["52_week_low"])}</span></div>
                <div className="metric-item"><span className="label">Health Score</span><span className="value health-score">{data.analysis?.financial_health_score ?? data.financial_health_score ?? 'N/A'}</span></div>
              </div>
            </section>

            {/* Financial Statements */}
            {(data.financials || data.financial_statements) && (
              <section className="statements">
                <h3>Financial Statements</h3>
                <div className="statements-grid">
                  <div className="statement-card">
                    <h4>Income Statement (TTM)</h4>
                    <div className="metric-item"><span className="label">Revenue</span><span className="value">{formatCurrency(data.financials?.income_statement?.revenue ?? data.income_statement?.revenue)}</span></div>
                    <div className="metric-item"><span className="label">Gross Profit</span><span className="value">{formatCurrency(data.financials?.income_statement?.gross_profit ?? data.income_statement?.gross_profit)}</span></div>
                    <div className="metric-item"><span className="label">Net Income</span><span className="value">{formatCurrency(data.financials?.income_statement?.net_income ?? data.income_statement?.net_income)}</span></div>
                  </div>
                  <div className="statement-card">
                    <h4>Balance Sheet (MRQ)</h4>
                    <div className="metric-item"><span className="label">Total Assets</span><span className="value">{formatCurrency(data.financials?.balance_sheet?.total_assets ?? data.balance_sheet?.total_assets)}</span></div>
                    <div className="metric-item"><span className="label">Total Liabilities</span><span className="value">{formatCurrency(data.financials?.balance_sheet?.total_liabilities ?? data.balance_sheet?.total_liabilities)}</span></div>
                    <div className="metric-item"><span className="label">Shareholder Equity</span><span className="value">{formatCurrency(data.financials?.balance_sheet?.shareholder_equity ?? data.balance_sheet?.shareholder_equity)}</span></div>
                  </div>
                  <div className="statement-card">
                    <h4>Cash Flow (TTM)</h4>
                    <div className="metric-item"><span className="label">Operating CF</span><span className="value">{formatCurrency(data.financials?.cash_flow?.operating_cash_flow ?? data.cash_flow?.operating_cash_flow)}</span></div>
                    <div className="metric-item"><span className="label">Investing CF</span><span className="value">{formatCurrency(data.financials?.cash_flow?.investing_cash_flow ?? data.cash_flow?.investing_cash_flow)}</span></div>
                    <div className="metric-item"><span className="label">Financing CF</span><span className="value">{formatCurrency(data.financials?.cash_flow?.financing_cash_flow ?? data.cash_flow?.financing_cash_flow)}</span></div>
                  </div>
                </div>
              </section>
            )}

            {/* Simple price history summary if provided */}
            {(data.market_data?.price_history || data.price_history) && (
              <section className="chart-section">
                <h3>30-Day Price Summary</h3>
                {(() => {
                  const series = data.market_data?.price_history || data.price_history;
                  const low = Math.min(...series);
                  const high = Math.max(...series);
                  const latest = series[series.length - 1];
                  return (
                    <div className="chart-info">
                      <div>Low: {formatCurrency(low)}</div>
                      <div>High: {formatCurrency(high)}</div>
                      <div>Latest: {formatCurrency(latest)}</div>
                    </div>
                  );
                })()}
              </section>
            )}
          </div>
        )}
      </main>

      <footer className="app-footer">Powered by FastAPI + Yahoo Finance</footer>
    </div>
  );
}

export default App;
