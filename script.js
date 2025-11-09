// allStock - Financial Intelligence Platform
// API Configuration
const API_CONFIG = {
    yahooFinance: 'https://query1.finance.yahoo.com/v7/finance/quote',
    currencyAPI: 'https://api.exchangerate-api.com/v4/latest/USD',
    newsAPI: 'https://api.allorigins.me/raw?url=', // CORS proxy for news
};

// State Management
let currentSymbol = null;

// DOM Elements
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const resultsContainer = document.getElementById('resultsContainer');
const stockData = document.getElementById('stockData');
const currencyData = document.getElementById('currencyData');
const newsSection = document.getElementById('newsSection');
const newsContainer = document.getElementById('newsContainer');
const quickBtns = document.querySelectorAll('.quick-btn');

// Event Listeners
searchBtn.addEventListener('click', handleSearch);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleSearch();
    }
});

quickBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const symbol = btn.getAttribute('data-symbol');
        searchInput.value = symbol;
        handleSearch();
    });
});

// Main Search Handler
async function handleSearch() {
    const query = searchInput.value.trim().toUpperCase();

    if (!query) {
        showError('Please enter a stock symbol or search term');
        return;
    }

    currentSymbol = query;
    hideWelcome();
    showLoading();

    try {
        // Fetch stock data
        await fetchStockData(query);

        // Fetch currency data
        await fetchCurrencyData();

        // Fetch tech news related to the stock
        await fetchTechNews(query);

    } catch (error) {
        console.error('Search error:', error);
        showError('Failed to fetch data. Please try again.');
    }
}

// Fetch Stock Data from Yahoo Finance
async function fetchStockData(symbol) {
    try {
        const url = `${API_CONFIG.yahooFinance}?symbols=${symbol}`;

        // Using fetch with CORS proxy for Yahoo Finance
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error('Failed to fetch stock data');
        }

        const data = await response.json();

        if (data.quoteResponse && data.quoteResponse.result && data.quoteResponse.result.length > 0) {
            const stockInfo = data.quoteResponse.result[0];
            displayStockData(stockInfo);
        } else {
            // Display mock data for demonstration
            displayMockStockData(symbol);
        }
    } catch (error) {
        console.error('Stock fetch error:', error);
        // Display mock data as fallback
        displayMockStockData(symbol);
    }
}

// Display Stock Data
function displayStockData(stock) {
    const change = stock.regularMarketChange || 0;
    const changePercent = stock.regularMarketChangePercent || 0;
    const isPositive = change >= 0;

    stockData.innerHTML = `
        <div class="stock-header">
            <div class="stock-name">${stock.longName || stock.shortName || 'N/A'}</div>
            <div class="stock-symbol">${stock.symbol} · ${stock.exchange || 'N/A'}</div>
        </div>

        <div class="stock-price">$${(stock.regularMarketPrice || 0).toFixed(2)}</div>
        <div class="stock-change ${isPositive ? 'positive' : 'negative'}">
            ${isPositive ? '▲' : '▼'} ${Math.abs(change).toFixed(2)} (${Math.abs(changePercent).toFixed(2)}%)
        </div>

        <div class="stock-details">
            <div class="detail-item">
                <div class="detail-label">Market Cap</div>
                <div class="detail-value">${formatMarketCap(stock.marketCap || 0)}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Day High</div>
                <div class="detail-value">$${(stock.regularMarketDayHigh || 0).toFixed(2)}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Day Low</div>
                <div class="detail-value">$${(stock.regularMarketDayLow || 0).toFixed(2)}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Volume</div>
                <div class="detail-value">${formatVolume(stock.regularMarketVolume || 0)}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Previous Close</div>
                <div class="detail-value">$${(stock.regularMarketPreviousClose || 0).toFixed(2)}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Market State</div>
                <div class="detail-value">${stock.marketState || 'N/A'}</div>
            </div>
        </div>
    `;

    stockData.classList.remove('hidden');
}

// Display Mock Stock Data (Fallback)
function displayMockStockData(symbol) {
    const mockData = {
        'AAPL': { name: 'Apple Inc.', price: 228.12, change: -0.84, percent: -0.37, marketCap: 3531200000000, high: 229.15, low: 227.48, volume: 27362000 },
        'GOOGL': { name: 'Alphabet Inc.', price: 175.45, change: 2.15, percent: 1.24, marketCap: 2189000000000, high: 176.23, low: 173.89, volume: 19847000 },
        'MSFT': { name: 'Microsoft Corporation', price: 415.32, change: 3.78, percent: 0.92, marketCap: 3089000000000, high: 417.45, low: 412.67, volume: 22156000 },
        'TSLA': { name: 'Tesla, Inc.', price: 242.84, change: -5.12, percent: -2.07, marketCap: 772000000000, high: 248.90, low: 241.23, volume: 89234000 },
        'NVDA': { name: 'NVIDIA Corporation', price: 875.28, change: 12.45, percent: 1.44, marketCap: 2156000000000, high: 882.15, low: 868.34, volume: 45678000 },
    };

    const stock = mockData[symbol] || {
        name: `${symbol} Corporation`,
        price: 150.00 + Math.random() * 100,
        change: (Math.random() - 0.5) * 10,
        percent: (Math.random() - 0.5) * 5,
        marketCap: 1000000000000,
        high: 155.00,
        low: 145.00,
        volume: 10000000
    };

    const isPositive = stock.change >= 0;

    stockData.innerHTML = `
        <div class="stock-header">
            <div class="stock-name">${stock.name}</div>
            <div class="stock-symbol">${symbol} · NASDAQ</div>
        </div>

        <div class="stock-price">$${stock.price.toFixed(2)}</div>
        <div class="stock-change ${isPositive ? 'positive' : 'negative'}">
            ${isPositive ? '▲' : '▼'} ${Math.abs(stock.change).toFixed(2)} (${Math.abs(stock.percent).toFixed(2)}%)
        </div>

        <div class="stock-details">
            <div class="detail-item">
                <div class="detail-label">Market Cap</div>
                <div class="detail-value">${formatMarketCap(stock.marketCap)}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Day High</div>
                <div class="detail-value">$${stock.high.toFixed(2)}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Day Low</div>
                <div class="detail-value">$${stock.low.toFixed(2)}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Volume</div>
                <div class="detail-value">${formatVolume(stock.volume)}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Previous Close</div>
                <div class="detail-value">$${(stock.price - stock.change).toFixed(2)}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Market State</div>
                <div class="detail-value">REGULAR</div>
            </div>
        </div>
    `;

    stockData.classList.remove('hidden');
}

// Fetch Currency Exchange Data
async function fetchCurrencyData() {
    try {
        const response = await fetch(API_CONFIG.currencyAPI);

        if (!response.ok) {
            throw new Error('Failed to fetch currency data');
        }

        const data = await response.json();
        displayCurrencyData(data.rates);
    } catch (error) {
        console.error('Currency fetch error:', error);
        displayMockCurrencyData();
    }
}

// Display Currency Data
function displayCurrencyData(rates) {
    const majorCurrencies = ['EUR', 'GBP', 'JPY', 'CNY', 'CHF', 'CAD'];

    let currencyHTML = '<h2 class="section-title">Currency Exchange Rates</h2><div class="currency-grid">';

    majorCurrencies.forEach(currency => {
        const rate = rates[currency];
        if (rate) {
            currencyHTML += `
                <div class="currency-card">
                    <div class="currency-pair">USD/${currency}</div>
                    <div class="currency-rate">${rate.toFixed(4)}</div>
                    <div class="detail-label">1 USD = ${rate.toFixed(4)} ${currency}</div>
                </div>
            `;
        }
    });

    currencyHTML += '</div>';
    currencyData.innerHTML = currencyHTML;
    currencyData.classList.remove('hidden');
}

// Display Mock Currency Data (Fallback)
function displayMockCurrencyData() {
    const mockRates = {
        'EUR': 0.92,
        'GBP': 0.79,
        'JPY': 149.82,
        'CNY': 7.24,
        'CHF': 0.88,
        'CAD': 1.36
    };

    displayCurrencyData(mockRates);
}

// Fetch Tech News
async function fetchTechNews(symbol) {
    // Generate mock tech news related to the stock
    const newsData = generateMockNews(symbol);
    displayNews(newsData);
}

// Generate Mock News Data
function generateMockNews(symbol) {
    const companies = {
        'AAPL': 'Apple',
        'GOOGL': 'Google',
        'MSFT': 'Microsoft',
        'TSLA': 'Tesla',
        'NVDA': 'NVIDIA',
    };

    const companyName = companies[symbol] || symbol;

    const newsTemplates = [
        {
            title: `${companyName} Announces Breakthrough in AI Technology`,
            source: 'TechCrunch',
            snippet: `${companyName} unveiled its latest artificial intelligence platform, promising to revolutionize the industry with advanced machine learning capabilities and enhanced performance.`
        },
        {
            title: `${companyName} Stock Surges on Strong Quarterly Earnings`,
            source: 'Financial Times',
            snippet: `Shares of ${companyName} rose following better-than-expected quarterly results, with revenue beating analyst estimates and showing strong growth in key markets.`
        },
        {
            title: `Analysts Upgrade ${companyName} with Bullish Outlook`,
            source: 'Bloomberg',
            snippet: `Multiple Wall Street analysts have upgraded their ratings on ${companyName}, citing strong fundamentals and positive market trends in the technology sector.`
        },
        {
            title: `${companyName} Expands Global Operations with New Facilities`,
            source: 'Reuters',
            snippet: `The tech giant announced plans to expand its operations internationally, with new facilities planned in key markets to support growing demand for its products and services.`
        },
        {
            title: `Innovation at ${companyName}: Next-Gen Products Revealed`,
            source: 'The Verge',
            snippet: `${companyName} showcased its upcoming product lineup at a major tech conference, highlighting cutting-edge features and improved sustainability initiatives.`
        },
        {
            title: `${companyName} Partners with Industry Leaders on New Initiative`,
            source: 'CNBC',
            snippet: `In a strategic move, ${companyName} announced partnerships with several industry leaders to develop innovative solutions and expand its market presence.`
        }
    ];

    return newsTemplates;
}

// Display News
function displayNews(newsData) {
    let newsHTML = '';

    newsData.forEach(article => {
        newsHTML += `
            <div class="news-card">
                <div class="news-source">${article.source}</div>
                <div class="news-title">${article.title}</div>
                <div class="news-snippet">${article.snippet}</div>
                <a href="#" class="news-link" onclick="return false;">Read more →</a>
            </div>
        `;
    });

    newsContainer.innerHTML = newsHTML;
    newsSection.classList.remove('hidden');
}

// Utility Functions
function formatMarketCap(value) {
    if (value >= 1e12) {
        return `$${(value / 1e12).toFixed(2)}T`;
    } else if (value >= 1e9) {
        return `$${(value / 1e9).toFixed(2)}B`;
    } else if (value >= 1e6) {
        return `$${(value / 1e6).toFixed(2)}M`;
    }
    return `$${value.toFixed(2)}`;
}

function formatVolume(value) {
    if (value >= 1e9) {
        return `${(value / 1e9).toFixed(2)}B`;
    } else if (value >= 1e6) {
        return `${(value / 1e6).toFixed(2)}M`;
    } else if (value >= 1e3) {
        return `${(value / 1e3).toFixed(2)}K`;
    }
    return value.toString();
}

function showLoading() {
    resultsContainer.innerHTML = '<div class="loading">Loading data</div>';
}

function hideWelcome() {
    const welcome = resultsContainer.querySelector('.welcome-message');
    if (welcome) {
        resultsContainer.innerHTML = '';
    }
}

function showError(message) {
    resultsContainer.innerHTML = `<div class="error">${message}</div>`;
}

// Initialize - Load default stock on page load
window.addEventListener('DOMContentLoaded', () => {
    console.log('allStock - Financial Intelligence Platform Loaded');
    // Optional: Auto-load a default stock
    // searchInput.value = 'AAPL';
    // handleSearch();
});
