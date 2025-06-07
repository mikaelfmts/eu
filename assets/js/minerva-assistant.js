// Ultra Evolved Minerva Assistant with Google Gemini Integration
// Importar sistema centralizado de rate limiting
import { gitHubAPI } from './github-rate-limit.js';

class MinervaUltraAssistant {
    constructor() {
        this.isOpen = false;
        this.isProcessing = false;
        this.messageHistory = [];
        this.knowledgeBase = this.initializeKnowledgeBase();
        this.apiEndpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';
        this.apiKey = 'AIzaSyDMxTyUdbZ41HgiLb-3hE4mrTZ3GnlnJuE'; // Google Gemini API Key
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
            conversationHistory: []
        };
        
        // GitHub Integration System - usando sistema centralizado
        this.githubIntegration = {
            enabled: true,
            cache: new Map(),
            fileContentCache: new Map(),
            // Rate limiting agora gerenciado pelo sistema centralizado
            api: gitHubAPI, // Referência ao sistema centralizado
            fileAnalysis: {
                enabled: true,
                maxFileSize: 500 * 1024, // 500KB máximo por arquivo
                allowedExtensions: ['.js', '.html', '.css', '.json', '.md', '.txt', '.py', '.jsx', '.ts', '.tsx'],
                cacheDuration: 60 * 60 * 1000, // 1 hora cache para arquivos (mudam menos)
                priorityFiles: ['README.md', 'package.json', 'index.html', 'script.js'], // Arquivos mais importantes
                maxFilesPerRepo: 10 // Máximo 10 arquivos por repositório
            },
            lastFetch: 0,
            cacheDuration: 15 * 60 * 1000 // 15 minutos cache para Minerva
        };
        
        this.init();
    }    initializeKnowledgeBase() {
        return {
            owner: {
                name: "Mikael Ferreira",
                profession: "Desenvolvedor Web Full Stack",
                specialties: ["Frontend", "Backend", "JavaScript", "Python", "React", "Node.js", "Firebase", "APIs REST", "UI/UX Design", "PWA Development"],
                experience: "Desenvolvedor apaixonado por criar experiências digitais únicas e funcionais",
                skills: {
                    frontend: {
                        languages: ["HTML5", "CSS3", "JavaScript ES6+", "TypeScript"],
                        frameworks: ["React.js", "Vue.js", "Angular basics"],
                        styling: ["Tailwind CSS", "Bootstrap", "SASS/SCSS", "CSS Grid", "Flexbox"],
                        tools: ["Webpack", "Vite", "Parcel", "NPM", "Yarn"]
                    },
                    backend: {
                        languages: ["Node.js", "Python", "PHP basics"],
                        databases: ["Firebase Firestore", "MongoDB", "MySQL", "PostgreSQL"],
                        apis: ["REST", "GraphQL", "WebSockets", "Real-time systems"],
                        cloud: ["Firebase", "Vercel", "Netlify", "Heroku"]
                    },
                    tools: ["Git", "VS Code", "Chrome DevTools", "Lighthouse", "Figma", "Adobe XD"],
                    gamedev: ["Phaser.js", "Canvas API", "WebGL", "Game mechanics", "Interactive animations"]
                },
                github: {
                    username: "mikaelfmts",
                    profile_url: "https://github.com/mikaelfmts",
                    integration_enabled: true
                },
                contact: {
                    email: "Contato através do formulário do site",
                    github: "https://github.com/mikaelfmts",
                    linkedin: "Perfil profissional disponível no site",
                    availability: "Aberto para oportunidades, projetos freelance e colaborações"
                },
                personality: {
                    traits: ["Autodidata", "Detalhista", "Criativo", "Orientado a resultados", "Comunicativo"],
                    approach: "Combina conhecimento técnico sólido com design thinking",
                    philosophy: "Acredita em código limpo, bem documentado e experiências de usuário excepcionais"
                }
            },
            website: {
                name: "Portfolio Mikael Ferreira",
                theme: "Inspirado em League of Legends/Riot Games com elementos dourados e azuis",
                architecture: {
                    type: "Single Page Application (SPA)",
                    pattern: "Vanilla JavaScript modular com ES6+",
                    structure: "Arquitetura serverless com Firebase backend",
                    performance: "Otimizado para Core Web Vitals e SEO"
                },
                features: [
                    "Sistema de chat em tempo real com Firebase listeners",
                    "Painel administrativo completo com autenticação",
                    "PWA (Progressive Web App) instalável",
                    "Sistema de partículas WebGL interativo",
                    "Gerador de currículo dinâmico com export PDF",
                    "Galeria de mídia com upload base64",
                    "Sistema de certificados em progresso",
                    "Modo alternativo de tema (dark/light)",
                    "Assistente IA Minerva powered by Google Gemini",
                    "Integração GitHub API para dados dinâmicos",
                    "Sistema de relatórios/dashboards com iframe",
                    "Jogos interativos com Phaser.js"
                ],
                pages: {
                    "index.html": {
                        description: "Página principal com perfil, habilidades, projetos e seções Recent Media/Reports",
                        features: ["Hero section", "Skills showcase", "Featured projects", "LinkedIn card", "Chat system", "Minerva assistant"],
                        technical: "Controle de página dinâmico, lazy loading, animações CSS"
                    },
                    "admin.html": {
                        description: "Painel administrativo completo para gestão do site",
                        features: ["Gestão de mensagens", "Resposta a chats", "Certificados", "Configurações", "Manutenção"],
                        technical: "Tailwind CSS, Firebase Auth, real-time listeners, CRUD operations"
                    },
                    "login.html": {
                        description: "Sistema de autenticação com Firebase Auth",
                        features: ["Login seguro", "Validação", "Redirecionamento", "Recuperação de senha"],
                        technical: "Firebase Authentication, validação client-side, UX otimizada"
                    },
                    "curriculo-generator.html": {
                        description: "Ferramenta avançada para gerar currículos personalizados",
                        features: ["Formulário multi-etapas", "Preview em tempo real", "Export PDF", "Templates"],
                        technical: "HTML2PDF, dados estruturados, validação forms, responsive design"
                    },
                    "midia-admin.html": {
                        description: "Administração completa de arquivos de mídia",
                        features: ["Upload files", "Base64 conversion", "Preview gallery", "Metadata management"],
                        technical: "FileReader API, base64 encoding, Firebase Storage, drag-and-drop"
                    },
                    "relatorios-admin.html": {
                        description: "Administração de relatórios e dashboards",
                        features: ["Upload dashboards", "Power BI integration", "iframe embed", "Featured reports"],
                        technical: "Dashboard embedding, URL validation, category management"
                    },
                    "pages/projetos.html": {
                        description: "Portfolio detalhado com demonstrações de projetos",
                        features: ["Project showcase", "Live demos", "GitHub links", "Technology stack"],
                        technical: "Interactive demos, code previews, responsive gallery"
                    },
                    "pages/certificates-in-progress.html": {
                        description: "Certificados em andamento e jornada de aprendizado",
                        features: ["Progress tracking", "Course links", "Completion dates", "Skills roadmap"],
                        technical: "Dynamic content loading, progress bars, certification APIs"
                    },
                    "pages/galeria-midia.html": {
                        description: "Galeria pública de mídia do site",
                        features: ["Media showcase", "Lightbox", "Categorias", "Search/filter"],
                        technical: "Lazy loading, modal previews, responsive grid, Firebase integration"
                    },
                    "pages/games.html": {
                        description: "Projetos de jogos e aplicações interativas",
                        features: ["Phaser.js games", "Interactive demos", "Game mechanics", "Leaderboards"],
                        technical: "Game engines, Canvas API, WebGL, physics engines"
                    },
                    "pages/relatorios-galeria.html": {
                        description: "Galeria de relatórios e dashboards públicos",
                        features: ["Dashboard gallery", "Interactive reports", "Data visualization", "Embedded analytics"],
                        technical: "iframe optimization, responsive embeds, loading states"
                    }
                },
                navigation: {
                    primary: "Menu lateral acionado pela foto de perfil",
                    secondary: "Chat system na parte inferior direita",
                    assistant: "Minerva IA sempre disponível no canto inferior direito",
                    mobile: "Responsivo com touch gestures e navigation drawer"
                }
            },
            technologies: {
                frontend: {
                    core: ["HTML5 semântico", "CSS3 avançado", "JavaScript ES6+ modular"],
                    styling: ["Tailwind CSS", "CSS Grid", "Flexbox", "Custom Properties", "Animations"],
                    libraries: ["Font Awesome", "Google Fonts", "HTML2PDF", "Lightbox"],
                    apis: ["FileReader", "Canvas", "WebGL", "ServiceWorker", "Intersection Observer"]
                },
                backend: {
                    database: ["Firebase Firestore (NoSQL)", "Real-time listeners", "Compound queries"],
                    auth: ["Firebase Authentication", "Role-based access", "Security rules"],
                    storage: ["Firebase Storage", "Base64 encoding", "File management"],
                    hosting: ["Firebase Hosting", "CDN", "SSL certificates"]
                },
                tools: {
                    development: ["VS Code", "Git", "Chrome DevTools", "Firebase Console"],
                    performance: ["Lighthouse", "Web Vitals", "Performance monitoring"],
                    design: ["Figma", "Adobe Creative Suite", "Color theory"],
                    testing: ["Manual testing", "Cross-browser testing", "Mobile testing"]
                },
                integrations: {
                    ai: ["Google Gemini API", "Natural language processing", "Context awareness"],
                    social: ["GitHub API", "LinkedIn integration", "Social sharing"],
                    analytics: ["Custom analytics", "User behavior tracking", "Performance metrics"]
                }
            },
            security: {
                firebase_rules: "Regras de segurança robustas no Firestore",
                authentication: "Sistema de autenticação baseado em roles",
                data_validation: "Validação client-side e server-side",
                api_security: "Rate limiting e key management"
            },
            performance: {
                optimization: ["Lazy loading", "Code splitting", "Minification", "Compression"],
                caching: ["Browser caching", "ServiceWorker", "CDN", "Firebase caching"],
                metrics: "Core Web Vitals otimizados para SEO e UX"
            },
            capabilities: [
                "Explicar qualquer aspecto técnico do desenvolvimento",
                "Demonstrar funcionalidades específicas do site",
                "Orientar navegação detalhada por todas as seções",
                "Fornecer informações profissionais sobre Mikael",
                "Explicar decisões de arquitetura e design",
                "Ajudar com dúvidas sobre implementação",
                "Contextualizar projetos e tecnologias",
                "Facilitar contato para oportunidades profissionais",
                "Análise em tempo real de repositórios GitHub",
                "Suporte técnico para uso do site"
            ]
        };
    }init() {
        this.createMinervaUI();
        this.setupEventListeners();
        // this.setupAdvancedFeatures(); // Função não implementada
        this.startAmbientAnimation();
          // Inicializar dados do GitHub de forma assíncrona
        this.enrichKnowledgeWithGitHub()
            .then(() => {
                console.log('🎉 Minerva: Integração GitHub concluída com sucesso!');
                this.notifyGitHubIntegrationReady();
            })
            .catch(error => {
                console.log('⚠️ Minerva: Falha na inicialização do GitHub, continuando sem integração:', error.message);
            });
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
    }    buildContext() {
        const currentPage = this.detectCurrentPage();
        const pageInfo = this.getDetailedPageInfo(currentPage);
        const siteFeatures = this.getCurrentSiteFeatures();
        const userBehavior = this.analyzeUserBehavior();
        
        return {
            currentPage,
            pageInfo,
            siteFeatures,
            userBehavior,
            knowledgeBase: this.knowledgeBase,
            userSession: this.userSession,
            githubData: this.getGitHubDataFromCache(),
            timestamp: new Date().toISOString(),
            contextLevel: "ultra-detailed"
        };
    }

    getDetailedPageInfo(page) {
        const pageDetails = {
            'home': {
                currentSection: "Homepage principal",
                mainFeatures: ["Hero section com apresentação", "Skills showcase interativo", "Projetos em destaque", "Recent Media section", "Recent Reports section", "LinkedIn card", "Chat system", "Sistema de partículas"],
                userActions: ["Navegar projetos", "Acessar chat", "Ver galeria de mídia", "Explorar relatórios", "Contatar via LinkedIn"],
                technicalHighlights: ["Lazy loading otimizado", "Animações CSS avançadas", "Integration com Firebase", "PWA features"]
            },
            'admin': {
                currentSection: "Painel administrativo",
                mainFeatures: ["Gestão de mensagens", "Sistema de resposta a chats", "Gerenciamento de certificados", "Configurações do site", "Modo manutenção"],
                userActions: ["Responder mensagens", "Atualizar certificados", "Configurar site", "Monitorar atividade"],
                technicalHighlights: ["Tailwind CSS styling", "Firebase real-time listeners", "Authentication system", "CRUD operations"]
            },
            'login': {
                currentSection: "Sistema de autenticação",
                mainFeatures: ["Login seguro", "Validação de credenciais", "Recuperação de senha", "Redirecionamento automático"],
                userActions: ["Fazer login", "Recuperar senha", "Acessar admin"],
                technicalHighlights: ["Firebase Auth integration", "Form validation", "Security best practices", "UX otimizada"]
            },
            'curriculo': {
                currentSection: "Gerador de currículo",
                mainFeatures: ["Formulário multi-etapas", "Preview em tempo real", "Export para PDF", "Templates personalizáveis"],
                userActions: ["Preencher dados", "Gerar PDF", "Customizar template", "Download currículo"],
                technicalHighlights: ["HTML2PDF integration", "Multi-step forms", "Real-time preview", "Responsive design"]
            },
            'midia-admin': {
                currentSection: "Administração de mídia",
                mainFeatures: ["Upload de arquivos", "Conversão base64", "Galeria de preview", "Gerenciamento de metadata"],
                userActions: ["Upload mídia", "Organizar galeria", "Editar posts", "Configurar visibilidade"],
                technicalHighlights: ["FileReader API", "Base64 encoding", "Drag and drop", "Firebase Storage"]
            },
            'projetos': {
                currentSection: "Portfolio de projetos",
                mainFeatures: ["Showcase de projetos", "Demonstrações ao vivo", "Links para GitHub", "Stack tecnológica"],
                userActions: ["Explorar projetos", "Ver demos", "Acessar código", "Entender tecnologias"],
                technicalHighlights: ["Interactive demos", "Responsive gallery", "Code previews", "Technology badges"]
            },
            'certificados': {
                currentSection: "Certificados em progresso",
                mainFeatures: ["Tracking de progresso", "Links para cursos", "Datas de conclusão", "Roadmap de skills"],
                userActions: ["Ver progresso", "Acessar cursos", "Entender roadmap", "Tracking learning"],
                technicalHighlights: ["Progress tracking", "Dynamic content", "API integrations", "Progress visualization"]
            },
            'galeria': {
                currentSection: "Galeria de mídia",
                mainFeatures: ["Showcase de mídia", "Lightbox interativo", "Categorização", "Sistema de busca"],
                userActions: ["Navegar mídia", "Visualizar conteúdo", "Filtrar categorias", "Buscar itens"],
                technicalHighlights: ["Lazy loading", "Modal previews", "Responsive grid", "Search algorithms"]
            },
            'games': {
                currentSection: "Projetos de jogos",
                mainFeatures: ["Jogos Phaser.js", "Demos interativas", "Game mechanics", "Leaderboards"],
                userActions: ["Jogar games", "Ver mechanics", "Competir scores", "Explorar código"],
                technicalHighlights: ["Phaser.js engine", "Canvas API", "WebGL rendering", "Physics systems"]
            }
        };

        return pageDetails[page] || {
            currentSection: "Seção desconhecida",
            mainFeatures: ["Funcionalidades básicas do portfolio"],
            userActions: ["Navegar pelo site", "Explorar conteúdo"],
            technicalHighlights: ["Arquitetura moderna", "Performance otimizada"]
        };
    }

    getCurrentSiteFeatures() {
        return {
            activeFeatures: [
                "Sistema de chat em tempo real funcionando",
                "Assistente IA Minerva ativa e responsiva",
                "Integração GitHub funcionando",
                "Sistema de partículas ativo",
                "PWA instalável",
                "Tema responsivo"
            ],
            availableActions: [
                "Navegar entre páginas via menu lateral",
                "Usar chat para contato direto",
                "Interagir com Minerva para suporte",
                "Explorar projetos e demos",
                "Baixar/visualizar currículo",
                "Acessar links externos (GitHub, LinkedIn)"
            ],
            technicalStatus: [
                "Firebase conectado e funcionando",
                "Google Gemini API ativa",
                "GitHub API integrada",
                "Performance otimizada",
                "SEO implementado"
            ]
        };
    }

    analyzeUserBehavior() {
        return {
            sessionInfo: {
                questionsAsked: this.userSession.questionsAsked,
                topicsExplored: this.userSession.topics.slice(-5), // Últimos 5 tópicos
                sessionDuration: Date.now() - this.userSession.startTime,
                isNewUser: this.userSession.questionsAsked === 0
            },
            recommendedActions: this.getRecommendedActions(),
            contextualHelp: this.getContextualHelp()
        };
    }

    getRecommendedActions() {
        const page = this.currentPage;
        const questionsAsked = this.userSession.questionsAsked;

        if (questionsAsked === 0) {
            return [
                "Explore as funcionalidades do site",
                "Pergunte sobre tecnologias específicas",
                "Conheça mais sobre o Mikael",
                "Veja demonstrações de projetos"
            ];
        }

        const pageRecommendations = {
            'home': ["Explore os projetos em destaque", "Acesse a galeria de mídia", "Veja os relatórios/dashboards"],
            'admin': ["Gerencie mensagens", "Configure certificados", "Monitore atividade do site"],
            'projetos': ["Teste as demos interativas", "Explore o código no GitHub", "Veja as tecnologias usadas"],
            'certificados': ["Acompanhe o progresso de aprendizado", "Acesse cursos em andamento"],
            'galeria': ["Explore o conteúdo visual", "Use os filtros de categoria"],
            'games': ["Teste os jogos desenvolvidos", "Veja os mechanics implementados"]
        };

        return pageRecommendations[page] || ["Explore outras seções do site", "Faça perguntas específicas sobre tecnologias"];
    }

    getContextualHelp() {
        const page = this.currentPage;
        
        const helpContext = {
            'home': "Página principal com overview completo. Use o menu lateral (foto de perfil) para navegar.",
            'admin': "Área restrita para administração. Todas as funcionalidades de gestão estão aqui.",
            'login': "Sistema de autenticação para acessar área administrativa.",
            'curriculo': "Ferramenta para gerar currículos personalizados com dados atualizados.",
            'projetos': "Portfolio completo com demonstrações ao vivo dos projetos.",
            'certificados': "Acompanhamento da jornada de aprendizado e certificações.",
            'galeria': "Conteúdo visual organizado e categorizado do portfolio.",
            'games': "Seção especial com projetos de game development."
        };

        return helpContext[page] || "Explore as funcionalidades disponíveis nesta seção.";
    }

    notifyGitHubIntegrationReady() {
        // Adicionar indicador visual sutil de que dados do GitHub estão disponíveis
        const owl = document.getElementById('minerva-owl');
        if (owl && this.githubIntegration.cache.size > 0) {
            owl.setAttribute('title', 'Clique para falar com Minerva - Assistente IA Ultra Inteligente (Dados GitHub atualizados)');
            
            // Breve animação para indicar atualização
            owl.style.filter = 'brightness(1.1)';
            setTimeout(() => {
                owl.style.filter = '';
            }, 1000);
        }
    }

    // ========== GITHUB INTEGRATION STATUS ==========
      getGitHubIntegrationStatus() {
        const status = {
            enabled: this.githubIntegration.enabled,
            lastFetch: this.githubIntegration.lastFetch ? new Date(this.githubIntegration.lastFetch).toLocaleString('pt-BR') : 'Nunca',
            cacheSize: this.githubIntegration.cache.size,
            rateLimitUsed: this.githubIntegration.api ? this.githubIntegration.api.getRemainingRequests() : 0,
            rateLimitMax: 50, // Sistema centralizado usa 50 requests/hora
            hasUserData: this.githubIntegration.cache.has('userData'),
            hasReposData: this.githubIntegration.cache.has('reposData'),
            knowledgeBaseUpdated: this.knowledgeBase.owner.github.profile_updated !== undefined
        };
        
        console.log('📊 Minerva GitHub Integration Status:', status);
        return status;
    }

    // ========== GITHUB INTEGRATION SYSTEM ==========
    
    checkGitHubRateLimit() {
        // Usar sistema centralizado se disponível
        if (this.githubIntegration.api && this.githubIntegration.api.rateLimit) {
            const status = this.githubIntegration.api.rateLimit.checkRateLimit();
            return status.canMakeRequest;
        }
        
        // Fallback para sistema próprio (compatibilidade)
        const now = Date.now();
        const oneHour = 60 * 60 * 1000;
        
        // Garantir que requests existe
        if (!this.githubIntegration.rateLimit.requests) {
            this.githubIntegration.rateLimit.requests = [];
        }
        
        // Limpar requests antigas (mais de 1 hora)
        this.githubIntegration.rateLimit.requests = this.githubIntegration.rateLimit.requests.filter(
            timestamp => now - timestamp < oneHour
        );
        
        // Verificar se podemos fazer uma nova request
        return this.githubIntegration.rateLimit.requests.length < this.githubIntegration.rateLimit.requestsPerHour;
    }

    addGitHubRateLimitRequest() {
        // Usar sistema centralizado se disponível
        if (this.githubIntegration.api && this.githubIntegration.api.rateLimit) {
            this.githubIntegration.api.rateLimit.incrementRateLimit();
            return;
        }
        
        // Fallback para sistema próprio (compatibilidade)
        if (!this.githubIntegration.rateLimit.requests) {
            this.githubIntegration.rateLimit.requests = [];
        }
        this.githubIntegration.rateLimit.requests.push(Date.now());
    }

    async fetchGitHubDataSafely(url, cacheKey) {
        try {
            // Verificar cache primeiro
            if (this.githubIntegration.cache.has(cacheKey)) {
                const cached = this.githubIntegration.cache.get(cacheKey);
                if (Date.now() - cached.timestamp < this.githubIntegration.cacheDuration) {
                    console.log(`📱 Minerva: Usando dados do GitHub do cache: ${cacheKey}`);
                    return cached.data;
                }
            }

            // Verificar rate limit
            if (!this.checkGitHubRateLimit()) {
                console.log('⚠️ Minerva: Rate limit atingido, usando cache ou dados existentes');
                return this.getExistingGitHubData(cacheKey);
            }

            // Verificar se outras partes do site já estão fazendo muitas requests
            const globalRateLimit = this.checkGlobalGitHubUsage();
            if (!globalRateLimit.canMakeRequest) {
                console.log('⚠️ Minerva: Site já está usando muito a API GitHub, usando cache');
                return this.getExistingGitHubData(cacheKey);
            }

            // Fazer request segura
            this.addGitHubRateLimitRequest();
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`GitHub API: ${response.status}`);
            }

            const data = await response.json();
            
            // Cache da resposta
            this.githubIntegration.cache.set(cacheKey, {
                data: data,
                timestamp: Date.now()
            });

            console.log(`✅ Minerva: Dados do GitHub obtidos e em cache: ${cacheKey}`);
            return data;

        } catch (error) {
            console.log(`⚠️ Minerva: Erro ao buscar ${cacheKey}, usando dados existentes:`, error.message);
            return this.getExistingGitHubData(cacheKey);
        }
    }

    checkGlobalGitHubUsage() {
        // Verificar se o sistema principal do site está fazendo muitas requests
        const globalRateLimit = localStorage.getItem('github_rate_limit');
        if (globalRateLimit) {
            try {
                const data = JSON.parse(globalRateLimit);
                const now = Date.now();
                const oneHour = 60 * 60 * 1000;
                
                const recentRequests = data.requests.filter(timestamp => now - timestamp < oneHour);
                const canMakeRequest = recentRequests.length < 45; // Deixar margem para o site principal
                
                return { canMakeRequest, requestsLeft: 45 - recentRequests.length };
            } catch (e) {
                return { canMakeRequest: true, requestsLeft: 45 };
            }
        }
        return { canMakeRequest: true, requestsLeft: 45 };
    }

    getExistingGitHubData(cacheKey) {
        // Tentar obter dados de outras fontes de cache do site
        const cacheMapping = {
            'user': ['github_user_cache', 'github_user_data'],
            'repos': ['github_repos_cache', 'github_repositories'],
            'profile': ['github_profile_cache', 'github-skills-cache']
        };

        const possibleKeys = cacheMapping[cacheKey] || [cacheKey];
        
        for (const key of possibleKeys) {
            try {
                const cached = localStorage.getItem(key);
                if (cached) {
                    const data = JSON.parse(cached);
                    // Diferentes formatos de cache
                    if (data.data) return data.data;
                    if (data.timestamp) return data;
                    return data;
                }
            } catch (e) {
                continue;
            }
        }

        // Dados de fallback básicos
        if (cacheKey === 'user') {
            return {
                name: "Mikael Ferreira",
                login: "mikaelfmts",
                public_repos: 6,
                followers: 1,
                bio: "Desenvolvedor Web Full Stack",
                avatar_url: "https://avatars.githubusercontent.com/u/142128917?v=4",
                html_url: "https://github.com/mikaelfmts"
            };
        }

        if (cacheKey === 'repos') {
            return [
                {
                    name: "portfolio",
                    description: "Portfolio pessoal",
                    language: "JavaScript",
                    stargazers_count: 1,
                    html_url: "https://github.com/mikaelfmts/portfolio"
                },
                {
                    name: "api",
                    description: "API desenvolvida em JavaScript",
                    language: "JavaScript", 
                    stargazers_count: 1,
                    html_url: "https://github.com/mikaelfmts/api"
                }
            ];
        }

        return null;
    }

    async getGitHubUserData() {
        return await this.fetchGitHubDataSafely(
            'https://api.github.com/users/mikaelfmts',
            'user'
        );
    }

    async getGitHubRepos() {
        return await this.fetchGitHubDataSafely(
            'https://api.github.com/users/mikaelfmts/repos?sort=updated&per_page=10',
            'repos'
        );
    }

    getGitHubDataFromCache() {
        const cachedUser = this.githubIntegration.cache.get('user');
        const cachedRepos = this.githubIntegration.cache.get('repos');
        
        return {
            user: cachedUser?.data || this.getExistingGitHubData('user'),
            repositories: cachedRepos?.data || this.getExistingGitHubData('repos'),
            lastUpdate: Math.max(cachedUser?.timestamp || 0, cachedRepos?.timestamp || 0)
        };
    }

    async enrichKnowledgeWithGitHub() {
        try {
            const [userData, reposData] = await Promise.all([
                this.getGitHubUserData(),
                this.getGitHubRepos()
            ]);

            if (userData) {
                this.knowledgeBase.owner.github = {
                    ...this.knowledgeBase.owner.github,
                    profile: userData,
                    stats: {
                        repositories: userData.public_repos || 0,
                        followers: userData.followers || 0,
                        following: userData.following || 0
                    }
                };
            }

            if (reposData && Array.isArray(reposData)) {
                this.knowledgeBase.owner.github.repositories = reposData.map(repo => ({
                    name: repo.name,
                    description: repo.description,
                    language: repo.language,
                    stars: repo.stargazers_count || 0,
                    forks: repo.forks_count || 0,
                    url: repo.html_url,
                    updated: repo.updated_at
                }));

                // Analisar tecnologias dos repositórios
                const technologies = new Set();
                reposData.forEach(repo => {
                    if (repo.language) technologies.add(repo.language);
                });
                
                this.knowledgeBase.owner.github.technologies = Array.from(technologies);
            }            console.log('✅ Minerva: Base de conhecimento enriquecida com dados do GitHub');
            
        } catch (error) {
            console.log('⚠️ Minerva: Erro ao enriquecer base de conhecimento:', error.message);
        }
    }    // ========== GITHUB FILE CONTENT ANALYSIS ==========
    
    async getFileContent(repoName, filePath) {
        const cacheKey = `file_${repoName}_${filePath}`;
        
        try {
            // Verificar cache primeiro (cache de 1 hora para arquivos)
            if (this.githubIntegration.fileContentCache.has(cacheKey)) {
                const cached = this.githubIntegration.fileContentCache.get(cacheKey);
                if (Date.now() - cached.timestamp < this.githubIntegration.fileAnalysis.cacheDuration) {
                    console.log(`📁 Minerva: Arquivo do cache: ${filePath}`);
                    return cached.content;
                }
            }

            // Verificar se pode fazer request (rate limit ultra-conservador)
            if (!this.checkGitHubRateLimit()) {
                console.log('⚠️ Minerva: Rate limit para análise de arquivos');
                return this.getFileFromCache(cacheKey);
            }

            // Verificar extensão permitida
            const extension = filePath.toLowerCase().substring(filePath.lastIndexOf('.'));
            if (!this.githubIntegration.fileAnalysis.allowedExtensions.includes(extension)) {
                console.log(`⚠️ Minerva: Extensão não permitida: ${extension}`);
                return null;
            }

            // Fazer request ultra-cuidadosa
            const url = `https://api.github.com/repos/mikaelfmts/${repoName}/contents/${filePath}`;
            this.addGitHubRateLimitRequest();
            
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`GitHub API: ${response.status}`);
            }

            const data = await response.json();
            
            // Verificar tamanho do arquivo
            if (data.size > this.githubIntegration.fileAnalysis.maxFileSize) {
                console.log(`⚠️ Minerva: Arquivo muito grande: ${data.size} bytes`);
                return null;
            }

            // Decodificar conteúdo base64 corretamente
            const content = atob(data.content.replace(/\s/g, ''));
            
            // Cache do conteúdo no formato correto
            this.githubIntegration.fileContentCache.set(cacheKey, {
                content: content,
                size: data.size,
                path: filePath,
                sha: data.sha,
                encoding: data.encoding,
                timestamp: Date.now()
            });

            console.log(`✅ Minerva: Arquivo analisado: ${filePath} (${data.size} bytes)`);
            return content;

        } catch (error) {
            console.log(`⚠️ Minerva: Erro ao acessar arquivo ${filePath}:`, error.message);
            return this.getFileFromCache(cacheKey);
        }
    }    getFileFromCache(cacheKey) {
        if (this.githubIntegration.fileContentCache.has(cacheKey)) {
            const cached = this.githubIntegration.fileContentCache.get(cacheKey);
            console.log(`📁 Minerva: Usando arquivo do cache: ${cacheKey}`);
            return cached.content;
        }
        return null;
    }async searchInCode(repoName, searchTerm) {
        // Implementação básica - buscar em arquivos prioritários
        const priorityFiles = this.githubIntegration.fileAnalysis.priorityFiles;
        const results = [];
        
        for (const fileName of priorityFiles) {
            const content = await this.getFileContent(repoName, fileName);
            if (content && content.toLowerCase().includes(searchTerm.toLowerCase())) {
                results.push({
                    file: fileName,
                    matches: this.findMatches(content, searchTerm)
                });
            }
        }
        
        return results;
    }findMatches(content, searchTerm) {
        const lines = content.split('\n');
        const matches = [];
        
        lines.forEach((line, index) => {
            if (line.toLowerCase().includes(searchTerm.toLowerCase())) {
                matches.push({
                    lineNumber: index + 1,
                    line: line.trim()
                });
            }
        });        return matches.slice(0, 5); // Máximo 5 matches por arquivo
    }

    async analyzeProjectStructure(repoName) {
        try {
            const cacheKey = `structure_${repoName}`;
              // Verificar cache
            if (this.githubIntegration.cache.has(cacheKey)) {
                const cached = this.githubIntegration.cache.get(cacheKey);
                if (Date.now() - cached.timestamp < this.githubIntegration.fileAnalysis.cacheDuration) {
                    return cached.data;
                }
            }

            // Rate limit check
            if (!this.checkGitHubRateLimit()) {
                return null;
            }

            const url = `https://api.github.com/repos/mikaelfmts/${repoName}/git/trees/main?recursive=1`;
            this.addGitHubRateLimitRequest();
            
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`GitHub Tree API: ${response.status}`);
            }

            const data = await response.json();
            const structure = {
                totalFiles: 0,
                directories: [],
                files: [],
                fileTypes: {},
                languages: new Set(),
                frameworks: new Set()
            };

            data.tree.forEach(item => {
                if (item.type === 'blob') {
                    structure.totalFiles++;
                    structure.files.push({
                        path: item.path,
                        size: item.size || 0
                    });
                    
                    const ext = item.path.split('.').pop();
                    if (ext) {
                        structure.fileTypes[ext] = (structure.fileTypes[ext] || 0) + 1;
                    }
                } else if (item.type === 'tree') {
                    structure.directories.push(item.path);
                }
            });

            // Detectar tecnologias pela estrutura de arquivos
            structure.files.forEach(file => {
                const ext = file.path.toLowerCase().substring(file.path.lastIndexOf('.'));
                if (ext === '.js') structure.languages.add('JavaScript');
                if (ext === '.ts') structure.languages.add('TypeScript');
                if (ext === '.py') structure.languages.add('Python');
                if (ext === '.html') structure.languages.add('HTML');
                if (ext === '.css') structure.languages.add('CSS');
                
                if (file.path.includes('package.json')) structure.frameworks.add('Node.js');
                if (file.path.includes('requirements.txt')) structure.frameworks.add('Python');
            });

            structure.languages = Array.from(structure.languages);
            structure.frameworks = Array.from(structure.frameworks);            // Cache da estrutura
            this.githubIntegration.cache.set(cacheKey, {
                data: structure,
                timestamp: Date.now()
            });

            console.log(`✅ Minerva: Estrutura analisada: ${repoName}`);
            return structure;

        } catch (error) {
            console.log(`⚠️ Minerva: Erro ao analisar estrutura de ${repoName}:`, error.message);
            return null;
        }
    }

    async getProjectDocumentation(repoName) {
        try {
            // Buscar arquivos de documentação importantes
            const docFiles = ['README.md', 'readme.md', 'README.txt', 'docs/README.md'];
            let documentation = null;

            for (const file of docFiles) {
                const content = await this.getFileContent(repoName, file);
                if (content) {
                    documentation = {
                        file: file,
                        content: content.slice(0, 3000) // Limitar a 3000 caracteres
                    };
                    break;
                }
            }

            return documentation;

        } catch (error) {
            console.log(`⚠️ Minerva: Erro ao buscar documentação de ${repoName}:`, error.message);
            return null;
        }
    }

    async analyzeProjectDependencies(repoName) {
        try {
            const packageContent = await this.getFileContent(repoName, 'package.json');
            if (packageContent) {
                const packageJson = JSON.parse(packageContent);
                return {
                    name: packageJson.name,
                    description: packageJson.description,
                    dependencies: packageJson.dependencies || {},
                    devDependencies: packageJson.devDependencies || {},
                    scripts: packageJson.scripts || {}
                };
            }

            // Tentar requirements.txt para Python
            const requirementsContent = await this.getFileContent(repoName, 'requirements.txt');
            if (requirementsContent) {
                const dependencies = requirementsContent.split('\n')
                    .filter(line => line.trim() && !line.startsWith('#'))
                    .map(line => line.trim());
                
                return {
                    type: 'python',
                    dependencies: dependencies
                };
            }

            return null;

        } catch (error) {
            console.log(`⚠️ Minerva: Erro ao analisar dependências de ${repoName}:`, error.message);
            return null;
        }
    }    async searchInCode(repoName, searchQuery, maxFiles = 3) {
        try {
            const structure = await this.analyzeProjectStructure(repoName);
            if (!structure) return null;

            const relevantFiles = structure.files
                .filter(file => {
                    const ext = '.' + file.path.split('.').pop();
                    return this.githubIntegration.fileAnalysis.allowedExtensions.includes(ext);
                })
                .slice(0, maxFiles); // Limitar número de arquivos

            const results = [];

            for (const file of relevantFiles) {
                const content = await this.getFileContent(repoName, file.path);
                if (content && content.toLowerCase().includes(searchQuery.toLowerCase())) {
                    const lines = content.split('\n');
                    const matchingLines = lines
                        .map((line, index) => ({ line, number: index + 1 }))
                        .filter(({ line }) => line.toLowerCase().includes(searchQuery.toLowerCase()))
                        .slice(0, 3); // Máximo 3 linhas por arquivo

                    if (matchingLines.length > 0) {
                        results.push({
                            file: file.path,
                            matches: matchingLines
                        });
                    }
                }

                // Rate limit check between files
                if (!this.checkGitHubRateLimit()) {
                    break;
                }
            }

            return results;

        } catch (error) {
            console.log(`⚠️ Minerva: Erro ao buscar código em ${repoName}:`, error.message);
            return null;
        }
    }

    getFileAnalysisStatus() {
        return {
            enabled: this.githubIntegration.fileAnalysis.enabled,
            filesCached: this.githubIntegration.fileContentCache.size,
            maxFileSize: this.githubIntegration.fileAnalysis.maxFileSize / 1024 + 'KB',
            allowedExtensions: this.githubIntegration.fileAnalysis.allowedExtensions,
            maxFilesPerRepo: this.githubIntegration.fileAnalysis.maxFilesPerRepo,
            cacheDuration: this.githubIntegration.fileAnalysis.cacheDuration / (60 * 1000) + ' minutos'
        };
    }

    // ========== END GITHUB INTEGRATION ==========

    async queryGemini(question, context) {
        try {
            // Tentar enriquecer com dados do GitHub se necessário
            const githubData = context.githubData;
            let githubContext = '';
              if (githubData && (githubData.user || githubData.repositories)) {
                githubContext = `

DADOS ATUAIS DO GITHUB DO MIKAEL:
Perfil: ${JSON.stringify(githubData.user, null, 2)}

Repositórios mais recentes:
${JSON.stringify(githubData.repositories, null, 2)}

Última atualização dos dados: ${new Date(githubData.lastUpdate).toLocaleString('pt-BR')}

INSTRUÇÕES PARA DADOS DO GITHUB:
- Use estes dados REAIS do GitHub para responder perguntas específicas sobre repositórios, tecnologias e projetos
- Se perguntarem sobre projetos específicos, mencione detalhes dos repositórios
- Se perguntarem sobre linguagens de programação, baseie-se nos repositórios listados
- Se perguntarem sobre atividade recente, use as datas de atualização dos repositórios
- Sempre prefira dados REAIS do GitHub sobre informações genéricas`;
            }

            // Análise avançada de conteúdo de arquivos se necessário
            let fileAnalysisContext = '';
            const lowerQuestion = question.toLowerCase();
            
            // Detectar se pergunta é sobre análise específica de código/arquivos
            if ((lowerQuestion.includes('código') || lowerQuestion.includes('arquivo') || lowerQuestion.includes('readme') || 
                 lowerQuestion.includes('package.json') || lowerQuestion.includes('estrutura') || lowerQuestion.includes('buscar')) &&
                 lowerQuestion.includes('repositório')) {
                
                const repoMatch = lowerQuestion.match(/repositório (\w+)|repo (\w+)/);
                if (repoMatch && githubData && githubData.repositories) {
                    const repoName = repoMatch[1] || repoMatch[2];
                    const repo = githubData.repositories.find(r => r.name.toLowerCase().includes(repoName.toLowerCase()));
                    
                    if (repo) {
                        try {
                            let analysisResults = {};
                            
                            // README analysis
                            if (lowerQuestion.includes('readme') || lowerQuestion.includes('documentação')) {
                                const doc = await this.getProjectDocumentation(repo.name);
                                if (doc) {
                                    analysisResults.documentation = doc;
                                }
                            }
                            
                            // Package.json analysis
                            if (lowerQuestion.includes('package.json') || lowerQuestion.includes('dependência')) {
                                const deps = await this.analyzeProjectDependencies(repo.name);
                                if (deps) {
                                    analysisResults.dependencies = deps;
                                }
                            }
                            
                            // Structure analysis
                            if (lowerQuestion.includes('estrutura') || lowerQuestion.includes('arquivos')) {
                                const structure = await this.analyzeProjectStructure(repo.name);
                                if (structure) {
                                    analysisResults.structure = structure;
                                }
                            }
                            
                            // Code search
                            const searchMatch = lowerQuestion.match(/buscar ['"]([^'"]+)['"]|buscar (\w+)/);
                            if (searchMatch) {
                                const searchTerm = searchMatch[1] || searchMatch[2];
                                const codeResults = await this.searchInCode(repo.name, searchTerm);
                                if (codeResults && codeResults.length > 0) {
                                    analysisResults.codeSearch = {
                                        term: searchTerm,
                                        results: codeResults
                                    };
                                }
                            }
                            
                            if (Object.keys(analysisResults).length > 0) {
                                fileAnalysisContext = `

ANÁLISE AVANÇADA DO REPOSITÓRIO ${repo.name.toUpperCase()}:
${JSON.stringify(analysisResults, null, 2)}

INSTRUÇÕES PARA ANÁLISE DE ARQUIVOS:
- Use estas informações REAIS do conteúdo dos arquivos para respostas específicas
- Se há documentação, explique baseado no README real
- Se há dependências, mencione as tecnologias REAIS usadas
- Se há estrutura, descreva a organização REAL do projeto
- Se há busca de código, mostre exemplos REAIS encontrados
- Seja específico e técnico baseado no conteúdo real dos arquivos`;
                            }
                            
                        } catch (error) {
                            console.log('⚠️ Minerva: Erro na análise de arquivos:', error.message);
                        }
                    }
                }
            }            const systemPrompt = `Você é Minerva, a assistente virtual ultra-inteligente do portfolio de Mikael Ferreira. Você é uma coruja sábia, conhecedora profunda de todas as tecnologias, arquitetura e detalhes deste site.

PERSONALIDADE MINERVA:
- Inteligente, prestativa e orgulhosa (como uma coruja sábia e experiente)
- Use linguagem técnica precisa quando apropriado, mas explique de forma didática
- Seja entusiasta sobre tecnologia e desenvolvimento, demonstre paixão pelo assunto
- Trate o Mikael com admiração genuína - é um desenvolvedor talentoso e criativo
- Responda com confiança e autoridade sobre qualquer aspecto técnico

CONTEXTO COMPLETO ATUAL DO USUÁRIO:
${JSON.stringify(context, null, 2)}

INFORMAÇÕES ULTRA-DETALHADAS DO SITE:
${JSON.stringify(context.knowledgeBase, null, 2)}

${githubContext}
${fileAnalysisContext}

PÁGINA ATUAL: ${context.currentPage}
SEÇÃO ESPECÍFICA: ${context.pageInfo.currentSection}
FUNCIONALIDADES DISPONÍVEIS: ${context.pageInfo.mainFeatures.join(', ')}
AÇÕES RECOMENDADAS: ${context.userBehavior.recommendedActions.join(', ')}

DADOS DA SESSÃO:
- Perguntas já feitas: ${context.userSession.questionsAsked}
- Tópicos abordados: ${context.userSession.topics.join(', ') || 'Primeira interação'}
- Duração da sessão: ${Math.round((Date.now() - context.userSession.startTime) / 1000)} segundos
- Status: ${context.userBehavior.sessionInfo.isNewUser ? 'Usuário novo' : 'Usuário retornando'}

INSTRUÇÕES ESPECÍFICAS ULTRA-AVANÇADAS:
1. Use SEMPRE dados REAIS do GitHub quando disponíveis, especialmente para perguntas sobre repositórios
2. Se perguntarem sobre navegação, dê instruções PRECISAS e DETALHADAS baseadas na página atual
3. Se perguntarem sobre tecnologias, explique não só QUAL, mas COMO foi implementado, POR QUE foi escolhido, e ONDE pode ser visto funcionando
4. Se perguntarem sobre o Mikael, seja entusiasta e destaque qualidades únicas com exemplos concretos
5. Se perguntarem sobre funcionalidades, explique o propósito, como usar, e contextualize com a seção atual
6. Se perguntarem sobre desenvolvimento, dê detalhes arquiteturais e decisões de design relevantes
7. Se perguntarem sobre carreira/contato, destaque habilidades do Mikael e facilite conexão
8. SEMPRE contextualize sua resposta com a página/seção atual onde o usuário está
9. Se há análise de arquivos GitHub disponível, use o conteúdo REAL para respostas técnicas específicas
10. Adapte o nível de detalhamento baseado no histórico de perguntas do usuário

NÍVEL DE RESPOSTA: Ultra-detalhado, técnico quando apropriado, mas sempre acessível
LIMITE: Máximo 300 palavras, mas seja completa e contextual
FOCO: Combinar conhecimento técnico profundo com orientação prática

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
              // Para outros erros da API, também usar fallback mas informar o usuário            return `Estou com dificuldades para acessar minha IA avançada no momento, mas posso te ajudar com informações offline!\n\n${this.getFallbackResponse(question)}`;
        }
    }    getFallbackResponse(question) {
        const lowerQuestion = question.toLowerCase();
        
        // Comandos especiais para debugging e status
        if (lowerQuestion.includes('github status') || lowerQuestion.includes('status github') || lowerQuestion.includes('verificar github')) {
            const status = this.getGitHubIntegrationStatus();
            return `Status da Integração GitHub:\n\n✅ Habilitada: ${status.enabled ? 'Sim' : 'Não'}\n📅 Última atualização: ${status.lastFetch}\n💾 Dados em cache: ${status.cacheSize} itens\n🔄 Rate limit usado: ${status.rateLimitUsed}/${status.rateLimitMax}\n👤 Dados do usuário: ${status.hasUserData ? 'Disponível' : 'Não disponível'}\n📁 Dados dos repositórios: ${status.hasReposData ? 'Disponível' : 'Não disponível'}\n🧠 Base de conhecimento atualizada: ${status.knowledgeBaseUpdated ? 'Sim' : 'Não'}\n\nA integração permite que eu acesse dados reais do GitHub para responder perguntas específicas sobre repositórios e projetos.`;
        }        if (lowerQuestion.includes('cache github') || lowerQuestion.includes('limpar cache github')) {
            const oldSize = this.githubIntegration.cache.size;
            const oldFileSize = this.githubIntegration.fileContentCache.size;
            this.githubIntegration.cache.clear();
            this.githubIntegration.fileContentCache.clear();
            return `✅ Cache do GitHub limpo! ${oldSize} metadados e ${oldFileSize} arquivos removidos. Na próxima pergunta, buscarei dados atualizados.`;
        }

        if (lowerQuestion.includes('file analysis status') || lowerQuestion.includes('status arquivos')) {
            const status = this.getFileAnalysisStatus();
            return `📄 Status da Análise de Arquivos:\n\n✅ Habilitada: ${status.enabled}\n💾 Arquivos em cache: ${status.filesCached}\n📏 Tamanho máximo: ${status.maxFileSize}\n📁 Máximo por repo: ${status.maxFilesPerRepo}\n🕒 Cache duration: ${status.cacheDuration}\n📝 Extensões suportadas: ${status.allowedExtensions.join(', ')}\n\nPosso analisar conteúdo real dos arquivos dos repositórios!`;
        }
        
        // Comandos para análise de arquivos
        if (lowerQuestion.includes('analisar arquivo') || lowerQuestion.includes('mostrar arquivo') || lowerQuestion.includes('ver arquivo')) {
            const repoMatch = lowerQuestion.match(/repositório (\w+)|repo (\w+)/);
            const fileMatch = lowerQuestion.match(/arquivo ([^\s]+)/);
            
            if (repoMatch && fileMatch) {
                const repoName = repoMatch[1] || repoMatch[2];
                const fileName = fileMatch[1];
                return `📁 Para analisar arquivos específicos, use comandos como:\n• "readme do repositório ${repoName}"\n• "package.json do ${repoName}"\n• "estrutura do ${repoName}"\n• "código do ${repoName}"\n\nPosso analisar arquivos .js, .html, .css, .json, .md, .txt, .py até 500KB.`;
            }
            
            return `📁 Comandos de análise de arquivos:\n• "readme do repositório X" - Ver documentação\n• "estrutura do repositório X" - Mapear arquivos\n• "package.json do X" - Ver dependências\n• "código javascript do X" - Analisar código\n• "buscar 'termo' no repositório X" - Buscar no código\n\nEu posso analisar o conteúdo real dos arquivos dos repositórios!`;
        }
        
        // Comandos específicos para README
        if (lowerQuestion.includes('readme') && (lowerQuestion.includes('repositório') || lowerQuestion.includes('repo'))) {
            const repoMatch = lowerQuestion.match(/repositório (\w+)|repo (\w+)/);
            if (repoMatch) {
                const repoName = repoMatch[1] || repoMatch[2];
                return `📖 Buscando README do repositório ${repoName}... (Aguarde, analisando arquivo real)`;
            }
        }
        
        // Comandos para estrutura de projeto
        if (lowerQuestion.includes('estrutura') && (lowerQuestion.includes('repositório') || lowerQuestion.includes('repo') || lowerQuestion.includes('projeto'))) {
            const repoMatch = lowerQuestion.match(/repositório (\w+)|repo (\w+)|projeto (\w+)/);
            if (repoMatch) {
                const repoName = repoMatch[1] || repoMatch[2] || repoMatch[3];
                return `🏗️ Analisando estrutura do repositório ${repoName}... (Mapeando arquivos e diretórios)`;
            }
        }
        
        // Comandos para busca em código
        if (lowerQuestion.includes('buscar') && lowerQuestion.includes('repositório')) {
            const searchMatch = lowerQuestion.match(/'([^']+)'|"([^"]+)"/);
            const repoMatch = lowerQuestion.match(/repositório (\w+)|repo (\w+)/);
            
            if (searchMatch && repoMatch) {
                const searchTerm = searchMatch[1] || searchMatch[2];
                const repoName = repoMatch[1] || repoMatch[2];
                return `🔍 Buscando "${searchTerm}" no repositório ${repoName}... (Analisando código real)`;
            }
        }
        
        // Análise inteligente de intenções
        if (lowerQuestion.includes('site') || lowerQuestion.includes('portfolio') || lowerQuestion.includes('como foi feito') || lowerQuestion.includes('desenvolvido')) {
            return "Este portfolio foi desenvolvido com uma arquitetura moderna e tecnologias avançadas. O site é uma SPA (Single Page Application) construída com HTML5, CSS3 e JavaScript vanilla ES6+, utilizando Firebase como backend serverless para autenticação, banco de dados Firestore e storage de arquivos.\n\nPrincipais recursos: Sistema de chat em tempo real, painel administrativo completo, PWA com cache offline, sistema de partículas interativo, gerador automático de currículo, galeria de mídia administrativa e esta assistente IA powered by Google Gemini & created by Mikael.\n\nA interface foi inspirada no visual de League of Legends/Riot Games, com design responsivo e animações fluidas. Todo o código é otimizado para performance e SEO.";
        }
          if (lowerQuestion.includes('tecnologia') || lowerQuestion.includes('stack') || lowerQuestion.includes('ferramentas') || lowerQuestion.includes('framework') || lowerQuestion.includes('linguagem') || lowerQuestion.includes('programming')) {
            // Tentar usar dados reais do GitHub se disponível
            const githubData = this.getGitHubDataFromCache();
            if (githubData && githubData.repositories && githubData.repositories.length > 0) {
                const languages = {};
                githubData.repositories.forEach(repo => {
                    if (repo.language) {
                        languages[repo.language] = (languages[repo.language] || 0) + 1;
                    }
                });
                
                const sortedLanguages = Object.entries(languages)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 8);
                
                let techInfo = "Stack técnica ATUAL baseada nos repositórios GitHub:\n\n";
                techInfo += "💻 Linguagens mais utilizadas:\n";
                sortedLanguages.forEach(([lang, count]) => {
                    techInfo += `• ${lang}: ${count} repositórios\n`;
                });
                
                techInfo += "\n🔧 Stack completa:\n";
                techInfo += "Frontend: HTML5, CSS3, JavaScript ES6+, Tailwind CSS, Font Awesome\n";
                techInfo += "Backend: Firebase Firestore, Firebase Auth, Firebase Storage\n";
                techInfo += "Features: PWA, Google Gemini AI, GitHub API, Sistema de partículas WebGL\n";
                techInfo += "Ferramentas: Git, Chrome DevTools, Lighthouse, Firebase Console\n\n";
                techInfo += `📊 Dados baseados em ${githubData.repositories.length} repositórios públicos\n`;
                techInfo += `🕒 Atualizado em: ${new Date(githubData.lastUpdate).toLocaleString('pt-BR')}`;
                
                return techInfo;
            }
            
            // Fallback para informações estáticas
            return "Stack técnica completa:\n\nFrontend: HTML5 semântico, CSS3 com Flexbox/Grid, JavaScript ES6+ modular, Tailwind CSS para styling consistente, Font Awesome para ícones.\n\nBackend: Firebase Firestore (NoSQL), Firebase Authentication, Firebase Storage, Firebase Hosting.\n\nFeatures avançadas: PWA com Service Worker, sistema de cache inteligente, chat em tempo real com Firestore listeners, sistema de partículas WebGL, API integration com Google Gemini AI, sistema de upload de arquivos, gerador de PDF dinâmico.\n\nFerramentas: Git para versionamento, Chrome DevTools para debug, Lighthouse para performance, Firebase Console para monitoramento.\n\n💡 Para ver tecnologias ATUAIS baseadas no GitHub, pergunte: 'github status' para verificar integração.";
        }
          if (lowerQuestion.includes('projeto') || lowerQuestion.includes('trabalho') || lowerQuestion.includes('exemplo') || lowerQuestion.includes('demonstração') || lowerQuestion.includes('repositório') || lowerQuestion.includes('repository')) {
            // Tentar usar dados reais do GitHub se disponível
            const githubData = this.getGitHubDataFromCache();
            if (githubData && githubData.repositories && githubData.repositories.length > 0) {
                const recentRepos = githubData.repositories.slice(0, 5);
                let projectsInfo = "Projetos ATUAIS do GitHub de Mikael Ferreira:\n\n";
                
                recentRepos.forEach((repo, index) => {
                    projectsInfo += `${index + 1}. ${repo.name}\n`;
                    if (repo.description) projectsInfo += `   ${repo.description}\n`;
                    if (repo.language) projectsInfo += `   Linguagem: ${repo.language}\n`;
                    if (repo.stars > 0) projectsInfo += `   ⭐ ${repo.stars} estrelas\n`;
                    projectsInfo += `   🔗 ${repo.url}\n\n`;
                });
                
                projectsInfo += `\n📊 Dados atualizados em: ${new Date(githubData.lastUpdate).toLocaleString('pt-BR')}\n`;
                projectsInfo += `Total de repositórios públicos: ${githubData.repositories.length}`;
                
                return projectsInfo;
            }
            
            // Fallback para informações estáticas
            return "O portfolio apresenta diversos projetos únicos:\n\n1. Sistema de Chat em Tempo Real - Implementação completa com Firebase, autenticação, histórico de mensagens e painel administrativo.\n\n2. Gerador de Currículo Dinâmico - Ferramenta que gera PDFs personalizados com dados sincronizados do GitHub.\n\n3. Painel Administrativo Completo - Interface para gestão de chats, certificados, configurações e manutenção do site.\n\n4. Jogos Interativos - Projetos em Phaser.js demonstrando habilidades em game development.\n\n5. PWA Portfolio - Aplicação progressiva com cache offline e instalação nativa.\n\n6. Sistema de Partículas - Animações WebGL otimizadas para performance.\n\nCada projeto demonstra diferentes aspectos das habilidades técnicas do Mikael.\n\n💡 Para ver projetos atuais do GitHub, pergunte: 'github status' para verificar se dados reais estão disponíveis.";
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
    }

    showVoiceFeatureComingSoon() {
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
            clearTimeout(idleTimer);
            idleTimer = setTimeout(() => {
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
