// Importações do Firebase
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js';
import { getFirestore, doc, setDoc, getDoc, updateDoc, deleteDoc } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js';

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
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Estado da aplicação
let curriculumData = {
    personal: {},
    experience: [],
    education: [],
    technicalSkills: [],
    softSkills: [],
    projects: [],
    certificates: [],
    settings: {
        theme: 'professional',
        primaryColor: '#0066ff',
        format: 'a4'
    }
};

// GitHub API
const GITHUB_USERNAME = 'mikaelfmts'; // Substitua pelo seu username

// Verificação de autenticação
onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = 'login.html';
        return;
    }
    
    hideLoadingScreen();
    initializeApp();
});

// Inicialização da aplicação
function initializeApp() {
    setupEventListeners();
    setupTabNavigation();
    setupExportDropdown();
    loadExistingData();
    loadVersionsList();
}

// Ocultar tela de carregamento
function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.style.display = 'none';
    }
}

// Configurar event listeners
function setupEventListeners() {
    // Botões principais
    document.getElementById('save-curriculum').addEventListener('click', saveCurriculum);
    document.getElementById('preview-curriculum').addEventListener('click', previewCurriculum);
    document.getElementById('download-pdf').addEventListener('click', downloadPDF);
    document.getElementById('logout-btn').addEventListener('click', logout);
    
    // Carregamento de dados
    document.getElementById('load-from-site').addEventListener('click', loadFromSite);
    document.getElementById('load-from-github').addEventListener('click', loadFromGitHub);
    document.getElementById('reset-form').addEventListener('click', resetForm);
    
    // Adicionar itens
    document.getElementById('add-experience').addEventListener('click', addExperience);
    document.getElementById('add-education').addEventListener('click', addEducation);
    document.getElementById('add-project').addEventListener('click', addProject);
    document.getElementById('add-certificate').addEventListener('click', addCertificate);
    document.getElementById('add-technical-skill').addEventListener('click', addTechnicalSkill);
    document.getElementById('add-soft-skill').addEventListener('click', addSoftSkill);
    
    // GitHub específicos
    document.getElementById('load-github-projects').addEventListener('click', loadGitHubProjects);
    document.getElementById('load-site-certificates').addEventListener('click', loadSiteCertificates);
    
    // Modal de preview
    document.getElementById('close-preview').addEventListener('click', closePreview);
    
    // Configurações
    document.getElementById('curriculum-theme').addEventListener('change', updateTheme);
    document.getElementById('primary-color').addEventListener('change', updatePrimaryColor);
    document.getElementById('format-type').addEventListener('change', updateFormat);
    
    // Controle do dropdown de exportação
    setupExportDropdown();
}

// Configurar navegação por abas
function setupTabNavigation() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabPanels = document.querySelectorAll('.tab-panel');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            
            // Remover classe active de todos os botões e painéis
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanels.forEach(panel => panel.classList.remove('active'));
            
            // Adicionar classe active ao botão e painel correspondente
            button.classList.add('active');
            document.getElementById(`${targetTab}-tab`).classList.add('active');
        });
    });
}

// Carregar dados existentes
async function loadExistingData() {
    try {
        const docRef = doc(db, 'curriculum', 'mikael-curriculum');
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            const data = docSnap.data();
            curriculumData = { ...curriculumData, ...data };
            populateForm();
        }
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
    }
}

// Popular formulário com dados existentes
function populateForm() {
    // Informações pessoais
    const personal = curriculumData.personal || {};
    document.getElementById('full-name').value = personal.fullName || '';
    document.getElementById('job-title').value = personal.jobTitle || '';
    document.getElementById('email').value = personal.email || '';
    document.getElementById('phone').value = personal.phone || '';
    document.getElementById('linkedin').value = personal.linkedin || '';
    document.getElementById('github').value = personal.github || '';
    document.getElementById('about').value = personal.about || '';
    
    // Configurações
    const settings = curriculumData.settings || {};
    document.getElementById('curriculum-theme').value = settings.theme || 'professional';
    document.getElementById('primary-color').value = settings.primaryColor || '#0066ff';
    document.getElementById('format-type').value = settings.format || 'a4';
    
    // Carregar listas dinâmicas
    renderExperienceList();
    renderEducationList();
    renderProjectsList();
    renderCertificatesList();
    renderSkillsList();
}

// Salvar currículo
async function saveCurriculum() {
    try {
        // Coletar dados do formulário
        collectFormData();
        
        // Salvar no Firebase
        const docRef = doc(db, 'curriculum', 'mikael-curriculum');
        await setDoc(docRef, curriculumData);
        
        // Também salvar versão pública para curriculum.html
        const publicData = {
            ...curriculumData,
            lastUpdated: new Date().toISOString()
        };
        
        const publicDocRef = doc(db, 'public-curriculum', 'mikael-public');
        await setDoc(publicDocRef, publicData);
        
        showNotification('Currículo salvo com sucesso!', 'success');
    } catch (error) {
        console.error('Erro ao salvar:', error);
        showNotification('Erro ao salvar currículo', 'error');
    }
}

// Funcionalidade de versões múltiplas
const CURRICULUM_VERSIONS = {
    current: 'default',
    versions: {}
};

// Salvar versão atual com nome personalizado
async function saveVersion(versionName) {
    try {
        if (!versionName || versionName.trim() === '') {
            showNotification('Nome da versão é obrigatório', 'warning');
            return;
        }
        
        const versionData = {
            ...curriculumData,
            createdAt: new Date().toISOString(),
            name: versionName
        };
        
        const versionRef = doc(db, 'curriculum-versions', `mikael-${versionName.toLowerCase().replace(/\s+/g, '-')}`);
        await setDoc(versionRef, versionData);
        
        CURRICULUM_VERSIONS.versions[versionName] = versionData;
        renderVersionsList();
        
        showNotification(`Versão "${versionName}" salva com sucesso!`, 'success');
    } catch (error) {
        console.error('Erro ao salvar versão:', error);
        showNotification('Erro ao salvar versão', 'error');
    }
}

// Carregar versão específica
async function loadVersion(versionName) {
    try {
        const versionRef = doc(db, 'curriculum-versions', `mikael-${versionName.toLowerCase().replace(/\s+/g, '-')}`);
        const versionSnap = await getDoc(versionRef);
        
        if (versionSnap.exists()) {
            const versionData = versionSnap.data();
            curriculumData = { ...versionData };
            
            // Atualizar interface
            fillPersonalForm();
            renderExperienceList();
            renderEducationList();
            renderTechnicalSkillsList();
            renderSoftSkillsList();
            renderProjectsList();
            renderCertificatesList();
            
            CURRICULUM_VERSIONS.current = versionName;
            renderVersionsList();
            
            showNotification(`Versão "${versionName}" carregada!`, 'success');
        } else {
            showNotification('Versão não encontrada', 'error');
        }
    } catch (error) {
        console.error('Erro ao carregar versão:', error);
        showNotification('Erro ao carregar versão', 'error');
    }
}

// Listar todas as versões
async function loadVersionsList() {
    try {
        // Em uma implementação real, você faria uma query no Firestore
        // Por enquanto, vamos usar dados locais
        renderVersionsList();
    } catch (error) {
        console.error('Erro ao carregar lista de versões:', error);
    }
}

// Renderizar lista de versões na interface
function renderVersionsList() {
    const versionsList = document.getElementById('versions-list');
    if (!versionsList) return;
    
    versionsList.innerHTML = '';
    
    Object.keys(CURRICULUM_VERSIONS.versions).forEach(versionName => {
        const version = CURRICULUM_VERSIONS.versions[versionName];
        const isActive = CURRICULUM_VERSIONS.current === versionName;
        
        const versionItem = document.createElement('div');
        versionItem.className = `version-item p-3 border rounded-lg mb-2 ${isActive ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`;
        
        versionItem.innerHTML = `
            <div class="flex justify-between items-center">
                <div>
                    <div class="font-medium">${versionName}</div>
                    <div class="text-sm text-gray-500">${new Date(version.createdAt).toLocaleDateString('pt-BR')}</div>
                </div>
                <div class="flex space-x-2">
                    ${!isActive ? `<button onclick="loadVersion('${versionName}')" class="text-blue-600 hover:text-blue-800 text-sm">Carregar</button>` : '<span class="text-blue-600 text-sm">Ativa</span>'}
                    <button onclick="deleteVersion('${versionName}')" class="text-red-600 hover:text-red-800 text-sm">Excluir</button>
                </div>
            </div>
        `;
        
        versionsList.appendChild(versionItem);
    });
}

// Excluir versão
async function deleteVersion(versionName) {
    if (CURRICULUM_VERSIONS.current === versionName) {
        showNotification('Não é possível excluir a versão ativa', 'warning');
        return;
    }
    
    if (!confirm(`Tem certeza que deseja excluir a versão "${versionName}"?`)) {
        return;
    }
    
    try {
        const versionRef = doc(db, 'curriculum-versions', `mikael-${versionName.toLowerCase().replace(/\s+/g, '-')}`);
        await deleteDoc(versionRef);
        
        delete CURRICULUM_VERSIONS.versions[versionName];
        renderVersionsList();
        
        showNotification(`Versão "${versionName}" excluída!`, 'success');
    } catch (error) {
        console.error('Erro ao excluir versão:', error);
        showNotification('Erro ao excluir versão', 'error');
    }
}

// Coletar dados do formulário
function collectFormData() {
    // Informações pessoais
    curriculumData.personal = {
        fullName: document.getElementById('full-name').value,
        jobTitle: document.getElementById('job-title').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        linkedin: document.getElementById('linkedin').value,
        github: document.getElementById('github').value,
        about: document.getElementById('about').value
    };
    
    // Configurações
    curriculumData.settings = {
        theme: document.getElementById('curriculum-theme').value,
        primaryColor: document.getElementById('primary-color').value,
        format: document.getElementById('format-type').value
    };
    
    // As listas (experience, education, etc.) já são atualizadas em tempo real
}

// Preview do currículo
function previewCurriculum() {
    collectFormData();
    const previewContent = generatePreviewHTML();
    document.getElementById('preview-content').innerHTML = previewContent;
    document.getElementById('preview-modal').classList.remove('hidden');
}

// Gerar HTML do preview
function generatePreviewHTML() {
    const { personal, experience, education, technicalSkills, softSkills, projects, certificates, settings } = curriculumData;
    
    return `
        <div class="curriculum-preview theme-${settings.theme}" style="--primary-color: ${settings.primaryColor}">
            <header class="mb-6">
                <h1>${personal.fullName || 'Nome Completo'}</h1>
                <p class="text-lg text-gray-600 mb-2">${personal.jobTitle || 'Título Profissional'}</p>
                <div class="contact-info">
                    ${personal.email ? `<span><i class="fas fa-envelope mr-1"></i>${personal.email}</span>` : ''}
                    ${personal.phone ? `<span><i class="fas fa-phone mr-1"></i>${personal.phone}</span>` : ''}
                    ${personal.linkedin ? `<span><i class="fab fa-linkedin mr-1"></i>LinkedIn</span>` : ''}
                    ${personal.github ? `<span><i class="fab fa-github mr-1"></i>GitHub</span>` : ''}
                </div>
            </header>
            
            ${personal.about ? `
                <section class="section">
                    <h2>Sobre Mim</h2>
                    <p>${personal.about}</p>
                </section>
            ` : ''}
            
            ${experience.length > 0 ? `
                <section class="section">
                    <h2>Experiência Profissional</h2>
                    ${experience.map(exp => `
                        <div class="experience-item">
                            <h3>${exp.position} - ${exp.company}</h3>
                            <p class="date">${exp.startDate} - ${exp.endDate || 'Atual'}</p>
                            <p>${exp.description}</p>
                        </div>
                    `).join('')}
                </section>
            ` : ''}
            
            ${education.length > 0 ? `
                <section class="section">
                    <h2>Educação</h2>
                    ${education.map(edu => `
                        <div class="education-item">
                            <h3>${edu.degree} - ${edu.institution}</h3>
                            <p class="date">${edu.startDate} - ${edu.endDate || 'Atual'}</p>
                            ${edu.description ? `<p>${edu.description}</p>` : ''}
                        </div>
                    `).join('')}
                </section>
            ` : ''}
            
            ${technicalSkills.length > 0 ? `
                <section class="section">
                    <h2>Habilidades Técnicas</h2>
                    <div class="skills-grid">
                        ${technicalSkills.map(skill => `
                            <span class="skill-tag">${skill.name}</span>
                        `).join('')}
                    </div>
                </section>
            ` : ''}
            
            ${projects.length > 0 ? `
                <section class="section">
                    <h2>Projetos</h2>
                    ${projects.map(project => `
                        <div class="project-item">
                            <h3>${project.name}</h3>
                            <p>${project.description}</p>
                            ${project.technologies ? `<p><strong>Tecnologias:</strong> ${project.technologies}</p>` : ''}
                            ${project.url ? `<p><strong>Link:</strong> <a href="${project.url}" target="_blank">${project.url}</a></p>` : ''}
                        </div>
                    `).join('')}
                </section>
            ` : ''}
            
            ${certificates.length > 0 ? `
                <section class="section">
                    <h2>Certificações</h2>
                    ${certificates.map(cert => `
                        <div class="certificate-item">
                            <h3>${cert.name}</h3>
                            <p><strong>Emissor:</strong> ${cert.issuer}</p>
                            ${cert.date ? `<p class="date">${cert.date}</p>` : ''}
                        </div>
                    `).join('')}
                </section>
            ` : ''}
        </div>
    `;
}

// Fechar preview
function closePreview() {
    document.getElementById('preview-modal').classList.add('hidden');
}

// Download PDF
function downloadPDF() {
    try {
        showNotification('Gerando PDF...', 'info');
        
        // Criar um elemento temporário com o conteúdo do currículo
        const previewContent = document.getElementById('preview-content');
        if (!previewContent || !previewContent.innerHTML.trim()) {
            showNotification('Por favor, gere a visualização primeiro', 'warning');
            return;
        }
        
        // Configurar html2canvas para captura de alta qualidade
        const options = {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            width: 794, // A4 width in pixels at 96 DPI
            height: 1123 // A4 height in pixels at 96 DPI
        };
        
        html2canvas(previewContent, options).then(canvas => {
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('p', 'mm', 'a4');
            
            const imgData = canvas.toDataURL('image/png');
            const imgWidth = 210; // A4 width in mm
            const pageHeight = 295; // A4 height in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;
            
            let position = 0;
            
            // Adicionar primeira página
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
            
            // Adicionar páginas adicionais se necessário
            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }
            
            // Salvar o PDF
            const fileName = `Curriculo_${curriculumData.personal.fullName || 'Mikael_Ferreira'}_${new Date().toISOString().split('T')[0]}.pdf`;
            pdf.save(fileName);
            
            showNotification('PDF gerado com sucesso!', 'success');
        }).catch(error => {
            console.error('Erro ao gerar PDF:', error);
            showNotification('Erro ao gerar PDF. Tente novamente.', 'error');
        });
        
    } catch (error) {
        console.error('Erro ao gerar PDF:', error);
        showNotification('Erro ao gerar PDF. Tente novamente.', 'error');
    }
}

// Exportação para diferentes formatos
async function exportCurriculum(format) {
    try {
        switch (format) {
            case 'json':
                exportToJSON();
                break;
            case 'docx':
                exportToWord();
                break;
            case 'txt':
                exportToText();
                break;
            default:
                showNotification('Formato de exportação não suportado', 'warning');
        }
    } catch (error) {
        console.error('Erro na exportação:', error);
        showNotification('Erro durante a exportação', 'error');
    }
}

// Exportar para JSON
function exportToJSON() {
    const dataStr = JSON.stringify(curriculumData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `curriculo_${curriculumData.personal.fullName || 'mikael'}_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    showNotification('Currículo exportado em JSON!', 'success');
}

// Exportar para texto simples
function exportToText() {
    let textContent = '';
    
    // Dados pessoais
    textContent += `${curriculumData.personal.fullName || 'Nome não informado'}\n`;
    textContent += `${curriculumData.personal.jobTitle || 'Cargo não informado'}\n`;
    textContent += `Email: ${curriculumData.personal.email || 'Não informado'}\n`;
    textContent += `Telefone: ${curriculumData.personal.phone || 'Não informado'}\n`;
    textContent += `GitHub: ${curriculumData.personal.github || 'Não informado'}\n\n`;
    
    // Resumo
    if (curriculumData.personal.about) {
        textContent += `RESUMO PROFISSIONAL\n`;
        textContent += `${curriculumData.personal.about}\n\n`;
    }
    
    // Experiência
    if (curriculumData.experience && curriculumData.experience.length > 0) {
        textContent += `EXPERIÊNCIA PROFISSIONAL\n`;
        curriculumData.experience.forEach(exp => {
            textContent += `${exp.position} - ${exp.company}\n`;
            textContent += `${exp.startDate} - ${exp.endDate || 'Atual'}\n`;
            textContent += `${exp.description}\n\n`;
        });
    }
    
    // Educação
    if (curriculumData.education && curriculumData.education.length > 0) {
        textContent += `EDUCAÇÃO\n`;
        curriculumData.education.forEach(edu => {
            textContent += `${edu.degree} - ${edu.school}\n`;
            textContent += `${edu.startDate} - ${edu.endDate || 'Em andamento'}\n\n`;
        });
    }
    
    // Habilidades técnicas
    if (curriculumData.technicalSkills && curriculumData.technicalSkills.length > 0) {
        textContent += `HABILIDADES TÉCNICAS\n`;
        curriculumData.technicalSkills.forEach(skill => {
            textContent += `• ${skill.name}${skill.level ? ` (${skill.level}%)` : ''}\n`;
        });
        textContent += '\n';
    }
    
    // Projetos
    if (curriculumData.projects && curriculumData.projects.length > 0) {
        textContent += `PROJETOS\n`;
        curriculumData.projects.forEach(project => {
            textContent += `${project.name}\n`;
            textContent += `${project.description}\n`;
            textContent += `Tecnologias: ${project.technologies}\n`;
            if (project.url) textContent += `URL: ${project.url}\n`;
            textContent += '\n';
        });
    }
    
    const dataBlob = new Blob([textContent], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `curriculo_${curriculumData.personal.fullName || 'mikael'}_${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
    
    showNotification('Currículo exportado em texto!', 'success');
}

// Exportar para Word (implementação básica com HTML)
function exportToWord() {
    // Gerar HTML do currículo
    const htmlContent = generateHTMLForWord();
    
    const blob = new Blob([htmlContent], {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `curriculo_${curriculumData.personal.fullName || 'mikael'}_${new Date().toISOString().split('T')[0]}.doc`;
    link.click();
    
    showNotification('Currículo exportado para Word!', 'success');
}

// Gerar HTML formatado para Word
function generateHTMLForWord() {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Currículo - ${curriculumData.personal.fullName || 'Mikael Ferreira'}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; margin: 40px; }
        h1 { color: #333; border-bottom: 3px solid #0066ff; padding-bottom: 10px; }
        h2 { color: #0066ff; margin-top: 30px; }
        .contact-info { margin-bottom: 20px; }
        .experience-item, .education-item, .project-item { margin-bottom: 15px; }
        .skills-list { display: flex; flex-wrap: wrap; gap: 10px; }
        .skill-item { background: #f0f0f0; padding: 5px 10px; border-radius: 5px; }
    </style>
</head>
<body>
    <h1>${curriculumData.personal.fullName || 'Nome não informado'}</h1>
    <p><strong>${curriculumData.personal.jobTitle || 'Cargo não informado'}</strong></p>
    
    <div class="contact-info">
        <p>Email: ${curriculumData.personal.email || 'Não informado'}</p>
        <p>Telefone: ${curriculumData.personal.phone || 'Não informado'}</p>
        <p>GitHub: ${curriculumData.personal.github || 'Não informado'}</p>
    </div>
    
    ${curriculumData.personal.about ? `
    <h2>Resumo Profissional</h2>
    <p>${curriculumData.personal.about}</p>
    ` : ''}
    
    ${curriculumData.experience && curriculumData.experience.length > 0 ? `
    <h2>Experiência Profissional</h2>
    ${curriculumData.experience.map(exp => `
        <div class="experience-item">
            <h3>${exp.position} - ${exp.company}</h3>
            <p><em>${exp.startDate} - ${exp.endDate || 'Atual'}</em></p>
            <p>${exp.description}</p>
        </div>
    `).join('')}
    ` : ''}
    
    ${curriculumData.education && curriculumData.education.length > 0 ? `
    <h2>Educação</h2>
    ${curriculumData.education.map(edu => `
        <div class="education-item">
            <h3>${edu.degree} - ${edu.school}</h3>
            <p><em>${edu.startDate} - ${edu.endDate || 'Em andamento'}</em></p>
        </div>
    `).join('')}
    ` : ''}
    
    ${curriculumData.technicalSkills && curriculumData.technicalSkills.length > 0 ? `
    <h2>Habilidades Técnicas</h2>
    <div class="skills-list">
        ${curriculumData.technicalSkills.map(skill => `
            <span class="skill-item">${skill.name}${skill.level ? ` (${skill.level}%)` : ''}</span>
        `).join('')}
    </div>
    ` : ''}
    
    ${curriculumData.projects && curriculumData.projects.length > 0 ? `
    <h2>Projetos</h2>
    ${curriculumData.projects.map(project => `
        <div class="project-item">
            <h3>${project.name}</h3>
            <p>${project.description}</p>
            <p><strong>Tecnologias:</strong> ${project.technologies}</p>
            ${project.url ? `<p><strong>URL:</strong> <a href="${project.url}">${project.url}</a></p>` : ''}
        </div>
    `).join('')}
    ` : ''}
</body>
</html>`;
}

// Controle do dropdown de exportação
function setupExportDropdown() {
    const dropdownBtn = document.getElementById('export-dropdown-btn');
    const dropdown = document.getElementById('export-dropdown');
    
    if (dropdownBtn && dropdown) {
        dropdownBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            dropdown.classList.toggle('hidden');
        });
        
        // Fechar dropdown ao clicar fora
        document.addEventListener('click', function() {
            dropdown.classList.add('hidden');
        });
        
        // Prevenir fechamento ao clicar dentro do dropdown
        dropdown.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }
}

// Importar dados de arquivo JSON
function importFromJSON() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const importedData = JSON.parse(e.target.result);
                    
                    // Validar estrutura básica
                    if (importedData && typeof importedData === 'object') {
                        // Mesclar dados importados com estrutura atual
                        curriculumData = {
                            personal: importedData.personal || {},
                            experience: importedData.experience || [],
                            education: importedData.education || [],
                            technicalSkills: importedData.technicalSkills || [],
                            softSkills: importedData.softSkills || [],
                            projects: importedData.projects || [],
                            certificates: importedData.certificates || [],
                            settings: {
                                ...curriculumData.settings,
                                ...importedData.settings
                            }
                        };
                        
                        // Atualizar toda a interface
                        fillPersonalForm();
                        renderExperienceList();
                        renderEducationList();
                        renderTechnicalSkillsList();
                        renderSoftSkillsList();
                        renderProjectsList();
                        renderCertificatesList();
                        
                        showNotification('Dados importados com sucesso!', 'success');
                    } else {
                        throw new Error('Formato de arquivo inválido');
                    }
                } catch (error) {
                    console.error('Erro ao importar JSON:', error);
                    showNotification('Erro ao importar arquivo. Verifique o formato.', 'error');
                }
            };
            reader.readAsText(file);
        }
    };
    
    input.click();
}

// ...existing code...
