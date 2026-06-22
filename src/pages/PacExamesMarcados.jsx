import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import ptBR from 'date-fns/locale/pt-BR';
import 'react-big-calendar/lib/css/react-big-calendar.css'; 
import { useState, useEffect } from 'react'; // Adicione também o useEffect se for usar
// Configuração do Supabase (Ajuste as chaves se necessário)


const supabaseUrl = 'https://oeuvczlnrkigikudxczz.supabase.co';
const supabaseKey = 'sb_publishable_PGBklwDlyNTaArBwTw7HLw_kWM7c-zK'; 


const  ComponenteNovoExames  = () => {
  const [exames, setExames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExames = async () => {
      const idUsuarioLogado = localStorage.getItem('id_usuario_logado');
      if (!idUsuarioLogado) {
        setLoading(false);
        return;
      }

      try {
        // 1. Busca o ID do paciente
        const { data: paciente, error: errPaciente } = await supabase
          .from('Tabela pacientes')
          .select('"Id paciente"')
          .eq('id_usuario', idUsuarioLogado)
          .maybeSingle();

        if (errPaciente || !paciente) throw new Error("Paciente não encontrado");

        const idPacienteReal = paciente["Id paciente"];

        // 2. Busca os agendamentos (corrigido o nome do join)
        const { data, error } = await supabase
          .from('Agendamentos')
          .select(`
            exames_requisitados, 
            dia, mes, ano,
            Tabela_medicos ("Nome completo") 
          `)
          .eq('id_paciente', idPacienteReal)
          .not('exames_requisitados', 'is', null);

        if (error) throw error;
        setExames(data || []);
      } catch (err) {
        console.error("Erro ao buscar dados:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchExames();
  }, []);

  return (
   <div className="container mt-5">
  {/* Cabeçalho da Página */}
  <div className="d-flex align-items-center justify-content-between mb-4 pb-2 border-bottom">
    <h2 className="fw-bold text-secondary m-0">
      <span className="text-primary me-2">📋</span> Meus Exames Marcados
    </h2>
    <span className="badge bg-primary rounded-pill fs-6">
      {exames.length} {exames.length === 1 ? 'exame' : 'exames'}
    </span>
  </div>

  {/* Estado de Carregamento (Spinner) */}
  {loading ? (
    <div className="d-flex flex-column align-items-center justify-content-center my-5 py-5">
      <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
        <span className="visually-hidden">Carregando...</span>
      </div>
      <p className="text-muted fw-medium">Buscando seus exames na base de dados...</p>
    </div>
  ) : (
    <div className="row g-4">
      {exames.length > 0 ? (
        exames.map((item, index) => {
          // Extração segura do nome do exame (JSONB)
          const nomeExame = item.exames_requisitados?.nome || "Exame Requisitado";
          
          // Acesso correto ao nome do médico via join
          const nomeMedico = item.Tabela_medicos?.["Nome completo"] || "Não informado";
          
          // Montagem manual da data para evitar "Invalid Date"
          const dataFormatada = (item.dia && item.mes && item.ano) 
            ? `${item.dia.toString().padStart(2, '0')}/${item.mes.toString().padStart(2, '0')}/${item.ano}` 
            : "Data não definida";

          return (
            <div className="col-12 col-md-6 col-lg-4" key={index}>
              <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden position-relative btn-light style-card-hover">
                {/* Detalhe colorido no topo do card */}
                <div className="bg-primary" style={{ height: '4px' }}></div>
                
                <div className="card-body p-4 d-flex flex-column justify-content-between">
                  <div>
                    {/* Badge do Exame */}
                    <div className="mb-3">
                      <span className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill px-3 py-2 fw-semibold fs-7 text-wrap text-start">
                        🔬 {nomeExame}
                      </span>
                    </div>
                    
                    {/* Informações do Médico */}
                    <div className="d-flex align-items-start mb-3">
                      <div className="bg-light rounded-circle p-2 me-3 text-secondary" style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        🩺
                      </div>
                      <div>
                        <small className="text-uppercase tracking-wider text-muted fw-bold" style={{ fontSize: '0.75rem' }}>Médico Solicitante</small>
                        <p className="mb-0 text-dark fw-medium">{nomeMedico}</p>
                      </div>
                    </div>
                  </div>

                  {/* Rodapé do Card com a Data */}
                  <div className="pt-3 border-top d-flex align-items-center justify-content-between text-muted">
                    <span className="small d-flex align-items-center">
                      <span className="me-1">📅</span> Pedido em:
                    </span>
                    <span className="small fw-bold text-secondary bg-light px-2 py-1 rounded">
                      {dataFormatada}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })
      ) : (
        /* Estado Vazio Amigável */
        <div className="col-12 text-center my-5 py-5">
          <div className="card border-0 shadow-sm p-5 mx-auto bg-light rounded-4" style={{ maxWidth: '500px' }}>
            <div className="fs-1 mb-3 text-muted">📭</div>
            <h4 className="fw-bold text-dark mb-2">Nenhum exame por aqui</h4>
            <p className="text-muted mb-0">Você não possui exames requisitados ou agendados no momento.</p>
          </div>
        </div>
      )}
    </div>
  )}
</div>
  );
};	

export default ComponenteNovoExames ;