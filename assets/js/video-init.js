/**
 * Sistema global de inicialização de vídeo
 * Será carregado depois que todos os scripts principais forem carregados
 */
(function() {
    // Aguardar o DOM estar pronto
    document.addEventListener('DOMContentLoaded', function() {
        console.log('Inicializando sistema de vídeo global...');
        
        // Verificar se VideoProcessor está disponível
        if (!window.VideoProcessor && typeof VideoProcessor !== 'undefined') {
            window.VideoProcessor = VideoProcessor;
        }
        
        if (!window.videoProcessor && window.VideoProcessor) {
            window.videoProcessor = new window.VideoProcessor();
        }
        
        // Definir função global para inicialização de vídeo
        if (!window.initVideoPlayers) {
            window.initVideoPlayers = initVideoPlayers;
        }
        
        // Executar inicialização após um delay para garantir que outros scripts tenham carregado
        setTimeout(initVideoSystems, 500);
    });
    
    /**
     * Inicializa todos os sistemas de vídeo
     */
    function initVideoSystems() {
        // Inicializar players de vídeo na página
        initVideoPlayers();
        
        // Configurar observador para detectar novos vídeos
        setupVideoObserver();
    }
    
    /**
     * Inicializa players de vídeo na página
     */
    function initVideoPlayers() {
        // Selecionar todos os vídeos na página
        const videoElements = document.querySelectorAll('video');
        
        if (videoElements.length === 0) {
            return;
        }
        
        console.log(`Inicializando ${videoElements.length} players de vídeo`);
        
        videoElements.forEach(video => {
            // Evitar inicializar múltiplas vezes
            if (video._initialized) return;
            video._initialized = true;
            
            // Configurar eventos básicos
            video.addEventListener('error', handleVideoError);
            
            // Evento de carregamento
            video.addEventListener('loadstart', handleVideoLoadStart);
            video.addEventListener('canplay', handleVideoCanPlay);
            
            // Configurar contêiner para cliques
            const container = video.closest('.video-container, .video-preview-container');
            if (container) {
                setupVideoClickHandler(container, video);
            }
        });
        
        // Também inicializar botões de play
        setupPlayButtons();
    }
    
    /**
     * Configura observador para detectar novos vídeos adicionados ao DOM
     */
    function setupVideoObserver() {
        // Criar um observador de mutação
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes.length) {
                    let needsInit = false;
                    
                    mutation.addedNodes.forEach(function(node) {
                        if (node.nodeType === 1) { // Elemento
                            // Verificar se contém vídeos
                            if (node.tagName === 'VIDEO' || node.querySelector('video')) {
                                needsInit = true;
                            }
                            
                            // Verificar botões de play
                            if (node.classList && 
                               (node.classList.contains('video-play-button') || 
                                node.classList.contains('play-button') ||
                                node.querySelector('.video-play-button, .play-button'))) {
                                needsInit = true;
                            }
                        }
                    });
                    
                    if (needsInit) {
                        setTimeout(initVideoPlayers, 100);
                    }
                }
            });
        });
        
        // Observar todas as mudanças no DOM
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    /**
     * Configura handler de clique para contêiner de vídeo
     */
    function setupVideoClickHandler(container, video) {
        // Remover manipulador existente para evitar duplicações
        container.removeEventListener('click', container._videoClickHandler);
        
        // Adicionar novo manipulador
        container._videoClickHandler = function(e) {
            // Não capturar cliques em links ou botões
            if (e.target.closest('a, button, .modal-close')) return;
            
            // Toggle play/pause
            if (video.paused) {
                // Tentar usar safePlayVideo se disponível
                if (window.safePlayVideo) {
                    window.safePlayVideo(video)
                        .then(() => {
                            container.classList.add('playing');
                        })
                        .catch(err => {
                            console.warn('Erro ao reproduzir vídeo:', err);
                        });
                } else {
                    // Fallback
                    video.play()
                        .then(() => {
                            container.classList.add('playing');
                        })
                        .catch(err => {
                            console.warn('Erro ao reproduzir vídeo:', err);
                        });
                }
            } else {
                video.pause();
                container.classList.remove('playing');
            }
        };
        
        container.addEventListener('click', container._videoClickHandler);
    }
    
    /**
     * Configura botões de play para vídeos
     */
    function setupPlayButtons() {
        const playButtons = document.querySelectorAll('.video-play-button, .play-button');
        
        playButtons.forEach(button => {
            // Evitar configurações duplicadas
            if (button._initialized) return;
            button._initialized = true;
            
            button.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                // Encontrar o contêiner e o vídeo
                const container = this.closest('.video-container, .video-preview-container');
                if (!container) return;
                
                const video = container.querySelector('video');
                if (!video) return;
                
                // Reproduzir vídeo
                if (window.safePlayVideo) {
                    window.safePlayVideo(video)
                        .then(() => {
                            container.classList.add('playing');
                            this.style.display = 'none';
                        })
                        .catch(err => {
                            console.warn('Erro ao reproduzir vídeo:', err);
                        });
                } else {
                    video.play()
                        .then(() => {
                            container.classList.add('playing');
                            this.style.display = 'none';
                        })
                        .catch(err => {
                            console.warn('Erro ao reproduzir vídeo:', err);
                        });
                }
            });
        });
    }
    
    /**
     * Manipula erros de vídeo
     */
    function handleVideoError(e) {
        console.error('Erro no vídeo:', e);
        
        // Substituir por mensagem de erro
        const container = this.closest('.video-container, .video-preview-container');
        if (container) {
            // Criar HTML de erro
            const errorHTML = `
                <div class="video-error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Não foi possível carregar o vídeo</p>
                    <small>O vídeo pode não estar mais disponível ou o formato não é suportado pelo seu navegador.</small>
                    ${this.src ? `
                        <div class="video-fallback">
                            <a href="${this.src}" target="_blank" class="video-download-link">
                                <i class="fas fa-external-link-alt"></i> Tentar abrir diretamente
                            </a>
                        </div>
                    ` : ''}
                </div>
            `;
            
            container.innerHTML = errorHTML;
        }
    }
    
    /**
     * Manipula início de carregamento de vídeo
     */
    function handleVideoLoadStart() {
        this.style.opacity = '0.6';
        
        // Adicionar indicador de carregamento
        const container = this.closest('.video-container, .video-preview-container');
        if (container && !container.querySelector('.video-loading')) {
            const loader = document.createElement('div');
            loader.className = 'video-loading';
            loader.innerHTML = '<div class="video-loading-spinner"></div>';
            container.appendChild(loader);
        }
    }
    
    /**
     * Manipula evento de vídeo pronto para reprodução
     */
    function handleVideoCanPlay() {
        this.style.opacity = '1';
        
        // Remover indicador de carregamento
        const container = this.closest('.video-container, .video-preview-container');
        if (container) {
            const loader = container.querySelector('.video-loading');
            if (loader) loader.remove();
        }
    }
})();
