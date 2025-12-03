// Game Configuration
const GAME_TICK_RATE = 1000; // 1 second
const SAVE_KEY = 'landlord_tycoon_save_v2'; // Bump version to avoid conflicts

// Initial Game State
const initialState = {
    money: 1000,
    properties: {}, // { id: count }
    stocks: {} // { id: count }
};

// Property Definitions
const PROPERTY_TYPES = [
    { id: 'shack', name: 'Run-down Shack', cost: 500, income: 10, icon: '🏚️' },
    { id: 'apartment', name: 'Studio Apartment', cost: 2500, income: 60, icon: '🏢' },
    { id: 'house', name: 'Suburban House', cost: 10000, income: 250, icon: '🏡' },
    { id: 'condo', name: 'Luxury Condo', cost: 50000, income: 1400, icon: '🏙️' },
    { id: 'mall', name: 'Strip Mall', cost: 200000, income: 6000, icon: '🛍️' },
    { id: 'skyscraper', name: 'Office Tower', cost: 1000000, income: 35000, icon: '🌆' }
];

// Stock Definitions
const STOCK_TYPES = [
    { id: 'tech', name: 'Tech Startups', cost: 100, income: 2, icon: '💻' },
    { id: 'energy', name: 'Green Energy', cost: 800, income: 20, icon: '⚡' },
    { id: 'retail', name: 'Retail Giants', cost: 3000, income: 80, icon: '🛒' },
    { id: 'finance', name: 'Global Banks', cost: 12000, income: 350, icon: '🏦' },
    { id: 'crypto', name: 'Crypto Coin', cost: 50000, income: 1500, icon: '🪙' }
];

// Runtime State
let state = { ...initialState };

// DOM Elements
const els = {
    balance: document.getElementById('balance'),
    income: document.getElementById('income'),
    marketGrid: document.getElementById('market-grid'),
    stockGrid: document.getElementById('stock-grid'),
    portfolioList: document.getElementById('portfolio-list'),
    notificationArea: document.getElementById('notification-area'),
    loginOverlay: document.getElementById('login-overlay'),
    loginInput: document.getElementById('login-input'),
    loginBtn: document.getElementById('login-btn')
};

// --- Core Logic ---

function init() {
    // Setup Login Listeners
    els.loginBtn.onclick = attemptLogin;
    els.loginInput.onkeypress = (e) => {
        if (e.key === 'Enter') attemptLogin();
    };

    if (checkSession()) {
        startGame();
    }
}

function checkSession() {
    return sessionStorage.getItem('landlord_auth') === 'true';
}

function attemptLogin() {
    const key = els.loginInput.value;
    if (key === '123') {
        sessionStorage.setItem('landlord_auth', 'true');
        startGame();
    } else {
        showNotification('Invalid Access Key', 'error');
        els.loginInput.value = '';
        els.loginInput.focus();
    }
}

function startGame() {
    els.loginOverlay.classList.add('hidden');
    loadGame();
    renderMarket();
    renderStocks();
    updateUI();
    startGameLoop();
}

function startGameLoop() {
    setInterval(() => {
        const income = calculateTotalIncome();
        if (income > 0) {
            addMoney(income);
            // Optional: Visual feedback for income could go here
        }
    }, GAME_TICK_RATE);
}

function calculateTotalIncome() {
    let total = 0;
    // Property Income
    for (const [id, count] of Object.entries(state.properties)) {
        const prop = PROPERTY_TYPES.find(p => p.id === id);
        if (prop) {
            total += prop.income * count;
        }
    }
    // Stock Dividends
    for (const [id, count] of Object.entries(state.stocks)) {
        const stock = STOCK_TYPES.find(s => s.id === id);
        if (stock) {
            total += stock.income * count;
        }
    }
    return total;
}

function addMoney(amount) {
    state.money += amount;
    updateUI();
}

function buyProperty(propertyId) {
    const prop = PROPERTY_TYPES.find(p => p.id === propertyId);
    if (!prop) return;

    if (state.money >= prop.cost) {
        state.money -= prop.cost;
        state.properties[propertyId] = (state.properties[propertyId] || 0) + 1;

        // Increase cost slightly for next purchase (optional mechanic, keeping simple for now)
        // prop.cost = Math.ceil(prop.cost * 1.1); 

        showNotification(`Purchased ${prop.name}!`);
        updateUI();
        saveGame();
    } else {
        showNotification("Not enough funds!", "error");
    }
}

function buyStock(stockId) {
    const stock = STOCK_TYPES.find(s => s.id === stockId);
    if (!stock) return;

    if (state.money >= stock.cost) {
        state.money -= stock.cost;
        state.stocks[stockId] = (state.stocks[stockId] || 0) + 1;
        showNotification(`Invested in ${stock.name}!`);
        updateUI();
        saveGame();
    } else {
        showNotification("Not enough funds!", "error");
    }
}

// --- UI Functions ---

function formatMoney(amount) {
    return '$' + amount.toLocaleString();
}

function renderMarket() {
    els.marketGrid.innerHTML = '';
    PROPERTY_TYPES.forEach(prop => {
        const card = document.createElement('div');
        card.className = 'property-card';
        card.onclick = () => buyProperty(prop.id);
        card.innerHTML = `
            <div class="card-icon">${prop.icon}</div>
            <div class="card-title">${prop.name}</div>
            <div class="card-cost">${formatMoney(prop.cost)}</div>
            <div class="card-income">+${formatMoney(prop.income)}/s</div>
        `;
        els.marketGrid.appendChild(card);
    });
}

function renderStocks() {
    els.stockGrid.innerHTML = '';
    STOCK_TYPES.forEach(stock => {
        const card = document.createElement('div');
        card.className = 'property-card stock-card'; // Reuse style for now
        card.onclick = () => buyStock(stock.id);
        card.innerHTML = `
            <div class="card-icon">${stock.icon}</div>
            <div class="card-title">${stock.name}</div>
            <div class="card-cost">${formatMoney(stock.cost)}</div>
            <div class="card-income">+${formatMoney(stock.income)}/s</div>
        `;
        els.stockGrid.appendChild(card);
    });
}

function renderPortfolio() {
    els.portfolioList.innerHTML = '';
    const ownedProps = Object.entries(state.properties);
    const ownedStocks = Object.entries(state.stocks);

    if (ownedProps.length === 0 && ownedStocks.length === 0) {
        els.portfolioList.innerHTML = '<div class="empty-state">No assets owned yet. Start investing!</div>';
        return;
    }

    // Render Properties
    ownedProps.forEach(([id, count]) => {
        const prop = PROPERTY_TYPES.find(p => p.id === id);
        if (!prop) return;
        createPortfolioItem(prop, count, 'Property');
    });

    // Render Stocks
    ownedStocks.forEach(([id, count]) => {
        const stock = STOCK_TYPES.find(s => s.id === id);
        if (!stock) return;
        createPortfolioItem(stock, count, 'Stock');
    });
}

function createPortfolioItem(asset, count, type) {
    const item = document.createElement('div');
    item.className = 'portfolio-item';
    if (type === 'Stock') item.classList.add('stock-item');

    item.innerHTML = `
        <div class="item-info">
            <h4>${asset.icon} ${asset.name}</h4>
            <div class="item-count">${type} • Owned: ${count}</div>
        </div>
        <div class="item-income">+${formatMoney(asset.income * count)}/s</div>
    `;
    els.portfolioList.appendChild(item);
}

function updateUI() {
    els.balance.textContent = formatMoney(state.money);
    els.income.textContent = '+' + formatMoney(calculateTotalIncome()) + '/s';

    // Update Property button states
    const propCards = els.marketGrid.querySelectorAll('.property-card');
    PROPERTY_TYPES.forEach((prop, index) => {
        if (propCards[index]) {
            if (state.money < prop.cost) {
                propCards[index].classList.add('disabled');
            } else {
                propCards[index].classList.remove('disabled');
            }
        }
    });

    // Update Stock button states
    const stockCards = els.stockGrid.querySelectorAll('.property-card');
    STOCK_TYPES.forEach((stock, index) => {
        if (stockCards[index]) {
            if (state.money < stock.cost) {
                stockCards[index].classList.add('disabled');
            } else {
                stockCards[index].classList.remove('disabled');
            }
        }
    });

    renderPortfolio();
}

function showNotification(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    if (type === 'error') toast.style.borderColor = '#ef4444';

    els.notificationArea.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// --- Persistence ---

function saveGame() {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
}

function loadGame() {
    const saved = localStorage.getItem(SAVE_KEY);
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            // Merge with initial state to handle new fields (like stocks) if loading old save
            state = { ...initialState, ...parsed };
            if (!state.stocks) state.stocks = {};
        } catch (e) {
            console.error("Failed to load save", e);
        }
    }
}

// Start
init();
