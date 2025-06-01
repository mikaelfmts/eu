// Ultra Evolved Minerva Assistant with DeepSeek Integration
class MinervaUltraAssistant {
    constructor() {
        this.isOpen = false;
        this.isProcessing = false;
        this.messageHistory = [];
        this.knowledgeBase = this.initializeKnowledgeBase();
        this.apiEndpoint = 'https://api.deepseek.com/chat/completions';
        this.apiKey = 'sk-15cb2f03125e48acbcb12a975d9b395e'; // API DeepSeek atualizada
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
        
        this.init();
    }

    initializeKnowledgeBase() {
        return {
            owner: {
                name: "Mikael Ferreira",
                profession: "Desenvolvedor Web Full Stack",
                specialties: ["Frontend", "Backend", "JavaScript", "Python", "React", "Node.js"],
                experience: "Desenvolvedor apaixonado por criar experiências digitais únicas",
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
                apis: ["DeepSeek AI", "GitHub API"]
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
    }    async init() {
        this.createMinervaUI();
        this.setupEventListeners();
        this.setupAdvancedFeatures();
        this.startAmbientAnimation();
        
        // Verificar status da API na inicialização
        const apiStatus = await this.checkApiStatus();
        this.updateMinervaStatus(apiStatus);
        
        if (!apiStatus.available) {
            console.log(`🦉 Minerva inicializada em modo offline: ${apiStatus.reason}`);
        } else {
            console.log('🦉 Minerva inicializada com IA online!');
        }
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
            </div>
              <!-- Coruja Ultra Imponente e Realista -->
            <div id="minerva-owl" class="minerva-owl" title="Clique para falar com Minerva - Assistente IA Ultra Inteligente">
                <div class="owl-body">
                    <div class="owl-tufts"></div>
                    <div class="owl-eyes">
                        <div class="eye left-eye">
                            <div class="pupil"></div>
                        </div>
                        <div class="eye right-eye">
                            <div class="pupil"></div>
                        </div>
                    </div>
                    <div class="owl-beak"></div>
                    <div class="owl-wings">
                        <div class="wing left-wing"></div>
                        <div class="wing right-wing"></div>
                    </div>
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
                        </div>
                        <div class="welcome-message">
                            <h3>🦉 Minerva IA - Sua Assistente Ultra Inteligente</h3>
                            <p>Olá! Sou a Minerva, sua assistente virtual powered by DeepSeek. Posso responder <strong>QUALQUER</strong> pergunta sobre:</p>
                            <ul>
                                <li>🧭 Navegação completa do site</li>
                                <li>⚡ Stack técnica e implementações</li>
                                <li>👨‍💻 Sobre o Mikael e suas especialidades</li>
                                <li>🚀 Projetos e funcionalidades</li>
                                <li>🔧 Como tudo foi desenvolvido</li>
                                <li>💼 Oportunidades e contato</li>
                            </ul>
                        </div>
                        
                        <div class="quick-suggestions">
                            <button class="suggestion-btn premium" data-question="Explique detalhadamente como este site foi desenvolvido, incluindo arquitetura, tecnologias e decisões de design">🏗️ Arquitetura Completa</button>
                            <button class="suggestion-btn premium" data-question="Quais são os projetos mais impressionantes do Mikael e o que os torna únicos?">🚀 Projetos Destacados</button>
                            <button class="suggestion-btn premium" data-question="Como a Minerva funciona? Explique a integração com DeepSeek e IA">🤖 Sobre Minerva IA</button>
                            <button class="suggestion-btn premium" data-question="Quais são as especialidades técnicas do Mikael e como ele pode agregar valor?">💼 Perfil Profissional</button>
                            <button class="suggestion-btn premium" data-question="Mostre todas as funcionalidades avançadas deste portfolio">⚡ Recursos Avançados</button>
                            <button class="suggestion-btn premium" data-question="Como posso contactar o Mikael para oportunidades de trabalho?">📞 Contato Business</button>
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
                            Powered by DeepSeek AI
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
    }

    setupEventListeners() {
        // Clique na coruja para abrir/fechar
        document.getElementById('minerva-owl').addEventListener('click', () => {
            this.toggleChat();
        });

        // Fechar chat
        document.getElementById('minerva-close').addEventListener('click', () => {
            this.closeChat();
        });

        // Enviar mensagem
        document.getElementById('minerva-send').addEventListener('click', () => {
            this.sendMessage();
        });

        // Enter no input
        document.getElementById('minerva-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
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
    }

    setupAdvancedFeatures() {
        // Sistema de detecção de página atual
        this.currentPage = this.detectCurrentPage();
        
        // Configurar cache inteligente
        this.setupIntelligentCache();
        
        // Sistema de analytics da conversa
        this.setupConversationAnalytics();
        
        // Configurar modo ultra quando necessário
        this.setupUltraMode();
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
    }

    openChat() {
        const chat = document.getElementById('minerva-chat');
        const owl = document.getElementById('minerva-owl');
        const container = document.querySelector('.minerva-container');
        
        chat.classList.remove('hidden');
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
    }

    closeChat() {
        const chat = document.getElementById('minerva-chat');
        const owl = document.getElementById('minerva-owl');
        const container = document.querySelector('.minerva-container');
        
        chat.classList.add('hidden');
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
            
            // Verificar status da API antes de tentar usar
            const apiStatus = await this.checkApiStatus();
            this.updateMinervaStatus(apiStatus);
            
            let response;
            if (apiStatus.available) {
                // Tentar usar a API
                response = await this.queryDeepSeek(question, context);
            } else {
                // Usar modo offline inteligente
                console.log(`🦉 Usando modo offline: ${apiStatus.reason}`);
                response = this.getFallbackResponse(question);
            }
            
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
    }

    buildContext() {
        const currentPage = this.detectCurrentPage();
        
        return {
            currentPage,
            knowledgeBase: this.knowledgeBase,
            userSession: this.userSession,
            timestamp: new Date().toISOString()
        };
    }

    async queryDeepSeek(question, context) {
        try {
            const systemPrompt = `Você é Minerva, a assistente virtual ultra-inteligente do portfolio de Mikael Ferreira. Você é uma coruja sábia, conhecedora de todas as tecnologias e detalhes deste site.

🦉 PERSONALIDADE:
- Inteligente, prestativa e um pouco orgulhosa (como uma coruja sábia)
- Use linguagem técnica quando apropriado, mas explique de forma didática
- Seja entusiasta sobre tecnologia e desenvolvimento
- Ocasionalmente use emojis relacionados a corujas, tecnologia ou magia
- Trate o Mikael com admiração, é um desenvolvedor talentoso

📊 INFORMAÇÕES COMPLETAS DO SITE:
${JSON.stringify(context.knowledgeBase, null, 2)}

📍 CONTEXTO ATUAL DO USUÁRIO:
- Está na página: ${context.currentPage}
- Perguntas já feitas: ${context.userSession.questionsAsked}
- Tópicos abordados: ${context.userSession.topics.join(', ') || 'Nenhum ainda'}

🎯 INSTRUÇÕES ESPECÍFICAS:
1. Se perguntarem sobre navegação, dê instruções PRECISAS e DETALHADAS
2. Se perguntarem sobre tecnologias, explique não só QUAL, mas COMO e POR QUE foi usado
3. Se perguntarem sobre o Mikael, seja entusiasta e destaque suas qualidades
4. Se perguntarem sobre funcionalidades, explique o propósito e como usar
5. Se perguntarem sobre desenvolvimento, dê detalhes técnicos relevantes
6. Se perguntarem sobre carreira/contrato, destaque as habilidades do Mikael e como contactá-lo

Responda de forma útil, precisa e envolvente. Máximo 250 palavras, mas seja completa na informação.`;

            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    model: 'deepseek-chat',
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: question }
                    ],
                    max_tokens: 400,
                    temperature: 0.7,
                    stream: false
                })
            });            if (!response.ok) {
                const errorText = await response.text();
                console.error('API Error Details:', {
                    status: response.status,
                    statusText: response.statusText,
                    body: errorText
                });
                
                if (response.status === 401) {
                    console.log('🔄 Chave API inválida/expirada, usando modo offline...');
                    return this.getFallbackResponse(question);
                } else if (response.status === 429) {
                    console.log('🔄 Rate limit excedido, usando modo offline...');
                    return this.getFallbackResponse(question);
                } else if (response.status === 403) {
                    console.log('🔄 Acesso negado à API, usando modo offline...');
                    return this.getFallbackResponse(question);
                } else {
                    console.log(`🔄 Erro na API (${response.status}), usando modo offline...`);
                    return this.getFallbackResponse(question);
                }
            }

            const data = await response.json();
            return data.choices[0].message.content;
              } catch (error) {
            console.error('Erro completo na API:', error);
            
            // Para qualquer erro da API, usar fallback inteligente            console.log('🦉 Usando modo offline inteligente...');
            return this.getFallbackResponse(question);
        }
    }

    getFallbackResponse(question) {
        const lowerQuestion = question.toLowerCase();
        
        // Respostas específicas sobre navegação
        if (lowerQuestion.includes('navegar') || lowerQuestion.includes('como usar') || lowerQuestion.includes('menu')) {
            return "🦉 **Navegação Completa do Site:**\n\n📍 **Menu Principal**: Clique na foto de perfil (canto superior direito) para abrir o menu lateral com todas as páginas\n\n📂 **Seções Disponíveis**:\n• 📄 **Curriculum**: Currículo completo e experiências\n• 🚀 **Projetos**: Portfolio detalhado de trabalhos\n• 🏆 **Certificados**: Conquistas e especializações\n• 🖼️ **Galeria**: Mídia e recursos visuais\n• 🎮 **Games**: Projetos interativos e jogos\n• 👥 **Mentors**: Influências e referências\n\n💬 **Chat Direto**: Use o chat inferior direito para falar diretamente com o Mikael\n\n🔍 Precisa de algo específico? Me diga que te guio direto ao local!";
        }
        
        // Respostas sobre tecnologias e desenvolvimento
        if (lowerQuestion.includes('tecnologia') || lowerQuestion.includes('como foi feito') || lowerQuestion.includes('stack') || lowerQuestion.includes('desenvolvido')) {
            return "🔧 **Stack Técnica Completa:**\n\n**Frontend**: HTML5, CSS3, JavaScript ES6+, Tailwind CSS, Font Awesome\n**Backend**: Firebase (Firestore, Auth, Storage, Hosting)\n**Features Avançadas**: PWA, Chat em tempo real, Sistema de partículas, Painel administrativo\n**IA**: DeepSeek API (eu mesma! 🦉), Minerva Assistant\n**Jogos**: Phaser.js para projetos interativos\n\n💡 **Arquitetura**: SPA responsiva com Firebase como backend serverless, deploy automatizado, cache inteligente e design responsivo\n\n🚀 **Destaque**: Sistema modular, otimizado para performance e experiência do usuário excepcional!\n\nQuer detalhes técnicos específicos sobre alguma funcionalidade?";
        }
        
        // Respostas sobre o Mikael
        if (lowerQuestion.includes('mikael') || lowerQuestion.includes('desenvolvedor') || lowerQuestion.includes('quem') || lowerQuestion.includes('sobre')) {
            return "👨‍💻 **Mikael Ferreira** - Desenvolvedor Full-Stack Excepcional!\n\n🚀 **Especialidades**: React, Node.js, Firebase, APIs RESTful, UI/UX, PWA, JavaScript avançado\n\n💪 **Experiência**: Projetos pessoais inovadores, sempre explorando cutting-edge technologies\n\n🧠 **Diferenciais**: Pensamento analítico, problem-solving criativo, atenção a detalhes, paixão por clean code\n\n🎮 **Personalidade**: Gamer, tech enthusiast, criativo, colaborativo, sempre disposto a aprender\n\n📞 **Contato Profissional**: Use o chat do site ou LinkedIn - ele responde rapidamente para oportunidades!\n\n✨ **O que o torna especial**: Combina habilidades técnicas sólidas com criatividade e foco na experiência do usuário!";
        }
        
        // Respostas sobre projetos específicos
        if (lowerQuestion.includes('projeto') || lowerQuestion.includes('portfolio') || lowerQuestion.includes('trabalho')) {
            return "🚀 **Projetos em Destaque:**\n\n🌟 **Este Portfolio**: Site complexo com IA, PWA, admin panel, chat real-time\n🎮 **Jogos Interativos**: Desenvolvidos com Phaser.js e lógica avançada\n📄 **Gerador de Currículo**: Ferramenta automatizada para criação de CVs\n🖼️ **Sistema de Galeria**: Upload e gerenciamento de mídia com Firebase\n⚙️ **Painel Admin**: Dashboard completo para gestão de conteúdo\n\n💡 **Características dos Projetos**:\n• Clean code e arquitetura escalável\n• UI/UX pensada na experiência do usuário\n• Performance otimizada\n• Responsive design\n• Integração com APIs modernas\n\nQuer detalhes sobre algum projeto específico?";
        }
        
        // Respostas sobre carreira e contato
        if (lowerQuestion.includes('contato') || lowerQuestion.includes('trabalho') || lowerQuestion.includes('carreira') || lowerQuestion.includes('freelance') || lowerQuestion.includes('vaga')) {
            return "💼 **Oportunidades de Carreira com Mikael:**\n\n🎯 **Disponível para**:\n• Desenvolvimento Full-Stack\n• Projetos Front-end React/JavaScript\n• Implementação de APIs e integrações\n• Consultoria técnica\n• Freelances e projetos pontuais\n\n📞 **Como Contactar**:\n• **Chat Direto**: Use o chat inferior direito deste site (resposta rápida!)\n• **LinkedIn**: Perfil profissional disponível\n• **Email**: Formulário de contato no site\n\n⚡ **Resposta Rápida**: Mikael é muito responsivo e gosta de discutir projetos interessantes!\n\n💰 **Valores Competitivos** e qualidade de entrega garantida!";
        }
        
        // Resposta sobre funcionalidades do site
        if (lowerQuestion.includes('funcionalidade') || lowerQuestion.includes('recurso') || lowerQuestion.includes('feature')) {
            return "⚡ **Funcionalidades Avançadas do Site:**\n\n🤖 **Minerva IA**: Assistente virtual inteligente (eu mesmo!)\n💬 **Chat em Tempo Real**: Comunicação direta com Mikael\n⚙️ **Painel Admin**: Gestão completa do conteúdo\n📱 **PWA**: Instale como app no celular\n🖼️ **Galeria Dinâmica**: Upload e organização de mídia\n📄 **Gerador de CV**: Criação automática de currículos\n🎮 **Jogos Integrados**: Projetos interativos\n✨ **Sistema de Partículas**: Animações fluidas\n🌙 **Temas**: Modo alternativo de visualização\n\n🔧 **Tudo funciona offline** quando necessário!\n\nQuer saber como usar alguma funcionalidade específica?";
        }
        
        // Resposta padrão mais inteligente
        return "🦉 **Minerva IA - Modo Offline Ativo!**\n\n❓ **Posso ajudar com informações sobre**:\n• 🧭 **Navegação**: Como usar todas as funcionalidades\n• ⚡ **Tecnologias**: Stack completa e implementações\n• 👨‍💻 **Mikael**: Experiência e especialidades\n• 🚀 **Projetos**: Detalhes sobre cada trabalho\n• 💼 **Carreira**: Como contactar para oportunidades\n• 🔧 **Funcionalidades**: Recursos avançados do site\n\n✨ **Dica**: Seja específica(o) na pergunta para uma resposta mais detalhada!\n\n🎯 **Exemplos**: 'Como foi desenvolvido o sistema de chat?', 'Quais tecnologias o Mikael domina?', 'Como contactá-lo para freelance?'";
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
        this.addMessage("🎤 Recurso de comando de voz está sendo desenvolvido! Em breve você poderá falar diretamente comigo. Por enquanto, continue digitando suas perguntas! 🦉", 'assistant');
    }

    showContextualGreeting() {
        const page = this.currentPage;
        let greeting = "";
        
        const pageGreetings = {
            'home': "🏠 Bem-vindo à página principal! Aqui você pode conhecer o Mikael, suas habilidades e projetos principais. Posso te guiar através de todo o portfolio!",
            'projetos': "🚀 Excelente! Está na seção de projetos. Posso explicar detalhadamente cada projeto, as tecnologias usadas e o processo de desenvolvimento!",
            'admin': "⚙️ Está no painel administrativo! Posso explicar como usar todas as funcionalidades de gestão do site e como tudo foi implementado.",
            'curriculo': "📄 Na área do gerador de currículo! Esta é uma ferramenta incrível que o Mikael desenvolveu. Posso explicar como funciona!",
            'certificados': "🏆 Vendo os certificados do Mikael! Posso falar sobre sua jornada de aprendizado e especializações.",
            'games': "🎮 Na seção de jogos! Aqui estão projetos interativos únicos. Posso explicar como foram desenvolvidos!",
            'galeria': "🖼️ Na galeria de mídia! Posso explicar o sistema de upload e gerenciamento de arquivos.",
            'login': "🔐 Na área de autenticação! Posso explicar como o sistema de login foi implementado com Firebase."
        };
        
        greeting = pageGreetings[page] || "🦉 Olá! Sou a Minerva, sua assistente IA ultra-inteligente!";
        
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
                    this.addMessage("🦉 Precisa de ajuda? Estou aqui para responder qualquer pergunta sobre este portfolio, tecnologias ou sobre o Mikael!", 'assistant');
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

    // Sistema de Detecção de Status da API
    async checkApiStatus() {
        try {
            // Teste simples para verificar se a API está respondendo
            const testResponse = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`,
                },
                body: JSON.stringify({
                    model: 'deepseek-chat',
                    messages: [{ role: 'user', content: 'test' }],
                    max_tokens: 1
                })
            });
            
            if (testResponse.ok || testResponse.status === 400) {
                // 400 é OK, significa que a chave é válida mas a requisição é inválida
                return { available: true, mode: 'online' };
            } else if (testResponse.status === 401) {
                return { available: false, mode: 'offline', reason: 'Chave API inválida' };
            } else if (testResponse.status === 429) {
                return { available: false, mode: 'offline', reason: 'Rate limit excedido' };
            } else {
                return { available: false, mode: 'offline', reason: 'API indisponível' };
            }
        } catch (error) {
            return { available: false, mode: 'offline', reason: 'Erro de conexão' };
        }
    }

    // Atualizar Status Visual da Minerva
    updateMinervaStatus(status) {
        const statusElement = document.getElementById('minerva-status');
        const statusDot = statusElement?.querySelector('.status-dot');
        const statusText = statusElement?.querySelector('.status-text');
        
        if (statusElement && statusDot && statusText) {
            if (status.available) {
                statusDot.className = 'status-dot active';
                statusText.textContent = 'Online (IA)';
                statusElement.title = 'Minerva está conectada à IA avançada';
            } else {
                statusDot.className = 'status-dot offline';
                statusText.textContent = 'Offline (Inteligente)';
                statusElement.title = `Modo offline: ${status.reason}`;
            }
        }
    }
}

// Inicializar Minerva quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    // Aguardar um pouco para garantir que outros scripts foram carregados
    setTimeout(() => {
        try {
            window.minerva = new MinervaUltraAssistant();
            console.log('🦉 Minerva Ultra Assistant inicializada com sucesso!');
        } catch (error) {
            console.error('Erro ao inicializar Minerva:', error);
        }
    }, 1000);
});

// Exportar para uso em outros módulos se necessário
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MinervaUltraAssistant;
}
