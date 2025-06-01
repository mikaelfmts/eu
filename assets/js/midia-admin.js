
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
    apiKey: "AIzaSyDGYhV8yVyMY6yOLnwuPfcLk9fqNWjM4vw",
    authDomain: "portfolio-mikael-ferreira.firebaseapp.com",
    projectId: "portfolio-mikael-ferreira",
    storageBucket: "portfolio-mikael-ferreira.appspot.com",
    messagingSenderId: "983078101167",
    appId: "1:983078101167:web:c8b894f9dc3fe6fa44e68b"
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
    if (mediaInput) {
        mediaInput.addEventListener('change', handleMediaUpload);
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

    // Mostrar loading
    showLoading('Fazendo upload das mídias...');

    try {
        for (const file of files) {
            const mediaItem = await uploadMediaFile(file);
            uploadedMedia.push(mediaItem);
            
            // Criar preview
            const previewElement = createMediaPreview(mediaItem);
            uploadContainer.appendChild(previewElement);
        }
        
        showSuccess(`${files.length} arquivo(s) enviado(s) com sucesso!`);
    } catch (error) {
        console.error('Erro no upload:', error);
        showError('Erro ao fazer upload das mídias');
    } finally {
        hideLoading();
    }
}

async function uploadMediaFile(file) {
    const fileName = `galeria/${Date.now()}_${file.name}`;
    const storageRef = ref(storage, fileName);
    
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return {
        url: downloadURL,
        type: file.type.startsWith('video') ? 'video' : 'image',
        name: file.name,
        size: file.size,
        storagePath: fileName
    };
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
    
    if (!title || uploadedMedia.length === 0) {
        showError('Título e pelo menos uma mídia são obrigatórios');
        return;
    }
    
    showLoading('Salvando post...');
    
    try {
        const postData = {
            title,
            description,
            media: uploadedMedia,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            visible: true
        };
        
        if (currentPost) {
            // Atualizar post existente
            await updateDoc(doc(db, 'galeria_posts', currentPost.id), postData);
            showSuccess('Post atualizado com sucesso!');
        } else {
            // Criar novo post
            await addDoc(collection(db, 'galeria_posts'), postData);
            showSuccess('Post criado com sucesso!');
        }
        
        // Limpar formulário
        resetPostForm();
        
        // Recarregar lista de posts
        loadPosts();
        
    } catch (error) {
        console.error('Erro ao salvar post:', error);
        showError('Erro ao salvar post');
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
    // Implementar loading modal ou spinner
    console.log('Loading:', message);
}

function hideLoading() {
    // Ocultar loading
    console.log('Loading hidden');
}

function showSuccess(message) {
    // Implementar notificação de sucesso
    alert('Sucesso: ' + message);
}

function showError(message) {
    // Implementar notificação de erro
    alert('Erro: ' + message);
}

function applyTheme() {
    // Aplicar tema salvo
    const savedTheme = localStorage.getItem('theme') || 'league';
    document.body.classList.add(`theme-${savedTheme}`);
}

// Importar getDoc se não estiver disponível
import { getDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
