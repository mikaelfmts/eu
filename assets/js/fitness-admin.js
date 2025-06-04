// Fitness Admin JavaScript
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { 
    getFirestore, 
    collection, 
    addDoc, 
    getDocs, 
    doc, 
    updateDoc, 
    deleteDoc,
    query, 
    orderBy, 
    limit,
    Timestamp
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyDxJzUKjhUfgwOZoZYmDbBF6XG8Qf5tAM0",
    authDomain: "portfolio-mikael.firebaseapp.com",
    projectId: "portfolio-mikael",
    storageBucket: "portfolio-mikael.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef123456"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

class FitnessAdmin {
    constructor() {
        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.loadRecentData();
        this.setDefaultDate();
        this.hideLoading();
    }

    setDefaultDate() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('workoutDate').value = today;
    }

    setupEventListeners() {
        // Workout form
        document.getElementById('workoutForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addWorkout();
        });

        // Goal form
        document.getElementById('goalForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addGoal();
        });
    }

    async addWorkout() {
        try {
            const form = document.getElementById('workoutForm');
            const formData = new FormData(form);
            
            const workout = {
                date: Timestamp.fromDate(new Date(formData.get('workoutDate') || document.getElementById('workoutDate').value)),
                duration: parseInt(document.getElementById('workoutDuration').value),
                type: document.getElementById('workoutType').value,
                intensity: document.getElementById('workoutIntensity').value,
                notes: document.getElementById('workoutNotes').value,
                createdAt: Timestamp.now()
            };

            // Validação
            if (!workout.date || !workout.duration || !workout.type || !workout.intensity) {
                this.showMessage('Preencha todos os campos obrigatórios.', 'error');
                return;
            }

            // Loading state
            const submitBtn = form.querySelector('button[type="submit"]');
            submitBtn.classList.add('loading');
            submitBtn.disabled = true;

            // Adicionar ao Firestore
            await addDoc(collection(db, 'fitness-workouts'), workout);
            
            this.showMessage('Treino adicionado com sucesso!', 'success');
            form.reset();
            this.setDefaultDate();
            
            // Atualizar dados recentes
            await this.loadRecentWorkouts();
            
        } catch (error) {
            console.error('Erro ao adicionar treino:', error);
            this.showMessage('Erro ao adicionar treino. Tente novamente.', 'error');
        } finally {
            const submitBtn = document.getElementById('workoutForm').querySelector('button[type="submit"]');
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
        }
    }

    async addGoal() {
        try {
            const form = document.getElementById('goalForm');
            
            const goal = {
                title: document.getElementById('goalTitle').value,
                target: parseInt(document.getElementById('goalTarget').value),
                type: document.getElementById('goalType').value,
                deadline: Timestamp.fromDate(new Date(document.getElementById('goalDeadline').value)),
                progress: 0,
                createdAt: Timestamp.now()
            };

            // Validação
            if (!goal.title || !goal.target || !goal.type || !goal.deadline) {
                this.showMessage('Preencha todos os campos obrigatórios.', 'error');
                return;
            }

            // Loading state
            const submitBtn = form.querySelector('button[type="submit"]');
            submitBtn.classList.add('loading');
            submitBtn.disabled = true;

            // Adicionar ao Firestore
            await addDoc(collection(db, 'fitness-goals'), goal);
            
            this.showMessage('Meta criada com sucesso!', 'success');
            form.reset();
            
            // Atualizar dados recentes
            await this.loadCurrentGoals();
            
        } catch (error) {
            console.error('Erro ao criar meta:', error);
            this.showMessage('Erro ao criar meta. Tente novamente.', 'error');
        } finally {
            const submitBtn = document.getElementById('goalForm').querySelector('button[type="submit"]');
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
        }
    }

    async loadRecentData() {
        await this.loadRecentWorkouts();
        await this.loadCurrentGoals();
    }

    async loadRecentWorkouts() {
        try {
            const workoutsQuery = query(
                collection(db, 'fitness-workouts'),
                orderBy('createdAt', 'desc'),
                limit(10)
            );
            
            const snapshot = await getDocs(workoutsQuery);
            const container = document.getElementById('recentWorkouts');
            
            if (snapshot.empty) {
                container.innerHTML = '<p>Nenhum treino registrado ainda.</p>';
                return;
            }
            
            let html = '';
            snapshot.forEach(doc => {
                const workout = doc.data();
                const date = workout.date.toDate();
                
                html += `
                    <div class="data-item">
                        <div class="data-item-info">
                            <h4>${this.getWorkoutTypeLabel(workout.type)} - ${date.toLocaleDateString('pt-BR')}</h4>
                            <p>Duração: ${workout.duration}min | Intensidade: ${this.getIntensityLabel(workout.intensity)}</p>
                            <p>Observações: ${workout.notes || 'Nenhuma'}</p>
                        </div>
                        <div class="data-item-actions">
                            <button class="btn-small btn-edit" onclick="fitnessAdmin.editWorkout('${doc.id}')">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-small btn-delete" onclick="fitnessAdmin.deleteWorkout('${doc.id}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                `;
            });
            
            container.innerHTML = html;
        } catch (error) {
            console.error('Erro ao carregar treinos recentes:', error);
        }
    }

    async loadCurrentGoals() {
        try {
            const goalsQuery = query(
                collection(db, 'fitness-goals'),
                orderBy('createdAt', 'desc'),
                limit(10)
            );
            
            const snapshot = await getDocs(goalsQuery);
            const container = document.getElementById('currentGoals');
            
            if (snapshot.empty) {
                container.innerHTML = '<p>Nenhuma meta criada ainda.</p>';
                return;
            }
            
            let html = '';
            snapshot.forEach(doc => {
                const goal = doc.data();
                const deadline = goal.deadline.toDate();
                const percentage = Math.min((goal.progress / goal.target) * 100, 100);
                
                html += `
                    <div class="data-item">
                        <div class="data-item-info">
                            <h4>${goal.title}</h4>
                            <p>Meta: ${goal.progress}/${goal.target} | Prazo: ${deadline.toLocaleDateString('pt-BR')}</p>
                            <p>Progresso: ${percentage.toFixed(0)}%</p>
                        </div>
                        <div class="data-item-actions">
                            <button class="btn-small btn-edit" onclick="fitnessAdmin.editGoal('${doc.id}')">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-small btn-delete" onclick="fitnessAdmin.deleteGoal('${doc.id}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                `;
            });
            
            container.innerHTML = html;
        } catch (error) {
            console.error('Erro ao carregar metas:', error);
        }
    }

    async deleteWorkout(workoutId) {
        if (!confirm('Tem certeza que deseja excluir este treino?')) return;
        
        try {
            await deleteDoc(doc(db, 'fitness-workouts', workoutId));
            this.showMessage('Treino excluído com sucesso!', 'success');
            await this.loadRecentWorkouts();
        } catch (error) {
            console.error('Erro ao excluir treino:', error);
            this.showMessage('Erro ao excluir treino.', 'error');
        }
    }

    async deleteGoal(goalId) {
        if (!confirm('Tem certeza que deseja excluir esta meta?')) return;
        
        try {
            await deleteDoc(doc(db, 'fitness-goals', goalId));
            this.showMessage('Meta excluída com sucesso!', 'success');
            await this.loadCurrentGoals();
        } catch (error) {
            console.error('Erro ao excluir meta:', error);
            this.showMessage('Erro ao excluir meta.', 'error');
        }
    }

    getWorkoutTypeLabel(type) {
        const types = {
            'peito': 'Peito',
            'costas': 'Costas',
            'pernas': 'Pernas',
            'bracos': 'Braços',
            'ombros': 'Ombros',
            'cardio': 'Cardio',
            'funcional': 'Funcional'
        };
        return types[type] || type;
    }

    getIntensityLabel(intensity) {
        const intensities = {
            'baixa': 'Baixa',
            'media': 'Média',
            'alta': 'Alta'
        };
        return intensities[intensity] || intensity;
    }

    showMessage(text, type) {
        // Remove existing messages
        const existingMessages = document.querySelectorAll('.message');
        existingMessages.forEach(msg => msg.remove());

        // Create new message
        const message = document.createElement('div');
        message.className = `message ${type} show`;
        message.textContent = text;

        // Insert at top of container
        const container = document.querySelector('.container');
        container.insertBefore(message, container.firstChild);

        // Auto remove after 5 seconds
        setTimeout(() => {
            message.remove();
        }, 5000);
    }

    hideLoading() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
        }
    }
}

// Tab functionality
function showTab(tabName) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(tabName + 'Tab').classList.add('active');
    
    // Add active class to clicked button
    event.target.classList.add('active');
}

// Theme toggle functionality
function toggleTheme() {
    const body = document.body;
    const themeIcon = document.getElementById('theme-icon');
    
    body.classList.toggle('dark-theme');
    
    if (body.classList.contains('dark-theme')) {
        themeIcon.className = 'fas fa-sun';
        localStorage.setItem('theme', 'dark');
    } else {
        themeIcon.className = 'fab fa-battle-net';
        localStorage.setItem('theme', 'light');
    }
}

// Load saved theme
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
    document.body.classList.add('dark-theme');
    document.getElementById('theme-icon').className = 'fas fa-sun';
}

// Initialize when DOM is loaded
let fitnessAdmin;
document.addEventListener('DOMContentLoaded', () => {
    fitnessAdmin = new FitnessAdmin();
});

// Make functions global
window.showTab = showTab;
window.toggleTheme = toggleTheme;
window.fitnessAdmin = fitnessAdmin;
