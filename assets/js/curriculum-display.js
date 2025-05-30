// Curriculum Display - Firebase Loader
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { 
    getFirestore, 
    doc, 
    getDoc 
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

class CurriculumDisplay {
    constructor() {
        this.app = null;
        this.db = null;
        this.isConnected = false;
        this.retryCount = 0;
        this.maxRetries = 3;
        
        this.init();
    }

    async init() {
        try {
            // Configuração do Firebase
            const firebaseConfig = {
                apiKey: "AIzaSyA0VoWMLTJIyI54Pj0P5T75gCH6KpgAcbk",
                authDomain: "mikaelfmts.firebaseapp.com",
                projectId: "mikaelfmts",
                storageBucket: "mikaelfmts.firebasestorage.app",
                messagingSenderId: "516762612351",
                appId: "1:516762612351:web:f8a0f229ffd5def8ec054a"
            };

            // Inicializar Firebase
            this.app = initializeApp(firebaseConfig);
            this.db = getFirestore(this.app);

            console.log('✅ Firebase inicializado para exibição do currículo');
            this.isConnected = true;
            this.retryCount = 0;

            // Carregar currículo
            await this.loadAndDisplayCurriculum();

        } catch (error) {
            console.error('❌ Erro ao inicializar Firebase:', error);
            this.handleConnectionError(error);
        }
    }

    handleConnectionError(error) {
        console.warn(`⚠️ Tentativa ${this.retryCount + 1}/${this.maxRetries} - Erro de conexão:`, error);
        
        if (this.retryCount < this.maxRetries) {
            this.retryCount++;
            const delay = Math.pow(2, this.retryCount) * 1000;
            
            console.log(`🔄 Tentando reconectar em ${delay/1000}s...`);
            
            setTimeout(() => {
                this.init();
            }, delay);
        } else {
            console.error('❌ Máximo de tentativas de reconexão atingido');
            this.showErrorMessage('Erro de conexão com Firebase. Tentando carregar backup local...');
            this.loadLocalBackup();
        }
    }

    async loadAndDisplayCurriculum() {
        console.log('🔍 Carregando currículo do Firebase...');
        
        try {
            const docRef = doc(this.db, 'curriculum', 'current');
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const curriculumData = docSnap.data();
                console.log('✅ Currículo carregado do Firebase');
                
                this.displayCurriculum(curriculumData, 'firebase');
                
                // Salvar backup local
                this.saveLocalBackup(curriculumData);
                
            } else {
                console.log('📭 Nenhum currículo encontrado no Firebase');
                this.loadLocalBackup();
            }

        } catch (error) {
            console.error('❌ Erro ao carregar do Firebase:', error);
            this.showErrorMessage(`Erro Firebase: ${error.message}`);
            this.loadLocalBackup();
        }
    }

    loadLocalBackup() {
        console.log('💾 Tentando carregar backup local...');
        
        try {
            const stored = localStorage.getItem('curriculum_data');
            
            if (stored) {
                const curriculumData = JSON.parse(stored);
                console.log('💾 Currículo carregado do backup local');
                
                this.displayCurriculum(curriculumData, 'localStorage');
                
            } else {
                console.log('📭 Nenhum backup local encontrado');
                this.showNoDataMessage();
            }
            
        } catch (error) {
            console.error('❌ Erro ao carregar backup local:', error);
            this.showNoDataMessage();
        }
    }

    displayCurriculum(data, source) {
        const contentDiv = document.getElementById('generated-curriculum-content');
        const loadingDiv = document.getElementById('firebase-loading');
        
        if (loadingDiv) loadingDiv.remove();
        
        if (!contentDiv) {
            console.error('❌ Elemento de conteúdo não encontrado');
            return;
        }

        try {
            // Gerar HTML do currículo
            const curriculumHTML = this.generateCurriculumHTML(data, source);
            
            contentDiv.innerHTML = curriculumHTML;
            
            // Adicionar estilos dinâmicos se necessário
            this.applyCurriculumStyles(data.settings?.theme || 'modern');
            
            console.log(`✅ Currículo exibido com sucesso (fonte: ${source})`);
            
        } catch (error) {
            console.error('❌ Erro ao exibir currículo:', error);
            this.showErrorMessage(`Erro ao renderizar: ${error.message}`);
        }
    }

    generateCurriculumHTML(data, source) {
        const personalData = data.personalData || {};
        const settings = data.settings || {};
        const includeSections = data.includeSections || {};
        const metadata = data.metadata || {};

        const themeClass = `theme-${settings.theme || 'modern'}`;
        const columnClass = settings.twoColumns ? 'two-columns' : 'single-column';

        return `
            <!-- GENERATED_CURRICULUM_START -->
            <div class="curriculum-container ${themeClass} ${columnClass}" id="curriculum-content">
                ${this.generateHeader(personalData, settings)}
                ${this.generateContent(data, includeSections)}
                ${this.generateFooter(source, metadata)}
            </div>
            <!-- GENERATED_CURRICULUM_END -->
        `;
    }

    generateHeader(personalData, settings) {
        const showPhoto = settings.showPhoto && personalData.photo;
        const showIcons = settings.showIcons !== false;
        
        return `
            <div class="curriculum-header">
                <div class="header-content">
                    ${showPhoto ? `<img src="${personalData.photo}" alt="Foto" class="profile-photo">` : ''}
                    <div class="header-text">
                        <h1 class="name">${personalData.name || 'Mikael Ferreira'}</h1>
                        <p class="bio">${personalData.bio || 'Desenvolvedor Full Stack'}</p>
                    </div>
                </div>
                
                <div class="contact-info">
                    ${personalData.email ? `<div class="contact-item">
                        ${showIcons ? '<i class="fas fa-envelope"></i>' : ''}
                        <span>${personalData.email}</span>
                    </div>` : ''}
                    ${personalData.phone ? `<div class="contact-item">
                        ${showIcons ? '<i class="fas fa-phone"></i>' : ''}
                        <span>${personalData.phone}</span>
                    </div>` : ''}
                    ${personalData.location ? `<div class="contact-item">
                        ${showIcons ? '<i class="fas fa-map-marker-alt"></i>' : ''}
                        <span>${personalData.location}</span>
                    </div>` : ''}
                </div>
            </div>
        `;
    }

    generateContent(data, includeSections) {
        let content = '';
        
        // Seção de Sobre
        if (data.personalData?.bio) {
            content += `
                <div class="curriculum-section">
                    <h3><i class="fas fa-user"></i> Sobre</h3>
                    <p>${data.personalData.bio}</p>
                </div>
            `;
        }

        // Seções personalizadas
        if (data.customContent && Array.isArray(data.customContent)) {
            data.customContent.forEach(item => {
                content += this.generateCustomSection(item);
            });
        }

        // Habilidades básicas se não houver conteúdo personalizado
        if (!data.customContent || data.customContent.length === 0) {
            content += this.generateDefaultSections(includeSections);
        }

        return content;
    }

    generateCustomSection(item) {
        switch (item.type) {
            case 'experience':
                return `
                    <div class="curriculum-section">
                        <h3><i class="fas fa-briefcase"></i> ${item.title}</h3>
                        <div class="experience-item">
                            <h4>${item.title}</h4>
                            <p class="company">${item.company} • ${item.period}</p>
                            <p>${item.description}</p>
                        </div>
                    </div>
                `;
            case 'education':
                return `
                    <div class="curriculum-section">
                        <h3><i class="fas fa-graduation-cap"></i> Formação</h3>
                        <div class="education-item">
                            <h4>${item.title}</h4>
                            <p class="institution">${item.institution} • ${item.period}</p>
                            <p>${item.description}</p>
                        </div>
                    </div>
                `;
            case 'skill':
                return `
                    <div class="curriculum-section">
                        <h3><i class="fas fa-code"></i> Habilidades</h3>
                        <div class="skill-item">
                            <span class="skill-tag">${item.title}</span>
                            <span class="skill-level">${item.level}</span>
                        </div>
                    </div>
                `;
            case 'project':
                return `
                    <div class="curriculum-section">
                        <h3><i class="fas fa-project-diagram"></i> Projetos</h3>
                        <div class="project-item">
                            <h4>${item.title}</h4>
                            <p>${item.description}</p>
                            ${item.technologies ? `<div class="technologies">${item.technologies}</div>` : ''}
                            ${item.link ? `<a href="${item.link}" target="_blank">Ver Projeto</a>` : ''}
                        </div>
                    </div>
                `;
            default:
                return `
                    <div class="curriculum-section">
                        <h3><i class="fas fa-info-circle"></i> ${item.title}</h3>
                        <p>${item.description}</p>
                    </div>
                `;
        }
    }

    generateDefaultSections(includeSections) {
        return `
            <div class="curriculum-section">
                <h3><i class="fas fa-code"></i> Habilidades</h3>
                <div class="skills-grid">
                    <span class="skill-tag">JavaScript</span>
                    <span class="skill-tag">HTML/CSS</span>
                    <span class="skill-tag">React</span>
                    <span class="skill-tag">Node.js</span>
                    <span class="skill-tag">Firebase</span>
                    <span class="skill-tag">Git</span>
                </div>
            </div>
            
            <div class="curriculum-section">
                <h3><i class="fas fa-graduation-cap"></i> Formação</h3>
                <p>Graduando em Tecnologia da Informação</p>
            </div>
        `;
    }    generateFooter(source, metadata) {
        const sourceIcon = source === 'firebase' ? '☁️' : '💾';
        const sourceText = source === 'firebase' ? 'Firebase' : 'Cache Local';
        
        // Melhor tratamento de data para evitar "Invalid Date"
        let dateString = 'Dados atualizados agora';
        try {
            const timestamp = metadata?.createdAt || metadata?.lastUpdated || metadata?.timestamp || Date.now();
            
            // Verificar se é um timestamp válido
            if (timestamp && (typeof timestamp === 'number' || typeof timestamp === 'string')) {
                const date = new Date(timestamp);
                
                // Verificar se a data é válida
                if (!isNaN(date.getTime()) && date.getFullYear() > 2000) {
                    dateString = `Atualizado em ${date.toLocaleString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })}`;
                }
            }
        } catch (error) {
            console.warn('⚠️ Erro ao formatar data:', error);
            dateString = 'Dados disponíveis';
        }
        
        return `
            <div class="curriculum-footer">
                <div class="footer-info">
                    <small>
                        ${sourceIcon} Carregado de: ${sourceText} • 
                        Última atualização: ${dateString} • 
                        Versão: ${metadata.version || '2.0'}
                    </small>
                </div>
                <div class="footer-actions">
                    <a href="../curriculo-generator.html" class="edit-button">
                        <i class="fas fa-edit"></i> Editar Currículo
                    </a>
                </div>
            </div>
        `;
    }

    applyCurriculumStyles(theme) {
        // Aplicar estilos específicos do tema se necessário
        const curriculumContent = document.getElementById('curriculum-content');
        if (curriculumContent) {
            curriculumContent.className = `curriculum-container theme-${theme}`;
        }
    }

    saveLocalBackup(data) {
        try {
            localStorage.setItem('curriculum_display_backup', JSON.stringify({
                ...data,
                backupDate: new Date().toISOString()
            }));
            console.log('💾 Backup local salvo');
        } catch (error) {
            console.error('❌ Erro ao salvar backup local:', error);
        }
    }

    showErrorMessage(message) {
        const contentDiv = document.getElementById('generated-curriculum-content');
        const loadingDiv = document.getElementById('firebase-loading');
        
        if (loadingDiv) loadingDiv.remove();
        
        if (contentDiv) {
            contentDiv.innerHTML = `
                <div style="text-align: center; padding: 3rem;">
                    <div style="background: linear-gradient(135deg, #FEF2F2 0%, #FEF7F7 100%); border: 2px solid #EF4444; border-radius: 15px; padding: 2rem;">
                        <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #EF4444; margin-bottom: 1rem;"></i>
                        <h3 style="color: #DC2626; margin-bottom: 1rem;">⚠️ Erro de Conexão</h3>
                        <p style="color: #7F1D1D; margin-bottom: 2rem;">${message}</p>
                        <button onclick="location.reload()" style="
                            background: #3B82F6; color: white; padding: 12px 24px; 
                            border: none; border-radius: 8px; cursor: pointer; font-weight: bold;
                        ">🔄 Tentar Novamente</button>
                    </div>
                </div>
            `;
        }
    }

    showNoDataMessage() {
        const contentDiv = document.getElementById('generated-curriculum-content');
        const loadingDiv = document.getElementById('firebase-loading');
        
        if (loadingDiv) loadingDiv.remove();
        
        if (contentDiv) {
            contentDiv.innerHTML = `
                <div style="text-align: center; padding: 3rem;">
                    <div style="background: linear-gradient(135deg, #FEF2F2 0%, #FEF7F7 100%); border: 2px solid #EF4444; border-radius: 15px; padding: 2rem;">
                        <i class="fas fa-file-alt" style="font-size: 3rem; color: #6B7280; margin-bottom: 1rem;"></i>
                        <h3 style="color: #374151; margin-bottom: 1rem;">📋 Nenhum currículo encontrado</h3>
                        <p style="color: #6B7280; margin-bottom: 2rem;">
                            Ainda não há currículo salvo. Crie seu primeiro currículo agora!
                        </p>
                        <a href="../curriculo-generator.html" style="
                            display: inline-block; background: #10B981; color: white;
                            padding: 12px 24px; border-radius: 8px; text-decoration: none;
                            font-weight: bold; transition: all 0.3s ease;
                        ">🚀 Gerar Meu Primeiro Currículo</a>
                    </div>
                </div>
            `;
        }
    }
}

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Inicializando exibição do currículo...');
    new CurriculumDisplay();
});

export default CurriculumDisplay;
