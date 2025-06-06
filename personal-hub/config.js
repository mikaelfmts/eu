// Personal Hub - Configuração das APIs
const PERSONAL_HUB_CONFIG = {
    // TMDB API
    tmdb: {
        apiKey: '066a2b59382e7b03a5b3abc8944e0f9e',
        baseURL: 'https://api.themoviedb.org/3',
        imageBaseURL: 'https://image.tmdb.org/t/p/w500'
    },
    
    // Google Books API
    googleBooks: {
        apiKey: 'AIzaSyDWfAhM7puO7VeSSyXO190bbG1-tDzvl9Y',
        baseURL: 'https://www.googleapis.com/books/v1'
    },
    
    // Cloudinary (para otimização de imagens)
    cloudinary: {
        cloudName: 'duulvcbfa',
        apiKey: '622323917966629',
        // Nota: API Secret deve ficar no servidor, aqui usamos apenas upload unsigned
        uploadPreset: 'personal_hub' // Criar no painel do Cloudinary
    },
    
    // Firebase (usar a configuração existente do projeto)
    firebase: {
        // Usar firebase-config.js existente - configuração já está correta
        projectId: 'mikaelfmts',
        authDomain: 'mikaelfmts.firebaseapp.com'
    },
    
    // YouTube API (para Music Player)
    youtube: {
        apiKey: 'AIzaSyDWfAhM7puO7VeSSyXO190bbG1-tDzvl9Y', // Mesma key do Google Books
        baseURL: 'https://www.googleapis.com/youtube/v3',
        maxResults: 20 // Máximo de resultados por busca
    }
};

// Função para fazer requisições à API do TMDB
async function tmdbRequest(endpoint, params = {}) {
    const url = new URL(`${PERSONAL_HUB_CONFIG.tmdb.baseURL}${endpoint}`);
    url.searchParams.append('api_key', PERSONAL_HUB_CONFIG.tmdb.apiKey);
    
    Object.keys(params).forEach(key => {
        url.searchParams.append(key, params[key]);
    });
    
    try {
        const response = await fetch(url);
        return await response.json();
    } catch (error) {
        console.error('TMDB API Error:', error);
        return null;
    }
}

// Função para fazer requisições à API do Google Books
async function googleBooksRequest(endpoint, params = {}) {
    const url = new URL(`${PERSONAL_HUB_CONFIG.googleBooks.baseURL}${endpoint}`);
    url.searchParams.append('key', PERSONAL_HUB_CONFIG.googleBooks.apiKey);
    
    Object.keys(params).forEach(key => {
        url.searchParams.append(key, params[key]);
    });
    
    try {
        const response = await fetch(url);
        return await response.json();
    } catch (error) {
        console.error('Google Books API Error:', error);
        return null;
    }
}

// Função para fazer requisições à API do YouTube
async function youtubeRequest(endpoint, params = {}) {
    const url = new URL(`${PERSONAL_HUB_CONFIG.youtube.baseURL}${endpoint}`);
    url.searchParams.append('key', PERSONAL_HUB_CONFIG.youtube.apiKey);
    
    Object.keys(params).forEach(key => {
        url.searchParams.append(key, params[key]);
    });
    
    try {
        const response = await fetch(url);
        return await response.json();
    } catch (error) {
        console.error('YouTube API Error:', error);
        return null;
    }
}

// Função para buscar músicas no YouTube
async function searchYouTubeMusic(query, maxResults = 10) {
    return await youtubeRequest('/search', {
        part: 'snippet',
        q: query + ' music', // Adicionar "music" para melhorar resultados
        type: 'video',
        videoCategoryId: '10', // Categoria música
        maxResults: maxResults,
        order: 'relevance'
    });
}
