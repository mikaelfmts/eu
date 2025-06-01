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
                        </div>
                        <div class="quick-suggestions">
                            <button class="suggestion-btn" data-question="Como navegar pelo site?">📍 Como navegar</button>
                            <button class="suggestion-btn" data-question="Que tecnologias foram usadas?">🔧 Tecnologias</button>
                            <button class="suggestion-btn" data-question="Quem é o Mikael?">👨‍💻 Sobre o Mikael</button>
                            <button class="suggestion-btn" data-question="Mostre os projetos">📁 Ver projetos</button>
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
    }

    loadKnowledgeBase() {
        this.knowledgeBase = {
            siteInfo: {
                name: "Portfolio Mikael Ferreira",
                type: "Portfolio pessoal de desenvolvedor full-stack",
                theme: "Inspirado no League of Legends",
                creator: "Mikael Ferreira"
            },
            technologies: {
                frontend: ["HTML5", "CSS3", "JavaScript ES6+", "Tailwind CSS", "Font Awesome"],
                backend: ["Firebase Firestore", "Firebase Auth", "Firebase Storage"],
                features: ["PWA", "Sistema de Chat", "Painel Administrativo", "Sistema de Partículas", "Responsive Design"],
                apis: ["DeepSeek API (para este assistente)", "GitHub API"]
            },
            pages: {
                "index.html": "Página principal do portfolio",
                "admin.html": "Painel administrativo para gerenciar mensagens",
                "login.html": "Página de autenticação",
                "projetos.html": "Portfolio de projetos",
                "certificates-in-progress.html": "Certificados em andamento"
            },
            navigation: {
                menu: "Menu lateral acessível clicando na foto de perfil",
                sections: ["Perfil", "Habilidades", "Projetos", "GitHub", "Redes Sociais"],
                chat: "Chat direto com o Mikael no canto inferior direito"
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
    }

    async queryDeepSeek(question, context) {
        const systemPrompt = `Você é Minerva, a assistente virtual inteligente do portfolio de Mikael Ferreira.

INFORMAÇÕES DO SITE:
- Nome: ${context.knowledgeBase.siteInfo.name}
- Tipo: ${context.knowledgeBase.siteInfo.type}
- Tema: ${context.knowledgeBase.siteInfo.theme}
- Página atual: ${context.currentPage}
- Seção atual: ${context.currentSection}

TECNOLOGIAS USADAS:
Frontend: ${context.knowledgeBase.technologies.frontend.join(', ')}
Backend: ${context.knowledgeBase.technologies.backend.join(', ')}
Recursos: ${context.knowledgeBase.technologies.features.join(', ')}

NAVEGAÇÃO:
${JSON.stringify(context.knowledgeBase.navigation, null, 2)}

INSTRUÇÕES:
- Seja prestativa, inteligente e amigável
- Use emojis ocasionalmente para deixar a conversa mais natural
- Se perguntarem sobre navegação, dê instruções específicas
- Se perguntarem sobre tecnologias, explique de forma clara
- Se perguntarem sobre o Mikael, fale sobre suas habilidades como desenvolvedor
- Mantenha respostas concisas mas informativas (máximo 200 palavras)
- Use linguagem brasileira/portuguesa
- Se não souber algo específico, seja honesta e ofereça alternativas

Responda à pergunta do usuário de forma contextual e útil.`;

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
                max_tokens: 300,
                temperature: 0.7,
                stream: false
            })
        });

        if (!response.ok) {
            throw new Error(`Erro na API: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    }

    getFallbackResponse(question) {
        const lowerQuestion = question.toLowerCase();
        
        if (lowerQuestion.includes('navegar') || lowerQuestion.includes('como')) {
            return "🦉 Para navegar pelo site, você pode clicar na foto de perfil para abrir o menu lateral, ou usar a barra de rolagem para explorar as seções. Cada seção tem informações específicas sobre o Mikael!";
        }
        
        if (lowerQuestion.includes('tecnologia') || lowerQuestion.includes('como foi feito')) {
            return "🔧 Este site foi desenvolvido com HTML5, CSS3, JavaScript ES6+, Firebase para backend, e PWA. Uso Tailwind CSS para estilização e Font Awesome para ícones. É totalmente responsivo e pode ser instalado como app!";
        }
        
        if (lowerQuestion.includes('mikael') || lowerQuestion.includes('desenvolvedor')) {
            return "👨‍💻 Mikael é um desenvolvedor full-stack experiente, com foco em JavaScript, React, Node.js e tecnologias web modernas. Você pode ver seus projetos e habilidades navegando pelo portfolio!";
        }
        
        if (lowerQuestion.includes('projeto') || lowerQuestion.includes('trabalho')) {
            return "📁 Os projetos do Mikael estão na seção Projetos do site. Você pode acessá-la pelo menu lateral ou rolando pela página principal. Lá você encontra detalhes técnicos e links para os repositórios!";
        }
        
        return "🦉 Desculpe, não entendi completamente sua pergunta. Posso te ajudar com navegação, tecnologias usadas, informações sobre o Mikael ou seus projetos. O que gostaria de saber?";
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
