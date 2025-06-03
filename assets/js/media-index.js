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
    loadRecentVideos(); // Adicionar carregamento de vídeos recentes
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

// Nova função para carregar vídeos recentes
async function loadRecentVideos() {
    const container = document.getElementById('recent-videos-grid');
    const loading = document.getElementById('recent-videos-loading');
    
    if (!container || !loading) return;
    
    try {
        // Buscar vídeos recentes
        const q = query(
            collection(db, 'videos'), 
            orderBy('uploadedAt', 'desc'), 
            limit(4)
        );
        
        const querySnapshot = await getDocs(q);
        
        container.innerHTML = '';
        
        if (querySnapshot.empty) {
            container.innerHTML = `
                <div class="no-media-message">
                    <i class="fas fa-video"></i>
                    <p>Nenhum vídeo encontrado</p>
                </div>
            `;
        } else {
            querySnapshot.forEach(doc => {
                const video = { id: doc.id, ...doc.data() };
                const videoElement = createVideoCard(video);
                container.appendChild(videoElement);
            });
        }
        
    } catch (error) {
        console.error('Erro ao carregar vídeos recentes:', error);
        container.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Erro ao carregar vídeos</p>
            </div>
        `;
    } finally {
        loading.style.display = 'none';
        container.style.display = 'grid';
    }
}

function createVideoCard(video) {
    const card = document.createElement('div');
    card.className = 'video-card';
    
    // Determinar fonte da miniatura e tipo de vídeo
    let thumbnailUrl = '';
    let videoUrl = '';
    let videoTitle = video.title || 'Vídeo sem título';
    let platformIcon = '';
    
    if (video.platform === 'youtube') {
        thumbnailUrl = video.thumbnailUrl || `https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`;
        videoUrl = `https://www.youtube.com/watch?v=${video.videoId}`;
        platformIcon = '<i class="fab fa-youtube" style="color: #FF0000;"></i>';
    } else if (video.platform === 'vimeo') {
        thumbnailUrl = video.thumbnailUrl;
        videoUrl = `https://vimeo.com/${video.videoId}`;
        platformIcon = '<i class="fab fa-vimeo-v" style="color: #1AB7EA;"></i>';
    } else if (video.url) {
        thumbnailUrl = video.thumbnailUrl || '';
        videoUrl = video.url;
        platformIcon = '<i class="fas fa-play-circle"></i>';
    } else if (video.data) {
        thumbnailUrl = video.thumbnailData;
        videoUrl = video.data;
        platformIcon = '<i class="fas fa-film"></i>';
    }
    
    const uploadDate = video.uploadedAt && video.uploadedAt.toDate ? 
        video.uploadedAt.toDate().toLocaleDateString('pt-BR') : 
        'Data não disponível';
    
    card.innerHTML = `
        <div class="video-thumbnail-container">
            <img src="${thumbnailUrl}" alt="${videoTitle}" class="video-thumbnail"
                onerror="this.style.display='none'; this.parentElement.innerHTML='<div class=&quot;video-thumbnail-placeholder&quot;><i class=&quot;fas fa-film&quot;></i></div>';">
            <div class="video-play-overlay">
                <i class="fas fa-play"></i>
            </div>
            <div class="video-platform-badge">
                ${platformIcon}
            </div>
        </div>
        <div class="video-info">
            <h3 class="video-title">${videoTitle}</h3>
            <div class="video-meta">
                <span class="video-date">
                    <i class="fas fa-calendar"></i>
                    ${uploadDate}
                </span>
            </div>
        </div>
    `;
    
    // Adicionar evento de clique para reproduzir o vídeo
    card.addEventListener('click', () => {
        openVideoModal(video);
    });
    
    return card;
}

function openVideoModal(video) {
    // Criar modal para visualização do vídeo
    const modal = document.createElement('div');
    modal.className = 'video-modal';
    
    let videoPlayer = '';
    
    if (video.platform === 'youtube') {
        videoPlayer = `
            <iframe src="https://www.youtube.com/embed/${video.videoId}?autoplay=1" 
                    frameborder="0" 
                    allowfullscreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture">
            </iframe>
        `;
    } else if (video.platform === 'vimeo') {
        videoPlayer = `
            <iframe src="https://player.vimeo.com/video/${video.videoId}?autoplay=1" 
                    frameborder="0" 
                    allowfullscreen
                    allow="autoplay; fullscreen; picture-in-picture">
            </iframe>
        `;
    } else if (video.url || video.data) {
        const source = video.url || video.data;
        videoPlayer = `
            <video controls autoplay>
                <source src="${source}" type="video/mp4">
                Seu navegador não suporta vídeos.
            </video>
        `;
    }
    
    modal.innerHTML = `
        <div class="video-modal-content">
            <div class="video-modal-header">
                <h2>${video.title || 'Vídeo'}</h2>
                <button class="video-modal-close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="video-modal-body">
                ${videoPlayer}
            </div>
        </div>
        <div class="video-modal-backdrop"></div>
    `;
    
    // Adicionar ao DOM
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    
    // Event listener para fechar
    const closeBtn = modal.querySelector('.video-modal-close');
    const backdrop = modal.querySelector('.video-modal-backdrop');
    
    closeBtn.addEventListener('click', closeVideoModal);
    backdrop.addEventListener('click', closeVideoModal);
    document.addEventListener('keydown', handleVideoKeydown);
    
    function closeVideoModal() {
        document.body.removeChild(modal);
        document.body.style.overflow = '';
        document.removeEventListener('keydown', handleVideoKeydown);
    }
    
    function handleVideoKeydown(event) {
        if (event.key === 'Escape') {
            closeVideoModal();
        }
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
    
    const mediaType = media.type || '';
    const isVideo = mediaType.startsWith('video/') || 
                   mediaType === 'video' ||
                   /\.(mp4|webm|ogg|avi|mov)$/i.test(media.url);
    
    let mediaElement = '';
    if (isVideo) {
        mediaElement = `
            <video class="featured-media-content" controls muted preload="metadata">
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
