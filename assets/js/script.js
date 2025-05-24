function toggleMenu() {
    let menu = document.getElementById("menu-lateral");
    menu.classList.toggle("menu-aberto");
}

// Loading Screen
window.addEventListener('load', () => {
    const loadingScreen = document.getElementById('loading-screen');
    loadingScreen.style.opacity = '0';
    setTimeout(() => {
        loadingScreen.style.display = 'none';
    }, 500);
    
    // Carregar dados do GitHub ao finalizar o carregamento da página
    fetchGitHubData();
});

// Função para buscar dados do GitHub
function fetchGitHubData() {
    // Nome de usuário do GitHub (altere para o seu)
    const username = "mikaelfmts";
    
    // Buscar dados do perfil
    fetch(`https://api.github.com/users/${username}`)
        .then(response => response.json())
        .then(data => {
            // Atualizar informações do perfil
            updateGitHubProfile(data);
            
            // Buscar repositórios do usuário
            return fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=5`);
        })
        .then(response => response.json())
        .then(repos => {
            // Atualizar repositórios
            updateGitHubRepos(repos);
        })
        .catch(error => {
            console.error('Erro ao buscar dados do GitHub:', error);
        });
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
    // Verificar se há um elemento para exibir os repositórios
    const reposElement = document.getElementById('github-repos');
    if (reposElement) {
        let reposHTML = '<h3>Meus últimos repositórios</h3><div class="github-repos-grid">';
        
        // Criar card para cada repositório
        repos.forEach(repo => {
            reposHTML += `
                <div class="github-repo-card">
                    <h4>${repo.name}</h4>
                    <p>${repo.description || 'Sem descrição disponível'}</p>
                    <div class="repo-stats">
                        <span><i class="fas fa-star"></i> ${repo.stargazers_count}</span>
                        <span><i class="fas fa-code-branch"></i> ${repo.forks_count}</span>
                    </div>
                    <a href="${repo.html_url}" target="_blank" class="github-repo-link">
                        <button>Ver no GitHub</button>
                    </a>
                </div>
            `;
        });
        
        reposHTML += '</div>';
        reposElement.innerHTML = reposHTML;
    }
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
            orderBy('hora', 'asc')
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
                snapshot.forEach((doc) => {
                    const data = doc.data();
                    displayMessage(data, doc.id);
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
            resposta: '',
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

    // Suporte para navegação por hash/âncora
    function switchToTab(tabId) {
        tabBtns.forEach(b => b.classList.remove('active'));
        projectContents.forEach(content => content.classList.remove('active'));
        
        const targetBtn = document.querySelector(`[data-tab="${tabId}"]`);
        const targetTab = document.getElementById(`${tabId}-tab`);
        
        if (targetBtn && targetTab) {
            targetBtn.classList.add('active');
            targetTab.classList.add('active');
            console.log('Aba ativada por hash:', tabId);
            
            // Scroll suave para a seção se necessário
            targetTab.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    // Verificar hash na URL ao carregar
    if (window.location.hash) {
        const hash = window.location.hash.substring(1); // Remove o #
        if (hash.endsWith('-tab')) {
            const tabId = hash.replace('-tab', '');
            setTimeout(() => switchToTab(tabId), 100); // Pequeno delay para garantir que tudo carregou
        }
    }

    // Escutar mudanças no hash
    window.addEventListener('hashchange', () => {
        if (window.location.hash) {
            const hash = window.location.hash.substring(1);
            if (hash.endsWith('-tab')) {
                const tabId = hash.replace('-tab', '');
                switchToTab(tabId);
            }
        }
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
    
    // Variáveis para efeitos visuais
    let particles = [];
    let flashEffect = false;
    let gameStartTime = 0;
    
    // Sistema de partículas para efeitos
    class Particle {
        constructor(x, y, color, velocity, life) {
            this.x = x;
            this.y = y;
            this.color = color;
            this.velocity = velocity;
            this.life = life;
            this.maxLife = life;
        }
        
        update() {
            this.x += this.velocity.x;
            this.y += this.velocity.y;
            this.velocity.x *= 0.98;
            this.velocity.y *= 0.98;
            this.life--;
        }
        
        draw(ctx) {
            const alpha = this.life / this.maxLife;
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, 2, 0, 2 * Math.PI);
            ctx.fill();
            ctx.restore();
        }
        
        isDead() {
            return this.life <= 0;
        }
    }
    
    // Função para criar explosão de partículas
    function createParticleExplosion(x, y, color, count = 10) {
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count;
            const velocity = {
                x: Math.cos(angle) * (Math.random() * 3 + 1),
                y: Math.sin(angle) * (Math.random() * 3 + 1)
            };
            particles.push(new Particle(x, y, color, velocity, 30 + Math.random() * 20));
        }
    }
    
    // Função para atualizar partículas
    function updateParticles() {
        particles = particles.filter(particle => {
            particle.update();
            return !particle.isDead();
        });
    }
    
    // Função para desenhar partículas
    function drawParticles() {
        particles.forEach(particle => particle.draw(ctx));
    }
    
    // Efeitos sonoros usando Web Audio API
    let audioContext;
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
        console.log('Web Audio API não suportado');
        audioContext = null;
    }
    
    function playSound(frequency, duration, type = 'sine', volume = 0.1) {
        if (!audioContext) return;
        
        try {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
            oscillator.type = type;
            
            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + duration);
        } catch (e) {
            console.log('Erro ao reproduzir som:', e);
        }
    }
    
    function playEatSound() {
        playSound(800, 0.1, 'square', 0.05);
        setTimeout(() => playSound(1000, 0.1, 'square', 0.05), 50);
    }
    
    function playGameOverSound() {
        playSound(200, 0.3, 'sawtooth', 0.1);
        setTimeout(() => playSound(150, 0.3, 'sawtooth', 0.1), 150);
        setTimeout(() => playSound(100, 0.5, 'sawtooth', 0.1), 300);
    }
    
    function playMoveSound() {
        playSound(300, 0.05, 'triangle', 0.02);
    }
    
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
        
        // Resetar efeitos visuais
        particles = [];
        flashEffect = false;
        gameStartTime = Date.now();
        
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
            // Efeito visual de game over
            const head = snake[0];
            createParticleExplosion(
                head.x * gridSize + gridSize/2, 
                head.y * gridSize + gridSize/2, 
                '#FF5252', 
                20
            );
            flashEffect = true;
            playGameOverSound();
            setTimeout(() => {
                flashEffect = false;
                gameOver();
            }, 300);
            return;
        }
        
        if (eatFood()) {
            // Efeitos visuais e sonoros ao comer
            createParticleExplosion(
                food.x * gridSize + gridSize/2, 
                food.y * gridSize + gridSize/2, 
                '#FFD700', 
                15
            );
            playEatSound();
            
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
        
        // Atualizar partículas
        updateParticles();
        
        draw();
    }
    
    function moveSnake() {
        // Atualizar direção
        direction = nextDirection;
        
        // Som sutil de movimento
        if (Math.random() < 0.1) { // 10% de chance de som
            playMoveSound();
        }
        
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
        
        // Teletransportar se atingir borda com efeito visual
        if (head.x < 0) {
            head.x = gridWidth - 1;
            createParticleExplosion(gridWidth * gridSize - 10, head.y * gridSize + gridSize/2, '#00BCD4', 8);
        }
        if (head.x >= gridWidth) {
            head.x = 0;
            createParticleExplosion(10, head.y * gridSize + gridSize/2, '#00BCD4', 8);
        }
        if (head.y < 0) {
            head.y = gridHeight - 1;
            createParticleExplosion(head.x * gridSize + gridSize/2, gridHeight * gridSize - 10, '#00BCD4', 8);
        }
        if (head.y >= gridHeight) {
            head.y = 0;
            createParticleExplosion(head.x * gridSize + gridSize/2, 10, '#00BCD4', 8);
        }
        
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
        // Limpar canvas com gradiente de fundo
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(1, '#16213e');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Efeito de flash para game over
        if (flashEffect) {
            ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        
        // Desenhar grid sutil
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 0.5;
        for (let x = 0; x <= canvas.width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }
        for (let y = 0; y <= canvas.height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }
        
        // Desenhar cobra com efeitos realistas
        for (let i = 0; i < snake.length; i++) {
            const segment = snake[i];
            const x = segment.x * gridSize;
            const y = segment.y * gridSize;
            
            if (i === 0) {
                // Cabeça da cobra com gradiente e sombra
                ctx.save();
                
                // Sombra
                ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
                ctx.shadowBlur = 8;
                ctx.shadowOffsetX = 2;
                ctx.shadowOffsetY = 2;
                
                // Gradiente da cabeça
                const headGradient = ctx.createRadialGradient(
                    x + gridSize/2, y + gridSize/2, 0,
                    x + gridSize/2, y + gridSize/2, gridSize/2
                );
                headGradient.addColorStop(0, '#66BB6A');
                headGradient.addColorStop(1, '#2E7D32');
                ctx.fillStyle = headGradient;
                
                // Desenhar cabeça redonda
                ctx.beginPath();
                ctx.arc(x + gridSize/2, y + gridSize/2, gridSize/2 - 1, 0, 2 * Math.PI);
                ctx.fill();
                
                // Olhos
                ctx.shadowColor = 'transparent';
                ctx.fillStyle = '#FFFFFF';
                const eyeSize = 3;
                const eyeOffset = 4;
                
                // Posição dos olhos baseada na direção
                let eyeX1, eyeY1, eyeX2, eyeY2;
                if (direction === 'right') {
                    eyeX1 = x + gridSize - 6;
                    eyeY1 = y + eyeOffset;
                    eyeX2 = x + gridSize - 6;
                    eyeY2 = y + gridSize - eyeOffset;
                } else if (direction === 'left') {
                    eyeX1 = x + 6;
                    eyeY1 = y + eyeOffset;
                    eyeX2 = x + 6;
                    eyeY2 = y + gridSize - eyeOffset;
                } else if (direction === 'up') {
                    eyeX1 = x + eyeOffset;
                    eyeY1 = y + 6;
                    eyeX2 = x + gridSize - eyeOffset;
                    eyeY2 = y + 6;
                } else {
                    eyeX1 = x + eyeOffset;
                    eyeY1 = y + gridSize - 6;
                    eyeX2 = x + gridSize - eyeOffset;
                    eyeY2 = y + gridSize - 6;
                }
                
                ctx.beginPath();
                ctx.arc(eyeX1, eyeY1, eyeSize, 0, 2 * Math.PI);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(eyeX2, eyeY2, eyeSize, 0, 2 * Math.PI);
                ctx.fill();
                
                // Pupilas
                ctx.fillStyle = '#000000';
                ctx.beginPath();
                ctx.arc(eyeX1, eyeY1, eyeSize/2, 0, 2 * Math.PI);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(eyeX2, eyeY2, eyeSize/2, 0, 2 * Math.PI);
                ctx.fill();
                
                ctx.restore();
            } else {
                // Corpo da cobra com gradiente e escala decrescente
                const bodyScale = Math.max(0.7, 1 - (i * 0.05));
                const bodySize = (gridSize - 2) * bodyScale;
                const offset = (gridSize - bodySize) / 2;
                
                ctx.save();
                
                // Sombra do corpo
                ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
                ctx.shadowBlur = 4;
                ctx.shadowOffsetX = 1;
                ctx.shadowOffsetY = 1;
                
                // Gradiente do corpo
                const bodyGradient = ctx.createLinearGradient(x, y, x + gridSize, y + gridSize);
                const intensity = Math.max(0.3, 1 - (i * 0.1));
                bodyGradient.addColorStop(0, `rgba(139, 195, 74, ${intensity})`);
                bodyGradient.addColorStop(1, `rgba(46, 125, 50, ${intensity})`);
                ctx.fillStyle = bodyGradient;
                
                // Desenhar segmento do corpo arredondado
                const radius = bodySize / 6;
                ctx.beginPath();
                ctx.roundRect(x + offset, y + offset, bodySize, bodySize, radius);
                ctx.fill();
                
                // Padrão de escamas
                if (i % 2 === 0) {
                    ctx.fillStyle = `rgba(255, 255, 255, ${0.1 * intensity})`;
                    ctx.beginPath();
                    ctx.roundRect(x + offset + 2, y + offset + 2, bodySize - 4, bodySize - 4, radius/2);
                    ctx.fill();
                }
                
                ctx.restore();
            }
        }
        
        // Desenhar comida com efeito pulsante e brilho
        const time = Date.now() / 1000;
        const pulseScale = 1 + Math.sin(time * 6) * 0.15;
        const foodSize = (gridSize - 4) * pulseScale;
        const foodOffset = (gridSize - foodSize) / 2;
        const foodX = food.x * gridSize + foodOffset;
        const foodY = food.y * gridSize + foodOffset;
        
        ctx.save();
        
        // Brilho da comida
        ctx.shadowColor = '#FF4444';
        ctx.shadowBlur = 15;
        
        // Gradiente da comida
        const foodGradient = ctx.createRadialGradient(
            foodX + foodSize/2, foodY + foodSize/2, 0,
            foodX + foodSize/2, foodY + foodSize/2, foodSize/2
        );
        foodGradient.addColorStop(0, '#FF6B6B');
        foodGradient.addColorStop(0.7, '#FF5252');
        foodGradient.addColorStop(1, '#D32F2F');
        ctx.fillStyle = foodGradient;
        
        // Desenhar comida como círculo
        ctx.beginPath();
        ctx.arc(foodX + foodSize/2, foodY + foodSize/2, foodSize/2, 0, 2 * Math.PI);
        ctx.fill();
        
        // Destaque na comida
        ctx.shadowColor = 'transparent';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.beginPath();
        ctx.arc(foodX + foodSize/3, foodY + foodSize/3, foodSize/6, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.restore();
        
        // Desenhar obstáculos com textura de pedra
        obstacles.forEach(obs => {
            const obsX = obs.x * gridSize;
            const obsY = obs.y * gridSize;
            
            ctx.save();
            
            // Sombra dos obstáculos
            ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
            ctx.shadowBlur = 6;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;
            
            // Gradiente dos obstáculos
            const obsGradient = ctx.createLinearGradient(obsX, obsY, obsX + gridSize, obsY + gridSize);
            obsGradient.addColorStop(0, '#78909C');
            obsGradient.addColorStop(0.5, '#607D8B');
            obsGradient.addColorStop(1, '#455A64');
            ctx.fillStyle = obsGradient;
            
            // Desenhar obstáculo com bordas irregulares
            ctx.beginPath();
            ctx.roundRect(obsX + 1, obsY + 1, gridSize - 2, gridSize - 2, 3);
            ctx.fill();
            
            // Textura de pedra
            ctx.shadowColor = 'transparent';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.fillRect(obsX + 2, obsY + 2, 2, gridSize - 4);
            ctx.fillRect(obsX + 2, obsY + 2, gridSize - 4, 2);
            
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.fillRect(obsX + gridSize - 4, obsY + 4, 2, gridSize - 6);
            ctx.fillRect(obsX + 4, obsY + gridSize - 4, gridSize - 6, 2);
            
            ctx.restore();
        });
        
        // Desenhar partículas
        drawParticles();
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

// ========== JOGO FEHUNA: CÓDIGOS PERDIDOS ==========
function initFehunaGame() {
    // Verificar se estamos na página do jogo
    const gameContainer = document.querySelector('.fehuna-game-container');
    if (!gameContainer) return;
    
    // Elementos do DOM
    const startBtn = document.getElementById('start-fehuna');
    const resetBtn = document.getElementById('reset-fehuna');
    const mapGrid = document.querySelector('.map-grid');
    const playerChar = document.getElementById('player-char');
    const actionLog = document.getElementById('action-log');
    const battleScreen = document.getElementById('battle-screen');
    const actionButtons = document.getElementById('action-buttons');
    const skillMenu = document.getElementById('skill-menu');
    
    // Elementos de UI
    const playerHpElement = document.getElementById('player-hp');
    const playerMpElement = document.getElementById('player-mp');
    const playerLevelElement = document.getElementById('player-level');
    const playerExpElement = document.getElementById('player-exp');
    const hpFill = document.getElementById('hp-fill');
    const mpFill = document.getElementById('mp-fill');
    
    // Estado do jogo
    let gameState = {
        player: {
            x: 0,
            y: 0,
            hp: 100,
            maxHp: 100,
            mp: 50,
            maxMp: 50,
            level: 1,
            exp: 0,
            expToNext: 100,
            defending: false
        },
        inBattle: false,
        currentEnemy: null,
        currentLevel: 1,
        mapData: []
    };
    
    // Dados dos inimigos
    const enemies = [
        { name: 'Bug Corrupto', hp: 30, maxHp: 30, damage: 8, exp: 15 },
        { name: 'Vírus Trojan', hp: 45, maxHp: 45, damage: 12, exp: 25 },
        { name: 'Malware Avançado', hp: 60, maxHp: 60, damage: 15, exp: 35 },
        { name: 'Caracal (Boss)', hp: 120, maxHp: 120, damage: 25, exp: 100 }
    ];
    
    // Perguntas do combate
    const questions = [
        {
            question: "Qual método é usado para adicionar um elemento ao final de um array em JavaScript?",
            options: ["push()", "pop()", "shift()", "unshift()"],
            correct: 0
        },
        {
            question: "Qual protocolo é mais seguro para transmitir dados na web?",
            options: ["HTTP", "HTTPS", "FTP", "SMTP"],
            correct: 1
        },
        {
            question: "O que significa SQL Injection?",
            options: ["Um tipo de vírus", "Ataque que explora vulnerabilidades em consultas SQL", "Um comando SQL", "Um tipo de criptografia"],
            correct: 1
        },
        {
            question: "Qual função JavaScript converte string para número inteiro?",
            options: ["parseInt()", "parseFloat()", "Number()", "toString()"],
            correct: 0
        },
        {
            question: "O que é um firewall?",
            options: ["Um antivírus", "Sistema de segurança que controla tráfego de rede", "Um tipo de malware", "Um protocolo de rede"],
            correct: 1
        }
    ];
    
    // Puzzles de código
    const puzzles = [
        {
            code: "let x = 5;\nlet y = 3;\nconsole.log(x + y);",
            answer: "8",
            hint: "Some os valores de x e y"
        },
        {
            code: "function decode(str) {\n  return str.split('').reverse().join('');\n}\nconsole.log(decode('olleh'));",
            answer: "hello",
            hint: "A função inverte a string"
        },
        {
            code: "const hash = 'ZTU0MzIx';\n// Base64 decode\nconsole.log(atob(hash));",
            answer: "e54321",
            hint: "Decodifique o Base64"
        }
    ];
    
    // Inicializar mapa
    function generateMap() {
        const map = Array(6).fill().map(() => Array(8).fill(0));
        
        // Adicionar paredes (1)
        for (let i = 0; i < 8; i++) {
            if (Math.random() < 0.2) {
                const x = Math.floor(Math.random() * 8);
                const y = Math.floor(Math.random() * 6);
                if (!(x === 0 && y === 0)) {
                    map[y][x] = 1;
                }
            }
        }
        
        // Adicionar inimigos (2)
        for (let i = 0; i < 5; i++) {
            const x = Math.floor(Math.random() * 8);
            const y = Math.floor(Math.random() * 6);
            if (map[y][x] === 0 && !(x === 0 && y === 0)) {
                map[y][x] = 2;
            }
        }
        
        // Adicionar tesouros (3)
        for (let i = 0; i < 3; i++) {
            const x = Math.floor(Math.random() * 8);
            const y = Math.floor(Math.random() * 6);
            if (map[y][x] === 0 && !(x === 0 && y === 0)) {
                map[y][x] = 3;
            }
        }
        
        // Adicionar saída (4)
        map[5][7] = 4;
        
        return map;
    }
    
    function renderMap() {
        mapGrid.innerHTML = '';
        
        gameState.mapData.forEach((row, y) => {
            row.forEach((cell, x) => {
                const cellElement = document.createElement('div');
                cellElement.className = 'map-cell';
                
                switch (cell) {
                    case 1:
                        cellElement.classList.add('wall');
                        cellElement.innerHTML = '<i class="fas fa-cube"></i>';
                        break;
                    case 2:
                        cellElement.classList.add('enemy');
                        cellElement.innerHTML = '<i class="fas fa-bug"></i>';
                        break;
                    case 3:
                        cellElement.classList.add('treasure');
                        cellElement.innerHTML = '<i class="fas fa-gem"></i>';
                        break;
                    case 4:
                        cellElement.classList.add('exit');
                        cellElement.innerHTML = '<i class="fas fa-door-open"></i>';
                        break;
                }
                
                mapGrid.appendChild(cellElement);
            });
        });
    }
    
    function updatePlayerPosition() {
        const cellWidth = mapGrid.offsetWidth / 8;
        const cellHeight = mapGrid.offsetHeight / 6;
        
        playerChar.style.left = `calc(1rem + ${gameState.player.x * cellWidth}px + 2px)`;
        playerChar.style.top = `calc(1rem + ${gameState.player.y * cellHeight}px + 2px)`;
    }
    
    function updateUI() {
        playerHpElement.textContent = gameState.player.hp;
        playerMpElement.textContent = gameState.player.mp;
        playerLevelElement.textContent = gameState.player.level;
        playerExpElement.textContent = gameState.player.exp;
        
        hpFill.style.width = `${(gameState.player.hp / gameState.player.maxHp) * 100}%`;
        mpFill.style.width = `${(gameState.player.mp / gameState.player.maxMp) * 100}%`;
    }
    
    function logAction(message) {
        const p = document.createElement('p');
        p.textContent = message;
        actionLog.appendChild(p);
        actionLog.scrollTop = actionLog.scrollHeight;
    }
    
    function movePlayer(dx, dy) {
        if (gameState.inBattle) return;
        
        const newX = gameState.player.x + dx;
        const newY = gameState.player.y + dy;
        
        // Verificar limites
        if (newX < 0 || newX >= 8 || newY < 0 || newY >= 6) return;
        
        // Verificar paredes
        if (gameState.mapData[newY][newX] === 1) {
            logAction("Você bateu em uma parede!");
            return;
        }
        
        gameState.player.x = newX;
        gameState.player.y = newY;
        
        // Verificar eventos da célula
        const cellType = gameState.mapData[newY][newX];
        
        switch (cellType) {
            case 2: // Inimigo
                startBattle();
                gameState.mapData[newY][newX] = 0; // Remove inimigo do mapa
                break;
            case 3: // Tesouro
                findTreasure();
                gameState.mapData[newY][newX] = 0; // Remove tesouro do mapa
                break;
            case 4: // Saída
                if (checkWinCondition()) {
                    logAction("Parabéns! Você restaurou o servidor e derrotou Caracal!");
                    // Próxima fase ou fim do jogo
                } else {
                    logAction("Você ainda precisa eliminar mais ameaças antes de sair!");
                }
                break;
        }
        
        updatePlayerPosition();
        renderMap();
    }
    
    function startBattle() {
        gameState.inBattle = true;
        const enemyIndex = Math.min(Math.floor(Math.random() * enemies.length), gameState.currentLevel - 1);
        gameState.currentEnemy = { ...enemies[enemyIndex] };
        
        battleScreen.classList.remove('hidden');
        actionButtons.classList.remove('hidden');
        
        document.getElementById('enemy-name').textContent = gameState.currentEnemy.name;
        updateEnemyUI();
        
        logAction(`Você encontrou ${gameState.currentEnemy.name}!`);
    }
    
    function updateEnemyUI() {
        document.getElementById('enemy-hp').textContent = gameState.currentEnemy.hp;
        const enemyHpFill = document.getElementById('enemy-hp-fill');
        enemyHpFill.style.width = `${(gameState.currentEnemy.hp / gameState.currentEnemy.maxHp) * 100}%`;
    }
    
    function findTreasure() {
        const treasureType = Math.random();
        
        if (treasureType < 0.5) {
            // Poção de HP
            const heal = 20;
            gameState.player.hp = Math.min(gameState.player.maxHp, gameState.player.hp + heal);
            logAction(`Você encontrou uma poção de HP! (+${heal} HP)`);
        } else {
            // Poção de MP
            const mpRestore = 15;
            gameState.player.mp = Math.min(gameState.player.maxMp, gameState.player.mp + mpRestore);
            logAction(`Você encontrou uma poção de MP! (+${mpRestore} MP)`);
        }
        
        updateUI();
    }
    
    function checkWinCondition() {
        // Verificar se todos os inimigos foram derrotados
        for (let row of gameState.mapData) {
            if (row.includes(2)) return false;
        }
        return true;
    }
    
    // Ações de combate
    function playerAttack() {
        const damage = Math.floor(Math.random() * 15) + 10;
        gameState.currentEnemy.hp -= damage;
        
        logAction(`Você atacou ${gameState.currentEnemy.name} e causou ${damage} de dano!`);
        
        if (gameState.currentEnemy.hp <= 0) {
            endBattle(true);
        } else {
            enemyTurn();
        }
        
        updateEnemyUI();
    }
    
    function playerDefend() {
        gameState.player.defending = true;
        logAction("Você se preparou para defender!");
        enemyTurn();
    }
    
    function showSkillMenu() {
        skillMenu.classList.remove('hidden');
        actionButtons.classList.add('hidden');
    }
    
    function useSkill(skillType) {
        let mpCost, message, effect;
        
        switch (skillType) {
            case 'scan':
                mpCost = 5;
                if ( gameState.player.mp >= mpCost) {
                    gameState.player.mp -= mpCost;
                    message = `scanVirus() executado! ${gameState.currentEnemy.name} tem ${gameState.currentEnemy.hp}/${gameState.currentEnemy.maxHp} HP.`;
                } else {
                    message = "MP insuficiente!";
                }
                break;
                
            case 'encrypt':
                mpCost = 10;
                if (gameState.player.mp >= mpCost) {
                    gameState.player.mp -= mpCost;
                    const damage = Math.floor(Math.random() * 25) + 20;
                    gameState.currentEnemy.hp -= damage;
                    message = `encryptAttack() executado! Causou ${damage} de dano crítico!`;
                } else {
                    message = "MP insuficiente!";
                }
                break;
                
            case 'firewall':
                mpCost = 8;
                if (gameState.player.mp >= mpCost) {
                    gameState.player.mp -= mpCost;
                    gameState.player.defending = true;
                    message = "firewallShield() ativado! Defesa aumentada no próximo turno.";
                } else {
                    message = "MP insuficiente!";
                }
                break;
                
            case 'debug':
                mpCost = 15;
                if (gameState.player.mp >= mpCost) {
                    gameState.player.mp -= mpCost;
                    const heal = 30;
                    gameState.player.hp = Math.min(gameState.player.maxHp, gameState.player.hp + heal);
                    message = `debugMode() executado! Restaurou ${heal} HP.`;
                } else {
                    message = "MP insuficiente!";
                }
                break;
        }
        
        logAction(message);
        updateUI();
        updateEnemyUI();
        
        skillMenu.classList.add('hidden');
        actionButtons.classList.remove('hidden');
        
        if (gameState.currentEnemy.hp <= 0) {
            endBattle(true);
        } else if (gameState.player.mp >= mpCost) {
            enemyTurn();
        }
    }
    
    function playerRun() {
        if (Math.random() < 0.7) {
            logAction("Você conseguiu fugir!");
            endBattle(false);
        } else {
            logAction("Não conseguiu fugir!");
            enemyTurn();
        }
    }
    
    function enemyTurn() {
        let damage = gameState.currentEnemy.damage + Math.floor(Math.random() * 5);
        
        if (gameState.player.defending) {
            damage = Math.floor(damage / 2);
            gameState.player.defending = false;
            logAction(`${gameState.currentEnemy.name} atacou, mas você defendeu! Dano reduzido para ${damage}.`);
        } else {
            logAction(`${gameState.currentEnemy.name} atacou você e causou ${damage} de dano!`);
        }
        
        gameState.player.hp -= damage;
        
        if (gameState.player.hp <= 0) {
            gameState.player.hp = 0;
            logAction("Você foi derrotado! Game Over.");
            // Implementar game over
            resetGame();
        }
    }
    
    function endBattle(victory) {
        gameState.inBattle = false;
        battleScreen.classList.add('hidden');
        actionButtons.classList.add('hidden');
        
        if (victory) {
            const expGained = gameState.currentEnemy.exp;
            gameState.player.exp += expGained;
            logAction(`Você derrotou ${gameState.currentEnemy.name}! Ganhou ${expGained} EXP.`);
            
            // Verificar level up
            if (gameState.player.exp >= gameState.player.expToNext) {
                levelUp();
            }
        }
        
        gameState.currentEnemy = null;
        updateUI();
    }
    
    function levelUp() {
        gameState.player.level++;
        gameState.player.exp -= gameState.player.expToNext;
        gameState.player.expToNext += 50;
        
        // Aumentar stats
        gameState.player.maxHp += 20;
        gameState.player.maxMp += 10;
        gameState.player.hp = gameState.player.maxHp;
        gameState.player.mp = gameState.player.maxMp;
        
        logAction(`Level Up! Agora você é nível ${gameState.player.level}!`);
        updateUI();
    }
    
    function initGame() {
        gameState.mapData = generateMap();
        gameState.player.x = 0;
        gameState.player.y = 0;
        gameState.inBattle = false;
        
        renderMap();
        updatePlayerPosition();
        updateUI();
        
        logAction("Bem-vindo ao servidor corrompido! Use as setas para se mover.");
        logAction("Sua missão: eliminar todas as ameaças e restaurar o sistema.");
    }
    
    function resetGame() {
        gameState = {
            player: {
                x: 0,
                y: 0,
                hp: 100,
                maxHp: 100,
                mp: 50,
                maxMp: 50,
                level: 1,
                exp: 0,
                expToNext: 100,
                defending: false
            },
            inBattle: false,
            currentEnemy: null,
            currentLevel: 1,
            mapData: []
        };
        
        battleScreen.classList.add('hidden');
        skillMenu.classList.add('hidden');
        actionButtons.classList.add('hidden');
        
        actionLog.innerHTML = '';
        initGame();
    }
    
    // Event Listeners
    document.addEventListener('keydown', (e) => {
        if (!document.querySelector('.fehuna-game-container') || gameState.inBattle) return;
        
        switch (e.key) {
            case 'ArrowUp':
                e.preventDefault();
                movePlayer(0, -1);
                break;
            case 'ArrowDown':
                e.preventDefault();
                movePlayer(0, 1);
                break;
            case 'ArrowLeft':
                e.preventDefault();
                movePlayer(-1, 0);
                break;
            case 'ArrowRight':
                e.preventDefault();
                movePlayer(1, 0);
                break;
        }
    });
    
    // Botões de ação de combate
    document.getElementById('attack-btn')?.addEventListener('click', playerAttack);
    document.getElementById('defend-btn')?.addEventListener('click', playerDefend);
    document.getElementById('skill-btn')?.addEventListener('click', showSkillMenu);
    document.getElementById('run-btn')?.addEventListener('click', playerRun);
    
    // Botões de skill
    document.querySelectorAll('.skill-option').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const skill = e.target.dataset.skill;
            if (skill) {
                useSkill(skill);
            } else if (e.target.id === 'close-skills') {
                skillMenu.classList.add('hidden');
                actionButtons.classList.remove('hidden');
            }
        });
    });
    
    // Botões de controle do jogo
    startBtn?.addEventListener('click', initGame);
    resetBtn?.addEventListener('click', resetGame);
}

// ============================================
// CYBER WARFARE - EPIC BATTLE ARENA GAME ENGINE
// ============================================

class CyberWarfareGame {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.gameRunning = false;
        this.gameLoopId = null;
        
        // Game state
        this.player = {
            x: 600,
            y: 350,
            width: 30,
            height: 30,
            speed: 5,
            health: 100,
            maxHealth: 100,
            shield: 50,
            maxShield: 50,
            color: '#00ff00',
            bullets: [],
            abilities: {
                scan: { cooldown: 0, maxCooldown: 5000 },
                encrypt: { cooldown: 0, maxCooldown: 8000 },
                firewall: { cooldown: 0, maxCooldown: 12000 },
                debug: { cooldown: 0, maxCooldown: 30000 }
            }
        };
        
        this.enemies = [];
        this.particles = [];
        this.powerUps = [];
        
        this.score = 0;
        this.combo = 0;
        this.comboTimer = 0;
        this.waveNumber = 1;
        this.enemiesKilled = 0;
        this.maxCombo = 0;
        this.gameStartTime = 0;
        
        this.keys = {};
        this.touchControls = {
            moveStick: { active: false, x: 0, y: 0, centerX: 100, centerY: 550 },
            shootButton: { active: false, x: 1100, y: 550, radius: 40 }
        };
        
        this.effects = {
            screenShake: 0,
            slowMotion: false,
            slowMotionDuration: 0
        };
        
        this.sounds = {
            shoot: this.createAudioContext(),
            hit: this.createAudioContext(),
            explosion: this.createAudioContext(),
            powerUp: this.createAudioContext()
        };
        
        this.init();
    }
    
    createAudioContext() {
        // Simple audio feedback usando Web Audio API
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            return {
                context: audioContext,
                play: (frequency = 440, duration = 100, type = 'sine') => {
                    const oscillator = audioContext.createOscillator();
                    const gainNode = audioContext.createGain();
                    
                    oscillator.connect(gainNode);
                    gainNode.connect(audioContext.destination);
                    
                    oscillator.frequency.value = frequency;
                    oscillator.type = type;
                    
                    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);
                    
                    oscillator.start(audioContext.currentTime);
                    oscillator.stop(audioContext.currentTime + duration / 1000);
                }
            };
        } catch (e) {
            return { play: () => {} };
        }
    }
    
    init() {
        this.canvas = document.getElementById('game-canvas');
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.setupEventListeners();
        this.setupTouchControls();
        this.createMatrixBackground();
    }
    
    setupEventListeners() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            
            // Ability hotkeys
            if (e.key.toLowerCase() === 'q') this.useAbility('scan');
            if (e.key.toLowerCase() === 'w') this.useAbility('encrypt');
            if (e.key.toLowerCase() === 'e') this.useAbility('firewall');
            if (e.key.toLowerCase() === 'r') this.useAbility('debug');
            if (e.key === ' ') {
                e.preventDefault();
                this.shoot();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
        
        // Menu button listeners
        document.getElementById('start-campaign')?.addEventListener('click', () => this.startGame());
        document.getElementById('arena-mode')?.addEventListener('click', () => this.startGame('arena'));
        document.getElementById('survival-mode')?.addEventListener('click', () => this.startGame('survival'));
        document.getElementById('play-again')?.addEventListener('click', () => this.restartGame());
        document.getElementById('back-to-menu')?.addEventListener('click', () => this.backToMenu());
    }
    
    setupTouchControls() {
        if (!this.canvas) return;
        
        // Touch events for mobile
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touches = e.changedTouches;
            for (let touch of touches) {
                const rect = this.canvas.getBoundingClientRect();
                const x = touch.clientX - rect.left;
                const y = touch.clientY - rect.top;
                
                // Check if touching movement stick area
                const stickDistance = Math.sqrt(
                    Math.pow(x - this.touchControls.moveStick.centerX, 2) + 
                    Math.pow(y - this.touchControls.moveStick.centerY, 2)
                );
                
                if (stickDistance < 60) {
                    this.touchControls.moveStick.active = true;
                    this.touchControls.moveStick.x = x;
                    this.touchControls.moveStick.y = y;
                }
                
                // Check if touching shoot button
                const shootDistance = Math.sqrt(
                    Math.pow(x - this.touchControls.shootButton.x, 2) + 
                    Math.pow(y - this.touchControls.shootButton.y, 2)
                );
                
                if (shootDistance < this.touchControls.shootButton.radius) {
                    this.touchControls.shootButton.active = true;
                    this.shoot();
                }
            }
        });
        
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (this.touchControls.moveStick.active) {
                const touches = e.changedTouches;
                const rect = this.canvas.getBoundingClientRect();
                const x = touches[0].clientX - rect.left;
                const y = touches[0].clientY - rect.top;
                
                this.touchControls.moveStick.x = x;
                this.touchControls.moveStick.y = y;
            }
        });
        
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.touchControls.moveStick.active = false;
            this.touchControls.shootButton.active = false;
        });
    }
    
    createMatrixBackground() {
        // Create animated matrix background effect
        this.matrixChars = [];
        for (let i = 0; i < 50; i++) {
            this.matrixChars.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                char: String.fromCharCode(0x30A0 + Math.random() * 96),
                speed: Math.random() * 2 + 1,
                opacity: Math.random() * 0.5 + 0.1
            });
        }
    }
    
    startGame(mode = 'campaign') {
        this.gameMode = mode;
        this.resetGameState();
        this.showLoadingScreen();
        
        setTimeout(() => {
            this.hideLoadingScreen();
            this.showGameArena();
            this.gameRunning = true;
            this.gameStartTime = Date.now();
            this.gameLoop();
            this.spawnWave();
        }, 2000);
    }
    
    resetGameState() {
        this.player = {
            x: 600,
            y: 350,
            width: 30,
            height: 30,
            speed: 5,
            health: 100,
            maxHealth: 100,
            shield: 50,
            maxShield: 50,
            color: '#00ff00',
            bullets: [],
            abilities: {
                scan: { cooldown: 0, maxCooldown: 5000 },
                encrypt: { cooldown: 0, maxCooldown: 8000 },
                firewall: { cooldown: 0, maxCooldown: 12000 },
                debug: { cooldown: 0, maxCooldown: 30000 }
            }
        };
        
        this.enemies = [];
        this.particles = [];
        this.powerUps = [];
        this.score = 0;
        this.combo = 0;
        this.comboTimer = 0;
        this.waveNumber = 1;
        this.enemiesKilled = 0;
        this.maxCombo = 0;
        this.effects.screenShake = 0;
    }
    
    showLoadingScreen() {
        document.querySelector('.game-splash-screen .game-main-menu').style.display = 'none';
        document.getElementById('game-loading').classList.remove('hidden');
        
        let progress = 0;
        const loadingInterval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress > 100) progress = 100;
            
            document.getElementById('loading-progress').style.width = progress + '%';
            
            if (progress >= 100) {
                clearInterval(loadingInterval);
            }
        }, 150);
    }
    
    hideLoadingScreen() {
        document.getElementById('game-loading').classList.add('hidden');
    }
    
    showGameArena() {
        document.getElementById('game-arena').classList.remove('hidden');
        this.updateHUD();
    }
    
    gameLoop() {
        if (!this.gameRunning) return;
        
        this.update();
        this.render();
        
        this.gameLoopId = requestAnimationFrame(() => this.gameLoop());
    }
    
    update() {
        this.updatePlayer();
        this.updateBullets();
        this.updateEnemies();
        this.updateParticles();
        this.updatePowerUps();
        this.updateCooldowns();
        this.updateCombo();
        this.checkCollisions();
        this.updateEffects();
        this.updateHUD();
        
        // Spawn new waves
        if (this.enemies.length === 0 && this.gameRunning) {
            this.waveNumber++;
            setTimeout(() => this.spawnWave(), 2000);
        }
    }
    
    updatePlayer() {
        const prevX = this.player.x;
        const prevY = this.player.y;
        
        // Keyboard movement
        if (this.keys['w'] || this.keys['arrowup']) this.player.y -= this.player.speed;
        if (this.keys['s'] || this.keys['arrowdown']) this.player.y += this.player.speed;
        if (this.keys['a'] || this.keys['arrowleft']) this.player.x -= this.player.speed;
        if (this.keys['d'] || this.keys['arrowright']) this.player.x += this.player.speed;
        
        // Touch movement
        if (this.touchControls.moveStick.active) {
            const deltaX = this.touchControls.moveStick.x - this.touchControls.moveStick.centerX;
            const deltaY = this.touchControls.moveStick.y - this.touchControls.moveStick.centerY;
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            
            if (distance > 10) {
                this.player.x += (deltaX / distance) * this.player.speed;
                this.player.y += (deltaY / distance) * this.player.speed;
            }
        }
        
        // Keep player in bounds
        this.player.x = Math.max(this.player.width / 2, Math.min(this.canvas.width - this.player.width / 2, this.player.x));
        this.player.y = Math.max(this.player.height / 2, Math.min(this.canvas.height - this.player.height / 2, this.player.y));
        
        // Create movement trail
        if (prevX !== this.player.x || prevY !== this.player.y) {
            this.particles.push({
                x: prevX,
                y: prevY,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                life: 20,
                maxLife: 20,
                color: '#00ff0050',
                size: 3
            });
        }
    }
    
    updateBullets() {
        this.player.bullets = this.player.bullets.filter(bullet => {
            bullet.x += bullet.vx;
            bullet.y += bullet.vy;
            bullet.life--;
            
            return bullet.life > 0 && 
                   bullet.x > 0 && bullet.x < this.canvas.width &&
                   bullet.y > 0 && bullet.y < this.canvas.height;
        });
    }
    
    updateEnemies() {
        this.enemies.forEach(enemy => {
            // AI behavior
            const dx = this.player.x - enemy.x;
            const dy = this.player.y - enemy.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 50) {
                enemy.x += (dx / distance) * enemy.speed;
                enemy.y += (dy / distance) * enemy.speed;
            }
            
            // Enemy shooting
            enemy.shootCooldown--;
            if (enemy.shootCooldown <= 0 && distance < 300) {
                this.enemyShoot(enemy);
                enemy.shootCooldown = enemy.maxShootCooldown;
            }
            
            // Update enemy bullets
            if (enemy.bullets) {
                enemy.bullets = enemy.bullets.filter(bullet => {
                    bullet.x += bullet.vx;
                    bullet.y += bullet.vy;
                    bullet.life--;
                    
                    return bullet.life > 0 && 
                           bullet.x > 0 && bullet.x < this.canvas.width &&
                           bullet.y > 0 && bullet.y < this.canvas.height;
                });
            }
        });
    }
    
    updateParticles() {
        this.particles = this.particles.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life--;
            particle.vx *= 0.98;
            particle.vy *= 0.98;
            
            return particle.life > 0;
        });
    }
    
    updatePowerUps() {
        this.powerUps = this.powerUps.filter(powerUp => {
            powerUp.life--;
            powerUp.rotation += 0.1;
            
            return powerUp.life > 0;
        });
    }
    
    updateCooldowns() {
        const currentTime = Date.now();
        Object.keys(this.player.abilities).forEach(ability => {
            if (this.player.abilities[ability].cooldown > 0) {
                this.player.abilities[ability].cooldown = Math.max(0, 
                    this.player.abilities[ability].cooldown - 16);
            }
        });
    }
    
    updateCombo() {
        if (this.comboTimer > 0) {
            this.comboTimer -= 16;
            if (this.comboTimer <= 0) {
                this.combo = 0;
            }
        }
    }
    
    updateEffects() {
        if (this.effects.screenShake > 0) {
            this.effects.screenShake -= 2;
        }
        
        if (this.effects.slowMotionDuration > 0) {
            this.effects.slowMotionDuration -= 16;
            if (this.effects.slowMotionDuration <= 0) {
                this.effects.slowMotion = false;
            }
        }
    }
    
    checkCollisions() {
        // Player bullets vs enemies
        this.player.bullets.forEach((bullet, bulletIndex) => {
            this.enemies.forEach((enemy, enemyIndex) => {
                if (this.isColliding(bullet, enemy)) {
                    this.createExplosion(enemy.x, enemy.y);
                    this.enemyHit(enemy, bulletIndex, enemyIndex);
                }
            });
        });
        
        // Enemy bullets vs player
        this.enemies.forEach(enemy => {
            if (enemy.bullets) {
                enemy.bullets.forEach((bullet, bulletIndex) => {
                    if (this.isColliding(bullet, this.player)) {
                        this.playerHit(bullet.damage || 10);
                        enemy.bullets.splice(bulletIndex, 1);
                    }
                });
            }
        });
        
        // Player vs enemies (collision damage)
        this.enemies.forEach(enemy => {
            if (this.isColliding(this.player, enemy)) {
                this.playerHit(5);
                this.effects.screenShake = 10;
            }
        });
        
        // Player vs power-ups
        this.powerUps.forEach((powerUp, index) => {
            if (this.isColliding(this.player, powerUp)) {
                this.collectPowerUp(powerUp);
                this.powerUps.splice(index, 1);
            }
        });
    }
    
    isColliding(obj1, obj2) {
        const dx = obj1.x - obj2.x;
        const dy = obj1.y - obj2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const minDistance = (obj1.size || obj1.width || 10) / 2 + (obj2.size || obj2.width || 10) / 2;
        
        return distance < minDistance;
    }
    
    shoot() {
        if (!this.gameRunning) return;
        
        this.player.bullets.push({
            x: this.player.x,
            y: this.player.y,
            vx: 0,
            vy: -8,
            life: 60,
            damage: 25,
            size: 5,
            color: '#00ffff'
        });
        
        this.sounds.shoot.play(800, 100, 'square');
        
        // Add muzzle flash effect
        for (let i = 0; i < 5; i++) {
            this.particles.push({
                x: this.player.x,
                y: this.player.y - 20,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4 - 2,
                life: 10,
                maxLife: 10,
                color: '#ffff00',
                size: 3
            });
        }
    }
    
    enemyShoot(enemy) {
        if (!enemy.bullets) enemy.bullets = [];
        
        const dx = this.player.x - enemy.x;
        const dy = this.player.y - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        enemy.bullets.push({
            x: enemy.x,
            y: enemy.y,
            vx: (dx / distance) * 4,
            vy: (dy / distance) * 4,
            life: 120,
            damage: 15,
            size: 4,
            color: '#ff4444'
        });
    }
    
    enemyHit(enemy, bulletIndex, enemyIndex) {
        enemy.health -= this.player.bullets[bulletIndex].damage;
        this.player.bullets.splice(bulletIndex, 1);
        
        this.sounds.hit.play(600, 150, 'sawtooth');
        
        if (enemy.health <= 0) {
            this.enemyDestroyed(enemy, enemyIndex);
        }
    }
    
    enemyDestroyed(enemy, enemyIndex) {
        this.score += enemy.scoreValue || 100;
        this.combo++;
        this.comboTimer = 3000;
        this.enemiesKilled++;
        this.maxCombo = Math.max(this.maxCombo, this.combo);
        
        this.createExplosion(enemy.x, enemy.y, true);
        this.sounds.explosion.play(200, 300, 'sawtooth');
        
        // Chance to drop power-up
        if (Math.random() < 0.3) {
            this.spawnPowerUp(enemy.x, enemy.y);
        }
        
        this.enemies.splice(enemyIndex, 1);
        this.effects.screenShake = 5;
    }
    
    playerHit(damage) {
        if (this.player.shield > 0) {
            this.player.shield = Math.max(0, this.player.shield - damage);
        } else {
            this.player.health = Math.max(0, this.player.health - damage);
        }
        
        if (this.player.health <= 0) {
            this.gameOver();
        }
    }
    
    createExplosion(x, y, large = false) {
        const particleCount = large ? 20 : 10;
        const colors = ['#ff4444', '#ffaa00', '#ffff00', '#ffffff'];
        
        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * (large ? 8 : 4),
                vy: (Math.random() - 0.5) * (large ? 8 : 4),
                life: large ? 30 : 20,
                maxLife: large ? 30 : 20,
                color: colors[Math.floor(Math.random() * colors.length)],
                size: large ? 6 : 4
            });
        }
    }
    
    spawnWave() {
        const enemyCount = Math.min(3 + this.waveNumber, 12);
        
        for (let i = 0; i < enemyCount; i++) {
            setTimeout(() => {
                this.spawnEnemy();
            }, i * 500);
        }
    }
    
    spawnEnemy() {
        const side = Math.floor(Math.random() * 4);
        let x, y;
        
        switch (side) {
            case 0: // Top
                x = Math.random() * this.canvas.width;
                y = -20;
                break;
            case 1: // Right
                x = this.canvas.width + 20;
                y = Math.random() * this.canvas.height;
                break;
            case 2: // Bottom
                x = Math.random() * this.canvas.width;
                y = this.canvas.height + 20;
                break;
            case 3: // Left
                x = -20;
                y = Math.random() * this.canvas.height;
                break;
        }
        
        const enemyTypes = [
            { type: 'basic', health: 50, speed: 1.5, color: '#ff4444', scoreValue: 100 },
            { type: 'fast', health: 30, speed: 3, color: '#44ff44', scoreValue: 150 },
            { type: 'tank', health: 100, speed: 0.8, color: '#4444ff', scoreValue: 200 }
        ];
        
        const enemyType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
        
        this.enemies.push({
            x: x,
            y: y,
            width: 25,
            height: 25,
            health: enemyType.health + (this.waveNumber * 10),
            maxHealth: enemyType.health + (this.waveNumber * 10),
            speed: enemyType.speed,
            color: enemyType.color,
            scoreValue: enemyType.scoreValue,
            shootCooldown: 0,
            maxShootCooldown: 60 + Math.random() * 60,
            bullets: []
        });
    }
    
    spawnPowerUp(x, y) {
        const powerUpTypes = [
            { type: 'health', color: '#44ff44', effect: 'heal' },
            { type: 'shield', color: '#4444ff', effect: 'shield' },
            { type: 'damage', color: '#ffaa00', effect: 'damage' },
            { type: 'speed', color: '#ff44ff', effect: 'speed' }
        ];
        
        const powerUp = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
        
        this.powerUps.push({
            x: x,
            y: y,
            size: 15,
            color: powerUp.color,
            effect: powerUp.effect,
            life: 600,
            rotation: 0
        });
    }
    
    collectPowerUp(powerUp) {
        this.sounds.powerUp.play(1000, 200, 'sine');
        
        switch (powerUp.effect) {
            case 'heal':
                this.player.health = Math.min(this.player.maxHealth, this.player.health + 30);
                break;
            case 'shield':
                this.player.shield = Math.min(this.player.maxShield, this.player.shield + 25);
                break;
            case 'damage':
                // Temporary damage boost
                break;
            case 'speed':
                // Temporary speed boost
                break;
        }
    }
    
    useAbility(abilityName) {
        const ability = this.player.abilities[abilityName];
        if (ability.cooldown > 0) return;
        
        ability.cooldown = ability.maxCooldown;
        
        switch (abilityName) {
            case 'scan':
                this.abilityScreen();
                break;
            case 'encrypt':
                this.abilityEncrypt();
                break;
            case 'firewall':
                this.abilityFirewall();
                break;
            case 'debug':
                this.abilityDebug();
                break;
        }
    }
    
    abilityScreen() {
        // Show all enemies for 3 seconds
        this.enemies.forEach(enemy => {
            enemy.highlighted = true;
            setTimeout(() => enemy.highlighted = false, 3000);
        });
    }
    
    abilityEncrypt() {
        // Stun closest enemy
        let closestEnemy = null;
        let closestDistance = Infinity;
        
        this.enemies.forEach(enemy => {
            const distance = Math.sqrt(
                Math.pow(enemy.x - this.player.x, 2) + 
                Math.pow(enemy.y - this.player.y, 2)
            );
            if (distance < closestDistance) {
                closestDistance = distance;
                closestEnemy = enemy;
            }
        });
        
        if (closestEnemy) {
            closestEnemy.stunned = true;
            closestEnemy.speed *= 0.1;
            setTimeout(() => {
                closestEnemy.stunned = false;
                closestEnemy.speed *= 10;
            }, 2000);
        }
    }
    
    abilityFirewall() {
        // Temporary invincibility
        this.player.invincible = true;
        setTimeout(() => this.player.invincible = false, 3000);
    }
    
    abilityDebug() {
        // Screen clear
        this.effects.slowMotion = true;
        this.effects.slowMotionDuration = 2000;
        
        this.enemies.forEach((enemy, index) => {
            setTimeout(() => {
                this.createExplosion(enemy.x, enemy.y, true);
                this.score += enemy.scoreValue || 100;
            }, index * 100);
        });
        
        this.enemies = [];
    }
    
    gameOver() {
        this.gameRunning = false;
        if (this.gameLoopId) {
            cancelAnimationFrame(this.gameLoopId);
        }
        
        this.showGameOverScreen();
    }
    
    showGameOverScreen() {
        const gameOverScreen = document.getElementById('game-over');
        gameOverScreen.classList.remove('hidden');
        
        // Update final stats
        document.getElementById('final-score').textContent = this.score.toLocaleString();
        document.getElementById('enemies-killed').textContent = this.enemiesKilled;
        document.getElementById('max-combo').textContent = this.maxCombo + 'x';
        
        const survivalTime = Math.floor((Date.now() - this.gameStartTime) / 1000);
        document.getElementById('survival-time').textContent = survivalTime + 's';
        
        // Determine rank
        let rank = 'BRONZE';
        let rankIcon = 'fas fa-medal';
        
        if (this.score > 5000) {
            rank = 'PRATA';
            rankIcon = 'fas fa-trophy';
        }
        if (this.score > 10000) {
            rank = 'OURO';
            rankIcon = 'fas fa-crown';
        }
        if (this.score > 20000) {
            rank = 'PLATINA';
            rankIcon = 'fas fa-gem';
        }
        
        document.getElementById('rank-text').textContent = rank;
        document.getElementById('rank-icon').className = rankIcon;
    }
    
    restartGame() {
        document.getElementById('game-over').classList.add('hidden');
        this.startGame(this.gameMode);
    }
    
    backToMenu() {
        document.getElementById('game-over').classList.add('hidden');
        document.getElementById('game-arena').classList.add('hidden');
        document.querySelector('.game-splash-screen .game-main-menu').style.display = 'block';
        
        this.gameRunning = false;
        if (this.gameLoopId) {
            cancelAnimationFrame(this.gameLoopId);
        }
    }
    
    updateHUD() {
        // Update health bar
        const healthPercentage = (this.player.health / this.player.maxHealth) * 100;
        document.getElementById('player-health').style.width = healthPercentage + '%';
        document.getElementById('health-value').textContent = this.player.health;
        
        // Update shield bar
        const shieldPercentage = (this.player.shield / this.player.maxShield) * 100;
        document.getElementById('player-shield').style.width = shieldPercentage + '%';
        document.getElementById('shield-value').textContent = this.player.shield;
        
        // Update score and combo
        document.getElementById('current-score').textContent = this.score.toLocaleString();
        document.getElementById('combo-counter').textContent = this.combo + 'x';
        
        // Update ability cooldowns
        Object.keys(this.player.abilities).forEach(abilityName => {
            const ability = this.player.abilities[abilityName];
            const cooldownElement = document.getElementById(abilityName + '-cooldown');
            if (cooldownElement) {
                if (ability.cooldown > 0) {
                    const percentage = (ability.cooldown / ability.maxCooldown) * 100;
                    cooldownElement.style.background = `conic-gradient(#ff4444 ${percentage}%, transparent ${percentage}%)`;
                    cooldownElement.style.opacity = '0.8';
                } else {
                    cooldownElement.style.opacity = '0';
                }
            }
        });
    }
    
    render() {
        // Clear canvas
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Apply screen shake
        if (this.effects.screenShake > 0) {
            this.ctx.save();
            this.ctx.translate(
                (Math.random() - 0.5) * this.effects.screenShake,
                (Math.random() - 0.5) * this.effects.screenShake
            );
        }
        
        // Render matrix background
        this.renderMatrix();
        
        // Render game objects
        this.renderParticles();
        this.renderPlayer();
        this.renderEnemies();
        this.renderBullets();
        this.renderPowerUps();
        this.renderTouchControls();
        
        // Restore context if screen shake was applied
        if (this.effects.screenShake > 0) {
            this.ctx.restore();
        }
    }
    
    renderMatrix() {
        this.ctx.font = '12px monospace';
        this.matrixChars.forEach(char => {
            this.ctx.fillStyle = `rgba(0, 255, 0, ${char.opacity})`;
            this.ctx.fillText(char.char, char.x, char.y);
            
            char.y += char.speed;
            if (char.y > this.canvas.height) {
                char.y = -20;
                char.x = Math.random() * this.canvas.width;
            }
        });
    }
    
    renderPlayer() {
        this.ctx.fillStyle = this.player.color;
        if (this.player.invincible) {
            this.ctx.fillStyle = `rgba(0, 255, 0, ${0.5 + 0.5 * Math.sin(Date.now() / 100)})`;
        }
        
        this.ctx.fillRect(
            this.player.x - this.player.width / 2,
            this.player.y - this.player.height / 2,
            this.player.width,
            this.player.height
        );
        
        // Player glow effect
        this.ctx.shadowColor = this.player.color;
        this.ctx.shadowBlur = 10;
        this.ctx.fillRect(
            this.player.x - this.player.width / 2,
            this.player.y - this.player.height / 2,
            this.player.width,
            this.player.height
        );
        this.ctx.shadowBlur = 0;
    }
    
    renderEnemies() {
        this.enemies.forEach(enemy => {
            this.ctx.fillStyle = enemy.color;
            if (enemy.highlighted) {
                this.ctx.fillStyle = '#ffff00';
            }
            if (enemy.stunned) {
                this.ctx.fillStyle = '#8888ff';
            }
            
            this.ctx.fillRect(
                enemy.x - enemy.width / 2,
                enemy.y - enemy.height / 2,
                enemy.width,
                enemy.height
            );
            
            // Health bar
            const healthPercentage = enemy.health / enemy.maxHealth;
            this.ctx.fillStyle = '#ff0000';
            this.ctx.fillRect(enemy.x - 15, enemy.y - 20, 30, 4);
            this.ctx.fillStyle = '#00ff00';
            this.ctx.fillRect(enemy.x - 15, enemy.y - 20, 30 * healthPercentage, 4);
        });
    }
    
    renderBullets() {
        // Player bullets
        this.player.bullets.forEach(bullet => {
            this.ctx.fillStyle = bullet.color;
            this.ctx.fillRect(
                bullet.x - bullet.size / 2,
                bullet.y - bullet.size / 2,
                bullet.size,
                bullet.size
            );
        });
        
        // Enemy bullets
        this.enemies.forEach(enemy => {
            if (enemy.bullets) {
                enemy.bullets.forEach(bullet => {
                    this.ctx.fillStyle = bullet.color;
                    this.ctx.fillRect(
                        bullet.x - bullet.size / 2,
                        bullet.y - bullet.size / 2,
                        bullet.size,
                        bullet.size
                    );
                });
            }
        });
    }
    
    renderParticles() {
        this.particles.forEach(particle => {
            const alpha = particle.life / particle.maxLife;
            this.ctx.fillStyle = particle.color.replace(')', `, ${alpha})`).replace('rgb', 'rgba');
            
            this.ctx.fillRect(
                particle.x - particle.size / 2,
                particle.y - particle.size / 2,
                particle.size,
                particle.size
            );
        });
    }
    
    renderPowerUps() {
        this.powerUps.forEach(powerUp => {
            this.ctx.save();
            this.ctx.translate(powerUp.x, powerUp.y);
            this.ctx.rotate(powerUp.rotation);
            
            this.ctx.fillStyle = powerUp.color;
            this.ctx.fillRect(-powerUp.size / 2, -powerUp.size / 2, powerUp.size, powerUp.size);
            
            this.ctx.restore();
        });
    }
    
    renderTouchControls() {
        if (window.innerWidth <= 768) {
            // Movement stick
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.arc(this.touchControls.moveStick.centerX, this.touchControls.moveStick.centerY, 50, 0, 2 * Math.PI);
            this.ctx.stroke();
            
            if (this.touchControls.moveStick.active) {
                this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                this.ctx.beginPath();
                this.ctx.arc(this.touchControls.moveStick.x, this.touchControls.moveStick.y, 15, 0, 2 * Math.PI);
                this.ctx.fill();
            }
            
            // Shoot button
            this.ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)';
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.arc(this.touchControls.shootButton.x, this.touchControls.shootButton.y, this.touchControls.shootButton.radius, 0, 2 * Math.PI);
            this.ctx.stroke();
            
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            this.ctx.font = '20px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('🔥', this.touchControls.shootButton.x, this.touchControls.shootButton.y + 7);
        }
    }
}

// Initialize Cyber Warfare Game
let cyberWarfareGame;

document.addEventListener('DOMContentLoaded', () => {
    // Initialize game after a short delay to ensure DOM is fully loaded
    setTimeout(() => {
        cyberWarfareGame = new CyberWarfareGame();
    }, 100);
});
