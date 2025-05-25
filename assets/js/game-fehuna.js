/* 
 * Fehuna: Códigos Perdidos - Game Engine
 * Desenvolvido por Mikael Ferreira
 * Inspirado em Stardew Valley com elementos de RPG e programação
 */

class FehunaGame {
    constructor(canvasId) {
        // Inicialização do canvas e contexto
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        
        // Configurações responsivas
        this.setupCanvas();
        window.addEventListener('resize', () => this.setupCanvas());
        
        // Estado do jogo
        this.gameState = 'loading'; // loading, menu, playing, cutscene, battle
          // Jogador
        this.player = {
            x: 400,
            y: 300,
            width: 32,
            height: 48,
            speed: 3,
            direction: 'down',
            isMoving: false,
            animationFrame: 0,
            animationTick: 0,
            health: 100,
            maxHealth: 100,
            mana: 80,
            maxMana: 80,
            level: 1,
            experience: 0,
            nextLevelExp: 100,
            inventory: {
                'debugCodes': 5,
                'encryptionKey': 2,
                'firewall': 1,
                'antivirusPotion': 3
            },
            skills: {
                'scanVirus': { level: 1, available: true, manaCost: 5 },
                'encryptAttack': { level: 1, available: true, manaCost: 10 },
                'firewallShield': { level: 1, available: true, manaCost: 15 },
                'ddosStorm': { level: 0, available: false, manaCost: 20 },
                'sqlInjection': { level: 0, available: false, manaCost: 25 },
                'bruteForce': { level: 0, available: false, manaCost: 18 },
                'proxyCloak': { level: 0, available: false, manaCost: 12 },
                'systemRestore': { level: 0, available: false, manaCost: 20 },
                'antiMalwareScan': { level: 0, available: false, manaCost: 15 }
            }
        };
        
        // Controles
        this.keys = {};
        this.touchControls = {
            active: false,
            joystick: {
                startX: 0,
                startY: 0,
                moveX: 0,
                moveY: 0,
                active: false
            },
            buttons: {}
        };
        
        // Assets
        this.assets = {
            sprites: {},
            maps: {},
            sounds: {},
            loaded: 0,
            total: 0
        };
        
        // Mapa
        this.map = {
            width: 50,
            height: 50,
            tileSize: 32,
            offsetX: 0,
            offsetY: 0,
            currentMap: 'mainTown',
            layers: [] // Será preenchido ao carregar o mapa
        };
        
        // Sistema de combate
        this.battle = {
            active: false,
            enemy: null,
            turn: 'player', // player ou enemy
            selectedSkill: null,
            turnCounter: 0,
            animations: [],
            messages: []
        };
          // Sistema de UI
        this.ui = {
            mobile: window.innerWidth < 768,
            showMenu: false,
            showInventory: false,
            showSkills: false,
            showDialog: false,
            dialogText: '',
            dialogSpeaker: '',
            notifications: []
        };
          // NPCs do jogo
        this.npcs = [
            {
                id: 'professor_data',
                name: 'Professor Data',
                x: 300,
                y: 250,
                type: 'mentor',
                sprite: 'npc_professor',
                dialogues: [
                    'Bem-vindo ao mundo de Fehuna, jovem programador!',
                    'Aqui você aprenderá a usar o poder dos códigos em batalhas épicas.',
                    'Comece coletando Debug Codes e pratique suas habilidades básicas.',
                    'Lembre-se: scanVirus() revela as fraquezas dos inimigos!'
                ],
                currentDialogue: 0,
                questGiver: true,
                quest: {
                    id: 'tutorial_quest',
                    title: 'Primeiros Passos',
                    description: 'Colete 10 Debug Codes e pratique uma habilidade',
                    completed: false,
                    requirements: { debugCodes: 10, skillsUsed: 1 }
                }
            },
            {
                id: 'vendor_scripts',
                name: 'Vendedor de Scripts',
                x: 500,
                y: 200,
                type: 'vendor',
                sprite: 'npc_vendor',
                dialogues: [
                    'Tenho os melhores scripts da região!',
                    'Precisa de Encryption Keys? Eu tenho!',
                    'Firewalls de qualidade? Aqui é o lugar certo!',
                    'Que tipo de script você procura hoje?'
                ],
                currentDialogue: 0,
                shop: {
                    items: [
                        { name: 'encryptionKey', price: 50, stock: 5 },
                        { name: 'firewall', price: 100, stock: 3 },
                        { name: 'antivirusPotion', price: 30, stock: 10 }
                    ]
                }
            },
            {
                id: 'sage_algorithm',
                name: 'Sábio dos Algoritmos',
                x: 600,
                y: 350,
                type: 'sage',
                sprite: 'npc_sage',
                dialogues: [
                    'Os algoritmos antigos guardam segredos poderosos...',
                    'Domine as habilidades básicas e eu lhe ensinarei técnicas avançadas.',
                    'SQL Injection e DDoS Storm são apenas o começo.',
                    'Quando estiver pronto, procure-me novamente.'
                ],
                currentDialogue: 0,
                teachesSkills: ['ddosStorm', 'sqlInjection', 'systemRestore']
            },
            {
                id: 'guard_captain',
                name: 'Capitão da Guarda',
                x: 200,
                y: 400,
                type: 'guard',
                sprite: 'npc_guard',
                dialogues: [
                    'Os vírus têm atacado nossa cidade frequentemente.',
                    'Precisamos de programadores corajosos como você!',
                    'Se derrotar 5 vírus, eu lhe darei uma recompensa especial.',
                    'A segurança da cidade está em suas mãos!'
                ],
                currentDialogue: 0,
                bountyQuest: {
                    id: 'virus_hunt',
                    title: 'Caça aos Vírus',
                    description: 'Derrote 5 vírus para proteger a cidade',
                    virusDefeated: 0,
                    target: 5,
                    reward: { item: 'masterfirewall', quantity: 1 }
                }
            }
        ];
        
        // Sistema de tempo e clima
        this.timeSystem = {
            gameTime: 6 * 60, // Inicia às 6:00 (em minutos)
            daySpeed: 0.1, // Velocidade do tempo
            currentWeather: 'sunny', // sunny, cloudy, rainy
            weatherTimer: 0,
            weatherDuration: 300 // 5 minutos de jogo por clima
        };
        
        // Sistema de debug
        this.debug = {
            enabled: false,
            showFPS: false,
            showCollisions: false,
            lastFrameTime: performance.now(),
            fps: 0,
            frameCount: 0
        };
        
        // Inicialização
        this.setupEventListeners();
        this.loadAssets();
        
        // Sistema de inimigos mais avançado
        this.enemies = [
            {
                id: 'basic_virus',
                name: 'Vírus Básico',
                health: 30,
                maxHealth: 30,
                attack: 8,
                defense: 2,
                level: 1,
                experienceReward: 15,
                loot: [
                    { item: 'debugCodes', chance: 0.8, quantity: [1, 3] },
                    { item: 'antivirusPotion', chance: 0.3, quantity: 1 }
                ],
                weaknesses: ['scanVirus', 'antiMalwareScan'],
                resistances: [],
                skills: ['basicAttack'],
                sprite: 'enemy_virus_basic'
            },
            {
                id: 'trojan_horse',
                name: 'Cavalo de Tróia',
                health: 45,
                maxHealth: 45,
                attack: 12,
                defense: 5,
                level: 2,
                experienceReward: 25,
                loot: [
                    { item: 'encryptionKey', chance: 0.6, quantity: 1 },
                    { item: 'debugCodes', chance: 0.9, quantity: [2, 4] }
                ],
                weaknesses: ['encryptAttack', 'firewallShield'],
                resistances: ['bruteForce'],
                skills: ['deception', 'hiddenStrike'],
                sprite: 'enemy_trojan'
            },
            {
                id: 'spyware_scout',
                name: 'Spyware Espião',
                health: 25,
                maxHealth: 25,
                attack: 6,
                defense: 1,
                level: 1,
                experienceReward: 12,
                loot: [
                    { item: 'debugCodes', chance: 0.7, quantity: [1, 2] },
                    { item: 'privacyKey', chance: 0.4, quantity: 1 }
                ],
                weaknesses: ['scanVirus', 'proxyCloak'],
                resistances: ['ddosStorm'],
                skills: ['dataSteal', 'evade'],
                sprite: 'enemy_spyware'
            },
            {
                id: 'malware_boss',
                name: 'Malware Alpha',
                health: 80,
                maxHealth: 80,
                attack: 18,
                defense: 8,
                level: 4,
                experienceReward: 60,
                loot: [
                    { item: 'masterKey', chance: 1.0, quantity: 1 },
                    { item: 'encryptionKey', chance: 0.8, quantity: [2, 3] },
                    { item: 'firewall', chance: 0.7, quantity: 1 }
                ],
                weaknesses: ['systemRestore'],
                resistances: ['basicAttack', 'scanVirus'],
                skills: ['corruptData', 'systemOverload', 'virusDuplicate'],
                sprite: 'enemy_malware_boss',
                isBoss: true
            }
        ];
        
        // Sistema de spawning de inimigos
        this.enemySpawns = {
            lastSpawn: 0,
            spawnInterval: 15000, // 15 segundos
            maxEnemies: 3,
            currentEnemies: [],
            spawnZones: [
                { x: 100, y: 100, width: 200, height: 200, type: 'basic_virus' },
                { x: 700, y: 200, width: 150, height: 150, type: 'spyware_scout' },
                { x: 300, y: 500, width: 300, height: 200, type: 'trojan_horse' }
            ]
        };
        
        // Sistema de conquistas (achievements)
        this.achievements = {
            'first_battle': {
                name: 'Primeira Batalha',
                description: 'Vença sua primeira batalha',
                completed: false,
                reward: { experience: 20, item: 'debugCodes', quantity: 5 }
            },
            'skill_master': {
                name: 'Mestre das Habilidades',
                description: 'Use todas as habilidades básicas pelo menos uma vez',
                completed: false,
                progress: { scanVirus: false, encryptAttack: false, firewallShield: false },
                reward: { experience: 50, item: 'encryptionKey', quantity: 2 }
            },
            'virus_hunter': {
                name: 'Caçador de Vírus',
                description: 'Derrote 10 vírus',
                completed: false,
                progress: 0,
                target: 10,
                reward: { experience: 100, item: 'firewall', quantity: 1 }
            },
            'code_collector': {
                name: 'Colecionador de Códigos',
                description: 'Colete 50 Debug Codes',
                completed: false,
                progress: 0,
                target: 50,
                reward: { experience: 75, unlockSkill: 'ddosStorm' }
            },
            'master_programmer': {
                name: 'Programador Mestre',
                description: 'Alcance o nível 10',
                completed: false,
                reward: { experience: 200, item: 'masterKey', quantity: 1, unlockSkill: 'systemRestore' }
            }
        };
        
        // Sistema de estatísticas
        this.stats = {
            battlesWon: 0,
            enemiesDefeated: 0,
            skillsUsed: 0,
            itemsCollected: 0,
            distanceTraveled: 0,
            timePlayedMs: 0,
            startTime: Date.now(),
            deathCount: 0,
            questsCompleted: 0
        };
        
        // Sistema de save/load
        this.saveData = {
            lastSaved: null,
            autoSaveInterval: 30000, // Auto-save a cada 30 segundos
            saveSlots: 3
        };
        
        // Sistema de áudio
        this.audio = {
            enabled: true,
            musicVolume: 0.3,
            sfxVolume: 0.5,
            currentMusic: null,
            sounds: {},
            musicTracks: {
                'town': { src: 'assets/audio/town_theme.mp3', loop: true },
                'battle': { src: 'assets/audio/battle_theme.mp3', loop: true },
                'victory': { src: 'assets/audio/victory.mp3', loop: false },
                'ambient': { src: 'assets/audio/ambient.mp3', loop: true }
            },
            sfx: {
                'attack': 'assets/audio/sfx/attack.mp3',
                'heal': 'assets/audio/sfx/heal.mp3',
                'pickup': 'assets/audio/sfx/pickup.mp3',
                'menu_select': 'assets/audio/sfx/menu_select.mp3',
                'skill_cast': 'assets/audio/sfx/skill_cast.mp3',
                'enemy_hit': 'assets/audio/sfx/enemy_hit.mp3',
                'level_up': 'assets/audio/sfx/level_up.mp3'
            }
        };
        
        // Sistema de efeitos visuais avançados
        this.visualEffects = {
            particles: [],
            screenShake: { active: false, intensity: 0, duration: 0 },
            fadeEffects: { active: false, type: 'none', progress: 0 },
            weatherParticles: [],
            lightingSources: [
                { x: 400, y: 300, radius: 150, intensity: 0.3, color: '#ffff88' }
            ]
        };
        
        // Sistema de tutorial
        this.tutorial = {
            active: false,
            currentStep: 0,
            completed: false,
            steps: [
                {
                    title: 'Bem-vindo ao Fehuna!',
                    text: 'Use WASD ou as setas para mover-se pelo mundo.',
                    highlight: 'movement',
                    trigger: 'start'
                },
                {
                    title: 'Interação',
                    text: 'Pressione E perto de NPCs para conversar com eles.',
                    highlight: 'npcs',
                    trigger: 'near_npc'
                },
                {
                    title: 'Inventário',
                    text: 'Pressione I para abrir seu inventário e ver seus itens.',
                    highlight: 'inventory',
                    trigger: 'key_i'
                },
                {
                    title: 'Sistema de Combate',
                    text: 'Use as teclas 1-9 para selecionar habilidades durante batalhas.',
                    highlight: 'combat',
                    trigger: 'first_battle'
                },
                {
                    title: 'Coleta de Recursos',
                    text: 'Mova-se sobre itens para coletá-los automaticamente.',
                    highlight: 'collection',
                    trigger: 'first_pickup'
                }
            ]
        };
        
        // Sistema de configurações do jogo
        this.settings = {
            graphics: {
                quality: 'high', // low, medium, high
                showParticles: true,
                showShadows: true,
                showWeatherEffects: true
            },
            audio: {
                masterVolume: 1.0,
                musicVolume: 0.7,
                sfxVolume: 0.8,
                muteAll: false
            },
            controls: {
                keyBindings: {
                    'moveUp': ['ArrowUp', 'KeyW'],
                    'moveDown': ['ArrowDown', 'KeyS'],
                    'moveLeft': ['ArrowLeft', 'KeyA'],
                    'moveRight': ['ArrowRight', 'KeyD'],
                    'interact': ['KeyE'],
                    'inventory': ['KeyI'],
                    'menu': ['Escape']
                },
                mouseSensitivity: 1.0,
                touchEnabled: true
            },
            gameplay: {
                autoSave: true,
                tutorialEnabled: true,
                showTooltips: true,
                difficultyLevel: 'normal' // easy, normal, hard
            }
        };
        
        // Inicialização
        this.setupEventListeners();
        this.loadAssets();
    }
    
    // Configuração do canvas para ser responsivo
    setupCanvas() {
        // Verifica se é mobile
        this.ui.mobile = window.innerWidth < 768;
        
        // Define o tamanho do canvas
        const containerWidth = this.canvas.parentElement.clientWidth;
        const aspectRatio = 16/9;
        
        let canvasWidth = Math.min(containerWidth, 1000);
        let canvasHeight = canvasWidth / aspectRatio;
        
        // Configuração do tamanho real do canvas
        this.canvas.width = canvasWidth;
        this.canvas.height = canvasHeight;
        
        // Configuração do estilo para garantir que seja dimensionado corretamente
        this.canvas.style.width = `${canvasWidth}px`;
        this.canvas.style.height = `${canvasHeight}px`;
        
        // Configurar controles touch em dispositivos móveis
        if (this.ui.mobile) {
            this.setupTouchControls();
        }
    }
      // Configurar controles de touch para dispositivos móveis
    setupTouchControls() {
        this.touchControls.active = true;
    }
    
    // Carregar todos os assets necessários
    loadAssets() {
        this.gameState = 'loading';
        
        // Define o número total de assets para carregar
        this.assets.total = 5; // Reduzindo para carregamento mais rápido
        
        // Simula o carregamento de assets
        let loadingInterval = setInterval(() => {
            this.assets.loaded++;
            
            if (this.assets.loaded >= this.assets.total) {
                clearInterval(loadingInterval);
                this.initGame();
            }
        }, 100); // Carregamento mais rápido
    }
    
    // Inicializa o jogo após carregar todos os assets
    initGame() {
        // Inicializa o mapa, objetos do jogo, inimigos, etc.
        this.gameState = 'menu';
        this.startGameLoop();
    }
    
    // Configura os event listeners para teclado e touch
    setupEventListeners() {
        // Evento para teclas pressionadas
        window.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            this.handleKeyPress(e.key);
        });
        
        // Evento para teclas soltas
        window.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
        
        // Eventos touch para dispositivos móveis
        this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e));
        this.canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e));
    }
      // Manipulação de input específico
    handleKeyPress(key) {
        switch(key) {            case ' ':
            case 'Enter':
                if (this.gameState === 'menu') {
                    this.gameState = 'playing';
                } else if (this.gameState === 'battle' && this.battle.turn === 'player') {
                    this.executeBattleAction();
                } else if (this.ui.showDialog) {
                    this.advanceDialog();
                }
                break;            // Save/Load controls
            case 'F5':
                if (this.gameState === 'playing') {
                    this.saveGame(0);
                }
                break;
            case 'F9':
                if (this.gameState === 'playing') {
                    this.loadGame(0);
                }
                break;
            case 'F1':
                // Toggle help/controls
                this.ui.showHelp = !this.ui.showHelp;
                break;
            case 'Escape':
                if (this.gameState === 'playing') {
                    this.ui.showMenu = !this.ui.showMenu;
                } else if (this.gameState === 'battle') {
                    // Não permite fuga neste exemplo
                }
                break;
            case 'i':
            case 'I':
                if (this.gameState === 'playing') {
                    this.ui.showInventory = !this.ui.showInventory;
                }
                break;
            case 'e':
            case 'E':
                if (this.gameState === 'playing') {
                    this.checkNPCInteraction();
                }
                break;
            // Seleção de habilidades na batalha
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
            case '7':
            case '8':
            case '9':
                if (this.gameState === 'battle' && this.battle.turn === 'player') {
                    this.selectBattleSkill(parseInt(key) - 1);
                }
                break;
        }
    }
      // Selecionar habilidade na batalha
    selectBattleSkill(index) {
        const availableSkills = Object.entries(this.player.skills).filter(([name, skill]) => skill.available);
        if (index >= 0 && index < availableSkills.length) {
            this.battle.selectedSkill = availableSkills[index][0];
        }
    }
    
    // Obter descrição da habilidade
    getSkillDescription(skillName) {
        const descriptions = {
            'scanVirus': 'Revela fraquezas do inimigo',
            'encryptAttack': 'Ataque poderoso com dano elevado',
            'firewallShield': 'Reduz dano recebido em 50%',
            'ddosStorm': 'Múltiplos ataques de dano leve',
            'sqlInjection': 'Dano crítico com chance de bug',
            'bruteForce': 'Dano médio, quebra defesas',
            'proxyCloak': 'Aumenta chance de esquiva',
            'systemRestore': 'Cura uma parte da vida',
            'antiMalwareScan': 'Remove efeitos negativos'
        };
        return descriptions[skillName] || 'Habilidade especial';
    }
    
    // Manipulação de eventos touch
    handleTouchStart(e) {
        if (this.ui.mobile) {
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;
            
            // Verifica se o toque está na área do joystick
            if (y > this.canvas.height - 150 && x < 150) {
                this.touchControls.joystick.active = true;
                this.touchControls.joystick.startX = x;
                this.touchControls.joystick.startY = y;
            }
            
            // Implementar verificação para botões de ação
        }
    }
    
    handleTouchMove(e) {
        if (this.ui.mobile && this.touchControls.joystick.active) {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;
            
            this.touchControls.joystick.moveX = x - this.touchControls.joystick.startX;
            this.touchControls.joystick.moveY = y - this.touchControls.joystick.startY;
            
            // Limitar distância do joystick
            const distance = Math.sqrt(
                this.touchControls.joystick.moveX * this.touchControls.joystick.moveX + 
                this.touchControls.joystick.moveY * this.touchControls.joystick.moveY
            );
            
            if (distance > 50) {
                this.touchControls.joystick.moveX = (this.touchControls.joystick.moveX / distance) * 50;
                this.touchControls.joystick.moveY = (this.touchControls.joystick.moveY / distance) * 50;
            }
        }
    }
    
    handleTouchEnd(e) {
        if (this.ui.mobile) {
            this.touchControls.joystick.active = false;
            this.touchControls.joystick.moveX = 0;
            this.touchControls.joystick.moveY = 0;
        }
    }
    
    // Loop principal do jogo
    startGameLoop() {
        const gameLoop = () => {
            this.update();
            this.render();
            requestAnimationFrame(gameLoop);
        };
        
        gameLoop();
    }
    
    // Atualização do estado do jogo
    update() {
        switch (this.gameState) {
            case 'loading':
                // Lógica da tela de carregamento
                break;
                
            case 'menu':
                // Lógica do menu
                break;
                
            case 'playing':
                this.updatePlayer();
                this.checkCollisions();
                this.updateMap();
                break;
                
            case 'battle':
                this.updateBattle();
                break;
                
            case 'cutscene':
                this.updateCutscene();
                break;
        }
    }
    
    // Atualização do jogador
    updatePlayer() {
        const prevX = this.player.x;
        const prevY = this.player.y;
        
        // Verifica movimento por teclado
        if (this.keys['w'] || this.keys['ArrowUp']) {
            this.player.y -= this.player.speed;
            this.player.direction = 'up';
            this.player.isMoving = true;
        } else if (this.keys['s'] || this.keys['ArrowDown']) {
            this.player.y += this.player.speed;
            this.player.direction = 'down';
            this.player.isMoving = true;
        }
        
        if (this.keys['a'] || this.keys['ArrowLeft']) {
            this.player.x -= this.player.speed;
            this.player.direction = 'left';
            this.player.isMoving = true;
        } else if (this.keys['d'] || this.keys['ArrowRight']) {
            this.player.x += this.player.speed;
            this.player.direction = 'right';
            this.player.isMoving = true;
        }
        
        // Verifica movimento por joystick em dispositivos móveis
        if (this.ui.mobile && this.touchControls.joystick.active) {
            const jx = this.touchControls.joystick.moveX;
            const jy = this.touchControls.joystick.moveY;
            
            if (Math.abs(jx) > 10 || Math.abs(jy) > 10) {
                if (Math.abs(jx) > Math.abs(jy)) {
                    if (jx > 0) {
                        this.player.x += this.player.speed;
                        this.player.direction = 'right';
                    } else {
                        this.player.x -= this.player.speed;
                        this.player.direction = 'left';
                    }
                } else {
                    if (jy > 0) {
                        this.player.y += this.player.speed;
                        this.player.direction = 'down';
                    } else {
                        this.player.y -= this.player.speed;
                        this.player.direction = 'up';
                    }
                }
                this.player.isMoving = true;
            }
        }
        
        // Se não há teclas pressionadas, o jogador não está se movendo
        if (!this.keys['w'] && !this.keys['a'] && !this.keys['s'] && !this.keys['d'] && 
            !this.keys['ArrowUp'] && !this.keys['ArrowLeft'] && !this.keys['ArrowDown'] && !this.keys['ArrowRight'] &&
            !(this.ui.mobile && this.touchControls.joystick.active && 
              (Math.abs(this.touchControls.joystick.moveX) > 10 || Math.abs(this.touchControls.joystick.moveY) > 10))) {
            this.player.isMoving = false;
        }
        
        // Animação do jogador
        if (this.player.isMoving) {
            this.player.animationTick++;
            if (this.player.animationTick > 8) {
                this.player.animationFrame = (this.player.animationFrame + 1) % 4;
                this.player.animationTick = 0;
            }
        } else {
            this.player.animationFrame = 0;
        }
        
        // Verificar limites do mapa (implementação básica)
        if (this.player.x < 0) this.player.x = 0;
        if (this.player.y < 0) this.player.y = 0;
        if (this.player.x > this.map.width * this.map.tileSize - this.player.width) {
            this.player.x = this.map.width * this.map.tileSize - this.player.width;
        }
        if (this.player.y > this.map.height * this.map.tileSize - this.player.height) {
            this.player.y = this.map.height * this.map.tileSize - this.player.height;
        }
        
        // Atualizar o offset do mapa para centralizar o jogador
        this.updateMapOffset();
    }
    
    // Atualizar o offset do mapa para acompanhar o jogador
    updateMapOffset() {
        const centerX = this.canvas.width / 2 - this.player.width / 2;
        const centerY = this.canvas.height / 2 - this.player.height / 2;
        
        this.map.offsetX = centerX - this.player.x;
        this.map.offsetY = centerY - this.player.y;
        
        // Limitar o offset para não mostrar áreas fora do mapa
        if (this.map.offsetX > 0) this.map.offsetX = 0;
        if (this.map.offsetY > 0) this.map.offsetY = 0;
        
        const maxOffsetX = -((this.map.width * this.map.tileSize) - this.canvas.width);
        const maxOffsetY = -((this.map.height * this.map.tileSize) - this.canvas.height);
        
        if (this.map.offsetX < maxOffsetX) this.map.offsetX = maxOffsetX;
        if (this.map.offsetY < maxOffsetY) this.map.offsetY = maxOffsetY;
    }    // Checar colisões com outros objetos
    checkCollisions() {
        // Implementar verificação de colisão com o ambiente, NPCs e inimigos
        
        // Verificar colisão com eventos (inimigos, NPCs, etc.)
        const randomEncounter = Math.random() * 2000; // Reduzindo chance de combate
        if (this.player.isMoving && randomEncounter < 1) {
            this.startBattle();
        }
        
        // Verificar colisão com NPCs
        this.checkNPCProximity();
        
        // Verificar coleta de itens
        this.checkItemCollection();
    }
    
    // Verificar proximidade com NPCs
    checkNPCProximity() {
        this.npcs.forEach(npc => {
            const distance = Math.sqrt(
                Math.pow(this.player.x - npc.x, 2) + 
                Math.pow(this.player.y - npc.y, 2)
            );
            
            npc.isNear = distance < 60; // Distância para mostrar indicador de interação
        });
    }
    
    // Verificar interação com NPCs
    checkNPCInteraction() {
        this.npcs.forEach(npc => {
            if (npc.isNear) {
                this.startDialog(npc);
            }
        });
    }
      // Iniciar diálogo com NPC
    startDialog(npc) {
        this.ui.showDialog = true;
        this.ui.dialogSpeaker = npc.name;
        this.ui.dialogText = npc.dialogues[npc.currentDialogue];
        this.ui.currentNPC = npc;
    }
    
    // Avançar diálogo
    advanceDialog() {
        if (this.ui.currentNPC) {
            this.ui.currentNPC.currentDialogue++;
            
            if (this.ui.currentNPC.currentDialogue >= this.ui.currentNPC.dialogues.length) {
                // Fim do diálogo
                this.ui.showDialog = false;
                this.ui.currentNPC.currentDialogue = 0; // Reset para próxima conversa
                this.ui.currentNPC = null;
            } else {
                // Próxima linha
                this.ui.dialogText = this.ui.currentNPC.dialogues[this.ui.currentNPC.currentDialogue];
            }
        }
    }
    
    // Verificar coleta de itens no mundo
    checkItemCollection() {
        // Implementar coleta de recursos espalhados pelo mundo
        if (Math.random() < 0.001 && this.player.isMoving) {
            const items = ['debugCodes', 'encryptionKey', 'firewall'];
            const randomItem = items[Math.floor(Math.random() * items.length)];
            
            if (this.player.inventory[randomItem] !== undefined) {
                this.player.inventory[randomItem]++;
                this.showNotification(`+1 ${randomItem}`);
            }
        }
    }
    
    // Mostrar notificação
    showNotification(text) {
        this.ui.notifications.push({
            text: text,
            x: this.player.x + this.map.offsetX,
            y: this.player.y + this.map.offsetY - 20,
            life: 120,
            maxLife: 120
        });
    }    // Atualizar elementos do mapa
    updateMap() {
        // Atualizar sistema de tempo
        this.updateTimeSystem();
        
        // Atualizar NPCs, objetos animados, etc.
        
        // Atualizar notificações
        this.ui.notifications = this.ui.notifications.filter(notification => {
            notification.life--;
            notification.y -= 0.5; // Notificação sobe
            return notification.life > 0;
        });
    }
    
    // Atualizar sistema de tempo e clima
    updateTimeSystem() {
        this.timeSystem.gameTime += this.timeSystem.daySpeed;
        
        // Reset do dia (24 horas = 1440 minutos)
        if (this.timeSystem.gameTime >= 1440) {
            this.timeSystem.gameTime = 0;
        }
        
        // Atualizar clima
        this.timeSystem.weatherTimer++;
        if (this.timeSystem.weatherTimer >= this.timeSystem.weatherDuration) {
            this.timeSystem.weatherTimer = 0;
            
            // Trocar clima aleatoriamente
            const weathers = ['sunny', 'cloudy', 'rainy'];
            let newWeather;
            do {
                newWeather = weathers[Math.floor(Math.random() * weathers.length)];
            } while (newWeather === this.timeSystem.currentWeather);
            
            this.timeSystem.currentWeather = newWeather;
            this.showNotification(`Clima: ${newWeather}`);
        }
    }
    
    // Obter cor do céu baseado no horário
    getSkyColors() {
        const hour = Math.floor(this.timeSystem.gameTime / 60);
        const minute = this.timeSystem.gameTime % 60;
        const timePercent = (hour + minute / 60) / 24;
        
        // Cores para diferentes horários
        if (hour >= 6 && hour < 12) {
            // Manhã
            return {
                top: '#87CEEB',    // Azul claro
                middle: '#B0E0E6', // Azul pálido
                bottom: '#98FB98'  // Verde claro
            };
        } else if (hour >= 12 && hour < 18) {
            // Tarde
            return {
                top: '#4682B4',    // Azul aço
                middle: '#87CEEB', // Azul claro
                bottom: '#90EE90'  // Verde claro
            };
        } else if (hour >= 18 && hour < 20) {
            // Pôr do sol
            return {
                top: '#FF6347',    // Vermelho tomate
                middle: '#FFA500', // Laranja
                bottom: '#FFD700'  // Dourado
            };
        } else {
            // Noite
            return {
                top: '#191970',    // Azul meia-noite
                middle: '#2F4F4F', // Cinza escuro
                bottom: '#4B0082'  // Índigo
            };
        }
    }
    
    // Atualizar o sistema de batalha
    updateBattle() {
        if (!this.battle.active) return;
        
        // Processar animações de batalha
        if (this.battle.animations.length > 0) {
            // Processar a animação atual
            const currentAnimation = this.battle.animations[0];
            currentAnimation.ticks++;
            
            if (currentAnimation.ticks >= currentAnimation.duration) {
                this.battle.animations.shift();
                this.processBattleStep();
            }
        }
        
        // Se é a vez do inimigo e não há animações pendentes
        if (this.battle.turn === 'enemy' && this.battle.animations.length === 0) {
            this.enemyBattleTurn();
        }
    }
    
    // Iniciar uma batalha
    startBattle() {
        this.gameState = 'battle';
        
        // Criar um inimigo com base no nível do jogador
        this.battle.enemy = {
            name: 'MalByte Virus',
            health: 50 + this.player.level * 10,
            maxHealth: 50 + this.player.level * 10,
            attack: 5 + this.player.level * 2,
            defense: 3 + this.player.level,
            level: this.player.level,
            skills: ['virusAttack', 'dataCorruption']
        };
        
        this.battle.active = true;
        this.battle.turn = 'player';
        this.battle.animations = [];
        this.battle.messages = ['Um MalByte Virus apareceu!'];
        this.battle.turnCounter = 0;
    }
      // Executar ação de batalha selecionada pelo jogador
    executeBattleAction() {
        if (!this.battle.selectedSkill) {
            this.battle.selectedSkill = 'encryptAttack'; // Skill padrão
        }
        
        // Verificar se tem mana suficiente
        const skill = this.player.skills[this.battle.selectedSkill];
        if (skill && skill.manaCost && this.player.mana < skill.manaCost) {
            this.battle.messages.push('Mana insuficiente!');
            return;
        }
        
        // Consumir mana
        if (skill && skill.manaCost) {
            this.player.mana -= skill.manaCost;
            if (this.player.mana < 0) this.player.mana = 0;
        }
        
        // Aplicar a habilidade selecionada
        let damage = 0;
        let message = '';
        
        switch (this.battle.selectedSkill) {
            case 'scanVirus':
                message = 'Você usou scanVirus()! Fraquezas do inimigo reveladas!';
                this.battle.enemy.weaknessRevealed = true;
                // Próximos ataques causam +50% de dano
                this.battle.enemy.vulnerable = true;
                break;
                
            case 'encryptAttack':
                damage = 15 + Math.floor(Math.random() * 10);
                if (this.battle.enemy.vulnerable) {
                    damage = Math.floor(damage * 1.5);
                    message = `Você usou encryptAttack()! DANO CRÍTICO! Causou ${damage} de dano!`;
                } else {
                    message = `Você usou encryptAttack()! Causou ${damage} de dano!`;
                }
                this.battle.enemy.health -= damage;
                break;
                
            case 'firewallShield':
                this.player.defenseBoost = 10;
                this.player.defenseBoostTurns = 3;
                message = 'Você usou firewallShield()! Sua defesa aumentou por 3 turnos!';
                break;
                
            case 'ddosStorm':
                // Múltiplos ataques pequenos
                let totalDamage = 0;
                for (let i = 0; i < 4; i++) {
                    const hitDamage = 3 + Math.floor(Math.random() * 5);
                    totalDamage += hitDamage;
                }
                this.battle.enemy.health -= totalDamage;
                message = `Você usou ddosStorm()! 4 ataques causaram ${totalDamage} de dano total!`;
                break;
                
            case 'sqlInjection':
                damage = 20 + Math.floor(Math.random() * 15);
                this.battle.enemy.health -= damage;
                // Chance de aplicar efeito de "bug"
                if (Math.random() < 0.4) {
                    this.battle.enemy.bugged = true;
                    this.battle.enemy.buggedTurns = 2;
                    message = `Você usou sqlInjection()! Causou ${damage} de dano e bugou o inimigo!`;
                } else {
                    message = `Você usou sqlInjection()! Causou ${damage} de dano!`;
                }
                break;
                
            case 'systemRestore':
                const healAmount = 25 + Math.floor(Math.random() * 15);
                this.player.health += healAmount;
                if (this.player.health > this.player.maxHealth) {
                    this.player.health = this.player.maxHealth;
                }
                message = `Você usou systemRestore()! Recuperou ${healAmount} de vida!`;
                break;
                
            // Outras habilidades seriam implementadas aqui
        }
        
        // Adicionar mensagem e animação
        this.battle.messages.push(message);
        this.battle.animations.push({
            type: 'skill',
            skill: this.battle.selectedSkill,
            ticks: 0,
            duration: 60
        });
        
        // Verificar se o inimigo foi derrotado
        if (this.battle.enemy.health <= 0) {
            this.battle.enemy.health = 0;
            this.endBattle(true);
            return;
        }
        
        // Mudar para o turno do inimigo após a animação
        this.battle.turn = 'enemy';
    }
    
    // Turno do inimigo na batalha
    enemyBattleTurn() {
        // O inimigo escolhe uma habilidade aleatória
        const skillIndex = Math.floor(Math.random() * this.battle.enemy.skills.length);
        const enemySkill = this.battle.enemy.skills[skillIndex];
        
        let damage = 0;
        let message = '';
        
        switch (enemySkill) {
            case 'virusAttack':
                damage = this.battle.enemy.attack + Math.floor(Math.random() * 5);
                if (this.player.defenseBoost) {
                    damage = Math.max(1, damage - this.player.defenseBoost);
                    this.player.defenseBoost = 0;
                }
                this.player.health -= damage;
                message = `MalByte Virus usou Virus Attack! Você sofreu ${damage} de dano!`;
                break;
                
            case 'dataCorruption':
                damage = this.battle.enemy.attack - 2 + Math.floor(Math.random() * 8);
                if (this.player.defenseBoost) {
                    damage = Math.max(1, damage - this.player.defenseBoost);
                    this.player.defenseBoost = 0;
                }
                this.player.health -= damage;
                // Chance de aplicar efeito de status
                if (Math.random() < 0.3) {
                    this.player.status = 'corrupted';
                    this.player.statusDuration = 3;
                    message = `MalByte Virus usou Data Corruption! Você sofreu ${damage} de dano e está corrompido!`;
                } else {
                    message = `MalByte Virus usou Data Corruption! Você sofreu ${damage} de dano!`;
                }
                break;
        }
        
        // Adicionar mensagem e animação
        this.battle.messages.push(message);
        this.battle.animations.push({
            type: 'enemySkill',
            skill: enemySkill,
            ticks: 0,
            duration: 60
        });
        
        // Verificar se o jogador foi derrotado
        if (this.player.health <= 0) {
            this.player.health = 0;
            this.endBattle(false);
            return;
        }
        
        // Voltar para o turno do jogador
        this.battle.turn = 'player';
        this.battle.turnCounter++;
        this.battle.selectedSkill = null;
    }
    
    // Processar o próximo passo da batalha após uma animação
    processBattleStep() {
        // Implementação do fluxo da batalha
    }
    
    // Finalizar a batalha
    endBattle(victory) {
        if (victory) {
            // Ganhar experiência e possivelmente desbloquear novas habilidades
            const expGained = 20 + this.battle.enemy.level * 5;
            this.player.experience += expGained;
            
            this.battle.messages.push(`Você venceu! Ganhou ${expGained} EXP!`);
            
            // Verificar se subiu de nível
            if (this.player.experience >= this.player.nextLevelExp) {
                this.levelUp();
            }
            
            // Animação de vitória
            this.battle.animations.push({
                type: 'victory',
                ticks: 0,
                duration: 120
            });
        } else {
            // Derrota
            this.battle.messages.push('Você foi derrotado!');
            
            // Animação de derrota
            this.battle.animations.push({
                type: 'defeat',
                ticks: 0,
                duration: 180
            });
        }
        
        // Finalizar a batalha após a última animação
        setTimeout(() => {
            this.battle.active = false;
            this.gameState = 'playing';
            
            if (!victory) {
                // Respawn do jogador
                this.player.health = this.player.maxHealth / 2;
                // Posição de respawn
                this.player.x = 400;
                this.player.y = 300;
            }
        }, victory ? 2000 : 3000);
    }
    
    // Subir de nível
    levelUp() {
        this.player.level++;
        this.player.experience -= this.player.nextLevelExp;
        this.player.nextLevelExp = Math.floor(this.player.nextLevelExp * 1.5);
        
        // Aumentar stats
        this.player.maxHealth += 10;
        this.player.health = this.player.maxHealth;
        this.player.maxMana += 5;
        this.player.mana = this.player.maxMana;
        
        // Possibilidade de desbloquear novas habilidades
        if (this.player.level >= 3 && !this.player.skills.ddosStorm.available) {
            this.player.skills.ddosStorm.available = true;
            this.player.skills.ddosStorm.level = 1;
            this.battle.messages.push('Nova habilidade desbloqueada: ddosStorm()!');
        }
        
        if (this.player.level >= 5 && !this.player.skills.sqlInjection.available) {
            this.player.skills.sqlInjection.available = true;
            this.player.skills.sqlInjection.level = 1;
            this.battle.messages.push('Nova habilidade desbloqueada: sqlInjection()!');
        }
        
        this.battle.messages.push(`Nível ${this.player.level}! Seus stats aumentaram!`);
    }
    
    // Atualizar cutscenes
    updateCutscene() {
        // Implementação de cutscenes
    }
    
    // Renderização
    render() {
        // Limpar o canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        switch (this.gameState) {
            case 'loading':
                this.renderLoading();
                break;
                
            case 'menu':
                this.renderMenu();
                break;
                
            case 'playing':
                this.renderGame();
                break;
                
            case 'battle':
                this.renderBattle();
                break;
                
            case 'cutscene':
                this.renderCutscene();
                break;
        }
        
        // Renderizar elementos de UI que são comuns a todos os estados
        this.renderUI();
    }
    
    // Renderizar a tela de carregamento
    renderLoading() {
        const loadingText = 'Carregando...';
        const progress = (this.assets.loaded / this.assets.total) * 100;
        
        // Fundo
        this.ctx.fillStyle = '#010a13';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Texto
        this.ctx.font = '24px Marcellus';
        this.ctx.fillStyle = '#c8aa6e';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(loadingText, this.canvas.width/2, this.canvas.height/2 - 30);
        
        // Barra de progresso
        const barWidth = this.canvas.width * 0.6;
        const barHeight = 20;
        const barX = (this.canvas.width - barWidth) / 2;
        const barY = this.canvas.height/2;
        
        // Borda
        this.ctx.strokeStyle = '#c8aa6e';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(barX, barY, barWidth, barHeight);
        
        // Progresso
        this.ctx.fillStyle = '#c8aa6e';
        this.ctx.fillRect(barX, barY, barWidth * (progress/100), barHeight);
        
        // Porcentagem
        this.ctx.fillStyle = '#f0e6d2';
        this.ctx.fillText(`${Math.floor(progress)}%`, this.canvas.width/2, barY + barHeight + 30);
    }
    
    // Renderizar o menu principal
    renderMenu() {
        // Fundo
        this.ctx.fillStyle = '#010a13';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Título
        this.ctx.font = 'bold 48px Marcellus';
        this.ctx.fillStyle = '#c8aa6e';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Fehuna', this.canvas.width/2, this.canvas.height/2 - 80);
        this.ctx.font = 'bold 36px Marcellus';
        this.ctx.fillText('Códigos Perdidos', this.canvas.width/2, this.canvas.height/2 - 30);
        
        // Botão de início
        this.ctx.font = '24px Marcellus';
        this.ctx.fillStyle = '#f0e6d2';
        this.ctx.fillText('Pressione ENTER para iniciar', this.canvas.width/2, this.canvas.height/2 + 60);
        
        // Pulsação do botão de início
        const fadeEffect = (Math.sin(Date.now() * 0.005) + 1) * 0.5;
        this.ctx.globalAlpha = 0.3 + fadeEffect * 0.7;
        this.ctx.font = '24px Marcellus';
        this.ctx.fillStyle = '#c8aa6e';
        this.ctx.fillText('Pressione ENTER para iniciar', this.canvas.width/2, this.canvas.height/2 + 60);
        this.ctx.globalAlpha = 1.0;
    }    // Renderizar o jogo principal
    renderGame() {
        // Fundo do céu - gradiente baseado no horário do dia
        const skyColors = this.getSkyColors();
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, skyColors.top);
        gradient.addColorStop(0.3, skyColors.middle);
        gradient.addColorStop(1, skyColors.bottom);
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Efeitos de clima
        this.renderWeatherEffects();
        
        // Renderizar terreno estilo Stardew Valley
        const tileSize = this.map.tileSize;
        const startCol = Math.floor(-this.map.offsetX / tileSize);
        const endCol = Math.min(this.map.width, startCol + Math.ceil(this.canvas.width / tileSize) + 1);
        const startRow = Math.floor(-this.map.offsetY / tileSize);
        const endRow = Math.min(this.map.height, startRow + Math.ceil(this.canvas.height / tileSize) + 1);
        
        for (let c = startCol; c < endCol; c++) {
            for (let r = startRow; r < endRow; r++) {
                const x = c * tileSize + this.map.offsetX;
                const y = r * tileSize + this.map.offsetY;
                
                // Simular diferentes tipos de terreno estilo Stardew Valley
                this.renderTerrainTile(x, y, c, r, tileSize);
            }
        }
          // Adicionar algumas árvores e decorações
        this.renderEnvironmentObjects();
        
        // Renderizar NPCs
        this.renderNPCs();
        
        // Desenhar o jogador estilo Stardew Valley
        this.renderPlayer();
        
        // Renderizar notificações
        this.renderNotifications();
        
        // UI do jogo
        this.renderGameUI();
        
        // Renderizar diálogos se abertos
        if (this.ui.showDialog) {
            this.renderDialog();
        }
        
        // Renderizar inventário se aberto
        if (this.ui.showInventory) {
            this.renderInventory();
        }
    }
    
    // Renderizar tiles de terreno estilo Stardew Valley
    renderTerrainTile(x, y, col, row, size) {
        // Grama base
        this.ctx.fillStyle = '#4F7942'; // Verde grama escuro
        this.ctx.fillRect(x, y, size, size);
        
        // Variações na grama
        if ((col + row) % 3 === 0) {
            this.ctx.fillStyle = '#5A8B47'; // Verde grama claro
            this.ctx.fillRect(x + 2, y + 2, size - 4, size - 4);
        }
        
        // Adicionar texturas de grama
        this.ctx.fillStyle = '#6B8E57';
        for (let i = 0; i < 3; i++) {
            const grassX = x + (Math.sin(col * 0.5 + i) + 1) * size / 4;
            const grassY = y + (Math.cos(row * 0.3 + i) + 1) * size / 4;
            this.ctx.fillRect(grassX, grassY, 2, 4);
        }
        
        // Caminhos de terra
        if ((col === 5 && row >= 8 && row <= 15) || (row === 10 && col >= 3 && col <= 12)) {
            this.ctx.fillStyle = '#8B7355'; // Marrom terra
            this.ctx.fillRect(x, y, size, size);
            
            // Bordas do caminho
            this.ctx.fillStyle = '#A0845C';
            this.ctx.fillRect(x + 1, y + 1, size - 2, size - 2);
            
            // Pequenas pedras no caminho
            this.ctx.fillStyle = '#696969';
            if (Math.random() < 0.3) {
                this.ctx.fillRect(x + size/2, y + size/2, 2, 2);
            }
        }
        
        // Flores ocasionais
        if (Math.random() < 0.05 && (col + row) % 7 === 0) {
            this.renderFlower(x + size/2, y + size/2);
        }
    }
    
    // Renderizar objetos do ambiente (árvores, pedras, etc.)
    renderEnvironmentObjects() {
        // Árvores fixas em posições específicas
        const trees = [
            {x: 3, y: 3}, {x: 8, y: 2}, {x: 15, y: 4}, {x: 12, y: 8},
            {x: 20, y: 6}, {x: 25, y: 3}, {x: 18, y: 12}, {x: 22, y: 15}
        ];
        
        trees.forEach(tree => {
            const treeX = tree.x * this.map.tileSize + this.map.offsetX;
            const treeY = tree.y * this.map.tileSize + this.map.offsetY;
            this.renderTree(treeX, treeY);
        });
        
        // Pedras espalhadas
        const rocks = [
            {x: 6, y: 7}, {x: 14, y: 5}, {x: 19, y: 9}, {x: 24, y: 12}
        ];
        
        rocks.forEach(rock => {
            const rockX = rock.x * this.map.tileSize + this.map.offsetX;
            const rockY = rock.y * this.map.tileSize + this.map.offsetY;
            this.renderRock(rockX, rockY);
        });
    }
    
    // Renderizar árvore estilo Stardew Valley
    renderTree(x, y) {
        // Tronco
        this.ctx.fillStyle = '#8B4513'; // Marrom tronco
        this.ctx.fillRect(x + 12, y + 20, 8, 24);
        
        // Copa da árvore
        this.ctx.fillStyle = '#228B22'; // Verde escuro
        this.ctx.beginPath();
        this.ctx.arc(x + 16, y + 20, 18, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Highlights na copa
        this.ctx.fillStyle = '#32CD32'; // Verde claro
        this.ctx.beginPath();
        this.ctx.arc(x + 12, y + 16, 8, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.beginPath();
        this.ctx.arc(x + 20, y + 18, 6, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    // Renderizar pedra
    renderRock(x, y) {
        this.ctx.fillStyle = '#696969'; // Cinza escuro
        this.ctx.fillRect(x + 8, y + 20, 16, 12);
        
        // Highlight
        this.ctx.fillStyle = '#A9A9A9'; // Cinza claro
        this.ctx.fillRect(x + 10, y + 22, 6, 4);
    }
    
    // Renderizar flor
    renderFlower(x, y) {
        // Pétalas
        const colors = ['#FF69B4', '#FFB6C1', '#FFA07A', '#98FB98'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(x, y, 3, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Centro da flor
        this.ctx.fillStyle = '#FFD700'; // Amarelo
        this.ctx.beginPath();
        this.ctx.arc(x, y, 1, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    // Renderizar jogador estilo Stardew Valley
    renderPlayer() {
        const playerX = this.player.x + this.map.offsetX;
        const playerY = this.player.y + this.map.offsetY;
        
        // Sombra do personagem
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.beginPath();
        this.ctx.ellipse(playerX + this.player.width/2, playerY + this.player.height - 2, 
                        this.player.width/2, 4, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Corpo do personagem - estilo mais detalhado
        // Pernas
        this.ctx.fillStyle = '#4169E1'; // Azul para calça
        this.ctx.fillRect(playerX + 6, playerY + 28, 8, 16);
        this.ctx.fillRect(playerX + 18, playerY + 28, 8, 16);
        
        // Torso
        this.ctx.fillStyle = '#8B4513'; // Marrom para camisa
        this.ctx.fillRect(playerX + 4, playerY + 16, 24, 16);
        
        // Braços
        this.ctx.fillStyle = '#DEB887'; // Cor de pele
        this.ctx.fillRect(playerX, playerY + 18, 6, 12);
        this.ctx.fillRect(playerX + 26, playerY + 18, 6, 12);
        
        // Cabeça
        this.ctx.fillStyle = '#DEB887'; // Cor de pele
        const headSize = 16;
        const headX = playerX + (this.player.width - headSize) / 2;
        const headY = playerY + 2;
        this.ctx.fillRect(headX, headY, headSize, headSize);
        
        // Cabelo
        this.ctx.fillStyle = '#654321'; // Marrom cabelo
        this.ctx.fillRect(headX, headY, headSize, 8);
        
        // Olhos
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(headX + 4, headY + 6, 2, 2);
        this.ctx.fillRect(headX + 10, headY + 6, 2, 2);
        
        // Boca
        this.ctx.fillRect(headX + 7, headY + 10, 2, 1);
        
        // Animação de movimento
        if (this.player.isMoving) {
            const bobOffset = Math.sin(Date.now() * 0.01) * 2;
            this.ctx.translate(0, bobOffset);
            this.ctx.translate(0, -bobOffset);
        }
    }
      // Renderizar UI do jogo
    renderGameUI() {
        // Barra de vida e mana no canto superior esquerdo
        this.renderPlayerStats();
        
        // Mini-mapa no canto superior direito
        this.renderMiniMap();
        
        // Relógio e clima
        this.renderTimeAndWeather();
        
        // Informações de debug (podem ser removidas depois)
        this.ctx.font = '12px Arial';
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`Pos: (${Math.floor(this.player.x/32)}, ${Math.floor(this.player.y/32)})`, 10, this.canvas.height - 60);
        this.ctx.fillText(`Nível: ${this.player.level} | EXP: ${this.player.experience}/${this.player.nextLevelExp}`, 10, this.canvas.height - 40);
        this.ctx.fillText(`Pressione E perto de NPCs para interagir | I para inventário`, 10, this.canvas.height - 20);
    }
    
    // Renderizar horário e clima
    renderTimeAndWeather() {
        const hour = Math.floor(this.timeSystem.gameTime / 60);
        const minute = Math.floor(this.timeSystem.gameTime % 60);
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        
        // Fundo do relógio
        const clockX = this.canvas.width / 2 - 60;
        const clockY = 10;
        const clockWidth = 120;
        const clockHeight = 60;
        
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(clockX, clockY, clockWidth, clockHeight);
        
        this.ctx.strokeStyle = '#FFD700';
        this.ctx.strokeRect(clockX, clockY, clockWidth, clockHeight);
        
        // Horário
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = 'bold 16px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(timeString, clockX + clockWidth/2, clockY + 25);
        
        // Clima
        const weatherIcons = {
            'sunny': '☀️',
            'cloudy': '☁️',
            'rainy': '🌧️'
        };
        
        this.ctx.font = '20px Arial';
        this.ctx.fillText(weatherIcons[this.timeSystem.currentWeather], clockX + clockWidth/2, clockY + 50);
    }
    
    // Renderizar efeitos climáticos
    renderWeatherEffects() {
        if (this.timeSystem.currentWeather === 'rainy') {
            // Efeito de chuva
            this.ctx.strokeStyle = 'rgba(173, 216, 230, 0.6)';
            this.ctx.lineWidth = 1;
            
            for (let i = 0; i < 100; i++) {
                const x = (Date.now() * 0.5 + i * 50) % (this.canvas.width + 50);
                const y = (Date.now() * 0.8 + i * 30) % (this.canvas.height + 30);
                
                this.ctx.beginPath();
                this.ctx.moveTo(x, y);
                this.ctx.lineTo(x - 5, y + 15);
                this.ctx.stroke();
            }
        } else if (this.timeSystem.currentWeather === 'cloudy') {
            // Overlay escuro para clima nublado
            this.ctx.fillStyle = 'rgba(128, 128, 128, 0.2)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }
    
    // Renderizar estatísticas do jogador
    renderPlayerStats() {
        const x = 10;
        const y = 10;
        const width = 150;
        const height = 15;
        
        // Fundo semi-transparente
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(x - 5, y - 5, width + 10, 50);
        
        // Barra de vida
        this.ctx.fillStyle = '#8B0000'; // Vermelho escuro
        this.ctx.fillRect(x, y, width, height);
        
        const healthPercent = this.player.health / this.player.maxHealth;
        this.ctx.fillStyle = '#FF4500'; // Vermelho brilhante
        this.ctx.fillRect(x, y, width * healthPercent, height);
        
        this.ctx.strokeStyle = '#FFFFFF';
        this.ctx.strokeRect(x, y, width, height);
        
        // Texto da vida
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`HP: ${this.player.health}/${this.player.maxHealth}`, x, y - 2);
        
        // Barra de mana
        const manaY = y + 25;
        this.ctx.fillStyle = '#000080'; // Azul escuro
        this.ctx.fillRect(x, manaY, width, height);
        
        const manaPercent = this.player.mana / this.player.maxMana;
        this.ctx.fillStyle = '#4169E1'; // Azul brilhante
        this.ctx.fillRect(x, manaY, width * manaPercent, height);
        
        this.ctx.strokeStyle = '#FFFFFF';
        this.ctx.strokeRect(x, manaY, width, height);
        
        // Texto da mana
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillText(`MP: ${this.player.mana}/${this.player.maxMana}`, x, manaY - 2);
    }
      // Renderizar mini-mapa
    renderMiniMap() {
        const mapSize = 80;
        const mapX = this.canvas.width - mapSize - 10;
        const mapY = 10;
        
        // Fundo do mini-mapa
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(mapX, mapY, mapSize, mapSize);
        
        this.ctx.strokeStyle = '#FFFFFF';
        this.ctx.strokeRect(mapX, mapY, mapSize, mapSize);
        
        // Terreno no mini-mapa
        this.ctx.fillStyle = '#228B22';
        this.ctx.fillRect(mapX + 2, mapY + 2, mapSize - 4, mapSize - 4);
        
        // Posição do jogador no mini-mapa
        const playerMapX = mapX + (this.player.x / (this.map.width * this.map.tileSize)) * mapSize;
        const playerMapY = mapY + (this.player.y / (this.map.height * this.map.tileSize)) * mapSize;
        
        this.ctx.fillStyle = '#FF0000';
        this.ctx.beginPath();
        this.ctx.arc(playerMapX, playerMapY, 3, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    // Renderizar NPCs
    renderNPCs() {
        this.npcs.forEach(npc => {
            const npcX = npc.x + this.map.offsetX;
            const npcY = npc.y + this.map.offsetY;
            
            // Verificar se o NPC está visível na tela
            if (npcX > -npc.width && npcX < this.canvas.width && 
                npcY > -npc.height && npcY < this.canvas.height) {
                
                // Sombra do NPC
                this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
                this.ctx.beginPath();
                this.ctx.ellipse(npcX + npc.width/2, npcY + npc.height - 2, 
                                npc.width/2, 4, 0, 0, Math.PI * 2);
                this.ctx.fill();
                
                // Renderizar NPC baseado no tipo
                if (npc.id === 'mentor') {
                    this.renderProfessorNPC(npcX, npcY);
                } else if (npc.id === 'vendor') {
                    this.renderVendorNPC(npcX, npcY);
                } else if (npc.id === 'sage') {
                    this.renderSageNPC(npcX, npcY);
                } else if (npc.id === 'guard') {
                    this.renderGuardNPC(npcX, npcY);
                }
                
                // Indicador de interação se próximo
                if (npc.isNear) {
                    this.ctx.fillStyle = '#FFFF00';
                    this.ctx.font = '12px Arial';
                    this.ctx.textAlign = 'center';
                    this.ctx.fillText('E', npcX + npc.width/2, npcY - 10);
                    
                    // Círculo pulsante
                    const pulseSize = 2 + Math.sin(Date.now() * 0.01) * 1;
                    this.ctx.strokeStyle = '#FFFF00';
                    this.ctx.lineWidth = 2;
                    this.ctx.beginPath();
                    this.ctx.arc(npcX + npc.width/2, npcY - 5, pulseSize, 0, Math.PI * 2);
                    this.ctx.stroke();
                }
                
                // Nome do NPC
                this.ctx.fillStyle = '#FFFFFF';
                this.ctx.font = '10px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(npc.name, npcX + npc.width/2, npcY - 20);
            }
        });
    }
    
    // Renderizar Professor NPC
    renderProfessorNPC(x, y) {
        // Pernas
        this.ctx.fillStyle = '#2F4F2F'; // Verde escuro para calça
        this.ctx.fillRect(x + 6, y + 28, 8, 16);
        this.ctx.fillRect(x + 18, y + 28, 8, 16);
        
        // Torso
        this.ctx.fillStyle = '#8B4513'; // Marrom para colete
        this.ctx.fillRect(x + 4, y + 16, 24, 16);
        
        // Braços
        this.ctx.fillStyle = '#DEB887'; // Cor de pele
        this.ctx.fillRect(x, y + 18, 6, 12);
        this.ctx.fillRect(x + 26, y + 18, 6, 12);
        
        // Cabeça
        this.ctx.fillStyle = '#DEB887';
        this.ctx.fillRect(x + 8, y + 2, 16, 16);
        
        // Cabelo/barba
        this.ctx.fillStyle = '#A9A9A9'; // Cinza para cabelo
        this.ctx.fillRect(x + 8, y + 2, 16, 6);
        this.ctx.fillRect(x + 10, y + 12, 12, 4);
        
        // Óculos
        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(x + 10, y + 8, 4, 3);
        this.ctx.strokeRect(x + 18, y + 8, 4, 3);
        this.ctx.strokeRect(x + 14, y + 9, 4, 1);
    }
    
    // Renderizar Vendedor NPC
    renderVendorNPC(x, y) {
        // Pernas
        this.ctx.fillStyle = '#4B0082'; // Roxo para calça
        this.ctx.fillRect(x + 6, y + 28, 8, 16);
        this.ctx.fillRect(x + 18, y + 28, 8, 16);
        
        // Torso
        this.ctx.fillStyle = '#FFD700'; // Dourado para túnica
        this.ctx.fillRect(x + 4, y + 16, 24, 16);
        
        // Braços
        this.ctx.fillStyle = '#DEB887';
        this.ctx.fillRect(x, y + 18, 6, 12);
        this.ctx.fillRect(x + 26, y + 18, 6, 12);
        
        // Cabeça
        this.ctx.fillStyle = '#DEB887';
        this.ctx.fillRect(x + 8, y + 2, 16, 16);
        
        // Chapéu
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(x + 6, y, 20, 8);
        
        // Olhos
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(x + 11, y + 8, 2, 2);
        this.ctx.fillRect(x + 19, y + 8, 2, 2);
        
        // Bigode
        this.ctx.fillRect(x + 12, y + 12, 8, 2);
    }
    
    // Renderizar Sábio NPC
    renderSageNPC(x, y) {
        // Pernas
        this.ctx.fillStyle = '#8B4513'; // Marrom para calça
        this.ctx.fillRect(x + 6, y + 28, 8, 16);
        this.ctx.fillRect(x + 18, y + 28, 8, 16);
        
        // Torso
        this.ctx.fillStyle = '#4682B4'; // Azul aço para túnica
        this.ctx.fillRect(x + 4, y + 16, 24, 16);
        
        // Braços
        this.ctx.fillStyle = '#DEB887';
        this.ctx.fillRect(x, y + 18, 6, 12);
        this.ctx.fillRect(x + 26, y + 18, 6, 12);
        
        // Cabeça
        this.ctx.fillStyle = '#DEB887';
        this.ctx.fillRect(x + 8, y + 2, 16, 16);
        
        // Cabelo
        this.ctx.fillStyle = '#A9A9A9'; // Cinza para cabelo
        this.ctx.fillRect(x + 10, y + 2, 6, 6);
        this.ctx.fillRect(x + 14, y + 2, 6, 6);
        
        // Barba
        this.ctx.fillStyle = '#A9A9A9'; // Cinza para barba
        this.ctx.fillRect(x + 10, y + 10, 2, 6);
        this.ctx.fillRect(x + 18, y + 10, 2, 6);
        
        // Olhos
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(x + 11, y + 8, 2, 2);
        this.ctx.fillRect(x + 17, y + 8, 2, 2);
    }
    
    // Renderizar Guarda NPC
    renderGuardNPC(x, y) {
        // Pernas
        this.ctx.fillStyle = '#2F4F4F'; // Cinza escuro para calça
        this.ctx.fillRect(x + 6, y + 28, 8, 16);
        this.ctx.fillRect(x + 18, y + 28, 8, 16);
        
        // Torso
        this.ctx.fillStyle = '#8B0000'; // Vermelho escuro para colete
        this.ctx.fillRect(x + 4, y + 16, 24, 16);
        
        // Braços
        this.ctx.fillStyle = '#DEB887';
        this.ctx.fillRect(x, y + 18, 6, 12);
        this.ctx.fillRect(x + 26, y + 18, 6, 12);
        
        // Cabeça
        this.ctx.fillStyle = '#DEB887';
        this.ctx.fillRect(x + 8, y + 2, 16, 16);
        
        // Capacete
        this.ctx.fillStyle = '#696969'; // Cinza para capacete
        this.ctx.fillRect(x + 8, y, 16, 8);
        
        // Visor do capacete
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(x + 10, y + 2, 12, 6);
        
        // Olhos
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillRect(x + 11, y + 4, 2, 2);
        this.ctx.fillRect(x + 17, y + 4, 2, 2);
    }
    
    // Renderizar notificações
    renderNotifications() {
        this.ui.notifications.forEach(notification => {
            const alpha = notification.life / notification.maxLife;
            this.ctx.fillStyle = `rgba(255, 255, 0, ${alpha})`;
            this.ctx.font = 'bold 12px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(notification.text, notification.x, notification.y);
        });
    }
    
    // Renderizar diálogo
    renderDialog() {
        const dialogWidth = this.canvas.width * 0.8;
        const dialogHeight = 120;
        const dialogX = (this.canvas.width - dialogWidth) / 2;
        const dialogY = this.canvas.height - dialogHeight - 20;
        
        // Fundo do diálogo
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(dialogX, dialogY, dialogWidth, dialogHeight);
        
        // Borda
        this.ctx.strokeStyle = '#FFFFFF';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(dialogX, dialogY, dialogWidth, dialogHeight);
        
        // Nome do falante
        this.ctx.fillStyle = '#FFD700';
        this.ctx.font = 'bold 16px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(this.ui.dialogSpeaker, dialogX + 10, dialogY + 25);
        
        // Texto do diálogo
        this.ctx.fillStyle = '#FFFFFF';
 this.ctx.font = '14px Arial';
        this.wrapText(this.ui.dialogText, dialogX + 10, dialogY + 50, dialogWidth - 20, 18);
          // Indicador de continuação
        this.ctx.fillStyle = '#FFFF00';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'right';
        if (this.ui.currentNPC && this.ui.currentNPC.currentDialogue < this.ui.currentNPC.dialogues.length - 1) {
            this.ctx.fillText('Pressione ENTER para continuar', dialogX + dialogWidth - 10, dialogY + dialogHeight - 10);
        } else {
            this.ctx.fillText('Pressione ENTER para fechar', dialogX + dialogWidth - 10, dialogY + dialogHeight - 10);
        }
    }
    
    // Renderizar inventário
    renderInventory() {
        const invWidth = 300;
        const invHeight = 400;
        const invX = (this.canvas.width - invWidth) / 2;
        const invY = (this.canvas.height - invHeight) / 2;
        
        // Fundo do inventário
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        this.ctx.fillRect(invX, invY, invWidth, invHeight);
        
        // Borda
        this.ctx.strokeStyle = '#FFD700';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(invX, invY, invWidth, invHeight);
        
        // Título
        this.ctx.fillStyle = '#FFD700';
        this.ctx.font = 'bold 18px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Inventário', invX + invWidth/2, invY + 30);
        
        // Lista de itens
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '14px Arial';
        this.ctx.textAlign = 'left';
        
        let yOffset = 60;
        for (const [item, quantity] of Object.entries(this.player.inventory)) {
            if (quantity > 0) {
                this.ctx.fillText(`${item}: ${quantity}`, invX + 20, invY + yOffset);
                yOffset += 25;
            }
        }
        
        // Instruções
        this.ctx.fillStyle = '#FFFF00';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Pressione I para fechar', invX + invWidth/2, invY + invHeight - 20);
    }
    
    // Função auxiliar para quebrar texto
    wrapText(text, x, y, maxWidth, lineHeight) {
        const words = text.split(' ');
        let line = '';
        let currentY = y;
        
        for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' ';
            const metrics = this.ctx.measureText(testLine);
            const testWidth = metrics.width;
            
            if (testWidth > maxWidth && n > 0) {
                this.ctx.fillText(line, x, currentY);
                line = words[n] + ' ';
                currentY += lineHeight;
            } else {
                line = testLine;
            }
        }
        this.ctx.fillText(line, x, currentY);
    }
    
    // Renderizar a batalha
    renderBattle() {
        if (!this.battle.active) return;
        
        // Fundo de batalha
        this.ctx.fillStyle = '#010a13';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Desenhar área do inimigo
        this.ctx.fillStyle = '#1e2328';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height * 0.6);
        
        // Desenhar inimigo
        const enemySize = 80;
        const enemyX = this.canvas.width/2 - enemySize/2;
        const enemyY = this.canvas.height * 0.25 - enemySize/2;
        
        // Corpo do inimigo
        this.ctx.fillStyle = '#c83e4d';
        this.ctx.fillRect(enemyX, enemyY, enemySize, enemySize);
        
        // Adicionar detalhes ao inimigo
        this.ctx.fillStyle = '#0a1428';
        this.ctx.fillRect(enemyX + 10, enemyY + 20, 20, 10);
        this.ctx.fillRect(enemyX + 50, enemyY + 20, 20, 10);
        this.ctx.fillRect(enemyX + 20, enemyY + 50, 40, 10);
        
        // Barra de vida do inimigo
        const enemyHealthWidth = 150;
        const enemyHealthHeight = 15;
        const enemyHealthX = this.canvas.width/2 - enemyHealthWidth/2;
        const enemyHealthY = enemyY - 30;
        
        // Borda da barra de vida
        this.ctx.strokeStyle = '#c8aa6e';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(enemyHealthX, enemyHealthY, enemyHealthWidth, enemyHealthHeight);
        
        // Preenchimento da barra de vida
        const enemyHealthPercent = this.battle.enemy.health / this.battle.enemy.maxHealth;
        this.ctx.fillStyle = '#c83e4d';
        this.ctx.fillRect(enemyHealthX, enemyHealthY, enemyHealthWidth * enemyHealthPercent, enemyHealthHeight);
        
        // Nome e nível do inimigo
        this.ctx.font = '16px Marcellus';
        this.ctx.fillStyle = '#f0e6d2';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`${this.battle.enemy.name} Lv.${this.battle.enemy.level}`, this.canvas.width/2, enemyHealthY - 10);
        
        // Desenhar interface do jogador
        const playerInterfaceHeight = this.canvas.height * 0.4;
        const playerInterfaceY = this.canvas.height - playerInterfaceHeight;
        
        // Background da interface
        this.ctx.fillStyle = '#0a1428';
        this.ctx.fillRect(0, playerInterfaceY, this.canvas.width, playerInterfaceHeight);
        
        // Barra de vida do jogador
        const playerHealthWidth = 200;
        const playerHealthHeight = 20;
        const playerHealthX = 20;
        const playerHealthY = playerInterfaceY + 30;
        
        // Borda da barra de vida
        this.ctx.strokeStyle = '#c8aa6e';
        this.ctx.strokeRect(playerHealthX, playerHealthY, playerHealthWidth, playerHealthHeight);
        
        // Preenchimento da barra de vida
        const playerHealthPercent = this.player.health / this.player.maxHealth;
        this.ctx.fillStyle = '#4d9e5c';
        this.ctx.fillRect(playerHealthX, playerHealthY, playerHealthWidth * playerHealthPercent, playerHealthHeight);
        
        // Texto da barra de vida
        this.ctx.font = '14px Marcellus';
        this.ctx.fillStyle = '#f0e6d2';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`HP: ${this.player.health}/${this.player.maxHealth}`, playerHealthX, playerHealthY - 5);
        
        // Barra de mana do jogador
        const playerManaWidth = 200;
        const playerManaHeight = 15;
        const playerManaX = 20;
        const playerManaY = playerHealthY + playerHealthHeight + 15;
        
        // Borda da barra de mana
        this.ctx.strokeStyle = '#c8aa6e';
        this.ctx.strokeRect(playerManaX, playerManaY, playerManaWidth, playerManaHeight);
        
        // Preenchimento da barra de mana
        const playerManaPercent = this.player.mana / this.player.maxMana;
        this.ctx.fillStyle = '#4d85c8';
        this.ctx.fillRect(playerManaX, playerManaY, playerManaWidth * playerManaPercent, playerManaHeight);
        
        // Texto da barra de mana
        this.ctx.font = '14px Marcellus';
        this.ctx.fillStyle = '#f0e6d2';
        this.ctx.fillText(`MP: ${this.player.mana}/${this.player.maxMana}`, playerManaX, playerManaY - 5);
          // Lista de habilidades disponíveis
        const skillX = this.canvas.width - 280;
        const skillY = playerInterfaceY + 30;
        const skillWidth = 260;
        const skillHeight = 35;
        const skillGap = 5;
        
        this.ctx.font = '16px Marcellus';
        this.ctx.textAlign = 'left';
        this.ctx.fillStyle = '#c8aa6e';
        this.ctx.fillText('Habilidades (1-9):', skillX, skillY - 10);
        
        let skillIndex = 0;
        for (const [skillName, skill] of Object.entries(this.player.skills)) {
            if (skill.available && skillIndex < 9) {
                const y = skillY + skillIndex * (skillHeight + skillGap);
                
                // Highlight da skill selecionada
                if (this.battle.selectedSkill === skillName) {
                    this.ctx.fillStyle = '#3c3c41';
                    this.ctx.fillRect(skillX - 2, y - 2, skillWidth + 4, skillHeight + 4);
                    this.ctx.strokeStyle = '#c8aa6e';
                    this.ctx.lineWidth = 2;
                    this.ctx.strokeRect(skillX - 2, y - 2, skillWidth + 4, skillHeight + 4);
                }
                
                // Fundo da habilidade
                this.ctx.fillStyle = this.battle.selectedSkill === skillName ? '#2a3f5f' : '#1e2328';
                this.ctx.fillRect(skillX, y, skillWidth, skillHeight);
                
                // Borda
                this.ctx.strokeStyle = '#c8aa6e';
                this.ctx.lineWidth = 1;
                this.ctx.strokeRect(skillX, y, skillWidth, skillHeight);
                
                // Número da skill
                this.ctx.fillStyle = '#c8aa6e';
                this.ctx.font = 'bold 14px Marcellus';
                this.ctx.fillText(`${skillIndex + 1}`, skillX + 5, y + 20);
                
                // Nome da skill
                this.ctx.fillStyle = '#f0e6d2';
                this.ctx.font = '14px Marcellus';
                this.ctx.fillText(skillName + '()', skillX + 25, y + 20);
                
                // Descrição breve da skill
                this.ctx.fillStyle = '#a09b8c';
                this.ctx.font = '10px Arial';
                const description = this.getSkillDescription(skillName);
                this.ctx.fillText(description, skillX + 25, y + 32);
                
                skillIndex++;
            }
        }
        
        // Instruções
        if (this.battle.turn === 'player' && !this.battle.selectedSkill) {
            this.ctx.fillStyle = '#f0e6d2';
            this.ctx.font = '14px Marcellus';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Pressione 1-9 para selecionar habilidade, ENTER para executar', this.canvas.width/2, playerInterfaceY + 10);
        } else if (this.battle.selectedSkill) {
            this.ctx.fillStyle = '#c8aa6e';
            this.ctx.font = '14px Marcellus';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(`${this.battle.selectedSkill}() selecionada - Pressione ENTER para executar`, this.canvas.width/2, playerInterfaceY + 10);
        }
        
        // Mensagens de batalha
        if (this.battle.messages.length > 0) {
            const messageX = this.canvas.width / 2;
            const messageY = playerInterfaceY - 40;
            
            this.ctx.font = '20px Marcellus';
            this.ctx.fillStyle = '#f0e6d2';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(this.battle.messages[this.battle.messages.length - 1], messageX, messageY);
        }
        
        // Renderizar animações de batalha
        if (this.battle.animations.length > 0) {
            const animation = this.battle.animations[0];
            
            if (animation.type === 'skill') {
                // Animação de habilidade do jogador
                const progress = animation.ticks / animation.duration;
                
                // Exemplo de animação: onda de energia
                this.ctx.strokeStyle = '#4d9e5c';
                this.ctx.lineWidth = 3;
                this.ctx.beginPath();
                this.ctx.arc(
                    this.canvas.width / 2,
                    this.canvas.height * 0.3,
                    50 + progress * 100,
                    0,
                    Math.PI * 2
                );
                this.ctx.stroke();
            } else if (animation.type === 'enemySkill') {
                // Animação de habilidade do inimigo
                const progress = animation.ticks / animation.duration;
                
                // Exemplo: flash vermelho
                this.ctx.fillStyle = `rgba(200, 62, 77, ${0.5 - progress * 0.5})`;
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            }
        }
    }
    
    // Renderizar cutscenes
    renderCutscene() {
        // Implementação de cutscenes
    }
    
    // Renderizar elementos da UI
    renderUI() {
        // Elementos comuns a todos os estados
        
        // UI móvel
        if (this.ui.mobile && this.gameState === 'playing') {
            this.renderMobileControls();
        }
    }
    
    // Renderizar controles para mobile
    renderMobileControls() {
        // Joystick
        const joystickX = 70;
        const joystickY = this.canvas.height - 70;
        const joystickRadius = 50;
        
        // Base do joystick
        this.ctx.fillStyle = 'rgba(30, 35, 40, 0.7)';
        this.ctx.beginPath();
        this.ctx.arc(joystickX, joystickY, joystickRadius, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.strokeStyle = '#c8aa6e';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(joystickX, joystickY, joystickRadius, 0, Math.PI * 2);
        this.ctx.stroke();
        
        // Controle do joystick
        if (this.touchControls.joystick.active) {
            const jx = joystickX + this.touchControls.joystick.moveX;
            const jy = joystickY + this.touchControls.joystick.moveY;
            
            this.ctx.fillStyle = '#c8aa6e';
            this.ctx.beginPath();
            this.ctx.arc(jx, jy, joystickRadius / 2, 0, Math.PI * 2);
            this.ctx.fill();
        } else {
            this.ctx.fillStyle = '#c8aa6e';
            this.ctx.beginPath();
            this.ctx.arc(joystickX, joystickY, joystickRadius / 2, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        // Botões de ação (a serem implementados)
        // ...
    }
    
    // Sistema de Save/Load
    saveGame(slot = 0) {
        const saveData = {
            version: '1.0.0',
            timestamp: Date.now(),
            player: {
                x: this.player.x,
                y: this.player.y,
                health: this.player.health,
                maxHealth: this.player.maxHealth,
                mana: this.player.mana,
                maxMana: this.player.maxMana,
                level: this.player.level,
                experience: this.player.experience,
                inventory: { ...this.player.inventory },
                skills: { ...this.player.skills }
            },
            world: {
                currentMap: this.map.currentMap,
                timeOfDay: this.world.timeOfDay,
                weather: this.world.weather,
                dayCount: this.world.dayCount
            },
            progress: {
                achievements: { ...this.achievements },
                stats: { ...this.stats },
                tutorial: { ...this.tutorial }
            },
            npcs: this.npcs.map(npc => ({
                id: npc.id,
                currentDialogue: npc.currentDialogue,
                questCompleted: npc.quest?.completed || false
            }))
        };
        
        try {
            localStorage.setItem(`fehuna_save_${slot}`, JSON.stringify(saveData));
            this.showNotification('Jogo salvo com sucesso!', 'success');
            return true;
        } catch (error) {
            console.error('Erro ao salvar o jogo:', error);
            this.showNotification('Erro ao salvar o jogo!', 'error');
            return false;
        }
    }
    
    loadGame(slot = 0) {
        try {
            const saveString = localStorage.getItem(`fehuna_save_${slot}`);
            if (!saveString) {
                this.showNotification('Nenhum save encontrado neste slot!', 'warning');
                return false;
            }
            
            const saveData = JSON.parse(saveString);
            
            // Restaurar dados do jogador
            this.player.x = saveData.player.x;
            this.player.y = saveData.player.y;
            this.player.health = saveData.player.health;
            this.player.maxHealth = saveData.player.maxHealth;
            this.player.mana = saveData.player.mana;
            this.player.maxMana = saveData.player.maxMana;
            this.player.level = saveData.player.level;
            this.player.experience = saveData.player.experience;
            this.player.inventory = { ...saveData.player.inventory };
            this.player.skills = { ...saveData.player.skills };
            
            // Restaurar mundo
            if (saveData.world) {
                this.world.timeOfDay = saveData.world.timeOfDay;
                this.world.weather = saveData.world.weather;
                this.world.dayCount = saveData.world.dayCount || 1;
            }
            
            // Restaurar progresso
            if (saveData.progress) {
                this.achievements = { ...this.achievements, ...saveData.progress.achievements };
                this.stats = { ...this.stats, ...saveData.progress.stats };
                this.tutorial = { ...this.tutorial, ...saveData.progress.tutorial };
            }
            
            // Restaurar NPCs
            if (saveData.npcs) {
                saveData.npcs.forEach(savedNpc => {
                    const npc = this.npcs.find(n => n.id === savedNpc.id);
                    if (npc) {
                        npc.currentDialogue = savedNpc.currentDialogue;
                        if (npc.quest && savedNpc.questCompleted) {
                            npc.quest.completed = true;
                        }
                    }
                });
            }
            
            this.showNotification('Jogo carregado com sucesso!', 'success');
            return true;
        } catch (error) {
            console.error('Erro ao carregar o jogo:', error);
            this.showNotification('Erro ao carregar o jogo!', 'error');
            return false;
        }
    }
    
    // Auto-save
    autoSave() {
        if (this.saveData.autoSaveInterval > 0) {
            this.saveGame(0); // Salvar no slot 0 (auto-save)
        }
    }
    
    // Verificar se existe save
    hasSaveData(slot = 0) {
        return localStorage.getItem(`fehuna_save_${slot}`) !== null;
    }
    
    // Deletar save
    deleteSave(slot = 0) {
        localStorage.removeItem(`fehuna_save_${slot}`);
        this.showNotification(`Save ${slot} deletado!`, 'info');
    }
}

// Exportar a classe para uso global
window.FehunaGame = FehunaGame;
