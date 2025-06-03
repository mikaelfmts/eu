/**
 * Arquivo de ajudantes para trabalhar com vídeos
 * Fornece funções adicionais para carregar e gerenciar vídeos
 */

/**
 * Função para carregar um vídeo de forma mais segura
 * @param {HTMLVideoElement} videoElement - O elemento de vídeo para inicializar
 * @param {string} src - A fonte do vídeo
 * @returns {Promise} Promise que resolve quando o vídeo está pronto para reprodução
 */
export function safeLoadVideo(videoElement, src) {
    return new Promise((resolve, reject) => {
        if (!videoElement) {
            return reject(new Error('Elemento de vídeo não fornecido'));
        }
        
        // Definir tratadores de eventos
        const onCanPlay = () => {
            cleanup();
            resolve(videoElement);
        };
        
        const onError = (e) => {
            cleanup();
            reject(new Error(`Erro ao carregar vídeo: ${e.message || 'Erro desconhecido'}`));
        };
        
        const onTimeout = () => {
            cleanup();
            if (videoElement.readyState >= 2) {
                resolve(videoElement);
            } else {
                reject(new Error('Tempo esgotado ao carregar vídeo'));
            }
        };
        
        // Função para limpar os listeners
        const cleanup = () => {
            videoElement.removeEventListener('canplay', onCanPlay);
            videoElement.removeEventListener('error', onError);
            clearTimeout(timeoutId);
        };
        
        // Adicionar listeners
        videoElement.addEventListener('canplay', onCanPlay, { once: true });
        videoElement.addEventListener('error', onError, { once: true });
        
        // Definir timeout de segurança (8 segundos)
        const timeoutId = setTimeout(onTimeout, 8000);
        
        // Carregar o vídeo
        videoElement.src = src;
        videoElement.load();
    });
}

/**
 * Reproduz um vídeo de forma segura
 * @param {HTMLVideoElement} videoElement - O elemento de vídeo para reproduzir
 * @returns {Promise} Promise que resolve quando o vídeo começa a reproduzir
 */
export function safePlayVideo(videoElement) {
    return new Promise((resolve, reject) => {
        if (!videoElement) {
            return reject(new Error('Elemento de vídeo não fornecido'));
        }
        
        // Se o vídeo já estiver carregado e pronto, tente reproduzir
        if (videoElement.readyState >= 2) {
            videoElement.play()
                .then(() => resolve(videoElement))
                .catch(err => {
                    console.warn('Erro ao reproduzir vídeo:', err);
                    reject(err);
                });
        } else {
            // Aguardar o evento canplay
            videoElement.addEventListener('canplay', function onCanPlay() {
                videoElement.removeEventListener('canplay', onCanPlay);
                videoElement.play()
                    .then(() => resolve(videoElement))
                    .catch(err => {
                        console.warn('Erro ao reproduzir vídeo após carregamento:', err);
                        reject(err);
                    });
            }, { once: true });
            
            // Se o vídeo ainda não foi carregado, carregá-lo
            if (!videoElement.src) {
                reject(new Error('Vídeo sem fonte definida'));
            } else {
                videoElement.load();
            }
        }
    });
}

/**
 * Detecta se uma URL ou MIME type é um vídeo
 * Usa o VideoProcessor se disponível, ou faz uma detecção básica
 * @param {string} url - URL do conteúdo
 * @param {string} mimeType - MIME type do conteúdo
 * @returns {boolean} Verdadeiro se for um vídeo
 */
export function isVideo(url, mimeType) {
    // Tentar usar o VideoProcessor se disponível
    try {
        if (window.videoProcessor) {
            return window.videoProcessor.isVideo(url, mimeType);
        }
    } catch (e) {
        console.warn('Erro ao usar VideoProcessor:', e.message);
    }
    
    // Fallback para detecção básica
    return basicVideoDetection(url, mimeType);
}

/**
 * Faz uma detecção básica de vídeo baseada em URL e MIME type
 * @param {string} url - URL do conteúdo
 * @param {string} mimeType - MIME type do conteúdo
 * @returns {boolean} Verdadeiro se for um vídeo
 */
function basicVideoDetection(url, mimeType) {
    if (!url) return false;
    
    // Verificar MIME type primeiro
    if (mimeType && (mimeType.startsWith('video/') || mimeType.toLowerCase() === 'video')) {
        return true;
    }
    
    // Verificar plataformas de vídeo conhecidas
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.includes('youtube.com/') || 
        lowerUrl.includes('youtu.be/') ||
        lowerUrl.includes('vimeo.com/') ||
        lowerUrl.includes('dailymotion.com/')) {
        return true;
    }
    
    // Verificar extensão do arquivo
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.ogv', '.mov', '.avi', '.wmv', '.flv', '.mkv'];
    return videoExtensions.some(ext => lowerUrl.endsWith(ext));
}

// Exportar objeto VideoProcessor como fallback
export const VideoHelpers = {
    safeLoadVideo,
    safePlayVideo,
    isVideo,
    basicVideoDetection
};

// Adicionar ao objeto window para uso global
if (typeof window !== 'undefined') {
    window.VideoHelpers = VideoHelpers;
}

export default VideoHelpers;
