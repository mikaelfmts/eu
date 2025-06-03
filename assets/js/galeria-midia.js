// Importar as dependências do Firebase
import { db } from '../assets/js/firebase-config.js';
import { 
    collection, 
    getDocs, 
    query, 
    orderBy, 
    limit, 
    startAfter, 
    where,
    doc,
    getDoc
} from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js';

// Importar classes e funções relacionadas a vídeos
import { VideoProcessor } from '../assets/js/video-system.js';
import { safePlayVideo, isVideo } from '../assets/js/video-helpers.js';

// Variáveis de controle
let lastVisible = null;
let currentFilter = 'all';
let isLoading = false;
let currentMediaList = [];
let currentMediaIndex = 0;
let videoProcessor = null;

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    // Garantir que o VideoProcessor está disponível
    if (window.VideoProcessor) {
        videoProcessor = new VideoProcessor();
    } else if (typeof VideoProcessor !== 'undefined') {
        videoProcessor = new VideoProcessor();
    }
    
    // Inicializar componentes
    setupFilterButtons();
    loadInitialPosts();
    setupLoadMoreButton();
    setupKeyboardNavigation();
    
    // Definir funções para uso global
    window.openMediaModal = openMediaModal;
    window.closeMediaModal = closeMediaModal;
    window.navigateMedia = navigateMedia;
    window.initVideoPlayers = initVideoPlayers;
});

/**
 * Configura os botões de filtro
 */
function setupFilterButtons() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const filter = this.getAttribute('data-filter');
            
            // Atualizar estilo dos botões
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Aplicar filtro
            currentFilter = filter;
            resetPosts();
            loadInitialPosts();
        });
    });
}

/**
 * Reseta o estado dos posts para carregar novos
 */
function resetPosts() {
    lastVisible = null;
    document.getElementById('posts-feed').innerHTML = '';
    document.getElementById('load-more').classList.add('hidden');
}

/**
 * Carrega os posts iniciais
 */
async function loadInitialPosts() {
    const container = document.getElementById('posts-feed');
    showLoading(container);
    
    try {
        // Criar consulta baseada no filtro
        let postsQuery = createFilteredQuery();
        
        const querySnapshot = await getDocs(postsQuery);
        
        if (querySnapshot.empty) {
            container.innerHTML = createEmptyMessage();
        } else {
            container.innerHTML = '';
            
            querySnapshot.forEach(doc => {
                const post = { id: doc.id, ...doc.data() };
                const postElement = createPostCard(post);
                container.appendChild(postElement);
            });
            
            // Guardar o último post para paginação
            lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
            
            // Mostrar botão "Carregar mais" se houver mais de 10 posts
            if (querySnapshot.docs.length >= 10) {
                document.getElementById('load-more').classList.remove('hidden');
            }
        }
    } catch (error) {
        console.error('Erro ao carregar posts:', error);
        container.innerHTML = createErrorMessage('Não foi possível carregar os posts');
    } finally {
        hideLoading();
    }
}

/**
 * Cria a consulta filtrada com base no filtro atual
 */
function createFilteredQuery() {
    // Base da consulta
    let baseQuery;
    
    if (currentFilter === 'all') {
        // Todos os posts
        baseQuery = query(
            collection(db, 'galeria_posts'), 
            where('visible', '==', true),
            orderBy('createdAt', 'desc'),
            limit(10)
        );
    } else if (currentFilter === 'photos') {
        // Apenas fotos
        baseQuery = query(
            collection(db, 'galeria_posts'),
            where('visible', '==', true),
            where('contentType', '==', 'photo'),
            orderBy('createdAt', 'desc'),
            limit(10)
        );
    } else if (currentFilter === 'videos') {
        // Apenas vídeos
        baseQuery = query(
            collection(db, 'galeria_posts'),
            where('visible', '==', true),
            where('contentType', '==', 'video'),
            orderBy('createdAt', 'desc'),
            limit(10)
        );
    }
    
    // Adicionar ponto de início para paginação
    if (lastVisible) {
        baseQuery = query(
            baseQuery,
            startAfter(lastVisible)
        );
    }
    
    return baseQuery;
}

/**
 * Configura o botão de carregar mais
 */
function setupLoadMoreButton() {
    const loadMoreButton = document.querySelector('.load-more-btn');
    if (!loadMoreButton) return;
    
    loadMoreButton.addEventListener('click', async () => {
        if (isLoading) return;
        
        isLoading = true;
        loadMoreButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Carregando...';
        
        try {
            // Criar consulta baseada no último item visível
            let postsQuery = createFilteredQuery();
            
            const querySnapshot = await getDocs(postsQuery);
            const container = document.getElementById('posts-feed');
            
            if (querySnapshot.empty) {
                document.getElementById('load-more').classList.add('hidden');
                return;
            }
            
            // Adicionar novos posts
            querySnapshot.forEach(doc => {
                const post = { id: doc.id, ...doc.data() };
                const postElement = createPostCard(post);
                container.appendChild(postElement);
            });
            
            // Atualizar o último visível
            lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
            
            // Esconder botão se não houver mais posts
            if (querySnapshot.docs.length < 10) {
                document.getElementById('load-more').classList.add('hidden');
            }
        } catch (error) {
            console.error('Erro ao carregar mais posts:', error);
        } finally {
            isLoading = false;
            loadMoreButton.innerHTML = '<i class="fas fa-plus"></i> Carregar Mais';
        }
    });
}

/**
 * Cria um card de post para a galeria
 */
function createPostCard(post) {
    const card = document.createElement('div');
    card.className = 'post-card';
    card.dataset.postId = post.id;
    
    // Formatar data
    const createdAt = post.createdAt && post.createdAt.toDate ? 
        post.createdAt.toDate().toLocaleDateString('pt-BR') : 
        'Data não disponível';
    
    // Verificar se há mídia disponível
    const mediaCount = post.media ? post.media.length : 0;
    const firstMedia = mediaCount > 0 ? post.media[0] : null;
    
    // Criar elemento de visualização de mídia
    let mediaElement;
    if (firstMedia) {
        if (isVideoContent(firstMedia)) {
            // É um vídeo
            mediaElement = createVideoPreview(firstMedia);
        } else {
            // É uma imagem
            mediaElement = `
                <img src="${firstMedia.url}" alt="${post.title}" 
                     onerror="this.src='../assets/images/placeholder.jpg';">
            `;
        }
    } else {
        // Sem mídia
        mediaElement = `
            <div class="media-placeholder">
                <i class="fas fa-image"></i>
                <span>Sem mídia disponível</span>
            </div>
        `;
    }
    
    // Estrutura do card
    card.innerHTML = `
        <div class="post-header">
            <h3 class="post-title">${post.title}</h3>
            <div class="post-date"><i class="fas fa-calendar"></i> ${createdAt}</div>
        </div>
        <div class="post-media">
            ${mediaElement}
            <div class="media-count">
                <i class="fas fa-${mediaCount > 1 ? 'images' : (isVideoContent(firstMedia) ? 'video' : 'image')}"></i>
                ${mediaCount}
            </div>
        </div>
        <div class="post-description">${post.description || ''}</div>
    `;
    
    // Adicionar evento de clique
    card.addEventListener('click', () => {
        openMediaModal(post);
    });
    
    return card;
}

/**
 * Verifica se um objeto de mídia é um vídeo
 */
function isVideoContent(media) {
    if (!media) return false;
    
    // Usar videoProcessor se disponível
    if (videoProcessor) {
        return videoProcessor.isVideo(media.url, media.type);
    }
    
    // Alternativa básica
    return media.type?.startsWith('video/') || 
           media.url?.includes('youtube.com') || 
           media.url?.includes('youtu.be') ||
           media.url?.includes('vimeo.com');
}

/**
 * Cria uma prévia de vídeo
 */
function createVideoPreview(media) {
    // Usar o videoProcessor se disponível
    if (videoProcessor) {
        const videoInfo = videoProcessor.processVideoUrl(media.url, media.type);
        
        // Se processou corretamente
        if (videoInfo) {
            if (videoInfo.thumbnailUrl) {
                // Usar thumbnail para vídeos integrados (YouTube, etc)
                return `
                    <div class="video-preview-container">
                        <img src="${videoInfo.thumbnailUrl}" alt="Prévia do vídeo" 
                             onerror="this.parentNode.innerHTML='${videoProcessor.generatePlaceholderThumbnail(videoInfo, {showPlayButton: true}).replace(/'/g, '\\\'')}';">
                        <div class="video-play-button">
                            <i class="fas fa-play"></i>
                        </div>
                    </div>
                `;
            } else {
                // Usar placeholder gerado pelo VideoProcessor
                return videoProcessor.generatePlaceholderThumbnail(videoInfo, {
                    showPlayButton: true
                });
            }
        }
    }
    
    // Fallback para preview básico
    return `
        <div class="video-preview-container">
            <div class="media-placeholder video-placeholder">
                <i class="fas fa-play-circle"></i>
                <span>Vídeo</span>
            </div>
            <div class="video-play-button">
                <i class="fas fa-play"></i>
            </div>
        </div>
    `;
}

/**
 * Abre o modal para visualização de mídia
 */
function openMediaModal(post) {
    const modal = document.getElementById('media-modal');
    const modalBody = modal.querySelector('.modal-body');
    
    if (!post || !post.media || post.media.length === 0) {
        modalBody.innerHTML = createErrorMessage('Nenhuma mídia disponível');
        modal.classList.remove('hidden');
        return;
    }
    
    // Salvar lista de mídia e índice atual
    currentMediaList = post.media;
    currentMediaIndex = 0;
    
    // Carregar a primeira mídia
    loadMediaIntoModal(post.media[0]);
    
    // Mostrar modal
    modal.classList.remove('hidden');
    
    // Atualizar botões de navegação
    updateNavigationButtons();
}

/**
 * Carrega uma mídia no modal
 */
function loadMediaIntoModal(media) {
    const modalBody = document.querySelector('#media-modal .modal-body');
    
    if (isVideoContent(media)) {
        // Usar o videoProcessor para gerar HTML
        if (videoProcessor) {
            const videoInfo = videoProcessor.processVideoUrl(media.url, media.type);
            if (videoInfo) {
                modalBody.innerHTML = videoProcessor.generateVideoHtml(videoInfo, {
                    width: '100%',
                    height: '70vh',
                    controls: true,
                    autoplay: false,
                    className: 'modal-video',
                    showFallback: true
                });
            } else {
                // Fallback para vídeos não processáveis
                modalBody.innerHTML = `
                    <div class="video-error-container">
                        <i class="fas fa-exclamation-triangle"></i>
                        <h3>Erro ao processar vídeo</h3>
                        <p>Não foi possível processar este vídeo.</p>
                        <div class="error-actions">
                            <a href="${media.url}" target="_blank" class="error-btn">
                                <i class="fas fa-external-link-alt"></i> Abrir em nova aba
                            </a>
                        </div>
                    </div>
                `;
            }
        } else {
            // Vídeo direto simples
            modalBody.innerHTML = `
                <div class="video-container direct-video-container">
                    <video controls playsinline src="${media.url}" class="modal-media-content"></video>
                </div>
            `;
        }
    } else {
        // Imagem
        modalBody.innerHTML = `
            <img src="${media.url}" alt="${media.title || ''}" class="modal-media-content"
                 onerror="this.src='../assets/images/placeholder.jpg';">
        `;
    }
    
    // Inicializar players de vídeo
    if (window.initVideoPlayers) {
        setTimeout(window.initVideoPlayers, 300);
    }
}

/**
 * Fecha o modal de mídia
 */
function closeMediaModal() {
    const modal = document.getElementById('media-modal');
    const modalBody = modal.querySelector('.modal-body');
    
    // Pausar qualquer vídeo que esteja sendo reproduzido
    const videoElements = modalBody.querySelectorAll('video');
    videoElements.forEach(video => {
        if (video && !video.paused) {
            video.pause();
        }
    });
    
    // Esconder modal
    modal.classList.add('hidden');
    
    // Limpar conteúdo após transição
    setTimeout(() => {
        modalBody.innerHTML = '';
    }, 300);
}

/**
 * Navega entre mídias no modal
 */
function navigateMedia(direction) {
    if (!currentMediaList || currentMediaList.length <= 1) return;
    
    // Calcular novo índice
    const newIndex = currentMediaIndex + direction;
    
    // Validar limites
    if (newIndex < 0 || newIndex >= currentMediaList.length) return;
    
    currentMediaIndex = newIndex;
    
    // Carregar nova mídia
    loadMediaIntoModal(currentMediaList[currentMediaIndex]);
    
    // Atualizar botões de navegação
    updateNavigationButtons();
}

/**
 * Atualiza a visibilidade dos botões de navegação
 */
function updateNavigationButtons() {
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    
    if (!currentMediaList || currentMediaList.length <= 1) {
        // Esconder ambos os botões se houver apenas uma mídia
        if (prevBtn) prevBtn.style.display = 'none';
        if (nextBtn) nextBtn.style.display = 'none';
        return;
    }
    
    // Mostrar/esconder botão anterior
    if (prevBtn) {
        prevBtn.style.display = currentMediaIndex > 0 ? 'flex' : 'none';
    }
    
    // Mostrar/esconder botão próximo
    if (nextBtn) {
        nextBtn.style.display = currentMediaIndex < currentMediaList.length - 1 ? 'flex' : 'none';
    }
}

/**
 * Configura navegação por teclado para o modal
 */
function setupKeyboardNavigation() {
    document.addEventListener('keydown', function(event) {
        // Verificar se o modal está aberto
        const modal = document.getElementById('media-modal');
        if (modal.classList.contains('hidden')) return;
        
        // ESC fecha o modal
        if (event.key === 'Escape') {
            closeMediaModal();
        }
        // Setas navegam entre mídias
        else if (event.key === 'ArrowLeft') {
            navigateMedia(-1);
        }
        else if (event.key === 'ArrowRight') {
            navigateMedia(1);
        }
    });
}

/**
 * Inicializa players de vídeo na página
 */
function initVideoPlayers() {
    // Selecionar todos os vídeos na página
    const videoElements = document.querySelectorAll('video');
    
    videoElements.forEach(video => {
        // Configurar eventos básicos
        video.addEventListener('error', function(e) {
            console.error('Erro no vídeo:', e);
            
            // Substituir por mensagem de erro
            const container = this.closest('.video-container, .video-preview-container');
            if (container) {
                container.innerHTML = `
                    <div class="video-error-message">
                        <i class="fas fa-exclamation-triangle"></i>
                        <p>Não foi possível carregar o vídeo</p>
                        <small>O vídeo pode não estar mais disponível ou o formato não é suportado pelo seu navegador.</small>
                    </div>
                `;
            }
        });
        
        // Cliques para vídeos
        const container = video.closest('.video-container, .video-preview-container');
        if (container) {
            container.addEventListener('click', function(e) {
                if (e.target.closest('a')) return; // Ignorar cliques em links
                
                // Toggle play/pause
                if (video.paused) {
                    safePlayVideo(video)
                        .then(() => {
                            container.classList.add('playing');
                        })
                        .catch(err => {
                            console.warn('Erro ao reproduzir vídeo:', err);
                        });
                } else {
                    video.pause();
                    container.classList.remove('playing');
                }
            });
        }
        
        // Configurar eventos de carregamento
        video.addEventListener('loadstart', function() {
            this.style.opacity = '0.6';
            
            // Adicionar indicador de carregamento
            const container = this.closest('.video-container, .video-preview-container');
            if (container && !container.querySelector('.video-loading')) {
                const loader = document.createElement('div');
                loader.className = 'video-loading';
                loader.innerHTML = '<div class="video-loading-spinner"></div>';
                container.appendChild(loader);
            }
        });
        
        video.addEventListener('canplay', function() {
            this.style.opacity = '1';
            
            // Remover indicador de carregamento
            const container = this.closest('.video-container, .video-preview-container');
            if (container) {
                const loader = container.querySelector('.video-loading');
                if (loader) loader.remove();
            }
        });
    });
    
    console.log(`${videoElements.length} players de vídeo inicializados`);
}

// Funções auxiliares
function showLoading(container) {
    container.innerHTML = `
        <div class="loading-container">
            <div class="loading-spinner"></div>
            <p>Carregando posts...</p>
        </div>
    `;
    isLoading = true;
}

function hideLoading() {
    isLoading = false;
}

function createEmptyMessage() {
    if (currentFilter === 'photos') {
        return `
            <div class="empty-message">
                <i class="fas fa-image"></i>
                <h3>Nenhuma foto encontrada</h3>
                <p>Não existem fotos disponíveis nesta galeria no momento.</p>
            </div>
        `;
    } else if (currentFilter === 'videos') {
        return `
            <div class="empty-message">
                <i class="fas fa-video"></i>
                <h3>Nenhum vídeo encontrado</h3>
                <p>Não existem vídeos disponíveis nesta galeria no momento.</p>
            </div>
        `;
    } else {
        return `
            <div class="empty-message">
                <i class="fas fa-images"></i>
                <h3>Galeria vazia</h3>
                <p>Não existem posts disponíveis nesta galeria no momento.</p>
            </div>
        `;
    }
}

function createErrorMessage(message) {
    return `
        <div class="error-message">
            <i class="fas fa-exclamation-triangle"></i>
            <h3>Erro</h3>
            <p>${message}</p>
        </div>
    `;
}

// Exportar funções para uso global
window.openMediaModal = openMediaModal;
window.closeMediaModal = closeMediaModal;
window.navigateMedia = navigateMedia;
window.initVideoPlayers = initVideoPlayers;