// ===========================================
// CONFIGURAÇÕES GLOBAIS
// ===========================================
const CONFIG = {
    github: {
        username: "mikaelfmts",
        repoCount: 6
    },
    animations: {
        typingSpeed: 100,
        counterSpeed: 2000,
        observerThreshold: 0.1
    },
    lazy: {
        rootMargin: '50px',
        threshold: 0.1
    }
};

// ===========================================
// SISTEMA DE ESTADO GLOBAL
// ===========================================
const AppState = {
    isLoaded: false,
    currentLanguage: localStorage.getItem('language') || 'pt',
    isDarkMode: localStorage.getItem('theme') !== 'light',
    scrollPosition: 0,
    activeSection: 'hero',
    countersAnimated: false
};

// ===========================================
// SISTEMA DE TRADUÇÃO
// ===========================================
const translations = {
    pt: {
        'hero.title': 'Desenvolvedor Full Stack',
        'hero.subtitle': 'Criando experiências digitais incríveis',
        'hero.cta.primary': 'Ver Projetos',
        'hero.cta.secondary': 'Entre em Contato',
        'nav.home': 'Início',
        'nav.about': 'Sobre',
        'nav.skills': 'Habilidades',
        'nav.projects': 'Projetos',
        'nav.blog': 'Blog',
        'nav.contact': 'Contato',
        'about.title': 'Sobre Mim',
        'about.description': 'Desenvolvedor apaixonado por tecnologia e inovação',
        'skills.title': 'Habilidades Técnicas',
        'projects.title': 'Meus Projetos',
        'blog.title': 'Blog & Artigos',
        'contact.title': 'Entre em Contato',
        'footer.rights': 'Todos os direitos reservados'
    },
    en: {
        'hero.title': 'Full Stack Developer',
        'hero.subtitle': 'Creating amazing digital experiences',
        'hero.cta.primary': 'View Projects',
        'hero.cta.secondary': 'Get in Touch',
        'nav.home': 'Home',
        'nav.about': 'About',
        'nav.skills': 'Skills',
        'nav.projects': 'Projects',
        'nav.blog': 'Blog',
        'nav.contact': 'Contact',
        'about.title': 'About Me',
        'about.description': 'Developer passionate about technology and innovation',
        'skills.title': 'Technical Skills',
        'projects.title': 'My Projects',
        'blog.title': 'Blog & Articles',
        'contact.title': 'Get in Touch',
        'footer.rights': 'All rights reserved'
    }
};

// ===========================================
// UTILITÁRIOS
// ===========================================
const Utils = {
    // Debounce para otimizar performance
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Throttle para scroll events
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    },

    // Smooth scroll para links internos
    smoothScroll(target, duration = 1000) {
        const targetElement = document.querySelector(target);
        if (!targetElement) return;

        const targetPosition = targetElement.offsetTop - 80; // Offset para navbar
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        let startTime = null;

        function animation(currentTime) {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const run = ease(timeElapsed, startPosition, distance, duration);
            window.scrollTo(0, run);
            if (timeElapsed < duration) requestAnimationFrame(animation);
        }

        function ease(t, b, c, d) {
            t /= d / 2;
            if (t < 1) return c / 2 * t * t + b;
            t--;
            return -c / 2 * (t * (t - 2) - 1) + b;
        }

        requestAnimationFrame(animation);
    },

    // Animação de counter
    animateCounter(element, start, end, duration) {
        const range = end - start;
        const minTimer = 50;
        const stepTime = Math.abs(Math.floor(duration / range));
        const timer = stepTime < minTimer ? minTimer : stepTime;
        const steps = Math.ceil(duration / timer);
        let current = start;
        const increment = Math.ceil(range / steps);
        
        const counter = setInterval(() => {
            current += increment;
            if (current >= end) {
                element.textContent = end.toLocaleString();
                clearInterval(counter);
            } else {
                element.textContent = current.toLocaleString();
            }
        }, timer);
    },

    // Lazy loading para imagens
    lazyLoadImages() {
        const images = document.querySelectorAll('img[data-src]');
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    img.classList.add('loaded');
                    observer.unobserve(img);
                }
            });
        }, {
            rootMargin: CONFIG.lazy.rootMargin,
            threshold: CONFIG.lazy.threshold
        });

        images.forEach(img => imageObserver.observe(img));
    }
};

// ===========================================
// SISTEMA DE TOAST NOTIFICATIONS
// ===========================================
const Toast = {
    container: null,

    init() {
        this.container = document.createElement('div');
        this.container.className = 'toast-container';
        this.container.setAttribute('aria-live', 'polite');
        document.body.appendChild(this.container);
    },

    show(message, type = 'info', duration = 5000) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <div class="toast-icon">
                    ${this.getIcon(type)}
                </div>
                <div class="toast-message">${message}</div>
                <button class="toast-close" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        this.container.appendChild(toast);

        // Animação de entrada
        requestAnimationFrame(() => {
            toast.classList.add('toast-show');
        });

        // Auto remove
        if (duration > 0) {
            setTimeout(() => {
                this.remove(toast);
            }, duration);
        }

        return toast;
    },

    remove(toast) {
        toast.classList.add('toast-hide');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    },

    getIcon(type) {
        const icons = {
            success: '<i class="fas fa-check-circle"></i>',
            error: '<i class="fas fa-exclamation-circle"></i>',
            warning: '<i class="fas fa-exclamation-triangle"></i>',
            info: '<i class="fas fa-info-circle"></i>'
        };
        return icons[type] || icons.info;
    },

    success(message) {
        return this.show(message, 'success');
    },

    error(message) {
        return this.show(message, 'error');
    },

    warning(message) {
        return this.show(message, 'warning');
    },

    info(message) {
        return this.show(message, 'info');
    }
};

// ===========================================
// SISTEMA DE TYPING EFFECT
// ===========================================
class TypingEffect {
    constructor(element, texts, options = {}) {
        this.element = element;
        this.texts = Array.isArray(texts) ? texts : [texts];
        this.speed = options.speed || CONFIG.animations.typingSpeed;
        this.deleteSpeed = options.deleteSpeed || this.speed / 2;
        this.pause = options.pause || 1000;
        this.loop = options.loop !== false;
        this.cursor = options.cursor !== false;
        this.currentTextIndex = 0;
        this.currentCharIndex = 0;
        this.isDeleting = false;
        this.isPaused = false;

        this.init();
    }

    init() {
        if (this.cursor) {
            this.element.style.borderRight = '2px solid';
            this.element.style.animation = 'blink 1s infinite';
        }
        this.type();
    }

    type() {
        const currentText = this.texts[this.currentTextIndex];
        
        if (this.isDeleting) {
            this.element.textContent = currentText.substring(0, this.currentCharIndex - 1);
            this.currentCharIndex--;
        } else {
            this.element.textContent = currentText.substring(0, this.currentCharIndex + 1);
            this.currentCharIndex++;
        }

        let speed = this.isDeleting ? this.deleteSpeed : this.speed;

        if (!this.isDeleting && this.currentCharIndex === currentText.length) {
            speed = this.pause;
            this.isDeleting = true;
        } else if (this.isDeleting && this.currentCharIndex === 0) {
            this.isDeleting = false;
            this.currentTextIndex = (this.currentTextIndex + 1) % this.texts.length;
            speed = 500;
        }

        if (this.loop || this.currentTextIndex < this.texts.length) {
            setTimeout(() => this.type(), speed);
        }
    }
}

// ===========================================
// SISTEMA DE NAVEGAÇÃO E SCROLL
// ===========================================
const Navigation = {
    navbar: null,
    scrollProgress: null,
    backToTop: null,
    sections: [],

    init() {
        this.navbar = document.querySelector('.navbar');
        this.scrollProgress = document.querySelector('.scroll-progress');
        this.backToTop = document.querySelector('.back-to-top');
        this.sections = document.querySelectorAll('section[id]');

        this.bindEvents();
        this.updateActiveSection();
    },

    bindEvents() {
        // Scroll event com throttle
        window.addEventListener('scroll', Utils.throttle(() => {
            this.updateScrollProgress();
            this.updateActiveSection();
            this.toggleBackToTop();
            this.updateNavbarState();
        }, 16));

        // Navigation links
        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = link.getAttribute('href');
                if (target && target !== '#') {
                    Utils.smoothScroll(target);
                }
            });
        });

        // Back to top button
        if (this.backToTop) {
            this.backToTop.addEventListener('click', () => {
                Utils.smoothScroll('#hero');
            });
        }
    },

    updateScrollProgress() {
        if (!this.scrollProgress) return;
        
        const scrollTop = window.pageYOffset;
        const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = (scrollTop / documentHeight) * 100;
        
        this.scrollProgress.style.width = `${Math.min(progress, 100)}%`;
    },

    updateActiveSection() {
        const scrollTop = window.pageYOffset;
        
        this.sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionBottom = sectionTop + section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollTop >= sectionTop && scrollTop < sectionBottom) {
                // Update active navigation
                document.querySelectorAll('.nav-link').forEach(link => {
                    link.classList.remove('active');
                });
                
                const activeLink = document.querySelector(`a[href="#${sectionId}"]`);
                if (activeLink) {
                    activeLink.classList.add('active');
                }
                
                AppState.activeSection = sectionId;
            }
        });
    },

    toggleBackToTop() {
        if (!this.backToTop) return;
        
        if (window.pageYOffset > 300) {
            this.backToTop.classList.add('visible');
        } else {
            this.backToTop.classList.remove('visible');
        }
    },

    updateNavbarState() {
        if (!this.navbar) return;
        
        if (window.pageYOffset > 50) {
            this.navbar.classList.add('scrolled');
        } else {
            this.navbar.classList.remove('scrolled');
        }
    }
};

document.addEventListener("DOMContentLoaded", function () {
    // Criar um estilo global para desativar TODAS as animações nos cards
    const style = document.createElement('style');
    style.textContent = `
        .projeto, .skill-card, 
        .projeto *, .skill-card * {
            transform: none !important;
            transition: none !important;
            animation: none !important;
            perspective: none !important;
            transform-style: flat !important;
            box-shadow: none !important;
            will-change: auto !important;
        }
        .projeto:hover, .skill-card:hover,
        .projeto:hover *, .skill-card:hover * {
            transform: none !important;
            transition: none !important;
            animation: none !important;
            perspective: none !important;
            transform-style: flat !important;
            box-shadow: none !important;
        }
    `;
    document.head.appendChild(style);
    
    // Remover TODAS as transformações e transições dos cards
    const cards = document.querySelectorAll('.projeto, .skill-card');
    cards.forEach(card => {
        // Aplicar estilos com !important para garantir que nada seja aplicado
        card.setAttribute('style', 'transform: none !important; transition: none !important; animation: none !important; opacity: 1 !important; perspective: none !important; box-shadow: none !important;');
        
        // Desativar quaisquer efeitos existentes
        const allElements = card.querySelectorAll('*');
        allElements.forEach(el => {
            el.setAttribute('style', el.getAttribute('style') + '; transform: none !important; transition: none !important; animation: none !important;');
        });
    });
});
// ==================== IMPORTS DO FIREBASE ====================
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js';
import { 
    getFirestore, 
    collection, 
    addDoc, 
    onSnapshot, 
    query, 
    where, 
    orderBy, 
    updateDoc, 
    doc,
    getDocs,
    enableNetwork,
    disableNetwork 
} from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js';

// ==================== CONFIGURAÇÃO DO FIREBASE ====================
const firebaseConfig = {
  apiKey: "AIzaSyA0VoWMLTJIyI54Pj0P5T75gCH6KpgAcbk",
  authDomain: "mikaelfmts.firebaseapp.com",
  projectId: "mikaelfmts",
  storageBucket: "mikaelfmts.firebasestorage.app",
  messagingSenderId: "516762612351",
  appId: "1:516762612351:web:f8a0f229ffd5def8ec054a"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

// Configurar cache offline
try {
    enableNetwork(db);
} catch (err) {
    console.log('Cache offline não disponível:', err);
}

// Detectar conexão online/offline
window.addEventListener('online', () => {
    console.log('Conexão restaurada');
    enableNetwork(db);
});

window.addEventListener('offline', () => {
    console.log('Conexão perdida - modo offline');
});

console.log('Firebase inicializado com sucesso!');

// ==================== EXPORTAR FUNÇÕES PARA USO GLOBAL ====================
// Como estamos usando módulos ES6, precisamos exportar explicitamente as funções
// que são chamadas via atributos onclick no HTML
window.toggleMenu = toggleMenu;
window.toggleChat = toggleChat;
window.setUserName = setUserName;
window.sendMessage = sendMessage;
window.toggleTheme = toggleTheme;

// ==================== SISTEMA DE CHAT COM FIREBASE ====================

// Variáveis globais do chat
let currentUserName = '';
let currentChatId = '';
let messagesListener = null;

// Função para gerar chat_id baseado no nome e data
function generateChatId(nome) {
    const hoje = new Date();
    const dataFormatada = hoje.toISOString().split('T')[0].replace(/-/g, '');
    return `${nome.toLowerCase().replace(/\s+/g, '-')}-${dataFormatada}`;
}

// Função para definir o nome do usuário
async function setUserName() {
    const nameInput = document.getElementById('name-input');
    const name = nameInput.value.trim();
    
    if (!name) {
        alert('Por favor, digite seu nome!');
        return;
    }
    
    if (name.length < 2) {
        alert('O nome deve ter pelo menos 2 caracteres!');
        return;
    }
    
    currentUserName = name;
    currentChatId = generateChatId(name);
    
    // Esconder formulário de nome e mostrar chat
    document.getElementById('name-form').style.display = 'none';
    document.getElementById('chat-area').style.display = 'block';
    
    // Atualizar header do chat
    document.getElementById('chat-header').innerHTML = `🤖 Chat - ${currentUserName}`;
    
    // Limpar área de mensagens e resetar inicialização
    const chatMessages = document.getElementById('chat-messages');
    chatMessages.innerHTML = '';
    chatMessages.dataset.initialized = 'false';
    
    // Carregar mensagens anteriores
    loadChatMessages();
    
    // Mostrar mensagem de boas-vindas
    addSystemMessage(`Olá ${currentUserName}! Sua mensagem será enviada para Mikael, que responderá assim que possível. Como posso ajudar você hoje?`);
}

// Função para adicionar mensagem do sistema
function addSystemMessage(message, type = 'info') {
    const chatMessages = document.getElementById('chat-messages');
    if (!chatMessages) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message system-message ${type}`;
    messageDiv.innerHTML = `
        <div class="message-content">
            <strong>Sistema:</strong> ${message}
        </div>
        <div class="message-time">${new Date().toLocaleTimeString()}</div>
    `;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Função para mostrar status de conexão
function updateConnectionStatus(isOnline) {
    const statusMessage = isOnline ? 
        'Conectado - suas mensagens serão enviadas em tempo real' : 
        'Sem conexão - suas mensagens serão enviadas quando a conexão for restaurada';
    
    addSystemMessage(statusMessage, isOnline ? 'success' : 'warning');
}

// Função para carregar mensagens do chat
function loadChatMessages() {
    if (!db || !currentChatId) return;
    
    try {
        // Primeiro, tentar carregar mensagens existentes com uma consulta simples
        loadExistingMessages().then(() => {
            // Depois, configurar listener para mensagens novas/atualizadas
            setupRealTimeListener();
        }).catch(error => {
            console.error('Erro ao carregar mensagens existentes:', error);
            // Fallback: tentar configurar apenas o listener simples
            try {
                setupSimpleListener();
            } catch (fallbackError) {
                console.error('Erro no fallback:', fallbackError);
                addSystemMessage('Conexão limitada. Novas mensagens serão carregadas, mas histórico pode não aparecer.', 'warning');
            }
        });
        
    } catch (error) {
        console.error('Erro ao configurar chat:', error);
        addSystemMessage('Erro ao conectar com o servidor. Tentando novamente...', 'error');
        
        // Fallback: tentar configurar apenas o listener simples
        try {
            setupSimpleListener();
        } catch (fallbackError) {
            console.error('Erro no fallback:', fallbackError);
            addSystemMessage('Conexão limitada. Novas mensagens serão carregadas, mas histórico pode não aparecer.', 'warning');
        }
    }
}

// Função para carregar mensagens existentes sem índices (usando getDocs)
async function loadExistingMessages() {
    try {
        console.log('Carregando mensagens existentes para chat:', currentChatId);
        
        const messagesRef = collection(db, 'mensagens');
        const q = query(messagesRef, where('chat_id', '==', currentChatId));
        
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
            // Converter para array e ordenar manualmente por timestamp
            const messages = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                messages.push({ id: doc.id, data: data, timestamp: data.hora });
            });
            
            // Ordenar por timestamp
            messages.sort((a, b) => {
                const timeA = a.timestamp?.toDate?.() || new Date(a.timestamp);
                const timeB = b.timestamp?.toDate?.() || new Date(b.timestamp);
                return timeA - timeB;
            });
            
            // Exibir mensagens ordenadas
            const chatMessages = document.getElementById('chat-messages');
            messages.forEach(msg => {
                displayMessage(msg.data, msg.id);
            });
            
            chatMessages.dataset.initialized = 'true';
            chatMessages.scrollTop = chatMessages.scrollHeight;
            
            console.log(`Carregadas ${messages.length} mensagens existentes`);
        } else {
            console.log('Nenhuma mensagem anterior encontrada para este chat');
        }
    } catch (error) {
        console.error('Erro ao carregar mensagens existentes:', error);
        throw error;
    }
}

// Função para configurar listener em tempo real (sem orderBy)
function setupRealTimeListener() {
    try {
        console.log('Configurando listener em tempo real');
        
        const messagesRef = collection(db, 'mensagens');
        const q = query(messagesRef, where('chat_id', '==', currentChatId));
        
        messagesListener = onSnapshot(q, (snapshot) => {
            const chatMessages = document.getElementById('chat-messages');
            
            // Processar apenas mudanças se o chat já foi inicializado
            if (chatMessages.dataset.initialized === 'true') {
                snapshot.docChanges().forEach((change) => {
                    const data = change.doc.data();
                    const messageId = change.doc.id;
                    
                    console.log('Mudança detectada:', change.type, messageId, data);
                    
                    if (change.type === 'added') {
                        // Nova mensagem: verificar se já não está exibida
                        if (!document.querySelector(`[data-message-id="${messageId}"]`)) {
                            displayMessage(data, messageId);
                            chatMessages.scrollTop = chatMessages.scrollHeight;
                        }
                    } else if (change.type === 'modified') {
                        // Mensagem modificada (resposta do admin)
                        updateMessage(data, messageId);
                    }
                });
            }
        }, (error) => {
            console.error('Erro no listener em tempo real:', error);
            // Não mostrar erro para o usuário se já temos as mensagens carregadas
        });
        
    } catch (error) {
        console.error('Erro ao configurar listener:', error);
        throw error;
    }
}

// Função fallback para listener simples (sem ordenação)
function setupSimpleListener() {
    console.log('Configurando listener simples (fallback)');
    
    const messagesRef = collection(db, 'mensagens');
    const q = query(messagesRef, where('chat_id', '==', currentChatId));
    
    messagesListener = onSnapshot(q, (snapshot) => {
        const chatMessages = document.getElementById('chat-messages');
        
        if (!chatMessages.dataset.initialized) {
            // Primeira carga: mostrar todas as mensagens sem ordenação
            snapshot.forEach((doc) => {
                const data = doc.data();
                displayMessage(data, doc.id);
            });
            chatMessages.dataset.initialized = 'true';
            chatMessages.scrollTop = chatMessages.scrollHeight;
        } else {
            // Processar mudanças
            snapshot.docChanges().forEach((change) => {
                const data = change.doc.data();
                const messageId = change.doc.id;
                
                if (change.type === 'added') {
                    if (!document.querySelector(`[data-message-id="${messageId}"]`)) {
                        displayMessage(data, messageId);
                        chatMessages.scrollTop = chatMessages.scrollHeight;
                    }
                } else if (change.type === 'modified') {
                    updateMessage(data, messageId);
                }
            });
        }
    }, (error) => {
        console.error('Erro no listener simples:', error);
        addSystemMessage('Problema de conexão. Algumas mensagens podem não aparecer.', 'warning');
    });
}

// Função para exibir mensagem na interface
function displayMessage(messageData, messageId) {
    const chatMessages = document.getElementById('chat-messages');
    if (!chatMessages) return;

    console.log('Exibindo mensagem:', messageId, messageData);

    const messageDiv = document.createElement('div');
    messageDiv.className = `message user-message ${messageData.respondido ? 'responded' : ''}`;
    messageDiv.dataset.messageId = messageId;
    
    // Tratar corretamente o timestamp do Firestore
    let hora;
    if (messageData.hora) {
        if (typeof messageData.hora.toDate === 'function') {
            // Caso seja um timestamp do Firestore
            hora = messageData.hora.toDate().toLocaleTimeString();
        } else if (messageData.hora instanceof Date) {
            // Caso seja um objeto Date normal
            hora = messageData.hora.toLocaleTimeString();
        } else {
            // Fallback
            hora = new Date().toLocaleTimeString();
        }
    } else {
        hora = new Date().toLocaleTimeString();
    }
    
    messageDiv.innerHTML = `
        <div class="message-content">
            <strong>Você:</strong> ${messageData.mensagem}
        </div>
        <div class="message-time">${hora}</div>
        ${messageData.resposta ? `
            <div class="admin-response">
                <strong>Mikael:</strong> ${messageData.resposta}
            </div>
        ` : ''}
    `;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Função para atualizar mensagem existente quando há resposta do admin
function updateMessage(messageData, messageId) {
    const chatMessages = document.getElementById('chat-messages');
    if (!chatMessages) return;
    
    console.log('Atualizando mensagem:', messageId, messageData);
    
    // Encontrar a mensagem existente
    const existingMessage = document.querySelector(`[data-message-id="${messageId}"]`);
    
    if (existingMessage) {
        // Atualizar o conteúdo da mensagem existente
        existingMessage.className = `message user-message ${messageData.respondido ? 'responded' : ''}`;
        
        // Tratar corretamente o timestamp do Firestore
        let hora;
        if (messageData.hora) {
            if (typeof messageData.hora.toDate === 'function') {
                hora = messageData.hora.toDate().toLocaleTimeString();
            } else if (messageData.hora instanceof Date) {
                hora = messageData.hora.toLocaleTimeString();
            } else {
                hora = new Date().toLocaleTimeString();
            }
        } else {
            hora = new Date().toLocaleTimeString();
        }
        
        existingMessage.innerHTML = `
            <div class="message-content">
                <strong>Você:</strong> ${messageData.mensagem}
            </div>
            <div class="message-time">${hora}</div>
            ${messageData.resposta ? `
                <div class="admin-response">
                    <strong>Mikael:</strong> ${messageData.resposta}
                </div>
            ` : ''}
        `;
        
        console.log('Mensagem atualizada com resposta:', messageData.resposta);
    } else {
        console.log('Mensagem não encontrada, criando nova:', messageId);
        // Se a mensagem não existe, criar ela
        displayMessage(messageData, messageId);
    }
    
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Função para enviar mensagem
async function sendMessage() {
    if (!currentUserName) {
        alert('Por favor, defina seu nome primeiro!');
        return;
    }
    
    const inputField = document.getElementById('chat-input');
    const message = inputField.value.trim();
    
    if (!message) return;
    
    if (!db) {
        addSystemMessage('Erro: Firebase não está conectado. Tente recarregar a página.', 'error');
        return;
    }
    
    try {
        // Exibir mensagem imediatamente na interface para feedback visual
        const previewMsg = {
            nome: currentUserName,
            mensagem: message,
            hora: new Date(),
            chat_id: currentChatId,
            resposta: '',  // Campo vazio inicialmente
            respondido: false
        };
        
        const tempId = 'temp-' + Date.now();
        displayMessage(previewMsg, tempId);
        
        // Limpar input antes de salvar para feedback imediato
        inputField.value = '';
        
        // Salvar mensagem no Firestore
        await addDoc(collection(db, 'mensagens'), previewMsg);
        
        console.log('Mensagem enviada com sucesso!');
    } catch (error) {
        console.error('Erro ao enviar mensagem:', error);
        addSystemMessage('Erro ao enviar mensagem. Tente novamente.', 'error');
    }
}

// Função para permitir envio com Enter
document.addEventListener('DOMContentLoaded', function() {
    // Para o input do nome
    const nameInput = document.getElementById('name-input');
    if (nameInput) {
        nameInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                setUserName();
            }
        });
    }
    
    // Para o input do chat
    const chatInput = document.getElementById('chat-input');
    if (chatInput) {
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
});

// Limpar listener quando a página for fechada
window.addEventListener('beforeunload', function() {
    if (messagesListener) {
        messagesListener();
    }
});

// Detectar mudanças de conexão
window.addEventListener('online', function() {
    if (currentUserName) {
        updateConnectionStatus(true);
    }
});

window.addEventListener('offline', function() {
    if (currentUserName) {
        updateConnectionStatus(false);
    }
});

// ==================== FIM DO SISTEMA DE CHAT ====================

// Função para alternar a visibilidade do chat
function toggleChat() {
    let chatBody = document.getElementById("chat-body");
    let isVisible = chatBody.style.display === "block";
    
    chatBody.style.display = isVisible ? "none" : "block";
    
    // Se o chat estiver abrindo e não tivermos um usuário ainda, focar no campo de nome
    if (!isVisible && !currentUserName) {
        setTimeout(() => {
            const nameInput = document.getElementById('name-input');
            if (nameInput) nameInput.focus();
        }, 100);
    }
    
    // Se o chat estiver abrindo e já tivermos um usuário, focar no campo de mensagem
    if (!isVisible && currentUserName) {
        setTimeout(() => {
            const chatInput = document.getElementById('chat-input');
            if (chatInput) chatInput.focus();
        }, 100);
    }
}

// Removido efeito parallax

// Detectar dispositivo móvel para desativar efeitos pesados
function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

if (isMobile()) {
    document.body.classList.add('mobile');
}

// Tema claro/escuro
function toggleTheme() {
    document.body.classList.toggle('light-mode');
    localStorage.setItem('theme', document.body.classList.contains('light-mode') ? 'light' : 'dark');
    updateThemeIcon();
}

function updateThemeIcon() {
    const themeIcon = document.getElementById('theme-icon');
    if (document.body.classList.contains('light-mode')) {
        themeIcon.className = 'fas fa-moon';
    } else {
        themeIcon.className = 'fas fa-sun';
    }
}

// Verificar preferência de tema salva
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'light') {
    document.body.classList.add('light-mode');
}

// Efeito de cards removido

// Registrar Service Worker para PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('ServiceWorker registrado com sucesso:', registration.scope);
            })
            .catch(error => {
                console.log('Falha ao registrar o ServiceWorker:', error);
            });
    });
}

// Código para a página de projetos interativos
document.addEventListener('DOMContentLoaded', () => {
    // Verificar se estamos na página de projetos interativos
    if (!document.querySelector('.project-tabs')) return;

    // Gestão das abas de projetos
    const tabBtns = document.querySelectorAll('.tab-btn');
    const projectContents = document.querySelectorAll('.project-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');
            
            tabBtns.forEach(b => b.classList.remove('active'));
            projectContents.forEach(content => content.classList.remove('active'));
            
            btn.classList.add('active');
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });

    // Inicializar cada projeto
    initCalculator();
    initSnakeGame();
    initCodeEditor();
});

// ========== CALCULADORA AVANÇADA ==========
function initCalculator() {
    const calculator = {
        displayValue: '0',
        firstOperand: null,
        waitingForSecondOperand: false,
        operator: null,
        memory: 0,
        history: []
    };

    // Elementos da DOM
    const displayOperation = document.querySelector('.calc-operation');
    const displayResult = document.querySelector('.calc-result');
    const standardKeypad = document.querySelector('.standard-keypad');
    const scientificKeypad = document.querySelector('.scientific-keypad');
    const standardModeBtn = document.getElementById('standard-mode');
    const scientificModeBtn = document.getElementById('scientific-mode');
    const historyBtn = document.getElementById('calc-history-btn');
    const historyPanel = document.querySelector('.calc-history');
    const historyList = document.querySelector('.history-list');
    const clearHistoryBtn = document.getElementById('clear-history');

    // Carregar histórico do localStorage
    loadHistory();

    // Configurar teclado científico
    setupScientificKeypad();

    // Event listeners para botões da calculadora
    if (standardKeypad) {
        standardKeypad.addEventListener('click', (event) => {
            if (!event.target.matches('button')) return;
            handleButtonClick(event.target);
        });
    }

    if (scientificKeypad) {
        scientificKeypad.addEventListener('click', (event) => {
            if (!event.target.matches('button')) return;
            handleButtonClick(event.target);
        });
    }

    // Event listeners para mudança de modo
    if (standardModeBtn) {
        standardModeBtn.addEventListener('click', () => {
            standardModeBtn.classList.add('active');
            scientificModeBtn.classList.remove('active');
            standardKeypad.classList.remove('hidden');
            scientificKeypad.classList.add('hidden');
        });
    }

    if (scientificModeBtn) {
        scientificModeBtn.addEventListener('click', () => {
            scientificModeBtn.classList.add('active');
            standardModeBtn.classList.remove('active');
            scientificKeypad.classList.remove('hidden');
            standardKeypad.classList.add('hidden');
        });
    }

    // Toggle histórico
    if (historyBtn) {
        historyBtn.addEventListener('click', () => {
            historyPanel.classList.toggle('hidden');
        });
    }

    // Limpar histórico
    if (clearHistoryBtn) {
        clearHistoryBtn.addEventListener('click', () => {
            calculator.history = [];
            saveHistory();
            renderHistory();
        });
    }

    // Suporte a teclado
    document.addEventListener('keydown', (event) => {
        if (!document.querySelector('.calculator')) return;
        
        const key = event.key;
        
        if (/[0-9]/.test(key)) {
            inputDigit(parseInt(key, 10));
            updateDisplay();
        } else if (key === '.') {
            inputDecimal();
            updateDisplay();
        } else if (key === '+' || key === '-' || key === '*' || key === '/') {
            handleOperator(key);
            updateDisplay();
        } else if (key === 'Enter' || key === '=') {
            handleEquals();
            updateDisplay();
        } else if (key === 'Backspace') {
            handleBackspace();
            updateDisplay();
        } else if (key === 'Escape' || key === 'c' || key === 'C') {
            resetCalculator();
            updateDisplay();
        }
    });

    // Funções da calculadora
    function handleButtonClick(button) {
        if (button.classList.contains('number')) {
            inputDigit(parseInt(button.textContent, 10));
            updateDisplay();
        } else if (button.classList.contains('decimal')) {
            inputDecimal();
            updateDisplay();
        } else if (button.classList.contains('operator')) {
            handleOperator(button.textContent);
            updateDisplay();
        } else if (button.classList.contains('equals')) {
            handleEquals();
            updateDisplay();
        } else if (button.classList.contains('clear')) {
            resetCalculator();
            updateDisplay();
        } else if (button.classList.contains('backspace')) {
            handleBackspace();
            updateDisplay();
        } else if (button.classList.contains('percent')) {
            handlePercent();
            updateDisplay();
        } else if (button.classList.contains('scientific')) {
            handleScientificOperation(button.getAttribute('data-operation'));
            updateDisplay();
        }
    }

    function inputDigit(digit) {
        const { displayValue, waitingForSecondOperand } = calculator;
        
        if (waitingForSecondOperand) {
            calculator.displayValue = String(digit);
            calculator.waitingForSecondOperand = false;
        } else {
            calculator.displayValue = displayValue === '0' ? String(digit) : displayValue + digit;
        }
    }

    function inputDecimal() {
        if (calculator.waitingForSecondOperand) {
            calculator.displayValue = '0.';
            calculator.waitingForSecondOperand = false;
            return;
        }
        
        if (!calculator.displayValue.includes('.')) {
            calculator.displayValue += '.';
        }
    }

    function handleOperator(nextOperator) {
        const { firstOperand, displayValue, operator } = calculator;
        const inputValue = parseFloat(displayValue);
        
        if (operator && calculator.waitingForSecondOperand) {
            calculator.operator = nextOperator;
            return;
        }
        
        if (firstOperand === null && !isNaN(inputValue)) {
            calculator.firstOperand = inputValue;
        } else if (operator) {
            const result = calculate(firstOperand, inputValue, operator);
            calculator.displayValue = `${parseFloat(result.toFixed(7))}`;
            calculator.firstOperand = result;
            
            // Adicionar ao histórico
            addToHistory(`${firstOperand} ${operator} ${inputValue}`, result);
        }
        
        calculator.waitingForSecondOperand = true;
        calculator.operator = nextOperator;
        
        displayOperation.textContent = `${calculator.firstOperand} ${calculator.operator}`;
    }

    function handleEquals() {
        const { firstOperand, displayValue, operator } = calculator;
        const inputValue = parseFloat(displayValue);
        
        if (operator && !calculator.waitingForSecondOperand) {
            const result = calculate(firstOperand, inputValue, operator);
            calculator.displayValue = `${parseFloat(result.toFixed(7))}`;
            calculator.firstOperand = result;
            
            // Adicionar ao histórico
            addToHistory(`${firstOperand} ${operator} ${inputValue}`, result);
            
            displayOperation.textContent = `${firstOperand} ${operator} ${inputValue} =`;
            calculator.operator = null;
        }
    }

    function handlePercent() {
        const { displayValue } = calculator;
        const percentValue = parseFloat(displayValue) / 100;
        calculator.displayValue = String(percentValue);
    }

    function handleBackspace() {
        if (calculator.displayValue.length > 1) {
            calculator.displayValue = calculator.displayValue.slice(0, -1);
        } else {
            calculator.displayValue = '0';
        }
    }

    function resetCalculator() {
        calculator.displayValue = '0';
        calculator.firstOperand = null;
        calculator.waitingForSecondOperand = false;
        calculator.operator = null;
        displayOperation.textContent = '';
    }

    function calculate(firstOperand, secondOperand, operator) {
        if (operator === '+') {
            return firstOperand + secondOperand;
        } else if (operator === '-') {
            return firstOperand - secondOperand;
        } else if (operator === '*') {
            return firstOperand * secondOperand;
        } else if (operator === '/') {
            return firstOperand / secondOperand;
        }
        
        return secondOperand;
    }

    function handleScientificOperation(operation) {
        const { displayValue } = calculator;
        const inputValue = parseFloat(displayValue);
        let result;
        
        switch (operation) {
            case 'sqrt':
                result = Math.sqrt(inputValue);
                break;
            case 'square':
                result = Math.pow(inputValue, 2);
                break;
            case 'sin':
                result = Math.sin(inputValue * Math.PI / 180); // Degrees
                break;
            case 'cos':
                result = Math.cos(inputValue * Math.PI / 180); // Degrees
                break;
            case 'tan':
                result = Math.tan(inputValue * Math.PI / 180); // Degrees
                break;
            case 'log':
                result = Math.log10(inputValue);
                break;
            case 'ln':
                result = Math.log(inputValue);
                break;
            case 'pi':
                result = Math.PI;
                break;
            default:
                return;
        }
        
        calculator.displayValue = `${parseFloat(result.toFixed(7))}`;
        calculator.firstOperand = result;
        calculator.waitingForSecondOperand = true;
        
        // Adicionar ao histórico
        addToHistory(`${operation}(${inputValue})`, result);
    }

    function updateDisplay() {
        if (displayResult) {
            displayResult.textContent = calculator.displayValue;
        }
    }

    function setupScientificKeypad() {
        if (!scientificKeypad) return;
        
        const scientificButtons = [
            { label: 'sin', op: 'sin' },
            { label: 'cos', op: 'cos' },
            { label: 'tan', op: 'tan' },
            { label: 'π', op: 'pi' },
            { label: '√', op: 'sqrt' },
            { label: 'x²', op: 'square' },
            { label: 'log', op: 'log' },
            { label: 'ln', op: 'ln' }
        ];
        
        scientificButtons.forEach(btn => {
            const button = document.createElement('button');
            button.textContent = btn.label;
            button.className = 'calc-key scientific';
            button.setAttribute('data-operation', btn.op);
            scientificKeypad.appendChild(button);
        });
        
        // Adicionar os botões padrão ao keypad científico
        const standardButtons = standardKeypad.querySelectorAll('button');
        standardButtons.forEach(btn => {
            const clone = btn.cloneNode(true);
            scientificKeypad.appendChild(clone);
        });
    }

    function addToHistory(expression, result) {
        calculator.history.push({ expression, result });
        saveHistory();
        renderHistory();
    }

    function saveHistory() {
        localStorage.setItem('calculatorHistory', JSON.stringify(calculator.history));
    }

    function loadHistory() {
        const savedHistory = localStorage.getItem('calculatorHistory');
        if (savedHistory) {
            calculator.history = JSON.parse(savedHistory);
            renderHistory();
        }
    }

    function renderHistory() {
        if (!historyList) return;
        
        historyList.innerHTML = '';
        
        calculator.history.slice().reverse().forEach(item => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            
            const expression = document.createElement('div');
            expression.className = 'history-expression';
            expression.textContent = item.expression;
            
            const result = document.createElement('div');
            result.className = 'history-result';
            result.textContent = item.result;
            
            historyItem.appendChild(expression);
            historyItem.appendChild(result);
            historyList.appendChild(historyItem);
        });
    }

    // Inicializar display
    updateDisplay();
}

// ========== JOGO SNAKE ==========
function initSnakeGame() {
    // Verificar se estamos na página do jogo
    const canvas = document.getElementById('snake-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const startBtn = document.getElementById('start-game');
    const pauseBtn = document.getElementById('pause-game');
    const restartBtn = document.getElementById('restart-game');
    const currentScoreElement = document.getElementById('current-score');
    const highScoreElement = document.getElementById('high-score');
    const finalScoreElement = document.querySelector('.final-score');
    const gameMessage = document.querySelector('.game-message');
    const difficultySlider = document.getElementById('difficulty');
    
    // Carregar high score do localStorage
    let highScore = localStorage.getItem('snakeHighScore') || 0;
    highScoreElement.textContent = highScore;
    
    // Variáveis do jogo
    const gridSize = 20;
    const gridWidth = canvas.width / gridSize;
    const gridHeight = canvas.height / gridSize;
    
    let snake = [];
    let food = {};
    let direction = 'right';
    let nextDirection = 'right';
    let score = 0;
    let speed = 150; // ms
    let gameInterval = null;
    let isPaused = false;
    let obstacles = [];
    
    // Inicializar jogo
    function initGame() {
        snake = [
            { x: 10, y: 10 },
            { x: 9, y: 10 },
            { x: 8, y: 10 }
        ];
        
        score = 0;
        currentScoreElement.textContent = score;
        
        direction = 'right';
        nextDirection = 'right';
        
        generateFood();
        setDifficulty();
        
        // Gerar obstáculos apenas em dificuldades médio e difícil
        obstacles = [];
        if (difficultySlider.value > 1) {
            generateObstacles();
        }
        
        draw();
    }
    
    function setDifficulty() {
        const difficulty = difficultySlider.value;
        switch(parseInt(difficulty)) {
            case 1: // Fácil
                speed = 180;
                break;
            case 2: // Médio
                speed = 130;
                break;
            case 3: // Difícil
                speed = 80;
                break;
        }
    }
    
    function startGame() {
        if (gameInterval) return;
        
        initGame();
        gameInterval = setInterval(gameLoop, speed);
        
        startBtn.classList.add('hidden');
        pauseBtn.classList.remove('hidden');
        gameMessage.classList.add('hidden');
    }
    
    function pauseGame() {
        if (!gameInterval) return;
        
        if (isPaused) {
            gameInterval = setInterval(gameLoop, speed);
            pauseBtn.textContent = 'Pausar';
        } else {
            clearInterval(gameInterval);
            gameInterval = null;
            pauseBtn.textContent = 'Continuar';
        }
        
        isPaused = !isPaused;
    }
    
    function gameOver() {
        clearInterval(gameInterval);
        gameInterval = null;
        
        // Atualizar high score se necessário
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('snakeHighScore', highScore);
            highScoreElement.textContent = highScore;
        }
        
        // Mostrar mensagem de game over
        finalScoreElement.textContent = score;
        gameMessage.classList.remove('hidden');
        pauseBtn.classList.add('hidden');
        startBtn.classList.remove('hidden');
    }
    
    function gameLoop() {
        moveSnake();
        
        if (checkCollision()) {
            gameOver();
            return;
        }
        
        if (eatFood()) {
            generateFood();
            score += 10;
            currentScoreElement.textContent = score;
            
            // Adicionar obstáculo a cada 5 comidas em dificuldade difícil
            if (difficultySlider.value == 3 && score % 50 === 0) {
                generateObstacles(1);
            }
        } else {
            // Remover a cauda apenas se não comeu
            snake.pop();
        }
        
        draw();
    }
    
    function moveSnake() {
        // Atualizar direção
        direction = nextDirection;
        
        // Calcular nova posição da cabeça
        const head = { ...snake[0] };
        
        switch (direction) {
            case 'up':
                head.y -= 1;
                break;
            case 'down':
                head.y += 1;
                break;
            case 'left':
                head.x -= 1;
                break;
            case 'right':
                head.x += 1;
                break;
        }
        
        // Teletransportar se atingir borda
        if (head.x < 0) head.x = gridWidth - 1;
        if (head.x >= gridWidth) head.x = 0;
        if (head.y < 0) head.y = gridHeight - 1;
        if (head.y >= gridHeight) head.y = 0;
        
        // Adicionar nova cabeça à frente
        snake.unshift(head);
    }
    
    function checkCollision() {
        const head = snake[0];
        
        // Verificar colisão com o corpo
        for (let i = 1; i < snake.length; i++) {
            if (head.x === snake[i].x && head.y === snake[i].y) {
                return true;
            }
        }
        
        // Verificar colisão com obstáculos
        for (let obs of obstacles) {
            if (head.x === obs.x && head.y === obs.y) {
                return true;
            }
        }
        
        return false;
    }
    
    function eatFood() {
        const head = snake[0];
        
        if (head.x === food.x && head.y === food.y) {
            return true;
        }
        
        return false;
    }
    
    function generateFood() {
        // Criar comida em posição aleatória que não colida com cobra ou obstáculos
        let validPosition = false;
        let newFood;
        
        while (!validPosition) {
            newFood = {
                x: Math.floor(Math.random() * gridWidth),
                y: Math.floor(Math.random() * gridHeight)
            };
            
            validPosition = true;
            
            // Verificar se colide com a cobra
            for (let segment of snake) {
                if (newFood.x === segment.x && newFood.y === segment.y) {
                    validPosition = false;
                }
            }
            
            // Verificar se colide com obstáculos
            for (let obs of obstacles) {
                if (newFood.x === obs.x && newFood.y === obs.y) {
                    validPosition = false;
                }
            }
        }
        
        food = newFood;
    }
    
    function generateObstacles(count = 3) {
        for (let i = 0; i < count; i++) {
            let validPosition = false;
            let newObstacle;
            
            while (!validPosition) {
                newObstacle = {
                    x: Math.floor(Math.random() * gridWidth),
                    y: Math.floor(Math.random() * gridHeight)
                };
                
                validPosition = true;
                
                // Verificar se colide com a cobra
                for (let segment of snake) {
                    if (newObstacle.x === segment.x && newObstacle.y === segment.y) {
                        validPosition = false;
                    }
                }
                
                // Verificar se colide com comida
                if (newObstacle.x === food.x && newObstacle.y === food.y) {
                    validPosition = false;
                }
                
                // Verificar se colide com outros obstáculos
                for (let obs of obstacles) {
                    if (newObstacle.x === obs.x && newObstacle.y === obs.y) {
                        validPosition = false;
                    }
                }
            }
            
            obstacles.push(newObstacle);
        }
    }
    
    function draw() {
        // Limpar canvas
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--background-primary');
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Desenhar cobra
        for (let i = 0; i < snake.length; i++) {
            if (i === 0) {
                // Cabeça
                ctx.fillStyle = '#4CAF50';
            } else {
                // Corpo
                ctx.fillStyle = '#8BC34A';
            }
            
            ctx.fillRect(snake[i].x * gridSize, snake[i].y * gridSize, gridSize - 2, gridSize - 2);
        }
        
        // Desenhar comida
        ctx.fillStyle = '#FF5252';
        ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 2, gridSize - 2);
        
        // Desenhar obstáculos
        ctx.fillStyle = '#607D8B';
        obstacles.forEach(obs => {
            ctx.fillRect(obs.x * gridSize, obs.y * gridSize, gridSize - 2, gridSize - 2);
        });
    }
    
    // Event listeners e controles
    document.addEventListener('keydown', (event) => {
        if (!document.querySelector('.game-container')) return;
        
        const key = event.key.toLowerCase();
        const arrowControls = { arrowup: 'up', arrowdown: 'down', arrowleft: 'left', arrowright: 'right' };
        const wasdControls = { w: 'up', s: 'down', a: 'left', d: 'right' };
        
        // Verificar controles selecionados
        const useWasd = document.getElementById('wasd').checked;
        const controls = useWasd ? wasdControls : arrowControls;
        
        // Definir direção com base no controle atual
        const newDirection = controls[key];
        
        if (!newDirection) return;
        
        // Evitar direção oposta
        if (
            (direction === 'up' && newDirection === 'down') ||
            (direction === 'down' && newDirection === 'up') ||
            (direction === 'left' && newDirection === 'right') ||
            (direction === 'right' && newDirection === 'left')
        ) {
            return;
        }
        
        nextDirection = newDirection;
    });
    
    // Botões de controle
    if (startBtn) {
        startBtn.addEventListener('click', startGame);
    }
    
    if (pauseBtn) {
        pauseBtn.addEventListener('click', pauseGame);
    }
    
    if (restartBtn) {
        restartBtn.addEventListener('click', startGame);
    }
    
    // Desenhar o canvas inicial
    draw();
}

// ========== EDITOR DE CÓDIGO ==========
function initCodeEditor() {
    // Verificar se estamos na página do editor
    const codeInput = document.getElementById('code-input');
    if (!codeInput) return;
    
    const highlightedCode = document.getElementById('highlighted-code');
    const consoleOutput = document.getElementById('console-output');
    const runCodeBtn = document.getElementById('run-code');
    const saveSnippetBtn = document.getElementById('save-snippet');
    const clearEditorBtn = document.getElementById('clear-editor');
    const clearConsoleBtn = document.getElementById('clear-console');
    const savedSnippetsSelect = document.getElementById('saved-snippets');
    
    // Variáveis
    let snippets = [];
    
    // Carregar snippets salvos
    loadSnippets();
    
    // Event listeners
    codeInput.addEventListener('input', updateHighlightedCode);
    codeInput.addEventListener('scroll', syncScroll);
    codeInput.addEventListener('keydown', handleTabKey);
    
    if (runCodeBtn) {
        runCodeBtn.addEventListener('click', runCode);
    }
    
    if (saveSnippetBtn) {
        saveSnippetBtn.addEventListener('click', saveSnippet);
    }
    
    if (clearEditorBtn) {
        clearEditorBtn.addEventListener('click', () => {
            codeInput.value = '';
            updateHighlightedCode();
        });
    }
    
    if (clearConsoleBtn) {
        clearConsoleBtn.addEventListener('click', clearConsole);
    }
    
    if (savedSnippetsSelect) {
        savedSnippetsSelect.addEventListener('change', loadSelectedSnippet);
    }
    
    // Suporte para atalhos de teclado
    document.addEventListener('keydown', (event) => {
        if (!document.querySelector('.code-editor-container')) return;
        
        // Ctrl+Enter para executar código
        if (event.ctrlKey && event.key === 'Enter') {
            event.preventDefault();
            runCode();
        }
        
        // Ctrl+S para salvar snippet
        if (event.ctrlKey && event.key === 's') {
            event.preventDefault();
            saveSnippet();
        }
    });
    
    // Funções
    function updateHighlightedCode() {
        const code = codeInput.value;
        highlightedCode.innerHTML = code;
        hljs.highlightElement(highlightedCode);
    }
    
    function syncScroll() {
        highlightedCode.scrollTop = codeInput.scrollTop;
        highlightedCode.scrollLeft = codeInput.scrollLeft;
    }
    
    function handleTabKey(event) {
        if (event.key === 'Tab') {
            event.preventDefault();
            
            const start = codeInput.selectionStart;
            const end = codeInput.selectionEnd;
            
            // Inserir 4 espaços no cursor atual
            codeInput.value = codeInput.value.substring(0, start) + '    ' + codeInput.value.substring(end);
            
            // Mover cursor para depois da tabulação
            codeInput.selectionStart = codeInput.selectionEnd = start + 4;
            
            updateHighlightedCode();
        }
    }
    
    function runCode() {
        const code = codeInput.value;
        
        clearConsole();
        
        try {
            // Substituir console.log para capturar saídas
            const originalConsole = {
                log: console.log,
                error: console.error,
                warn: console.warn
            };
            
            console.log = function() {
                const output = Array.from(arguments).join(' ');
                appendToConsole(output, 'log');
                originalConsole.log.apply(console, arguments);
            };
            
            console.error = function() {
                const output = Array.from(arguments).join(' ');
                appendToConsole(output, 'error');
                originalConsole.error.apply(console, arguments);
            };
            
            console.warn = function() {
                const output = Array.from(arguments).join(' ');
                appendToConsole(output, 'warn');
                originalConsole.warn.apply(console, arguments);
            };
            
            // Executar código em uma função para criar escopo
            const result = new Function(code)();
            
            // Se o código retornar algum valor, mostrar no console
            if (result !== undefined) {
                appendToConsole(result, 'log');
            }
            
            // Restaurar console original
            console.log = originalConsole.log;
            console.error = originalConsole.error;
            console.warn = originalConsole.warn;
        } catch (error) {
            appendToConsole(error.message, 'error');
        }
    }
    
    function appendToConsole(content, type = 'log') {
        const line = document.createElement('div');
        line.className = `console-${type}`;
        
        if (typeof content === 'object') {
            try {
                content = JSON.stringify(content, null, 2);
            } catch (e) {
                content = content.toString();
            }
        }
        
        line.textContent = content;
        consoleOutput.appendChild(line);
        consoleOutput.scrollTop = consoleOutput.scrollHeight;
    }
    
    function clearConsole() {
        consoleOutput.innerHTML = '';
    }
    
    function saveSnippet() {
        const code = codeInput.value.trim();
        if (!code) return;
        
        const snippetName = prompt('Digite um nome para o snippet:');
        if (!snippetName) return;
        
        // Verificar se já existe um snippet com este nome
        const existingIndex = snippets.findIndex(s => s.name === snippetName);
        
        if (existingIndex !== -1) {
            const override = confirm(`Já existe um snippet chamado "${snippetName}". Deseja sobrescrever?`);
            
            if (override) {
                snippets[existingIndex].code = code;
            } else {
                return;
            }
        } else {
            snippets.push({ name: snippetName, code });
            addSnippetToList(snippetName);
        }
        
        localStorage.setItem('codeSnippets', JSON.stringify(snippets));
        alert(`Snippet "${snippetName}" salvo com sucesso!`);
    }
    
    function loadSnippets() {
        const savedSnippets = localStorage.getItem('codeSnippets');
        
        if (savedSnippets) {
            snippets = JSON.parse(savedSnippets);
            
            // Adicionar snippets ao select
            snippets.forEach(snippet => {
                addSnippetToList(snippet.name);
            });
        }
    }
    
    function addSnippetToList(name) {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        savedSnippetsSelect.appendChild(option);
    }
    
    function loadSelectedSnippet() {
        const selectedName = savedSnippetsSelect.value;
        
        if (!selectedName) return;
        
        const snippet = snippets.find(s => s.name === selectedName);
        
        if (snippet) {
            codeInput.value = snippet.code;
            updateHighlightedCode();
        }
        
        savedSnippetsSelect.selectedIndex = 0;
    }
    
    // Inicializar o editor com o conteúdo atual
    updateHighlightedCode();
}

// ===========================================
// SISTEMA DE ANIMAÇÕES AOS
// ===========================================
const AnimationObserver = {
    observer: null,

    init() {
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('aos-animate');
                    
                    // Counter animations
                    if (entry.target.classList.contains('counter-number') && !AppState.countersAnimated) {
                        this.animateCounters();
                        AppState.countersAnimated = true;
                    }
                }
            });
        }, {
            threshold: CONFIG.animations.observerThreshold,
            rootMargin: '0px 0px -50px 0px'
        });

        // Observe all AOS elements
        document.querySelectorAll('[data-aos]').forEach(el => {
            this.observer.observe(el);
        });
    },

    animateCounters() {
        document.querySelectorAll('.counter-number').forEach(counter => {
            const target = parseInt(counter.getAttribute('data-target'));
            Utils.animateCounter(counter, 0, target, CONFIG.animations.counterSpeed);
        });
    }
};

// ===========================================
// SISTEMA DE FILTROS
// ===========================================
const FilterSystem = {
    activeFilters: {
        skills: 'all',
        projects: 'all'
    },

    init() {
        this.initSkillFilters();
        this.initProjectFilters();
    },

    initSkillFilters() {
        const filterButtons = document.querySelectorAll('.skill-filter-btn');
        const skillItems = document.querySelectorAll('.skill-item');

        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const filter = btn.getAttribute('data-filter');
                
                // Update active button
                filterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Filter skills
                skillItems.forEach(item => {
                    const category = item.getAttribute('data-category');
                    if (filter === 'all' || category === filter) {
                        item.style.display = 'block';
                        item.classList.add('filter-show');
                    } else {
                        item.style.display = 'none';
                        item.classList.remove('filter-show');
                    }
                });

                this.activeFilters.skills = filter;
            });
        });
    },

    initProjectFilters() {
        const filterButtons = document.querySelectorAll('.project-filter-btn');
        const projectItems = document.querySelectorAll('.project-card');

        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const filter = btn.getAttribute('data-filter');
                
                // Update active button
                filterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Filter projects
                projectItems.forEach(item => {
                    const category = item.getAttribute('data-category');
                    if (filter === 'all' || category === filter) {
                        item.style.display = 'block';
                        item.classList.add('filter-show');
                    } else {
                        item.style.display = 'none';
                        item.classList.remove('filter-show');
                    }
                });

                this.activeFilters.projects = filter;
            });
        });
    }
};

// ===========================================
// SISTEMA DE TEMA (DARK/LIGHT MODE)
// ===========================================
const ThemeSystem = {
    init() {
        this.setInitialTheme();
        this.bindEvents();
    },

    setInitialTheme() {
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        if (savedTheme) {
            document.documentElement.setAttribute('data-theme', savedTheme);
            AppState.isDarkMode = savedTheme === 'dark';
        } else if (prefersDark) {
            document.documentElement.setAttribute('data-theme', 'dark');
            AppState.isDarkMode = true;
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            AppState.isDarkMode = false;
        }

        this.updateThemeIcon();
    },

    bindEvents() {
        const themeToggle = document.querySelector('.theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }

        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem('theme')) {
                const newTheme = e.matches ? 'dark' : 'light';
                document.documentElement.setAttribute('data-theme', newTheme);
                AppState.isDarkMode = e.matches;
                this.updateThemeIcon();
            }
        });
    },

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        AppState.isDarkMode = newTheme === 'dark';
        
        this.updateThemeIcon();
        Toast.info(`Tema alterado para ${newTheme === 'dark' ? 'escuro' : 'claro'}`);
    },

    updateThemeIcon() {
        const themeIcon = document.querySelector('.theme-toggle i');
        if (themeIcon) {
            themeIcon.className = AppState.isDarkMode ? 'fas fa-sun' : 'fas fa-moon';
        }
    }
};

// ===========================================
// SISTEMA DE IDIOMAS
// ===========================================
const LanguageSystem = {
    init() {
        this.setInitialLanguage();
        this.bindEvents();
    },

    setInitialLanguage() {
        const savedLanguage = localStorage.getItem('language') || 'pt';
        AppState.currentLanguage = savedLanguage;
        this.updateLanguage(savedLanguage);
        this.updateLanguageSelector();
    },

    bindEvents() {
        const languageSelector = document.querySelector('.language-selector');
        if (languageSelector) {
            languageSelector.addEventListener('change', (e) => {
                this.setLanguage(e.target.value);
            });
        }

        // Language toggle buttons
        document.querySelectorAll('[data-language]').forEach(btn => {
            btn.addEventListener('click', () => {
                const lang = btn.getAttribute('data-language');
                this.setLanguage(lang);
            });
        });
    },

    setLanguage(language) {
        if (translations[language]) {
            AppState.currentLanguage = language;
            localStorage.setItem('language', language);
            this.updateLanguage(language);
            this.updateLanguageSelector();
            Toast.success(`Idioma alterado para ${language === 'pt' ? 'Português' : 'English'}`);
        }
    },

    updateLanguage(language) {
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = translations[language][key];
            if (translation) {
                if (element.tagName === 'INPUT' && element.type !== 'submit') {
                    element.placeholder = translation;
                } else {
                    element.textContent = translation;
                }
            }
        });

        // Update document language
        document.documentElement.lang = language;
    },

    updateLanguageSelector() {
        const selector = document.querySelector('.language-selector');
        if (selector) {
            selector.value = AppState.currentLanguage;
        }
    }
};

// ===========================================
// GITHUB API E DADOS
// ===========================================
const GitHubAPI = {
    username: CONFIG.github.username,
    cache: new Map(),
    cacheExpiry: 5 * 60 * 1000, // 5 minutos

    async fetchWithCache(url) {
        const now = Date.now();
        const cached = this.cache.get(url);
        
        if (cached && (now - cached.timestamp) < this.cacheExpiry) {
            return cached.data;
        }

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const data = await response.json();
            this.cache.set(url, { data, timestamp: now });
            return data;
        } catch (error) {
            console.error('GitHub API Error:', error);
            Toast.error('Erro ao carregar dados do GitHub');
            return null;
        }
    },

    async fetchProfile() {
        const url = `https://api.github.com/users/${this.username}`;
        return await this.fetchWithCache(url);
    },

    async fetchRepos() {
        const url = `https://api.github.com/users/${this.username}/repos?sort=updated&per_page=${CONFIG.github.repoCount}`;
        return await this.fetchWithCache(url);
    },

    async fetchBlogPosts() {
        const url = `https://api.github.com/repos/${this.username}/${this.username}/issues?labels=blog&state=all&sort=created&direction=desc`;
        return await this.fetchWithCache(url);
    },

    updateProfileStats(profileData) {
        if (!profileData) return;

        const statsContainer = document.querySelector('.about-stats');
        if (statsContainer) {
            statsContainer.innerHTML = `
                <div class="stat-item" data-aos="fade-up" data-aos-delay="100">
                    <div class="stat-icon">
                        <i class="fab fa-github"></i>
                    </div>
                    <div class="stat-content">
                        <span class="counter-number" data-target="${profileData.public_repos}">0</span>
                        <span class="stat-label">Repositórios</span>
                    </div>
                </div>
                <div class="stat-item" data-aos="fade-up" data-aos-delay="200">
                    <div class="stat-icon">
                        <i class="fas fa-users"></i>
                    </div>
                    <div class="stat-content">
                        <span class="counter-number" data-target="${profileData.followers}">0</span>
                        <span class="stat-label">Seguidores</span>
                    </div>
                </div>
                <div class="stat-item" data-aos="fade-up" data-aos-delay="300">
                    <div class="stat-icon">
                        <i class="fas fa-code-branch"></i>
                    </div>
                    <div class="stat-content">
                        <span class="counter-number" data-target="${profileData.following}">0</span>
                        <span class="stat-label">Seguindo</span>
                    </div>
                </div>
                <div class="stat-item" data-aos="fade-up" data-aos-delay="400">
                    <div class="stat-icon">
                        <i class="fas fa-calendar-alt"></i>
                    </div>
                    <div class="stat-content">
                        <span class="counter-number" data-target="${new Date().getFullYear() - new Date(profileData.created_at).getFullYear()}">0</span>
                        <span class="stat-label">Anos no GitHub</span>
                    </div>
                </div>
            `;
        }
    },

    updateRecentProjects(repos) {
        if (!repos || repos.length === 0) return;

        const projectsContainer = document.querySelector('.projects-grid');
        if (projectsContainer) {
            const projectsHTML = repos.slice(0, 6).map(repo => `
                <div class="project-card" data-category="${this.getRepoCategory(repo)}" data-aos="fade-up">
                    <div class="project-image">
                        <img src="https://via.placeholder.com/400x300?text=${repo.name}" alt="${repo.name}" loading="lazy">
                        <div class="project-overlay">
                            <div class="project-links">
                                <a href="${repo.html_url}" target="_blank" class="project-link">
                                    <i class="fab fa-github"></i>
                                </a>
                                ${repo.homepage ? `<a href="${repo.homepage}" target="_blank" class="project-link">
                                    <i class="fas fa-external-link-alt"></i>
                                </a>` : ''}
                            </div>
                        </div>
                    </div>
                    <div class="project-content">
                        <h3 class="project-title">${repo.name}</h3>
                        <p class="project-description">${repo.description || 'Sem descrição disponível'}</p>
                        <div class="project-tech">
                            ${repo.language ? `<span class="tech-tag">${repo.language}</span>` : ''}
                            <span class="tech-tag">GitHub</span>
                        </div>
                        <div class="project-stats">
                            <span><i class="fas fa-star"></i> ${repo.stargazers_count}</span>
                            <span><i class="fas fa-code-branch"></i> ${repo.forks_count}</span>
                        </div>
                    </div>
                </div>
            `).join('');
            
            projectsContainer.innerHTML = projectsHTML;
        }
    },

    updateBlogPosts(issues) {
        if (!issues || issues.length === 0) return;

        const blogContainer = document.querySelector('.blog-grid');
        if (blogContainer) {
            const blogHTML = issues.slice(0, 3).map(issue => `
                <article class="blog-card" data-aos="fade-up">
                    <div class="blog-content">
                        <div class="blog-meta">
                            <span class="blog-date">${new Date(issue.created_at).toLocaleDateString('pt-BR')}</span>
                            <span class="blog-author">Por ${issue.user.login}</span>
                        </div>
                        <h3 class="blog-title">${issue.title}</h3>
                        <p class="blog-excerpt">${this.extractExcerpt(issue.body)}</p>
                        <div class="blog-tags">
                            ${issue.labels.map(label => `<span class="blog-tag">${label.name}</span>`).join('')}
                        </div>
                        <a href="${issue.html_url}" target="_blank" class="blog-link">
                            Ler mais <i class="fas fa-arrow-right"></i>
                        </a>
                    </div>
                </article>
            `).join('');
            
            blogContainer.innerHTML = blogHTML;
        }
    },

    getRepoCategory(repo) {
        const language = repo.language?.toLowerCase() || '';
        const name = repo.name.toLowerCase();
        
        if (language.includes('javascript') || language.includes('typescript') || name.includes('js') || name.includes('node')) {
            return 'frontend';
        } else if (language.includes('python') || language.includes('java') || name.includes('api')) {
            return 'backend';
        } else if (name.includes('mobile') || language.includes('swift') || language.includes('kotlin')) {
            return 'mobile';
        } else {
            return 'other';
        }
    },

    extractExcerpt(body, maxLength = 150) {
        if (!body) return 'Sem descrição disponível...';
        const text = body.replace(/[#*`]/g, '').trim();
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }
};

// ===========================================
// SISTEMA DE FORMULÁRIOS
// ===========================================
const FormHandler = {
    init() {
        this.bindContactForm();
        this.bindNewsletterForm();
    },

    bindContactForm() {
        const contactForm = document.querySelector('.contact-form');
        if (contactForm) {
            contactForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleContactSubmit(contactForm);
            });
        }
    },

    bindNewsletterForm() {
        const newsletterForm = document.querySelector('.newsletter-form');
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleNewsletterSubmit(newsletterForm);
            });
        }
    },

    async handleContactSubmit(form) {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        
        // Validação básica
        if (!data.name || !data.email || !data.message) {
            Toast.error('Por favor, preencha todos os campos obrigatórios');
            return;
        }

        try {
            // Simular envio (integre com seu backend preferido)
            Toast.info('Enviando mensagem...');
            
            // Simular delay de rede
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            Toast.success('Mensagem enviada com sucesso! Entrarei em contato em breve.');
            form.reset();
        } catch (error) {
            Toast.error('Erro ao enviar mensagem. Tente novamente.');
        }
    },

    async handleNewsletterSubmit(form) {
        const formData = new FormData(form);
        const email = formData.get('email');
        
        if (!email || !this.validateEmail(email)) {
            Toast.error('Por favor, insira um email válido');
            return;
        }

        try {
            Toast.info('Cadastrando no newsletter...');
            
            // Simular delay de rede
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            Toast.success('Cadastro realizado com sucesso!');
            form.reset();
        } catch (error) {
            Toast.error('Erro ao cadastrar. Tente novamente.');
        }
    },

    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
};

// ===========================================
// SISTEMA DE COOKIE CONSENT
// ===========================================
const CookieConsent = {
    init() {
        if (!this.hasConsent()) {
            this.showBanner();
        }
        this.bindEvents();
    },

    hasConsent() {
        return localStorage.getItem('cookie-consent') === 'accepted';
    },

    showBanner() {
        const banner = document.querySelector('.cookie-consent');
        if (banner) {
            setTimeout(() => {
                banner.classList.add('show');
            }, 2000);
        }
    },

    bindEvents() {
        const acceptBtn = document.querySelector('.cookie-accept');
        const declineBtn = document.querySelector('.cookie-decline');
        const banner = document.querySelector('.cookie-consent');

        if (acceptBtn) {
            acceptBtn.addEventListener('click', () => {
                this.acceptCookies();
                this.hideBanner();
            });
        }

        if (declineBtn) {
            declineBtn.addEventListener('click', () => {
                this.declineCookies();
                this.hideBanner();
            });
        }
    },

    acceptCookies() {
        localStorage.setItem('cookie-consent', 'accepted');
        Toast.success('Configurações de cookies salvas');
    },

    declineCookies() {
        localStorage.setItem('cookie-consent', 'declined');
        Toast.info('Cookies opcionais foram desabilitados');
    },

    hideBanner() {
        const banner = document.querySelector('.cookie-consent');
        if (banner) {
            banner.classList.remove('show');
        }
    }
};

// ===========================================
// SISTEMA DE PERFORMANCE E OTIMIZAÇÕES
// ===========================================
class PerformanceOptimizer {
    static init() {
        this.optimizeImages();
        this.optimizeAnimations();
        this.preloadCriticalResources();
        this.setupIntersectionObserver();
    }

    static optimizeImages() {
        // Lazy loading para todas as imagens
        const images = document.querySelectorAll('img[data-src]');
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    observer.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    }

    static optimizeAnimations() {
        // Reduzir animações se o usuário preferir
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            document.documentElement.style.setProperty('--animation-duration', '0.01ms');
            document.documentElement.style.setProperty('--transition-duration', '0.01ms');
        }
    }

    static preloadCriticalResources() {
        // Preload de recursos críticos
        const criticalResources = [
            'assets/css/styles.css',
            'assets/js/script.js'
        ];

        criticalResources.forEach(resource => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = resource;
            link.as = resource.endsWith('.css') ? 'style' : 'script';
            document.head.appendChild(link);
        });
    }

    static setupIntersectionObserver() {
        // Observer para animações baseadas em scroll
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '50px'
        };

        const animateOnScroll = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);

        // Aplicar a elementos que devem animar
        document.querySelectorAll('.skill-card, .project-card, .service-card').forEach(el => {
            animateOnScroll.observe(el);
        });
    }
}

// ===========================================
// SISTEMA DE SCROLL SUAVE AVANÇADO
// ===========================================
class SmoothScroll {
    static init() {
        this.setupSmoothScrolling();
        this.setupScrollIndicator();
        this.setupScrollToTop();
    }

    static setupSmoothScrolling() {
        // Scroll suave para links âncora
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    static setupScrollIndicator() {
        // Indicador de progresso de scroll
        const progressBar = document.createElement('div');
        progressBar.className = 'scroll-progress';
        progressBar.innerHTML = '<div class="scroll-progress-bar"></div>';
        document.body.appendChild(progressBar);

        window.addEventListener('scroll', () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = (scrollTop / docHeight) * 100;
            
            const progressBarElement = document.querySelector('.scroll-progress-bar');
            if (progressBarElement) {
                progressBarElement.style.width = scrollPercent + '%';
            }
        });
    }

    static setupScrollToTop() {
        const scrollTopBtn = document.getElementById('scroll-top');
        if (scrollTopBtn) {
            window.addEventListener('scroll', () => {
                if (window.scrollY > 300) {
                    scrollTopBtn.style.display = 'flex';
                    scrollTopBtn.classList.add('show');
                } else {
                    scrollTopBtn.classList.remove('show');
                    setTimeout(() => {
                        if (!scrollTopBtn.classList.contains('show')) {
                            scrollTopBtn.style.display = 'none';
                        }
                    }, 300);
                }
            });
        }
    }
}

// ===========================================
// SISTEMA DE NOTIFICAÇÕES AVANÇADO
// ===========================================
class NotificationSystem {
    static init() {
        this.createContainer();
        this.setupServiceWorkerNotifications();
    }

    static createContainer() {
        if (!document.querySelector('.notification-container')) {
            const container = document.createElement('div');
            container.className = 'notification-container';
            document.body.appendChild(container);
        }
    }

    static show(message, type = 'info', duration = 5000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        const icon = this.getIcon(type);
        notification.innerHTML = `
            <div class="notification-content">
                <i class="${icon}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;

        const container = document.querySelector('.notification-container');
        container.appendChild(notification);

        // Remover automaticamente
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.animation = 'slideOut 0.3s ease-in';
                setTimeout(() => notification.remove(), 300);
            }
        }, duration);

        return notification;
    }

    static getIcon(type) {
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-triangle',
            warning: 'fas fa-exclamation-circle',
            info: 'fas fa-info-circle'
        };
        return icons[type] || icons.info;
    }

    static setupServiceWorkerNotifications() {
        // Notificações de status da PWA
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('message', event => {
                if (event.data && event.data.type === 'update-available') {
                    this.show('Nova versão disponível! Recarregue a página.', 'info', 10000);
                }
            });
        }
    }
}

// ===========================================
// SISTEMA DE EASTER EGGS E INTERAÇÕES ESPECIAIS
// ===========================================
class EasterEggs {
    static init() {
        this.setupKonamiCode();
        this.setupClickEasterEggs();
        this.setupKeyboardShortcuts();
    }

    static setupKonamiCode() {
        let konamiCode = [];
        const targetSequence = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65]; // ↑↑↓↓←→←→BA

        document.addEventListener('keydown', (e) => {
            konamiCode.push(e.keyCode);
            
            if (konamiCode.length > targetSequence.length) {
                konamiCode.shift();
            }
            
            if (konamiCode.length === targetSequence.length && 
                konamiCode.every((code, i) => code === targetSequence[i])) {
                this.activateSpecialMode();
            }
        });
    }

    static activateSpecialMode() {
        document.body.classList.add('easter-egg-mode');
        NotificationSystem.show('🎉 Modo especial ativado! Você descobriu o segredo!', 'success');
        
        // Adicionar efeitos especiais
        this.createConfetti();
        
        setTimeout(() => {
            document.body.classList.remove('easter-egg-mode');
        }, 10000);
    }

    static createConfetti() {
        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.className = 'confetti';
                confetti.style.left = Math.random() * 100 + '%';
                confetti.style.animationDelay = Math.random() * 2 + 's';
                confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 70%, 60%)`;
                document.body.appendChild(confetti);
                
                setTimeout(() => confetti.remove(), 3000);
            }, i * 50);
        }
    }

    static setupClickEasterEggs() {
        // Easter egg ao clicar no logo várias vezes
        let logoClicks = 0;
        const logo = document.querySelector('.logo');
        
        if (logo) {
            logo.addEventListener('click', () => {
                logoClicks++;
                if (logoClicks === 10) {
                    NotificationSystem.show('🚀 Você é persistente! Aqui está um segredo...', 'success');
                    document.body.classList.add('rainbow-mode');
                    
                    setTimeout(() => {
                        document.body.classList.remove('rainbow-mode');
                    }, 5000);
                    
                    logoClicks = 0;
                }
            });
        }
    }

    static setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl + K para busca rápida
            if (e.ctrlKey && e.key === 'k') {
                e.preventDefault();
                NotificationSystem.show('🔍 Busca rápida em desenvolvimento!', 'info');
            }
            
            // Ctrl + / para ajuda
            if (e.ctrlKey && e.key === '/') {
                e.preventDefault();
                this.showHelpModal();
            }
        });
    }

    static showHelpModal() {
        const modal = document.createElement('div');
        modal.className = 'help-modal';
        modal.innerHTML = `
            <div class="help-content">
                <h3>Atalhos do Teclado</h3>
                <ul>
                    <li><kbd>Ctrl</kbd> + <kbd>K</kbd> - Busca rápida</li>
                    <li><kbd>Ctrl</kbd> + <kbd>/</kbd> - Mostrar ajuda</li>
                    <li><kbd>↑↑↓↓←→←→BA</kbd> - Código especial</li>
                </ul>
                <button onclick="this.parentElement.parentElement.remove()">Fechar</button>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        setTimeout(() => modal.remove(), 5000);
    }
}

// ===========================================
// INICIALIZAÇÃO PRINCIPAL
// ===========================================
class PortfolioApp {
    constructor() {
        this.isInitialized = false;
    }

    async init() {
        if (this.isInitialized) return;

        try {
            // Aguardar DOM estar pronto
            if (document.readyState === 'loading') {
                await new Promise(resolve => {
                    document.addEventListener('DOMContentLoaded', resolve);
                });
            }

            // Inicializar sistemas principais
            Toast.init();
            ThemeSystem.init();
            LanguageSystem.init();
            Navigation.init();
            FilterSystem.init();
            FormHandler.init();
            CookieConsent.init();

            // Inicializar sistemas avançados
            PerformanceOptimizer.init();
            SmoothScroll.init();
            NotificationSystem.init();
            EasterEggs.init();

            // Inicializar animações
            this.initAnimations();
            
            // Carregar dados do GitHub
            await this.loadGitHubData();
            
            // Inicializar observadores de animação
            AnimationObserver.init();
            
            // Lazy loading para imagens
            Utils.lazyLoadImages();
            
            // Remover loading screen
            this.hideLoadingScreen();
            
            AppState.isLoaded = true;
            this.isInitialized = true;
            
            console.log('🚀 Portfolio App initialized successfully');
            
        } catch (error) {
            console.error('❌ Error initializing Portfolio App:', error);
            Toast.error('Erro ao inicializar a aplicação');
        }
    }

    initAnimations() {
        // Typing effect no hero - corrigido seletor
        const heroTitle = document.querySelector('.typing-text');
        if (heroTitle) {
            new TypingEffect(heroTitle, [
                'Mikael Ferreira',
                'Desenvolvedor Full Stack',
                'Criador de Experiências Digitais',
                'Apaixonado por Tecnologia',
                'Solucionador de Problemas'
            ], {
                speed: 120,
                deleteSpeed: 60,
                pause: 2500,
                loop: true
            });
        }

        // Typing effect no subtítulo
        const heroSubtitle = document.querySelector('.typing-subtitle');
        if (heroSubtitle) {
            setTimeout(() => {
                new TypingEffect(heroSubtitle, [
                    'Desenvolvedor Full-Stack | Especialista em React & Node.js',
                    'Criando Soluções Digitais Inovadoras',
                    'Transformando Ideias em Realidade'
                ], {
                    speed: 80,
                    deleteSpeed: 40,
                    pause: 3000,
                    loop: true
                });
            }, 2000);
        }

        // Inicializar animações de skill bars
        this.initSkillBarAnimations();

        // Parallax effect
        this.initParallax();
    }

    initSkillBarAnimations() {
        const skillBars = document.querySelectorAll('.skill-progress');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const skillBar = entry.target;
                    const percentage = skillBar.getAttribute('data-percentage') || '0';
                    skillBar.style.width = percentage + '%';
                    observer.unobserve(skillBar);
                }
            });
        }, { threshold: 0.3 });

        skillBars.forEach(bar => observer.observe(bar));
    }

    initParallax() {
        const parallaxElements = document.querySelectorAll('.parallax-bg');
        
        window.addEventListener('scroll', Utils.throttle(() => {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;
            
            parallaxElements.forEach(element => {
                element.style.transform = `translateY(${rate}px)`;
            });
        }, 16));
    }

    async loadGitHubData() {
        try {
            // Mostrar skeleton loading
            this.showSkeletonLoading();
            
            // Carregar dados em paralelo
            const [profile, repos, blogPosts] = await Promise.all([
                GitHubAPI.fetchProfile(),
                GitHubAPI.fetchRepos(),
                GitHubAPI.fetchBlogPosts()
            ]);

            // Atualizar interface
            if (profile) GitHubAPI.updateProfileStats(profile);
            if (repos) GitHubAPI.updateRecentProjects(repos);
            if (blogPosts) GitHubAPI.updateBlogPosts(blogPosts);
            
            // Esconder skeleton loading
            this.hideSkeletonLoading();
            
        } catch (error) {
            console.error('Error loading GitHub data:', error);
            this.hideSkeletonLoading();
        }
    }

    showSkeletonLoading() {
        document.querySelectorAll('.skeleton-loading').forEach(skeleton => {
            skeleton.style.display = 'block';
        });
    }

    hideSkeletonLoading() {
        document.querySelectorAll('.skeleton-loading').forEach(skeleton => {
            skeleton.style.display = 'none';
        });
    }

    hideLoadingScreen() {
        const loadingScreen = document.querySelector('.loading-screen');
        if (loadingScreen) {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }
    }
}

// ===========================================
// INICIALIZAÇÃO GLOBAL
// ===========================================
const app = new PortfolioApp();

// Inicializar quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => app.init());
} else {
    app.init();
}

// Inicializar quando a janela carregar completamente
window.addEventListener('load', () => {
    if (!app.isInitialized) {
        app.init();
    }
});

// Funções globais para compatibilidade
window.toggleMenu = function() {
    const menu = document.getElementById("menu-lateral");
    if (menu) menu.classList.toggle("menu-aberto");
};

// Exportar para debug
if (typeof window !== 'undefined') {
    window.PortfolioApp = {
        app,
        Toast,
        Utils,
        AppState,
        GitHubAPI,
        Navigation,
        ThemeSystem,
        LanguageSystem
    };
}
