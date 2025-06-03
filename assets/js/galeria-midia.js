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
    }    async loadPosts(loadMore = false) {
        try {
            let q;
            if (loadMore && this.lastDoc) {
                q = query(
                    collection(db, 'galeria_posts'),
                    orderBy('createdAt', 'desc'),
                    startAfter(this.lastDoc),
                    limit(this.postsPerPage)
                );
            } else {
                q = query(
                    collection(db, 'galeria_posts'),
                    orderBy('createdAt', 'desc'),
                    limit(this.postsPerPage)
                );
            }

            const querySnapshot = await getDocs(q);
            const newPosts = [];            // Carregar posts e suas mídias
            for (const postDoc of querySnapshot.docs) {
                const postData = {
                    id: postDoc.id,
                    ...postDoc.data()
                };// Se o post tem referências de mídia, carregar do galeria_media
                if (postData.mediaIds && postData.mediaIds.length > 0) {
                    const mediaPromises = postData.mediaIds.map(async (mediaId) => {
                        try {
                            const mediaDocRef = doc(db, 'galeria_media', mediaId);
                            const mediaDoc = await getDoc(mediaDocRef);
                            if (mediaDoc.exists()) {
                                return {
                                    id: mediaId,
                                    url: mediaDoc.data().data, // Base64 data
                                    type: mediaDoc.data().type,
                                    name: mediaDoc.data().name
                                };
                            }
                        } catch (error) {
                            console.error('Erro ao carregar mídia:', error);
                            return null;
                        }
                    });
                    
                    const mediaResults = await Promise.all(mediaPromises);
                    postData.media = mediaResults.filter(media => media !== null);
                } else if (postData.media) {
                    // Manter compatibilidade com posts antigos que já têm URLs diretas
                    postData.media = postData.media;
                } else {
                    postData.media = [];
                }

                newPosts.push(postData);
            }

            if (loadMore) {
                this.posts = [...this.posts, ...newPosts];
            } else {
                this.posts = newPosts;
            }

            // Atualizar lastDoc para paginação
            if (querySnapshot.docs.length > 0) {
                this.lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
            }

            this.applyFilter(this.currentFilter, !loadMore);
            this.updateLoadMoreButton(querySnapshot.docs.length === this.postsPerPage);

        } catch (error) {
            console.error('Erro ao carregar posts:', error);
            this.showError('Erro ao carregar posts');
        }
    }

    renderPosts(posts) {
        const postsContainer = document.getElementById('posts-feed');
        
        if (!posts || posts.length === 0) {
            postsContainer.innerHTML = `
                <div class="no-posts" style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: #c8aa6e;">
                    <i class="fas fa-images" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                    <h3>Nenhum post encontrado</h3>
                    <p>Não há posts para exibir no momento.</p>
                </div>
            `;
            return;
        }

        const postsHTML = posts.map(post => this.createPostHTML(post)).join('');
        postsContainer.innerHTML = postsHTML;
    }    createPostHTML(post) {
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
        if (firstMedia) {        // Melhor detecção de vídeo com mais formatos
        const isVideo = this.isVideoFile(firstMedia.url, mediaType);        if (isVideo) {
                mediaHTML = `
                    <div class="video-container">
                        <video preload="metadata" muted playsinline class="post-video-thumbnail"
                               poster="${firstMedia.thumbnail || ''}"
                               onerror="this.style.display='none'; this.parentElement.innerHTML='<div class=&quot;media-placeholder video-error&quot;><i class=&quot;fas fa-exclamation-triangle&quot;></i><span>Erro ao carregar vídeo</span></div>';">
                            <source src="${firstMedia.url}" type="video/mp4">
                            <source src="${firstMedia.url}" type="video/webm">
                            <source src="${firstMedia.url}">
                            Seu navegador não suporta a reprodução de vídeos.
                        </video>
                        <div class="media-indicator">
                            <i class="fas fa-play"></i>
                        </div>
                    </div>
                `;
            }else {
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
                <div class="post-description">
                    ${post.description}
                </div>
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
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        activeBtn.classList.add('active');
    }

    applyFilter(filter, clearContainer = true) {
        this.currentFilter = filter;
        
        let filtered = this.posts;        if (filter === 'photos') {
            filtered = this.posts.filter(post => 
                post.media && post.media.some(media => {
                    return !this.isVideoFile(media.url, media.type);
                })
            );
        } else if (filter === 'videos') {
            filtered = this.posts.filter(post => 
                post.media && post.media.some(media => {
                    return this.isVideoFile(media.url, media.type);
                })
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
                postsContainer.innerHTML += this.createPostHTML(post);
            });
        }
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
    }    closeMediaModal() {
        const modal = document.getElementById('media-modal');
        modal.classList.add('hidden');
        document.body.style.overflow = 'auto';
        
        // Pause any playing videos
        const videos = modal.querySelectorAll('video');
        videos.forEach(video => {
            try {
                video.pause();
                video.currentTime = 0;
            } catch (e) {
                console.error('Erro ao pausar vídeo:', e);
            }
        });
    }updateModalContent() {
        const modalBody = document.querySelector('.modal-body');
        const media = this.currentPostMedia[this.currentMediaIndex];
        
        if (!media) return;
            
        let mediaHTML = '';
        const mediaType = media.type || '';
        const isVideo = this.isVideoFile(media.url, mediaType);

        if (isVideo) {
            mediaHTML = `
                <div class="video-container">
                    <video controls preload="metadata" playsinline
                           poster="${media.thumbnail || ''}"
                           onloadstart="this.style.opacity='1'"
                           onerror="this.style.display='none'; this.parentElement.innerHTML='<div class=&quot;video-error-message&quot;><i class=&quot;fas fa-exclamation-triangle&quot;></i><p>Erro ao carregar vídeo</p><small>Formato não suportado ou arquivo corrompido</small><p><a href=&quot;${media.url}&quot; class=&quot;video-download-link&quot; target=&quot;_blank&quot;>Baixar vídeo</a></p></div>';">
                        <source src="${media.url}" type="video/mp4">
                        <source src="${media.url}" type="video/webm">
                        <source src="${media.url}">
                        Seu navegador não suporta a reprodução de vídeos. <a href="${media.url}" target="_blank">Clique aqui para baixar o vídeo</a>.
                    </video>
                </div>
            `;
        }else {
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
    }    showError(message) {
        console.error(message);
        // Aqui você pode implementar um sistema de notificações
    }

    // Método para detectar se um arquivo é vídeo de forma mais robusta
    isVideoFile(url, mimeType) {
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

    // Método para obter o MIME type correto do vídeo
    getVideoMimeType(url, originalMimeType) {
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

// Handler específico para vídeos
function setupVideoHandlers() {
    document.addEventListener('click', function(e) {
        const videoContainer = e.target.closest('.video-container');
        const video = videoContainer?.querySelector('video');
        
        if (video && videoContainer) {
            e.preventDefault();
            
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

// Inicializar handlers de vídeo
document.addEventListener('DOMContentLoaded', setupVideoHandlers);

// Inicializar quando o DOM estiver carregado
let galeriaApp;
document.addEventListener('DOMContentLoaded', () => {
    galeriaApp = new GaleriaMidia();
    window.galeriaApp = galeriaApp;
});
