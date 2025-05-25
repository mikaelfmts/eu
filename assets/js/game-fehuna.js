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
            skills: {
                'scanVirus': { level: 1, available: true },
                'encryptAttack': { level: 1, available: true },
                'firewallShield': { level: 1, available: true },
                'ddosStorm': { level: 0, available: false },
                'sqlInjection': { level: 0, available: false },
                'bruteForce': { level: 0, available: false },
                'proxyCloak': { level: 0, available: false },
                'systemRestore': { level: 0, available: false },
                'antiMalwareScan': { level: 0, available: false }
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
        this.assets.total = 10; // Exemplo: ajuste de acordo com o número real de assets
        
        // Aqui seriam carregados os sprites do jogador, inimigos, mapas, sons, etc.
        // Para este exemplo, estamos apenas simulando o carregamento
        
        // Simula o carregamento de assets
        let loadingInterval = setInterval(() => {
            this.assets.loaded++;
            
            if (this.assets.loaded >= this.assets.total) {
                clearInterval(loadingInterval);
                this.initGame();
            }
        }, 200);
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
        switch(key) {
            case ' ':
            case 'Enter':
                if (this.gameState === 'menu') {
                    this.gameState = 'playing';
                } else if (this.gameState === 'battle' && this.battle.turn === 'player') {
                    this.executeBattleAction();
                }
                break;
            case 'Escape':
                if (this.gameState === 'playing') {
                    this.ui.showMenu = !this.ui.showMenu;
                } else if (this.gameState === 'battle') {
                    // Não permite fuga neste exemplo
                }
                break;
        }
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
    }
    
    // Checar colisões com outros objetos
    checkCollisions() {
        // Implementar verificação de colisão com o ambiente, NPCs e inimigos
        
        // Verificar colisão com eventos (inimigos, NPCs, etc.)
        const randomEncounter = Math.random() * 1000;
        if (this.player.isMoving && randomEncounter < 2) {
            this.startBattle();
        }
    }
    
    // Atualizar elementos do mapa
    updateMap() {
        // Atualizar NPCs, objetos animados, etc.
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
        
        // Aplicar a habilidade selecionada
        let damage = 0;
        let message = '';
        
        switch (this.battle.selectedSkill) {
            case 'scanVirus':
                message = 'Você usou scanVirus()! Fraquezas do inimigo reveladas!';
                this.battle.enemy.weaknessRevealed = true;
                break;
                
            case 'encryptAttack':
                damage = 15 + Math.floor(Math.random() * 10);
                this.battle.enemy.health -= damage;
                message = `Você usou encryptAttack()! Causou ${damage} de dano!`;
                break;
                
            case 'firewallShield':
                this.player.defenseBoost = 10;
                message = 'Você usou firewallShield()! Sua defesa aumentou!';
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
    }
    
    // Renderizar o jogo principal
    renderGame() {
        // Por enquanto, vamos apenas desenhar um placeholder para o jogador e mapa
        
        // Fundo do mapa
        this.ctx.fillStyle = '#1e2328';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Grade para simular os tiles (temporário)
        this.ctx.strokeStyle = '#3c3c41';
        this.ctx.lineWidth = 1;
        
        const tileSize = this.map.tileSize;
        const startCol = Math.floor(-this.map.offsetX / tileSize);
        const endCol = Math.min(this.map.width, startCol + Math.ceil(this.canvas.width / tileSize) + 1);
        const startRow = Math.floor(-this.map.offsetY / tileSize);
        const endRow = Math.min(this.map.height, startRow + Math.ceil(this.canvas.height / tileSize) + 1);
        
        for (let c = startCol; c < endCol; c++) {
            for (let r = startRow; r < endRow; r++) {
                const x = c * tileSize + this.map.offsetX;
                const y = r * tileSize + this.map.offsetY;
                
                // Simular diferentes tipos de terreno
                if ((c + r) % 2 === 0) {
                    this.ctx.fillStyle = '#1e2328';
                } else {
                    this.ctx.fillStyle = '#0a1428';
                }
                this.ctx.fillRect(x, y, tileSize, tileSize);
                this.ctx.strokeRect(x, y, tileSize, tileSize);
            }
        }
        
        // Desenhar o jogador
        const playerX = this.player.x + this.map.offsetX;
        const playerY = this.player.y + this.map.offsetY;
        
        // Corpo do personagem
        this.ctx.fillStyle = '#c8aa6e';
        this.ctx.fillRect(playerX, playerY, this.player.width, this.player.height);
        
        // Cabeça do personagem
        this.ctx.fillStyle = '#f0e6d2';
        const headSize = this.player.width * 0.6;
        const headX = playerX + (this.player.width - headSize) / 2;
        const headY = playerY + this.player.height * 0.1;
        this.ctx.fillRect(headX, headY, headSize, headSize);
        
        // Informação de debug
        this.ctx.font = '14px Arial';
        this.ctx.fillStyle = '#f0e6d2';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`Pos: (${Math.floor(this.player.x)}, ${Math.floor(this.player.y)})`, 10, 20);
        this.ctx.fillText(`Dir: ${this.player.direction}`, 10, 40);
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
        const skillX = this.canvas.width - 250;
        const skillY = playerInterfaceY + 30;
        const skillWidth = 230;
        const skillHeight = 40;
        const skillGap = 10;
        
        this.ctx.font = '18px Marcellus';
        this.ctx.textAlign = 'left';
        this.ctx.fillStyle = '#c8aa6e';
        this.ctx.fillText('Habilidades:', skillX, skillY - 10);
        
        let skillIndex = 0;
        for (const [skillName, skill] of Object.entries(this.player.skills)) {
            if (skill.available) {
                const y = skillY + skillIndex * (skillHeight + skillGap);
                
                // Highlight da skill selecionada
                if (this.battle.selectedSkill === skillName) {
                    this.ctx.fillStyle = '#3c3c41';
                } else {
                    this.ctx.fillStyle = '#1e2328';
                }
                this.ctx.fillRect(skillX, y, skillWidth, skillHeight);
                
                // Borda
                this.ctx.strokeStyle = '#c8aa6e';
                this.ctx.strokeRect(skillX, y, skillWidth, skillHeight);
                
                // Nome da skill
                this.ctx.fillStyle = '#f0e6d2';
                this.ctx.textAlign = 'left';
                this.ctx.fillText(skillName + '()', skillX + 10, y + 25);
                
                skillIndex++;
            }
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
}

// Exportar a classe para uso global
window.FehunaGame = FehunaGame;
