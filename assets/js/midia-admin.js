import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { 
    getFirestore, 
    collection, 
    addDoc, 
    getDocs, 
    updateDoc, 
    deleteDoc, 
    doc, 
    query, 
    orderBy,
    serverTimestamp,
    setDoc
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { 
    getStorage, 
    ref, 
    uploadBytes, 
    getDownloadURL, 
    deleteObject 
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js';

// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyA0VoWMLTJIyI54Pj0P5T75gCH6KpgAcbk",
    authDomain: "mikaelfmts.firebaseapp.com",
    projectId: "mikaelfmts",
    storageBucket: "mikaelfmts.firebasestorage.app",
    messagingSenderId: "516762612351",
    appId: "1:516762612351:web:f8a0f229ffd5def8ec054a"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// Estado da aplicação
let currentPost = null;
let uploadedMedia = [];

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    initializeAdmin();
    setupEventListeners();
    loadPosts();
    loadFeaturedMedia();
});

function initializeAdmin() {
    // Configurar partículas
    if (typeof createParticles === 'function') {
        createParticles();
    }
    
    // Configurar tema
    applyTheme();
}

function setupEventListeners() {
    // Alternância de abas
    const tabButtons = document.querySelectorAll('[data-tab]');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => switchTab(button.dataset.tab));
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
                // Simular o evento de mudança do input
                Object.defineProperty(mediaInput, 'files', {
                    value: e.dataTransfer.files,
                    writable: false,
                });
                handleMediaUpload({ target: mediaInput });
            }
        });
    }

    // Formulário de post
    const postForm = document.getElementById('post-form');
    if (postForm) {
        postForm.addEventListener('submit', handlePostSubmit);
    }

    // Botão de voltar
    const backButton = document.getElementById('back-button');
    if (backButton) {
        backButton.addEventListener('click', () => {
            window.location.href = 'admin.html';
        });
    }

    // Configurar featured media
    const featuredForm = document.getElementById('featured-form');
    if (featuredForm) {
        featuredForm.addEventListener('submit', handleFeaturedSubmit);
    }
}

function switchTab(tabName) {
    // Ocultar todas as abas
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.add('hidden');
    });

    // Remover classe ativa de todos os botões
    document.querySelectorAll('[data-tab]').forEach(button => {
        button.classList.remove('bg-yellow-600', 'text-white');
        button.classList.add('bg-gray-700', 'text-gray-300');
    });

    // Mostrar aba selecionada
    const selectedTab = document.getElementById(`${tabName}-tab`);
    if (selectedTab) {
        selectedTab.classList.remove('hidden');
    }

    // Ativar botão selecionado
    const selectedButton = document.querySelector(`[data-tab="${tabName}"]`);
    if (selectedButton) {
        selectedButton.classList.remove('bg-gray-700', 'text-gray-300');
        selectedButton.classList.add('bg-yellow-600', 'text-white');
    }
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
    const maxRetries = 3;
    let currentTry = 0;
    
    while (currentTry < maxRetries) {
        try {
            currentTry++;
            
            // Sanitizar nome do arquivo para evitar caracteres problemáticos
            const sanitizedName = file.name
                .replace(/[^a-zA-Z0-9.-]/g, '_')
                .toLowerCase();
            const timestamp = Date.now();
            const fileName = `galeria/${timestamp}_${currentTry}_${sanitizedName}`;
            
            // Criar referência com path simples
            const storageRef = ref(storage, fileName);
            
            // Delay progressivo entre tentativas
            if (currentTry > 1) {
                const delayTime = currentTry * 2000; // 2s, 4s, 6s
                console.log(`Tentativa ${currentTry}/${maxRetries} em ${delayTime/1000}s...`);
                await delay(delayTime);
            }
            
            // Upload sem metadata adicional para evitar problemas de CORS
            const snapshot = await uploadBytes(storageRef, file);
            
            // Aguardar um pouco antes de obter a URL
            await delay(1000);
            
            const downloadURL = await getDownloadURL(snapshot.ref);
            
            return {
                url: downloadURL,
                type: file.type.startsWith('video') ? 'video' : 'image',
                name: file.name,
                size: file.size,
                storagePath: fileName
            };
            
        } catch (error) {
            console.error(`Erro na tentativa ${currentTry}:`, error);
            
            // Se é a última tentativa, lance o erro
            if (currentTry >= maxRetries) {
                let errorMessage = 'Falha no upload após múltiplas tentativas';
                
                if (error.code === 'storage/unauthorized') {
                    errorMessage = 'Erro de autorização - verifique se está logado';
                } else if (error.code === 'storage/canceled') {
                    errorMessage = 'Upload cancelado';
                } else if (error.code === 'storage/unknown') {
                    errorMessage = 'Erro de rede - verifique sua conexão';
                } else if (error.message) {
                    errorMessage = error.message;
                }
                
                throw new Error(errorMessage);
            }
            
            // Continuar para próxima tentativa
            console.log(`Tentando novamente... (${currentTry}/${maxRetries})`);
        }
    }
}

function createMediaPreview(mediaItem) {
    const div = document.createElement('div');
    div.className = 'relative bg-gray-800 rounded-lg overflow-hidden border border-yellow-600';
    
    let mediaElement;
    if (mediaItem.type === 'video') {
        mediaElement = `
            <video class="w-full h-32 object-cover" controls>
                <source src="${mediaItem.url}" type="video/mp4">
            </video>
        `;
    } else {
        mediaElement = `
            <img src="${mediaItem.url}" alt="Preview" class="w-full h-32 object-cover">
        `;
    }
    
    div.innerHTML = `
        ${mediaElement}
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
            media: validMedia,
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
            
            // Excluir mídias do storage
            if (post.media) {
                for (const media of post.media) {
                    if (media.storagePath) {
                        try {
                            await deleteObject(ref(storage, media.storagePath));
                        } catch (error) {
                            console.warn('Erro ao excluir mídia do storage:', error);
                        }
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
    
    let mediaElement;
    if (media.type === 'video') {
        mediaElement = `
            <video class="w-full h-32 object-cover" controls>
                <source src="${media.url}" type="video/mp4">
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
    const mediaInput = document.getElementById('featured-media');
    
    if (!title || !mediaInput.files[0]) {
        showError('Título e mídia são obrigatórios');
        return;
    }
    
    showLoading('Configurando mídia em destaque...');
    
    try {
        // Upload da mídia
        const mediaItem = await uploadMediaFile(mediaInput.files[0]);
        
        // Buscar configuração atual
        const docRef = doc(db, 'site_config', 'featured_media');
        const docSnap = await getDoc(docRef);
        
        let currentMedia = [];
        if (docSnap.exists() && docSnap.data().media) {
            currentMedia = docSnap.data().media;
        }
        
        // Adicionar nova mídia
        const newMedia = {
            ...mediaItem,
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
            
            // Remover mídia do storage
            if (media[index] && media[index].storagePath) {
                try {
                    await deleteObject(ref(storage, media[index].storagePath));
                } catch (error) {
                    console.warn('Erro ao excluir mídia do storage:', error);
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
    // Aplicar tema salvo
    const savedTheme = localStorage.getItem('theme') || 'league';
    document.body.classList.add(`theme-${savedTheme}`);
}

// Importar getDoc se não estiver disponível
import { getDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Função auxiliar para aguardar e evitar rate limiting
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Função para validar arquivo antes do upload
function validateFile(file) {
    const maxSize = 10 * 1024 * 1024; // 10MB para plano gratuito
    const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const allowedVideoTypes = ['video/mp4', 'video/webm'];
    const allowedTypes = [...allowedImageTypes, ...allowedVideoTypes];
    
    if (!file) {
        throw new Error('Arquivo não encontrado');
    }
    
    if (file.size > maxSize) {
        throw new Error(`Arquivo muito grande. Máximo: 10MB para plano gratuito. Atual: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
    }
    
    if (file.size === 0) {
        throw new Error('Arquivo vazio');
    }
    
    if (!allowedTypes.includes(file.type)) {
        throw new Error(`Tipo de arquivo não suportado: ${file.type}. Tipos aceitos: ${allowedTypes.join(', ')}`);
    }
    
    // Validação adicional para vídeos
    if (allowedVideoTypes.includes(file.type)) {
        const videoMaxSize = 5 * 1024 * 1024; // 5MB para vídeos
        if (file.size > videoMaxSize) {
            throw new Error(`Vídeo muito grande. Máximo: 5MB. Atual: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
        }
    }
    
    // Verificar nome do arquivo
    if (file.name.length > 100) {
        throw new Error('Nome do arquivo muito longo (máximo 100 caracteres)');
    }
    
    return true;
}
