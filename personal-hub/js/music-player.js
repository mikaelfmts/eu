// Personal Hub - YouTube Music Player
class YouTubeMusicPlayer {
    constructor() {
        this.player = null;
        this.isReady = false;
        this.isPlaying = false;
        this.currentTrack = null;
        this.playlist = [];        this.currentIndex = 0;
        this.volume = 50;
        this.user = null;
        
        // New features
        this.shuffleMode = false;
        this.repeatMode = 'none'; // 'none', 'all', 'one'
        this.queue = [];
        this.currentTime = 0;
        this.duration = 0;
        this.updateInterval = null;
        this.sleepTimer = null;
        this.sleepTimeLeft = 0;
        this.playbackSpeed = 1;
        this.playlists = new Map();
        this.currentPlaylistId = 'default';
        this.searchHistory = [];
        this.userStats = {
            totalPlayTime: 0,
            songsPlayed: 0,
            favoriteArtists: new Map(),
            playHistory: []
        };
        
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
    }    init() {
        this.checkAuth();
        this.loadYouTubeAPI();
        this.setupEventListeners();
        this.setupKeyboardShortcuts();
        this.loadLocalData();
        this.startProgressUpdater();
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
    }    setupEventListeners() {
        // Basic Controls
        document.getElementById('music-play-btn')?.addEventListener('click', () => {
            this.togglePlay();
        });

        document.getElementById('music-prev-btn')?.addEventListener('click', () => {
            this.playPrevious();
        });

        document.getElementById('music-next-btn')?.addEventListener('click', () => {
            this.playNext();
        });

        // Volume Controls
        document.getElementById('music-volume')?.addEventListener('input', (e) => {
            this.setVolume(e.target.value);
        });

        document.getElementById('mute-btn')?.addEventListener('click', () => {
            this.toggleMute();
        });

        // Progress Bar
        document.getElementById('progress-bar')?.addEventListener('input', (e) => {
            this.seekTo(e.target.value);
        });

        // Mode Controls
        document.getElementById('music-shuffle-btn')?.addEventListener('click', () => {
            this.toggleShuffle();
        });

        document.getElementById('music-repeat-btn')?.addEventListener('click', () => {
            this.cycleRepeatMode();
        });

        // Search
        document.getElementById('music-search-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            const query = document.getElementById('music-search-input').value;
            if (query) {
                this.searchMusic(query);
                this.saveSearchHistory(query);
            }
        });

        document.getElementById('music-search-btn')?.addEventListener('click', () => {
            const query = document.getElementById('music-search-input').value;
            if (query) {
                this.searchMusic(query);
                this.saveSearchHistory(query);
            }
        });

        document.getElementById('clear-search-btn')?.addEventListener('click', () => {
            document.getElementById('music-search-input').value = '';
            document.getElementById('music-search-results').innerHTML = '<p class="search-hint">Digite algo acima e pressione Enter para buscar músicas</p>';
        });

        // Advanced Controls
        document.getElementById('playback-speed')?.addEventListener('change', (e) => {
            this.setPlaybackSpeed(parseFloat(e.target.value));
        });

        document.getElementById('sleep-timer-btn')?.addEventListener('click', () => {
            const minutes = prompt('Sleep timer (minutos):', '30');
            if (minutes && !isNaN(minutes)) {
                this.setSleepTimer(parseInt(minutes));
            }
        });

        // Queue Controls
        document.getElementById('clear-queue-btn')?.addEventListener('click', () => {
            this.clearQueue();
        });

        document.getElementById('save-queue-btn')?.addEventListener('click', () => {
            const name = prompt('Nome da playlist:', 'Nova Playlist');
            if (name) {
                const playlistId = this.createPlaylist(name);
                const playlist = this.playlists.get(playlistId);
                playlist.tracks = [...this.queue];
                this.queue = [];
                this.updateQueueDisplay();
                this.savePlaylistsToStorage();
                this.showToast(`💾 Fila salva como "${name}"`);
            }
        });

        // Playlist Management
        document.getElementById('new-playlist-btn')?.addEventListener('click', () => {
            const name = prompt('Nome da nova playlist:', 'Minha Playlist');
            if (name) {
                this.createPlaylist(name);
            }
        });

        document.getElementById('active-playlist')?.addEventListener('change', (e) => {
            this.switchPlaylist(e.target.value);
        });

        document.getElementById('export-playlist-btn')?.addEventListener('click', () => {
            this.exportPlaylist();
        });

        document.getElementById('import-playlist-btn')?.addEventListener('click', () => {
            this.importPlaylist();
        });

        // Feature Toggles
        document.getElementById('toggle-visualizer')?.addEventListener('click', () => {
            this.toggleVisualizer();
        });

        document.getElementById('toggle-lyrics')?.addEventListener('click', () => {
            this.toggleLyrics();
        });

        document.getElementById('party-mode-btn')?.addEventListener('click', () => {
            this.togglePartyMode();
        });

        // Mini Player Controls
        document.getElementById('minimize-player')?.addEventListener('click', () => {
            this.minimizePlayer();
        });

        document.getElementById('expand-player')?.addEventListener('click', () => {
            this.expandPlayer();
        });

        document.getElementById('close-mini-player')?.addEventListener('click', () => {
            this.closeMiniPlayer();
        });

        // Mini Player Controls (duplicate for mini player)
        document.getElementById('mini-play-btn')?.addEventListener('click', () => {
            this.togglePlay();
        });

        document.getElementById('mini-prev-btn')?.addEventListener('click', () => {
            this.playPrevious();
        });

        document.getElementById('mini-next-btn')?.addEventListener('click', () => {
            this.playNext();
        });

        // Tab Controls
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Search Filters
        document.getElementById('filter-duration')?.addEventListener('change', () => {
            this.updateSearchFilters();
        });

        document.getElementById('filter-quality')?.addEventListener('change', () => {
            this.updateSearchFilters();
        });

        // Focus search with Ctrl+F
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'f') {
                const modal = document.getElementById('music-player-modal');
                if (modal && modal.style.display !== 'none') {
                    e.preventDefault();
                    document.getElementById('music-search-input')?.focus();
                }
            }
        });
    }async searchMusic(query) {
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

    // ===== ADDITIONAL FEATURES =====

    // Mini Player
    minimizePlayer() {
        document.getElementById('music-player-modal').style.display = 'none';
        document.getElementById('mini-player').style.display = 'block';
        this.updateMiniPlayer();
    }

    expandPlayer() {
        document.getElementById('mini-player').style.display = 'none';
        document.getElementById('music-player-modal').style.display = 'flex';
    }

    closeMiniPlayer() {
        document.getElementById('mini-player').style.display = 'none';
    }

    updateMiniPlayer() {
        const miniTitle = document.getElementById('mini-title');
        const miniPlayBtn = document.getElementById('mini-play-btn');
        const miniProgress = document.getElementById('mini-progress-bar');

        if (this.currentTrack) {
            if (miniTitle) {
                miniTitle.textContent = this.currentTrack.title || 'Música sem título';
            }
        }

        if (miniPlayBtn) {
            miniPlayBtn.innerHTML = this.isPlaying ? '⏸️' : '▶️';
        }

        if (miniProgress && this.duration > 0) {
            const progressPercent = (this.currentTime / this.duration) * 100;
            miniProgress.style.width = progressPercent + '%';
        }
    }

    // Audio Visualizer
    toggleVisualizer() {
        const visualizer = document.getElementById('audio-visualizer');
        const btn = document.getElementById('toggle-visualizer');
        
        if (visualizer.style.display === 'none') {
            visualizer.style.display = 'flex';
            btn.classList.add('active');
            this.showToast('🎨 Visualizador ativo');
        } else {
            visualizer.style.display = 'none';
            btn.classList.remove('active');
            this.showToast('🎨 Visualizador desativado');
        }
    }

    // Lyrics (Mock implementation)
    toggleLyrics() {
        const lyricsTab = document.querySelector('.tab-btn[data-tab="lyrics"]');
        if (lyricsTab) {
            lyricsTab.click();
            this.loadLyrics();
        }
    }

    async loadLyrics() {
        const lyricsContainer = document.getElementById('music-lyrics');
        if (!lyricsContainer || !this.currentTrack) return;

        lyricsContainer.innerHTML = '<div class="loading">🔍 Buscando letras...</div>';

        // Mock lyrics (in real implementation, you'd use a lyrics API)
        setTimeout(() => {
            lyricsContainer.innerHTML = `
                <div class="lyrics-text">
                    <p><strong>♪ ${this.currentTrack.title} ♪</strong></p>
                    <br>
                    <p>🎵 Esta é uma música do canal:</p>
                    <p><em>${this.currentTrack.channel}</em></p>
                    <br>
                    <p>🎶 As letras seriam exibidas aqui</p>
                    <p>em uma implementação completa</p>
                    <p>conectada a uma API de letras</p>
                    <br>
                    <p>🎤 Aproveite a música! 🎤</p>
                </div>
            `;
        }, 1500);
    }

    // Party Mode
    togglePartyMode() {
        const btn = document.getElementById('party-mode-btn');
        const container = document.querySelector('.music-player-container');
        
        if (btn.classList.contains('active')) {
            btn.classList.remove('active');
            container.classList.remove('party-mode-active');
            this.showToast('🎉 Party Mode OFF');
        } else {
            btn.classList.add('active');
            container.classList.add('party-mode-active');
            this.showToast('🎉 Party Mode ON!');
            this.startPartyEffects();
        }
    }

    startPartyEffects() {
        // Auto-shuffle when party mode is on
        if (!this.shuffleMode) {
            this.toggleShuffle();
        }
        
        // Random effects every few seconds
        const partyInterval = setInterval(() => {
            const btn = document.getElementById('party-mode-btn');
            if (!btn.classList.contains('active')) {
                clearInterval(partyInterval);
                return;
            }
            
            // Random visual effects could go here
            this.showToast('🎊 Party! 🎊');
        }, 30000);
    }

    // Tab Management
    switchTab(tabName) {
        // Hide all tab contents
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        
        // Remove active class from all tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Show selected tab content
        const selectedContent = document.getElementById(`${tabName}-tab`);
        if (selectedContent) {
            selectedContent.classList.add('active');
        }
        
        // Add active class to selected tab button
        const selectedBtn = document.querySelector(`.tab-btn[data-tab="${tabName}"]`);
        if (selectedBtn) {
            selectedBtn.classList.add('active');
        }
        
        // Load content if needed
        if (tabName === 'stats') {
            this.updateStatsDisplay();
        } else if (tabName === 'lyrics') {
            this.loadLyrics();
        }
    }

    // Statistics Display
    updateStatsDisplay() {
        this.loadUserStats();
        
        const songsToday = document.getElementById('songs-today');
        const totalTime = document.getElementById('total-listen-time');
        const favSong = document.getElementById('favorite-song');
        
        if (songsToday) {
            // Count songs played today
            const today = new Date().toDateString();
            const todaySongs = this.userStats.playHistory.filter(song => 
                new Date(song.playedAt).toDateString() === today
            ).length;
            songsToday.textContent = todaySongs;
        }
        
        if (totalTime) {
            const hours = Math.floor(this.userStats.totalPlayTime / 3600);
            const minutes = Math.floor((this.userStats.totalPlayTime % 3600) / 60);
            totalTime.textContent = `${hours}h ${minutes}m`;
        }
        
        if (favSong) {
            if (this.userStats.playHistory.length > 0) {
                // Most played song
                const songCounts = {};
                this.userStats.playHistory.forEach(song => {
                    songCounts[song.title] = (songCounts[song.title] || 0) + 1;
                });
                
                const mostPlayed = Object.entries(songCounts)
                    .sort(([,a], [,b]) => b - a)[0];
                
                if (mostPlayed) {
                    favSong.textContent = this.truncateText(mostPlayed[0], 30);
                }
            }
        }
    }

    // Search Filters
    updateSearchFilters() {
        const durationFilter = document.getElementById('filter-duration')?.checked;
        const qualityFilter = document.getElementById('filter-quality')?.checked;
        
        // Store filter preferences
        this.setStorage('search_filters', {
            duration: durationFilter,
            quality: qualityFilter
        });
        
        this.showToast('🔍 Filtros atualizados');
    }

    // Playlist Import/Export
    exportPlaylist() {
        const currentPlaylist = this.currentPlaylistId === 'default' 
            ? { name: 'Playlist Principal', tracks: this.playlist }
            : this.playlists.get(this.currentPlaylistId);
        
        if (!currentPlaylist || currentPlaylist.tracks.length === 0) {
            this.showToast('❌ Playlist vazia - nada para exportar');
            return;
        }
        
        const exportData = {
            name: currentPlaylist.name || 'Playlist Principal',
            tracks: currentPlaylist.tracks,
            exportedAt: new Date().toISOString(),
            version: '1.0'
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `playlist-${exportData.name.replace(/[^a-z0-9]/gi, '-')}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        this.showToast('📤 Playlist exportada!');
    }

    importPlaylist() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    
                    if (data.tracks && Array.isArray(data.tracks)) {
                        const playlistName = data.name || 'Playlist Importada';
                        const playlistId = this.createPlaylist(playlistName);
                        const playlist = this.playlists.get(playlistId);
                        playlist.tracks = data.tracks;
                        this.savePlaylistsToStorage();
                        this.updatePlaylistSelector();
                        this.showToast(`📥 "${playlistName}" importada com ${data.tracks.length} músicas!`);
                    } else {
                        throw new Error('Formato inválido');
                    }
                } catch (error) {
                    this.showToast('❌ Erro ao importar playlist - formato inválido');
                }
            };
            reader.readAsText(file);
        };
        
        input.click();
    }

    displaySearchResults(videos) {
        const resultsContainer = document.getElementById('music-search-results');
        
        if (!videos.length) {
            this.showNoResults();
            return;
        }

        const html = videos.map(video => `
            <div class="music-search-item" data-video-id="${video.id.videoId}">
                <div class="search-thumbnail">
                    <img src="${video.snippet.thumbnails.medium.url}" alt="${video.snippet.title}" loading="lazy">
                </div>
                <div class="search-info">
                    <h5 class="search-title">${this.truncateText(video.snippet.title, 50)}</h5>
                    <p class="search-channel">${video.snippet.channelTitle}</p>
                    <p class="search-duration">📹 YouTube</p>
                </div>
                <div class="search-actions">
                    <button class="search-add-btn" onclick="musicPlayer.playVideo('${video.id.videoId}', '${this.escapeHtml(video.snippet.title)}', '${this.escapeHtml(video.snippet.channelTitle)}')">
                        ▶️ Tocar
                    </button>
                    <button class="feature-btn" onclick="musicPlayer.addToPlaylist('${video.id.videoId}', '${this.escapeHtml(video.snippet.title)}', '${this.escapeHtml(video.snippet.channelTitle)}')">
                        ➕ Playlist
                    </button>
                    <button class="feature-btn" onclick="musicPlayer.addToQueue('${video.id.videoId}', '${this.escapeHtml(video.snippet.title)}', '${this.escapeHtml(video.snippet.channelTitle)}')">
                        📋 Fila
                    </button>
                </div>
            </div>
        `).join('');

        resultsContainer.innerHTML = html;
    }

    // Enhanced Progress Updates
    updateProgress() {
        if (!this.player) return;
        
        try {
            this.currentTime = this.player.getCurrentTime();
            this.duration = this.player.getDuration();
            
            if (this.duration > 0) {
                const progressPercent = (this.currentTime / this.duration) * 100;
                
                // Main progress bar
                const progressBar = document.getElementById('progress-bar');
                if (progressBar) {
                    progressBar.value = progressPercent;
                }
                
                // Time displays
                const currentTimeEl = document.getElementById('current-time');
                const totalTimeEl = document.getElementById('total-time');
                
                if (currentTimeEl) {
                    currentTimeEl.textContent = this.formatTime(this.currentTime);
                }
                
                if (totalTimeEl) {
                    totalTimeEl.textContent = this.formatTime(this.duration);
                }
                
                // Update mini player
                this.updateMiniPlayer();
                
                // Update user stats
                if (this.isPlaying) {
                    this.updateUserStats(
                        this.currentTrack?.id, 
                        this.currentTrack?.title, 
                        this.currentTrack?.channel, 
                        1 // 1 second of play time
                    );
                }
            }
        } catch (error) {
            console.warn('Error updating progress:', error);
        }
    }

    // Enhanced Now Playing
    updateNowPlaying() {
        const nowPlaying = document.getElementById('music-now-playing');
        if (nowPlaying && this.currentTrack) {
            const nowPlayingInfo = nowPlaying.querySelector('.now-playing-info');
            if (nowPlayingInfo) {
                nowPlayingInfo.innerHTML = `
                    <h4>${this.currentTrack.title}</h4>
                    <p>${this.currentTrack.channel}</p>
                    <div class="audio-visualizer" id="audio-visualizer" style="display: none;">
                        <div class="visualizer-bar"></div>
                        <div class="visualizer-bar"></div>
                        <div class="visualizer-bar"></div>
                        <div class="visualizer-bar"></div>
                        <div class="visualizer-bar"></div>
                    </div>
                `;
            }
        }
    }
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