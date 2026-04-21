// ============================
// CONFIGURAÇÕES E DADOS
// ============================

const CLASSES = {
    "Combatente": {
        vigor: 3,
        forca: 3,
        agilidade: 2,
        presenca: 1,
        intelecto: 0,
        pvBase: 20,
        pvPerLevel: 4,
        peBase: 2,
        pePerLevel: 2,
        sanBase: 12,
        sanPerLevel: 3,
        damagePerNEX: { sides: 6, count: 1, bonus: 0 },
        emoji: "⚔️"
    },
    "Especialista": {
        vigor: 2,
        forca: 1,
        agilidade: 2,
        presenca: 1,
        intelecto: 3,
        pvBase: 16,
        pvPerLevel: 3,
        peBase: 3,
        pePerLevel: 3,
        sanBase: 16,
        sanPerLevel: 4,
        damagePerNEX: { sides: 0, count: 0, bonus: 0 },
        emoji: "🔍"
    },
    "Ocultista": {
        vigor: 2,
        forca: 0,
        agilidade: 1,
        presenca: 3,
        intelecto: 3,
        pvBase: 12,
        pvPerLevel: 2,
        peBase: 4,
        pePerLevel: 4,
        sanBase: 20,
        sanPerLevel: 5,
        damagePerNEX: { sides: 8, count: 1, bonus: 0 },
        emoji: "🌙"
    }
};

const ENEMIES = {
    "blood-zombie": {
        name: "Zumbi de Sangue",
        vd: 20,
        pv: 45,
        damage: "1d6+5",
        emoji: "🧟"
    },
    "anarchic": {
        name: "Anárquico",
        vd: 20,
        pv: 45,
        damage: "1d6+5",
        emoji: "⚡"
    },
    "shade": {
        name: "Vulto",
        vd: 40,
        pv: 60,
        damage: "2d6",
        emoji: "👻"
    },
    "bestial-zombie": {
        name: "Zumbi de Sangue Bestial",
        vd: 100,
        pv: 200,
        damage: "2d10+5",
        emoji: "🧟‍♂️"
    },
    "uncontrolled-anarchic": {
        name: "Anárquico Descontrolado",
        vd: 120,
        pv: 120,
        damage: "4d12",
        emoji: "⚡"
    },
    "beheaded": {
        name: "Degolificada",
        vd: 320,
        pv: 850,
        damage: "8d8+20",
        emoji: "☠️"
    },
    "death-god": {
        name: "Deus da Morte",
        vd: 400,
        pv: 2000,
        damage: "5d10+50",
        emoji: "💀"
    }
};

const AGENT_NAMES = [
    "Lucas", "Ana", "Gabriel", "Marina", "Rafael", "Beatriz", "Felipe", "Isabela",
    "Diego", "Sophia", "Marcus", "Aurora", "Nyx", "Raven", "Shadow", "Nova"
];

// ============================
// ESTADO GLOBAL
// ============================

let gameState = {
    agents: [],
    enemy: null,
    grid: { width: 0, height: 0, cells: {} },
    cluesTotal: 0,
    cluesFound: 0,
    turn: 0,
    turnLog: [],
    missionActive: false,
    walls: [],
    cluePositions: [],
    agentPositions: {}
};

// ============================
// FUNÇÕES DE AGENTE
// ============================

function showAddAgentForm() {
    document.getElementById('customAgentForm').classList.remove('hidden');
    document.getElementById('randomAgentForm').classList.add('hidden');
}

function showRandomAgentForm() {
    document.getElementById('randomAgentForm').classList.remove('hidden');
    document.getElementById('customAgentForm').classList.add('hidden');
}

function closeAgentForm() {
    document.getElementById('customAgentForm').classList.add('hidden');
}

function closeRandomAgentForm() {
    document.getElementById('randomAgentForm').classList.add('hidden');
}

function addCustomAgent() {
    const name = document.getElementById('agentName').value.trim();
    const classType = document.getElementById('agentClass').value;
    const nex = parseInt(document.getElementById('agentNEX').value);

    if (!name || !classType || !nex || nex % 5 !== 0) {
        alert('Preencha todos os campos corretamente. NEX deve ser múltiplo de 5.');
        return;
    }

    const agent = createAgent(name, classType, nex);
    gameState.agents.push(agent);
    updateAgentsList();
    closeAgentForm();
    clearAgentForm();
}

function addRandomAgent() {
    const classType = document.getElementById('randomAgentClass').value;
    const maxNEX = parseInt(document.getElementById('randomAgentNEX').value);

    if (!maxNEX || maxNEX % 5 !== 0) {
        alert('Preencha o NEX corretamente. Deve ser múltiplo de 5.');
        return;
    }

    const randomClass = classType || Object.keys(CLASSES)[Math.floor(Math.random() * 3)];
    const randomNEX = Math.floor(Math.random() * (maxNEX / 5)) * 5 + 5;
    const randomName = AGENT_NAMES[Math.floor(Math.random() * AGENT_NAMES.length)];

    const agent = createAgent(randomName, randomClass, randomNEX);
    gameState.agents.push(agent);
    updateAgentsList();
    closeRandomAgentForm();
    clearRandomAgentForm();
}

function createAgent(name, classType, nex) {
    const classData = CLASSES[classType];
    const level = nex / 5;

    return {
        name: name,
        class: classType,
        nex: nex,
        level: level,
        attributes: {
            vigor: classData.vigor,
            forca: classData.forca,
            agilidade: classData.agilidade,
            presenca: classData.presenca,
            intelecto: classData.intelecto
        },
        pv: classData.pvBase + classData.vigor + (classData.pvPerLevel + classData.vigor) * (level - 1),
        pvMax: classData.pvBase + classData.vigor + (classData.pvPerLevel + classData.vigor) * (level - 1),
        pe: classData.peBase + classData.presenca + (classData.pePerLevel + classData.presenca) * (level - 1),
        peMax: classData.peBase + classData.presenca + (classData.pePerLevel + classData.presenca) * (level - 1),
        san: classData.sanBase + (classData.sanPerLevel) * (level - 1),
        sanMax: classData.sanBase + (classData.sanPerLevel) * (level - 1),
        alive: true,
        position: null
    };
}

function removeAgent(index) {
    gameState.agents.splice(index, 1);
    updateAgentsList();
}

function clearAgentForm() {
    document.getElementById('agentName').value = '';
    document.getElementById('agentClass').value = '';
    document.getElementById('agentNEX').value = '';
}

function clearRandomAgentForm() {
    document.getElementById('randomAgentClass').value = '';
    document.getElementById('randomAgentNEX').value = '';
}

function updateAgentsList() {
    const list = document.getElementById('agentsList');

    if (gameState.agents.length === 0) {
        list.innerHTML = '<p class="empty-state">Nenhum agente adicionado</p>';
        return;
    }

    list.innerHTML = gameState.agents
        .map((agent, index) => `
            <div class="agent-item">
                <div class="agent-info">
                    <div class="agent-name">${CLASSES[agent.class].emoji} ${agent.name}</div>
                    <div class="agent-details">
                        ${agent.class} | NEX ${agent.nex} | PV: ${agent.pv} | SAN: ${agent.san}
                    </div>
                </div>
                <button class="btn btn-remove" onclick="removeAgent(${index})">✕</button>
            </div>
        `)
        .join('');

    updateTotalNEX();
}

function updateTotalNEX() {
    const totalNEX = gameState.agents.reduce((sum, agent) => sum + agent.nex, 0);
    const requiredVD = document.getElementById('enemySelect').value
        ? ENEMIES[document.getElementById('enemySelect').value].vd
        : 0;

    const enemySelect = document.getElementById('enemySelect');
    if (requiredVD > 0) {
        const balanced = totalNEX === requiredVD;
        const status = balanced ? "✅ Balanceado" : `⚠️ NEX Total: ${totalNEX} (Requerido: ${requiredVD})`;
        enemySelect.title = status;
    }
}

// ============================
// FUNÇÕES DE GRID
// ============================

function updateGridType() {
    const gridType = document.querySelector('input[name="gridType"]:checked').value;
    const customOptions = document.getElementById('gridCustomOptions');

    if (gridType === 'custom') {
        customOptions.classList.remove('hidden');
    } else {
        customOptions.classList.add('hidden');
    }
}

function generateGridSize() {
    const gridType = document.querySelector('input[name="gridType"]:checked').value;

    if (gridType === 'random') {
        return {
            width: Math.floor(Math.random() * (12 - 5 + 1)) + 5,
            height: Math.floor(Math.random() * (12 - 5 + 1)) + 5
        };
    } else {
        const minSize = parseInt(document.getElementById('gridMin').value) || 5;
        const maxSize = parseInt(document.getElementById('gridMax').value) || 12;
        return {
            width: Math.floor(Math.random() * (maxSize - minSize + 1)) + minSize,
            height: Math.floor(Math.random() * (maxSize - minSize + 1)) + minSize
        };
    }
}

// ============================
// FUNÇÕES DE SIMULAÇÃO
// ============================

function startMission() {
    if (gameState.agents.length === 0) {
        alert('Adicione pelo menos um agente!');
        return;
    }

    const enemyKey = document.getElementById('enemySelect').value;
    if (!enemyKey) {
        alert('Selecione um inimigo!');
        return;
    }

    const totalNEX = gameState.agents.reduce((sum, agent) => sum + agent.nex, 0);
    const enemy = ENEMIES[enemyKey];

    if (totalNEX !== enemy.vd) {
        alert(`A soma do NEX dos agentes (${totalNEX}) deve ser igual ao VD do inimigo (${enemy.vd})!\n\nBalanceie os agentes ou o inimigo.`);
        return;
    }

    // Inicializar estado da missão
    gameState.enemy = {
        ...enemy,
        pvCurrent: enemy.pv,
        key: enemyKey
    };

    const gridSize = generateGridSize();
    gameState.grid = initializeGrid(gridSize.width, gridSize.height);
    gameState.cluesTotal = Math.floor(Math.random() * 3) + 2; // 2-4 pistas
    gameState.cluesFound = 0;
    gameState.turn = 0;
    gameState.turnLog = [];
    gameState.missionActive = true;

    // Posicionar elementos no grid
    placeElementsOnGrid();
    updateAgentPositions();

    // Mostrar painel de simulação
    document.getElementById('setupPanel').classList.add('hidden');
    document.getElementById('simulationPanel').classList.remove('hidden');
    document.getElementById('resultPanel').classList.add('hidden');

    updateSimulationDisplay();
}

function initializeGrid(width, height) {
    const grid = { width, height, cells: {} };

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const cellId = `${String.fromCharCode(65 + y)}${x + 1}`;
            grid.cells[cellId] = {
                x,
                y,
                type: 'empty',
                content: null
            };
        }
    }

    // Adicionar paredes aleatoriamente (15% de chance)
    const walls = [];
    Object.keys(grid.cells).forEach(cellId => {
        if (Math.random() < 0.15) {
            grid.cells[cellId].type = 'wall';
            walls.push(cellId);
        }
    });
    gameState.walls = walls;

    return grid;
}

function placeElementsOnGrid() {
    // Colocar agentes
    gameState.agents.forEach((agent, index) => {
        let randomCell;
        do {
            const cells = Object.keys(gameState.grid.cells);
            randomCell = cells[Math.floor(Math.random() * cells.length)];
        } while (gameState.grid.cells[randomCell].type === 'wall' || gameState.grid.cells[randomCell].content);

        gameState.grid.cells[randomCell].content = { type: 'agent', index };
        agent.position = randomCell;
        gameState.agentPositions[index] = randomCell;
    });

    // Colocar inimigo
    let randomCell;
    do {
        const cells = Object.keys(gameState.grid.cells);
        randomCell = cells[Math.floor(Math.random() * cells.length)];
    } while (gameState.grid.cells[randomCell].type === 'wall' || gameState.grid.cells[randomCell].content);

    gameState.grid.cells[randomCell].content = { type: 'enemy' };
    gameState.enemy.position = randomCell;

    // Colocar pistas
    gameState.cluePositions = [];
    for (let i = 0; i < gameState.cluesTotal; i++) {
        do {
            const cells = Object.keys(gameState.grid.cells);
            randomCell = cells[Math.floor(Math.random() * cells.length)];
        } while (gameState.grid.cells[randomCell].type === 'wall' || gameState.grid.cells[randomCell].content);

        gameState.grid.cells[randomCell].content = { type: 'clue', index: i };
        gameState.cluePositions.push(randomCell);
    }
}

function updateAgentPositions() {
    gameState.agents.forEach((agent, index) => {
        gameState.agentPositions[index] = agent.position;
    });
}

function executeTurn() {
    if (!gameState.missionActive) return;

    gameState.turn++;
    let turnSummary = `Turno ${gameState.turn}: `;

    // Agentes agem
    gameState.agents.forEach((agent, index) => {
        if (!agent.alive) return;

        const actions = [];

        // Investigação (Especialistas)
        if (agent.class === 'Especialista') {
            const currentCell = agent.position;
            const cellContent = gameState.grid.cells[currentCell].content;

            if (cellContent && cellContent.type === 'clue') {
                gameState.cluesFound++;
                gameState.grid.cells[currentCell].content = null;
                actions.push(`🔍 ${agent.name} encontrou uma pista!`);
            }
        }

        // Movimento
        const newPos = moveAgentRandomly(agent);
        if (newPos) {
            agent.position = newPos;
            gameState.agentPositions[index] = newPos;
            actions.push(`➡️ ${agent.name} se moveu para ${newPos}`);
        }

        // Dano ao inimigo se próximo
        if (isNearEnemy(agent)) {
            let damage = calculateDamage(agent);
            gameState.enemy.pvCurrent -= damage;
            actions.push(`⚔️ ${agent.name} causa ${damage} de dano!`);
        }

        // Perda de sanidade para Ocultistas
        if (agent.class === 'Ocultista') {
            const sanLoss = Math.floor(Math.random() * 3) + 1;
            agent.san = Math.max(0, agent.san - sanLoss);
            actions.push(`🌙 ${agent.name} perde ${sanLoss} de SAN (${agent.san}/${agent.sanMax})`);
        }

        turnSummary += actions.join('; ') + ' ';
    });

    // Inimigo ataca
    gameState.agents.forEach((agent, index) => {
        if (!agent.alive || !isNearEnemy(agent)) return;

        const damage = rollDamage(gameState.enemy.damage);
        agent.pv = Math.max(0, agent.pv - damage);

        if (agent.pv <= 0) {
            agent.alive = false;
            turnSummary += `💀 ${agent.name} foi derrotado! `;
        } else {
            turnSummary += `💢 ${agent.name} recebe ${damage} de dano (${agent.pv}/${agent.pvMax}) `;
        }
    });

    gameState.turnLog.push(turnSummary);

    // Verificar vitória/derrota
    if (gameState.enemy.pvCurrent <= 0) {
        endMission(true, `Vitória! O ${gameState.enemy.name} foi derrotado após ${gameState.turn} turnos!`);
    } else if (gameState.cluesFound >= gameState.cluesTotal) {
        endMission(true, `Vitória! Todas as pistas foram encontradas!`);
    } else if (gameState.agents.every(a => !a.alive)) {
        endMission(false, `Derrota! Todos os agentes foram derrotados.`);
    }

    updateSimulationDisplay();
}

function moveAgentRandomly(agent) {
    const [col, row] = parseCellId(agent.position);
    const directions = [
        { dx: 0, dy: 1, id: getCollumnLabel(row + 1) + col },
        { dx: 0, dy: -1, id: getCollumnLabel(row - 1) + col },
        { dx: 1, dy: 0, id: col + (row + 1) },
        { dx: -1, dy: 0, id: col + (row - 1) }
    ];

    const validMoves = directions.filter(dir => {
        const cellId = dir.id;
        if (!gameState.grid.cells[cellId]) return false;
        const cell = gameState.grid.cells[cellId];
        return cell.type !== 'wall' && !cell.content;
    });

    if (validMoves.length === 0) return null;

    const move = validMoves[Math.floor(Math.random() * validMoves.length)];
    const newCellId = move.id;

    // Transferir agente
    gameState.grid.cells[agent.position].content = null;
    gameState.grid.cells[newCellId].content = { type: 'agent', index: gameState.agents.indexOf(agent) };

    // Verificar pista na nova posição
    if (agent.class === 'Especialista') {
        if (gameState.grid.cells[newCellId].content && gameState.grid.cells[newCellId].content.type === 'clue') {
            gameState.cluesFound++;
            gameState.grid.cells[newCellId].content = { type: 'agent', index: gameState.agents.indexOf(agent) };
        }
    }

    return newCellId;
}

function parseCellId(cellId) {
    const col = cellId.charCodeAt(0) - 65;
    const row = parseInt(cellId.substring(1)) - 1;
    return [col, row];
}

function getCollumnLabel(col) {
    return String.fromCharCode(65 + col);
}

function isNearEnemy(agent) {
    const [aCol, aRow] = parseCellId(agent.position);
    const [eCol, eRow] = parseCellId(gameState.enemy.position);

    const distance = Math.abs(aCol - eCol) + Math.abs(aRow - eRow);
    return distance <= 1;
}

function calculateDamage(agent) {
    const classData = CLASSES[agent.class];
    const dicePerNEX = agent.nex / 10;

    if (agent.class === 'Combatente') {
        return rollMultipleDice(6, Math.floor(dicePerNEX)) + 5;
    } else if (agent.class === 'Ocultista') {
        return rollMultipleDice(8, Math.floor(dicePerNEX));
    }

    return 0;
}

function rollDamage(damageString) {
    const parts = damageString.match(/(\d+)d(\d+)(?:\+(\d+))?/);
    if (!parts) return 0;

    const count = parseInt(parts[1]);
    const sides = parseInt(parts[2]);
    const bonus = parseInt(parts[3]) || 0;

    return rollMultipleDice(sides, count) + bonus;
}

function rollMultipleDice(sides, count) {
    let total = 0;
    for (let i = 0; i < count; i++) {
        total += Math.floor(Math.random() * sides) + 1;
    }
    return total;
}

function endMission(victory, message) {
    gameState.missionActive = false;

    const resultTitle = document.getElementById('resultTitle');
    const resultMessage = document.getElementById('resultMessage');

    if (victory) {
        resultTitle.textContent = '🎉 VITÓRIA!';
        resultTitle.style.color = 'var(--green)';
    } else {
        resultTitle.textContent = '☠️ DERROTA!';
        resultTitle.style.color = 'var(--red)';
    }

    resultMessage.textContent = message;

    // Estatísticas finais
    const finalStats = document.getElementById('finalStats');
    finalStats.innerHTML = `
        <div class="stat-line">
            <span class="stat-label">Turnos Decorridos:</span>
            <span class="stat-value">${gameState.turn}</span>
        </div>
        <div class="stat-line">
            <span class="stat-label">Pistas Encontradas:</span>
            <span class="stat-value">${gameState.cluesFound}/${gameState.cluesTotal}</span>
        </div>
        <div class="stat-line">
            <span class="stat-label">Agentes Vivos:</span>
            <span class="stat-value">${gameState.agents.filter(a => a.alive).length}/${gameState.agents.length}</span>
        </div>
        <div class="stat-line">
            <span class="stat-label">Dano Causado ao Inimigo:</span>
            <span class="stat-value">${gameState.enemy.pv - gameState.enemy.pvCurrent}/${gameState.enemy.pv}</span>
        </div>
    `;

    document.getElementById('simulationPanel').classList.add('hidden');
    document.getElementById('resultPanel').classList.remove('hidden');
}

function returnToSetup() {
    gameState = {
        agents: [],
        enemy: null,
        grid: { width: 0, height: 0, cells: {} },
        cluesTotal: 0,
        cluesFound: 0,
        turn: 0,
        turnLog: [],
        missionActive: false,
        walls: [],
        cluePositions: [],
        agentPositions: {}
    };

    document.getElementById('setupPanel').classList.remove('hidden');
    document.getElementById('simulationPanel').classList.add('hidden');
    document.getElementById('resultPanel').classList.add('hidden');
}

// ============================
// FUNÇÕES DE EXIBIÇÃO
// ============================

function updateSimulationDisplay() {
    updateMap();
    updateAgentsStatus();
    updateEnemyStatus();
    updateMissionInfo();
}

function updateMap() {
    const mapContainer = document.getElementById('gameMap');
    mapContainer.innerHTML = '';

    const { width, height, cells } = gameState.grid;

    for (let y = 0; y < height; y++) {
        const row = document.createElement('div');
        row.className = 'map-row';

        for (let x = 0; x < width; x++) {
            const cellId = getCollumnLabel(y) + (x + 1);
            const cell = cells[cellId];

            const cellElement = document.createElement('div');
            cellElement.className = 'map-cell';

            if (cell.type === 'wall') {
                cellElement.classList.add('wall');
                cellElement.textContent = '█';
            } else if (cell.content) {
                if (cell.content.type === 'agent') {
                    const agent = gameState.agents[cell.content.index];
                    cellElement.classList.add('agent');
                    cellElement.textContent = agent.name[0];
                    cellElement.title = `${agent.name} (${agent.class})`;
                } else if (cell.content.type === 'enemy') {
                    cellElement.classList.add('enemy');
                    cellElement.textContent = '🔴';
                    cellElement.title = gameState.enemy.name;
                } else if (cell.content.type === 'clue') {
                    cellElement.classList.add('clue');
                    cellElement.textContent = '?';
                }
            } else {
                cellElement.classList.add('empty');
            }

            row.appendChild(cellElement);
        }

        mapContainer.appendChild(row);
    }
}

function updateAgentsStatus() {
    const list = document.getElementById('agentsStatusList');
    list.innerHTML = gameState.agents
        .map(agent => `
            <div class="agent-status-item">
                <div class="agent-status-name">${CLASSES[agent.class].emoji} ${agent.name[0]}-${agent.class[0]}</div>
                <div class="status-bar">
                    <div class="status-item">
                        <span class="status-label">PV:</span>
                        <span class="status-value">${agent.pv}/${agent.pvMax}</span>
                    </div>
                    <div class="status-item">
                        <span class="status-label">SAN:</span>
                        <span class="status-value">${agent.san}/${agent.sanMax}</span>
                    </div>
                    <div class="status-item">
                        <span class="status-label">Status:</span>
                        <span class="status-value">${agent.alive ? '✓ Vivo' : '✕ Morto'}</span>
                    </div>
                </div>
            </div>
        `)
        .join('');
}

function updateEnemyStatus() {
    const box = document.getElementById('enemyStatusBox');
    box.innerHTML = `
        <div class="enemy-status-item">
            <span class="enemy-status-label">${gameState.enemy.emoji} ${gameState.enemy.name}</span>
            <span class="enemy-status-value">PV: ${gameState.enemy.pvCurrent}/${gameState.enemy.pv}</span>
        </div>
    `;
}

function updateMissionInfo() {
    document.getElementById('currentTurn').textContent = gameState.turn;
    document.getElementById('cluesFound').textContent = gameState.cluesFound;
    document.getElementById('totalClues').textContent = gameState.cluesTotal;
    document.getElementById('enemyName').textContent = gameState.enemy.name;

    if (gameState.missionActive) {
        document.getElementById('missionStatus').textContent = '🔴 Em Andamento';
    } else {
        document.getElementById('missionStatus').textContent = '⏹️ Finalizada';
    }
}

function showTurnDetails() {
    const details = gameState.turnLog.slice(-5).join('\n');
    alert(`Últimos 5 Turnos:\n\n${details}`);
}

// ============================
// INICIALIZAÇÃO
// ============================

document.addEventListener('DOMContentLoaded', () => {
    updateAgentsList();
    document.querySelector('input[name="gridType"]').checked = true;
    updateGridType();
});

// Esconder painel de setup inicialmente
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('setupPanel').classList.remove('hidden');
    document.getElementById('simulationPanel').classList.add('hidden');
    document.getElementById('resultPanel').classList.add('hidden');
});
