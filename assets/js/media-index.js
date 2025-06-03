
import { db } from './firebase-config.js';
import { 
    collection, 
    getDocs, 
    query, 
    orderBy, 
    limit,
    where,
    doc,
    getDoc
} from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js';

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    loadRecentMedia();
    loadFeaturedMedia();
    
    // Configuração global para o Plyr
    window.initVideoPlayers = function() {
        const videoElements = document.querySelectorAll('.plyr__video');
        if (videoElements.length > 0) {
            videoElements.forEach(video => {
                if (!video.plyrInstance) {
                    video.plyrInstance = new Plyr(video, {
                        controls: ['play', 'progress', 'current-time', 'mute', 'volume', 'fullscreen'],
                        autoplay: false,
                        muted: true,
                        loadSprite: false,
                        blankVideo: '',
                        previewThumbnails: { enabled: false }
                    });
                }
            });
        }
    };
    
    // Observar mudanças no DOM para inicializar novos players
    const observer = new MutationObserver(function(mutations) {
        window.initVideoPlayers();
    });
    
    observer.observe(document.body, { 
        childList: true, 
        subtree: true 
    });
});

async function loadRecentMedia() {
    const container = document.getElementById('recent-media-grid');
    const loading = document.getElementById('recent-media-loading');
    
    if (!container || !loading) return;
    
    try {
        // Buscar posts recentes (sem filtro por visible para evitar erro de índice)
        const q = query(
            collection(db, 'galeria_posts'), 
            orderBy('createdAt', 'desc'), 
            limit(6)
        );
        
        const querySnapshot = await getDocs(q);
        
        container.innerHTML = '';
        
        if (querySnapshot.empty) {
            container.innerHTML = `
                <div class="no-media-message">
                    <i class="fas fa-images"></i>
                    <p>Nenhum post encontrado</p>
                </div>
            `;
        } else {
            querySnapshot.forEach(doc => {
                const post = { id: doc.id, ...doc.data() };
                // Filtrar apenas posts visíveis no frontend
                if (post.visible !== false) {
                    const postElement = createRecentMediaCard(post);
                    container.appendChild(postElement);
                }
            });
        }
        
    } catch (error) {
        console.error('Erro ao carregar posts recentes:', error);
        container.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Erro ao carregar posts</p>
            </div>
        `;
    } finally {
        loading.style.display = 'none';
        container.style.display = 'grid';
    }
}

function createRecentMediaCard(post) {
    const card = document.createElement('div');
    card.className = 'recent-media-card';
    
    // Usar primeira mídia como preview
    const firstMedia = post.media && post.media.length > 0 ? post.media[0] : null;
    const mediaCount = post.media ? post.media.length : 0;    let mediaElement = '';
    if (firstMedia) {
        // Melhor detecção de tipo de mídia
        const isVideo = isVideoFile(firstMedia.url, firstMedia.type);
        
        if (isVideo) {
            const videoMimeType = getVideoMimeType(firstMedia.url, firstMedia.type);
            const videoId = 'recent-video-' + Math.random().toString(36).substring(2, 10);
            mediaElement = `
                <div class="video-preview-container">
                    <video id="${videoId}" class="media-preview plyr__video" muted preload="none" playsinline
                           data-poster="${firstMedia.thumbnail || ''}"
                           onloadstart="this.style.opacity='1'"
                           onerror="this.parentNode.innerHTML='<div class=&quot;media-preview-placeholder video-error&quot;><i class=&quot;fas fa-exclamation-triangle&quot;></i><span>Erro no vídeo</span></div>';">
                        <source src="${firstMedia.url}" type="${videoMimeType}">
                        <source src="${firstMedia.url}" type="video/mp4">
                        Seu navegador não suporta vídeo.
                    </video>
                    <div class="video-play-button">
                        <i class="fas fa-play"></i>
                    </div>
                </div>
            `;
        }else {
            mediaElement = `
                <img src="${firstMedia.url}" alt="${post.title}" class="media-preview"
                     onerror="this.style.display='none'; this.parentElement.innerHTML='<div class=&quot;media-preview-placeholder&quot;><i class=&quot;fas fa-image&quot;></i></div>';">
            `;
        }
    } else {
        mediaElement = `
            <div class="media-preview-placeholder">
                <i class="fas fa-image"></i>
            </div>
        `;
    }
    
    const createdAt = post.createdAt && post.createdAt.toDate ? 
        post.createdAt.toDate().toLocaleDateString('pt-BR') : 
        'Data não disponível';
    
    card.innerHTML = `
        <div class="media-preview-container">
            ${mediaElement}
            <div class="media-overlay">
                <div class="media-count">
                    <i class="fas fa-images"></i>
                    ${mediaCount}
                </div>
            </div>
        </div>
        <div class="media-info">
            <h3 class="media-title">${post.title}</h3>
            <p class="media-description">${post.description || ''}</p>
            <div class="media-meta">
                <span class="media-date">
                    <i class="fas fa-calendar"></i>
                    ${createdAt}
                </span>
            </div>
        </div>
    `;
    
    // Adicionar evento de clique para abrir galeria
    card.addEventListener('click', () => {
        window.location.href = 'pages/galeria-midia.html';
    });
    
    return card;
}

async function loadFeaturedMedia() {
    const container = document.getElementById('featured-media-container');
    const loading = document.getElementById('featured-media-loading');
    
    if (!container || !loading) return;
    
    try {
        const docRef = doc(db, 'site_config', 'featured_media');
        const docSnap = await getDoc(docRef);
        
        container.innerHTML = '';
        
        if (docSnap.exists() && docSnap.data().media && docSnap.data().media.length > 0) {
            const featuredMedia = docSnap.data().media;
            
            featuredMedia.forEach(media => {
                const mediaCard = createFeaturedMediaCard(media);
                container.appendChild(mediaCard);
            });
        } else {
            container.innerHTML = `
                <div class="no-featured-message">
                    <i class="fas fa-star"></i>
                    <p>Nenhuma mídia em destaque configurada</p>
                </div>
            `;
        }
        
    } catch (error) {
        console.error('Erro ao carregar mídia em destaque:', error);
        container.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Erro ao carregar mídia em destaque</p>
            </div>
        `;
    } finally {
        loading.style.display = 'none';
        container.style.display = 'flex';
    }
}

function createFeaturedMediaCard(media) {
    const card = document.createElement('div');
    card.className = 'featured-media-card';
      const mediaType = media.type || '';
    const isVideo = isVideoFile(media.url, mediaType);
    
    let mediaElement = '';
    if (isVideo) {
        const videoMimeType = getVideoMimeType(media.url, mediaType);
        const videoId = 'featured-video-' + Math.random().toString(36).substring(2, 10);
        mediaElement = `
            <div class="video-container">
                <video id="${videoId}" class="featured-media-content plyr__video" preload="none" playsinline
                       data-poster="${media.thumbnail || ''}"
                       onloadstart="this.style.opacity='1'"
                       onerror="this.parentNode.innerHTML='<div class=&quot;featured-media-placeholder video-error&quot;><i class=&quot;fas fa-exclamation-triangle&quot;></i><p>Erro ao carregar vídeo</p></div>';">
                    <source src="${media.url}" type="${videoMimeType}">
                    <source src="${media.url}" type="video/mp4">
                    <source src="${media.url}" type="video/webm">
                    Seu navegador não suporta vídeos.
                </video>
                <div class="video-play-overlay" onclick="this.style.display='none'; document.getElementById('${videoId}').play();">
                    <i class="fas fa-play"></i>
                </div>
            </div>
        `;
    }else {
        mediaElement = `
            <img src="${media.url}" alt="${media.title}" class="featured-media-content"
                 onerror="this.style.display='none'; this.parentElement.innerHTML='<div class=&quot;featured-media-placeholder&quot;><i class=&quot;fas fa-image&quot;></i></div>';">
        `;
    }
    
    card.innerHTML = `
        <div class="featured-media-wrapper">
            ${mediaElement}
            <div class="featured-overlay">
                <div class="featured-badge">
                    <i class="fas fa-star"></i>
                    DESTAQUE
                </div>
            </div>
        </div>
        <div class="featured-info">
            <h3 class="featured-title">${media.title}</h3>
            <p class="featured-description">${media.description}</p>
            <button class="btn-view-featured" onclick="openFeaturedModal('${media.url}', '${media.type}', '${media.title}', '${media.description}')">
                <i class="fas fa-expand"></i>
                Ver em Tela Cheia
            </button>
        </div>
    `;
    
    return card;
}

// Função global para abrir modal de mídia em destaque
window.openFeaturedModal = function(url, type, title, description) {
    // Limpar qualquer modal existente
    const existingModal = document.querySelector('.featured-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Criar modal
    const modal = document.createElement('div');
    modal.className = 'featured-modal';
    
    const isVid = isVideoFile(url, type);
    const videoId = isVid ? 'modal-video-' + Math.random().toString(36).substring(2, 10) : '';
    
    modal.innerHTML = `
        <div class="featured-modal-content">
            <div class="featured-modal-header">
                <h2>${title}</h2>
                <button class="featured-modal-close" onclick="closeFeaturedModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="featured-modal-body">
                ${isVid ? 
                    `<div class="video-container">
                        <video id="${videoId}" controls preload="none" playsinline class="featured-modal-media plyr__video"
                                onerror="this.parentNode.innerHTML='<div class=&quot;video-error-message&quot;><i class=&quot;fas fa-exclamation-triangle&quot;></i><p>Erro ao carregar vídeo</p><div class=&quot;video-fallback&quot;><p>Tente uma das alternativas:</p><a href=&quot;${url}&quot; target=&quot;_blank&quot; class=&quot;video-download-link&quot;>Baixar vídeo</a> <a href=&quot;javascript:void(0);&quot; onclick=&quot;document.getElementById(\'${videoId}-fallback\').innerHTML=\'<iframe src=//video.goo.gl/c/embed?url=\'+encodeURIComponent(\'${url}\')+\'&type=.mp4\' allowfullscreen style=width:100%;height:300px;border:0;></iframe>\'&quot; class=&quot;video-convert-link&quot;>Converter & Assistir Online</a></div></div>';">
                            <source src="${url}" type="${getVideoMimeType(url, type)}">
                            <source src="${url}" type="video/mp4">
                            <source src="${url}" type="video/webm">
                            <source src="${url}" type="video/ogg">
                            Seu navegador não suporta a reprodução deste vídeo.
                        </video>
                        <div id="${videoId}-fallback" class="video-fallback-container"></div>
                    </div>` :
                    `<img src="${url}" alt="${title}" class="featured-modal-media">`
                }
                <p class="featured-modal-description">${description}</p>
            </div>
        </div>
        <div class="featured-modal-backdrop" onclick="closeFeaturedModal()"></div>
    `;
    
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    
    // Adicionar evento de teclado
    document.addEventListener('keydown', handleModalKeydown);
    
    // Inicializar o player Plyr para vídeos
    if (isVid) {
        setTimeout(() => {
            const videoElement = document.getElementById(videoId);
            if (videoElement) {
                try {
                    new Plyr(videoElement, {
                        controls: ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'fullscreen'],
                        autoplay: false,
                        muted: false,
                        loadSprite: false,
                        iconUrl: 'https://cdn.plyr.io/3.7.8/plyr.svg',
                        blankVideo: '',
                        i18n: {
                            restart: 'Reiniciar',
                            play: 'Reproduzir',
                            pause: 'Pausar',
                            mute: 'Silenciar',
                            unmute: 'Ativar som',
                            enterFullscreen: 'Tela cheia',
                            exitFullscreen: 'Sair da tela cheia'
                        }
                    });
                } catch (e) {
                    console.error('Erro ao inicializar Plyr:', e);
                }
            }
        }, 100);    }
};

window.closeFeaturedModal = function() {
    const modal = document.querySelector('.featured-modal');
    if (modal) {
        // Pausa qualquer vídeo que esteja sendo reproduzido
        const videoElement = modal.querySelector('video');
        if (videoElement) {
            try {
                videoElement.pause();
                // Se tiver uma instância do Plyr associada
                if (videoElement.plyrInstance) {
                    videoElement.plyrInstance.destroy();
                }
            } catch (e) {
                console.error('Erro ao pausar vídeo:', e);
            }
        }
        
        // Limpar qualquer iframe que possa estar sendo usado como fallback
        const iframes = modal.querySelectorAll('iframe');
        iframes.forEach(iframe => {
            try {
                iframe.src = '';
            } catch (e) {}
        });
        
        modal.remove();
        document.body.style.overflow = '';
        document.removeEventListener('keydown', handleModalKeydown);
    }
};

function handleModalKeydown(event) {
    if (event.key === 'Escape') {
        closeFeaturedModal();
    }
}

// Funções auxiliares para detecção de vídeo
function isVideoFile(url, mimeType) {
    if (!url) return false;
    
    // Verificar MIME type primeiro
    if (mimeType && mimeType.startsWith('video/')) {
        return true;
    }
    
    // Verificar por palavras-chave no tipo
    if (mimeType === 'video' || mimeType === 'Video') {
        return true;
    }
    
    // Verificar extensão do arquivo na URL
    const videoExtensions = /\.(mp4|webm|ogg|avi|mov|mkv|wmv|flv|m4v|3gp)(\?|#|$)/i;
    if (videoExtensions.test(url)) {
        return true;
    }
    
    // Verificar se é um data URL de vídeo
    if (url.startsWith('data:video/')) {
        return true;
    }
    
    return false;
}

function getVideoMimeType(url, originalMimeType) {
    // Se já temos um MIME type válido, usar ele
    if (originalMimeType && originalMimeType.startsWith('video/')) {
        return originalMimeType;
    }
    
    // Detectar por extensão
    if (/\.mp4(\?|#|$)/i.test(url)) {
        return 'video/mp4';
    } else if (/\.webm(\?|#|$)/i.test(url)) {
        return 'video/webm';
    } else if (/\.ogg(\?|#|$)/i.test(url)) {
        return 'video/ogg';
    } else if (/\.avi(\?|#|$)/i.test(url)) {
        return 'video/avi';
    } else if (/\.mov(\?|#|$)/i.test(url)) {
        return 'video/quicktime';
    } else if (/\.mkv(\?|#|$)/i.test(url)) {
        return 'video/x-matroska';
    } else if (/\.wmv(\?|#|$)/i.test(url)) {
        return 'video/x-ms-wmv';
    } else if (/\.flv(\?|#|$)/i.test(url)) {
        return 'video/x-flv';
    } else if (/\.m4v(\?|#|$)/i.test(url)) {
        return 'video/mp4';
    } else if (/\.3gp(\?|#|$)/i.test(url)) {
        return 'video/3gpp';
    }
    
    // Fallback para MP4 se não conseguir detectar
    return 'video/mp4';
}
