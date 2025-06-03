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
    
    // Criar modal
    const modal = document.createElement('div');
    modal.className = 'featured-modal';      const isVid = isVideoFile(url, type);
    
    modal.innerHTML = `
        <div class="featured-modal-content">
            <div class="featured-modal-header">
                <h2>${title}</h2>
                <button class="featured-modal-close" onclick="closeFeaturedModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="featured-modal-body">
                ${isVid && window.videoProcessor ? 
                    (() => {
                        const videoInfo = window.videoProcessor.processVideoUrl(url, type);
                        return videoInfo ? 
                            window.videoProcessor.generateVideoHtml(videoInfo, {
                                width: '100%',
                                height: '400px',
                                controls: true,
                                className: 'featured-modal-media'
                            }) : 
                            `<div class="video-error-message">
                                <i class="fas fa-exclamation-triangle"></i>
                                <p>Erro ao processar vídeo</p>
                                <div class="video-fallback">
                                    <p>Tente acessar diretamente:</p>
                                    <a href="${url}" target="_blank" class="video-download-link">Abrir vídeo</a>
                                </div>
                            </div>`;
                    })() :
                    isVid ? 
                    `<div class="video-container">
                        <video controls preload="metadata" playsinline class="featured-modal-media"
                                onerror="this.parentNode.innerHTML='<div class=&quot;video-error-message&quot;><i class=&quot;fas fa-exclamation-triangle&quot;></i><p>Erro ao carregar vídeo</p><div class=&quot;video-fallback&quot;><p>Tente baixar o arquivo:</p><a href=&quot;${url}&quot; target=&quot;_blank&quot; class=&quot;video-download-link&quot;>Baixar vídeo</a></div></div>';">
                            <source src="${url}" type="video/mp4">
                            <source src="${url}" type="video/webm">
                            <source src="${url}">
                            Seu navegador não suporta a reprodução deste vídeo.
                        </video>
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
};

window.closeFeaturedModal = function() {
    const modal = document.querySelector('.featured-modal');
    if (modal) {
        // Pausa qualquer vídeo que esteja sendo reproduzido
        const videoElement = modal.querySelector('video');
        if (videoElement) {
            try {
                videoElement.pause();
                videoElement.currentTime = 0;
            } catch (e) {
                console.error('Erro ao pausar vídeo:', e);
            }
        }
        
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

// Handler específico para vídeos na página principal
function setupVideoHandlers() {
    document.addEventListener('click', function(e) {
        const videoContainer = e.target.closest('.video-container, .video-preview-container');
        const video = videoContainer?.querySelector('video');
        
        if (video && videoContainer && !e.target.closest('.btn-view-featured')) {
            e.preventDefault();
            e.stopPropagation();
            
            // Se o vídeo estiver pausado, reproduzir
            if (video.paused) {
                video.play().catch(err => {
                    console.log('Erro ao reproduzir vídeo:', err);
                    // Fallback: tentar carregar o vídeo
                    video.load();
                    setTimeout(() => {
                        video.play().catch(() => {
                            console.log('Vídeo não pode ser reproduzido automaticamente');
                        });
                    }, 100);
                });
            } else {
                video.pause();
            }
        }
    });
}

// Funções auxiliares para detecção de vídeo usando o novo sistema
function isVideoFile(url, mimeType) {
    if (!window.videoProcessor) {
        console.warn('VideoProcessor não está disponível, usando detecção básica');
        return basicVideoDetection(url, mimeType);
    }
    
    return window.videoProcessor.isVideo(url, mimeType);
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
