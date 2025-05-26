/**
 * Minha Fazendinha - Jogo de simulação de fazenda estilo Harvest Moon
 * Desenvolvido por Mikael Ferreira
 * Usando Phaser 3
 */

class FarmGame {
    constructor(containerId) {        console.log('🚜 Inicializando Minha Fazendinha...');
        this.containerId = containerId;
        this.game = null;
        
        this.config = {
            type: Phaser.AUTO,
            width: 800,
            height: 600,
            parent: containerId,
            pixelArt: true,
            render: {
                antialias: false,
                pixelArt: true
            },
            canvas: {
                willReadFrequently: true
            },
            physics: {
                default: 'arcade',
                arcade: {
                    gravity: { y: 0 },
                    debug: false
                }
            },
            scene: [BootScene, LoadingScene, MenuScene, GameScene, UIScene]
        };
        
        this.init();
    }

    init() {
        // Verificar se o Phaser está disponível
        if (typeof Phaser === 'undefined') {
            console.error('❌ Phaser não está disponível. Verifique se o script foi carregado.');
            
            // Criar mensagem de erro visível
            const container = document.getElementById(this.containerId);
            if (container) {
                container.innerHTML = '<div style="color: red; padding: 20px; text-align: center; background: #f8f8f8; border: 2px solid #ff0000; border-radius: 8px;">⚠️ Erro: Biblioteca Phaser não encontrada.<br>Por favor, recarregue a página.<br><br>Se o problema persistir, verifique sua conexão com a internet.</div>';
            }
            return;
        }
          console.log('✅ Phaser carregado, versão:', Phaser.VERSION);
        
        // Verificar suporte WebGL e configurar automaticamente
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        
        if (gl) {
            console.log('✅ WebGL suportado - usando renderização WebGL');
            this.config.type = Phaser.WEBGL;
        } else {
            console.warn('⚠️ WebGL não suportado - usando Canvas 2D');
            this.config.type = Phaser.CANVAS;
        }
        
        // Limpar canvas de teste
        canvas.remove();
        
        // Verificar se o container existe
        const container = document.getElementById(this.containerId);
        if (!container) {
            console.error('❌ Container não encontrado:', this.containerId);
            return;
        }
        
        console.log('✅ Container encontrado:', this.containerId);
        
        // Iniciar o jogo
        try {
            this.game = new Phaser.Game(this.config);
            console.log('🚜 Jogo Minha Fazendinha inicializado com sucesso!');
        } catch (error) {
            console.error('❌ Erro ao inicializar o jogo:', error);
            container.innerHTML = '<div style="color: red; padding: 20px; text-align: center; background: #f8f8f8; border: 2px solid #ff0000; border-radius: 8px;">❌ Erro ao inicializar o jogo:<br>' + error.message + '</div>';
        }
    }

    destroy() {
        if (this.game) {
            this.game.destroy(true);
            this.game = null;
            console.log('Jogo Minha Fazendinha destruído');
        }
    }
}

// Cena de inicialização
class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }
      preload() {
        // Criar assets de loading placeholder
        this.createLoadingAssets();
    }
    
    createLoadingAssets() {
        // Criar background de loading
        const bgGraphics = this.add.graphics();
        bgGraphics.fillStyle(0x4a752c);
        bgGraphics.fillRect(0, 0, 200, 20);
        bgGraphics.generateTexture('loading-bg', 200, 20);
        
        // Criar barra de loading
        const barGraphics = this.add.graphics();
        barGraphics.fillStyle(0x90ee90);
        barGraphics.fillRect(0, 0, 200, 20);
        barGraphics.generateTexture('loading-bar', 200, 20);
        
        bgGraphics.destroy();
        barGraphics.destroy();
    }
    
    create() {
        this.scene.start('LoadingScene');
    }
}

// Cena de carregamento
class LoadingScene extends Phaser.Scene {
    constructor() {
        super({ key: 'LoadingScene' });
    }
    
    preload() {
        // Configurar barra de progresso
        let loadingBar = this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, 'loading-bar');
        let loadingBG = this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, 'loading-bg');
        
        // Texto de carregamento
        let loadingText = this.add.text(
            this.cameras.main.width / 2, 
            this.cameras.main.height / 2 - 50, 
            'Carregando...', 
            { font: '24px Arial', fill: '#ffffff' }
        ).setOrigin(0.5);
        
        // Mostrar progresso
        this.load.on('progress', (value) => {
            loadingBar.setScale(value, 1);
        });
        
        // Carregar todos os assets do jogo
        this.loadAssets();
    }
      loadAssets() {
        // Criar gráficos de placeholder ao invés de carregar arquivos
        this.createPlaceholderGraphics();
        
        // Tilemap simples
        this.createPlaceholderTilemap();
    }
      createPlaceholderGraphics() {
        // Criar tileset placeholder
        const tileGraphics = this.add.graphics();
        
        // Tile 1 - Grama (verde)
        tileGraphics.fillStyle(0x4a7c59);
        tileGraphics.fillRect(0, 0, 32, 32);
        tileGraphics.fillStyle(0x5a8b47);
        tileGraphics.fillRect(2, 2, 28, 28);
        
        // Tile 3 - Solo arável (marrom)
        tileGraphics.fillStyle(0x8b4513);
        tileGraphics.fillRect(0, 32, 32, 32);
        tileGraphics.fillStyle(0x654321);
        tileGraphics.fillRect(2, 34, 28, 28);
        
        // Tile 7 - Árvore (verde escuro)
        tileGraphics.fillStyle(0x228b22);
        tileGraphics.fillRect(0, 64, 32, 32);
        tileGraphics.fillStyle(0x8b4513);
        tileGraphics.fillRect(12, 80, 8, 16);
        
        // Tile 8 - Pedra (cinza)
        tileGraphics.fillStyle(0x696969);
        tileGraphics.fillRect(0, 96, 32, 32);
        tileGraphics.fillStyle(0x808080);
        tileGraphics.fillRect(4, 100, 24, 24);
        
        // Tile 10 - Solo arado (marrom escuro)
        tileGraphics.fillStyle(0x654321);
        tileGraphics.fillRect(0, 128, 32, 32);
        
        tileGraphics.generateTexture('tiles', 32, 160);
        
        // Criar personagem placeholder
        const playerGraphics = this.add.graphics();
        
        // Frame 0 - Parado para baixo
        playerGraphics.fillStyle(0x4a752c); // Verde
        playerGraphics.fillRect(0, 0, 30, 46);
        playerGraphics.fillStyle(0xfdbcb4); // Pele
        playerGraphics.fillRect(8, 8, 14, 14);
        
        // Adicionar mais frames básicos
        for (let i = 1; i < 16; i++) {
            playerGraphics.fillStyle(0x4a752c);
            playerGraphics.fillRect(i * 32, 0, 30, 46);
            playerGraphics.fillStyle(0xfdbcb4);
            playerGraphics.fillRect(i * 32 + 8, 8, 14, 14);
        }
        
        playerGraphics.generateTexture('player', 512, 48);
        
        // Criar crops placeholder
        const cropsGraphics = this.add.graphics();
        
        // Stage 0 - Semente
        cropsGraphics.fillStyle(0x8b4513);
        cropsGraphics.fillRect(0, 0, 32, 32);
        cropsGraphics.fillStyle(0x654321);
        cropsGraphics.fillCircle(16, 16, 3);
        
        // Stage 1 - Broto
        cropsGraphics.fillStyle(0x8b4513);
        cropsGraphics.fillRect(32, 0, 32, 32);
        cropsGraphics.fillStyle(0x90ee90);
        cropsGraphics.fillRect(45, 20, 6, 8);
        
        // Stage 2 - Crescendo
        cropsGraphics.fillStyle(0x8b4513);
        cropsGraphics.fillRect(64, 0, 32, 32);
        cropsGraphics.fillStyle(0x90ee90);
        cropsGraphics.fillRect(72, 15, 16, 15);
        
        // Stage 3 - Maduro
        cropsGraphics.fillStyle(0x8b4513);
        cropsGraphics.fillRect(96, 0, 32, 32);
        cropsGraphics.fillStyle(0x90ee90);
        cropsGraphics.fillRect(104, 10, 16, 20);
        cropsGraphics.fillStyle(0xff8c00);
        cropsGraphics.fillCircle(112, 20, 4);
        
        cropsGraphics.generateTexture('crops', 128, 32);
        
        // Criar animais placeholder
        const animalsGraphics = this.add.graphics();
        
        // Galinha (frame 0)
        animalsGraphics.fillStyle(0xffffff);
        animalsGraphics.fillEllipse(16, 16, 20, 15);
        animalsGraphics.fillStyle(0xff0000);
        animalsGraphics.fillTriangle(5, 10, 10, 8, 8, 15);
        
        // Vaca (frame 4 = posição x=128)
        animalsGraphics.fillStyle(0x000000);
        animalsGraphics.fillRect(128, 0, 30, 25);
        animalsGraphics.fillStyle(0xffffff);
        animalsGraphics.fillRect(130, 2, 8, 8);
        animalsGraphics.fillRect(140, 2, 8, 8);
        animalsGraphics.fillRect(150, 2, 8, 8);
        
        animalsGraphics.generateTexture('animals', 160, 32);
        
        // Criar UI icons placeholder
        const uiGraphics = this.add.graphics();
        
        // Ovo (frame 0)
        uiGraphics.fillStyle(0xffffff);
        uiGraphics.fillEllipse(16, 16, 12, 16);
        
        // Leite (frame 1)
        uiGraphics.fillStyle(0xffffff);
        uiGraphics.fillRect(32, 8, 16, 20);
        uiGraphics.fillStyle(0x87ceeb);
        uiGraphics.fillRect(34, 10, 12, 16);
        
        uiGraphics.generateTexture('ui-icons', 64, 32);
        
        // Destruir graphics temporários
        tileGraphics.destroy();
        playerGraphics.destroy();
        cropsGraphics.destroy();
        animalsGraphics.destroy();
        uiGraphics.destroy();
    }
    
    createPlaceholderTilemap() {
        // Criar tilemap programaticamente
        const mapData = [];
        const mapWidth = 20;
        const mapHeight = 20;
        
        // Gerar dados do mapa
        for (let y = 0; y < mapHeight; y++) {
            mapData[y] = [];
            for (let x = 0; x < mapWidth; x++) {
                // Área de fazenda no centro
                if (x >= 5 && x <= 12 && y >= 5 && y <= 12) {
                    mapData[y][x] = 3; // Tile de fazenda
                } else {
                    mapData[y][x] = 1; // Tile de grama
                }
            }
        }
        
        // Configurar tilemap
        this.mapConfig = {
            data: mapData,
            tileWidth: 32,
            tileHeight: 32,
            width: mapWidth,
            height: mapHeight
        };
    }
    
    create() {
        // Iniciar menu principal
        this.scene.start('MenuScene');
    }
}

// Cena do menu principal
class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }
    
    create() {
        // Fundo do menu
        this.add.rectangle(0, 0, 800, 600, 0x5ca246).setOrigin(0);
        
        // Título do jogo
        this.add.text(
            this.cameras.main.width / 2, 
            100, 
            'MINHA FAZENDINHA', 
            { font: '32px Arial', fill: '#ffffff' }
        ).setOrigin(0.5);
        
        // Botão iniciar
        let startButton = this.add.text(
            this.cameras.main.width / 2, 
            this.cameras.main.height / 2, 
            'INICIAR JOGO', 
            { font: '24px Arial', fill: '#ffffff', backgroundColor: '#4a752c', padding: { x: 20, y: 10 } }
        ).setOrigin(0.5)
        .setInteractive();
        
        startButton.on('pointerover', () => startButton.setTint(0xcccccc));
        startButton.on('pointerout', () => startButton.clearTint());
        startButton.on('pointerdown', () => this.scene.start('GameScene'));
        
        // Verificar se há jogo salvo
        const saveData = localStorage.getItem('minhaFazendinha');
        
        if (saveData) {
            let continueButton = this.add.text(
                this.cameras.main.width / 2, 
                this.cameras.main.height / 2 + 70, 
                'CONTINUAR JOGO', 
                { font: '24px Arial', fill: '#ffffff', backgroundColor: '#4a752c', padding: { x: 20, y: 10 } }
            ).setOrigin(0.5)
            .setInteractive();
            
            continueButton.on('pointerover', () => continueButton.setTint(0xcccccc));
            continueButton.on('pointerout', () => continueButton.clearTint());
            continueButton.on('pointerdown', () => {
                this.scene.start('GameScene', { loadSave: true });
            });
        }
        
        // Instruções
        this.add.text(
            this.cameras.main.width / 2, 
            this.cameras.main.height - 50, 
            'Clique para mover | E para interagir | I para inventário', 
            { font: '16px Arial', fill: '#ffffff' }
        ).setOrigin(0.5);
    }
}

// Cena principal do jogo
class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }
    
    init(data) {
        this.loadSave = data.loadSave || false;
        
        // Estado inicial do jogo
        this.gameState = {
            day: 1,
            time: 0, // 0 a 1440 (minutos no dia, 24h)
            money: 1000,
            energy: 100,
            inventory: {
                seeds: {
                    carrot: 5,
                    potato: 3,
                    corn: 2
                },
                tools: {
                    hoe: true,
                    wateringCan: true,
                    axe: true
                },
                items: {}
            },
            activeTool: null,
            crops: [], // Lista de plantações
            animals: [] // Lista de animais
        };
        
        // Carregar jogo salvo se disponível
        if (this.loadSave) {
            const savedData = localStorage.getItem('minhaFazendinha');
            if (savedData) {
                try {
                    const parsed = JSON.parse(savedData);
                    this.gameState = {...this.gameState, ...parsed};
                } catch (e) {
                    console.error('Erro ao carregar jogo salvo:', e);
                }
            }
        }
    }
    
    create() {
        // Criar mapa
        this.createMap();
        
        // Criar jogador
        this.createPlayer();
        
        // Criar sistema de cultivo
        this.createFarmingSystem();
        
        // Criar animais
        this.createAnimals();
        
        // Configurar câmera
        this.cameras.main.startFollow(this.player, true);
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        
        // Configurar colisões
        this.configureCollisions();
        
        // Iniciar sistema de tempo
        this.setupTimeSystem();
        
        // Iniciar UI
        this.scene.launch('UIScene', { gameState: this.gameState });
        
        // Configurar input
        this.setupInput();
          // Som de fundo (placeholder)
        // this.sound.play('bgm', { loop: true, volume: 0.5 });
    }
    
    update(time, delta) {
        // Movimentação do jogador
        this.updatePlayerMovement();
        
        // Atualizar tempo do jogo
        this.updateGameTime(delta);
        
        // Atualizar cultivos
        this.updateCrops(delta);
        
        // Atualizar animais
        this.updateAnimals(delta);
        
        // Verificar interações
        this.checkInteractions();
        
        // Passar informações para a UI
        this.scene.get('UIScene').updateGameState(this.gameState);
    }    createMap() {
        // Definir configuração do mapa
        this.mapConfig = {
            data: [
                [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
                [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
                [1,1,7,1,1,1,1,1,1,1,1,1,1,1,1,1,1,7,1,1],
                [1,1,1,8,1,1,1,1,1,1,1,1,1,1,1,8,1,1,1,1],
                [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
                [1,1,1,1,1,3,3,3,3,3,3,3,3,1,1,1,1,1,1,1],
                [1,1,1,1,1,3,3,3,3,3,3,3,3,1,1,1,1,1,1,1],
                [1,1,1,1,1,3,3,3,3,3,3,3,3,1,1,1,1,1,1,1],
                [1,1,1,1,1,3,3,3,3,3,3,3,3,1,1,1,1,1,1,1],
                [1,1,1,1,1,3,3,3,3,3,3,3,3,1,1,1,1,1,1,1],
                [1,1,1,1,1,3,3,3,3,3,3,3,3,1,1,1,1,1,1,1],
                [1,1,1,1,1,3,3,3,3,3,3,3,3,1,1,1,1,1,1,1],
                [1,1,1,1,1,3,3,3,3,3,3,3,3,1,1,1,1,1,1,1],
                [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
                [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
                [1,1,1,8,1,1,1,1,1,1,1,1,1,1,1,8,1,1,1,1],
                [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
                [1,1,7,1,1,1,1,1,1,1,1,1,1,1,1,1,1,7,1,1],
                [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
                [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
            ],
            tileWidth: 32,
            tileHeight: 32,
            width: 20,
            height: 20
        };
        
        // Criar mapa programaticamente usando placeholders
        this.map = this.make.tilemap({
            data: this.mapConfig.data,
            tileWidth: this.mapConfig.tileWidth,
            tileHeight: this.mapConfig.tileHeight,
            width: this.mapConfig.width,
            height: this.mapConfig.height
        });
        
        // Criar tileset usando os placeholders criados no LoadingScene
        const tileset = this.map.addTilesetImage('tiles', 'tiles');
        
        // Criar camadas
        this.groundLayer = this.map.createBlankLayer('Ground', tileset, 0, 0);
        this.farmLayer = this.map.createBlankLayer('Farmland', tileset, 0, 0);
        this.objectsLayer = this.map.createBlankLayer('Objects', tileset, 0, 0);
        
        // Preencher camada base
        for (let y = 0; y < this.mapConfig.height; y++) {
            for (let x = 0; x < this.mapConfig.width; x++) {
                this.groundLayer.putTileAt(1, x, y); // Grama base
                
                // Área de fazenda
                if (x >= 5 && x <= 12 && y >= 5 && y <= 12) {
                    this.farmLayer.putTileAt(3, x, y); // Solo arável
                }
            }
        }
        
        // Adicionar alguns objetos decorativos
        this.objectsLayer.putTileAt(7, 2, 2); // Árvore
        this.objectsLayer.putTileAt(7, 17, 2); // Árvore
        this.objectsLayer.putTileAt(8, 3, 15); // Pedra
        this.objectsLayer.putTileAt(8, 16, 15); // Pedra
    }
      createPlayer() {
        // Posição inicial do jogador (centro do mapa)
        const playerStart = { x: 320, y: 320 };
        
        // Criar sprite do jogador
        this.player = this.physics.add.sprite(playerStart.x, playerStart.y, 'player', 0);
        this.player.setSize(16, 16); // Ajustar hitbox
        this.player.setOffset(8, 32); // Posicionar hitbox
        this.player.setDepth(5); // Camada de renderização
        
        // Criar animações para o jogador
        this.createPlayerAnimations();
    }
    
    createPlayerAnimations() {
        // Animações de movimento
        this.anims.create({
            key: 'player-down',
            frames: this.anims.generateFrameNumbers('player', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });
        
        this.anims.create({
            key: 'player-right',
            frames: this.anims.generateFrameNumbers('player', { start: 4, end: 7 }),
            frameRate: 10,
            repeat: -1
        });
        
        this.anims.create({
            key: 'player-up',
            frames: this.anims.generateFrameNumbers('player', { start: 8, end: 11 }),
            frameRate: 10,
            repeat: -1
        });
        
        this.anims.create({
            key: 'player-left',
            frames: this.anims.generateFrameNumbers('player', { start: 12, end: 15 }),
            frameRate: 10,
            repeat: -1
        });
        
        // Animações de ferramenta
        this.anims.create({
            key: 'player-hoe',
            frames: this.anims.generateFrameNumbers('player', { start: 16, end: 19 }),
            frameRate: 8,
            repeat: 0
        });
        
        this.anims.create({
            key: 'player-water',
            frames: this.anims.generateFrameNumbers('player', { start: 20, end: 23 }),
            frameRate: 8,
            repeat: 0
        });
    }
    
    configureCollisions() {
        // Configurar colisões com camada de objetos
        this.objectsLayer.setCollisionByProperty({ collides: true });
        this.physics.add.collider(this.player, this.objectsLayer);
    }
    
    setupInput() {
        // Input do teclado
        this.cursors = this.input.keyboard.createCursorKeys();
        
        // Input do mouse
        this.input.on('pointerdown', (pointer) => {
            // Converter posição do clique para coordenadas do mundo
            const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
            
            // Verificar se está clicando em um objeto interativo
            const targetTile = this.getTileAt(worldPoint.x, worldPoint.y);
            if (targetTile) {
                this.handleTileInteraction(targetTile);
            } else {
                // Mover para a posição clicada
                this.moveToPoint(worldPoint.x, worldPoint.y);
            }
        });
        
        // Teclas para ações
        this.iKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.I);
        this.eKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
        this.oneKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE);
        this.twoKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO);
        this.threeKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE);
        
        // Eventos de tecla única
        this.input.keyboard.on('keydown-I', () => {
            // Alternar inventário
            this.scene.get('UIScene').toggleInventory();
        });
    }
    
    updatePlayerMovement() {
        // Controle por teclado
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-100);
            this.player.anims.play('player-left', true);
            this.player.facing = 'left';
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(100);
            this.player.anims.play('player-right', true);
            this.player.facing = 'right';
        } else {
            this.player.setVelocityX(0);
        }

        if (this.cursors.up.isDown) {
            this.player.setVelocityY(-100);
            if (!this.cursors.left.isDown && !this.cursors.right.isDown) {
                this.player.anims.play('player-up', true);
                this.player.facing = 'up';
            }
        } else if (this.cursors.down.isDown) {
            this.player.setVelocityY(100);
            if (!this.cursors.left.isDown && !this.cursors.right.isDown) {
                this.player.anims.play('player-down', true);
                this.player.facing = 'down';
            }
        } else {
            this.player.setVelocityY(0);
        }
        
        // Parar animação quando parado
        if (this.player.body.velocity.x === 0 && this.player.body.velocity.y === 0) {
            this.player.anims.stop();
        }
    }
    
    moveToPoint(x, y) {
        // Aqui você poderia implementar pathfinding, mas para simplificar
        // vamos apenas definir a velocidade para ir na direção do ponto
        
        // Calcular ângulo e velocidade
        const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, x, y);
        this.player.body.velocity.setToPolar(angle, 100);
        
        // Escolher animação com base na direção
        const dir = this.getDirection(angle);
        this.player.anims.play(`player-${dir}`, true);
        this.player.facing = dir;
    }
    
    getDirection(angle) {
        // Converter ângulo para direção
        const degAngle = Phaser.Math.RadToDeg(angle);
        if (degAngle >= -45 && degAngle <= 45) return 'right';
        if (degAngle > 45 && degAngle < 135) return 'down';
        if (degAngle >= 135 || degAngle <= -135) return 'left';
        return 'up';
    }
    
    getTileAt(x, y) {
        // Obter tile na posição x,y
        return this.map.getTileAt(
            this.map.worldToTileX(x),
            this.map.worldToTileY(y),
            false,
            'Farmland'
        );
    }
    
    createFarmingSystem() {
        // Sistema de farming com grid
        this.farmGrid = [];
        
        // Inicializar grid vazio
        for (let y = 0; y < this.map.height; y++) {
            this.farmGrid[y] = [];
            for (let x = 0; x < this.map.width; x++) {
                this.farmGrid[y][x] = null;
            }
        }
        
        // Carregar cultivos salvos
        if (this.gameState.crops && this.gameState.crops.length > 0) {
            this.gameState.crops.forEach(crop => {
                this.placeCrop(crop.x, crop.y, crop.type, crop.stage, crop.watered, crop.growthTime);
            });
        }
    }
    
    handleTileInteraction(tile) {
        // Verificar se é um tile de fazenda
        if (tile && this.farmLayer.getTileAt(tile.x, tile.y)) {
            // Verificar a ferramenta ativa
            if (this.gameState.activeTool === 'hoe') {
                this.hoeTile(tile.x, tile.y);
            } else if (this.gameState.activeTool === 'wateringCan') {
                this.waterTile(tile.x, tile.y);
            } else if (this.gameState.activeTool === null) {
                // Sem ferramenta = colher ou plantar
                if (this.isReadyToHarvest(tile.x, tile.y)) {
                    this.harvestCrop(tile.x, tile.y);
                } else if (this.isPlowed(tile.x, tile.y) && !this.hasCrop(tile.x, tile.y)) {
                    // Plantar semente (precisaria de UI para escolher)
                    this.openSeedSelector(tile.x, tile.y);
                }
            }
        }
    }
    
    hoeTile(x, y) {
        // Verificar se o jogador tem energia
        if (this.gameState.energy < 5) return;
        
        // Arar o terreno
        this.farmLayer.putTileAt(10, x, y); // Tile ID 10 = terreno arado
        
        // Atualizar energia
        this.gameState.energy -= 5;
        
        // Reproduzir animação
        this.player.anims.play('player-hoe');
    }
    
    waterTile(x, y) {
        // Verificar se o jogador tem energia
        if (this.gameState.energy < 3) return;
        
        // Verificar se há plantação
        const crop = this.getCropAt(x, y);
        if (crop) {
            // Regar a plantação
            crop.watered = true;
            crop.sprite.setTint(0x6699ff); // Tint azulado para indicar que está regado
            
            // Atualizar energia
            this.gameState.energy -= 3;
            
            // Reproduzir animação
            this.player.anims.play('player-water');
        }
    }
    
    openSeedSelector(x, y) {
        // Lógica para abrir seletor de sementes
        // Para simplificar, vamos plantar cenoura diretamente
        if (this.gameState.inventory.seeds.carrot > 0) {
            this.plantCrop(x, y, 'carrot');
        }
    }
    
    plantCrop(x, y, cropType) {
        // Verificar se o terreno está arado
        if (!this.isPlowed(x, y)) return;
        
        // Verificar se já existe plantação
        if (this.hasCrop(x, y)) return;
        
        // Verificar se tem a semente no inventário
        if (this.gameState.inventory.seeds[cropType] <= 0) return;
        
        // Plantar
        this.gameState.inventory.seeds[cropType]--;
        this.placeCrop(x, y, cropType, 0, false, 0);
          // Som de plantar (placeholder)
        // this.sound.play('plant');
    }
    
    placeCrop(x, y, type, stage = 0, watered = false, growthTime = 0) {
        // Criar sprite da plantação
        const worldX = this.map.tileToWorldX(x) + 16;
        const worldY = this.map.tileToWorldY(y) + 16;
        
        const cropSprite = this.add.sprite(worldX, worldY, 'crops', stage);
        cropSprite.setDepth(1); // Acima do chão, abaixo do jogador
        
        if (watered) {
            cropSprite.setTint(0x6699ff);
        }
        
        // Criar objeto da plantação
        const crop = {
            x: x,
            y: y,
            type: type,
            stage: stage,
            watered: watered,
            growthTime: growthTime,
            maxStage: this.getCropMaxStage(type),
            growthRate: this.getCropGrowthRate(type),
            sprite: cropSprite
        };
        
        // Adicionar à grid
        this.farmGrid[y][x] = crop;
        
        // Adicionar ao array de cultivos
        this.gameState.crops.push(crop);
    }
    
    getCropMaxStage(type) {
        // Configuração de estágios para cada tipo de plantação
        const stages = {
            'carrot': 3,
            'potato': 4,
            'corn': 5
        };
        return stages[type] || 3;
    }
    
    getCropGrowthRate(type) {
        // Taxa de crescimento por tipo (em ms)
        const rates = {
            'carrot': 10000, // 10 segundos para teste, no jogo real seria mais longo
            'potato': 15000,
            'corn': 20000
        };
        return rates[type] || 10000;
    }
    
    updateCrops(delta) {
        // Atualizar todas as plantações
        this.gameState.crops.forEach(crop => {
            // Só cresce se estiver regada
            if (crop.watered && crop.stage < crop.maxStage) {
                crop.growthTime += delta;
                
                // Verificar se é hora de crescer
                if (crop.growthTime >= crop.growthRate) {
                    crop.stage++;
                    crop.growthTime = 0;
                    crop.watered = false; // Precisa regar novamente
                    crop.sprite.clearTint();
                    crop.sprite.setFrame(crop.stage);
                }
            }
        });
        
        // Atualizar array de cultivos
        this.gameState.crops = this.gameState.crops.filter(crop => crop !== null);
    }
    
    isPlowed(x, y) {
        // Verificar se o tile é terreno arado
        const tile = this.farmLayer.getTileAt(x, y);
        return tile && tile.index === 10;
    }
    
    hasCrop(x, y) {
        // Verificar se já existe plantação nessa posição
        return this.farmGrid[y][x] !== null;
    }
    
    getCropAt(x, y) {
        // Obter plantação na posição
        return this.farmGrid[y][x];
    }
    
    isReadyToHarvest(x, y) {
        // Verificar se a plantação está pronta para colheita
        const crop = this.getCropAt(x, y);
        return crop && crop.stage >= crop.maxStage;
    }
    
    harvestCrop(x, y) {
        // Colher plantação
        const crop = this.getCropAt(x, y);
        if (!crop) return;
        
        // Adicionar item ao inventário
        if (!this.gameState.inventory.items[crop.type]) {
            this.gameState.inventory.items[crop.type] = 0;
        }
        this.gameState.inventory.items[crop.type]++;
        
        // Remover plantação
        crop.sprite.destroy();
        this.farmGrid[y][x] = null;
        
        // Remover do array de cultivos
        this.gameState.crops = this.gameState.crops.filter(c => c !== crop);
          // Som de colheita (placeholder)
        // this.sound.play('harvest');
    }
    
    createAnimals() {
        // Criar animais
        this.animalGroup = this.physics.add.group();
        
        // Adicionar galinhas
        for (let i = 0; i < 3; i++) {
            this.createAnimal('chicken', 300 + i * 50, 200);
        }
        
        // Adicionar vaca
        this.createAnimal('cow', 400, 250);
    }
    
    createAnimal(type, x, y) {
        // Criar sprite de animal
        const frameMap = { 'chicken': 0, 'cow': 4 };
        const animal = this.animalGroup.create(x, y, 'animals', frameMap[type]);
        
        // Propriedades do animal
        animal.setDepth(4); // Entre o chão e o jogador
        animal.type = type;
        animal.fed = false;
        animal.producing = false;
        animal.productionTime = 0;
        animal.productionRate = type === 'chicken' ? 20000 : 30000; // ms
        
        // Criar área de interação
        animal.setInteractive();
        
        // Adicionar ao array de animais
        this.gameState.animals.push(animal);
        
        // Movimento aleatório
        this.time.addEvent({
            delay: Phaser.Math.Between(3000, 7000),
            callback: () => this.moveAnimalRandomly(animal),
            callbackScope: this,
            loop: true
        });
    }
    
    moveAnimalRandomly(animal) {
        // Movimento aleatório para os animais
        const x = animal.x + Phaser.Math.Between(-50, 50);
        const y = animal.y + Phaser.Math.Between(-50, 50);
        
        // Verificar limites do mapa
        const boundedX = Phaser.Math.Clamp(x, 100, this.map.widthInPixels - 100);
        const boundedY = Phaser.Math.Clamp(y, 100, this.map.heightInPixels - 100);
        
        // Mover animal
        this.tweens.add({
            targets: animal,
            x: boundedX,
            y: boundedY,
            duration: 2000,
            ease: 'Linear'
        });
    }
    
    updateAnimals(delta) {
        // Atualizar produção dos animais
        this.gameState.animals.forEach(animal => {
            if (animal.fed && !animal.producing) {
                // Começar a produzir
                animal.producing = true;
                animal.productionTime = 0;
            }
            
            if (animal.producing) {
                animal.productionTime += delta;
                
                // Verificar se está pronto para produzir
                if (animal.productionTime >= animal.productionRate) {
                    // Produto pronto
                    animal.fed = false;
                    animal.producing = false;
                    
                    // Indicador visual de produto pronto
                    const product = animal.type === 'chicken' ? 'egg' : 'milk';
                    const icon = this.add.sprite(animal.x, animal.y - 20, 'ui-icons', product === 'egg' ? 0 : 1);
                    icon.setDepth(9);
                    
                    // Animação do ícone
                    this.tweens.add({
                        targets: icon,
                        y: icon.y - 10,
                        alpha: { from: 1, to: 0.3 },
                        duration: 1000,
                        yoyo: true,
                        repeat: -1
                    });
                    
                    // Guardar referência ao ícone
                    animal.productIcon = icon;
                    animal.hasProduct = product;
                }
            }
        });
    }
    
    checkInteractions() {
        // Verificar botão de interação
        if (Phaser.Input.Keyboard.JustDown(this.eKey)) {
            // Verificar proximidade com animais
            let interacted = false;
            
            this.gameState.animals.forEach(animal => {
                const distance = Phaser.Math.Distance.Between(
                    this.player.x, this.player.y,
                    animal.x, animal.y
                );
                
                if (distance < 50) {
                    if (!animal.fed) {
                        // Alimentar animal
                        animal.fed = true;
                        animal.setTint(0x00ff00);
                        
                        // Mensagem
                        this.showMessage(`${animal.type === 'chicken' ? 'Galinha' : 'Vaca'} alimentada!`);
                        
                        interacted = true;
                    } else if (animal.hasProduct) {
                        // Coletar produto
                        const product = animal.hasProduct;
                        
                        if (!this.gameState.inventory.items[product]) {
                            this.gameState.inventory.items[product] = 0;
                        }
                        this.gameState.inventory.items[product]++;
                        
                        // Remover ícone e resetar estado
                        if (animal.productIcon) animal.productIcon.destroy();
                        animal.hasProduct = null;
                        animal.setTint(0xffffff);
                        
                        // Mensagem
                        this.showMessage(`${product === 'egg' ? 'Ovo' : 'Leite'} coletado!`);
                        
                        interacted = true;
                    }
                }
            });
            
            // Se não interagiu com animal, tentar outras interações
            if (!interacted) {
                // Verificar interação com a cama
                const bedObject = this.map.findObject('Objects', obj => obj.name === 'Bed');
                if (bedObject) {
                    const distance = Phaser.Math.Distance.Between(
                        this.player.x, this.player.y,
                        bedObject.x, bedObject.y
                    );
                    
                    if (distance < 50) {
                        this.goToSleep();
                    }
                }
            }
        }
        
        // Selecionar ferramentas com teclas
        if (Phaser.Input.Keyboard.JustDown(this.oneKey)) {
            this.gameState.activeTool = 'hoe';
            this.showMessage('Enxada selecionada');
        } else if (Phaser.Input.Keyboard.JustDown(this.twoKey)) {
            this.gameState.activeTool = 'wateringCan';
            this.showMessage('Regador selecionado');
        } else if (Phaser.Input.Keyboard.JustDown(this.threeKey)) {
            this.gameState.activeTool = null;
            this.showMessage('Mãos selecionadas');
        }
    }
    
    goToSleep() {
        // Transição para tela de dormir
        this.cameras.main.fade(1000, 0, 0, 0);
        
        this.time.delayedCall(1000, () => {
            // Avançar para o próximo dia
            this.gameState.day++;
            this.gameState.time = 0;
            this.gameState.energy = 100;
            
            // Resetar plantas regadas
            this.gameState.crops.forEach(crop => {
                crop.watered = false;
                if (crop.sprite) crop.sprite.clearTint();
            });
            
            // Salvar jogo
            this.saveGame();
            
            // Fade de volta
            this.cameras.main.fadeIn(1000);
            
            // Mensagem
            this.showMessage(`Bom dia! Dia ${this.gameState.day}`);
        });
    }
    
    saveGame() {
        // Preparar dados para salvar
        const saveData = {
            day: this.gameState.day,
            money: this.gameState.money,
            inventory: this.gameState.inventory,
            crops: this.gameState.crops.map(crop => ({
                x: crop.x,
                y: crop.y,
                type: crop.type,
                stage: crop.stage,
                watered: crop.watered,
                growthTime: crop.growthTime
            }))
        };
        
        // Salvar no localStorage
        localStorage.setItem('minhaFazendinha', JSON.stringify(saveData));
    }
    
    setupTimeSystem() {
        // Sistema de tempo - 24h em 5 minutos reais
        this.timeScale = 1440 / (5 * 60 * 1000); // minutos por ms
    }
    
    updateGameTime(delta) {
        // Atualizar tempo do jogo
        this.gameState.time += delta * this.timeScale;
        
        // Verificar se o dia acabou
        if (this.gameState.time >= 1440) {
            // Efeito de cansaço
            this.cameras.main.shake(500, 0.01);
            this.showMessage('Você está cansado. Vá dormir!');
            
            // Perder energia rapidamente
            this.gameState.energy = Math.max(0, this.gameState.energy - 1);
        }
    }
    
    showMessage(text) {
        // Mostrar mensagem na UI
        this.scene.get('UIScene').showMessage(text);
    }
}

// Cena da interface do usuário
class UIScene extends Phaser.Scene {
    constructor() {
        super({ key: 'UIScene' });
    }
    
    init(data) {
        this.gameState = data.gameState;
        this.showingInventory = false;
    }
    
    create() {
        // Criar elementos da UI
        this.createStatusBar();
        this.createInventoryPanel();
        this.createMessageBox();
        
        // Esconder inventário inicialmente
        this.inventoryPanel.setVisible(false);
    }
    
    createStatusBar() {
        // Barra de status no topo
        this.statusBar = this.add.rectangle(0, 0, 800, 40, 0x000000, 0.7).setOrigin(0, 0);
        
        // Dinheiro
        this.moneyText = this.add.text(10, 10, `$${this.gameState.money}`, { font: '16px Arial', fill: '#ffffff' });
        
        // Energia
        this.energyBar = this.add.rectangle(200, 20, 100, 20, 0x333333).setOrigin(0, 0.5);
        this.energyFill = this.add.rectangle(200, 20, 100, 20, 0x00ff00).setOrigin(0, 0.5);
        
        // Relógio
        this.clockText = this.add.text(400, 10, this.formatTime(this.gameState.time), { font: '16px Arial', fill: '#ffffff' });
        
        // Dia
        this.dayText = this.add.text(700, 10, `Dia ${this.gameState.day}`, { font: '16px Arial', fill: '#ffffff' });
    }
    
    formatTime(minutes) {
        // Formatar minutos para HH:MM
        const hours = Math.floor(minutes / 60);
        const mins = Math.floor(minutes % 60);
        return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    }
    
    createInventoryPanel() {
        // Painel de inventário
        this.inventoryPanel = this.add.container(400, 300);
        
        // Fundo
        const bg = this.add.rectangle(0, 0, 600, 400, 0x000000, 0.8);
        this.inventoryPanel.add(bg);
        
        // Título
        const title = this.add.text(0, -170, 'INVENTÁRIO', { font: '24px Arial', fill: '#ffffff' }).setOrigin(0.5);
        this.inventoryPanel.add(title);
        
        // Seções
        this.createInventorySection('SEMENTES', -250, -120);
        this.createInventorySection('FERRAMENTAS', -250, 0);
        this.createInventorySection('ITENS', -250, 120);
        
        // Botão fechar
        const closeBtn = this.add.text(270, -170, 'X', { font: '20px Arial', fill: '#ffffff' })
            .setInteractive()
            .on('pointerdown', () => this.toggleInventory());
        this.inventoryPanel.add(closeBtn);
    }
    
    createInventorySection(title, x, y) {
        // Seção do inventário
        const section = this.add.container(x, y);
        
        // Título
        const titleText = this.add.text(0, 0, title, { font: '18px Arial', fill: '#c8aa6e' }).setOrigin(0, 0.5);
        section.add(titleText);
        
        // Lista de itens (será preenchida dinamicamente)
        const itemsContainer = this.add.container(0, 30);
        section.add(itemsContainer);
        
        // Guardar referência à lista de itens
        section.itemsContainer = itemsContainer;
        section.type = title.toLowerCase();
        
        this.inventoryPanel.add(section);
    }
    
    updateInventory() {
        // Limpar listas existentes
        this.inventoryPanel.list.forEach(item => {
            if (item.type === 'container' && item.itemsContainer) {
                item.itemsContainer.removeAll(true);
                
                // Preencher com itens do inventário
                let y = 0;
                
                if (item.type === 'sementes') {
                    // Listar sementes
                    Object.entries(this.gameState.inventory.seeds).forEach(([seed, amount]) => {
                        if (amount > 0) {
                            const text = this.add.text(0, y, `${seed}: ${amount}`, { font: '16px Arial', fill: '#ffffff' });
                            item.itemsContainer.add(text);
                            y += 25;
                        }
                    });
                } else if (item.type === 'ferramentas') {
                    // Listar ferramentas
                    Object.entries(this.gameState.inventory.tools).forEach(([tool, owned]) => {
                        if (owned) {
                            const text = this.add.text(0, y, tool, { font: '16px Arial', fill: '#ffffff' });
                            item.itemsContainer.add(text);
                            y += 25;
                        }
                    });
                } else if (item.type === 'itens') {
                    // Listar itens coletados
                    Object.entries(this.gameState.inventory.items || {}).forEach(([itemName, count]) => {
                        if (count > 0) {
                            const text = this.add.text(0, y, `${itemName}: ${count}`, { font: '16px Arial', fill: '#ffffff' });
                            item.itemsContainer.add(text);
                            y += 25;
                        }
                    });
                }
            }
        });
    }
    
    createMessageBox() {
        // Caixa de mensagem
        this.messageBox = this.add.container(400, 500);
        
        // Fundo
        const bg = this.add.rectangle(0, 0, 600, 80, 0x000000, 0.7).setStrokeStyle(2, 0xc8aa6e);
        this.messageBox.add(bg);
        
        // Texto
        this.messageText = this.add.text(0, 0, '', { font: '18px Arial', fill: '#ffffff', align: 'center' }).setOrigin(0.5);
        this.messageBox.add(this.messageText);
        
        // Esconder inicialmente
        this.messageBox.setVisible(false);
    }
    
    updateGameState(gameState) {
        // Atualizar referência ao estado do jogo
        this.gameState = gameState;
        
        // Atualizar interface
        this.moneyText.setText(`$${this.gameState.money}`);
        this.energyFill.width = this.gameState.energy;
        this.clockText.setText(this.formatTime(this.gameState.time));
        this.dayText.setText(`Dia ${this.gameState.day}`);
        
        // Atualizar cor da barra de energia
        if (this.gameState.energy < 30) {
            this.energyFill.fillColor = 0xff0000;
        } else if (this.gameState.energy < 60) {
            this.energyFill.fillColor = 0xffff00;
        } else {
            this.energyFill.fillColor = 0x00ff00;
        }
    }
    
    toggleInventory() {
        // Alternar visibilidade do inventário
        this.showingInventory = !this.showingInventory;
        this.inventoryPanel.setVisible(this.showingInventory);
        
        // Atualizar conteúdo
        if (this.showingInventory) {
            this.updateInventory();
        }
    }
    
    showMessage(text) {
        // Exibir mensagem temporária
        this.messageText.setText(text);
        this.messageBox.setVisible(true);
        
        // Esconder após 3 segundos
        this.time.delayedCall(3000, () => {
            this.messageBox.setVisible(false);
        });
    }
}
