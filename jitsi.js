/**
 * jitsi.js - Redirección segura
 */
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const registro = await window.SupabaseHelper.consumirJitsi();
        
        // Si no hay registro, volvemos al dashboard
        if (!registro || !registro.url) {
            console.error("Nenhum link ativo encontrado.");
            window.location.href = 'index.html';
            return;
        }

        // Limpiar la URL de la base de datos (quitar espacios o barras al final)
        let baseUrl = registro.url.trim();
        if (!baseUrl.endsWith('/')) baseUrl += '/';

        // Generar identificador de sala único
        const now = new Date();
        const ts = `${now.getHours()}${now.getMinutes()}${now.getSeconds()}`;
        const roomName = `Suporte_${ts}`;

        // Configuración visual de Jitsi
        const displayName = encodeURIComponent(CONFIG.jitsi.defaults.displayName || 'Cliente');
        const configHash = `#userInfo.displayName=%22${displayName}%22&config.startAudioMuted=false&config.deeplinking.disabled=true`;
        
        // Redirección final
        const finalUrl = `${baseUrl}${roomName}${configHash}`;
        console.log("Redirecionando para:", finalUrl);
        
        window.location.href = finalUrl;

    } catch (err) {
        console.error("Erro na redireção:", err);
        // Comenta la línea de abajo para ver el error en consola antes de que se cierre
        // window.location.href = 'index.html'; 
    }
});