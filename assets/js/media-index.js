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

// Função para extrair ID do YouTube de uma URL
function extractYouTubeID(url) {
    if (!url) return null;
    
    // Padrões de URL do YouTube
    const patterns = [
        /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&]+)/i,
        /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([^?]+)/i,
        /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^?]+)/i,
        /(?:https?:\/\/)?(?:www\.)?youtube\.com\/v\/([^?]+)/i
    ];
    
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }
    
    return null;
}

// Sistema de autoplay com scroll para vídeos em destaque
function setupFeaturedVideoAutoplay() {
    // Encontrar todos os vídeos em destaque
    const featuredVideos = document.querySelectorAll('.featured-media-content');
    
    // Configurar o Intersection Observer
    const videoObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            // Verificar se é um elemento de vídeo válido
            if (entry.target.tagName === 'VIDEO') {
                if (entry.isIntersecting) {
                    // Vídeo está visível na tela
                    entry.target.play().catch(e => console.log('Erro ao reproduzir vídeo:', e));
                } else {
                    // Vídeo está fora da tela
                    entry.target.pause();
                }
            } else if (entry.target.tagName === 'IFRAME' && entry.target.src.includes('youtube')) {
                // Manipular iframes do YouTube
                if (entry.isIntersecting) {
                    // YouTube está visível na tela, adicionar parâmetro de autoplay
                    const currentSrc = entry.target.src;
                    if (!currentSrc.includes('autoplay=1')) {
                        entry.target.src = currentSrc.includes('?') 
                            ? `${currentSrc}&autoplay=1&mute=1` 
                            : `${currentSrc}?autoplay=1&mute=1`;
                    }
                } else {
                    // YouTube está fora da tela, pausar (recarregar sem autoplay)
                    const currentSrc = entry.target.src.replace(/[?&]autoplay=1/, '');
                    if (entry.target.src !== currentSrc) {
                        entry.target.src = currentSrc;
                    }
                }
            }
        });
    }, {
        threshold: 0.5 // 50% do vídeo deve estar visível
    });
    
    // Observar cada vídeo
    featuredVideos.forEach(video => {
        videoObserver.observe(video);
    });
}

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    loadRecentMedia();
    loadFeaturedMedia().then(() => {
        // Configurar autoplay com scroll para vídeos em destaque após carregamento
        setupFeaturedVideoAutoplay();
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
    
    // Verificar se é um vídeo do YouTube
    const youtubeID = media.youtubeID || (media.type === 'video/youtube' ? extractYouTubeID(media.url) : null);
    
    const mediaType = media.type || '';
    const isVideo = mediaType.startsWith('video/') || 
                   mediaType === 'video' ||
                   /\.(mp4|webm|ogg|avi|mov)$/i.test(media.url);
    
    let mediaElement = '';
    
    if (youtubeID) {
        // É um vídeo do YouTube
        mediaElement = `
            <iframe 
                class="featured-media-content youtube-embed" 
                src="https://www.youtube.com/embed/${youtubeID}?rel=0&mute=1" 
                title="YouTube video" 
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen
            ></iframe>
        `;
    } else if (isVideo) {
        mediaElement = `
            <video class="featured-media-content" controls muted preload="metadata" playsinline loop>
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
            <button class="btn-view-featured" onclick="openFeaturedModal('${media.url}', '${youtubeID ? 'video/youtube' : media.type}', '${media.title}', '${media.description}', '${youtubeID || ''}')">
                <i class="fas fa-expand"></i>
                Ver em Tela Cheia
            </button>
        </div>
    `;
    
    return card;
}

// Função global para abrir modal de mídia em destaque
window.openFeaturedModal = function(url, type, title, description, youtubeID) {
    // Criar modal
    const modal = document.createElement('div');
    modal.className = 'featured-modal';
    
    // Determinar qual tipo de mídia mostrar
    let mediaContent;
    
    if (type === 'video/youtube' && youtubeID) {
        // YouTube
        mediaContent = `
            <iframe 
                class="featured-modal-media" 
                src="https://www.youtube.com/embed/${youtubeID}?rel=0&autoplay=1" 
                title="YouTube video" 
                frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen
            ></iframe>
        `;
    } else if (type === 'video' || type.startsWith('video/')) {
        // Vídeo normal
        mediaContent = `
            <video controls autoplay class="featured-modal-media">
                <source src="${url}" type="${type.startsWith('video/') ? type : 'video/mp4'}">
            </video>
        `;
    } else {
        // Imagem padrão
        mediaContent = `<img src="${url}" alt="${title}" class="featured-modal-media">`;
    }
    
    modal.innerHTML = `
        <div class="featured-modal-content">
            <div class="featured-modal-header">
                <h2>${title}</h2>
                <button class="featured-modal-close" onclick="closeFeaturedModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="featured-modal-body">
                ${mediaContent}
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
