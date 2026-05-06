// supabase.js

// 1. INITIALIZE OFFICIAL CLIENT (Solo para Storage)
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 2. CREATE GLOBAL "HELPER"
window.SupabaseHelper = {

    // Function A: Uploads files (Storage)
    subirArchivo: async function(nombreArchivo, blob) {
        const { data, error } = await supabaseClient.storage
            .from('ocorrencias_media')
            .upload(nombreArchivo, blob);
        if (error) throw new Error(`Erro Storage: ${error.message}`);
        return data;
    },

    // Function B: Saves text (AJAX)
    guardarOcurrencia: async function(payload) {
        const response = await fetch(DB_TABLE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `${SUPABASE_ANON_KEY}`,
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error(`Erro DB: ${response.status}`);
        return true;
    },

    // --- NUEVAS FUNCIONES PARA JITSI VIA AJAX ---

    // Function C: Verifica si hay un link disponible (Usado por check-live.js)
    verificarJitsi: async function() {
        // Construimos la URL: https://.../rest/v1/jitsi?select=id&limit=1
        const url = `${SUPABASE_URL}/rest/v1/${JITSI_TABLE}?select=id&limit=1`;
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `${SUPABASE_ANON_KEY}`
            }
        });

        if (!response.ok) return null;
        const data = await response.json();
        return (data && data.length > 0) ? data[0] : null;
    },

    // Function D: Obtiene el link completo y lo borra (Usado por jitsi.js)
    consumirJitsi: async function() {
        const urlBase = `${SUPABASE_URL}/rest/v1/${JITSI_TABLE}`;
        
        // 1. Obtener el dato
        const responseGet = await fetch(`${urlBase}?select=id,url&limit=1`, {
            method: 'GET',
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `${SUPABASE_ANON_KEY}`
            }
        });

        const data = await responseGet.json();
        if (!data || data.length === 0) return null;

        const registro = data[0];

        // 2. Borrarlo para que nadie más lo use
        await fetch(`${urlBase}?id=eq.${registro.id}`, {
            method: 'DELETE',
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `${SUPABASE_ANON_KEY}`
            }
        });

        return registro; // {id, url}
    }
};