// Personal Hub - Estatísticas Detalhadas
class PersonalHubStats {
    constructor() {
        this.user = null;
        this.data = {};
        this.init();
    }

    init() {
        this.checkAuth();
    }

    checkAuth() {
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                this.user = user;
                this.loadAllData();
            } else {
                // Se não logado, carregar dados públicos do widget
                this.loadPublicStats();
            }
        });
    }

    async loadAllData() {
        try {
            await Promise.all([
                this.loadOverviewStats(),
                this.loadActivityData(),
                this.createCharts()
            ]);
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
        }
    }

    async loadPublicStats() {
        // Para usuários não logados, mostrar stats gerais
        document.getElementById('overviewStats').innerHTML = `
            <div class="stat-card">
                <div class="stat-icon">🔒</div>
                <div class="stat-content">
                    <div class="stat-number">Private</div>
                    <div class="stat-label">Faça login para ver seus dados</div>
                </div>
            </div>
        `;
    }

    async loadOverviewStats() {
        const collections = ['diary', 'movies', 'books', 'music'];
        const stats = {};

        for (const collection of collections) {
            const snapshot = await db.collection(collection)
                .where('userId', '==', this.user.uid)
                .get();
            stats[collection] = snapshot.size;
        }

        // Calcular streak do diário
        const diaryStreak = await this.calculateDiaryStreak();
        
        // Calcular média mensal
        const monthlyAvg = await this.calculateMonthlyAverage();

        this.renderOverviewStats(stats, diaryStreak, monthlyAvg);
    }

    async calculateDiaryStreak() {        try {
            const diaryDocs = await db.collection('diary')
                .where('userId', '==', this.user.uid)
                .get();

            if (diaryDocs.empty) return 0;

            // Ordenar por data no cliente
            const sortedDocs = diaryDocs.docs.sort((a, b) => {
                const dateA = a.data().createdAt?.toDate() || new Date(0);
                const dateB = b.data().createdAt?.toDate() || new Date(0);
                return dateB - dateA;
            });

            let streak = 0;
            let currentDate = new Date();
            currentDate.setHours(0, 0, 0, 0);

            for (const doc of sortedDocs) {
                const entryDate = doc.data().createdAt?.toDate();
                if (!entryDate) continue;
                entryDate.setHours(0, 0, 0, 0);

                const diffDays = Math.floor((currentDate - entryDate) / (1000 * 60 * 60 * 24));

                if (diffDays === streak) {
                    streak++;
                    currentDate.setDate(currentDate.getDate() - 1);
                } else {
                    break;
                }
            }

            return streak;
        } catch (error) {
            console.error('Erro ao calcular streak:', error);
            return 0;
        }
    }

    async calculateMonthlyAverage() {
        try {
            const oneMonthAgo = new Date();
            oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

            const recentEntries = await db.collection('diary')
                .where('userId', '==', this.user.uid)
                .where('createdAt', '>=', oneMonthAgo)
                .get();

            return recentEntries.size;
        } catch (error) {
            console.error('Erro ao calcular média mensal:', error);
            return 0;
        }
    }

    renderOverviewStats(stats, streak, monthlyAvg) {
        const overviewStats = document.getElementById('overviewStats');
        overviewStats.innerHTML = `
            <div class="stat-card">
                <div class="stat-icon">📖</div>
                <div class="stat-content">
                    <div class="stat-number">${stats.diary || 0}</div>
                    <div class="stat-label">Total de Entradas</div>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">🔥</div>
                <div class="stat-content">
                    <div class="stat-number">${streak}</div>
                    <div class="stat-label">Dias Consecutivos</div>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">📅</div>
                <div class="stat-content">
                    <div class="stat-number">${monthlyAvg}</div>
                    <div class="stat-label">Entradas Este Mês</div>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">🎬</div>
                <div class="stat-content">
                    <div class="stat-number">${stats.movies || 0}</div>
                    <div class="stat-label">Filmes Assistidos</div>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">📚</div>
                <div class="stat-content">
                    <div class="stat-number">${stats.books || 0}</div>
                    <div class="stat-label">Livros Lidos</div>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">🎵</div>
                <div class="stat-content">
                    <div class="stat-number">${stats.music || 0}</div>
                    <div class="stat-label">Músicas</div>
                </div>
            </div>
        `;
    }

    async createCharts() {
        await this.createMonthlyChart();
        await this.createCategoryChart();
    }

    async createMonthlyChart() {
        // Dados dos últimos 6 meses
        const months = [];
        const data = [];
        
        for (let i = 5; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            months.push(date.toLocaleDateString('pt-BR', { month: 'short' }));
            
            const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
            const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
            
            const monthlyEntries = await db.collection('diary')
                .where('userId', '==', this.user.uid)
                .where('createdAt', '>=', startOfMonth)
                .where('createdAt', '<=', endOfMonth)
                .get();
            
            data.push(monthlyEntries.size);
        }

        const ctx = document.getElementById('monthlyChart');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: months,
                datasets: [{
                    label: 'Entradas do Diário',
                    data: data,
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    fill: true
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    async createCategoryChart() {
        const collections = ['diary', 'movies', 'books', 'music'];
        const data = [];
        const labels = ['Diário', 'Filmes', 'Livros', 'Músicas'];

        for (const collection of collections) {
            const snapshot = await db.collection(collection)
                .where('userId', '==', this.user.uid)
                .get();
            data.push(snapshot.size);
        }

        const ctx = document.getElementById('categoryChart');
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: [
                        '#667eea',
                        '#764ba2',
                        '#f093fb',
                        '#f5576c'
                    ]
                }]
            },
            options: {
                responsive: true
            }
        });
    }
}

// Funções de exportação
async function exportData(format) {
    const user = firebase.auth().currentUser;
    if (!user) {
        alert('Faça login para exportar dados');
        return;
    }

    try {
        const collections = ['diary', 'movies', 'books', 'music'];
        const exportData = {};

        for (const collection of collections) {
            const snapshot = await db.collection(collection)
                .where('userId', '==', user.uid)
                .get();
            
            exportData[collection] = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate?.()?.toISOString()
            }));
        }

        if (format === 'json') {
            downloadJSON(exportData, 'personal-hub-data.json');
        } else if (format === 'csv') {
            downloadCSV(exportData, 'personal-hub-data.csv');
        }
    } catch (error) {
        alert('Erro ao exportar dados: ' + error.message);
    }
}

function downloadJSON(data, filename) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

function downloadCSV(data, filename) {
    // Converter para CSV (simplificado)
    let csv = 'Tipo,Título,Data\n';
    
    Object.keys(data).forEach(collection => {
        data[collection].forEach(item => {
            csv += `${collection},${item.title || 'Sem título'},${item.createdAt || ''}\n`;
        });
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

function generateReport() {
    alert('Relatório em desenvolvimento! Em breve você poderá gerar relatórios detalhados.');
}

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    new PersonalHubStats();
});
