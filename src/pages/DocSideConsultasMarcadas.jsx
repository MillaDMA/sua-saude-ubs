import { useState, useEffect } from 'react';
import React from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://oeuvczlnrkigikudxczz.supabase.co';
const supabaseKey = 'sb_publishable_PGBklwDlyNTaArBwTw7HLw_kWM7c-zK'; 
const supabase = createClient(supabaseUrl, supabaseKey);

const ConsultasMarcadasPorMedico = () => {
  const [minhasConsultas, setMinhasConsultas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  
  const [consultaEmAtendimento, setConsultaEmAtendimento] = useState(null); 
  const [parecerTexto, setParecerTexto] = useState(""); 
  const [enviandoParecer, setEnviandoParecer] = useState(false); 

  const [solicitarExameCheck, setSolicitarExameCheck] = useState(false); 
  const [exameSelecionado, setExameSelecionado] = useState(""); 
  const [listaExamesEscolhidos, setListaExamesEscolhidos] = useState([]); 

  const opcoesDeExames = [
    "Hemograma Completo", "Glicemia em Jejum", "Colesterol Total e Frações",
    "Creatinina", "Ureia", "Transaminase Glutâmica Oxalacética (TGO)",
    "Raio-X de Tórax", "Eletrocardiograma (ECG)", "Ressonância Magnética",
    "Ultrassonografia Abdominal"
  ];
// Estados para Encaminhamento
const [encaminharEspecialistaCheck, setEncaminharEspecialistaCheck] = useState(false);
const [especialistaSelecionado, setEspecialistaSelecionado] = useState("");

const opcoesDeEspecialistas = [
  "Cardiologista", "Dermatologista", "Neurologista", "Ortopedista", 
  "Oftalmologista", "Gastroenterologista"
];
  const carregarConsultasDoBanco = async () => {
    setCarregando(true);
    try {
      const idUsuarioLogado = localStorage.getItem('id_usuario_logado'); 
      if (!idUsuarioLogado) return;

      // 1. Busca o ID numérico do médico baseado no UUID de login
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

      // 2. Busca agendamentos com status 'agendado' para este médico
      const { data: consultas, error: erroAgendamentos } = await supabase
        .from('Agendamentos')
        .select('*')
        .eq('id_medico', idMedicoReal)
        .eq('status', 'agendado');

      if (erroAgendamentos) {
        console.error("Erro ao buscar agendamentos:", erroAgendamentos);
        return;
      }

      if (consultas && consultas.length > 0) {
        const idsPacientes = consultas.map(c => c.id_paciente).filter(Boolean);

        // 3. CORREÇÃO ULTRA-ESPECÍFICA: Alinhado com o nome exato da tabela '"Tabela Pacientes"' e coluna '"Id paciente"'
        const { data: pacientes, error: erroPacientes } = await supabase
          .from('Tabela pacientes')
          .select('"Id paciente", "Nome completo"')
          .in('Id paciente', idsPacientes);

        if (erroPacientes) {
          console.error("Erro ao buscar dados dos pacientes:", erroPacientes);
        }

        // 4. CORREÇÃO DA MONTAGEM DO MAPA: Lendo as propriedades exatamente como o Supabase as retorna
        const mapaPacientes = {};
        if (pacientes) {
          pacientes.forEach(p => {
            const idPacienteReal = p["Id paciente"]; 
            const nomeCompleto = p["Nome completo"];
            if (idPacienteReal) {
              mapaPacientes[idPacienteReal] = nomeCompleto;
            }
          });
        }

        // 5. Vincula o nome tratado ao objeto da consulta
        const consultasComNomes = consultas.map(consulta => ({
          ...consulta,
          nome_paciente_tratado: mapaPacientes[consulta.id_paciente] || `Paciente #${consulta.id_paciente}`
        }));

        setMinhasConsultas(consultasComNomes.sort((a, b) => a.hora.localeCompare(b.hora)));
      } else {
        setMinhasConsultas([]);
      }
    } catch (err) {
      console.error("Erro inesperado na aplicação:", err);
    } finally {
      setCarregando(false);
    }
  };

  const handleAdicionarExame = () => {
    if (!exameSelecionado) return;
    if (listaExamesEscolhidos.includes(exameSelecionado)) {
      alert("Este exame já foi adicionado.");
      return;
    }
    setListaExamesEscolhidos([...listaExamesEscolhidos, exameSelecionado]);
    setExameSelecionado(""); 
  };

  const handleSalvarParecer = async (idConsulta) => {
    if (!parecerTexto.trim()) {
      alert("Por favor, digite o parecer médico antes de finalizar.");
      return;
    }

    setEnviandoParecer(true);
  try {
    const { error } = await supabase
      .from('Agendamentos')
      .update({ 
        relato_medico: parecerTexto,
        exames_requisitados: solicitarExameCheck ? listaExamesEscolhidos : [],
        especialista_encaminhado: encaminharEspecialistaCheck ? especialistaSelecionado : null, // NOVA LINHA
        status: 'finalizado' 
      })
      .eq('id_consulta', idConsulta);

      alert("🎉 Atendimento finalizado com sucesso! Ele foi movido para o Histórico.");
      
      setConsultaEmAtendimento(null);
      setParecerTexto("");
      setSolicitarExameCheck(false);
      setListaExamesEscolhidos([]);
      
      carregarConsultasDoBanco();
    } catch (err) {
      alert("Falha ao salvar atendimento.");
    } finally {
      setEnviandoParecer(false);
    }
  };

  useEffect(() => { 
    carregarConsultasDoBanco(); 
  }, []);

  return (
    <div className="mt-4 p-4 bg-white border rounded shadow-sm">
      <h3 className="fw-bold text-secondary mb-1">📋 Minhas Consultas Agendadas</h3>
      <p className="text-muted mb-4">Pacientes aguardando atendimento.</p>

      {carregando ? (
        <div className="text-center py-4"><div className="spinner-border text-primary"></div></div>
      ) : minhasConsultas.length === 0 ? (
        <div className="alert alert-info text-center">Você não tem nenhuma consulta marcada para hoje.</div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {minhasConsultas.map((consulta) => {
            const estaSendoAtendido = consultaEmAtendimento?.id_consulta === consulta.id_consulta;
            if (consultaEmAtendimento && !estaSendoAtendido) return null;

            return (
              <div key={consulta.id_consulta} className="card border-0 border-start border-primary bg-light border-4 shadow-sm p-3">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                  <div>
                    <h5 className="fw-bold text-success mb-2">✔️ Consulta Confirmada</h5>
                    <p className="mb-1">Data: <strong>{String(consulta.dia).padStart(2, '0')}/{String(consulta.mes).padStart(2, '0')}/{consulta.ano}</strong></p>
                    <p className="mb-2 small text-secondary">Horário: <strong className="text-primary">{consulta.hora}</strong></p>
                    <div className="bg-white p-2 rounded border small text-secondary"><strong>Sintomas:</strong> {consulta.queixa_sintomas || "Nenhum relatado."}</div>
                  </div>
                  <div className="d-flex flex-column gap-2 w-100 w-md-auto">
  <span className="badge bg-secondary bg-opacity-10 text-dark border px-3 py-2 fw-bold">
    👤 Paciente: {consulta.nome_paciente_tratado}
  </span>
  {!estaSendoAtendido && (
    <button 
      onClick={() => setConsultaEmAtendimento(consulta)} 
      className="btn btn-outline-success fw-bold w-100" // w-100 força o botão a ocupar a largura
    >
      👨‍⚕️ Atender Paciente
    </button>
  )}
</div>
                </div>

                {estaSendoAtendido && (
                  <div className="border-top pt-3 mt-2">
                    <h6 className="fw-bold text-dark mb-2">📝 Formular Parecer</h6>
                    <textarea className="form-control mb-3" rows="4" placeholder="Parecer clínico..." value={parecerTexto} onChange={(e) => setParecerTexto(e.target.value)} disabled={enviandoParecer}></textarea>
                    
                    <div className="form-check form-switch mb-3">
                      <input className="form-check-input" type="checkbox" id="exameCheck" checked={solicitarExameCheck} onChange={(e) => setSolicitarExameCheck(e.target.checked)} />
                      <label className="form-check-label small fw-bold text-secondary" htmlFor="exameCheck">📋 Requisitar Exames</label>
                    </div>

                    {solicitarExameCheck && (
                     <div className="d-flex align-items-center gap-2 mb-3">
    <select 
      className="form-select form-select-md" // Aumentei para 'md' para facilitar o toque no mobile
      value={exameSelecionado} 
      onChange={(e) => setExameSelecionado(e.target.value)}
    >
      <option value="">-- Selecione o exame --</option>
      {opcoesDeExames.map((ex, i) => (
        <option key={i} value={ex}>{ex}</option>
      ))}
    </select>
    <button 
      type="button" 
      className="btn btn-primary px-3" 
      onClick={handleAdicionarExame}
    >
      ＋
    </button>
  </div>
)}

<div className="form-check form-switch mb-3">
  <input 
    className="form-check-input" 
    type="checkbox" 
    id="especialistaCheck" 
    checked={encaminharEspecialistaCheck} 
    onChange={(e) => setEncaminharEspecialistaCheck(e.target.checked)} 
  />
  <label className="form-check-label small fw-bold text-secondary" htmlFor="especialistaCheck">
    🩺 Encaminhar para Especialista
  </label>
</div>

{/* Select condicional de Especialista */}
{encaminharEspecialistaCheck && (
  <div className="mb-3">
    <select 
      className="form-select form-select-md" 
      value={especialistaSelecionado} 
      onChange={(e) => setEspecialistaSelecionado(e.target.value)}
    >
      <option value="">-- Selecione o especialista --</option>
      {opcoesDeEspecialistas.map((esp, i) => (
        <option key={i} value={esp}>{esp}</option>
      ))}
    </select>
  </div>
)}

{/* Botões de Ação (Cancelar e Finalizar) */}
<div className="d-flex flex-wrap gap-2 mt-3">
  <button 
    type="button" 
    className="btn btn-light border flex-grow-1 fw-bold"
    onClick={() => setConsultaEmAtendimento(null)}
  >
    Cancelar
  </button>
  <button 
    type="button" 
    className="btn btn-success flex-grow-1 fw-bold"
    onClick={() => handleSalvarParecer(consulta.id_consulta)} 
    disabled={enviandoParecer}
  >
    {enviandoParecer ? "Salvando..." : "Finalizar Consulta"}
  </button>
</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ConsultasMarcadasPorMedico;