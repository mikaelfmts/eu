// curriculum.js - Script para exibição do currículo público
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js';
import { getFirestore, doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js';

// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyA0VoWMLTJIyI54Pj0P5T75gCH6KpgAcbk",
    authDomain: "mikaelfmts.firebaseapp.com",
    projectId: "mikaelfmts",
    storageBucket: "mikaelfmts.firebasestorage.app",
    messagingSenderId: "516762612351",
    appId: "1:516762612351:web:f8a0f229ffd5def8ec054a"
};

// Inicialização do Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Estrutura dos dados do currículo (padrão, caso não haja dados no Firebase)
let curriculumData = {
    personal: {
        name: "Mikael Ferreira",
        title: "Desenvolvedor Web Full Stack",
        email: "",
        phone: "",
        location: "",
        website: "",
        github: "",
        linkedin: "",
        bio: ""
    },
    skills: [],
    experience: [],
    education: [],
    certificates: [],
    projects: [],
    languages: [],
    theme: "theme-lol",
    template: "modern"
};

// Inicialização
document.addEventListener('DOMContentLoaded', async () => {
    await loadCurriculumData();
    renderCurriculum();
    applyTheme();
});

// Carregar dados do currículo do Firebase
async function loadCurriculumData() {
    try {
        showLoading(true);
        
        const cvRef = doc(db, "curriculo", "dados");
        const cvSnap = await getDoc(cvRef);
        
        if (cvSnap.exists()) {
            // Mesclar dados existentes com a estrutura padrão
            const data = cvSnap.data();
            curriculumData = {
                ...curriculumData,
                ...data,
                // Garantir que a estrutura de dados pessoais está intacta
                personal: { ...curriculumData.personal, ...(data.personal || {}) }
            };
            
            // Registrar o carregamento
            console.log("Dados do currículo carregados com sucesso do Firebase.");
        } else {
            console.warn("Dados do currículo não encontrados no Firebase. Usando valores padrão.");
        }
    } catch (error) {
        console.error("Erro ao carregar dados do currículo:", error);
    } finally {
        showLoading(false);
    }
}

// Renderizar o currículo
function renderCurriculum() {
    const curriculumContainer = document.getElementById('curriculum-container');
    
    // Selecionar o template correto
    let templateHTML = '';
    
    switch (curriculumData.template) {
        case 'modern':
            templateHTML = generateModernTemplate();
            break;
        case 'classic':
            templateHTML = generateClassicTemplate();
            break;
        case 'creative':
            templateHTML = generateCreativeTemplate();
            break;
        case 'minimalist':
            templateHTML = generateMinimalistTemplate();
            break;
        default:
            templateHTML = generateModernTemplate();
    }
    
    curriculumContainer.innerHTML = templateHTML;
}

// Aplicar o tema
function applyTheme() {
    const theme = curriculumData.theme || 'theme-lol';
    document.body.className = theme;
    
    // Adicionar uma classe específica ao container principal
    const curriculumContainer = document.getElementById('curriculum-container');
    curriculumContainer.className = `curriculum-container ${theme}`;
}

// Templates de currículo
function generateModernTemplate() {
    const { personal, skills, experience, education, certificates, projects, languages } = curriculumData;
    
    return `
    <div class="cv-template">
        <div class="cv-template-header">
            <h1 class="cv-template-name">${personal.name}</h1>
            <h2 class="cv-template-title">${personal.title}</h2>
            
            <div class="cv-template-contact">
                ${personal.email ? `
                <div class="cv-template-contact-item">
                    <i class="fas fa-envelope"></i> ${personal.email}
                </div>` : ''}
                
                ${personal.phone ? `
                <div class="cv-template-contact-item">
                    <i class="fas fa-phone"></i> ${personal.phone}
                </div>` : ''}
                
                ${personal.location ? `
                <div class="cv-template-contact-item">
                    <i class="fas fa-map-marker-alt"></i> ${personal.location}
                </div>` : ''}
                
                ${personal.website ? `
                <div class="cv-template-contact-item">
                    <i class="fas fa-globe"></i> <a href="${personal.website}" target="_blank" rel="noopener noreferrer">${personal.website.replace(/^https?:\/\//, '')}</a>
                </div>` : ''}
                
                ${personal.github ? `
                <div class="cv-template-contact-item">
                    <i class="fab fa-github"></i> <a href="${personal.github}" target="_blank" rel="noopener noreferrer">GitHub</a>
                </div>` : ''}
                
                ${personal.linkedin ? `
                <div class="cv-template-contact-item">
                    <i class="fab fa-linkedin"></i> <a href="${personal.linkedin}" target="_blank" rel="noopener noreferrer">LinkedIn</a>
                </div>` : ''}
            </div>
            
            ${personal.bio ? `
            <div class="cv-template-bio">
                <p>${personal.bio}</p>
            </div>` : ''}
        </div>
        
        ${skills.length > 0 ? `
        <div class="cv-template-section">
            <h3 class="cv-template-section-title">Habilidades</h3>
            <div class="cv-template-skills">
                ${skills.map(skill => `<div class="cv-template-skill">${skill}</div>`).join('')}
            </div>
        </div>` : ''}
        
        ${experience.length > 0 && experience.some(exp => exp.title || exp.company) ? `
        <div class="cv-template-section">
            <h3 class="cv-template-section-title">Experiência</h3>
            ${experience.filter(exp => exp.title || exp.company).map(exp => `
                <div class="cv-template-experience-item">
                    <div class="cv-template-job-title">${exp.title}</div>
                    <div class="cv-template-company">${exp.company}</div>
                    <div class="cv-template-period">${exp.startDate}${exp.endDate ? ` - ${exp.endDate}` : ''}</div>
                    <div class="cv-template-description">${exp.description}</div>
                </div>
            `).join('')}
        </div>` : ''}
        
        ${education.length > 0 && education.some(edu => edu.degree || edu.school) ? `
        <div class="cv-template-section">
            <h3 class="cv-template-section-title">Educação</h3>
            ${education.filter(edu => edu.degree || edu.school).map(edu => `
                <div class="cv-template-education-item">
                    <div class="cv-template-degree">${edu.degree}</div>
                    <div class="cv-template-school">${edu.school}</div>
                    <div class="cv-template-period">${edu.startDate}${edu.endDate ? ` - ${edu.endDate}` : ''}</div>
                    <div class="cv-template-description">${edu.description}</div>
                </div>
            `).join('')}
        </div>` : ''}
        
        ${certificates.length > 0 ? `
        <div class="cv-template-section">
            <h3 class="cv-template-section-title">Certificados</h3>
            <div class="cv-template-certificates">
                ${certificates.map(cert => `
                    <div class="cv-template-certificate-item">
                        <div class="cv-template-certificate-title">${cert.title}</div>
                        <div class="cv-template-certificate-issuer">${cert.issuer}</div>
                        <div class="cv-template-certificate-date">${cert.date}</div>
                        ${cert.url ? `<a href="${cert.url}" target="_blank" rel="noopener noreferrer" class="cv-template-certificate-link">Ver certificado</a>` : ''}
                    </div>
                `).join('')}
            </div>
        </div>` : ''}
        
        ${projects.length > 0 ? `
        <div class="cv-template-section">
            <h3 class="cv-template-section-title">Projetos</h3>
            <div class="cv-template-projects">
                ${projects.slice(0, 6).map(project => `
                    <div class="cv-template-project">
                        <div class="cv-template-project-title">${project.title}</div>
                        <div class="cv-template-project-description">${project.description}</div>
                        ${project.technologies ? `
                        <div class="cv-template-project-tech">
                            ${project.technologies.join(', ')}
                        </div>` : ''}
                        ${project.url ? `<a href="${project.url}" target="_blank" rel="noopener noreferrer" class="cv-template-project-link">Ver projeto</a>` : ''}
                    </div>
                `).join('')}
            </div>
        </div>` : ''}
        
        ${languages.length > 0 && languages.some(lang => lang.name) ? `
        <div class="cv-template-section">
            <h3 class="cv-template-section-title">Idiomas</h3>
            <ul class="cv-template-languages">
                ${languages.filter(lang => lang.name).map(lang => `
                    <li>${lang.name} - ${lang.level}</li>
                `).join('')}
            </ul>
        </div>` : ''}
    </div>
    `;
}

// Outros templates de currículo seguem o mesmo padrão (simplificados neste exemplo)
function generateClassicTemplate() {
    // Versão simplificada para este exemplo
    return generateModernTemplate();
}

function generateCreativeTemplate() {
    // Versão simplificada para este exemplo
    return generateModernTemplate();
}

function generateMinimalistTemplate() {
    // Versão simplificada para este exemplo
    return generateModernTemplate();
}

// Utilitários
function showLoading(show) {
    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
        loadingElement.style.display = show ? 'flex' : 'none';
    }
}
