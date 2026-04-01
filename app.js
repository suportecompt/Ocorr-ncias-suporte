/**
 * Project: QR Occurrence Dashboard
 * Functionality: Autofill, Audio and Video Recording (MediaRecorder API)
 */

let mediaRecorder;
let chunks = [];
let currentStream = null;

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. AUTOFILL LOGIC FROM LOCALSTORAGE
    // ---------------------------------------------------------------
    const p1Value = localStorage.getItem('qr_p1');
    const p2Value = localStorage.getItem('qr_p2');
    const p3Value = localStorage.getItem('qr_p3');

    if (p1Value) document.getElementById('p1').value = p1Value;
    if (p2Value) document.getElementById('p2').value = p2Value;
    if (p3Value) document.getElementById('p3').value = p3Value;

    // 2. UI ELEMENTS CONFIGURATION
    // ---------------------------------------------------------------
    const btnAudio = document.getElementById('btn-audio');
    const audioText = document.getElementById('audio-text');
    const audioPreview = document.getElementById('audio-preview');

    const btnVideo = document.getElementById('btn-video');
    const videoPreview = document.getElementById('video-preview');
    const cameraLive = document.getElementById('camera-live');

    const oquestForm = document.getElementById('oquest-form');

    // 3. AUDIO RECORDING
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

    // 4. VIDEO RECORDING
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
                
                // Smooth scroll down to view the live camera
                setTimeout(() => {
                    cameraLive.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 100);
                
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

            // Optional: Scroll to the recorded video so the user can see it
            setTimeout(() => {
                videoPreview.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
        }
    });

    // 5. FORM SUBMISSION TO SUPABASE
    // ---------------------------------------------------------------
    oquestForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // 1. If a recording is in progress, stop it and wait for it to process
        if (mediaRecorder && mediaRecorder.state === "recording") {
            mostrarToast("A finalizar a gravação em curso...", "aviso", "loader");
            
            await new Promise((resolve) => {
                // Save the original function that processes the file
                const originalOnStop = mediaRecorder.onstop;
                
                // Overwrite it temporarily to know exactly when it finishes
                mediaRecorder.onstop = (event) => {
                    originalOnStop(event); // Generates the file and puts it in the preview
                    resolve(); // Notifies the form that it can continue
                };
                
                // Visually restore buttons in case submission fails
                if (audioText.innerText === "Parar Gravação") {
                    audioText.innerText = "Gravar Áudio";
                    btnAudio.classList.replace('bg-red-600', 'bg-slate-800');
                }
                
                if (btnVideo.innerText === "Parar Gravação") {
                    btnVideo.innerText = "Gravar Vídeo";
                    btnVideo.classList.remove('bg-red-50', 'border-red-500', 'text-red-600');
                    if (currentStream) {
                        cameraLive.classList.add('hidden');
                    }
                }
                
                // Execute the stop action
                mediaRecorder.stop();
            });

            // Give the browser 100ms extra to ensure the DOM loaded the video/audio
            await new Promise(r => setTimeout(r, 100));
        }
        
        // 2. Check which fields are filled (now with processed files)
        const tieneAudio = !audioPreview.classList.contains('hidden');
        const tieneVideo = !videoPreview.classList.contains('hidden');
        const textoOcorrencia = document.getElementById('ocorrencia_text').value.trim();
        const tieneTexto = textoOcorrencia.length > 0;

        if (!tieneAudio && !tieneVideo && !tieneTexto) {
            mostrarToast("Por favor, forneça um áudio, vídeo ou texto descrevendo o problema.", "aviso", "alert-triangle");
            return;
        }

        const submitBtn = oquestForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerText;
        submitBtn.innerText = "A enviar...";
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
            ocorrencia_text: textoOcorrencia,
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

// RECORDING HELPER FUNCTIONS
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

// NEW UNIVERSAL TOAST FUNCTION (With Lucide icons)
// -------------------------------------------------------------------
function mostrarToast(mensagem, tipo, icone) {
    const isGravando = tipo === 'gravando';
    
    // Determine background color based on type
    let bgColor = "#334155"; // slate-800 default
    if (tipo === 'sucesso') bgColor = "#10b981"; // green
    else if (tipo === 'erro') bgColor = "#ef4444"; // red
    else if (tipo === 'aviso') bgColor = "#f59e0b"; // amber
    else if (tipo === 'gravando') bgColor = "#ef4444"; // red

    // Create an HTML container for the icon and text
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

    // Force Lucide to render the icon we just injected into the Toast
    lucide.createIcons();
}