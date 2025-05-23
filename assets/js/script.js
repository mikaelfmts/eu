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

// Aguardar o DOM estar carregado antes de exportar as funções
document.addEventListener('DOMContentLoaded', () => {
    // Exportar funções para acesso global
    window.toggleMenu = toggleMenu;
    window.toggleChat = toggleChat;
    window.setUserName = setUserName;
    window.sendMessage = sendMessage;
    window.toggleTheme = toggleTheme;
    
    console.log('Funções globais exportadas com sucesso!');
});

// Também exportar imediatamente para casos onde o DOM já está carregado
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
    console.log('setUserName chamada');
    
    const nameInput = document.getElementById('name-input');
    if (!nameInput) {
        console.error('Element name-input não encontrado');
        return;
    }
    
    const name = nameInput.value.trim();
    console.log('Nome digitado:', name);
    
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
    
    console.log('currentUserName:', currentUserName);
    console.log('currentChatId:', currentChatId);
    
    // Esconder formulário de nome e mostrar chat
    const nameForm = document.getElementById('name-form');
    const chatArea = document.getElementById('chat-area');
    
    if (nameForm && chatArea) {
        nameForm.style.display = 'none';
        chatArea.style.display = 'block';
        console.log('Formulário de nome escondido, área de chat mostrada');
    } else {
        console.error('Elementos name-form ou chat-area não encontrados');
    }
    
    // Atualizar header do chat
    const chatHeader = document.getElementById('chat-header');
    if (chatHeader) {
        chatHeader.innerHTML = `🤖 Chat - ${currentUserName}`;
        console.log('Header do chat atualizado');
    }
    
    // Limpar mensagens existentes antes de carregar
    const chatMessages = document.getElementById('chat-messages');
    if (chatMessages) {
        chatMessages.innerHTML = '';
        console.log('Chat messages limpo');
    }
    
    // Mostrar mensagem de boas-vindas
    addSystemMessage(`Olá ${currentUserName}! Sua mensagem será enviada para Mikael, que responderá assim que possível. Como posso ajudar você hoje?`);
    
    // Carregar mensagens anteriores
    console.log('Tentando carregar mensagens do chat...');
    loadChatMessages();
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
    console.log('loadChatMessages chamada');
    console.log('db:', db);
    console.log('currentChatId:', currentChatId);
    
    if (!db || !currentChatId) {
        console.log('Firebase ou chat_id não disponível');
        addSystemMessage('Conectando ao sistema de mensagens...', 'info');
        return;
    }
    
    const chatMessages = document.getElementById('chat-messages');
    if (!chatMessages) {
        console.error('Elemento chat-messages não encontrado');
        return;
    }
    
    // Limpar listener anterior se existir
    if (messagesListener) {
        console.log('Limpando listener anterior');
        messagesListener();
        messagesListener = null;
    }
    
    try {
        console.log('Tentando criar query para o Firestore...');
        const messagesRef = collection(db, 'mensagens');
        const q = query(
            messagesRef,
            where('chat_id', '==', currentChatId),
            orderBy('hora', 'asc')
        );
        
        console.log('Query criada, configurando listener...');
        
        // Escutar mudanças em tempo real
        messagesListener = onSnapshot(q, 
            (snapshot) => {
                console.log('Snapshot recebido! Tamanho:', snapshot.size);
                
                if (snapshot.empty) {
                    console.log('Nenhuma mensagem encontrada para este chat');
                    addSystemMessage('Nenhuma conversa anterior encontrada. Esta é uma nova conversa!', 'info');
                    return;
                }
                
                // Limpar mensagens existentes (exceto do sistema)
                const existingMessages = chatMessages.querySelectorAll('[data-message-id]');
                console.log('Limpando', existingMessages.length, 'mensagens existentes');
                existingMessages.forEach(msg => msg.remove());
                
                // Processar todas as mensagens
                let messageCount = 0;
                snapshot.forEach((doc) => {
                    const data = doc.data();
                    const id = doc.id;
                    
                    console.log('Processando mensagem', messageCount + 1, ':', id, data);
                    displayMessage(data, id);
                    messageCount++;
                });
                
                console.log('Total de mensagens processadas:', messageCount);
                
                // Rolar para o final
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }, 
            (error) => {
                console.error('Erro no listener de mensagens:', error);
                addSystemMessage('Erro ao carregar mensagens. Tentando reconectar...', 'error');
                
                // Tentar reconectar após erro
                setTimeout(() => {
                    if (currentUserName && currentChatId) {
                        console.log('Tentando reconectar...');
                        loadChatMessages();
                    }
                }, 3000);
            }
        );
        
        console.log('Listener configurado com sucesso!');
        
    } catch (error) {
        console.error('Erro ao configurar listener:', error);
        addSystemMessage('Erro ao conectar com o servidor de mensagens.', 'error');
    }
}

// Função para tentar reconectar silenciosamente ao chat
function tryReconnectSilently() {
    // Limpar listener atual se existir
    if (messagesListener) {
        messagesListener();
        messagesListener = null;
    }
    
    // Reconectar sem mostrar mais erros
    try {
        const retryQuery = query(
            collection(db, 'mensagens'),
            where('chat_id', '==', currentChatId),
            orderBy('hora', 'asc')
        );
        
        messagesListener = onSnapshot(retryQuery, (snapshot) => {
            // Processar mensagens silenciosamente
            snapshot.docChanges().forEach((change) => {
                if (change.type === "added" || change.type === "modified") {
                    const data = change.doc.data();
                    const id = change.doc.id;
                    
                    // Verificar se é uma modificação com resposta
                    const existingMsg = document.querySelector(`[data-message-id="${id}"]`);
                    const hasExistingResponse = existingMsg && existingMsg.querySelector('.admin-response');
                    
                    // Remove elemento existente se for modificação
                    if (existingMsg) {
                        existingMsg.remove();
                    }
                    
                    // Exibe a mensagem
                    displayMessage(data, id);
                    
                    // Verificar se temos uma nova resposta
                    if (change.type === "modified" && data.resposta && !hasExistingResponse) {
                        addSystemMessage(`Nova resposta recebida de Mikael!`, 'success');
                    }
                }
            });
            
            // Se reconexão for bem-sucedida e tinha erro, notificar
            const existingErrorMsg = Array.from(document.querySelectorAll('.system-message.error')).find(
                msg => msg.textContent.includes('Erro ao carregar mensagens')
            );
            
            if (existingErrorMsg) {
                existingErrorMsg.remove();
                addSystemMessage('Conexão estabelecida com sucesso!', 'success');
            }
        }, (error) => {
            // Erro silencioso na reconexão, tentar novamente depois
            console.log('Tentativa de reconexão falhou, tentando novamente depois...', error);
            
            // Tentar novamente após um intervalo maior
            setTimeout(tryReconnectSilently, 5000);
        });
    } catch (e) {
        console.error('Erro na reconexão:', e);
    }
}

// Função para exibir mensagem na interface
function displayMessage(messageData, messageId) {
    const chatMessages = document.getElementById('chat-messages');
    if (!chatMessages) return;
    
    // Verificar se a mensagem já existe para atualizar
    const existingMsg = document.querySelector(`[data-message-id="${messageId}"]`);
    let wasUpdated = false;
    
    // Se existir uma mensagem e ela está sendo atualizada com uma resposta
    if (existingMsg && messageData.resposta && !existingMsg.querySelector('.admin-response')) {
        wasUpdated = true;
    }
    
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
    
    // Se tiver uma resposta, adicionar hora da resposta
    let horaResposta = '';
    if (messageData.horaResposta) {
        if (typeof messageData.horaResposta.toDate === 'function') {
            horaResposta = messageData.horaResposta.toDate().toLocaleTimeString();
        } else if (messageData.horaResposta instanceof Date) {
            horaResposta = messageData.horaResposta.toLocaleTimeString();
        } else {
            // Fallback se for outro tipo de timestamp
            horaResposta = new Date().toLocaleTimeString();
        }
    }
    
    // Remover a mensagem existente se ela foi atualizada
    if (existingMsg) {
        existingMsg.remove();
    }
    
    // Criar novo elemento para a mensagem
    const messageDiv = document.createElement('div');
    messageDiv.className = `message user-message ${messageData.respondido ? 'responded' : ''}`;
    messageDiv.dataset.messageId = messageId;
    
    // Converter possíveis URLs em links clicáveis na mensagem do usuário
    const formattedUserMessage = messageData.mensagem.replace(
        /(https?:\/\/[^\s]+)/g, 
        '<a href="$1" target="_blank" class="text-blue-500 underline">$1</a>'
    );
    
    // Converter possíveis URLs em links clicáveis na resposta do admin
    const formattedAdminResponse = messageData.resposta ? messageData.resposta.replace(
        /(https?:\/\/[^\s]+)/g, 
        '<a href="$1" target="_blank" class="text-blue-500 underline">$1</a>'
    ) : '';
    
    messageDiv.innerHTML = `
        <div class="message-content">
            <strong>Você:</strong> ${formattedUserMessage}
        </div>
        <div class="message-time">${hora}</div>
        ${messageData.resposta ? `
            <div class="admin-response ${wasUpdated ? 'new-response' : ''}">
                <strong>Mikael:</strong> ${formattedAdminResponse}
                ${horaResposta ? `<div class="message-time">${horaResposta}</div>` : ''}
            </div>
        ` : ''}
    `;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Se for uma atualização com nova resposta, aplicar efeito de destaque
    if (wasUpdated) {
        const adminResponse = messageDiv.querySelector('.admin-response');
        if (adminResponse) {
            adminResponse.classList.add('highlight-response');
            setTimeout(() => {
                adminResponse.classList.remove('highlight-response');
            }, 3000);
        }
    }
}

// Função para enviar mensagem
async function sendMessage() {
    if (!currentUserName) {
        alert('Por favor, defina seu nome primeiro!');
        return;
    }
    
    const inputField = document.getElementById('chat-input');
    const sendButton = document.querySelector('#chat-input-area button');
    const message = inputField.value.trim();
    
    if (!message) return;
    
    if (!db) {
        addSystemMessage('Erro: Firebase não está conectado. Tente recarregar a página.', 'error');
        return;
    }
    
    // Desabilitar input e botão enquanto envia para evitar duplicação
    inputField.disabled = true;
    if (sendButton) {
        sendButton.disabled = true;
        sendButton.innerHTML = `<i class="fas fa-spinner fa-spin"></i>`;
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
        
        // ID temporário para a mensagem
        const tempId = 'temp-' + Date.now();
        
        // Exibir a mensagem com indicador de "enviando"
        const chatMessages = document.getElementById('chat-messages');
        if (chatMessages) {
            const messageDiv = document.createElement('div');
            messageDiv.className = 'message user-message sending';
            messageDiv.dataset.messageId = tempId;
            
            // Converter possíveis URLs em links clicáveis
            const formattedMessage = message.replace(
                /(https?:\/\/[^\s]+)/g, 
                '<a href="$1" target="_blank" class="text-blue-500 underline">$1</a>'
            );
            
            messageDiv.innerHTML = `
                <div class="message-content">
                    <strong>Você:</strong> ${formattedMessage}
                </div>
                <div class="message-status">
                    <span class="sending-indicator">Enviando <i class="fas fa-spinner fa-spin"></i></span>
                </div>
                <div class="message-time">${new Date().toLocaleTimeString()}</div>
            `;
            
            chatMessages.appendChild(messageDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
        
        // Limpar input antes de salvar para feedback imediato
        inputField.value = '';
        
        // Salvar mensagem no Firestore
        const docRef = await addDoc(collection(db, 'mensagens'), previewMsg);
        
        console.log('Mensagem enviada com sucesso!');
        
        // Remover a mensagem temporária (ela será substituída pela versão do Firebase)
        const tempMsg = document.querySelector(`[data-message-id="${tempId}"]`);
        if (tempMsg) {
            tempMsg.remove();
        }
        
    } catch (error) {
        console.error('Erro ao enviar mensagem:', error);
        addSystemMessage('Erro ao enviar mensagem. Tente novamente.', 'error');
        
        // Remover a mensagem com erro
        const tempMsgWithError = document.querySelector('[data-message-id^="temp-"]');
        if (tempMsgWithError) {
            tempMsgWithError.remove();
        }
    } finally {
        // Re-habilitar input e botão
        inputField.disabled = false;
        inputField.focus();
        if (sendButton) {
            sendButton.disabled = false;
            sendButton.innerHTML = 'Enviar';
        }
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
        
        // Recarregar mensagens quando reconectar
        if (messagesListener) {
            messagesListener();
            messagesListener = null;
        }
        
        setTimeout(() => {
            loadChatMessages();
        }, 1000); // Aguardar 1 segundo para a conexão estabilizar
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
    
    // Alternar visibilidade
    chatBody.style.display = isVisible ? "none" : "block";
    
    // Atualizar cabeçalho para mostrar estado atual
    const chatHeader = document.getElementById('chat-header');
    if (chatHeader) {
        if (isVisible) {
            // Chat está fechando
            chatHeader.innerHTML = '🤖 Talk with me!';
        } else if (currentUserName) {
            // Chat está abrindo com usuário já definido
            chatHeader.innerHTML = `🤖 Chat - ${currentUserName}`;
        }
    }
    
    // Se está fechando o chat, podemos desconectar o listener para economizar recursos
    if (isVisible && messagesListener) {
        console.log('Fechando chat - desconectando listener');
        messagesListener();
        messagesListener = null;
    }
    
    // Se o chat estiver abrindo e não tivermos um usuário ainda, focar no campo de nome
    if (!isVisible && !currentUserName) {
        setTimeout(() => {
            const nameInput = document.getElementById('name-input');
            if (nameInput) {
                nameInput.focus();
                
                // Adicionar dica para o usuário
                const chatMessages = document.getElementById('chat-messages');
                if (chatMessages && chatMessages.innerHTML === '') {
                    addSystemMessage('Digite seu nome para iniciar o chat.', 'info');
                }
            }
        }, 100);
    }
    
    // Se o chat estiver abrindo e já tivermos um usuário, focar no campo de mensagem e recarregar mensagens
    if (!isVisible && currentUserName) {
        // Parar o listener atual se existir para evitar duplicação de mensagens
        if (messagesListener) {
            messagesListener();
            messagesListener = null;
        }
        
        // Adicionar um indicador visual de que estamos recarregando
        const chatMessages = document.getElementById('chat-messages');
        if (chatMessages) {
            // Verificar se já existe um indicador de carregamento para não duplicar
            if (!document.getElementById('loading-messages')) {
                addSystemMessage('Recarregando mensagens...', 'info');
            }
        }
        
        // Recarregar mensagens para garantir que temos as atualizações mais recentes
        setTimeout(() => {
            loadChatMessages();
            
            const chatInput = document.getElementById('chat-input');
            if (chatInput) chatInput.focus();
        }, 300);
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
            { label: 'tan', op: 'pi' },
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
