// Enhanced Dashboard with Advanced Features for Personal Hub
class DashboardEnhanced {
    constructor() {
        this.user = null;
        this.stats = {};
        this.widgets = new Map();
        this.notifications = [];
        this.productivityData = {
            tasks: [],
            notes: '',
            pomodoro: { sessions: 0, totalTime: 0 }
        };
        this.gamification = {
            points: 0,
            streak: 0,
            achievements: [],
            level: 1
        };
        this.insights = [];
        this.isDragging = false;
        this.currentChart = null;
        this.pomodoroTimer = null;
        this.pomodoroTime = 25 * 60; // 25 minutes
        this.pomodoroRunning = false;
        this.notesTimeout = null;
        
        // Initialize Firebase listener if available
        if (typeof firebase !== 'undefined') {
            this.setupFirebaseListener();
        }
        
        // Load data on construction
        this.loadStoredData();
    }

    setupFirebaseListener() {
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                this.setUser(user);
            }
        });
    }

    setUser(user) {
        this.user = user;
        this.loadUserData();
    }

    async init() {
        try {
            console.log('Inicializando Dashboard Aprimorado...');
            
            await this.createEnhancedLayout();
            await this.initWidgetSystem();
            await this.initNotificationCenter();
            await this.initProductivityCenter();
            await this.initGamification();
            await this.loadInsights();
            await this.initCharts();
            
            // Set enhanced mode in traditional dashboard
            if (window.personalHubDashboard) {
                window.personalHubDashboard.setEnhancedMode(true);
            }
            
            console.log('Dashboard Aprimorado inicializado com sucesso!');
        } catch (error) {
            console.error('Erro ao inicializar Dashboard Aprimorado:', error);
            // Fallback to traditional dashboard
            if (window.personalHubDashboard) {
                window.personalHubDashboard.setEnhancedMode(false);
            }
        }
    }

    async loadUserData() {
        if (!this.user || typeof db === 'undefined') return;
        
        try {
            const userDoc = await db.collection('users').doc(this.user.uid).get();
            if (userDoc.exists) {
                const userData = userDoc.data();
                this.stats = userData.stats || {};
                this.gamification = { ...this.gamification, ...userData.gamification };
            }
        } catch (error) {
            console.error('Erro ao carregar dados do usuário:', error);
        }
        this.loadStoredData();
    }

    loadStoredData() {
        try {
            this.notifications = JSON.parse(localStorage.getItem('personal-hub-notifications') || '[]');
            this.productivityData.tasks = JSON.parse(localStorage.getItem('personal-hub-tasks') || '[]');
            this.productivityData.notes = localStorage.getItem('personal-hub-quick-notes') || '';
            
            const streak = localStorage.getItem('personal-hub-streak');
            if (streak) this.gamification.streak = parseInt(streak);
            
            const points = localStorage.getItem('personal-hub-points');
            if (points) this.gamification.points = parseInt(points);
            
            const gamificationData = localStorage.getItem('personal-hub-gamification');
            if (gamificationData) {
                this.gamification = { ...this.gamification, ...JSON.parse(gamificationData) };
            }
        } catch (error) {
            console.error('Erro ao carregar dados armazenados:', error);
        }
    }

    // === ENHANCED LAYOUT ===
    createEnhancedLayout() {
        const enhancedContainer = document.getElementById('enhancedDashboard');
        if (!enhancedContainer) {
            console.error('Container do dashboard aprimorado não encontrado');
            return;
        }        enhancedContainer.innerHTML = this.getEnhancedLayoutHTML();
        this.updateGreeting();
        this.loadMotivationalQuote();
    }

    updateGreeting() {
        const greetingElement = document.getElementById('dynamicGreeting');
        if (!greetingElement) return;

        const now = new Date();
        const hour = now.getHours();
        const userName = this.user?.displayName?.split(' ')[0] || 'Usuário';
        
        let greeting;
        if (hour < 12) {
            greeting = `Bom dia, ${userName}!`;
        } else if (hour < 18) {
            greeting = `Boa tarde, ${userName}!`;
        } else {
            greeting = `Boa noite, ${userName}!`;
        }

        greetingElement.textContent = greeting;
    }

    loadMotivationalQuote() {
        const quoteElement = document.getElementById('motivationalQuote');
        if (!quoteElement) return;

        const quotes = [
            "O sucesso é a soma de pequenos esforços repetidos dia após dia.",
            "A produtividade não é sobre fazer mais coisas, é sobre fazer as coisas certas.",
            "Foque no progresso, não na perfeição.",
            "Cada pequeno passo te leva mais perto do seu objetivo.",
            "A disciplina é a ponte entre objetivos e conquistas.",
            "Organize seu dia, organize sua vida.",
            "O tempo é um recurso não renovável. Use-o sabiamente.",
            "Pequenas melhorias diárias levam a resultados impressionantes."
        ];

        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
        quoteElement.textContent = randomQuote;
    }

    getEnhancedLayoutHTML() {
        return `
            <div class="enhanced-header">
                <div class="greeting-section">
                    <h1 id="dynamicGreeting">Bem-vindo!</h1>
                    <p id="motivationalQuote">Carregando inspiração...</p>
                </div>
                <div class="quick-actions">
                    <button class="action-btn" onclick="dashboardEnhanced.addQuickTask()">
                        <i class="fas fa-plus"></i> Tarefa
                    </button>
                    <button class="action-btn" onclick="dashboardEnhanced.startPomodoro()">
                        <i class="fas fa-play"></i> Foco
                    </button>
                    <button class="action-btn" onclick="dashboardEnhanced.addQuickNote()">
                        <i class="fas fa-sticky-note"></i> Nota
                    </button>
                </div>
            </div>

            <div class="enhanced-content">
                <div class="widgets-grid" id="widgetsGrid">
                    ${this.createDefaultWidgets()}
                </div>

                <div class="notification-center" id="notificationCenter">
                    <div class="notification-header">
                        <h3><i class="fas fa-bell"></i> Notificações</h3>
                        <button class="clear-all-btn" onclick="dashboardEnhanced.clearAllNotifications()">
                            <i class="fas fa-trash"></i> Limpar
                        </button>
                    </div>
                    <div class="notification-list" id="notificationList">
                        <div class="loading">Carregando notificações...</div>
                    </div>
                </div>
            </div>
        `;
    }

    createDefaultWidgets() {
        const widgets = [
            { id: 'stats', title: 'Estatísticas', size: 'large', icon: 'chart-bar' },
            { id: 'activity', title: 'Atividade Recente', size: 'medium', icon: 'clock' },
            { id: 'insights', title: 'Insights', size: 'medium', icon: 'lightbulb' },
            { id: 'goals', title: 'Metas', size: 'small', icon: 'target' },
            { id: 'mood', title: 'Humor', size: 'small', icon: 'smile' },
            { id: 'quickActions', title: 'Ações Rápidas', size: 'medium', icon: 'zap' }
        ];

        return widgets.map(widget => this.createWidgetHTML(widget)).join('');
    }

    createWidgetHTML(widget) {
        return `
            <div class="widget" data-widget="${widget.id}" data-size="${widget.size}">
                <div class="widget-header">
                    <h3><i class="fas fa-${widget.icon}"></i> ${widget.title}</h3>
                    <div class="widget-controls">
                        <button class="widget-control" onclick="dashboardEnhanced.refreshWidget('${widget.id}')" title="Atualizar">
                            <i class="fas fa-refresh"></i>
                        </button>
                        <button class="widget-control" onclick="dashboardEnhanced.removeWidget('${widget.id}')" title="Remover">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
                <div class="widget-content" id="widget-${widget.id}">
                    <div class="loading">
                        <i class="fas fa-spinner fa-spin"></i>
                        <span>Carregando...</span>
                    </div>
                </div>
            </div>
        `;
    }

    // === WIDGET SYSTEM ===
    async initWidgetSystem() {
        setTimeout(() => {
            this.updateStatsWidget();
            this.updateActivityWidget();
            this.updateInsightsWidget();
            this.updateGoalsWidget();
            this.updateMoodWidget();
            this.updateQuickActionsWidget();
            this.enableWidgetDragDrop();
        }, 100);
    }

    enableWidgetDragDrop() {
        const widgets = document.querySelectorAll('.widget');
        const grid = document.getElementById('widgetsGrid');

        widgets.forEach(widget => {
            widget.draggable = true;
            
            widget.addEventListener('dragstart', (e) => {
                this.isDragging = true;
                e.dataTransfer.setData('text/plain', widget.dataset.widget);
                widget.classList.add('dragging');
            });

            widget.addEventListener('dragend', () => {
                this.isDragging = false;
                widget.classList.remove('dragging');
            });
        });

        if (grid) {
            grid.addEventListener('dragover', (e) => e.preventDefault());
            grid.addEventListener('drop', (e) => {
                e.preventDefault();
                this.saveWidgetPositions();
            });
        }
    }

    updateStatsWidget() {
        const statsWidget = document.getElementById('widget-stats');
        if (!statsWidget) return;

        const stats = this.calculateStats();
        statsWidget.innerHTML = `
            <div class="stats-grid">
                <div class="stat-item">
                    <div class="stat-value">${stats.totalTasks}</div>
                    <div class="stat-label">Tarefas</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${stats.completedTasks}</div>
                    <div class="stat-label">Concluídas</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${stats.streak}</div>
                    <div class="stat-label">Sequência</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${stats.level}</div>
                    <div class="stat-label">Nível</div>
                </div>
            </div>
            <div class="chart-container">
                <canvas id="statsChart" width="300" height="150"></canvas>
            </div>
        `;

        setTimeout(() => this.renderStatsChart(), 100);
    }    calculateStats() {
        // Calcular estatísticas baseadas nos dados locais
        const totalTasks = this.productivityData.tasks ? this.productivityData.tasks.length : 0;
        const completedTasks = this.productivityData.tasks ? this.productivityData.tasks.filter(task => task.completed).length : 0;
        const streak = this.gamification ? this.gamification.streak : 0;
        const level = this.gamification ? this.gamification.level : 1;
        
        return {
            totalTasks,
            completedTasks,
            streak,
            level,
            completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
        };
    }

    updateActivityWidget() {
        const activityWidget = document.getElementById('widget-activity');
        if (!activityWidget) return;

        const activities = this.getRecentActivities();
        if (activities.length === 0) {
            activityWidget.innerHTML = '<div class="no-data">Nenhuma atividade recente</div>';
            return;
        }

        activityWidget.innerHTML = `
            <div class="activity-list">
                ${activities.map(activity => `
                    <div class="activity-item">
                        <div class="activity-icon">
                            <i class="fas fa-${activity.icon}"></i>
                        </div>
                        <div class="activity-content">
                            <div class="activity-text">${activity.text}</div>
                            <div class="activity-time">${this.formatRelativeTime(activity.timestamp)}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    updateInsightsWidget() {
        const insightsWidget = document.getElementById('widget-insights');
        if (!insightsWidget) return;

        if (this.insights.length === 0) {
            insightsWidget.innerHTML = '<div class="no-data">Gerando insights...</div>';
            return;
        }

        insightsWidget.innerHTML = `
            <div class="insights-list">
                ${this.insights.map(insight => `
                    <div class="insight-item" data-confidence="${insight.confidence}">
                        <div class="insight-icon">
                            <i class="fas fa-${insight.icon}"></i>
                        </div>
                        <div class="insight-content">
                            <p>${insight.message}</p>
                            <div class="confidence-bar">
                                <div class="confidence-fill" style="width: ${insight.confidence}%"></div>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    updateGoalsWidget() {
        const goalsWidget = document.getElementById('widget-goals');
        if (!goalsWidget) return;

        const goals = this.getGoals();
        goalsWidget.innerHTML = `
            <div class="goals-list">
                ${goals.map(goal => `
                    <div class="goal-item">
                        <div class="goal-header">
                            <span class="goal-title">${goal.title}</span>
                            <span class="goal-progress">${Math.round(goal.progress)}%</span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${goal.progress}%"></div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    updateMoodWidget() {
        const moodWidget = document.getElementById('widget-mood');
        if (!moodWidget) return;

        moodWidget.innerHTML = `
            <div class="mood-tracker">
                <div class="mood-selector">
                    <button class="mood-btn" onclick="dashboardEnhanced.setMood(1)" title="Muito triste">😢</button>
                    <button class="mood-btn" onclick="dashboardEnhanced.setMood(2)" title="Triste">😐</button>
                    <button class="mood-btn" onclick="dashboardEnhanced.setMood(3)" title="Neutro">😊</button>
                    <button class="mood-btn" onclick="dashboardEnhanced.setMood(4)" title="Feliz">😄</button>
                    <button class="mood-btn" onclick="dashboardEnhanced.setMood(5)" title="Muito feliz">🤩</button>
                </div>
                <div class="mood-history">
                    <canvas id="moodChart" width="200" height="100"></canvas>
                </div>
            </div>
        `;

        setTimeout(() => this.renderMoodChart(), 100);
    }

    updateQuickActionsWidget() {
        const quickActionsWidget = document.getElementById('widget-quickActions');
        if (!quickActionsWidget) return;

        quickActionsWidget.innerHTML = `
            <div class="quick-actions-grid">
                <button class="quick-action" onclick="dashboardEnhanced.addQuickTask()">
                    <i class="fas fa-plus"></i>
                    <span>Nova Tarefa</span>
                </button>
                <button class="quick-action" onclick="dashboardEnhanced.startPomodoro()">
                    <i class="fas fa-clock"></i>
                    <span>Pomodoro</span>
                </button>
                <button class="quick-action" onclick="dashboardEnhanced.addQuickNote()">
                    <i class="fas fa-sticky-note"></i>
                    <span>Nota Rápida</span>
                </button>
                <button class="quick-action" onclick="dashboardEnhanced.trackMood()">
                    <i class="fas fa-heart"></i>
                    <span>Registrar Humor</span>
                </button>
            </div>
        `;
    }

    // === NOTIFICATION CENTER ===
    async initNotificationCenter() {
        this.loadNotifications();
        this.setupNotificationTimer();
        
        // Add welcome notification if it's the first time
        if (this.notifications.length === 0) {
            this.addNotification(
                'Bem-vindo ao Dashboard Aprimorado!',
                'Aqui você pode gerenciar suas tarefas, acompanhar seu progresso e manter-se produtivo.',
                'star',
                'info'
            );
        }
    }

    loadNotifications() {
        const notificationList = document.getElementById('notificationList');
        if (!notificationList) return;

        if (this.notifications.length === 0) {
            notificationList.innerHTML = '<div class="no-notifications">Nenhuma notificação</div>';
            return;
        }

        notificationList.innerHTML = this.notifications.slice(0, 10).map(notification => `
            <div class="notification-item ${notification.read ? 'read' : 'unread'}" data-id="${notification.id}">
                <div class="notification-icon">
                    <i class="fas fa-${notification.icon}"></i>
                </div>
                <div class="notification-content">
                    <h4>${notification.title}</h4>
                    <p>${notification.message}</p>
                    <span class="notification-time">${this.formatRelativeTime(notification.timestamp)}</span>
                </div>
                <button class="notification-close" onclick="dashboardEnhanced.removeNotification('${notification.id}')" title="Remover">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');
    }

    addNotification(title, message, icon = 'bell', type = 'info') {
        const notification = {
            id: Date.now().toString(),
            title,
            message,
            icon,
            type,
            timestamp: Date.now(),
            read: false
        };

        this.notifications.unshift(notification);
        
        // Keep only last 50 notifications
        if (this.notifications.length > 50) {
            this.notifications = this.notifications.slice(0, 50);
        }
        
        this.saveNotifications();
        this.loadNotifications();
        this.showToast(title, message, type);
    }

    formatRelativeTime(timestamp) {
        const now = new Date();
        const time = new Date(timestamp);
        const diffInSeconds = Math.floor((now - time) / 1000);
        
        if (diffInSeconds < 60) {
            return 'Agora mesmo';
        } else if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return `${minutes} min atrás`;
        } else if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return `${hours}h atrás`;
        } else if (diffInSeconds < 604800) {
            const days = Math.floor(diffInSeconds / 86400);
            return `${days}d atrás`;
        } else {
            return time.toLocaleDateString('pt-BR');
        }
    }

    showToast(title, message, type = 'info') {
        const existingToasts = document.querySelectorAll('.toast');
        if (existingToasts.length >= 3) {
            existingToasts[0].remove();
        }

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <h4>${title}</h4>
                <p>${message}</p>
            </div>
            <button class="toast-close" onclick="this.parentElement.remove()">×</button>
        `;

        document.body.appendChild(toast);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, 5000);
    }

    removeNotification(id) {
        this.notifications = this.notifications.filter(n => n.id !== id);
        this.saveNotifications();
        this.loadNotifications();
    }

    clearAllNotifications() {
        this.notifications = [];
        this.saveNotifications();
        this.loadNotifications();
        this.showToast('Notificações', 'Todas as notificações foram removidas', 'success');
    }

    saveNotifications() {
        try {
            localStorage.setItem('personal-hub-notifications', JSON.stringify(this.notifications));
        } catch (error) {
            console.error('Erro ao salvar notificações:', error);
        }
    }

    setupNotificationTimer() {
        // Generate smart notifications based on user behavior
        setInterval(() => {
            this.generateSmartNotifications();
        }, 30 * 60 * 1000); // Every 30 minutes
    }

    generateSmartNotifications() {
        const now = new Date();
        const hour = now.getHours();
        
        // Morning motivation
        if (hour === 9 && !this.hasNotificationToday('morning-motivation')) {
            this.addNotification(
                'Bom dia!', 
                'Que tal começar o dia definindo suas prioridades?',
                'sun',
                'info'
            );
        }
        
        // Afternoon break reminder
        if (hour === 15 && !this.hasNotificationToday('afternoon-break')) {
            this.addNotification(
                'Hora de uma pausa!', 
                'Você já trabalhou bastante hoje. Que tal uma pausa de 15 minutos?',
                'coffee',
                'warning'
            );
        }
        
        // Evening reflection
        if (hour === 18 && !this.hasNotificationToday('evening-reflection')) {
            this.addNotification(
                'Reflexão do dia', 
                'Como foi seu dia? Registre seu humor e conquistas.',
                'moon',
                'info'
            );
        }
    }

    hasNotificationToday(type) {
        const today = new Date().toDateString();
        return this.notifications.some(n => 
            n.type === type && 
            new Date(n.timestamp).toDateString() === today
        );
    }

    // === PRODUCTIVITY CENTER ===
    async initProductivityCenter() {
        const sidebar = document.getElementById('productivitySidebar');
        if (!sidebar) return;

        sidebar.innerHTML = this.getProductivitySidebarHTML();
        this.loadTasks();
        this.setupNotesAutoSave();
    }

    getProductivitySidebarHTML() {
        return `
            <div class="productivity-header">
                <h3><i class="fas fa-tasks"></i> Produtividade</h3>
                <button class="sidebar-toggle" onclick="dashboardEnhanced.toggleSidebar()" title="Fechar">
                    <i class="fas fa-times"></i>
                </button>
            </div>

            <div class="productivity-section">
                <h4><i class="fas fa-clock"></i> Pomodoro Timer</h4>
                <div class="pomodoro-timer">
                    <div class="timer-display" id="pomodoroDisplay">25:00</div>
                    <div class="timer-controls">
                        <button id="pomodoroStart" onclick="dashboardEnhanced.startPomodoro()" title="Iniciar">
                            <i class="fas fa-play"></i>
                        </button>
                        <button id="pomodoroPause" onclick="dashboardEnhanced.pausePomodoro()" title="Pausar">
                            <i class="fas fa-pause"></i>
                        </button>
                        <button id="pomodoroReset" onclick="dashboardEnhanced.resetPomodoro()" title="Resetar">
                            <i class="fas fa-stop"></i>
                        </button>
                    </div>
                    <div class="timer-sessions">
                        <span>Sessões hoje: ${this.productivityData.pomodoro.sessions}</span>
                    </div>
                </div>
            </div>

            <div class="productivity-section">
                <h4><i class="fas fa-tasks"></i> Gerenciador de Tarefas</h4>
                <div class="task-manager">
                    <div class="task-input">
                        <input type="text" id="newTaskInput" placeholder="Nova tarefa..." 
                               onkeypress="if(event.key==='Enter') dashboardEnhanced.addTask()">
                        <button onclick="dashboardEnhanced.addTask()" title="Adicionar tarefa">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                    <div class="task-list" id="taskList">
                        <div class="loading">Carregando tarefas...</div>
                    </div>
                </div>
            </div>

            <div class="productivity-section">
                <h4><i class="fas fa-sticky-note"></i> Notas Rápidas</h4>
                <div class="quick-notes">
                    <textarea id="quickNotesArea" placeholder="Suas anotações rápidas...">${this.productivityData.notes}</textarea>
                    <button onclick="dashboardEnhanced.saveNotes()" title="Salvar notas">
                        <i class="fas fa-save"></i> Salvar
                    </button>
                </div>
            </div>
        `;
    }

    // === POMODORO TIMER ===
    startPomodoro() {
        if (this.pomodoroRunning) return;
        
        this.pomodoroRunning = true;
        const display = document.getElementById('pomodoroDisplay');
        if (!display) return;
        
        this.pomodoroTimer = setInterval(() => {
            this.pomodoroTime--;
            const minutes = Math.floor(this.pomodoroTime / 60);
            const seconds = this.pomodoroTime % 60;
            display.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            
            if (this.pomodoroTime <= 0) {
                this.finishPomodoro();
            }
        }, 1000);

        this.addNotification('Pomodoro iniciado!', '25 minutos de foco total começaram.', 'clock', 'success');
    }

    pausePomodoro() {
        if (this.pomodoroTimer) {
            clearInterval(this.pomodoroTimer);
            this.pomodoroTimer = null;
            this.pomodoroRunning = false;
            this.addNotification('Pomodoro pausado', 'Timer pausado. Clique em play para continuar.', 'pause', 'warning');
        }
    }

    resetPomodoro() {
        this.pausePomodoro();
        this.pomodoroTime = 25 * 60;
        const display = document.getElementById('pomodoroDisplay');
        if (display) {
            display.textContent = '25:00';
        }
    }

    finishPomodoro() {
        this.pausePomodoro();
        this.productivityData.pomodoro.sessions++;
        this.productivityData.pomodoro.totalTime += 25;
        this.resetPomodoro();
        
        this.addNotification(
            'Pomodoro concluído!', 
            'Parabéns! Você completou uma sessão de 25 minutos. Hora de uma pausa!',
            'check',
            'success'
        );
        
        this.updateGamificationPoints(25);
        this.saveProductivityData();
        this.updateStatsWidget();
    }

    // === TASK MANAGEMENT ===
    addTask() {
        const input = document.getElementById('newTaskInput');
        if (!input) return;
        
        const taskText = input.value.trim();
        if (!taskText) return;
        
        const task = {
            id: Date.now(),
            text: taskText,
            completed: false,
            createdAt: Date.now()
        };
        
        this.productivityData.tasks.push(task);
        input.value = '';
        this.saveTasks();
        this.loadTasks();
        this.updateStatsWidget();
        
        this.addNotification('Nova tarefa adicionada', taskText, 'plus', 'info');
    }

    toggleTask(taskId) {
        const task = this.productivityData.tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            task.completedAt = task.completed ? Date.now() : null;
            this.saveTasks();
            this.loadTasks();
            this.updateStatsWidget();
            this.updateActivityWidget();
            
            if (task.completed) {
                this.updateGamificationPoints(10);
                this.addNotification('Tarefa concluída!', task.text, 'check', 'success');
            }
        }
    }

    deleteTask(taskId) {
        this.productivityData.tasks = this.productivityData.tasks.filter(t => t.id !== taskId);
        this.saveTasks();
        this.loadTasks();
        this.updateStatsWidget();
    }

    loadTasks() {
        const taskList = document.getElementById('taskList');
        if (!taskList) return;

        if (this.productivityData.tasks.length === 0) {
            taskList.innerHTML = '<div class="no-tasks">Nenhuma tarefa pendente</div>';
            return;
        }

        taskList.innerHTML = this.productivityData.tasks.map(task => `
            <div class="task-item ${task.completed ? 'completed' : ''}">
                <input type="checkbox" ${task.completed ? 'checked' : ''} 
                       onchange="dashboardEnhanced.toggleTask(${task.id})">
                <span class="task-text">${task.text}</span>
                <button class="delete-task" onclick="dashboardEnhanced.deleteTask(${task.id})" title="Excluir tarefa">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');
    }

    saveTasks() {
        try {
            localStorage.setItem('personal-hub-tasks', JSON.stringify(this.productivityData.tasks));
        } catch (error) {
            console.error('Erro ao salvar tarefas:', error);
        }
    }

    // === NOTES MANAGEMENT ===
    saveNotes() {
        const notesArea = document.getElementById('quickNotesArea');
        if (notesArea) {
            this.productivityData.notes = notesArea.value;
            localStorage.setItem('personal-hub-quick-notes', this.productivityData.notes);
            this.addNotification('Notas salvas', 'Suas anotações foram salvas com sucesso.', 'save', 'success');
        }
    }

    setupNotesAutoSave() {
        const notesArea = document.getElementById('quickNotesArea');
        if (notesArea) {
            notesArea.addEventListener('input', () => {
                clearTimeout(this.notesTimeout);
                this.notesTimeout = setTimeout(() => {
                    this.productivityData.notes = notesArea.value;
                    localStorage.setItem('personal-hub-quick-notes', this.productivityData.notes);
                }, 2000);
            });
        }
    }

    saveProductivityData() {
        try {
            localStorage.setItem('personal-hub-productivity', JSON.stringify(this.productivityData));
        } catch (error) {
            console.error('Erro ao salvar dados de produtividade:', error);
        }
    }

    // === GAMIFICATION ===
    async initGamification() {
        this.updateStreaks();
        this.checkAchievements();
        this.updateLevel();
    }

    updateGamificationPoints(points) {
        this.gamification.points += points;
        this.updateLevel();
        this.saveGamificationData();
        this.showPointsAnimation(points);
    }

    updateLevel() {
        const newLevel = Math.floor(this.gamification.points / 100) + 1;
        if (newLevel > this.gamification.level) {
            this.gamification.level = newLevel;
            this.addNotification(
                'Nível aumentado!', 
                `Parabéns! Você alcançou o nível ${newLevel}!`,
                'trophy',
                'success'
            );
        }
    }

    updateStreaks() {
        const today = new Date().toDateString();
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
        const lastActivity = localStorage.getItem('personal-hub-last-activity');
        
        if (lastActivity === yesterday) {
            this.gamification.streak++;
        } else if (lastActivity !== today) {
            this.gamification.streak = 1;
        }
        
        localStorage.setItem('personal-hub-last-activity', today);
        localStorage.setItem('personal-hub-streak', this.gamification.streak.toString());
    }

    checkAchievements() {
        const achievements = [
            {
                id: 'first-task',
                name: 'Primeira Tarefa',
                description: 'Completou sua primeira tarefa',
                condition: () => this.productivityData.tasks.some(t => t.completed)
            },
            {
                id: 'streak-7',
                name: 'Dedicado',
                description: 'Manteve uma sequência de 7 dias',
                condition: () => this.gamification.streak >= 7
            },
            {
                id: 'pomodoro-master',
                name: 'Mestre do Foco',
                description: 'Completou 10 sessões Pomodoro',
                condition: () => this.productivityData.pomodoro.sessions >= 10
            },
            {
                id: 'task-master',
                name: 'Organizador',
                description: 'Completou 50 tarefas',
                condition: () => this.productivityData.tasks.filter(t => t.completed).length >= 50
            }
        ];

        achievements.forEach(achievement => {
            if (!this.gamification.achievements.includes(achievement.id) && achievement.condition()) {
                this.gamification.achievements.push(achievement.id);
                this.addNotification(
                    'Conquista desbloqueada!',
                    `${achievement.name}: ${achievement.description}`,
                    'medal',
                    'success'
                );
            }
        });
    }

    showPointsAnimation(points) {
        const animation = document.createElement('div');
        animation.className = 'points-animation';
        animation.textContent = `+${points}`;
        animation.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 2rem;
            font-weight: bold;
            color: var(--color-success);
            z-index: 9999;
            animation: pointsFloat 2s ease-out forwards;
            pointer-events: none;
        `;
        
        document.body.appendChild(animation);

        setTimeout(() => {
            if (animation.parentElement) {
                animation.remove();
            }
        }, 2000);
    }

    saveGamificationData() {
        try {
            localStorage.setItem('personal-hub-gamification', JSON.stringify(this.gamification));
        } catch (error) {
            console.error('Erro ao salvar dados de gamificação:', error);
        }
    }

    // === INSIGHTS ENGINE ===
    async loadInsights() {
        this.insights = this.generateInsights();
        this.updateInsightsWidget();
    }

    generateInsights() {
        const insights = [];
        
        // Task completion insights
        const completedTasks = this.productivityData.tasks.filter(t => t.completed).length;
        const totalTasks = this.productivityData.tasks.length;
        const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        
        if (completionRate > 80) {
            insights.push({
                message: `Excelente! Taxa de conclusão: ${completionRate}%`,
                icon: 'trophy',
                confidence: 95
            });
        } else if (completionRate > 50) {
            insights.push({
                message: `Bom progresso! Taxa de conclusão: ${completionRate}%`,
                icon: 'thumbs-up',
                confidence: 75
            });
        } else if (totalTasks > 0) {
            insights.push({
                message: `Foque nas tarefas pendentes. Taxa atual: ${completionRate}%`,
                icon: 'exclamation-triangle',
                confidence: 65
            });
        }
        
        // Streak insights
        if (this.gamification.streak > 5) {
            insights.push({
                message: `Incrível sequência de ${this.gamification.streak} dias!`,
                icon: 'fire',
                confidence: 90
            });
        } else if (this.gamification.streak > 1) {
            insights.push({
                message: `Continue assim! ${this.gamification.streak} dias consecutivos`,
                icon: 'calendar-check',
                confidence: 75
            });
        }
        
        // Pomodoro insights
        if (this.productivityData.pomodoro.sessions > 3) {
            insights.push({
                message: `${this.productivityData.pomodoro.sessions} sessões de foco hoje - excelente!`,
                icon: 'clock',
                confidence: 85
            });
        } else if (this.productivityData.pomodoro.sessions > 0) {
            insights.push({
                message: `${this.productivityData.pomodoro.sessions} sessão(ões) de foco hoje`,
                icon: 'clock',
                confidence: 70
            });
        }
        
        // Time-based insights
        const hour = new Date().getHours();
        if (hour >= 9 && hour <= 11 && completedTasks > 0) {
            insights.push({
                message: 'Manhã é seu horário mais produtivo!',
                icon: 'sun',
                confidence: 70
            });
        }
        
        // Level insights
        if (this.gamification.level > 1) {
            insights.push({
                message: `Nível ${this.gamification.level} - ${this.gamification.points} pontos!`,
                icon: 'star',
                confidence: 80
            });
        }
        
        return insights;
    }

    // === CHARTS AND VISUALIZATION ===
    async initCharts() {
        if (typeof Chart !== 'undefined') {
            setTimeout(() => {
                this.renderStatsChart();
                this.renderMoodChart();
            }, 500);
        } else {
            console.warn('Chart.js não está disponível. Gráficos não serão renderizados.');
        }
    }

    renderStatsChart() {
        const canvas = document.getElementById('statsChart');
        if (!canvas || typeof Chart === 'undefined') return;

        const ctx = canvas.getContext('2d');
        const data = this.getStatsChartData();

        if (this.currentChart) {
            this.currentChart.destroy();
        }

        this.currentChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Concluídas', 'Pendentes'],
                datasets: [{
                    data: [data.completed, data.pending],
                    backgroundColor: [
                        'var(--color-success)',
                        'var(--color-warning)'
                    ],
                    borderWidth: 2,
                    borderColor: 'var(--bg-primary)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'bottom'
                    }
                }
            }
        });
    }

    renderMoodChart() {
        const canvas = document.getElementById('moodChart');
        if (!canvas || typeof Chart === 'undefined') return;

        const ctx = canvas.getContext('2d');
        const moodData = this.getMoodData();

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: moodData.labels,
                datasets: [{
                    label: 'Humor',
                    data: moodData.values,
                    borderColor: 'var(--color-primary)',
                    backgroundColor: 'var(--color-primary-alpha)',
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: 'var(--color-primary)',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        min: 1,
                        max: 5,
                        display: false
                    },
                    x: {
                        display: false
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    // === BACKUP AND SYNC SYSTEM ===
    async initBackupSystem() {
        this.setupAutoBackup();
        this.setupDataSync();
        this.addBackupControls();
    }

    setupAutoBackup() {
        // Auto backup every 30 minutes
        setInterval(() => {
            this.createAutoBackup();
        }, 30 * 60 * 1000);
    }

    async createAutoBackup() {
        try {
            const backupData = {
                timestamp: Date.now(),
                user: this.user ? this.user.uid : 'anonymous',
                data: {
                    widgets: Array.from(this.widgets.entries()),
                    notifications: this.notifications,
                    productivityData: this.productivityData,
                    gamification: this.gamification,
                    insights: this.insights,
                    stats: this.stats
                },
                version: '1.0'
            };

            // Store locally
            localStorage.setItem('personal-hub-backup-latest', JSON.stringify(backupData));
            
            // Keep last 5 backups
            const backups = JSON.parse(localStorage.getItem('personal-hub-backups') || '[]');
            backups.unshift(backupData);
            if (backups.length > 5) {
                backups.pop();
            }
            localStorage.setItem('personal-hub-backups', JSON.stringify(backups));

            // Sync to Firebase if user is logged in
            if (this.user && typeof db !== 'undefined') {
                await db.collection('backups').doc(this.user.uid).set({
                    lastBackup: firebase.firestore.FieldValue.serverTimestamp(),
                    data: backupData
                });
            }

            console.log('✅ Backup automático realizado');
        } catch (error) {
            console.error('❌ Erro no backup automático:', error);
        }
    }

    async restoreFromBackup(backupData) {
        try {
            if (backupData && backupData.data) {
                // Restore widgets
                this.widgets = new Map(backupData.data.widgets || []);
                
                // Restore other data
                this.notifications = backupData.data.notifications || [];
                this.productivityData = backupData.data.productivityData || {
                    tasks: [],
                    notes: '',
                    pomodoro: { sessions: 0, totalTime: 0 }
                };
                this.gamification = backupData.data.gamification || {
                    points: 0,
                    streak: 0,
                    achievements: [],
                    level: 1
                };
                this.insights = backupData.data.insights || [];
                this.stats = backupData.data.stats || {};

                // Refresh UI
                this.loadWidgets();
                this.loadNotifications();
                this.updateProductivitySidebar();
                this.updateGamificationElements();

                this.showToast('✅ Backup restaurado', 'Dados restaurados com sucesso!', 'success');
            }
        } catch (error) {
            console.error('❌ Erro ao restaurar backup:', error);
            this.showToast('❌ Erro no restore', 'Falha ao restaurar dados', 'error');
        }
    }

    setupDataSync() {
        // Sync data when user makes changes
        this.syncTimeout = null;
        this.scheduleSyncWithDebounce = () => {
            if (this.syncTimeout) clearTimeout(this.syncTimeout);
            this.syncTimeout = setTimeout(() => {
                this.syncToCloud();
            }, 2000); // 2 second debounce
        };
    }

    async syncToCloud() {
        if (!this.user || typeof db === 'undefined') return;

        try {
            const syncData = {
                widgets: Array.from(this.widgets.entries()),
                notifications: this.notifications.slice(0, 20), // Only sync recent notifications
                productivityData: this.productivityData,
                gamification: this.gamification,
                insights: this.insights.slice(0, 10), // Only sync recent insights
                lastSync: Date.now()
            };

            await db.collection('userSyncData').doc(this.user.uid).set(syncData);
            console.log('🔄 Dados sincronizados com sucesso');
        } catch (error) {
            console.error('❌ Erro na sincronização:', error);
        }
    }

    async loadFromCloud() {
        if (!this.user || typeof db === 'undefined') return;

        try {
            const doc = await db.collection('userSyncData').doc(this.user.uid).get();
            if (doc.exists) {
                const cloudData = doc.data();
                
                // Merge cloud data with local data
                if (cloudData.widgets) {
                    this.widgets = new Map(cloudData.widgets);
                }
                if (cloudData.productivityData) {
                    this.productivityData = { ...this.productivityData, ...cloudData.productivityData };
                }
                if (cloudData.gamification) {
                    this.gamification = { ...this.gamification, ...cloudData.gamification };
                }

                console.log('☁️ Dados carregados da nuvem');
                this.loadWidgets();
                this.updateProductivitySidebar();
            }
        } catch (error) {
            console.error('❌ Erro ao carregar da nuvem:', error);
        }
    }

    addBackupControls() {
        const backupHTML = `
            <div class="backup-controls" style="
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: var(--card-bg);
                padding: 15px;
                border-radius: 12px;
                box-shadow: var(--shadow);
                z-index: 1000;
                display: none;
            " id="backupControls">
                <h4 style="margin: 0 0 10px 0; font-size: 14px;">🔄 Backup & Sync</h4>
                <div class="backup-buttons" style="display: flex; gap: 8px; flex-direction: column;">
                    <button onclick="dashboardEnhanced.createAutoBackup()" style="
                        padding: 8px 12px;
                        border: none;
                        border-radius: 6px;
                        background: var(--primary);
                        color: white;
                        cursor: pointer;
                        font-size: 12px;
                    ">💾 Criar Backup</button>
                    <button onclick="dashboardEnhanced.showBackupList()" style="
                        padding: 8px 12px;
                        border: none;
                        border-radius: 6px;
                        background: var(--secondary);
                        color: white;
                        cursor: pointer;
                        font-size: 12px;
                    ">📋 Ver Backups</button>
                    <button onclick="dashboardEnhanced.exportData()" style="
                        padding: 8px 12px;
                        border: none;
                        border-radius: 6px;
                        background: var(--success);
                        color: white;
                        cursor: pointer;
                        font-size: 12px;
                    ">📤 Exportar</button>
                </div>
                <button onclick="document.getElementById('backupControls').style.display='none'" style="
                    position: absolute;
                    top: 5px;
                    right: 8px;
                    background: none;
                    border: none;
                    color: var(--text-secondary);
                    cursor: pointer;
                    font-size: 16px;
                ">×</button>
            </div>
            
            <button onclick="document.getElementById('backupControls').style.display='block'" style="
                position: fixed;
                bottom: 20px;
                right: 20px;
                width: 50px;
                height: 50px;
                border-radius: 50%;
                border: none;
                background: var(--primary);
                color: white;
                cursor: pointer;
                box-shadow: var(--shadow);
                z-index: 999;
                font-size: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
            " title="Backup & Sync">💾</button>
        `;

        document.body.insertAdjacentHTML('beforeend', backupHTML);
    }

    showBackupList() {
        const backups = JSON.parse(localStorage.getItem('personal-hub-backups') || '[]');
        
        let listHTML = '<div style="max-height: 300px; overflow-y: auto;">';
        if (backups.length === 0) {
            listHTML += '<p>Nenhum backup encontrado.</p>';
        } else {
            backups.forEach((backup, index) => {
                const date = new Date(backup.timestamp).toLocaleString('pt-BR');
                listHTML += `
                    <div style="
                        padding: 10px;
                        margin: 5px 0;
                        border: 1px solid var(--border);
                        border-radius: 6px;
                        cursor: pointer;
                    " onclick="dashboardEnhanced.restoreFromBackup(${JSON.stringify(backup).replace(/"/g, '&quot;')})">
                        <strong>📅 ${date}</strong><br>
                        <small>Usuário: ${backup.user}</small>
                    </div>
                `;
            });
        }
        listHTML += '</div>';

        this.showModal('📋 Backups Disponíveis', listHTML);
    }

    exportData() {
        const exportData = {
            exportDate: new Date().toISOString(),
            widgets: Array.from(this.widgets.entries()),
            notifications: this.notifications,
            productivityData: this.productivityData,
            gamification: this.gamification,
            insights: this.insights,
            stats: this.stats,
            version: '1.0'
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `personal-hub-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showToast('📤 Exportação concluída', 'Dados exportados com sucesso!', 'success');
    }

    // === MODAL SYSTEM ===
    showModal(title, content, options = {}) {
        const existingModal = document.getElementById('dynamicModal');
        if (existingModal) {
            existingModal.remove();
        }

        const modal = document.createElement('div');
        modal.id = 'dynamicModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title">${title}</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
                ${options.showFooter !== false ? `
                    <div class="modal-footer">
                        <button onclick="this.closest('.modal').remove()" class="btn-secondary">Fechar</button>
                        ${options.confirmButton ? `<button onclick="${options.confirmAction}" class="btn-primary">${options.confirmButton}</button>` : ''}
                    </div>
                ` : ''}
            </div>
        `;

        document.body.appendChild(modal);
        modal.style.display = 'block';

        // Close on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });

        // Close on Escape key
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                modal.remove();
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);
    }

    // === IMPORT/EXPORT SYSTEM ===
    async importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            try {
                const text = await file.text();
                const importData = JSON.parse(text);
                
                if (this.validateImportData(importData)) {
                    const shouldReplace = confirm('Deseja substituir todos os dados atuais? (Clique em Cancelar para mesclar)');
                    
                    if (shouldReplace) {
                        await this.replaceAllData(importData);
                    } else {
                        await this.mergeImportData(importData);
                    }
                    
                    this.showToast('✅ Dados importados', 'Importação realizada com sucesso!', 'success');
                    window.location.reload(); // Refresh to show new data
                } else {
                    this.showToast('❌ Erro na importação', 'Arquivo inválido ou corrompido', 'error');
                }
            } catch (error) {
                console.error('Erro na importação:', error);
                this.showToast('❌ Erro na importação', 'Falha ao processar arquivo', 'error');
            }
        };
        
        input.click();
    }

    validateImportData(data) {
        return data && 
               data.version && 
               data.exportDate && 
               (data.widgets || data.productivityData || data.gamification);
    }

    async replaceAllData(importData) {
        // Clear existing data
        localStorage.removeItem('personal-hub-tasks');
        localStorage.removeItem('personal-hub-notifications');
        localStorage.removeItem('personal-hub-quick-notes');
        localStorage.removeItem('personal-hub-gamification');
        localStorage.removeItem('personal-hub-widget-positions');

        // Import new data
        await this.mergeImportData(importData);
    }

    async mergeImportData(importData) {
        try {
            if (importData.widgets) {
                this.widgets = new Map(importData.widgets);
            }
            
            if (importData.productivityData) {
                // Merge tasks without duplicates
                const existingTaskTexts = new Set(this.productivityData.tasks.map(t => t.text));
                const newTasks = importData.productivityData.tasks?.filter(t => 
                    !existingTaskTexts.has(t.text)
                ) || [];
                
                this.productivityData.tasks = [...this.productivityData.tasks, ...newTasks];
                this.productivityData.notes = importData.productivityData.notes || this.productivityData.notes;
                
                if (importData.productivityData.pomodoro) {
                    this.productivityData.pomodoro.sessions += importData.productivityData.pomodoro.sessions || 0;
                    this.productivityData.pomodoro.totalTime += importData.productivityData.pomodoro.totalTime || 0;
                }
            }
            
            if (importData.gamification) {
                this.gamification.points += importData.gamification.points || 0;
                this.gamification.streak = Math.max(this.gamification.streak, importData.gamification.streak || 0);
                
                // Merge achievements
                const newAchievements = importData.gamification.achievements?.filter(a => 
                    !this.gamification.achievements.includes(a)
                ) || [];
                this.gamification.achievements = [...this.gamification.achievements, ...newAchievements];
            }
            
            if (importData.notifications) {
                // Add import notifications, avoiding duplicates
                const existingIds = new Set(this.notifications.map(n => n.id));
                const newNotifications = importData.notifications.filter(n => !existingIds.has(n.id));
                this.notifications = [...newNotifications, ...this.notifications];
            }

            // Save all data
            this.saveTasks();
            this.saveNotifications();
            this.saveGamificationData();
            this.saveProductivityData();
            
        } catch (error) {
            console.error('Erro ao mesclar dados importados:', error);
            throw error;
        }
    }

    // === KEYBOARD SHORTCUTS ===
    initKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Only handle shortcuts when not in input fields
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case 'n': // Ctrl+N - New task
                        e.preventDefault();
                        this.addQuickTask();
                        break;
                    case 's': // Ctrl+S - Save notes
                        e.preventDefault();
                        this.saveNotes();
                        break;
                    case 'b': // Ctrl+B - Create backup
                        e.preventDefault();
                        this.createAutoBackup();
                        break;
                    case 'e': // Ctrl+E - Export data
                        e.preventDefault();
                        this.exportData();
                        break;
                    case 'i': // Ctrl+I - Import data
                        e.preventDefault();
                        this.importData();
                        break;
                }
            } else {
                switch(e.key) {
                    case 'p': // P - Start/pause Pomodoro
                        if (this.pomodoroRunning) {
                            this.pausePomodoro();
                        } else {
                            this.startPomodoro();
                        }
                        break;
                    case 'r': // R - Reset Pomodoro
                        this.resetPomodoro();
                        break;
                    case '?': // ? - Show help
                        this.showKeyboardShortcuts();
                        break;
                }
            }
        });
    }

    showKeyboardShortcuts() {
        const shortcuts = `
            <div class="shortcuts-list">
                <h4>⌨️ Atalhos de Teclado</h4>
                <div class="shortcut-group">
                    <h5>Produtividade</h5>
                    <div class="shortcut-item"><kbd>Ctrl</kbd> + <kbd>N</kbd> - Nova tarefa</div>
                    <div class="shortcut-item"><kbd>Ctrl</kbd> + <kbd>S</kbd> - Salvar notas</div>
                    <div class="shortcut-item"><kbd>P</kbd> - Iniciar/Pausar Pomodoro</div>
                    <div class="shortcut-item"><kbd>R</kbd> - Resetar Pomodoro</div>
                </div>
                <div class="shortcut-group">
                    <h5>Dados</h5>
                    <div class="shortcut-item"><kbd>Ctrl</kbd> + <kbd>B</kbd> - Criar backup</div>
                    <div class="shortcut-item"><kbd>Ctrl</kbd> + <kbd>E</kbd> - Exportar dados</div>
                    <div class="shortcut-item"><kbd>Ctrl</kbd> + <kbd>I</kbd> - Importar dados</div>
                </div>
                <div class="shortcut-group">
                    <h5>Geral</h5>
                    <div class="shortcut-item"><kbd>?</kbd> - Mostrar esta ajuda</div>
                    <div class="shortcut-item"><kbd>Esc</kbd> - Fechar modais</div>
                </div>
            </div>
            <style>
                .shortcuts-list { font-family: var(--font-primary); }
                .shortcut-group { margin-bottom: 16px; }
                .shortcut-group h5 { margin: 0 0 8px 0; color: var(--primary); font-size: 14px; }
                .shortcut-item { margin: 4px 0; font-size: 13px; display: flex; align-items: center; }
                .shortcut-item kbd { 
                    background: var(--bg-secondary); 
                    padding: 2px 6px; 
                    border-radius: 4px; 
                    margin: 0 2px; 
                    font-size: 11px;
                    border: 1px solid var(--border);
                }
            </style>
        `;
        
        this.showModal('Atalhos de Teclado', shortcuts);
    }

    // === PERFORMANCE MONITORING ===
    initPerformanceMonitoring() {
        this.performanceMetrics = {
            startTime: Date.now(),
            loadTime: 0,
            renderTime: 0,
            interactions: 0
        };

        // Monitor load time
        window.addEventListener('load', () => {
            this.performanceMetrics.loadTime = Date.now() - this.performanceMetrics.startTime;
            this.updatePerformanceIndicator();
        });

        // Monitor interactions
        document.addEventListener('click', () => {
            this.performanceMetrics.interactions++;
        });

        // Monitor render performance
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.entryType === 'measure') {
                        this.performanceMetrics.renderTime += entry.duration;
                    }
                }
                this.updatePerformanceIndicator();
            });
            observer.observe({ entryTypes: ['measure'] });
        }

        // Update performance indicator periodically
        setInterval(() => {
            this.updatePerformanceIndicator();
        }, 10000); // Every 10 seconds
    }

    updatePerformanceIndicator() {
        let indicator = document.getElementById('performanceIndicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'performanceIndicator';
            indicator.className = 'performance-indicator';
            document.body.appendChild(indicator);
        }

        const { loadTime, interactions } = this.performanceMetrics;
        const sessionTime = Math.floor((Date.now() - this.performanceMetrics.startTime) / 1000);
        
        indicator.innerHTML = `
            ⚡ ${loadTime}ms | 
            🖱️ ${interactions} | 
            ⏱️ ${sessionTime}s
        `;
    }

    // === HELP SYSTEM ===
    showHelp() {
        const helpContent = `
            <div class="help-content">
                <h4>🚀 Como usar o Dashboard Aprimorado</h4>
                
                <div class="help-section">
                    <h5>📊 Widgets</h5>
                    <p>Arraste e solte os widgets para reorganizar. Use os controles no canto superior direito para atualizar ou remover.</p>
                </div>
                
                <div class="help-section">
                    <h5>📋 Gerenciador de Tarefas</h5>
                    <p>Adicione tarefas rapidamente, marque como concluídas e ganhe pontos de gamificação.</p>
                </div>
                
                <div class="help-section">
                    <h5>🍅 Pomodoro Timer</h5>
                    <p>Técnica de produtividade com sessões de 25 minutos de foco seguidas de pausas.</p>
                </div>
                
                <div class="help-section">
                    <h5>🎮 Gamificação</h5>
                    <p>Ganhe pontos, mantenha sequências e desbloqueie conquistas para manter a motivação.</p>
                </div>
                
                <div class="help-section">
                    <h5>💾 Backup & Sync</h5>
                    <p>Seus dados são salvos automaticamente. Use o botão de backup para exportar ou sincronizar.</p>
                </div>
                
                <div class="help-section">
                    <h5>📈 Insights</h5>
                    <p>O sistema analisa seus padrões de uso e oferece sugestões personalizadas.</p>
                </div>
            </div>
            <style>
                .help-content { font-family: var(--font-primary); line-height: 1.5; }
                .help-section { margin-bottom: 16px; }
                .help-section h5 { margin: 0 0 6px 0; color: var(--primary); font-size: 14px; }
                .help-section p { margin: 0; font-size: 13px; color: var(--text-secondary); }
            </style>
        `;
        
        this.showModal('💡 Ajuda & Guia', helpContent);
    }

    // === THEME CUSTOMIZATION ===
    initThemeCustomization() {
        // Add theme controls to backup panel
        const backupControls = document.getElementById('backupControls');
        if (backupControls) {
            const themeButton = document.createElement('button');
            themeButton.innerHTML = '🎨 Temas';
            themeButton.style.cssText = `
                padding: 8px 12px;
                border: none;
                border-radius: 6px;
                background: var(--primary);
                color: white;
                cursor: pointer;
                font-size: 12px;
                margin-top: 8px;
                width: 100%;
            `;
            themeButton.onclick = () => this.showThemeCustomization();
            
            const buttonsContainer = backupControls.querySelector('.backup-buttons');
            if (buttonsContainer) {
                buttonsContainer.appendChild(themeButton);
            }
        }
    }

    showThemeCustomization() {
        const themes = [
            { name: 'Padrão (Escuro)', primary: '#667eea', secondary: '#764ba2' },
            { name: 'Azul Oceano', primary: '#1e3c72', secondary: '#2a5298' },
            { name: 'Verde Floresta', primary: '#134e5e', secondary: '#71b280' },
            { name: 'Roxo Galaxy', primary: '#5b247a', secondary: '#1bcedf' },
            { name: 'Laranja Sunset', primary: '#f093fb', secondary: '#f5576c' },
            { name: 'Cinza Profissional', primary: '#4b6cb7', secondary: '#182848' }
        ];

        const themeContent = `
            <div class="theme-customization">
                <h4>🎨 Personalização de Tema</h4>
                <div class="theme-options">
                    ${themes.map(theme => `
                        <div class="theme-option" onclick="dashboardEnhanced.applyTheme('${theme.primary}', '${theme.secondary}')">
                            <div class="theme-preview" style="
                                background: linear-gradient(135deg, ${theme.primary}, ${theme.secondary});
                                width: 60px;
                                height: 40px;
                                border-radius: 6px;
                                margin-bottom: 8px;
                            "></div>
                            <span class="theme-name">${theme.name}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="custom-colors">
                    <h5>🎯 Cores Personalizadas</h5>
                    <div class="color-inputs">
                        <div>
                            <label>Cor Principal:</label>
                            <input type="color" id="primaryColor" value="#667eea">
                        </div>
                        <div>
                            <label>Cor Secundária:</label>
                            <input type="color" id="secondaryColor" value="#764ba2">
                        </div>
                        <button onclick="dashboardEnhanced.applyCustomTheme()">Aplicar Cores</button>
                    </div>
                </div>
            </div>
            <style>
                .theme-customization { font-family: var(--font-primary); }
                .theme-options { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin: 16px 0; }
                .theme-option { text-align: center; cursor: pointer; padding: 12px; border-radius: 8px; transition: background 0.2s; }
                .theme-option:hover { background: var(--bg-secondary); }
                .theme-name { font-size: 12px; color: var(--text-secondary); }
                .custom-colors { margin-top: 24px; padding-top: 16px; border-top: 1px solid var(--border); }
                .custom-colors h5 { margin: 0 0 12px 0; font-size: 14px; }
                .color-inputs { display: flex; gap: 12px; align-items: end; flex-wrap: wrap; }
                .color-inputs div { display: flex; flex-direction: column; gap: 4px; }
                .color-inputs label { font-size: 12px; color: var(--text-secondary); }
                .color-inputs input[type="color"] { width: 50px; height: 30px; border: none; border-radius: 4px; cursor: pointer; }
                .color-inputs button { padding: 6px 12px; border: none; border-radius: 4px; background: var(--primary); color: white; cursor: pointer; }
            </style>
        `;

        this.showModal('Personalização de Tema', themeContent);
    }

    applyTheme(primary, secondary) {
        const root = document.documentElement;
        root.style.setProperty('--primary', primary);
        root.style.setProperty('--secondary', secondary);
        
        // Save theme preference
        localStorage.setItem('personal-hub-theme', JSON.stringify({ primary, secondary }));
        
        this.showToast('🎨 Tema aplicado', 'Personalização salva com sucesso!', 'success');
        
        // Close modal
        const modal = document.getElementById('dynamicModal');
        if (modal) modal.remove();
    }

    applyCustomTheme() {
        const primary = document.getElementById('primaryColor')?.value || '#667eea';
        const secondary = document.getElementById('secondaryColor')?.value || '#764ba2';
        this.applyTheme(primary, secondary);
    }

    loadSavedTheme() {
        try {
            const savedTheme = localStorage.getItem('personal-hub-theme');
            if (savedTheme) {
                const { primary, secondary } = JSON.parse(savedTheme);
                this.applyTheme(primary, secondary);
            }
        } catch (error) {
            console.error('Erro ao carregar tema salvo:', error);
        }
    }

    // === PUBLIC METHODS FOR UI INTERACTIONS ===
    addQuickTask() {
        const taskText = prompt('Digite sua nova tarefa:');
        if (taskText && taskText.trim()) {
            const task = {
                id: Date.now(),
                text: taskText.trim(),
                completed: false,
                createdAt: Date.now()
            };
            
            this.productivityData.tasks.push(task);
            this.saveTasks();
            this.loadTasks();
            this.updateStatsWidget();
            
            this.addNotification('Tarefa adicionada', taskText, 'plus', 'success');
        }
    }

    addQuickNote() {
        const note = prompt('Digite sua nota rápida:');
        if (note && note.trim()) {
            const timestamp = new Date().toLocaleString('pt-BR');
            this.productivityData.notes += (this.productivityData.notes ? '\n' : '') + `[${timestamp}] ${note.trim()}`;
            localStorage.setItem('personal-hub-quick-notes', this.productivityData.notes);
            
            const notesArea = document.getElementById('quickNotesArea');
            if (notesArea) {
                notesArea.value = this.productivityData.notes;
            }
            
            this.addNotification('Nota adicionada', note, 'sticky-note', 'info');
        }
    }

    setMood(value) {
        try {
            const moodData = JSON.parse(localStorage.getItem('personal-hub-mood') || '[]');
            const today = new Date().toDateString();
            
            // Remove today's entry if exists
            const filteredData = moodData.filter(entry => entry.date !== today);
            filteredData.push({ date: today, mood: value, timestamp: Date.now() });
            
            localStorage.setItem('personal-hub-mood', JSON.stringify(filteredData));
            this.updateMoodWidget();
            
            const moodEmojis = ['😢', '😐', '😊', '😄', '🤩'];
            const moodText = ['muito triste', 'triste', 'neutro', 'feliz', 'muito feliz'];
            this.addNotification('Humor registrado', `Você se sente ${moodText[value - 1]} hoje ${moodEmojis[value - 1]}`, 'heart', 'info');
        } catch (error) {
            console.error('Erro ao salvar humor:', error);
        }
    }

    trackMood() {
        // Show mood selection dialog
        const mood = prompt('Como você está se sentindo hoje?\n1 - 😢 Muito triste\n2 - 😐 Triste\n3 - 😊 Neutro\n4 - 😄 Feliz\n5 - 🤩 Muito feliz\n\nDigite um número de 1 a 5:');
        const moodValue = parseInt(mood);
        
        if (moodValue >= 1 && moodValue <= 5) {
            this.setMood(moodValue);
        } else if (mood !== null) {
            alert('Por favor, digite um número de 1 a 5.');
        }
    }

    refreshWidget(widgetId) {
        switch(widgetId) {
            case 'stats':
                this.updateStatsWidget();
                break;
            case 'activity':
                this.updateActivityWidget();
                break;
            case 'insights':
                this.loadInsights();
                break;
            case 'goals':
                this.updateGoalsWidget();
                break;
            case 'mood':
                this.updateMoodWidget();
                break;
            case 'quickActions':
                this.updateQuickActionsWidget();
                break;
        }
        
        this.addNotification('Widget atualizado', `Widget ${widgetId} foi atualizado`, 'refresh', 'info');
    }

    removeWidget(widgetId) {
        const widget = document.querySelector(`[data-widget="${widgetId}"]`);
        if (widget) {
            widget.style.display = 'none';
            this.addNotification('Widget removido', `Widget ${widgetId} foi ocultado`, 'eye-slash', 'info');
        }
    }

    toggleSidebar() {
        const sidebar = document.getElementById('productivitySidebar');
        if (sidebar) {
            sidebar.classList.toggle('collapsed');
        }
    }

    saveWidgetPositions() {
        try {
            const widgets = document.querySelectorAll('.widget');
            const positions = Array.from(widgets).map((widget, index) => ({
                id: widget.dataset.widget,
                position: index
            }));
            
            localStorage.setItem('personal-hub-widget-positions', JSON.stringify(positions));
        } catch (error) {
            console.error('Erro ao salvar posições dos widgets:', error);
        }
    }
}

// Global instance
let dashboardEnhanced = null;

// CSS Animation for points
const style = document.createElement('style');
style.textContent = `
    @keyframes pointsFloat {
        0% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
        }
        100% {
            opacity: 0;
            transform: translate(-50%, -150%) scale(1.2);
        }
    }
`;
document.head.appendChild(style);

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit for other scripts to load
    setTimeout(() => {
        dashboardEnhanced = new DashboardEnhanced();
        
        // Check if we're on the dashboard page and enhanced mode is enabled
        if (document.getElementById('enhancedDashboard')) {
            dashboardEnhanced.init();
        }
    }, 500);
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DashboardEnhanced;
}
