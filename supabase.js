// supabase.js

// 1. INITIALIZE OFFICIAL CLIENT (Only used for file Storage)
// Nota: SUPABASE_URL y SUPABASE_ANON_KEY ahora se cargan desde config.js
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 2. CREATE GLOBAL "HELPER" FOR APP.JS
window.SupabaseHelper = {

    // Function A: Uploads files to Storage using the official library
    subirArchivo: async function(nombreArchivo, blob) {
        console.log(`A fazer upload do ficheiro ${nombreArchivo}...`);
        const { data, error } = await supabaseClient.storage
            .from('ocorrencias_media')
            .upload(nombreArchivo, blob);
        
        if (error) {
            throw new Error(`Erro no Storage ao enviar ${nombreArchivo}: ${error.message}`);
        }
        return data;
    },

    // Function B: Saves text to the Database using pure AJAX (fetch)
    guardarOcurrencia: async function(payload) {
        console.log("A guardar dados na tabela via AJAX...");
        
        const response = await fetch(DB_TABLE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_ANON_KEY,
                // FIX APLICADO: Añadido "Bearer " antes de la clave
                'Authorization': `${SUPABASE_ANON_KEY}`, 
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            let errorMsg = `Erro HTTP ${response.status}`;
            try {
                const errorData = await response.json();
                errorMsg = errorData.message || errorData.hint || errorMsg;
            } catch(e) {
                // If it can't read the error JSON, it keeps the HTTP status
            }
            throw new Error(`Erro na Base de Dados: ${errorMsg}`);
        }
        
        return true;
    }
};