// Personal Hub - Autenticação
class PersonalHubAuth {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkAuthState();
    }

    setupEventListeners() {
        // Toggle entre login e registro
        document.getElementById('loginTab')?.addEventListener('click', () => this.showLogin());
        document.getElementById('registerTab')?.addEventListener('click', () => this.showRegister());
        document.getElementById('showRegister')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showRegister();
        });
        document.getElementById('showLogin')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showLogin();
        });

        // Formulários
        document.getElementById('loginForm')?.addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('registerForm')?.addEventListener('submit', (e) => this.handleRegister(e));
    }

    showLogin() {
        document.getElementById('loginTab').classList.add('active');
        document.getElementById('registerTab').classList.remove('active');
        document.getElementById('loginForm').classList.add('active');
        document.getElementById('registerForm').classList.remove('active');
    }

    showRegister() {
        document.getElementById('registerTab').classList.add('active');
        document.getElementById('loginTab').classList.remove('active');
        document.getElementById('registerForm').classList.add('active');
        document.getElementById('loginForm').classList.remove('active');
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;        try {
            // Usar Firebase Auth existente
            const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
            
            // Verificar se o usuário foi aprovado
            const userDoc = await db.collection('users').doc(userCredential.user.uid).get();
            
            if (userDoc.exists) {
                const userData = userDoc.data();
                if (userData.status === 'pending') {
                    await firebase.auth().signOut();
                    alert('Sua conta ainda está aguardando aprovação do administrador.');
                    return;
                } else if (userData.status === 'rejected') {
                    await firebase.auth().signOut();
                    alert('Sua conta foi rejeitada. Entre em contato com o administrador.');
                    return;
                }
            }
            
            console.log('Login realizado:', userCredential.user);
            
            // Redirecionar para dashboard
            window.location.href = 'dashboard.html';
        } catch (error) {
            console.error('Erro no login:', error);
            alert('Erro no login: ' + error.message);
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (password !== confirmPassword) {
            alert('As senhas não coincidem!');
            return;
        }

        if (password.length < 6) {
            alert('A senha deve ter pelo menos 6 caracteres!');
            return;
        }        try {
            // Criar usuário no Firebase
            const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
            
            // Atualizar perfil com nome
            await userCredential.user.updateProfile({
                displayName: name
            });

            // Criar documento do usuário no Firestore com status pendente
            await db.collection('users').doc(userCredential.user.uid).set({
                name: name,
                email: email,
                status: 'pending', // Novo campo para controle de aprovação
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                stats: {
                    totalEntries: 0,
                    moviesWatched: 0,
                    booksRead: 0,
                    songsPlayed: 0
                }
            });

            console.log('Usuário registrado:', userCredential.user);
            
            // Sair do usuário criado para aguardar aprovação
            await firebase.auth().signOut();
            
            // Mostrar mensagem de aguardo
            alert('Cadastro realizado com sucesso! Aguarde a aprovação do administrador para acessar o sistema.');
            this.showLogin();
        } catch (error) {
            console.error('Erro no registro:', error);
            alert('Erro no registro: ' + error.message);
        }
    }

    checkAuthState() {
        firebase.auth().onAuthStateChanged((user) => {
            if (user && window.location.pathname.includes('personal-hub/index.html')) {
                // Se usuário logado e na página de login, redirecionar
                window.location.href = 'dashboard.html';
            }
        });
    }
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    new PersonalHubAuth();
});

// Widget para dashboard do portfolio
class PersonalHubWidget {
    constructor() {
        this.stats = {
            totalEntries: 0,
            moviesWatched: 0,
            booksRead: 0,
            songsPlayed: 0,
            lastActivity: 'Nunca'
        };
        this.loadStats();
    }

    async loadStats() {
        try {
            const user = firebase.auth().currentUser;
            if (user) {
                const userDoc = await db.collection('users').doc(user.uid).get();
                if (userDoc.exists) {
                    this.stats = { ...this.stats, ...userDoc.data().stats };
                    
                    // Buscar última atividade
                    const lastEntry = await db.collection('entries')
                        .where('userId', '==', user.uid)
                        .orderBy('createdAt', 'desc')
                        .limit(1)
                        .get();
                    
                    if (!lastEntry.empty) {
                        const lastDate = lastEntry.docs[0].data().createdAt.toDate();
                        this.stats.lastActivity = this.formatDate(lastDate);
                    }
                }
            }
            this.updateWidget();
        } catch (error) {
            console.error('Erro ao carregar stats:', error);
        }
    }

    updateWidget() {
        const widget = document.getElementById('personal-hub-widget');
        if (!widget) return;

        widget.innerHTML = `
            <div class="widget-header">
                <h3 class="widget-title">🏠 Personal Hub</h3>
                <span class="widget-status ${firebase.auth().currentUser ? 'online' : 'offline'}">
                    ${firebase.auth().currentUser ? '🟢 Online' : '🔴 Offline'}
                </span>
            </div>
            <div class="widget-stats">
                <div class="stat-item">
                    <div class="stat-number">${this.stats.totalEntries}</div>
                    <div class="stat-label">Entradas do Diário</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">${this.stats.moviesWatched}</div>
                    <div class="stat-label">Filmes Assistidos</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">${this.stats.booksRead}</div>
                    <div class="stat-label">Livros Lidos</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">${this.stats.songsPlayed}</div>
                    <div class="stat-label">Músicas Tocadas</div>
                </div>
            </div>
            <div class="widget-footer">
                <p><strong>Última atividade:</strong> ${this.stats.lastActivity}</p>
                <div class="widget-actions">
                    ${firebase.auth().currentUser ? 
                        '<a href="personal-hub/dashboard.html" class="btn-widget btn-primary-widget">Abrir Dashboard</a>' :
                        '<a href="personal-hub/index.html" class="btn-widget btn-primary-widget">Entrar no Hub</a>'
                    }
                    <a href="pages/personal-hub-stats.html" class="btn-widget btn-secondary-widget">Ver Detalhes</a>
                </div>
            </div>
        `;
    }

    formatDate(date) {
        const now = new Date();
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return 'Hoje';
        if (diffDays === 1) return 'Ontem';
        if (diffDays < 7) return `${diffDays} dias atrás`;
        
        return date.toLocaleDateString('pt-BR');
    }
}

// Função global para inicializar widget
window.initPersonalHubWidget = () => {
    return new PersonalHubWidget();
};
