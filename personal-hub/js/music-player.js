// Personal Hub - YouTube Music Player
class YouTubeMusicPlayer {
    constructor() {
        this.player = null;
        this.isReady = false;
        this.isPlaying = false;
        this.currentTrack = null;
        this.playlist = [];
        this.currentIndex = 0;
        this.volume = 50;
        this.user = null;
        
        // Storage fallback system
        this.storageAvailable = this.checkStorageAvailability();
        this.tempStorage = new Map(); // Fallback for when localStorage is blocked
        
        this.init();
    }

    // Check if localStorage is available and not blocked
    checkStorageAvailability() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            console.warn('localStorage is not available, using temporary storage fallback');
            return false;
        }
    }

    // Safe storage methods with fallback
    setStorage(key, value) {
        try {
            if (this.storageAvailable) {
                localStorage.setItem(key, JSON.stringify(value));
            } else {
                this.tempStorage.set(key, value);
            }
        } catch (e) {
            console.warn('Storage failed, using temporary storage:', e);
            this.tempStorage.set(key, value);
        }
    }

    getStorage(key) {
        try {
            if (this.storageAvailable) {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : null;
            } else {
                return this.tempStorage.get(key) || null;
            }
        } catch (e) {
            console.warn('Storage retrieval failed:', e);
            return this.tempStorage.get(key) || null;
        }
    }

    removeStorage(key) {
        try {
            if (this.storageAvailable) {
                localStorage.removeItem(key);
            } else {
                this.tempStorage.delete(key);
            }
        } catch (e) {
            console.warn('Storage removal failed:', e);
            this.tempStorage.delete(key);
        }
    }

    init() {
        this.checkAuth();
        this.loadYouTubeAPI();
        this.setupEventListeners();
    }

    checkAuth() {
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                this.user = user;
                this.loadUserPlaylists();
            }
        });
    }

    loadYouTubeAPI() {
        // Carregar YouTube IFrame API
        if (!window.YT) {
            const tag = document.createElement('script');
            tag.src = 'https://www.youtube.com/iframe_api';
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        }

        // Callback global para quando API carregar
        window.onYouTubeIframeAPIReady = () => {
            this.createPlayer();
        };
    }

    createPlayer() {
        this.player = new YT.Player('youtube-player', {
            height: '0', // Ocultar vídeo
            width: '0',
            playerVars: {
                'playsinline': 1,
                'controls': 0, // Usar controles customizados
                'rel': 0,
                'showinfo': 0,
                'fs': 0,
                'modestbranding': 1
            },
            events: {
                'onReady': (event) => this.onPlayerReady(event),
                'onStateChange': (event) => this.onPlayerStateChange(event),
                'onError': (event) => this.onPlayerError(event)
            }
        });
    }

    onPlayerReady(event) {
        this.isReady = true;
        this.player.setVolume(this.volume);
        console.log('🎵 YouTube Music Player ready!');
    }

    onPlayerStateChange(event) {
        const state = event.data;
        
        switch (state) {
            case YT.PlayerState.PLAYING:
                this.isPlaying = true;
                this.updatePlayButton(true);
                this.updateNowPlaying();
                break;
                
            case YT.PlayerState.PAUSED:
                this.isPlaying = false;
                this.updatePlayButton(false);
                break;
                
            case YT.PlayerState.ENDED:
                this.playNext();
                break;
        }
    }

    onPlayerError(event) {
        console.error('YouTube Player Error:', event.data);
        this.playNext(); // Tentar próxima música em caso de erro
    }

    setupEventListeners() {
        // Botão Play/Pause
        document.getElementById('music-play-btn')?.addEventListener('click', () => {
            this.togglePlay();
        });

        // Botão Anterior
        document.getElementById('music-prev-btn')?.addEventListener('click', () => {
            this.playPrevious();
        });

        // Botão Próxima
        document.getElementById('music-next-btn')?.addEventListener('click', () => {
            this.playNext();
        });

        // Volume
        document.getElementById('music-volume')?.addEventListener('input', (e) => {
            this.setVolume(e.target.value);
        });

        // Busca
        document.getElementById('music-search-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            const query = document.getElementById('music-search-input').value;
            if (query) this.searchMusic(query);
        });

        // Botão de busca
        document.getElementById('music-search-btn')?.addEventListener('click', () => {
            const query = document.getElementById('music-search-input').value;
            if (query) this.searchMusic(query);
        });
    }    async searchMusic(query) {
        try {
            this.showSearchLoading(true);
            const results = await searchYouTubeMusic(query, 15);
            
            if (results && results.items && results.items.length > 0) {
                this.displaySearchResults(results.items);
            } else if (results && results.error) {
                // Handle API errors specifically
                if (results.error.code === 403) {
                    this.showAPIError('A API do YouTube não está configurada corretamente. Usando dados de exemplo.');
                    this.displayMockResults(query);
                } else {
                    this.showAPIError(`Erro da API: ${results.error.message}`);
                }
            } else {
                this.showNoResults();
            }
        } catch (error) {
            console.error('Erro na busca:', error);
            this.showSearchError();
            // Fallback to mock data for demonstration
            this.displayMockResults(query);
        } finally {
            this.showSearchLoading(false);
        }
    }

    displaySearchResults(videos) {
        const resultsContainer = document.getElementById('music-search-results');
        
        if (!videos.length) {
            this.showNoResults();
            return;
        }

        const html = videos.map(video => `
            <div class="music-result-item" data-video-id="${video.id.videoId}">
                <img src="${video.snippet.thumbnails.medium.url}" alt="${video.snippet.title}">
                <div class="music-result-info">
                    <h4>${this.truncateText(video.snippet.title, 60)}</h4>
                    <p>${video.snippet.channelTitle}</p>
                </div>
                <div class="music-result-actions">
                    <button class="btn-play-now" onclick="musicPlayer.playVideo('${video.id.videoId}')">
                        ▶️ Tocar
                    </button>
                    <button class="btn-add-playlist" onclick="musicPlayer.addToPlaylist('${video.id.videoId}', '${this.escapeHtml(video.snippet.title)}', '${this.escapeHtml(video.snippet.channelTitle)}')">
                        ➕ Playlist
                    </button>
                </div>
            </div>
        `).join('');

        resultsContainer.innerHTML = html;
    }

    async playVideo(videoId, title = '', channel = '') {
        if (!this.isReady) {
            console.log('Player não está pronto ainda...');
            return;
        }

        try {
            this.player.loadVideoById(videoId);
            
            // Atualizar info da música atual
            this.currentTrack = {
                id: videoId,
                title: title,
                channel: channel
            };

            // Salvar no histórico do usuário
            if (this.user) {
                await this.saveToHistory(videoId, title, channel);
            }

        } catch (error) {
            console.error('Erro ao reproduzir vídeo:', error);
        }
    }

    async addToPlaylist(videoId, title, channel) {
        const track = {
            id: videoId,
            title: title,
            channel: channel,
            addedAt: new Date()
        };

        this.playlist.push(track);
        this.updatePlaylistDisplay();

        // Salvar no Firebase se logado
        if (this.user) {
            await this.savePlaylistToFirebase();
        }

        // Feedback visual
        this.showToast(`🎵 "${title}" adicionado à playlist!`);
    }

    togglePlay() {
        if (!this.isReady) return;

        if (this.isPlaying) {
            this.player.pauseVideo();
        } else {
            if (this.playlist.length > 0 && !this.currentTrack) {
                this.playFromPlaylist(0);
            } else {
                this.player.playVideo();
            }
        }
    }

    playNext() {
        if (this.playlist.length === 0) return;

        this.currentIndex = (this.currentIndex + 1) % this.playlist.length;
        this.playFromPlaylist(this.currentIndex);
    }

    playPrevious() {
        if (this.playlist.length === 0) return;

        this.currentIndex = this.currentIndex === 0 ? this.playlist.length - 1 : this.currentIndex - 1;
        this.playFromPlaylist(this.currentIndex);
    }

    playFromPlaylist(index) {
        if (index >= 0 && index < this.playlist.length) {
            const track = this.playlist[index];
            this.currentIndex = index;
            this.playVideo(track.id, track.title, track.channel);
        }
    }

    setVolume(volume) {
        this.volume = volume;
        if (this.player) {
            this.player.setVolume(volume);
        }
        document.getElementById('music-volume-display').textContent = volume + '%';
    }

    updatePlayButton(isPlaying) {
        const playBtn = document.getElementById('music-play-btn');
        if (playBtn) {
            playBtn.innerHTML = isPlaying ? '⏸️' : '▶️';
        }
    }

    updateNowPlaying() {
        const nowPlaying = document.getElementById('music-now-playing');
        if (nowPlaying && this.currentTrack) {
            nowPlaying.innerHTML = `
                <div class="now-playing-info">
                    <h4>${this.currentTrack.title}</h4>
                    <p>${this.currentTrack.channel}</p>
                </div>
            `;
        }
    }

    updatePlaylistDisplay() {
        const playlistContainer = document.getElementById('music-playlist');
        
        const html = this.playlist.map((track, index) => `
            <div class="playlist-item ${index === this.currentIndex ? 'active' : ''}" 
                 onclick="musicPlayer.playFromPlaylist(${index})">
                <div class="playlist-info">
                    <h5>${this.truncateText(track.title, 40)}</h5>
                    <p>${track.channel}</p>
                </div>
                <button class="btn-remove" onclick="musicPlayer.removeFromPlaylist(${index}); event.stopPropagation();">
                    ❌
                </button>
            </div>
        `).join('');

        playlistContainer.innerHTML = html || '<p class="empty-playlist">Playlist vazia. Busque e adicione músicas!</p>';
    }

    removeFromPlaylist(index) {
        this.playlist.splice(index, 1);
        
        // Ajustar índice atual se necessário
        if (this.currentIndex >= index) {
            this.currentIndex = Math.max(0, this.currentIndex - 1);
        }
        
        this.updatePlaylistDisplay();
        
        if (this.user) {
            this.savePlaylistToFirebase();
        }
    }    async saveToHistory(videoId, title, channel) {
        try {
            if (this.user && typeof db !== 'undefined') {
                await db.collection('music').add({
                    userId: this.user.uid,
                    videoId: videoId,
                    title: title,
                    channel: channel,
                    playedAt: firebase.firestore.FieldValue.serverTimestamp(),
                    type: 'youtube'
                });
            } else {
                // Fallback to local storage when Firebase is not available
                const history = this.getStorage('music_history') || [];
                history.unshift({
                    videoId,
                    title,
                    channel,
                    playedAt: new Date().toISOString()
                });
                // Keep only last 50 items
                if (history.length > 50) history.splice(50);
                this.setStorage('music_history', history);
            }
        } catch (error) {
            console.error('Erro ao salvar histórico:', error);
            // Fallback to local storage
            const history = this.getStorage('music_history') || [];
            history.unshift({
                videoId,
                title,
                channel,
                playedAt: new Date().toISOString()
            });
            if (history.length > 50) history.splice(50);
            this.setStorage('music_history', history);
        }
    }

    async savePlaylistToFirebase() {
        try {
            if (this.user && typeof db !== 'undefined') {
                await db.collection('users').doc(this.user.uid).set({
                    musicPlaylist: this.playlist
                }, { merge: true });
            } else {
                // Fallback to local storage
                this.setStorage('music_playlist', this.playlist);
            }
        } catch (error) {
            console.error('Erro ao salvar playlist:', error);
            // Fallback to local storage
            this.setStorage('music_playlist', this.playlist);
        }
    }

    async loadUserPlaylists() {
        try {
            if (this.user && typeof db !== 'undefined') {
                const userDoc = await db.collection('users').doc(this.user.uid).get();
                if (userDoc.exists && userDoc.data().musicPlaylist) {
                    this.playlist = userDoc.data().musicPlaylist;
                    this.updatePlaylistDisplay();
                    return;
                }
            }
            
            // Fallback to local storage
            const savedPlaylist = this.getStorage('music_playlist');
            if (savedPlaylist) {
                this.playlist = savedPlaylist;
                this.updatePlaylistDisplay();
            }
        } catch (error) {
            console.error('Erro ao carregar playlist:', error);
            // Try local storage fallback
            const savedPlaylist = this.getStorage('music_playlist');
            if (savedPlaylist) {
                this.playlist = savedPlaylist;
                this.updatePlaylistDisplay();
            }
        }
    }

    // Utility functions
    truncateText(text, maxLength) {
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML.replace(/'/g, '&#39;').replace(/"/g, '&#34;');
    }

    showSearchLoading(show) {
        const resultsContainer = document.getElementById('music-search-results');
        if (show) {
            resultsContainer.innerHTML = '<div class="loading">🔍 Buscando músicas...</div>';
        }
    }

    showNoResults() {
        const resultsContainer = document.getElementById('music-search-results');
        resultsContainer.innerHTML = '<div class="no-results">❌ Nenhuma música encontrada. Tente outros termos.</div>';
    }

    showSearchError() {
        const resultsContainer = document.getElementById('music-search-results');
        resultsContainer.innerHTML = '<div class="error">⚠️ Erro na busca. Tente novamente.</div>';
    }

    showAPIError(message) {
        const resultsContainer = document.getElementById('music-search-results');
        resultsContainer.innerHTML = `
            <div class="api-error">
                ⚠️ ${message}
                <br><small>Mostrando resultados de exemplo para demonstração.</small>
            </div>
        `;
    }

    displayMockResults(query) {
        // Mock data for demonstration when API is not available
        const mockResults = [
            {
                id: { videoId: 'dQw4w9WgXcQ' },
                snippet: {
                    title: `🎵 ${query} - Resultado de Exemplo 1`,
                    channelTitle: 'Canal Musical Demo',
                    thumbnails: {
                        medium: {
                            url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjNjY3ZWVhIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7wn461IE3DunNpY2E8L3RleHQ+PC9zdmc+'
                        }
                    }
                }
            },
            {
                id: { videoId: 'kJQP7kiw5Fk' },
                snippet: {
                    title: `🎶 ${query} - Resultado de Exemplo 2`,
                    channelTitle: 'Artista Demo',
                    thumbnails: {
                        medium: {
                            url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjNzY0YmEyIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7wn462IE11c2ljPC90ZXh0Pjwvc3ZnPg=='
                        }
                    }
                }
            },
            {
                id: { videoId: 'L_jWHffIx5E' },
                snippet: {
                    title: `🎤 ${query} - Resultado de Exemplo 3`,
                    channelTitle: 'Demo Records',
                    thumbnails: {
                        medium: {
                            url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjOTk3M2ZmIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7wn464IE11c2ljPC90ZXh0Pjwvc3ZnPg=='
                        }
                    }
                }
            }
        ];

        this.displaySearchResults(mockResults);
    }

    // ...existing code...
}

// Inicializar player globalmente
window.musicPlayer = null;

// Função para abrir o music player (chamada do dashboard)
function openMusicPlayer() {
    document.getElementById('music-player-modal').style.display = 'flex';
    
    if (!window.musicPlayer) {
        window.musicPlayer = new YouTubeMusicPlayer();
    }
}