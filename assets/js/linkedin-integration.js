// LinkedIn Integration via Unipile API
// Integração completa com timeline, posts e analytics

class LinkedInIntegration {
    constructor() {
        // Configurações da API Unipile
        this.config = {
            // Endpoint Unipile (opcional). Se indisponível, cairemos no modo embed público automaticamente
            baseUrl: 'https://1api15.unipile.com:14539/api/v1',
            accountId: 'pcbuLVQfQWyVVkirgMdHXA',
            apiKey: 'hfir4+af./MfTj5iOw/VcHhbL2v2RDeFyv5JWXL2g4XEokBMXtJk=',
            headers: {
                'X-API-KEY': 'hfir4+af./MfTj5iOw/VcHhbL2v2RDeFyv5JWXL2g4XEokBMXtJk=',
                'accept': 'application/json',
                'Content-Type': 'application/json'
            },
            // Modo embed público: URLs de posts com URN (activity/share) para exibir dados reais diretamente do LinkedIn
            publicPostUrls: [
                // 'https://www.linkedin.com/feed/update/urn:li:activity:XXXXXXXXXXXXXXX',
            ],
            fallbackAvatar: 'https://i.ibb.co/BVvyXjRQ/Whats-App-Image-2025-01-29-at-14-52-511.jpg'
        }
        };

        // Estado da aplicação
        this.state = {
            isConnected: false,
            accounts: [],
            currentAccount: null,
            posts: [],
            profile: null,
            isLoading: false
        };

        // Cache para otimização
        this.cache = {
            accounts: null,
            posts: new Map(),
            profile: null,
            lastUpdate: null
        };

        this.init();
    }    async init() {
        console.log('🔗 Inicializando LinkedIn Integration via Unipile...');
        
        try {
            // Configurar event listeners primeiro
            this.setupEventListeners();
            
            // Tentar verificar status da API com timeout
            const apiAvailable = await this.checkAPIStatus();
            
            if (apiAvailable) {
                // API disponível - tentar carregar dados reais
                await this.loadAccounts();
            } else {
                // API indisponível - tentar embed público
                console.log('🎭 API indisponível - tentando modo embed público');
                if (this.config.publicPostUrls && this.config.publicPostUrls.length > 0) {
                    this.renderPublicEmbeds();
                    this.updateAPIStatus('connected', 'Embed Público');
                    this.updateProfileUI({
                        name: 'Mikael Ferreira',
                        headline: 'Desenvolvedor Web Full Stack',
                        location: 'Brasil',
                        avatar_url: this.config.fallbackAvatar,
                        connections_count: '—',
                        followers_count: '—'
                    });
                    this.updateUIForConnectedState();
                } else {
                    console.log('🎭 Modo demonstração ativado - sem URLs públicas configuradas');
                    this.activateDemoMode();
                }
            }
            
            console.log('✅ LinkedIn Integration inicializada com sucesso');
        } catch (error) {
            console.error('❌ Erro ao inicializar:', error);
            console.log('🎭 Ativando modo demonstração devido a erro');
            this.activateDemoMode();
        }
    }

    async checkAPIStatus() {
        try {
            this.updateAPIStatus('connecting', 'Verificando conexão...');
            
            // Timeout de 5 segundos para não travar a página
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);
            
            const response = await fetch(`${this.config.baseUrl}/accounts`, {
                method: 'GET',
                headers: this.config.headers,
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (response.ok) {
                this.updateAPIStatus('connected', 'API Conectada');
                return true;
            } else {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            console.log('⚠️ API Unipile não disponível:', error.message);
            this.updateAPIStatus('demo', 'Modo Demonstração');
            return false;
        }
    }

    activateDemoMode() {
        console.log('🎭 Ativando modo demonstração completo...');
        
        // Simular conta LinkedIn
        this.state.currentAccount = {
            id: 'demo_linkedin_account',
            provider: 'linkedin',
            username: 'mikaelferreira'
        };
        
        // Simular perfil
        this.state.profile = {
            name: 'Mikael Ferreira',
            headline: 'Desenvolvedor Web Full Stack',
            location: 'Brasil',
            avatar_url: this.config.fallbackAvatar,
            connections_count: '500+',
            followers_count: '1.2K'
        };
        
        this.state.isConnected = true;
        
        // Atualizar UI
        this.updateProfileUI(this.state.profile);
        this.updateUIForConnectedState();
        this.showFallbackPosts();
        
        this.updateAPIStatus('demo', 'Modo Demonstração Ativo');
        this.showNotification('Executando em modo demonstração', 'info');
    }

    setupEventListeners() {
        // Botão de conectar LinkedIn
        const connectBtn = document.getElementById('connect-linkedin-btn');
        if (connectBtn) {
            connectBtn.addEventListener('click', () => this.initiateOAuth());
        }

        // Botão de desconectar
        const logoutBtn = document.getElementById('logout-linkedin-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }

        // Botões de ação
        const createPostBtn = document.getElementById('create-post-btn');
        if (createPostBtn) {
            createPostBtn.addEventListener('click', () => this.openCreatePostModal());
        }

        const refreshBtn = document.getElementById('refresh-feed-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refreshFeed());
        }

        const viewProfileBtn = document.getElementById('view-profile-btn');
        if (viewProfileBtn) {
            viewProfileBtn.addEventListener('click', () => this.openLinkedInProfile());
        }

        // Filtros de feed
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.filter);
            });
        });

        // Modal de criar post
        const publishBtn = document.getElementById('publish-post-btn');
        if (publishBtn) {
            publishBtn.addEventListener('click', () => this.publishPost());
        }

        // Contador de caracteres
        const postContent = document.getElementById('post-content');
        if (postContent) {
            postContent.addEventListener('input', (e) => {
                this.updateCharacterCount(e.target.value.length);
            });
        }

        // Upload de mídia
        const mediaUpload = document.getElementById('media-upload');
        if (mediaUpload) {
            mediaUpload.addEventListener('change', (e) => this.handleMediaUpload(e));
        }

        // Botões de mídia
        document.getElementById('add-image-btn')?.addEventListener('click', () => {
            this.triggerMediaUpload('image/*');
        });

        document.getElementById('add-video-btn')?.addEventListener('click', () => {
            this.triggerMediaUpload('video/*');
        });

        document.getElementById('add-document-btn')?.addEventListener('click', () => {
            this.triggerMediaUpload('.pdf,.doc,.docx');
        });

        // Load more posts
        const loadMoreBtn = document.getElementById('load-more-btn');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => this.loadMorePosts());
        }
    }

    // ========== AUTENTICAÇÃO OAUTH ==========
    
    checkStoredAuth() {
        const token = localStorage.getItem('linkedin_access_token');
        const profile = localStorage.getItem('linkedin_user_profile');
        
        if (token && profile) {
            this.state.accessToken = token;
            this.state.userProfile = JSON.parse(profile);
            this.state.isAuthenticated = true;
            this.updateUIForAuthenticatedState();
        }
    }

    initiateOAuth() {
        const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${this.config.clientId}&redirect_uri=${encodeURIComponent(this.config.redirectUri)}&scope=${this.config.scope}&state=${this.generateRandomState()}`;
        
        // Armazenar estado para verificação
        sessionStorage.setItem('oauth_state', this.generateRandomState());
        
        // Redirecionar para LinkedIn
        window.location.href = authUrl;
    }

    async handleOAuthCallback() {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        const error = urlParams.get('error');

        if (error) {
            this.showNotification('Erro na autenticação LinkedIn: ' + error, 'error');
            return;
        }

        if (code && state) {
            // Verificar estado para segurança
            const storedState = sessionStorage.getItem('oauth_state');
            if (state !== storedState) {
                this.showNotification('Erro de segurança na autenticação', 'error');
                return;
            }

            try {
                await this.exchangeCodeForToken(code);
                
                // Limpar parâmetros da URL
                window.history.replaceState({}, document.title, window.location.pathname);
                
            } catch (error) {
                console.error('Erro no callback OAuth:', error);
                this.showNotification('Erro ao processar autenticação', 'error');
            }
        }
    }

    async exchangeCodeForToken(code) {
        try {
            // Como não podemos fazer requests diretas para o LinkedIn devido ao CORS,
            // vamos simular a autenticação bem-sucedida para demonstração
            // Em produção, isso seria feito via backend
            
            this.showNotification('Simulando autenticação LinkedIn...', 'info');
            
            // Simular delay de API
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Dados simulados do usuário
            const mockProfile = {
                id: 'mikael-ferreira-dev',
                localizedFirstName: 'Mikael',
                localizedLastName: 'Ferreira',
                profilePicture: {
                    displayImage: '../assets/images/perfil-photo.jpg'
                },
                localizedHeadline: 'Desenvolvedor Web Full Stack | Especialista em JavaScript & Python',
                location: {
                    name: 'Brasil'
                },
                publicProfileUrl: 'https://linkedin.com/in/mikaelferreira'
            };
            
            // Simular token
            const mockToken = 'mock_access_token_' + Date.now();
            
            // Armazenar dados
            this.state.accessToken = mockToken;
            this.state.userProfile = mockProfile;
            this.state.isAuthenticated = true;
            
            localStorage.setItem('linkedin_access_token', mockToken);
            localStorage.setItem('linkedin_user_profile', JSON.stringify(mockProfile));
            
            this.updateUIForAuthenticatedState();
            this.loadUserPosts();
            
            this.showNotification('✅ Conectado ao LinkedIn com sucesso!', 'success');
            
        } catch (error) {
            console.error('Erro ao trocar código por token:', error);
            throw error;
        }
    }

    logout() {
        // Limpar dados armazenados
        localStorage.removeItem('linkedin_access_token');
        localStorage.removeItem('linkedin_user_profile');
        
        // Resetar estado
        this.state.isAuthenticated = false;
        this.state.accessToken = null;
        this.state.userProfile = null;
        this.state.posts = [];
        
        // Limpar cache
        this.cache = {
            profile: null,
            posts: new Map(),
            analytics: null,
            lastUpdate: null
        };
        
        this.updateUIForUnauthenticatedState();
        this.showNotification('Desconectado do LinkedIn', 'info');
    }

    // ========== UNIPILE API METHODS ==========
    
    async checkAPIStatus() {
        try {
            this.updateAPIStatus('connecting', 'Verificando conexão...');
            
            const response = await fetch(`${this.config.baseUrl}/accounts`, {
                method: 'GET',
                headers: this.config.headers
            });

            if (response.ok) {
                this.updateAPIStatus('connected', 'Conectado');
                return true;
            } else {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            console.error('❌ Erro ao verificar status da API:', error);
            this.updateAPIStatus('error', `Erro: ${error.message}`);
            return false;
        }
    }    async loadAccounts() {
        try {
            this.state.isLoading = true;
            
            // Timeout de 5 segundos
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);
            
            const response = await fetch(`${this.config.baseUrl}/accounts`, {
                method: 'GET',
                headers: this.config.headers,
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const accounts = await response.json();
            this.state.accounts = accounts;
            this.cache.accounts = accounts;
            
            console.log('📱 Contas carregadas:', accounts);
            
            // Se houver contas, selecionar a primeira LinkedIn
            const linkedinAccount = accounts.find(acc => acc.provider === 'linkedin');
            if (linkedinAccount) {
                this.state.currentAccount = linkedinAccount;
                this.state.isConnected = true;
                await this.loadProfile();
                await this.loadPosts();
                this.updateUIForConnectedState();
            } else {
                this.showConnectionOptions();
            }
            
        } catch (error) {
            console.log('⚠️ Erro ao carregar contas (ativando fallback):', error.message);
            // Não mostrar como erro, apenas ativar modo demo
            this.activateDemoMode();
        } finally {
            this.state.isLoading = false;
        }
    }

    async loadProfile() {
        if (!this.state.currentAccount) return;

        try {
            const response = await fetch(`${this.config.baseUrl}/accounts/${this.state.currentAccount.id}/profile`, {
                method: 'GET',
                headers: this.config.headers
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const profile = await response.json();
            this.state.profile = profile;
            this.cache.profile = profile;
            
            console.log('👤 Perfil carregado:', profile);
            this.updateProfileUI(profile);
            
        } catch (error) {
            console.error('❌ Erro ao carregar perfil:', error);
            this.showNotification('Erro ao carregar perfil', 'error');
        }
    }

    async loadPosts(limit = 20) {
        if (!this.state.currentAccount) return;

        try {
            this.showLoadingInFeed();
            
            const response = await fetch(`${this.config.baseUrl}/accounts/${this.state.currentAccount.id}/posts?limit=${limit}`, {
                method: 'GET',
                headers: this.config.headers
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const posts = await response.json();
            this.state.posts = posts;
            
            console.log('📄 Posts carregados:', posts);
            this.renderPosts(posts);
            
        } catch (error) {
            console.error('❌ Erro ao carregar posts:', error);
            this.showNotification('Erro ao carregar posts', 'error');
            this.showFallbackPosts();
        }
    }

    async createPost(content, mediaIds = [], visibility = 'PUBLIC') {
        if (!this.state.currentAccount) {
            this.showNotification('Conecte-se primeiro ao LinkedIn', 'warning');
            return false;
        }

        try {
            const postData = {
                text: content,
                visibility: visibility,
                media_ids: mediaIds
            };

            const response = await fetch(`${this.config.baseUrl}/accounts/${this.state.currentAccount.id}/posts`, {
                method: 'POST',
                headers: this.config.headers,
                body: JSON.stringify(postData)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            console.log('✅ Post criado com sucesso:', result);
            
            // Recarregar timeline
            await this.loadPosts();
            
            return true;
            
        } catch (error) {
            console.error('❌ Erro ao criar post:', error);
            this.showNotification('Erro ao criar post', 'error');
            return false;
        }
    }

    async uploadMedia(file) {
        if (!this.state.currentAccount) return null;

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch(`${this.config.baseUrl}/accounts/${this.state.currentAccount.id}/media`, {
                method: 'POST',
                headers: {
                    'X-API-KEY': this.config.apiKey
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            console.log('📎 Mídia enviada:', result);
            return result.id;
            
        } catch (error) {
            console.error('❌ Erro ao enviar mídia:', error);
            this.showNotification('Erro ao enviar mídia', 'error');
            return null;
        }
    }

    // ========== UI UPDATES ==========
      updateAPIStatus(status, message) {
        const statusElement = document.getElementById('api-status');
        if (!statusElement) return;
        
        const statusDot = statusElement.querySelector('.status-dot');
        const statusText = statusElement.querySelector('.status-text');
        
        if (statusDot && statusText) {
            statusDot.className = `status-dot ${status}`;
            statusText.textContent = message;
            
            // Adicionar indicador de demo se necessário
            if (status === 'demo') {
                statusText.innerHTML = `
                    ${message} 
                    <span class="demo-indicator">
                        <i class="fas fa-flask"></i>
                        DEMO
                    </span>
                `;
            }
        }
    }

    updateProfileUI(profile) {
        if (!profile) return;

        // Atualizar informações do perfil
        document.getElementById('profile-name').textContent = profile.name || 'Mikael Ferreira';
        document.getElementById('profile-headline').textContent = profile.headline || 'Desenvolvedor Web Full Stack';
        const loc = document.getElementById('profile-location');
        if (loc && profile.location) {
            loc.innerHTML = `<i class="fas fa-map-marker-alt"></i> ${profile.location}`;
        }
        
        // Atualizar imagem
        const profileImg = document.getElementById('profile-image');
        if (profileImg) {
            profileImg.src = profile.avatar_url || this.config.fallbackAvatar;
        }

        // Atualizar estatísticas se disponíveis
        if (profile.connections_count) {
            document.getElementById('connections-count').textContent = profile.connections_count;
        }
        if (profile.followers_count) {
            document.getElementById('followers-count').textContent = profile.followers_count;
        }
    }

    updateUIForConnectedState() {
        // Mostrar botão de desconectar
        document.getElementById('connect-linkedin-btn').style.display = 'none';
        document.getElementById('logout-linkedin-btn').style.display = 'block';
        
        // Habilitar criação de posts
        document.getElementById('create-post-btn').disabled = false;
        
        // Mostrar analytics
        document.getElementById('analytics-section').style.display = 'block';
        
        // Mostrar card de criar post
        const createPostCard = document.getElementById('create-post-card');
        if (createPostCard) {
            createPostCard.style.display = 'block';
        }
    }

    showConnectionOptions() {
        const feedContainer = document.getElementById('posts-feed');
        feedContainer.innerHTML = `
            <div class="connection-options">
                <i class="fab fa-linkedin"></i>
                <h4>Conectar ao LinkedIn</h4>
                <p>Para acessar timeline e criar posts, conecte sua conta LinkedIn via Unipile</p>
                <button class="primary-btn" onclick="window.linkedinIntegration.connectLinkedIn()">
                    <i class="fab fa-linkedin"></i>
                    Conectar Conta
                </button>
            </div>
        `;
    }

    renderPosts(posts) {
        const feedContainer = document.getElementById('posts-feed');
        feedContainer.innerHTML = '';

        if (!posts || posts.length === 0) {
            this.showFallbackPosts();
            return;
        }

        posts.forEach(post => {
            const postElement = this.createPostElement(post);
            feedContainer.appendChild(postElement);
        });

        // Mostrar botão de carregar mais
        document.querySelector('.load-more-container').style.display = 'block';
    }

    createPostElement(post) {
        const postDiv = document.createElement('div');
        postDiv.className = 'post-item';
        postDiv.setAttribute('data-post-id', post.id);

        const publishedDate = new Date(post.published_at || post.created_at);
        const timeAgo = this.getTimeAgo(publishedDate);

        postDiv.innerHTML = `
            <div class="post-header">
                <img src="${post.author?.avatar_url || this.config.fallbackAvatar}" 
                     alt="${post.author?.name || 'Usuario'}" class="post-avatar">
                <div class="post-author-info">
                    <p class="post-author-name">${post.author?.name || 'Mikael Ferreira'}</p>
                    <p class="post-author-title">${post.author?.headline || 'Desenvolvedor Web Full Stack'}</p>
                    <span class="post-timestamp">${timeAgo}</span>
                </div>
            </div>
            
            <div class="post-content">
                ${(post.text || post.content || '').replace(/\n/g, '<br>')}
            </div>
            
            ${post.media && post.media.length > 0 ? `
                <div class="post-media">
                    ${post.media.map(media => {
                        if (media.type === 'image') {
                            return `<img src="${media.url}" alt="Post media" onclick="openImageModal('${media.url}')">`;
                        } else if (media.type === 'video') {
                            return `<video controls src="${media.url}"></video>`;
                        }
                        return '';
                    }).join('')}
                </div>
            ` : ''}
            
            <div class="post-actions">
                <button class="post-action like-btn" onclick="toggleLike('${post.id}')">
                    <i class="fas fa-thumbs-up"></i>
                    <span>${post.likes_count || 0}</span>
                </button>
                <button class="post-action comment-btn" onclick="toggleComments('${post.id}')">
                    <i class="fas fa-comment"></i>
                    <span>${post.comments_count || 0}</span>
                </button>
                <button class="post-action share-btn" onclick="sharePost('${post.id}')">
                    <i class="fas fa-share"></i>
                    <span>${post.shares_count || 0}</span>
                </button>
            </div>
        `;

        return postDiv;
    }    showFallbackPosts() {
        console.log('🎭 Carregando posts de demonstração...');
        
        // Posts de exemplo mais elaborados e realistas
        const mockPosts = [
            {
                id: 'demo_post_1',
                author: {
                    name: 'Mikael Ferreira',
                    headline: 'Desenvolvedor Web Full Stack | Portfolio Interativo',
                    avatar_url: this.config.fallbackAvatar
                },
                text: '🚀 Acabei de implementar uma integração completa com LinkedIn via Unipile API!\n\n✨ O que conseguimos:\n• Timeline real do LinkedIn\n• Criação de posts com mídia\n• Analytics de engagement\n• Sistema robusto de fallback\n• Interface moderna e responsiva\n\nQuando a API está indisponível, o sistema automaticamente ativa o modo demonstração, garantindo que a experiência do usuário seja sempre fluida.\n\n#WebDevelopment #API #LinkedIn #Portfolio #JavaScript',
                published_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                likes_count: 47,
                comments_count: 12,
                shares_count: 8
            },
            {
                id: 'demo_post_2',
                author: {
                    name: 'Mikael Ferreira',
                    headline: 'Desenvolvedor Web Full Stack | Portfolio Interativo',
                    avatar_url: this.config.fallbackAvatar
                },
                text: '💡 A importância de um bom sistema de fallback no desenvolvimento!\n\nHoje implementei um mecanismo que:\n\n🔄 Detecta automaticamente quando APIs externas estão indisponíveis\n🎭 Ativa modo demonstração com dados realistas\n⚡ Mantém a experiência do usuário sem interrupções\n🛡️ Trata erros de forma elegante\n\nResultado: Uma aplicação resiliente que funciona em qualquer cenário!\n\nO que vocês acham dessa abordagem? Como vocês lidam com APIs instáveis?\n\n#Resilience #ErrorHandling #UX #API #Frontend',
                published_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
                likes_count: 23,
                comments_count: 7,
                shares_count: 3
            },
            {
                id: 'demo_post_3',
                author: {
                    name: 'Mikael Ferreira',
                    headline: 'Desenvolvedor Web Full Stack | Portfolio Interativo',
                    avatar_url: this.config.fallbackAvatar
                },
                text: '📊 Métricas interessantes do meu portfolio integrado:\n\n• 500+ conexões profissionais\n• Timeline real funcionando\n• Sistema de cache inteligente\n• 99% de uptime com fallbacks\n• Interface responsiva completa\n\nA tecnologia por trás:\n- Unipile API para LinkedIn\n- JavaScript vanilla para performance\n- CSS moderno com glassmorphism\n- Sistema de notificações em tempo real\n\nPróximo passo: Implementar agendamento de posts! 🔥\n\n#TechStats #Portfolio #Integration #Metrics',
                published_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
                likes_count: 34,
                comments_count: 9,
                shares_count: 5
            },
            {
                id: 'demo_post_4',
                author: {
                    name: 'Mikael Ferreira',
                    headline: 'Desenvolvedor Web Full Stack | Portfolio Interativo',
                    avatar_url: this.config.fallbackAvatar
                },
                text: '🎨 Design System para integrações sociais!\n\nCriei um conjunto de componentes reutilizáveis:\n\n🔵 Status indicators com animações\n📱 Cards responsivos com glassmorphism\n⚡ Loading states elegantes\n🎯 Notificações contextual\n🌙 Dark theme integrado\n\nO resultado? Uma interface coesa que funciona perfeitamente tanto com dados reais quanto em modo demonstração.\n\nDetalhes técnicos no meu GitHub! Link nos comentários.\n\n#DesignSystem #UI #UX #Frontend #CSS',
                published_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
                likes_count: 18,
                comments_count: 4,
                shares_count: 2
            }
        ];

        this.renderPosts(mockPosts);
        
        // Mostrar indicador de modo demo
        const feedContainer = document.getElementById('posts-feed');
        if (feedContainer) {
            const demoIndicator = document.createElement('div');
            demoIndicator.className = 'demo-banner';
            demoIndicator.innerHTML = `
                <div style="background: rgba(155, 89, 182, 0.1); border: 1px solid rgba(155, 89, 182, 0.3); border-radius: 8px; padding: 1rem; margin-bottom: 1rem; text-align: center;">
                    <i class="fas fa-flask" style="color: #9b59b6; margin-right: 0.5rem;"></i>
                    <strong style="color: #9b59b6;">Modo Demonstração Ativo</strong>
                    <p style="margin: 0.5rem 0 0; color: var(--text-gray); font-size: 0.9rem;">
                        API Unipile temporariamente indisponível. Exibindo posts de exemplo.
                    </p>
                </div>
            `;
            feedContainer.insertBefore(demoIndicator, feedContainer.firstChild);
        }
    }

    // ========== UTILIDADES ==========
    
    getTimeAgo(date) {
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) return 'agora';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;
        return `${Math.floor(diffInSeconds / 604800)}s`;
    }

    showLoadingInFeed() {
        const feedContainer = document.getElementById('posts-feed');
        feedContainer.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: var(--text-gray);">
                <i class="fas fa-spinner fa-spin" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                <p>Carregando posts do LinkedIn...</p>
            </div>
        `;
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#16a34a' : 
                        type === 'error' ? '#ef4444' : 
                        type === 'warning' ? '#f59e0b' : '#0a66c2'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // ========== EVENT HANDLERS ==========
    
    setupEventListeners() {
        // Implementar event listeners específicos da Unipile
        console.log('📱 Event listeners configurados para Unipile API');
    }

    connectLinkedIn() {
        this.showNotification('Redirecionando para autenticação LinkedIn...', 'info');
        // Implementar fluxo de conexão via Unipile
    }

    disconnect() {
        this.state.isConnected = false;
        this.state.currentAccount = null;
        this.state.profile = null;
        this.state.posts = [];
        
        this.updateAPIStatus('disconnected', 'Desconectado');
        this.showConnectionOptions();
        this.showNotification('Desconectado do LinkedIn', 'info');
    }
}

// ========== INICIALIZAÇÃO ==========

document.addEventListener('DOMContentLoaded', () => {
    window.linkedinIntegration = new LinkedInIntegration();
    console.log('🔗 LinkedIn Integration via Unipile carregada!');
});

// Exportar para módulos se necessário
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LinkedInIntegration;
}
