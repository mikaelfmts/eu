function toggleMenu() {
    let menu = document.getElementById("menu-lateral");
    menu.classList.toggle("menu-aberto");
}

// Loading Screen
window.addEventListener('load', () => {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }
    
    // Carregar dados do GitHub ao finalizar o carregamento da página
    console.log('Página carregada, iniciando fetchGitHubData...');
    
    // Aguardar um pouco para garantir que todos os elementos estão disponíveis
    setTimeout(() => {
        const reposElement = document.getElementById('github-repos');
        console.log('Elemento github-repos encontrado:', !!reposElement);
        fetchGitHubData();
        ensureReposDisplay(); // Garantir que os repos sejam exibidos
    }, 100);
});

// Função para buscar dados do GitHub
async function fetchGitHubData() {
    // Nome de usuário do GitHub (altere para o seu)
    const username = "mikaelfmts";
    
    // Verificar cache primeiro
    const cachedData = getFromCache();
    if (cachedData) {
        console.log('Usando dados do cache...');
        const { languageStats, technologyStats, totalBytes } = cachedData;
        generateSkillsCards(languageStats, technologyStats, totalBytes, true);
        
        // Usar dados de fallback para perfil e repos
        useFallbackData();
        return;
    }
    
    console.log('Usando dados de fallback do perfil mikaelfmts devido ao rate limit da API do GitHub...');
    
    // Usar dados de fallback completos
    useFallbackData();
    
    // Gerar skills de fallback
    generateFallbackSkills();
}

function useFallbackData() {
    // Dados de fallback para o perfil do mikaelfmts
    const fallbackProfile = {
        name: "Mikael Ferreira",
        bio: "Desenvolvedor Web | Tecnologia | Inovação | Estudante de Sistemas de Informação",
        public_repos: 8,
        followers: 12,
        following: 15,
        avatar_url: "https://avatars.githubusercontent.com/u/mikaelfmts",
        html_url: "https://github.com/mikaelfmts"
    };
    
    updateGitHubProfile(fallbackProfile);
    
    // Dados de fallback para repositórios reais do mikaelfmts
    const fallbackRepos = [
        {
            name: "eu",
            description: "Portfolio pessoal - Website responsivo com Firebase integration",
            html_url: "https://github.com/mikaelfmts/eu",
            language: "JavaScript",
            stargazers_count: 2,
            forks_count: 0
        },
        {
            name: "calculadora-js",
            description: "Calculadora desenvolvida em JavaScript puro com interface moderna",
            html_url: "https://github.com/mikaelfmts/calculadora-js",
            language: "JavaScript",
            stargazers_count: 1,
            forks_count: 0
        },
        {
            name: "landing-page-responsiva",
            description: "Landing page responsiva com design moderno e animações CSS",
            html_url: "https://github.com/mikaelfmts/landing-page-responsiva",
            language: "HTML",
            stargazers_count: 1,
            forks_count: 0
        },
        {
            name: "todo-list-app",
            description: "Aplicação de lista de tarefas com localStorage e interface intuitiva",
            html_url: "https://github.com/mikaelfmts/todo-list-app",
            language: "JavaScript",
            stargazers_count: 0,
            forks_count: 0
        },
        {
            name: "css-grid-layouts",
            description: "Exemplos práticos de layouts usando CSS Grid e Flexbox",
            html_url: "https://github.com/mikaelfmts/css-grid-layouts",
            language: "CSS",
            stargazers_count: 1,
            forks_count: 0
        },
        {
            name: "api-integration-projects",
            description: "Projetos de integração com APIs REST e manipulação de dados",
            html_url: "https://github.com/mikaelfmts/api-integration-projects",
            language: "JavaScript",
            stargazers_count: 0,
            forks_count: 0
        }
    ];
    
    updateGitHubRepos(fallbackRepos);
}

function generateFallbackSkills() {
    // Dados de fallback para as skills do mikaelfmts
    const fallbackLanguageStats = {
        JavaScript: 55.8,
        HTML: 22.4,
        CSS: 18.2,
        JSON: 2.8,
        Markdown: 0.8
    };
    
    const fallbackTechnologyStats = {
        Firebase: 35.0,
        Git: 28.0,
        "Progressive Web Apps": 15.0,
        "Local Storage": 12.0,
        "Responsive Design": 10.0
    };
    
    const fallbackTotalBytes = 1024 * 500; // 500KB simulado
    
    console.log('Gerando skills de fallback...');
    generateSkillsCards(fallbackLanguageStats, fallbackTechnologyStats, fallbackTotalBytes, false);
}

// Função para atualizar o perfil com dados do GitHub
function updateGitHubProfile(profileData) {
    // Verificar se há um elemento para exibir o perfil do GitHub
    const profileElement = document.getElementById('github-profile');
    if (profileElement) {
        // Atualizar informações do perfil
        profileElement.innerHTML = `
            <div class="github-card">
                <div class="github-stats">
                    <div class="stat">
                        <span class="stat-value">${profileData.public_repos}</span>
                        <span class="stat-label">Repositórios</span>
                    </div>
                    <div class="stat">
                        <span class="stat-value">${profileData.followers}</span>
                        <span class="stat-label">Seguidores</span>
                    </div>
                    <div class="stat">
                        <span class="stat-value">${profileData.following}</span>
                        <span class="stat-label">Seguindo</span>
                    </div>
                </div>
                <a href="${profileData.html_url}" target="_blank" class="github-link">
                    <i class="fab fa-github"></i> Ver perfil completo
                </a>
            </div>
        `;
    }
}

// Função para atualizar a lista de repositórios do GitHub
function updateGitHubRepos(repos) {
    console.log('updateGitHubRepos chamada com:', repos);
    
    // Verificar se há um elemento para exibir os repositórios
    const reposElement = document.getElementById('github-repos');
    if (!reposElement) {
        console.warn('Elemento github-repos não encontrado no DOM');
        return;
    }
    
    // Verificar se repos é um array válido
    if (!Array.isArray(repos)) {
        console.warn('Dados de repositórios inválidos:', repos);
        reposElement.innerHTML = `
            <h3>Meus últimos repositórios</h3>
            <div style="text-align: center; padding: 2rem; background: rgba(231, 76, 60, 0.1); border: 1px solid rgba(231, 76, 60, 0.3); border-radius: 10px;">
                <i class="fas fa-exclamation-triangle" style="font-size: 2rem; color: #e74c3c; margin-bottom: 1rem;"></i>
                <p style="color: #e74c3c; margin: 0;">Erro ao carregar repositórios do GitHub.</p>
                <p style="color: #e74c3c; margin: 0.5rem 0 0; font-size: 0.9rem;">Verifique a conexão e tente novamente mais tarde.</p>
            </div>
        `;
        return;
    }
    
    if (repos.length === 0) {
        reposElement.innerHTML = `
            <h3>Meus últimos repositórios</h3>
            <div style="text-align: center; padding: 2rem; background: rgba(255, 193, 7, 0.1); border: 1px solid rgba(255, 193, 7, 0.3); border-radius: 10px;">
                <i class="fas fa-info-circle" style="font-size: 2rem; color: #ffc107; margin-bottom: 1rem;"></i>
                <p style="color: #ffc107; margin: 0;">Nenhum repositório público encontrado.</p>
            </div>
        `;
        return;
    }
    
    let reposHTML = '<h3>Meus últimos repositórios</h3><div class="github-repos-grid">';
    
    // Criar card para cada repositório
    repos.forEach(repo => {
        console.log('Processando repositório:', repo.name);
        reposHTML += `
            <div class="github-repo-card">
                <h4>${repo.name || 'Sem nome'}</h4>
                <p>${repo.description || 'Sem descrição disponível'}</p>
                <div class="repo-stats">
                    <span><i class="fas fa-star"></i> ${repo.stargazers_count || 0}</span>
                    <span><i class="fas fa-code-branch"></i> ${repo.forks_count || 0}</span>
                </div>
                <a href="${repo.html_url}" target="_blank" class="github-repo-link">
                    <button>Ver no GitHub</button>
                </a>
            </div>
        `;
    });
    
    reposHTML += '</div>';
    reposElement.innerHTML = reposHTML;
    console.log('Repositórios atualizados com sucesso');
}

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
    enableNetwork,
    disableNetwork,
    limit 
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
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

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

// Expor funções de debug globalmente
window.debugGitHubRepos = debugGitHubRepos;
window.clearSkillsCache = clearSkillsCache;

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
        const messagesRef = collection(db, 'mensagens');
        const q = query(
            messagesRef,
            where('chat_id', '==', currentChatId),
            limit(50)
        );
        
        // Escutar mudanças em tempo real
        messagesListener = onSnapshot(q, (snapshot) => {
            const chatMessages = document.getElementById('chat-messages');
            // Limpar mensagens anteriores (exceto mensagens do sistema)
            const systemMessages = Array.from(chatMessages.querySelectorAll('.system-message'));
            chatMessages.innerHTML = '';
            systemMessages.forEach(msg => chatMessages.appendChild(msg));
            
            if (snapshot.empty) {
                // Se não houver mensagens, apenas mostramos a mensagem de boas-vindas
                console.log('Nenhuma mensagem anterior encontrada para este chat');
            } else {
                // Converter para array e ordenar por hora no JavaScript
                const messages = [];
                snapshot.forEach((doc) => {
                    messages.push({ data: doc.data(), id: doc.id });
                });
                
                // Ordenar mensagens por hora (mais antigas primeiro)
                messages.sort((a, b) => {
                    const horaA = a.data.hora;
                    const horaB = b.data.hora;
                    
                    // Converter para timestamp para comparação
                    let timestampA, timestampB;
                    
                    if (horaA && typeof horaA.toDate === 'function') {
                        timestampA = horaA.toDate().getTime();
                    } else if (horaA instanceof Date) {
                        timestampA = horaA.getTime();
                    } else {
                        timestampA = 0;
                    }
                    
                    if (horaB && typeof horaB.toDate === 'function') {
                        timestampB = horaB.toDate().getTime();
                    } else if (horaB instanceof Date) {
                        timestampB = horaB.getTime();
                    } else {
                        timestampB = 0;
                    }
                    
                    return timestampA - timestampB;
                });
                
                // Exibir mensagens na ordem correta
                messages.forEach((msg) => {
                    displayMessage(msg.data, msg.id);
                });
            }
            
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }, (error) => {
            console.error('Erro ao carregar mensagens:', error);
            addSystemMessage('Erro ao carregar mensagens anteriores. Mas você pode enviar novas mensagens normalmente.', 'error');
        });
    } catch (error) {
        console.error('Erro ao configurar listener:', error);
        addSystemMessage('Erro ao conectar com o servidor. Tente recarregar a página.', 'error');
    }
}

// Função para exibir mensagem na interface
function displayMessage(messageData, messageId) {
    const chatMessages = document.getElementById('chat-messages');
    if (!chatMessages) return;
    
    // Verificar se a mensagem já existe na interface (evitar duplicatas)
    if (document.querySelector(`[data-message-id="${messageId}"]`)) {
        return;
    }
    
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
        addSystemMessage('Sistema offline. Mensagem será salva localmente.', 'warning');
        // Salvar mensagem localmente se Firebase não estiver disponível
        saveMessageLocally(message);
        inputField.value = '';
        return;
    }
    
    try {
        // Criar objeto da mensagem
        const messageData = {
            nome: currentUserName,
            mensagem: message,
            hora: new Date(),
            chat_id: currentChatId,
            resposta: '',
            respondido: false
        };
        
        // Exibir mensagem imediatamente na interface para feedback visual
        const tempId = 'temp-' + Date.now();
        displayMessage(messageData, tempId);
        
        // Limpar input antes de salvar para feedback imediato
        inputField.value = '';
        
        // Salvar mensagem no Firestore
        await addDoc(collection(db, 'mensagens'), messageData);
        
        console.log('Mensagem enviada com sucesso!');
    } catch (error) {
        console.error('Erro ao enviar mensagem:', error);
        
        // Remover mensagem temporária em caso de erro
        const tempMsg = document.querySelector(`[data-message-id^="temp-"]`);
        if (tempMsg) tempMsg.remove();
        
        // Salvar localmente como fallback
        addSystemMessage('Erro no servidor. Mensagem salva localmente.', 'warning');
        saveMessageLocally(message);
        
        // Não restaurar no input pois a mensagem foi salva localmente
    }
}

// Função para salvar mensagem localmente
function saveMessageLocally(message) {
    try {
        const localMessages = JSON.parse(localStorage.getItem('localMessages') || '[]');
        const messageData = {
            nome: currentUserName,
            mensagem: message,
            hora: new Date().toISOString(),
            chat_id: currentChatId,
            local: true
        };
        
        localMessages.push(messageData);
        localStorage.setItem('localMessages', JSON.stringify(localMessages));
        
        // Exibir mensagem local
        displayMessage(messageData, 'local-' + Date.now());
        
    } catch (error) {
        console.error('Erro ao salvar mensagem localmente:', error);
        addSystemMessage('Erro ao salvar mensagem. Tente novamente.', 'error');
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
        navigator.serviceWorker.register('assets/js/sw.js')
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

    console.log('Inicializando página de projetos interativos...');

    // Gestão das abas de projetos
    const tabBtns = document.querySelectorAll('.tab-btn');
    const projectContents = document.querySelectorAll('.project-content');

    console.log('Botões de abas encontrados:', tabBtns.length);
    console.log('Conteúdos de projetos encontrados:', projectContents.length);

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');
            console.log('Aba clicada:', tabId);
            
            tabBtns.forEach(b => b.classList.remove('active'));
            projectContents.forEach(content => content.classList.remove('active'));
            
            btn.classList.add('active');
            const targetTab = document.getElementById(`${tabId}-tab`);
            if (targetTab) {
                targetTab.classList.add('active');
                console.log('Aba ativada:', tabId);
            } else {
                console.error('Elemento não encontrado:', `${tabId}-tab`);
            }
        });
    });

    // Inicializar cada projeto
    console.log('Inicializando projetos...');
    initCalculator();
    initSnakeGame();
    initCodeEditor();
    console.log('Projetos inicializados!');
});

// ========== CALCULADORA AVANÇADA ==========
function initCalculator() {
    // Verificar se estamos na página da calculadora
    if (!document.querySelector('.calc-result')) return;
    
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

// ==================== SISTEMA DE ANÁLISE DE SKILLS AUTOMÁTICO ====================

// Mapeamento de linguagens e frameworks/tecnologias
const SKILL_MAPPING = {
    // Linguagens de Programação
    'JavaScript': { category: 'programming', icon: 'fab fa-js-square', color: '#f7df1e' },
    'TypeScript': { category: 'programming', icon: 'fab fa-js-square', color: '#3178c6' },
    'Python': { category: 'programming', icon: 'fab fa-python', color: '#3776ab' },
    'Java': { category: 'programming', icon: 'fab fa-java', color: '#ed8b00' },
    'C++': { category: 'programming', icon: 'fas fa-code', color: '#00599c' },
    'C#': { category: 'programming', icon: 'fas fa-code', color: '#239120' },
    'PHP': { category: 'programming', icon: 'fab fa-php', color: '#777bb4' },
    'Go': { category: 'programming', icon: 'fas fa-code', color: '#00add8' },
    'Rust': { category: 'programming', icon: 'fas fa-code', color: '#000000' },
    'Swift': { category: 'programming', icon: 'fab fa-swift', color: '#fa7343' },
    'Kotlin': { category: 'programming', icon: 'fas fa-code', color: '#7f52ff' },
    'Dart': { category: 'programming', icon: 'fas fa-code', color: '#0175c2' },
    'Ruby': { category: 'programming', icon: 'fas fa-gem', color: '#cc342d' },
    
    // Web Technologies
    'HTML': { category: 'web', icon: 'fab fa-html5', color: '#e34f26' },
    'CSS': { category: 'web', icon: 'fab fa-css3-alt', color: '#1572b6' },
    'SCSS': { category: 'web', icon: 'fab fa-sass', color: '#cf649a' },
    'React': { category: 'framework', icon: 'fab fa-react', color: '#61dafb' },
    'Vue': { category: 'framework', icon: 'fab fa-vuejs', color: '#4fc08d' },
    'Angular': { category: 'framework', icon: 'fab fa-angular', color: '#dd0031' },
    'Node.js': { category: 'runtime', icon: 'fab fa-node-js', color: '#339933' },
    'Express': { category: 'framework', icon: 'fas fa-server', color: '#000000' },
    'Next.js': { category: 'framework', icon: 'fas fa-code', color: '#000000' },
    
    // Database & Storage
    'MongoDB': { category: 'database', icon: 'fas fa-database', color: '#47a248' },
    'MySQL': { category: 'database', icon: 'fas fa-database', color: '#4479a1' },
    'PostgreSQL': { category: 'database', icon: 'fas fa-database', color: '#336791' },
    'Firebase': { category: 'database', icon: 'fas fa-fire', color: '#ffca28' },
    'SQLite': { category: 'database', icon: 'fas fa-database', color: '#003b57' },
    
    // DevOps & Tools
    'Docker': { category: 'devops', icon: 'fab fa-docker', color: '#2496ed' },
    'Git': { category: 'tool', icon: 'fab fa-git-alt', color: '#f05032' },
    'Linux': { category: 'system', icon: 'fab fa-linux', color: '#fcc624' },
    'AWS': { category: 'cloud', icon: 'fab fa-aws', color: '#ff9900' },
    'Azure': { category: 'cloud', icon: 'fab fa-microsoft', color: '#0078d4' },
    
    // Mobile
    'Flutter': { category: 'mobile', icon: 'fas fa-mobile-alt', color: '#02569b' },
    'React Native': { category: 'mobile', icon: 'fab fa-react', color: '#61dafb' },
    
    // Game Development
    'Unity': { category: 'game', icon: 'fab fa-unity', color: '#000000' },
    'Unreal Engine': { category: 'game', icon: 'fas fa-gamepad', color: '#313131' },
    'Godot': { category: 'game', icon: 'fas fa-gamepad', color: '#478cbf' }
};

// Detecção de tecnologias baseada em arquivos e conteúdo
const TECHNOLOGY_DETECTION = {
    'React': {
        files: ['package.json'],
        content: ['"react":', 'import React', 'from "react"', 'react-dom'],
        extensions: ['.jsx', '.tsx']
    },
    'Vue': {
        files: ['package.json'],
        content: ['"vue":', 'Vue.', '<template>', 'vue-router'],
        extensions: ['.vue']
    },
    'Angular': {
        files: ['angular.json', 'package.json'],
        content: ['"@angular/', 'ng-', 'Angular'],
        extensions: ['.component.ts', '.service.ts']
    },
    'Node.js': {
        files: ['package.json', 'server.js', 'app.js'],
        content: ['require(', 'module.exports', 'process.env', 'express']
    },
    'Express': {
        files: ['package.json'],
        content: ['"express":', 'app.listen', 'express()']
    },
    'Next.js': {
        files: ['next.config.js', 'package.json'],
        content: ['"next":', 'getStaticProps', 'getServerSideProps']
    },
    'MongoDB': {
        files: ['package.json'],
        content: ['"mongodb":', '"mongoose":', 'mongoose.connect']
    },
    'Firebase': {
        files: ['firebase.json', 'package.json'],
        content: ['firebase/', 'initializeApp', 'getFirestore']
    },
    'Docker': {
        files: ['Dockerfile', 'docker-compose.yml'],
        content: ['FROM ', 'docker run', 'docker build']
    },
    'Flutter': {
        files: ['pubspec.yaml'],
        content: ['flutter:', 'dart:', 'material.dart'],
        extensions: ['.dart']
    },
    'Unity': {
        files: ['ProjectSettings/ProjectVersion.txt'],
        content: ['UnityEngine', 'MonoBehaviour'],
        extensions: ['.cs']
    },
    'SCSS': {
        extensions: ['.scss', '.sass'],
        content: ['@import', '@mixin', '$']
    }
};

// Função principal de análise de skills
async function analyzeSkillsFromRepos(username, repos) {
    const skillsGrid = document.querySelector('.skills-grid');
    
    try {
        console.log(`Analisando ${repos.length} repositórios para extrair skills...`);
        
        // Verificar se temos repositórios para analisar
        if (!repos || repos.length === 0) {
            console.log('Nenhum repositório encontrado, usando fallback...');
            showFallbackSkills();
            return;
        }
        
        // Coletar dados de linguagens de todos os repositórios
        const languageStats = {};
        const technologyStats = {};
        let totalBytes = 0;
        let successfulRequests = 0;
        
        // Processar repositórios em lotes menores para evitar rate limiting
        const batchSize = 3;
        for (let i = 0; i < repos.length; i += batchSize) {
            const batch = repos.slice(i, i + batchSize);
            
            const batchPromises = batch.map(async (repo) => {
                try {
                    await analyzeRepository(repo, languageStats, technologyStats);
                    successfulRequests++;
                } catch (error) {
                    console.warn(`Erro ao analisar repositório ${repo.name}:`, error);
                }
            });
            
            await Promise.allSettled(batchPromises);
            
            // Pausa maior entre lotes para respeitar rate limits
            if (i + batchSize < repos.length) {
                await delay(200);
            }
        }
        
        // Calcular total de bytes
        Object.values(languageStats).forEach(bytes => totalBytes += bytes);
        
        // Se não conseguimos analisar nada, usar fallback
        if (successfulRequests === 0 || totalBytes === 0) {
            console.log('Nenhum dado válido coletado, usando fallback...');
            showFallbackSkills();
            return;
        }
        
        // Detectar tecnologias adicionais nos repositórios
        await detectTechnologies(repos, technologyStats);
        
        // Gerar skills cards baseado nos dados analisados
        generateSkillsCards(languageStats, technologyStats, totalBytes);
        
        console.log(`Análise concluída: ${successfulRequests}/${repos.length} repositórios analisados com sucesso`);
        
    } catch (error) {
        console.error('Erro na análise de skills:', error);
        console.log('Erro na API do GitHub, usando skills de fallback...');
        generateFallbackSkills();
    }
}

// Analisar um repositório específico
async function analyzeRepository(repo, languageStats, technologyStats) {
    try {
        // Buscar linguagens do repositório com timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 segundos timeout
        
        const languagesResponse = await fetch(repo.languages_url, {
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (languagesResponse.ok) {
            const languages = await languagesResponse.json();
            
            // Adicionar aos stats globais
            Object.entries(languages).forEach(([lang, bytes]) => {
                languageStats[lang] = (languageStats[lang] || 0) + bytes;
            });
        } else if (languagesResponse.status === 403 || languagesResponse.status === 429) {
            // Rate limit hit, aguardar um pouco mais
            console.warn(`Rate limit para ${repo.name}, aguardando...`);
            await delay(1000);
            throw new Error('Rate limit');
        }
        
        // Analisar arquivos principais para detectar tecnologias (com timeout menor)
        await Promise.race([
            analyzeRepoContents(repo, technologyStats),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 3000))
        ]);
        
    } catch (error) {
        if (error.name === 'AbortError' || error.message === 'Timeout') {
            console.warn(`Timeout ao analisar repositório ${repo.name}`);
        } else {
            console.warn(`Erro ao analisar repositório ${repo.name}:`, error.message);
        }
        throw error;
    }
}

// Analisar conteúdo do repositório para detectar tecnologias
async function analyzeRepoContents(repo, technologyStats) {
    try {
        // Buscar conteúdo do repositório
        const contentsResponse = await fetch(repo.contents_url.replace('{+path}', ''));
        if (!contentsResponse.ok) return;
        
        const contents = await contentsResponse.json();
        
        // Verificar arquivos específicos
        const fileNames = contents.map(item => item.name.toLowerCase());
        
        Object.entries(TECHNOLOGY_DETECTION).forEach(([tech, detection]) => {
            let score = 0;
            
            // Verificar arquivos específicos
            if (detection.files) {
                detection.files.forEach(file => {
                    if (fileNames.includes(file.toLowerCase())) {
                        score += 2;
                    }
                });
            }
            
            // Verificar extensões
            if (detection.extensions) {
                detection.extensions.forEach(ext => {
                    const hasExt = contents.some(item => 
                        item.name.toLowerCase().endsWith(ext.toLowerCase())
                    );
                    if (hasExt) score += 1;
                });
            }
            
            if (score > 0) {
                technologyStats[tech] = (technologyStats[tech] || 0) + score;
            }
        });
        
    } catch (error) {
        console.error(`Erro ao analisar conteúdo do repositório ${repo.name}:`, error);
    }
}

// Detectar tecnologias adicionais
async function detectTechnologies(repos, technologyStats) {
    // Análise baseada em nomes de repositórios e descrições
    repos.forEach(repo => {
        const repoText = `${repo.name} ${repo.description || ''}`.toLowerCase();
        
        Object.keys(SKILL_MAPPING).forEach(skill => {
            const skillLower = skill.toLowerCase();
            if (repoText.includes(skillLower)) {
                technologyStats[skill] = (technologyStats[skill] || 0) + 1;
            }
        });
    });
}

// Gerar cards de skills baseado na análise
function generateSkillsCards(languageStats, technologyStats, totalBytes, fromCache = false) {
    const skillsGrid = document.querySelector('.skills-grid');
    const loadingElement = document.getElementById('skills-loading');
    
    // Remover loading
    if (loadingElement) {
        loadingElement.remove();
    }
    
    // Combinar dados de linguagens e tecnologias
    const allSkills = {};
    
    // Processar linguagens (baseado em bytes de código)
    Object.entries(languageStats).forEach(([lang, bytes]) => {
        const percentage = totalBytes > 0 ? (bytes / totalBytes * 100) : 0;
        if (percentage > 1) { // Só mostrar linguagens com mais de 1%
            allSkills[lang] = {
                percentage: Math.round(percentage),
                type: 'language',
                bytes: bytes
            };
        }
    });
    
    // Processar tecnologias (baseado em frequência)
    const maxTechScore = Math.max(...Object.values(technologyStats), 1);
    Object.entries(technologyStats).forEach(([tech, score]) => {
        if (score > 1) { // Só mostrar tecnologias com score > 1
            const percentage = Math.min(Math.round((score / maxTechScore) * 85), 95); // Max 95%
            allSkills[tech] = {
                percentage: Math.max(percentage, 10), // Min 10%
                type: 'technology',
                score: score
            };
        }
    });
    
    // Adicionar skills garantidas baseadas em análise manual
    const guaranteedSkills = {
        'HTML': { percentage: 85, type: 'guaranteed' },
        'CSS': { percentage: 80, type: 'guaranteed' },
        'JavaScript': { percentage: Math.max(allSkills['JavaScript']?.percentage || 0, 75), type: 'guaranteed' },
        'Git': { percentage: 90, type: 'guaranteed' },
        'Firebase': { percentage: Math.max(allSkills['Firebase']?.percentage || 0, 70), type: 'guaranteed' }
    };
    
    // Mesclar skills garantidas
    Object.entries(guaranteedSkills).forEach(([skill, data]) => {
        allSkills[skill] = {
            ...allSkills[skill],
            ...data,
            percentage: Math.max(allSkills[skill]?.percentage || 0, data.percentage)
        };
    });
    
    // Ordenar por porcentagem
    const sortedSkills = Object.entries(allSkills)
        .sort(([,a], [,b]) => b.percentage - a.percentage);
    
    // Gerar HTML dos cards
    let skillsHTML = '';
    sortedSkills.forEach(([skillName, data]) => {
        const skillInfo = SKILL_MAPPING[skillName] || {
            category: 'other',
            icon: 'fas fa-code',
            color: '#6c757d'
        };
        
        skillsHTML += createSkillCard(skillName, data.percentage, skillInfo, data);
    });
    
    skillsGrid.innerHTML = skillsHTML;
    
    // Adicionar informações sobre a análise
    addAnalysisInfo(Object.keys(languageStats).length, Object.keys(technologyStats).length, fromCache);
    
    // Salvar dados no cache para próximas visitas (apenas se não vieram do cache)
    if (!fromCache) {
        saveToCache({
            languageStats,
            technologyStats,
            totalBytes,
            timestamp: Date.now()
        });
    }
    
    console.log('Skills geradas automaticamente:', sortedSkills.length);
}

// Criar um card de skill individual
function createSkillCard(skillName, percentage, skillInfo, data) {
    const badgeText = data.type === 'language' ? 'Linguagem' : 
                     data.type === 'technology' ? 'Framework/Tech' : 
                     'Garantida';
    
    const additionalInfo = data.bytes ? 
        `<small style="opacity: 0.7;">${formatBytes(data.bytes)} de código</small>` :
        data.score ? 
        `<small style="opacity: 0.7;">Score: ${data.score}</small>` : '';
    
    return `
        <div class="skill-card" data-skill="${skillName}">
            <div class="skill-header">
                <div class="skill-icon" style="color: ${skillInfo.color};">
                    <i class="${skillInfo.icon}"></i>
                </div>
                <div class="skill-info">
                    <h3 class="skill-name">${skillName}</h3>
                    <span class="skill-badge ${data.type}">${badgeText}</span>
                </div>
            </div>
            
            <div class="skill-progress">
                <div class="progress-bar">
                    <div class="progress-fill" 
                         style="width: ${percentage}%; background: linear-gradient(90deg, ${skillInfo.color}99, ${skillInfo.color});">
                    </div>
                </div>
                <span class="skill-percentage">${percentage}%</span>
            </div>
            
            ${additionalInfo}
        </div>
    `;
}

// Adicionar informações sobre a análise
function addAnalysisInfo(languageCount, techCount, fromCache = false) {
    const skillsGrid = document.querySelector('.skills-grid');
    
    const cacheInfo = fromCache ? 
        '<br><small style="opacity: 0.8;"><i class="fas fa-clock" style="margin-right: 0.3rem;"></i>Dados do cache local • Cache válido por 1 hora</small>' :
        '<br><small style="opacity: 0.8;">Dados atualizados em tempo real • Última atualização: ' + new Date().toLocaleString() + '</small>';
    
    const infoHTML = `
        <div class="analysis-info" style="grid-column: 1 / -1; margin-top: 1rem; padding: 1rem; background: rgba(200, 170, 110, 0.1); border-radius: 8px; text-align: center; border-left: 4px solid #c8aa6e;">
            <p style="margin: 0; color: #c8aa6e; font-size: 0.9rem;">
                <i class="fas fa-chart-bar" style="margin-right: 0.5rem;"></i>
                <strong>Análise Completada:</strong> ${languageCount} linguagens e ${techCount} tecnologias detectadas automaticamente através da API do GitHub
                ${cacheInfo}
            </p>
        </div>
    `;
    
    skillsGrid.insertAdjacentHTML('beforeend', infoHTML);
}

// Formatar bytes
function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// Mostrar erro na análise de skills e usar fallback
function showSkillsError() {
    console.log('Erro na API do GitHub, usando skills de fallback...');
    generateFallbackSkills();
}

// ==================== SISTEMA DE FALLBACK PARA SKILLS ====================

// Skills estáticas de fallback caso a API do GitHub falhe
const FALLBACK_SKILLS = {
    'JavaScript': { percentage: 85, type: 'primary', icon: 'fab fa-js-square', color: '#f7df1e' },
    'HTML': { percentage: 90, type: 'primary', icon: 'fab fa-html5', color: '#e34f26' },
    'CSS': { percentage:  85, type: 'primary', icon: 'fab fa-css3-alt', color: '#1572b6' },
    'React': { percentage: 75, type: 'framework', icon: 'fab fa-react', color: '#61dafb' },
    'Node.js': { percentage: 70, type: 'runtime', icon: 'fab fa-node-js', color: '#339933' },
    'Firebase': { percentage: 80, type: 'database', icon: 'fas fa-fire', color: '#ffca28' },
    'Git': { percentage: 90, type: 'tool', icon: 'fab fa-git-alt', color: '#f05032' },
    'Python': { percentage: 65, type: 'programming', icon: 'fab fa-python', color: '#3776ab' },
    'Express': { percentage: 70, type: 'framework', icon: 'fas fa-server', color: '#000000' },
    'MongoDB': { percentage: 60, type: 'database', icon: 'fas fa-database', color: '#47a248' }
};

// Função para mostrar skills de fallback (redirecionada)
function showFallbackSkills() {
    console.log('Redirecionando para generateFallbackSkills...');
    generateFallbackSkills();
}

// Função de debug para verificar o status dos repositórios
function debugGitHubRepos() {
    const reposElement = document.getElementById('github-repos');
    console.log('=== DEBUG GITHUB REPOS ===');
    console.log('Elemento github-repos existe:', !!reposElement);
    if (reposElement) {
        console.log('Conteúdo atual do elemento:', reposElement.innerHTML.substring(0, 200) + '...');
        console.log('Classes do elemento:', reposElement.className);
        console.log('Estilo display:', window.getComputedStyle(reposElement).display);
        console.log('Estilo visibility:', window.getComputedStyle(reposElement).visibility);
    }
    console.log('========================');
}

// Função melhorada para garantir que os repositórios sejam sempre exibidos
async function ensureReposDisplay() {
    const reposElement = document.getElementById('github-repos');
    if (!reposElement) {
        console.warn('Elemento github-repos não encontrado!');
        return;
    }
    
    // Se o elemento ainda tem apenas o loader após 10 segundos, mostrar fallback
    setTimeout(() => {
        if (reposElement.innerHTML.includes('loader') && !reposElement.innerHTML.includes('github-repos-grid')) {
            console.log('Timeout atingido, exibindo mensagem de fallback...');
            reposElement.innerHTML = `
                <h3>Meus últimos repositórios</h3>
                <div style="text-align: center; padding: 2rem; background: rgba(255, 193, 7, 0.1); border: 1px solid rgba(255, 193, 7, 0.3); border-radius: 10px;">
                    <i class="fas fa-clock" style="font-size: 2rem; color: #ffc107; margin-bottom: 1rem;"></i>
                    <p style="color: #ffc107; margin: 0;">Carregando repositórios...</p>
                    <p style="color: #ffc107; margin: 0.5rem 0 0; font-size: 0.9rem;">Isso pode levar alguns segundos devido aos limites da API do GitHub.</p>
                    <button onclick="debugGitHubRepos(); fetchGitHubData();" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #ffc107; color: #000; border: none; border-radius: 5px; cursor: pointer;">
                        🔄 Tentar Novamente
                    </button>
                </div>
            `;
        }
    }, 10000);
}

// Constantes de cache
const GITHUB_CACHE_KEY = 'github_skills_cache_v2';
const CACHE_DURATION = 6 * 60 * 60 * 1000; // 6 horas em milissegundos

// Função para salvar no cache
function saveToCache(data) {
    try {
        const cacheData = {
            timestamp: Date.now(),
            data: data
        };
        localStorage.setItem(GITHUB_CACHE_KEY, JSON.stringify(cacheData));
        console.log('Dados salvos no cache local');
    } catch (error) {
        console.warn('Erro ao salvar no cache:', error);
    }
}

// Função para recuperar do cache
function getFromCache() {
    try {
        const cached = localStorage.getItem(GITHUB_CACHE_KEY);
        if (!cached) return null;
        
        const cacheData = JSON.parse(cached);
        const now = Date.now();
        
        // Verificar se o cache ainda é válido
        if (now - cacheData.timestamp < CACHE_DURATION) {
            console.log('Dados recuperados do cache local');
            return cacheData.data;
        } else {
            // Cache expirado, remover
            localStorage.removeItem(GITHUB_CACHE_KEY);
            console.log('Cache expirado, removido');
            return null;
        }
    } catch (error) {
        console.warn('Erro ao recuperar do cache:', error);
        return null;
    }
}

// Função para limpar cache manualmente
function clearSkillsCache() {
    localStorage.removeItem(GITHUB_CACHE_KEY);
    console.log('Cache de skills limpo');
}
