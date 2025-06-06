// Personal Hub - Dashboard
class PersonalHubDashboard {
    constructor() {
        this.user = null;
        this.stats = {};
        this.init();
    }

    init() {
        this.checkAuth();
        this.setupEventListeners();
    }

    checkAuth() {
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                this.user = user;
                this.loadDashboard();
                document.getElementById('userInfo').textContent = `Olá, ${user.displayName || user.email}!`;
            } else {
                window.location.href = 'index.html';
            }
        });
    }

    setupEventListeners() {
        document.getElementById('logoutBtn')?.addEventListener('click', () => {
            firebase.auth().signOut();
        });
    }

    async loadDashboard() {
        await this.loadStats();
        await this.loadRecentActivity();
    }

    async loadStats() {
        try {
            // Carregar stats do usuário
            const userDoc = await db.collection('users').doc(this.user.uid).get();
            if (userDoc.exists) {
                this.stats = userDoc.data().stats || {};
            }

            // Contar entradas do diário
            const diaryCount = await db.collection('diary')
                .where('userId', '==', this.user.uid)
                .get();
            this.stats.totalEntries = diaryCount.size;

            // Contar filmes
            const moviesCount = await db.collection('movies')
                .where('userId', '==', this.user.uid)
                .get();
            this.stats.moviesWatched = moviesCount.size;

            // Contar livros
            const booksCount = await db.collection('books')
                .where('userId', '==', this.user.uid)
                .get();
            this.stats.booksRead = booksCount.size;

            // Contar músicas
            const songsCount = await db.collection('music')
                .where('userId', '==', this.user.uid)
                .get();
            this.stats.songsPlayed = songsCount.size;

            this.renderStats();
        } catch (error) {
            console.error('Erro ao carregar stats:', error);
        }
    }

    renderStats() {
        const statsGrid = document.getElementById('statsGrid');
        statsGrid.innerHTML = `
            <div class="stat-card">
                <div class="stat-icon">📖</div>
                <div class="stat-content">
                    <div class="stat-number">${this.stats.totalEntries || 0}</div>
                    <div class="stat-label">Entradas do Diário</div>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">🎬</div>
                <div class="stat-content">
                    <div class="stat-number">${this.stats.moviesWatched || 0}</div>
                    <div class="stat-label">Filmes Assistidos</div>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">📚</div>
                <div class="stat-content">
                    <div class="stat-number">${this.stats.booksRead || 0}</div>
                    <div class="stat-label">Livros Lidos</div>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">🎵</div>
                <div class="stat-content">
                    <div class="stat-number">${this.stats.songsPlayed || 0}</div>
                    <div class="stat-label">Músicas na Biblioteca</div>
                </div>
            </div>
        `;
    }

    async loadRecentActivity() {
        try {
            // Buscar atividades recentes de todas as coleções
            const activities = [];

            // Diário
            const diaryDocs = await db.collection('diary')
                .where('userId', '==', this.user.uid)
                .orderBy('createdAt', 'desc')
                .limit(3)
                .get();
            
            diaryDocs.forEach(doc => {
                const data = doc.data();
                activities.push({
                    type: 'diary',
                    icon: '📖',
                    text: `Nova entrada no diário: "${data.title || 'Sem título'}"`,
                    time: data.createdAt.toDate()
                });
            });

            // Filmes
            const moviesDocs = await db.collection('movies')
                .where('userId', '==', this.user.uid)
                .orderBy('createdAt', 'desc')
                .limit(2)
                .get();
            
            moviesDocs.forEach(doc => {
                const data = doc.data();
                activities.push({
                    type: 'movie',
                    icon: '🎬',
                    text: `Assistiu: ${data.title}`,
                    time: data.createdAt.toDate()
                });
            });

            // Livros
            const booksDocs = await db.collection('books')
                .where('userId', '==', this.user.uid)
                .orderBy('createdAt', 'desc')
                .limit(2)
                .get();
            
            booksDocs.forEach(doc => {
                const data = doc.data();
                activities.push({
                    type: 'book',
                    icon: '📚',
                    text: `Leu: ${data.title}`,
                    time: data.createdAt.toDate()
                });
            });

            // Ordenar por data
            activities.sort((a, b) => b.time - a.time);
            
            this.renderActivity(activities.slice(0, 5));
        } catch (error) {
            console.error('Erro ao carregar atividades:', error);
        }
    }

    renderActivity(activities) {
        const activityFeed = document.getElementById('activityFeed');
        
        if (activities.length === 0) {
            activityFeed.innerHTML = '<p class="no-activity">Nenhuma atividade recente. Comece adicionando algo!</p>';
            return;
        }

        activityFeed.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <span class="activity-icon">${activity.icon}</span>
                <div class="activity-content">
                    <p class="activity-text">${activity.text}</p>
                    <span class="activity-time">${this.formatTime(activity.time)}</span>
                </div>
            </div>
        `).join('');
    }

    formatTime(date) {
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 60) return `${diffMins}min atrás`;
        if (diffHours < 24) return `${diffHours}h atrás`;
        if (diffDays < 7) return `${diffDays}d atrás`;
        
        return date.toLocaleDateString('pt-BR');
    }
}

// Funções para modais
function openDiary() {
    document.getElementById('diaryModal').style.display = 'block';
}

function addMovie() {
    document.getElementById('movieModal').style.display = 'block';
}

function addBook() {
    document.getElementById('bookModal').style.display = 'block';
}

function openMusicPlayer() {
    alert('Player de música em desenvolvimento! Em breve você poderá fazer upload e organizar suas músicas.');
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
    
    // Limpar formulários
    const modal = document.getElementById(modalId);
    const form = modal.querySelector('form');
    if (form) {
        form.reset();
        // Limpar resultados de busca
        const searchResults = modal.querySelector('.search-results');
        if (searchResults) searchResults.innerHTML = '';
        
        // Esconder seleção
        const selectedItem = modal.querySelector('.selected-item');
        if (selectedItem) selectedItem.style.display = 'none';
    }
}

// Fechar modal clicando fora
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
}

// Funcionalidades de busca
let selectedMovieData = null;
let selectedBookData = null;

async function searchMovies() {
    const query = document.getElementById('movieSearch').value.trim();
    if (!query) return;
    
    const resultsContainer = document.getElementById('movieResults');
    resultsContainer.innerHTML = '<div class="loading">Buscando filmes...</div>';
    
    try {
        const response = await tmdbRequest('/search/movie', { query: query });
        
        if (response && response.results && response.results.length > 0) {
            resultsContainer.innerHTML = response.results.slice(0, 5).map(movie => `
                <div class="search-item" onclick="selectMovie(${JSON.stringify(movie).replace(/"/g, '&quot;')})">
                    <img src="${movie.poster_path ? 
                        PERSONAL_HUB_CONFIG.tmdb.imageBaseURL + movie.poster_path : 
                        'https://via.placeholder.com/60x90?text=Sem+Imagem'}" 
                        alt="${movie.title}">
                    <div class="search-item-info">
                        <div class="search-item-title">${movie.title}</div>
                        <div class="search-item-meta">
                            ${movie.release_date ? new Date(movie.release_date).getFullYear() : 'Ano não informado'} • 
                            ⭐ ${movie.vote_average.toFixed(1)}/10
                        </div>
                        <div class="search-item-desc">${movie.overview || 'Sem descrição disponível'}</div>
                    </div>
                </div>
            `).join('');
        } else {
            resultsContainer.innerHTML = '<div class="loading">Nenhum filme encontrado</div>';
        }
    } catch (error) {
        resultsContainer.innerHTML = '<div class="loading">Erro na busca. Tente novamente.</div>';
        console.error('Erro ao buscar filmes:', error);
    }
}

function selectMovie(movieData) {
    selectedMovieData = movieData;
    document.getElementById('selectedMovie').style.display = 'block';
    
    // Exibir informações do filme selecionado
    const selectedDiv = document.getElementById('selectedMovie');
    const existingInfo = selectedDiv.querySelector('.selected-info');
    if (existingInfo) existingInfo.remove();
    
    const infoDiv = document.createElement('div');
    infoDiv.className = 'selected-info';
    infoDiv.innerHTML = `
        <h4>📽️ ${movieData.title} (${movieData.release_date ? new Date(movieData.release_date).getFullYear() : 'Ano não informado'})</h4>
        <p style="color: var(--text-color); opacity: 0.8; margin-bottom: 1rem;">${movieData.overview || 'Sem descrição disponível'}</p>
    `;
    
    // Inserir antes do primeiro form-group
    const firstFormGroup = selectedDiv.querySelector('.form-group');
    selectedDiv.insertBefore(infoDiv, firstFormGroup);
}

async function searchBooks() {
    const query = document.getElementById('bookSearch').value.trim();
    if (!query) return;
    
    const resultsContainer = document.getElementById('bookResults');
    resultsContainer.innerHTML = '<div class="loading">Buscando livros...</div>';
    
    try {
        const response = await googleBooksRequest('/volumes', { q: query });
        
        if (response && response.items && response.items.length > 0) {
            resultsContainer.innerHTML = response.items.slice(0, 5).map(item => {
                const book = item.volumeInfo;
                return `
                    <div class="search-item" onclick="selectBook(${JSON.stringify(item).replace(/"/g, '&quot;')})">
                        <img src="${book.imageLinks?.thumbnail || 
                            'https://via.placeholder.com/60x90?text=Sem+Capa'}" 
                            alt="${book.title}">
                        <div class="search-item-info">
                            <div class="search-item-title">${book.title}</div>
                            <div class="search-item-meta">
                                ${book.authors ? book.authors.join(', ') : 'Autor não informado'} • 
                                ${book.publishedDate ? new Date(book.publishedDate).getFullYear() : 'Ano não informado'}
                                ${book.pageCount ? ` • ${book.pageCount} páginas` : ''}
                            </div>
                            <div class="search-item-desc">${book.description || 'Sem descrição disponível'}</div>
                        </div>
                    </div>
                `;
            }).join('');
        } else {
            resultsContainer.innerHTML = '<div class="loading">Nenhum livro encontrado</div>';
        }
    } catch (error) {
        resultsContainer.innerHTML = '<div class="loading">Erro na busca. Tente novamente.</div>';
        console.error('Erro ao buscar livros:', error);
    }
}

function selectBook(bookData) {
    selectedBookData = bookData;
    document.getElementById('selectedBook').style.display = 'block';
    
    // Preencher páginas automaticamente se disponível
    if (bookData.volumeInfo.pageCount) {
        document.getElementById('bookPages').value = bookData.volumeInfo.pageCount;
    }
    
    // Exibir informações do livro selecionado
    const selectedDiv = document.getElementById('selectedBook');
    const existingInfo = selectedDiv.querySelector('.selected-info');
    if (existingInfo) existingInfo.remove();
    
    const infoDiv = document.createElement('div');
    infoDiv.className = 'selected-info';
    infoDiv.innerHTML = `
        <h4>📖 ${bookData.volumeInfo.title}</h4>
        <p style="color: var(--text-color); opacity: 0.9; margin-bottom: 0.5rem;">
            <strong>Autor(es):</strong> ${bookData.volumeInfo.authors ? bookData.volumeInfo.authors.join(', ') : 'Não informado'}
        </p>
        <p style="color: var(--text-color); opacity: 0.8; margin-bottom: 1rem;">
            ${bookData.volumeInfo.description ? 
                bookData.volumeInfo.description.substring(0, 200) + '...' : 
                'Sem descrição disponível'}
        </p>
    `;
    
    // Inserir antes do primeiro form-group
    const firstFormGroup = selectedDiv.querySelector('.form-group');
    selectedDiv.insertBefore(infoDiv, firstFormGroup);
}

// Handlers de formulários
document.addEventListener('DOMContentLoaded', () => {
    // Form de diário
    document.getElementById('diaryForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const title = document.getElementById('diaryTitle').value;
        const mood = document.getElementById('diaryMood').value;
        const content = document.getElementById('diaryContent').value;
        
        try {
            await db.collection('diary').add({
                userId: firebase.auth().currentUser.uid,
                title: title,
                content: content,
                mood: mood,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            // Log atividade
            await db.collection('activities').add({
                userId: firebase.auth().currentUser.uid,
                type: 'diary',
                action: 'create',
                description: `Nova entrada no diário: "${title}"`,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            closeModal('diaryModal');
            alert('Entrada do diário salva com sucesso!');
            window.location.reload();
        } catch (error) {
            alert('Erro ao salvar entrada: ' + error.message);
        }
    });
    
    // Form de filme
    document.getElementById('movieForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!selectedMovieData) {
            alert('Selecione um filme primeiro!');
            return;
        }
        
        const status = document.getElementById('movieStatus').value;
        const rating = document.getElementById('movieRating').value;
        const review = document.getElementById('movieReview').value;
        
        try {
            await db.collection('movies').add({
                userId: firebase.auth().currentUser.uid,
                title: selectedMovieData.title,
                poster: selectedMovieData.poster_path ? 
                    PERSONAL_HUB_CONFIG.tmdb.imageBaseURL + selectedMovieData.poster_path : null,
                overview: selectedMovieData.overview,
                releaseDate: selectedMovieData.release_date,
                tmdbId: selectedMovieData.id,
                tmdbRating: selectedMovieData.vote_average,
                status: status,
                userRating: rating ? parseFloat(rating) : null,
                review: review,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            // Log atividade
            await db.collection('activities').add({
                userId: firebase.auth().currentUser.uid,
                type: 'movie',
                action: 'create',
                description: `Adicionou filme: "${selectedMovieData.title}"`,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            closeModal('movieModal');
            alert('Filme adicionado com sucesso!');
            window.location.reload();
        } catch (error) {
            alert('Erro ao adicionar filme: ' + error.message);
        }
    });
    
    // Form de livro
    document.getElementById('bookForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!selectedBookData) {
            alert('Selecione um livro primeiro!');
            return;
        }
        
        const status = document.getElementById('bookStatus').value;
        const rating = document.getElementById('bookRating').value;
        const pages = document.getElementById('bookPages').value;
        const currentPage = document.getElementById('bookCurrentPage').value;
        const review = document.getElementById('bookReview').value;
        
        try {
            await db.collection('books').add({
                userId: firebase.auth().currentUser.uid,
                title: selectedBookData.volumeInfo.title,
                authors: selectedBookData.volumeInfo.authors || [],
                description: selectedBookData.volumeInfo.description,
                thumbnail: selectedBookData.volumeInfo.imageLinks?.thumbnail,
                publishedDate: selectedBookData.volumeInfo.publishedDate,
                googleBooksId: selectedBookData.id,
                status: status,
                userRating: rating ? parseFloat(rating) : null,
                pages: pages ? parseInt(pages) : null,
                currentPage: currentPage ? parseInt(currentPage) : 0,
                review: review,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            // Log atividade
            await db.collection('activities').add({
                userId: firebase.auth().currentUser.uid,
                type: 'book',
                action: 'create',
                description: `Adicionou livro: "${selectedBookData.volumeInfo.title}"`,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            closeModal('bookModal');
            alert('Livro adicionado com sucesso!');
            window.location.reload();
        } catch (error) {
            alert('Erro ao adicionar livro: ' + error.message);
        }
    });
    
    // Inicializar dashboard
    new PersonalHubDashboard();
});
