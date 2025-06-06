// Personal Hub - YouTube Music Player
class YouTubeMusicPlayer {
    constructor() {
        this.player = null;
        this.playlist = [];
        this.currentIndex = 0;
        this.isPlaying = false;
        this.isReady = false;
        this.volume = 50;
        this.user = null;
        
        this.init();
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
    }

    async searchMusic(query) {
        try {
            this.showSearchLoading(true);
            const results = await searchYouTubeMusic(query, 15);
            
            if (results && results.items) {
                this.displaySearchResults(results.items);
            } else {
                this.showNoResults();
            }
        } catch (error) {
            console.error('Erro na busca:', error);
            this.showSearchError();
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
    }

    async saveToHistory(videoId, title, channel) {
        try {
            await db.collection('music').add({
                userId: this.user.uid,
                videoId: videoId,
                title: title,
                channel: channel,
                playedAt: firebase.firestore.FieldValue.serverTimestamp(),
                type: 'youtube'
            });
        } catch (error) {
            console.error('Erro ao salvar histórico:', error);
        }
    }

    async savePlaylistToFirebase() {
        try {
            await db.collection('users').doc(this.user.uid).set({
                musicPlaylist: this.playlist
            }, { merge: true });
        } catch (error) {
            console.error('Erro ao salvar playlist:', error);
        }
    }

    async loadUserPlaylists() {
        try {
            const userDoc = await db.collection('users').doc(this.user.uid).get();
            if (userDoc.exists && userDoc.data().musicPlaylist) {
                this.playlist = userDoc.data().musicPlaylist;
                this.updatePlaylistDisplay();
            }
        } catch (error) {
            console.error('Erro ao carregar playlist:', error);
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

    showToast(message) {
        // Criar toast notification simples
        const toast = document.createElement('div');
        toast.className = 'music-toast';
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => document.body.removeChild(toast), 300);
        }, 3000);
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