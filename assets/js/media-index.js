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

// Importar os ajudantes de vídeo
import { safePlayVideo, isVideo } from './video-helpers.js';

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    loadRecentMedia();
    loadFeaturedMedia();
    setupVideoHandlers();
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
        const isVideo = isVideoFile(firstMedia.url, firstMedia.type);        if (isVideo) {
            // Usar o novo sistema de processamento de vídeos
            if (window.videoProcessor) {
                const videoInfo = window.videoProcessor.processVideoUrl(firstMedia.url, firstMedia.type);
                
                if (videoInfo) {
                    if (videoInfo.thumbnailUrl) {
                        // Usar thumbnail do YouTube ou outra plataforma
                        mediaElement = `
                            <div class="video-preview-container">
                                <img src="${videoInfo.thumbnailUrl}" alt="${post.title}" class="media-preview"
                                     onerror="this.parentNode.innerHTML='${window.videoProcessor.generatePlaceholderThumbnail(videoInfo, {showPlayButton: true}).replace(/'/g, '\\\'')}';">
                                <div class="video-play-button">
                                    <i class="fas fa-play"></i>
                                </div>
                            </div>
                        `;
                    } else {
                        // Usar placeholder personalizado
                        mediaElement = `
                            <div class="video-preview-container">
                                ${window.videoProcessor.generatePlaceholderThumbnail(videoInfo, {showPlayButton: true})}
                            </div>
                        `;
                    }
                } else {
                    // Fallback para vídeos não processáveis
                    mediaElement = `
                        <div class="video-preview-container">
                            <div class="media-preview-placeholder video-error">
                                <i class="fas fa-video"></i>
                                <span>Vídeo</span>
                            </div>
                        </div>
                    `;
                }
            } else {
                // Fallback se o VideoProcessor não estiver disponível
                mediaElement = `
                    <div class="video-preview-container">
                        <video class="media-preview" muted preload="metadata" playsinline
                               poster="${firstMedia.thumbnail || ''}"
                               onloadstart="this.style.opacity='1'"
                               onerror="this.parentNode.innerHTML='<div class=&quot;media-preview-placeholder video-error&quot;><i class=&quot;fas fa-exclamation-triangle&quot;></i><span>Erro no vídeo</span></div>';">
                            <source src="${firstMedia.url}" type="video/mp4">
                            <source src="${firstMedia.url}" type="video/webm">
                            <source src="${firstMedia.url}">
                            Seu navegador não suporta vídeo.
                        </video>
                        <div class="video-play-button">
                            <i class="fas fa-play"></i>
                        </div>
                    </div>
                `;
            }
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
    
    let mediaElement = '';    if (isVideo) {
        // Usar o novo sistema de processamento de vídeos
        if (window.videoProcessor) {
            const videoInfo = window.videoProcessor.processVideoUrl(media.url, media.type);
            
            if (videoInfo) {
                if (videoInfo.thumbnailUrl) {
                    // Usar thumbnail do YouTube ou outra plataforma  
                    mediaElement = `
                        <div class="video-container">
                            <img src="${videoInfo.thumbnailUrl}" alt="${media.title}" class="featured-media-content"
                                 onerror="this.parentNode.innerHTML='${window.videoProcessor.generatePlaceholderThumbnail(videoInfo, {showPlayButton: true}).replace(/'/g, '\\\'')}';">
                            <div class="video-play-overlay" onclick="this.style.display='none'; this.previousElementSibling.play();">
                                <i class="fas fa-play"></i>
                            </div>
                        </div>
                    `;
                } else {
                    // Usar placeholder personalizado
                    mediaElement = `
                        <div class="video-container">
                            ${window.videoProcessor.generatePlaceholderThumbnail(videoInfo, {showPlayButton: true})}
                        </div>
                    `;
                }
            } else {
                // Fallback para vídeos não processáveis
                mediaElement = `
                    <div class="video-container">
                        <div class="featured-media-placeholder video-error">
                            <i class="fas fa-video"></i>
                            <p>Vídeo</p>
                        </div>
                    </div>
                `;
            }
        } else {
            // Fallback se o VideoProcessor não estiver disponível
            mediaElement = `
                <div class="video-container">
                    <video class="featured-media-content" preload="metadata" playsinline
                           poster="${media.thumbnail || ''}"
                           onloadstart="this.style.opacity='1'"
                           onerror="this.parentNode.innerHTML='<div class=&quot;featured-media-placeholder video-error&quot;><i class=&quot;fas fa-exclamation-triangle&quot;></i><p>Erro ao carregar vídeo</p></div>';">
                        <source src="${media.url}" type="video/mp4">
                        <source src="${media.url}" type="video/webm">
                        <source src="${media.url}">
                        Seu navegador não suporta vídeos.
                    </video>
                    <div class="video-play-overlay" onclick="this.style.display='none'; this.previousElementSibling.play();">
                        <i class="fas fa-play"></i>
                    </div>
                </div>
            `;
        }
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
    
    // Decodificar parâmetros para lidar com caracteres especiais
    const decodedUrl = decodeURIComponent(url || '');
    const decodedType = decodeURIComponent(type || '');
    const decodedTitle = decodeURIComponent(title || 'Mídia em Destaque');
    const decodedDescription = decodeURIComponent(description || '');
    
    // Criar modal
    const modal = document.createElement('div');
    modal.className = 'featured-modal';
    
    // Verificar se é um vídeo
    const isVid = isVideoFile(decodedUrl, decodedType);
    
    // Usar o template literal com uma função para garantir segurança na geração do HTML
    const createModalContent = () => {
        const header = `
            <div class="featured-modal-content">
                <div class="featured-modal-header">
                    <h2>${escapeHtml(decodedTitle)}</h2>
                    <button class="featured-modal-close" onclick="closeFeaturedModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="featured-modal-body">
        `;
        
        let mediaContent = '';
        
        // Gerar conteúdo de mídia com base no tipo
        if (isVid && window.videoProcessor) {
            const videoInfo = window.videoProcessor.processVideoUrl(decodedUrl, decodedType);
            if (videoInfo) {
                mediaContent = window.videoProcessor.generateVideoHtml(videoInfo, {
                    width: '100%',
                    height: '400px',
                    controls: true,
                    className: 'featured-modal-media video-modal-player'
                });
            } else {
                mediaContent = `
                    <div class="video-error-container">
                        <i class="fas fa-exclamation-triangle"></i>
                        <h3>Erro ao processar vídeo</h3>
                        <p>Não foi possível processar este vídeo.</p>
                        <div class="error-actions">
                            <a href="${escapeHtml(decodedUrl)}" target="_blank" class="error-btn">
                                <i class="fas fa-external-link-alt"></i> Abrir vídeo original
                            </a>
                        </div>
                    </div>
                `;
            }
        } else if (isVid) {
            // Fallback para vídeo básico quando o VideoProcessor não está disponível
            mediaContent = `
                <div class="video-container direct-video-container">
                    <video 
                        controls 
                        preload="metadata" 
                        playsinline 
                        class="featured-modal-media video-modal-player"
                        src="${escapeHtml(decodedUrl)}">
                        <source src="${escapeHtml(decodedUrl)}" type="video/mp4">
                        <source src="${escapeHtml(decodedUrl)}" type="video/webm">
                        <source src="${escapeHtml(decodedUrl)}">
                        Seu navegador não suporta a reprodução deste vídeo.
                    </video>
                    <div class="video-error-fallback hidden">
                        <i class="fas fa-exclamation-triangle"></i>
                        <p>Erro ao carregar vídeo</p>
                        <div class="video-fallback">
                            <p>Tente acessar diretamente:</p>
                            <a href="${escapeHtml(decodedUrl)}" target="_blank">Abrir vídeo</a>
                        </div>
                    </div>
                </div>
            `;
        } else {
            // Imagem
            mediaContent = `
                <img 
                    src="${escapeHtml(decodedUrl)}" 
                    alt="${escapeHtml(decodedTitle)}" 
                    class="featured-modal-media"
                    onerror="this.onerror=null; this.src='assets/images/placeholder.jpg';"
                >
            `;
        }
        
        const footer = `
                    <p class="featured-modal-description">${escapeHtml(decodedDescription)}</p>
                </div>
            </div>
            <div class="featured-modal-backdrop" onclick="closeFeaturedModal()"></div>
        `;
        
        return header + mediaContent + footer;
    };
    
    // Definir o conteúdo do modal
    modal.innerHTML = createModalContent();
    
    // Adicionar ao DOM
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    
    // Adicionar evento de teclado
    document.addEventListener('keydown', handleModalKeydown);
    
    // Adicionar classe para animação após um pequeno delay
    setTimeout(() => {
        modal.classList.add('active');
    }, 10);
    
    // Inicializar players de vídeo
    if (window.initVideoPlayers) {
        setTimeout(window.initVideoPlayers, 300);
    }
    
    // Adicionar tratamento de erros para vídeos
    const videoElements = modal.querySelectorAll('video');
    videoElements.forEach(video => {
        video.addEventListener('error', function() {
            const errorFallback = this.parentElement.querySelector('.video-error-fallback');
            if (errorFallback) {
                errorFallback.classList.remove('hidden');
            }
            this.style.display = 'none';
        });
    });
};

// Função auxiliar para escapar HTML
function escapeHtml(unsafe) {
    if (typeof unsafe !== 'string') return '';
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

window.closeFeaturedModal = function() {
    const modal = document.querySelector('.featured-modal');
    if (modal) {
        // Primeiro remover a classe 'active' para iniciar a animação de saída
        modal.classList.remove('active');
        
        // Pausar qualquer vídeo que esteja sendo reproduzido
        const videoElements = modal.querySelectorAll('video');
        videoElements.forEach(videoElement => {
            if (videoElement) {
                try {
                    videoElement.pause();
                    videoElement.currentTime = 0;
                } catch (e) {
                    console.error('Erro ao pausar vídeo:', e);
                }
            }
        });
        
        // Pausar também vídeos em iframe (YouTube, Vimeo)
        const iframes = modal.querySelectorAll('iframe');
        iframes.forEach(iframe => {
            try {
                // Tentar pausar com mensagem postMessage
                const src = iframe.src;
                if (src.includes('youtube.com')) {
                    iframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
                } else if (src.includes('vimeo.com')) {
                    iframe.contentWindow.postMessage('{"method":"pause"}', '*');
                }
            } catch (e) {
                console.warn('Não foi possível pausar iframe:', e);
            }
        });
        
        // Aguardar a animação terminar antes de remover o modal
        setTimeout(() => {
            modal.remove();
            document.body.style.overflow = '';
            document.removeEventListener('keydown', handleModalKeydown);
        }, 300); // 300ms é a duração da transição
    }
};

function handleModalKeydown(event) {
    if (event.key === 'Escape') {
        closeFeaturedModal();
    }
}

// Handler específico para vídeos na página principal
function setupVideoHandlers() {
    document.addEventListener('click', function(e) {
        const videoContainer = e.target.closest('.video-container, .video-preview-container');
        const video = videoContainer?.querySelector('video');
        
        if (video && videoContainer && !e.target.closest('.btn-view-featured')) {
            e.preventDefault();
            e.stopPropagation();
            
            // Usar a flag para evitar reproduções sobrepostas
            if (!video._isPlayingHandled) {
                video._isPlayingHandled = true;
                
                if (video.paused) {
                    // Usar o helper de reprodução segura
                    safePlayVideo(video)
                        .then(() => {
                            // Sucesso - o vídeo está reproduzindo
                            videoContainer.classList.add('playing');
                        })
                        .catch(err => {
                            console.warn('Não foi possível reproduzir o vídeo:', err.message);
                        })
                        .finally(() => {
                            video._isPlayingHandled = false;
                        });                } else {
                    // Pausar o vídeo
                    video.pause();
                    videoContainer.classList.remove('playing');
                    video._isPlayingHandled = false;
                }
            }
        }
    });
}

// Funções auxiliares para detecção de vídeo usando o novo sistema
function isVideoFile(url, mimeType) {
    // Tentar usar o VideoProcessor se disponível
    try {
        if (window.videoProcessor) {
            return window.videoProcessor.isVideo(url, mimeType);
        }
    } catch (e) {
        console.warn('Erro ao usar VideoProcessor:', e.message);
    }
    
    console.warn('VideoProcessor não está disponível, usando detecção básica');
    return basicVideoDetection(url, mimeType);
}

// Fallback para detecção básica de vídeo (caso o VideoProcessor não esteja carregado)
function basicVideoDetection(url, mimeType) {
    if (!url) return false;
    
    // Verificar MIME type primeiro
    if (mimeType && (mimeType.startsWith('video/') || mimeType.toLowerCase() === 'video')) {
        return true;
    }
    
    // Verificar plataformas de vídeo conhecidas
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be') || 
        lowerUrl.includes('vimeo.com') || lowerUrl.includes('drive.google.com')) {
        return true;
    }
    
    // Verificar extensões de vídeo
    const videoExtensions = /\.(mp4|webm|ogg|avi|mov|mkv|wmv|flv|m4v|3gp)(\?|#|$)/i;
    return videoExtensions.test(url) || url.startsWith('data:video/');
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
