// Ultra Evolved Minerva Assistant with Google Gemini Integration
class MinervaUltraAssistant {
    constructor() {
        this.isOpen = false;
        this.isProcessing = false;
        this.messageHistory = [];        
        this.knowledgeBase = this.initializeKnowledgeBase();        
        this.apiEndpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';
        this.apiKey = 'AIzaSyDMxTyUdbZ41HgiLb-3hE4mrTZ3GnlnJuE'; // Google Gemini API Key
        
        // GitHub Integration Configuration
        this.githubConfig = {
            username: 'mikael-ferreira',  // Username do GitHub
            apiBase: 'https://api.github.com',
            cache: new Map(),
            cacheExpiry: 5 * 60 * 1000,  // 5 minutos
            lastFetch: null
        };
        
        this.conversationCache = new Map();
        this.lastInteraction = Date.now();
        this.isActive = false;
        this.isThinking = false;
        this.isUltraMode = false;
        this.userSession = {
            questionsAsked: 0,
            topics: [],
            startTime: Date.now(),
            userPreferences: {},
            conversationHistory: []        };
        
        // Inicializar dados do GitHub em background
        this.initializeGitHubData();
        
        // Configurar atualização periódica dos dados do GitHub (a cada 10 minutos)
        setInterval(() => {
            this.initializeGitHubData();
        }, 10 * 60 * 1000);
        
        this.init();
    }

    initializeKnowledgeBase() {
        return {            owner: {
                name: "Mikael Ferreira",
                profession: "Desenvolvedor Web Full Stack",
                specialties: ["Frontend", "Backend", "JavaScript", "Python", "React", "Node.js"],
                experience: "Desenvolvedor apaixonado por criar experiências digitais únicas",
                github: {
                    username: "mikael-ferreira",
                    note: "Dados atuais do GitHub são carregados dinamicamente pela Minerva"
                },
                contact: {
                    email: "contato disponível através do formulário",
                    github: "perfil no GitHub disponível",
                    linkedin: "perfil profissional disponível"
                }
            },
            website: {
                name: "Portfolio Mikael Ferreira",
                theme: "Inspirado em League of Legends/Riot Games",
                features: [
                    "Sistema de chat em tempo real",
                    "Painel administrativo completo",
                    "PWA (Progressive Web App)",
                    "Sistema de partículas interativo",
                    "Gerador de currículo automático",
                    "Galeria de mídia administrativa",
                    "Sistema de certificados",
                    "Modo alternativo de tema"
                ],
                pages: {
                    "index.html": "Página principal com perfil, habilidades e projetos",
                    "admin.html": "Painel administrativo para gestão do site",
                    "login.html": "Sistema de autenticação",
                    "curriculo-generator.html": "Ferramenta para gerar currículos personalizados",
                    "midia-admin.html": "Administração de arquivos de mídia",
                    "pages/projetos.html": "Portfolio detalhado de projetos",
                    "pages/certificates-in-progress.html": "Certificados em andamento",
                    "pages/galeria-midia.html": "Galeria de mídia do site",
                    "pages/games.html": "Projetos de jogos e aplicações interativas",
                    "pages/interactive-projects.html": "Projetos interativos especiais",
                    "pages/mentors.html": "Seção sobre mentores e influências",
                    "pages/curriculum.html": "Currículo completo"
                }
            },
            technologies: {
                frontend: ["HTML5", "CSS3", "JavaScript ES6+", "Tailwind CSS", "Font Awesome"],
                backend: ["Firebase Firestore", "Firebase Auth", "Firebase Storage"],
                tools: ["PWA", "Google Fonts", "Phaser.js para jogos"],
                apis: ["Google Gemini AI", "GitHub API"]
            },
            capabilities: [
                "Responder perguntas sobre Mikael e sua carreira",
                "Explicar funcionalidades do site",
                "Navegar entre páginas",
                "Fornecer informações técnicas",
                "Ajudar com dúvidas sobre projetos",
                "Orientar sobre como usar o site",
                "Fornecer detalhes sobre tecnologias utilizadas"
            ]
        };
    }

    init() {
        this.createMinervaUI();
        this.setupEventListeners();
        this.setupAdvancedFeatures();
        this.startAmbientAnimation();
    }

    createMinervaUI() {
        // Verificar se já existe
        if (document.getElementById('minerva-container')) {
            return;
        }

        // Criar container da Minerva Ultra
        const minervaContainer = document.createElement('div');
        minervaContainer.id = 'minerva-container';
        minervaContainer.classList.add('minerva-container');
        minervaContainer.innerHTML = `
            <!-- Sistema de Partículas -->
            <div class="minerva-particles">
                <div class="minerva-particle"></div>
                <div class="minerva-particle"></div>
                <div class="minerva-particle"></div>
                <div class="minerva-particle"></div>
                <div class="minerva-particle"></div>
                <div class="minerva-particle"></div>
            </div>              <!-- Coruja Ultra Imponente e Realista -->
            <div id="minerva-owl" class="minerva-owl" title="Clique para falar com Minerva - Assistente IA Ultra Inteligente">
                <div class="owl-head">
                    <div class="owl-tufts">
                        <div class="tuft-left"></div>
                        <div class="tuft-right"></div>
                    </div>
                    <div class="owl-eyes">
                        <div class="eye left-eye">
                            <div class="pupil"></div>
                        </div>
                        <div class="eye right-eye">
                            <div class="pupil"></div>
                        </div>
                    </div>
                    <div class="owl-beak"></div>
                </div>
                <div class="thinking-dots" id="thinking-dots">
                    <span></span><span></span><span></span>
                </div>
            </div>
            
            <!-- Chat Ultra Evoluído -->
            <div id="minerva-chat" class="minerva-chat hidden">
                <div class="minerva-header">
                    <div class="minerva-title">
                        <i class="fas fa-brain"></i>
                        Minerva IA - Assistente Ultra
                    </div>
                    <div class="minerva-status" id="minerva-status">
                        <span class="status-dot active"></span>
                        <span class="status-text">Online</span>
                    </div>
                    <button class="minerva-close" id="minerva-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="minerva-messages" id="minerva-messages">
                    <div class="minerva-welcome">
                        <div class="welcome-avatar">
                            <i class="fas fa-feather-alt"></i>
                        </div>                        <div class="welcome-message">
                            <h3>Minerva IA - Sua Assistente Ultra Inteligente</h3>
                            <p>Olá! Sou a Minerva, sua assistente virtual powered by Google Gemini & created by Mikael. Posso responder qualquer pergunta sobre:</p>
                            <ul>
                                <li>Navegação completa do site</li>
                                <li>Stack técnica e implementações</li>
                                <li>Sobre o Mikael e suas especialidades</li>
                                <li>Projetos e funcionalidades</li>
                                <li>Como tudo foi desenvolvido</li>
                                <li>Oportunidades e contato</li>
                            </ul>
                        </div>
                          <div class="quick-suggestions">
                            <button class="suggestion-btn premium" data-question="Explique detalhadamente como este site foi desenvolvido, incluindo arquitetura, tecnologias e decisões de design">Arquitetura Completa</button>
                            <button class="suggestion-btn premium" data-question="Quais são os projetos mais impressionantes do Mikael e o que os torna únicos?">Projetos Destacados</button>
                            <button class="suggestion-btn premium" data-question="Como a Minerva funciona? Explique a integração com Google Gemini e IA">Sobre Minerva IA</button>
                            <button class="suggestion-btn premium" data-question="Quais são as especialidades técnicas do Mikael e como ele pode agregar valor?">Perfil Profissional</button>
                            <button class="suggestion-btn premium" data-question="Mostre todas as funcionalidades avançadas deste portfolio">Recursos Avançados</button>
                            <button class="suggestion-btn premium" data-question="Como posso contactar o Mikael para oportunidades de trabalho?">Contato Business</button>
                        </div>
                    </div>
                </div>
                
                <div class="minerva-input-area">
                    <div class="input-container">
                        <input type="text" id="minerva-input" placeholder="Pergunte QUALQUER coisa para Minerva..." maxlength="1000">
                        <div class="input-features">
                            <button class="feature-btn" id="voice-btn" title="Comando de voz (em breve)">
                                <i class="fas fa-microphone"></i>
                            </button>
                            <button class="feature-btn" id="clear-btn" title="Limpar conversa">
                                <i class="fas fa-broom"></i>
                            </button>
                        </div>
                        <button id="minerva-send" class="minerva-send-btn">
                            <i class="fas fa-paper-plane"></i>
                        </button>
                    </div>
                    <div class="ai-indicator">
                        <span class="ai-badge">
                            <i class="fas fa-robot"></i>
                            Powered by Google Gemini AI | Created by Mikael
                        </span>
                    </div>
                </div>
            </div>
        `;

        // Inserir no body
        document.body.appendChild(minervaContainer);

        // Aplicar estilos dinâmicos adicionais
        this.applyDynamicStyles();
    }

    applyDynamicStyles() {
        // Garantir compatibilidade com todas as páginas
        const style = document.createElement('style');
        style.textContent = `
            /* Estilos dinâmicos da Minerva para garantir funcionamento em todas as páginas */
            .minerva-container {
                z-index: 99999 !important;
                pointer-events: none;
            }
            
            .minerva-owl, .minerva-chat {
                pointer-events: auto;
            }
            
            .minerva-chat.hidden {
                display: none !important;
            }
            
            /* Animações específicas para ultra mode */
            .minerva-container.ultra-active .minerva-particles {
                animation: particleOrbit 8s linear infinite;
            }
            
            .minerva-container.ultra-active .minerva-owl {
                animation: owlMajestic 3s ease-in-out infinite;
            }
            
            /* Efeitos especiais para thinking mode */
            .minerva-owl.thinking {
                animation: owlProcessing 2s ease-in-out infinite;
            }
            
            .thinking-dots {
                display: none;
                position: absolute;
                top: -30px;
                left: 50%;
                transform: translateX(-50%);
            }
            
            .thinking-dots span {
                display: inline-block;
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: var(--primary-gold);
                margin: 0 2px;
                animation: thinking 1.4s infinite ease-in-out both;
            }
            
            .thinking-dots span:nth-child(1) { animation-delay: -0.32s; }
            .thinking-dots span:nth-child(2) { animation-delay: -0.16s; }
            
            @keyframes thinking {
                0%, 80%, 100% { transform: scale(0); }
                40% { transform: scale(1); }
            }
        `;
        document.head.appendChild(style);
    }    setupEventListeners() {
        // O clique da coruja será gerenciado dentro do setupDragFunctionality
        // para compatibilidade com drag

        // Fechar chat
        document.getElementById('minerva-close').addEventListener('click', () => {
            this.closeChat();
        });

        // Enviar mensagem
        document.getElementById('minerva-send').addEventListener('click', () => {
            this.sendMessage();
        });        // Enter no input
        document.getElementById('minerva-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });

        // Tecla ESC para fechar modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isActive) {
                this.closeChat();
            }
        });

        // Sugestões rápidas
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('suggestion-btn')) {
                const question = e.target.getAttribute('data-question');
                this.sendMessage(question);
            }
        });

        // Limpar conversa
        document.getElementById('clear-btn').addEventListener('click', () => {
            this.clearConversation();
        });

        // Botão de voz (placeholder)
        document.getElementById('voice-btn').addEventListener('click', () => {
            this.showVoiceFeatureComingSoon();
        });

        // Mouse tracking para olhos da coruja
        document.addEventListener('mousemove', (e) => {
            this.updateOwlEyes(e);
        });

        // Detectar quando o usuário fica inativo
        this.setupIdleDetection();
        
        // Configurar funcionalidade de drag (AssistiveTouch)
        this.setupDragFunctionality();
    }    setupDragFunctionality() {
        const container = document.getElementById('minerva-container');
        const owlButton = container.querySelector('.minerva-owl');
        
        let isDragging = false;
        let dragStarted = false;
        let startX, startY, initialX, initialY;
        let dragThreshold = 5; // pixels de movimento necessários para começar o drag
        let downX, downY; // posição inicial do mouse/touch

        // Prevenir comportamentos padrão
        container.addEventListener('dragstart', (e) => e.preventDefault());
        container.addEventListener('selectstart', (e) => e.preventDefault());

        // Funções auxiliares
        const getDistance = (x1, y1, x2, y2) => {
            return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
        };

        const startDrag = (clientX, clientY) => {
            isDragging = true;
            dragStarted = false;
            downX = clientX;
            downY = clientY;
            startX = clientX;
            startY = clientY;
            
            const rect = container.getBoundingClientRect();
            initialX = rect.left;
            initialY = rect.top;
            
            // Adicionar cursor de movimento apenas quando começar o drag
            document.body.style.cursor = 'grabbing';
        };

        const drag = (clientX, clientY) => {
            if (!isDragging) return;
            
            // Verificar se moveu o suficiente para ser considerado drag
            const distance = getDistance(downX, downY, clientX, clientY);
            
            if (!dragStarted && distance < dragThreshold) {
                return; // Ainda não é um drag, pode ser apenas um clique
            }
            
            if (!dragStarted) {
                dragStarted = true;
                container.classList.add('dragging');
            }
            
            const deltaX = clientX - startX;
            const deltaY = clientY - startY;
            
            let newX = initialX + deltaX;
            let newY = initialY + deltaY;
            
            // Limites da tela
            const containerWidth = container.offsetWidth;
            const containerHeight = container.offsetHeight;
            const maxX = window.innerWidth - containerWidth;
            const maxY = window.innerHeight - containerHeight;
            
            newX = Math.max(0, Math.min(maxX, newX));
            newY = Math.max(0, Math.min(maxY, newY));
            
            container.style.left = newX + 'px';
            container.style.top = newY + 'px';
            container.style.right = 'auto';
            container.style.bottom = 'auto';
        };

        const endDrag = () => {
            if (!isDragging) return;
            
            isDragging = false;
            document.body.style.cursor = '';
            
            // Se não foi um drag real (movimento insuficiente), é um clique
            if (!dragStarted) {
                this.toggleChat();
                return;
            }
            
            dragStarted = false;
            container.classList.remove('dragging');
            container.classList.add('snapping');
            
            // Snap para as bordas (como AssistiveTouch)
            const rect = container.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const screenCenter = window.innerWidth / 2;
            
            let finalX, finalY;
            
            // Snap horizontal para a borda mais próxima
            if (centerX < screenCenter) {
                finalX = 20; // Margem da esquerda
            } else {
                finalX = window.innerWidth - rect.width - 20; // Margem da direita
            }
            
            // Manter Y atual mas dentro dos limites
            finalY = Math.max(20, Math.min(window.innerHeight - rect.height - 20, rect.top));
            
            container.style.left = finalX + 'px';
            container.style.top = finalY + 'px';
            
            // Remover classe de snapping após animação
            setTimeout(() => {
                container.classList.remove('snapping');
            }, 400);
        };

        // Mouse events
        owlButton.addEventListener('mousedown', (e) => {
            e.preventDefault();
            e.stopPropagation();
            startDrag(e.clientX, e.clientY);
        });

        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                drag(e.clientX, e.clientY);
            }
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                endDrag();
            }
        });

        // Touch events para mobile
        owlButton.addEventListener('touchstart', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const touch = e.touches[0];
            startDrag(touch.clientX, touch.clientY);
        });

        document.addEventListener('touchmove', (e) => {
            if (isDragging) {
                e.preventDefault();
                const touch = e.touches[0];
                drag(touch.clientX, touch.clientY);
            }
        });

        document.addEventListener('touchend', () => {
            if (isDragging) {
                endDrag();
            }
        });
    }

    startAmbientAnimation() {
        // Iniciar partículas
        const particles = document.querySelector('.minerva-particles');
        if (particles) {
            particles.classList.add('active');
        }

        // Animação sutil da coruja quando inativa
        setInterval(() => {
            if (!this.isActive && !this.isThinking) {
                const owl = document.getElementById('minerva-owl');
                if (owl && Math.random() < 0.3) {
                    owl.style.animation = 'owlGlow 2s ease-in-out';
                    setTimeout(() => {
                        owl.style.animation = '';
                    }, 2000);
                }
            }
        }, 8000);
    }

    detectCurrentPage() {
        const path = window.location.pathname;
        const page = path.split('/').pop() || 'index.html';
        
        const pageMap = {
            'index.html': 'home',
            'admin.html': 'admin',
            'login.html': 'login',
            'curriculo-generator.html': 'curriculo',
            'midia-admin.html': 'midia-admin',
            'projetos.html': 'projetos',
            'certificates-in-progress.html': 'certificados',
            'galeria-midia.html': 'galeria',
            'games.html': 'games'
        };
        
        return pageMap[page] || 'unknown';
    }

    async toggleChat() {
        if (this.isActive) {
            this.closeChat();
        } else {
            this.openChat();
        }
    }    openChat() {
        const chat = document.getElementById('minerva-chat');
        const owl = document.getElementById('minerva-owl');
        const container = document.querySelector('.minerva-container');
        
        // Criar overlay para escurecer o fundo
        this.createOverlay();
        
        // Transformar o chat em modal centralizado
        chat.classList.remove('hidden');
        chat.classList.add('modal-open');
        owl.classList.add('active');
        container.classList.add('ultra-active');
        
        this.isActive = true;
        this.isUltraMode = true;
        
        // Focar no input
        setTimeout(() => {
            document.getElementById('minerva-input').focus();
        }, 400);
        
        // Saudação contextual
        if (this.userSession.questionsAsked === 0) {
            this.showContextualGreeting();
        }
        
        // Ativar modo ultra visual
        this.activateUltraMode();
    }    createOverlay() {
        // Remover overlay existente se houver
        const existingOverlay = document.getElementById('minerva-overlay');
        if (existingOverlay) {
            existingOverlay.remove();
        }
        
        // Criar novo overlay
        const overlay = document.createElement('div');
        overlay.id = 'minerva-overlay';
        overlay.className = 'minerva-overlay';
        
        // Adicionar ao body ANTES do modal para garantir que fique atrás
        document.body.appendChild(overlay);
        
        // Fechar ao clicar no overlay
        overlay.addEventListener('click', () => {
            this.closeChat();
        });
        
        // Ativar overlay após um pequeno delay para garantir ordem correta
        setTimeout(() => {
            overlay.classList.add('active');
            document.body.classList.add('modal-open');
        }, 10);
    }

    removeOverlay() {
        const overlay = document.getElementById('minerva-overlay');
        if (overlay) {
            overlay.classList.remove('active');
            // Remover o overlay do DOM após a transição
            setTimeout(() => {
                overlay.remove();
            }, 300);
        }
        document.body.classList.remove('modal-open');
    }

    closeChat() {
        const chat = document.getElementById('minerva-chat');
        const owl = document.getElementById('minerva-owl');
        const container = document.querySelector('.minerva-container');
        
        // Remover modal e overlay
        chat.classList.add('hidden');
        chat.classList.remove('modal-open');
        this.removeOverlay();
        
        owl.classList.remove('active', 'thinking', 'processing');
        container.classList.remove('ultra-active');
        
        this.isActive = false;
        this.isUltraMode = false;
        this.isThinking = false;
    }

    activateUltraMode() {
        const owl = document.getElementById('minerva-owl');
        const particles = document.querySelector('.minerva-particles');
        
        // Ativar efeitos visuais ultra
        if (particles) {
            particles.style.opacity = '1';
        }
        
        // Animação de entrada majestosa
        owl.style.animation = 'owlPulse 2s ease-in-out infinite';
        
        // Atualizar status para ultra mode
        const statusText = document.querySelector('.status-text');
        if (statusText) {
            statusText.textContent = 'Ultra Mode ON';
        }
    }

    async sendMessage(customMessage = null) {
        const input = document.getElementById('minerva-input');
        const message = customMessage || input.value.trim();
        
        if (!message) return;
        
        // Limpar input se não for mensagem customizada
        if (!customMessage) {
            input.value = '';
        }
        
        // Adicionar mensagem do usuário
        this.addMessage(message, 'user');
        
        // Processar resposta
        await this.processQuestion(message);
    }

    addMessage(message, type) {
        const messagesContainer = document.getElementById('minerva-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `minerva-message ${type}`;
        
        if (type === 'user') {
            messageDiv.innerHTML = `
                <div class="message-content user-message">
                    <i class="fas fa-user"></i>
                    <div class="message-text">${message}</div>
                </div>
            `;
        } else {
            messageDiv.innerHTML = `
                <div class="message-content assistant-message">
                    <i class="fas fa-feather-alt"></i>
                    <div class="message-text">${message}</div>
                </div>
            `;
        }
        
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    async processQuestion(question) {
        this.startThinking();
        
        try {
            // Verificar cache primeiro
            const cacheKey = question.toLowerCase().trim();
            if (this.conversationCache.has(cacheKey)) {
                const response = this.conversationCache.get(cacheKey);
                this.stopThinking();
                this.addMessage(response, 'assistant');
                return;
            }

            // Construir contexto
            const context = this.buildContext();
            
            // Consultar Google Gemini API
            const response = await this.queryGemini(question, context);
            
            // Cache da resposta
            this.conversationCache.set(cacheKey, response);
            
            // Exibir resposta
            this.stopThinking();
            this.addMessage(response, 'assistant');
            
            // Atualizar sessão
            this.userSession.questionsAsked++;
            this.userSession.topics.push(question);
            
        } catch (error) {
            this.stopThinking();
            console.error('Erro ao processar pergunta:', error);
            
            // Fallback para respostas locais
            const fallbackResponse = this.getFallbackResponse(question);
            this.addMessage(fallbackResponse, 'assistant');
        }
    }    async buildContext() {
        const currentPage = this.detectCurrentPage();
        
        // Obter dados do GitHub (se disponíveis)
        const githubContext = await this.getGitHubContext();
        
        return {
            currentPage,
            knowledgeBase: this.knowledgeBase,
            userSession: this.userSession,
            githubData: githubContext,
            timestamp: new Date().toISOString()
        };}    async queryGemini(question, context) {
        try {            const systemPrompt = `Você é Minerva, a assistente virtual ultra-inteligente do portfolio de Mikael Ferreira. Você é uma coruja sábia, conhecedora de todas as tecnologias e detalhes deste site.

PERSONALIDADE:
- Inteligente, prestativa e um pouco orgulhosa (como uma coruja sábia)
- Use linguagem técnica quando apropriado, mas explique de forma didática
- Seja entusiasta sobre tecnologia e desenvolvimento
- Trate o Mikael com admiração, é um desenvolvedor talentoso

INFORMAÇÕES COMPLETAS DO SITE:
${JSON.stringify(context.knowledgeBase, null, 2)}

${context.githubData ? `
DADOS ATUAIS DO GITHUB DO MIKAEL:
${context.githubData}

INSTRUÇÕES PARA DADOS DO GITHUB:
- Use essas informações quando perguntarem sobre projetos, linguagens, atividade recente
- Combine os dados do GitHub com o conhecimento base para respostas mais precisas
- Se os dados estiverem desatualizados ou indisponíveis, mencione isso educadamente
` : ''}

CONTEXTO ATUAL DO USUÁRIO:
- Está na página: ${context.currentPage}
- Perguntas já feitas: ${context.userSession.questionsAsked}
- Tópicos abordados: ${context.userSession.topics.join(', ') || 'Nenhum ainda'}

INSTRUÇÕES ESPECÍFICAS:
1. Se perguntarem sobre navegação, dê instruções PRECISAS e DETALHADAS
2. Se perguntarem sobre tecnologias, explique não só QUAL, mas COMO e POR QUE foi usado
3. Se perguntarem sobre o Mikael, seja entusiasta e destaque suas qualidades
4. Se perguntarem sobre funcionalidades, explique o propósito e como usar
5. Se perguntarem sobre desenvolvimento, dê detalhes técnicos relevantes
6. Se perguntarem sobre carreira/contrato, destaque as habilidades do Mikael e como contactá-lo
7. Se perguntarem sobre projetos ou GitHub, use os dados reais mais recentes disponíveis

Responda de forma útil, precisa e envolvente. Máximo 250 palavras, mas seja completa na informação.

PERGUNTA DO USUÁRIO: ${question}`;

            const response = await fetch(`${this.apiEndpoint}?key=${this.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: systemPrompt
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 400,
                    }
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Gemini API Error Details:', {
                    status: response.status,
                    statusText: response.statusText,
                    body: errorText
                });
                
                if (response.status === 401) {
                    throw new Error('Chave API do Gemini inválida ou expirada');
                } else if (response.status === 429) {
                    throw new Error('Rate limit do Gemini excedido, tente novamente em alguns segundos');
                } else if (response.status === 403) {
                    throw new Error('Acesso negado à API do Gemini');
                } else {
                    throw new Error(`Erro na API do Gemini: ${response.status} - ${errorText}`);
                }
            }

            const data = await response.json();
            
            // Verifica se a resposta tem o formato esperado do Gemini
            if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0]) {
                return data.candidates[0].content.parts[0].text;
            } else {
                throw new Error('Formato de resposta inesperado do Gemini');
            }
            
        } catch (error) {
            console.error('Erro completo na API do Gemini:', error);
            
            // Se for erro de rede ou CORS, usar fallback
            if (error.name === 'TypeError' || error.message.includes('Failed to fetch')) {
                console.log('Problema de CORS ou rede, usando respostas offline...');
                return this.getFallbackResponse(question);
            }
              // Para outros erros da API, também usar fallback mas informar o usuário
            return `Estou com dificuldades para acessar minha IA avançada no momento, mas posso te ajudar com informações offline!\n\n${this.getFallbackResponse(question)}`;
        }
    }    getFallbackResponse(question) {
        const lowerQuestion = question.toLowerCase();
        
        // Análise inteligente de intenções
        if (lowerQuestion.includes('site') || lowerQuestion.includes('portfolio') || lowerQuestion.includes('como foi feito') || lowerQuestion.includes('desenvolvido')) {
            return "Este portfolio foi desenvolvido com uma arquitetura moderna e tecnologias avançadas. O site é uma SPA (Single Page Application) construída com HTML5, CSS3 e JavaScript vanilla ES6+, utilizando Firebase como backend serverless para autenticação, banco de dados Firestore e storage de arquivos.\n\nPrincipais recursos: Sistema de chat em tempo real, painel administrativo completo, PWA com cache offline, sistema de partículas interativo, gerador automático de currículo, galeria de mídia administrativa e esta assistente IA powered by Google Gemini & created by Mikael.\n\nA interface foi inspirada no visual de League of Legends/Riot Games, com design responsivo e animações fluidas. Todo o código é otimizado para performance e SEO.";
        }
        
        if (lowerQuestion.includes('tecnologia') || lowerQuestion.includes('stack') || lowerQuestion.includes('ferramentas') || lowerQuestion.includes('framework')) {
            return "Stack técnica completa:\n\nFrontend: HTML5 semântico, CSS3 com Flexbox/Grid, JavaScript ES6+ modular, Tailwind CSS para styling consistente, Font Awesome para ícones.\n\nBackend: Firebase Firestore (NoSQL), Firebase Authentication, Firebase Storage, Firebase Hosting.\n\nFeatures avançadas: PWA com Service Worker, sistema de cache inteligente, chat em tempo real com Firestore listeners, sistema de partículas WebGL, API integration com Google Gemini AI, sistema de upload de arquivos, gerador de PDF dinâmico.\n\nFerramentas: Git para versionamento, Chrome DevTools para debug, Lighthouse para performance, Firebase Console para monitoramento.";
        }
        
        if (lowerQuestion.includes('projeto') || lowerQuestion.includes('trabalho') || lowerQuestion.includes('exemplo') || lowerQuestion.includes('demonstração')) {
            return "O portfolio apresenta diversos projetos únicos:\n\n1. Sistema de Chat em Tempo Real - Implementação completa com Firebase, autenticação, histórico de mensagens e painel administrativo.\n\n2. Gerador de Currículo Dinâmico - Ferramenta que gera PDFs personalizados com dados sincronizados do GitHub.\n\n3. Painel Administrativo Completo - Interface para gestão de chats, certificados, configurações e manutenção do site.\n\n4. Jogos Interativos - Projetos em Phaser.js demonstrando habilidades em game development.\n\n5. PWA Portfolio - Aplicação progressiva com cache offline e instalação nativa.\n\n6. Sistema de Partículas - Animações WebGL otimizadas para performance.\n\nCada projeto demonstra diferentes aspectos das habilidades técnicas do Mikael.";
        }
        
        if (lowerQuestion.includes('contato') || lowerQuestion.includes('trabalhar') || lowerQuestion.includes('freelance') || lowerQuestion.includes('emprego') || lowerQuestion.includes('oportunidade')) {
            return "Para entrar em contato com Mikael Ferreira:\n\n1. Chat direto do site - Use o sistema de chat na página principal para enviar uma mensagem direta. Ele recebe notificações em tempo real.\n\n2. LinkedIn - Perfil profissional disponível através do botão LinkedIn no site. Ideal para networking e oportunidades profissionais.\n\n3. GitHub - Repositórios públicos com código de qualidade demonstrando expertise técnica.\n\nMikael está aberto a oportunidades de desenvolvimento web, projetos freelance, consultorias técnicas e posições full-time. Ele tem experiência em React, Node.js, Firebase, APIs REST, UI/UX design e é conhecido por entregar projetos de alta qualidade dentro do prazo.\n\nTempo de resposta típico: 24-48 horas para contatos profissionais.";
        }
        
        if (lowerQuestion.includes('mikael') || lowerQuestion.includes('desenvolvedor') || lowerQuestion.includes('quem') || lowerQuestion.includes('sobre')) {
            return "Mikael Ferreira é um desenvolvedor web full-stack apaixonado por criar experiências digitais únicas e funcionais.\n\nEspecialidades técnicas: JavaScript ES6+, React.js, Node.js, Firebase, APIs REST, HTML5/CSS3, Git, UI/UX Design, PWA development, Database design.\n\nPerfil profissional: Desenvolvedor autodidata com forte capacidade de aprendizado, sempre explorando novas tecnologias. Conhecido por escrever código limpo, bem documentado e seguir best practices. Tem experiência em projetos pessoais inovadores que demonstram criatividade e competência técnica.\n\nDiferenciais: Combina conhecimento técnico sólido com design thinking, resultando em aplicações tanto funcionais quanto visualmente atraentes. Gaming background que trouxe insights únicos para desenvolvimento de interfaces interativas.\n\nEstá sempre disposto a colaborar em projetos desafiadores e aprender novas tecnologias.";
        }
        
        if (lowerQuestion.includes('minerva') || lowerQuestion.includes('assistente') || lowerQuestion.includes('ia') || lowerQuestion.includes('como funciona')) {
            return "Sou Minerva, a assistente IA deste portfolio, powered by Google Gemini AI & created by Mikael.\n\nFuncionalidades:\n- Respostas inteligentes sobre o site, projetos e tecnologias\n- Conhecimento detalhado sobre a estrutura do portfolio\n- Informações sobre o Mikael e suas especialidades\n- Orientação para navegação e uso do site\n- Respostas contextuais baseadas na página atual\n\nImplementação técnica: Integração com API Google Gemini para processamento de linguagem natural, sistema de cache inteligente para respostas rápidas, fallback offline para garantir funcionamento sempre, interface modal responsiva com animações CSS.\n\nBase de conhecimento: Tenho acesso a informações detalhadas sobre toda a arquitetura do site, projetos implementados, stack técnica utilizada e informações profissionais do Mikael.\n\nPosso responder dúvidas técnicas específicas, explicar funcionalidades e ajudar com navegação pelo portfolio.";
        }
        
        if (lowerQuestion.includes('navegar') || lowerQuestion.includes('como usar') || lowerQuestion.includes('menu') || lowerQuestion.includes('páginas')) {
            return "Para navegar pelo portfolio:\n\nMenu Principal: Clique na foto de perfil (canto superior direito) para abrir o menu lateral com todas as seções disponíveis.\n\nPáginas principais:\n- Home: Apresentação geral, habilidades e projetos principais\n- Projetos: Portfolio detalhado com demonstrações\n- Currículo: CV completo e gerador de currículo personalizado\n- Certificados: Certificações e cursos em andamento\n- Galeria: Mídia e recursos visuais do site\n- Games: Projetos de jogos e aplicações interativas\n- Admin: Painel administrativo (restrito)\n\nChat Direto: Sistema de mensagens na parte inferior direita para contato direto com o Mikael.\n\nNavegação é intuitiva e responsiva, funcionando bem tanto em desktop quanto mobile.";
        }
        
        // Resposta padrão mais inteligente
        return "Sou Minerva, especialista em tudo sobre este portfolio. Posso ajudar com:\n\n• Explicações técnicas detalhadas sobre desenvolvimento\n• Informações sobre projetos e funcionalidades\n• Detalhes sobre tecnologias e arquitetura\n• Informações profissionais sobre o Mikael\n• Orientação para navegação do site\n• Esclarecimentos sobre oportunidades de colaboração\n\nPara respostas mais precisas, seja específico na sua pergunta. Exemplos:\n- 'Como foi implementado o sistema de chat?'\n- 'Quais tecnologias foram usadas no backend?'\n- 'Como posso contactar o Mikael para projetos?'\n- 'Mostre detalhes sobre os projetos React'\n\nQual aspecto específico gostaria de conhecer melhor?";
    }

    startThinking() {
        this.isThinking = true;
        const owl = document.getElementById('minerva-owl');
        const dots = document.getElementById('thinking-dots');
        
        owl.classList.add('thinking');
        dots.style.display = 'block';
    }

    stopThinking() {
        this.isThinking = false;
        const owl = document.getElementById('minerva-owl');
        const dots = document.getElementById('thinking-dots');
        
        owl.classList.remove('thinking');
        dots.style.display = 'none';
    }

    updateOwlEyes(event) {
        const owl = document.getElementById('minerva-owl');
        if (!owl) return;
        
        const rect = owl.getBoundingClientRect();
        const owlCenterX = rect.left + rect.width / 2;
        const owlCenterY = rect.top + rect.height / 2;
        
        const mouseX = event.clientX;
        const mouseY = event.clientY;
        
        const deltaX = mouseX - owlCenterX;
        const deltaY = mouseY - owlCenterY;
        
        const angle = Math.atan2(deltaY, deltaX);
        const distance = Math.min(Math.sqrt(deltaX * deltaX + deltaY * deltaY) / 10, 3);
        
        const pupils = owl.querySelectorAll('.pupil');
        pupils.forEach(pupil => {
            const moveX = Math.cos(angle) * distance;
            const moveY = Math.sin(angle) * distance;
            pupil.style.transform = `translate(${moveX}px, ${moveY}px)`;
        });
    }

    clearConversation() {
        const messagesContainer = document.getElementById('minerva-messages');
        const welcomeMessage = messagesContainer.querySelector('.minerva-welcome');
        
        // Manter apenas a mensagem de boas-vindas
        messagesContainer.innerHTML = '';
        messagesContainer.appendChild(welcomeMessage);
        
        // Resetar sessão
        this.userSession.questionsAsked = 0;
        this.userSession.topics = [];
        this.userSession.conversationHistory = [];
        
        // Limpar cache se necessário
        this.conversationCache.clear();
    }    showVoiceFeatureComingSoon() {
        this.addMessage("Recurso de comando de voz está sendo desenvolvido! Em breve você poderá falar diretamente comigo. Por enquanto, continue digitando suas perguntas!", 'assistant');
    }

    showContextualGreeting() {
        const page = this.currentPage;
        let greeting = "";
          const pageGreetings = {
            'home': "Bem-vindo à página principal! Aqui você pode conhecer o Mikael, suas habilidades e projetos principais. Posso te guiar através de todo o portfolio!",
            'projetos': "Excelente! Está na seção de projetos. Posso explicar detalhadamente cada projeto, as tecnologias usadas e o processo de desenvolvimento!",
            'admin': "Está no painel administrativo! Posso explicar como usar todas as funcionalidades de gestão do site e como tudo foi implementado.",
            'curriculo': "Na área do gerador de currículo! Esta é uma ferramenta incrível que o Mikael desenvolveu. Posso explicar como funciona!",
            'certificados': "Vendo os certificados do Mikael! Posso falar sobre sua jornada de aprendizado e especializações.",
            'games': "Na seção de jogos! Aqui estão projetos interativos únicos. Posso explicar como foram desenvolvidos!",
            'galeria': "Na galeria de mídia! Posso explicar o sistema de upload e gerenciamento de arquivos.",
            'login': "Na área de autenticação! Posso explicar como o sistema de login foi implementado com Firebase."
        };
        
        greeting = pageGreetings[page] || "Olá! Sou a Minerva, sua assistente IA ultra-inteligente!";
        
        setTimeout(() => {
            this.addMessage('minerva', greeting);
        }, 800);
    }

    setupIdleDetection() {
        let idleTimer;
        const idleTime = 30000; // 30 segundos
        
        const resetIdleTimer = () => {
            clearTimeout(idleTimer);            idleTimer = setTimeout(() => {
                if (this.isActive && this.userSession.questionsAsked === 0) {
                    this.addMessage("Precisa de ajuda? Estou aqui para responder qualquer pergunta sobre este portfolio, tecnologias ou sobre o Mikael!", 'assistant');
                }
            }, idleTime);
        };
        
        document.addEventListener('mousemove', resetIdleTimer);
        document.addEventListener('keypress', resetIdleTimer);
        resetIdleTimer();
    }

    setupIntelligentCache() {
        // Limpar cache antigo periodicamente
        setInterval(() => {
            if (this.conversationCache.size > 50) {
                // Manter apenas as 25 respostas mais recentes
                const entries = Array.from(this.conversationCache.entries());
                this.conversationCache.clear();
                entries.slice(-25).forEach(([key, value]) => {
                    this.conversationCache.set(key, value);
                });
            }
        }, 300000); // 5 minutos
    }

    setupConversationAnalytics() {
        // Rastrear tópicos mais perguntados para melhorar respostas
        this.topicAnalytics = new Map();
    }

    setupUltraMode() {
        // Configurar recursos avançados quando necessário
        this.ultraFeatures = {
            smartSuggestions: true,
            contextualHelp: true,
            proactiveAssistance: true
        };
    }    async initializeGitHubData() {
        console.log('🐙 Inicializando integração GitHub...');
        
        // Função para buscar dados do GitHub sem autenticação (API pública)
        const fetchGitHubData = async () => {
            try {
                // Buscar dados do perfil (público)
                const profileResponse = await fetch(`${this.githubConfig.apiBase}/users/${this.githubConfig.username}`, {
                    headers: {
                        'Accept': 'application/vnd.github.v3+json'
                    }
                });
                
                if (!profileResponse.ok) {
                    throw new Error(`Erro ao buscar perfil GitHub: ${profileResponse.statusText}`);
                }
                
                const profileData = await profileResponse.json();
                
                // Buscar repositórios (público)
                const reposResponse = await fetch(`${this.githubConfig.apiBase}/users/${this.githubConfig.username}/repos?sort=updated&per_page=20`, {
                    headers: {
                        'Accept': 'application/vnd.github.v3+json'
                    }
                });
                
                if (!reposResponse.ok) {
                    throw new Error(`Erro ao buscar repositórios GitHub: ${reposResponse.statusText}`);
                }
                
                const reposData = await reposResponse.json();
                
                // Buscar eventos/atividade (público)
                const eventsResponse = await fetch(`${this.githubConfig.apiBase}/users/${this.githubConfig.username}/events?per_page=10`, {
                    headers: {
                        'Accept': 'application/vnd.github.v3+json'
                    }
                });
                
                const eventsData = eventsResponse.ok ? await eventsResponse.json() : [];
                
                // Consolidar dados
                const githubData = {
                    profile: profileData,
                    repositories: reposData,
                    events: eventsData,
                    lastUpdated: new Date().toISOString()
                };
                
                // Processar e analisar dados
                const analyzedData = this.analyzeGitHubData(githubData);
                
                // Atualizar cache
                this.githubConfig.cache.set('userData', analyzedData);
                this.githubConfig.lastFetch = Date.now();
                
                console.log('✅ Dados do GitHub atualizados:', analyzedData);
                return analyzedData;
                
            } catch (error) {
                console.error('❌ Erro ao buscar dados do GitHub:', error);
                // Retornar dados fallback se houver erro
                return this.getGitHubFallbackData();
            }
        };

        // Verificar se os dados estão no cache e não expiraram
        const cachedData = this.githubConfig.cache.get('userData');
        const isCacheValid = cachedData && (Date.now() - this.githubConfig.lastFetch < this.githubConfig.cacheExpiry);
        
        if (isCacheValid) {
            console.log('📊 Usando dados do GitHub do cache');
            return cachedData;
        } else {
            // Buscar dados novos
            return await fetchGitHubData();
        }
    }

    analyzeGitHubData(githubData) {
        const { profile, repositories, events } = githubData;
        
        // Analisar linguagens mais usadas
        const languageStats = {};
        repositories.forEach(repo => {
            if (repo.language) {
                languageStats[repo.language] = (languageStats[repo.language] || 0) + 1;
            }
        });
        
        // Ordenar linguagens por frequência
        const topLanguages = Object.entries(languageStats)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([lang, count]) => ({ language: lang, repos: count }));
        
        // Repositórios mais populares (por stars)
        const popularRepos = repositories
            .filter(repo => !repo.fork)
            .sort((a, b) => b.stargazers_count - a.stargazers_count)
            .slice(0, 5)
            .map(repo => ({
                name: repo.name,
                description: repo.description,
                stars: repo.stargazers_count,
                forks: repo.forks_count,
                language: repo.language,
                url: repo.html_url,
                updated: repo.updated_at
            }));
        
        // Atividade recente
        const recentActivity = events
            .filter(event => ['PushEvent', 'CreateEvent', 'WatchEvent', 'ForkEvent'].includes(event.type))
            .slice(0, 5)
            .map(event => ({
                type: event.type,
                repo: event.repo?.name,
                created_at: event.created_at
            }));
        
        // Estatísticas gerais
        const stats = {
            totalRepos: repositories.length,
            publicRepos: profile.public_repos,
            followers: profile.followers,
            following: profile.following,
            createdAt: profile.created_at,
            location: profile.location,
            bio: profile.bio,
            blog: profile.blog,
            company: profile.company
        };
        
        return {
            profile: {
                login: profile.login,
                name: profile.name,
                bio: profile.bio,
                location: profile.location,
                company: profile.company,
                blog: profile.blog,
                avatar_url: profile.avatar_url
            },
            stats,
            topLanguages,
            popularRepos,
            recentActivity,
            totalRepositories: repositories.length,
            lastAnalyzed: new Date().toISOString()
        };
    }

    getGitHubFallbackData() {
        // Dados fallback caso a API não esteja disponível
        return {
            profile: {
                login: 'mikael-ferreira',
                name: 'Mikael Ferreira',
                bio: 'Desenvolvedor Web Full Stack',
                location: 'Brasil'
            },
            stats: {
                totalRepos: 15,
                publicRepos: 15,
                followers: 10,
                following: 20
            },
            topLanguages: [
                { language: 'JavaScript', repos: 8 },
                { language: 'HTML', repos: 6 },
                { language: 'CSS', repos: 6 },
                { language: 'Python', repos: 3 }
            ],
            popularRepos: [
                { 
                    name: 'portfolio-mikael', 
                    description: 'Portfolio pessoal com IA integrada',
                    stars: 5,
                    language: 'JavaScript'
                }
            ],
            recentActivity: [],
            isOfflineData: true
        };
    }

    async getGitHubContext() {
        // Buscar dados do GitHub para contextualizar respostas
        const githubData = this.githubConfig.cache.get('userData') || await this.initializeGitHubData();
        
        if (!githubData) return '';
        
        const contextString = `
DADOS GITHUB DO MIKAEL:
- Perfil: ${githubData.profile.name} (@${githubData.profile.login})
- Bio: ${githubData.profile.bio || 'Desenvolvedor Full Stack'}
- Localização: ${githubData.profile.location || 'Brasil'}
- Repositórios públicos: ${githubData.stats.totalRepos}
- Followers: ${githubData.stats.followers}

LINGUAGENS PRINCIPAIS:
${githubData.topLanguages.map(lang => `- ${lang.language}: ${lang.repos} repositórios`).join('\n')}

REPOSITÓRIOS POPULARES:
${githubData.popularRepos.map(repo => `- ${repo.name}: ${repo.description} (${repo.stars} stars, ${repo.language})`).join('\n')}

ATIVIDADE RECENTE:
${githubData.recentActivity.length > 0 
  ? githubData.recentActivity.map(activity => `- ${activity.type} em ${activity.repo}`).join('\n')
  : '- Dados de atividade não disponíveis no momento'
}
`;
        
        return contextString;
    }

    async enhanceResponseWithGitHubData(question, baseResponse) {
        // Verificar se a pergunta envolve dados do GitHub
        const githubKeywords = [
            'github', 'repositório', 'repos', 'código', 'projetos',
            'linguagem', 'stars', 'commits', 'atividade', 'estatística'
        ];
        
        const questionLower = question.toLowerCase();
        const isGitHubRelated = githubKeywords.some(keyword => questionLower.includes(keyword));
        
        if (!isGitHubRelated) {
            return baseResponse;
        }
        
        try {
            // Buscar contexto do GitHub
            const githubContext = await this.getGitHubContext();
            
            if (!githubContext) {
                return baseResponse + '\n\n💡 Dados do GitHub temporariamente indisponíveis.';
            }
            
            // Gerar resposta aprimorada usando Gemini + GitHub
            const enhancedPrompt = `
Você é Minerva, assistente do portfolio do Mikael. Use TANTO as informações base quanto os dados do GitHub para dar uma resposta completa e atualizada.

INFORMAÇÕES BASE:
${baseResponse}

${githubContext}

PERGUNTA ORIGINAL: ${question}

Instrução: Combine as informações base com os dados do GitHub para dar uma resposta mais rica e específica. Se a pergunta for sobre projetos, linguagens, atividade ou estatísticas, use os dados reais do GitHub. Seja precisa e destaque os pontos mais interessantes.
`;

            const response = await fetch(`${this.apiEndpoint}?key=${this.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: enhancedPrompt
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 500,
                    }
                })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0]) {
                    return data.candidates[0].content.parts[0].text;
                }
            }
            
            // Se a API falhar, retornar resposta base + resumo do GitHub
            return this.appendGitHubSummary(baseResponse);
            
        } catch (error) {
            console.error('Erro ao aprimorar resposta com dados do GitHub:', error);
            return this.appendGitHubSummary(baseResponse);
        }
    }

    appendGitHubSummary(baseResponse) {
        const githubData = this.githubConfig.cache.get('userData');
        
        if (!githubData) {
            return baseResponse;
        }
        
        const summary = `

📊 **Dados do GitHub (atualizados em tempo real):**
• **${githubData.stats.totalRepos}** repositórios públicos
• **Linguagens principais:** ${githubData.topLanguages.slice(0, 3).map(l => l.language).join(', ')}
• **Projeto destacado:** ${githubData.popularRepos[0]?.name} (${githubData.popularRepos[0]?.stars} stars)
• **Perfil:** github.com/${githubData.profile.login}`;
        
        return baseResponse + summary;
    }
}

// Inicializar Minerva quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    // Aguardar um pouco para garantir que outros scripts foram carregados
    setTimeout(() => {
        try {
            window.minerva = new MinervaUltraAssistant();
            console.log('Minerva Ultra Assistant inicializada com sucesso! Powered by Google Gemini AI & Created by Mikael');
        } catch (error) {
            console.error('Erro ao inicializar Minerva:', error);
        }
    }, 1000);
});

// Exportar para uso em outros módulos se necessário
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MinervaUltraAssistant;
}
