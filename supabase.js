// supabase.js

// 1. CENTRAL CONFIGURATION
const SUPABASE_URL = 'https://supabase1.myserver.pt';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNjEyMzQ1Njc4LCJleHAiOjI2MTIzNDU2Nzh9.szPPmYS9Pa9WENwHSgsrd7i_YaYLmmORiVqA9jguyGc';
const DB_TABLE_URL = `${SUPABASE_URL}/rest/v1/helpdeskrequests`;

// 2. INITIALIZE OFFICIAL CLIENT (Only used for file Storage)
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 3. CREATE GLOBAL "HELPER" FOR APP.JS
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
                // FIX: Sending the key as is, without "Bearer "
                'Authorization': SUPABASE_ANON_KEY, 
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