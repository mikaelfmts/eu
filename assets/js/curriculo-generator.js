// Gerador de Currículo - JavaScript Principal
class CurriculumGenerator {
    constructor() {
        this.githubData = null;
        this.siteData = null;
        this.isEditMode = false;
        this.currentTheme = 'modern';
        this.lastGithubFetch = 0; // Timestamp da última busca
        this.githubCacheDuration = 5 * 60 * 1000; // 5 minutos em milliseconds
        this.firebaseService = null;
        this.autoSaveEnabled = true;
        this.autoSaveInterval = null;
        
        // Inicializar
        this.init();
    }    init() {
        CurriculumGenerator.debugLog('Inicializando Gerador de Currículo...');
        
        // Validar elementos obrigatórios
        if (!this.validateRequiredElements()) {
            CurriculumGenerator.debugError('Inicialização cancelada - elementos obrigatórios ausentes');
            return;
        }
        
        // Inicializar Firebase
        this.initializeFirebase();
        
        this.loadSiteData();
        this.setupEventListeners();
        
        // Tentar carregar currículo salvo primeiro
        setTimeout(() => {
            this.loadSavedCurriculum();
        }, 1000);
    }// Configurar event listeners
    setupEventListeners() {
        // Checkboxes para atualizar preview em tempo real
        const checkboxes = document.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                if (checkbox.id === 'editMode') {
                    this.toggleEditModeTools();
                } else if (this.githubData || this.siteData) {
                    this.generateResumeContent();
                }
            });
        });

        // Inputs para atualizar preview em tempo real
        const inputs = document.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"], textarea');
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                if (this.githubData || this.siteData) {
                    this.generateResumeContent();
                }
            });
        });        // Color pickers para cores customizadas
        const colorPickers = document.querySelectorAll('input[type="color"]');
        colorPickers.forEach(picker => {
            picker.addEventListener('change', () => {
                this.applyCustomStyles();
            });
        });

        // Toggle para modo edição avançada
        const editModeToggle = document.getElementById('editMode');
        if (editModeToggle) {
            editModeToggle.addEventListener('change', () => {
                this.toggleEditModeTools();
            });
        }        // Outros controles
        const otherControls = ['showColors', 'useGradients', 'useShadows', 'useAnimations'];
        otherControls.forEach(controlId => {
            const control = document.getElementById(controlId);
            if (control) {
                control.addEventListener('change', () => {
                    this.applyCustomStyles();
                });
            }
        });

        // Configurar seletores de cor
        const colorInputs = document.querySelectorAll('#primaryColor, #secondaryColor');
        colorInputs.forEach(input => {
            input.addEventListener('change', () => {
                this.applyCustomStyles();
            });
        });

        // Configurar seletor de tema
        const themeSelector = document.getElementById('themeSelector');
        if (themeSelector) {
            themeSelector.addEventListener('change', (e) => {
                this.currentTheme = e.target.value;
                this.generateResumeContent();
            });
        }
    }

    // Toggle do modo edição
    toggleEditModeTools() {
        const editTools = document.getElementById('editModeTools');
        const editMode = document.getElementById('editMode');
        
        if (editTools && editMode) {
            if (editMode.checked) {
                editTools.classList.remove('hidden');
                this.isEditMode = true;
            } else {
                editTools.classList.add('hidden');
                this.isEditMode = false;
            }
        }
    }    // Aplicar estilos personalizados
    applyCustomStyles() {
        try {
            const previewArea = document.getElementById('resumePreview');
            if (!previewArea) return;

            const fontSize = document.getElementById('fontSize')?.value || 14;
            const primaryColor = document.getElementById('primaryColor')?.value || '#3B82F6';
            const secondaryColor = document.getElementById('secondaryColor')?.value || '#1E40AF';
            const useGradients = document.getElementById('useGradients')?.checked || false;
            const useShadows = document.getElementById('useShadows')?.checked || false;
            const useAnimations = document.getElementById('useAnimations')?.checked || false;

            // Aplicar variáveis CSS
            previewArea.style.setProperty('--custom-font-size', fontSize + 'px');
            previewArea.style.setProperty('--primary-color', primaryColor);
            previewArea.style.setProperty('--secondary-color', secondaryColor);
            previewArea.style.setProperty('--header-bg', primaryColor);
            previewArea.style.setProperty('--accent-color', secondaryColor);
            previewArea.style.setProperty('--gradient-bg', `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`);
            
            // Aplicar classes condicionais
            previewArea.classList.toggle('show-colors', true);
            previewArea.classList.toggle('use-gradients', useGradients);
            previewArea.classList.toggle('use-shadows', useShadows);
            previewArea.classList.toggle('use-animations', useAnimations);
            
            console.log('Estilos customizados aplicados:', {
                fontSize,
                primaryColor,
                secondaryColor,
                useGradients,
                useShadows,
                useAnimations
            });
            
        } catch (error) {
            console.error('Erro ao aplicar estilos customizados:', error);
        }
    }

    // Função auxiliar para preencher campos pessoais de forma segura
    fillPersonalFields(profileData) {
        const fields = [
            { id: 'personalName', value: profileData.name || profileData.login || 'Mikael Matos' },
            { id: 'personalEmail', value: profileData.email || 'mikaelmatos.adm@gmail.com' },
            { id: 'personalLocation', value: profileData.location || 'Brasil' },
            { id: 'personalBio', value: profileData.bio || 'Desenvolvedor Full Stack' }
        ];

        fields.forEach(field => {
            const element = document.getElementById(field.id);
            if (element) {
                element.value = field.value;
            }
        });
    }    // Carregar dados do GitHub
    async loadGitHubData() {
        this.showLoading(true);
        
        // Verificar cache local primeiro
        const now = Date.now();
        if (this.githubData && (now - this.lastGithubFetch) < this.githubCacheDuration) {
            console.log('Usando dados do GitHub em cache');
            this.fillPersonalFields(this.githubData.profile);
            this.generateResumeContent();
            this.showLoading(false);
            return;
        }

        // Tentar carregar do localStorage se disponível
        const cachedData = localStorage.getItem('github-cache');
        if (cachedData) {
            try {
                const parsed = JSON.parse(cachedData);
                if ((now - parsed.timestamp) < this.githubCacheDuration) {
                    console.log('Usando dados do GitHub do localStorage');
                    this.githubData = parsed.data;
                    this.lastGithubFetch = parsed.timestamp;
                    this.fillPersonalFields(this.githubData.profile);
                    this.generateResumeContent();
                    this.showLoading(false);
                    return;
                }
            } catch (e) {
                console.warn('Erro ao carregar cache do localStorage:', e);
            }
        }

        try {
            const username = 'MikaelFMTS'; // Nome do usuário GitHub
            
            // Buscar dados do perfil
            const profileResponse = await fetch(`https://api.github.com/users/${username}`);
            if (!profileResponse.ok) {
                throw new Error(`Erro ao buscar perfil: ${profileResponse.status}`);
            }
            const profileData = await profileResponse.json();

            // Buscar repositórios
            const reposResponse = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=10`);
            let reposData = [];
            if (reposResponse.ok) {
                const responseData = await reposResponse.json();
                reposData = Array.isArray(responseData) ? responseData : [];
            } else {
                console.warn(`Erro ao buscar repositórios: ${reposResponse.status}`);
            }

            // Buscar linguagens mais usadas
            const languages = {};
            for (const repo of reposData.slice(0, 5)) {
                try {
                    const langResponse = await fetch(repo.languages_url);
                    const langData = await langResponse.json();
                    Object.keys(langData).forEach(lang => {
                        languages[lang] = (languages[lang] || 0) + langData[lang];
                    });
                } catch (error) {
                    console.log('Erro ao buscar linguagens do repo:', repo.name);
                }
            }            this.githubData = {
                profile: profileData,
                repositories: reposData,
                languages: Object.keys(languages).slice(0, 10)
            };

            // Salvar no cache local
            this.lastGithubFetch = Date.now();
            try {
                localStorage.setItem('github-cache', JSON.stringify({
                    data: this.githubData,
                    timestamp: this.lastGithubFetch
                }));
            } catch (e) {
                console.warn('Erro ao salvar cache no localStorage:', e);
            }

            // Preencher campos com dados do GitHub
            this.fillPersonalFields(profileData);

            console.log('Dados do GitHub carregados:', this.githubData);
            this.generateResumeContent();
            
        } catch (error) {
            console.error('Erro ao carregar dados do GitHub:', error);
            
            // Dados de fallback caso a API falhe
            this.githubData = {
                profile: {
                    name: 'Mikael Matos',
                    login: 'MikaelFMTS',
                    email: 'mikaelmatos.adm@gmail.com',
                    location: 'Brasil',
                    bio: 'Desenvolvedor Full Stack'
                },
                repositories: [],
                languages: ['JavaScript', 'HTML', 'CSS', 'Python']
            };            // Preencher campos com dados de fallback
            this.fillPersonalFields(this.githubData.profile);

            console.log('Usando dados de fallback devido ao erro da API do GitHub');
            this.generateResumeContent();
        } finally {
            this.showLoading(false);
        }
    }

    // Carregar dados do site
    async loadSiteData() {
        try {
            const siteData = {
                certificates: await this.loadPageData('pages/certificates-in-progress.html'),
                projects: await this.loadPageData('pages/projetos.html'),
                games: await this.loadPageData('pages/games.html'),
                interactive: await this.loadPageData('pages/interactive-projects.html'),
                mentors: await this.loadPageData('pages/mentors.html'),
                skills: await this.extractSkillsFromIndex()
            };

            this.siteData = siteData;
            console.log('Dados do site carregados:', this.siteData);
            
        } catch (error) {
            console.error('Erro ao carregar dados do site:', error);
        }
    }

    // Carregar dados de uma página específica
    async loadPageData(pagePath) {
        try {
            const response = await fetch(pagePath);
            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            return this.extractDataFromPage(doc, pagePath);
        } catch (error) {
            console.error(`Erro ao carregar ${pagePath}:`, error);
            return [];
        }
    }    // Extrair dados específicos de cada página
    extractDataFromPage(doc, pagePath) {
        const data = [];
        
        if (pagePath.includes('certificates')) {
            // Extrair certificados com mais detalhes
            const certificates = doc.querySelectorAll('.certificate-card, .card, .course-item, .certificado, .curso');
            certificates.forEach(cert => {
                const title = cert.querySelector('h3, h4, .title, .nome')?.textContent?.trim();
                const description = cert.querySelector('p, .description, .descricao')?.textContent?.trim();
                const status = cert.querySelector('.status, .progress, .progresso')?.textContent?.trim();
                const institution = cert.querySelector('.institution, .instituicao')?.textContent?.trim();
                
                if (title) {
                    data.push({
                        type: 'certificate',
                        title,
                        description: description || 'Certificação em progresso',
                        status: status || 'Em andamento',
                        institution: institution || 'Instituição não especificada'
                    });
                }
            });
            
            // Se não encontrou certificados específicos, buscar por texto comum
            if (data.length === 0) {
                const textContent = doc.body.textContent;
                if (textContent.includes('curso') || textContent.includes('certificado')) {
                    data.push({
                        type: 'certificate',
                        title: 'Certificações em Progresso',
                        description: 'Constantemente estudando e obtendo novas certificações na área de tecnologia',
                        status: 'Em andamento'
                    });
                }
            }
            
        } else if (pagePath.includes('projetos')) {
            // Extrair projetos com mais detalhes
            const projects = doc.querySelectorAll('.project-card, .card, .project-item, .projeto');
            projects.forEach(proj => {
                const title = proj.querySelector('h3, h4, .title, .nome')?.textContent?.trim();
                const description = proj.querySelector('p, .description, .descricao')?.textContent?.trim();
                const tech = proj.querySelector('.tech, .technologies, .tecnologias')?.textContent?.trim();
                const link = proj.querySelector('a')?.href;
                
                if (title) {
                    data.push({
                        type: 'project',
                        title,
                        description: description || 'Projeto desenvolvido com foco em soluções tecnológicas',
                        technologies: tech || 'JavaScript, HTML, CSS',
                        link
                    });
                }
            });
            
            // Buscar por repositórios GitHub mencionados
            const links = doc.querySelectorAll('a[href*="github.com"]');
            links.forEach(link => {
                const repoName = link.href.split('/').pop();
                if (repoName && !data.find(p => p.title.toLowerCase().includes(repoName.toLowerCase()))) {
                    data.push({
                        type: 'project',
                        title: repoName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                        description: 'Projeto desenvolvido e hospedado no GitHub',
                        technologies: 'Web Development',
                        link: link.href
                    });
                }
            });
            
        } else if (pagePath.includes('games')) {
            // Extrair jogos
            const games = doc.querySelectorAll('.game-card, .card, .game-item, .jogo');
            games.forEach(game => {
                const title = game.querySelector('h3, h4, .title, .nome')?.textContent?.trim();
                const description = game.querySelector('p, .description, .descricao')?.textContent?.trim();
                const tech = game.querySelector('.tech, .engine')?.textContent?.trim();
                
                if (title) {
                    data.push({
                        type: 'game',
                        title,
                        description: description || 'Jogo desenvolvido com foco em entretenimento e aprendizado',
                        technologies: tech || 'Game Development'
                    });
                }
            });
            
            // Buscar por menções de jogos no texto
            const gameKeywords = ['jogo', 'game', 'unity', 'godot', 'phaser'];
            const textContent = doc.body.textContent.toLowerCase();
            gameKeywords.forEach(keyword => {
                if (textContent.includes(keyword) && data.length === 0) {
                    data.push({
                        type: 'game',
                        title: 'Desenvolvimento de Jogos',
                        description: 'Experiência em desenvolvimento de jogos e aplicações interativas',
                        technologies: 'Game Engines, JavaScript'
                    });
                }
            });
            
        } else if (pagePath.includes('interactive')) {
            // Extrair projetos interativos
            const interactive = doc.querySelectorAll('.interactive-card, .card, .project-item, .interativo');
            interactive.forEach(item => {
                const title = item.querySelector('h3, h4, .title, .nome')?.textContent?.trim();
                const description = item.querySelector('p, .description, .descricao')?.textContent?.trim();
                
                if (title) {
                    data.push({
                        type: 'interactive',
                        title,
                        description: description || 'Projeto interativo desenvolvido com JavaScript'
                    });
                }
            });
            
        } else if (pagePath.includes('mentors')) {
            // Extrair mentores
            const mentors = doc.querySelectorAll('.mentor-card, .card, .mentor-item, .mentor');
            mentors.forEach(mentor => {
                const name = mentor.querySelector('h3, h4, .name, .nome')?.textContent?.trim();
                const description = mentor.querySelector('p, .description, .descricao')?.textContent?.trim();
                const role = mentor.querySelector('.role, .cargo')?.textContent?.trim();
                
                if (name) {
                    data.push({
                        type: 'mentor',
                        name,
                        description: description || 'Influência profissional importante no desenvolvimento da carreira',
                        role: role || 'Mentor'
                    });
                }
            });
        }
        
        return data;
    }

    // Extrair habilidades do index.html
    async extractSkillsFromIndex() {
        try {
            const response = await fetch('index.html');
            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            const skills = [];
            
            // Procurar por diferentes seletores de skills
            const skillElements = doc.querySelectorAll('.skill, .technology, .tech-item, .skill-item');
            skillElements.forEach(skill => {
                const text = skill.textContent.trim();
                if (text && !skills.includes(text)) {
                    skills.push(text);
                }
            });
            
            // Se não encontrou skills nos seletores específicos, procurar por tecnologias comuns
            if (skills.length === 0) {
                const commonTechs = ['JavaScript', 'Python', 'HTML', 'CSS', 'React', 'Node.js', 'Git', 'GitHub'];
                const content = doc.body.textContent.toLowerCase();
                
                commonTechs.forEach(tech => {
                    if (content.includes(tech.toLowerCase())) {
                        skills.push(tech);
                    }
                });
            }
            
            return skills;
        } catch (error) {
            console.error('Erro ao extrair skills:', error);
            return ['JavaScript', 'HTML', 'CSS', 'Python', 'Git'];
        }
    }    // Gerar conteúdo do currículo
    generateResumeContent() {
        CurriculumGenerator.debugLog('Iniciando geração de currículo...');
        try {
            console.log('Iniciando geração de currículo...');
            
            const previewArea = document.getElementById('resumePreview');
            if (!previewArea) {
                console.error('Área de preview não encontrada!');
                return;
            }

            const themeSelector = document.getElementById('themeSelector');
            const theme = themeSelector ? themeSelector.value : 'modern';
            const twoColumns = document.getElementById('twoColumns')?.checked || false;
            const showPhoto = document.getElementById('showPhoto')?.checked || false;
            const showIcons = document.getElementById('showIcons')?.checked || true;

            // Dados pessoais
            const personalData = {
                name: document.getElementById('personalName')?.value || 'Mikael Matos',
                email: document.getElementById('personalEmail')?.value || 'mikaelmatos.adm@gmail.com',
                phone: document.getElementById('personalPhone')?.value || '',
                location: document.getElementById('personalLocation')?.value || 'Brasil',
                bio: document.getElementById('personalBio')?.value || 'Desenvolvedor Full Stack'
            };

            // Seções incluídas
            const includeSections = {
                github: document.getElementById('include-github')?.checked || true,
                certificates: document.getElementById('include-certificates')?.checked || true,
                projects: document.getElementById('include-projects')?.checked || true,
                games: document.getElementById('include-games')?.checked || true,
                interactive: document.getElementById('include-interactive')?.checked || true,
                mentors: document.getElementById('include-mentors')?.checked || true,
                skills: document.getElementById('include-skills')?.checked || true
            };            CurriculumGenerator.debugLog('Dados pessoais:', personalData);
            CurriculumGenerator.debugLog('Seções incluídas:', includeSections);
            CurriculumGenerator.debugLog('Tema selecionado:', theme);
            console.log('Dados pessoais:', personalData);
            console.log('Seções incluídas:', includeSections);
            console.log('Tema:', theme);            // Gerar HTML do currículo
            CurriculumGenerator.debugLog('Gerando HTML do currículo...');
            let resumeHTML = this.generateResumeHTML(personalData, includeSections, theme, twoColumns, showPhoto, showIcons);
            
            if (!resumeHTML || resumeHTML.trim() === '') {
                CurriculumGenerator.debugError('HTML do currículo vazio! Usando fallback.');
                console.error('HTML do currículo vazio!');
                resumeHTML = this.generateBasicResumeHTML(personalData, theme);
            }
            
            // Aplicar tema
            previewArea.className = `border border-gray-300 rounded-lg p-6 min-h-96 bg-white theme-${theme} theme-transition`;
            if (twoColumns) {
                previewArea.classList.add('two-columns');
            } else {
                previewArea.classList.add('one-column');
            }
              previewArea.innerHTML = resumeHTML;
            
            // Aplicar estilos customizados
            CurriculumGenerator.debugLog('Aplicando estilos customizados...');
            this.applyCustomStyles();
            
            // Adicionar animação
            previewArea.classList.add('fade-in');
            setTimeout(() => previewArea.classList.remove('fade-in'), 500);
              CurriculumGenerator.debugLog('Currículo gerado com sucesso!');
              console.log('Currículo gerado com sucesso!');
            this.showNotification('Currículo gerado com sucesso!', 'success');
              } catch (error) {
            CurriculumGenerator.debugError('Erro ao gerar currículo:', error);
            console.error('Erro ao gerar currículo:', error);
            this.showError('Erro ao gerar currículo. Tente novamente.');
        }
    }

    // Função para mostrar notificações
    showNotification(message, type = 'info') {
        // Remover notificação existente
        const existingNotification = document.querySelector('.curriculum-notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        // Criar nova notificação
        const notification = document.createElement('div');
        notification.className = `curriculum-notification fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg transform transition-all duration-300 translate-x-full`;
        
        const colors = {
            success: 'bg-green-500 text-white',
            error: 'bg-red-500 text-white',
            info: 'bg-blue-500 text-white',
            warning: 'bg-yellow-500 text-black'
        };
        
        notification.className += ` ${colors[type] || colors.info}`;
        notification.innerHTML = `
            <div class="flex items-center justify-between">
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-white hover:text-gray-200">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        document.body.appendChild(notification);
        
        // Animar entrada
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);
        
        // Auto remover após 3 segundos
        setTimeout(() => {
            if (notification.parentElement) {
                notification.classList.add('translate-x-full');
                setTimeout(() => notification.remove(), 300);
            }
        }, 3000);
    }

    // Função de fallback para gerar um currículo básico
    generateBasicResumeHTML(personalData, theme) {
        return `
            <div class="resume-header">
                <h1 class="text-3xl font-bold mb-2">${personalData.name}</h1>
                <p class="text-lg opacity-90">${personalData.bio}</p>
                <div class="contact-info mt-4">
                    ${personalData.email ? `<p><i class="fas fa-envelope mr-2"></i>${personalData.email}</p>` : ''}
                    ${personalData.phone ? `<p><i class="fas fa-phone mr-2"></i>${personalData.phone}</p>` : ''}
                    ${personalData.location ? `<p><i class="fas fa-map-marker-alt mr-2"></i>${personalData.location}</p>` : ''}
                </div>
            </div>
            
            <div class="resume-section">
                <h3><i class="fas fa-user mr-2"></i>Sobre</h3>
                <p>Desenvolvedor apaixonado por tecnologia e inovação. Sempre em busca de novos desafios e oportunidades de aprendizado.</p>
            </div>
            
            <div class="resume-section">
                <h3><i class="fas fa-code mr-2"></i>Habilidades</h3>
                <div class="skills-grid grid grid-cols-2 gap-2">
                    <span class="skill-tag bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">JavaScript</span>
                    <span class="skill-tag bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">HTML/CSS</span>
                    <span class="skill-tag bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">React</span>
                    <span class="skill-tag bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm">Node.js</span>
                </div>
            </div>
            
            <div class="resume-section">
                <h3><i class="fas fa-graduation-cap mr-2"></i>Formação</h3>
                <p>Graduando em Tecnologia da Informação</p>
            </div>
        `;
    }

    // Função para mostrar erros
    showError(message) {
        const previewArea = document.getElementById('resumePreview');
        if (previewArea) {
            previewArea.innerHTML = `
                <div class="text-center text-red-500 py-20">
                    <i class="fas fa-exclamation-triangle text-6xl mb-4"></i>
                    <p class="text-lg">${message}</p>
                    <button onclick="generator.loadGitHubData()" class="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg">
                        Tentar Novamente
                    </button>
                </div>
            `;
        }
    }    // Gerar HTML do currículo
    generateResumeHTML(personalData, includeSections, theme, twoColumns, showPhoto, showIcons) {
        try {
            console.log('Gerando HTML do currículo...');
            
            const iconClass = showIcons ? '' : 'hidden';
            const photoHTML = showPhoto && this.githubData?.profile?.avatar_url ? 
                `<img src="${this.githubData.profile.avatar_url}" alt="Foto" class="profile-photo">` : '';

            // Garantir que os dados pessoais tenham valores padrão
            const safePersonalData = {
                name: personalData.name || 'Mikael Matos',
                email: personalData.email || 'mikaelmatos.adm@gmail.com',
                phone: personalData.phone || '',
                location: personalData.location || 'Brasil',
                bio: personalData.bio || 'Desenvolvedor Full Stack apaixonado por tecnologia'
            };

            let html = '';

            if (twoColumns) {
                html = `
                    <div class="left-column">
                        ${this.generateHeaderSection(safePersonalData, photoHTML, iconClass)}
                        ${this.generateContactSection(safePersonalData, iconClass)}
                        ${includeSections.skills ? this.generateSkillsSection(iconClass) : ''}
                        ${includeSections.mentors ? this.generateMentorsSection(iconClass) : ''}
                    </div>
                    <div class="right-column">
                        ${safePersonalData.bio ? this.generateBioSection(safePersonalData.bio, iconClass) : ''}
                        ${includeSections.github ? this.generateGitHubSection(iconClass) : ''}
                        ${includeSections.projects ? this.generateProjectsSection(iconClass) : ''}
                        ${includeSections.games ? this.generateGamesSection(iconClass) : ''}
                        ${includeSections.interactive ? this.generateInteractiveSection(iconClass) : ''}
                        ${includeSections.certificates ? this.generateCertificatesSection(iconClass) : ''}
                    </div>
                `;
            } else {
                html = `
                    ${this.generateHeaderSection(safePersonalData, photoHTML, iconClass)}
                    ${safePersonalData.bio ? this.generateBioSection(safePersonalData.bio, iconClass) : ''}
                    ${this.generateContactSection(safePersonalData, iconClass)}
                    ${includeSections.skills ? this.generateSkillsSection(iconClass) : ''}
                    ${includeSections.github ? this.generateGitHubSection(iconClass) : ''}
                    ${includeSections.projects ? this.generateProjectsSection(iconClass) : ''}
                    ${includeSections.games ? this.generateGamesSection(iconClass) : ''}
                    ${includeSections.interactive ? this.generateInteractiveSection(iconClass) : ''}
                    ${includeSections.certificates ? this.generateCertificatesSection(iconClass) : ''}
                    ${includeSections.mentors ? this.generateMentorsSection(iconClass) : ''}
                `;
            }

            console.log('HTML gerado com sucesso');
            return html;
            
        } catch (error) {
            console.error('Erro ao gerar HTML:', error);
            return this.generateBasicResumeHTML(personalData, theme);
        }
    }

    // Seções do currículo
    generateHeaderSection(personalData, photoHTML, iconClass) {
        return `
            <div class="resume-header text-center">
                ${photoHTML}
                <h1 class="text-3xl font-bold mb-2">${personalData.name}</h1>
                <h2 class="text-xl opacity-90">Desenvolvedor Full Stack</h2>
            </div>
        `;
    }

    generateContactSection(personalData, iconClass) {
        const contacts = [];
        if (personalData.email) contacts.push(`<i class="fas fa-envelope ${iconClass}"></i>${personalData.email}`);
        if (personalData.phone) contacts.push(`<i class="fas fa-phone ${iconClass}"></i>${personalData.phone}`);
        if (personalData.location) contacts.push(`<i class="fas fa-map-marker-alt ${iconClass}"></i>${personalData.location}`);
        if (this.githubData?.profile?.html_url) contacts.push(`<i class="fab fa-github ${iconClass}"></i>GitHub: ${this.githubData.profile.login}`);

        if (contacts.length === 0) return '';

        return `
            <div class="resume-section">
                <h3><i class="fas fa-address-card section-icon ${iconClass}"></i>Contato</h3>
                <div class="contact-links">
                    ${contacts.map(contact => `<div class="mb-2">${contact}</div>`).join('')}
                </div>
            </div>
        `;
    }

    generateBioSection(bio, iconClass) {
        return `
            <div class="resume-section">
                <h3><i class="fas fa-user section-icon ${iconClass}"></i>Sobre</h3>
                <p>${bio}</p>
            </div>
        `;
    }

    generateSkillsSection(iconClass) {
        let skills = [];
        
        // Adicionar skills do GitHub
        if (this.githubData?.languages) {
            skills = [...skills, ...this.githubData.languages];
        }
        
        // Adicionar skills do site
        if (this.siteData?.skills) {
            skills = [...skills, ...this.siteData.skills];
        }
        
        // Remover duplicatas
        skills = [...new Set(skills)];
        
        if (skills.length === 0) return '';

        return `
            <div class="resume-section">
                <h3><i class="fas fa-code section-icon ${iconClass}"></i>Habilidades Técnicas</h3>
                <div class="skills-container">
                    ${skills.map(skill => `<span class="skill-item">${skill}</span>`).join('')}
                </div>
            </div>
        `;
    }

    generateGitHubSection(iconClass) {
        if (!this.githubData?.repositories) return '';

        const repos = this.githubData.repositories.slice(0, 5);
        
        return `
            <div class="resume-section">
                <h3><i class="fab fa-github section-icon ${iconClass}"></i>Repositórios GitHub</h3>
                ${repos.map(repo => `
                    <div class="project-item">
                        <h4>${repo.name}</h4>
                        <p>${repo.description || 'Projeto desenvolvido no GitHub'}</p>
                        <div class="project-tech">
                            Linguagem: ${repo.language || 'Não especificada'} | 
                            Última atualização: ${new Date(repo.updated_at).toLocaleDateString('pt-BR')}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    generateProjectsSection(iconClass) {
        const projects = this.siteData?.projects || [];
        if (projects.length === 0) return '';

        return `
            <div class="resume-section">
                <h3><i class="fas fa-laptop-code section-icon ${iconClass}"></i>Projetos</h3>
                ${projects.map(project => `
                    <div class="project-item">
                        <h4>${project.title}</h4>
                        <p>${project.description || 'Projeto em desenvolvimento'}</p>
                        ${project.technologies ? `<div class="project-tech">Tecnologias: ${project.technologies}</div>` : ''}
                    </div>
                `).join('')}
            </div>
        `;
    }

    generateGamesSection(iconClass) {
        const games = this.siteData?.games || [];
        if (games.length === 0) return '';

        return `
            <div class="resume-section">
                <h3><i class="fas fa-gamepad section-icon ${iconClass}"></i>Jogos Desenvolvidos</h3>
                ${games.map(game => `
                    <div class="project-item">
                        <h4>${game.title}</h4>
                        <p>${game.description || 'Jogo desenvolvido'}</p>
                    </div>
                `).join('')}
            </div>
        `;
    }

    generateInteractiveSection(iconClass) {
        const interactive = this.siteData?.interactive || [];
        if (interactive.length === 0) return '';

        return `
            <div class="resume-section">
                <h3><i class="fas fa-mouse-pointer section-icon ${iconClass}"></i>Projetos Interativos</h3>
                ${interactive.map(item => `
                    <div class="project-item">
                        <h4>${item.title}</h4>
                        <p>${item.description || 'Projeto interativo'}</p>
                    </div>
                `).join('')}
            </div>
        `;
    }    generateCertificatesSection(iconClass) {
        const certificates = this.siteData?.certificates || [];
        if (certificates.length === 0) return '';

        return `
            <div class="resume-section">
                <h3><i class="fas fa-certificate section-icon ${iconClass}"></i>Certificações e Cursos</h3>
                ${certificates.map(cert => `
                    <div class="project-item">
                        <h4>${cert.title}</h4>
                        <p>${cert.description || 'Certificação em andamento'}</p>
                        ${cert.institution ? `<div class="project-tech">Instituição: ${cert.institution}</div>` : ''}
                        ${cert.status ? `<div class="project-tech">Status: ${cert.status}</div>` : ''}
                    </div>
                `).join('')}
            </div>
        `;
    }

    generateMentorsSection(iconClass) {
        const mentors = this.siteData?.mentors || [];
        if (mentors.length === 0) return '';

        return `
            <div class="resume-section">
                <h3><i class="fas fa-users section-icon ${iconClass}"></i>Influências Profissionais</h3>
                ${mentors.map(mentor => `
                    <div class="project-item">
                        <h4>${mentor.name}</h4>
                        <p>${mentor.description || 'Influência profissional'}</p>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // Funções utilitárias
    showLoading(show) {
        const modal = document.getElementById('loadingModal');
        modal.classList.toggle('hidden', !show);
    }

    toggleEditMode() {
        this.isEditMode = !this.isEditMode;
        const button = document.getElementById('editModeBtn');
        const preview = document.getElementById('resumePreview');
        
        if (this.isEditMode) {
            button.innerHTML = '<i class="fas fa-save mr-2"></i>Salvar Edição';
            button.classList.replace('bg-blue-500', 'bg-green-500');
            button.classList.replace('hover:bg-blue-600', 'hover:bg-green-600');
            
            // Tornar elementos editáveis
            const editableElements = preview.querySelectorAll('h1, h2, h3, h4, p, span:not(.skill-item)');
            editableElements.forEach(el => {
                el.contentEditable = true;
                el.classList.add('editable');
            });
        } else {
            button.innerHTML = '<i class="fas fa-edit mr-2"></i>Modo Edição';
            button.classList.replace('bg-green-500', 'bg-blue-500');
            button.classList.replace('hover:bg-green-600', 'hover:bg-blue-600');
            
            // Remover editabilidade
            const editableElements = preview.querySelectorAll('.editable');
            editableElements.forEach(el => {
                el.contentEditable = false;
                el.classList.remove('editable');
            });
        }
    }

    changeTheme() {
        const theme = document.getElementById('themeSelector').value;
        this.currentTheme = theme;
        if (this.githubData || this.siteData) {
            this.generateResumeContent();
        }
    }

    resetForm() {
        // Limpar campos
        document.getElementById('personalName').value = '';
        document.getElementById('personalEmail').value = '';
        document.getElementById('personalPhone').value = '';
        document.getElementById('personalLocation').value = '';
        document.getElementById('personalBio').value = '';
        
        // Resetar checkboxes
        document.getElementById('include-github').checked = true;
        document.getElementById('include-certificates').checked = true;
        document.getElementById('include-projects').checked = true;
        document.getElementById('include-games').checked = true;
        document.getElementById('include-interactive').checked = true;
        document.getElementById('include-mentors').checked = false;
        document.getElementById('include-skills').checked = true;
        document.getElementById('showPhoto').checked = false;
        document.getElementById('twoColumns').checked = true;
        document.getElementById('showIcons').checked = true;
        
        // Resetar tema
        document.getElementById('themeSelector').value = 'modern';
        
        // Limpar preview
        const preview = document.getElementById('resumePreview');
        preview.innerHTML = `
            <div class="text-center text-gray-500 py-20">
                <i class="fas fa-file-alt text-6xl mb-4"></i>
                <p class="text-lg">Clique em "Gerar Currículo" para visualizar</p>
            </div>
        `;
        
        // Limpar dados
        this.githubData = null;
    }

    async exportToPDF() {
        const { jsPDF } = window.jspdf;
        const preview = document.getElementById('resumePreview');
        
        try {
            this.showLoading(true);
            
            // Usar html2canvas para capturar o conteúdo
            const canvas = await html2canvas(preview, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff'
            });
            
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            
            const imgWidth = 210;
            const pageHeight = 295;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;
            
            let position = 0;
            
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
            
            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }
            
            pdf.save('curriculo.pdf');
            
        } catch (error) {
            console.error('Erro ao exportar PDF:', error);
            alert('Erro ao exportar PDF. Tente novamente.');
        } finally {
            this.showLoading(false);
        }    }
      async saveToHtml() {
        const preview = document.getElementById('resumePreview');
        const theme = this.currentTheme;
        
        // Validar se há conteúdo para salvar
        if (!preview || !preview.innerHTML.trim() || preview.innerHTML.includes('Clique em "Gerar Currículo"')) {
            this.showNotification('Erro: Gere um currículo primeiro antes de salvar.', 'error');
            return;
        }

        try {
            
            // Criar HTML completo
            const fullHTML = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Currículo</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <link rel="stylesheet" href="assets/css/curriculo-generator-styles.css">
    <style>
        body { 
            font-family: Arial, sans-serif; 
            margin: 0; 
            padding: 20px; 
            background: #f5f5f5;
        }
        .container { 
            max-width: 800px; 
            margin: 0 auto; 
            background: white; 
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
            border-radius: 8px;
            overflow: hidden;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="theme-${theme}">
            ${preview.innerHTML}
        </div>
    </div>
</body>
</html>`;

            // Criar e fazer download do arquivo
            const blob = new Blob([fullHTML], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'curriculo.html';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            // Atualizar o arquivo curriculum.html existente
            await this.updateCurriculumPage(preview.innerHTML);
            
            this.showNotification('Arquivo HTML baixado e currículo atualizado na página!', 'success');
            
        } catch (error) {
            console.error('Erro ao salvar HTML:', error);
            this.showNotification('Erro ao salvar arquivo HTML. Tente novamente.', 'error');
        }
    }    async updateCurriculumPage(content) {
        try {
            // Validar se o conteúdo não está vazio
            if (!content || content.trim() === '') {
                console.warn('Conteúdo vazio, não salvando');
                return;
            }
            
            // Salvar no localStorage para ser usado pelo curriculum.html
            const curriculumData = {
                content: content,
                theme: this.currentTheme,
                timestamp: Date.now(),
                personalData: {
                    name: document.getElementById('personalName')?.value || '',
                    email: document.getElementById('personalEmail')?.value || '',
                    phone: document.getElementById('personalPhone')?.value || '',
                    location: document.getElementById('personalLocation')?.value || '',
                    bio: document.getElementById('personalBio')?.value || ''
                }
            };
            
            // Salvar no localStorage com chave específica
            localStorage.setItem('generated-curriculum', JSON.stringify(curriculumData));
            
            // NOVO: Salvar permanentemente no sessionStorage também (para recarregar página)
            sessionStorage.setItem('persistent-curriculum', JSON.stringify(curriculumData));
            
            // NOVO: Escrever diretamente no HTML da página curriculum.html
            await this.writeToHTMLFile(content, this.currentTheme);
            
            // NOVO: Tentar salvar no arquivo físico usando uma API alternativa
            try {
                // Criar um objeto com o conteúdo HTML completo
                const htmlContent = this.generatePermanentHtml(content);
                
                // Salvar em um storage mais persistente
                if (typeof(Storage) !== "undefined") {
                    const permanentKey = 'curriculum-permanent-' + Date.now();
                    localStorage.setItem('curriculum-permanent-current', permanentKey);
                    localStorage.setItem(permanentKey, JSON.stringify({
                        ...curriculumData,
                        htmlContent: htmlContent,
                        isPermanent: true
                    }));
                    
                    // Manter apenas os últimos 5 currículos salvos
                    this.cleanOldCurriculums();
                }
            } catch (error) {
                console.log('Erro ao salvar permanentemente:', error);
            }
            
            // NOVO: Criar sistema de persistência permanente
            await this.savePermanently(curriculumData);
            
            // Forçar atualização imediata se a página curriculum.html estiver aberta
            try {
                // Tentar atualizar diretamente
                const event = new StorageEvent('storage', {
                    key: 'generated-curriculum',
                    newValue: JSON.stringify(curriculumData),
                    storageArea: localStorage
                });
                window.dispatchEvent(event);
                
                // Notificar outras abas
                localStorage.setItem('curriculum-update-trigger', Date.now().toString());
                
                // BroadcastChannel para comunicação entre abas
                if (typeof BroadcastChannel !== 'undefined') {
                    const bc = new BroadcastChannel('curriculum-updates');
                    bc.postMessage({
                        type: 'curriculum-updated',
                        data: curriculumData
                    });
                    bc.close();
                }
            } catch (error) {
                console.log('Erro na comunicação entre abas:', error);
            }
            
            console.log('Currículo salvo com sucesso no localStorage e persistência');
            this.showNotification('Currículo salvo permanentemente! Acesse a página curriculum.html para visualizar.', 'success');
            
        } catch (error) {
            console.error('Erro ao atualizar curriculum.html:', error);
            this.showNotification('Erro ao salvar o currículo. Tente novamente.', 'error');
        }
    }
    
    // NOVA FUNÇÃO: Gerar HTML permanente
    generatePermanentHtml(content) {
        return `<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Curriculum - Mikael Ferreira</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
        .curriculum-container { max-width: 900px; margin: 0 auto; }
        .theme-modern, .theme-classic, .theme-creative, .theme-minimal, .theme-tech {
            padding: 2rem; border-radius: 1rem; background: white; box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
    </style>
</head>
<body>
    <div class="curriculum-container">
        <div class="theme-${this.currentTheme}">
            ${content}
        </div>
    </div>
</body>
</html>`;
    }
    
    // NOVA FUNÇÃO: Limpar currículos antigos
    cleanOldCurriculums() {
        try {
            const keys = Object.keys(localStorage).filter(key => key.startsWith('curriculum-permanent-'));
            if (keys.length > 5) {
                // Ordenar por timestamp e manter apenas os 5 mais recentes
                keys.sort().slice(0, -5).forEach(key => {
                    localStorage.removeItem(key);
                });
            }
        } catch (error) {
            console.log('Erro ao limpar currículos antigos:', error);
        }
    }

    // NOVA FUNÇÃO: Sistema de persistência permanente usando múltiplas estratégias
    async savePermanently(curriculumData) {
        try {
            // 1. Salvar com uma chave de backup permanente
            const permanentKey = 'curriculum-permanent-backup';
            localStorage.setItem(permanentKey, JSON.stringify({
                ...curriculumData,
                savedAt: new Date().toISOString(),
                version: '2.0'
            }));
            
            // 2. Criar um cookie de longa duração (1 ano)
            const cookieData = JSON.stringify({
                content: curriculumData.content,
                theme: curriculumData.theme,
                timestamp: curriculumData.timestamp
            });
            
            // Dividir o conteúdo em chunks se for muito grande
            const maxCookieSize = 4000; // 4KB limite aproximado
            if (cookieData.length > maxCookieSize) {
                const chunks = [];
                for (let i = 0; i < cookieData.length; i += maxCookieSize) {
                    chunks.push(cookieData.substring(i, i + maxCookieSize));
                }
                
                // Salvar número de chunks
                document.cookie = `curriculum-chunks=${chunks.length}; expires=${new Date(Date.now() + 365*24*60*60*1000).toUTCString()}; path=/`;
                
                // Salvar cada chunk
                chunks.forEach((chunk, index) => {
                    document.cookie = `curriculum-chunk-${index}=${encodeURIComponent(chunk)}; expires=${new Date(Date.now() + 365*24*60*60*1000).toUTCString()}; path=/`;
                });
            } else {
                document.cookie = `curriculum-data=${encodeURIComponent(cookieData)}; expires=${new Date(Date.now() + 365*24*60*60*1000).toUTCString()}; path=/`;
            }
            
            // 3. Tentar salvar no IndexedDB se disponível
            await this.saveToIndexedDB(curriculumData);
            
            // 4. Criar uma versão embeddada no DOM como fallback
            this.embedInDOM(curriculumData);
            
            console.log('Currículo salvo permanentemente com múltiplas estratégias');
            
        } catch (error) {
            console.error('Erro ao salvar permanentemente:', error);
        }
    }
    
    // Salvar no IndexedDB
    async saveToIndexedDB(data) {
        return new Promise((resolve, reject) => {
            try {
                const request = indexedDB.open('CurriculumPersistentDB', 1);
                
                request.onerror = () => reject(request.error);
                
                request.onupgradeneeded = (e) => {
                    const db = e.target.result;
                    if (!db.objectStoreNames.contains('curriculum')) {
                        const store = db.createObjectStore('curriculum', { keyPath: 'id' });
                        store.createIndex('timestamp', 'timestamp', { unique: false });
                    }
                };
                
                request.onsuccess = (e) => {
                    const db = e.target.result;
                    const transaction = db.transaction(['curriculum'], 'readwrite');
                    const store = transaction.objectStore('curriculum');
                    
                    const curriculumRecord = {
                        id: 'current',
                        ...data,
                        savedAt: new Date().toISOString(),
                        persistent: true
                    };
                    
                    const putRequest = store.put(curriculumRecord);
                    putRequest.onsuccess = () => {
                        console.log('Currículo salvo no IndexedDB');
                        resolve();
                    };
                    putRequest.onerror = () => reject(putRequest.error);
                };
                
            } catch (error) {
                reject(error);
            }
        });
    }
    
    // Embeddar dados no DOM como meta tag
    embedInDOM(data) {
        try {
            // Remover meta tag anterior se existir
            const existingMeta = document.querySelector('meta[name="curriculum-data"]');
            if (existingMeta) {
                existingMeta.remove();
            }
            
            // Criar nova meta tag com dados comprimidos
            const metaTag = document.createElement('meta');
            metaTag.name = 'curriculum-data';
            metaTag.content = btoa(JSON.stringify({
                content: data.content,
                theme: data.theme,
                timestamp: data.timestamp,
                embedded: true
            }));
            
            document.head.appendChild(metaTag);
            console.log('Dados embedados no DOM');
            
        } catch (error) {
            console.error('Erro ao embedar no DOM:', error);
        }
    }    // SISTEMA DE PERSISTÊNCIA 100% LOCAL
    async writeToHTMLFile(content, theme) {
        console.log('💾 SALVANDO CURRÍCULO NO SISTEMA LOCAL...');
        
        try {
            // Validar se há conteúdo para salvar
            if (!content || content.trim() === '') {
                this.showNotification('Erro: Conteúdo do currículo vazio', 'error');
                return;
            }

            // Criar dados completos do currículo
            const curriculumData = {
                content: content,
                theme: theme,
                timestamp: Date.now(),
                lastUpdated: new Date().toISOString(),
                savedAt: new Date().toLocaleString('pt-BR'),
                isLocalStorage: true,
                version: '3.0-local',
                id: 'curriculum_' + Date.now(),
                personalData: {
                    name: document.getElementById('personalName')?.value || 'Mikael Matos',
                    email: document.getElementById('personalEmail')?.value || 'mikaelmatos.adm@gmail.com',
                    phone: document.getElementById('personalPhone')?.value || '',
                    location: document.getElementById('personalLocation')?.value || 'Brasil',
                    bio: document.getElementById('personalBio')?.value || 'Desenvolvedor Full Stack'
                },
                sections: {
                    github: document.getElementById('include-github')?.checked || true,
                    certificates: document.getElementById('include-certificates')?.checked || true,
                    projects: document.getElementById('include-projects')?.checked || true,
                    games: document.getElementById('include-games')?.checked || true,
                    interactive: document.getElementById('include-interactive')?.checked || true,
                    mentors: document.getElementById('include-mentors')?.checked || true,
                    skills: document.getElementById('include-skills')?.checked || true
                }
            };

            // Salvar em múltiplas chaves do localStorage para máxima redundância
            const storageKeys = [
                'generatedCurriculum',
                'curriculum_current', 
                'curriculum_data',
                'cv_content',
                'portfolio_curriculum',
                'site_curriculum',
                'curriculum_permanent',
                'curriculum_master_copy'
            ];

            let saveSuccess = false;
            let successCount = 0;

            // Tentar salvar em todas as chaves
            storageKeys.forEach(key => {
                try {
                    localStorage.setItem(key, JSON.stringify(curriculumData));
                    successCount++;
                    saveSuccess = true;
                    console.log(`✅ Currículo salvo na chave: ${key}`);
                } catch (error) {
                    console.error(`❌ Falha ao salvar na chave ${key}:`, error);
                }
            });

            // Salvar versões simplificadas para compatibilidade
            try {
                localStorage.setItem('curriculum_simple', content);
                localStorage.setItem('curriculum_timestamp', Date.now().toString());
                localStorage.setItem('curriculum_theme', theme);
                localStorage.setItem('curriculum_last_save', new Date().toISOString());
                successCount += 4;
            } catch (error) {
                console.error('Erro ao salvar versões simplificadas:', error);
            }

            // Criar backup em cookie como redundância extra
            try {
                const cookieData = JSON.stringify({
                    content: content.substring(0, 3000), // Limitar tamanho do cookie
                    theme: theme,
                    timestamp: Date.now(),
                    id: curriculumData.id
                });
                document.cookie = `curriculum_backup=${encodeURIComponent(cookieData)}; expires=${new Date(Date.now() + 365*24*60*60*1000).toUTCString()}; path=/`;
                console.log('✅ Backup salvo em cookie');
            } catch (error) {
                console.error('Erro ao salvar backup em cookie:', error);
            }

            // Salvar no sessionStorage para persistir durante a sessão
            try {
                sessionStorage.setItem('curriculum_session', JSON.stringify(curriculumData));
                console.log('✅ Currículo salvo no sessionStorage');
            } catch (error) {
                console.error('Erro ao salvar no sessionStorage:', error);
            }

            // Notificar resultado
            if (saveSuccess) {
                console.log(`✅ Currículo salvo com sucesso em ${successCount} locais diferentes!`);
                this.showNotification(`✅ Currículo salvo permanentemente! (${successCount} backups criados)`, 'success');
                
                // Disparar evento para notificar outras páginas
                window.dispatchEvent(new CustomEvent('curriculumSaved', { 
                    detail: curriculumData 
                }));
                
                // Comunicar com outras abas usando BroadcastChannel
                if (typeof BroadcastChannel !== 'undefined') {
                    try {
                        const bc = new BroadcastChannel('curriculum-updates');
                        bc.postMessage({
                            type: 'curriculum-saved',
                            data: curriculumData,
                            timestamp: Date.now()
                        });
                        bc.close();
                        console.log('✅ Notificação enviada para outras abas');
                    } catch (error) {
                        console.error('Erro no BroadcastChannel:', error);
                    }
                }
                
            } else {
                this.showNotification('❌ Erro ao salvar currículo', 'error');
            }

        } catch (error) {
            console.error('❌ Erro geral ao salvar currículo:', error);
            this.showNotification('❌ Erro ao processar currículo: ' + error.message, 'error');
        }
    }

    // Mostrar notificações
    showNotification(message, type = 'info') {
        // Criar elemento de notificação se não existir
        let notification = document.getElementById('notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'notification';
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 16px 24px;
                border-radius: 8px;
                color: white;
                font-weight: 500;
                z-index: 9999;
                transform: translateX(100%);
                transition: transform 0.3s ease;
                max-width: 400px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            `;
            document.body.appendChild(notification);
        }
        
        // Definir cor baseada no tipo
        const colors = {
            success: '#10B981',
            error: '#EF4444',
            warning: '#F59E0B',
            info: '#3B82F6'
        };
        
        notification.style.backgroundColor = colors[type] || colors.info;
        notification.textContent = message;
        
        // Mostrar notificação
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Esconder após 4 segundos
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';        }, 4000);
    }    // Aplicar estilos customizados
    applyCustomStyles() {
        CurriculumGenerator.debugLog('Aplicando estilos customizados...');
        const preview = document.getElementById('resumePreview');
        if (!preview) {
            CurriculumGenerator.debugError('Elemento resumePreview não encontrado!');
            return;
        }        // Obter valores dos controles
        const fontSize = document.getElementById('fontSize')?.value || 14;
        const primaryColor = document.getElementById('primaryColor')?.value || '#3B82F6';
        const secondaryColor = document.getElementById('secondaryColor')?.value || '#1E40AF';
        const showColors = document.getElementById('showColors')?.checked || false;
        const useGradients = document.getElementById('useGradients')?.checked || false;
        const useShadows = document.getElementById('useShadows')?.checked || false;
        const useAnimations = document.getElementById('useAnimations')?.checked || false;

        CurriculumGenerator.debugLog('Configurações de estilo:', {
            fontSize, primaryColor, secondaryColor, showColors, useGradients, useShadows, useAnimations
        });

        // Aplicar estilos customizados
        let customStyles = `
            --custom-font-size: ${fontSize}px;
            --primary-color: ${primaryColor};
            --secondary-color: ${secondaryColor};
            font-size: ${fontSize}px;
        `;

        if (showColors) {
            customStyles += `
                --header-bg: ${primaryColor};
                --accent-color: ${secondaryColor};
            `;
        }        if (useGradients) {
            customStyles += `
                --gradient-bg: linear-gradient(135deg, ${primaryColor}, ${secondaryColor});
            `;
        }

        if (useShadows) {
            customStyles += `
                --box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            `;
        }

        if (useAnimations) {
            customStyles += `
                --animation-enabled: 1;
            `;
        }

        try {
            preview.style.cssText = customStyles;
            
            // Aplicar classes condicionais
            preview.classList.toggle('show-colors', showColors);
            preview.classList.toggle('use-gradients', useGradients);
            preview.classList.toggle('use-shadows', useShadows);
            preview.classList.toggle('use-animations', useAnimations);
            
            // Garantir que o preview tenha os estilos base
            if (!preview.classList.contains('theme-modern') && 
                !preview.classList.contains('theme-classic') && 
                !preview.classList.contains('theme-creative') && 
                !preview.classList.contains('theme-tech')) {
                preview.classList.add('theme-modern');
            }
            
            CurriculumGenerator.debugLog('Estilos aplicados com sucesso!');
        } catch (error) {
            CurriculumGenerator.debugError('Erro ao aplicar estilos:', error);
        }
    }// Toggle para ferramentas de edição avançada
    toggleEditModeTools() {
        const editMode = document.getElementById('editMode')?.checked || false;
        const advancedTools = document.getElementById('editModeTools');
        
        if (advancedTools) {
            if (editMode) {
                advancedTools.classList.remove('hidden');
                advancedTools.style.display = 'block';
            } else {
                advancedTools.classList.add('hidden');
                advancedTools.style.display = 'none';
            }
        }    }

    // Adicionar conteúdo personalizado
    addCustomContent() {
        // Esta função será implementada no modal
    }

    // Limpar cache do GitHub e forçar nova busca
    clearGithubCache() {
        try {
            localStorage.removeItem('github-cache');
            this.githubData = null;
            this.lastGithubFetch = 0;
            console.log('Cache do GitHub limpo');
            this.showNotification('Cache do GitHub limpo! Próxima busca será atualizada.', 'success');
        } catch (error) {
            console.error('Erro ao limpar cache:', error);
        }
    }

    // Salvar template
    saveTemplate() {
        try {
            const templateData = {
                theme: this.currentTheme,
                personalData: {
                    name: document.getElementById('personalName').value,
                    email: document.getElementById('personalEmail').value,
                    phone: document.getElementById('personalPhone').value,
                    location: document.getElementById('personalLocation').value,
                    bio: document.getElementById('personalBio').value
                },
                settings: {
                    twoColumns: document.getElementById('twoColumns').checked,
                    showPhoto: document.getElementById('showPhoto').checked,
                    showIcons: document.getElementById('showIcons').checked,
                    showColors: document.getElementById('showColors')?.checked,
                    fontSize: document.getElementById('fontSize')?.value,
                    primaryColor: document.getElementById('primaryColor')?.value,
                    secondaryColor: document.getElementById('secondaryColor')?.value
                },
                sections: {
                    github: document.getElementById('include-github').checked,
                    certificates: document.getElementById('include-certificates').checked,
                    projects: document.getElementById('include-projects').checked,
                    games: document.getElementById('include-games').checked,
                    interactive: document.getElementById('include-interactive').checked,
                    mentors: document.getElementById('include-mentors').checked,
                    skills: document.getElementById('include-skills').checked
                }
            };

            localStorage.setItem('curriculum-template', JSON.stringify(templateData));
            alert('Modelo salvo com sucesso!');
        } catch (error) {
            console.error('Erro ao salvar template:', error);
            alert('Erro ao salvar modelo.');
        }
    }

    // Carregar template
    loadTemplate() {
        try {
            const savedTemplate = localStorage.getItem('curriculum-template');
            if (savedTemplate) {
                const templateData = JSON.parse(savedTemplate);
                
                // Aplicar dados pessoais
                document.getElementById('personalName').value = templateData.personalData.name || '';
                document.getElementById('personalEmail').value = templateData.personalData.email || '';
                document.getElementById('personalPhone').value = templateData.personalData.phone || '';
                document.getElementById('personalLocation').value = templateData.personalData.location || '';
                document.getElementById('personalBio').value = templateData.personalData.bio || '';
                
                // Aplicar configurações
                document.getElementById('themeSelector').value = templateData.theme || 'modern';
                document.getElementById('twoColumns').checked = templateData.settings.twoColumns;
                document.getElementById('showPhoto').checked = templateData.settings.showPhoto;
                document.getElementById('showIcons').checked = templateData.settings.showIcons;
                
                if (document.getElementById('showColors')) {
                    document.getElementById('showColors').checked = templateData.settings.showColors;
                }
                if (document.getElementById('fontSize')) {
                    document.getElementById('fontSize').value = templateData.settings.fontSize || 14;
                }
                if (document.getElementById('primaryColor')) {
                    document.getElementById('primaryColor').value = templateData.settings.primaryColor || '#3B82F6';
                }
                if (document.getElementById('secondaryColor')) {
                    document.getElementById('secondaryColor').value = templateData.settings.secondaryColor || '#1E40AF';
                }
                
                // Aplicar seções
                document.getElementById('include-github').checked = templateData.sections.github;
                document.getElementById('include-certificates').checked = templateData.sections.certificates;
                document.getElementById('include-projects').checked = templateData.sections.projects;
                document.getElementById('include-games').checked = templateData.sections.games;
                document.getElementById('include-interactive').checked = templateData.sections.interactive;
                document.getElementById('include-mentores').checked = templateData.sections.mentores;
                document.getElementById('include-skills').checked = templateData.sections.skills;
                
                this.currentTheme = templateData.theme || 'modern';
                alert('Modelo carregado com sucesso!');
                
                // Regenerar currículo se houver dados
                if (this.githubData || this.siteData) {
                    this.generateResumeContent();
                }
            } else {
                alert('Nenhum modelo salvo encontrado.');
            }
        } catch (error) {
            console.error('Erro ao carregar template:', error);
            alert('Erro ao carregar modelo.');
        }
    }

    // Preview em nova aba
    previewInNewTab() {
        const previewContent = document.getElementById('resumePreview');
        if (!previewContent || !previewContent.innerHTML.trim()) {
            alert('Gere o currículo primeiro antes de fazer o preview.');
            return;
        }

        const newWindow = window.open('', '_blank');
        newWindow.document.write(`
            <!DOCTYPE html>
            <html lang="pt-BR">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Preview do Currículo</title>
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
                <link rel="stylesheet" href="assets/css/curriculo-generator-styles.css">
                <style>
                    body { 
                        font-family: Arial, sans-serif; 
                        margin: 0; 
                        padding: 20px; 
                        background: #f5f5f5;
                    }
                    .container { 
                        max-width: 800px; 
                        margin: 0 auto; 
                        background: white; 
                        box-shadow: 0 0 20px rgba(0,0,0,0.1);
                        border-radius: 8px;
                        overflow: hidden;
                        padding: 2rem;
                    }
                    @media print {
                        body { background: white; }
                        .container { 
                            box-shadow: none; 
                            border-radius: 0; 
                            padding: 0;
                            max-width: none;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="container theme-${this.currentTheme}">
                    ${previewContent.innerHTML}
                </div>
                <script>
                    // Adicionar botão de impressão
                    document.addEventListener('DOMContentLoaded', function() {
                        const printBtn = document.createElement('button');
                        printBtn.innerHTML = '<i class="fas fa-print"></i> Imprimir';
                        printBtn.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #3B82F6; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; z-index: 1000;';
                        printBtn.onclick = () => window.print();
                        document.body.appendChild(printBtn);
                    });
                </script>
            </body>
            </html>
        `);
        newWindow.document.close();
    }

    // Sistema de Debug
    static debugLog(message, data = null) {
        console.log(`[Curriculum Debug] ${message}`, data || '');
        
        // Adicionar ao console de debug visual
        const debugMessages = document.getElementById('debugMessages');
        if (debugMessages) {
            const messageDiv = document.createElement('div');
            messageDiv.className = 'text-xs text-gray-600';
            messageDiv.innerHTML = `<span class="text-blue-600">[${new Date().toLocaleTimeString()}]</span> ${message}`;
            debugMessages.appendChild(messageDiv);
            debugMessages.scrollTop = debugMessages.scrollHeight;
        }
    }

    static debugError(message, error = null) {
        console.error(`[Curriculum Error] ${message}`, error || '');
        
        const debugMessages = document.getElementById('debugMessages');
        if (debugMessages) {
            const messageDiv = document.createElement('div');
            messageDiv.className = 'text-xs text-red-600';
            messageDiv.innerHTML = `<span class="text-red-700">[${new Date().toLocaleTimeString()}]</span> ERROR: ${message}`;
            debugMessages.appendChild(messageDiv);
            debugMessages.scrollTop = debugMessages.scrollHeight;
        }
    }

    // Função de teste para validar todas as funcionalidades
    runDiagnostic() {
        CurriculumGenerator.debugLog('=== INICIANDO DIAGNÓSTICO COMPLETO ===');
        
        // Teste 1: Verificar elementos essenciais
        const requiredElements = [
            'resumePreview', 'themeSelector', 'personalName', 'personalEmail', 
            'personalPhone', 'personalLocation', 'personalBio', 'debugConsole', 'debugMessages'
        ];
        
        let missingElements = [];
        requiredElements.forEach(id => {
            const element = document.getElementById(id);
            if (!element) {
                missingElements.push(id);
            }
        });
        
        if (missingElements.length > 0) {
            CurriculumGenerator.debugError('Elementos obrigatórios ausentes:', missingElements);
        } else {
            CurriculumGenerator.debugLog('✅ Todos os elementos obrigatórios estão presentes');
        }
        
        // Teste 2: Verificar se o gerador está inicializado
        if (typeof generator !== 'undefined' && generator) {
            CurriculumGenerator.debugLog('✅ Gerador inicializado corretamente');
        } else {
            CurriculumGenerator.debugError('❌ Gerador não inicializado');
        }
        
        // Teste 3: Verificar CSS
        const cssLink = document.querySelector('link[href*="curriculo-generator-styles.css"]');
        if (cssLink) {
            CurriculumGenerator.debugLog('✅ CSS personalizado carregado');
        } else {
            CurriculumGenerator.debugError('❌ CSS personalizado não encontrado');
        }
        
        // Teste 4: Verificar se os estilos estão sendo aplicados
        const previewArea = document.getElementById('resumePreview');
        if (previewArea) {
            const computedStyle = getComputedStyle(previewArea);
            if (computedStyle.padding !== '0px') {
                CurriculumGenerator.debugLog('✅ Estilos CSS sendo aplicados corretamente');
            } else {
                CurriculumGenerator.debugError('❌ Estilos CSS podem não estar sendo aplicados');
            }
        }
        
        // Teste 5: Testar geração básica
        try {
            if (generator) {
                generator.generateResumeContent();
                CurriculumGenerator.debugLog('✅ Geração de currículo executada sem erros');
            }
        } catch (error) {
            CurriculumGenerator.debugError('❌ Erro na geração de currículo:', error);
        }
        
        // Teste 6: Verificar localStorage (para cache)
        try {
            localStorage.setItem('test-item', 'test');
            localStorage.removeItem('test-item');
            CurriculumGenerator.debugLog('✅ LocalStorage funcionando');
        } catch (error) {
            CurriculumGenerator.debugError('❌ Problema com localStorage:', error);
        }
        
        CurriculumGenerator.debugLog('=== DIAGNÓSTICO CONCLUÍDO ===');
    }

    // Verificar se todos os elementos necessários estão presentes
    validateRequiredElements() {
        const requiredElements = [
            'resumePreview',
            'themeSelector',
            'personalName',
            'personalEmail',
            'personalPhone',
            'personalLocation',
            'personalBio'
        ];
        
        const missingElements = [];
        
        requiredElements.forEach(id => {
            const element = document.getElementById(id);
            if (!element) {
                missingElements.push(id);
            }
        });
        
        if (missingElements.length > 0) {
            CurriculumGenerator.debugError('Elementos obrigatórios não encontrados:', missingElements);
            return false;
        }
          CurriculumGenerator.debugLog('Todos os elementos obrigatórios estão presentes');
        return true;
    }

    // ===== MÉTODOS FIREBASE =====
    
    async initializeFirebase() {
        try {
            CurriculumGenerator.debugLog('🔥 Inicializando Firebase...');
            
            // Aguardar a criação da instância global do Firebase
            let attempts = 0;
            const maxAttempts = 10;
            
            while (!window.curriculumFirebase && attempts < maxAttempts) {
                await new Promise(resolve => setTimeout(resolve, 500));
                attempts++;
            }
            
            if (window.curriculumFirebase) {
                this.firebaseService = window.curriculumFirebase;
                CurriculumGenerator.debugLog('✅ Firebase service conectado');
                
                // Configurar auto-save
                this.setupAutoSave();
                
                return true;
            } else {
                CurriculumGenerator.debugError('❌ Firebase service não encontrado após 5s');
                return false;
            }
            
        } catch (error) {
            CurriculumGenerator.debugError('❌ Erro ao inicializar Firebase:', error);
            return false;
        }
    }

    setupAutoSave() {
        if (!this.autoSaveEnabled) return;
        
        // Auto-save a cada 30 segundos
        this.autoSaveInterval = setInterval(() => {
            this.autoSaveCurriculum();
        }, 30000);
        
        // Salvar quando a página for fechada
        window.addEventListener('beforeunload', () => {
            this.saveCurriculumData();
        });
        
        CurriculumGenerator.debugLog('🔄 Auto-save configurado (30s)');
    }

    async saveCurriculumData() {
        if (!this.firebaseService) {
            CurriculumGenerator.debugError('⚠️ Firebase service não disponível para salvar');
            return { success: false, message: 'Firebase não conectado' };
        }

        try {
            // Coletar dados do formulário
            const curriculumData = this.collectFormData();
            
            CurriculumGenerator.debugLog('💾 Salvando currículo...');
            
            const result = await this.firebaseService.saveCurriculum(curriculumData);
            
            if (result.success) {
                this.showNotification('✅ Currículo salvo com sucesso!', 'success');
                CurriculumGenerator.debugLog('✅ Currículo salvo no Firebase');
            } else if (result.offline) {
                this.showNotification('💾 Currículo salvo localmente (offline)', 'warning');
                CurriculumGenerator.debugLog('💾 Currículo salvo offline');
            } else {
                this.showNotification('❌ Erro ao salvar currículo', 'error');
                CurriculumGenerator.debugError('❌ Erro ao salvar:', result.error);
            }
            
            return result;
            
        } catch (error) {
            CurriculumGenerator.debugError('❌ Erro ao salvar currículo:', error);
            this.showNotification('❌ Erro ao salvar currículo', 'error');
            return { success: false, error: error.message };
        }
    }

    async loadSavedCurriculum() {
        if (!this.firebaseService) {
            CurriculumGenerator.debugError('⚠️ Firebase service não disponível para carregar');
            // Gerar currículo básico como fallback
            setTimeout(() => {
                CurriculumGenerator.debugLog('Gerando currículo inicial...');
                this.generateResumeContent();
            }, 500);
            return;
        }

        try {
            CurriculumGenerator.debugLog('📖 Carregando currículo salvo...');
            
            const result = await this.firebaseService.loadCurriculum();
            
            if (result.success && result.data) {
                this.populateFormWithData(result.data);
                
                if (result.source === 'firebase') {
                    this.showNotification('📖 Currículo carregado do Firebase', 'success');
                } else {
                    this.showNotification('💾 Currículo carregado do cache local', 'info');
                }
                
                CurriculumGenerator.debugLog(`✅ Currículo carregado de: ${result.source}`);
                
                // Gerar preview após carregar
                setTimeout(() => {
                    this.generateResumeContent();
                }, 500);
                
            } else {
                CurriculumGenerator.debugLog('📭 Nenhum currículo salvo encontrado');
                this.showNotification('📝 Criando novo currículo', 'info');
                
                // Gerar currículo básico
                setTimeout(() => {
                    this.generateResumeContent();
                }, 500);
            }
            
        } catch (error) {
            CurriculumGenerator.debugError('❌ Erro ao carregar currículo:', error);
            this.showNotification('⚠️ Erro ao carregar. Criando novo currículo.', 'warning');
            
            // Fallback para currículo básico
            setTimeout(() => {
                this.generateResumeContent();
            }, 500);
        }
    }

    collectFormData() {
        return {
            // Dados pessoais
            personalData: {
                name: document.getElementById('personalName')?.value || '',
                email: document.getElementById('personalEmail')?.value || '',
                phone: document.getElementById('personalPhone')?.value || '',
                location: document.getElementById('personalLocation')?.value || '',
                bio: document.getElementById('personalBio')?.value || ''
            },
            
            // Configurações
            settings: {
                theme: this.currentTheme,
                twoColumns: document.getElementById('twoColumns')?.checked || false,
                showPhoto: document.getElementById('showPhoto')?.checked || false,
                showIcons: document.getElementById('showIcons')?.checked || false,
                editMode: document.getElementById('editMode')?.checked || false
            },
            
            // Seções incluídas
            includeSections: {
                github: document.getElementById('includeGithub')?.checked || false,
                projects: document.getElementById('includeProjects')?.checked || false,
                games: document.getElementById('includeGames')?.checked || false,
                interactive: document.getElementById('includeInteractive')?.checked || false,
                certificates: document.getElementById('includeCertificates')?.checked || false,
                skills: document.getElementById('includeSkills')?.checked || false,
                mentors: document.getElementById('includeMentors')?.checked || false
            },
            
            // Dados personalizados
            customContent: JSON.parse(localStorage.getItem('custom-curriculum-content') || '[]'),
            
            // Metadados
            metadata: {
                version: '2.0',
                createdAt: new Date().toISOString(),
                userAgent: navigator.userAgent,
                language: navigator.language
            }
        };
    }

    populateFormWithData(data) {
        try {
            // Preencher dados pessoais
            if (data.personalData) {
                const personalData = data.personalData;
                
                if (personalData.name) document.getElementById('personalName').value = personalData.name;
                if (personalData.email) document.getElementById('personalEmail').value = personalData.email;
                if (personalData.phone) document.getElementById('personalPhone').value = personalData.phone;
                if (personalData.location) document.getElementById('personalLocation').value = personalData.location;
                if (personalData.bio) document.getElementById('personalBio').value = personalData.bio;
            }
            
            // Aplicar configurações
            if (data.settings) {
                const settings = data.settings;
                
                if (settings.theme) {
                    this.currentTheme = settings.theme;
                    const themeSelector = document.getElementById('themeSelector');
                    if (themeSelector) themeSelector.value = settings.theme;
                }
                
                if (settings.twoColumns !== undefined) {
                    const checkbox = document.getElementById('twoColumns');
                    if (checkbox) checkbox.checked = settings.twoColumns;
                }
                
                if (settings.showPhoto !== undefined) {
                    const checkbox = document.getElementById('showPhoto');
                    if (checkbox) checkbox.checked = settings.showPhoto;
                }
                
                if (settings.showIcons !== undefined) {
                    const checkbox = document.getElementById('showIcons');
                    if (checkbox) checkbox.checked = settings.showIcons;
                }
                
                if (settings.editMode !== undefined) {
                    const checkbox = document.getElementById('editMode');
                    if (checkbox) checkbox.checked = settings.editMode;
                    this.isEditMode = settings.editMode;
                }
            }
            
            // Aplicar seções incluídas
            if (data.includeSections) {
                Object.keys(data.includeSections).forEach(section => {
                    const checkbox = document.getElementById(`include${section.charAt(0).toUpperCase() + section.slice(1)}`);
                    if (checkbox) {
                        checkbox.checked = data.includeSections[section];
                    }
                });
            }
            
            // Restaurar conteúdo personalizado
            if (data.customContent && Array.isArray(data.customContent)) {
                localStorage.setItem('custom-curriculum-content', JSON.stringify(data.customContent));
            }
            
            CurriculumGenerator.debugLog('✅ Dados restaurados no formulário');
            
        } catch (error) {
            CurriculumGenerator.debugError('❌ Erro ao restaurar dados no formulário:', error);
        }
    }

    async autoSaveCurriculum() {
        if (!this.firebaseService) return;
        
        try {
            const result = await this.saveCurriculumData();
            
            if (result.success) {
                CurriculumGenerator.debugLog('🔄 Auto-save realizado com sucesso');
            }
            
        } catch (error) {
            CurriculumGenerator.debugError('❌ Erro no auto-save:', error);
        }
    }

    getFirebaseStatus() {
        if (!this.firebaseService) {
            return { connected: false, message: 'Firebase não inicializado' };
        }
        
        return this.firebaseService.getConnectionStatus();
    }

    // Método para salvar manualmente
    async manualSave() {
        const result = await this.saveCurriculumData();
        return result;
    }    // Método para recarregar do Firebase
    async reloadFromFirebase() {
        await this.loadSavedCurriculum();
    }
}

// Funções globais
let generator;

function initializeGenerator() {
    generator = new CurriculumGenerator();
}

function generateResume() {
    generator.generateResumeContent();
}

function loadGitHubData() {
    generator.loadGitHubData();
}

function changeTheme() {
    generator.changeTheme();
}

function toggleEditMode() {
    generator.toggleEditMode();
}

function resetForm() {
    generator.resetForm();
}

function exportToPDF() {
    generator.exportToPDF();
}

function saveToHtml() {
    generator.saveToHtml();
}

function saveTemplate() {
    generator.saveTemplate();
}

function loadTemplate() {
    generator.loadTemplate();
}

// Funções Firebase globais
async function saveCurriculum() {
    if (generator) {
        const result = await generator.manualSave();
        return result;
    }
}

async function loadCurriculum() {
    if (generator) {
        await generator.reloadFromFirebase();
    }
}

function getFirebaseStatus() {
    if (generator) {
        return generator.getFirebaseStatus();
    }
    return { connected: false, message: 'Generator não inicializado' };
}

function previewInNewTab() {
    generator.previewInNewTab();
}

function clearGithubCache() {
    generator.clearGithubCache();
}

// Funções para modo edição avançada
function addCustomSection() {
    showCustomModal('section');
}

function addCustomSkill() {
    showCustomModal('skill');
}

function addCustomProject() {
    showCustomModal('project');
}

function addCustomExperience() {
    showCustomModal('experience');
}

function showCustomModal(type) {
    const modal = document.getElementById('customContentModal');
    const typeSelect = document.getElementById('customContentType');
    
    if (modal && typeSelect) {
        typeSelect.value = type;
        updateCustomFields(type);
        modal.classList.remove('hidden');
        
        // Adicionar event listener para mudanças no tipo
        typeSelect.addEventListener('change', (e) => {
            updateCustomFields(e.target.value);
        });
    }
}

function closeCustomModal() {
    const modal = document.getElementById('customContentModal');
    if (modal) {
        modal.classList.add('hidden');
        clearCustomForm();
    }
}

function updateCustomFields(type) {
    const fieldsContainer = document.getElementById('customFields');
    if (!fieldsContainer) return;
    
    let extraFields = '';
    
    switch(type) {
        case 'project':
            extraFields = `
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Tecnologias</label>
                    <input type="text" id="customTech" class="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Ex: HTML, CSS, JavaScript">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Link (opcional)</label>
                    <input type="url" id="customLink" class="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="https://...">
                </div>
            `;
            break;
        case 'experience':
            extraFields = `
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Empresa</label>
                    <input type="text" id="customCompany" class="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Nome da empresa">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Período</label>
                    <input type="text" id="customPeriod" class="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Ex: Jan 2023 - Atual">
                </div>
            `;
            break;
        case 'education':
            extraFields = `
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Instituição</label>
                    <input type="text" id="customInstitution" class="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Nome da instituição">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Ano</label>
                    <input type="text" id="customYear" class="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Ex: 2023">
                </div>
            `;
            break;
        case 'skill':
            extraFields = `
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Nível</label>
                    <select id="customLevel" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                        <option value="Básico">Básico</option>
                        <option value="Intermediário">Intermediário</option>
                        <option value="Avançado">Avançado</option>
                        <option value="Expert">Expert</option>
                    </select>
                </div>
            `;
            break;
    }
    
    fieldsContainer.innerHTML = extraFields;
}

function addCustomContent() {
    const type = document.getElementById('customContentType').value;
    const title = document.getElementById('customTitle').value;
    const description = document.getElementById('customDescription').value;
    
    if (!title.trim()) {
        alert('Por favor, preencha o título.');
        return;
    }
    
    // Criar objeto de conteúdo customizado
    const customItem = {
        type: type,
        title: title,
        description: description,
        timestamp: Date.now()
    };
    
    // Adicionar campos específicos baseados no tipo
    switch(type) {
        case 'project':
            customItem.technologies = document.getElementById('customTech')?.value || '';
            customItem.link = document.getElementById('customLink')?.value || '';
            break;
        case 'experience':
            customItem.company = document.getElementById('customCompany')?.value || '';
            customItem.period = document.getElementById('customPeriod')?.value || '';
            break;
        case 'education':
            customItem.institution = document.getElementById('customInstitution')?.value || '';
            customItem.year = document.getElementById('customYear')?.value || '';
            break;
        case 'skill':
            customItem.level = document.getElementById('customLevel')?.value || 'Intermediário';
            break;
    }
    
    // Salvar no localStorage
    let customContent = JSON.parse(localStorage.getItem('custom-curriculum-content') || '[]');
    customContent.push(customItem);
    localStorage.setItem('custom-curriculum-content', JSON.stringify(customContent));
    
    // Adicionar aos dados do site para usar na geração
    if (!generator.siteData) {
        generator.siteData = {};
    }
    
    if (!generator.siteData[type + 's']) {
        generator.siteData[type + 's'] = [];
    }
    
    generator.siteData[type + 's'].push(customItem);
    
    generator.showNotification(`${getTypeName(type)} "${title}" adicionado com sucesso!`, 'success');
    
    closeCustomModal();
    
    // Regenerar o currículo
    if (generator && (generator.githubData || generator.siteData)) {
        generator.generateResumeContent();
    }
}

function getTypeName(type) {
    const typeNames = {
        'project': 'Projeto',
        'experience': 'Experiência',
        'education': 'Educação',
        'skill': 'Habilidade',
        'section': 'Seção'
    };
    return typeNames[type] || type;
}

function clearCustomForm() {
    document.getElementById('customTitle').value = '';
    document.getElementById('customDescription').value = '';
    document.getElementById('customFields').innerHTML = '';
}

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', initializeGenerator);
