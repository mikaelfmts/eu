// ==================== SISTEMA DE CONTROLE GRANULAR DE PÁGINAS ====================

// Configuração do Firebase - reutilizando a mesma configuração
const pageControlFirebaseConfig = {
    apiKey: "AIzaSyA0VoWMLTJIyI54Pj0P5T75gCH6KpgAcbk",
    authDomain: "mikaelfmts.firebaseapp.com",
    projectId: "mikaelfmts",
    storageBucket: "mikaelfmts.firebasestorage.app",
    messagingSenderId: "516762612351",
    appId: "1:516762612351:web:f8a0f229ffd5def8ec054a"
};

// Função para verificar se uma página específica está online
async function checkPageStatus(pageId, redirectPath = '../index.html') {
    console.log(`Verificando status da página: ${pageId}`);
    
    try {
        // Importar Firebase dinamicamente
        const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js');
        const { getFirestore, doc, onSnapshot } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js');
        
        const app = initializeApp(pageControlFirebaseConfig);
        const db = getFirestore(app);
        
        const pageControlRef = doc(db, 'configuracoes', 'controle-paginas');
        
        onSnapshot(pageControlRef, (docSnapshot) => {
            if (docSnapshot.exists()) {
                const data = docSnapshot.data();
                const pageData = data[pageId];
                
                if (pageData && !pageData.online) {
                    // Página está offline, mostrar mensagem customizada
                    showOfflinePage(pageData, pageId);
                }
            } else {
                // Verificar localStorage como fallback
                checkPageStatusFromLocal(pageId, redirectPath);
            }
        }, (error) => {
            console.warn('Erro ao verificar status da página no Firebase, usando localStorage:', error);
            checkPageStatusFromLocal(pageId, redirectPath);
        });
        
    } catch (error) {
        console.warn('Erro ao conectar Firebase, usando localStorage:', error);
        checkPageStatusFromLocal(pageId, redirectPath);
    }
}

// Verificar status da página usando localStorage
function checkPageStatusFromLocal(pageId, redirectPath) {
    try {
        const stored = localStorage.getItem('pageControlStatus');
        if (stored) {
            const data = JSON.parse(stored);
            const pageData = data[pageId];
            
            if (pageData && !pageData.online) {
                showOfflinePage(pageData, pageId);
            }
        }
    } catch (error) {
        console.error('Erro ao verificar localStorage:', error);
    }
}

// Mostrar página offline com mensagem customizada
function showOfflinePage(pageData, pageId) {
    // Criar overlay de página offline
    const offlineOverlay = document.createElement('div');
    offlineOverlay.id = 'page-offline-overlay';
    offlineOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: radial-gradient(ellipse at bottom, #1e1e2f 0%, #0f0e1b 70%, #000 100%);
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: 'Marcellus', serif;
        overflow: hidden;
    `;
    
    // Mensagem padrão ou customizada
    const defaultMessage = "Mikael limitou o acesso a esta página por enquanto. Melhorias estão sendo implementadas.";
    const message = pageData.customMessage || defaultMessage;
    
    // Formatear data se disponível
    let maintenanceEta = '';
    if (pageData.dataManutencao) {
        try {
            const date = new Date(pageData.dataManutencao);
            const options = { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                weekday: 'long'
            };
            maintenanceEta = `A previsão de término de manutenção: ${date.toLocaleDateString('pt-BR', options)}`;
        } catch (error) {
            console.error('Erro ao formatar data:', error);
        }
    }
    
    // Adicionar estilos CSS para animações
    const style = document.createElement('style');
    style.textContent = `
        @import url('https://fonts.googleapis.com/css2?family=Marcellus:wght@400&display=swap');
        
        /* Animação das chamas no background */
        @keyframes flameFlicker {
            0%, 100% {
                transform: scaleY(1) scaleX(1) rotate(0deg);
                opacity: 0.8;
            }
            25% {
                transform: scaleY(1.1) scaleX(0.95) rotate(-1deg);
                opacity: 0.9;
            }
            50% {
                transform: scaleY(1.2) scaleX(0.9) rotate(1deg);
                opacity: 1;
            }
            75% {
                transform: scaleY(1.05) scaleX(1.05) rotate(-0.5deg);
                opacity: 0.85;
            }
        }
        
        @keyframes emberFloat {
            0% {
                transform: translateY(100vh) rotate(0deg);
                opacity: 0;
            }
            10% {
                opacity: 1;
            }
            90% {
                opacity: 1;
            }
            100% {
                transform: translateY(-20px) rotate(360deg);
                opacity: 0;
            }
        }
        
        @keyframes goldPulse {
            0%, 100% {
                text-shadow: 
                    0 0 5px rgba(200, 170, 110, 0.8),
                    0 0 10px rgba(200, 170, 110, 0.6),
                    0 0 15px rgba(200, 170, 110, 0.4),
                    0 0 20px rgba(255, 140, 0, 0.3);
            }
            50% {
                text-shadow: 
                    0 0 10px rgba(200, 170, 110, 1),
                    0 0 20px rgba(200, 170, 110, 0.8),
                    0 0 30px rgba(200, 170, 110, 0.6),
                    0 0 40px rgba(255, 140, 0, 0.5);
            }
        }
        
        @keyframes fireIconSpin {
            0% { transform: rotate(0deg) scale(1); }
            25% { transform: rotate(5deg) scale(1.1); }
            50% { transform: rotate(0deg) scale(1.2); }
            75% { transform: rotate(-5deg) scale(1.1); }
            100% { transform: rotate(0deg) scale(1); }
        }
        
        @keyframes borderGlow {
            0%, 100% {
                box-shadow: 
                    0 0 20px rgba(200, 170, 110, 0.5),
                    0 0 40px rgba(255, 140, 0, 0.3),
                    inset 0 0 20px rgba(200, 170, 110, 0.1);
            }
            50% {
                box-shadow: 
                    0 0 30px rgba(200, 170, 110, 0.8),
                    0 0 60px rgba(255, 140, 0, 0.5),
                    inset 0 0 30px rgba(200, 170, 110, 0.2);
            }
        }
        
        @keyframes buttonHover {
            0% { transform: translateY(0) scale(1); }
            100% { transform: translateY(-3px) scale(1.05); }
        }
        
        /* Background de chamas */
        .flame-bg::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: 
                radial-gradient(circle at 20% 80%, rgba(255, 140, 0, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 80% 70%, rgba(255, 69, 0, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 40% 90%, rgba(200, 170, 110, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 60% 85%, rgba(255, 140, 0, 0.08) 0%, transparent 50%);
            animation: flameFlicker 4s ease-in-out infinite;
        }
        
        /* Partículas de brasa */
        .ember {
            position: absolute;
            width: 3px;
            height: 3px;
            background: radial-gradient(circle, #ff8c00 0%, #ff4500 70%, transparent 100%);
            border-radius: 50%;
            animation: emberFloat 15s linear infinite;
            box-shadow: 0 0 6px rgba(255, 140, 0, 0.8);
        }
        
        .ember:nth-child(1) { left: 10%; animation-delay: 0s; animation-duration: 12s; }
        .ember:nth-child(2) { left: 20%; animation-delay: 2s; animation-duration: 18s; }
        .ember:nth-child(3) { left: 30%; animation-delay: 4s; animation-duration: 14s; }
        .ember:nth-child(4) { left: 40%; animation-delay: 1s; animation-duration: 16s; }
        .ember:nth-child(5) { left: 50%; animation-delay: 6s; animation-duration: 13s; }
        .ember:nth-child(6) { left: 60%; animation-delay: 3s; animation-duration: 17s; }
        .ember:nth-child(7) { left: 70%; animation-delay: 5s; animation-duration: 15s; }
        .ember:nth-child(8) { left: 80%; animation-delay: 7s; animation-duration: 19s; }
        .ember:nth-child(9) { left: 90%; animation-delay: 1.5s; animation-duration: 11s; }
        .ember:nth-child(10) { left: 15%; animation-delay: 8s; animation-duration: 20s; }
    `;
    document.head.appendChild(style);
    
    offlineOverlay.innerHTML = `
        <div class="flame-bg" style="
            position: relative;
            background: linear-gradient(135deg, 
                rgba(15, 20, 25, 0.95) 0%, 
                rgba(30, 30, 47, 0.9) 50%, 
                rgba(15, 20, 25, 0.95) 100%);
            backdrop-filter: blur(20px);
            border: 2px solid transparent;
            background-clip: padding-box;
            border-radius: 20px;
            padding: 3rem;
            max-width: 650px;
            margin: 2rem;
            text-align: center;
            animation: borderGlow 3s ease-in-out infinite;
            overflow: hidden;
        ">
            <!-- Partículas de Brasa -->
            <div class="ember"></div>
            <div class="ember"></div>
            <div class="ember"></div>
            <div class="ember"></div>
            <div class="ember"></div>
            <div class="ember"></div>
            <div class="ember"></div>
            <div class="ember"></div>
            <div class="ember"></div>
            <div class="ember"></div>
            
            <!-- Ícone de Fogo da Riot -->
            <div style="
                width: 100px;
                height: 100px;
                background: linear-gradient(135deg, #c8aa6e 0%, #f0c674 50%, #ff8c00 100%);
                border-radius: 50%;
                margin: 0 auto 2rem;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 2.5rem;
                color: #0f1419;
                position: relative;
                animation: fireIconSpin 4s ease-in-out infinite;
                box-shadow: 
                    0 0 30px rgba(200, 170, 110, 0.6),
                    0 0 60px rgba(255, 140, 0, 0.4),
                    inset 0 0 20px rgba(255, 255, 255, 0.2);
            ">
                <i class="fas fa-fire"></i>
                <div style="
                    position: absolute;
                    inset: -3px;
                    border-radius: 50%;
                    background: linear-gradient(45deg, transparent, rgba(200, 170, 110, 0.3), transparent);
                    animation: borderGlow 2s linear infinite;
                "></div>
            </div>
            
            <!-- Título Estilo LoL -->
            <h1 style="
                font-family: 'Marcellus', serif;
                font-size: 2.8rem;
                color: #c8aa6e;
                margin-bottom: 1.5rem;
                text-transform: uppercase;
                letter-spacing: 3px;
                font-weight: 400;
                animation: goldPulse 3s ease-in-out infinite;
                background: linear-gradient(45deg, #c8aa6e, #f0c674, #ff8c00);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                position: relative;
            ">
                Página em Manutenção
            </h1>
            
            <!-- Separador com ornamentos -->
            <div style="
                margin: 2rem 0;
                position: relative;
                height: 2px;
                background: linear-gradient(90deg, transparent, #c8aa6e, transparent);
            ">
                <div style="
                    position: absolute;
                    left: 50%;
                    top: 50%;
                    transform: translate(-50%, -50%);
                    width: 12px;
                    height: 12px;
                    background: #c8aa6e;
                    rotate: 45deg;
                "></div>
            </div>
            
            <!-- Mensagem Principal -->
            <p style="
                font-size: 1.3rem;
                line-height: 1.8;
                margin-bottom: 2rem;
                color: #f0e6d2;
                text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
                font-weight: 300;
                max-width: 500px;
                margin-left: auto;
                margin-right: auto;
            ">
                ${message}
            </p>
            
            ${maintenanceEta ? `
                <!-- Previsão com estilo LoL -->
                <div style="
                    background: linear-gradient(135deg, rgba(200, 170, 110, 0.1), rgba(255, 140, 0, 0.1));
                    border: 1px solid rgba(200, 170, 110, 0.3);
                    border-radius: 12px;
                    padding: 1.2rem;
                    margin-bottom: 2rem;
                    position: relative;
                    overflow: hidden;
                ">
                    <div style="
                        position: absolute;
                        top: 0;
                        left: -100%;
                        width: 100%;
                        height: 100%;
                        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
                        animation: borderGlow 3s linear infinite;
                    "></div>
                    <p style="
                        color: #ff8c00;
                        font-size: 1.1rem;
                        font-weight: 400;
                        margin: 0;
                        text-shadow: 0 0 10px rgba(255, 140, 0, 0.5);
                        position: relative;
                        z-index: 1;
                    ">
                        <i class="fas fa-hourglass-half" style="margin-right: 0.5rem; animation: fireIconSpin 2s ease-in-out infinite;"></i>
                        ${maintenanceEta}
                    </p>
                </div>
            ` : ''}
            
            <!-- Botão de Retorno Estilo Riot -->
            <button onclick="window.location.href='../index.html'" style="
                background: linear-gradient(135deg, #c8aa6e 0%, #b8924d 50%, #8b7355 100%);
                color: #0f1419;
                border: 2px solid #c8aa6e;
                padding: 16px 32px;
                border-radius: 8px;
                font-size: 1.1rem;
                font-weight: 600;
                font-family: 'Marcellus', serif;
                text-transform: uppercase;
                letter-spacing: 1px;
                cursor: pointer;
                transition: all 0.3s ease;
                position: relative;
                overflow: hidden;
                box-shadow: 
                    0 6px 20px rgba(200, 170, 110, 0.3),
                    inset 0 1px 0 rgba(255, 255, 255, 0.2);
            " onmouseover="
                this.style.background = 'linear-gradient(135deg, #f0c674 0%, #c8aa6e 50%, #b8924d 100%)';
                this.style.transform = 'translateY(-3px) scale(1.05)';
                this.style.boxShadow = '0 10px 30px rgba(200, 170, 110, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.3)';
            " onmouseout="
                this.style.background = 'linear-gradient(135deg, #c8aa6e 0%, #b8924d 50%, #8b7355 100%)';
                this.style.transform = 'translateY(0) scale(1)';
                this.style.boxShadow = '0 6px 20px rgba(200, 170, 110, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)';
            ">
                <span style="position: relative; z-index: 1;">
                    <i class="fas fa-home" style="margin-right: 0.8rem;"></i>
                    Voltar ao Início
                </span>
                <div style="
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
                    transition: left 0.5s ease;
                "></div>
            </button>
        </div>
    `;
    
    // Adicionar overlay ao body
    document.body.appendChild(offlineOverlay);
    
    // Esconder conteúdo da página
    document.body.style.overflow = 'hidden';
    
    // Adicionar estilo para ícones FontAwesome se não estiver carregado
    if (!document.querySelector('link[href*="fontawesome"]')) {
        const fontAwesome = document.createElement('link');
        fontAwesome.rel = 'stylesheet';
        fontAwesome.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css';
        document.head.appendChild(fontAwesome);
    }
}

// Verificar também o sistema de manutenção geral (mantendo compatibilidade)
async function checkMaintenanceStatus() {
    try {
        // Importar Firebase dinamicamente
        const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js');
        const { getFirestore, doc, onSnapshot } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js');
        
        const app = initializeApp(pageControlFirebaseConfig);
        const db = getFirestore(app);
        
        const maintenanceRef = doc(db, 'configuracoes', 'manutencao');
        
        onSnapshot(maintenanceRef, (docSnapshot) => {
            if (docSnapshot.exists()) {
                const data = docSnapshot.data();
                if (data.ativo) {
                    window.location.href = '../index.html';
                }
            } else {
                // Verificar localStorage como fallback
                checkMaintenanceFromLocal();
            }
        }, (error) => {
            console.warn('Erro ao verificar manutenção no Firebase, usando localStorage:', error);
            checkMaintenanceFromLocal();
        });
    } catch (error) {
        console.warn('Erro ao conectar Firebase, usando localStorage:', error);
        checkMaintenanceFromLocal();
    }
}

function checkMaintenanceFromLocal() {
    try {
        const stored = localStorage.getItem('maintenanceStatus');
        if (stored) {
            const data = JSON.parse(stored);
            if (data.ativo) {
                window.location.href = '../index.html';
            }
        }
    } catch (error) {
        console.error('Erro ao verificar localStorage:', error);
    }
}

// Função de inicialização para páginas
function initPageControl(pageId) {
    console.log(`Inicializando controle para página: ${pageId}`);
    
    // Verificar manutenção geral primeiro
    checkMaintenanceStatus();
    
    // Depois verificar status específico da página
    checkPageStatus(pageId);
}

// Exportar função principal
window.initPageControl = initPageControl;
