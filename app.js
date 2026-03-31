/**
 * Proyecto: Dashboard de Ocorrência QR
 * Funcionalidad: Autocompletado, Grabación de Audio y Video (MediaRecorder API)
 */

let mediaRecorder;
let chunks = [];
let currentStream = null;

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. LÓGICA DE AUTOCOMPLETADO DESDE LOCALSTORAGE
    // ---------------------------------------------------------------
    const p1Value = localStorage.getItem('qr_p1');
    const p2Value = localStorage.getItem('qr_p2');
    const p3Value = localStorage.getItem('qr_p3');

    if (p1Value) document.getElementById('p1').value = p1Value;
    if (p2Value) document.getElementById('p2').value = p2Value;
    if (p3Value) document.getElementById('p3').value = p3Value;

    // 2. CONFIGURACIÓN DE ELEMENTOS UI
    // ---------------------------------------------------------------
    const btnAudio = document.getElementById('btn-audio');
    const audioText = document.getElementById('audio-text');
    const audioPreview = document.getElementById('audio-preview');

    const btnVideo = document.getElementById('btn-video');
    const videoPreview = document.getElementById('video-preview');
    const cameraLive = document.getElementById('camera-live');

    const oquestForm = document.getElementById('oquest-form');

    // 3. GRABACIÓN DE ÁUDIO
    // ---------------------------------------------------------------
    btnAudio.addEventListener('click', async () => {
        if (!mediaRecorder || mediaRecorder.state === "inactive") {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                iniciarGrabacion(stream, 'audio/ogg', audioPreview);
                
                audioText.innerText = "Parar Gravação";
                btnAudio.classList.replace('bg-slate-800', 'bg-red-600');
                
                mostrarToast("A gravar áudio...", "gravando", "mic");
                
            } catch (err) {
                mostrarToast("Erro ao aceder ao microfone: " + err.message, "erro", "mic-off");
            }
        } else {
            pararGrabacion();
            audioText.innerText = "Gravar Áudio";
            btnAudio.classList.replace('bg-red-600', 'bg-slate-800');
            
            mostrarToast("Áudio gravado!", "sucesso", "check-circle");
        }
    });

    // 4. GRABACIÓN DE VÍDEO
    // ---------------------------------------------------------------
    btnVideo.addEventListener('click', async () => {
        if (!mediaRecorder || mediaRecorder.state === "inactive") {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ 
                    video: { facingMode: "environment" }, 
                    audio: true 
                });
                
                currentStream = stream;
                cameraLive.srcObject = stream;
                cameraLive.classList.remove('hidden');
                videoPreview.classList.add('hidden');
                
                iniciarGrabacion(stream, 'video/webm', videoPreview);
                
                btnVideo.innerText = "Parar Gravação";
                btnVideo.classList.add('bg-red-50', 'border-red-500', 'text-red-600');
                
                mostrarToast("A gravar vídeo...", "gravando", "video");
                
            } catch (err) {
                mostrarToast("Erro ao aceder à câmara: " + err.message, "erro", "video-off");
            }
        } else {
            pararGrabacion();
            btnVideo.innerText = "Gravar Vídeo";
            btnVideo.classList.remove('bg-red-50', 'border-red-500', 'text-red-600');
            
            if (currentStream) {
                currentStream.getTracks().forEach(track => track.stop());
                cameraLive.classList.add('hidden');
            }
            
            mostrarToast("Vídeo gravado!", "sucesso", "check-circle");
        }
    });

    // 5. ENVÍO DEL FORMULARIO A SUPABASE
    // ---------------------------------------------------------------
    oquestForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const tieneAudio = !audioPreview.classList.contains('hidden');
        const tieneVideo = !videoPreview.classList.contains('hidden');

        if (!tieneAudio) {
            mostrarToast("Por favor, grave um áudio descrevendo o problema.", "aviso", "alert-triangle");
            return;
        }

        if (!tieneVideo) {
            mostrarToast("Por favor, grave um vídeo mostrando a avaria.", "aviso", "alert-triangle");
            return;
        }

        const submitBtn = oquestForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerText;
        submitBtn.innerText = "A enviar..."; // Quitamos el emoji del reloj de arena
        submitBtn.disabled = true;
        submitBtn.classList.add('opacity-70', 'cursor-wait');

        const timestamp = Date.now(); 
        const customId = `OCO-${timestamp}`; 
        
        const idAudioAws = tieneAudio ? `audio_${customId}` : null;
        const idVideoAws = tieneVideo ? `video_${customId}` : null;

        const payload = {
            custom_id: customId,
            p1_maquina: document.getElementById('p1').value,
            p2_serie: document.getElementById('p2').value,
            p3_modelo: document.getElementById('p3').value,
            audio_id: idAudioAws,
            video_id: idVideoAws
        };

        try {
            if (tieneAudio) {
                const audioBlob = await fetch(audioPreview.src).then(r => r.blob());
                await window.SupabaseHelper.subirArchivo(idAudioAws, audioBlob);
            }

            if (tieneVideo) {
                const videoBlob = await fetch(videoPreview.src).then(r => r.blob());
                await window.SupabaseHelper.subirArchivo(idVideoAws, videoBlob);
            }

            await window.SupabaseHelper.guardarOcurrencia(payload);

            mostrarToast("Ocorrência enviada com sucesso!", "sucesso", "check-circle-2");
            
            localStorage.clear(); 
            
            setTimeout(() => {
                window.location.href = "index.html"; 
            }, 2000);

        } catch (err) {
            console.error("Erro no envio:", err.message);
            mostrarToast(err.message || "Erro ao guardar os dados. Por favor, tente novamente.", "erro", "alert-circle");
            
            submitBtn.innerText = originalText;
            submitBtn.disabled = false;
            submitBtn.classList.remove('opacity-70', 'cursor-wait');
        }
    });
});

// FUNCIONES AUXILIARES DE GRABACIÓN
// -------------------------------------------------------------------

function iniciarGrabacion(stream, mimeType, previewElement) {
    chunks = [];
    mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
    };

    mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType });
        const url = URL.createObjectURL(blob);
        
        previewElement.src = url;
        previewElement.classList.remove('hidden');
        
        stream.getTracks().forEach(track => track.stop());
    };

    mediaRecorder.start();
}

function pararGrabacion() {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
        mediaRecorder.stop();
    }
}

// NUEVA FUNCIÓN UNIVERSAL DE TOASTS (Con iconos Lucide)
// -------------------------------------------------------------------
function mostrarToast(mensagem, tipo, icone) {
    const isGravando = tipo === 'gravando';
    
    // Determinamos el color de fondo según el tipo
    let bgColor = "#334155"; // slate-800 por defecto
    if (tipo === 'sucesso') bgColor = "#10b981"; // verde
    else if (tipo === 'erro') bgColor = "#ef4444"; // rojo
    else if (tipo === 'aviso') bgColor = "#f59e0b"; // ámbar
    else if (tipo === 'gravando') bgColor = "#ef4444"; // rojo

    // Creamos un contenedor HTML para el icono y el texto
    const contentNode = document.createElement("div");
    contentNode.className = "flex items-center gap-2";
    contentNode.innerHTML = `<i data-lucide="${icone}" class="${isGravando ? 'w-4 h-4' : 'w-5 h-5'}"></i> <span>${mensagem}</span>`;

    Toastify({
        node: contentNode,
        duration: isGravando ? 2000 : 3500,
        gravity: "top",
        position: "center",
        style: { 
            background: bgColor, 
            borderRadius: isGravando ? "30px" : "12px", 
            fontSize: isGravando ? "12px" : "14px",     
            padding: isGravando ? "8px 16px" : "12px 24px",  
            fontWeight: "bold",
            boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)"
        }
    }).showToast();

    // Obligamos a Lucide a renderizar el icono que acabamos de inyectar en el Toast
    lucide.createIcons();
}