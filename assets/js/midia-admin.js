import { auth, db } from './firebase-config.js';
import { 
    collection, 
    addDoc, 
    getDocs, 
    updateDoc, 
    deleteDoc, 
    doc, 
    query, 
    orderBy,
    serverTimestamp,
    setDoc,
    getDoc
} from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js';
import { 
    signInAnonymously, 
    onAuthStateChanged 
} from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js';

// Função utilitária
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Estado da aplicação
let currentPost = null;
let uploadedMedia = [];
let isAuthenticated = false;
let featuredMediaItem = null; // Variável para armazenar mídia em destaque selecionada

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎬 DOM carregado, inicializando mídia admin...');
    
    // Configurar event listeners imediatamente
    setupEventListeners();
    
    // Mostrar primeira aba
    switchTab('criar');
    
    // Configurar autenticação após setup
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            isAuthenticated = true;
            console.log('🎬 Usuário autenticado:', user.uid);
            // Carregar dados após autenticação
            loadPosts();
            loadFeaturedMedia();
        } else {
            // Login anônimo automático
            try {
                const userCredential = await signInAnonymously(auth);
                console.log('🎬 Login anônimo realizado:', userCredential.user.uid);
                isAuthenticated = true;
                loadPosts();
                loadFeaturedMedia();
            } catch (error) {
                console.error('❌ Erro no login anônimo:', error);
                isAuthenticated = false;
            }
        }
    });
});

function initializeAdmin() {
    console.log('Inicializando admin...');
    
    // Configurar partículas
    if (typeof createParticles === 'function') {
        createParticles();
    }
    
    // Configurar tema
    applyTheme();
    
    // Aguardar um pouco para garantir que o DOM está pronto
    setTimeout(() => {
        console.log('Mostrando primeira aba...');
        switchTab('criar');
        console.log('Aba inicial configurada');
    }, 100);
}

function setupEventListeners() {
    console.log('Configurando event listeners...');
    
    // Alternância de abas
    const tabButtons = document.querySelectorAll('[data-tab]');
    console.log('Botões de aba encontrados:', tabButtons.length);
    tabButtons.forEach(button => {
        console.log('Configurando botão:', button.dataset.tab);
        button.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Clicou na aba:', button.dataset.tab);
            switchTab(button.dataset.tab);
        });
    });

    // Upload de mídia
    const mediaInput = document.getElementById('media-files');
    const uploadArea = document.getElementById('upload-area');
    
    if (mediaInput && uploadArea) {
        mediaInput.addEventListener('change', handleMediaUpload);
        
        // Clique na área de upload
        uploadArea.addEventListener('click', () => {
            mediaInput.click();
        });
        
        // Drag and drop
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = 'var(--primary-color)';
            uploadArea.style.background = 'rgba(200, 170, 110, 0.1)';
        });
        
        uploadArea.addEventListener('dragleave', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = 'var(--border-color)';
            uploadArea.style.background = 'rgba(60, 60, 65, 0.3)';
        });
          uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = 'var(--border-color)';
            uploadArea.style.background = 'rgba(60, 60, 65, 0.3)';
            
            const files = Array.from(e.dataTransfer.files);
            if (files.length > 0) {
                // Processar arquivos diretamente sem modificar o input
                handleDroppedFiles(files);
            }
        });
    }    // Formulário de post
    const postForm = document.getElementById('post-form');
    if (postForm) {
        postForm.addEventListener('submit', handlePostSubmit);
    }

    // Radio buttons para escolha de mídia (arquivo vs URL)
    const mediaSourceRadios = document.querySelectorAll('input[name="media-source"]');
    mediaSourceRadios.forEach(radio => {
        radio.addEventListener('change', handleMediaSourceChange);
    });

    // Botão para adicionar mídia por URL
    const addUrlButton = document.getElementById('add-url-media');
    if (addUrlButton) {
        addUrlButton.addEventListener('click', handleAddUrlMedia);
    }

    // Botão de voltar
    const backButton = document.getElementById('back-button');
    if (backButton) {
        backButton.addEventListener('click', () => {
            window.location.href = 'admin.html';
        });
    }

    // Botão de limpar formulário
    const clearButton = document.getElementById('clear-form');
    if (clearButton) {
        clearButton.addEventListener('click', (e) => {
            e.preventDefault();
            clearForm();
        });
    }

    // Configurar featured media
    const featuredForm = document.getElementById('featured-form');
    if (featuredForm) {
        featuredForm.addEventListener('submit', handleFeaturedSubmit);
    }

    // Upload de mídia em destaque
    const featuredInput = document.getElementById('featured-input');
    const featuredUploadArea = document.getElementById('featured-upload-area');
    
    if (featuredInput && featuredUploadArea) {
        // Clique na área de upload
        featuredUploadArea.addEventListener('click', () => {
            featuredInput.click();
        });

        // Mudança de arquivo
        featuredInput.addEventListener('change', handleFeaturedMediaUpload);
        
        // Drag and drop para mídia em destaque
        featuredUploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            featuredUploadArea.style.borderColor = 'var(--primary-color)';
            featuredUploadArea.style.background = 'rgba(200, 170, 110, 0.15)';
        });
        
        featuredUploadArea.addEventListener('dragleave', (e) => {
            e.preventDefault();
            featuredUploadArea.style.borderColor = 'var(--border-color)';
            featuredUploadArea.style.background = 'rgba(200, 170, 110, 0.05)';
        });
          featuredUploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            featuredUploadArea.style.borderColor = 'var(--border-color)';
            featuredUploadArea.style.background = 'rgba(200, 170, 110, 0.05)';
            
            const files = Array.from(e.dataTransfer.files);
            if (files.length > 0) {
                // Processar apenas o primeiro arquivo para mídia em destaque
                handleFeaturedDroppedFile(files[0]);
            }
        });
    }

    // Radio buttons para mídia em destaque (arquivo vs URL)
    const featuredMediaTypeRadios = document.querySelectorAll('input[name="featured-media-type"]');
    featuredMediaTypeRadios.forEach(radio => {
        radio.addEventListener('change', handleFeaturedMediaTypeChange);
    });

    // Botão para adicionar mídia em destaque por URL
    const addFeaturedUrlButton = document.getElementById('add-featured-url');
    if (addFeaturedUrlButton) {
        addFeaturedUrlButton.addEventListener('click', handleAddFeaturedUrlMedia);
    }
}

// ===== SISTEMA DE VÍDEOS =====

// Funções para gerenciamento de vídeos
async function loadVideos() {
    try {
        const videosRef = collection(db, 'videos');
        const q = query(videosRef, orderBy('uploadedAt', 'desc'));
        const querySnapshot = await getDocs(q);
        
        const videosContainer = document.getElementById('videos-container');
        const noVideosMessage = document.getElementById('no-videos-message');
        
        // Limpar o container
        videosContainer.innerHTML = '';
        
        if (querySnapshot.empty) {
            noVideosMessage.style.display = 'block';
            return;
        }
        
        noVideosMessage.style.display = 'none';
        
        querySnapshot.forEach((doc) => {
            const videoData = doc.data();
            const videoCard = createVideoCard(doc.id, videoData);
            videosContainer.appendChild(videoCard);
        });
    } catch (error) {
        console.error('Erro ao carregar vídeos:', error);
        showNotification('Erro ao carregar vídeos', 'error');
    }
}

function createVideoCard(id, videoData) {
    const card = document.createElement('div');
    card.className = 'media-card bg-gray-800 rounded-lg p-4';
    card.dataset.id = id;
    
    let thumbnailUrl = '';
    let videoType = '';
    
    // Determinar a fonte da miniatura com base no tipo de vídeo
    if (videoData.platform === 'youtube') {
        thumbnailUrl = videoData.thumbnailUrl || `https://img.youtube.com/vi/${videoData.videoId}/hqdefault.jpg`;
        videoType = '<i class="fab fa-youtube" style="color: #FF0000;"></i> YouTube';
    } else if (videoData.platform === 'vimeo') {
        thumbnailUrl = videoData.thumbnailUrl;
        videoType = '<i class="fab fa-vimeo-v" style="color: #1AB7EA;"></i> Vimeo';
    } else if (videoData.url && videoData.thumbnailUrl) {
        thumbnailUrl = videoData.thumbnailUrl;
        videoType = '<i class="fas fa-link"></i> URL Externa';
    } else if (videoData.thumbnailData) {
        thumbnailUrl = videoData.thumbnailData;
        videoType = '<i class="fas fa-file-video"></i> Upload';
    }
    
    card.innerHTML = `
        <div class="relative h-32 mb-3 overflow-hidden rounded-lg">
            <img src="${thumbnailUrl}" alt="${videoData.title}" class="w-full h-full object-cover">
            <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.5);">
                <i class="fas fa-play-circle" style="font-size: 3rem; color: var(--primary-color);"></i>
            </div>
            <div style="position: absolute; bottom: 0; left: 0; width: 100%; padding: 0.5rem; background: linear-gradient(transparent, rgba(0,0,0,0.8));">
                <span style="color: white; font-size: 0.7rem;">${videoType}</span>
            </div>
        </div>
        <h3 class="mb-2 text-white truncate font-bold">${videoData.title}</h3>
        <div class="flex justify-between items-center">
            <span class="text-xs text-gray-400">${new Date(videoData.uploadedAt.toDate()).toLocaleDateString()}</span>
            <div class="flex">
                <button class="preview-video p-1" title="Visualizar" data-id="${id}">
                    <i class="fas fa-eye text-blue-500"></i>
                </button>
                <button class="delete-video p-1 ml-2" title="Excluir" data-id="${id}">
                    <i class="fas fa-trash text-red-500"></i>
                </button>
            </div>
        </div>
    `;
    
    // Adicionar event listeners
    card.querySelector('.preview-video').addEventListener('click', () => previewVideo(videoData));
    card.querySelector('.delete-video').addEventListener('click', () => deleteVideo(id));
    
    return card;
}

function previewVideo(videoData) {
    // Implementar a visualização do vídeo em um modal
    const modal = document.getElementById('confirm-modal');
    const modalContent = modal.querySelector('.modal-content');
    
    // Personalizar o modal para visualização de vídeo
    modalContent.innerHTML = `
        <h3 style="font-size: 1.125rem; font-weight: bold; margin-bottom: 1rem; color: var(--primary-color);">
            ${videoData.title}
        </h3>
        <div id="video-modal-player" style="width: 100%; margin-bottom: 1rem; position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden;">
            <!-- O player será inserido aqui -->
        </div>
        <div style="display: flex; justify-content: flex-end;">
            <button id="close-video-modal" class="btn" style="background: var(--primary-color); color: var(--background-dark);">
                Fechar
            </button>
        </div>
    `;
    
    // Inserir o player de vídeo apropriado
    const playerContainer = modalContent.querySelector('#video-modal-player');
    
    if (videoData.platform === 'youtube') {
        playerContainer.innerHTML = `
            <iframe src="https://www.youtube.com/embed/${videoData.videoId}" 
                style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen>
            </iframe>
        `;
    } else if (videoData.platform === 'vimeo') {
        playerContainer.innerHTML = `
            <iframe src="https://player.vimeo.com/video/${videoData.videoId}" 
                style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;" 
                allow="autoplay; fullscreen; picture-in-picture" 
                allowfullscreen>
            </iframe>
        `;
    } else if (videoData.url) {
        playerContainer.innerHTML = `
            <video controls style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;">
                <source src="${videoData.url}" type="video/mp4">
                Seu navegador não suporta a reprodução de vídeos.
            </video>
        `;
    } else if (videoData.data) {
        playerContainer.innerHTML = `
            <video controls style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;">
                <source src="${videoData.data}" type="video/mp4">
                Seu navegador não suporta a reprodução de vídeos.
            </video>
        `;
    }
    
    // Event listener para fechar o modal
    modalContent.querySelector('#close-video-modal').addEventListener('click', () => {
        modal.classList.remove('show');
    });
    
    // Exibir o modal
    modal.classList.add('show');
}

async function deleteVideo(videoId) {
    // Confirmar exclusão
    const confirmed = await showConfirmDialog('Excluir Vídeo', 'Tem certeza que deseja excluir este vídeo? Esta ação não pode ser desfeita.');
    if (!confirmed) return;
    
    try {
        // Remover do Firestore
        await deleteDoc(doc(db, 'videos', videoId));
        
        // Recarregar a lista de vídeos
        loadVideos();
        
        showNotification('Vídeo excluído com sucesso', 'success');
    } catch (error) {
        console.error('Erro ao excluir vídeo:', error);
        showNotification('Erro ao excluir vídeo', 'error');
    }
}

// Funções para upload de vídeos
function setupVideoTabs() {
    // Event listeners para as abas dentro da seção de vídeos
    const videoTabButtons = document.querySelectorAll('[data-video-tab]');
    videoTabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.getAttribute('data-video-tab');
            switchVideoTab(tabName);
        });
    });
    
    // Configuração da área de upload de vídeos
    const videoUploadArea = document.getElementById('video-upload-area');
    const videoFileInput = document.getElementById('video-file');
    
    if (videoUploadArea && videoFileInput) {
        videoUploadArea.addEventListener('click', () => {
            videoFileInput.click();
        });
        
        videoFileInput.addEventListener('change', handleVideoFileUpload);
        
        // Drag and drop para vídeos
        videoUploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            videoUploadArea.style.borderColor = 'var(--text-gold)';
            videoUploadArea.style.background = 'rgba(200, 170, 110, 0.15)';
        });
        
        videoUploadArea.addEventListener('dragleave', (e) => {
            e.preventDefault();
            videoUploadArea.style.borderColor = 'var(--primary-color)';
            videoUploadArea.style.background = 'rgba(200, 170, 110, 0.05)';
        });
        
        videoUploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            videoUploadArea.style.borderColor = 'var(--primary-color)';
            videoUploadArea.style.background = 'rgba(200, 170, 110, 0.05)';
            
            const files = Array.from(e.dataTransfer.files);
            if (files.length > 0 && files[0].type.startsWith('video/')) {
                videoFileInput.files = e.dataTransfer.files;
                handleVideoFileUpload({target: videoFileInput});
            } else {
                showNotification('Por favor, arraste apenas arquivos de vídeo.', 'error');
            }
        });
    }
    
    // Botões de salvar vídeos
    const saveUploadedVideoBtn = document.getElementById('save-uploaded-video');
    if (saveUploadedVideoBtn) {
        saveUploadedVideoBtn.addEventListener('click', saveUploadedVideo);
    }
    
    const previewYoutubeBtn = document.getElementById('preview-youtube');
    const saveYoutubeVideoBtn = document.getElementById('save-youtube-video');
    if (previewYoutubeBtn && saveYoutubeVideoBtn) {
        previewYoutubeBtn.addEventListener('click', previewYoutubeVideo);
        saveYoutubeVideoBtn.addEventListener('click', saveYoutubeVideo);
    }
    
    const previewVimeoBtn = document.getElementById('preview-vimeo');
    const saveVimeoVideoBtn = document.getElementById('save-vimeo-video');
    if (previewVimeoBtn && saveVimeoVideoBtn) {
        previewVimeoBtn.addEventListener('click', previewVimeoVideo);
        saveVimeoVideoBtn.addEventListener('click', saveVimeoVideo);
    }
    
    const saveOtherVideoBtn = document.getElementById('save-other-video');
    if (saveOtherVideoBtn) {
        saveOtherVideoBtn.addEventListener('click', saveOtherVideo);
    }
}

function switchVideoTab(tabName) {
    // Ocultar todas as abas
    document.querySelectorAll('.video-tab-content').forEach(tab => {
        tab.classList.add('hidden');
    });
    
    // Remover classe ativa de todos os botões
    document.querySelectorAll('[data-video-tab]').forEach(button => {
        button.classList.remove('active');
    });
    
    // Mostrar aba selecionada
    const selectedTab = document.getElementById(`${tabName}-video-tab`);
    if (selectedTab) {
        selectedTab.classList.remove('hidden');
    }
    
    // Ativar botão selecionado
    const selectedButton = document.querySelector(`[data-video-tab="${tabName}"]`);
    if (selectedButton) {
        selectedButton.classList.add('active');
    }
}

// Variáveis para armazenar temporariamente os dados do vídeo
let currentVideoFile = null;
let currentVideoData = null;
let currentVideoThumbnail = null;
let youtubeVideoId = null;
let vimeoVideoId = null;

function handleVideoFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Verificar tipo e tamanho do arquivo
    if (!file.type.startsWith('video/')) {
        showNotification('Por favor, selecione um arquivo de vídeo válido.', 'error');
        return;
    }
    
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
        showNotification('O vídeo selecionado é muito grande. O tamanho máximo é 100MB.', 'error');
        return;
    }
    
    // Armazenar o arquivo para processamento posterior
    currentVideoFile = file;
    
    // Exibir preview
    const videoPreviewContainer = document.getElementById('video-preview-container');
    const videoPreview = document.getElementById('video-preview');
    
    if (videoPreviewContainer && videoPreview) {
        videoPreviewContainer.style.display = 'block';
        
        // Criar URL do arquivo para preview
        const videoUrl = URL.createObjectURL(file);
        videoPreview.src = videoUrl;
        
        // Adicionar listener para capturar thumbnail
        videoPreview.addEventListener('loadeddata', generateVideoThumbnail);
    }
}

function generateVideoThumbnail() {
    const video = document.getElementById('video-preview');
    
    // Garantir que o vídeo está pronto
    if (video.readyState === 0) {
        setTimeout(generateVideoThumbnail, 500);
        return;
    }
    
    // Seek para um ponto do vídeo para capturar um frame
    video.currentTime = Math.min(1, video.duration / 4);
    
    setTimeout(() => {
        const canvas = document.createElement('canvas');
        const aspectRatio = video.videoWidth / video.videoHeight;
        
        // Definir dimensões para o thumbnail (mantendo proporção)
        const width = 320;
        const height = width / aspectRatio;
        
        canvas.width = width;
        canvas.height = height;
        
        // Renderizar o frame no canvas
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, width, height);
        
        // Converter para base64
        currentVideoThumbnail = canvas.toDataURL('image/jpeg', 0.7);
        
        // Habilitar o botão de salvar
        const saveButton = document.getElementById('save-uploaded-video');
        if (saveButton) {
            saveButton.disabled = false;
        }
    }, 500);
}

async function saveUploadedVideo() {
    if (!currentVideoFile || !currentVideoThumbnail) {
        showNotification('Nenhum vídeo selecionado ou thumbnail não gerado.', 'error');
        return;
    }
    
    const videoTitle = document.getElementById('video-title-upload').value.trim();
    if (!videoTitle) {
        showNotification('Por favor, informe um título para o vídeo.', 'error');
        return;
    }
    
    // Mostrar progresso
    const progressContainer = document.getElementById('upload-video-progress');
    const progressFill = document.getElementById('upload-progress-fill');
    const statusText = document.getElementById('upload-status');
    
    progressContainer.style.display = 'block';
    progressFill.style.width = '0%';
    statusText.textContent = 'Preparando vídeo...';
    
    try {
        // Ler o arquivo como base64 (simulando upload)
        const reader = new FileReader();
        
        reader.onprogress = (event) => {
            if (event.lengthComputable) {
                const progress = Math.round((event.loaded / event.total) * 80);
                progressFill.style.width = `${progress}%`;
                statusText.textContent = `Lendo arquivo... ${progress}%`;
            }
        };
        
        reader.onload = async (e) => {
            const videoBase64 = e.target.result;
            progressFill.style.width = '80%';
            statusText.textContent = 'Salvando no banco de dados...';
            
            // Salvar no Firestore
            const videoData = {
                id: generateUniqueId(),
                title: videoTitle,
                type: currentVideoFile.type,
                data: videoBase64,
                thumbnailData: currentVideoThumbnail,
                uploadedAt: serverTimestamp(),
                size: currentVideoFile.size,
            };
            
            try {
                const docRef = await addDoc(collection(db, 'videos'), videoData);
                progressFill.style.width = '100%';
                statusText.textContent = 'Vídeo salvo com sucesso!';
                
                // Limpar dados temporários
                currentVideoFile = null;
                currentVideoThumbnail = null;
                
                // Limpar formulário
                document.getElementById('video-title-upload').value = '';
                document.getElementById('video-file').value = '';
                document.getElementById('video-preview-container').style.display = 'none';
                
                // Carregar lista de vídeos atualizada
                await loadVideos();
                
                // Ocultar progresso após um breve delay
                setTimeout(() => {
                    progressContainer.style.display = 'none';
                }, 2000);
                
                showNotification('Vídeo salvo com sucesso!', 'success');
            } catch (error) {
                console.error('Erro ao salvar vídeo:', error);
                statusText.textContent = 'Erro ao salvar vídeo.';
                showNotification('Erro ao salvar vídeo.', 'error');
            }
        };
        
        reader.onerror = () => {
            statusText.textContent = 'Erro ao ler o arquivo.';
            showNotification('Erro ao ler o arquivo.', 'error');
        };
        
        reader.readAsDataURL(currentVideoFile);
    } catch (error) {
        console.error('Erro no processamento do vídeo:', error);
        progressContainer.style.display = 'none';
        showNotification('Erro ao processar o vídeo.', 'error');
    }
}

function previewYoutubeVideo() {
    const youtubeUrl = document.getElementById('youtube-url').value.trim();
    if (!youtubeUrl) {
        showNotification('Por favor, informe uma URL do YouTube.', 'error');
        return;
    }
    
    // Extrair ID do vídeo
    const videoId = extractYoutubeVideoId(youtubeUrl);
    if (!videoId) {
        showNotification('URL do YouTube inválida.', 'error');
        return;
    }
    
    // Salvar o ID para uso posterior
    youtubeVideoId = videoId;
    
    // Mostrar preview
    const previewContainer = document.getElementById('youtube-preview-container');
    const previewIframe = document.getElementById('youtube-iframe');
    
    if (previewContainer && previewIframe) {
        previewContainer.style.display = 'block';
        previewIframe.src = `https://www.youtube.com/embed/${videoId}`;
        
        // Habilitar botão de salvar
        const saveButton = document.getElementById('save-youtube-video');
        if (saveButton) {
            saveButton.disabled = false;
        }
    }
}

function extractYoutubeVideoId(url) {
    // Regex para extrair o ID do vídeo do YouTube de diferentes formatos de URL
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    
    return (match && match[2].length === 11) ? match[2] : null;
}

async function saveYoutubeVideo() {
    if (!youtubeVideoId) {
        showNotification('Por favor, gere uma preview do vídeo primeiro.', 'error');
        return;
    }
    
    const videoTitle = document.getElementById('video-title-youtube').value.trim();
    if (!videoTitle) {
        showNotification('Por favor, informe um título para o vídeo.', 'error');
        return;
    }
    
    try {
        // Dados do vídeo
        const videoData = {
            id: generateUniqueId(),
            title: videoTitle,
            platform: 'youtube',
            videoId: youtubeVideoId,
            thumbnailUrl: `https://img.youtube.com/vi/${youtubeVideoId}/maxresdefault.jpg`,
            uploadedAt: serverTimestamp(),
            type: 'video/youtube'
        };
        
        // Salvar no Firestore
        const docRef = await addDoc(collection(db, 'videos'), videoData);
        
        // Limpar formulário
        document.getElementById('video-title-youtube').value = '';
        document.getElementById('youtube-url').value = '';
        document.getElementById('youtube-preview-container').style.display = 'none';
        youtubeVideoId = null;
        
        // Carregar lista de vídeos atualizada
        await loadVideos();
        
        showNotification('Vídeo do YouTube adicionado com sucesso!', 'success');
    } catch (error) {
        console.error('Erro ao salvar vídeo do YouTube:', error);
        showNotification('Erro ao salvar vídeo do YouTube.', 'error');
    }
}

function previewVimeoVideo() {
    const vimeoUrl = document.getElementById('vimeo-url').value.trim();
    if (!vimeoUrl) {
        showNotification('Por favor, informe uma URL do Vimeo.', 'error');
        return;
    }
    
    // Extrair ID do vídeo
    const videoId = extractVimeoVideoId(vimeoUrl);
    if (!videoId) {
        showNotification('URL do Vimeo inválida.', 'error');
        return;
    }
    
    // Salvar o ID para uso posterior
    vimeoVideoId = videoId;
    
    // Obter informações do vídeo e miniatura via API
    fetchVimeoThumbnail(videoId).then(thumbnailUrl => {
        // Mostrar preview
        const previewContainer = document.getElementById('vimeo-preview-container');
        const previewIframe = document.getElementById('vimeo-iframe');
        
        if (previewContainer && previewIframe) {
            previewContainer.style.display = 'block';
            previewIframe.src = `https://player.vimeo.com/video/${videoId}`;
            
            // Armazenar URL da miniatura
            currentVideoData = { thumbnailUrl: thumbnailUrl };
            
            // Habilitar botão de salvar
            const saveButton = document.getElementById('save-vimeo-video');
            if (saveButton) {
                saveButton.disabled = false;
            }
        }
    }).catch(error => {
        console.error('Erro ao obter miniatura do Vimeo:', error);
        showNotification('Não foi possível carregar a preview.', 'error');
    });
}

function extractVimeoVideoId(url) {
    // Regex para extrair o ID do vídeo do Vimeo
    const regExp = /(?:vimeo\.com\/|player\.vimeo\.com\/video\/)([0-9]+)/;
    const match = url.match(regExp);
    
    return match ? match[1] : null;
}

async function fetchVimeoThumbnail(videoId) {
    try {
        // Usar API pública do Vimeo para obter informações do vídeo
        const response = await fetch(`https://vimeo.com/api/v2/video/${videoId}.json`);
        const data = await response.json();
        
        // Retornar URL da miniatura
        return data[0].thumbnail_large;
    } catch (error) {
        console.error('Erro ao obter informações do vídeo do Vimeo:', error);
        // Retornar uma URL genérica em caso de erro
        return `https://i.vimeocdn.com/video/${videoId}_640.jpg`;
    }
}

async function saveVimeoVideo() {
    if (!vimeoVideoId) {
        showNotification('Por favor, gere uma preview do vídeo primeiro.', 'error');
        return;
    }
    
    const videoTitle = document.getElementById('video-title-vimeo').value.trim();
    if (!videoTitle) {
        showNotification('Por favor, informe um título para o vídeo.', 'error');
        return;
    }
    
    try {
        // Dados do vídeo
        const videoData = {
            id: generateUniqueId(),
            title: videoTitle,
            platform: 'vimeo',
            videoId: vimeoVideoId,
            thumbnailUrl: currentVideoData?.thumbnailUrl || `https://i.vimeocdn.com/video/${vimeoVideoId}_640.jpg`,
            uploadedAt: serverTimestamp(),
            type: 'video/vimeo'
        };
        
        // Salvar no Firestore
        const docRef = await addDoc(collection(db, 'videos'), videoData);
        
        // Limpar formulário
        document.getElementById('video-title-vimeo').value = '';
        document.getElementById('vimeo-url').value = '';
        document.getElementById('vimeo-preview-container').style.display = 'none';
        vimeoVideoId = null;
        currentVideoData = null;
        
        // Carregar lista de vídeos atualizada
        await loadVideos();
        
        showNotification('Vídeo do Vimeo adicionado com sucesso!', 'success');
    } catch (error) {
        console.error('Erro ao salvar vídeo do Vimeo:', error);
        showNotification('Erro ao salvar vídeo do Vimeo.', 'error');
    }
}

async function saveOtherVideo() {
    const videoTitle = document.getElementById('video-title-other').value.trim();
    const videoUrl = document.getElementById('other-video-url').value.trim();
    const thumbnailUrl = document.getElementById('other-thumbnail-url').value.trim();
    
    if (!videoTitle) {
        showNotification('Por favor, informe um título para o vídeo.', 'error');
        return;
    }
    
    if (!videoUrl) {
        showNotification('Por favor, informe a URL do vídeo.', 'error');
        return;
    }
    
    // Usar uma thumbnail padrão se não fornecida
    const finalThumbnailUrl = thumbnailUrl || 'https://dummyimage.com/640x360/333/fff&text=Vídeo';
    
    try {
        // Dados do vídeo
        const videoData = {
            id: generateUniqueId(),
            title: videoTitle,
            url: videoUrl,
            thumbnailUrl: finalThumbnailUrl,
            uploadedAt: serverTimestamp(),
            type: 'video/url'
        };
        
        // Salvar no Firestore
        const docRef = await addDoc(collection(db, 'videos'), videoData);
        
        // Limpar formulário
        document.getElementById('video-title-other').value = '';
        document.getElementById('other-video-url').value = '';
        document.getElementById('other-thumbnail-url').value = '';
        
        // Carregar lista de vídeos atualizada
        await loadVideos();
        
        showNotification('Vídeo adicionado com sucesso!', 'success');
    } catch (error) {
        console.error('Erro ao salvar vídeo externo:', error);
        showNotification('Erro ao salvar vídeo externo.', 'error');
    }
}

// Utilitário para exibir modal de confirmação
function showConfirmDialog(title, message) {
    return new Promise(resolve => {
        const modal = document.getElementById('confirm-modal');
        const modalTitle = document.getElementById('confirm-title');
        const modalMessage = document.getElementById('confirm-message');
        const confirmButton = document.getElementById('confirm-ok');
        const cancelButton = document.getElementById('confirm-cancel');
        
        modalTitle.textContent = title;
        modalMessage.textContent = message;
        
        const handleConfirm = () => {
            modal.classList.remove('show');
            removeEventListeners();
            resolve(true);
        };
        
        const handleCancel = () => {
            modal.classList.remove('show');
            removeEventListeners();
            resolve(false);
        };
        
        const removeEventListeners = () => {
            confirmButton.removeEventListener('click', handleConfirm);
            cancelButton.removeEventListener('click', handleCancel);
        };
        
        confirmButton.addEventListener('click', handleConfirm);
        cancelButton.addEventListener('click', handleCancel);
        
        modal.classList.add('show');
    });
}

// Utilitário para exibir notificações
function showNotification(message, type = 'info') {
    // Implementar sistema de notificações visual
    alert(message); // Temporário
}

// Utilitário para gerar IDs únicos
function generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

function switchTab(tabName) {
    console.log('Mudando para aba:', tabName);
    
    // Ocultar todas as abas
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.add('hidden');
    });

    // Remover classe ativa de todos os botões
    document.querySelectorAll('[data-tab]').forEach(button => {
        button.classList.remove('active');
    });

    // Mostrar aba selecionada
    const selectedTab = document.getElementById(`${tabName}-tab`);
    if (selectedTab) {
        selectedTab.classList.remove('hidden');
        console.log('Aba mostrada:', tabName);
        
        // Se for a aba de vídeos, inicializar sistema de vídeos
        if (tabName === 'videos') {
            setupVideoTabs();
            loadVideos();
        }
    } else {
        console.error('Aba não encontrada:', `${tabName}-tab`);
    }

    // Ativar botão selecionado
    const selectedButton = document.querySelector(`[data-tab="${tabName}"]`);
    if (selectedButton) {
        selectedButton.classList.add('active');
        console.log('Botão ativado:', tabName);
    } else {
        console.error('Botão não encontrado:', `[data-tab="${tabName}"]`);
    }
}

// Função para validar arquivo
function validateFile(file) {
    // Validação de tamanho (50MB geral, 100MB para vídeos)
    const maxSizeGeneral = 50 * 1024 * 1024; // 50MB
    const maxSizeVideo = 100 * 1024 * 1024; // 100MB
    
    const isVideo = file.type.startsWith('video/');
    const maxSize = isVideo ? maxSizeVideo : maxSizeGeneral;
    
    if (file.size > maxSize) {
        const sizeMB = (maxSize / (1024 * 1024)).toFixed(0);
        throw new Error(`Arquivo muito grande. Tamanho máximo: ${sizeMB}MB`);
    }
    
    // Validação de tamanho mínimo (para detectar arquivos corrompidos)
    const minSize = 100; // 100 bytes
    if (file.size < minSize) {
        throw new Error('Arquivo muito pequeno ou corrompido');
    }
    
    // Tipos de arquivo permitidos
    const allowedImageTypes = [
        'image/jpeg',
        'image/jpg', 
        'image/png',
        'image/gif',
        'image/webp',
        'image/bmp',
        'image/svg+xml'
    ];
    
    const allowedVideoTypes = [
        'video/mp4',
        'video/webm',
        'video/ogg',
        'video/quicktime', // .mov
        'video/x-msvideo', // .avi
        'video/x-ms-wmv'   // .wmv
    ];
    
    const allowedTypes = [...allowedImageTypes, ...allowedVideoTypes];
    
    if (!allowedTypes.includes(file.type)) {
        throw new Error('Tipo de arquivo não suportado. Use imagens (JPG, PNG, GIF, WebP) ou vídeos (MP4, WebM, OGG)');
    }
    
    // Validação de extensão (segurança adicional)
    const fileName = file.name.toLowerCase();
    const allowedExtensions = [
        '.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg',
        '.mp4', '.webm', '.ogg', '.mov', '.avi', '.wmv'
    ];
    
    const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));
    if (!hasValidExtension) {
        throw new Error('Extensão de arquivo não permitida');
    }
    
    // Validação do nome do arquivo
    if (file.name.length > 255) {
        throw new Error('Nome do arquivo muito longo (máximo 255 caracteres)');
    }
    
    // Caracteres perigosos no nome do arquivo
    const dangerousChars = /[<>:"/\\|?*\x00-\x1f]/;
    if (dangerousChars.test(file.name)) {
        throw new Error('Nome do arquivo contém caracteres não permitidos');
    }
    
    return true;
}

// Função para alternar entre upload de arquivo e URL
function handleMediaSourceChange(event) {
    const uploadArea = document.getElementById('upload-area');
    const urlArea = document.getElementById('url-area');
    
    if (event.target.value === 'file') {
        uploadArea.classList.remove('hidden');
        urlArea.classList.add('hidden');
    } else {
        uploadArea.classList.add('hidden');
        urlArea.classList.remove('hidden');
    }
}

// Função para adicionar mídia por URL
async function handleAddUrlMedia() {
    const urlInput = document.getElementById('media-url');
    const url = urlInput.value.trim();
    
    if (!url) {
        alert('Por favor, insira uma URL válida.');
        return;
    }
    
    try {
        // Criar objeto de mídia similar ao upload de arquivo
        const mediaItem = {
            id: Date.now().toString(),
            name: extractFilenameFromUrl(url),
            type: detectMediaType(url),
            url: url,
            isUrl: true,
            data: null // URLs não precisam de dados base64
        };
        
        // Adicionar à lista de mídias
        uploadedMedia.push(mediaItem);
        
        // Atualizar preview
        addMediaToPreview(mediaItem);
        
        // Limpar input
        urlInput.value = '';
        
        console.log('Mídia adicionada por URL:', mediaItem);
        
    } catch (error) {
        console.error('Erro ao adicionar mídia por URL:', error);
        alert('Erro ao processar a URL. Verifique se ela é válida.');
    }
}

// Função auxiliar para extrair nome do arquivo da URL
function extractFilenameFromUrl(url) {
    try {
        const urlObj = new URL(url);
        const pathname = urlObj.pathname;
        const filename = pathname.split('/').pop();
        
        // Se não há nome de arquivo, usar domínio
        if (!filename || filename === '') {
            return urlObj.hostname;
        }
        
        return filename;
    } catch {
        return 'Mídia externa';
    }
}

// Função auxiliar para detectar tipo de mídia da URL
function detectMediaType(url) {
    const lowerUrl = url.toLowerCase();
    
    // YouTube
    if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) {
        return 'video/youtube';
    }
    
    // Vimeo
    if (lowerUrl.includes('vimeo.com')) {
        return 'video/vimeo';
    }
    
    // Extensões de imagem
    if (lowerUrl.match(/\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/)) {
        return 'image/url';
    }
    
    // Extensões de vídeo
    if (lowerUrl.match(/\.(mp4|webm|ogg|avi|mov)(\?|$)/)) {
        return 'video/url';
    }
    
    // Default
    return 'url/unknown';
}

async function handleMediaUpload(event) {
    const files = Array.from(event.target.files);
    const uploadContainer = document.getElementById('upload-preview');
    
    if (!uploadContainer) return;

    // Limpar preview anterior
    uploadContainer.innerHTML = '';
    uploadedMedia = [];

    if (files.length === 0) return;

    // Validar arquivos antes do upload
    const validFiles = [];
    
    for (const file of files) {
        try {
            validateFile(file);
            validFiles.push(file);
        } catch (error) {
            showError(`${file.name}: ${error.message}`);
        }
    }

    if (validFiles.length === 0) {
        showError('Nenhum arquivo válido selecionado');
        return;
    }

    // Mostrar loading
    showLoading(`Preparando upload de ${validFiles.length} arquivo(s)...`);

    let successCount = 0;
    let errorCount = 0;

    // Processar arquivos sequencialmente para evitar sobrecarga
    for (let i = 0; i < validFiles.length; i++) {
        const file = validFiles[i];
        
        try {
            showLoading(`Enviando ${file.name} (${i + 1}/${validFiles.length})...`);
            
            // Delay maior entre uploads para plano gratuito
            if (i > 0) {
                await delay(3000); // 3 segundos entre uploads
            }
            
            const mediaItem = await uploadMediaFile(file);
            uploadedMedia.push(mediaItem);
            
            // Criar preview
            const previewElement = createMediaPreview(mediaItem);
            uploadContainer.appendChild(previewElement);
            
            successCount++;
            
            // Feedback de progresso
            showLoading(`Concluído: ${successCount}/${validFiles.length} arquivos`);
            
        } catch (error) {
            console.error(`Erro no upload de ${file.name}:`, error);
            errorCount++;
            showError(`Falha no upload de ${file.name}: ${error.message}`);
            
            // Continuar com próximo arquivo mesmo se um falhar
            continue;
        }
    }
    
    // Mensagem final
    hideLoading();
    
    if (successCount > 0) {
        showSuccess(`✅ ${successCount} arquivo(s) enviado(s) com sucesso!`);
    }
    
    if (errorCount > 0) {
        showError(`❌ ${errorCount} arquivo(s) falharam no upload`);
    }

    if (successCount === 0 && errorCount > 0) {
        showError('Nenhum arquivo foi enviado com sucesso. Verifique sua conexão e tente novamente.');
    }
}

async function uploadMediaFile(file) {
    try {
        // Verificar autenticação
        if (!isAuthenticated || !auth.currentUser) {
            try {
                console.log('Fazendo login anônimo...');
                await signInAnonymously(auth);
                await new Promise(resolve => setTimeout(resolve, 1000));
                console.log('Login realizado com sucesso');
                isAuthenticated = true;
            } catch (authError) {
                console.error('Erro no login:', authError);
            }
        }
        
        // Validar arquivo
        validateFile(file);
        
        // Converter arquivo para base64
        const base64Data = await fileToBase64(file);
        
        // Criar ID único para o arquivo
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substr(2, 9);
        const fileId = `${timestamp}_${randomId}`;
        
        // Salvar no Firestore
        const mediaData = {
            id: fileId,
            name: file.name,
            type: file.type,
            size: file.size,
            data: base64Data,
            uploadedAt: serverTimestamp(),
            uploadedBy: 'admin-panel'
        };
        
        await setDoc(doc(db, 'galeria_media', fileId), mediaData);
        
        console.log('Arquivo salvo no Firestore:', fileId);
        
        // Retornar URL base64 para exibição
        return {
            url: base64Data,
            name: file.name,
            id: fileId,
            type: file.type
        };
        
    } catch (error) {
        console.error('Erro no upload:', error);
        throw error;
    }
}

// Função para converter arquivo para base64
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        // Verificar se é imagem e se precisa comprimir
        if (file.type.startsWith('image/') && file.size > 500000) { // 500KB
            compressImage(file).then(resolve).catch(reject);
        } else {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        }
    });
}

// Função para comprimir imagens
function compressImage(file) {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = function() {
            // Calcular dimensões mantendo proporção - mais agressivo
            let { width, height } = img;
            let maxDimension = 1000; // Reduzido para 1000px
            
            // Se a imagem for muito grande, reduzir ainda mais
            if (file.size > 2000000) { // Se > 2MB original
                maxDimension = 800;
            }
            
            if (width > height && width > maxDimension) {
                height = (height * maxDimension) / width;
                width = maxDimension;
            } else if (height > maxDimension) {
                width = (width * maxDimension) / height;
                height = maxDimension;
            }
            
            canvas.width = width;
            canvas.height = height;
            
            // Desenhar imagem redimensionada
            ctx.drawImage(img, 0, 0, width, height);
            
            // Converter para base64 com qualidade mais baixa inicialmente
            let quality = 0.6; // Qualidade inicial reduzida
            let dataUrl = canvas.toDataURL('image/jpeg', quality);
            
            // Limite mais agressivo para garantir que fique abaixo de 1MB
            const maxSize = 750000; // ~750KB limite (seguro para Firestore)
            
            while (dataUrl.length > maxSize && quality > 0.1) {
                quality -= 0.05; // Redução menor para melhor controle
                dataUrl = canvas.toDataURL('image/jpeg', quality);
            }
            
            // Se ainda estiver muito grande, reduzir dimensões
            if (dataUrl.length > maxSize) {
                const newWidth = Math.floor(width * 0.8);
                const newHeight = Math.floor(height * 0.8);
                
                canvas.width = newWidth;
                canvas.height = newHeight;
                ctx.drawImage(img, 0, 0, newWidth, newHeight);
                
                quality = 0.5;
                dataUrl = canvas.toDataURL('image/jpeg', quality);
                
                while (dataUrl.length > maxSize && quality > 0.1) {
                    quality -= 0.05;
                    dataUrl = canvas.toDataURL('image/jpeg', quality);
                }
            }
            
            console.log(`Imagem comprimida: ${(dataUrl.length / 1024).toFixed(1)}KB, qualidade: ${quality}`);
            resolve(dataUrl);
        };
        
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
    });
}

function createMediaPreview(mediaItem) {
    const div = document.createElement('div');
    div.className = 'relative bg-gray-800 rounded-lg overflow-hidden border border-yellow-600';
    
    let mediaElement;
    
    // URLs do YouTube
    if (mediaItem.type === 'video/youtube') {
        const videoId = extractYouTubeId(mediaItem.url);
        mediaElement = `
            <div class="w-full h-32 bg-gray-900 flex items-center justify-center">
                <div class="text-center">
                    <i class="fab fa-youtube text-red-500 text-2xl mb-1"></i>
                    <p class="text-xs text-gray-400">YouTube Video</p>
                </div>
            </div>
        `;
    }
    // URLs do Vimeo
    else if (mediaItem.type === 'video/vimeo') {
        mediaElement = `
            <div class="w-full h-32 bg-gray-900 flex items-center justify-center">
                <div class="text-center">
                    <i class="fab fa-vimeo text-blue-500 text-2xl mb-1"></i>
                    <p class="text-xs text-gray-400">Vimeo Video</p>
                </div>
            </div>
        `;
    }
    // URLs de imagem
    else if (mediaItem.type === 'image/url') {
        mediaElement = `
            <img src="${mediaItem.url}" alt="Preview" class="w-full h-32 object-cover" 
                 onerror="this.parentElement.innerHTML='<div class=&quot;w-full h-32 bg-gray-900 flex items-center justify-center&quot;><div class=&quot;text-center&quot;><i class=&quot;fas fa-image text-gray-500 text-2xl mb-1&quot;></i><p class=&quot;text-xs text-gray-400&quot;>Imagem Externa</p></div></div>'">
        `;
    }
    // URLs de vídeo
    else if (mediaItem.type === 'video/url') {
        mediaElement = `
            <video class="w-full h-32 object-cover" controls>
                <source src="${mediaItem.url}" type="video/mp4">
                <div class="w-full h-32 bg-gray-900 flex items-center justify-center">
                    <div class="text-center">
                        <i class="fas fa-video text-gray-500 text-2xl mb-1"></i>
                        <p class="text-xs text-gray-400">Vídeo Externo</p>
                    </div>
                </div>
            </video>
        `;
    }
    // URLs desconhecidas
    else if (mediaItem.type === 'url/unknown') {
        mediaElement = `
            <div class="w-full h-32 bg-gray-900 flex items-center justify-center">
                <div class="text-center">
                    <i class="fas fa-link text-gray-500 text-2xl mb-1"></i>
                    <p class="text-xs text-gray-400">Link Externo</p>
                </div>
            </div>
        `;
    }
    // Arquivos tradicionais (vídeo local)
    else if (mediaItem.type === 'video') {
        mediaElement = `
            <video class="w-full h-32 object-cover" controls>
                <source src="${mediaItem.url}" type="video/mp4">
            </video>
        `;
    }
    // Arquivos tradicionais (imagem local)
    else {
        mediaElement = `
            <img src="${mediaItem.url}" alt="Preview" class="w-full h-32 object-cover">
        `;
    }
    
    // Adicionar indicador de URL externa
    const urlIndicator = mediaItem.isUrl ? `
        <div class="absolute top-2 left-2">
            <span class="bg-blue-600 text-white text-xs px-2 py-1 rounded">URL</span>
        </div>
    ` : '';
    
    div.innerHTML = `
        ${mediaElement}
        ${urlIndicator}
        <div class="absolute top-2 right-2">
            <button onclick="removeMediaItem('${mediaItem.url}')" 
                    class="bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-700">
                ×
            </button>
        </div>
        <div class="p-2">
            <p class="text-xs text-gray-400 truncate">${mediaItem.name}</p>
            <p class="text-xs text-yellow-600">${mediaItem.type}</p>
        </div>
    `;
    
    return div;
}

// Função auxiliar para extrair ID do YouTube
function extractYouTubeId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

// Função para adicionar mídia ao preview
function addMediaToPreview(mediaItem) {
    const container = document.getElementById('upload-preview');
    if (!container) return;
    
    const preview = createMediaPreview(mediaItem);
    container.appendChild(preview);
}

window.removeMediaItem = function(url) {
    uploadedMedia = uploadedMedia.filter(item => item.url !== url);
    
    // Recriar preview
    const container = document.getElementById('upload-preview');
    container.innerHTML = '';
    
    uploadedMedia.forEach(item => {
        const preview = createMediaPreview(item);
        container.appendChild(preview);
    });
};

async function handlePostSubmit(event) {
    event.preventDefault();
    
    const title = document.getElementById('post-title').value.trim();
    const description = document.getElementById('post-description').value.trim();
    
    // Validações aprimoradas
    if (!title) {
        showError('❌ Título é obrigatório');
        document.getElementById('post-title').focus();
        return;
    }
    
    if (uploadedMedia.length === 0) {
        showError('❌ Pelo menos uma mídia é obrigatória');
        return;
    }
    
    if (title.length < 3) {
        showError('❌ Título muito curto (mínimo 3 caracteres)');
        document.getElementById('post-title').focus();
        return;
    }
    
    if (title.length > 100) {
        showError('❌ Título muito longo (máximo 100 caracteres)');
        document.getElementById('post-title').focus();
        return;
    }
    
    if (description.length > 500) {
        showError('❌ Descrição muito longa (máximo 500 caracteres)');
        document.getElementById('post-description').focus();
        return;
    }
    
    // Verificar se as mídias ainda são válidas
    const validMedia = uploadedMedia.filter(media => media.url && media.type);
    if (validMedia.length === 0) {
        showError('❌ Nenhuma mídia válida encontrada. Faça upload novamente.');
        return;
    }
    
    showLoading('💾 Salvando post...');
    
    try {
        // Delay para evitar rate limiting no plano gratuito
        await delay(1000);
          const postData = {
            title: title,
            description: description || '',
            mediaIds: validMedia.map(media => media.id), // Salvar apenas IDs
            media: validMedia, // Manter para compatibilidade temporária
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            visible: true,
            mediaCount: validMedia.length
        };
        
        let docRef;
        
        if (currentPost) {
            // Atualizar post existente
            docRef = doc(db, 'galeria_posts', currentPost.id);
            await updateDoc(docRef, {
                ...postData,
                updatedAt: serverTimestamp()
            });
            showSuccess('✅ Post atualizado com sucesso!');
        } else {
            // Criar novo post
            docRef = await addDoc(collection(db, 'galeria_posts'), postData);
            showSuccess('✅ Post criado com sucesso!');
        }
        
        // Aguardar antes de continuar
        await delay(1500);
        
        // Limpar formulário
        resetPostForm();
        
        // Recarregar lista de posts após delay
        setTimeout(() => {
            loadPosts();
        }, 1000);
        
    } catch (error) {
        console.error('Erro ao salvar post:', error);
        let errorMessage = '❌ Erro ao salvar post';
        
        if (error.code === 'permission-denied') {
            errorMessage = '❌ Permissão negada. Verifique as configurações do Firebase.';
        } else if (error.code === 'unavailable') {
            errorMessage = '❌ Serviço temporariamente indisponível. Tente novamente em alguns minutos.';
        } else if (error.code === 'resource-exhausted') {
            errorMessage = '❌ Limite de operações excedido. Aguarde alguns minutos.';
        } else if (error.message) {
            errorMessage = `❌ Erro: ${error.message}`;
        }
          showError(errorMessage);
    } finally {
        hideLoading();
    }
}

function resetPostForm() {
    document.getElementById('post-form').reset();
    document.getElementById('upload-preview').innerHTML = '';
    uploadedMedia = [];
    currentPost = null;
    
    const submitButton = document.querySelector('#post-form button[type="submit"]');
    if (submitButton) {
        submitButton.textContent = 'Criar Post';
    }
}

async function loadPosts() {
    const container = document.getElementById('posts-list');
    if (!container) return;
    
    try {
        showLoading('Carregando posts...');
        
        const q = query(collection(db, 'galeria_posts'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        
        container.innerHTML = '';
        
        if (querySnapshot.empty) {
            container.innerHTML = `
                <div class="text-center py-8 text-gray-400">
                    <i class="fas fa-images text-4xl mb-4"></i>
                    <p>Nenhum post encontrado</p>
                </div>
            `;
            return;
        }
        
        querySnapshot.forEach(doc => {
            const post = { id: doc.id, ...doc.data() };
            const postElement = createPostElement(post);
            container.appendChild(postElement);
        });
        
    } catch (error) {
        console.error('Erro ao carregar posts:', error);
        showError('Erro ao carregar posts');
    } finally {
        hideLoading();
    }
}

function createPostElement(post) {
    const div = document.createElement('div');
    div.className = 'bg-gray-800 rounded-lg border border-gray-700 overflow-hidden';
    
    const firstMedia = post.media && post.media.length > 0 ? post.media[0] : null;
    const mediaCount = post.media ? post.media.length : 0;
    
    let mediaPreview = '';
    if (firstMedia) {
        if (firstMedia.type === 'video') {
            mediaPreview = `
                <video class="w-full h-32 object-cover">
                    <source src="${firstMedia.url}" type="video/mp4">
                </video>
            `;
        } else {
            mediaPreview = `
                <img src="${firstMedia.url}" alt="Preview" class="w-full h-32 object-cover">
            `;
        }
    } else {
        mediaPreview = `
            <div class="w-full h-32 bg-gray-700 flex items-center justify-center">
                <i class="fas fa-image text-gray-500 text-2xl"></i>
            </div>
        `;
    }
    
    const createdAt = post.createdAt && post.createdAt.toDate ? 
        post.createdAt.toDate().toLocaleDateString('pt-BR') : 
        'Data não disponível';
    
    div.innerHTML = `
        ${mediaPreview}
        <div class="p-4">
            <div class="flex justify-between items-start mb-2">
                <h3 class="text-white font-semibold truncate flex-1">${post.title}</h3>
                <span class="text-xs text-yellow-600 ml-2">${mediaCount} mídia(s)</span>
            </div>
            
            <p class="text-gray-400 text-sm mb-3 line-clamp-2">${post.description || 'Sem descrição'}</p>
            
            <div class="flex justify-between items-center text-xs text-gray-500 mb-3">
                <span>${createdAt}</span>
                <span class="${post.visible ? 'text-green-500' : 'text-red-500'}">
                    ${post.visible ? 'Visível' : 'Oculto'}
                </span>
            </div>
            
            <div class="flex gap-2">
                <button onclick="editPost('${post.id}')" 
                        class="flex-1 bg-blue-600 text-white py-2 px-3 rounded hover:bg-blue-700 text-sm">
                    <i class="fas fa-edit mr-1"></i> Editar
                </button>
                <button onclick="togglePostVisibility('${post.id}', ${!post.visible})" 
                        class="flex-1 bg-yellow-600 text-white py-2 px-3 rounded hover:bg-yellow-700 text-sm">
                    <i class="fas fa-eye${post.visible ? '-slash' : ''} mr-1"></i> 
                    ${post.visible ? 'Ocultar' : 'Mostrar'}
                </button>
                <button onclick="deletePost('${post.id}')" 
                        class="bg-red-600 text-white py-2 px-3 rounded hover:bg-red-700 text-sm">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `;
    
    return div;
}

window.editPost = async function(postId) {
    try {
        showLoading('Carregando post...');
        
        const docRef = doc(db, 'galeria_posts', postId);
        const docSnap = await getDoc(docRef);
        
        if (!docSnap.exists()) {
            showError('Post não encontrado');
            return;
        }
        
        const post = { id: docSnap.id, ...docSnap.data() };
        currentPost = post;
        
        // Preencher formulário
        document.getElementById('post-title').value = post.title;
        document.getElementById('post-description').value = post.description || '';
        
        // Configurar mídia
        uploadedMedia = post.media || [];
        
        // Mostrar preview das mídias
        const container = document.getElementById('upload-preview');
        container.innerHTML = '';
        
        uploadedMedia.forEach(item => {
            const preview = createMediaPreview(item);
            container.appendChild(preview);
        });
        
        // Alterar botão de submit
        const submitButton = document.querySelector('#post-form button[type="submit"]');
        if (submitButton) {
            submitButton.textContent = 'Atualizar Post';
        }
        
        // Mudar para aba de criação
        switchTab('criar');
        
    } catch (error) {
        console.error('Erro ao carregar post:', error);
        showError('Erro ao carregar post');
    } finally {
        hideLoading();
    }
};

window.togglePostVisibility = async function(postId, visible) {
    try {
        showLoading('Atualizando visibilidade...');
        
        await updateDoc(doc(db, 'galeria_posts', postId), {
            visible: visible,
            updatedAt: serverTimestamp()
        });
        
        showSuccess(`Post ${visible ? 'exibido' : 'ocultado'} com sucesso!`);
        loadPosts();
        
    } catch (error) {
        console.error('Erro ao alterar visibilidade:', error);
        showError('Erro ao alterar visibilidade');
    } finally {
        hideLoading();
    }
};

window.deletePost = async function(postId) {
    if (!confirm('Tem certeza que deseja excluir este post? Esta ação não pode ser desfeita.')) {
        return;
    }
    
    try {
        showLoading('Excluindo post...');
        
        // Buscar post para excluir mídias do storage
        const docRef = doc(db, 'galeria_posts', postId);
        const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const post = docSnap.data();
            
            // Excluir mídias do Firestore se tiverem IDs
            if (post.mediaIds) {
                for (const mediaId of post.mediaIds) {
                    try {
                        await deleteDoc(doc(db, 'galeria_media', mediaId));
                    } catch (error) {
                        console.warn('Erro ao excluir mídia do Firestore:', error);
                    }
                }
            }
        }
        
        // Excluir documento
        await deleteDoc(docRef);
        
        showSuccess('Post excluído com sucesso!');
        loadPosts();
        
    } catch (error) {
        console.error('Erro ao excluir post:', error);
        showError('Erro ao excluir post');
    } finally {
        hideLoading();
    }
};

async function loadFeaturedMedia() {
    const container = document.getElementById('featured-list');
    if (!container) return;
    
    try {
        const docRef = doc(db, 'site_config', 'featured_media');
        const docSnap = await getDoc(docRef);
        
        container.innerHTML = '';
        
        if (docSnap.exists()) {
            const config = docSnap.data();
            
            if (config.media) {
                config.media.forEach((media, index) => {
                    const mediaElement = createFeaturedMediaElement(media, index);
                    container.appendChild(mediaElement);
                });
            }
        }
        
        if (container.children.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8 text-gray-400">
                    <i class="fas fa-star text-4xl mb-4"></i>
                    <p>Nenhuma mídia em destaque configurada</p>
                </div>
            `;
        }
        
    } catch (error) {
        console.error('Erro ao carregar mídia em destaque:', error);
    }
}

function createFeaturedMediaElement(media, index) {
    const div = document.createElement('div');
    div.className = 'bg-gray-800 rounded-lg border border-yellow-600 overflow-hidden';
    
    const mediaType = media.type || '';
    const isVideo = mediaType.startsWith('video/') || 
                   mediaType === 'video' ||
                   /\.(mp4|webm|ogg|avi|mov)$/i.test(media.url);
    
    let mediaElement;
    if (isVideo) {
        mediaElement = `
            <video class="w-full h-32 object-cover" controls preload="metadata">
                <source src="${media.url}" type="${mediaType.startsWith('video/') ? mediaType : 'video/mp4'}">
            </video>
        `;
    } else {
        mediaElement = `
            <img src="${media.url}" alt="Featured" class="w-full h-32 object-cover">
        `;
    }
    
    div.innerHTML = `
        ${mediaElement}
        <div class="p-4">
            <h3 class="text-white font-semibold mb-2">${media.title}</h3>
            <p class="text-gray-400 text-sm mb-3">${media.description}</p>
            <button onclick="removeFeaturedMedia(${index})" 
                    class="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700">
                <i class="fas fa-trash mr-2"></i>Remover
            </button>
        </div>
    `;
    
    return div;
}

async function handleFeaturedSubmit(event) {
    event.preventDefault();
    
    const title = document.getElementById('featured-title').value.trim();
    const description = document.getElementById('featured-description').value.trim();
    
    if (!title) {
        showError('Título é obrigatório');
        return;
    }
    
    // Verificar se temos mídia selecionada (arquivo ou URL)
    if (!featuredMediaItem) {
        showError('Selecione uma mídia para destaque');
        return;
    }
    
    showLoading('Configurando mídia em destaque...');
    
    try {
        let mediaItem = featuredMediaItem;
        
        // Se for upload de arquivo, precisamos fazer upload
        if (mediaItem.source === 'file' && mediaItem.file) {
            mediaItem = await uploadMediaFile(mediaItem.file);
        }
        
        // Buscar configuração atual
        const docRef = doc(db, 'site_config', 'featured_media');
        const docSnap = await getDoc(docRef);
        
        let currentMedia = [];
        if (docSnap.exists() && docSnap.data().media) {
            currentMedia = docSnap.data().media;
        }
        
        // Adicionar nova mídia
        const newMedia = {
            url: mediaItem.url,
            type: mediaItem.type,
            name: mediaItem.name,
            title,
            description,
            addedAt: new Date().toISOString()
        };
        
        currentMedia.push(newMedia);
        
        // Salvar configuração
        await setDoc(docRef, {
            media: currentMedia,
            updatedAt: serverTimestamp()
        });
        
        showSuccess('Mídia em destaque configurada com sucesso!');
        
        // Limpar formulário
        document.getElementById('featured-form').reset();
        clearFeaturedPreview();
        
        // Resetar para upload de arquivo
        const fileRadio = document.querySelector('input[name="featured-media-type"][value="file"]');
        if (fileRadio) {
            fileRadio.checked = true;
            handleFeaturedMediaTypeChange({ target: fileRadio });
        }
        
        // Recarregar lista
        loadFeaturedMedia();
        
    } catch (error) {
        console.error('Erro ao configurar mídia em destaque:', error);
        showError('Erro ao configurar mídia em destaque');
    } finally {
        hideLoading();
    }
}

window.removeFeaturedMedia = async function(index) {
    if (!confirm('Tem certeza que deseja remover esta mídia em destaque?')) {
        return;
    }
    
    try {
        showLoading('Removendo mídia...');
        
        const docRef = doc(db, 'site_config', 'featured_media');
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            const config = docSnap.data();
            const media = config.media || [];
              // Remover mídia do Firestore se tiver ID
            if (media[index] && media[index].id) {
                try {
                    await deleteDoc(doc(db, 'galeria_media', media[index].id));
                } catch (error) {
                    console.warn('Erro ao excluir mídia do Firestore:', error);
                }
            }
            
            // Remover da lista
            media.splice(index, 1);
            
            // Salvar configuração atualizada
            await setDoc(docRef, {
                media: media,
                updatedAt: serverTimestamp()
            });
        }
        
        showSuccess('Mídia removida com sucesso!');
        loadFeaturedMedia();
        
    } catch (error) {
        console.error('Erro ao remover mídia:', error);
        showError('Erro ao remover mídia');
    } finally {
        hideLoading();
    }
};

async function handleFeaturedMediaUpload(event) {
    const files = Array.from(event.target.files);
    const uploadContainer = document.getElementById('featured-preview');
    
    if (!uploadContainer) return;

    // Limpar preview anterior
    uploadContainer.innerHTML = '';
    uploadContainer.classList.remove('hidden');
    
    if (files.length === 0) return;

    // Validar arquivos antes do upload
    const validFiles = [];
    
    for (const file of files) {
        try {
            validateFile(file);
            validFiles.push(file);
        } catch (error) {
            showError(`${file.name}: ${error.message}`);
        }
    }

    if (validFiles.length === 0) {
        showError('Nenhum arquivo válido selecionado');
        return;
    }

    try {
        const file = validFiles[0]; // Pegamos apenas o primeiro arquivo para mídia em destaque
        
        showLoading(`Preparando mídia em destaque...`);
        
        // Criar objeto de mídia temporário para preview
        const mediaItem = {
            file: file,
            url: URL.createObjectURL(file),
            type: file.type,
            name: file.name,
            source: 'file'
        };
        
        // Mostrar preview
        showFeaturedPreview(mediaItem);
        
        // Armazenar referência para uso posterior
        featuredMediaItem = mediaItem;
        
        hideLoading();
        showSuccess(`✅ Mídia selecionada com sucesso!`);
        
    } catch (error) {
        console.error(`Erro ao processar mídia em destaque:`, error);
        showError(`Falha ao processar arquivo: ${error.message}`);
        hideLoading();
    }
}

function clearFeaturedPreview() {
    const uploadContainer = document.getElementById('featured-preview');
    if (uploadContainer) {
        uploadContainer.innerHTML = '';
        uploadContainer.classList.add('hidden');
    }
    
    // Limpar input de arquivo
    const featuredInput = document.getElementById('featured-input');
    if (featuredInput) {
        featuredInput.value = '';
    }
    
    // Resetar variável que armazena a mídia em destaque
    featuredMediaItem = null;
}

// Funções utilitárias
function showLoading(message = 'Carregando...') {
    console.log('Loading:', message);
    // Criar ou mostrar elemento de loading
    let loadingEl = document.getElementById('loading-overlay');
    if (!loadingEl) {
        loadingEl = document.createElement('div');
        loadingEl.id = 'loading-overlay';
        loadingEl.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            color: var(--primary-color);
            font-size: 1.2rem;
        `;
        loadingEl.innerHTML = `
            <div style="text-align: center;">
                <i class="fas fa-spinner fa-spin" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                <p>${message}</p>
            </div>
        `;
        document.body.appendChild(loadingEl);
    } else {
        loadingEl.querySelector('p').textContent = message;
        loadingEl.style.display = 'flex';
    }
}

function hideLoading() {
    const loadingEl = document.getElementById('loading-overlay');
    if (loadingEl) {
        loadingEl.style.display = 'none';
    }
}

function showSuccess(message) {
    showNotification(message, 'success');
}

function showError(message) {
    showNotification(message, 'error');
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 0.5rem;
        z-index: 10000;
        max-width: 400px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
    `;
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.5rem;">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

function applyTheme() {
    // Aplicar tema escuro
    document.body.classList.add('dark-theme');
}

// Função para limpar formulário
function clearForm() {
    const form = document.getElementById('post-form');
    if (form) {
        form.reset();
        uploadedMedia = [];
        updatePreview();
        
        // Resetar para upload de arquivo
        const fileRadio = document.querySelector('input[name="media-source"][value="file"]');
        if (fileRadio) {
            fileRadio.checked = true;
            handleMediaSourceChange({ target: fileRadio });
        }
    }
}

// Função para formatear data
function formatDate(timestamp) {
    if (!timestamp) return 'Data não disponível';
    
    let date;
    if (timestamp.toDate) {
        date = timestamp.toDate();
    } else if (timestamp instanceof Date) {
        date = timestamp;
    } else {
        date = new Date(timestamp);
    }
    
    return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Função para atualizar preview
function updatePreview() {
    const previewContainer = document.getElementById('upload-preview');
    if (!previewContainer) return;
    
    previewContainer.innerHTML = '';
    
    uploadedMedia.forEach((media, index) => {
        const previewElement = createMediaPreview(media, index);
        previewContainer.appendChild(previewElement);
    });
}

// Função para alternar entre upload de arquivo e URL para mídia em destaque
function handleFeaturedMediaTypeChange(event) {
    const fileSection = document.getElementById('featured-file-section');
    const urlSection = document.getElementById('featured-url-section');
    
    if (event.target.value === 'file') {
        fileSection.classList.remove('hidden');
        urlSection.classList.add('hidden');
    } else {
        fileSection.classList.add('hidden');
        urlSection.classList.remove('hidden');
    }
    
    // Limpar preview ao alternar
    clearFeaturedPreview();
}

// Função para adicionar mídia em destaque via URL
function handleAddFeaturedUrlMedia() {
    const urlInput = document.getElementById('featured-url-input');
    const url = urlInput.value.trim();
    
    if (!url) {
        showError('Por favor, insira uma URL válida.');
        return;
    }
    
    // Validar se é uma URL válida
    try {
        new URL(url);
    } catch {
        showError('Por favor, insira uma URL válida.');
        return;
    }
    
    // Detectar tipo de mídia baseado na extensão
    const extension = url.split('.').pop().toLowerCase();
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'];
    const videoExtensions = ['mp4', 'webm', 'ogg', 'avi', 'mov'];
    
    let mediaType = 'image';
    if (videoExtensions.includes(extension)) {
        mediaType = 'video';
    }
    
    // Criar objeto de mídia
    const mediaItem = {
        url: url,
        type: mediaType,
        name: url.split('/').pop() || 'Mídia via URL',
        source: 'url'
    };
    
    // Mostrar preview
    showFeaturedPreview(mediaItem);
    
    // Armazenar referência para uso posterior
    featuredMediaItem = mediaItem;
    
    // Limpar input
    urlInput.value = '';
    
    showSuccess('✅ URL adicionada com sucesso!');
    console.log('Mídia em destaque adicionada via URL:', mediaItem);
}

// Função para mostrar preview da mídia em destaque
function showFeaturedPreview(mediaItem) {
    const uploadContainer = document.getElementById('featured-preview');
    if (!uploadContainer) return;

    uploadContainer.innerHTML = '';
    uploadContainer.classList.remove('hidden');

    const previewElement = document.createElement('div');
    previewElement.style.cssText = `
        padding: 1rem;
        border: 1px solid var(--border-color);
        border-radius: 8px;
        background: rgba(60, 60, 65, 0.3);
        position: relative;
    `;

    if (mediaItem.type === 'video') {
        previewElement.innerHTML = `
            <video controls style="width: 100%; max-height: 200px; border-radius: 4px; margin-bottom: 0.5rem;">
                <source src="${mediaItem.url}" type="video/mp4">
                Seu navegador não suporta vídeo.
            </video>
            <p style="color: var(--text-light); font-size: 0.875rem; margin: 0;">
                <strong>Vídeo:</strong> ${mediaItem.name}
            </p>
            <button type="button" onclick="clearFeaturedPreview()" 
                    style="position: absolute; top: 0.5rem; right: 0.5rem; background: rgba(220, 38, 38, 0.9); color: white; border: none; border-radius: 50%; width: 24px; height: 24px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 12px;">
                ×
            </button>
        `;
    } else {
        previewElement.innerHTML = `
            <img src="${mediaItem.url}" alt="${mediaItem.name}" 
                 style="width: 100%; max-height: 200px; object-fit: cover; border-radius: 4px; margin-bottom: 0.5rem;"
                 onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
            <div style="display: none; padding: 2rem; text-align: center; color: var(--text-light); background: rgba(220, 38, 38, 0.1); border-radius: 4px; margin-bottom: 0.5rem;">
                ⚠️ Erro ao carregar imagem
            </div>
            <p style="color: var(--text-light); font-size: 0.875rem; margin: 0;">
                <strong>Imagem:</strong> ${mediaItem.name}
            </p>
            <button type="button" onclick="clearFeaturedPreview()" 
                    style="position: absolute; top: 0.5rem; right: 0.5rem; background: rgba(220, 38, 38, 0.9); color: white; border: none; border-radius: 50%; width: 24px; height: 24px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 12px;">
                ×
            </button>
        `;
    }

    uploadContainer.appendChild(previewElement);
}

// Event listeners globais
window.editPost = editPost;
window.deletePost = deletePost;
window.clearForm = clearForm;
window.removeFeaturedMedia = removeFeaturedMedia;
window.clearFeaturedPreview = clearFeaturedPreview;
window.handleFeaturedMediaTypeChange = handleFeaturedMediaTypeChange;
window.handleAddFeaturedUrlMedia = handleAddFeaturedUrlMedia;
