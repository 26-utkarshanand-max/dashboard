from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import yfinance as yf
import pandas as pd
from typing import Dict, Any, Optional
from datetime import datetime

app = FastAPI(title="Financial Analysis API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/company")
async def get_company_financial_data(ticker: str) -> Dict[str, Any]:
    """
    Fetch financial statements and calculate key metrics for a given company ticker.
    
    Args:
        ticker: Company stock ticker symbol (e.g., 'AAPL', 'MSFT')
    
    Returns:
        JSON containing financial statements and calculated metrics
    """
    try:
        # Create yfinance Ticker object
        stock = yf.Ticker(ticker.upper())
        
        # Get stock info
        info = stock.info
        
        # Validate ticker exists
        if not info or 'symbol' not in info:
            raise HTTPException(status_code=404, detail=f"Ticker '{ticker}' not found")
        
        # Get financial statements
        income_statement = stock.financials.to_dict() if not stock.financials.empty else {}
        balance_sheet = stock.balance_sheet.to_dict() if not stock.balance_sheet.empty else {}
        cash_flow = stock.cashflow.to_dict() if not stock.cashflow.empty else {}
        
        # Extract key values from statements (most recent period)
        # Income Statement metrics
        net_income = None
        total_revenue = None
        gross_profit = None
        operating_income = None
        
        if income_statement:
            # Get the most recent column (latest financial data)
            latest_period = list(income_statement.keys())[0] if income_statement else None
            if latest_period:
                income_data = {k: v.get(latest_period) for k, v in income_statement.items()}
                net_income = income_data.get('Net Income')
                total_revenue = income_data.get('Total Revenue')
                gross_profit = income_data.get('Gross Profit')
                operating_income = income_data.get('Operating Income')
        
        # Balance Sheet metrics
        total_assets = None
        total_liabilities = None
        shareholders_equity = None
        current_assets = None
        current_liabilities = None
        
        if balance_sheet:
            latest_period = list(balance_sheet.keys())[0] if balance_sheet else None
            if latest_period:
                balance_data = {k: v.get(latest_period) for k, v in balance_sheet.items()}
                total_assets = balance_data.get('Total Assets')
                total_liabilities = balance_data.get('Total Liabilities Net Minority Interest')
                shareholders_equity = balance_data.get('Stockholders Equity') or balance_data.get('Total Equity Gross Minority Interest')
                current_assets = balance_data.get('Current Assets')
                current_liabilities = balance_data.get('Current Liabilities')
        
        # Cash Flow metrics
        operating_cash_flow = None
        free_cash_flow = None
        
        if cash_flow:
            latest_period = list(cash_flow.keys())[0] if cash_flow else None
            if latest_period:
                cash_data = {k: v.get(latest_period) for k, v in cash_flow.items()}
                operating_cash_flow = cash_data.get('Operating Cash Flow')
                free_cash_flow = cash_data.get('Free Cash Flow')
        
        # Calculate key financial metrics
        calculated_metrics = {}
        
        # Return on Equity (ROE) = Net Income / Shareholders' Equity
        if net_income and shareholders_equity and shareholders_equity != 0:
            calculated_metrics['roe'] = round((net_income / shareholders_equity) * 100, 2)
        else:
            calculated_metrics['roe'] = info.get('returnOnEquity', None)
            if calculated_metrics['roe']:
                calculated_metrics['roe'] = round(calculated_metrics['roe'] * 100, 2)
        
        # Return on Assets (ROA) = Net Income / Total Assets
        if net_income and total_assets and total_assets != 0:
            calculated_metrics['roa'] = round((net_income / total_assets) * 100, 2)
        else:
            calculated_metrics['roa'] = info.get('returnOnAssets', None)
            if calculated_metrics['roa']:
                calculated_metrics['roa'] = round(calculated_metrics['roa'] * 100, 2)
        
        # Profit Margin = Net Income / Total Revenue
        if net_income and total_revenue and total_revenue != 0:
            calculated_metrics['profit_margin'] = round((net_income / total_revenue) * 100, 2)
        else:
            calculated_metrics['profit_margin'] = info.get('profitMargins', None)
            if calculated_metrics['profit_margin']:
                calculated_metrics['profit_margin'] = round(calculated_metrics['profit_margin'] * 100, 2)
        
        # Gross Margin = Gross Profit / Total Revenue
        if gross_profit and total_revenue and total_revenue != 0:
            calculated_metrics['gross_margin'] = round((gross_profit / total_revenue) * 100, 2)
        else:
            calculated_metrics['gross_margin'] = info.get('grossMargins', None)
            if calculated_metrics['gross_margin']:
                calculated_metrics['gross_margin'] = round(calculated_metrics['gross_margin'] * 100, 2)
        
        # Operating Margin = Operating Income / Total Revenue
        if operating_income and total_revenue and total_revenue != 0:
            calculated_metrics['operating_margin'] = round((operating_income / total_revenue) * 100, 2)
        else:
            calculated_metrics['operating_margin'] = info.get('operatingMargins', None)
            if calculated_metrics['operating_margin']:
                calculated_metrics['operating_margin'] = round(calculated_metrics['operating_margin'] * 100, 2)
        
        # Current Ratio = Current Assets / Current Liabilities
        if current_assets and current_liabilities and current_liabilities != 0:
            calculated_metrics['current_ratio'] = round(current_assets / current_liabilities, 2)
        else:
            calculated_metrics['current_ratio'] = info.get('currentRatio', None)
        
        # Debt to Equity Ratio
        if total_liabilities and shareholders_equity and shareholders_equity != 0:
            calculated_metrics['debt_to_equity'] = round(total_liabilities / shareholders_equity, 2)
        else:
            calculated_metrics['debt_to_equity'] = info.get('debtToEquity', None)
            if calculated_metrics['debt_to_equity']:
                calculated_metrics['debt_to_equity'] = round(calculated_metrics['debt_to_equity'] / 100, 2)
        
        # Prepare response
        response = {
            "ticker": ticker.upper(),
            "company_name": info.get('longName', ticker.upper()),
            "sector": info.get('sector'),
            "industry": info.get('industry'),
            "timestamp": datetime.now().isoformat(),
            
            "financial_statements": {
                "income_statement": {
                    "net_income": net_income,
                    "total_revenue": total_revenue,
                    "gross_profit": gross_profit,
                    "operating_income": operating_income,
                },
                "balance_sheet": {
                    "total_assets": total_assets,
                    "total_liabilities": total_liabilities,
                    "shareholders_equity": shareholders_equity,
                    "current_assets": current_assets,
                    "current_liabilities": current_liabilities,
                },
                "cash_flow": {
                    "operating_cash_flow": operating_cash_flow,
                    "free_cash_flow": free_cash_flow,
                }
            },
            
            "key_metrics": {
                "net_income": net_income,
                "total_assets": total_assets,
                "shareholders_equity": shareholders_equity,
                "roe_percent": calculated_metrics.get('roe'),
                "roa_percent": calculated_metrics.get('roa'),
                "profit_margin_percent": calculated_metrics.get('profit_margin'),
                "gross_margin_percent": calculated_metrics.get('gross_margin'),
                "operating_margin_percent": calculated_metrics.get('operating_margin'),
                "current_ratio": calculated_metrics.get('current_ratio'),
                "debt_to_equity_ratio": calculated_metrics.get('debt_to_equity'),
            },
            
            "market_data": {
                "current_price": info.get('currentPrice'),
                "market_cap": info.get('marketCap'),
                "pe_ratio": info.get('trailingPE'),
                "pb_ratio": info.get('priceToBook'),
                "dividend_yield": info.get('dividendYield'),
                "52_week_high": info.get('fiftyTwoWeekHigh'),
                "52_week_low": info.get('fiftyTwoWeekLow'),
                "beta": info.get('beta'),
            },
            
            "analysis": {
                "description": info.get('longBusinessSummary'),
                "recommendation": info.get('recommendationKey'),
                "target_mean_price": info.get('targetMeanPrice'),
            }
        }
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching data: {str(e)}")


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "service": "Financial Analysis API"
    }


@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "Financial Analysis API",
        "version": "1.0.0",
        "endpoints": {
            "/company": "GET - Fetch company financial data (requires ticker parameter)",
            "/health": "GET - Health check",
            "/docs": "GET - Interactive API documentation",
        }
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
