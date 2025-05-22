// Gerenciamento de funcionalidades avançadas

// ----- SISTEMA DE FILTRAGEM DE PROJETOS -----
class ProjectFilter {
    constructor() {
        this.projects = [];
        this.filters = {
            category: 'all',
            technology: 'all',
            searchTerm: ''
        };
    }

    init() {
        // Coleta todos os projetos
        this.projects = Array.from(document.querySelectorAll('.projeto'));
        
        // Inicializa os seletores de filtro
        this.initFilterUI();
        
        // Aplica filtros iniciais
        this.applyFilters();
    }

    initFilterUI() {
        // Verifique se o container de filtros já existe
        let filterContainer = document.getElementById('project-filters');
        
        // Se não existir, crie um novo
        if (!filterContainer) {
            const projectsSection = document.getElementById('projetos');
            
            if (projectsSection) {
                filterContainer = document.createElement('div');
                filterContainer.id = 'project-filters';
                filterContainer.className = 'filter-container';
                
                // Inserir o container de filtros após o título da seção
                const h2 = projectsSection.querySelector('h2');
                if (h2) {
                    h2.parentNode.insertBefore(filterContainer, h2.nextSibling);
                } else {
                    projectsSection.prepend(filterContainer);
                }
            } else {
                console.warn('Seção de projetos não encontrada.');
                return;
            }
        }

        // Popular o container com os controles de filtro
        filterContainer.innerHTML = `
            <div class="filter-group">
                <label for="filter-category">Categoria:</label>
                <select id="filter-category">
                    <option value="all">Todas</option>
                    <option value="DISCORD PROJECTS">Discord</option>
                    <option value="BOTS">Bots</option>
                    <option value="APIs">APIs</option>
                    <option value="OTHERS">Outros</option>
                </select>
            </div>
            
            <div class="filter-group">
                <label for="filter-technology">Tecnologia:</label>
                <select id="filter-technology">
                    <option value="all">Todas</option>
                    <option value="javascript">JavaScript</option>
                    <option value="python">Python</option>
                    <option value="java">Java</option>
                    <option value="html">HTML/CSS</option>
                </select>
            </div>
            
            <div class="filter-group">
                <label for="filter-search">Buscar:</label>
                <input type="text" id="filter-search" placeholder="Digite para buscar...">
            </div>
        `;

        // Adicionar event listeners
        document.getElementById('filter-category').addEventListener('change', () => {
            this.filters.category = document.getElementById('filter-category').value;
            this.applyFilters();
        });

        document.getElementById('filter-technology').addEventListener('change', () => {
            this.filters.technology = document.getElementById('filter-technology').value;
            this.applyFilters();
        });

        document.getElementById('filter-search').addEventListener('input', () => {
            this.filters.searchTerm = document.getElementById('filter-search').value.toLowerCase();
            this.applyFilters();
        });
    }

    applyFilters() {
        // Para cada projeto, verifica se deve ser exibido ou ocultado
        this.projects.forEach(project => {
            let show = true;
            
            // Filtro de categoria
            if (this.filters.category !== 'all') {
                const projectCategory = project.closest('.categoria')?.querySelector('h3')?.textContent;
                
                if (!projectCategory || projectCategory !== this.filters.category) {
                    show = false;
                }
            }
            
            // Filtro de tecnologia
            if (show && this.filters.technology !== 'all') {
                const projectDescription = project.textContent.toLowerCase();
                const techMatches = {
                    'javascript': ['javascript', 'js', 'node'],
                    'python': ['python', 'py', 'django', 'flask'],
                    'java': ['java', 'spring', 'kotlin'],
                    'html': ['html', 'css', 'web']
                };
                
                const keywords = techMatches[this.filters.technology] || [this.filters.technology];
                
                if (!keywords.some(keyword => projectDescription.includes(keyword))) {
                    show = false;
                }
            }
            
            // Filtro de busca
            if (show && this.filters.searchTerm) {
                const projectText = project.textContent.toLowerCase();
                
                if (!projectText.includes(this.filters.searchTerm)) {
                    show = false;
                }
            }
            
            // Aplicar visibilidade
            project.style.display = show ? '' : 'none';
            
            // Se estiver escondido, também esconde o título da categoria se todos os projetos dela estiverem escondidos
            if (!show) {
                const categoria = project.closest('.categoria');
                const projetosVisiveis = categoria.querySelectorAll('.projeto[style="display: none;"]');
                
                if (projetosVisiveis.length === categoria.querySelectorAll('.projeto').length) {
                    categoria.style.display = 'none';
                } else {
                    categoria.style.display = '';
                }
            }
        });
        
        // Verificar se algum projeto está visível
        const visibleProjects = this.projects.filter(p => p.style.display !== 'none');
        
        // Mostrar mensagem se nenhum projeto estiver visível
        let noResultsMessage = document.getElementById('no-projects-message');
        
        if (visibleProjects.length === 0) {
            if (!noResultsMessage) {
                noResultsMessage = document.createElement('div');
                noResultsMessage.id = 'no-projects-message';
                noResultsMessage.className = 'no-results';
                noResultsMessage.innerHTML = `
                    <i class="fas fa-search"></i>
                    <p>Nenhum projeto encontrado com os filtros atuais.</p>
                    <button id="reset-filters">Limpar filtros</button>
                `;
                
                const projectsSection = document.getElementById('projetos');
                projectsSection.appendChild(noResultsMessage);
                
                document.getElementById('reset-filters').addEventListener('click', () => this.resetFilters());
            } else {
                noResultsMessage.style.display = 'flex';
            }
        } else if (noResultsMessage) {
            noResultsMessage.style.display = 'none';
        }
    }

    resetFilters() {
        // Resetar os valores dos filtros
        document.getElementById('filter-category').value = 'all';
        document.getElementById('filter-technology').value = 'all';
        document.getElementById('filter-search').value = '';
        
        // Atualizar o objeto de filtros
        this.filters = {
            category: 'all',
            technology: 'all',
            searchTerm: ''
        };
        
        // Reaplicar filtros (mostrar todos)
        this.applyFilters();
        
        // Mostrar todas as categorias
        document.querySelectorAll('.categoria').forEach(cat => {
            cat.style.display = '';
        });
    }
}

// ----- SISTEMA DE TRADUÇÃO MULTI-IDIOMA -----
class LanguageTranslator {
    constructor() {
        this.currentLanguage = 'pt-BR';
        this.availableLanguages = ['pt-BR', 'en-US', 'es-ES'];
        this.translations = {
            // Português (Brasil) - padrão
            'pt-BR': {},
            
            // Inglês (EUA)
            'en-US': {
                // Navegação
                'Curriculum': 'Resume',
                'All Uploaded Projects': 'All Projects',
                'Mentors': 'Mentors',
                'Certificates in progress': 'Ongoing Certificates',
                
                // Cabeçalho
                'Dev Jr. - Cyber Security': 'Jr. Dev - Cyber Security',
                
                // Seções
                'Technical Skills': 'Technical Skills',
                'Featured Projects': 'Featured Projects',
                'My Social Media': 'Social Media',
                
                // Habilidades
                'Back-end Development': 'Back-end Development',
                'Front-end Development': 'Front-end Development',
                'Cyber Security': 'Cyber Security',
                'Network Security': 'Network Security',
                'Penetration Testing': 'Penetration Testing',
                
                // Projetos
                'DISCORD PROJECTS': 'DISCORD PROJECTS',
                'BOTS': 'BOTS',
                'APIs': 'APIs',
                'OTHERS': 'OTHERS',
                'Ver no GitHub': 'View on GitHub',
                'See All Projects': 'See All Projects',
                'API for user management': 'User management API',
                'A RESTful API for managing users and authentication.': 'A RESTful API for managing users and authentication.',
                'SCRIPT FOR YOUR PROFILE WEBSITE - SIMPLE': 'SIMPLE PROFILE WEBSITE SCRIPT',
                'A script to create a simple profile website.': 'A script to create a simple profile website.',
                'Code for creating BOT (discord.py)': 'BOT creation code (discord.py)',
                'Filters selected messages from one channel and sends them to another channel automatically.': 'Automatically filters and forwards selected messages between Discord channels.',
                'LINKING - DISCORDSRV': 'LINKING - DISCORDSRV',
                'Linking the DiscordSRV plugin, to facilitate the administration of SPIGOT servers.': 'Integration with the DiscordSRV plugin to facilitate SPIGOT server administration.',
                
                // Chatbot
                'Talk with my bot!': 'Chat with my bot!',
                'Digite sua mensagem...': 'Type your message...',
                'Enviar': 'Send',
                'Você:': 'You:',
                'Bot: Em breve, serei conectado a uma API! Fale com o fundador através do email: mikaelmatos.adm@gmail.com': 'Bot: Soon, I will be connected to an API! Contact the founder via email: mikaelmatos.adm@gmail.com',
                
                // Filtros
                'Categoria:': 'Category:',
                'Todas': 'All',
                'Tecnologia:': 'Technology:',
                'Buscar:': 'Search:',
                'Digite para buscar...': 'Type to search...',
                'Nenhum projeto encontrado com os filtros atuais.': 'No projects found with the current filters.',
                'Limpar filtros': 'Clear filters',
                
                // GitHub Stats
                'Repositórios': 'Repositories',
                'Ver Perfil': 'View Profile',
                
                // Notificações
                'Notificações ativadas': 'Notifications enabled',
                'Ativar notificações': 'Enable notifications',
                
                // Demonstrações interativas
                'Demonstrações Interativas': 'Interactive Demos',
                'Experimente minhas habilidades em JavaScript': 'Try my JavaScript skills',
                'Iniciar Demo': 'Start Demo',
                
                // Erros
                'Não foi possível carregar os dados do GitHub.': 'Could not load GitHub data.',
                'Tente novamente mais tarde ou verifique a conexão.': 'Try again later or check your connection.',
                'Não foi possível carregar os dados de linguagens.': 'Could not load language data.',
                
                // Tecnologias emergentes
                'Tecnologias Emergentes': 'Emerging Technologies',
                'Áreas de interesse e aprendizado': 'Areas of interest and learning',
                'Inteligência Artificial': 'Artificial Intelligence',
                'Blockchain': 'Blockchain',
                'Computação Quântica': 'Quantum Computing',
                'Realidade Virtual': 'Virtual Reality',
                'Aprendizado de Máquina': 'Machine Learning',
                'Eu tenho conhecimento básico de IA e explorei conceitos como redes neurais e aprendizado de máquina.': "I have basic knowledge of AI and have explored concepts like neural networks and machine learning."
            },
            
            // Espanhol
            'es-ES': {
                // Navegação
                'Curriculum': 'Currículum',
                'All Uploaded Projects': 'Todos los Proyectos',
                'Mentors': 'Mentores',
                'Certificates in progress': 'Certificados en Progreso',
                
                // Cabeçalho
                'Dev Jr. - Cyber Security': 'Dev Jr. - Seguridad Cibernética',
                
                // Seções
                'Technical Skills': 'Habilidades Técnicas',
                'Featured Projects': 'Proyectos Destacados',
                'My Social Media': 'Redes Sociales',
                
                // Habilidades
                'Back-end Development': 'Desarrollo Back-end',
                'Front-end Development': 'Desarrollo Front-end',
                'Cyber Security': 'Seguridad Cibernética',
                'Network Security': 'Seguridad de Red',
                'Penetration Testing': 'Pruebas de Penetración',
                
                // Projetos
                'DISCORD PROJECTS': 'PROYECTOS DE DISCORD',
                'BOTS': 'BOTS',
                'APIs': 'APIs',
                'OTHERS': 'OTROS',
                'Ver no GitHub': 'Ver en GitHub',
                'See All Projects': 'Ver Todos los Proyectos',
                'API for user management': 'API para gestión de usuarios',
                'A RESTful API for managing users and authentication.': 'Una API RESTful para gestionar usuarios y autenticación.',
                'SCRIPT FOR YOUR PROFILE WEBSITE - SIMPLE': 'SCRIPT SIMPLE PARA SITIO WEB DE PERFIL',
                'A script to create a simple profile website.': 'Un script para crear un sitio web de perfil simple.',
                'Code for creating BOT (discord.py)': 'Código para crear BOT (discord.py)',
                'Filters selected messages from one channel and sends them to another channel automatically.': 'Filtra mensajes seleccionados de un canal y los envía a otro canal automáticamente.',
                'LINKING - DISCORDSRV': 'ENLACE - DISCORDSRV',
                'Linking the DiscordSRV plugin, to facilitate the administration of SPIGOT servers.': 'Vinculación del plugin DiscordSRV para facilitar la administración de servidores SPIGOT.',
                
                // Chatbot
                'Talk with my bot!': '¡Habla con mi bot!',
                'Digite sua mensagem...': 'Escribe tu mensaje...',
                'Enviar': 'Enviar',
                'Você:': 'Tú:',
                'Bot: Em breve, serei conectado a uma API! Fale com o fundador através do email: mikaelmatos.adm@gmail.com': 'Bot: ¡Pronto estaré conectado a una API! Contacta al fundador por correo: mikaelmatos.adm@gmail.com',
                
                // Filtros
                'Categoria:': 'Categoría:',
                'Todas': 'Todas',
                'Tecnologia:': 'Tecnología:',
                'Buscar:': 'Buscar:',
                'Digite para buscar...': 'Escribe para buscar...',
                'Nenhum projeto encontrado com os filtros atuais.': 'No se encontraron proyectos con los filtros actuales.',
                'Limpar filtros': 'Limpiar filtros',
                
                // GitHub Stats
                'Repositórios': 'Repositorios',
                'Ver Perfil': 'Ver Perfil',
                
                // Notificações
                'Notificações ativadas': 'Notificaciones activadas',
                'Ativar notificações': 'Activar notificaciones',
                
                // Demonstrações interativas
                'Demonstrações Interativas': 'Demostraciones Interactivas',
                'Experimente minhas habilidades em JavaScript': 'Prueba mis habilidades en JavaScript',
                'Iniciar Demo': 'Iniciar Demo',
                
                // Erros
                'Não foi possível carregar os dados do GitHub.': 'No se pudieron cargar los datos de GitHub.',
                'Tente novamente mais tarde ou verifique a conexão.': 'Inténtalo de nuevo más tarde o verifica tu conexión.',
                'Não foi possível carregar os dados de linguagens.': 'No se pudieron cargar los datos de lenguajes.',
                
                // Tecnologias emergentes
                'Tecnologias Emergentes': 'Tecnologías Emergentes',
                'Áreas de interesse e aprendizado': 'Áreas de interés y aprendizaje',
                'Inteligência Artificial': 'Inteligencia Artificial',
                'Blockchain': 'Blockchain',
                'Computação Quântica': 'Computación Cuántica',
                'Realidade Virtual': 'Realidad Virtual',
                'Aprendizado de Máquina': 'Aprendizaje Automático',
                'Eu tenho conhecimento básico de IA e explorei conceitos como redes neurais e aprendizado de máquina.': "Tengo conocimientos básicos de IA y he explorado conceptos como redes neuronales y aprendizaje automático."
            }
        };
    }

    // Inicializar sistema de tradução
    init() {
        // Verificar se há preferência salva de idioma
        const savedLanguage = localStorage.getItem('language');
        if (savedLanguage && this.availableLanguages.includes(savedLanguage)) {
            this.currentLanguage = savedLanguage;
        }

        // Criar seletor de idiomas se não existir
        this.createLanguageSwitcher();
        
        // Aplicar traduções
        this.translatePage();
    }

    // Criar o seletor de idiomas
    createLanguageSwitcher() {
        // Verificar se já existe o seletor
        if (document.getElementById('language-switcher')) {
            return;
        }
        
        // Criar elemento
        const languageSwitcher = document.createElement('div');
        languageSwitcher.id = 'language-switcher';
        languageSwitcher.className = 'language-switcher';
        
        // Adicionar opções de idiomas
        const languageOptions = {
            'pt-BR': '🇧🇷 PT',
            'en-US': '🇺🇸 EN',
            'es-ES': '🇪🇸 ES'
        };
        
        languageSwitcher.innerHTML = Object.entries(languageOptions)
            .map(([code, label]) => {
                const isActive = code === this.currentLanguage ? 'active' : '';
                return `<button class="lang-btn ${isActive}" data-lang="${code}">${label}</button>`;
            })
            .join('');
        
        // Adicionar ao DOM (ao lado do botão de tema)
        const themeToggle = document.getElementById('theme-toggle');
        
        if (themeToggle && themeToggle.parentNode) {
            themeToggle.parentNode.insertBefore(languageSwitcher, themeToggle);
        } else {
            document.body.appendChild(languageSwitcher);
        }
        
        // Adicionar eventos
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                // Atualizar idioma atual
                this.currentLanguage = btn.dataset.lang;
                
                // Salvar preferência
                localStorage.setItem('language', this.currentLanguage);
                
                // Atualizar botões
                document.querySelectorAll('.lang-btn').forEach(b => {
                    b.classList.toggle('active', b.dataset.lang === this.currentLanguage);
                });
                
                // Aplicar traduções
                this.translatePage();
            });
        });
    }

    // Aplicar traduções na página
    translatePage() {
        // Se o idioma atual for português, não é necessário traduzir
        if (this.currentLanguage === 'pt-BR') {
            return;
        }
        
        const translations = this.translations[this.currentLanguage];
        
        // Traduzir textos visíveis (sem afetar scripts, atributos HTML, etc.)
        this.translateTextNodes(document.body, translations);
        
        // Traduzir placeholders e atributos específicos
        document.querySelectorAll('input[placeholder], textarea[placeholder]').forEach(el => {
            const placeholder = el.getAttribute('placeholder');
            if (placeholder && translations[placeholder]) {
                el.setAttribute('placeholder', translations[placeholder]);
            }
        });
        
        document.querySelectorAll('[title]').forEach(el => {
            const title = el.getAttribute('title');
            if (title && translations[title]) {
                el.setAttribute('title', translations[title]);
            }
        });
        
        document.querySelectorAll('a').forEach(el => {
            const text = el.textContent.trim();
            if (translations[text]) {
                el.textContent = translations[text];
            }
        });
        
        document.querySelectorAll('button').forEach(el => {
            const text = el.textContent.trim();
            if (translations[text]) {
                el.textContent = translations[text];
            }
        });
    }

    // Função recursiva para traduzir nós de texto
    translateTextNodes(element, translations) {
        // Se for um nó de texto
        if (element.nodeType === Node.TEXT_NODE) {
            const text = element.textContent.trim();
            
            if (text && translations[text]) {
                element.textContent = element.textContent.replace(text, translations[text]);
            }
            return;
        }
        
        // Ignorar scripts, estilos, etc.
        if (['SCRIPT', 'STYLE', 'NOSCRIPT', 'IFRAME', 'OBJECT', 'EMBED'].includes(element.tagName)) {
            return;
        }
        
        // Se for um elemento, verificar cada filho
        Array.from(element.childNodes).forEach(child => {
            this.translateTextNodes(child, translations);
        });
    }
}

// Iniciar os sistemas quando o documento estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    // Iniciar sistema de filtros de projetos
    const projectFilter = new ProjectFilter();
    projectFilter.init();
    
    // Iniciar sistema de tradução
    const translator = new LanguageTranslator();
    translator.init();
    
    // Expor globalmente para uso em outros scripts
    window.projectFilter = projectFilter;
    window.translator = translator;
});
