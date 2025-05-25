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
                bytes: bytes
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
            score: score
        };
    });
    
    // Gerar HTML
    let skillsHTML = '';
    Object.entries(allSkills).forEach(([name, data]) => {
        skillsHTML += `
            <div class="skill-card">
                <div class="skill-header">
                    <span class="skill-icon"><i class="${getSkillIcon(name)}"></i></span>
                    <h3>${name}</h3>
                </div>
                <div class="skill-bar">
                    <div class="skill-progress" style="width: ${data.percentage}%; background-color: ${getSkillColor(name)};"></div>
                </div>
                <div class="skill-percentage">${data.percentage}%</div>
                <div class="skill-details">
                    ${data.bytes ? `<span>${formatBytes(data.bytes)}</span>` : ''}
                    <span>${data.type}</span>
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
// ==================== IMPORTS DO FIREBASE ====================
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js';
import { 
    getFirestore, 
    collection, 
    addDoc, 
    onSnapshot, 
    query, 
    where, 
    orderBy, 
    updateDoc, 
    doc,
    enableNetwork,
    disableNetwork,
    limit 
} from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js';

// ==================== CONFIGURAÇÃO DO FIREBASE ====================
const firebaseConfig = {
  apiKey: "AIzaSyA0VoWMLTJIyI54Pj0P5T75gCH6KpgAcbk",
  authDomain: "mikaelfmts.firebaseapp.com",
  projectId: "mikaelfmts",
  storageBucket: "mikaelfmts.firebasestorage.app",
  messagingSenderId: "516762612351",
  appId: "1:516762612351:web:f8a0f229ffd5def8ec054a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Configurar cache offline
try {
    enableNetwork(db);
} catch (err) {
    console.log('Cache offline não disponível:', err);
}

// Detectar conexão online/offline
window.addEventListener('online', () => {
    console.log('Conexão restaurada');
    enableNetwork(db);
});

window.addEventListener('offline', () => {
    console.log('Conexão perdida - modo offline');
});

console.log('Firebase inicializado com sucesso!');

// ==================== EXPORTAR FUNÇÕES PARA USO GLOBAL ====================
// Como estamos usando módulos ES6, precisamos exportar explicitamente as funções
// que são chamadas via atributos onclick no HTML
window.toggleMenu = toggleMenu;
window.toggleChat = toggleChat;
window.setUserName = setUserName;
window.sendMessage = sendMessage;
window.toggleTheme = toggleTheme;

// Expor funções de debug globalmente
window.debugGitHubRepos = debugGitHubRepos;
window.clearSkillsCache = clearSkillsCache;

// ==================== SISTEMA DE CHAT COM FIREBASE ====================

// Variáveis globais do chat
let currentUserName = '';
let currentChatId = '';
let messagesListener = null;

// Função para gerar chat_id baseado no nome e data
function generateChatId(nome) {
    const hoje = new Date();
    const dataFormatada = hoje.toISOString().split('T')[0].replace(/-/g, '');
    return `${nome.toLowerCase().replace(/\s+/g, '-')}-${dataFormatada}`;
}

// Função para definir o nome do usuário
async function setUserName() {
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
    currentChatId = generateChatId(name);
    
    // Esconder formulário de nome e mostrar chat
    document.getElementById('name-form').style.display = 'none';
    document.getElementById('chat-area').style.display = 'block';
    
    // Atualizar header do chat
    document.getElementById('chat-header').innerHTML = `🤖 Chat - ${currentUserName}`;
    
    // Carregar mensagens anteriores
    loadChatMessages();
    
    // Mostrar mensagem de boas-vindas
    addSystemMessage(`Olá ${currentUserName}! Sua mensagem será enviada para Mikael, que responderá assim que possível. Como posso ajudar você hoje?`);
}

// Função para adicionar mensagem do sistema
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

// Função para mostrar status de conexão
function updateConnectionStatus(isOnline) {
    const statusMessage = isOnline ? 
        'Conectado - suas mensagens serão enviadas em tempo real' : 
        'Sem conexão - suas mensagens serão enviadas quando a conexão for restaurada';
    
    addSystemMessage(statusMessage, isOnline ? 'success' : 'warning');
}

// Função para carregar mensagens do chat
function loadChatMessages() {
    if (!db || !currentChatId) return;
    
    try {
        const messagesRef = collection(db, 'mensagens');
        const q = query(
            messagesRef,
            where('chat_id', '==', currentChatId),
            limit(50)
        );
        
        // Escutar mudanças em tempo real
        messagesListener = onSnapshot(q, (snapshot) => {
            const chatMessages = document.getElementById('chat-messages');
            // Limpar mensagens anteriores (exceto mensagens do sistema)
            const systemMessages = Array.from(chatMessages.querySelectorAll('.system-message'));
            chatMessages.innerHTML = '';
            systemMessages.forEach(msg => chatMessages.appendChild(msg));
            
            if (snapshot.empty) {
                // Se não houver mensagens, apenas mostramos a mensagem de boas-vindas
                console.log('Nenhuma mensagem anterior encontrada para este chat');
            } else {
                // Converter para array e ordenar por hora no JavaScript
                const messages = [];
                snapshot.forEach((doc) => {
                    messages.push({ data: doc.data(), id: doc.id });
                });
                
                // Ordenar mensagens por hora (mais antigas primeiro)
                messages.sort((a, b) => {
                    const horaA = a.data.hora;
                    const horaB = b.data.hora;
                    
                    // Converter para timestamp para comparação
                    let timestampA, timestampB;
                    
                    if (horaA && typeof horaA.toDate === 'function') {
                        timestampA = horaA.toDate().getTime();
                    } else if (horaA instanceof Date) {
                        timestampA = horaA.getTime();
                    } else {
                        timestampA = 0;
                    }
                    
                    if (horaB && typeof horaB.toDate === 'function') {
                        timestampB = horaB.toDate().getTime();
                    } else if (horaB instanceof Date) {
                        timestampB = horaB.getTime();
                    } else {
                        timestampB = 0;
                    }
                    
                    return timestampA - timestampB;
                });
                
                // Exibir mensagens na ordem correta
                messages.forEach((msg) => {
                    displayMessage(msg.data, msg.id);
                });
            }
            
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }, (error) => {
            console.error('Erro ao carregar mensagens:', error);
            addSystemMessage('Erro ao carregar mensagens anteriores. Mas você pode enviar novas mensagens normalmente.', 'error');
        });
    } catch (error) {
        console.error('Erro ao configurar listener:', error);
        addSystemMessage('Erro ao conectar com o servidor. Tente recarregar a página.', 'error');
    }
}

// Função para exibir mensagem na interface
function displayMessage(messageData, messageId) {
    const chatMessages = document.getElementById('chat-messages');
    if (!chatMessages) return;
    
    // Verificar se a mensagem já existe na interface (evitar duplicatas)
    if (document.querySelector(`[data-message-id="${messageId}"]`)) {
        return;
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message user-message ${messageData.respondido ? 'responded' : ''}`;
    messageDiv.dataset.messageId = messageId;
    
    // Tratar corretamente o timestamp do Firestore
    let hora;
    if (messageData.hora) {
        if (typeof messageData.hora.toDate === 'function') {
            // Caso seja um timestamp do Firestore
            hora = messageData.hora.toDate().toLocaleTimeString();
        } else if (messageData.hora instanceof Date) {
            // Caso seja um objeto Date normal
            hora = messageData.hora.toLocaleTimeString();
        } else {
            // Fallback
            hora = new Date().toLocaleTimeString();
        }
    } else {
        hora = new Date().toLocaleTimeString();
    }
    
    messageDiv.innerHTML = `
        <div class="message-content">
            <strong>Você:</strong> ${messageData.mensagem}
        </div>
        <div class="message-time">${hora}</div>
        ${messageData.resposta ? `
            <div class="admin-response">
                <strong>Mikael:</strong> ${messageData.resposta}
            </div>
        ` : ''}
    `;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Função para enviar mensagem
async function sendMessage() {
    if (!currentUserName) {
        alert('Por favor, defina seu nome primeiro!');
        return;
    }
    
    const inputField = document.getElementById('chat-input');
    const message = inputField.value.trim();
    
    if (!message) return;
    
    if (!db) {
        addSystemMessage('Sistema offline. Mensagem será salva localmente.', 'warning');
        // Salvar mensagem localmente se Firebase não estiver disponível
        saveMessageLocally(message);
        inputField.value = '';
        return;
    }
    
    try {
        // Criar objeto da mensagem
        const messageData = {
            nome: currentUserName,
            mensagem: message,
            hora: new Date(),
            chat_id: currentChatId,
            resposta: '',
            respondido: false
        };
        
        // Exibir mensagem imediatamente na interface para feedback visual
        const tempId = 'temp-' + Date.now();
        displayMessage(messageData, tempId);
        
        // Limpar input antes de salvar para feedback imediato
        inputField.value = '';
        
        // Salvar mensagem no Firestore
        await addDoc(collection(db, 'mensagens'), messageData);
        
        console.log('Mensagem enviada com sucesso!');
    } catch (error) {
        console.error('Erro ao enviar mensagem:', error);
        
        // Remover mensagem temporária em caso de erro
        const tempMsg = document.querySelector(`[data-message-id^="temp-"]`);
        if (tempMsg) tempMsg.remove();
        
        // Salvar localmente como fallback
        addSystemMessage('Erro no servidor. Mensagem salva localmente.', 'warning');
        saveMessageLocally(message);
        
        // Não restaurar no input pois a mensagem foi salva localmente
    }
}

// Função para salvar mensagem localmente
function saveMessageLocally(message) {
    try {
        const localMessages = JSON.parse(localStorage.getItem('localMessages') || '[]');
        const messageData = {
            nome: currentUserName,
            mensagem: message,
            hora: new Date().toISOString(),
            chat_id: currentChatId,
            local: true
        };
        
        localMessages.push(messageData);
        localStorage.setItem('localMessages', JSON.stringify(localMessages));
        
        // Exibir mensagem local
        displayMessage(messageData, 'local-' + Date.now());
        
    } catch (error) {
        console.error('Erro ao salvar mensagem localmente:', error);
        addSystemMessage('Erro ao salvar mensagem. Tente novamente.', 'error');
    }
}

// Função para permitir envio com Enter
document.addEventListener('DOMContentLoaded', function() {
    // Para o input do nome
    const nameInput = document.getElementById('name-input');
    if (nameInput) {
        nameInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                setUserName();
            }
        });
    }
    
    // Para o input do chat
    const chatInput = document.getElementById('chat-input');
    if (chatInput) {
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
});

// Limpar listener quando a página for fechada
window.addEventListener('beforeunload', function() {
    if (messagesListener) {
        messagesListener();
    }
});

// Detectar mudanças de conexão
window.addEventListener('online', function() {
    if (currentUserName) {
        updateConnectionStatus(true);
    }
});

window.addEventListener('offline', function() {
    if (currentUserName) {
        updateConnectionStatus(false);
    }
});

// ==================== FIM DO SISTEMA DE CHAT ====================

// Função para alternar a visibilidade do chat
function toggleChat() {
    let chatBody = document.getElementById("chat-body");
    let isVisible = chatBody.style.display === "block";
    
    chatBody.style.display = isVisible ? "none" : "block";
    
    // Se o chat estiver abrindo e não tivermos um usuário ainda, focar no campo de nome
    if (!isVisible && !currentUserName) {
        setTimeout(() => {
            const nameInput = document.getElementById('name-input');
            if (nameInput) nameInput.focus();
        }, 100);
    }
    
    // Se o chat estiver abrindo e já tivermos um usuário, focar no campo de mensagem
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
        navigator.serviceWorker.register('assets/js/sw.js')
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
    initSnakeGame();
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

// ========== JOGO SNAKE ==========
function initSnakeGame() {
    // Verificar se estamos na página do jogo
    const canvas = document.getElementById('snake-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const startBtn = document.getElementById('start-game');
    const pauseBtn = document.getElementById('pause-game');
    const restartBtn = document.getElementById('restart-game');
    const currentScoreElement = document.getElementById('current-score');
    const highScoreElement = document.getElementById('high-score');
    const finalScoreElement = document.querySelector('.final-score');
    const gameMessage = document.querySelector('.game-message');
    const difficultySlider = document.getElementById('difficulty');
    
    // Carregar high score do localStorage
    let highScore = localStorage.getItem('snakeHighScore') || 0;
    highScoreElement.textContent = highScore;
    
    // Variáveis do jogo
    const gridSize = 20;
    const gridWidth = canvas.width / gridSize;
    const gridHeight = canvas.height / gridSize;
    
    let snake = [];
    let food = {};
    let direction = 'right';
    let nextDirection = 'right';
    let score = 0;
    let speed = 150; // ms
    let gameInterval = null;
    let isPaused = false;
    let obstacles = [];
    
    // Inicializar jogo
    function initGame() {
        snake = [
            { x: 10, y: 10 },
            { x: 9, y: 10 },
            { x: 8, y: 10 }
        ];
        
        score = 0;
        currentScoreElement.textContent = score;
        
        direction = 'right';
        nextDirection = 'right';
        
        generateFood();
        setDifficulty();
        
        // Gerar obstáculos apenas em dificuldades médio e difícil
        obstacles = [];
        if (difficultySlider.value > 1) {
            generateObstacles();
        }
        
        draw();
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
        
        // Atualizar high score se necessário
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('snakeHighScore', highScore);
            highScoreElement.textContent = highScore;
        }
        
        // Mostrar mensagem de game over
        finalScoreElement.textContent = score;
        gameMessage.classList.remove('hidden');
        pauseBtn.classList.add('hidden');
        startBtn.classList.remove('hidden');
    }
    
    function gameLoop() {
        moveSnake();
        
        if (checkCollision()) {
            gameOver();
            return;
        }
        
        if (eatFood()) {
            generateFood();
            score += 10;
            currentScoreElement.textContent = score;
            
            // Adicionar obstáculo a cada 5 comidas em dificuldade difícil
            if (difficultySlider.value == 3 && score % 50 === 0) {
                generateObstacles(1);
            }
        } else {
            // Remover a cauda apenas se não comeu
            snake.pop();
        }
        
        draw();
    }
    
    function moveSnake() {
        // Atualizar direção
        direction = nextDirection;
        
        // Calcular nova posição da cabeça
        const head = { ...snake[0] };
        
        switch (direction) {
            case 'up':
                head.y -= 1;
                break;
            case 'down':
                head.y += 1;
                break;
            case 'left':
                head.x -= 1;
                break;
            case 'right':
                head.x += 1;
                break;
        }
        
        // Teletransportar se atingir borda
        if (head.x < 0) head.x = gridWidth - 1;
        if (head.x >= gridWidth) head.x = 0;
        if (head.y < 0) head.y = gridHeight - 1;
        if (head.y >= gridHeight) head.y = 0;
        
        // Adicionar nova cabeça à frente
        snake.unshift(head);
    }
    
    function checkCollision() {
        const head = snake[0];
        
        // Verificar colisão com o corpo
        for (let i = 1; i < snake.length; i++) {
            if (head.x === snake[i].x && head.y === snake[i].y) {
                return true;
            }
        }
        
        // Verificar colisão com obstáculos
        for (let obs of obstacles) {
            if (head.x === obs.x && head.y === obs.y) {
                return true;
            }
        }
        
        return false;
    }
    
    function eatFood() {
        const head = snake[0];
        
        if (head.x === food.x && head.y === food.y) {
            return true;
        }
        
        return false;
    }
    
    function generateFood() {
        // Criar comida em posição aleatória que não colida com cobra ou obstáculos
        let validPosition = false;
        let newFood;
        
        while (!validPosition) {
            newFood = {
                x: Math.floor(Math.random() * gridWidth),
                y: Math.floor(Math.random() * gridHeight)
            };
            
            validPosition = true;
            
            // Verificar se colide com a cobra
            for (let segment of snake) {
                if (newFood.x === segment.x && newFood.y === segment.y) {
                    validPosition = false;
                }
            }
            
            // Verificar se colide com obstáculos
            for (let obs of obstacles) {
                if (newFood.x === obs.x && newFood.y === obs.y) {
                    validPosition = false;
                }
            }
        }
        
        food = newFood;
    }
    
    function generateObstacles(count = 3) {
        for (let i = 0; i < count; i++) {
            let validPosition = false;
            let newObstacle;
            
            while (!validPosition) {
                newObstacle = {
                    x: Math.floor(Math.random() * gridWidth),
                    y: Math.floor(Math.random() * gridHeight)
                };
                
                validPosition = true;
                
                // Verificar se colide com a cobra
                for (let segment of snake) {
                    if (newObstacle.x === segment.x && newObstacle.y === segment.y) {
                        validPosition = false;
                    }
                }
                
                // Verificar se colide com comida
                if (newObstacle.x === food.x && newObstacle.y === food.y) {
                    validPosition = false;
                }
                
                // Verificar se colide com outros obstáculos
                for (let obs of obstacles) {
                    if (newObstacle.x === obs.x && newObstacle.y === obs.y) {
                        validPosition = false;
                    }
                }
            }
            
            obstacles.push(newObstacle);
        }
    }
    
    function draw() {
        // Limpar canvas
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--background-primary');
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Desenhar cobra
        for (let i = 0; i < snake.length; i++) {
            if (i === 0) {
                // Cabeça
                ctx.fillStyle = '#4CAF50';
            } else {
                // Corpo
                ctx.fillStyle = '#8BC34A';
            }
            
            ctx.fillRect(snake[i].x * gridSize, snake[i].y * gridSize, gridSize - 2, gridSize - 2);
        }
        
        // Desenhar comida
        ctx.fillStyle = '#FF5252';
        ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 2, gridSize - 2);
        
        // Desenhar obstáculos
        ctx.fillStyle = '#607D8B';
        obstacles.forEach(obs => {
            ctx.fillRect(obs.x * gridSize, obs.y * gridSize, gridSize - 2, gridSize - 2);
        });
    }
    
    // Event listeners e controles
    document.addEventListener('keydown', (event) => {
        if (!document.querySelector('.game-container')) return;
        
        const key = event.key.toLowerCase();
        const arrowControls = { arrowup: 'up', arrowdown: 'down', arrowleft: 'left', arrowright: 'right' };
        const wasdControls = { w: 'up', s: 'down', a: 'left', d: 'right' };
        
        // Verificar controles selecionados
        const useWasd = document.getElementById('wasd').checked;
        const controls = useWasd ? wasdControls : arrowControls;
        
        // Definir direção com base no controle atual
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
