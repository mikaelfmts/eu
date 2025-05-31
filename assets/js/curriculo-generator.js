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
                resolve(false);
            } else {
                // Verificar se é usuário administrador
                checkAdminPermissions(user).then(isAdmin => {
                    if (!isAdmin) {
                        showNotification('Acesso negado. Apenas administradores podem acessar esta página.', 'error');
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
        'layout-type', 'spacing', 'show-photo', 'show-skills-progress',
        'show-contact-icons', 'show-project-links'
    ];
    
    settingsInputs.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('change', updateSettings);
        }
    });
}

// Atualizar dados pessoais
function updatePersonalData() {
    curriculumData.personalData = {
        nomeCompleto: document.getElementById('nome-completo')?.value || '',
        tituloProfissional: document.getElementById('titulo-profissional')?.value || '',
        email: document.getElementById('email')?.value || '',
        telefone: document.getElementById('telefone')?.value || '',
        linkedin: document.getElementById('linkedin')?.value || '',
        github: document.getElementById('github')?.value || '',
        localizacao: document.getElementById('localizacao')?.value || '',
        resumoProfissional: document.getElementById('resumo-profissional')?.value || ''
    };
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

// Gerenciamento de projetos
window.loadGitHubProjects = async function() {
    try {
        showNotification('Carregando projetos do GitHub...', 'info');
        
        const response = await fetch(`${GITHUB_API_BASE}/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=20`);
        const repos = await response.json();
        
        if (!Array.isArray(repos)) {
            throw new Error('Erro ao carregar repositórios');
        }
        
        repos.forEach(repo => {
            if (!repo.fork && repo.name !== GITHUB_USERNAME) {
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
                
                // Verificar se o projeto já existe
                const exists = curriculumData.projects.some(p => p.id === project.id);
                if (!exists) {
                    curriculumData.projects.push(project);
                }
            }
        });
        
        renderProjectsList();
        updateProgress();
        showNotification('Projetos do GitHub carregados com sucesso!', 'success');
    } catch (error) {
        console.error('Erro ao carregar projetos do GitHub:', error);
        showNotification('Erro ao carregar projetos do GitHub', 'error');
    }
};

window.loadSiteProjects = async function() {
    try {
        showNotification('Carregando projetos do site...', 'info');
        
        // Projetos baseados na estrutura do site
        const siteProjects = [
            {
                id: 'portfolio-site',
                nome: 'Portfolio Pessoal',
                descricao: 'Site portfolio profissional com tema inspirado em League of Legends, sistema de chat em tempo real e painel administrativo.',
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

window.removeCertificate = function(id) {
    curriculumData.certificates = curriculumData.certificates.filter(cert => cert.id !== id);
    renderCertificatesList();
    updateProgress();
    showNotification('Certificado removido', 'success');
};

// Preview do currículo
window.refreshPreview = function() {
    const previewContainer = document.getElementById('curriculum-preview');
    if (!previewContainer) return;
    
    const html = generateCurriculumHTML();
    previewContainer.innerHTML = html;
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
        </div>
    `;
}

function generateHeaderSection() {
    const personal = curriculumData.personalData;
    return `
        <header style="margin-bottom: 2rem; text-align: center; border-bottom: 2px solid ${curriculumData.settings.primaryColor}; padding-bottom: 1rem;">
            <h1 style="font-size: 2.5rem; margin: 0; color: ${curriculumData.settings.primaryColor};">
                ${personal.nomeCompleto || 'Nome Completo'}
            </h1>
            <h2 style="font-size: 1.5rem; margin: 0.5rem 0; color: #666;">
                ${personal.tituloProfissional || 'Título Profissional'}
            </h2>
            <div style="display: flex; justify-content: center; gap: 1rem; flex-wrap: wrap; margin-top: 1rem;">
                ${personal.email ? `<span><i class="fas fa-envelope"></i> ${personal.email}</span>` : ''}
                ${personal.telefone ? `<span><i class="fas fa-phone"></i> ${personal.telefone}</span>` : ''}
                ${personal.localizacao ? `<span><i class="fas fa-map-marker-alt"></i> ${personal.localizacao}</span>` : ''}
            </div>
            ${personal.resumoProfissional ? `<p style="margin-top: 1rem; font-style: italic; max-width: 600px; margin-left: auto; margin-right: auto;">${personal.resumoProfissional}</p>` : ''}
        </header>
    `;
}

function generateExperienceSection() {
    if (curriculumData.experience.length === 0) return '';
    
    return `
        <section style="margin-bottom: 2rem;">
            <h3 style="color: ${curriculumData.settings.primaryColor}; border-bottom: 1px solid #ccc; padding-bottom: 0.5rem;">
                Experiência Profissional
            </h3>
            ${curriculumData.experience.map(exp => `
                <div style="margin-bottom: 1.5rem;">
                    <h4 style="margin: 0; font-size: 1.2rem;">${exp.cargo}</h4>
                    <p style="margin: 0.25rem 0; color: ${curriculumData.settings.primaryColor}; font-weight: bold;">${exp.empresa}</p>
                    <p style="margin: 0.25rem 0; color: #666; font-size: 0.9rem;">${exp.periodo}</p>
                    ${exp.descricao ? `<p style="margin: 0.5rem 0;">${exp.descricao}</p>` : ''}
                </div>
            `).join('')}
        </section>
    `;
}

function generateProjectsSection() {
    if (curriculumData.projects.length === 0) return '';
    
    return `
        <section style="margin-bottom: 2rem;">
            <h3 style="color: ${curriculumData.settings.primaryColor}; border-bottom: 1px solid #ccc; padding-bottom: 0.5rem;">
                Projetos
            </h3>
            ${curriculumData.projects.map(project => `
                <div style="margin-bottom: 1.5rem;">
                    <h4 style="margin: 0; font-size: 1.2rem;">${project.nome}</h4>
                    <p style="margin: 0.5rem 0;">${project.descricao}</p>
                    ${project.tecnologias.length > 0 ? `
                        <div style="margin: 0.5rem 0;">
                            <strong>Tecnologias:</strong> ${project.tecnologias.join(', ')}
                        </div>
                    ` : ''}
                    ${project.link && curriculumData.settings.showProjectLinks ? `
                        <a href="${project.link}" style="color: ${curriculumData.settings.primaryColor}; text-decoration: none;">
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
        <section style="margin-bottom: 2rem;">
            <h3 style="color: ${curriculumData.settings.primaryColor}; border-bottom: 1px solid #ccc; padding-bottom: 0.5rem;">
                Habilidades Técnicas
            </h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                ${curriculumData.skills.map(skill => `
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0;">
                        <span>${skill.nome}</span>
                        ${curriculumData.settings.showSkillsProgress ? `
                            <div style="flex: 1; margin-left: 1rem; background: #eee; height: 8px; border-radius: 4px; overflow: hidden;">
                                <div style="width: ${skill.nivel}%; height: 100%; background: ${curriculumData.settings.primaryColor};"></div>
                            </div>
                            <span style="margin-left: 0.5rem; font-size: 0.8rem;">${skill.nivel}%</span>
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
        <section style="margin-bottom: 2rem;">
            <h3 style="color: ${curriculumData.settings.primaryColor}; border-bottom: 1px solid #ccc; padding-bottom: 0.5rem;">
                Certificados e Educação
            </h3>
            ${curriculumData.certificates.map(cert => `
                <div style="margin-bottom: 1.5rem;">
                    <h4 style="margin: 0; font-size: 1.1rem;">${cert.titulo}</h4>
                    <p style="margin: 0.25rem 0; color: ${curriculumData.settings.primaryColor}; font-weight: bold;">${cert.instituicao}</p>
                    ${cert.data ? `<p style="margin: 0.25rem 0; color: #666; font-size: 0.9rem;">${cert.data}</p>` : ''}
                </div>
            `).join('')}
        </section>
    `;
}

// Salvar currículo
window.saveCurriculum = async function() {
    try {
        curriculumData.metadata.lastUpdated = new Date();
        if (!curriculumData.metadata.createdAt) {
            curriculumData.metadata.createdAt = new Date();
        }
        
        const curriculumRef = doc(db, 'curriculum', curriculumData.metadata.userId);
        await setDoc(curriculumRef, curriculumData);
        
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
window.downloadPDF = function() {
    try {
        const previewContainer = document.getElementById('curriculum-preview');
        if (!previewContainer || !previewContainer.innerHTML.trim()) {
            showNotification('Por favor, gere o preview do currículo primeiro', 'warning');
            return;
        }

        showNotification('Gerando PDF... aguarde', 'info');
        
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
