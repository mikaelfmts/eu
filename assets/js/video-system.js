// ==========================================
// SISTEMA COMPLETO DE VÍDEOS - FOCO EM LINKS
// ==========================================

/**
 * Sistema robusto para processamento de vídeos via links
 * Suporta: YouTube, Vimeo, Google Drive, links diretos, etc.
 */

class VideoProcessor {
    constructor() {
        this.supportedPlatforms = {
            youtube: {
                patterns: [
                    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
                    /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/
                ],
                embedTemplate: (id) => `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1&controls=1`,
                thumbnailTemplate: (id) => `https://img.youtube.com/vi/${id}/maxresdefault.jpg`
            },
            vimeo: {
                patterns: [
                    /vimeo\.com\/(\d+)/,
                    /player\.vimeo\.com\/video\/(\d+)/
                ],
                embedTemplate: (id) => `https://player.vimeo.com/video/${id}?color=c8aa6e&title=0&byline=0&portrait=0`,
                thumbnailTemplate: (id) => null // Vimeo requer API para thumbnails
            },
            googleDrive: {
                patterns: [
                    /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/,
                    /drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/
                ],
                embedTemplate: (id) => `https://drive.google.com/file/d/${id}/preview`,
                thumbnailTemplate: (id) => null
            },
            dailymotion: {
                patterns: [
                    /dailymotion\.com\/video\/([a-zA-Z0-9]+)/
                ],
                embedTemplate: (id) => `https://www.dailymotion.com/embed/video/${id}`,
                thumbnailTemplate: (id) => null
            },
            twitch: {
                patterns: [
                    /twitch\.tv\/videos\/(\d+)/,
                    /clips\.twitch\.tv\/([a-zA-Z0-9_-]+)/
                ],
                embedTemplate: (id, isClip = false) => {
                    return isClip 
                        ? `https://clips.twitch.tv/embed?clip=${id}&parent=localhost`
                        : `https://player.twitch.tv/?video=${id}&parent=localhost`;
                },
                thumbnailTemplate: (id) => null
            }
        };
        
        this.directVideoExtensions = [
            'mp4', 'webm', 'ogg', 'avi', 'mov', 'mkv', 'wmv', 'flv', 'm4v', '3gp', 'mpg', 'mpeg'
        ];
        
        this.videoMimeTypes = [
            'video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/quicktime',
            'video/x-msvideo', 'video/x-ms-wmv', 'video/x-flv', 'video/x-matroska'
        ];
    }

    /**
     * Processa uma URL de vídeo e retorna informações estruturadas
     * @param {string} url - URL do vídeo
     * @param {string} originalType - Tipo original da mídia (opcional)
     * @returns {Object|null} - Informações do vídeo processado
     */
    processVideoUrl(url, originalType = '') {
        if (!url || typeof url !== 'string') {
            console.warn('URL inválida fornecida para processamento de vídeo:', url);
            return null;
        }

        const cleanUrl = url.trim();
        
        try {
            // Verificar cada plataforma suportada
            for (const [platform, config] of Object.entries(this.supportedPlatforms)) {
                for (const pattern of config.patterns) {
                    const match = cleanUrl.match(pattern);
                    if (match && match[1]) {
                        const videoId = match[1];
                        const result = {
                            platform,
                            id: videoId,
                            originalUrl: cleanUrl,
                            embedUrl: config.embedTemplate(videoId),
                            thumbnailUrl: config.thumbnailTemplate ? config.thumbnailTemplate(videoId) : null,
                            isEmbeddable: true,
                            type: 'embed'
                        };
                        
                        console.log(`Vídeo detectado na plataforma ${platform}:`, result);
                        return result;
                    }
                }
            }

            // Verificar se é um vídeo direto
            if (this.isDirectVideoUrl(cleanUrl)) {
                return {
                    platform: 'direct',
                    originalUrl: cleanUrl,
                    directUrl: cleanUrl,
                    isEmbeddable: false,
                    type: 'direct',
                    mimeType: this.getVideoMimeType(cleanUrl, originalType)
                };
            }

            // Se não conseguir identificar, tentar como vídeo genérico
            if (originalType && (originalType.startsWith('video/') || originalType.toLowerCase().includes('video'))) {
                return {
                    platform: 'unknown',
                    originalUrl: cleanUrl,
                    directUrl: cleanUrl,
                    isEmbeddable: false,
                    type: 'direct',
                    mimeType: originalType
                };
            }

            return null;

        } catch (error) {
            console.error('Erro ao processar URL de vídeo:', error);
            return null;
        }
    }

    /**
     * Verifica se uma URL é um vídeo direto (arquivo de vídeo)
     * @param {string} url - URL a ser verificada
     * @returns {boolean}
     */
    isDirectVideoUrl(url) {
        if (!url) return false;
        
        const lowerUrl = url.toLowerCase();
        
        // Verificar extensões de vídeo
        const hasVideoExtension = this.directVideoExtensions.some(ext => {
            return lowerUrl.includes(`.${ext}`) || lowerUrl.endsWith(`.${ext}`);
        });
        
        return hasVideoExtension;
    }

    /**
     * Determina se uma URL/tipo representa um vídeo
     * @param {string} url - URL da mídia
     * @param {string} mimeType - Tipo MIME da mídia
     * @returns {boolean}
     */
    isVideo(url, mimeType = '') {
        if (!url) return false;

        // Verificar MIME type primeiro
        if (mimeType && (
            this.videoMimeTypes.includes(mimeType.toLowerCase()) ||
            mimeType.toLowerCase().startsWith('video/') ||
            mimeType.toLowerCase() === 'video'
        )) {
            return true;
        }

        // Verificar se é de uma plataforma de vídeo conhecida
        const videoInfo = this.processVideoUrl(url, mimeType);
        return videoInfo !== null;
    }

    /**
     * Obtém o MIME type apropriado para um vídeo
     * @param {string} url - URL do vídeo
     * @param {string} originalType - Tipo original (opcional)
     * @returns {string}
     */
    getVideoMimeType(url, originalType = '') {
        if (originalType && originalType.startsWith('video/')) {
            return originalType;
        }

        const lowerUrl = url.toLowerCase();
        
        if (lowerUrl.includes('.mp4')) return 'video/mp4';
        if (lowerUrl.includes('.webm')) return 'video/webm';
        if (lowerUrl.includes('.ogg')) return 'video/ogg';
        if (lowerUrl.includes('.avi')) return 'video/x-msvideo';
        if (lowerUrl.includes('.mov')) return 'video/quicktime';
        if (lowerUrl.includes('.wmv')) return 'video/x-ms-wmv';
        if (lowerUrl.includes('.mkv')) return 'video/x-matroska';
        if (lowerUrl.includes('.flv')) return 'video/x-flv';
        
        return 'video/mp4'; // Fallback padrão
    }

    /**
     * Gera HTML para exibir um vídeo
     * @param {Object} videoInfo - Informações do vídeo processado
     * @param {Object} options - Opções de exibição
     * @returns {string} - HTML do player de vídeo
     */
    generateVideoHtml(videoInfo, options = {}) {
        if (!videoInfo) {
            return this.generateErrorHtml('Informações de vídeo inválidas');
        }

        const {
            width = '100%',
            height = '400px',
            autoplay = false,
            controls = true,
            muted = false,
            poster = null,
            className = 'video-player',
            showFallback = true
        } = options;

        try {
            if (videoInfo.isEmbeddable && videoInfo.embedUrl) {
                // Vídeo embarcado (YouTube, Vimeo, etc.)
                return `
                    <div class="video-container ${className}" style="position: relative; width: ${width}; height: ${height};">
                        <iframe 
                            src="${videoInfo.embedUrl}"
                            width="100%" 
                            height="100%"
                            frameborder="0"
                            allowfullscreen
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            title="Vídeo ${videoInfo.platform}"
                            loading="lazy"
                            style="border-radius: 8px;">
                        </iframe>
                        ${showFallback ? this.generateFallbackHtml(videoInfo) : ''}
                    </div>
                `;
            } else if (videoInfo.directUrl) {
                // Vídeo direto
                const posterAttr = poster ? `poster="${poster}"` : '';
                const autoplayAttr = autoplay ? 'autoplay' : '';
                const mutedAttr = muted ? 'muted' : '';
                const controlsAttr = controls ? 'controls' : '';
                
                return `
                    <div class="video-container ${className}" style="position: relative; width: ${width}; height: ${height};">
                        <video 
                            width="100%" 
                            height="100%"
                            ${controlsAttr}
                            ${autoplayAttr}
                            ${mutedAttr}
                            ${posterAttr}
                            preload="metadata"
                            playsinline
                            style="border-radius: 8px; object-fit: contain;"
                            onloadstart="this.style.opacity='1'"
                            onerror="this.parentNode.innerHTML='${this.generateErrorHtml('Erro ao carregar vídeo', videoInfo.originalUrl).replace(/'/g, '\\\'')}'">
                            
                            <source src="${videoInfo.directUrl}" type="${videoInfo.mimeType || 'video/mp4'}">
                            <source src="${videoInfo.directUrl}" type="video/webm">
                            <source src="${videoInfo.directUrl}">
                            
                            <p style="text-align: center; padding: 2rem; color: #c8aa6e;">
                                Seu navegador não suporta a reprodução de vídeos.
                                <br>
                                <a href="${videoInfo.originalUrl}" target="_blank" style="color: #c8aa6e; text-decoration: underline;">
                                    Clique aqui para baixar o vídeo
                                </a>
                            </p>
                        </video>
                        ${showFallback ? this.generateFallbackHtml(videoInfo) : ''}
                    </div>
                `;
            } else {
                return this.generateErrorHtml('Formato de vídeo não suportado', videoInfo.originalUrl);
            }
        } catch (error) {
            console.error('Erro ao gerar HTML do vídeo:', error);
            return this.generateErrorHtml('Erro interno do player', videoInfo.originalUrl);
        }
    }

    /**
     * Gera HTML de fallback para casos de erro
     * @param {Object} videoInfo - Informações do vídeo
     * @returns {string}
     */
    generateFallbackHtml(videoInfo) {
        if (!videoInfo || !videoInfo.originalUrl) return '';
        
        return `
            <div class="video-fallback" style="
                position: absolute; 
                bottom: 10px; 
                right: 10px; 
                background: rgba(0,0,0,0.8); 
                color: #c8aa6e; 
                padding: 0.5rem; 
                border-radius: 4px; 
                font-size: 0.8rem;
                z-index: 10;
            ">
                <a href="${videoInfo.originalUrl}" target="_blank" style="color: #c8aa6e; text-decoration: none;">
                    <i class="fas fa-external-link-alt"></i> Abrir original
                </a>
            </div>
        `;
    }

    /**
     * Gera HTML de erro
     * @param {string} message - Mensagem de erro
     * @param {string} url - URL original (opcional)
     * @returns {string}
     */
    generateErrorHtml(message, url = null) {
        const fallbackLink = url ? `
            <div style="margin-top: 1rem;">
                <a href="${url}" target="_blank" style="color: #c8aa6e; text-decoration: none;">
                    <i class="fas fa-external-link-alt"></i> Abrir link original
                </a>
            </div>
        ` : '';

        return `
            <div class="video-error" style="
                display: flex; 
                flex-direction: column; 
                align-items: center; 
                justify-content: center; 
                padding: 2rem; 
                background: rgba(220, 38, 38, 0.1); 
                border: 1px solid rgba(220, 38, 38, 0.3); 
                border-radius: 8px; 
                color: #c8aa6e; 
                text-align: center;
            ">
                <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 1rem; color: #dc2626;"></i>
                <p style="margin: 0 0 0.5rem 0; font-weight: bold;">${message}</p>
                <p style="margin: 0; font-size: 0.9rem; opacity: 0.8;">Verifique se o link está correto e acessível.</p>
                ${fallbackLink}
            </div>
        `;
    }

    /**
     * Gera thumbnail/preview para um vídeo
     * @param {Object} videoInfo - Informações do vídeo
     * @param {Object} options - Opções do thumbnail
     * @returns {string}
     */
    generateThumbnailHtml(videoInfo, options = {}) {
        if (!videoInfo) return '';

        const {
            width = '100%',
            height = '200px',
            showPlayButton = true,
            className = 'video-thumbnail'
        } = options;

        const playButtonHtml = showPlayButton ? `
            <div class="video-play-overlay" style="
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(0,0,0,0.7);
                border-radius: 50%;
                width: 60px;
                height: 60px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 1.5rem;
                cursor: pointer;
                transition: all 0.3s ease;
            " onmouseover="this.style.background='rgba(200,170,110,0.9)'" onmouseout="this.style.background='rgba(0,0,0,0.7)'">
                <i class="fas fa-play" style="margin-left: 3px;"></i>
            </div>
        ` : '';

        if (videoInfo.thumbnailUrl) {
            return `
                <div class="video-thumbnail-container ${className}" style="position: relative; width: ${width}; height: ${height}; overflow: hidden; border-radius: 8px;">
                    <img src="${videoInfo.thumbnailUrl}" 
                         alt="Thumbnail do vídeo" 
                         style="width: 100%; height: 100%; object-fit: cover;"
                         onerror="this.parentNode.innerHTML='${this.generatePlaceholderThumbnail(videoInfo).replace(/'/g, '\\\'')}';">
                    ${playButtonHtml}
                </div>
            `;
        } else {
            return this.generatePlaceholderThumbnail(videoInfo, { width, height, className, showPlayButton });
        }
    }

    /**
     * Gera placeholder para thumbnail quando não há imagem disponível
     * @param {Object} videoInfo - Informações do vídeo
     * @param {Object} options - Opções do placeholder
     * @returns {string}
     */
    generatePlaceholderThumbnail(videoInfo, options = {}) {
        const {
            width = '100%',
            height = '200px',
            className = 'video-thumbnail',
            showPlayButton = true
        } = options;

        const platformIcons = {
            youtube: 'fab fa-youtube',
            vimeo: 'fab fa-vimeo',
            googleDrive: 'fab fa-google-drive',
            dailymotion: 'fab fa-dailymotion',
            twitch: 'fab fa-twitch',
            direct: 'fas fa-play',
            unknown: 'fas fa-video'
        };

        const platformColors = {
            youtube: '#ff0000',
            vimeo: '#1ab7ea',
            googleDrive: '#4285f4',
            dailymotion: '#ff6d01',
            twitch: '#9146ff',
            direct: '#c8aa6e',
            unknown: '#666'
        };

        const platform = videoInfo.platform || 'unknown';
        const icon = platformIcons[platform] || platformIcons.unknown;
        const color = platformColors[platform] || platformColors.unknown;

        const playButtonHtml = showPlayButton ? `
            <div class="video-play-overlay" style="
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(0,0,0,0.7);
                border-radius: 50%;
                width: 60px;
                height: 60px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 1.5rem;
                cursor: pointer;
                transition: all 0.3s ease;
                z-index: 2;
            " onmouseover="this.style.background='rgba(200,170,110,0.9)'" onmouseout="this.style.background='rgba(0,0,0,0.7)'">
                <i class="fas fa-play" style="margin-left: 3px;"></i>
            </div>
        ` : '';

        return `
            <div class="video-placeholder ${className}" style="
                position: relative;
                width: ${width}; 
                height: ${height}; 
                background: linear-gradient(135deg, rgba(200,170,110,0.1) 0%, rgba(60,60,65,0.3) 100%);
                border: 1px solid rgba(200,170,110,0.3);
                border-radius: 8px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                color: ${color};
                overflow: hidden;
            ">
                <i class="${icon}" style="font-size: 3rem; margin-bottom: 0.5rem;"></i>
                <span style="font-size: 0.9rem; text-transform: uppercase; font-weight: bold;">
                    ${platform === 'googleDrive' ? 'Google Drive' : platform}
                </span>
                ${playButtonHtml}
            </div>
        `;
    }
}

// Instância global do processador de vídeos
window.VideoProcessor = VideoProcessor;
window.videoProcessor = new VideoProcessor();

// Exportar para uso em módulos
export { VideoProcessor };
export default VideoProcessor;
