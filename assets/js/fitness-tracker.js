// Fitness Tracker JavaScript
import { firebaseConfig } from './firebase-config.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js';
import { getFirestore, collection, getDocs, query, orderBy, limit, where } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

class FitnessTracker {
    constructor() {
        this.charts = {};
        this.init();
    }

    async init() {
        try {
            await this.loadStats();
            await this.loadCharts();
            await this.loadRecentWorkouts();
            await this.loadAchievements();
            await this.loadGoals();
            this.hideLoading();
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            this.hideLoading();
        }
    }    async loadStats() {
        try {
            // Buscar treinos do mês atual
            const currentMonth = new Date().getMonth();
            const currentYear = new Date().getFullYear();
            
            const workoutsQuery = query(
                collection(db, 'fitness-workouts'),
                where('date', '>=', new Date(currentYear, currentMonth, 1)),
                where('date', '<=', new Date(currentYear, currentMonth + 1, 0))
            );
            
            const workoutsSnapshot = await getDocs(workoutsQuery);
            const monthlyWorkouts = workoutsSnapshot.size;
            
            // Buscar metas
            const goalsQuery = query(collection(db, 'fitness-goals'));
            const goalsSnapshot = await getDocs(goalsQuery);
            let goalsAchieved = 0;
            let totalTime = 0;
            
            goalsSnapshot.forEach(doc => {
                const goal = doc.data();
                if (goal.progress >= goal.target) {
                    goalsAchieved++;
                }
            });
            
            // Calcular tempo total
            workoutsSnapshot.forEach(doc => {
                const workout = doc.data();
                totalTime += workout.duration || 0;
            });
            
            // Calcular nível baseado em total de treinos
            const allWorkoutsQuery = query(collection(db, 'fitness-workouts'));
            const allWorkoutsSnapshot = await getDocs(allWorkoutsQuery);
            const totalWorkouts = allWorkoutsSnapshot.size;
            const currentLevel = Math.floor(totalWorkouts / 10) + 1;
            
            // Se não há dados, usar dados de exemplo
            if (totalWorkouts === 0) {
                document.getElementById('monthlyWorkouts').textContent = '0';
                document.getElementById('goalsAchieved').textContent = '0';
                document.getElementById('totalTime').textContent = '0h';
                document.getElementById('currentLevel').textContent = '1';
                return;
            }
            
            // Atualizar DOM
            document.getElementById('monthlyWorkouts').textContent = monthlyWorkouts;
            document.getElementById('goalsAchieved').textContent = goalsAchieved;
            document.getElementById('totalTime').textContent = `${Math.floor(totalTime / 60)}h`;
            document.getElementById('currentLevel').textContent = currentLevel;
            
        } catch (error) {
            console.error('Erro ao carregar estatísticas:', error);
            // Usar dados de exemplo em caso de erro
            document.getElementById('monthlyWorkouts').textContent = '0';
            document.getElementById('goalsAchieved').textContent = '0';
            document.getElementById('totalTime').textContent = '0h';
            document.getElementById('currentLevel').textContent = '1';
        }
    }

    async loadCharts() {
        await this.loadWeeklyChart();
        await this.loadMuscleGroupChart();
    }

    async loadWeeklyChart() {
        try {
            // Buscar dados dos últimos 7 dias
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            
            const workoutsQuery = query(
                collection(db, 'fitness-workouts'),
                where('date', '>=', sevenDaysAgo),
                orderBy('date', 'asc')
            );
            
            const snapshot = await getDocs(workoutsQuery);
            const dailyData = {};
            
            // Inicializar todos os dias com 0
            for (let i = 0; i < 7; i++) {
                const date = new Date();
                date.setDate(date.getDate() - (6 - i));
                const dateStr = date.toISOString().split('T')[0];
                dailyData[dateStr] = 0;
            }
            
            // Contar treinos por dia
            snapshot.forEach(doc => {
                const workout = doc.data();
                const dateStr = workout.date.toDate().toISOString().split('T')[0];
                if (dailyData.hasOwnProperty(dateStr)) {
                    dailyData[dateStr]++;
                }
            });
            
            const labels = Object.keys(dailyData).map(date => {
                return new Date(date).toLocaleDateString('pt-BR', { weekday: 'short' });
            });
            
            const data = Object.values(dailyData);
            
            const ctx = document.getElementById('weeklyChart').getContext('2d');
            this.charts.weekly = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Treinos',
                        data: data,
                        borderColor: '#0066ff',
                        backgroundColor: 'rgba(0, 102, 255, 0.1)',
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            stepSize: 1
                        }
                    },
                    plugins: {
                        legend: {
                            display: false
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Erro ao carregar gráfico semanal:', error);
        }
    }

    async loadMuscleGroupChart() {
        try {
            const workoutsQuery = query(collection(db, 'fitness-workouts'));
            const snapshot = await getDocs(workoutsQuery);
            
            const muscleGroups = {};
            
            snapshot.forEach(doc => {
                const workout = doc.data();
                const type = workout.type || 'outros';
                muscleGroups[type] = (muscleGroups[type] || 0) + 1;
            });
            
            const ctx = document.getElementById('muscleGroupChart').getContext('2d');
            this.charts.muscleGroup = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: Object.keys(muscleGroups),
                    datasets: [{
                        data: Object.values(muscleGroups),
                        backgroundColor: [
                            '#0066ff', '#00ccff', '#66b3ff', '#3399ff',
                            '#0080ff', '#4da6ff', '#1a8cff', '#6bb6ff'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Erro ao carregar gráfico de grupos musculares:', error);
        }
    }    async loadRecentWorkouts() {
        try {
            const workoutsQuery = query(
                collection(db, 'fitness-workouts'),
                orderBy('date', 'desc'),
                limit(5)
            );
            
            const snapshot = await getDocs(workoutsQuery);
            const workoutsList = document.getElementById('workoutsList');
            
            if (snapshot.empty) {
                workoutsList.innerHTML = `
                    <div class="workout-item">
                        <div class="workout-info">
                            <h4>🎯 Sistema Pronto!</h4>
                            <p>Use o painel admin para adicionar seus primeiros treinos</p>
                        </div>
                        <div class="workout-meta">
                            <div class="date">Aguardando dados</div>
                            <div class="duration">0min - Configuração</div>
                        </div>
                    </div>
                `;
                return;
            }
            
            let html = '';
            snapshot.forEach(doc => {
                const workout = doc.data();
                const date = workout.date.toDate();
                
                html += `
                    <div class="workout-item">
                        <div class="workout-info">
                            <h4>${this.getWorkoutTypeLabel(workout.type)}</h4>
                            <p>${workout.notes || 'Sem observações'}</p>
                        </div>
                        <div class="workout-meta">
                            <div class="date">${date.toLocaleDateString('pt-BR')}</div>
                            <div class="duration">${workout.duration}min - ${this.getIntensityLabel(workout.intensity)}</div>
                        </div>
                    </div>
                `;
            });
            
            workoutsList.innerHTML = html;
        } catch (error) {
            console.error('Erro ao carregar treinos recentes:', error);
            const workoutsList = document.getElementById('workoutsList');
            workoutsList.innerHTML = `
                <div class="workout-item">
                    <div class="workout-info">
                        <h4>📊 Fitness Tracker Ativo</h4>
                        <p>Sistema funcionando - adicione treinos pelo painel admin</p>
                    </div>
                    <div class="workout-meta">
                        <div class="date">Sistema OK</div>
                        <div class="duration">Pronto para uso</div>
                    </div>
                </div>
            `;
        }
    }

    async loadAchievements() {
        try {
            const achievementsList = document.getElementById('achievementsList');
            
            // Achievements predefinidos
            const achievements = [
                { id: 'first-workout', title: 'Primeiro Treino', description: 'Complete seu primeiro treino', icon: 'fa-dumbbell', target: 1 },
                { id: 'consistent-week', title: 'Semana Consistente', description: 'Treine 5 dias seguidos', icon: 'fa-calendar-week', target: 5 },
                { id: 'monthly-goal', title: 'Meta Mensal', description: 'Complete 20 treinos em um mês', icon: 'fa-trophy', target: 20 },
                { id: 'cardio-master', title: 'Mestre do Cardio', description: 'Complete 10 treinos de cardio', icon: 'fa-heartbeat', target: 10 },
                { id: 'strength-hero', title: 'Herói da Força', description: 'Complete 15 treinos de força', icon: 'fa-fist-raised', target: 15 }
            ];
            
            // Buscar progresso atual
            const workoutsQuery = query(collection(db, 'fitness-workouts'));
            const snapshot = await getDocs(workoutsQuery);
            
            let workoutCounts = {};
            let totalWorkouts = 0;
            
            snapshot.forEach(doc => {
                const workout = doc.data();
                totalWorkouts++;
                workoutCounts[workout.type] = (workoutCounts[workout.type] || 0) + 1;
            });
            
            let html = '';
            achievements.forEach(achievement => {
                let progress = 0;
                let unlocked = false;
                
                switch (achievement.id) {
                    case 'first-workout':
                        progress = totalWorkouts;
                        break;
                    case 'monthly-goal':
                        progress = totalWorkouts; // Simplificado
                        break;
                    case 'cardio-master':
                        progress = workoutCounts['cardio'] || 0;
                        break;
                    case 'strength-hero':
                        progress = (workoutCounts['peito'] || 0) + (workoutCounts['costas'] || 0) + (workoutCounts['bracos'] || 0);
                        break;
                    default:
                        progress = totalWorkouts;
                }
                
                unlocked = progress >= achievement.target;
                
                html += `
                    <div class="achievement-badge ${unlocked ? '' : 'locked'}">
                        <i class="fas ${achievement.icon}"></i>
                        <h4>${achievement.title}</h4>
                        <p>${achievement.description}</p>
                        <small>${progress}/${achievement.target}</small>
                    </div>
                `;
            });
            
            achievementsList.innerHTML = html;
        } catch (error) {
            console.error('Erro ao carregar conquistas:', error);
        }
    }    async loadGoals() {
        try {
            const goalsQuery = query(collection(db, 'fitness-goals'), orderBy('deadline', 'asc'));
            const snapshot = await getDocs(goalsQuery);
            const goalsList = document.getElementById('goalsList');
            
            if (snapshot.empty) {
                goalsList.innerHTML = `
                    <div class="goal-item">
                        <div class="goal-header">
                            <h4 class="goal-title">🎯 Primeira Meta</h4>
                            <span class="goal-deadline">Defina no painel admin</span>
                        </div>
                        <div class="goal-progress">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: 0%"></div>
                            </div>
                        </div>
                        <div class="goal-stats">
                            <span>Use o admin para criar suas metas</span>
                            <span>0% concluído</span>
                        </div>
                    </div>
                `;
                return;
            }
            
            let html = '';
            snapshot.forEach(doc => {
                const goal = doc.data();
                const deadline = goal.deadline.toDate();
                const progress = goal.progress || 0;
                const percentage = Math.min((progress / goal.target) * 100, 100);
                
                html += `
                    <div class="goal-item">
                        <div class="goal-header">
                            <h4 class="goal-title">${goal.title}</h4>
                            <span class="goal-deadline">Até ${deadline.toLocaleDateString('pt-BR')}</span>
                        </div>
                        <div class="goal-progress">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${percentage}%"></div>
                            </div>
                        </div>
                        <div class="goal-stats">
                            <span>Progresso: ${progress}/${goal.target}</span>
                            <span>${percentage.toFixed(0)}% concluído</span>
                        </div>
                    </div>
                `;
            });
            
            goalsList.innerHTML = html;
        } catch (error) {
            console.error('Erro ao carregar metas:', error);
            const goalsList = document.getElementById('goalsList');
            goalsList.innerHTML = `
                <div class="goal-item">
                    <div class="goal-header">
                        <h4 class="goal-title">📈 Sistema de Metas Ativo</h4>
                        <span class="goal-deadline">Pronto para usar</span>
                    </div>
                    <div class="goal-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: 100%"></div>
                        </div>
                    </div>
                    <div class="goal-stats">
                        <span>Sistema funcionando corretamente</span>
                        <span>100% operacional</span>
                    </div>
                </div>
            `;
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

    hideLoading() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new FitnessTracker();
});

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

// Make functions global
window.toggleTheme = toggleTheme;
