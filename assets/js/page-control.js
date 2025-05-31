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
        background: linear-gradient(135deg, #0f1419 0%, #1a1f2e 100%);
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
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
    
    offlineOverlay.innerHTML = `
        <div style="
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 20px;
            padding: 3rem;
            max-width: 600px;
            margin: 2rem;
            text-align: center;
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
        ">
            <div style="
                width: 80px;
                height: 80px;
                background: linear-gradient(45deg, #3b82f6, #8b5cf6);
                border-radius: 50%;
                margin: 0 auto 2rem;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 2rem;
                color: white;
            ">
                <i class="fas fa-tools"></i>
            </div>
            
            <h1 style="
                color: white;
                font-size: 2rem;
                font-weight: 700;
                margin-bottom: 1rem;
                line-height: 1.2;
            ">
                Página em Manutenção
            </h1>
            
            <p style="
                color: rgba(255, 255, 255, 0.8);
                font-size: 1.1rem;
                line-height: 1.6;
                margin-bottom: ${maintenanceEta ? '1rem' : '2rem'};
            ">
                ${message}
            </p>
            
            ${maintenanceEta ? `
                <p style="
                    color: #3b82f6;
                    font-size: 1rem;
                    font-weight: 600;
                    margin-bottom: 2rem;
                    padding: 0.75rem 1.5rem;
                    background: rgba(59, 130, 246, 0.1);
                    border: 1px solid rgba(59, 130, 246, 0.2);
                    border-radius: 12px;
                    display: inline-block;
                ">
                    <i class="fas fa-calendar-alt" style="margin-right: 0.5rem;"></i>
                    ${maintenanceEta}
                </p>
            ` : ''}
            
            <button onclick="window.location.href='../index.html'" style="
                background: linear-gradient(45deg, #3b82f6, #8b5cf6);
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 12px;
                font-size: 1rem;
                font-weight: 600;
                cursor: pointer;
                transition: transform 0.2s, box-shadow 0.2s;
                box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
            " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 8px 25px rgba(59, 130, 246, 0.4)'" 
               onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 15px rgba(59, 130, 246, 0.3)'">
                <i class="fas fa-home" style="margin-right: 0.5rem;"></i>
                Voltar ao Início
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
