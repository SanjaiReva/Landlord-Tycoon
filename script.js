// Game Configuration
const GAME_TICK_RATE = 2500; // 2.5 seconds (1 day)
const SAVE_KEY = 'landlord_tycoon_save_v7'; // Bump version for activity log
const AUTO_SAVE_INTERVAL = 30000; // 30 seconds

// Initial Game State
const initialState = {
    money: 10000,
    playerName: '',
    day: 1,
    health: 48000,
    history: [], // Array of { day, value }
    activityLog: {}, // { 'YYYY-MM-DD': true }
    job: { wage: 0, type: 'full-time' }, // { wage: number, type: 'full-time' | 'part-time' }
    properties: {}, // { id: count }
    stocks: {}, // { id: count }
    lands: {},
    cars: {},
    habits: {},
    skills: {},
    goals: {}
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

const HABIT_TYPES = [
    { id: 'reading', name: 'Reading', cost: 50, income: 1, icon: '📚' },
    { id: 'gym', name: 'Gym', cost: 200, income: 5, icon: '💪' },
    { id: 'meditation', name: 'Meditation', cost: 100, income: 3, icon: '🧘' }
];

const SKILL_TYPES = [
    { id: 'coding', name: 'Coding', cost: 1000, income: 20, icon: '💻' },
    { id: 'marketing', name: 'Marketing', cost: 3000, income: 70, icon: '📈' },
    { id: 'negotiation', name: 'Negotiation', cost: 8000, income: 200, icon: '🤝' }
];

const GOAL_TYPES = [
    { id: 'travel', name: 'World Travel', cost: 10000, income: 50, icon: '✈️' },
    { id: 'charity', name: 'Start Charity', cost: 50000, income: 300, icon: '❤️' },
    { id: 'legacy', name: 'Build Legacy', cost: 1000000, income: 5000, icon: '🏛️' }
];

// Map category names to their data and state keys
const CATEGORIES = {
    'properties': { data: PROPERTY_TYPES, label: 'Real Estate' },
    'stocks': { data: STOCK_TYPES, label: 'Stock' },
    'lands': { data: LAND_TYPES, label: 'Land' },
    'cars': { data: CAR_TYPES, label: 'Car' },
    'habits': { data: HABIT_TYPES, label: 'Habit' },
    'skills': { data: SKILL_TYPES, label: 'Skill' },
    'goals': { data: GOAL_TYPES, label: 'Goal' }
};

// Runtime State
let state = { ...initialState };
let growthChart = null;
let currentChartRange = '30'; // 30, 180, 365, or 'all'

// DOM Elements
const els = {
    balance: document.getElementById('balance'),
    income: document.getElementById('income'),
    marketGrid: document.getElementById('market-grid'),
    stockGrid: document.getElementById('stock-grid'),
    landsGrid: document.getElementById('lands-grid'),
    carGrid: document.getElementById('car-grid'),
    habitsGrid: document.getElementById('habits-grid'),
    skillsGrid: document.getElementById('skills-grid'),
    goalsGrid: document.getElementById('goals-grid'),
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
    healthBar: document.getElementById('health-bar'),
    healthValue: document.getElementById('health-value'),
    jobSection: document.getElementById('job-section'),
    minimizeJobBtn: document.getElementById('minimize-job-btn'),
    growthChartCanvas: document.getElementById('growthChart'),
    themeRadios: document.querySelectorAll('input[name="theme"]'),
    chartBtns: document.querySelectorAll('.chart-btn'),
    activityHeatmap: document.getElementById('activity-heatmap'),
    portfolioSection: document.getElementById('portfolio-section'),
    minimizePortfolioBtn: document.getElementById('minimize-portfolio-btn'),
    healthTrigger: document.getElementById('health-trigger'),
    healthMenu: document.getElementById('health-menu'),
    closeHealthMenu: document.getElementById('close-health-menu')
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

    // Health Menu Toggle
    if (els.healthTrigger && els.healthMenu) {
        els.healthTrigger.addEventListener('click', () => {
            els.healthMenu.classList.add('visible');
        });

        els.closeHealthMenu.addEventListener('click', () => {
            els.healthMenu.classList.remove('visible');
        });

        // Close on outside click
        els.healthMenu.addEventListener('click', (e) => {
            if (e.target === els.healthMenu) {
                els.healthMenu.classList.remove('visible');
            }
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

    // Minimize Job Section
    els.minimizeJobBtn.addEventListener('click', () => {
        els.jobSection.classList.toggle('minimized');
        els.minimizeJobBtn.textContent = els.jobSection.classList.contains('minimized') ? '+' : '−';
    });

    // Minimize Portfolio Section
    els.minimizePortfolioBtn.addEventListener('click', () => {
        els.portfolioSection.classList.toggle('minimized');
        els.minimizePortfolioBtn.textContent = els.portfolioSection.classList.contains('minimized') ? '+' : '−';
    });

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
    updateHealthUI();
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
    renderCategory(HABIT_TYPES, els.habitsGrid, 'habits');
    renderCategory(SKILL_TYPES, els.skillsGrid, 'skills');
    renderCategory(GOAL_TYPES, els.goalsGrid, 'goals');
}

function renderCategory(data, container, categoryKey) {
    if (!container) return;
    container.innerHTML = '';
    data.forEach(item => {
        const card = document.createElement('div');
        card.className = 'property-card';
        card.onclick = () => buyItem(categoryKey, item.id);

        let effectHtml = '';
        // All items now have income, so simplify this
        effectHtml = `<div class="card-income">+${formatMoney(item.income)}/day</div>`;

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
    let effectHtml = `<div class="item-income">+${formatMoney(asset.income * count)}/day</div>`;

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

function updateHealthUI() {
    const maxHealth = 100000;
    const health = Math.max(0, Math.min(maxHealth, state.health));
    const percentage = (health / maxHealth) * 100;

    els.healthBar.style.width = `${percentage}%`;
    els.healthValue.textContent = `${health} / ${maxHealth}`;

    // Dynamic color
    if (percentage < 50) {
        els.healthBar.style.background = '#ef4444'; // Red
    } else if (percentage < 80) {
        els.healthBar.style.background = '#f59e0b'; // Orange
    } else {
        els.healthBar.style.background = '#22c55e'; // Green
    }
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

    renderPortfolio();

    // Update button states
    updateGridButtons(els.marketGrid, PROPERTY_TYPES, 'properties');
    updateGridButtons(els.stockGrid, STOCK_TYPES, 'stocks');
    updateGridButtons(els.landsGrid, LAND_TYPES, 'lands');
    updateGridButtons(els.carGrid, CAR_TYPES, 'cars');
    updateGridButtons(els.habitsGrid, HABIT_TYPES, 'habits');
    updateGridButtons(els.skillsGrid, SKILL_TYPES, 'skills');
    updateGridButtons(els.goalsGrid, GOAL_TYPES, 'goals');
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
            if (!state.health) state.health = 50;
            if (!state.playerName) state.playerName = '';
            if (!state.activityLog) state.activityLog = {};

        } catch (e) {
            console.error("Failed to load save", e);
        }
    }
}

// Start
init();
