// Configuração do Firebase
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js';
import { 
    getFirestore, 
    doc, 
    getDoc, 
    setDoc, 
    updateDoc, 
    collection, 
    getDocs,
    onSnapshot,
    query,
    orderBy 
} from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js';

const firebaseConfig = {
    apiKey: "AIzaSyA0VoWMLTJIyI54Pj0P5T75gCH6KpgAcbk",
    authDomain: "mikaelfmts.firebaseapp.com",
    projectId: "mikaelfmts",
    storageBucket: "mikaelfmts.firebasestorage.app",
    messagingSenderId: "516762612351",
    appId: "1:516762612351:web:f8a0f229ffd5def8ec054a"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Verificação de autenticação
let currentUser = null;

function checkAuthentication() {
    return new Promise((resolve) => {
        onAuthStateChanged(auth, (user) => {
            currentUser = user;
            if (!user) {
                // Usuário não autenticado, redirecionar para login
                showNotification('Acesso não autorizado. Redirecionando para login...', 'error');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
                resolve(false);            } else {
                // Verificar se é usuário autorizado
                checkAdminPermissions(user).then(isAdmin => {
                    if (!isAdmin) {
                        showNotification('Acesso negado. Apenas Mikael pode acessar esta página.', 'error');
                        setTimeout(() => {
                            window.location.href = 'index.html';
                        }, 2000);
                        resolve(false);
                    } else {
                        resolve(true);
                    }
                });
            }
        });
    });
}

async function checkAdminPermissions(user) {
    try {
        // Verificar se o usuário tem permissões de admin
        // Por enquanto, consideramos qualquer usuário autenticado como admin
        // Em uma implementação real, você verificaria uma coleção de usuários/permissões
        return true;
    } catch (error) {
        console.error('Erro ao verificar permissões:', error);
        return false;
    }
}

// Estado global do currículo
let curriculumData = {
    personalData: {},
    experience: [],
    projects: [],
    skills: [],
    certificates: [],
    settings: {
        theme: 'modern',
        primaryColor: '#3B82F6',
        fontFamily: 'Inter',
        fontSize: 'medium',
        layout: 'single-column',
        spacing: 'normal',
        showPhoto: false,
        showSkillsProgress: true,
        showContactIcons: true,
        showProjectLinks: true
    },
    metadata: {
        createdAt: null,
        lastUpdated: null,
        version: '1.0',
        userId: null
    }
};

// GitHub API Configuration
const GITHUB_USERNAME = 'MikaelFMTS'; // Substitua pelo seu username do GitHub
const GITHUB_API_BASE = 'https://api.github.com';

// LinkedIn Configuration
const LINKEDIN_PROFILE_URL = 'https://www.linkedin.com/in/mikaelferreira/';
const LINKEDIN_USERNAME = 'mikaelferreira';

// LinkedIn data cache and fallback
const LINKEDIN_FALLBACK_DATA = {
    name: 'Mikael Ferreira',
    headline: 'Desenvolvedor Web Full Stack',
    location: 'Brasil',
    summary: 'Desenvolvedor apaixonado por tecnologia, especializado em desenvolvimento web full stack com foco em JavaScript, React, Node.js e Firebase.',
    experience: [
        {
            title: 'Desenvolvedor Web Full Stack',
            company: 'Freelancer',
            duration: '2023 - Presente',
            description: 'Desenvolvimento de aplicações web completas utilizando tecnologias modernas como React, Node.js, Firebase e outras.'
        }
    ],
    education: [
        {
            degree: 'Tecnologia em Sistemas',
            school: 'Autodidata',
            duration: '2022 - Presente',
            description: 'Aprendizado contínuo em tecnologias web modernas'
        }
    ],
    skills: [
        'JavaScript', 'React', 'Node.js', 'HTML5', 'CSS3', 'Firebase', 'Git', 'GitHub',
        'Responsive Design', 'API Development', 'Database Management', 'UI/UX Design'
    ]
};

// Cache configuration for GitHub API
const GITHUB_CACHE = {
    userData: 'github_user_data',
    repositories: 'github_repositories'
};

// Rate limiting configuration
const GITHUB_RATE_LIMIT = {
    requestsPerMinute: 60,
    requestsCount: 0,
    resetTime: 0,
    isLimited: false
};

// GitHub API rate limiter
function checkRateLimit() {
    const now = Date.now();
    
    // Reset counter every minute
    if (now > GITHUB_RATE_LIMIT.resetTime) {
        GITHUB_RATE_LIMIT.requestsCount = 0;
        GITHUB_RATE_LIMIT.resetTime = now + 60000; // 1 minute
        GITHUB_RATE_LIMIT.isLimited = false;
    }
    
    // Check if we've exceeded the limit
    if (GITHUB_RATE_LIMIT.requestsCount >= GITHUB_RATE_LIMIT.requestsPerMinute) {
        GITHUB_RATE_LIMIT.isLimited = true;
        console.warn('⚠️ Rate limit atingido, aguardando reset...');
        return false;
    }
    
    return true;
}

function incrementRateLimit() {
    GITHUB_RATE_LIMIT.requestsCount++;
}

// Enhanced GitHub API request wrapper
async function makeGitHubRequest(url, options = {}) {
    // Check rate limit first
    if (!checkRateLimit()) {
        const waitTime = Math.ceil((GITHUB_RATE_LIMIT.resetTime - Date.now()) / 1000);
        throw new Error(`Rate limit atingido. Aguarde ${waitTime} segundos.`);
    }
    
    try {
        incrementRateLimit();
        const response = await fetch(url, options);
        
        if (response.status === 403) {
            const resetTime = response.headers.get('X-RateLimit-Reset');
            if (resetTime) {
                GITHUB_RATE_LIMIT.resetTime = parseInt(resetTime) * 1000;
                GITHUB_RATE_LIMIT.isLimited = true;
            }
            throw new Error('Rate limit da API GitHub excedido');
        }
        
        if (!response.ok) {
            throw new Error(`GitHub API Error: ${response.status} ${response.statusText}`);
        }
        
        return response;
    } catch (error) {
        console.error('Erro na requisição GitHub:', error);
        throw error;
    }
}

// Cache utility functions
function getCacheItem(key) {
    try {
        const cached = localStorage.getItem(key);
        if (!cached) return null;
        
        const data = JSON.parse(cached);
        const now = Date.now();
        
        // Cache expires after 30 minutes for user data, 1 hour for repositories
        const expiryTime = key === GITHUB_CACHE.userData ? 30 * 60 * 1000 : 60 * 60 * 1000;
        
        if (now - data.timestamp > expiryTime) {
            localStorage.removeItem(key);
            return null;
        }
        
        return data.data;
    } catch (error) {
        console.error(`Erro ao ler cache ${key}:`, error);
        return null;
    }
}

function setCacheItem(key, data) {
    try {
        const cacheData = {
            data: data,
            timestamp: Date.now()
        };
        localStorage.setItem(key, JSON.stringify(cacheData));
    } catch (error) {
        console.error(`Erro ao salvar cache ${key}:`, error);
    }
}

// Função para sincronizar foto do GitHub
async function syncGitHubPhoto() {
    try {
        console.log('🖼️ Sincronizando foto do GitHub...');
        
        // Verificar cache primeiro
        const cachedUser = getCacheItem(GITHUB_CACHE.userData);
        if (cachedUser && cachedUser.avatar_url) {
            console.log('✅ Usando foto do cache');
            updatePhotoInUI(cachedUser.avatar_url);
            return cachedUser.avatar_url;
        }
        
        const response = await makeGitHubRequest(`${GITHUB_API_BASE}/users/${GITHUB_USERNAME}`);
        const data = await response.json();
        
        // Salvar no cache
        setCacheItem(GITHUB_CACHE.userData, data);
        
        if (data.avatar_url) {
            console.log('✅ Foto do GitHub sincronizada:', data.avatar_url);
            updatePhotoInUI(data.avatar_url);
            return data.avatar_url;
        }
        
    } catch (error) {
        console.log('⚠️ Erro ao sincronizar foto do GitHub:', error);
        if (error.message.includes('rate limit')) {
            console.log('⚠️ Rate limit atingido, usando foto padrão');
        }
    }
    return null;
}

// Função para sincronização manual da foto do GitHub
window.syncGitHubPhotoManually = async function() {
    try {
        showNotification('Sincronizando foto do GitHub...', 'info');
        
        // Limpar cache primeiro para forçar nova busca
        localStorage.removeItem(GITHUB_CACHE.userData);
        
        const response = await makeGitHubRequest(`${GITHUB_API_BASE}/users/${GITHUB_USERNAME}`);
        const data = await response.json();
        
        // Salvar no cache
        setCacheItem(GITHUB_CACHE.userData, data);
        
        if (data.avatar_url) {
            console.log('✅ Foto do GitHub sincronizada manualmente:', data.avatar_url);
            updatePhotoInUI(data.avatar_url);
            
            // Habilitar checkbox se não estiver ativo
            const showPhotoCheckbox = document.getElementById('show-photo');
            if (showPhotoCheckbox && !showPhotoCheckbox.checked) {
                showPhotoCheckbox.checked = true;
                curriculumData.settings.showPhoto = true;
                updateSettings();
            }
            
            // Atualizar preview se estiver visível
            const previewContainer = document.getElementById('curriculum-preview');
            if (previewContainer && previewContainer.innerHTML.trim()) {
                refreshPreview();
            }
            
            showNotification('Foto do GitHub sincronizada com sucesso!', 'success');
            return data.avatar_url;
        } else {
            showNotification('Nenhuma foto encontrada no perfil do GitHub', 'warning');
        }
    } catch (error) {
        console.error('Erro na sincronização manual:', error);
        
        // Verificar se é erro de rate limit
        if (error.message.includes('rate limit')) {
            showNotification('Rate limit do GitHub atingido. Tente novamente em alguns minutos.', 'warning');
        } else {
            showNotification('Erro ao sincronizar foto do GitHub', 'error');
        }
        showNotification('Erro ao sincronizar foto do GitHub', 'error');
    }
    
    return null;
};

function updatePhotoInUI(photoUrl) {
    // Atualizar foto no preview
    const curriculumPhoto = document.getElementById('curriculum-photo');
    if (curriculumPhoto) {
        curriculumPhoto.src = photoUrl;
    }
    
    // Atualizar qualquer outra imagem de perfil na página
    const profilePhotos = document.querySelectorAll('.profile-photo, #profile-photo');
    profilePhotos.forEach(img => {
        if (img) {
            img.src = photoUrl;
        }
    });
    
    // Força a regeneração do preview se estiver visível
    const previewElement = document.getElementById('preview');
    if (previewElement && previewElement.style.display !== 'none') {
        generatePreview();
    }
}

// Verificação de autenticação
onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = 'login.html';
        return;
    }
    
    curriculumData.metadata.userId = user.uid;
    initializePage();
});

// Função para fazer logout
window.logout = function() {
    auth.signOut().then(() => {
        window.location.href = 'login.html';
    });
};

// Inicialização da página
async function initializePage() {
    hideLoadingScreen();
    await loadExistingCurriculum();
    setupEventListeners();
    updateProgress();
    
    // Sincronizar foto do GitHub automaticamente se "mostrar foto" estiver ativado
    if (curriculumData.settings.showPhoto) {
        console.log('🖼️ Iniciando sincronização automática da foto...');
        setTimeout(async () => {
            const photoUrl = await syncGitHubPhoto();
            if (photoUrl) {
                console.log('✅ Foto sincronizada na inicialização');
                generatePreview(); // Atualizar preview com a nova foto
            }
        }, 1000);
    }
}

function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        setTimeout(() => {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }, 1000);
    }
}

// Gerenciamento de abas
window.showTab = function(tabName) {
    // Esconder todas as abas
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.add('hidden');
    });
    
    // Remover active de todos os botões
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active', 'border-blue-500', 'text-blue-600');
        btn.classList.add('border-transparent', 'text-gray-500');
    });
    
    // Mostrar aba selecionada
    const selectedTab = document.getElementById(`content-${tabName}`);
    if (selectedTab) {
        selectedTab.classList.remove('hidden');
    }
    
    // Ativar botão da aba
    const activeButton = document.getElementById(`tab-${tabName}`);
    if (activeButton) {
        activeButton.classList.add('active', 'border-blue-500', 'text-blue-600');
        activeButton.classList.remove('border-transparent', 'text-gray-500');
    }
    
    updateProgress();
};

// Event Listeners
function setupEventListeners() {
    // Listeners para inputs de dados pessoais
    const personalDataInputs = [
        'nome-completo', 'titulo-profissional', 'email', 'telefone',
        'linkedin', 'github', 'localizacao', 'resumo-profissional'
    ];
    
    personalDataInputs.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('input', updatePersonalData);
        }
    });
      // Listeners para configurações de formatação
    const settingsInputs = [
        'curriculum-theme', 'primary-color', 'font-family', 'font-size',
        'layout-type', 'spacing', 'show-skills-progress',
        'show-contact-icons', 'show-project-links'
    ];
    
    settingsInputs.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('change', updateSettings);
        }
    });
    
    // Listener especial para checkbox de foto
    const showPhotoCheckbox = document.getElementById('show-photo');    if (showPhotoCheckbox) {
        showPhotoCheckbox.addEventListener('change', async (e) => {
            curriculumData.settings.showPhoto = e.target.checked;
            if (e.target.checked) {
                // Sincronizar foto do GitHub quando habilitada
                const githubPhoto = await syncGitHubPhoto();
                if (githubPhoto) {
                    console.log('✅ Foto do GitHub sincronizada e preview atualizado');
                }
            }
            updateSettings();
            generatePreview();
        });
    }
}

// Atualizar dados pessoais
function updatePersonalData() {    curriculumData.personalData = {
        nomeCompleto: document.getElementById('nome-completo')?.value || '',
        tituloProfissional: document.getElementById('titulo-profissional')?.value || '',
        email: document.getElementById('email')?.value || '',
        telefone: document.getElementById('telefone')?.value || '',
        linkedin: document.getElementById('linkedin')?.value || '',
        github: document.getElementById('github')?.value || '',
        localizacao: document.getElementById('localizacao')?.value || '',
        resumoProfissional: document.getElementById('resumo-profissional')?.value || ''
    };
    
    // Aplicar cores personalizadas se existirem
    if (curriculumData.settings && curriculumData.settings.customColors) {
        setTimeout(() => {
            applyCustomColorsToPreview(curriculumData.settings.customColors);
        }, 100);
    }
    
    updateProgress();
}

// Atualizar configurações
function updateSettings() {
    curriculumData.settings = {
        theme: document.getElementById('curriculum-theme')?.value || 'modern',
        primaryColor: document.getElementById('primary-color')?.value || '#3B82F6',
        fontFamily: document.getElementById('font-family')?.value || 'Inter',
        fontSize: document.getElementById('font-size')?.value || 'medium',
        layout: document.getElementById('layout-type')?.value || 'single-column',
        spacing: document.getElementById('spacing')?.value || 'normal',
        showPhoto: document.getElementById('show-photo')?.checked || false,
        showSkillsProgress: document.getElementById('show-skills-progress')?.checked || true,
        showContactIcons: document.getElementById('show-contact-icons')?.checked || true,
        showProjectLinks: document.getElementById('show-project-links')?.checked || true
    };
    updateProgress();
}

// Preenchimento automático de dados pessoais
window.autoFillPersonalData = async function() {
    try {
        // Dados básicos do site
        const siteData = {
            nomeCompleto: 'Mikael Ferreira',
            tituloProfissional: 'Desenvolvedor Web Full Stack',
            email: 'mikael@exemplo.com', // Substitua pelo email real
            github: 'https://github.com/MikaelFMTS',
            linkedin: 'https://linkedin.com/in/mikael-ferreira', // Substitua pelo LinkedIn real
            localizacao: 'Brasil',
            resumoProfissional: 'Desenvolvedor web apaixonado por criar soluções inovadoras e experiências digitais excepcionais. Especializado em frontend e backend, com foco em tecnologias modernas e boas práticas de desenvolvimento.'
        };
        
        // Preencher os campos
        Object.keys(siteData).forEach(key => {
            const element = document.getElementById(key.replace(/([A-Z])/g, '-$1').toLowerCase());
            if (element) {
                element.value = siteData[key];
            }
        });
        
        updatePersonalData();
        showNotification('Dados pessoais preenchidos automaticamente!', 'success');
    } catch (error) {
        console.error('Erro ao preencher dados automaticamente:', error);
        showNotification('Erro ao preencher dados automaticamente', 'error');
    }
};

// Gerenciamento de experiências
window.addExperience = function() {
    document.getElementById('experience-modal').classList.remove('hidden');
};

window.saveExperience = function() {
    const cargo = document.getElementById('exp-cargo').value;
    const empresa = document.getElementById('exp-empresa').value;
    const periodo = document.getElementById('exp-periodo').value;
    const descricao = document.getElementById('exp-descricao').value;
    
    if (!cargo || !empresa || !periodo) {
        showNotification('Preencha todos os campos obrigatórios', 'error');
        return;
    }
    
    const experience = {
        id: Date.now().toString(),
        cargo,
        empresa,
        periodo,
        descricao
    };
    
    curriculumData.experience.push(experience);
    renderExperienceList();
    closeModal('experience-modal');
    clearExperienceForm();
    updateProgress();
    showNotification('Experiência adicionada com sucesso!', 'success');
};

function renderExperienceList() {
    const container = document.getElementById('experiencias-list');
    if (!container) return;
    
    container.innerHTML = '';
    
    curriculumData.experience.forEach(exp => {
        const expElement = document.createElement('div');
        expElement.className = 'item-card';
        expElement.innerHTML = `
            <div class="flex justify-between items-start">
                <div class="flex-1">
                    <h3 class="font-semibold text-lg">${exp.cargo}</h3>
                    <p class="text-blue-600 font-medium">${exp.empresa}</p>
                    <p class="text-gray-500 text-sm">${exp.periodo}</p>
                    ${exp.descricao ? `<p class="mt-2 text-gray-700">${exp.descricao}</p>` : ''}
                </div>
                <div class="flex space-x-2">
                    <button onclick="editExperience('${exp.id}')" class="text-blue-500 hover:text-blue-700">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="removeExperience('${exp.id}')" class="text-red-500 hover:text-red-700">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        container.appendChild(expElement);
    });
}

window.removeExperience = function(id) {
    curriculumData.experience = curriculumData.experience.filter(exp => exp.id !== id);
    renderExperienceList();
    updateProgress();
    showNotification('Experiência removida', 'success');
};

// Gerenciamento de projetos com cache
const GITHUB_CACHE_KEY = 'github_projects_cache';
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutos

function isCacheValid() {
    const cache = localStorage.getItem(GITHUB_CACHE_KEY);
    if (!cache) return false;
    
    try {
        const { timestamp } = JSON.parse(cache);
        return (Date.now() - timestamp) < CACHE_DURATION;
    } catch {
        return false;
    }
}

function getCachedProjects() {
    try {
        const cache = localStorage.getItem(GITHUB_CACHE_KEY);
        if (!cache) return null;
        
        const { data, timestamp } = JSON.parse(cache);
        if ((Date.now() - timestamp) > CACHE_DURATION) {
            localStorage.removeItem(GITHUB_CACHE_KEY);
            return null;
        }
        
        return data;
    } catch {
        return null;
    }
}

function setCachedProjects(projects) {
    try {
        const cache = {
            data: projects,
            timestamp: Date.now()
        };
        localStorage.setItem(GITHUB_CACHE_KEY, JSON.stringify(cache));
    } catch (error) {
        console.warn('Erro ao salvar cache:', error);
    }
}

window.loadGitHubProjects = async function() {
    try {
        showNotification('Carregando projetos do GitHub...', 'info');
        
        // Verificar cache primeiro
        if (isCacheValid()) {
            const cachedProjects = getCachedProjects();
            if (cachedProjects) {
                console.log('Usando projetos do cache');
                cachedProjects.forEach(project => {
                    const exists = curriculumData.projects.some(p => p.id === project.id);
                    if (!exists) {
                        curriculumData.projects.push(project);
                    }
                });
                renderProjectsList();
                updateProgress();
                showNotification('Projetos carregados do cache', 'success');
                return;
            }
        }
          // Implementar fallback local caso a API falhe
        let repos;
        try {
            console.log('Fazendo chamada para GitHub API...');
            const response = await makeGitHubRequest(`https://api.github.com/users/mikaelfmts/repos?sort=updated&per_page=20`);
            
            repos = await response.json();
            console.log(`Carregados ${repos.length} repositórios da API`);
        } catch (apiError) {
            console.warn('GitHub API indisponível, usando projetos padrão:', apiError);
            
            // Projetos padrão como fallback
            repos = [
                {
                    id: 1,
                    name: 'Portfolio-Website',
                    description: 'Portfolio pessoal desenvolvido com HTML, CSS e JavaScript',
                    language: 'JavaScript',
                    html_url: 'https://github.com/mikaelfmts/portfolio',
                    homepage: 'https://mikaelfmts.github.io',
                    fork: false
                },
                {
                    id: 2,
                    name: 'Projeto-Firebase',
                    description: 'Sistema de gerenciamento com Firebase',
                    language: 'JavaScript',
                    html_url: 'https://github.com/mikaelfmts/firebase-project',
                    homepage: '',
                    fork: false
                },
                {
                    id: 3,
                    name: 'Sistema-Web',
                    description: 'Aplicação web full-stack',
                    language: 'TypeScript',
                    html_url: 'https://github.com/mikaelfmts/sistema-web',
                    homepage: '',
                    fork: false
                }
            ];
        }

        if (!Array.isArray(repos)) {
            throw new Error('Erro ao carregar repositórios');
        }
        
        const projectsToCache = [];
        repos.forEach(repo => {
            if (!repo.fork && repo.name.toLowerCase() !== 'mikaelfmts') {
                const project = {
                    id: `github-${repo.id}`,
                    nome: repo.name,
                    descricao: repo.description || 'Projeto do GitHub',
                    tecnologias: repo.language ? [repo.language] : [],
                    link: repo.html_url,
                    github: repo.html_url,
                    demo: repo.homepage || '',
                    tipo: 'github'
                };
                
                projectsToCache.push(project);
                
                // Verificar se o projeto já existe
                const exists = curriculumData.projects.some(p => p.id === project.id);
                if (!exists) {
                    curriculumData.projects.push(project);
                }
            }
        });
        
        // Salvar no cache se carregou da API
        if (projectsToCache.length > 0 && repos.length > 3) {
            setCachedProjects(projectsToCache);
        }
        
        renderProjectsList();
        updateProgress();
        showNotification('Projetos carregados com sucesso!', 'success');
    } catch (error) {
        console.error('Erro ao carregar projetos do GitHub:', error);
        showNotification('Usando projetos padrão devido a erro na API', 'warning');
    }
};

window.loadSiteProjects = async function() {
    try {
        showNotification('Carregando projetos do site...', 'info');
        
        // Projetos baseados na estrutura do site
        const siteProjects = [
            {
                id: 'portfolio-site',                nome: 'Portfolio Pessoal',
                descricao: 'Site portfolio profissional com tema inspirado em League of Legends, sistema de chat em tempo real e painel de controle pessoal.',
                tecnologias: ['HTML5', 'CSS3', 'JavaScript', 'Firebase', 'PWA'],
                tipo: 'site'
            },
            {
                id: 'interactive-projects',
                nome: 'Projetos Interativos',
                descricao: 'Coleção de projetos interativos e demonstrações de tecnologias web modernas.',
                tecnologias: ['JavaScript', 'CSS3', 'HTML5'],
                tipo: 'site'
            },
            {
                id: 'games-collection',
                nome: 'Coleção de Jogos',
                descricao: 'Jogos desenvolvidos em JavaScript e outras tecnologias web.',
                tecnologias: ['JavaScript', 'Phaser.js', 'Canvas'],
                tipo: 'site'
            }
        ];
        
        siteProjects.forEach(project => {
            const exists = curriculumData.projects.some(p => p.id === project.id);
            if (!exists) {
                curriculumData.projects.push(project);
            }
        });
        
        renderProjectsList();
        updateProgress();
        showNotification('Projetos do site carregados com sucesso!', 'success');
    } catch (error) {
        console.error('Erro ao carregar projetos do site:', error);
        showNotification('Erro ao carregar projetos do site', 'error');
    }
};

window.addProject = function() {
    const nome = prompt('Nome do projeto:');
    if (!nome) return;
    
    const descricao = prompt('Descrição do projeto:');
    const tecnologias = prompt('Tecnologias usadas (separadas por vírgula):');
    const link = prompt('Link do projeto (opcional):');
    
    const project = {
        id: Date.now().toString(),
        nome,
        descricao: descricao || '',
        tecnologias: tecnologias ? tecnologias.split(',').map(t => t.trim()) : [],
        link: link || '',
        tipo: 'manual'
    };
    
    curriculumData.projects.push(project);
    renderProjectsList();
    updateProgress();
    showNotification('Projeto adicionado com sucesso!', 'success');
};

function renderProjectsList() {
    const container = document.getElementById('projetos-list');
    if (!container) return;
    
    container.innerHTML = '';
    
    curriculumData.projects.forEach(project => {
        const projectElement = document.createElement('div');
        projectElement.className = 'item-card';
        projectElement.innerHTML = `
            <div class="flex justify-between items-start">
                <div class="flex-1">
                    <h3 class="font-semibold text-lg">${project.nome}</h3>
                    <p class="text-gray-700 mt-1">${project.descricao}</p>
                    <div class="flex flex-wrap gap-2 mt-2">
                        ${project.tecnologias.map(tech => 
                            `<span class="skill-item text-xs">${tech}</span>`
                        ).join('')}
                    </div>
                    ${project.link ? `<a href="${project.link}" target="_blank" class="text-blue-500 hover:text-blue-700 text-sm mt-2 inline-block">
                        <i class="fas fa-external-link-alt mr-1"></i>Ver projeto
                    </a>` : ''}
                </div>
                <div class="flex space-x-2">
                    <button onclick="removeProject('${project.id}')" class="text-red-500 hover:text-red-700">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        container.appendChild(projectElement);
    });
}

window.removeProject = function(id) {
    curriculumData.projects = curriculumData.projects.filter(project => project.id !== id);
    renderProjectsList();
    updateProgress();
    showNotification('Projeto removido', 'success');
};

// Gerenciamento de habilidades
window.loadSiteSkills = function() {
    const siteSkills = [
        { nome: 'HTML5', nivel: 90 },
        { nome: 'CSS3', nivel: 85 },
        { nome: 'JavaScript', nivel: 80 },
        { nome: 'React', nivel: 75 },
        { nome: 'Node.js', nivel: 70 },
        { nome: 'Firebase', nivel: 75 },
        { nome: 'Git', nivel: 80 },
        { nome: 'Responsive Design', nivel: 85 },
        { nome: 'PWA', nivel: 70 },
        { nome: 'API REST', nivel: 75 }
    ];
    
    siteSkills.forEach(skill => {
        const exists = curriculumData.skills.some(s => s.nome === skill.nome);
        if (!exists) {
            curriculumData.skills.push({
                id: Date.now().toString() + Math.random(),
                ...skill
            });
        }
    });
    
    renderSkillsList();
    updateProgress();
    showNotification('Habilidades do site carregadas com sucesso!', 'success');
};

window.addSkill = function() {
    const nome = prompt('Nome da habilidade:');
    if (!nome) return;
    
    const nivel = prompt('Nível (0-100):');
    if (!nivel || isNaN(nivel)) {
        showNotification('Nível deve ser um número entre 0 e 100', 'error');
        return;
    }
    
    const skill = {
        id: Date.now().toString(),
        nome,
        nivel: parseInt(nivel)
    };
    
    curriculumData.skills.push(skill);
    renderSkillsList();
    updateProgress();
    showNotification('Habilidade adicionada com sucesso!', 'success');
};

function renderSkillsList() {
    const container = document.getElementById('habilidades-list');
    if (!container) return;
    
    container.innerHTML = '';
    
    curriculumData.skills.forEach(skill => {
        const skillElement = document.createElement('div');
        skillElement.className = 'item-card';
        skillElement.innerHTML = `
            <div class="flex justify-between items-center">
                <div class="flex items-center space-x-4">
                    <div class="skill-progress">
                        <svg>
                            <circle class="bg-circle" cx="30" cy="30" r="25"></circle>
                            <circle class="progress-circle" cx="30" cy="30" r="25" 
                                    style="stroke-dashoffset: ${157 - (157 * skill.nivel / 100)}"></circle>
                        </svg>
                        <div class="absolute inset-0 flex items-center justify-center text-sm font-semibold">
                            ${skill.nivel}%
                        </div>
                    </div>
                    <div>
                        <h3 class="font-semibold">${skill.nome}</h3>
                        <p class="text-gray-500 text-sm">Nível: ${skill.nivel}%</p>
                    </div>
                </div>
                <button onclick="removeSkill('${skill.id}')" class="text-red-500 hover:text-red-700">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        container.appendChild(skillElement);
    });
}

window.removeSkill = function(id) {
    curriculumData.skills = curriculumData.skills.filter(skill => skill.id !== id);
    renderSkillsList();
    updateProgress();
    showNotification('Habilidade removida', 'success');
};

// Gerenciamento de certificados
window.loadSiteCertificates = async function() {
    try {
        showNotification('Carregando certificados...', 'info');
        
        const certificatesRef = collection(db, 'certificados');
        const certificatesSnapshot = await getDocs(certificatesRef);
        
        certificatesSnapshot.forEach(doc => {
            const cert = doc.data();
            const exists = curriculumData.certificates.some(c => c.id === doc.id);
            if (!exists) {
                curriculumData.certificates.push({
                    id: doc.id,
                    titulo: cert.titulo,
                    instituicao: cert.instituicao,
                    data: cert.dataConclusao || cert.dataInicio,
                    status: cert.status,
                    url: cert.certificadoUrl || ''
                });
            }
        });
        
        renderCertificatesList();
        updateProgress();
        showNotification('Certificados carregados com sucesso!', 'success');
    } catch (error) {
        console.error('Erro ao carregar certificados:', error);
        showNotification('Erro ao carregar certificados', 'error');
    }
};

window.addCertificate = function() {
    const titulo = prompt('Título do certificado:');
    if (!titulo) return;
    
    const instituicao = prompt('Instituição:');
    const data = prompt('Data de conclusão (opcional):');
    const url = prompt('URL do certificado (opcional):');
    
    const certificate = {
        id: Date.now().toString(),
        titulo,
        instituicao: instituicao || '',
        data: data || '',
        status: 'concluido',
        url: url || ''
    };
    
    curriculumData.certificates.push(certificate);
    renderCertificatesList();
    updateProgress();
    showNotification('Certificado adicionado com sucesso!', 'success');
};

function renderCertificatesList() {
    const container = document.getElementById('certificados-list');
    if (!container) return;
    
    container.innerHTML = '';
    
    curriculumData.certificates.forEach(cert => {
        const certElement = document.createElement('div');
        certElement.className = 'item-card';
        certElement.innerHTML = `
            <div class="flex justify-between items-start">
                <div class="flex-1">
                    <h3 class="font-semibold text-lg">${cert.titulo}</h3>
                    <p class="text-blue-600 font-medium">${cert.instituicao}</p>
                    ${cert.data ? `<p class="text-gray-500 text-sm">${cert.data}</p>` : ''}
                    <span class="inline-block mt-2 px-2 py-1 text-xs rounded-full ${
                        cert.status === 'concluido' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }">${cert.status === 'concluido' ? 'Concluído' : 'Em Progresso'}</span>
                    ${cert.url ? `<a href="${cert.url}" target="_blank" class="text-blue-500 hover:text-blue-700 text-sm mt-2 inline-block ml-2">
                        <i class="fas fa-external-link-alt mr-1"></i>Ver certificado
                    </a>` : ''}
                </div>
                <button onclick="removeCertificate('${cert.id}')" class="text-red-500 hover:text-red-700">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        container.appendChild(certElement);
    });
}


// Preview do currículo
window.generatePreview = function() {
    const previewContainer = document.getElementById('curriculum-preview');
    if (!previewContainer) {
        console.warn('Container de preview não encontrado');
        return;
    }
    
    try {        const html = generateCurriculumHTML();
        previewContainer.innerHTML = html;
        console.log('✅ Preview gerado com sucesso');
        
        // Aplicar configurações de formatação ao preview
        applyPreviewStyles(previewContainer);
        
        // Aplicar cores personalizadas automaticamente
        if (curriculumData.settings && curriculumData.settings.customColors) {
            applyCustomColorsToPreview(curriculumData.settings.customColors);
        }
        
        showNotification('Preview gerado com sucesso!', 'success');
    } catch (error) {
        console.error('Erro ao gerar preview:', error);
        showNotification('Erro ao gerar preview', 'error');
    }
};

window.refreshPreview = function() {
    const previewContainer = document.getElementById('curriculum-preview');
    if (!previewContainer) return;
    
    const html = generateCurriculumHTML();
    previewContainer.innerHTML = html;
    
    // Aplicar cores personalizadas automaticamente
    if (curriculumData.settings && curriculumData.settings.customColors) {
        applyCustomColorsToPreview(curriculumData.settings.customColors);
    }
    
    showNotification('Preview atualizado!', 'success');
};

function generateCurriculumHTML() {
    const theme = curriculumData.settings.theme;
    const layout = curriculumData.settings.layout;
    
    return `
        <div class="curriculum-${theme} layout-${layout}" style="
            font-family: ${curriculumData.settings.fontFamily}, sans-serif;
            color: ${curriculumData.settings.primaryColor};
            padding: 2rem;
            line-height: 1.6;
        ">
            ${generateHeaderSection()}
            ${generateExperienceSection()}
            ${generateProjectsSection()}
            ${generateSkillsSection()}
            ${generateCertificatesSection()}
            
            <!-- Footer do Portfolio -->
            <footer style="
                margin-top: 3rem;
                padding-top: 2rem;
                border-top: 1px solid #e2e8f0;
                text-align: center;
                color: #718096;
                font-size: 0.9rem;
                font-style: italic;
            ">
                <p style="margin: 0;">Este documento foi gerado através do meu portfólio pessoal: <strong>mikaelfmts.github.io/eu</strong></p>
            </footer>
        </div>
    `;
}

function generateHeaderSection() {
    const personal = curriculumData.personalData;
    const showPhoto = curriculumData.settings.showPhoto;
    
    let photoUrl = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iNjAiIGN5PSI2MCIgcj0iNjAiIGZpbGw9IiNmMGYwZjAiLz48Y2lyY2xlIGN4PSI2MCIgY3k9IjQ1IiByPSIyMCIgZmlsbD0iIzk5OTk5OSIvPjxwYXRoIGQ9Ik0yMCA5NWMwLTE2IDIwLTMwIDQwLTMwczQwIDE0IDQwIDMwIiBmaWxsPSIjOTk5OTk5Ii8+PC9zdmc+';
    
    // Verificar cache do GitHub primeiro e converter para base64 para PDF
    const cachedUser = getCacheItem(GITHUB_CACHE.userData);
    if (cachedUser && cachedUser.avatar_url) {
        // Usar URL base64 se disponível no cache, senão usar URL original
        if (cachedUser.avatar_base64) {
            photoUrl = cachedUser.avatar_base64;
        } else {
            photoUrl = cachedUser.avatar_url;
        }
    }
    
    return `
        <header style="margin-bottom: 2rem; text-align: center; border-bottom: 2px solid ${curriculumData.settings.primaryColor}; padding-bottom: 1rem;">
            ${showPhoto ? `
                <div style="margin-bottom: 1.5rem;">
                    <img id="curriculum-photo" 
                         src="${photoUrl}" 
                         alt="Foto de perfil" 
                         style="width: 120px; height: 120px; border-radius: 50%; object-fit: cover; border: 4px solid ${curriculumData.settings.primaryColor}; margin: 0 auto; display: block; box-shadow: 0 4px 10px rgba(0,0,0,0.2);"
                         onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iNjAiIGN5PSI2MCIgcj0iNjAiIGZpbGw9IiNmMGYwZjAiLz48Y2lyY2xlIGN4PSI2MCIgY3k9IjQ1IiByPSIyMCIgZmlsbD0iIzk5OTk5OSIvPjxwYXRoIGQ9Ik0yMCA5NWMwLTE2IDIwLTMwIDQwLTMwczQwIDE0IDQwIDMwIiBmaWxsPSIjOTk5OTk5Ii8+PC9zdmc+';">
                </div>
            ` : ''}            <h1 class="curriculum-name" style="font-size: 2.5rem; margin: 0; color: ${curriculumData.settings.primaryColor};">
                ${personal.nomeCompleto || 'Nome Completo'}
            </h1>
            <h2 class="curriculum-title" style="font-size: 1.5rem; margin: 0.5rem 0; color: #666;">
                ${personal.tituloProfissional || 'Título Profissional'}
            </h2>            <div style="display: flex; justify-content: center; gap: 1rem; flex-wrap: wrap; margin-top: 1rem;">
                ${personal.email ? `<span class="contact-link"><i class="fas fa-envelope"></i> ${personal.email}</span>` : ''}
                ${personal.telefone ? `<span class="contact-link"><i class="fas fa-phone"></i> ${personal.telefone}</span>` : ''}
                ${personal.localizacao ? `<span class="contact-link"><i class="fas fa-map-marker-alt"></i> ${personal.localizacao}</span>` : ''}
            </div>
            ${personal.resumoProfissional ? `<p class="main-text" style="margin-top: 1rem; font-style: italic; max-width: 600px; margin-left: auto; margin-right: auto;">${personal.resumoProfissional}</p>` : ''}
        </header>
    `;
}

function generateExperienceSection() {
    if (curriculumData.experience.length === 0) return '';
    
    return `
        <section style="margin-bottom: 2rem;">            <h3 class="section-title" style="color: ${curriculumData.settings.primaryColor}; border-bottom: 1px solid #ccc; padding-bottom: 0.5rem;">
                Experiência Profissional
            </h3>
            ${curriculumData.experience.map(exp => `
                <div style="margin-bottom: 1.5rem;">                    <h4 class="highlight" style="margin: 0; font-size: 1.2rem;">${exp.cargo}</h4>
                    <p class="highlight" style="margin: 0.25rem 0; color: ${curriculumData.settings.primaryColor}; font-weight: bold;">${exp.empresa}</p>
                    <p class="main-text" style="margin: 0.25rem 0; color: #666; font-size: 0.9rem;">${exp.periodo}</p>
                    ${exp.descricao ? `<p class="main-text" style="margin: 0.5rem 0;">${exp.descricao}</p>` : ''}
                </div>
            `).join('')}
        </section>
    `;
}

function generateProjectsSection() {
    if (curriculumData.projects.length === 0) return '';
    
    return `
        <section style="margin-bottom: 2rem;">            <h3 class="section-title" style="color: ${curriculumData.settings.primaryColor}; border-bottom: 1px solid #ccc; padding-bottom: 0.5rem;">
                Projetos
            </h3>
            ${curriculumData.projects.map(project => `
                <div style="margin-bottom: 1.5rem;">
                    <h4 class="highlight" style="margin: 0; font-size: 1.2rem;">${project.nome}</h4>
                    <p class="main-text" style="margin: 0.5rem 0;">${project.descricao}</p>
                    ${project.tecnologias.length > 0 ? `
                        <div class="main-text" style="margin: 0.5rem 0;">
                            <strong>Tecnologias:</strong> ${project.tecnologias.join(', ')}
                        </div>
                    ` : ''}
                    ${project.link && curriculumData.settings.showProjectLinks ? `
                        <a class="contact-link" href="${project.link}" style="color: ${curriculumData.settings.primaryColor}; text-decoration: none;">
                            Ver projeto →
                        </a>
                    ` : ''}
                </div>
            `).join('')}
        </section>
    `;
}

function generateSkillsSection() {
    if (curriculumData.skills.length === 0) return '';
    
    return `
        <section style="margin-bottom: 2rem;">            <h3 class="section-title" style="color: ${curriculumData.settings.primaryColor}; border-bottom: 1px solid #ccc; padding-bottom: 0.5rem;">
                Habilidades Técnicas
            </h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                ${curriculumData.skills.map(skill => `
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0;">
                        <span class="skill-tag">${skill.nome}</span>
                        ${curriculumData.settings.showSkillsProgress ? `
                            <div style="flex: 1; margin-left: 1rem; background: #eee; height: 8px; border-radius: 4px; overflow: hidden;">
                                <div class="skill-progress" style="width: ${skill.nivel}%; height: 100%; background: ${curriculumData.settings.primaryColor};"></div>
                            </div>
                            <span class="main-text" style="margin-left: 0.5rem; font-size: 0.8rem;">${skill.nivel}%</span>
                        ` : ''}
                    </div>
                `).join('')}
            </div>
        </section>
    `;
}

function generateCertificatesSection() {
    if (curriculumData.certificates.length === 0) return '';
    
    return `
        <section style="margin-bottom: 2rem;">            <h3 class="section-title" style="color: ${curriculumData.settings.primaryColor}; border-bottom: 1px solid #ccc; padding-bottom: 0.5rem;">
                Certificados e Educação
            </h3>
            ${curriculumData.certificates.map(cert => `
                <div style="margin-bottom: 1.5rem;">
                    <h4 class="highlight" style="margin: 0; font-size: 1.1rem;">${cert.titulo}</h4>
                    <p class="highlight" style="margin: 0.25rem 0; color: ${curriculumData.settings.primaryColor}; font-weight: bold;">${cert.instituicao}</p>
                    ${cert.data ? `<p class="main-text" style="margin: 0.25rem 0; color: #666; font-size: 0.9rem;">${cert.data}</p>` : ''}
                </div>
            `).join('')}
        </section>
    `;
}

// Salvar currículo
window.saveCurriculum = async function() {
    try {
        if (!currentUser) {
            showNotification('Usuário não autenticado', 'error');
            return;
        }

        // Validar dados antes de salvar
        const dataToSave = gatherAllData();
        const validationErrors = validateFormData(dataToSave);
        
        if (validationErrors.length > 0) {
            showNotification('Corrija os erros antes de salvar: ' + validationErrors.join(', '), 'warning');
            return;
        }

        // Limpar dados undefined antes de salvar
        const cleanData = JSON.parse(JSON.stringify(dataToSave, (key, value) => {
            return value === undefined ? null : value;
        }));

        cleanData.metadata = {
            ...cleanData.metadata,
            userId: currentUser.uid,
            lastUpdated: new Date(),
            createdAt: cleanData.metadata?.createdAt || new Date()
        };
        
        const curriculumRef = doc(db, 'curriculum', currentUser.uid);
        await setDoc(curriculumRef, cleanData);
        
        showNotification('Currículo salvo com sucesso!', 'success');
    } catch (error) {
        console.error('Erro ao salvar currículo:', error);
        showNotification('Erro ao salvar currículo', 'error');
    }
};

window.saveDraft = function() {
    localStorage.setItem('curriculum-draft', JSON.stringify(curriculumData));
    showNotification('Rascunho salvo localmente!', 'success');
};

// Carregar currículo existente
async function loadExistingCurriculum() {
    try {
        const curriculumRef = doc(db, 'curriculum', curriculumData.metadata.userId);
        const curriculumDoc = await getDoc(curriculumRef);
        
        if (curriculumDoc.exists()) {
            const data = curriculumDoc.data();
            curriculumData = { ...curriculumData, ...data };
            populateForm();
        } else {
            // Tentar carregar do localStorage
            const draftData = localStorage.getItem('curriculum-draft');
            if (draftData) {
                const parsed = JSON.parse(draftData);
                curriculumData = { ...curriculumData, ...parsed };
                populateForm();
                showNotification('Rascunho carregado do armazenamento local', 'info');
            }
        }
    } catch (error) {
        console.error('Erro ao carregar currículo:', error);
    }
}

function populateForm() {
    // Preencher dados pessoais
    Object.keys(curriculumData.personalData).forEach(key => {
        const element = document.getElementById(key.replace(/([A-Z])/g, '-$1').toLowerCase());
        if (element) {
            element.value = curriculumData.personalData[key] || '';
        }
    });
    
    // Preencher configurações
    Object.keys(curriculumData.settings).forEach(key => {
        const elementId = key.replace(/([A-Z])/g, '-$1').toLowerCase();
        const element = document.getElementById(elementId) || document.getElementById(`curriculum-${elementId}`) || document.getElementById(`show-${elementId.replace('show-', '')}`);
        if (element) {
            if (element.type === 'checkbox') {
                element.checked = curriculumData.settings[key];
            } else {
                element.value = curriculumData.settings[key];
            }
        }
    });
    
    // Renderizar listas
    renderExperienceList();
    renderProjectsList();
    renderSkillsList();
    renderCertificatesList();
}

// Função para coletar todos os dados do formulário
function gatherAllData() {
    return {
        personalData: {
            nomeCompleto: document.getElementById('nome-completo')?.value || '',
            tituloProfissional: document.getElementById('titulo-profissional')?.value || '',
            email: document.getElementById('email')?.value || '',
            telefone: document.getElementById('telefone')?.value || '',
            linkedin: document.getElementById('linkedin')?.value || '',
            github: document.getElementById('github')?.value || '',
            localizacao: document.getElementById('localizacao')?.value || '',
            resumoProfissional: document.getElementById('resumo-profissional')?.value || ''
        },
        experience: [...curriculumData.experience],
        projects: [...curriculumData.projects],
        skills: [...curriculumData.skills],
        certificates: [...curriculumData.certificates],
        settings: {
            theme: document.getElementById('curriculum-theme')?.value || 'modern',
            primaryColor: document.getElementById('primary-color')?.value || '#3B82F6',
            fontFamily: document.getElementById('font-family')?.value || 'Inter',
            fontSize: document.getElementById('font-size')?.value || 'medium',
            layout: document.getElementById('layout-type')?.value || 'single-column',
            spacing: document.getElementById('spacing')?.value || 'normal',
            showPhoto: document.getElementById('show-photo')?.checked || false,
            showSkillsProgress: document.getElementById('show-skills-progress')?.checked || true,
            showContactIcons: document.getElementById('show-contact-icons')?.checked || true,
            showProjectLinks: document.getElementById('show-project-links')?.checked || true
        },
        metadata: {
            ...curriculumData.metadata,
            lastUpdated: new Date()
        }
    };
}

function loadSiteData() {
    // Carregar dados padrão do site
    autoFillPersonalData();
    loadSiteSkills();
    loadSiteProjects();
}

// Atualizar progresso
function updateProgress() {
    const totalSections = 6;
    let completedSections = 0;
    
    // Verificar dados pessoais
    if (curriculumData.personalData.nomeCompleto && curriculumData.personalData.email) {
        completedSections++;
    }
    
    // Verificar experiência
    if (curriculumData.experience.length > 0) {
        completedSections++;
    }
    
    // Verificar projetos
    if (curriculumData.projects.length > 0) {
        completedSections++;
    }
    
    // Verificar habilidades
    if (curriculumData.skills.length > 0) {
        completedSections++;
    }
    
    // Verificar certificados
    if (curriculumData.certificates.length > 0) {
        completedSections++;
    }
    
    // Formatação sempre conta como completa
    completedSections++;
    
    const percentage = Math.round((completedSections / totalSections) * 100);
    
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    
    if (progressBar) {
        progressBar.style.width = `${percentage}%`;
    }
    
    if (progressText) {
        progressText.textContent = `${percentage}% Completo`;
    }
}

// Funções auxiliares
window.closeModal = function(modalId) {
    document.getElementById(modalId).classList.add('hidden');
};

function clearExperienceForm() {
    ['exp-cargo', 'exp-empresa', 'exp-periodo', 'exp-descricao'].forEach(id => {
        const element = document.getElementById(id);
        if (element) element.value = '';
    });
}

function showNotification(message, type = 'info') {
    // Criar elemento de notificação
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg transition-all duration-300 transform translate-x-full`;
    
    // Definir cor baseada no tipo
    const colors = {
        success: 'bg-green-500 text-white',
        error: 'bg-red-500 text-white',
        warning: 'bg-yellow-500 text-black',
        info: 'bg-blue-500 text-white'
    };
    
    notification.className += ` ${colors[type] || colors.info}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Mostrar notificação
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
    }, 100);
    
    // Remover notificação após 3 segundos
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Download PDF
window.downloadPDF = async function() {
    try {
        const previewContainer = document.getElementById('curriculum-preview');
        if (!previewContainer || !previewContainer.innerHTML.trim()) {
            showNotification('Por favor, gere o preview do currículo primeiro', 'warning');
            return;
        }

        showNotification('Gerando PDF... aguarde', 'info');
        
        // Converter imagem do GitHub para base64 antes de gerar PDF
        const photoElement = previewContainer.querySelector('#curriculum-photo');
        if (photoElement && photoElement.src && !photoElement.src.startsWith('data:')) {
            try {
                const base64Image = await convertImageToBase64(photoElement.src);
                if (base64Image) {
                    photoElement.src = base64Image;
                    
                    // Atualizar cache com versão base64
                    const cachedUser = getCacheItem(GITHUB_CACHE.userData);
                    if (cachedUser) {
                        cachedUser.avatar_base64 = base64Image;
                        setCacheItem(GITHUB_CACHE.userData, cachedUser);
                    }
                }
            } catch (error) {
                console.log('Aviso: Não foi possível converter foto para base64:', error);
            }
        }
        
        // Configurações para o PDF
        const opt = {
            margin: 1,
            filename: 'curriculo-mikael-ferreira.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { 
                scale: 2,
                useCORS: true,
                logging: false,
                letterRendering: true
            },
            jsPDF: { 
                unit: 'cm', 
                format: 'a4', 
                orientation: 'portrait' 
            }
        };

        // Gerar PDF
        html2pdf().set(opt).from(previewContainer).save().then(() => {
            showNotification('PDF baixado com sucesso!', 'success');
        }).catch((error) => {
            console.error('Erro ao gerar PDF:', error);
            showNotification('Erro ao gerar PDF. Tente novamente.', 'error');
        });
        
    } catch (error) {
        console.error('Erro no download PDF:', error);
        showNotification('Erro ao gerar PDF. Verifique se o preview foi gerado.', 'error');
    }
};

// Sistema de Backup Automático
function autoBackup() {
    const curriculumData = gatherAllData();
    if (curriculumData && Object.keys(curriculumData).length > 0) {
        const timestamp = new Date().toISOString();
        const backupData = {
            ...curriculumData,
            backupTimestamp: timestamp,
            version: '1.0'
        };
        
        // Salvar no localStorage como backup
        localStorage.setItem(`curriculum_backup_${timestamp.split('T')[0]}`, JSON.stringify(backupData));
        
        // Manter apenas os últimos 5 backups
        const backupKeys = Object.keys(localStorage).filter(key => key.startsWith('curriculum_backup_'));
        if (backupKeys.length > 5) {
            backupKeys.sort().slice(0, -5).forEach(key => localStorage.removeItem(key));
        }
        
        console.log('Backup automático criado:', timestamp);
    }
}

// Função para restaurar backup
window.restoreBackup = function() {
    const backupKeys = Object.keys(localStorage).filter(key => key.startsWith('curriculum_backup_'));
    if (backupKeys.length === 0) {
        showNotification('Nenhum backup encontrado', 'warning');
        return;
    }
    
    const latestBackup = backupKeys.sort().pop();
    const backupData = JSON.parse(localStorage.getItem(latestBackup));
    
    if (confirm('Deseja restaurar o último backup? Isso substituirá os dados atuais.')) {
        populateFormWithData(backupData);
        showNotification('Backup restaurado com sucesso!', 'success');
    }
};

// Validação melhorada
function validateFormData(data) {
    const errors = [];
    
    // Validar dados pessoais
    if (!data.personalData?.nomeCompleto?.trim()) {
        errors.push('Nome completo é obrigatório');
    }
    
    if (!data.personalData?.email?.trim() || !isValidEmail(data.personalData.email)) {
        errors.push('Email válido é obrigatório');
    }
    
    if (!data.personalData?.tituloProfissional?.trim()) {
        errors.push('Título profissional é obrigatório');
    }
    
    // Validar pelo menos uma seção com conteúdo
    const hasContent = (
        (data.experience && data.experience.length > 0) ||
        (data.projects && data.projects.length > 0) ||
        (data.skills && data.skills.length > 0) ||
        (data.certificates && data.certificates.length > 0)
    );
    
    if (!hasContent) {
        errors.push('É necessário preencher pelo menos uma seção (Experiência, Projetos, Habilidades ou Certificados)');
    }
    
    return errors;
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Auto-save melhorado
let autoSaveTimeout;
function scheduleAutoSave() {
    clearTimeout(autoSaveTimeout);
    autoSaveTimeout = setTimeout(() => {
        const data = gatherAllData();
        const errors = validateFormData(data);
        
        if (errors.length === 0) {
            saveCurriculum();
            autoBackup();
        }
    }, 30000); // Auto-save a cada 30 segundos
}

// Adicionar listeners para auto-save
document.addEventListener('DOMContentLoaded', async function() {
    // Verificar autenticação primeiro
    const isAuthenticated = await checkAuthentication();
    if (!isAuthenticated) {
        return; // Sair se não autenticado
    }
    
    // Esconder loading screen após autenticação
    setTimeout(() => {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
        }
    }, 1000);
    
    // Carregar dados existentes
    loadCurriculum();
    
    // Listeners para inputs de dados pessoais
    const personalDataInputs = [
        'nome-completo', 'titulo-profissional', 'email', 'telefone',
        'linkedin', 'github', 'localizacao', 'resumo-profissional'
    ];
    
    personalDataInputs.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('input', updatePersonalData);
        }
    });
    
    // Listeners para configurações de formatação
    const settingsInputs = [
        'curriculum-theme', 'primary-color', 'font-family', 'font-size',
        'layout-type', 'spacing', 'show-photo', 'show-skills-progress',
        'show-contact-icons', 'show-project-links'
    ];
    
    settingsInputs.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('change', updateSettings);
        }
    });
    
    // Adicionar listeners para inputs
    const allInputs = document.querySelectorAll('input, textarea, select');
    allInputs.forEach(input => {
        input.addEventListener('input', scheduleAutoSave);
        input.addEventListener('change', scheduleAutoSave);
    });
});

// Carregar currículo existente
window.loadCurriculum = async function() {
    try {
        if (!currentUser) {
            console.log('Usuário não autenticado, não é possível carregar currículo');
            return;
        }

        showNotification('Carregando dados do currículo...', 'info');
        
        const docRef = doc(db, 'curriculum', currentUser.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            const data = docSnap.data();
            
            // Mesclar dados carregados com estrutura padrão
            curriculumData = {
                ...curriculumData,
                ...data,
                metadata: {
                    ...curriculumData.metadata,
                    ...data.metadata
                }
            };
            
            // Preencher formulário com dados carregados
            populateFormWithData(curriculumData);
            
            showNotification('Dados carregados com sucesso!', 'success');
            updateProgress();
        } else {
            console.log('Nenhum currículo encontrado, usando dados padrão');
            // Carregar dados do site como padrão
            loadSiteData();
        }
    } catch (error) {
        console.error('Erro ao carregar currículo:', error);
        showNotification('Erro ao carregar dados. Usando dados padrão.', 'warning');
        loadSiteData();
    }
};

function populateFormWithData(data) {
    // Preencher dados pessoais
    if (data.personalData) {
        Object.keys(data.personalData).forEach(key => {
            const element = document.getElementById(key.replace(/([A-Z])/g, '-$1').toLowerCase());
            if (element) {
                element.value = data.personalData[key] || '';
            }
        });
    }
    
    // Recriar listas dinâmicas
    if (data.experience) recreateExperienceList(data.experience);
    if (data.projects) recreateProjectsList(data.projects);
    if (data.skills) recreateSkillsList(data.skills);
    if (data.certificates) recreateCertificatesList(data.certificates);
    
    // Aplicar configurações
    if (data.settings) {
        Object.keys(data.settings).forEach(key => {
            const element = document.getElementById(key.replace(/([A-Z])/g, '-$1').toLowerCase());
            if (element) {
                if (element.type === 'checkbox') {
                    element.checked = data.settings[key];
                } else {
                    element.value = data.settings[key] || '';
                }
            }
        });
    }
}

function recreateExperienceList(experiences) {
    curriculumData.experience = experiences;
    const container = document.getElementById('experience-list');
    if (container) {
        container.innerHTML = '';
        experiences.forEach((exp, index) => {
            addExperienceToList(exp, index);
        });
    }
}

function recreateProjectsList(projects) {
    curriculumData.projects = projects;
    const container = document.getElementById('projects-list');
    if (container) {
        container.innerHTML = '';
        projects.forEach((proj, index) => {
            addProjectToList(proj, index);
        });
    }
}

function recreateSkillsList(skills) {
    curriculumData.skills = skills;
    const container = document.getElementById('skills-list');
    if (container) {
        container.innerHTML = '';
        skills.forEach((skill, index) => {
            addSkillToList(skill, index);
        });
    }
}

function recreateCertificatesList(certificates) {
    curriculumData.certificates = certificates;
    const container = document.getElementById('certificates-list');
    if (container) {
        container.innerHTML = '';
        certificates.forEach((cert, index) => {
            addCertificateToList(cert, index);
        });
    }
}

// Função para converter imagem URL para base64
async function convertImageToBase64(imageUrl) {
    return new Promise((resolve, reject) => {
        try {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            
            img.onload = function() {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                canvas.width = this.width;
                canvas.height = this.height;
                
                ctx.drawImage(this, 0, 0);
                
                try {
                    const dataURL = canvas.toDataURL('image/jpeg', 0.8);
                    resolve(dataURL);
                } catch (error) {
                    console.log('Erro ao converter para base64:', error);
                    resolve(null);
                }
            };
            
            img.onerror = function() {
                console.log('Erro ao carregar imagem para conversão base64');
                resolve(null);
            };
            
            img.src = imageUrl;
        } catch (error) {
            console.log('Erro na conversão base64:', error);
            resolve(null);
        }
    });
}

// Sincronização com LinkedIn (API e Fallback)
async function syncLinkedInData() {
    try {
        console.log('🔗 Sincronizando dados do LinkedIn...');
        
        // Como a API do LinkedIn requer autenticação OAuth, vamos usar os dados de fallback
        // Em uma implementação completa, seria necessário configurar OAuth 2.0
        console.log('📋 Usando dados de fallback do LinkedIn (API requer OAuth)');
        
        // Aplicar dados do LinkedIn aos campos do currículo
        if (LINKEDIN_FALLBACK_DATA) {
            // Atualizar dados pessoais
            if (LINKEDIN_FALLBACK_DATA.name) {
                const nomeInput = document.getElementById('nome');
                if (nomeInput && !nomeInput.value) {
                    nomeInput.value = LINKEDIN_FALLBACK_DATA.name;
                }
            }
            
            if (LINKEDIN_FALLBACK_DATA.headline) {
                const cargoInput = document.getElementById('cargo');
                if (cargoInput && !cargoInput.value) {
                    cargoInput.value = LINKEDIN_FALLBACK_DATA.headline;
                }
            }
            
            if (LINKEDIN_FALLBACK_DATA.location) {
                const localizacaoInput = document.getElementById('localizacao');
                if (localizacaoInput && !localizacaoInput.value) {
                    localizacaoInput.value = LINKEDIN_FALLBACK_DATA.location;
                }
            }
            
            if (LINKEDIN_FALLBACK_DATA.summary) {
                const resumoInput = document.getElementById('resumo-profissional');
                if (resumoInput && !resumoInput.value) {
                    resumoInput.value = LINKEDIN_FALLBACK_DATA.summary;
                }
            }
            
            // Adicionar link do LinkedIn
            const linkedinInput = document.getElementById('linkedin');
            if (linkedinInput && !linkedinInput.value) {
                linkedinInput.value = LINKEDIN_PROFILE_URL;
            }
            
            // Sincronizar experiências se não houver nenhuma
            if (curriculumData.experience.length === 0 && LINKEDIN_FALLBACK_DATA.experience) {
                LINKEDIN_FALLBACK_DATA.experience.forEach(exp => {
                    curriculumData.experience.push({
                        cargo: exp.title,
                        empresa: exp.company,
                        periodo: exp.duration,
                        descricao: exp.description,
                        id: Date.now() + Math.random()
                    });
                });
                updateExperienceList();
            }
            
            // Sincronizar habilidades se não houver nenhuma
            if (curriculumData.skills.length === 0 && LINKEDIN_FALLBACK_DATA.skills) {
                LINKEDIN_FALLBACK_DATA.skills.forEach(skill => {
                    curriculumData.skills.push({
                        nome: skill,
                        nivel: 'Avançado',
                        id: Date.now() + Math.random()
                    });
                });
                updateSkillsList();
            }
            
            console.log('✅ Dados do LinkedIn sincronizados com sucesso');
            showNotification('Dados do LinkedIn sincronizados!', 'success');
            
            // Atualizar preview
            updatePreview();
        }
        
        return LINKEDIN_FALLBACK_DATA;
    } catch (error) {
        console.error('❌ Erro ao sincronizar dados do LinkedIn:', error);
        showNotification('Erro ao sincronizar LinkedIn', 'error');
        return null;
    }
}

// Função para sincronização manual do LinkedIn
window.syncLinkedInDataManually = async function() {
    try {
        showNotification('Sincronizando dados do LinkedIn...', 'info');
        await syncLinkedInData();
    } catch (error) {
        console.error('Erro na sincronização manual do LinkedIn:', error);
        showNotification('Erro ao sincronizar dados do LinkedIn', 'error');
    }
};

// ========== FUNÇÕES DE APLICAÇÃO DE FORMATAÇÃO ==========

// Função para aplicar tema selecionado
window.applySelectedTheme = function() {
    const themeSelect = document.getElementById('curriculum-theme');
    if (!themeSelect) return;
    
    const selectedTheme = themeSelect.value;
    console.log('🎨 Aplicando tema:', selectedTheme);
    
    // Atualizar dados do currículo
    curriculumData.settings.theme = selectedTheme;
    
    // Aplicar tema ao preview
    const previewContainer = document.getElementById('curriculum-preview');
    if (previewContainer) {
        // Remover classes de tema existentes
        previewContainer.classList.remove(...Array.from(previewContainer.classList).filter(c => c.startsWith('curriculum-')));
        
        // Adicionar nova classe de tema
        previewContainer.classList.add(`curriculum-${selectedTheme}`);
        
        // Regenerar preview com novo tema
        refreshPreview();
    }
    
    showNotification(`Tema ${selectedTheme} aplicado!`, 'success');
    scheduleAutoSave();
};

// Função para aplicar cor primária
window.applyPrimaryColor = function() {
    const colorSelect = document.getElementById('primary-color');
    if (!colorSelect) return;
    
    const selectedColor = colorSelect.value;
    console.log('🎨 Aplicando cor primária:', selectedColor);
    
    // Atualizar dados do currículo
    curriculumData.settings.primaryColor = selectedColor;
    
    // Aplicar cor ao preview
    const previewContainer = document.getElementById('curriculum-preview');
    if (previewContainer) {
        previewContainer.style.setProperty('--primary-color', selectedColor);
        
        // Regenerar preview com nova cor
        refreshPreview();
    }
    
    showNotification('Cor primária atualizada!', 'success');
    scheduleAutoSave();
};

// Função para aplicar fonte selecionada
window.applySelectedFont = function() {
    const fontSelect = document.getElementById('font-family');
    if (fontSelect) {
        const selectedFont = fontSelect.value;
        console.log('🎨 Aplicando fonte:', selectedFont);
        
        // Atualizar dados do currículo
        curriculumData.settings.fontFamily = selectedFont;
        
        // Aplicar fonte ao preview
        const previewContainer = document.getElementById('curriculum-preview');
        if (previewContainer) {
            previewContainer.style.fontFamily = `${selectedFont}, sans-serif`;
            
            // Regenerar preview com nova fonte
            refreshPreview();
        }
        
        showNotification(`Fonte ${selectedFont} aplicada!`, 'success');
        scheduleAutoSave();
    }
};

// Função para aplicar layout selecionado
window.applySelectedLayout = function() {
    const layoutSelect = document.getElementById('layout-type');
    if (!layoutSelect) return;
    
       
    const selectedLayout = layoutSelect.value;
    console.log('🎨 Aplicando layout:', selectedLayout);
    
    // Atualizar dados do currículo
    curriculumData.settings.layout = selectedLayout;
    
    // Aplicar layout ao preview
    const previewContainer = document.getElementById('curriculum-preview');
    if (previewContainer) {
        // Remover classes de layout existentes
        previewContainer.classList.remove(...Array.from(previewContainer.classList).filter(c => c.startsWith('layout-')));
        
        // Adicionar nova classe de layout
        previewContainer.classList.add(`layout-${selectedLayout}`);
        
        // Regenerar preview com novo layout
        refreshPreview();
    }
    
    showNotification(`Layout ${selectedLayout} aplicado!`, 'success');
    scheduleAutoSave();
};

// Função para aplicar espaçamento selecionado
window.applySelectedSpacing = function() {
    const spacingSelect = document.getElementById('spacing');
    if (!spacingSelect) return;
    
    const selectedSpacing = spacingSelect.value;
    console.log('🎨 Aplicando espaçamento:', selectedSpacing);
    
    // Atualizar dados do currículo
    curriculumData.settings.spacing = selectedSpacing;
    
    // Aplicar espaçamento ao preview
    const previewContainer = document.getElementById('curriculum-preview');
    if (previewContainer) {
        // Remover classes de espaçamento existentes
        previewContainer.classList.remove('spacing-compact', 'spacing-normal', 'spacing-relaxed');
        
        // Adicionar nova classe de espaçamento
        previewContainer.classList.add(`spacing-${selectedSpacing}`);
        
        // Regenerar preview com novo espaçamento
        refreshPreview();
    }
    
    showNotification(`Espaçamento ${selectedSpacing} aplicado!`, 'success');
    scheduleAutoSave();
};

// Função para conectar eventos de formatação
function setupFormattingEvents() {
    // Conectar seletores de formatação com as funções
    const themeSelect = document.getElementById('curriculum-theme');
    if (themeSelect) {
        themeSelect.addEventListener('change', applySelectedTheme);
    }
    
    const colorSelect = document.getElementById('primary-color');
    if (colorSelect) {
        colorSelect.addEventListener('change', applyPrimaryColor);
    }
    
    const fontSelect = document.getElementById('font-family');
    if (fontSelect) {
        fontSelect.addEventListener('change', applySelectedFont);
    }
    
    const layoutSelect = document.getElementById('layout-type');
    if (layoutSelect) {
        layoutSelect.addEventListener('change', applySelectedLayout);
    }
    
    const spacingSelect = document.getElementById('spacing');
    if (spacingSelect) {
        spacingSelect.addEventListener('change', applySelectedSpacing);
    }
    
    console.log('✅ Eventos de formatação configurados');
}

// Função para aplicar todas as configurações de formatação
window.applyAllFormatting = function() {
    console.log('🎨 Aplicando todas as configurações de formatação...');
    
    applySelectedTheme();
    applyPrimaryColor();
    applySelectedFont();
    applySelectedLayout();
    applySelectedSpacing();
    
    showNotification('Formatação completa aplicada!', 'success');
};

// Inicializar eventos de formatação quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    // Configurar eventos de formatação
    setTimeout(() => {
        setupFormattingEvents();
    }, 1000);
});

// Função para pré-visualizar tema antes de aplicar
window.previewTheme = function(themeName) {
    const previewContainer = document.getElementById('curriculum-preview');
    if (!previewContainer) return;
    
    // Salvar tema atual
    const currentTheme = curriculumData.settings.theme;
    
    // Aplicar tema temporariamente
    previewContainer.classList.remove(...Array.from(previewContainer.classList).filter(c => c.startsWith('curriculum-')));
    previewContainer.classList.add(`curriculum-${themeName}`);
    
    // Restaurar tema original após 3 segundos
    setTimeout(() => {
        previewContainer.classList.remove(`curriculum-${themeName}`);
        previewContainer.classList.add(`curriculum-${currentTheme}`);
    }, 3000);
    
    showNotification(`Pré-visualizando tema ${themeName}`, 'info');
};

// Função para aplicar estilos ao preview
function applyPreviewStyles(previewContainer) {
    if (!previewContainer) return;
    
    // Aplicar configurações de tema, cor, fonte, etc.
    const settings = curriculumData.settings;
    
    previewContainer.style.setProperty('--primary-color', settings.primaryColor);
    previewContainer.style.fontFamily = `${settings.fontFamily}, sans-serif`;
    
    // Aplicar classes de tema e layout
    previewContainer.className = `curriculum-preview curriculum-${settings.theme} layout-${settings.layout} spacing-${settings.spacing}`;
    
    // Aplicar cores personalizadas se existirem
    if (settings.customColors) {
        applyCustomColorsToPreview(previewContainer, settings.customColors);
    }
}

// Função para aplicar cores personalizadas
function applyCustomColors() {
    try {
        const customColors = {
            nameTitle: document.getElementById('name-title-color').value,
            sectionTitle: document.getElementById('section-title-color').value,
            mainText: document.getElementById('main-text-color').value,
            highlight: document.getElementById('highlight-color').value,
            link: document.getElementById('link-color').value,
            skills: document.getElementById('skills-color').value
        };
        
        // Salvar cores no curriculumData
        curriculumData.settings.customColors = customColors;
        
        // Aplicar cores ao preview se estiver visível
        const previewContainer = document.getElementById('curriculum-preview');
        if (previewContainer) {
            applyCustomColorsToPreview(previewContainer, customColors);
        }
          showNotification('Cores personalizadas aplicadas com sucesso!', 'success');
        
        // Salvar automaticamente
        saveCurriculum();
        
    } catch (error) {
        console.error('Erro ao aplicar cores personalizadas:', error);
        showNotification('Erro ao aplicar cores personalizadas', 'error');
    }
}

// Função para aplicar cores personalizadas ao preview
function applyCustomColorsToPreview(container, colors) {
    const style = document.createElement('style');
    style.id = 'custom-colors-style';
    
    // Remover estilo anterior se existir
    const existingStyle = document.getElementById('custom-colors-style');
    if (existingStyle) {
        existingStyle.remove();
    }
      style.textContent = `
        /* Nome e título principal */
        #curriculum-preview header h1 {
            color: ${colors.nameTitle} !important;
        }
        
        #curriculum-preview header h2 {
            color: ${colors.nameTitle} !important;
        }
        
        /* Títulos de seção */
        #curriculum-preview h3 {
            color: ${colors.sectionTitle} !important;
        }
        
        /* Texto principal - parágrafos e descrições */
        #curriculum-preview p,
        #curriculum-preview span:not([style*="color"]) {
            color: ${colors.mainText} !important;
        }
        
        /* Destaques - empresas, projetos, posições */
        #curriculum-preview h4 {
            color: ${colors.highlight} !important;
        }
        
        #curriculum-preview div p[style*="font-weight: bold"] {
            color: ${colors.highlight} !important;
        }
        
        /* Links e contatos */
        #curriculum-preview a {
            color: ${colors.link} !important;
        }
          /* Habilidades - barras de progresso e tags */
        #curriculum-preview .skill-progress {
            background: ${colors.skills} !important;
        }
        
        #curriculum-preview .skill-tag {
            color: ${colors.skills} !important;
        }
        
        /* Classe auxiliares para elementos específicos */
        .curriculum-name {
            color: ${colors.nameTitle} !important;
        }
        
        .curriculum-title {
            color: ${colors.nameTitle} !important;
        }
        
        .section-title {
            color: ${colors.sectionTitle} !important;
        }
        
        .main-text {
            color: ${colors.mainText} !important;
        }
        
        .highlight {
            color: ${colors.highlight} !important;
        }
        
        .contact-link {
            color: ${colors.link} !important;
        }
        
        .skill-tag {
            color: ${colors.skills} !important;
            border-color: ${colors.skills} !important;
        }
    `;
    
    document.head.appendChild(style);
}

// Função para sincronizar controles de cor (input color e select)
function setupColorControls() {
    const colorControls = [
        { colorInput: 'name-title-color', preset: 'name-title-color-preset' },
        { colorInput: 'section-title-color', preset: 'section-title-color-preset' },
        { colorInput: 'main-text-color', preset: 'main-text-color-preset' },
        { colorInput: 'highlight-color', preset: 'highlight-color-preset' },
        { colorInput: 'link-color', preset: 'link-color-preset' },
        { colorInput: 'skills-color', preset: 'skills-color-preset' }
    ];
    
    colorControls.forEach(control => {
        const colorInput = document.getElementById(control.colorInput);
        const presetSelect = document.getElementById(control.preset);
        
        if (colorInput && presetSelect) {            // Sincronizar preset com input color
            presetSelect.addEventListener('change', function() {
                colorInput.value = this.value;
                // Aplicar cores automaticamente quando preset mudar
                setTimeout(() => {
                    const currentColors = {
                        nameTitle: document.getElementById('name-title-color').value,
                        sectionTitle: document.getElementById('section-title-color').value,
                        mainText: document.getElementById('main-text-color').value,
                        highlight: document.getElementById('highlight-color').value,
                        link: document.getElementById('link-color').value,
                        skills: document.getElementById('skills-color').value
                    };
                    applyCustomColorsToPreview(currentColors);
                }, 100);
            });
            
            // Atualizar preset quando input color mudar
            colorInput.addEventListener('input', function() {
                // Verificar se a cor corresponde a algum preset
                const options = presetSelect.options;
                for (let i = 0; i < options.length; i++) {
                    if (options[i].value.toLowerCase() === this.value.toLowerCase()) {
                        presetSelect.value = this.value;
                        break;
                    }
                }
                // Aplicar cores automaticamente quando input mudar
                setTimeout(() => {
                    const currentColors = {
                        nameTitle: document.getElementById('name-title-color').value,
                        sectionTitle: document.getElementById('section-title-color').value,
                        mainText: document.getElementById('main-text-color').value,
                        highlight: document.getElementById('highlight-color').value,
                        link: document.getElementById('link-color').value,
                        skills: document.getElementById('skills-color').value
                    };
                    applyCustomColorsToPreview(currentColors);
                }, 100);
            });
        }
    });
}

// Função para carregar cores salvas
function loadSavedColors() {
    if (curriculumData.settings && curriculumData.settings.customColors) {
        const colors = curriculumData.settings.customColors;
        
        document.getElementById('name-title-color').value = colors.nameTitle || '#1f2937';
        document.getElementById('section-title-color').value = colors.sectionTitle || '#3b82f6';
        document.getElementById('main-text-color').value = colors.mainText || '#374151';
        document.getElementById('highlight-color').value = colors.highlight || '#10b981';
        document.getElementById('link-color').value = colors.link || '#3b82f6';
        document.getElementById('skills-color').value = colors.skills || '#8b5cf6';
        
        // Sincronizar com os presets
        document.getElementById('name-title-color-preset').value = colors.nameTitle || '#1f2937';
        document.getElementById('section-title-color-preset').value = colors.sectionTitle || '#3b82f6';
        document.getElementById('main-text-color-preset').value = colors.mainText || '#374151';
        document.getElementById('highlight-color-preset').value = colors.highlight || '#10b981';
        document.getElementById('link-color-preset').value = colors.link || '#3b82f6';
        document.getElementById('skills-color-preset').value = colors.skills || '#8b5cf6';
    }
}

// Função global para ser chamada pelo HTML
window.applyCustomColors = applyCustomColors;

// Configurar controles de cor quando a página carrega
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        setupColorControls();
        loadSavedColors();
        
        // Aplicar cores automaticamente após carregar
        setTimeout(() => {
            const currentColors = {
                nameTitle: document.getElementById('name-title-color')?.value || '#1f2937',
                sectionTitle: document.getElementById('section-title-color')?.value || '#3b82f6',
                mainText: document.getElementById('main-text-color')?.value || '#374151',
                highlight: document.getElementById('highlight-color')?.value || '#10b981',
                link: document.getElementById('link-color')?.value || '#3b82f6',
                skills: document.getElementById('skills-color')?.value || '#8b5cf6'
            };
            applyCustomColorsToPreview(currentColors);
        }, 500);
    }, 1000);
});
