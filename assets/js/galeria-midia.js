// Galeria de Mídia JavaScript
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { 
    getFirestore, 
    collection, 
    getDocs, 
    orderBy, 
    query, 
    limit, 
    startAfter, 
    where,
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyA0VoWMLTJIyI54Pj0P5T75gCH6KpgAcbk",
    authDomain: "mikaelfmts.firebaseapp.com",
    projectId: "mikaelfmts",
    storageBucket: "mikaelfmts.appspot.com",
    messagingSenderId: "516762612351",
    appId: "1:516762612351:web:f8a0f229ffd5def8ec054a"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

class GaleriaMidia {
    constructor() {
        this.posts = [];
        this.filteredPosts = [];
        this.currentFilter = 'all';
        this.lastDoc = null;
        this.postsPerPage = 6;
        this.currentMediaIndex = 0;
        this.currentPostMedia = [];
        
        this.init();
    }

    async init() {
        await this.loadPosts();
        this.setupEventListeners();
        this.hideLoadingScreen();
        
        // Verificar se há um filtro na URL
        this.checkUrlFilter();
    }
    
    // Verificar se há um filtro na URL
    checkUrlFilter() {
        const urlParams = new URLSearchParams(window.location.search);
        const filter = urlParams.get('filter');
        
        if (filter) {
            const validFilters = ['all', 'photos', 'videos'];
            if (validFilters.includes(filter)) {
                // Encontrar o botão correto para o filtro
                const filterBtn = document.querySelector(`.filter-btn[data-filter="${filter}"]`);
                if (filterBtn) {
                    this.setActiveFilter(filterBtn);
                    this.applyFilter(filter);
                }
            }
        }
    }

    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            setTimeout(() => {
                loadingScreen.style.opacity = '0';
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                }, 300);
            }, 1000);
        }
    }

    async loadPosts(loadMore = false) {
        try {
            // Mostrar indicador de carregamento
            this.showLoadingIndicator();
            
            // Carregar posts
            const postsRef = collection(db, 'galeria_posts');
            
            let q;
            if (!this.lastDoc) {
                q = query(
                    postsRef, 
                    where('visible', '==', true), 
                    orderBy('createdAt', 'desc'), 
                    limit(this.postsPerPage)
                );
            } else {
                q = query(
                    postsRef, 
                    where('visible', '==', true), 
                    orderBy('createdAt', 'desc'), 
                    startAfter(this.lastDoc), 
                    limit(this.postsPerPage)
                );
            }
            
            const querySnapshot = await getDocs(q);
            
            // Se não houver mais posts, ocultar o botão de carregar mais
            if (querySnapshot.empty && this.lastDoc) {
                document.getElementById('load-more').classList.add('hidden');
                this.hideLoadingIndicator();
                return;
            }
            
            // Atualizar o último documento
            this.lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
            
            const loadedPosts = [];
            
            // Processar posts
            for (const doc of querySnapshot.docs) {
                const postData = doc.data();
                const post = {
                    id: doc.id,
                    title: postData.title || 'Sem título',
                    description: postData.description || '',
                    media: [],
                    timestamp: postData.createdAt.toDate()
                };
                
                // Processar mídia do post
                if (postData.mediaIds && postData.mediaIds.length > 0) {
                    for (const mediaId of postData.mediaIds) {
                        const mediaDoc = await getDoc(doc(db, 'galeria_media', mediaId));
                        if (mediaDoc.exists()) {
                            const mediaData = mediaDoc.data();
                            post.media.push(mediaData);
                        }
                    }
                } else if (postData.media && postData.media.length > 0) {
                    // Para compatibilidade com dados antigos
                    post.media = postData.media;
                }
                
                loadedPosts.push(post);
            }
            
            // Adicionar posts à lista
            this.posts = [...this.posts, ...loadedPosts];
            
            // Carregar vídeos separadamente
            const videos = await this.loadVideos();
            
            // Converter vídeos para formato compatível com posts
            const videoPosts = videos.map(video => {
                let thumbnailUrl = '';
                let videoUrl = '';
                
                // Determinar a fonte da miniatura com base no tipo de vídeo
                if (video.platform === 'youtube') {
                    thumbnailUrl = video.thumbnailUrl || `https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`;
                    videoUrl = `https://www.youtube.com/embed/${video.videoId}`;
                } else if (video.platform === 'vimeo') {
                    thumbnailUrl = video.thumbnailUrl;
                    videoUrl = `https://player.vimeo.com/video/${video.videoId}`;
                } else if (video.url && video.thumbnailUrl) {
                    thumbnailUrl = video.thumbnailUrl;
                    videoUrl = video.url;
                } else if (video.thumbnailData) {
                    thumbnailUrl = video.thumbnailData;
                    videoUrl = video.data;
                }
                
                return {
                    id: video.id,
                    title: video.title || 'Vídeo sem título',
                    description: video.description || '',
                    media: [{
                        id: video.id,
                        type: 'video',
                        thumbnail: thumbnailUrl,
                        url: videoUrl,
                        platform: video.platform || 'other',
                        videoId: video.videoId || ''
                    }],
                    timestamp: video.uploadedAt.toDate(),
                    isVideo: true
                };
            });
            
            // Adicionar vídeos à lista de posts
            this.posts = [...this.posts, ...videoPosts];
            
            // Ordenar por data (mais recente primeiro)
            this.posts.sort((a, b) => b.timestamp - a.timestamp);
            
            // Aplicar filtro atual
            this.applyFilter(this.currentFilter, !loadMore);
            
            // Mostrar botão de carregar mais se houver mais posts
            if (querySnapshot.size >= this.postsPerPage) {
                document.getElementById('load-more').classList.remove('hidden');
            } else {
                document.getElementById('load-more').classList.add('hidden');
            }
            
            // Ocultar indicador de carregamento
            this.hideLoadingIndicator();
        } catch (error) {
            console.error('Erro ao carregar posts:', error);
            this.hideLoadingIndicator();
            
            // Mostrar mensagem de erro
            const postsContainer = document.getElementById('posts-feed');
            postsContainer.innerHTML = `
                <div class="no-posts" style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: #c8aa6e;">
                    <i class="fas fa-exclamation-circle" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                    <h3>Erro ao carregar posts</h3>
                    <p>Ocorreu um erro ao carregar os posts. Por favor, tente novamente mais tarde.</p>
                </div>
            `;
        }
    }
    
    // Adicionar carregamento de vídeos do Firestore
    async loadVideos() {
        try {
            const videosRef = collection(db, 'videos');
            const q = query(videosRef, orderBy('uploadedAt', 'desc'));
            const querySnapshot = await getDocs(q);
            
            let videos = [];
            
            querySnapshot.forEach((doc) => {
                const videoData = doc.data();
                videos.push({
                    id: doc.id,
                    ...videoData,
                    mediaType: 'video',
                    timestamp: videoData.uploadedAt.toDate()
                });
            });
            
            return videos;
        } catch (error) {
            console.error('Erro ao carregar vídeos:', error);
            return [];
        }
    }

    renderPosts(posts) {
        const postsContainer = document.getElementById('posts-feed');
        
        if (!posts || posts.length === 0) {
            postsContainer.innerHTML = `
                <div class="no-posts" style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: #c8aa6e;">
                    <i class="fas fa-images" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                    <h3>Nenhum post encontrado</h3>
                    <p>Não há posts para exibir com o filtro atual.</p>
                </div>
            `;
            return;
        }

        const postsHTML = posts.map(post => this.createPostHTML(post)).join('');
        postsContainer.innerHTML = postsHTML;
    }

    createPostHTML(post) {
        const date = new Date(post.timestamp?.toDate ? post.timestamp.toDate() : post.timestamp);
        const formattedDate = date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        const firstMedia = post.media && post.media[0];
        const mediaType = firstMedia?.type || 'image';
        const mediaCount = post.media?.length || 0;

        let mediaHTML = '';
        if (firstMedia) {
            // Melhor detecção de vídeo
            const isVideo = mediaType && (
                mediaType.startsWith('video/') || 
                mediaType === 'video' ||
                /\.(mp4|webm|ogg|avi|mov)$/i.test(firstMedia.url)
            );
            
            // Detectar plataforma de vídeo
            let platformBadge = '';
            if (isVideo) {
                if (firstMedia.platform === 'youtube') {
                    platformBadge = '<span class="platform-badge youtube"><i class="fab fa-youtube"></i></span>';
                } else if (firstMedia.platform === 'vimeo') {
                    platformBadge = '<span class="platform-badge vimeo"><i class="fab fa-vimeo-v"></i></span>';
                }
            }

            if (isVideo) {
                // Se for miniatura de vídeo
                if (firstMedia.thumbnail) {
                    mediaHTML = `
                        <div class="media-thumbnail">
                            <img src="${firstMedia.thumbnail}" alt="${post.title}" loading="lazy"
                                 onerror="this.style.display='none'; this.parentElement.innerHTML='<div class=&quot;media-placeholder&quot;><i class=&quot;fas fa-film&quot;></i></div>';">
                            <div class="play-button">
                                <i class="fas fa-play"></i>
                            </div>
                            ${platformBadge}
                        </div>
                    `;
                } else {
                    // Se não tiver miniatura, usar vídeo direto
                    mediaHTML = `
                        <video preload="metadata" muted>
                            <source src="${firstMedia.url}" type="${mediaType.startsWith('video/') ? mediaType : 'video/mp4'}">
                        </video>
                        <div class="media-indicator">
                            <i class="fas fa-play"></i>
                        </div>
                        ${platformBadge}
                    `;
                }
            } else {
                mediaHTML = `
                    <img src="${firstMedia.url}" alt="${post.title}" loading="lazy"
                         onerror="this.style.display='none'; this.parentElement.innerHTML='<div class=&quot;media-placeholder&quot;><i class=&quot;fas fa-image&quot;></i></div>';">
                    <div class="media-indicator">
                        <i class="fas fa-image"></i>
                    </div>
                `;
            }

            if (mediaCount > 1) {
                mediaHTML += `<div class="media-count">${mediaCount} itens</div>`;
            }
        }

        return `
            <article class="post-card" data-post-id="${post.id}" onclick="galeriaApp.openPost('${post.id}')">
                <div class="post-header">
                    <h3 class="post-title">${post.title}</h3>
                    <time class="post-date">${formattedDate}</time>
                </div>
                ${firstMedia ? `<div class="post-media">${mediaHTML}</div>` : ''}
                ${post.description ? `<div class="post-description">${post.description}</div>` : ''}
            </article>
        `;
    }

    setupEventListeners() {
        // Filtros
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filter = e.target.dataset.filter;
                this.setActiveFilter(e.target);
                this.applyFilter(filter);
            });
        });

        // Load More
        const loadMoreBtn = document.querySelector('.load-more-btn');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => {
                this.loadPosts(true);
            });
        }

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (document.getElementById('media-modal').classList.contains('hidden')) return;
            
            if (e.key === 'Escape') {
                this.closeMediaModal();
            } else if (e.key === 'ArrowLeft') {
                this.navigateMedia(-1);
            } else if (e.key === 'ArrowRight') {
                this.navigateMedia(1);
            }
        });
    }

    setActiveFilter(activeBtn) {
        // Atualizar classes dos botões
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        activeBtn.classList.add('active');
    }

    applyFilter(filter, clearContainer = true) {
        this.currentFilter = filter;
        
        let filtered = this.posts;
        
        if (filter === 'photos') {
            filtered = this.posts.filter(post => 
                post.media && post.media.some(media => {
                    const type = media.type || '';
                    return type.startsWith('image/') || 
                           (!type.startsWith('video/') && type !== 'video' && 
                            !/\.(mp4|webm|ogg|avi|mov)$/i.test(media.url));
                })
            );
        } else if (filter === 'videos') {
            filtered = this.posts.filter(post => 
                post.media && post.media.some(media => {
                    const type = media.type || '';
                    return type.startsWith('video/') || 
                           type === 'video' ||
                           /\.(mp4|webm|ogg|avi|mov)$/i.test(media.url) ||
                           media.platform === 'youtube' ||
                           media.platform === 'vimeo';
                }) || post.isVideo === true
            );
        }

        this.filteredPosts = filtered;
        
        if (clearContainer) {
            this.renderPosts(filtered);
        } else {
            // Append new posts
            const postsContainer = document.getElementById('posts-feed');
            const newPosts = filtered.slice(postsContainer.children.length);
            newPosts.forEach(post => {
                const postElement = document.createElement('div');
                postElement.innerHTML = this.createPostHTML(post);
                postsContainer.appendChild(postElement.firstChild);
            });
        }
        
        // Atualizar botão de carregar mais
        this.updateLoadMoreButton(filtered.length >= this.postsPerPage);
    }

    updateLoadMoreButton(hasMore) {
        const loadMoreContainer = document.getElementById('load-more');
        if (hasMore && this.filteredPosts.length >= this.postsPerPage) {
            loadMoreContainer.classList.remove('hidden');
        } else {
            loadMoreContainer.classList.add('hidden');
        }
    }

    openPost(postId) {
        const post = this.posts.find(p => p.id === postId);
        if (!post || !post.media || post.media.length === 0) return;

        this.currentPostMedia = post.media;
        this.currentMediaIndex = 0;
        
        this.showMediaModal();
        this.updateModalContent();
    }

    showMediaModal() {
        const modal = document.getElementById('media-modal');
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    closeMediaModal() {
        const modal = document.getElementById('media-modal');
        modal.classList.add('hidden');
        document.body.style.overflow = 'auto';
        
        // Pause any playing videos
        const videos = modal.querySelectorAll('video');
        videos.forEach(video => {
            video.pause();
            video.currentTime = 0;
        });
        
        // Reset iframe sources to stop playback
        const iframes = modal.querySelectorAll('iframe');
        iframes.forEach(iframe => {
            const src = iframe.src;
            iframe.src = '';
            setTimeout(() => {
                iframe.src = src;
            }, 100);
        });
    }

    updateModalContent() {
        const modalBody = document.querySelector('.modal-body');
        const media = this.currentPostMedia[this.currentMediaIndex];
        
        if (!media) return;
        
        let mediaHTML = '';
        const mediaType = media.type || '';
        const isVideo = mediaType.startsWith('video/') || 
                       mediaType === 'video' ||
                       media.platform === 'youtube' ||
                       media.platform === 'vimeo' ||
                       /\.(mp4|webm|ogg|avi|mov)$/i.test(media.url);

        if (isVideo) {
            if (media.platform === 'youtube' && media.videoId) {
                mediaHTML = `
                    <iframe src="https://www.youtube.com/embed/${media.videoId}?autoplay=1" 
                            frameborder="0" 
                            allowfullscreen
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture">
                    </iframe>
                `;
            } else if (media.platform === 'vimeo' && media.videoId) {
                mediaHTML = `
                    <iframe src="https://player.vimeo.com/video/${media.videoId}?autoplay=1" 
                            frameborder="0" 
                            allowfullscreen
                            allow="autoplay; fullscreen; picture-in-picture">
                    </iframe>
                `;
            } else {
                mediaHTML = `
                    <video controls autoplay>
                        <source src="${media.url}" type="${mediaType.startsWith('video/') ? mediaType : 'video/mp4'}">
                        Seu navegador não suporta vídeos.
                    </video>
                `;
            }
        } else {
            mediaHTML = `<img src="${media.url}" alt="Mídia" loading="lazy">`;
        }

        modalBody.innerHTML = mediaHTML;

        // Update navigation buttons
        const prevBtn = document.querySelector('.prev-btn');
        const nextBtn = document.querySelector('.next-btn');
        
        prevBtn.style.display = this.currentMediaIndex > 0 ? 'block' : 'none';
        nextBtn.style.display = this.currentMediaIndex < this.currentPostMedia.length - 1 ? 'block' : 'none';
    }

    navigateMedia(direction) {
        const newIndex = this.currentMediaIndex + direction;
        
        if (newIndex >= 0 && newIndex < this.currentPostMedia.length) {
            this.currentMediaIndex = newIndex;
            this.updateModalContent();
        }
    }

    showLoadingIndicator() {
        const loadMoreBtn = document.querySelector('.load-more-btn');
        if (loadMoreBtn) {
            loadMoreBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Carregando...';
            loadMoreBtn.disabled = true;
        }
    }

    hideLoadingIndicator() {
        const loadMoreBtn = document.querySelector('.load-more-btn');
        if (loadMoreBtn) {
            loadMoreBtn.innerHTML = '<i class="fas fa-plus"></i> Carregar Mais';
            loadMoreBtn.disabled = false;
        }
    }

    showError(message) {
        console.error(message);
        // Sistema de notificações
        const notification = document.createElement('div');
        notification.className = 'notification error';
        notification.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            <span>${message}</span>
            <button class="notification-close"><i class="fas fa-times"></i></button>
        `;
        document.body.appendChild(notification);
        
        // Auto-hide após 5 segundos
        setTimeout(() => {
            notification.classList.add('hide');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 5000);
        
        // Fechar ao clicar no X
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.classList.add('hide');
            setTimeout(() => {
                notification.remove();
            }, 300);
        });
    }
}

// Funções globais para eventos inline
window.closeMediaModal = function() {
    if (window.galeriaApp) {
        window.galeriaApp.closeMediaModal();
    }
};

window.navigateMedia = function(direction) {
    if (window.galeriaApp) {
        window.galeriaApp.navigateMedia(direction);
    }
};

// Inicializar quando o DOM estiver carregado
let galeriaApp;
document.addEventListener('DOMContentLoaded', () => {
    galeriaApp = new GaleriaMidia();
    window.galeriaApp = galeriaApp;
});
