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
    }

    // Configurar event listeners
    setupEventListeners() {
        // Checkboxes para atualizar preview em tempo real
        const checkboxes = document.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                if (this.githubData || this.siteData) {
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
            mentors: document.getElementById('include-mentors').checked,
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

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', initializeGenerator);
