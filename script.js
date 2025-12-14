// Game Configuration
const GAME_TICK_RATE = 2500; // 2.5 seconds (1 day)
const SAVE_KEY = 'landlord_tycoon_save_v7'; // Bump version for activity log
const AUTO_SAVE_INTERVAL = 30000; // 30 seconds

// Initial Game State
const initialState = {
    money: 10000,
    playerName: '',
    day: 1,
    jobs: { wage: 0, type: 'full-time' }, // { wage: number, type: 'full-time' | 'part-time' }
    properties: {}, // { id: count }
    stocks: {}, // { id: count }
    lands: {},
    cars: {},
    expenses: {} // { id: count }
};

// --- Data Definitions ---

const PROPERTY_TYPES = [
    { id: 'shack', name: 'Run-down Shack', cost: 500, income: 10, icon: '🏚️' },
    { id: 'apartment', name: 'Studio Apartment', cost: 2500, income: 60, icon: '🏢' },
    { id: 'house', name: 'Suburban House', cost: 10000, income: 250, icon: '🏡' },
    { id: 'condo', name: 'Luxury Condo', cost: 50000, income: 1400, icon: '🏙️' },
    { id: 'mall', name: 'Strip Mall', cost: 200000, income: 6000, icon: '🛍️' },
    { id: 'skyscraper', name: 'Office Tower', cost: 1000000, income: 35000, icon: '🌆' }
];

const STOCK_TYPES = [
    { id: 'tech', name: 'Tech Startups', cost: 100, income: 2, icon: '💻' },
    { id: 'energy', name: 'Green Energy', cost: 800, income: 20, icon: '⚡' },
    { id: 'retail', name: 'Retail Giants', cost: 3000, income: 80, icon: '🛒' },
    { id: 'finance', name: 'Global Banks', cost: 12000, income: 350, icon: '🏦' },
    { id: 'crypto', name: 'Crypto Coin', cost: 50000, income: 1500, icon: '🪙' }
];

const LAND_TYPES = [
    { id: 'plot', name: 'Small Plot', cost: 5000, income: 50, icon: '🌱' },
    { id: 'farm', name: 'Farmland', cost: 25000, income: 300, icon: '🚜' },
    { id: 'island', name: 'Private Island', cost: 500000, income: 8000, icon: '🏝️' }
];

const CAR_TYPES = [
    { id: 'sedan', name: 'Luxury Sedan', cost: 40000, income: 100, icon: '🚗' },
    { id: 'sports', name: 'Sports Car', cost: 120000, income: 400, icon: '🏎️' },
    { id: 'yacht', name: 'Super Yacht', cost: 2000000, income: 10000, icon: '🛥️' }
];

const EXPENSE_TYPES = [
    { id: 'tax', name: 'Tax Advisor', cost: 1000, expense: 50, icon: '📉' },
    { id: 'manager', name: 'Property Manager', cost: 5000, expense: 200, icon: '👩‍💼' },
    { id: 'security', name: 'Security Detail', cost: 15000, expense: 800, icon: '🛡️' },
    { id: 'club', name: 'Country Club', cost: 50000, expense: 2500, icon: '⛳' }
];

// Habits, Skills, Goals sections removed as they were part of Health


// Map category names to their data and state keys
const CATEGORIES = {
    'properties': { data: PROPERTY_TYPES, label: 'Real Estate' },
    'stocks': { data: STOCK_TYPES, label: 'Stock' },
    'lands': { data: LAND_TYPES, label: 'Land' },
    'cars': { data: CAR_TYPES, label: 'Car' },
    'expenses': { data: EXPENSE_TYPES, label: 'Expense' }
};

const THEME_ANIMATIONS = {
    'pinky': ['❤️', '💖', '💗', '💕', '💓'],
    'greeny': ['🍃', '🌿', '🌱', '🍀', '🌵'],
    'dark': ['⭐', '✨', '💫', '🌟', '🌙'],
    'cloudy': ['❄️', '🌨️', '⚪', '☁️', '🌫️']
};

let animationInterval = null;

// Runtime State
let state = { ...initialState };
let growthChart = null;
let currentChartRange = '30'; // 30, 180, 365, or 'all'

// DOM Elements
const els = {
    balance: document.getElementById('balance'),
    income: document.getElementById('income'),
    expense: document.getElementById('expense'),
    marketGrid: document.getElementById('market-grid'),
    stockGrid: document.getElementById('stock-grid'),
    landsGrid: document.getElementById('lands-grid'),
    landsGrid: document.getElementById('lands-grid'),
    carGrid: document.getElementById('car-grid'),
    expenseGrid: document.getElementById('expense-grid'),
    portfolioList: document.getElementById('portfolio-list'),
    notificationArea: document.getElementById('notification-area'),
    resetBtn: document.getElementById('reset-btn'),
    navLinks: document.querySelectorAll('.nav-link'),
    tabPanes: document.querySelectorAll('.tab-pane'),
    wageInput: document.getElementById('wage-input'),
    jobBtns: document.querySelectorAll('.job-btn'),
    dailySalary: document.getElementById('daily-salary'),
    playerNameInput: document.getElementById('player-name-input'),
    playerNameDisplay: document.getElementById('player-name-display'),
    timeDisplay: document.getElementById('time-display'),
    jobSection: document.getElementById('job-section'),
    minimizeJobBtn: document.getElementById('minimize-job-btn'),
    growthChartCanvas: document.getElementById('growthChart'),
    themeRadios: document.querySelectorAll('input[name="theme"]'),
    chartBtns: document.querySelectorAll('.chart-btn'),
    activityHeatmap: document.getElementById('activity-heatmap'),
    portfolioSection: document.getElementById('portfolio-section'),
    minimizePortfolioBtn: document.getElementById('minimize-portfolio-btn')
};

// --- Core Logic ---

function init() {
    setupEventListeners();
    initTheme();
    initChart();
    startGame();
}

function initTheme() {
    const savedTheme = localStorage.getItem('landlord_tycoon_theme') || 'default';
    setTheme(savedTheme);

    els.themeRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            setTheme(e.target.value);
        });
    });
}

function setTheme(theme) {
    document.body.setAttribute('data-theme', theme);
    const radio = document.querySelector(`input[name="theme"][value="${theme}"]`);
    if (radio) radio.checked = true;
    localStorage.setItem('landlord_tycoon_theme', theme);

    updateBackgroundAnimation(theme);
}

function updateBackgroundAnimation(theme) {
    stopAnimation();

    const particles = THEME_ANIMATIONS[theme];
    if (particles) {
        startAnimation(particles);
    }
}

function startAnimation(particles) {
    // Create initial batch so we don't wait for interval
    for (let i = 0; i < 15; i++) {
        createParticle(particles, true);
    }

    animationInterval = setInterval(() => {
        createParticle(particles);
    }, 400); // New particle every 400ms
}

function stopAnimation() {
    if (animationInterval) {
        clearInterval(animationInterval);
        animationInterval = null;
    }
    document.querySelectorAll('.bg-particle').forEach(el => el.remove());
}

function createParticle(particles, randomTop = false) {
    const particle = document.createElement('div');
    particle.className = 'bg-particle';
    particle.textContent = particles[Math.floor(Math.random() * particles.length)];

    // Random Position
    particle.style.left = Math.random() * 100 + 'vw';

    // If randomTop is true, start from random vertical position (for initial fill)
    // Otherwise start from top (-50px per CSS)
    if (randomTop) {
        particle.style.top = Math.random() * 100 + 'vh';
        // If starting in middle, we need to manually set animation duration/delay to make it look right?
        // Actually, CSS animation 'top' from -50px might conflict if we set top here.
        // Let's rely on CSS for movement. If we set top, the animation start point changes.
        // If we want them to *appear* scattered, we can just set top and NOT use the animation for the initial ones?
        // Or just let them fall from top. Simplest is creating them at top.
        // Let's skip randomTop logic complexity for now to ensure smooth fall behavior.
        // Instead, just loop fall.
        // Let's reset top to undefined so CSS takes over?
        // Wait, if I want immediate screen fill, I'd need to simulate they fell already.
        // That's complex with CSS animations.
        // Alternative: Start them at random 'animation-delay' negative values?
        // animation-delay: -5s; -> starts 5s into the animation

        const duration = Math.random() * 5 + 5; // 5-10s
        particle.style.animationDuration = duration + 's';
        particle.style.animationDelay = '-' + (Math.random() * duration) + 's';
    } else {
        particle.style.animationDuration = (Math.random() * 5 + 5) + 's'; // 5-10s fall
    }

    // Random Size
    const size = Math.random() * 1.5 + 1; // 1rem to 2.5rem
    particle.style.fontSize = size + 'rem';

    document.body.appendChild(particle);

    // Cleanup
    // Duration + small buffer
    const maxTime = 15000; // 15s max
    setTimeout(() => {
        if (particle.parentNode) particle.remove();
    }, maxTime);
}

function setupEventListeners() {
    // Balance Toggle (Focus Mode)
    const balanceContainer = document.getElementById('balance-container');
    const mainNav = document.getElementById('main-nav');
    const gameLayout = document.querySelector('.game-layout');

    if (balanceContainer) {
        balanceContainer.addEventListener('click', () => {
            if (mainNav) mainNav.classList.toggle('hidden-tabs');
            if (gameLayout) gameLayout.classList.toggle('hidden-tabs');
        });
    }

    // Tab Switching
    els.navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const tabId = link.getAttribute('data-tab');
            if (tabId === 'portfolio') return; // Should not happen as link is removed, but safe guard
            switchTab(tabId);
        });
    });

    // Reset Button
    els.resetBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to reset your progress? This cannot be undone.')) {
            resetGame();
        }
    });

    // Job Controls
    els.wageInput.addEventListener('input', (e) => {
        const wage = parseFloat(e.target.value) || 0;
        state.job.wage = wage;
        updateJobUI();
        saveGame();
    });

    els.jobBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const type = btn.getAttribute('data-type');
            state.job.type = type;
            updateJobUI();
            saveGame();
        });
    });

    // Player Name
    els.playerNameInput.addEventListener('input', (e) => {
        state.playerName = e.target.value;
        updateNameUI();
        saveGame();
    });

    // Generic Minimize Logic
    document.querySelectorAll('.minimize-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const btn = e.target;
            const panel = btn.closest('.panel');
            // If data-target exists, use it (for keeping old logic if needed, but here we can just target parent)
            // Or better, just toggle closest panel class.

            // The new buttons are inside .panel-header, which is inside .panel.
            // The job one has ID interaction, but we can make it generic too.

            if (panel) {
                panel.classList.toggle('minimized');
                btn.textContent = panel.classList.contains('minimized') ? '+' : '−';
            }
        });
    });

    // Portfolio minimize logic is now covered by the generic one above,
    // assuming we removed the specific ID listener or let it be redundant.
    // However, to avoid double toggle, we should remove the specific listeners.
    // Since I'm replacing the block, I'm removing the specific one.

    // Chart Controls
    els.chartBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            currentChartRange = btn.getAttribute('data-range');

            // Update UI
            els.chartBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            updateChart();
        });
    });
}

function switchTab(tabId) {
    // Update Nav
    els.navLinks.forEach(link => {
        if (link.getAttribute('data-tab') === tabId) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // Update Panes
    els.tabPanes.forEach(pane => {
        if (pane.id === `tab-${tabId}`) {
            pane.classList.add('active');
        } else {
            pane.classList.remove('active');
        }
    });
}

function resetGame() {
    localStorage.removeItem(SAVE_KEY);
    location.reload();
}

function startGame() {
    loadGame();
    logActivity(); // Log today's activity
    renderAllCategories();
    updateUI();
    updateJobUI();
    updateNameUI();
    updateTimeUI();
    // updateHealthUI removed
    updateChart();
    renderHeatmap();
    startGameLoop();
    startAutoSave();
}

function startGameLoop() {
    setInterval(() => {
        // Time Progress
        state.day++;
        updateTimeUI();
        logActivity(); // Log activity for the new day

        // Income
        const income = calculateTotalIncome();
        if (income > 0) {
            addMoney(income);
        }

        // Chart Update
        updateHistory();
        updateChart();

    }, GAME_TICK_RATE);
}

function startAutoSave() {
    setInterval(() => {
        saveGame();
    }, AUTO_SAVE_INTERVAL);
}

function calculateTotalExpense() {
    let total = 0;
    const stateObj = state.expenses;
    if (stateObj) {
        for (const [id, count] of Object.entries(stateObj)) {
            const item = EXPENSE_TYPES.find(i => i.id === id);
            if (item && item.expense) {
                total += item.expense * count;
            }
        }
    }
    return total;
}


function calculateJobIncome() {
    const hours = state.job.type === 'full-time' ? 8 : 4;
    return state.job.wage * hours;
}

function calculateTotalIncome() {
    let total = 0;

    // Asset Income
    for (const [key, info] of Object.entries(CATEGORIES)) {
        const stateObj = state[key];
        if (!stateObj) continue;

        for (const [id, count] of Object.entries(stateObj)) {
            const item = info.data.find(i => i.id === id);
            if (item && item.income) {
                total += item.income * count;
            }
        }
    }

    // Job Income
    total += calculateJobIncome();

    return total;
}

function addMoney(amount) {
    state.money += amount;
    updateUI();
}

function buyItem(categoryKey, itemId) {
    const info = CATEGORIES[categoryKey];
    const item = info.data.find(i => i.id === itemId);
    if (!item) return;

    if (state.money >= item.cost) {
        state.money -= item.cost;

        // Initialize category object if missing (safety check)
        if (!state[categoryKey]) state[categoryKey] = {};

        state[categoryKey][itemId] = (state[categoryKey][itemId] || 0) + 1;

        showNotification(`Purchased ${item.name} !`);
        playCelebrationAnimation();
        updateUI();
        saveGame();
    } else {
        showNotification("Not enough funds!", "error");
    }
}

// --- Chart Logic ---

function initChart() {
    const ctx = els.growthChartCanvas.getContext('2d');

    // Gradient for the line
    const gradient = ctx.createLinearGradient(0, 0, 0, 200);
    gradient.addColorStop(0, 'rgba(56, 189, 248, 0.5)');
    gradient.addColorStop(1, 'rgba(56, 189, 248, 0)');

    growthChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Net Worth',
                data: [],
                borderColor: '#38bdf8',
                backgroundColor: gradient,
                borderWidth: 2,
                pointRadius: 0,
                pointHoverRadius: 4,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    titleColor: '#94a3b8',
                    bodyColor: '#f8fafc',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderWidth: 1
                }
            },
            scales: {
                x: { display: false },
                y: {
                    display: false, // Hide Y axis for cleaner look
                    beginAtZero: true
                }
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            }
        }
    });
}

function updateHistory() {
    // Calculate Net Worth (Money + Asset Value)
    let netWorth = state.money;
    for (const [key, info] of Object.entries(CATEGORIES)) {
        const stateObj = state[key];
        if (!stateObj) continue;
        for (const [id, count] of Object.entries(stateObj)) {
            const item = info.data.find(i => i.id === id);
            if (item) {
                netWorth += item.cost * count;
            }
        }
    }

    state.history.push({ day: state.day, value: netWorth });

    // Keep history manageable (e.g., last 50 points for display)
    // We store all history in state for now, but could trim if needed.
    // For the chart, we might want to show all or a window.
}

function updateChart() {
    if (!growthChart) return;

    // Optimize: only take last 50 points if array is huge
    const dataPoints = state.history.slice(-50);

    growthChart.data.labels = dataPoints.map(p => `Day ${p.day}`);
    growthChart.data.datasets[0].data = dataPoints.map(p => p.value);
    growthChart.update('none'); // 'none' mode for performance
}

// --- Activity Heatmap Logic ---

function logActivity() {
    const today = new Date().toISOString().split('T')[0];
    state.activityLog[today] = true;
    saveGame();
    renderHeatmap(); // Re-render heatmap after logging activity
}

function renderHeatmap() {
    const container = els.activityHeatmap;
    if (!container) return;
    container.innerHTML = '';

    // Generate dates for the specific grid (e.g., last 84 days = 12 weeks * 7 days)
    const totalDays = 84;
    const today = new Date();

    // Create array of dates in reverse order (newest last)
    const dates = [];
    for (let i = totalDays - 1; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        dates.push(d.toISOString().split('T')[0]);
    }

    dates.forEach(dateStr => {
        const cell = document.createElement('div');
        cell.className = 'heatmap-cell';
        cell.setAttribute('data-date', dateStr);

        if (state.activityLog[dateStr]) {
            cell.classList.add('active');
        }

        container.appendChild(cell);
    });
}


// --- UI Functions ---

function formatMoney(amount) {
    return '$' + amount.toLocaleString();
}

function renderAllCategories() {
    renderCategory(PROPERTY_TYPES, els.marketGrid, 'properties');
    renderCategory(STOCK_TYPES, els.stockGrid, 'stocks');
    renderCategory(LAND_TYPES, els.landsGrid, 'lands');
    renderCategory(CAR_TYPES, els.carGrid, 'cars');
    renderCategory(EXPENSE_TYPES, els.expenseGrid, 'expenses');
}

function renderCategory(data, container, categoryKey) {
    if (!container) return;
    container.innerHTML = '';
    data.forEach(item => {
        const card = document.createElement('div');
        card.className = 'property-card';
        card.onclick = () => buyItem(categoryKey, item.id);

        let effectHtml = '';
        if (categoryKey === 'expenses') {
            effectHtml = `<div class="card-income expense">-${formatMoney(item.expense)}/day</div>`;
        } else {
            effectHtml = `<div class="card-income">+${formatMoney(item.income)}/day</div>`;
        }

        card.innerHTML = `
            <div class="card-icon">${item.icon}</div>
            <div class="card-title">${item.name}</div>
            <div class="card-cost">${formatMoney(item.cost)}</div>
            ${effectHtml}
        `;
        container.appendChild(card);
    });
}

function renderPortfolio() {
    els.portfolioList.innerHTML = '';
    let hasAssets = false;

    for (const [key, info] of Object.entries(CATEGORIES)) {
        const stateObj = state[key];
        if (!stateObj) continue;

        const ownedItems = Object.entries(stateObj);
        if (ownedItems.length > 0) hasAssets = true;

        ownedItems.forEach(([id, count]) => {
            const item = info.data.find(i => i.id === id);
            if (!item) return;
            createPortfolioItem(item, count, info.label);
        });
    }

    if (!hasAssets) {
        els.portfolioList.innerHTML = '<div class="empty-state">No assets owned yet. Start investing!</div>';
    }
}

function createPortfolioItem(asset, count, type) {
    const item = document.createElement('div');
    item.className = 'portfolio-item';

    // All items now have income, so simplify this
    let effectHtml = '';
    if (asset.expense) {
        effectHtml = `<div class="item-income expense">-${formatMoney(asset.expense * count)}/day</div>`;
    } else {
        effectHtml = `<div class="item-income">+${formatMoney(asset.income * count)}/day</div>`;
    }

    item.innerHTML = `
        <div class="item-info">
            <h4>${asset.icon} ${asset.name}</h4>
            <div class="item-count">${type} • Owned: ${count}</div>
        </div>
        ${effectHtml}
    `;
    els.portfolioList.appendChild(item);
}

function updateNameUI() {
    els.playerNameDisplay.textContent = state.playerName ? `• ${state.playerName}` : '';
    if (document.activeElement !== els.playerNameInput) {
        els.playerNameInput.value = state.playerName || '';
    }
}

function updateTimeUI() {
    const years = Math.floor(state.day / 365) + 1;
    const days = state.day % 365;
    els.timeDisplay.textContent = `Year ${years}, Day ${days}`;
}




function updateJobUI() {
    // Update Wage Input
    if (document.activeElement !== els.wageInput) {
        els.wageInput.value = state.job.wage || '';
    }

    // Update Type Buttons
    els.jobBtns.forEach(btn => {
        if (btn.getAttribute('data-type') === state.job.type) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Update Salary Display
    els.dailySalary.textContent = formatMoney(calculateJobIncome());

    // Trigger main UI update to reflect income change
    updateUI();
}

function updateUI() {
    els.balance.textContent = formatMoney(state.money);
    els.income.textContent = '+' + formatMoney(calculateTotalIncome()) + '/day';
    els.expense.textContent = '-' + formatMoney(calculateTotalExpense()) + '/day';


    renderPortfolio();

    // Update button states
    updateGridButtons(els.stockGrid, STOCK_TYPES, 'stocks');
    updateGridButtons(els.landsGrid, LAND_TYPES, 'lands');
    updateGridButtons(els.carGrid, CAR_TYPES, 'cars');
    updateGridButtons(els.expenseGrid, EXPENSE_TYPES, 'expenses');
}

function updateGridButtons(container, data, categoryKey) {
    if (!container) return;
    const cards = container.querySelectorAll('.property-card');
    data.forEach((item, index) => {
        if (cards[index]) {
            const costEl = cards[index].querySelector('.card-cost');
            // No special case for habits anymore, all items can be bought multiple times
            if (state.money < item.cost) {
                cards[index].classList.add('disabled');
            } else {
                cards[index].classList.remove('disabled');
            }
            // Restore cost text
            if (costEl) costEl.textContent = formatMoney(item.cost);
        }
    });
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

function playCelebrationAnimation() {
    const colors = ['#fbbf24', '#38bdf8', '#4ade80', '#f472b6', '#a78bfa'];

    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.top = -10 + 'px';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDuration = (Math.random() * 2 + 1) + 's';

        document.body.appendChild(confetti);

        setTimeout(() => {
            confetti.remove();
        }, 3000);
    }
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
            state = { ...initialState, ...parsed };

            // Ensure all category objects exist
            Object.keys(CATEGORIES).forEach(key => {
                if (!state[key]) state[key] = {};
            });
            // Ensure job object exists
            if (!state.job) state.job = { wage: 0, type: 'full-time' };
            if (!state.history) state.history = [];
            if (!state.day) state.day = 1;

            // if (!state.health) state.health = 50; // Removed
            if (!state.playerName) state.playerName = '';

            if (!state.activityLog) state.activityLog = {};

        } catch (e) {
            console.error("Failed to load save", e);
        }
    }
}

// Start
init();
