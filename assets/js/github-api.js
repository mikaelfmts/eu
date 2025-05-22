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
        const cacheKey = `github_${endpoint}`;
        const storageData = localStorage.getItem(cacheKey);
        let cachedData = null;
        
        // Tenta recuperar do localStorage primeiro
        if (storageData) {
            try {
                const parsed = JSON.parse(storageData);
                if (Date.now() - parsed.timestamp < this.cacheExpiry) {
                    this.cache[endpoint] = parsed;
                    cachedData = parsed.data;
                }
            } catch (e) {
                console.warn('Erro ao parsear dados em cache:', e);
                localStorage.removeItem(cacheKey);
            }
        }
        
        // Se tiver em memória cache
        if (!cachedData && this.cache[endpoint] && (Date.now() - this.cache[endpoint].timestamp) < this.cacheExpiry) {
            cachedData = this.cache[endpoint].data;
        }

        // Se temos dados em cache válidos, retorna imediatamente
        if (cachedData) {
            // Faz uma requisição em background para atualizar o cache sem bloquear a UI
            this._refreshCacheInBackground(endpoint);
            return cachedData;
        }

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 segundos de timeout
            
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                signal: controller.signal,
                headers: {
                    'Accept': 'application/vnd.github.v3+json'
                }
            });
            
            clearTimeout(timeoutId);
            
            // Verifica rate limit
            const rateLimitRemaining = response.headers.get('X-RateLimit-Remaining');
            if (rateLimitRemaining) {
                const remaining = parseInt(rateLimitRemaining);
                const reset = response.headers.get('X-RateLimit-Reset');
                const resetTime = reset ? new Date(parseInt(reset) * 1000).toLocaleTimeString() : 'desconhecido';
                
                if (remaining < 10) {
                    console.warn(`GitHub API Rate Limit baixo. Restante: ${remaining}, reset às ${resetTime}`);
                }
                if (remaining === 0) {
                    // Dados de fallback para demonstração quando rate limit é excedido
                    const fallbackData = this._getFallbackData(endpoint);
                    
                    if (fallbackData) {
                        this._saveCacheData(endpoint, fallbackData);
                        return fallbackData;
                    }
                    
                    // Se tiver dados em cache (mesmo expirados), use-os como fallback
                    if (this.cache[endpoint]) {
                        console.warn('Rate limit excedido, usando dados em cache');
                        return this.cache[endpoint].data;
                    }
                    
                    throw new Error(`GitHub API Rate Limit excedido. Tente novamente após ${resetTime}`);
                }
            }
            
            if (!response.ok) {
                if (response.status === 403) {
                    // Dados de fallback para demonstração quando houver erro 403
                    const fallbackData = this._getFallbackData(endpoint);
                    
                    if (fallbackData) {
                        this._saveCacheData(endpoint, fallbackData);
                        return fallbackData;
                    }
                    
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
            this._saveCacheData(endpoint, data);
            
            return data;
        } catch (error) {
            console.error(`Erro ao buscar ${endpoint}:`, error);
            
            // Dados de fallback para demonstração se houver erro
            const fallbackData = this._getFallbackData(endpoint);
            if (fallbackData) {
                return fallbackData;
            }
            
            // Se tiver dados em cache (mesmo expirados), use-os como fallback
            if (this.cache[endpoint]) {
                console.warn(`Usando dados em cache para ${endpoint}`);
                return this.cache[endpoint].data;
            }
            
            throw error;
        }
    }
    
    // Salva os dados em cache (memória e localStorage)
    _saveCacheData(endpoint, data) {
        const cacheData = {
            data,
            timestamp: Date.now()
        };
        
        this.cache[endpoint] = cacheData;
        
        // Também salva no localStorage para persistência entre sessões
        try {
            const cacheKey = `github_${endpoint}`;
            localStorage.setItem(cacheKey, JSON.stringify(cacheData));
        } catch (e) {
            console.warn('Erro ao salvar cache no localStorage:', e);
        }
    }
    
    // Atualiza cache em segundo plano sem bloquear a UI
    _refreshCacheInBackground(endpoint) {
        setTimeout(async () => {
            try {
                const response = await fetch(`${this.baseURL}${endpoint}`, {
                    headers: {
                        'Accept': 'application/vnd.github.v3+json'
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    this._saveCacheData(endpoint, data);
                    console.log(`Cache atualizado em background para: ${endpoint}`);
                }
            } catch (error) {
                // Ignora erros silenciosamente na atualização de background
            }
        }, 100);
    }
    
    // Fornece dados de fallback quando a API não está disponível
    _getFallbackData(endpoint) {
        // Dados de fallback para diferentes endpoints
        const fallbackData = {
            [`/users/${this.username}`]: {
                login: this.username,
                name: "Mikael de Matos",
                avatar_url: "assets/images/profile-fallback.jpg",
                bio: "Desenvolvedor Web Full Stack",
                html_url: `https://github.com/${this.username}`
            },
            [`/users/${this.username}/repos`]: [
                {
                    name: "portfolio",
                    description: "Portfolio pessoal",
                    html_url: `https://github.com/${this.username}/portfolio`,
                    stargazers_count: 5,
                    forks_count: 2,
                    language: "JavaScript",
                    fork: false
                },
                {
                    name: "todo-app",
                    description: "Aplicativo de tarefas",
                    html_url: `https://github.com/${this.username}/todo-app`,
                    stargazers_count: 3,
                    forks_count: 1,
                    language: "TypeScript",
                    fork: false
                }
            ]
        };
        
        // Fallback para linguagens
        if (endpoint.includes('/languages')) {
            return {
                JavaScript: 45000,
                TypeScript: 35000,
                HTML: 15000,
                CSS: 12000,
                Python: 8000
            };
        }
        
        // Busca no objeto de fallback ou retorna null
        for (const key in fallbackData) {
            if (endpoint.includes(key)) {
                return fallbackData[key];
            }
        }
        
        return null;
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
        
        // Buscar informações do usuário e estatísticas com timeout
        let userInfo, stats;
        
        try {
            // Promise.all com timeout para evitar esperas longas
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Timeout')), 3000)
            );
            
            [userInfo, stats] = await Promise.race([
                Promise.all([
                    githubAPI.getUserInfo(),
                    githubAPI.getContributionStats()
                ]),
                timeoutPromise.then(() => {
                    throw new Error('Tempo limite excedido ao carregar dados do GitHub');
                })
            ]);
        } catch (fetchError) {
            console.warn('Erro ao buscar dados do GitHub, usando dados de fallback:', fetchError);
            
            // Usar dados de fallback
            userInfo = githubAPI._getFallbackData(`/users/${githubAPI.username}`);
            
            // Criar estatísticas de fallback se não tivermos dados
            stats = {
                totalRepos: '10+',
                totalStars: '15+',
                totalForks: '5+'
            };
            
            // Mostrar aviso sem bloquear a UI
            const warningEl = document.createElement('div');
            warningEl.className = 'github-warning';
            warningEl.innerHTML = `
                <p><i class="fas fa-info-circle"></i> Usando dados armazenados localmente.</p>
                <small>Limite de API do GitHub excedido. Recarregue mais tarde para obter dados atualizados.</small>
            `;
            statsContainer.appendChild(warningEl);
        }
        
        // Preencher o container com os dados (do API ou fallback)
        statsContainer.innerHTML = `
            <div class="github-profile">
                <img src="${userInfo.avatar_url}" alt="${userInfo.name || userInfo.login}" 
                    class="github-avatar" onerror="this.src='assets/images/profile-fallback.jpg'">
                <div class="github-profile-info">
                    <h3>${userInfo.name || userInfo.login}</h3>
                    <p>${userInfo.bio || 'Desenvolvedor Web'}</p>
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
                    <a href="${userInfo.html_url || `https://github.com/${githubAPI.username}`}" target="_blank" class="github-profile-link">
                        <i class="fab fa-github"></i> Ver Perfil
                    </a>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Erro ao carregar estatísticas do GitHub:', error);
        statsContainer.innerHTML = `
            <div class="error-message github-error">
                <p><i class="fas fa-exclamation-triangle"></i> Não foi possível carregar os dados do GitHub.</p>
                <p>Tente novamente mais tarde ou verifique a conexão.</p>
                <button onclick="initGitHubStats()" class="retry-btn"><i class="fas fa-sync-alt"></i> Tentar novamente</button>
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
        
        // Buscar estatísticas de linguagem com timeout
        let languages;
        
        try {
            // Promise com timeout para evitar esperas longas
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Timeout')), 3000)
            );
            
            languages = await Promise.race([
                githubAPI.getLanguageStats(),
                timeoutPromise.then(() => {
                    throw new Error('Tempo limite excedido ao carregar dados das linguagens');
                })
            ]);
        } catch (fetchError) {
            console.warn('Erro ao buscar dados de linguagens, usando dados de fallback:', fetchError);
            
            // Usar dados de fallback para linguagens
            const fallbackData = githubAPI._getFallbackData('/languages');
            
            // Converter para o formato esperado
            languages = {};
            const totalBytes = Object.values(fallbackData).reduce((sum, bytes) => sum + bytes, 0);
            
            for (const [lang, bytes] of Object.entries(fallbackData)) {
                languages[lang] = {
                    bytes,
                    percentage: Math.round((bytes / totalBytes) * 1000) / 10
                };
            }
        }
        
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
        
        // Se não tiver dados ou tiver poucos dados, mostra uma mensagem
        if (!topLanguages.length) {
            chartContainer.innerHTML = `
                <div class="info-message">
                    <p><i class="fas fa-info-circle"></i> Dados de linguagens indisponíveis no momento.</p>
                </div>
            `;
            return;
        }
        
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
        chartContainer.innerHTML = chartHTML;
    } catch (error) {
        console.error('Erro ao carregar gráfico de linguagens:', error);
        chartContainer.innerHTML = `
            <div class="error-message github-error">
                <p><i class="fas fa-exclamation-triangle"></i> Não foi possível carregar os dados de linguagens.</p>
                <p>Os dados podem estar temporariamente indisponíveis.</p>
                <button onclick="initLanguageChart()" class="retry-btn"><i class="fas fa-sync-alt"></i> Tentar novamente</button>
            </div>
        `;
    }
}
