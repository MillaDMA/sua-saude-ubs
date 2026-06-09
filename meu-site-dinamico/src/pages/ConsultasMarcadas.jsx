import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
const ConsultasMarcadas = () => {
    const [minhasConsultas, setMinhasConsultas] = useState([]);
    const [carregando, setCarregando] = useState(true);

    const carregarConsultasDoBanco = async () => {
        setCarregando(true);
        try {
            const { data, error } = await supabase
                .from('Agendamentos')
                .select('*')
                .eq('id_paciente', 1)
                .eq('status', 'agendado');

            if (error) {
                console.error("Erro ao buscar consultas marcadas:", error.message);
            } else if (data) {
                setMinhasConsultas(data);
            }
        } catch (err) {
            console.error("Erro crítico ao carregar histórico:", err);
        } finally {
            setCarregando(false);
        }
    };

    useEffect(() => {
        carregarConsultasDoBanco();
    }, []);

    return (
        <div className="mt-4 p-4 bg-white border rounded shadow-sm">
            <h3 className="text-primary mb-3">📋 Minhas Consultas Agendadas</h3>

            {carregando ? (
                <div className="text-center py-3">
                    <div className="spinner-border text-primary" role="status"></div>
                    <p className="text-muted mt-2">Buscando seus agendamentos no sistema...</p>
                </div>
            ) : minhasConsultas.length === 0 ? (
                <div className="alert alert-info text-center">
                    Você não tem nenhuma consulta marcada no momento.
                </div>
            ) : (
                <div className="list-group">
                    {minhasConsultas.map((consulta) => (
                        <div key={consulta.id_consulta || `${consulta.dia}-${consulta.hora}`} 
                             className="list-group-item list-group-item-action d-flex justify-content-between align-items-center mb-2 shadow-sm rounded border">
                            <div>
                                <h5 className="mb-1 text-success">✔️ Consulta Confirmada</h5>
                                <p className="mb-1 text-muted">
                                    Data: <strong>{String(consulta.dia).padStart(2, '0')}/{String(consulta.mes).padStart(2, '0')}/{consulta.ano}</strong>
                                </p>
                                <small>Horário: <strong className="text-primary">{consulta.hora}</strong></small>
                            </div>
                            <span className="badge bg-primary rounded-pill p-2">Status: {consulta.status}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ConsultasMarcadas;