// Função para sincronizar foto do perfil com GitHub API
async function syncProfilePhoto() {
    try {
        console.log('🖼️ Sincronizando foto do perfil com GitHub API...');
        const response = await fetch('https://api.github.com/users/mikaelfmts');
        if (response.ok) {
            const data = await response.json();
            const profilePhotos = document.querySelectorAll('.foto-perfil img, #profile-photo');
            
            if (data.avatar_url) {
                profilePhotos.forEach(img => {
                    if (img) {
                        img.src = data.avatar_url;
                        console.log('✅ Foto do perfil atualizada:', data.avatar_url);
                    }
                });
            }
        }
    } catch (error) {
        console.log('⚠️ Erro ao sincronizar foto do perfil, mantendo foto padrão:', error);
    }
}

// Sistema de Partículas
function initParticleSystem() {
    // Criar container de partículas se não existir
    let container = document.querySelector('.particles-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'particles-container';
        document.body.insertBefore(container, document.body.firstChild);
    }
    
    // Configurações do sistema de partículas
    const config = {
        particleCount: 40,          // Número total de partículas
        minSize: 2,                 // Tamanho mínimo em pixels
        maxSize: 5,                 // Tamanho máximo em pixels
        minSpeed: 1,                // Velocidade mínima (pixels por segundo)
        maxSpeed: 3,                // Velocidade máxima (pixels por segundo)
        types: ['golden', 'light', 'dark'] // Tipos de partículas
    };
    
    // Criar partículas iniciais
    for (let i = 0; i < config.particleCount; i++) {
        createParticle(container, config);
    }
}

function createParticle(container, config) {
    // Criar elemento da partícula
    const particle = document.createElement('div');
    particle.className = 'particle';
    
    // Configurações aleatórias para esta partícula
    const size = Math.random() * (config.maxSize - config.minSize) + config.minSize;
    const posX = Math.random() * 100;
    const posY = Math.random() * 100;
    const speed = Math.random() * (config.maxSpeed - config.minSpeed) + config.minSpeed;
    const delay = Math.random() * 5; // Delay aleatório para iniciar animação
    const duration = Math.random() * 10 + 15; // Duração entre 15-25 segundos
    const type = config.types[Math.floor(Math.random() * config.types.length)];
    
    // Adicionar classe de tipo
    particle.classList.add(type);
    
    // Aplicar propriedades CSS
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.left = `${posX}%`;
    particle.style.top = `${posY}%`;
    
    // Configurar animação
    const keyframes = [
        { transform: `translate(0, 0) rotate(0deg)`, opacity: 0 },
        { transform: `translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px) rotate(${Math.random() * 360}deg)`, opacity: 0.8 },
        { transform: `translate(${Math.random() * 200 - 100}px, ${Math.random() * 200 - 100}px) rotate(${Math.random() * 720}deg)`, opacity: 0 }
    ];
    
    const animOptions = {
        duration: duration * 1000,
        delay: delay * 1000,
        iterations: 1,
        easing: 'ease-in-out',
        fill: 'forwards'
    };
    
    // Adicionar ao DOM
    container.appendChild(particle);
    
    // Iniciar animação
    const anim = particle.animate(keyframes, animOptions);
    
    // Remover partícula quando animação terminar e criar uma nova
    anim.onfinish = () => {
        if (particle.parentNode) {
            particle.parentNode.removeChild(particle);
        }
        createParticle(container, config);
    };
}

// Garantir que a sincronização da foto funcione em todas as páginas
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(syncProfilePhoto, 100);
    
    // Inicializar o sistema de partículas
    initParticleSystem();
});

// Sincronizar foto quando a página estiver totalmente carregada
window.addEventListener('load', () => {
    setTimeout(syncProfilePhoto, 200);
});

function toggleMenu() {
    let menu = document.getElementById("menu-lateral");
    menu.classList.toggle("menu-aberto");
}

// Loading Screen
window.addEventListener('load', () => {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }
    
    // Sincronizar foto do perfil
    syncProfilePhoto();
    
    // Carregar dados do GitHub ao finalizar o carregamento da página
    console.log('🚀 Página carregada, iniciando fetchGitHubData...');
    
    // Aguardar um pouco para garantir que todos os elementos estão disponíveis
    setTimeout(() => {
        const reposElement = document.getElementById('github-repos');
        const profileElement = document.getElementById('github-profile');
        console.log('📦 Elemento github-repos encontrado:', !!reposElement);
        console.log('👤 Elemento github-profile encontrado:', !!profileElement);
        console.log('🎯 DOM está pronto, iniciando fetchGitHubData...');
        
        // Log adicional para verificar estado dos elementos
        if (profileElement) {
            console.log('🔍 Conteúdo atual do perfil:', profileElement.innerHTML);
        }
        if (reposElement) {
            console.log('🔍 Conteúdo atual dos repos:', reposElement.innerHTML);
        }
        
        fetchGitHubData();
        ensureReposDisplay(); // Garantir que os repos sejam exibidos
    }, 500); // Aumentei o tempo de 100ms para 500ms
});

// Função para buscar dados do GitHub
async function fetchGitHubData() {
    // Nome de usuário do GitHub (altere para o seu)
    const username = "mikaelfmts";
    
    // Verificar cache primeiro
    const cachedData = getFromCache();
    if (cachedData) {
        console.log('📂 Usando dados do cache...');
        const { languageStats, technologyStats, totalBytes } = cachedData;
        createSkillCards(languageStats, technologyStats, totalBytes, true);
        
        // Usar dados de fallback para perfil e repos
        fetchGitHubProfile(username);
        fetchGitHubRepositories(username);
        return;
    }
    
    console.log('🔄 Tentando buscar dados reais da API do GitHub para:', username);
    
    try {
        // Tentar buscar dados de perfil e repositórios
        await Promise.all([
            fetchGitHubProfile(username),
            fetchGitHubRepositories(username)
        ]);
        
        // Tentar analisar habilidades dos repositórios
        await analyzeSkillsFromRepos(username);
        
    } catch (error) {
        console.error('❌ Erro ao buscar dados do GitHub:', error);
        console.log('🔄 Usando dados de fallback como alternativa...');
        
        // Usar dados de fallback completos em caso de erro
        useFallbackData();
        
        // Gerar skills de fallback
        generateFallbackSkills();
    }
    
    // Verificação adicional após 2 segundos para garantir que tudo foi aplicado
    setTimeout(() => {
        console.log('🕒 Verificação final dos dados GitHub...');
        const profileElement = document.getElementById('github-profile');
        const reposElement = document.getElementById('github-repos');
        
        if (profileElement && profileElement.innerHTML.includes('loader')) {
            console.log('⚠️ Perfil ainda com loader, forçando atualização...');
            const realProfile = {
                name: "Mikael Ferreira",
                bio: null,
                public_repos: 6,
                followers: 1,
                following: 0,
                avatar_url: "https://avatars.githubusercontent.com/u/142128917?v=4",
                html_url: "https://github.com/mikaelfmts"
            };
            updateGitHubProfile(realProfile);
        }
        
        if (reposElement && reposElement.innerHTML.includes('loader')) {
            console.log('⚠️ Repos ainda com loader, forçando atualização...');
            useFallbackData();
        }
    }, 2000);
}

function useFallbackData() {
    console.log('📊 Iniciando useFallbackData com dados REAIS do mikaelfmts...');
    
    // Dados REAIS do perfil do mikaelfmts (obtidos da API GitHub)
    const fallbackProfile = {
        name: "Mikael Ferreira",
        bio: null,
        public_repos: 6,
        followers: 1,
        following: 0,
        avatar_url: "https://avatars.githubusercontent.com/u/142128917?v=4",
        html_url: "https://github.com/mikaelfmts"
    };
    
    console.log('✅ Dados do perfil real:', fallbackProfile);
    updateGitHubProfile(fallbackProfile);
    
    // Força uma segunda atualização após um delay maior
    setTimeout(() => {
        console.log('🔄 Forçando atualização do perfil GitHub novamente...');
        updateGitHubProfile(fallbackProfile);
    }, 1000);
    
    // Dados REAIS dos repositórios do mikaelfmts (obtidos da API GitHub)
    const fallbackRepos = [
        {
            name: "api",
            description: "API desenvolvida em JavaScript",
            html_url: "https://github.com/mikaelfmts/api",
            language: "JavaScript",
            stargazers_count: 1,
            forks_count: 0
        },
        {
            name: "backendapiv2",
            description: "Backend API v2",
            html_url: "https://github.com/mikaelfmts/backendapiv2",
            language: null,
            stargazers_count: 0,
            forks_count: 0
        },
        {
            name: "botauthentic",
            description: "bot-authentic",
            html_url: "https://github.com/mikaelfmts/botauthentic",
            language: null,
            stargazers_count: 0,
            forks_count: 0
        },
        {
            name: "eu",
            description: "Portfolio pessoal",
            html_url: "https://github.com/mikaelfmts/eu",
            language: "JavaScript",
            stargazers_count: 1,
            forks_count: 0
        },
        {
            name: "portfolio",
            description: "Portfolio atualizado",
            html_url: "https://github.com/mikaelfmts/portfolio",
            language: "JavaScript",
            stargazers_count: 0,
            forks_count: 0
        },
        {
            name: "seu-site-perfil",
            description: "Site de perfil pessoal",
            html_url: "https://github.com/mikaelfmts/seu-site-perfil",
            language: "HTML",
            stargazers_count: 0,
            forks_count: 0
        }
    ];
    
    console.log('✅ Dados dos repositórios reais:', fallbackRepos);
    updateGitHubRepos(fallbackRepos);
}

function generateFallbackSkills() {
    // Dados REAIS de fallback baseados no perfil mikaelfmts
    const fallbackLanguageStats = {
        JavaScript: 70.5,  // Maior proporção baseada nos repositórios JS
        HTML: 20.2,        // Site/perfil tem bastante HTML
        CSS: 8.1,          // Estilização dos projetos
        JSON: 1.0,         // Configurações dos projetos
        Markdown: 0.2      // READMEs dos projetos
    };
    
    const fallbackTechnologyStats = {
        Firebase: 45.0,           // Muito usado no perfil
        Git: 35.0,               // Controle de versão
        "Progressive Web Apps": 25.0,  // Baseado no portfolio
        "Local Storage": 20.0,    // Usado no portfólio
        "Responsive Design": 18.0, // Design responsivo
        "GitHub API": 15.0,       // Integração com GitHub
        "Bootstrap": 12.0,        // Framework CSS
        "Web APIs": 10.0         // APIs web modernas
    };
    
    const fallbackTotalBytes = 1024 * 750; // 750KB mais realista
    
    console.log('🎨 Gerando skills de fallback baseadas no perfil mikaelfmts...');
    createSkillCards(fallbackLanguageStats, fallbackTechnologyStats, fallbackTotalBytes, false);
}

// Função para criar cartões de habilidades (alternativa para a função generateSkillsCards)
function createSkillCards(languageStats, technologyStats, totalBytes, fromCache = false) {
    // Verificar se a função original está definida e usá-la se existir
    if (typeof generateSkillsCards === 'function') {
        return generateSkillsCards(languageStats, technologyStats, totalBytes, fromCache);
    }
    
    // Implementação alternativa
    const skillsGrid = document.querySelector('.skills-grid');
    if (!skillsGrid) {
        console.warn('❌ Elemento skills-grid não encontrado!');
        return;
    }
    
    // Remover loader
    const loadingElement = document.getElementById('skills-loading');
    if (loadingElement) {
        loadingElement.remove();
    }
    
    // Combinar dados de linguagens e tecnologias
    const allSkills = {};
    
    // Processar linguagens
    Object.entries(languageStats).forEach(([lang, bytes]) => {
        const percentage = totalBytes > 0 ? (bytes / totalBytes * 100) : 0;
        if (percentage > 0.5) { // Mostrar linguagens com mais de 0.5%
            allSkills[lang] = {
                percentage: Math.round(percentage),
                type: 'language',
                bytes: bytes,
                description: getSkillDescription(lang)
            };
        }
    });
    
    // Processar tecnologias
    const maxTechScore = Math.max(...Object.values(technologyStats), 1);
    Object.entries(technologyStats).forEach(([tech, score]) => {
        const percentage = Math.min(Math.round((score / maxTechScore) * 85), 95); // Max 95%
        allSkills[tech] = {
            percentage: Math.max(percentage, 10), // Min 10%
            type: 'technology',
            score: score,
            description: getSkillDescription(tech)
        };
    });
    
    // Gerar HTML
    let skillsHTML = '';
    Object.entries(allSkills).forEach(([name, data]) => {
        const skillColor = getSkillColor(name);
        const skillIcon = getSkillIcon(name);
        
        skillsHTML += `
            <div class="skill-card">
                <div class="skill-header">
                    <span class="skill-icon" style="background: rgba(${hexToRgb(skillColor)}, 0.1); border: 1px solid rgba(${hexToRgb(skillColor)}, 0.3);">
                        <i class="${skillIcon}"></i>
                    </span>
                    <h3>${name}</h3>
                </div>
                <div class="skill-level">
                    <span class="skill-level-label">Proficiency:</span>
                    <div class="skill-stars">
                        ${getSkillStars(data.percentage)}
                    </div>
                </div>
                <div class="skill-bar">
                    <div class="skill-progress" style="width: ${data.percentage}%; background: linear-gradient(90deg, ${skillColor}80, ${skillColor});"></div>
                </div>
                <div class="skill-percentage" style="color: ${skillColor};">${data.percentage}%</div>
                <div class="skill-description">
                    <p>${data.description}</p>
                </div>
                <div class="skill-details">
                    ${data.bytes ? `<span class="skill-bytes"><i class="fas fa-code"></i> ${formatBytes(data.bytes)}</span>` : ''}
                    <span class="skill-type" style="border-color: ${skillColor};">${data.type}</span>
                </div>
            </div>
        `;
    });
    
    skillsGrid.innerHTML = skillsHTML;
    console.log('✅ Skills cards gerados com sucesso!');
}

function getSkillIcon(skill) {
    const skillMapping = {
        'JavaScript': 'fab fa-js',
        'HTML': 'fab fa-html5',
        'CSS': 'fab fa-css3-alt',
        'Python': 'fab fa-python',
        'Java': 'fab fa-java',
        'React': 'fab fa-react',
        'Node.js': 'fab fa-node-js',
        'Firebase': 'fas fa-fire',
        'Git': 'fab fa-git-alt',
        'Bootstrap': 'fab fa-bootstrap'
    };
    
    return skillMapping[skill] || 'fas fa-code';
}

function getSkillColor(skill) {
    const skillColors = {
        'JavaScript': '#f7df1e',
        'HTML': '#e34c26',
        'CSS': '#264de4',
        'Python': '#3572a5',
        'Java': '#b07219',
        'React': '#61dafb',
        'Node.js': '#026e00',
        'Firebase': '#ffca28',
        'Git': '#f05032',
        'Bootstrap': '#7952b3'
    };
    
    return skillColors[skill] || '#c8aa6e';
}

// Função para atualizar o perfil com dados do GitHub
function updateGitHubProfile(profileData) {
    console.log('👤 updateGitHubProfile chamada com:', profileData);
    
    // Verificar se há um elemento para exibir o perfil do GitHub
    const profileElement = document.getElementById('github-profile');
    console.log('🔍 Elemento github-profile encontrado:', !!profileElement);
    
    if (profileElement) {
        console.log('🎯 Atualizando perfil GitHub na interface...');
        console.log('📊 Dados que serão exibidos:', {
            repos: profileData.public_repos,
            followers: profileData.followers,
            following: profileData.following,
            name: profileData.name
        });
        
        // Remover o loader primeiro
        const loader = profileElement.querySelector('.loader');
        if (loader) {
            loader.remove();
            console.log('🗑️ Loader removido do perfil GitHub');
        }
        
        // Atualizar informações do perfil
        profileElement.innerHTML = `
            <div class="github-card" style="display: flex; visibility: visible;">
                <div class="github-stats">
                    <div class="stat">
                        <span class="stat-value">${profileData.public_repos}</span>
                        <span class="stat-label">Repositórios</span>
                    </div>
                    <div class="stat">
                        <span class="stat-value">${profileData.followers}</span>
                        <span class="stat-label">Seguidores</span>
                    </div>
                    <div class="stat">
                        <span class="stat-value">${profileData.following}</span>
                        <span class="stat-label">Seguindo</span>
                    </div>
                </div>
                <a href="${profileData.html_url}" target="_blank" class="github-link">
                    <i class="fab fa-github"></i> Ver perfil completo
                </a>
            </div>
        `;
        console.log('✅ HTML do perfil GitHub inserido com sucesso!');
        console.log('📄 Conteúdo atual do elemento:', profileElement.innerHTML);
    } else {
        console.warn('⚠️ Elemento github-profile não encontrado no DOM');
    }
}

// Função para atualizar a lista de repositórios do GitHub
function updateGitHubRepos(repos) {
    console.log('🔥 updateGitHubRepos chamada com estilização premium:', repos);
    
    // Verificar se há um elemento para exibir os repositórios
    const reposElement = document.getElementById('github-repos');
    if (!reposElement) {
        console.warn('❌ Elemento github-repos não encontrado no DOM');
        return;
    }
    
    // Verificar se repos é um array válido
    if (!Array.isArray(repos)) {
        console.warn('❌ Dados de repositórios inválidos:', repos);
        reposElement.innerHTML = `
            <h3 style="color: var(--primary-color); text-align: center; margin-bottom: 2rem; font-family: 'Marcellus', serif; font-size: 2rem; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);">Meus últimos repositórios</h3>
            <div style="text-align: center; padding: 3rem; background: linear-gradient(135deg, rgba(231, 76, 60, 0.1) 0%, rgba(231, 76, 60, 0.05) 100%); border: 2px solid rgba(231, 76, 60, 0.3); border-radius: 20px; backdrop-filter: blur(10px); box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);">
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #e74c3c; margin-bottom: 1.5rem; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);"></i>
                <p style="color: #e74c3c; margin: 0; font-size: 1.2rem; font-weight: 600;">Erro ao carregar repositórios do GitHub.</p>
                <p style="color: rgba(231, 76, 60, 0.8); margin: 1rem 0 0; font-size: 1rem;">Verifique a conexão e tente novamente mais tarde.</p>
            </div>
        `;
        return;
    }
    
    if (repos.length === 0) {
        reposElement.innerHTML = `
            <h3 style="color: var(--primary-color); text-align: center; margin-bottom: 2rem; font-family: 'Marcellus', serif; font-size: 2rem; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);">Meus últimos repositórios</h3>
            <div style="text-align: center; padding: 3rem; background: linear-gradient(135deg, rgba(255, 193, 7, 0.1) 0%, rgba(255, 193, 7, 0.05) 100%); border: 2px solid rgba(255, 193, 7, 0.3); border-radius: 20px; backdrop-filter: blur(10px); box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);">
                <i class="fas fa-info-circle" style="font-size: 3rem; color: #ffc107; margin-bottom: 1.5rem; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);"></i>
                <p style="color: #ffc107; margin: 0; font-size: 1.2rem; font-weight: 600;">Nenhum repositório público encontrado.</p>
            </div>
        `;
        return;
    }
    
    // Header premium com gradiente e tipografia melhorada
    let reposHTML = `
        <div style="text-align: center; margin-bottom: 3rem;">
            <h3 style="
                color: var(--primary-color); 
                font-family: 'Marcellus', serif; 
                font-size: 2.5rem; 
                margin-bottom: 1rem; 
                text-shadow: 0 3px 6px rgba(0, 0, 0, 0.3);
                letter-spacing: 2px;
                text-transform: uppercase;
            ">Meus Repositórios GitHub</h3>
            <p style="
                color: var(--text-secondary); 
                font-size: 1.1rem; 
                font-style: italic; 
                opacity: 0.9;
                margin-top: 0.5rem;
            ">
                <i class="fab fa-github" style="color: var(--primary-color); margin-right: 0.5rem; font-size: 1.3rem;"></i>
                Projetos desenvolvidos e hospedados no GitHub
            </p>
        </div>
        <div class="github-repos-premium-grid">
    `;
    
    // Criar card premium para cada repositório
    repos.forEach(repo => {
        console.log('🎨 Processando repositório com design premium:', repo.name);
        
        // Determinar a linguagem e cor
        const language = repo.language || 'Não especificada';
        const languageColors = {
            'JavaScript': '#f1e05a',
            'TypeScript': '#2b7489',
            'Python': '#3572a5',
            'HTML': '#e34c26',
            'CSS': '#1572b6',
            'Java': '#b07219',
            'C++': '#f34b7d',
            'C': '#555555',
            'Go': '#00add8',
            'Rust': '#dea584',
            'PHP': '#4f5d95',
            'Ruby': '#701516',
            'Swift': '#ffac45',
            'Kotlin': '#f18e33',
            'Dart': '#00b4ab'
        };
        
        const languageColor = languageColors[language] || 'var(--primary-color)';
        
        reposHTML += `
            <div class="repo-card-premium" style="
                background: linear-gradient(135deg, 
                    rgba(30, 35, 40, 0.98) 0%, 
                    rgba(25, 30, 35, 0.95) 100%);
                border: 2px solid rgba(200, 170, 110, 0.3);
                border-radius: 20px;
                padding: 2rem;
                transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
                position: relative;
                overflow: hidden;
                backdrop-filter: blur(15px);
                box-shadow: 
                    0 10px 30px rgba(0, 0, 0, 0.4),
                    0 2px 10px rgba(200, 170, 110, 0.1);
                margin-bottom: 2rem;
            " 
            onmouseover="this.style.transform='translateY(-12px) translateZ(0)'; this.style.boxShadow='0 25px 50px rgba(0, 0, 0, 0.5), 0 10px 30px rgba(200, 170, 110, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'; this.style.borderColor='rgba(200, 170, 110, 0.8)';"
            onmouseout="this.style.transform='translateY(0) translateZ(0)'; this.style.boxShadow='0 10px 30px rgba(0, 0, 0, 0.4), 0 2px 10px rgba(200, 170, 110, 0.1)'; this.style.borderColor='rgba(200, 170, 110, 0.3)';">
                
                <!-- Barra superior decorativa -->
                <div style="
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 5px;
                    background: linear-gradient(90deg, 
                        var(--primary-color) 0%, 
                        #d4af37 50%, 
                        var(--primary-color) 100%);
                "></div>
                
                <!-- Header do repositório -->
                <div class="repo-header-premium" style="
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 1.5rem;
                ">
                    <h4 style="
                        color: var(--primary-color);
                        font-size: 1.4rem;
                        font-weight: 800;
                        text-transform: uppercase;
                        letter-spacing: 1.2px;
                        margin: 0;
                        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
                        font-family: 'Marcellus', serif;
                    ">${repo.name || 'Sem nome'}</h4>
                    
                    ${language !== 'Não especificada' ? `
                        <span style="
                            background: linear-gradient(135deg, ${languageColor} 0%, ${languageColor}aa 100%);
                            color: white;
                            padding: 0.4rem 0.8rem;
                            border-radius: 20px;
                            font-size: 0.8rem;
                            font-weight: 700;
                            text-transform: uppercase;
                            letter-spacing: 0.5px;
                            box-shadow: 0 3px 10px rgba(0, 0, 0, 0.3);
                            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
                        ">${language}</span>
                    ` : ''}
                </div>
                
                <!-- Descrição -->
                <p style="
                    color: var(--text-secondary);
                    line-height: 1.7;
                    margin-bottom: 1.5rem;
                    font-size: 1rem;
                    opacity: 0.9;
                    min-height: 3rem;
                ">${repo.description || 'Sem descrição disponível'}</p>
                
                <!-- Estatísticas -->
                <div class="repo-stats-premium" style="
                    display: flex;
                    gap: 1rem;
                    margin: 1.5rem 0;
                    flex-wrap: wrap;
                ">
                    <div style="
                        display: flex;
                        align-items: center;
                        gap: 0.5rem;
                        color: var(--text-secondary);
                        font-size: 0.95rem;
                        font-weight: 500;
                        padding: 0.4rem 0.8rem;
                        background: rgba(0, 0, 0, 0.3);
                        border-radius: 12px;
                        border: 1px solid rgba(200, 170, 110, 0.2);
                        transition: all 0.3s ease;
                    " 
                    onmouseover="this.style.background='rgba(200, 170, 110, 0.1)'; this.style.borderColor='rgba(200, 170, 110, 0.4)'; this.style.transform='scale(1.05)';"
                    onmouseout="this.style.background='rgba(0, 0, 0, 0.3)'; this.style.borderColor='rgba(200, 170, 110, 0.2)'; this.style.transform='scale(1)';">
                        <i class="fas fa-star" style="color: var(--primary-color);"></i>
                        <span>${repo.stargazers_count || 0}</span>
                    </div>
                    
                    <div style="
                        display: flex;
                        align-items: center;
                        gap: 0.5rem;
                        color: var(--text-secondary);
                        font-size: 0.95rem;
                        font-weight: 500;
                        padding: 0.4rem 0.8rem;
                        background: rgba(0, 0, 0, 0.3);
                        border-radius: 12px;
                        border: 1px solid rgba(200, 170, 110, 0.2);
                        transition: all 0.3s ease;
                    "
                    onmouseover="this.style.background='rgba(200, 170, 110, 0.1)'; this.style.borderColor='rgba(200, 170, 110, 0.4)'; this.style.transform='scale(1.05)';"
                    onmouseout="this.style.background='rgba(0, 0, 0, 0.3)'; this.style.borderColor='rgba(200, 170, 110, 0.2)'; this.style.transform='scale(1)';">
                        <i class="fas fa-code-branch" style="color: var(--primary-color);"></i>
                        <span>${repo.forks_count || 0}</span>
                    </div>
                </div>
                
                <!-- Botão de ação -->
                <div class="repo-actions-premium" style="margin-top: 2rem;">
                    <a href="${repo.html_url}" target="_blank" style="
                        background: linear-gradient(135deg, 
                            var(--primary-color) 0%, 
                            #d4af37 100%);
                        color: var(--background-primary);
                        border: none;
                        padding: 1rem 1.8rem;
                        border-radius: 12px;
                        text-decoration: none;
                        font-weight: 700;
                        text-transform: uppercase;
                        letter-spacing: 1.2px;
                        transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
                        display: inline-flex;
                        align-items: center;
                        gap: 0.8rem;
                        font-size: 0.9rem;
                        box-shadow: 
                            0 6px 20px rgba(200, 170, 110, 0.3),
                            inset 0 1px 0 rgba(255, 255, 255, 0.2);
                        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
                    "
                    onmouseover="this.style.transform='translateY(-3px) scale(1.05)'; this.style.boxShadow='0 10px 30px rgba(200, 170, 110, 0.5), inset 0 2px 0 rgba(255, 255, 255, 0.3)';"
                    onmouseout="this.style.transform='translateY(0) scale(1)'; this.style.boxShadow='0 6px 20px rgba(200, 170, 110, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)';">
                        <i class="fab fa-github" style="font-size: 1.1rem;"></i>
                        Ver no GitHub
                    </a>
                </div>
            </div>
        `;
    });
    
    reposHTML += '</div>';
    
    // Adicionar estilos CSS específicos se não existirem
    if (!document.querySelector('#github-repos-premium-styles')) {
        const style = document.createElement('style');
        style.id = 'github-repos-premium-styles';
        style.textContent = `
            .github-repos-premium-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
                gap: 2rem;
                margin-top: 2rem;
            }
            
            @media (max-width: 768px) {
                .github-repos-premium-grid {
                    grid-template-columns: 1fr;
                    gap: 1.5rem;
                }
                
                .repo-card-premium {
                    padding: 1.5rem !important;
                }
                
                .repo-header-premium {
                    flex-direction: column !important;
                    gap: 1rem;
                }
                
                .repo-stats-premium {
                    justify-content: center;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    reposElement.innerHTML = reposHTML;
    console.log('✨ Repositórios atualizados com design premium aplicado!');
}

document.addEventListener("DOMContentLoaded", function () {
    // Criar um estilo global para desativar TODAS as animações nos cards
    const style = document.createElement('style');
    style.textContent = `
        .projeto, .skill-card, 
        .projeto *, .skill-card * {
            transform: none !important;
            transition: none !important;
            animation: none !important;
            perspective: none !important;
            transform-style: flat !important;
            box-shadow: none !important;
            will-change: auto !important;
        }
        .projeto:hover, .skill-card:hover,
        .projeto:hover *, .skill-card:hover * {
            transform: none !important;
            transition: none !important;
            animation: none !important;
            perspective: none !important;
            transform-style: flat !important;
            box-shadow: none !important;
        }
    `;
    document.head.appendChild(style);
    
    // Remover TODAS as transformações e transições dos cards
    const cards = document.querySelectorAll('.projeto, .skill-card');
    cards.forEach(card => {
        // Aplicar estilos com !important para garantir que nada seja aplicado
        card.setAttribute('style', 'transform: none !important; transition: none !important; animation: none !important; opacity: 1 !important; perspective: none !important; box-shadow: none !important;');
        
        // Desativar quaisquer efeitos existentes
        const allElements = card.querySelectorAll('*');
        allElements.forEach(el => {
            el.setAttribute('style', el.getAttribute('style') + '; transform: none !important; transition: none !important; animation: none !important;');
        });
    });
});
// ==================== FUNÇÕES GLOBAIS ====================
window.toggleMenu = toggleMenu;
window.toggleChat = toggleChat;
window.setUserName = setUserName;
window.sendMessage = sendMessage;
window.toggleTheme = toggleTheme;

// Expor funções de debug globalmente
window.debugGitHubRepos = debugGitHubRepos;
window.clearSkillsCache = clearSkillsCache;

// Expor função do Snake Game globalmente
window.initSnakeGame = initSnakeGame;

// ==================== SISTEMA DE CHAT SIMPLIFICADO ====================
let currentUserName = '';

function setUserName() {
    const nameInput = document.getElementById('name-input');
    const name = nameInput.value.trim();
    
    if (!name) {
        alert('Por favor, digite seu nome!');
        return;
    }
    
    if (name.length < 2) {
        alert('O nome deve ter pelo menos 2 caracteres!');
        return;
    }
    
    currentUserName = name;
    
    // Esconder formulário de nome e mostrar chat
    document.getElementById('name-form').style.display = 'none';
    document.getElementById('chat-area').style.display = 'block';
    
    // Atualizar header do chat
    document.getElementById('chat-header').innerHTML = `🤖 Chat - ${currentUserName}`;
    
    // Mostrar mensagem de boas-vindas
    addSystemMessage(`Olá ${currentUserName}! Esta é uma versão offline do chat. Suas mensagens serão salvas localmente.`);
}

function addSystemMessage(message, type = 'info') {
    const chatMessages = document.getElementById('chat-messages');
    if (!chatMessages) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message system-message ${type}`;
    messageDiv.innerHTML = `
        <div class="message-content">
            <strong>Sistema:</strong> ${message}
        </div>
        <div class="message-time">${new Date().toLocaleTimeString()}</div>
    `;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function sendMessage() {
    if (!currentUserName) {
        alert('Por favor, defina seu nome primeiro!');
        return;
    }
    
    const inputField = document.getElementById('chat-input');
    const message = inputField.value.trim();
    
    if (!message) return;
    
    // Exibir mensagem
    const chatMessages = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message user-message';
    messageDiv.innerHTML = `
        <div class="message-content">
            <strong>Você:</strong> ${message}
        </div>
        <div class="message-time">${new Date().toLocaleTimeString()}</div>
    `;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    inputField.value = '';
}

function toggleChat() {
    let chatBody = document.getElementById("chat-body");
    let isVisible = chatBody.style.display === "block";
    
    chatBody.style.display = isVisible ? "none" : "block";
    
    if (!isVisible && !currentUserName) {
        setTimeout(() => {
            const nameInput = document.getElementById('name-input');
            if (nameInput) nameInput.focus();
        }, 100);
    }
    
    if (!isVisible && currentUserName) {
        setTimeout(() => {
            const chatInput = document.getElementById('chat-input');
            if (chatInput) chatInput.focus();
        }, 100);
    }
}

// Removido efeito parallax

// Detectar dispositivo móvel para desativar efeitos pesados
function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

if (isMobile()) {
    document.body.classList.add('mobile');
}

// Tema claro/escuro
function toggleTheme() {
    document.body.classList.toggle('light-mode');
    localStorage.setItem('theme', document.body.classList.contains('light-mode') ? 'light' : 'dark');
    updateThemeIcon();
}

function updateThemeIcon() {
    const themeIcon = document.getElementById('theme-icon');
    if (document.body.classList.contains('light-mode')) {
        themeIcon.className = 'fas fa-moon';
    } else {
        themeIcon.className = 'fas fa-sun';
    }
}

// Verificar preferência de tema salva
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'light') {
    document.body.classList.add('light-mode');
}

// Efeito de cards removido

// Registrar Service Worker para PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Determinar o caminho correto baseado na URL atual
        const isInSubdirectory = window.location.pathname.includes('/pages/');
        const swPath = isInSubdirectory ? '../assets/js/sw.js' : 'assets/js/sw.js';
        
        navigator.serviceWorker.register(swPath)
            .then(registration => {
                console.log('ServiceWorker registrado com sucesso:', registration.scope);
            })
            .catch(error => {
                console.log('Falha ao registrar o ServiceWorker:', error);
            });
    });
}

// Código para a página de projetos interativos
document.addEventListener('DOMContentLoaded', () => {
    // Verificar se estamos na página de projetos interativos
    if (!document.querySelector('.project-tabs')) return;

    console.log('Inicializando página de projetos interativos...');

    // Gestão das abas de projetos
    const tabBtns = document.querySelectorAll('.tab-btn');
    const projectContents = document.querySelectorAll('.project-content');

    console.log('Botões de abas encontrados:', tabBtns.length);
    console.log('Conteúdos de projetos encontrados:', projectContents.length);

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');
            console.log('Aba clicada:', tabId);
            
            tabBtns.forEach(b => b.classList.remove('active'));
            projectContents.forEach(content => content.classList.remove('active'));
            
            btn.classList.add('active');
            const targetTab = document.getElementById(`${tabId}-tab`);
            if (targetTab) {
                targetTab.classList.add('active');
                console.log('Aba ativada:', tabId);
            } else {
                console.error('Elemento não encontrado:', `${tabId}-tab`);
            }
        });
    });

    // Inicializar cada projeto
    console.log('Inicializando projetos...');
    initCalculator();
    initCodeEditor();
    console.log('Projetos inicializados!');
});

// ========== CALCULADORA AVANÇADA ==========
function initCalculator() {
    // Verificar se estamos na página da calculadora
    if (!document.querySelector('.calc-result')) return;
    
    const calculator = {
        displayValue: '0',
        firstOperand: null,
        waitingForSecondOperand: false,
        operator: null,
        memory: 0,
        history: []
    };

    // Elementos da DOM
    const displayOperation = document.querySelector('.calc-operation');
    const displayResult = document.querySelector('.calc-result');
    const standardKeypad = document.querySelector('.standard-keypad');
    const scientificKeypad = document.querySelector('.scientific-keypad');
    const standardModeBtn = document.getElementById('standard-mode');
    const scientificModeBtn = document.getElementById('scientific-mode');
    const historyBtn = document.getElementById('calc-history-btn');
    const historyPanel = document.querySelector('.calc-history');
    const historyList = document.querySelector('.history-list');
    const clearHistoryBtn = document.getElementById('clear-history');

    // Carregar histórico do localStorage
    loadHistory();

    // Configurar teclado científico
    setupScientificKeypad();

    // Event listeners para botões da calculadora
    if (standardKeypad) {
        standardKeypad.addEventListener('click', (event) => {
            if (!event.target.matches('button')) return;
            handleButtonClick(event.target);
        });
    }

    if (scientificKeypad) {
        scientificKeypad.addEventListener('click', (event) => {
            if (!event.target.matches('button')) return;
            handleButtonClick(event.target);
        });
    }

    // Event listeners para mudança de modo
    if (standardModeBtn) {
        standardModeBtn.addEventListener('click', () => {
            standardModeBtn.classList.add('active');
            scientificModeBtn.classList.remove('active');
            standardKeypad.classList.remove('hidden');
            scientificKeypad.classList.add('hidden');
        });
    }

    if (scientificModeBtn) {
        scientificModeBtn.addEventListener('click', () => {
            scientificModeBtn.classList.add('active');
            standardModeBtn.classList.remove('active');
            scientificKeypad.classList.remove('hidden');
            standardKeypad.classList.add('hidden');
        });
    }

    // Toggle histórico
    if (historyBtn) {
        historyBtn.addEventListener('click', () => {
            historyPanel.classList.toggle('hidden');
        });
    }

    // Limpar histórico
    if (clearHistoryBtn) {
        clearHistoryBtn.addEventListener('click', () => {
            calculator.history = [];
            saveHistory();
            renderHistory();
        });
    }

    // Suporte a teclado
    document.addEventListener('keydown', (event) => {
        if (!document.querySelector('.calculator')) return;
        
        const key = event.key;
        
        if (/[0-9]/.test(key)) {
            inputDigit(parseInt(key, 10));
            updateDisplay();
        } else if (key === '.') {
            inputDecimal();
            updateDisplay();
        } else if (key === '+' || key === '-' || key === '*' || key === '/') {
            handleOperator(key);
            updateDisplay();
        } else if (key === 'Enter' || key === '=') {
            handleEquals();
            updateDisplay();
        } else if (key === 'Backspace') {
            handleBackspace();
            updateDisplay();
        } else if (key === 'Escape' || key === 'c' || key === 'C') {
            resetCalculator();
            updateDisplay();
        }
    });

    // Funções da calculadora
    function handleButtonClick(button) {
        if (button.classList.contains('number')) {
            inputDigit(parseInt(button.textContent, 10));
            updateDisplay();
        } else if (button.classList.contains('decimal')) {
            inputDecimal();
            updateDisplay();
        } else if (button.classList.contains('operator')) {
            handleOperator(button.textContent);
            updateDisplay();
        } else if (button.classList.contains('equals')) {
            handleEquals();
            updateDisplay();
        } else if (button.classList.contains('clear')) {
            resetCalculator();
            updateDisplay();
        } else if (button.classList.contains('backspace')) {
            handleBackspace();
            updateDisplay();
        } else if (button.classList.contains('percent')) {
            handlePercent();
            updateDisplay();
        } else if (button.classList.contains('scientific')) {
            handleScientificOperation(button.getAttribute('data-operation'));
            updateDisplay();
        }
    }

    function inputDigit(digit) {
        const { displayValue, waitingForSecondOperand } = calculator;
        
        if (waitingForSecondOperand) {
            calculator.displayValue = String(digit);
            calculator.waitingForSecondOperand = false;
        } else {
            calculator.displayValue = displayValue === '0' ? String(digit) : displayValue + digit;
        }
    }

    function inputDecimal() {
        if (calculator.waitingForSecondOperand) {
            calculator.displayValue = '0.';
            calculator.waitingForSecondOperand = false;
            return;
        }
        
        if (!calculator.displayValue.includes('.')) {
            calculator.displayValue += '.';
        }
    }

    function handleOperator(nextOperator) {
        const { firstOperand, displayValue, operator } = calculator;
        const inputValue = parseFloat(displayValue);
        
        if (operator && calculator.waitingForSecondOperand) {
            calculator.operator = nextOperator;
            return;
        }
        
        if (firstOperand === null && !isNaN(inputValue)) {
            calculator.firstOperand = inputValue;
        } else if (operator) {
            const result = calculate(firstOperand, inputValue, operator);
            calculator.displayValue = `${parseFloat(result.toFixed(7))}`;
            calculator.firstOperand = result;
            
            // Adicionar ao histórico
            addToHistory(`${firstOperand} ${operator} ${inputValue}`, result);
        }
        
        calculator.waitingForSecondOperand = true;
        calculator.operator = nextOperator;
        
        displayOperation.textContent = `${calculator.firstOperand} ${calculator.operator}`;
    }

    function handleEquals() {
        const { firstOperand, displayValue, operator } = calculator;
        const inputValue = parseFloat(displayValue);
        
        if (operator && !calculator.waitingForSecondOperand) {
            const result = calculate(firstOperand, inputValue, operator);
            calculator.displayValue = `${parseFloat(result.toFixed(7))}`;
            calculator.firstOperand = result;
            
            // Adicionar ao histórico
            addToHistory(`${firstOperand} ${operator} ${inputValue}`, result);
            
            displayOperation.textContent = `${firstOperand} ${operator} ${inputValue} =`;
            calculator.operator = null;
        }
    }

    function handlePercent() {
        const { displayValue } = calculator;
        const percentValue = parseFloat(displayValue) / 100;
        calculator.displayValue = String(percentValue);
    }

    function handleBackspace() {
        if (calculator.displayValue.length > 1) {
            calculator.displayValue = calculator.displayValue.slice(0, -1);
        } else {
            calculator.displayValue = '0';
        }
    }

    function resetCalculator() {
        calculator.displayValue = '0';
        calculator.firstOperand = null;
        calculator.waitingForSecondOperand = false;
        calculator.operator = null;
        displayOperation.textContent = '';
    }

    function calculate(firstOperand, secondOperand, operator) {
        if (operator === '+') {
            return firstOperand + secondOperand;
        } else if (operator === '-') {
            return firstOperand - secondOperand;
        } else if (operator === '*') {
            return firstOperand * secondOperand;
        } else if (operator === '/') {
            return firstOperand / secondOperand;
        }
        
        return secondOperand;
    }

    function handleScientificOperation(operation) {
        const { displayValue } = calculator;
        const inputValue = parseFloat(displayValue);
        let result;
        
        switch (operation) {
            case 'sqrt':
                result = Math.sqrt(inputValue);
                break;
            case 'square':
                result = Math.pow(inputValue, 2);
                break;
            case 'sin':
                result = Math.sin(inputValue * Math.PI / 180); // Degrees
                break;
            case 'cos':
                result = Math.cos(inputValue * Math.PI / 180); // Degrees
                break;
            case 'tan':
                result = Math.tan(inputValue * Math.PI / 180); // Degrees
                break;
            case 'log':
                result = Math.log10(inputValue);
                break;
            case 'ln':
                result = Math.log(inputValue);
                break;
            case 'pi':
                result = Math.PI;
                break;
            default:
                return;
        }
        
        calculator.displayValue = `${parseFloat(result.toFixed(7))}`;
        calculator.firstOperand = result;
        calculator.waitingForSecondOperand = true;
        
        // Adicionar ao histórico
        addToHistory(`${operation}(${inputValue})`, result);
    }

    function updateDisplay() {
        if (displayResult) {
            displayResult.textContent = calculator.displayValue;
        }
    }

    function setupScientificKeypad() {
        if (!scientificKeypad) return;
        
        const scientificButtons = [
            { label: 'sin', op: 'sin' },
            { label: 'cos', op: 'cos' },
            { label: 'tan', op: 'tan' },
            { label: 'π', op: 'pi' },
            { label: '√', op: 'sqrt' },
            { label: 'x²', op: 'square' },
            { label: 'log', op: 'log' },
            { label: 'ln', op: 'ln' }
        ];
        
        scientificButtons.forEach(btn => {
            const button = document.createElement('button');
            button.textContent = btn.label;
            button.className = 'calc-key scientific';
            button.setAttribute('data-operation', btn.op);
            scientificKeypad.appendChild(button);
        });
        
        // Adicionar os botões padrão ao keypad científico
        const standardButtons = standardKeypad.querySelectorAll('button');
        standardButtons.forEach(btn => {
            const clone = btn.cloneNode(true);
            scientificKeypad.appendChild(clone);
        });
    }

    function addToHistory(expression, result) {
        calculator.history.push({ expression, result });
        saveHistory();
        renderHistory();
    }

    function saveHistory() {
        localStorage.setItem('calculatorHistory', JSON.stringify(calculator.history));
    }

    function loadHistory() {
        const savedHistory = localStorage.getItem('calculatorHistory');
        if (savedHistory) {
            calculator.history = JSON.parse(savedHistory);
            renderHistory();
        }
    }

    function renderHistory() {
        if (!historyList) return;
        
        historyList.innerHTML = '';
        
        calculator.history.slice().reverse().forEach(item => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            
            const expression = document.createElement('div');
            expression.className = 'history-expression';
            expression.textContent = item.expression;
            
            const result = document.createElement('div');
            result.className = 'history-result';
            result.textContent = item.result;
            
            historyItem.appendChild(expression);
            historyItem.appendChild(result);
            historyList.appendChild(historyItem);
        });
    }

    // Inicializar display
    updateDisplay();
}

// ========== JOGO SNAKE ULTRA MELHORADO ==========
function initSnakeGame() {
    console.log('🐍 Inicializando Snake Game Ultra!');
    
    // Verificar se estamos na página do jogo
    const canvas = document.getElementById('snake-canvas');
    if (!canvas) {
        return;
    }
    
    const ctx = canvas.getContext('2d');
    
    // Verificar se roundRect está disponível, senão implementar
    if (!CanvasRenderingContext2D.prototype.roundRect) {
        CanvasRenderingContext2D.prototype.roundRect = function(x, y, width, height, radius) {
            this.beginPath();
            this.moveTo(x + radius, y);
            this.lineTo(x + width - radius, y);
            this.quadraticCurveTo(x + width, y, x + width, y + radius);
            this.lineTo(x + width, y + height - radius);
            this.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
            this.lineTo(x + radius, y + height);
            this.quadraticCurveTo(x, y + height, x, y + height - radius);
            this.lineTo(x, y + radius);
            this.quadraticCurveTo(x, y, x + radius, y);
            this.closePath();
        };
    }
    
    const startBtn = document.getElementById('start-game');
    const pauseBtn = document.getElementById('pause-game');
    const restartBtn = document.getElementById('restart-game');
    const currentScoreElement = document.getElementById('current-score');
    const highScoreElement = document.getElementById('high-score');
    const finalScoreElement = document.querySelector('.final-score');
    const gameMessage = document.querySelector('.game-message');
    const difficultySlider = document.getElementById('difficulty');
    
    // Verificar se todos os elementos existem
    if (!startBtn || !pauseBtn || !restartBtn || !currentScoreElement || !highScoreElement || !finalScoreElement || !gameMessage || !difficultySlider) {
        console.error('❌ Elementos do Snake Game não encontrados');
        return;
    }
    
    // Carregar high score do localStorage
    let highScore = localStorage.getItem('snakeHighScore') || 0;
    highScoreElement.textContent = highScore;
    
    // ==================== VARIÁVEIS AVANÇADAS DO JOGO ====================
    const gridSize = 20;
    const gridWidth = canvas.width / gridSize;
    const gridHeight = canvas.height / gridSize;
    
    // Variáveis principais
    let snake = [];
    let food = {};
    let superFood = null; // Super comida especial
    let direction = 'right';
    let nextDirection = 'right';
    let score = 0;
    let kills = 0; // Contador de NPCs mortos
    let speed = 150;
    let gameInterval = null;
    let isPaused = false;
    let gameLevel = 1;
    let experience = 0;
    let expToNextLevel = 100;
    
    // Sistemas avançados
    let enemies = []; // Array de NPCs inimigos
    let powerUps = []; // Array de power-ups
    let activePowerUps = []; // Power-ups ativos no jogador
    let obstacles = [];
    let particles = [];
    let trailPositions = [];
    let explosions = [];
    let bulletParticles = [];
    let shakeIntensity = 0;
    let isInvulnerable = false;
    let freezeEnemies = false;
    let scoreMultiplier = 1;
    
    // Efeitos visuais
    let backgroundStars = [];
    let waveEffect = 0;
    let timeAlive = 0;
    let lastFoodTime = Date.now();
    
    // ==================== TIPOS DE INIMIGOS/NPCS ====================
    const ENEMY_TYPES = {
        CHASER: {
            color: '#ff4444',
            speed: 0.8,
            intelligence: 0.9,
            points: 50,
            size: 1,
            description: 'Persegue o jogador'
        },
        RANDOM: {
            color: '#44ff44',
            speed: 1.2,
            intelligence: 0.1,
            points: 25,
            size: 0.8,
            description: 'Movimento aleatório'
        },
        GUARD: {
            color: '#4444ff',
            speed: 0.5,
            intelligence: 0.3,
            points: 75,
            size: 1.2,
            description: 'Guarda uma área'
        },
        BOMBER: {
            color: '#ff44ff',
            speed: 1.0,
            intelligence: 0.6,
            points: 100,
            size: 1.1,
            description: 'Explode ao morrer'
        }
    };
    
    // ==================== TIPOS DE POWER-UPS ====================
    const POWERUP_TYPES = {
        SPEED_BOOST: {
            color: '#ffff00',
            duration: 5000,
            icon: '⚡',
            description: 'Velocidade +50%'
        },
        INVULNERABILITY: {
            color: '#00ffff',
            duration: 3000,
            icon: '🛡️',
            description: 'Invulnerabilidade'
        },
        SCORE_MULTIPLIER: {
            color: '#ff8800',
            duration: 8000,
            icon: '✨',
            description: 'Pontos x2'
        },
        FREEZE_ENEMIES: {
            color: '#0088ff',
            duration: 4000,
            icon: '❄️',
            description: 'Congela inimigos'
        },
        SHRINK: {
            color: '#8800ff',
            duration: 10000,
            icon: '🔥',
            description: 'Cobra pequena'
        }
    };
    
    // ==================== INICIALIZAÇÃO AVANÇADA ====================
    function initGame() {
        console.log('🚀 Iniciando novo jogo - Nível', gameLevel);
        
        snake = [
            { x: 10, y: 10 },
            { x: 9, y: 10 },
            { x: 8, y: 10 }
        ];
        
        score = 0;
        kills = 0;
        timeAlive = 0;
        currentScoreElement.textContent = score;
        
        direction = 'right';
        nextDirection = 'right';
        
        // Limpar arrays
        enemies = [];
        powerUps = [];
        activePowerUps = [];
        particles = [];
        trailPositions = [];
        explosions = [];
        bulletParticles = [];
        obstacles = [];
        
        // Resetar estados
        shakeIntensity = 0;
        isInvulnerable = false;
        freezeEnemies = false;
        scoreMultiplier = 1;
        waveEffect = 0;
        
        // Gerar elementos iniciais
        generateFood();
        generateBackgroundStars();
        spawnInitialEnemies();
        setDifficulty();
        
        if (difficultySlider.value > 1) {
            generateObstacles();
        }
        
        draw();
    }
    
    function generateBackgroundStars() {
        backgroundStars = [];
        for (let i = 0; i < 50; i++) {
            backgroundStars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 2 + 1,
                alpha: Math.random() * 0.5 + 0.2,
                twinkle: Math.random() * 0.02 + 0.01
            });
        }
    }
    
    function spawnInitialEnemies() {
        const baseEnemyCount = Math.min(2 + Math.floor(gameLevel / 2), 8);
        
        for (let i = 0; i < baseEnemyCount; i++) {
            spawnEnemy();
        }
    }
    
    function spawnEnemy(type = null) {
        if (!type) {
            const types = Object.keys(ENEMY_TYPES);
            type = types[Math.floor(Math.random() * types.length)];
        }
        
        let validPosition = false;
        let enemy;
        let attempts = 0;
        
        while (!validPosition && attempts < 50) {
            enemy = {
                x: Math.random() * gridWidth,
                y: Math.random() * gridHeight,
                type: type,
                lastMove: Date.now(),
                hp: ENEMY_TYPES[type].size * 2,
                maxHp: ENEMY_TYPES[type].size * 2,
                direction: Math.random() * Math.PI * 2,
                target: null,
                guardArea: { x: 0, y: 0, radius: 3 },
                lastShot: 0,
                id: Date.now() + Math.random()
            };
            
            // Verificar distância mínima da cobra
            const head = snake[0];
            const distance = Math.sqrt(Math.pow(enemy.x - head.x, 2) + Math.pow(enemy.y - head.y, 2));
            
            if (distance > 5) {
                validPosition = true;
                
                // Configurar área de guarda para tipo GUARD
                if (type === 'GUARD') {
                    enemy.guardArea = {
                        x: enemy.x,
                        y: enemy.y,
                        radius: 4 + Math.random() * 3
                    };
                }
            }
            attempts++;
        }
        
        if (validPosition) {
            enemies.push(enemy);
            console.log(`👾 Spawn: ${type} em (${enemy.x.toFixed(1)}, ${enemy.y.toFixed(1)})`);
        }
    }
    
    function spawnPowerUp() {
        if (powerUps.length >= 3) return; // Máximo 3 power-ups na tela
        
        const types = Object.keys(POWERUP_TYPES);
        const type = types[Math.floor(Math.random() * types.length)];
        
        let validPosition = false;
        let powerUp;
        let attempts = 0;
        
        while (!validPosition && attempts < 30) {
            powerUp = {
                x: Math.floor(Math.random() * gridWidth),
                y: Math.floor(Math.random() * gridHeight),
                type: type,
                spawnTime: Date.now(),
                pulse: 0
            };
            
            validPosition = true;
            
            // Verificar colisões
            for (let segment of snake) {
                if (powerUp.x === segment.x && powerUp.y === segment.y) {
                    validPosition = false;
                    break;
                }
            }
            
            if (powerUp.x === food.x && powerUp.y === food.y) {
                validPosition = false;
            }
            
            attempts++;
        }
        
        if (validPosition) {
            powerUps.push(powerUp);
            console.log(`⭐ Power-up spawned: ${type}`);
        }
    }
    
    function setDifficulty() {
        const difficulty = difficultySlider.value;
        switch(parseInt(difficulty)) {
            case 1: // Fácil
                speed = 180;
                break;
            case 2: // Médio
                speed = 130;
                break;
            case 3: // Difícil
                speed = 80;
                break;
        }
    }
    
    function startGame() {
        if (gameInterval) return;
        
        initGame();
        gameInterval = setInterval(gameLoop, speed);
        
        startBtn.classList.add('hidden');
        pauseBtn.classList.remove('hidden');
        gameMessage.classList.add('hidden');
        
        console.log('🎮 Jogo iniciado!');
    }
    
    function pauseGame() {
        if (!gameInterval) return;
        
        if (isPaused) {
            gameInterval = setInterval(gameLoop, speed);
            pauseBtn.textContent = 'Pausar';
        } else {
            clearInterval(gameInterval);
            gameInterval = null;
            pauseBtn.textContent = 'Continuar';
        }
        
        isPaused = !isPaused;
    }
    
    function gameOver() {
        clearInterval(gameInterval);
        gameInterval = null;
        
        console.log(`💀 Game Over! Score: ${score}, Kills: ${kills}, Level: ${gameLevel}`);
        
        // Efeito de explosão da cobra
        createExplosion(snake[0].x * gridSize + gridSize/2, snake[0].y * gridSize + gridSize/2, '#ff4444', 20);
        
        // Atualizar high score se necessário
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('snakeHighScore', highScore);
            highScoreElement.textContent = highScore;
            
            // Efeito especial para novo recorde
            for (let i = 0; i < 30; i++) {
                setTimeout(() => {
                    createFirework();
                }, i * 100);
            }
        }
        
        // Mostrar estatísticas finais
        const statsText = `Pontuação: ${score} | Kills: ${kills} | Nível: ${gameLevel} | Tempo: ${Math.floor(timeAlive/1000)}s`;
        finalScoreElement.textContent = statsText;
        gameMessage.classList.remove('hidden');
        pauseBtn.classList.add('hidden');
        startBtn.classList.remove('hidden');
    }
    
    // ==================== LOOP PRINCIPAL AVANÇADO ====================
    function gameLoop() {
        timeAlive += speed;
        
        // Atualizar movimento da cobra
        moveSnake();
        
        // Verificar colisões fatais
        if (checkCollision()) {
            if (!isInvulnerable) {
                shakeIntensity = 15;
                gameOver();
                return;
            }
        }
        
        // Verificar se comeu comida
        if (eatFood()) {
            const points = (superFood && eatSuperFood()) ? 50 : 10;
            score += points * scoreMultiplier;
            experience += points;
            currentScoreElement.textContent = score;
            
            // Efeitos visuais ao comer
            createFoodParticles(food.x * gridSize + gridSize/2, food.y * gridSize + gridSize/2);
            
            generateFood();
            
            // Chance de spawn de super comida
            if (Math.random() < 0.1) {
                generateSuperFood();
            }
            
            // Chance de spawn de power-up
            if (Math.random() < 0.15) {
                spawnPowerUp();
            }
            
            // Verificar level up
            checkLevelUp();
        } else {
            snake.pop(); // Remove cauda apenas se não comeu
        }
        
        // Verificar colisões com power-ups
        checkPowerUpCollisions();
        
        // Verificar colisões com inimigos
        checkEnemyCollisions();
        
        // Atualizar inimigos
        updateEnemies();
        
        // Atualizar power-ups ativos
        updateActivePowerUps();
        
        // Atualizar efeitos visuais
        updateParticles();
        updateExplosions();
        updateTrail();
        updateBackgroundStars();
        
        // Spawn de novos inimigos baseado no nível
        if (Math.random() < 0.005 + (gameLevel * 0.002)) {
            spawnEnemy();
        }
        
        // Limpar power-ups expirados
        powerUps = powerUps.filter(p => Date.now() - p.spawnTime < 15000);
        
        // Reduzir screen shake
        if (shakeIntensity > 0) {
            shakeIntensity *= 0.85;
            if (shakeIntensity < 0.1) shakeIntensity = 0;
        }
        
        // Atualizar wave effect
        waveEffect += 0.05;
        
        draw();
    }
    
    function checkLevelUp() {
        if (experience >= expToNextLevel) {
            gameLevel++;
            experience = 0;
            expToNextLevel = 100 + (gameLevel * 50);
            
            console.log(`🎉 Level Up! Agora no nível ${gameLevel}`);
            
            // Efeitos visuais de level up
            createLevelUpEffect();
            shakeIntensity = 8;
            
            // Benefícios do level up
            if (gameLevel % 2 === 0) {
                spawnEnemy(); // Mais inimigos a cada 2 níveis
            }
            
            if (gameLevel % 3 === 0) {
                generateObstacles(1); // Mais obstáculos a cada 3 níveis
            }
        }
    }
    
    function createLevelUpEffect() {
        // Criar partículas especiais de level up
        for (let i = 0; i < 20; i++) {
            particles.push({
                x: canvas.width / 2,
                y: canvas.height / 2,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                life: 2.0,
                color: `hsl(${Math.random() * 60 + 300}, 100%, 70%)`
            });
        }
    }
    
    function moveSnake() {
        direction = nextDirection;
        
        const head = { ...snake[0] };
        
        // Aplicar modificador de velocidade se ativo
        const speedMultiplier = activePowerUps.some(p => p.type === 'SPEED_BOOST') ? 1.5 : 1;
        
        switch (direction) {
            case 'up':
                head.y -= speedMultiplier;
                break;
            case 'down':
                head.y += speedMultiplier;
                break;
            case 'left':
                head.x -= speedMultiplier;
                break;
            case 'right':
                head.x += speedMultiplier;
                break;
        }
        
        // Teletransporte nas bordas
        if (head.x < 0) head.x = gridWidth - 1;
        if (head.x >= gridWidth) head.x = 0;
        if (head.y < 0) head.y = gridHeight - 1;
        if (head.y >= gridHeight) head.y = 0;
        
        snake.unshift(head);
        
        // Adicionar ao rastro
        trailPositions.push({
            x: head.x * gridSize + gridSize/2,
            y: head.y * gridSize + gridSize/2,
            life: 1.0
        });
    }
    
    function checkCollision() {
        const head = snake[0];
        
        // Verificar colisão com o próprio corpo (pular se tem power-up SHRINK)
        if (!activePowerUps.some(p => p.type === 'SHRINK')) {
            for (let i = 1; i < snake.length; i++) {
                if (head.x === snake[i].x && head.y === snake[i].y) {
                    return true;
                }
            }
        }
        
        // Verificar colisão com obstáculos
        for (let obs of obstacles) {
            if (Math.floor(head.x) === obs.x && Math.floor(head.y) === obs.y) {
                return true;
            }
        }
        
        return false;
    }
    
    function checkEnemyCollisions() {
        const head = snake[0];
        
        for (let i = enemies.length - 1; i >= 0; i--) {
            const enemy = enemies[i];
            const distance = Math.sqrt(
                Math.pow(head.x - enemy.x, 2) + Math.pow(head.y - enemy.y, 2)
            );
            
            if (distance < 1.2) {
                if (isInvulnerable) {
                    // Destruir inimigo se invulnerável
                    destroyEnemy(i);
                } else {
                    // Dano à cobra
                    if (!activePowerUps.some(p => p.type === 'INVULNERABILITY')) {
                        shakeIntensity = 10;
                        gameOver();
                        return;
                    }
                }
            }
            
            // Verificar se a cobra "ataca" o inimigo
            if (distance < 0.8) {
                destroyEnemy(i);
            }
        }
    }
    
    function destroyEnemy(index) {
        const enemy = enemies[index];
        const points = ENEMY_TYPES[enemy.type].points;
        
        score += points * scoreMultiplier;
        kills++;
        experience += Math.floor(points / 2);
        currentScoreElement.textContent = score;
        
        // Efeitos visuais da destruição
        createExplosion(
            enemy.x * gridSize + gridSize/2,
            enemy.y * gridSize + gridSize/2,
            ENEMY_TYPES[enemy.type].color,
            15
        );
        
        // Efeito especial para BOMBER
        if (enemy.type === 'BOMBER') {
            createBomberExplosion(enemy.x, enemy.y);
            shakeIntensity = 12;
        } else {
            shakeIntensity = 5;
        }
        
        console.log(`💥 Inimigo destruído: ${enemy.type} (+${points} pontos)`);
        enemies.splice(index, 1);
        
        // Chance de dropar power-up
        if (Math.random() < 0.3) {
            spawnPowerUp();
        }
    }
    
    function createBomberExplosion(x, y) {
        // Explosão grande que pode destruir outros inimigos próximos
        const blastRadius = 3;
        
        for (let i = enemies.length - 1; i >= 0; i--) {
            const other = enemies[i];
            const distance = Math.sqrt(Math.pow(other.x - x, 2) + Math.pow(other.y - y, 2));
            
            if (distance <= blastRadius) {
                destroyEnemy(i);
            }
        }
        
        // Efeito visual da explosão
        for (let i = 0; i < 25; i++) {
            particles.push({
                x: x * gridSize + gridSize/2,
                y: y * gridSize + gridSize/2,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                life: 1.5,
                color: `hsl(${Math.random() * 60 + 0}, 100%, ${Math.random() * 30 + 60}%)`
            });
        }
    }
    
    // ==================== SISTEMA DE POWER-UPS ====================
    function checkPowerUpCollisions() {
        const head = snake[0];
        
        for (let i = powerUps.length - 1; i >= 0; i--) {
            const powerUp = powerUps[i];
            
            if (Math.floor(head.x) === powerUp.x && Math.floor(head.y) === powerUp.y) {
                activatePowerUp(powerUp.type);
                powerUps.splice(i, 1);
                
                // Efeito visual
                createPowerUpEffect(powerUp.x * gridSize + gridSize/2, powerUp.y * gridSize + gridSize/2);
            }
        }
    }
    
    function activatePowerUp(type) {
        const powerUpData = POWERUP_TYPES[type];
        
        // Remover power-up do mesmo tipo se já ativo
        activePowerUps = activePowerUps.filter(p => p.type !== type);
        
        // Adicionar novo power-up
        const newPowerUp = {
            type: type,
            startTime: Date.now(),
            duration: powerUpData.duration
        };
        
        activePowerUps.push(newPowerUp);
        
        // Aplicar efeitos imediatos
        switch(type) {
            case 'INVULNERABILITY':
                isInvulnerable = true;
                break;
            case 'SCORE_MULTIPLIER':
                scoreMultiplier = 2;
                break;
            case 'FREEZE_ENEMIES':
                freezeEnemies = true;
                break;
        }
        
        console.log(`⭐ Power-up ativado: ${type} por ${powerUpData.duration}ms`);
        shakeIntensity = 3;
    }
    
    function updateActivePowerUps() {
        for (let i = activePowerUps.length - 1; i >= 0; i--) {
            const powerUp = activePowerUps[i];
            const elapsed = Date.now() - powerUp.startTime;
            
            if (elapsed >= powerUp.duration) {
                // Remover efeitos
                switch(powerUp.type) {
                    case 'INVULNERABILITY':
                        isInvulnerable = false;
                        break;
                    case 'SCORE_MULTIPLIER':
                        scoreMultiplier = 1;
                        break;
                    case 'FREEZE_ENEMIES':
                        freezeEnemies = false;
                        break;
                }
                
                activePowerUps.splice(i, 1);
                console.log(`⏰ Power-up expirado: ${powerUp.type}`);
            }
        }
    }
    
    function createPowerUpEffect(x, y) {
        for (let i = 0; i < 15; i++) {
            particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 6,
                life: 1.2,
                color: `hsl(${Math.random() * 360}, 80%, 70%)`
            });
        }
    }
    
    // ==================== SISTEMA DE INIMIGOS INTELIGENTES ====================
    function updateEnemies() {
        if (freezeEnemies) return;
        
        for (let enemy of enemies) {
            if (Date.now() - enemy.lastMove < 200) continue;
            
            enemy.lastMove = Date.now();
            
            switch(enemy.type) {
                case 'CHASER':
                    updateChaserEnemy(enemy);
                    break;
                case 'RANDOM':
                    updateRandomEnemy(enemy);
                    break;
                case 'GUARD':
                    updateGuardEnemy(enemy);
                    break;
                case 'BOMBER':
                    updateBomberEnemy(enemy);
                    break;
            }
            
            // Manter inimigos dentro dos limites
            enemy.x = Math.max(0, Math.min(gridWidth - 1, enemy.x));
            enemy.y = Math.max(0, Math.min(gridHeight - 1, enemy.y));
        }
    }
    
    function updateChaserEnemy(enemy) {
        const head = snake[0];
        const dx = head.x - enemy.x;
        const dy = head.y - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            const speed = ENEMY_TYPES.CHASER.speed;
            const intelligence = ENEMY_TYPES.CHASER.intelligence;
            
            // Movimento inteligente em direção ao jogador
            enemy.x += (dx / distance) * speed * intelligence;
            enemy.y += (dy / distance) * speed * intelligence;
            
            // Adicionar um pouco de aleatoriedade
            enemy.x += (Math.random() - 0.5) * (1 - intelligence);
            enemy.y += (Math.random() - 0.5) * (1 - intelligence);
        }
    }
    
    function updateRandomEnemy(enemy) {
        const speed = ENEMY_TYPES.RANDOM.speed;
        
        // Movimento completamente aleatório
        enemy.direction += (Math.random() - 0.5) * 0.5;
        enemy.x += Math.cos(enemy.direction) * speed;
        enemy.y += Math.sin(enemy.direction) * speed;
    }
    
    function updateGuardEnemy(enemy) {
        const speed = ENEMY_TYPES.GUARD.speed;
        const head = snake[0];
        
        // Calcular distância do centro da área de guarda
        const guardCenterDist = Math.sqrt(
            Math.pow(enemy.x - enemy.guardArea.x, 2) +
            Math.pow(enemy.y - enemy.guardArea.y, 2)
        );
        
        // Calcular distância do jogador
        const playerDist = Math.sqrt(
            Math.pow(enemy.x - head.x, 2) +
            Math.pow(enemy.y - head.y, 2)
        );
        
        if (playerDist < enemy.guardArea.radius && guardCenterDist < enemy.guardArea.radius) {
            // Atacar jogador se estiver na área
            const dx = head.x - enemy.x;
            const dy = head.y - enemy.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 0) {
                enemy.x += (dx / distance) * speed * 0.7;
                enemy.y += (dy / distance) * speed * 0.7;
            }
        } else if (guardCenterDist > enemy.guardArea.radius) {
            // Retornar para área de guarda
            const dx = enemy.guardArea.x - enemy.x;
            const dy = enemy.guardArea.y - enemy.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 0) {
                enemy.x += (dx / distance) * speed;
                enemy.y += (dy / distance) * speed;
            }
        } else {
            // Patrulhar área
            enemy.direction += (Math.random() - 0.5) * 0.3;
            enemy.x += Math.cos(enemy.direction) * speed * 0.5;
            enemy.y += Math.sin(enemy.direction) * speed * 0.5;
        }
    }
    
    function updateBomberEnemy(enemy) {
        const head = snake[0];
        const dx = head.x - enemy.x;
        const dy = head.y - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 5) {
            // Aproximar do jogador quando está perto
            const speed = ENEMY_TYPES.BOMBER.speed * 1.5;
            
            if (distance > 0) {
                enemy.x += (dx / distance) * speed;
                enemy.y += (dy / distance) * speed;
            }
        } else {
            // Movimento padrão
            enemy.direction += (Math.random() - 0.5) * 0.4;
            enemy.x += Math.cos(enemy.direction) * ENEMY_TYPES.BOMBER.speed;
            enemy.y += Math.sin(enemy.direction) * ENEMY_TYPES.BOMBER.speed;
        }
    }
    
    
    // ==================== SISTEMA DE COMIDA AVANÇADO ====================
    function eatFood() {
        const head = snake[0];
        
        if (Math.floor(head.x) === food.x && Math.floor(head.y) === food.y) {
            return true;
        }
        
        return false;
    }
    
    function eatSuperFood() {
        if (!superFood) return false;
        
        const head = snake[0];
        
        if (Math.floor(head.x) === superFood.x && Math.floor(head.y) === superFood.y) {
            superFood = null;
            return true;
        }
        
        return false;
    }
    
    function generateFood() {
        let validPosition = false;
        let newFood;
        let attempts = 0;
        
        while (!validPosition && attempts < 50) {
            newFood = {
                x: Math.floor(Math.random() * gridWidth),
                y: Math.floor(Math.random() * gridHeight)
            };
            
            validPosition = true;
            
            // Verificar colisões
            for (let segment of snake) {
                if (newFood.x === Math.floor(segment.x) && newFood.y === Math.floor(segment.y)) {
                    validPosition = false;
                    break;
                }
            }
            
            for (let obs of obstacles) {
                if (newFood.x === obs.x && newFood.y === obs.y) {
                    validPosition = false;
                    break;
                }
            }
            
            for (let enemy of enemies) {
                if (newFood.x === Math.floor(enemy.x) && newFood.y === Math.floor(enemy.y)) {
                    validPosition = false;
                    break;
                }
            }
            
            attempts++;
        }
        
        if (validPosition) {
            food = newFood;
        }
        
        lastFoodTime = Date.now();
    }
    
    function generateSuperFood() {
        if (superFood) return; // Só uma super comida por vez
        
        let validPosition = false;
        let newSuperFood;
        let attempts = 0;
        
        while (!validPosition && attempts < 30) {
            newSuperFood = {
                x: Math.floor(Math.random() * gridWidth),
                y: Math.floor(Math.random() * gridHeight),
                spawnTime: Date.now()
            };
            
            validPosition = true;
            
            // Verificar colisões (mesma lógica da comida normal)
            for (let segment of snake) {
                if (newSuperFood.x === Math.floor(segment.x) && newSuperFood.y === Math.floor(segment.y)) {
                    validPosition = false;
                    break;
                }
            }
            
            if (newSuperFood.x === food.x && newSuperFood.y === food.y) {
                validPosition = false;
            }
            
            attempts++;
        }
        
        if (validPosition) {
            superFood = newSuperFood;
            console.log('🌟 Super comida gerada!');
        }
    }
    
    function generateObstacles(count = 3) {
        for (let i = 0; i < count; i++) {
            let validPosition = false;
            let newObstacle;
            let attempts = 0;
            
            while (!validPosition && attempts < 30) {
                newObstacle = {
                    x: Math.floor(Math.random() * gridWidth),
                    y: Math.floor(Math.random() * gridHeight)
                };
                
                validPosition = true;
                
                // Verificar colisões
                for (let segment of snake) {
                    if (newObstacle.x === Math.floor(segment.x) && newObstacle.y === Math.floor(segment.y)) {
                        validPosition = false;
                        break;
                    }
                }
                
                if (newObstacle.x === food.x && newObstacle.y === food.y) {
                    validPosition = false;
                }
                
                for (let obs of obstacles) {
                    if (newObstacle.x === obs.x && newObstacle.y === obs.y) {
                        validPosition = false;
                        break;
                    }
                }
                
                attempts++;
            }
            
            if (validPosition) {
                obstacles.push(newObstacle);
            }
        }
    }
    
    // ==================== SISTEMA DE PARTÍCULAS E EFEITOS ====================
    function createFoodParticles(x, y) {
        for (let i = 0; i < 12; i++) {
            particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 5,
                vy: (Math.random() - 0.5) * 5,
                life: 1.0,
                color: `hsl(${Math.random() * 60 + 0}, 100%, ${Math.random() * 30 + 60}%)`
            });
        }
    }
    
    function createExplosion(x, y, color, count = 10) {
        explosions.push({
            x: x,
            y: y,
            particles: [],
            startTime: Date.now()
        });
        
        const explosion = explosions[explosions.length - 1];
        
        for (let i = 0; i < count; i++) {
            explosion.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                life: 1.5,
                color: color,
                size: Math.random() * 4 + 2
            });
        }
    }
    
    function createFirework() {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        
        createExplosion(x, y, `hsl(${Math.random() * 360}, 80%, 60%)`, 20);
    }
    
    function updateParticles() {
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.02;
            p.vy += 0.1; // Gravidade
            p.vx *= 0.98; // Resistência do ar
            
            if (p.life <= 0) {
                particles.splice(i, 1);
            }
        }
    }
    
    function updateExplosions() {
        for (let i = explosions.length - 1; i >= 0; i--) {
            const explosion = explosions[i];
            
            for (let j = explosion.particles.length - 1; j >= 0; j--) {
                const p = explosion.particles[j];
                p.x += p.vx;
                p.y += p.vy;
                p.life -= 0.03;
                p.vy += 0.15;
                p.vx *= 0.95;
                p.size *= 0.98;
                
                if (p.life <= 0) {
                    explosion.particles.splice(j, 1);
                }
            }
            
            if (explosion.particles.length === 0) {
                explosions.splice(i, 1);
            }
        }
    }
    
    function updateTrail() {
        for (let i = trailPositions.length - 1; i >= 0; i--) {
            trailPositions[i].life -= 0.06;
            if (trailPositions[i].life <= 0) {
                trailPositions.splice(i, 1);
            }
        }
        
        if (trailPositions.length > 20) {
            trailPositions.splice(0, trailPositions.length - 20);
        }
    }
    
    function updateBackgroundStars() {
        backgroundStars.forEach(star => {
            star.alpha += star.twinkle * (Math.random() > 0.5 ? 1 : -1);
            star.alpha = Math.max(0.1, Math.min(0.8, star.alpha));
        });
    }
    
    
    // ==================== SISTEMA DE RENDERIZAÇÃO AVANÇADA ====================
    function draw() {
        // Aplicar screen shake se ativo
        ctx.save();
        if (shakeIntensity > 0) {
            const shakeX = (Math.random() - 0.5) * shakeIntensity;
            const shakeY = (Math.random() - 0.5) * shakeIntensity;
            ctx.translate(shakeX, shakeY);
        }
        
        // Fundo dinâmico com gradiente animado
        drawAnimatedBackground();
        
        // Desenhar elementos do jogo em ordem de profundidade
        drawGrid();
        drawBackgroundStars();
        drawTrail();
        drawObstacles();
        drawFood();
        drawSuperFood();
        drawPowerUps();
        drawSnake();
        drawEnemies();
        drawParticles();
        drawExplosions();
        drawUI();
        drawPowerUpIndicators();
        
        ctx.restore();
    }
    
    function drawAnimatedBackground() {
        // Gradiente animado baseado no nível e estado do jogo
        const time = Date.now() * 0.001;
        const hue1 = (200 + Math.sin(time * 0.3) * 30) % 360;
        const hue2 = (260 + Math.sin(time * 0.5) * 40) % 360;
        
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, `hsl(${hue1}, 40%, 8%)`);
        gradient.addColorStop(0.5, `hsl(${(hue1 + hue2) / 2}, 35%, 12%)`);
        gradient.addColorStop(1, `hsl(${hue2}, 45%, 10%)`);
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Efeito de onda sutil
        if (waveEffect > 0) {
            ctx.save();
            ctx.globalAlpha = 0.1;
            const waveGradient = ctx.createRadialGradient(
                canvas.width/2, canvas.height/2, 0,
                canvas.width/2, canvas.height/2, Math.max(canvas.width, canvas.height)
            );
            waveGradient.addColorStop(0, '#ffffff');
            waveGradient.addColorStop(1, 'transparent');
            ctx.fillStyle = waveGradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.restore();
        }
    }
    
    function drawGrid() {
        // Grid dinâmico que responde ao nível
        const alpha = 0.03 + (gameLevel * 0.01);
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.lineWidth = 0.5;
        
        for (let x = 0; x <= canvas.width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }
        for (let y = 0; y <= canvas.height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }
    }
    
    function drawBackgroundStars() {
        backgroundStars.forEach(star => {
            ctx.save();
            ctx.globalAlpha = star.alpha;
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });
    }
    
    function drawTrail() {
        if (trailPositions.length < 2) return;
        
        ctx.save();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        for (let i = 1; i < trailPositions.length; i++) {
            const current = trailPositions[i];
            const previous = trailPositions[i - 1];
            const alpha = current.life * 0.4;
            
            ctx.globalAlpha = alpha;
            ctx.strokeStyle = isInvulnerable ? '#00ffff' : '#4CAF50';
            ctx.lineWidth = 4 * current.life;
            
            ctx.beginPath();
            ctx.moveTo(previous.x, previous.y);
            ctx.lineTo(current.x, current.y);
            ctx.stroke();
        }
        
        ctx.restore();
    }
    
    function drawSnake() {
        const time = Date.now() * 0.01;
        const shrinkActive = activePowerUps.some(p => p.type === 'SHRINK');
        const sizeMultiplier = shrinkActive ? 0.7 : 1;
        
        for (let i = 0; i < snake.length; i++) {
            const segment = snake[i];
            const x = segment.x * gridSize;
            const y = segment.y * gridSize;
            const size = (gridSize - 3) * sizeMultiplier;
            
            if (i === 0) {
                // Cabeça da cobra com efeitos especiais
                drawSnakeHead(x, y, size, time);
            } else {
                // Corpo da cobra
                drawSnakeBody(x, y, size, i, time);
            }
        }
    }
    
    function drawSnakeHead(x, y, size, time) {
        // Cor e efeitos baseados nos power-ups ativos
        let headColor = '#66BB6A';
        let glowColor = '#4CAF50';
        
        if (isInvulnerable) {
            headColor = '#00FFFF';
            glowColor = '#00DDDD';
        } else if (activePowerUps.some(p => p.type === 'SPEED_BOOST')) {
            headColor = '#FFFF00';
            glowColor = '#FFDD00';
        }
        
        // Gradiente radial animado
        const headGradient = ctx.createRadialGradient(
            x + size/2, y + size/2, 0,
            x + size/2, y + size/2, size/2
        );
        headGradient.addColorStop(0, headColor);
        headGradient.addColorStop(0.7, glowColor);
        headGradient.addColorStop(1, '#2E7D32');
        
        ctx.fillStyle = headGradient;
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = isInvulnerable ? 15 : 8;
        
        // Pulsação suave
        const pulse = 1 + Math.sin(time * 0.2) * 0.1;
        
        ctx.beginPath();
        ctx.roundRect(x + 1.5, y + 1.5, size * pulse, size * pulse, 6);
        ctx.fill();
        
        // Olhos animados
        drawSnakeEyes(x, y, size, time);
        
        ctx.shadowBlur = 0;
    }
    
    function drawSnakeEyes(x, y, size, time) {
        // Olhos que piscam ocasionalmente
        const blink = Math.sin(time * 0.05) > 0.95 ? 0.3 : 1;
        
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(x + 6, y + 6, 2 * blink, 0, Math.PI * 2);
        ctx.arc(x + 14, y + 6, 2 * blink, 0, Math.PI * 2);
        ctx.fill();
        
        if (blink > 0.5) {
            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.arc(x + 6, y + 6, 1, 0, Math.PI * 2);
            ctx.arc(x + 14, y + 6, 1, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    function drawSnakeBody(x, y, size, index, time) {
        const bodyAlpha = Math.max(0.4, 1 - (index / snake.length) * 0.6);
        const colorShift = activePowerUps.some(p => p.type === 'SCORE_MULTIPLIER') ? 30 : 0;
        
        const bodyGradient = ctx.createLinearGradient(x, y, x + size, y + size);
        bodyGradient.addColorStop(0, `hsla(${90 + colorShift}, 60%, 60%, ${bodyAlpha})`);
        bodyGradient.addColorStop(1, `hsla(${120 + colorShift}, 50%, 50%, ${bodyAlpha})`);
        
        ctx.fillStyle = bodyGradient;
        ctx.shadowColor = '#8BC34A';
        ctx.shadowBlur = 4;
        
        // Animação sutil de respiração
        const breathe = 1 + Math.sin(time * 0.1 + index * 0.2) * 0.05;
        
        ctx.beginPath();
        ctx.roundRect(x + 1.5, y + 1.5, size * breathe, size * breathe, 4);
        ctx.fill();
    }
    
    function drawFood() {
        const time = Date.now() * 0.005;
        const pulse = 0.9 + Math.sin(time) * 0.15;
        const foodSize = (gridSize - 3) * pulse;
        const foodX = food.x * gridSize + (gridSize - foodSize) / 2;
        const foodY = food.y * gridSize + (gridSize - foodSize) / 2;
        
        // Gradiente radial pulsante
        const foodGradient = ctx.createRadialGradient(
            foodX + foodSize/2, foodY + foodSize/2, 0,
            foodX + foodSize/2, foodY + foodSize/2, foodSize/2
        );
        foodGradient.addColorStop(0, '#FF6B6B');
        foodGradient.addColorStop(0.7, '#FF5252');
        foodGradient.addColorStop(1, '#D32F2F');
        
        ctx.fillStyle = foodGradient;
        ctx.shadowColor = '#FF5252';
        ctx.shadowBlur = 10 + Math.sin(time * 2) * 3;
        
        ctx.beginPath();
        ctx.arc(foodX + foodSize/2, foodY + foodSize/2, foodSize/2, 0, Math.PI * 2);
        ctx.fill();
        
        // Brilho adicional
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.arc(foodX + foodSize/3, foodY + foodSize/3, foodSize/6, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.shadowBlur = 0;
    }
    
    function drawSuperFood() {
        if (!superFood) return;
        
        const time = Date.now() * 0.008;
        const age = Date.now() - superFood.spawnTime;
        const maxAge = 10000; // 10 segundos
        
        // Piscar quando está prestes a expirar
        if (age > maxAge * 0.7) {
            const flashSpeed = Math.max(0.1, 1 - (age / maxAge));
            if (Math.sin(time * 15) < flashSpeed - 0.5) return;
        }
        
        const pulse = 1.2 + Math.sin(time * 1.5) * 0.3;
        const foodSize = (gridSize - 2) * pulse;
        const foodX = superFood.x * gridSize + (gridSize - foodSize) / 2;
        const foodY = superFood.y * gridSize + (gridSize - foodSize) / 2;
        
        // Gradiente arco-íris rotativo
        const angle = time * 2;
        const colors = [
            `hsl(${(angle * 60) % 360}, 80%, 60%)`,
            `hsl(${(angle * 60 + 120) % 360}, 80%, 60%)`,
            `hsl(${(angle * 60 + 240) % 360}, 80%, 60%)`
        ];
        
        ctx.save();
        ctx.shadowColor = colors[0];
        ctx.shadowBlur = 20;
        
        // Estrela de super comida
        drawStar(foodX + foodSize/2, foodY + foodSize/2, foodSize/2, foodSize/4, 6, angle);
        
        ctx.restore();
    }
    
    function drawStar(x, y, outerRadius, innerRadius, points, rotation = 0) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation);
        
        ctx.beginPath();
        for (let i = 0; i < points * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const angle = (i * Math.PI) / points;
            const px = Math.cos(angle) * radius;
            const py = Math.sin(angle) * radius;
            
            if (i === 0) {
                ctx.moveTo(px, py);
            } else {
                ctx.lineTo(px, py);
            }
        }
        ctx.closePath();
        
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, outerRadius);
        gradient.addColorStop(0, '#FFD700');
        gradient.addColorStop(0.5, '#FFA500');
        gradient.addColorStop(1, '#FF6B00');
        
        ctx.fillStyle = gradient;
        ctx.fill();
        
        ctx.restore();
    }
    
    
    function drawPowerUps() {
        powerUps.forEach(powerUp => {
            const time = Date.now() * 0.01;
            const age = Date.now() - powerUp.spawnTime;
            const maxAge = 15000;
            
            // Piscar quando está expirando
            if (age > maxAge * 0.7) {
                if (Math.sin(time * 10) < 0) return;
            }
            
            const x = powerUp.x * gridSize;
            const y = powerUp.y * gridSize;
            const pulse = 1 + Math.sin(time + powerUp.x + powerUp.y) * 0.2;
            const size = gridSize * 0.8 * pulse;
            
            const powerUpData = POWERUP_TYPES[powerUp.type];
            
            ctx.save();
            ctx.shadowColor = powerUpData.color;
            ctx.shadowBlur = 15;
            
            // Círculo base
            ctx.fillStyle = powerUpData.color;
            ctx.beginPath();
            ctx.arc(x + gridSize/2, y + gridSize/2, size/2, 0, Math.PI * 2);
            ctx.fill();
            
            // Ícone interno
            ctx.fillStyle = '#000000';
            ctx.font = `${size * 0.5}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(powerUpData.icon, x + gridSize/2, y + gridSize/2);
            
            ctx.restore();
        });
    }
    
    function drawEnemies() {
        enemies.forEach(enemy => {
            const x = enemy.x * gridSize;
            const y = enemy.y * gridSize;
            const enemyData = ENEMY_TYPES[enemy.type];
            const size = gridSize * enemyData.size;
            const time = Date.now() * 0.01;
            
            // Congelar animação se power-up ativo
            const animationMultiplier = freezeEnemies ? 0 : 1;
            const pulse = 1 + Math.sin(time * 2 + enemy.id) * 0.1 * animationMultiplier;
            
            ctx.save();
            
            // Efeito de congelamento
            if (freezeEnemies) {
                ctx.shadowColor = '#00AAFF';
                ctx.shadowBlur = 8;
            }
            
            // Corpo do inimigo
            const gradient = ctx.createRadialGradient(
                x + size/2, y + size/2, 0,
                x + size/2, y + size/2, size/2
            );
            gradient.addColorStop(0, enemyData.color);
            gradient.addColorStop(1, darkenColor(enemyData.color, 0.3));
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            
            // Formas diferentes para cada tipo
            switch(enemy.type) {
                case 'CHASER':
                    // Formato triangular apontando para o jogador
                    const head = snake[0];
                    const angle = Math.atan2(head.y - enemy.y, head.x - enemy.x);
                    drawTriangle(x + size/2, y + size/2, size/2 * pulse, angle);
                    break;
                case 'RANDOM':
                    // Círculo simples
                    ctx.arc(x + size/2, y + size/2, size/2 * pulse, 0, Math.PI * 2);
                    break;
                case 'GUARD':
                    // Quadrado rotacionado
                    drawRotatedSquare(x + size/2, y + size/2, size * pulse, time * animationMultiplier);
                    break;
                case 'BOMBER':
                    // Formato especial com espinhos
                    drawSpikeBall(x + size/2, y + size/2, size/2 * pulse, time * animationMultiplier);
                    break;
            }
            
            ctx.fill();
            
            // Barra de vida para inimigos com mais HP
            if (enemy.hp < enemy.maxHp) {
                drawHealthBar(x, y - 5, size, enemy.hp, enemy.maxHp);
            }
            
            // Indicador especial para GUARD (área de patrulha)
            if (enemy.type === 'GUARD') {
                drawGuardArea(enemy);
            }
            
            ctx.restore();
        });
    }
    
    function drawTriangle(x, y, radius, angle) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        
        ctx.beginPath();
        ctx.moveTo(radius, 0);
        ctx.lineTo(-radius/2, -radius/2);
        ctx.lineTo(-radius/2, radius/2);
        ctx.closePath();
        
        ctx.restore();
    }
    
    function drawRotatedSquare(x, y, size, rotation) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation);
        
        ctx.beginPath();
        ctx.rect(-size/2, -size/2, size, size);
        
        ctx.restore();
    }
    
    function drawSpikeBall(x, y, radius, time) {
        const spikes = 8;
        
        ctx.beginPath();
        for (let i = 0; i < spikes; i++) {
            const angle = (i / spikes) * Math.PI * 2 + time;
            const spikeLength = radius * 0.3;
            
            const innerX = x + Math.cos(angle) * radius;
            const innerY = y + Math.sin(angle) * radius;
            const outerX = x + Math.cos(angle) * (radius + spikeLength);
            const outerY = y + Math.sin(angle) * (radius + spikeLength);
            
            if (i === 0) {
                ctx.moveTo(innerX, innerY);
            } else {
                ctx.lineTo(innerX, innerY);
            }
            ctx.lineTo(outerX, outerY);
        }
        ctx.closePath();
    }
    
    function drawHealthBar(x, y, width, currentHp, maxHp) {
        const barHeight = 4;
        const percentage = currentHp / maxHp;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(x, y, width, barHeight);
        
        ctx.fillStyle = percentage > 0.5 ? '#4CAF50' : percentage > 0.25 ? '#FFC107' : '#F44336';
        ctx.fillRect(x, y, width * percentage, barHeight);
    }
    
    function drawGuardArea(enemy) {
        const centerX = enemy.guardArea.x * gridSize + gridSize/2;
        const centerY = enemy.guardArea.y * gridSize + gridSize/2;
        const radius = enemy.guardArea.radius * gridSize;
        
        ctx.save();
        ctx.globalAlpha = 0.1;
        ctx.strokeStyle = ENEMY_TYPES.GUARD.color;
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.restore();
    }
    
    function drawObstacles() {
        obstacles.forEach(obs => {
            const obsX = obs.x * gridSize;
            const obsY = obs.y * gridSize;
            const obsSize = gridSize - 2;
            
            ctx.shadowColor = '#455A64';
            ctx.shadowBlur = 6;
            
            const obsGradient = ctx.createLinearGradient(obsX, obsY, obsX + obsSize, obsY + obsSize);
            obsGradient.addColorStop(0, '#78909C');
            obsGradient.addColorStop(0.5, '#607D8B');
            obsGradient.addColorStop(1, '#455A64');
            
            ctx.fillStyle = obsGradient;
            ctx.beginPath();
            ctx.roundRect(obsX + 1, obsY + 1, obsSize, obsSize, 3);
            ctx.fill();
            
            // Highlight 3D
            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.beginPath();
            ctx.roundRect(obsX + 2, obsY + 2, obsSize - 4, 3, 2);
            ctx.fill();
        });
        
        ctx.shadowBlur = 0;
    }
    
    function drawParticles() {
        particles.forEach(p => {
            ctx.save();
            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 3 * p.life, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });
    }
    
    function drawExplosions() {
        explosions.forEach(explosion => {
            explosion.particles.forEach(p => {
                ctx.save();
                ctx.globalAlpha = p.life;
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            });
        });
    }
    
    function drawUI() {
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(10, 10, 200, 80);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = '14px Arial';
        ctx.textAlign = 'left';
        
        ctx.fillText(`Nível: ${gameLevel}`, 20, 30);
        ctx.fillText(`Kills: ${kills}`, 20, 50);
        ctx.fillText(`XP: ${experience}/${expToNextLevel}`, 20, 70);
        
        // Barra de experiência
        const xpBarWidth = 150;
        const xpPercentage = experience / expToNextLevel;
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(20, 75, xpBarWidth, 10);
        
        ctx.fillStyle = '#4CAF50';
        ctx.fillRect(20, 75, xpBarWidth * xpPercentage, 10);
        
        ctx.restore();
    }
    
    function drawPowerUpIndicators() {
        if (activePowerUps.length === 0) return;
        
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(canvas.width - 250, 10, 240, 30 + (activePowerUps.length * 25));
        
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('Power-ups Ativos:', canvas.width - 240, 30);
        
        activePowerUps.forEach((powerUp, index) => {
            const remaining = powerUp.duration - (Date.now() - powerUp.startTime);
            const seconds = Math.ceil(remaining / 1000);
            const powerUpData = POWERUP_TYPES[powerUp.type];
            
            ctx.fillStyle = powerUpData.color;
            ctx.fillText(`${powerUpData.icon} ${powerUpData.description} (${seconds}s)`, 
                        canvas.width - 240, 50 + (index * 25));
        });
        
        ctx.restore();
    }
    
    // Funções utilitárias
    function darkenColor(color, factor) {
        if (color.startsWith('#')) {
            const r = parseInt(color.slice(1, 3), 16);
            const g = parseInt(color.slice(3, 5), 16);
            const b = parseInt(color.slice(5, 7), 16);
            
            return `rgb(${Math.floor(r * factor)}, ${Math.floor(g * factor)}, ${Math.floor(b * factor)})`;
        }
        return color;
    }
    
    // ==================== CONTROLES E EVENT LISTENERS ====================
    document.addEventListener('keydown', (event) => {
        if (!document.getElementById('snake-game') || document.getElementById('snake-game').style.display === 'none') return;
        
        const key = event.key.toLowerCase();
        const arrowControls = { arrowup: 'up', arrowdown: 'down', arrowleft: 'left', arrowright: 'right' };
        const wasdControls = { w: 'up', s: 'down', a: 'left', d: 'right' };
        
        const useWasd = document.getElementById('wasd') && document.getElementById('wasd').checked;
        const controls = useWasd ? wasdControls : arrowControls;
        
        const newDirection = controls[key];
        
        if (!newDirection) return;
        
        // Evitar direção oposta
        if (
            (direction === 'up' && newDirection === 'down') ||
            (direction === 'down' && newDirection === 'up') ||
            (direction === 'left' && newDirection === 'right') ||
            (direction === 'right' && newDirection === 'left')
        ) {
            return;
        }
        
        nextDirection = newDirection;
    });
    
    // Botões de controle
    if (startBtn) {
        startBtn.addEventListener('click', startGame);
    }
    
    if (pauseBtn) {
        pauseBtn.addEventListener('click', pauseGame);
    }
    
    if (restartBtn) {
        restartBtn.addEventListener('click', startGame);
    }
    
    // Desenhar o canvas inicial
    draw();
    
    console.log('🎮 Snake Game Ultra inicializado com sucesso!');
}

// ========== EDITOR DE CÓDIGO ==========
function initCodeEditor() {
    // Verificar se estamos na página do editor
    const codeInput = document.getElementById('code-input');
    if (!codeInput) return;
    
    const highlightedCode = document.getElementById('highlighted-code');
    const consoleOutput = document.getElementById('console-output');
    const runCodeBtn = document.getElementById('run-code');
    const saveSnippetBtn = document.getElementById('save-snippet');
    const clearEditorBtn = document.getElementById('clear-editor');
    const clearConsoleBtn = document.getElementById('clear-console');
    const savedSnippetsSelect = document.getElementById('saved-snippets');
    
    // Variáveis
    let snippets = [];
    
    // Carregar snippets salvos
    loadSnippets();
    
    // Event listeners
    codeInput.addEventListener('input', updateHighlightedCode);
    codeInput.addEventListener('scroll', syncScroll);
    codeInput.addEventListener('keydown', handleTabKey);
    
    if (runCodeBtn) {
        runCodeBtn.addEventListener('click', runCode);
    }
    
    if (saveSnippetBtn) {
        saveSnippetBtn.addEventListener('click', saveSnippet);
    }
    
    if (clearEditorBtn) {
        clearEditorBtn.addEventListener('click', () => {
            codeInput.value = '';
            updateHighlightedCode();
        });
    }
    
    if (clearConsoleBtn) {
        clearConsoleBtn.addEventListener('click', clearConsole);
    }
    
    if (savedSnippetsSelect) {
        savedSnippetsSelect.addEventListener('change', loadSelectedSnippet);
    }
    
    // Suporte para atalhos de teclado
    document.addEventListener('keydown', (event) => {
        if (!document.querySelector('.code-editor-container')) return;
        
        // Ctrl+Enter para executar código
        if (event.ctrlKey && event.key === 'Enter') {
            event.preventDefault();
            runCode();
        }
        
        // Ctrl+S para salvar snippet
        if (event.ctrlKey && event.key === 's') {
            event.preventDefault();
            saveSnippet();
        }
    });
    
    // Funções
   
    function updateHighlightedCode() {
        const code = codeInput.value;
        highlightedCode.innerHTML = code;
        hljs.highlightElement(highlightedCode);
    }
    
    function syncScroll() {
        highlightedCode.scrollTop = codeInput.scrollTop;
        highlightedCode.scrollLeft = codeInput.scrollLeft;
    }
    
    function handleTabKey(event) {
        if (event.key === 'Tab') {
            event.preventDefault();
            
            const start = codeInput.selectionStart;
            const end = codeInput.selectionEnd;
            
            // Inserir 4 espaços no cursor atual
            codeInput.value = codeInput.value.substring(0, start) + '    ' + codeInput.value.substring(end);
            
            // Mover cursor para depois da tabulação
            codeInput.selectionStart = codeInput.selectionEnd = start + 4;
            
            updateHighlightedCode();
        }
    }
    
    function runCode() {
        const code = codeInput.value;
        
        clearConsole();
        
        try {
            // Substituir console.log para capturar saídas
            const originalConsole = {
                log: console.log,
                error: console.error,
                warn: console.warn
            };
            
            console.log = function() {
                const output = Array.from(arguments).join(' ');
                appendToConsole(output, 'log');
                originalConsole.log.apply(console, arguments);
            };
            
            console.error = function() {
                const output = Array.from(arguments).join(' ');
                appendToConsole(output, 'error');
                originalConsole.error.apply(console, arguments);
            };
            
            console.warn = function() {
                const output = Array.from(arguments).join(' ');
                appendToConsole(output, 'warn');
                originalConsole.warn.apply(console, arguments);
            };
            
            // Executar código em uma função para criar escopo
            const result = new Function(code)();
            
            // Se o código retornar algum valor, mostrar no console
            if (result !== undefined) {
                appendToConsole(result, 'log');
            }
            
            // Restaurar console original
            console.log = originalConsole.log;
            console.error = originalConsole.error;
            console.warn = originalConsole.warn;
        } catch (error) {
            appendToConsole(error.message, 'error');
        }
    }
    
    function appendToConsole(content, type = 'log') {
        const line = document.createElement('div');
        line.className = `console-${type}`;
        
        if (typeof content === 'object') {
            try {
                content = JSON.stringify(content, null, 2);
            } catch (e) {
                content = content.toString();
            }
        }
        
        line.textContent = content;
        consoleOutput.appendChild(line);
        consoleOutput.scrollTop = consoleOutput.scrollHeight;
    }
    
    function clearConsole() {
        consoleOutput.innerHTML = '';
    }
    
    function saveSnippet() {
        const code = codeInput.value.trim();
        if (!code) return;
        
        const snippetName = prompt('Digite um nome para o snippet:');
        if (!snippetName) return;
        
        // Verificar se já existe um snippet com este nome
        const existingIndex = snippets.findIndex(s => s.name === snippetName);
        
        if (existingIndex !== -1) {
            const override = confirm(`Já existe um snippet chamado "${snippetName}". Deseja sobrescrever?`);
            
            if (override) {
                snippets[existingIndex].code = code;
            } else {
                return;
            }
        } else {
            snippets.push({ name: snippetName, code });
            addSnippetToList(snippetName);
        }
        
        localStorage.setItem('codeSnippets', JSON.stringify(snippets));
        alert(`Snippet "${snippetName}" salvo com sucesso!`);
    }
    
    function loadSnippets() {
        const savedSnippets = localStorage.getItem('codeSnippets');
        
        if (savedSnippets) {
            snippets = JSON.parse(savedSnippets);
            
            // Adicionar snippets ao select
            snippets.forEach(snippet => {
                addSnippetToList(snippet.name);
            });
        }
    }
    
    function addSnippetToList(name) {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        savedSnippetsSelect.appendChild(option);
    }
    
    function loadSelectedSnippet() {
        const selectedName = savedSnippetsSelect.value;
        
        if (!selectedName) return;
        
        const snippet = snippets.find(s => s.name === selectedName);
        
        if (snippet) {
            codeInput.value = snippet.code;
            updateHighlightedCode();
        }
        
        savedSnippetsSelect.selectedIndex = 0;
    }
    
    // Inicializar o editor com o conteúdo atual
    updateHighlightedCode();
}

// ==================== SISTEMA DE ANÁLISE DE SKILLS AUTOMÁTICO ====================

// Função para formatar bytes
function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// Função para buscar perfil do GitHub
async function fetchGitHubProfile(username) {
    console.log('🔍 Buscando perfil do GitHub para:', username);
    try {
        const response = await fetch(`https://api.github.com/users/${username}`);
        
        if (!response.ok) {
            throw new Error(`Erro na API do GitHub: ${response.status} ${response.statusText}`);
        }
        
        const profileData = await response.json();
        console.log('✅ Dados de perfil obtidos:', profileData.name);
        
        updateGitHubProfile(profileData);
        return profileData;
    } catch (error) {
        console.error('❌ Erro ao buscar perfil do GitHub:', error);
        
        // Em caso de erro, usar os dados de fallback para o perfil
        const fallbackProfile = {
            name: "Mikael Ferreira",
            bio: null,
            public_repos: 6,
            followers: 1,
            following: 0,
            avatar_url: "https://avatars.githubusercontent.com/u/142128917?v=4",
            html_url: "https://github.com/mikaelfmts"
        };
        
        updateGitHubProfile(fallbackProfile);
        return fallbackProfile;
    }
}

// Função para buscar repositórios do GitHub
async function fetchGitHubRepositories(username) {
    console.log('🔍 Buscando repositórios do GitHub para:', username);
    try {
        const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=10`);
        
        if (!response.ok) {
            throw new Error(`Erro na API do GitHub: ${response.status} ${response.statusText}`);
        }
        
        const repos = await response.json();
        console.log('✅ Repositórios obtidos:', repos.length);
        
        updateGitHubRepos(repos);
        return repos;
    } catch (error) {
        console.error('❌ Erro ao buscar repositórios do GitHub:', error);
        
        // Em caso de erro, usar os dados de fallback para os repositórios
        const fallbackRepos = [
            {
                name: "api",
                description: "API desenvolvida em JavaScript",
                html_url: "https://github.com/mikaelfmts/api",
                language: "JavaScript",
                stargazers_count: 1,
                forks_count: 0
            },
            {
                name: "backendapiv2",
                description: "Backend API v2",
                html_url: "https://github.com/mikaelfmts/backendapiv2",
                language: null,
                stargazers_count: 0,
                forks_count: 0
            },
            {
                name: "botauthentic",
                description: "bot-authentic",
                html_url: "https://github.com/mikaelfmts/botauthentic",
                language: null,
                stargazers_count: 0,
                forks_count: 0
            },
            {
                name: "eu",
                description: "Portfolio pessoal",
                html_url: "https://github.com/mikaelfmts/eu",
                language: "JavaScript",
                stargazers_count: 1,
                forks_count: 0
            },
            {
                name: "portfolio",
                description: "Portfolio atualizado",
                html_url: "https://github.com/mikaelfmts/portfolio",
                language: "JavaScript",
                stargazers_count: 0,
                forks_count: 0
            },
            {
                name: "seu-site-perfil",
                description: "Site de perfil pessoal",
                html_url: "https://github.com/mikaelfmts/seu-site-perfil",
                language: "HTML",
                stargazers_count: 0,
                forks_count: 0
            }
        ];
        
        updateGitHubRepos(fallbackRepos);
        return fallbackRepos;
    }
}

// Função para analisar habilidades dos repositórios do GitHub
async function analyzeSkillsFromRepos(username) {
    console.log('🧪 Iniciando análise de habilidades técnicas...');
    try {
        // Buscar repositórios (ou usar os que já foram obtidos)
        const repos = await fetchGitHubRepositories(username);
        
        if (!repos || repos.length === 0) {
            throw new Error('Nenhum repositório encontrado para análise');
        }
        
        // Estatísticas de linguagens e tecnologias
        const languageStats = {};
        const technologyStats = {};
        let totalBytes = 0;
        
        // Para cada repositório, obtemos as linguagens usadas
        await Promise.all(repos.map(async (repo) => {
            try {
                // Se o repo já tem uma linguagem definida, podemos usar
                if (repo.language) {
                    // Incrementar a contagem desta linguagem
                    languageStats[repo.language] = (languageStats[repo.language] || 0) + 1000; // peso arbitrário
                    totalBytes += 1000;
                }
                
                // Tentar obter estatísticas detalhadas de linguagens
                const langResponse = await fetch(`https://api.github.com/repos/${username}/${repo.name}/languages`);
                
                if (langResponse.ok) {
                    const languages = await langResponse.json();
                    
                    // Adicionar bytes de cada linguagem
                    Object.entries(languages).forEach(([lang, bytes]) => {
                        languageStats[lang] = (languageStats[lang] || 0) + bytes;
                        totalBytes += bytes;
                    });
                }
                
                // Analisar descrição e nome para tecnologias
                const repoText = (repo.description || '') + ' ' + repo.name;
                
                // Lista de tecnologias para detectar
                const techKeywords = {
                    'React': ['react', 'jsx', 'tsx', 'reactjs'],
                    'Node.js': ['node', 'nodejs', 'express', 'npm'],
                    'Firebase': ['firebase', 'firestore', 'realtime database'],
                    'Database': ['sql', 'mysql', 'postgresql', 'mongodb', 'database', 'db'],
                    'API': ['api', 'rest', 'graphql', 'endpoint'],
                    'Web': ['web', 'website', 'site', 'landing'],
                    'UI/UX': ['ui', 'ux', 'interface', 'design', 'responsive'],
                    'Bootstrap': ['bootstrap', 'responsive'],
                    'Authentication': ['auth', 'login', 'jwt', 'token'],
                    'Local Storage': ['storage', 'localstorage', 'sessionstorage'],
                    'Mobile': ['mobile', 'responsive', 'app'],
                    'Git': ['git', 'github', 'versão', 'version'],
                    'Frontend': ['frontend', 'front-end', 'client'],
                    'Backend': ['backend', 'back-end', 'server', 'servidor'],
                    'Full Stack': ['fullstack', 'full-stack', 'full stack'],
                    'Progressive Web Apps': ['pwa', 'progressive', 'offline'],
                    'Responsive Design': ['responsive', 'mobile-first', 'adaptativo'],
                    'GitHub API': ['github api', 'api do github'],
                    'Web APIs': ['api', 'fetch', 'ajax', 'xmlhttprequest']
                };
                
                // Procurar por tecnologias no texto
                Object.entries(techKeywords).forEach(([tech, keywords]) => {
                    keywords.forEach(keyword => {
                        if (repoText.toLowerCase().includes(keyword.toLowerCase())) {
                            technologyStats[tech] = (technologyStats[tech] || 0) + 10;
                        }
                    });
                });
                
                // Verificar arquivo package.json para dependências
                try {
                    const contentResponse = await fetch(`https://api.github.com/repos/${username}/${repo.name}/contents/package.json`);
                    
                    if (contentResponse.ok) {
                        const data = await contentResponse.json();
                        // Converter conteúdo de base64
                        const content = atob(data.content);
                        const packageJson = JSON.parse(content);
                        
                        // Analisar dependências
                        const dependencies = { 
                            ...(packageJson.dependencies || {}), 
                            ...(packageJson.devDependencies || {}) 
                        };
                        
                        // Mapear dependências para tecnologias
                        const depToTech = {
                            'react': 'React',
                            'react-dom': 'React',
                            'vue': 'Vue.js',
                            'angular': 'Angular',
                            'express': 'Node.js',
                            'firebase': 'Firebase',
                            'bootstrap': 'Bootstrap',
                            'tailwindcss': 'Tailwind CSS',
                            'axios': 'API',
                            'mongoose': 'MongoDB',
                            'sequelize': 'SQL',
                            'redux': 'React',
                            'next': 'Next.js',
                            'webpack': 'Web Development',
                            'jest': 'Testing',
                            'typescript': 'TypeScript'
                        };
                        
                        // Incrementar pontuação para cada dependência
                        Object.keys(dependencies).forEach(dep => {
                            const tech = depToTech[dep] || 'JavaScript';
                            technologyStats[tech] = (technologyStats[tech] || 0) + 15;
                        });
                    }
                } catch (e) {
                    console.log(`Não foi possível analisar package.json de ${repo.name}:`, e);
                }
                
            } catch (repoError) {
                console.warn(`Erro ao analisar repo ${repo.name}:`, repoError);
            }
        }));
        
        // Garantir que pelo menos algumas tecnologias estão presentes
        const guaranteedTechs = ['JavaScript', 'HTML', 'CSS', 'Git', 'Web Development'];
        guaranteedTechs.forEach(tech => {
            if (!technologyStats[tech]) {
                technologyStats[tech] = 25; // valor base
            }
        });
        
        console.log('✅ Análise finalizada!', {
            linguagens: Object.keys(languageStats).length,
            tecnologias: Object.keys(technologyStats).length,
            totalBytes
        });
        
        // Armazenar dados
        const skillsData = { languageStats, technologyStats, totalBytes };
        
        // Gerar cards de skills
        createSkillCards(languageStats, technologyStats, totalBytes);
        
        // Salvar no cache para próximos acessos
        saveToCache(skillsData);
        
        return skillsData;
    } catch (error) {
        console.error('❌ Erro na análise de habilidades:', error);
        
        // Em caso de falha, usar dados de fallback
        generateFallbackSkills();
        
        return null;
    }
}

// Função para salvar dados no cache
function saveToCache(data) {
    try {
        // Adicionar timestamp para controle de expiração
        const cacheData = {
            ...data,
            timestamp: Date.now()
        };
        
        localStorage.setItem('github-skills-cache', JSON.stringify(cacheData));
        console.log('💾 Dados salvos no cache local');
    } catch (error) {
        console.warn('⚠️ Erro ao salvar no cache:', error);
    }
}

// Função para obter dados do cache
function getFromCache() {
    try {
        const cachedData = localStorage.getItem('github-skills-cache');
        
        if (!cachedData) return null;
        
        const data = JSON.parse(cachedData);
        const cacheAge = Date.now() - (data.timestamp || 0);
        const cacheExpiry = 60 * 60 * 1000; // 1 hora
        
        if (cacheAge > cacheExpiry) {
            console.log('🕒 Cache expirado, buscando novos dados...');
            return null;
        }
        
        console.log('🔄 Cache válido encontrado, idade:', Math.round(cacheAge / 1000 / 60), 'minutos');
        return data;
    } catch (error) {
        console.warn('⚠️ Erro ao ler cache:', error);
        return null;
    }
}

// Função para limpar cache de skills (usada pelo botão)
function clearSkillsCache() {
    try {
        localStorage.removeItem('github-skills-cache');
        console.log('🧹 Cache de skills limpo com sucesso!');
        alert('Cache de skills limpo! Os dados serão atualizados na próxima visualização da página.');
    } catch (error) {
        console.warn('⚠️ Erro ao limpar cache:', error);
    }
}

// Mapeamento de skills para ícones e cores
const SKILL_MAPPING = {
    'JavaScript': { category: 'language', icon: 'fab fa-js', color: '#f7df1e' },
    'TypeScript': { category: 'language', icon: 'fab fa-js', color: '#007acc' },
    'HTML': { category: 'language', icon: 'fab fa-html5', color: '#e34c26' },
    'CSS': { category: 'language', icon: 'fab fa-css3-alt', color: '#264de4' },
    'SCSS': { category: 'language', icon: 'fab fa-sass', color: '#cd6799' },
    'Python': { category: 'language', icon: 'fab fa-python', color: '#3572a5' },
    'Java': { category: 'language', icon: 'fab fa-java', color: '#b07219' },
    'C#': { category: 'language', icon: 'fab fa-microsoft', color: '#178600' },
    'PHP': { category: 'language', icon: 'fab fa-php', color: '#4f5d95' },
    'Go': { category: 'language', icon: 'fab fa-golang', color: '#00add8' },
    'Ruby': { category: 'language', icon: 'fab fa-ruby', color: '#701516' },
    'Swift': { category: 'language', icon: 'fab fa-swift', color: '#ffac45' },
    'Shell': { category: 'language', icon: 'fas fa-terminal', color: '#89e051' },
    'Markdown': { category: 'language', icon: 'fab fa-markdown', color: '#083fa1' },
    'JSON': { category: 'language', icon: 'fas fa-code', color: '#292929' },
    'React': { category: 'framework', icon: 'fab fa-react', color: '#61dafb' },
    'Vue.js': { category: 'framework', icon: 'fab fa-vuejs', color: '#4fc08d' },
    'Angular': { category: 'framework', icon: 'fab fa-angular', color: '#dd0031' },
    'Node.js': { category: 'language', icon: 'fab fa-node-js', color: '#026e00' },
    'Firebase': { category: 'platform', icon: 'fas fa-fire', color: '#ffca28' },
    'MongoDB': { category: 'database', icon: 'fas fa-database', color: '#4db33d' },
    'SQL': { category: 'database', icon: 'fas fa-database', color: '#4479a1' },
    'Git': { category: 'tool', icon: 'fab fa-git-alt', color: '#f05032' },
    'Bootstrap': { category: 'framework', icon: 'fab fa-bootstrap', color: '#7952b3' },
    'jQuery': { category: 'library', icon: 'fas fa-code', color: '#0769ad' },
    'Webpack': { category: 'tool', icon: 'fas fa-cogs', color: '#8dd6f9' },
    'Redux': { category: 'library', icon: 'fas fa-project-diagram', color: '#764abc' },
    'API': { category: 'concept', icon: 'fas fa-plug', color: '#009688' },
    'GraphQL': { category: 'language', icon: 'fas fa-project-diagram', color: '#e535ab' },
    'Docker': { category: 'tool', icon: 'fab fa-docker', color: '#0db7ed' },
    'AWS': { category: 'platform', icon: 'fab fa-aws', color: '#ff9900' },
    'Backend': { category: 'concept', icon: 'fas fa-server', color: '#6c757d' },
    'Frontend': { category: 'concept', icon: 'fas fa-desktop', color: '#fd7e14' },
    'Database': { category: 'concept', icon: 'fas fa-database', color: '#4db33d' },
    'Authentication': { category: 'concept', icon: 'fas fa-user-shield', color: '#6f42c1' },
    'Local Storage': { category: 'concept', icon: 'fas fa-hdd', color: '#17a2b8' },
    'Web': { category: 'concept', icon: 'fas fa-globe', color: '#007bff' },
    'UI/UX': { category: 'concept', icon: 'fas fa-paint-brush', color: '#fd7e14' },
    'Mobile': { category: 'concept', icon: 'fas fa-mobile-alt', color: '#20c997' },
    'Full Stack': { category: 'concept', icon: 'fas fa-layer-group', color: '#6f42c1' },
    'Progressive Web Apps': { category: 'concept', icon: 'fas fa-mobile-alt', color: '#6610f2' },
    'Web Development': { category: 'concept', icon: 'fas fa-laptop-code', color: '#0dcaf0' },
    'Testing': { category: 'concept', icon: 'fas fa-vial', color: '#d63384' },
    'TypeScript': { category: 'language', icon: 'fab fa-js', color: '#007acc' },
    'Next.js': { category: 'framework', icon: 'fab fa-react', color: '#000000' },
    'Responsive Design': { category: 'concept', icon: 'fas fa-desktop', color: '#fd7e14' },
    'GitHub API': { category: 'api', icon: 'fab fa-github', color: '#181717' },
    'Web APIs': { category: 'api', icon: 'fas fa-plug', color: '#009688' },
    'Tailwind CSS': { category: 'framework', icon: 'fab fa-css3-alt', color: '#06b6d4' }
};

// Função para garantir que os repos sejam exibidos corretamente
function ensureReposDisplay() {
    const reposElement = document.getElementById('github-repos');
    
    // Verificar se estamos na página de projetos
    const isProjectsPage = document.location.pathname.includes('projetos.html');
    
    if (isProjectsPage) {
        console.log('📋 Detectada página de projetos, garantindo que os repositórios sejam carregados...');
        
        // Se não houver elemento de repos na página, tentar criar
        if (!reposElement) {
            const projectsContainer = document.querySelector('main') || document.body;
            
            if (projectsContainer) {
                console.log('🔍 Criando container de repositórios na página de projetos...');
                
                const reposContainer = document.createElement('div');
                reposContainer.id = 'github-repos';
                reposContainer.className = 'github-repos-container';
                reposContainer.innerHTML = `
                    <div class="loader"></div>
                    <p>Carregando repositórios GitHub...</p>
                `;
                
                projectsContainer.appendChild(reposContainer);
                
                // Buscar repos novamente
                setTimeout(() => {
                    const username = "mikaelfmts";
                    fetchGitHubRepositories(username);
                }, 500);
            }
        }
        // Se o elemento já existir e tiver um loader, tentar buscar os repos novamente
        else if (reposElement.innerHTML.includes('loader')) {
            console.log('🔄 Container de repositórios encontrado com loader, tentando buscar dados...');
            
            // Atualizar o loader com um estilo melhor
            if (!reposElement.querySelector('p')) {
                const loaderText = document.createElement('p');
                loaderText.textContent = 'Carregando repositórios GitHub...';
                reposElement.appendChild(loaderText);
            }
            
            // Verificar se temos dados em cache ou usar fallback
            const username = "mikaelfmts";
            fetchGitHubRepositories(username).catch(() => {
                console.log('❌ Falha ao buscar dados, usando fallback...');
                useFallbackData();
            });
        }
    }
}

// Função para debug dos repositórios (pode ser chamada pelo console)
function debugGitHubRepos() {
    console.log('🔍 Debug iniciado para github-repos');
    
    const reposElement = document.getElementById('github-repos');
    console.log('Elemento encontrado:', !!reposElement);
    
    if (reposElement) {
        console.log('HTML atual:', reposElement.innerHTML);
        console.log('Possui loader?', reposElement.innerHTML.includes('loader'));
        console.log('Conteúdo visível?', getComputedStyle(reposElement).display !== 'none');
    }
    
    // Forçar busca de dados
    ensureReposDisplay();
    
    return 'Debug concluído. Verifique o console para mais informações.';
}

function getSkillStars(percentage) {
    const starCount = Math.min(Math.round(percentage / 20), 5);
    let stars = '';
    
    for (let i = 0; i < 5; i++) {
        if (i < starCount) {
            stars += '<i class="fas fa-star filled"></i>';
        } else {
            stars += '<i class="far fa-star"></i>';
        }
    }
    
    return stars;
}

function getSkillDescription(skill) {
    const descriptions = {
        'JavaScript': 'Linguagem de programação versátil, usada para desenvolvimento web front-end e back-end com Node.js.',
        'HTML': 'Linguagem de marcação para estruturar conteúdo web, fundamental para qualquer site ou aplicação.',
        'CSS': 'Linguagem de estilização responsável pela aparência visual e layout de páginas web.',
        'Python': 'Linguagem de alto nível ideal para automação, análise de dados, IA e desenvolvimento web.',
        'Java': 'Linguagem robusta para desenvolvimento de aplicações empresariais, Android e sistemas distribuídos.',
        'React': 'Biblioteca JavaScript para criação de interfaces de usuário dinâmicas e componentes reutilizáveis.',
        'Node.js': 'Ambiente de execução JavaScript server-side para construir aplicações escaláveis e de alta performance.',
        'Firebase': 'Plataforma de desenvolvimento móvel e web com recursos como autenticação, banco de dados e hospedagem.',
        'Git': 'Sistema de controle de versão distribuído essencial para gerenciar projetos de software colaborativos.',
        'Bootstrap': 'Framework CSS popular para criar interfaces responsivas e mobile-first rapidamente.',
        'TypeScript': 'Superset do JavaScript que adiciona tipagem estática e funcionalidades avançadas de OOP.',
        'Tailwind CSS': 'Framework CSS utilitário para design personalizado sem sair do HTML.',
        'MongoDB': 'Banco de dados NoSQL baseado em documentos para aplicações modernas.',
        'Express.js': 'Framework web minimalista e flexível para Node.js.',
        'SQL': 'Linguagem para gerenciamento e manipulação de bancos de dados relacionais.',
        'Angular': 'Framework completo para desenvolvimento de aplicações web dinâmicas de página única.',
        'Vue.js': 'Framework progressivo para construção de interfaces de usuário.',
        'PHP': 'Linguagem de script server-side popular para desenvolvimento web.',
        'Next.js': 'Framework React para produção com recursos avançados como SSR e SSG.',
        'C#': 'Linguagem versátil da Microsoft usada no desenvolvimento .NET.',
        'jQuery': 'Biblioteca JavaScript que simplifica a manipulação do DOM e chamadas AJAX.'
    };
    
    return descriptions[skill] || `Habilidade em ${skill} aplicada em diversos projetos de desenvolvimento.`;
}

function hexToRgb(hex) {
    // Expandir hex shorthand (ex. "#03F") para formato completo (ex. "#0033FF")
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, (m, r, g, b) => {
        return r + r + g + g + b + b;
    });

    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? 
        `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : 
        '200, 170, 110';
}
