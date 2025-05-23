// Console Error Handling - Ajuda a detectar e resolver erros de JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Armazenar erros para log
    const errorLog = [];
    
    // Interceptar erros de console
    const originalError = console.error;
    console.error = function() {
        // Capturar argumentos
        const args = Array.from(arguments);
        
        // Registrar no log
        errorLog.push({
            timestamp: new Date().toISOString(),
            message: args.join(' '),
            stack: new Error().stack
        });
        
        // Chamar a função original
        originalError.apply(console, arguments);
    };
    
    // Listener para erros não tratados
    window.addEventListener('error', function(event) {
        errorLog.push({
            timestamp: new Date().toISOString(),
            message: `${event.message} (in ${event.filename}:${event.lineno})`,
            stack: event.error ? event.error.stack : null
        });
    });
    
    // Expor função para exibir log de erros
    window.showErrorLog = function() {
        if (errorLog.length === 0) {
            console.log('🎉 Não foram encontrados erros de JavaScript!');
            return;
        }
        
        console.log('📋 Log de Erros de JavaScript:');
        console.table(errorLog);
        
        return errorLog;
    };
    
    // Verificar se há erros depois que tudo carregar
    window.addEventListener('load', function() {
        setTimeout(() => {
            if (errorLog.length > 0) {
                console.warn(`⚠️ ${errorLog.length} erro(s) de JavaScript detectado(s). Execute window.showErrorLog() para ver detalhes.`);
            }
        }, 1000);
    });
});
