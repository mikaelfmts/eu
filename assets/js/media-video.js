// Script para tratar reprodução de vídeos do YouTube e vídeos normais
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar controles de vídeo na página
    initializeVideoControls();
});

// Função para inicializar controles de vídeo para conteúdo carregado dinamicamente
function initializeVideoControls() {
    // Tratar vídeos normais
    setupNormalVideoControls();
    
    // Tratar vídeos do YouTube
    setupYouTubeControls();
}

// Configurar controles para vídeos normais
function setupNormalVideoControls() {
    // Encontrar todos os botões de play para vídeos normais
    const videoPlayButtons = document.querySelectorAll('.video-play-button:not(.initialized)');
    
    videoPlayButtons.forEach(button => {
        // Marcar como inicializado para evitar duplicar eventos
        button.classList.add('initialized');
        
        const videoContainer = button.closest('.video-container');
        if (!videoContainer) return;
        
        const video = videoContainer.querySelector('video');
        if (!video) return;
        
        // Click no botão de play
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            
            if (video.paused) {
                // Reproduzir vídeo
                video.play()
                    .then(() => {
                        button.classList.add('playing');
                    })
                    .catch(error => {
                        console.error('Erro ao reproduzir vídeo:', error);
                    });
            } else {
                // Pausar vídeo
                video.pause();
                button.classList.remove('playing');
            }
        });
        
        // Quando o vídeo termina, mostrar o botão play novamente
        video.addEventListener('ended', () => {
            button.classList.remove('playing');
        });
        
        // Click no vídeo também controla play/pause
        video.addEventListener('click', (e) => {
            e.stopPropagation();
            
            if (video.paused) {
                video.play()
                    .then(() => {
                        button.classList.add('playing');
                    })
                    .catch(error => {
                        console.error('Erro ao reproduzir vídeo:', error);
                    });
            } else {
                video.pause();
                button.classList.remove('playing');
            }
        });
    });
}

// Configurar controles para vídeos do YouTube
function setupYouTubeControls() {
    // Encontrar todos os thumbnails do YouTube não inicializados
    const youtubeThumbnails = document.querySelectorAll('.youtube-thumbnail:not(.initialized)');
    
    youtubeThumbnails.forEach(thumbnail => {
        // Marcar como inicializado para evitar duplicar eventos
        thumbnail.classList.add('initialized');
        
        const youtubeID = thumbnail.dataset.youtubeId;
        if (!youtubeID) return;
        
        // Click na thumbnail do YouTube
        thumbnail.addEventListener('click', (e) => {
            e.stopPropagation();
            
            // Mostrar indicador de carregamento
            const container = thumbnail.closest('.youtube-container');
            if (!container) return;
            
            container.classList.add('loading');
            
            // Adicionar evento de click para dispositivos móveis
            // Alguns navegadores móveis exigem interação do usuário para autoreproducão
            const playButton = container.querySelector('.youtube-play-button');
            if (playButton) {
                playButton.style.display = 'none';
            }
            
            // Criar iframe com autoplay
            const iframe = document.createElement('iframe');
            iframe.className = 'youtube-embed';
            iframe.width = '100%';
            iframe.height = '100%';
            iframe.src = `https://www.youtube.com/embed/${youtubeID}?autoplay=1&rel=0&showinfo=0&enablejsapi=1`;
            iframe.title = 'YouTube video player';
            iframe.frameBorder = '0';
            iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
            iframe.allowFullscreen = true;
            
            // Remover classe de loading quando o iframe carregar
            iframe.onload = () => {
                container.classList.remove('loading');
            };
            
            // Lidar com erro de carregamento
            iframe.onerror = () => {
                container.classList.remove('loading');
                container.innerHTML = `
                    <div class="youtube-error">
                        <p>Não foi possível carregar o vídeo</p>
                        <button class="retry-button">Tentar novamente</button>
                    </div>
                `;
                
                const retryButton = container.querySelector('.retry-button');
                if (retryButton) {
                    retryButton.addEventListener('click', () => {
                        // Restaurar thumbnail e tentar novamente
                        container.innerHTML = thumbnail.outerHTML;
                        setupYouTubeControls();
                    });
                }
            };
            
            // Substituir o conteúdo do container pelo iframe
            container.innerHTML = '';
            container.appendChild(iframe);
        });
    });
    
    // Também verificar iframes do YouTube em posts
    const postYoutubeIframes = document.querySelectorAll('iframe[src*="youtube.com"]:not(.initialized)');
    postYoutubeIframes.forEach(iframe => {
        iframe.classList.add('initialized');
        
        // Adicionar classe para estilização
        iframe.classList.add('youtube-embed');
        
        // Garantir que o iframe tenha parâmetros corretos
        if (!iframe.src.includes('enablejsapi=1')) {
            iframe.src = iframe.src.includes('?') 
                ? `${iframe.src}&enablejsapi=1` 
                : `${iframe.src}?enablejsapi=1`;
        }
    });
}

// Função para observar vídeos do YouTube em destaque e reproduzir quando visíveis
function setupFeaturedYouTubeAutoplay() {
    const youtubeIframes = document.querySelectorAll('iframe.youtube-embed');
    
    if (!youtubeIframes.length) return;
    
    // Detectar se o dispositivo é móvel
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Armazenar URLs originais para restauração
    youtubeIframes.forEach(iframe => {
        // Armazenar URL original se ainda não estiver armazenada
        if (!iframe.dataset.originalSrc) {
            iframe.dataset.originalSrc = iframe.src;
        }
    });
    
    // Configurar o Intersection Observer
    const youtubeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const iframe = entry.target;
            const originalSrc = iframe.dataset.originalSrc;
            
            if (entry.isIntersecting) {
                // Vídeo está visível
                if (isMobile) {
                    // Em dispositivos móveis, apenas preparar o iframe sem autoplay
                    // O usuário precisará clicar para iniciar (política de navegadores móveis)
                    iframe.src = originalSrc;
                } else {
                    // Em desktops, ativar autoplay
                    iframe.src = originalSrc.includes('?') 
                        ? `${originalSrc}&autoplay=1&mute=1&playsinline=1` 
                        : `${originalSrc}?autoplay=1&mute=1&playsinline=1`;
                }
                
                // Adicionar classe para estilização
                iframe.classList.add('youtube-visible');
            } else {
                // Vídeo está fora da visualização
                // Pausar o vídeo recarregando para o estado original sem autoplay
                if (iframe.src !== originalSrc) {
                    iframe.src = originalSrc;
                }
                
                // Remover classe de visível
                iframe.classList.remove('youtube-visible');
            }
        });
    }, {
        threshold: 0.3, // 30% do iframe deve estar visível para acionar
        rootMargin: '0px'
    });
    
    // Observar cada iframe do YouTube
    youtubeIframes.forEach(iframe => {
        youtubeObserver.observe(iframe);
    });
}

// Função para salvar o estado de reprodução dos vídeos
function saveVideoStates() {
    // Salvar estado de vídeos normais
    const videos = document.querySelectorAll('video');
    const videoStates = {};
    
    videos.forEach((video, index) => {
        if (video.src) {
            videoStates[`video_${index}`] = {
                src: video.src,
                currentTime: video.currentTime,
                paused: video.paused
            };
        }
    });
    
    // Salvar estado de vídeos do YouTube
    const youtubeIframes = document.querySelectorAll('iframe.youtube-embed');
    youtubeIframes.forEach((iframe, index) => {
        if (iframe.src) {
            videoStates[`youtube_${index}`] = {
                src: iframe.src,
                visible: iframe.classList.contains('youtube-visible')
            };
        }
    });
    
    // Salvar no sessionStorage
    if (Object.keys(videoStates).length > 0) {
        sessionStorage.setItem('videoStates', JSON.stringify(videoStates));
    }
}

// Função para restaurar o estado de reprodução dos vídeos
function restoreVideoStates() {
    // Verificar se há estados salvos
    const savedStates = sessionStorage.getItem('videoStates');
    if (!savedStates) return;
    
    try {
        const videoStates = JSON.parse(savedStates);
        
        // Restaurar estado de vídeos normais
        const videos = document.querySelectorAll('video');
        videos.forEach((video, index) => {
            const state = videoStates[`video_${index}`];
            if (state && video.src === state.src) {
                video.currentTime = state.currentTime;
                
                if (!state.paused) {
                    // Tentar reproduzir o vídeo se estava reproduzindo
                    video.play().catch(err => console.log('Não foi possível restaurar reprodução automática'));
                }
            }
        });
        
        // Não restauramos YouTube automaticamente por questões de políticas de autoplay
        
    } catch (error) {
        console.error('Erro ao restaurar estados dos vídeos:', error);
    }
    
    // Limpar estados salvos após restauração
    sessionStorage.removeItem('videoStates');
}

// Salvar estado dos vídeos ao sair da página
window.addEventListener('beforeunload', saveVideoStates);

// Exportar funções para uso global
window.initializeVideoControls = initializeVideoControls;
window.setupFeaturedYouTubeAutoplay = setupFeaturedYouTubeAutoplay;
window.saveVideoStates = saveVideoStates;
window.restoreVideoStates = restoreVideoStates;

// Tentar restaurar estados ao carregar a página
document.addEventListener('DOMContentLoaded', function() {
    // Pequeno atraso para garantir que os vídeos já foram carregados
    setTimeout(restoreVideoStates, 1000);
});
