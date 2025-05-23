// Gerenciador de notificações push
class NotificationManager {
    constructor() {
        this.supportsPush = 'PushManager' in window;
        this.hasPermission = false;
    }

    // Inicializar gerenciador de notificações
    async init() {
        if (!this.supportsPush) {
            console.log('Notificações push não são suportadas neste navegador');
            return false;
        }

        this.hasPermission = await this.checkPermission();
        
        // Configurar UI de acordo com as permissões atuais
        this.updateNotificationUI();
        
        return this.hasPermission;
    }

    // Verificar permissão atual
    async checkPermission() {
        if (!('Notification' in window)) {
            return false;
        }
        
        return Notification.permission === 'granted';
    }

    // Solicitar permissão para notificações
    async requestPermission() {
        try {
            const permission = await Notification.requestPermission();
            this.hasPermission = permission === 'granted';
            this.updateNotificationUI();
            
            if (this.hasPermission && 'serviceWorker' in navigator) {
                const registration = await navigator.serviceWorker.getRegistration();
                
                // Se o service worker estiver registrado, inscrever para notificações
                if (registration) {
                    try {
                        const subscription = await this.subscribeUserToPush(registration);
                        if (subscription) {
                            // Aqui você enviaria a subscription para seu servidor
                            console.log('Usuário inscrito nas notificações push:', subscription);
                            
                            // Mostrar notificação de boas-vindas
                            this.showWelcomeNotification();
                        }
                    } catch (err) {
                        console.error('Erro ao inscrever para notificações push:', err);
                    }
                }
            }
            
            return this.hasPermission;
        } catch (err) {
            console.error('Erro ao solicitar permissão:', err);
            return false;
        }
    }

    // Inscrever usuário para notificações push
    async subscribeUserToPush(registration) {
        try {
            const options = {
                userVisibleOnly: true,
                applicationServerKey: this.urlBase64ToUint8Array(
                    'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U'
                )
            };
            
            return await registration.pushManager.subscribe(options);
        } catch (err) {
            console.error('Falha ao inscrever para notificações push:', err);
            return null;
        }
    }

    // Mostrar notificação de boas-vindas
    showWelcomeNotification() {
        if (this.hasPermission && 'serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then(registration => {
                registration.showNotification('Olá! 👋', {
                    body: 'Você será notificado sobre novos projetos e atualizações!',
                    icon: '/assets/images/icons/icon-192.png',
                    badge: '/assets/images/icons/badge-72.png',
                    vibrate: [100, 50, 100],
                    data: {
                        url: window.location.href
                    }
                });
            });
        }
    }

    // Mostrar notificação de novo projeto
    showProjectNotification(title, description) {
        if (this.hasPermission && 'serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then(registration => {
                registration.showNotification(`Novo projeto: ${title}`, {
                    body: description,
                    icon: '/assets/images/icons/icon-192.png',
                    badge: '/assets/images/icons/badge-72.png',
                    vibrate: [100, 50, 100],
                    actions: [
                        {
                            action: 'view',
                            title: 'Ver projeto'
                        }
                    ],
                    data: {
                        url: window.location.href + '#projetos'
                    }
                });
            });
        }
    }

    // Converter chave base64 para Uint8Array (necessário para Web Push)
    urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/\-/g, '+')
            .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        
        return outputArray;
    }

    // Atualizar a interface de usuário com base na permissão
    updateNotificationUI() {
        const notificationBtn = document.getElementById('notification-btn');
        
        // Se não existir botão, não faz nada
        if (!notificationBtn) return;
        
        if (this.hasPermission) {
            notificationBtn.textContent = '🔔 Notificações ativadas';
            notificationBtn.classList.add('active');
        } else {
            notificationBtn.textContent = '🔕 Ativar notificações';
            notificationBtn.classList.remove('active');
        }
    }
}

// Inicializar gerenciador de notificações quando o documento estiver pronto
document.addEventListener('DOMContentLoaded', async () => {
    const notificationManager = new NotificationManager();
    await notificationManager.init();
    
    // Adicionar botão de notificações se ainda não existir
    if (!document.getElementById('notification-btn')) {
        const notificationBtn = document.createElement('button');
        notificationBtn.id = 'notification-btn';
        notificationBtn.className = 'notification-btn';
        
        // Definir texto inicial com base na permissão
        if (notificationManager.hasPermission) {
            notificationBtn.textContent = '🔔 Notificações ativadas';
            notificationBtn.classList.add('active');
        } else {
            notificationBtn.textContent = '🔕 Ativar notificações';
        }
        
        // Adicionar manipulador de eventos
        notificationBtn.addEventListener('click', async () => {
            await notificationManager.requestPermission();
        });
          // Adicionar ao DOM dentro da div top-controls (antes do botão de tema)
        const topControls = document.querySelector('.top-controls');
        const themeToggle = document.getElementById('theme-toggle');
        
        if (topControls) {
            topControls.insertBefore(notificationBtn, themeToggle);
        } else if (themeToggle && themeToggle.parentNode) {
            themeToggle.parentNode.insertBefore(notificationBtn, themeToggle);
        } else {
            document.body.appendChild(notificationBtn);
        }
    }
    
    // Expor notificationManager globalmente para uso em outros scripts
    window.notificationManager = notificationManager;
});
