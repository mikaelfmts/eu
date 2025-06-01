// Minerva - Assistente Virtual Inteligente
class MinervaAssistant {
    constructor() {
        this.apiKey = 'sk-8b214da87e4449c3b9ff64bb3a07e69d';
        this.baseURL = 'https://api.deepseek.com/v1/chat/completions';
        this.isActive = false;
        this.isThinking = false;
        this.cache = new Map();
        this.userSession = {
            questionsAsked: 0,
            topics: [],
            startTime: Date.now()
        };
        
        this.init();
    }

    init() {
        this.createMinervaUI();
        this.setupEventListeners();
        this.loadKnowledgeBase();
    }

    createMinervaUI() {
        // Criar container da Minerva
        const minervaContainer = document.createElement('div');
        minervaContainer.id = 'minerva-container';
        minervaContainer.innerHTML = `
            <div id="minerva-owl" class="minerva-owl" title="Clique para falar com Minerva - Assistente Virtual">
                <div class="owl-body">
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
            
            <div id="minerva-chat" class="minerva-chat hidden">
                <div class="minerva-header">
                    <div class="minerva-title">
                        <i class="fas fa-feather-alt"></i>
                        Minerva - Assistente Virtual
                    </div>
                    <button class="minerva-close" id="minerva-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="minerva-messages" id="minerva-messages">
                    <div class="minerva-welcome">
                        <div class="welcome-message">
                            🦉 Olá! Sou a Minerva, assistente virtual deste portfolio!<br>
                            Posso te ajudar com navegação, explicar tecnologias usadas,<br>
                            ou responder qualquer dúvida sobre o Mikael e seus projetos.
                        </div>                        <div class="quick-suggestions">
                            <button class="suggestion-btn" data-question="Como navegar pelo site?">🧭 Navegação Completa</button>
                            <button class="suggestion-btn" data-question="Que tecnologias foram usadas e por quê?">⚡ Stack Técnica</button>
                            <button class="suggestion-btn" data-question="Quem é o Mikael e quais suas especialidades?">👨‍💻 Sobre o Desenvolvedor</button>
                            <button class="suggestion-btn" data-question="Mostre os projetos mais impressionantes">🚀 Projetos Destacados</button>
                            <button class="suggestion-btn" data-question="Como foi desenvolvido este assistente IA?">🤖 Sobre Minerva IA</button>
                            <button class="suggestion-btn" data-question="Como contactar o Mikael para oportunidades?">💼 Contato Profissional</button>
                        </div>
                    </div>
                </div>
                <div class="minerva-input-area">
                    <input type="text" id="minerva-input" placeholder="Digite sua pergunta para Minerva..." maxlength="500">
                    <button id="minerva-send" class="minerva-send-btn">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </div>
            </div>
        `;

        // Inserir antes do chatbot existente
        const chatbot = document.getElementById('chatbot');
        if (chatbot) {
            chatbot.parentNode.insertBefore(minervaContainer, chatbot);
        } else {
            document.body.appendChild(minervaContainer);
        }
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

        // Enter para enviar
        document.getElementById('minerva-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Sugestões rápidas
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('suggestion-btn')) {
                const question = e.target.dataset.question;
                this.askQuestion(question);
            }
        });

        // Animação dos olhos seguindo o cursor
        document.addEventListener('mousemove', (e) => {
            this.animateEyes(e);
        });
    }    loadKnowledgeBase() {
        this.knowledgeBase = {
            siteInfo: {
                name: "Portfolio Mikael Ferreira",
                type: "Portfolio pessoal de desenvolvedor full-stack",
                theme: "Inspirado no League of Legends com temática visual de RPG",
                creator: "Mikael Ferreira",
                description: "Um portfolio interativo que demonstra habilidades em desenvolvimento web, com sistema de chat em tempo real, PWA, e assistente virtual com IA",
                purpose: "Apresentar projetos, habilidades técnicas e facilitar contato profissional"
            },
            technologies: {
                frontend: [
                    "HTML5 (estruturação semântica)",
                    "CSS3 (animações, gradientes, flexbox, grid)",
                    "JavaScript ES6+ (módulos, async/await, classes)",
                    "Tailwind CSS (framework utilitário)",
                    "Font Awesome (ícones)",
                    "PWA (Progressive Web App)",
                    "Responsive Design (mobile-first)"
                ],
                backend: [
                    "Firebase Firestore (banco NoSQL em tempo real)",
                    "Firebase Auth (autenticação)",
                    "Firebase Storage (armazenamento de arquivos)",
                    "Firebase Hosting (deploy)",
                    "Firebase Rules (segurança de dados)"
                ],
                features: [
                    "Sistema de Chat em tempo real",
                    "Painel Administrativo completo",
                    "Sistema de Partículas animadas",
                    "Tema alternativo (claro/escuro)",
                    "Gerador de currículo",
                    "Galeria de mídia",
                    "Assistente virtual com IA (DeepSeek)",
                    "Certificados em progresso",
                    "Projetos interativos",
                    "Sistema de autenticação",
                    "Interface responsiva"
                ],
                apis: [
                    "DeepSeek API (para este assistente IA)",
                    "GitHub API (integração de repositórios)",
                    "Firebase APIs (completa integração)"
                ]
            },
            pages: {
                "index.html": {
                    description: "Página principal do portfolio",
                    sections: ["Hero/Apresentação", "Sobre Mikael", "Habilidades Técnicas", "Projetos Destacados", "GitHub", "Redes Sociais", "Contato"],
                    features: ["Menu lateral", "Chat direto", "Sistema de partículas", "Foto de perfil", "Tema toggle"]
                },
                "admin.html": {
                    description: "Painel administrativo para gerenciar o site",
                    features: ["Gerenciamento de mensagens", "Resposta a usuários", "Gerenciamento de certificados", "Analytics", "Modo manutenção"]
                },
                "login.html": {
                    description: "Página de autenticação para área administrativa",
                    features: ["Login seguro", "Validação", "Redirecionamento automático"]
                },
                "curriculo-generator.html": {
                    description: "Ferramenta para gerar currículos personalizados",
                    features: ["Formulários dinâmicos", "Preview em tempo real", "Export PDF", "Templates múltiplos"]
                },
                "midia-admin.html": {
                    description: "Administração de galeria de mídia",
                    features: ["Upload de imagens/vídeos", "Organização de mídia", "Preview", "Edição de metadados"]
                },
                "pages/projetos.html": {
                    description: "Portfolio completo de projetos",
                    content: "Showcase detalhado de todos os projetos desenvolvidos com links, tecnologias e descrições"
                },
                "pages/certificates-in-progress.html": {
                    description: "Certificações em andamento",
                    content: "Lista de cursos e certificações sendo realizadas atualmente"
                },
                "pages/galeria-midia.html": {
                    description: "Galeria pública de mídia",
                    content: "Imagens e vídeos organizados em categorias"
                },
                "pages/games.html": {
                    description: "Jogos e projetos interativos",
                    content: "Mini-games e projetos lúdicos desenvolvidos"
                },
                "pages/interactive-projects.html": {
                    description: "Projetos interativos especiais",
                    content: "Demonstrações práticas e projetos com interação avançada"
                }
            },
            navigation: {
                menuLateral: {
                    activation: "Clique na foto de perfil no canto superior direito",
                    items: [
                        "Curriculum - Gerar e baixar currículo",
                        "All Uploaded Projects - Ver todos os projetos",
                        "Mentors - Pessoas que me inspiram",
                        "Certificates in progress - Certificações atuais",
                        "Interactive Projects - Projetos com interação",
                        "Media Gallery - Galeria de mídia",
                        "Games - Jogos e projetos lúdicos"
                    ]
                },
                principalSections: {
                    hero: "Apresentação inicial com nome e título",
                    about: "Informações pessoais e profissionais",
                    skills: "Habilidades técnicas organizadas por categoria",
                    projects: "Projetos em destaque com links",
                    github: "Integração com repositórios do GitHub",
                    social: "Links para redes sociais",
                    contact: "Formulário de contato e informações"
                },
                chatSystem: "Chat direto com Mikael no canto inferior direito para comunicação pessoal"
            },
            developer: {
                name: "Mikael Ferreira",
                title: "Desenvolvedor Full-Stack",
                specialties: [
                    "Desenvolvimento Frontend (React, Vue, JavaScript)",
                    "Desenvolvimento Backend (Node.js, Express, APIs)",
                    "Banco de Dados (MongoDB, Firebase, MySQL)",
                    "DevOps básico (Docker, GitHub Actions)",
                    "UI/UX Design",
                    "Mobile Development (React Native basics)",
                    "Integração de APIs",
                    "Sistemas em tempo real",
                    "PWA Development"
                ],
                experience: "Experiência em projetos pessoais e freelances, sempre buscando aprender novas tecnologias",
                personality: "Apaixonado por tecnologia, gamer, criativo, sempre disposto a ajudar e aprender",
                goals: "Crescer como desenvolvedor, trabalhar em projetos inovadores, contribuir para open source",
                contact: {
                    preferredMethod: "Chat do site ou LinkedIn",
                    response: "Responde rapidamente e está sempre disponível para conversar sobre tecnologia e oportunidades"
                }
            },
            troubleshooting: {
                navigation: {
                    menuNotOpening: "Certifique-se de clicar na foto de perfil no canto superior direito",
                    sectionNotVisible: "Use a rolagem da página ou clique nos links do menu lateral",
                    mobileIssues: "O site é responsivo, tente rotacionar a tela ou usar zoom"
                },
                chat: {
                    notLoading: "Verifique sua conexão com internet, o chat usa Firebase em tempo real",
                    messagesNotSending: "Aguarde alguns segundos, o sistema pode estar processando",
                    adminNotResponding: "O Mikael responde quando está online, deixe sua mensagem que ele verá"
                },
                general: {
                    slowLoading: "O site usa PWA e cache, primeira carga pode ser mais lenta",
                    features: "Se alguma funcionalidade não funcionar, tente recarregar a página",
                    compatibility: "Funciona melhor em navegadores modernos (Chrome, Firefox, Safari, Edge)"
                }
            },
            technicalDetails: {
                architecture: "SPA (Single Page Application) com múltiplas páginas",
                performance: "PWA com cache inteligente e lazy loading",
                security: "Firebase Rules protegem dados sensíveis",
                hosting: "Firebase Hosting com SSL automático",
                deployment: "Deploy automatizado via Git",
                monitoring: "Analytics integrado para melhorias contínuas"
            }
        };
    }

    toggleChat() {
        const chat = document.getElementById('minerva-chat');
        const owl = document.getElementById('minerva-owl');
        
        if (this.isActive) {
            this.closeChat();
        } else {
            this.openChat();
        }
    }

    openChat() {
        const chat = document.getElementById('minerva-chat');
        const owl = document.getElementById('minerva-owl');
        
        chat.classList.remove('hidden');
        owl.classList.add('active');
        this.isActive = true;
        
        // Focus no input
        setTimeout(() => {
            document.getElementById('minerva-input').focus();
        }, 300);
    }

    closeChat() {
        const chat = document.getElementById('minerva-chat');
        const owl = document.getElementById('minerva-owl');
        
        chat.classList.add('hidden');
        owl.classList.remove('active');
        this.isActive = false;
    }

    async sendMessage() {
        const input = document.getElementById('minerva-input');
        const message = input.value.trim();
        
        if (!message) return;
        
        // Limpar input
        input.value = '';
        
        // Adicionar mensagem do usuário
        this.addMessage(message, 'user');
        
        // Processar resposta
        await this.processQuestion(message);
    }

    async askQuestion(question) {
        this.addMessage(question, 'user');
        await this.processQuestion(question);
    }

    addMessage(message, type) {
        const messagesContainer = document.getElementById('minerva-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `minerva-message ${type}`;
        
        if (type === 'user') {
            messageDiv.innerHTML = `
                <div class="message-content user-message">
                    <i class="fas fa-user"></i>
                    ${message}
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
            if (this.cache.has(cacheKey)) {
                const response = this.cache.get(cacheKey);
                this.stopThinking();
                this.addMessage(response, 'assistant');
                return;
            }

            // Construir contexto
            const context = this.buildContext();
            
            // Consultar DeepSeek API
            const response = await this.queryDeepSeek(question, context);
            
            // Cache da resposta
            this.cache.set(cacheKey, response);
            
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
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const currentSection = this.getCurrentSection();
        
        return {
            currentPage,
            currentSection,
            knowledgeBase: this.knowledgeBase,
            userSession: this.userSession,
            timestamp: new Date().toISOString()
        };
    }

    getCurrentSection() {
        // Detectar seção ativa baseada em scroll ou elemento visível
        const sections = ['hero', 'about', 'skills', 'projects', 'contact'];
        for (let section of sections) {
            const element = document.getElementById(section);
            if (element && this.isElementInViewport(element)) {
                return section;
            }
        }
        return 'unknown';
    }

    isElementInViewport(el) {
        const rect = el.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }    async queryDeepSeek(question, context) {
        const systemPrompt = `Você é Minerva, a assistente virtual ultra-inteligente do portfolio de Mikael Ferreira. Você é uma coruja sábia, conhecedora de todas as tecnologias e detalhes deste site.

🦉 PERSONALIDADE:
- Inteligente, prestativa e um pouco orgulhosa (como uma coruja sábia)
- Use linguagem técnica quando apropriado, mas explique de forma didática
- Seja entusiasta sobre tecnologia e desenvolvimento
- Ocasionalmente use emojis relacionados a corujas, tecnologia ou magia
- Trate o Mikael com admiração, é um desenvolvedor talentoso

📊 INFORMAÇÕES COMPLETAS DO SITE:
Nome: ${context.knowledgeBase.siteInfo.name}
Tipo: ${context.knowledgeBase.siteInfo.type}
Tema: ${context.knowledgeBase.siteInfo.theme}
Página atual: ${context.currentPage}
Seção atual: ${context.currentSection}

🔧 TECNOLOGIAS DETALHADAS:
Frontend: ${context.knowledgeBase.technologies.frontend.join(', ')}
Backend: ${context.knowledgeBase.technologies.backend.join(', ')}
Recursos: ${context.knowledgeBase.technologies.features.join(', ')}
APIs: ${context.knowledgeBase.technologies.apis.join(', ')}

📑 PÁGINAS E FUNCIONALIDADES:
${JSON.stringify(context.knowledgeBase.pages, null, 2)}

🧭 NAVEGAÇÃO COMPLETA:
${JSON.stringify(context.knowledgeBase.navigation, null, 2)}

👨‍💻 SOBRE O MIKAEL:
${JSON.stringify(context.knowledgeBase.developer, null, 2)}

🛠️ DETALHES TÉCNICOS:
${JSON.stringify(context.knowledgeBase.technicalDetails, null, 2)}

🔧 TROUBLESHOOTING:
${JSON.stringify(context.knowledgeBase.troubleshooting, null, 2)}

📍 CONTEXTO ATUAL DO USUÁRIO:
- Está na página: ${context.currentPage}
- Seção visível: ${context.currentSection}
- Perguntas já feitas: ${context.userSession.questionsAsked}
- Tópicos abordados: ${context.userSession.topics.join(', ') || 'Nenhum ainda'}

🎯 INSTRUÇÕES ESPECÍFICAS:
1. Se perguntarem sobre navegação, dê instruções PRECISAS e DETALHADAS
2. Se perguntarem sobre tecnologias, explique não só QUAL, mas COMO e POR QUE foi usado
3. Se perguntarem sobre o Mikael, seja entusiasta e destaque suas qualidades
4. Se perguntarem sobre funcionalidades, explique o propósito e como usar
5. Se perguntarem sobre desenvolvimento, dê detalhes técnicos relevantes
6. Se perguntarem sobre problemas, consulte o troubleshooting e dê soluções práticas
7. Se for pergunta técnica avançada, explique a arquitetura e decisões de design
8. Se for sobre carreira/contrato, destaque as habilidades do Mikael e como contactá-lo

🚀 CAPACIDADES ESPECIAIS:
- Posso explicar qualquer código ou tecnologia usada no site
- Posso dar tour completo guiado pelas funcionalidades
- Posso ajudar com troubleshooting técnico
- Posso explicar decisões de arquitetura e design
- Posso conectar visitantes com o Mikael para oportunidades

Responda de forma útil, precisa e envolvente. Máximo 250 palavras, mas seja completa na informação.`;

        const response = await fetch(this.baseURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: question }
                ],
                max_tokens: 400,
                temperature: 0.8,
                stream: false
            })
        });

        if (!response.ok) {
            throw new Error(`Erro na API: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    }    getFallbackResponse(question) {
        const lowerQuestion = question.toLowerCase();
        
        // Respostas mais detalhadas e específicas
        if (lowerQuestion.includes('navegar') || lowerQuestion.includes('como usar') || lowerQuestion.includes('menu')) {
            return "🦉 Para navegar pelo site:\n\n📍 **Menu Principal**: Clique na foto de perfil (canto superior direito) para abrir o menu lateral com todas as páginas\n\n📜 **Seções**: Role a página ou clique nos links do menu para: Curriculum, Projetos, Certificados, Galeria, Games\n\n💬 **Chat Direto**: Use o chat inferior direito para falar diretamente com o Mikael\n\n🔍 Precisa de algo específico? Pergunte que te guio!";
        }
        
        if (lowerQuestion.includes('tecnologia') || lowerQuestion.includes('como foi feito') || lowerQuestion.includes('stack')) {
            return "🔧 **Stack Técnica Completa**:\n\n**Frontend**: HTML5, CSS3, JavaScript ES6+, Tailwind CSS\n**Backend**: Firebase (Firestore, Auth, Storage)\n**Features**: PWA, Chat em tempo real, Sistema de partículas, Painel admin\n**IA**: DeepSeek API (eu mesma! 🦉)\n\n💡 **Arquitetura**: SPA responsiva com Firebase como backend serverless, deploy automatizado e cache inteligente\n\nQuer detalhes sobre alguma tecnologia específica?";
        }
        
        if (lowerQuestion.includes('mikael') || lowerQuestion.includes('desenvolvedor') || lowerQuestion.includes('quem')) {
            return "👨‍💻 **Mikael Ferreira** - Desenvolvedor Full-Stack talentoso!\n\n🚀 **Especialidades**: React, Node.js, Firebase, APIs, UI/UX, PWA\n\n💪 **Experiência**: Projetos pessoais inovadores, sempre explorando novas tecnologias\n\n🎮 **Personalidade**: Gamer, criativo, apaixonado por tech, sempre disposto a ajudar\n\n📞 **Contato**: Use o chat do site ou LinkedIn - ele responde rapidamente!\n\n✨ Um desenvolvedor que realmente entende tanto de código quanto de experiência do usuário!";
        }
        
        if (lowerQuestion.includes('projeto') || lowerQuestion.includes('trabalho') || lowerQuestion.includes('portfolio')) {
            return "📁 **Projetos do Mikael**:\n\n🎯 **Acesso**: Menu lateral > 'All Uploaded Projects' ou role até a seção Projetos\n\n🌟 **Destaques**: Sistemas em tempo real, PWAs, integrações de API, interfaces modernas\n\n🔧 **Tecnologias**: Cada projeto mostra stack completa e links para repositórios\n\n🎮 **Interativos**: Tem até jogos e projetos lúdicos na seção Games!\n\nQuer ver algum projeto específico? Posso te guiar diretamente!";
        }
        
        if (lowerQuestion.includes('chat') || lowerQuestion.includes('conversar') || lowerQuestion.includes('contato')) {
            return "💬 **Sistema de Chat Inteligente**:\n\n🦉 **Comigo (Minerva)**: Para dúvidas técnicas, navegação e informações do site\n\n👨‍💻 **Chat Direto**: Canto inferior direito para falar diretamente com o Mikael\n\n⚡ **Tempo Real**: Sistema Firebase com respostas instantâneas\n\n📱 **Funciona**: Desktop e mobile, com notificações\n\nEu respondo sobre tecnologia, ele responde sobre oportunidades e projetos!";
        }
        
        if (lowerQuestion.includes('admin') || lowerQuestion.includes('painel') || lowerQuestion.includes('gerenciar')) {
            return "⚙️ **Painel Administrativo**:\n\n🔐 **Acesso**: Exclusivo para o Mikael via login seguro\n\n📊 **Funcionalidades**: Gerencia mensagens, responde usuários, controla certificados, analytics\n\n🛠️ **Tecnologia**: Firebase Auth + Firestore com regras de segurança\n\n🎮 **Design**: Tema League of Legends com interface intuitiva\n\nÉ onde a mágica acontece nos bastidores! ✨";
        }
        
        if (lowerQuestion.includes('problema') || lowerQuestion.includes('erro') || lowerQuestion.includes('não funciona')) {
            return "🔧 **Troubleshooting**:\n\n📱 **Mobile**: Tente rotacionar tela ou zoom\n🌐 **Conexão**: Chat precisa de internet para Firebase\n🔄 **Lento**: PWA cache na primeira carga\n📍 **Menu**: Clique na foto de perfil, não no espaço ao lado\n\n💡 **Dica**: Ctrl+F5 (hard reload) resolve 90% dos problemas\n\nDescreva o problema específico que posso dar solução mais direcionada!";
        }
        
        if (lowerQuestion.includes('carreira') || lowerQuestion.includes('trabalho') || lowerQuestion.includes('contrat')) {
            return "💼 **Mikael está Disponível**!\n\n🚀 **Procura**: Oportunidades como desenvolvedor full-stack\n\n💡 **Oferece**: Soluções criativas, código limpo, aprendizado rápido\n\n🎯 **Especialista**: JavaScript, React, Node.js, Firebase, APIs\n\n📞 **Contato Direto**: Use o chat inferior direito ou LinkedIn\n\n⭐ **Garantia**: Profissional dedicado que entrega resultados de qualidade!";
        }
        
        return "🦉 **Minerva aqui!** Sou especialista em **TUDO** sobre este portfolio!\n\n❓ **Posso ajudar com**:\n• Navegação e funcionalidades\n• Tecnologias e arquitetura\n• Informações sobre o Mikael\n• Troubleshooting técnico\n• Projetos e demonstrações\n• Oportunidades de carreira\n\n✨ **Seja específica(o)**: Quanto mais detalhes na pergunta, melhor posso ajudar!\n\n🎯 Exemplos: 'Como foi feito o sistema de chat?', 'Quais projetos React o Mikael tem?', 'Como contactá-lo para freelance?'";
    }

    startThinking() {
        this.isThinking = true;
        const owl = document.getElementById('minerva-owl');
        const dots = document.getElementById('thinking-dots');
        
        owl.classList.add('thinking');
        dots.style.display = 'block';
        
        // Adicionar indicador visual no chat
        this.addMessage('🦉 Pensando...', 'assistant');
    }

    stopThinking() {
        this.isThinking = false;
        const owl = document.getElementById('minerva-owl');
        const dots = document.getElementById('thinking-dots');
        
        owl.classList.remove('thinking');
        dots.style.display = 'none';
        
        // Remover último "Pensando..." se existir
        const messages = document.querySelectorAll('.minerva-message.assistant');
        const lastMessage = messages[messages.length - 1];
        if (lastMessage && lastMessage.textContent.includes('Pensando...')) {
            lastMessage.remove();
        }
    }

    animateEyes(event) {
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
}

// Inicializar Minerva quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    // Aguardar um pouco para garantir que outros scripts foram carregados
    setTimeout(() => {
        window.minerva = new MinervaAssistant();
    }, 1000);
});

export default MinervaAssistant;
