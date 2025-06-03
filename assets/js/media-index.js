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
    const mediaCount = post.media ? post.media.length : 0;
      let mediaElement = '';
    if (firstMedia) {
        // Melhor detecção de tipo de mídia
        const isVideo = firstMedia.type && (
            firstMedia.type.startsWith('video/') || 
            firstMedia.type === 'video' ||
            /\.(mp4|webm|ogg|avi|mov)(\?|$)/i.test(firstMedia.url)
        );
        
        if (isVideo) {
            mediaElement = `
                <video class="media-preview" muted preload="metadata">
                    <source src="${firstMedia.url}" type="video/mp4">
                    Seu navegador não suporta vídeo.
                </video>
            `;
        } else {
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
            
            // Inicializar autoplay após carregar as mídias
            setTimeout(() => {
                initFeaturedVideoAutoplay();
            }, 1000);
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
    card.setAttribute('data-media-type', media.type);
    
    const mediaType = media.type || '';
    
    let mediaElement = '';
    if (mediaType === 'video/youtube') {
        mediaElement = `
            <div class="featured-media-content youtube-container" data-video-url="${media.url}">
                <iframe width="100%" height="100%" 
                    src="${media.url}?enablejsapi=1&autoplay=0&mute=1&modestbranding=1" 
                    frameborder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen>
                </iframe>
            </div>
        `;
    } else if (mediaType === 'video/vimeo') {
        mediaElement = `
            <div class="featured-media-content vimeo-container" data-video-url="${media.url}">
                <iframe width="100%" height="100%" 
                    src="${media.url}?autoplay=0&muted=1" 
                    frameborder="0" 
                    allow="autoplay; fullscreen; picture-in-picture" 
                    allowfullscreen>
                </iframe>
            </div>
        `;
    } else if (mediaType.startsWith('video/') || mediaType === 'video') {
        mediaElement = `
            <video class="featured-media-content video-player" controls muted preload="metadata" data-video-url="${media.url}">
                <source src="${media.url}" type="${mediaType.startsWith('video/') ? mediaType : 'video/mp4'}">
            </video>
        `;
    } else {
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
    // Criar modal
    const modal = document.createElement('div');
    modal.className = 'featured-modal';
    modal.innerHTML = `
        <div class="featured-modal-content">
            <div class="featured-modal-header">
                <h2>${title}</h2>
                <button class="featured-modal-close" onclick="closeFeaturedModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="featured-modal-body">
                ${type === 'video' ? 
                    `<video controls autoplay class="featured-modal-media">
                        <source src="${url}" type="video/mp4">
                    </video>` :
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

// Sistema de autoplay com scroll para vídeos em destaque
let featuredVideoObserver;

function initFeaturedVideoAutoplay() {
    if (!window.IntersectionObserver) return;
    
    // Configurar o observer para detectar quando vídeos entram/saem da tela
    featuredVideoObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const card = entry.target;
            const mediaType = card.getAttribute('data-media-type');
            
            if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
                // Vídeo está visível (mais de 50% na tela)
                playFeaturedVideo(card, mediaType);
            } else {
                // Vídeo saiu da tela ou está pouco visível
                pauseFeaturedVideo(card, mediaType);
            }
        });
    }, {
        threshold: [0.25, 0.5, 0.75], // Múltiplos thresholds para melhor controle
        rootMargin: '0px 0px -10% 0px' // Margem inferior para começar a pausar um pouco antes
    });
    
    // Observar todos os cards de mídia em destaque
    observeFeaturedVideos();
}

function observeFeaturedVideos() {
    const featuredCards = document.querySelectorAll('.featured-media-card');
    featuredCards.forEach(card => {
        const mediaType = card.getAttribute('data-media-type');
        if (mediaType && (mediaType.includes('video') || mediaType === 'video/youtube' || mediaType === 'video/vimeo')) {
            featuredVideoObserver.observe(card);
        }
    });
}

function playFeaturedVideo(card, mediaType) {
    try {
        if (mediaType === 'video/youtube') {
            const iframe = card.querySelector('iframe');
            if (iframe) {
                // Para YouTube, enviamos comando via postMessage
                iframe.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
            }
        } else if (mediaType === 'video/vimeo') {
            const iframe = card.querySelector('iframe');
            if (iframe) {
                // Para Vimeo, enviamos comando via postMessage
                iframe.contentWindow.postMessage('{"method":"play"}', '*');
            }
        } else if (mediaType.startsWith('video/') || mediaType === 'video') {
            const video = card.querySelector('video');
            if (video) {
                video.muted = true; // Garantir que está mutado para autoplay
                video.play().catch(e => console.log('Autoplay bloqueado:', e));
            }
        }
    } catch (error) {
        console.log('Erro ao reproduzir vídeo:', error);
    }
}

function pauseFeaturedVideo(card, mediaType) {
    try {
        if (mediaType === 'video/youtube') {
            const iframe = card.querySelector('iframe');
            if (iframe) {
                iframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
            }
        } else if (mediaType === 'video/vimeo') {
            const iframe = card.querySelector('iframe');
            if (iframe) {
                iframe.contentWindow.postMessage('{"method":"pause"}', '*');
            }
        } else if (mediaType.startsWith('video/') || mediaType === 'video') {
            const video = card.querySelector('video');
            if (video) {
                video.pause();
            }
        }
    } catch (error) {
        console.log('Erro ao pausar vídeo:', error);
    }
}

// Iniciar autoplay com scroll quando o DOM estiver totalmente carregado
document.addEventListener('DOMContentLoaded', initFeaturedVideoAutoplay);
