// Gerador de Currículo - JavaScript Principal
class CurriculumGenerator {
    constructor() {
        this.githubData = null;
        this.siteData = null;
        this.isEditMode = false;
        this.currentTheme = 'modern';
        
        // Inicializar
        this.init();
    }

    init() {
        console.log('Inicializando Gerador de Currículo...');
        this.loadSiteData();
        this.setupEventListeners();
    }    // Configurar event listeners
    setupEventListeners() {
        // Checkboxes para atualizar preview em tempo real
        const checkboxes = document.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                if (this.githubData || this.siteData) {
                    this.generateResumeContent();
                    this.applyCustomStyles();
                }
            });
        });

        // Inputs para atualizar preview em tempo real
        const inputs = document.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"], textarea');
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                if (this.githubData || this.siteData) {
                    this.generateResumeContent();
                    this.applyCustomStyles();
                }
            });
        });

        // Event listeners para ferramentas avançadas
        this.setupAdvancedEventListeners();
    }

    // Configurar event listeners para ferramentas avançadas
    setupAdvancedEventListeners() {
        // Color inputs
        const colorInputs = ['primaryColor', 'secondaryColor'];
        colorInputs.forEach(inputId => {
            const input = document.getElementById(inputId);
            const textInput = document.getElementById(inputId + 'Text');
            
            if (input) {
                input.addEventListener('input', () => {
                    if (textInput) textInput.value = input.value;
                    this.applyCustomStyles();
                });
            }
            
            if (textInput) {
                textInput.addEventListener('input', () => {
                    if (input && this.isValidColor(textInput.value)) {
                        input.value = textInput.value;
                        this.applyCustomStyles();
                    }
                });
            }
        });

        // Range inputs
        const rangeInputs = ['fontSize', 'sectionSpacing', 'borderRadius'];
        rangeInputs.forEach(inputId => {
            const input = document.getElementById(inputId);
            const valueSpan = document.getElementById(inputId + 'Value');
            
            if (input) {
                input.addEventListener('input', () => {
                    if (valueSpan) valueSpan.textContent = input.value + 'px';
                    this.applyCustomStyles();
                });
            }
        });

        // Font family
        const fontFamily = document.getElementById('fontFamily');
        if (fontFamily) {
            fontFamily.addEventListener('change', () => {
                this.applyCustomStyles();
            });
        }
    }

    // Validar cor hexadecimal
    isValidColor(color) {
        return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
    }

    // Aplicar estilos customizados
    applyCustomStyles() {
        const preview = document.getElementById('resumePreview');
        if (!preview) return;

        const primaryColor = document.getElementById('primaryColor')?.value || '#667eea';
        const secondaryColor = document.getElementById('secondaryColor')?.value || '#764ba2';
        const fontSize = document.getElementById('fontSize')?.value || '14';
        const sectionSpacing = document.getElementById('sectionSpacing')?.value || '20';
        const borderRadius = document.getElementById('borderRadius')?.value || '8';
        const fontFamily = document.getElementById('fontFamily')?.value || "'Segoe UI', sans-serif";

        // Aplicar CSS customizado
        preview.style.setProperty('--primary-color', primaryColor);
        preview.style.setProperty('--secondary-color', secondaryColor);
        preview.style.fontSize = fontSize + 'px';
        preview.style.fontFamily = fontFamily;

        // Aplicar aos elementos específicos
        const headers = preview.querySelectorAll('.resume-header');
        headers.forEach(header => {
            header.style.background = `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`;
            header.classList.add('custom-colors');
        });

        const sectionTitles = preview.querySelectorAll('.resume-section h3');
        sectionTitles.forEach(title => {
            title.style.color = primaryColor;
            title.classList.add('custom-colors');
        });

        const sections = preview.querySelectorAll('.resume-section');
        sections.forEach(section => {
            section.style.marginBottom = sectionSpacing + 'px';
            section.style.borderRadius = borderRadius + 'px';
            section.style.borderLeftColor = primaryColor;
            section.classList.add('custom-colors');
        });
    }

    // Carregar dados do GitHub
    async loadGitHubData() {
        this.showLoading(true);
        try {
            const username = 'MikaelFMTS'; // Nome do usuário GitHub
            
            // Buscar dados do perfil
            const profileResponse = await fetch(`https://api.github.com/users/${username}`);
            const profileData = await profileResponse.json();

            // Buscar repositórios
            const reposResponse = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=10`);
            const reposData = await reposResponse.json();

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
            }

            this.githubData = {
                profile: profileData,
                repositories: reposData,
                languages: Object.keys(languages).slice(0, 10)
            };

            // Preencher campos com dados do GitHub
            document.getElementById('personalName').value = profileData.name || profileData.login;
            document.getElementById('personalEmail').value = profileData.email || '';
            document.getElementById('personalLocation').value = profileData.location || '';
            document.getElementById('personalBio').value = profileData.bio || '';

            console.log('Dados do GitHub carregados:', this.githubData);
            this.generateResumeContent();
            
        } catch (error) {
            console.error('Erro ao carregar dados do GitHub:', error);
            alert('Erro ao carregar dados do GitHub. Verifique a conexão com a internet.');
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
    }

    // Gerar conteúdo do currículo
    generateResumeContent() {
        const previewArea = document.getElementById('resumePreview');
        const theme = document.getElementById('themeSelector').value;
        const twoColumns = document.getElementById('twoColumns').checked;
        const showPhoto = document.getElementById('showPhoto').checked;
        const showIcons = document.getElementById('showIcons').checked;

        // Dados pessoais
        const personalData = {
            name: document.getElementById('personalName').value || 'Seu Nome',
            email: document.getElementById('personalEmail').value,
            phone: document.getElementById('personalPhone').value,
            location: document.getElementById('personalLocation').value,
            bio: document.getElementById('personalBio').value
        };

        // Seções incluídas
        const includeSections = {
            github: document.getElementById('include-github').checked,
            certificates: document.getElementById('include-certificates').checked,
            projects: document.getElementById('include-projects').checked,
            games: document.getElementById('include-games').checked,
            interactive: document.getElementById('include-interactive').checked,
            mentors: document.getElementById('include-mentores').checked,
            skills: document.getElementById('include-skills').checked
        };

        // Gerar HTML do currículo
        let resumeHTML = this.generateResumeHTML(personalData, includeSections, theme, twoColumns, showPhoto, showIcons);
        
        // Aplicar tema
        previewArea.className = `border border-gray-300 rounded-lg p-6 min-h-96 bg-white theme-${theme} theme-transition`;
        if (twoColumns) {
            previewArea.classList.add('two-columns');
        } else {
            previewArea.classList.add('one-column');
        }
        
        previewArea.innerHTML = resumeHTML;
        
        // Adicionar animação
        previewArea.classList.add('fade-in');
        setTimeout(() => previewArea.classList.remove('fade-in'), 500);
    }

    // Gerar HTML do currículo
    generateResumeHTML(personalData, includeSections, theme, twoColumns, showPhoto, showIcons) {
        const iconClass = showIcons ? '' : 'hidden';
        const photoHTML = showPhoto && this.githubData?.profile?.avatar_url ? 
            `<img src="${this.githubData.profile.avatar_url}" alt="Foto" class="profile-photo">` : '';

        let html = '';

        if (twoColumns) {
            html = `
                <div class="left-column">
                    ${this.generateHeaderSection(personalData, photoHTML, iconClass)}
                    ${this.generateContactSection(personalData, iconClass)}
                    ${includeSections.skills ? this.generateSkillsSection(iconClass) : ''}
                    ${includeSections.mentors ? this.generateMentorsSection(iconClass) : ''}
                </div>
                <div class="right-column">
                    ${personalData.bio ? this.generateBioSection(personalData.bio, iconClass) : ''}
                    ${includeSections.github ? this.generateGitHubSection(iconClass) : ''}
                    ${includeSections.projects ? this.generateProjectsSection(iconClass) : ''}
                    ${includeSections.games ? this.generateGamesSection(iconClass) : ''}
                    ${includeSections.interactive ? this.generateInteractiveSection(iconClass) : ''}
                    ${includeSections.certificates ? this.generateCertificatesSection(iconClass) : ''}
                </div>
            `;
        } else {
            html = `
                ${this.generateHeaderSection(personalData, photoHTML, iconClass)}
                ${personalData.bio ? this.generateBioSection(personalData.bio, iconClass) : ''}
                ${this.generateContactSection(personalData, iconClass)}
                ${includeSections.skills ? this.generateSkillsSection(iconClass) : ''}
                ${includeSections.github ? this.generateGitHubSection(iconClass) : ''}
                ${includeSections.projects ? this.generateProjectsSection(iconClass) : ''}
                ${includeSections.games ? this.generateGamesSection(iconClass) : ''}
                ${includeSections.interactive ? this.generateInteractiveSection(iconClass) : ''}
                ${includeSections.certificates ? this.generateCertificatesSection(iconClass) : ''}
                ${includeSections.mentors ? this.generateMentorsSection(iconClass) : ''}
            `;
        }

        return html;
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

    showLoadingIndicator(show = true, target = null) {
        const targetElement = target || document.getElementById('resumePreview');
        
        if (show) {
            if (!targetElement.querySelector('.loading-overlay')) {
                const overlay = document.createElement('div');
                overlay.className = 'loading-overlay';
                overlay.innerHTML = `
                    <div class="text-center">
                        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                        <p class="text-gray-600">Processando...</p>
                    </div>
                `;
                targetElement.appendChild(overlay);
            }
        } else {
            const overlay = targetElement.querySelector('.loading-overlay');
            if (overlay) {
                overlay.remove();
            }
        }
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
        document.getElementById('include-mentores').checked = false;
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
        }
    }

    async saveToHtml() {
        try {
            const preview = document.getElementById('resumePreview');
            const theme = this.currentTheme;
            
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
            
            // Também atualizar o arquivo curriculum.html existente
            await this.updateCurriculumPage(preview.innerHTML);
            
        } catch (error) {
            console.error('Erro ao salvar HTML:', error);
            alert('Erro ao salvar arquivo HTML. Tente novamente.');
        }
    }    async updateCurriculumPage(content) {
        try {
            // Salvar no localStorage para ser usado pelo curriculum.html
            const curriculumData = {
                content: content,
                theme: this.currentTheme,
                timestamp: Date.now()
            };
            
            localStorage.setItem('generated-curriculum', JSON.stringify(curriculumData));
            
            // Também tentar atualizar diretamente se estiver na mesma origem
            if (window.opener && !window.opener.closed) {
                try {
                    const curriculumDoc = window.opener.document;
                    const generatedContent = curriculumDoc.getElementById('generated-curriculum-content');
                    if (generatedContent) {
                        generatedContent.innerHTML = content;
                        generatedContent.className = `generated-content theme-${this.currentTheme}`;
                    }
                } catch (error) {
                    console.log('Não foi possível atualizar diretamente a página do currículo:', error);
                }
            }
            
            alert('Currículo salvo com sucesso! O arquivo curriculum.html foi atualizado. Recarregue a página do currículo para ver as alterações.');
            
        } catch (error) {
            console.error('Erro ao atualizar curriculum.html:', error);
            alert('Erro ao atualizar o currículo. Tente novamente.');
        }
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

// Novas funcionalidades para ferramentas avançadas

// Alternar ferramentas avançadas
function toggleAdvancedTools() {
    const advancedTools = document.getElementById('advancedTools');
    const contentTools = document.getElementById('contentTools');
    const exportTools = document.getElementById('exportTools');
    const btn = document.getElementById('advancedToolsBtn');
    
    const isHidden = advancedTools.classList.contains('hidden');
    
    if (isHidden) {
        advancedTools.classList.remove('hidden');
        contentTools.classList.remove('hidden');
        exportTools.classList.remove('hidden');
        btn.innerHTML = '<i class="fas fa-tools mr-1"></i>Básico';
        btn.classList.remove('bg-purple-500', 'hover:bg-purple-600');
        btn.classList.add('bg-red-500', 'hover:bg-red-600');
    } else {
        advancedTools.classList.add('hidden');
        contentTools.classList.add('hidden');
        exportTools.classList.add('hidden');
        btn.innerHTML = '<i class="fas fa-tools mr-1"></i>Avançado';
        btn.classList.remove('bg-red-500', 'hover:bg-red-600');
        btn.classList.add('bg-purple-500', 'hover:bg-purple-600');
    }
}

// Sincronizar inputs de cor com texto
function setupColorInputs() {
    const primaryColor = document.getElementById('primaryColor');
    const primaryColorText = document.getElementById('primaryColorText');
    const secondaryColor = document.getElementById('secondaryColor');
    const secondaryColorText = document.getElementById('secondaryColorText');
    
    if (primaryColor && primaryColorText) {
        primaryColor.addEventListener('input', (e) => {
            primaryColorText.value = e.target.value;
            updatePreviewColors();
        });
        
        primaryColorText.addEventListener('input', (e) => {
            if (isValidColor(e.target.value)) {
                primaryColor.value = e.target.value;
                updatePreviewColors();
            }
        });
    }
    
    if (secondaryColor && secondaryColorText) {
        secondaryColor.addEventListener('input', (e) => {
            secondaryColorText.value = e.target.value;
            updatePreviewColors();
        });
        
        secondaryColorText.addEventListener('input', (e) => {
            if (isValidColor(e.target.value)) {
                secondaryColor.value = e.target.value;
                updatePreviewColors();
            }
        });
    }
}

// Validar cor hexadecimal
function isValidColor(color) {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
}

// Atualizar cores do preview
function updatePreviewColors() {
    const preview = document.getElementById('resumePreview');
    const primaryColor = document.getElementById('primaryColor')?.value || '#667eea';
    const secondaryColor = document.getElementById('secondaryColor')?.value || '#764ba2';
    
    if (preview) {
        preview.style.setProperty('--primary-color', primaryColor);
        preview.style.setProperty('--secondary-color', secondaryColor);
        
        // Aplicar cores aos elementos do tema atual
        const headers = preview.querySelectorAll('.resume-header');
        headers.forEach(header => {
            header.style.background = `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`;
        });
        
        const sections = preview.querySelectorAll('.resume-section h3');
        sections.forEach(section => {
            section.style.color = primaryColor;
        });
    }
}

// Configurar sliders com atualização de valor
function setupSliders() {
    const sliders = ['fontSize', 'sectionSpacing', 'borderRadius'];
    
    sliders.forEach(sliderId => {
        const slider = document.getElementById(sliderId);
        const valueSpan = document.getElementById(sliderId + 'Value');
        
        if (slider && valueSpan) {
            slider.addEventListener('input', (e) => {
                const value = e.target.value;
                valueSpan.textContent = value + 'px';
                updatePreviewStyles();
            });
        }
    });
}

// Atualizar estilos do preview
function updatePreviewStyles() {
    const preview = document.getElementById('resumePreview');
    if (!preview) return;
    
    const fontSize = document.getElementById('fontSize')?.value || '14';
    const sectionSpacing = document.getElementById('sectionSpacing')?.value || '20';
    const borderRadius = document.getElementById('borderRadius')?.value || '8';
    const fontFamily = document.getElementById('fontFamily')?.value || "'Segoe UI', sans-serif";
    
    preview.style.fontSize = fontSize + 'px';
    preview.style.fontFamily = fontFamily;
    
    const sections = preview.querySelectorAll('.resume-section');
    sections.forEach(section => {
        section.style.marginBottom = sectionSpacing + 'px';
        section.style.borderRadius = borderRadius + 'px';
    });
}

// Adicionar seção customizada
function addCustomSection() {
    const title = document.getElementById('customSectionTitle')?.value;
    const content = document.getElementById('customSectionContent')?.value;
    
    if (!title || !content) {
        alert('Por favor, preencha o título e o conteúdo da seção.');
        return;
    }
    
    const preview = document.getElementById('resumePreview');
    if (!preview) return;
    
    const customSection = document.createElement('div');
    customSection.className = 'resume-section custom-section';
    customSection.innerHTML = `
        <h3><i class="fas fa-star mr-2"></i>${title}</h3>
        <p>${content}</p>
        <button onclick="removeCustomSection(this)" class="text-red-500 text-sm mt-2">
            <i class="fas fa-trash mr-1"></i>Remover
        </button>
    `;
    
    preview.appendChild(customSection);
    
    // Limpar campos
    document.getElementById('customSectionTitle').value = '';
    document.getElementById('customSectionContent').value = '';
    
    updatePreviewStyles();
}

// Remover seção customizada
function removeCustomSection(button) {
    const section = button.closest('.custom-section');
    if (section) {
        section.remove();
    }
}

// Carregar template específico
function loadTemplate(templateType) {
    const templates = {
        desenvolvedor: {
            name: 'João Silva',
            email: 'joao.silva@email.com',
            phone: '(11) 99999-9999',
            location: 'São Paulo, SP',
            bio: 'Desenvolvedor Full Stack apaixonado por tecnologia e inovação. Experiência em React, Node.js e metodologias ágeis.',
            skills: ['JavaScript', 'React', 'Node.js', 'Python', 'Docker', 'AWS'],
            customSections: [
                {
                    title: 'Projetos Destacados',
                    content: 'Sistema de e-commerce com React e Node.js\nAPI REST com autenticação JWT\nAplicativo mobile com React Native'
                }
            ]
        },
        designer: {
            name: 'Maria Santos',
            email: 'maria.santos@email.com',
            phone: '(11) 88888-8888',
            location: 'Rio de Janeiro, RJ',
            bio: 'Designer UX/UI criativa com foco em experiência do usuário e design thinking. Especialista em Figma e Adobe Creative Suite.',
            skills: ['Figma', 'Adobe XD', 'Photoshop', 'Illustrator', 'Sketch', 'InVision'],
            customSections: [
                {
                    title: 'Portfolio Destacado',
                    content: 'Redesign de aplicativo bancário (+40% engajamento)\nIdentidade visual para startup tech\nProtótipo de e-commerce B2B'
                }
            ]
        },
        gerente: {
            name: 'Carlos Oliveira',
            email: 'carlos.oliveira@email.com',
            phone: '(11) 77777-7777',
            location: 'Brasília, DF',
            bio: 'Gerente de Projetos com 8+ anos de experiência em metodologias ágeis e liderança de equipes multidisciplinares.',
            skills: ['Scrum', 'Kanban', 'Jira', 'Confluence', 'MS Project', 'Liderança'],
            customSections: [
                {
                    title: 'Conquistas',
                    content: 'Entrega de 15+ projetos no prazo\nRedução de 30% no time-to-market\nLiderança de equipes de até 20 pessoas'
                }
            ]
        },
        freelancer: {
            name: 'Ana Costa',
            email: 'ana.costa@email.com',
            phone: '(11) 66666-6666',
            location: 'Remoto',
            bio: 'Freelancer especializada em desenvolvimento web e consultoria digital. Atendo clientes do Brasil e exterior.',
            skills: ['WordPress', 'Shopify', 'HTML/CSS', 'JavaScript', 'SEO', 'Marketing Digital'],
            customSections: [
                {
                    title: 'Clientes Atendidos',
                    content: '50+ projetos entregues\nClientes em 10+ países\nAvaliação média: 4.9/5 estrelas'
                }
            ]
        }
    };
    
    const template = templates[templateType];
    if (!template) return;
    
    // Preencher campos
    document.getElementById('personalName').value = template.name;
    document.getElementById('personalEmail').value = template.email;
    document.getElementById('personalPhone').value = template.phone;
    document.getElementById('personalLocation').value = template.location;
    document.getElementById('personalBio').value = template.bio;
    
    // Adicionar seções customizadas
    template.customSections.forEach(section => {
        document.getElementById('customSectionTitle').value = section.title;
        document.getElementById('customSectionContent').value = section.content;
        addCustomSection();
    });
    
    // Regenerar currículo
    generateResume();
}

// Salvar como template
function saveAsTemplate() {
    const templateData = {
        name: document.getElementById('personalName')?.value || '',
        email: document.getElementById('personalEmail')?.value || '',
        phone: document.getElementById('personalPhone')?.value || '',
        location: document.getElementById('personalLocation')?.value || '',
        bio: document.getElementById('personalBio')?.value || '',
        theme: document.getElementById('themeSelector')?.value || 'modern',
        settings: {
            primaryColor: document.getElementById('primaryColor')?.value || '#667eea',
            secondaryColor: document.getElementById('secondaryColor')?.value || '#764ba2',
            fontFamily: document.getElementById('fontFamily')?.value || "'Segoe UI', sans-serif",
            fontSize: document.getElementById('fontSize')?.value || '14',
            sectionSpacing: document.getElementById('sectionSpacing')?.value || '20',
            borderRadius: document.getElementById('borderRadius')?.value || '8'
        }
    };
    
    const templateName = prompt('Nome do template:');
    if (templateName) {
        localStorage.setItem(`template_${templateName}`, JSON.stringify(templateData));
        alert('Template salvo com sucesso!');
    }
}

// Carregar template salvo
function loadSavedTemplate() {
    const templates = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('template_')) {
            templates.push(key.replace('template_', ''));
        }
    }
    
    if (templates.length === 0) {
        alert('Nenhum template salvo encontrado.');
        return;
    }
    
    const templateName = prompt(`Templates disponíveis:\n${templates.join('\n')}\n\nDigite o nome do template:`);
    if (templateName) {
        const templateData = localStorage.getItem(`template_${templateName}`);
        if (templateData) {
            const data = JSON.parse(templateData);
            
            // Carregar dados
            document.getElementById('personalName').value = data.name;
            document.getElementById('personalEmail').value = data.email;
            document.getElementById('personalPhone').value = data.phone;
            document.getElementById('personalLocation').value = data.location;
            document.getElementById('personalBio').value = data.bio;
            document.getElementById('themeSelector').value = data.theme;
            
            // Carregar configurações avançadas
            if (data.settings) {
                document.getElementById('primaryColor').value = data.settings.primaryColor;
                document.getElementById('primaryColorText').value = data.settings.primaryColor;
                document.getElementById('secondaryColor').value = data.settings.secondaryColor;
                document.getElementById('secondaryColorText').value = data.settings.secondaryColor;
                document.getElementById('fontFamily').value = data.settings.fontFamily;
                document.getElementById('fontSize').value = data.settings.fontSize;
                document.getElementById('sectionSpacing').value = data.settings.sectionSpacing;
                document.getElementById('borderRadius').value = data.settings.borderRadius;
                
                // Atualizar valores dos sliders
                setupSliders();
            }
            
            // Regenerar currículo
            generateResume();
        } else {
            alert('Template não encontrado.');
        }
    }
}

// Visualizar mudanças em tempo real
function previewChanges() {
    if (generator && (generator.githubData || generator.siteData)) {
        generator.generateResumeContent();
        updatePreviewColors();
        updatePreviewStyles();
    } else {
        alert('Carregue os dados primeiro para visualizar as mudanças.');
    }
}

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', initializeGenerator);

// Inicializar novas funcionalidades
document.addEventListener('DOMContentLoaded', function() {
    // Configurar inputs de cor
    setupColorInputs();
    
    // Configurar sliders
    setupSliders();
    
    // Ocultar ferramentas avançadas inicialmente
    const advancedTools = document.getElementById('advancedTools');
    const contentTools = document.getElementById('contentTools');
    const exportTools = document.getElementById('exportTools');
    
    if (advancedTools) advancedTools.classList.add('hidden');
    if (contentTools) contentTools.classList.add('hidden');
    if (exportTools) exportTools.classList.add('hidden');
    
    // Configurar event listeners para atualização em tempo real
    const fontFamily = document.getElementById('fontFamily');
    if (fontFamily) {
        fontFamily.addEventListener('change', updatePreviewStyles);
    }
    
    // Adicionar efeitos de hover para botões
    addButtonHoverEffects();
    
    // Configurar validação em tempo real
    setupRealTimeValidation();
    
    // Atualizar botões de template favorito
    updateTemplateFavoriteButtons();
    
    // Carregar histórico salvo
    const savedHistory = localStorage.getItem('customizationHistory');
    if (savedHistory) {
        customizationHistory = JSON.parse(savedHistory);
    }
});

// Sistema de Notificações
function showNotification(message, type = 'success') {
    // Remove notificação existente se houver
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    const notification = document.createElement('div');
    notification.className = `notification fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg transition-all duration-300 transform translate-x-full`;
    
    const colors = {
        success: 'bg-green-500 text-white',
        error: 'bg-red-500 text-white',
        warning: 'bg-yellow-500 text-black',
        info: 'bg-blue-500 text-white'
    };
    
    const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    };
    
    notification.className += ` ${colors[type] || colors.info}`;
    notification.innerHTML = `
        <div class="flex items-center gap-2">
            <i class="${icons[type] || icons.info}"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animar entrada
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
    }, 100);
    
    // Remover automaticamente após 4 segundos
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 4000);
}

// Adicionar animações de hover para buttons
function addButtonHoverEffects() {
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-1px)';
            this.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '';
        });
    });
}

// Validação em tempo real para inputs
function setupRealTimeValidation() {
    const emailInput = document.getElementById('personalEmail');
    const phoneInput = document.getElementById('personalPhone');
    
    if (emailInput) {
        emailInput.addEventListener('input', function() {
            const isValid = isValidEmail(this.value) || this.value === '';
            this.style.borderColor = isValid ? '' : '#ef4444';
            
            if (!isValid && this.value !== '') {
                this.setCustomValidity('Email inválido');
            } else {
                this.setCustomValidity('');
            }
        });
    }
    
    if (phoneInput) {
        phoneInput.addEventListener('input', function() {
            const isValid = isValidPhone(this.value) || this.value === '';
            this.style.borderColor = isValid ? '' : '#ef4444';
            
            if (!isValid && this.value !== '') {
                this.setCustomValidity('Telefone inválido');
            } else {
                this.setCustomValidity('');
            }
        });
    }
}

// Sistema de favoritos para templates
let favoriteTemplates = JSON.parse(localStorage.getItem('favoriteTemplates') || '[]');

function toggleTemplateFavorite(templateName) {
    const index = favoriteTemplates.indexOf(templateName);
    if (index > -1) {
        favoriteTemplates.splice(index, 1);
        showNotification(`Template "${templateName}" removido dos favoritos`, 'info');
    } else {
        favoriteTemplates.push(templateName);
        showNotification(`Template "${templateName}" adicionado aos favoritos`, 'success');
    }
    
    localStorage.setItem('favoriteTemplates', JSON.stringify(favoriteTemplates));
    updateTemplateFavoriteButtons();
}

function updateTemplateFavoriteButtons() {
    const templateButtons = document.querySelectorAll('.template-btn');
    templateButtons.forEach(button => {
        const templateName = button.onclick?.toString().match(/loadTemplate\('(.+?)'\)/)?.[1];
        if (templateName) {
            const isFavorite = favoriteTemplates.includes(templateName);
            const icon = button.querySelector('i');
            if (icon) {
                icon.className = isFavorite ? 'fas fa-star mr-1' : icon.className.replace('fa-star', 'fa-code');
            }
        }
    });
}

// Histórico de personalizações
let customizationHistory = [];
const maxHistorySize = 10;

function saveToHistory() {
    const currentState = getCurrentCustomizationState();
    customizationHistory.push(currentState);
    
    if (customizationHistory.length > maxHistorySize) {
        customizationHistory.shift();
    }
    
    localStorage.setItem('customizationHistory', JSON.stringify(customizationHistory));
}

function undoLastCustomization() {
    if (customizationHistory.length > 1) {
        customizationHistory.pop(); // Remove o estado atual
        const previousState = customizationHistory[customizationHistory.length - 1];
        applyCustomizationState(previousState);
        showNotification('Alteração desfeita', 'info');
    } else {
        showNotification('Não há alterações para desfazer', 'warning');
    }
}

function getCurrentCustomizationState() {
    return {
        primaryColor: document.getElementById('primaryColor')?.value,
        secondaryColor: document.getElementById('secondaryColor')?.value,
        fontFamily: document.getElementById('fontFamily')?.value,
        fontSize: document.getElementById('fontSize')?.value,
        sectionSpacing: document.getElementById('sectionSpacing')?.value,
        borderRadius: document.getElementById('borderRadius')?.value,
        timestamp: Date.now()
    };
}

function applyCustomizationState(state) {
    Object.keys(state).forEach(key => {
        if (key !== 'timestamp') {
            const element = document.getElementById(key);
            if (element) {
                element.value = state[key];
                if (key.includes('Color')) {
                    const textElement = document.getElementById(key + 'Text');
                    if (textElement) {
                        textElement.value = state[key];
                    }
                }
            }
        }
    });
    
    applyCustomStyles();
    updateSliderValues();
}

// Comparação de templates
function compareTemplates() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-screen overflow-y-auto">
            <div class="flex justify-between items-center mb-6">
                <h3 class="text-xl font-bold">Comparar Templates</h3>
                <button onclick="this.closest('.fixed').remove()" class="text-gray-500 hover:text-gray-700">
                    <i class="fas fa-times text-xl"></i>
                </button>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="text-center">
                    <h4 class="font-semibold mb-4">Template A</h4>
                    <select id="templateA" class="w-full p-2 border rounded mb-4">
                        <option value="desenvolvedor">Desenvolvedor</option>
                        <option value="designer">Designer</option>
                        <option value="gerente">Gerente</option>
                        <option value="freelancer">Freelancer</option>
                    </select>
                    <div id="previewA" class="border rounded p-4 h-64 bg-gray-50"></div>
                </div>
                <div class="text-center">
                    <h4 class="font-semibold mb-4">Template B</h4>
                    <select id="templateB" class="w-full p-2 border rounded mb-4">
                        <option value="desenvolvedor">Desenvolvedor</option>
                        <option value="designer">Designer</option>
                        <option value="gerente">Gerente</option>
                        <option value="freelancer">Freelancer</option>
                    </select>
                    <div id="previewB" class="border rounded p-4 h-64 bg-gray-50"></div>
                </div>
            </div>
            <div class="text-center mt-6">
                <button onclick="applySelectedTemplate()" class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded">
                    Aplicar Template Selecionado
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Exportação avançada com configurações
function exportWithOptions() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div class="flex justify-between items-center mb-6">
                <h3 class="text-xl font-bold">Opções de Exportação</h3>
                <button onclick="this.closest('.fixed').remove()" class="text-gray-500 hover:text-gray-700">
                    <i class="fas fa-times text-xl"></i>
                </button>
            </div>
            
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium mb-2">Formato</label>
                    <select id="exportFormat" class="w-full p-2 border rounded">
                        <option value="pdf">PDF</option>
                        <option value="html">HTML</option>
                        <option value="docx">Word (DOCX)</option>
                    </select>
                </div>
                
                <div>
                    <label class="block text-sm font-medium mb-2">Qualidade (DPI)</label>
                    <select id="exportQuality" class="w-full p-2 border rounded">
                        <option value="72">Baixa (72 DPI)</option>
                        <option value="150">Média (150 DPI)</option>
                        <option value="300" selected>Alta (300 DPI)</option>
                    </select>
                </div>
                
                <div>
                    <label class="flex items-center">
                        <input type="checkbox" id="includeWatermarkExport" class="mr-2">
                        <span>Incluir marca d'água</span>
                    </label>
                </div>
                
                <div>
                    <label class="flex items-center">
                        <input type="checkbox" id="optimizeSize" checked class="mr-2">
                        <span>Otimizar tamanho do arquivo</span>
                    </label>
                </div>
            </div>
            
            <div class="flex gap-3 mt-6">
                <button onclick="this.closest('.fixed').remove()" 
                        class="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded">
                    Cancelar
                </button>
                <button onclick="executeExport()" 
                        class="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded">
                    Exportar
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function executeExport() {
    const format = document.getElementById('exportFormat').value;
    const quality = document.getElementById('exportQuality').value;
    const includeWatermark = document.getElementById('includeWatermarkExport').checked;
    const optimizeSize = document.getElementById('optimizeSize').checked;
    
    showNotification(`Exportando em formato ${format.toUpperCase()}...`, 'info');
    
    // Fechar modal
    document.querySelector('.fixed').remove();
    
    // Executar exportação baseada no formato
    switch (format) {
        case 'pdf':
            exportToPDF({ quality, includeWatermark, optimizeSize });
            break;
        case 'html':
            saveToHtml({ includeWatermark });
            break;
        case 'docx':
            exportToWord({ quality, includeWatermark });
            break;
    }
}

// Função para mostrar atalhos de teclado
function showShortcuts() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 modal-backdrop';
    modal.innerHTML = `
        <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4 modal-content">
            <div class="flex justify-between items-center mb-6">
                <h3 class="text-xl font-bold">Atalhos de Teclado</h3>
                <button onclick="this.closest('.fixed').remove()" class="text-gray-500 hover:text-gray-700">
                    <i class="fas fa-times text-xl"></i>
                </button>
            </div>
            
            <div class="space-y-3">
                <div class="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span>Salvar template</span>
                    <kbd class="px-2 py-1 bg-gray-200 rounded text-sm">Ctrl + S</kbd>
                </div>
                <div class="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span>Desfazer alteração</span>
                    <kbd class="px-2 py-1 bg-gray-200 rounded text-sm">Ctrl + Z</kbd>
                </div>
                <div class="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span>Exportar currículo</span>
                    <kbd class="px-2 py-1 bg-gray-200 rounded text-sm">Ctrl + E</kbd>
                </div>
                <div class="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span>Fechar modais</span>
                    <kbd class="px-2 py-1 bg-gray-200 rounded text-sm">Esc</kbd>
                </div>
                <div class="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span>Gerar currículo</span>
                    <kbd class="px-2 py-1 bg-gray-200 rounded text-sm">Ctrl + G</kbd>
                </div>
                <div class="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span>Alternar modo edição</span>
                    <kbd class="px-2 py-1 bg-gray-200 rounded text-sm">Ctrl + M</kbd>
                </div>
            </div>
            
            <div class="text-center mt-6">
                <button onclick="this.closest('.fixed').remove()" 
                        class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded hover-lift">
                    Entendi
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Adicionar mais atalhos de teclado
document.addEventListener('keydown', function(e) {
    // Ctrl+S para salvar
    if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        saveAsTemplate();
        showNotification('Template salvo!', 'success');
    }
    
    // Ctrl+Z para desfazer
    if (e.ctrlKey && e.key === 'z') {
        e.preventDefault();
        undoLastCustomization();
    }
    
    // Ctrl+E para exportar
    if (e.ctrlKey && e.key === 'e') {
        e.preventDefault();
        exportWithOptions();
    }
    
    // Ctrl+G para gerar currículo
    if (e.ctrlKey && e.key === 'g') {
        e.preventDefault();
        generateResume();
    }
    
    // Ctrl+M para alternar modo edição
    if (e.ctrlKey && e.key === 'm') {
        e.preventDefault();
        toggleEditMode();
    }
    
    // Esc para fechar modais
    if (e.key === 'Escape') {
        const modals = document.querySelectorAll('.fixed.inset-0');
        modals.forEach(modal => modal.remove());
    }
});

// Melhorar função de exportação para Word
function exportToWord(options = {}) {
    showNotification('Preparando exportação para Word...', 'info');
    showLoadingIndicator(true);
    
    setTimeout(() => {
        try {
            const resumeContent = document.getElementById('resumePreview').innerHTML;
            
            // Criar um documento HTML simplificado para Word
            const wordContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <title>Currículo</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        .section { margin-bottom: 20px; }
                        .section-title { font-size: 18px; font-weight: bold; margin-bottom: 10px; }
                        .item { margin-bottom: 10px; }
                        .contact-info { display: flex; flex-wrap: wrap; gap: 20px; }
                    </style>
                </head>
                <body>
                    ${resumeContent}
                </body>
                </html>
            `;
            
            // Criar blob e download
            const blob = new Blob([wordContent], { 
                type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'curriculo.doc';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            showNotification('Arquivo Word gerado com sucesso!', 'success');
        } catch (error) {
            console.error('Erro ao exportar para Word:', error);
            showNotification('Erro ao gerar arquivo Word', 'error');
        } finally {
            showLoadingIndicator(false);
        }
    }, 1000);
}

// Sistema de backup automático
function setupAutoBackup() {
    setInterval(() => {
        const currentState = getCurrentFullState();
        const backups = JSON.parse(localStorage.getItem('autoBackups') || '[]');
        
        backups.unshift({
            timestamp: Date.now(),
            state: currentState
        });
        
        // Manter apenas os últimos 5 backups
        if (backups.length > 5) {
            backups.splice(5);
        }
        
        localStorage.setItem('autoBackups', JSON.stringify(backups));
    }, 5 * 60 * 1000); // Backup a cada 5 minutos
}

function getCurrentFullState() {
    return {
        theme: document.getElementById('themeSelector')?.value,
        personalInfo: {
            name: document.getElementById('personalName')?.value,
            email: document.getElementById('personalEmail')?.value,
            phone: document.getElementById('personalPhone')?.value,
            location: document.getElementById('personalLocation')?.value,
            bio: document.getElementById('personalBio')?.value
        },
        customization: getCurrentCustomizationState(),
        layout: {
            showPhoto: document.getElementById('showPhoto')?.checked,
            twoColumns: document.getElementById('twoColumns')?.checked,
            showIcons: document.getElementById('showIcons')?.checked,
            showBorders: document.getElementById('showBorders')?.checked,
            showShadows: document.getElementById('showShadows')?.checked
        },
        includes: {
            github: document.getElementById('include-github')?.checked,
            certificates: document.getElementById('include-certificates')?.checked,
            projects: document.getElementById('include-projects')?.checked,
            games: document.getElementById('include-games')?.checked,
            interactive: document.getElementById('include-interactive')?.checked,
            mentors: document.getElementById('include-mentores')?.checked,
            skills: document.getElementById('include-skills')?.checked
        }
    };
}

function showBackupManager() {
    const backups = JSON.parse(localStorage.getItem('autoBackups') || '[]');
    
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 modal-backdrop';
    modal.innerHTML = `
        <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4 modal-content">
            <div class="flex justify-between items-center mb-6">
                <h3 class="text-xl font-bold">Backups Automáticos</h3>
                <button onclick="this.closest('.fixed').remove()" class="text-gray-500 hover:text-gray-700">
                    <i class="fas fa-times text-xl"></i>
                </button>
            </div>
            
            <div class="space-y-3 max-h-64 overflow-y-auto">
                ${backups.map((backup, index) => `
                    <div class="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <div>
                            <div class="font-medium">Backup ${index + 1}</div>
                            <div class="text-sm text-gray-500">${new Date(backup.timestamp).toLocaleString()}</div>
                        </div>
                        <button onclick="restoreBackup(${index})" 
                                class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm">
                            Restaurar
                        </button>
                    </div>
                `).join('')}
                ${backups.length === 0 ? '<p class="text-center text-gray-500">Nenhum backup disponível</p>' : ''}
            </div>
            
            <div class="text-center mt-6">
                <button onclick="this.closest('.fixed').remove()" 
                        class="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded hover-lift">
                    Fechar
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function restoreBackup(index) {
    const backups = JSON.parse(localStorage.getItem('autoBackups') || '[]');
    if (backups[index]) {
        applyFullState(backups[index].state);
        showNotification('Backup restaurado com sucesso!', 'success');
        document.querySelector('.fixed').remove();
    }
}

function applyFullState(state) {
    // Aplicar tema
    if (state.theme && document.getElementById('themeSelector')) {
        document.getElementById('themeSelector').value = state.theme;
    }
    
    // Aplicar informações pessoais
    if (state.personalInfo) {
        Object.keys(state.personalInfo).forEach(key => {
            const element = document.getElementById(`personal${key.charAt(0).toUpperCase() + key.slice(1)}`);
            if (element && state.personalInfo[key]) {
                element.value = state.personalInfo[key];
            }
        });
    }
    
    // Aplicar customização
    if (state.customization) {
        applyCustomizationState(state.customization);
    }
    
    // Aplicar layout
    if (state.layout) {
        Object.keys(state.layout).forEach(key => {
            const element = document.getElementById(key);
            if (element) {
                element.checked = state.layout[key];
            }
        });
    }
    
    // Aplicar includes
    if (state.includes) {
        Object.keys(state.includes).forEach(key => {
            const element = document.getElementById(`include-${key}`);
            if (element) {
                element.checked = state.includes[key];
            }
        });
    }
    
    // Regenerar currículo se houver dados
    if (generator.githubData || generator.siteData) {
        generateResume();
    }
}

// Sistema de estatísticas de uso
let usageStats = JSON.parse(localStorage.getItem('usageStats') || '{}');

function trackUsage(action) {
    const today = new Date().toDateString();
    
    if (!usageStats[today]) {
        usageStats[today] = {};
    }
    
    if (!usageStats[today][action]) {

        usageStats[today][action] = 0;
    }
    
    usageStats[today][action]++;
    localStorage.setItem('usageStats', JSON.stringify(usageStats));
}

function showStats() {
    const stats = calculateStats();
    
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 modal-backdrop';
    modal.innerHTML = `
        <div class="bg-white rounded-lg p-6 max-w-lg w-full mx-4 modal-content">
            <div class="flex justify-between items-center mb-6">
                <h3 class="text-xl font-bold">Estatísticas de Uso</h3>
                <button onclick="this.closest('.fixed').remove()" class="text-gray-500 hover:text-gray-700">
                    <i class="fas fa-times text-xl"></i>
                </button>
            </div>
            
            <div class="grid grid-cols-2 gap-4 mb-6">
                <div class="bg-blue-50 p-4 rounded-lg text-center">
                    <div class="text-2xl font-bold text-blue-600">${stats.totalGenerations}</div>
                    <div class="text-sm text-gray-600">Currículos Gerados</div>
                </div>
                <div class="bg-green-50 p-4 rounded-lg text-center">
                    <div class="text-2xl font-bold text-green-600">${stats.totalExports}</div>
                    <div class="text-sm text-gray-600">Exportações</div>
                </div>
                <div class="bg-purple-50 p-4 rounded-lg text-center">
                    <div class="text-2xl font-bold text-purple-600">${stats.templatesUsed}</div>
                    <div class="text-sm text-gray-600">Templates Usados</div>
                </div>
                <div class="bg-orange-50 p-4 rounded-lg text-center">
                    <div class="text-2xl font-bold text-orange-600">${stats.daysActive}</div>
                    <div class="text-sm text-gray-600">Dias Ativos</div>
                </div>
            </div>
            
            <div class="mb-6">
                <h4 class="font-semibold mb-3">Ações Mais Usadas</h4>
                <div class="space-y-2">
                    ${stats.topActions.map(action => `
                        <div class="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <span class="capitalize">${action.name.replace(/([A-Z])/g, ' $1').trim()}</span>
                            <span class="font-semibold">${action.count}x</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="mb-6">
                <h4 class="font-semibold mb-3">Uso nos Últimos 7 Dias</h4>
                <div class="h-24 bg-gray-50 rounded p-2 flex items-end justify-between">
                    ${stats.weeklyData.map((day, index) => `
                        <div class="flex flex-col items-center">
                            <div class="bg-blue-500 rounded-t" style="height: ${Math.max(2, (day.total / Math.max(...stats.weeklyData.map(d => d.total)) * 60))}px; width: 20px;"></div>
                            <div class="text-xs mt-1">${day.day}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="text-center">
                <button onclick="this.closest('.fixed').remove()" 
                        class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded hover-lift">
                    Fechar
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function calculateStats() {
    const stats = {
        totalGenerations: 0,
        totalExports: 0,
        templatesUsed: 0,
        daysActive: Object.keys(usageStats).length,
        topActions: [],
        weeklyData: []
    };
    
    const actionCounts = {};
    
    // Calcular totais
    Object.values(usageStats).forEach(dayStats => {
        Object.entries(dayStats).forEach(([action, count]) => {
            if (action === 'generateResume') stats.totalGenerations += count;
            if (action.includes('export') || action.includes('Export')) stats.totalExports += count;
            if (action.includes('template') || action.includes('Template')) stats.templatesUsed += count;
            
            actionCounts[action] = (actionCounts[action] || 0) + count;
        });
    });
    
    // Top 5 ações
    stats.topActions = Object.entries(actionCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }));
    
    // Dados da semana passada
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toDateString();
        
        const dayTotal = Object.values(usageStats[dateStr] || {})
            .reduce((sum, count) => sum + count, 0);
            
        last7Days.push({
            day: date.toLocaleDateString('pt-BR', { weekday: 'short' }),
            total: dayTotal
        });
    }
    stats.weeklyData = last7Days;
    
    return stats;
}

// Sistema de dicas contextuais
function showContextualTip() {
    const tips = [
        {
            condition: () => document.getElementById('personalName').value === '',
            message: '💡 Dica: Preencha seu nome para personalizar o currículo!',
            type: 'info'
        },
        {
            condition: () => !document.getElementById('include-github').checked,
            message: '🚀 Dica: Ative o GitHub para mostrar seus repositórios!',
            type: 'info'
        },
        {
            condition: () => document.getElementById('themeSelector').value === 'modern',
            message: '🎨 Experimente outros temas na seção de configurações!',
            type: 'info'
        },
        {
            condition: () => {
                const stats = calculateStats();
                return stats.totalGenerations > 5;
            },
            message: '⭐ Você já gerou vários currículos! Que tal salvar um template personalizado?',
            type: 'success'
        }
    ];
    
    const validTips = tips.filter(tip => tip.condition());
    if (validTips.length > 0) {
        const randomTip = validTips[Math.floor(Math.random() * validTips.length)];
        showNotification(randomTip.message, randomTip.type);
    }
}

// Sistema de tema escuro/claro
function toggleDarkMode() {
    const isDark = document.body.classList.contains('dark-mode');
    const icon = document.getElementById('darkModeIcon');
    
    if (isDark) {
        document.body.classList.remove('dark-mode');
        icon.className = 'fas fa-moon';
        localStorage.setItem('darkMode', 'false');
        showNotification('Modo claro ativado', 'info');
    } else {
        document.body.classList.add('dark-mode');
        icon.className = 'fas fa-sun';
        localStorage.setItem('darkMode', 'true');
        showNotification('Modo escuro ativado', 'info');
    }
}

// Performance monitor
function monitorPerformance() {
    const startTime = performance.now();
    
    return {
        end: function(actionName) {
            const endTime = performance.now();
            const duration = endTime - startTime;
            
            console.log(`Performance: ${actionName} levou ${duration.toFixed(2)}ms`);
            
            if (duration > 1000) {
                showNotification('Operação demorou mais que o esperado. Verifique sua conexão.', 'warning');
            }
            
            return duration;
        }
    };
}

// Otimizar funções existentes com tracking
const originalGenerateResume = window.generateResume;
window.generateResume = function() {
    trackUsage('generateResume');
    const monitor = monitorPerformance();
    
    if (originalGenerateResume) {
        const result = originalGenerateResume.apply(this, arguments);
        monitor.end('generateResume');
        return result;
    }
};

const originalExportToPDF = window.exportToPDF;
window.exportToPDF = function() {
    trackUsage('exportToPDF');
    const monitor = monitorPerformance();
    
    if (originalExportToPDF) {
        const result = originalExportToPDF.apply(this, arguments);
        monitor.end('exportToPDF');
        return result;
    }
};

const originalLoadTemplate = window.loadTemplate;
window.loadTemplate = function(templateName) {
    trackUsage('loadTemplate');
    trackUsage(`template_${templateName}`);
    
    if (originalLoadTemplate) {
        return originalLoadTemplate.apply(this, arguments);
    }
};

// Mostrar dica contextual após algum tempo
setTimeout(showContextualTip, 10000);

// Verificar modo escuro salvo
document.addEventListener('DOMContentLoaded', function() {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode === 'true') {
        document.body.classList.add('dark-mode');
    }
});