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

console.log('Firebase Admin carregado com sucesso!');

// ==================== EXPORTAR FUNÇÕES PARA USO GLOBAL ====================
// Como estamos usando módulos ES6, precisamos exportar explicitamente as funções
window.showSection = showSection;
window.refreshChats = refreshChats;
window.selectChat = selectChat;
window.openResponseModal = openResponseModal;
window.closeResponseModal = closeResponseModal;
window.sendResponse = sendResponse;

// ==================== ADMIN PANEL JAVASCRIPT ====================

// Variáveis globais
let currentChatId = null;
let currentMessageId = null;
let chatsData = {};
let messagesListener = null;

// Aguardar carregamento completo
window.addEventListener('load', function() {
    console.log('Admin panel carregado, iniciando...');
    loadChats();
});

// ==================== NAVEGAÇÃO ====================

function showSection(sectionName) {
    // Esconder todas as seções
    document.querySelectorAll('.section').forEach(section => {
        section.classList.add('hidden');
    });
    
    // Mostrar seção selecionada
    document.getElementById(`section-${sectionName}`).classList.remove('hidden');
    
    // Atualizar tabs
    document.querySelectorAll('.tab-button').forEach(tab => {
        tab.classList.remove('active', 'bg-blue-500', 'text-white');
        tab.classList.add('bg-gray-300', 'text-gray-700');
    });
    
    document.getElementById(`tab-${sectionName}`).classList.add('active', 'bg-blue-500', 'text-white');
    document.getElementById(`tab-${sectionName}`).classList.remove('bg-gray-300', 'text-gray-700');
}

// ==================== GESTÃO DE CHATS ====================

async function loadChats() {
    try {
        const messagesRef = collection(db, 'mensagens');
        const q = query(messagesRef, orderBy('hora', 'desc'));
        
        onSnapshot(q, (snapshot) => {
            const chatsMap = new Map();
            
            snapshot.forEach((doc) => {
                const data = doc.data();
                const chatId = data.chat_id;
                
                if (!chatsMap.has(chatId)) {
                    chatsMap.set(chatId, {
                        chatId: chatId,
                        nome: data.nome,
                        ultimaMensagem: data.mensagem,
                        ultimaHora: data.hora,
                        mensagensNaoRespondidas: 0,
                        totalMensagens: 0
                    });
                }
                
                const chat = chatsMap.get(chatId);
                chat.totalMensagens++;
                
                if (!data.respondido) {
                    chat.mensagensNaoRespondidas++;
                }
                
                // Atualizar com a mensagem mais recente
                if (!chat.ultimaHora || data.hora > chat.ultimaHora) {
                    chat.ultimaMensagem = data.mensagem;
                    chat.ultimaHora = data.hora;
                }
            });
            
            chatsData = Object.fromEntries(chatsMap);
            displayChats(Array.from(chatsMap.values()));
        });
        
    } catch (error) {
        console.error('Erro ao carregar chats:', error);
        showError('Erro ao carregar chats');
    }
}

function displayChats(chats) {
    const chatsList = document.getElementById('chats-list');
    const loadingChats = document.getElementById('loading-chats');
    const noChats = document.getElementById('no-chats');
    
    loadingChats.classList.add('hidden');
    
    if (chats.length === 0) {
        noChats.classList.remove('hidden');
        chatsList.classList.add('hidden');
        return;
    }
    
    noChats.classList.add('hidden');
    chatsList.classList.remove('hidden');
    
    // Ordenar por mensagens não respondidas primeiro, depois por data
    chats.sort((a, b) => {
        if (a.mensagensNaoRespondidas !== b.mensagensNaoRespondidas) {
            return b.mensagensNaoRespondidas - a.mensagensNaoRespondidas;
        }
        return new Date(b.ultimaHora.toDate()) - new Date(a.ultimaHora.toDate());
    });
    
    chatsList.innerHTML = chats.map(chat => {
        const ultimaHora = chat.ultimaHora ? new Date(chat.ultimaHora.toDate()).toLocaleString() : 'Sem data';
        const badgeClass = chat.mensagensNaoRespondidas > 0 ? 'bg-red-500' : 'bg-green-500';
        
        return `
            <div class="chat-card border rounded-lg p-4 cursor-pointer hover:bg-gray-50 ${currentChatId === chat.chatId ? 'bg-blue-50 border-blue-300' : 'border-gray-200'}" 
                 onclick="selectChat('${chat.chatId}')">
                <div class="flex justify-between items-start mb-2">
                    <h4 class="font-semibold text-gray-800 truncate">${chat.nome}</h4>
                    <span class="text-xs px-2 py-1 rounded-full text-white ${badgeClass}">
                        ${chat.mensagensNaoRespondidas}
                    </span>
                </div>
                <p class="text-sm text-gray-600 truncate mb-2">${chat.ultimaMensagem}</p>
                <div class="flex justify-between text-xs text-gray-400">
                    <span>${ultimaHora}</span>
                    <span>${chat.totalMensagens} mensagens</span>
                </div>
            </div>
        `;
    }).join('');
}

async function selectChat(chatId) {
    currentChatId = chatId;
    
    // Atualizar visual da seleção
    document.querySelectorAll('.chat-card').forEach(card => {
        card.classList.remove('bg-blue-50', 'border-blue-300');
        card.classList.add('border-gray-200');
    });
    
    // Encontrar o card do chat selecionado pelo seu chatId (mais robusto que usar event.target)
    const selectedCard = document.querySelector(`.chat-card[onclick*="${chatId}"]`);
    if (selectedCard) {
        selectedCard.classList.add('bg-blue-50', 'border-blue-300');
        selectedCard.classList.remove('border-gray-200');
    }
    
    // Mostrar área de conversa
    document.getElementById('no-chat-selected').classList.add('hidden');
    document.getElementById('chat-conversation').classList.remove('hidden');
    
    // Atualizar título
    const chatData = chatsData[chatId];
    document.getElementById('chat-title').textContent = `Chat com ${chatData.nome}`;
    document.getElementById('chat-info').textContent = `${chatData.totalMensagens} mensagens • ${chatData.mensagensNaoRespondidas} não respondidas`;
    
    // Carregar mensagens
    loadChatMessages(chatId);
}

async function loadChatMessages(chatId) {
    try {
        if (messagesListener) {
            messagesListener();
        }
        
        const messagesRef = collection(db, 'mensagens');
        const q = query(
            messagesRef,
            where('chat_id', '==', chatId),
            orderBy('hora', 'asc')
        );
        
        messagesListener = onSnapshot(q, (snapshot) => {
            const messages = [];
            snapshot.forEach((doc) => {
                messages.push({ id: doc.id, ...doc.data() });
            });
            
            displayMessages(messages);
        });
        
    } catch (error) {
        console.error('Erro ao carregar mensagens:', error);
        showError('Erro ao carregar mensagens');
    }
}

function displayMessages(messages) {
    const container = document.getElementById('messages-container');
    
    container.innerHTML = messages.map(message => {
        const hora = message.hora ? new Date(message.hora.toDate()).toLocaleTimeString() : 'Sem hora';
        const responded = message.respondido;
        
        return `
            <div class="mb-4">
                <!-- Mensagem do usuário -->
                <div class="flex justify-end mb-2">
                    <div class="message-bubble user-message bg-blue-500 text-white p-3 rounded-lg">
                        <p class="text-sm">${message.mensagem}</p>
                        <p class="text-xs opacity-75 mt-1">${hora}</p>
                    </div>
                </div>
                
                <!-- Resposta do admin (se existir) -->
                ${message.resposta ? `
                    <div class="flex justify-start mb-2">
                        <div class="message-bubble admin-message bg-gray-200 text-gray-800 p-3 rounded-lg">
                            <p class="text-sm">${message.resposta}</p>
                            <p class="text-xs text-gray-500 mt-1">Respondido</p>
                        </div>
                    </div>
                ` : `
                    <div class="flex justify-start">
                        <button onclick="openResponseModal('${message.id}', '${message.mensagem.replace(/'/g, "\\'")}', '${message.nome}')" 
                                class="text-blue-500 hover:text-blue-700 text-sm font-medium transition">
                            <i class="fas fa-reply mr-1"></i>Responder
                        </button>
                    </div>
                `}
            </div>
        `;
    }).join('');
    
    // Scroll para o final
    container.scrollTop = container.scrollHeight;
}

// ==================== MODAL DE RESPOSTA ====================

function openResponseModal(messageId, originalMessage, userName) {
    currentMessageId = messageId;
    
    document.getElementById('original-message').textContent = originalMessage;
    document.getElementById('response-text').value = '';
    document.getElementById('response-modal').classList.remove('hidden');
    
    // Focar no textarea
    setTimeout(() => {
        document.getElementById('response-text').focus();
    }, 100);
}

function closeResponseModal() {
    document.getElementById('response-modal').classList.add('hidden');
    currentMessageId = null;
}

async function sendResponse() {
    const responseText = document.getElementById('response-text').value.trim();
    
    if (!responseText) {
        alert('Por favor, digite uma resposta!');
        return;
    }
    
    if (!currentMessageId) {
        alert('Erro: ID da mensagem não encontrado!');
        return;
    }
    
    try {
        const messageRef = doc(db, 'mensagens', currentMessageId);
        
        await updateDoc(messageRef, {
            resposta: responseText,
            respondido: true,
            horaResposta: new Date()
        });
        
        closeResponseModal();
        showSuccess('Resposta enviada com sucesso!');
        
        // Recarregar chats para atualizar contadores
        loadChats();
        
    } catch (error) {
        console.error('Erro ao enviar resposta:', error);
        showError('Erro ao enviar resposta');
    }
}

// ==================== UTILIDADES ====================

function refreshChats() {
    document.getElementById('loading-chats').classList.remove('hidden');
    document.getElementById('chats-list').classList.add('hidden');
    document.getElementById('no-chats').classList.add('hidden');
    
    setTimeout(() => {
        loadChats();
    }, 500);
}

function showError(message) {
    // Implementar notificação de erro
    alert('Erro: ' + message);
}

function showSuccess(message) {
    // Implementar notificação de sucesso
    alert('Sucesso: ' + message);
}

// ==================== EVENT LISTENERS ====================

// Permitir envio de resposta com Enter (Ctrl+Enter)
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.key === 'Enter') {
        const modal = document.getElementById('response-modal');
        if (!modal.classList.contains('hidden')) {
            sendResponse();
        }
    }
    
    if (e.key === 'Escape') {
        const modal = document.getElementById('response-modal');
        if (!modal.classList.contains('hidden')) {
            closeResponseModal();
        }
    }
});

// Fechar modal clicando fora
document.getElementById('response-modal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeResponseModal();
    }
});

console.log('Admin panel carregado!');
