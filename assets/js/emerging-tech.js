// Gerenciador para seção de tecnologias emergentes

class EmergingTechManager {
    constructor() {
        this.techs = [
            {
                id: 'ai',
                icon: 'fas fa-brain',
                name: 'Inteligência Artificial',
                description: 'Eu tenho conhecimento básico de IA e explorei conceitos como redes neurais e aprendizado de máquina.',
                progress: 35,
                resources: [
                    { name: 'Curso de Machine Learning', url: 'https://www.coursera.org/learn/machine-learning' },
                    { name: 'TensorFlow Playground', url: 'https://playground.tensorflow.org/' }
                ]
            },
            {
                id: 'blockchain',
                icon: 'fas fa-link',
                name: 'Blockchain',
                description: 'Estou estudando a tecnologia blockchain e seus casos de uso além das criptomoedas, como contratos inteligentes.',
                progress: 25,
                resources: [
                    { name: 'Blockchain Basics', url: 'https://www.coursera.org/learn/blockchain-basics' }
                ]
            },
            {
                id: 'quantum',
                icon: 'fas fa-atom',
                name: 'Computação Quântica',
                description: 'Estou no início da jornada para entender os conceitos básicos de computação quântica.',
                progress: 10,
                resources: [
                    { name: 'Quantum Computing for the Very Curious', url: 'https://quantum.country/qcvc' }
                ]
            },
            {
                id: 'vr',
                icon: 'fas fa-vr-cardboard',
                name: 'Realidade Virtual',
                description: 'Tenho interesse em desenvolvimento de experiências VR/AR e estou aprendendo sobre o ecossistema.',
                progress: 15,
                resources: [
                    { name: 'Unity XR Development', url: 'https://learn.unity.com/course/introduction-to-xr-vr-ar-and-mr-fundamentals' }
                ]
            }
        ];
    }

    init() {
        // Verificar se a seção já existe
        let techSection = document.getElementById('emerging-tech');
        
        if (!techSection) {
            // Criar a nova seção
            techSection = document.createElement('section');
            techSection.id = 'emerging-tech';
            
            // Adicionar conteúdo básico
            techSection.innerHTML = `
                <h2>Tecnologias Emergentes</h2>
                <p class="section-description">Áreas de interesse e aprendizado</p>
                
                <div class="tech-grid">
                    ${this.techs.map(tech => this.createTechCard(tech)).join('')}
                </div>
            `;
            
            // Inserir antes da seção de redes sociais ou demonstrações
            const socialsSection = document.querySelector('.redes-sociais');
            const demosSection = document.getElementById('demos');
            
            if (demosSection) {
                demosSection.parentNode.insertBefore(techSection, demosSection);
            } else if (socialsSection) {
                socialsSection.parentNode.insertBefore(techSection, socialsSection);
            } else {
                // Inserir antes do chatbot ou no final do corpo
                const chatbot = document.getElementById('chatbot');
                if (chatbot) {
                    chatbot.parentNode.insertBefore(techSection, chatbot);
                } else {
                    document.body.appendChild(techSection);
                }
            }
            
            // Adicionar evento para mostrar recursos
            document.querySelectorAll('.tech-resources-toggle').forEach(button => {
                button.addEventListener('click', (e) => {
                    const resourcesList = button.nextElementSibling;
                    resourcesList.classList.toggle('show-resources');
                    button.textContent = resourcesList.classList.contains('show-resources') 
                        ? 'Ocultar recursos' 
                        : 'Ver recursos';
                    e.preventDefault();
                });
            });
        }
    }

    createTechCard(tech) {
        return `
            <div class="tech-card" id="${tech.id}-tech">
                <div class="tech-icon">
                    <i class="${tech.icon}"></i>
                </div>
                <div class="tech-content">
                    <h3>${tech.name}</h3>
                    <p>${tech.description}</p>
                    <div class="tech-progress">
                        <div class="tech-progress-label">Nível de conhecimento:</div>
                        <div class="tech-progress-bar">
                            <div class="tech-progress-fill" style="width: ${tech.progress}%"></div>
                        </div>
                        <div class="tech-progress-percentage">${tech.progress}%</div>
                    </div>
                    ${tech.resources && tech.resources.length > 0 ? `
                        <button class="tech-resources-toggle">Ver recursos</button>
                        <ul class="tech-resources">
                            ${tech.resources.map(resource => `
                                <li><a href="${resource.url}" target="_blank" rel="noopener">${resource.name}</a></li>
                            `).join('')}
                        </ul>
                    ` : ''}
                </div>
            </div>
        `;
    }
}

// Inicializar o gerenciador quando o documento estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    const techManager = new EmergingTechManager();
    techManager.init();
    
    // Expor globalmente para uso em outros scripts
    window.techManager = techManager;
});
