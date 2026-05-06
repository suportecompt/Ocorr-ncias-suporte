/**
 * check-live.js - Versão final com alerta de sala disponível
 */

// Variable global para rastrear si ya sabíamos que la sala estaba activa
let salaJaEstavaAtiva = false;

function mostrarToast(mensagem, tipo, icone) {
    const toasts = document.querySelectorAll(".toastify");
    toasts.forEach(t => t.remove());

    const isGravando = tipo === 'gravando';
    let bgColor = "#334155"; 
    if (tipo === 'sucesso') bgColor = "#10b981"; 
    else if (tipo === 'erro') bgColor = "#ef4444"; 
    else if (tipo === 'aviso') bgColor = "#f59e0b"; 

    const contentNode = document.createElement("div");
    contentNode.className = "flex items-center gap-3 w-full";
    contentNode.innerHTML = `<i data-lucide="${icone}" class="w-5 h-5 flex-shrink-0"></i> <span class="text-left">${mensagem}</span>`;

    Toastify({
        node: contentNode,
        duration: 3500,
        gravity: "top",
        position: "center", 
        stopOnFocus: true,
        style: { 
            background: bgColor, 
            borderRadius: "12px", 
            fontSize: "14px",     
            padding: "12px 20px",
            fontWeight: "600",
            boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
            color: "white",
            display: "flex",
            alignItems: "center",
            width: "90%", 
            maxWidth: "400px", 
            margin: "0 auto",
            position: "fixed",
            left: "0",
            right: "0",
            top: "20px"
        }
    }).showToast();

    if (window.lucide) lucide.createIcons();
}

async function handleVideoClick(e) {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    const btn = document.getElementById('btn-video-live');
    if (!btn) return;

    if (btn.classList.contains('cursor-not-allowed')) {
        mostrarToast("A sala ainda não foi criada. Aguarde as instruções do técnico.", "aviso", "clock");
        return;
    }

    btn.style.pointerEvents = "none"; 
    
    try {
        const registro = await window.SupabaseHelper.consumirJitsi();
        if (registro && registro.url) {
            window.location.href = registro.url;
        } else {
            mostrarToast("O link expirou ou a sala já não está disponível.", "erro", "x-circle");
            checkVideoStatus();
            salaJaEstavaAtiva = false; // Resetar estado
        }
    } catch (err) {
        console.error("Erro:", err);
        mostrarToast("Erro ao conectar.", "erro", "alert-triangle");
        btn.style.pointerEvents = "auto";
    }
}

async function checkVideoStatus() {
    const btnVideo = document.getElementById('btn-video-live');
    if (!btnVideo) return;

    btnVideo.onclick = (e) => handleVideoClick(e);

    try {
        const link = await window.SupabaseHelper.verificarJitsi();

        if (link) {
            // SI HAY LINK:
            // Si antes estaba desactivada y ahora hay link, lanzamos el aviso
            if (!salaJaEstavaAtiva) {
                mostrarToast("A sala de vídeo já está disponível!", "sucesso", "alert-circle");
                salaJaEstavaAtiva = true; // Marcamos como activa para que no repita el toast
            }

            btnVideo.classList.remove('bg-slate-100', 'text-slate-400', 'cursor-not-allowed', 'opacity-70');
            btnVideo.classList.add('bg-rose-500', 'hover:bg-rose-600', 'text-white', 'shadow-lg', 'shadow-rose-100', 'cursor-pointer');
        } else {
            // SI NO HAY LINK:
            btnVideo.classList.add('bg-slate-100', 'text-slate-400', 'cursor-not-allowed', 'opacity-70');
            btnVideo.classList.remove('bg-rose-500', 'hover:bg-rose-600', 'text-white', 'shadow-lg', 'shadow-rose-100', 'cursor-pointer');
            salaJaEstavaAtiva = false; // Resetar para que pueda volver a avisar si se crea otra
        }
    } catch (e) {
        console.error("Erro no check de status:", e);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    checkVideoStatus();
    setInterval(checkVideoStatus, 7000);
});