import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase 
const supabaseUrl = 'https://oeuvczlnrkigikudxczz.supabase.co';
const supabaseKey = 'sb_publishable_PGBklwDlyNTaArBwTw7HLw_kWM7c-zK';
const supabase = createClient(supabaseUrl, supabaseKey);

const Sobre = () => {
    const [documentos, setDocumentos] = useState([]);
    const [carregando, setCarregando] = useState(true);

    useEffect(() => {
        const buscarDocumentos = async () => {
            setCarregando(true);
            try {
                const { data, error } = await supabase
                    .from('Documentos_necessarios')
                    .select('id_documento, nome_documento, descrição_documento');

                if (error) {
                    console.error("Erro ao buscar documentos:", error.message);
                } else {
                    setDocumentos(data || []); // Garante que nunca seja null
                }
            } catch (err) {
                console.error("Erro crítico:", err);
            } finally {
                setCarregando(false);
            }
        };

        buscarDocumentos();
    }, []);

    return (
        <div className="mt-4">
            <h2>Dúvidas</h2>
            <p>Informações sobre o projeto, utilidades do app e documentos necessários</p>

            <h3>Documentos necessários para consultas</h3>
            <div className="doc-need">
                {carregando ? (
                    <div className="d-flex align-items-center text-muted">
                        <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                        <span>Carregando documentos...</span>
                    </div>
                ) : documentos.length === 0 ? (
                    <p className="text-muted">Nenhum documento listado no momento.</p>
                ) : (
                    <div className="list-group">
                        {documentos.map((doc) => (
                            <div key={doc.id_documento} className="list-group-item mb-2 shadow-sm rounded border">
                                <h5 className="mb-1 text-primary">📌 {doc.nome_documento}</h5>
                                <p className="mb-1 text-muted small">
                                    {doc.descrição_documento || 'Sem descrição cadastrada.'}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Sobre; 