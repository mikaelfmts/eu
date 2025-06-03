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
        const mediaCount = post.media?.length || 0;        let mediaHTML = '';
        if (firstMedia) {
            const isVideo = this.isVideoFile(firstMedia.url, mediaType);
              if (isVideo) {
                // Usar o novo sistema de processamento de vídeos
                if (window.videoProcessor) {
                    const videoInfo = window.videoProcessor.processVideoUrl(firstMedia.url, mediaType);
                    
                    if (videoInfo) {
                        if (videoInfo.thumbnailUrl) {
                            // Usar thumbnail do YouTube
                            mediaHTML = `
                                <img src="${videoInfo.thumbnailUrl}" 
                                     alt="${post.title}" 
                                     loading="lazy"
                                     onerror="this.src=''; this.style.display='none'; this.parentElement.innerHTML='${window.videoProcessor.generatePlaceholderThumbnail(videoInfo).replace(/'/g, '\\\'')}';">
                                <div class="media-indicator">
                                    <i class="fas fa-play"></i>
                                </div>
                            `;
                        } else {
                            // Usar placeholder personalizado baseado na plataforma
                            mediaHTML = `
                                ${window.videoProcessor.generatePlaceholderThumbnail(videoInfo, {showPlayButton: false})}
                                <div class="media-indicator">
                                    <i class="fas fa-play"></i>
                                </div>
                            `;
                        }
                    } else {
                        // Fallback para vídeos não processáveis
                        mediaHTML = `
                            <div class="media-placeholder">
                                <i class="fas fa-video" style="font-size: 2rem; margin-bottom: 0.5rem;"></i>
                                <span>Vídeo</span>
                            </div>
                            <div class="media-indicator">
                                <i class="fas fa-play"></i>
                            </div>
                        `;
                    }
                } else {
                    // Fallback se o VideoProcessor não estiver disponível
                    mediaHTML = `
                        <div class="media-placeholder">
                            <i class="fas fa-play" style="font-size: 2rem; margin-bottom: 0.5rem;"></i>
                            <span>Vídeo</span>
                        </div>
                        <div class="media-indicator">
                            <i class="fas fa-play"></i>
                        </div>
                    `;
                }
            }else {
                // Para imagens
                mediaHTML = `
                    <img src="${firstMedia.url}" alt="${post.title}" loading="lazy"
                         onerror="this.style.display='none'; this.parentElement.innerHTML='<div class=&quot;media-placeholder&quot;><i class=&quot;fas fa-image&quot;></i><span>Imagem</span></div>';">
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
    }    updateModalContent() {
        const modalBody = document.querySelector('.modal-body');
        const media = this.currentPostMedia[this.currentMediaIndex];
        
        if (!media) return;
            
        let mediaHTML = '';
        const mediaType = media.type || '';
        
        try {
            const isVideo = this.isVideoFile(media.url, mediaType);
              if (isVideo) {
                // Usar o novo sistema de processamento de vídeos
                if (window.videoProcessor) {
                    const videoInfo = window.videoProcessor.processVideoUrl(media.url, mediaType);
                    
                    if (videoInfo) {
                        mediaHTML = window.videoProcessor.generateVideoHtml(videoInfo, {
                            width: '100%',
                            height: '400px',
                            controls: true,
                            showFallback: true,
                            className: 'modal-video'
                        });
                    } else {
                        mediaHTML = window.videoProcessor.generateErrorHtml('Formato de vídeo não suportado', media.url);
                    }
                } else {
                    // Fallback se o VideoProcessor não estiver disponível
                    mediaHTML = `
                        <div class="video-container">
                            <video controls preload="metadata" playsinline
                                   style="max-width: 100%; max-height: 80vh;"
                                   onerror="this.style.display='none'; this.parentElement.innerHTML='<div style=&quot;text-align: center; padding: 2rem; color: #c8aa6e;&quot;><i class=&quot;fas fa-exclamation-triangle&quot; style=&quot;font-size: 2rem; margin-bottom: 1rem;&quot;></i><p>Erro ao carregar vídeo</p><a href=&quot;${media.url}&quot; target=&quot;_blank&quot; style=&quot;color: #c8aa6e;&quot;>Baixar vídeo</a></div>';">
                                <source src="${media.url}" type="video/mp4">
                                <source src="${media.url}" type="video/webm">
                                <source src="${media.url}">
                                Seu navegador não suporta a reprodução de vídeos. <a href="${media.url}" target="_blank" style="color: #c8aa6e;">Clique aqui para baixar o vídeo</a>.
                            </video>
                        </div>
                    `;
                }
            }else {
                // Imagem
                mediaHTML = `<img src="${media.url}" alt="Mídia" loading="lazy" style="max-width: 100%; max-height: 80vh; object-fit: contain;">`;
            }
        } catch (error) {
            console.error('Erro ao processar mídia:', error);
            mediaHTML = `
                <div style="text-align: center; padding: 2rem; color: #c8aa6e;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                    <p>Erro ao carregar mídia</p>
                </div>
            `;
        }

        modalBody.innerHTML = mediaHTML;

        // Update navigation buttons
        const prevBtn = document.querySelector('.prev-btn');
        const nextBtn = document.querySelector('.next-btn');
        
        if (prevBtn) prevBtn.style.display = this.currentMediaIndex > 0 ? 'block' : 'none';
        if (nextBtn) nextBtn.style.display = this.currentMediaIndex < this.currentPostMedia.length - 1 ? 'block' : 'none';
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
    }    // Método para detectar se um arquivo é vídeo usando o novo sistema
    isVideoFile(url, mimeType) {
        if (!window.videoProcessor) {
            console.warn('VideoProcessor não está disponível, usando detecção básica');
            return this.basicVideoDetection(url, mimeType);
        }
        
        return window.videoProcessor.isVideo(url, mimeType);
    }

    // Fallback para detecção básica de vídeo
    basicVideoDetection(url, mimeType) {
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
    }    // Remove - função movida para o VideoProcessor// Método para detectar e processar diferentes tipos de links de vídeo
    processVideoUrl(url, mediaType) {
        if (!url) return null;
        
        try {
            // Detectar YouTube
            const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
            const youtubeMatch = url.match(youtubeRegex);
            if (youtubeMatch) {
                return {
                    type: 'youtube',
                    id: youtubeMatch[1],
                    embedUrl: `https://www.youtube.com/embed/${youtubeMatch[1]}?autoplay=0&controls=1`,
                    thumbnailUrl: `https://img.youtube.com/vi/${youtubeMatch[1]}/maxresdefault.jpg`
                };
            }
            
            // Detectar Google Drive
            const driveRegex = /drive\.google\.com\/(?:file\/d\/|open\?id=)([a-zA-Z0-9_-]+)/;
            const driveMatch = url.match(driveRegex);
            if (driveMatch) {
                return {
                    type: 'drive',
                    id: driveMatch[1],
                    embedUrl: `https://drive.google.com/file/d/${driveMatch[1]}/preview`
                };
            }
            
            // Detectar Vimeo
            const vimeoRegex = /(?:vimeo\.com\/)([0-9]+)/;
            const vimeoMatch = url.match(vimeoRegex);
            if (vimeoMatch) {
                return {
                    type: 'vimeo',
                    id: vimeoMatch[1],
                    embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=0&controls=1`
                };
            }
            
            // Para URLs diretos de vídeo
            if (this.isVideoFile(url, mediaType)) {
                return {
                    type: 'direct',
                    directUrl: url
                };
            }
            
            return null;
        } catch (error) {
            console.error('Erro ao processar URL de vídeo:', error);
            return null;
        }
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
