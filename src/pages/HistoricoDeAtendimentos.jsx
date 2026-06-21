import { useState, useEffect } from 'react';
import React from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://oeuvczlnrkigikudxczz.supabase.co';
const supabaseKey = 'sb_publishable_PGBklwDlyNTaArBwTw7HLw_kWM7c-zK'; 
const supabase = createClient(supabaseUrl, supabaseKey);

const HistoricoDeAtendimentos = () => {
  const [historico, setHistorico] = useState([]);
  const [carregando, setCarregando] = useState(true);

  const carregarHistoricoDoBanco = async () => {
    setCarregando(true);
    try {
      const idUsuarioLogado = localStorage.getItem('id_usuario_logado'); 
      if (!idUsuarioLogado) return;

      // 1. CORREÇÃO: Busca a PK correta 'id' na Tabela_medicos
      const { data: dadosMedico, error: erroMedico } = await supabase
        .from('Tabela_medicos')
        .select('id')
        .eq('id_usuario', idUsuarioLogado)
        .maybeSingle(); 

      if (erroMedico || !dadosMedico) {
        console.error("Médico não localizado no banco:", erroMedico);
        return;
      }

      const idMedicoReal = dadosMedico.id;

      // FILTRO EXCLUSIVO: Apenas status 'finalizado'
      const { data: consultas, error: erroAgendamentos } = await supabase
        .from('Agendamentos')
        .select('*')
        .eq('id_medico', idMedicoReal)
        .eq('status', 'finalizado');

      if (erroAgendamentos) {
        console.error("Erro ao buscar agendamentos finalizados:", erroAgendamentos);
        return;
      }

      if (consultas && consultas.length > 0) {
        const idsPacientes = consultas.map(c => c.id_paciente).filter(Boolean);

        // 2. CORREÇÃO: Alinhado ao nome da tabela 'Tabela pacientes' e coluna '"Id paciente"'
        const { data: pacientes, error: erroPacientes } = await supabase
          .from('Tabela pacientes')
          .select('"Id paciente", "Nome completo"')
          .in('Id paciente', idsPacientes);

        if (erroPacientes) {
          console.error("Erro ao buscar dados dos pacientes:", erroPacientes);
        }

        // 3. CORREÇÃO DO MAPEAMENTO: Lendo as propriedades com as maiúsculas corretas do banco
        const mapaPacientes = {};
        if (pacientes) {
          pacientes.forEach(p => {
            const idPacienteReal = p["Id paciente"];
            const nomeCompleto = p["Nome completo"];
            if (idPacienteReal) mapaPacientes[idPacienteReal] = nomeCompleto;
          });
        }

        const consultasTratadas = consultas.map(consulta => ({
          ...consulta,
          nome_paciente_tratado: mapaPacientes[consulta.id_paciente] || `Paciente #${consulta.id_paciente}`
        }));

        // Ordena do mais recente para o mais antigo
        setHistorico(consultasTratadas.sort((a, b) => b.id_consulta - a.id_consulta));
      } else {
        setHistorico([]);
      }
    } catch (err) {
      console.error("Erro inesperado no histórico:", err);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => { 
    carregarHistoricoDoBanco(); 
  }, []);

  return (
    <div className="mt-4 p-4 bg-white border rounded shadow-sm">
      <h3 className="fw-bold text-secondary mb-1">📜 Histórico de Atendimentos</h3>
      <p className="text-muted mb-4">Registro de todas as consultas já finalizadas por você.</p>

      {carregando ? (
        <div className="text-center py-4"><div className="spinner-border text-primary"></div></div>
      ) : historico.length === 0 ? (
        <div className="alert alert-light text-center border">Nenhum atendimento finalizado encontrado no seu histórico.</div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {historico.map((consulta) => (
            <div key={consulta.id_consulta} className="card border-0 border-start border-secondary bg-light bg-opacity-50 border-4 shadow-sm p-3">
              <div className="d-flex flex-column gap-2">
                <div className="d-flex justify-content-between align-items-center">
                  <h6 className="fw-bold text-dark mb-0">👤 Paciente: {consulta.nome_paciente_tratado}</h6>
                  <span className="badge bg-secondary">Status: {consulta.status}</span>
                </div>
                
                <p className="mb-1 small text-muted">
                  Atendido em: <strong>{String(consulta.dia).padStart(2, '0')}/{String(consulta.mes).padStart(2, '0')}/{consulta.ano}</strong> às <strong>{consulta.hora}</strong>
                </p>

                <div className="bg-white p-2 rounded border small text-secondary mb-2">
                  <strong>Queixa inicial:</strong> {consulta.queixa_sintomas || "Não informada."}
                </div>

                <div className="bg-success bg-opacity-10 p-3 rounded border border-success-subtle small text-dark">
                  <strong>Prontuário / Relato Médico:</strong>
                  <p className="mt-1 mb-2 text-dark-emphasis style-text" style={{ whiteSpace: 'pre-line' }}>{consulta.relato_medico}</p>
                  
                  {consulta.exames_requisitados && consulta.exames_requisitados.length > 0 && (
                    <div className="mt-2 pt-2 border-top border-success-subtle">
                      <strong>Exames Solicitados:</strong>
                      <div className="d-flex flex-wrap gap-1 mt-1">
                        {consulta.exames_requisitados.map((ex, idx) => (
                          <span key={idx} className="badge bg-success bg-opacity-25 text-success-emphasis border border-success-subtle">{ex}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {consulta.especialista_encaminhado && (
    <div className="mt-2 pt-2 border-top border-success-subtle">
      <strong>Encaminhamento:</strong>
      <div className="mt-1">
        <span className="badge bg-primary bg-opacity-25 text-primary-emphasis border border-primary-subtle">
          🩺 Especialista: {consulta.especialista_encaminhado}
        </span>
      </div>
    </div>
  )}

                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoricoDeAtendimentos;