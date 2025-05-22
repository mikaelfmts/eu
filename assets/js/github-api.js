// Classe para integração com a API do GitHub
class GitHubAPI {
    constructor(username) {
        this.username = username;
        this.baseURL = 'https://api.github.com';
        this.cache = {};
        this.cacheExpiry = 1000 * 60 * 30; // 30 minutos
    }

    // Obter informações do usuário
    async getUserInfo() {
        return this._fetchWithCache(`/users/${this.username}`);
    }

    // Obter repositórios do usuário
    async getRepos(sort = 'pushed', perPage = 10) {
        return this._fetchWithCache(`/users/${this.username}/repos?sort=${sort}&per_page=${perPage}`);
    }

    // Obter linguagens mais usadas
    async getLanguageStats() {
        // Verifica se já temos os dados em cache
        const cacheKey = `languages_${this.username}`;
        if (this.cache[cacheKey] && (Date.now() - this.cache[cacheKey].timestamp) < this.cacheExpiry) {
            return this.cache[cacheKey].data;
        }

        // Busca todos os repositórios para análise
        const repos = await this._fetchWithCache(`/users/${this.username}/repos?per_page=100`);
        
        // Objeto para contar bytes por linguagem
        const langStats = {};
        
        // Para cada repositório, busca as linguagens
        for (const repo of repos) {
            if (repo.fork) continue; // Ignora forks
            
            const repoLangs = await this._fetchWithCache(`/repos/${this.username}/${repo.name}/languages`);
            
            // Soma bytes por linguagem
            for (const [lang, bytes] of Object.entries(repoLangs)) {
                if (!langStats[lang]) langStats[lang] = 0;
                langStats[lang] += bytes;
            }
        }
        
        // Converte para percentuais
        const totalBytes = Object.values(langStats).reduce((sum, bytes) => sum + bytes, 0);
        const langPercentages = {};
        
        for (const [lang, bytes] of Object.entries(langStats)) {
            langPercentages[lang] = {
                bytes,
                percentage: Math.round((bytes / totalBytes) * 1000) / 10 // Percentual com 1 casa decimal
            };
        }
        
        // Ordena do maior para o menor
        const sortedLangs = Object.entries(langPercentages)
            .sort((a, b) => b[1].bytes - a[1].bytes)
            .reduce((obj, [key, value]) => {
                obj[key] = value;
                return obj;
            }, {});
        
        // Armazena em cache
        this.cache[cacheKey] = {
            data: sortedLangs,
            timestamp: Date.now()
        };
        
        return sortedLangs;
    }

    // Obter estatísticas de contribuição
    async getContributionStats() {
        const repos = await this._fetchWithCache(`/users/${this.username}/repos?per_page=100&sort=pushed`);
        
        // Filtra apenas repositórios não-fork
        const ownRepos = repos.filter(repo => !repo.fork);
        
        // Obtém estatísticas básicas
        const stats = {
            totalRepos: ownRepos.length,
            totalStars: ownRepos.reduce((sum, repo) => sum + repo.stargazers_count, 0),
            totalForks: ownRepos.reduce((sum, repo) => sum + repo.forks_count, 0),
            totalWatchers: ownRepos.reduce((sum, repo) => sum + repo.watchers_count, 0)
        };
        
        return stats;
    }

    // Obter dados de commit ao longo do tempo (atividade)
    async getCommitActivity(repoName) {
        return this._fetchWithCache(`/repos/${this.username}/${repoName}/stats/commit_activity`);
    }    // Método auxiliar para fazer requisições à API com cache
    async _fetchWithCache(endpoint) {
        // Verifica se já temos os dados em cache
        if (this.cache[endpoint] && (Date.now() - this.cache[endpoint].timestamp) < this.cacheExpiry) {
            return this.cache[endpoint].data;
        }

        try {
            const response = await fetch(`${this.baseURL}${endpoint}`);
            
            // Verifica rate limit
            const rateLimitRemaining = response.headers.get('X-RateLimit-Remaining');
            if (rateLimitRemaining) {
                const remaining = parseInt(rateLimitRemaining);
                if (remaining < 5) {
                    console.warn(`GitHub API Rate Limit baixo. Restante: ${remaining}`);
                }
                if (remaining === 0) {
                    // Se rate limit for 0, usa dados em cache se disponível
                    if (this.cache[endpoint]) {
                        console.warn('Rate limit excedido, usando dados em cache');
                        return this.cache[endpoint].data;
                    }
                    throw new Error('Rate limit excedido');
                }
            }
            
            if (!response.ok) {
                if (response.status === 403) {
                    // Rate limit ou acesso negado - verifica se temos cache
                    if (this.cache[endpoint]) {
                        console.warn('Acesso negado à API, usando dados em cache');
                        return this.cache[endpoint].data;
                    }
                    throw new Error('GitHub API indisponível (Rate Limit)');
                }
                throw new Error(`GitHub API Error: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Armazena em cache
            this.cache[endpoint] = {
                data,
                timestamp: Date.now()
            };
            
            return data;
        } catch (error) {
            console.error(`Erro ao buscar ${endpoint}:`, error);
            
            // Se tiver dados em cache (mesmo expirados), use-os como fallback
            if (this.cache[endpoint]) {
                console.warn(`Usando dados em cache para ${endpoint}`);
                return this.cache[endpoint].data;
            }
            
            throw error;
        }
    }
}

// Inicializar a API do GitHub com o nome de usuário correto
// Isso será configurado quando o documento estiver pronto
let githubAPI = null;

document.addEventListener('DOMContentLoaded', () => {
    // Configurar a API com o nome de usuário correto (substituir pelo seu usuário do GitHub)
    githubAPI = new GitHubAPI('mikaelfmts');
    
    // Inicializar componentes visuais se as seções relevantes existirem
    const statsSection = document.getElementById('github-section');
    
    if (statsSection) {
        // Usar os seletores corretos que correspondem ao HTML
        initGitHubStats();
        initLanguageChart();
    }
});

// Inicializar estatísticas do GitHub
async function initGitHubStats() {
    const statsContainer = document.querySelector('#github-section #github-stats');
    if (!statsContainer || !githubAPI) {
        console.warn('Container de estatísticas do GitHub não encontrado ou API não inicializada');
        return;
    }
    
    try {
        statsContainer.innerHTML = '<div class="loading-spinner"></div>';
        
        // Buscar informações do usuário e estatísticas
        const [userInfo, stats] = await Promise.all([
            githubAPI.getUserInfo(),
            githubAPI.getContributionStats()
        ]);
        
        // Preencher o container com os dados
        statsContainer.innerHTML = `
            <div class="github-profile">
                <img src="${userInfo.avatar_url}" alt="${userInfo.name || userInfo.login}" class="github-avatar">
                <div class="github-profile-info">
                    <h3>${userInfo.name || userInfo.login}</h3>
                    <p>${userInfo.bio || ''}</p>
                    <div class="github-metrics">
                        <div class="metric">
                            <span class="value">${stats.totalRepos}</span>
                            <span class="label">Repositórios</span>
                        </div>
                        <div class="metric">
                            <span class="value">${stats.totalStars}</span>
                            <span class="label">Stars</span>
                        </div>
                        <div class="metric">
                            <span class="value">${stats.totalForks}</span>
                            <span class="label">Forks</span>
                        </div>
                    </div>
                    <a href="${userInfo.html_url}" target="_blank" class="github-profile-link">
                        <i class="fab fa-github"></i> Ver Perfil
                    </a>
                </div>
            </div>
        `;    } catch (error) {
        console.error('Erro ao carregar estatísticas do GitHub:', error);
        statsContainer.innerHTML = `
            <div class="error-message github-error">
                <p><i class="fas fa-exclamation-triangle"></i> Não foi possível carregar os dados do GitHub.</p>
                <p>Tente novamente mais tarde ou verifique a conexão.</p>
                <button onclick="location.reload()" class="retry-btn"><i class="fas fa-sync-alt"></i> Tentar novamente</button>
            </div>
        `;
    }
}

// Inicializar gráfico de linguagens
async function initLanguageChart() {
    const chartContainer = document.querySelector('#github-section #language-chart');
    if (!chartContainer || !githubAPI) {
        console.warn('Container do gráfico de linguagens não encontrado ou API não inicializada');
        return;
    }
    
    try {
        chartContainer.innerHTML = '<div class="loading-spinner"></div>';
        
        // Buscar estatísticas de linguagem
        const languages = await githubAPI.getLanguageStats();
        
        // Criar barras de progresso para cada linguagem
        let chartHTML = '<div class="language-stats">';
        
        // Obter as 5 principais linguagens
        const topLanguages = Object.entries(languages)
            .sort((a, b) => b[1].percentage - a[1].percentage)
            .slice(0, 5);
        
        // Mapear linguagens para cores
        const languageColors = {
            JavaScript: '#f1e05a',
            TypeScript: '#2b7489',
            HTML: '#e34c26',
            CSS: '#563d7c',
            Python: '#3572A5',
            Java: '#b07219',
            Ruby: '#701516',
            PHP: '#4F5D95',
            'C#': '#178600',
            Swift: '#ffac45',
            Kotlin: '#F18E33',
            Go: '#00ADD8',
            Rust: '#dea584',
            Dart: '#00B4AB',
            // Adicione mais conforme necessário
            Default: '#ccc'
        };
        
        for (const [language, stats] of topLanguages) {
            const color = languageColors[language] || languageColors.Default;
            
            chartHTML += `
                <div class="language-item">
                    <div class="language-name">
                        <span class="language-color" style="background-color: ${color}"></span>
                        ${language}
                    </div>
                    <div class="language-bar-container">
                        <div class="language-bar" style="width: ${stats.percentage}%; background-color: ${color}"></div>
                    </div>
                    <div class="language-percentage">${stats.percentage}%</div>
                </div>
            `;
        }
        
        chartHTML += '</div>';
        chartContainer.innerHTML = chartHTML;    } catch (error) {
        console.error('Erro ao carregar gráfico de linguagens:', error);
        chartContainer.innerHTML = `
            <div class="error-message github-error">
                <p><i class="fas fa-exclamation-triangle"></i> Não foi possível carregar os dados de linguagens.</p>
                <p>Tente novamente mais tarde ou verifique a conexão.</p>
                <button onclick="location.reload()" class="retry-btn"><i class="fas fa-sync-alt"></i> Tentar novamente</button>
            </div>
        `;
    }
}
