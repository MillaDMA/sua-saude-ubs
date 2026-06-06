import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import ptBR from 'date-fns/locale/pt-BR';
import 'react-big-calendar/lib/css/react-big-calendar.css'; 
import { useState, useRef, useEffect } from 'react';

// IMPORTAÇÃO CRÍTICA FALTANTE:
import { createClient } from '@supabase/supabase-js';

// Informações do Supabase
const supabaseUrl = 'https://oeuvczlnrkigikudxczz.supabase.co';
const supabaseKey = 'sb_publishable_PGBklwDlyNTaArBwTw7HLw_kWM7c-zK'; // Lembre-se de usar variáveis de ambiente (.env) em produção!

export const supabase = createClient(supabaseUrl, supabaseKey);

const PaginaPrincipal = () => {
  const [urlMaps, setUrlMaps] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [erroLocalizacao, setErroLocalizacao] = useState(false);

  useEffect(() => {
    if (!navigator.geolocation) {
      setCarregando(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        // CORREÇÃO: URL oficial e funcional do Google Maps para buscar pontos próximos
        setUrlMaps(`https://www.google.com/maps/search/?api=1&query=posto+de+saude+ubs&center=${latitude},${longitude}`);
        setCarregando(false);
      },
      (error) => {
        console.error("Erro de geolocalização:", error);
        setErroLocalizacao(true);
        setCarregando(false);
      }
    );
  }, []);

  return (
    <div className="mt-4 home">
      <h2>Bem-vindo, paciente!!</h2>
      
      <div id="carouselExampleCaptions" className="carousel slide carousel-fade mod-carousel" data-bs-ride="carousel">
        <div className="carousel-indicators">
          <button type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide-to="0" className="active" aria-current="true" aria-label="Slide 1"></button>
          <button type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide-to="1" aria-label="Slide 2"></button>
          <button type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide-to="2" aria-label="Slide 3"></button>
        </div>
        
        <div className="carousel-inner">
          <div className="carousel-item active img-carousel">
            <img src="img/feriadojunho.jpg" className="d-block w-100" alt="Aviso de Feriado" />
            <div className="carousel-caption d-none d-md-block message-carousel">
              <h5>Feriado</h5>
              <p>Não estaremos abertos nesse feriado dia 04</p>
            </div>
          </div>
          
          <div className="carousel-item img-carousel">
            <img src="img/vacina.png" className="d-block w-100" alt="Campanha de Vacinação" />
            <div className="carousel-caption d-none d-md-block message-carousel">
              <h5>Saiba mais clicando aqui</h5>
              <p>Todos por uma cidade mais segura</p>
            </div>
          </div>
          
          <div className="carousel-item img-carousel">
            <img src="img/lavamaos.jpg" className="d-block w-100" alt="Dica de lavar as mãos" />
            <div className="carousel-caption d-none d-md-block message-carousel">
              <h5>Dica de saúde</h5>
              <p>saiba mais clicando na imagem</p>
            </div>
          </div>
        </div>
        
        <button className="carousel-control-prev" type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide="prev">
          <span className="carousel-control-prev-icon" aria-hidden="true"></span>
          <span className="visually-hidden">Previous</span>
        </button>
        <button className="carousel-control-next" type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide="next">
          <span className="carousel-control-next-icon" aria-hidden="true"></span>
          <span className="visually-hidden">Next</span>
        </button>
      </div>
      
      <div className="d-grid gap-2 button-search mt-4">
        <p className="text-center">Precisa de ajuda?</p>
        
        {carregando ? (
          <button className="btn btn-primary" type="button" disabled>
            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            Obtendo localização...
          </button>
        ) : erroLocalizacao ? (
          <a 
            href="https://www.google.com/maps/search/?api=1&query=posto+de+saude+ubs" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="btn btn-primary d-flex align-items-center justify-content-center"
          >
            Postinho mais próximo
          </a>
        ) : (
          <a 
            href={urlMaps} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="btn btn-primary d-flex align-items-center justify-content-center"
          >
            Postinho mais próximo
          </a>
        )}
      </div>
    </div>
  );
};

const Sobre = () => {
  const [documentos, setDocumentos] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const buscarDocumentos = async () => {
      setCarregando(true);
      try {
        const { data, error } = await supabase
          .from('Documentos_necessarios') // Garanta que o 'D' está maiúsculo aqui
          .select('id_documento, nome_documento, descrição_documento'); // Buscando também a descrição

        if (error) {
          console.error("Erro ao buscar documentos:", error.message);
        } else if (data) {
          setDocumentos(data);
        }
      } catch (err) {
        console.error("Erro crítico ao buscar documentos:", err);
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
            <span>Carregando documentos necessários...</span>
          </div>
        ) : documentos.length === 0 ? (
          <p className="text-muted">Nenhum documento listado no momento.</p>
        ) : (
          <div className="list-group">
            {documentos.map((doc) => (
              <div key={doc.id_documento} className="list-group-item list-group-item-action mb-2 shadow-sm rounded border">
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

const Agendamentos = () => (
  <div className="mt-4">
    <h2>Meus Agendamentos</h2>
    <p>Consulte suas consultas marcadas ou agende a próxima consulta</p>
    <Link to="/consultas-marcadas" style={{ textDecoration: 'none' }}>
  <button type="button" className="btn btn-primary me-2">Consultas Marcadas</button>
</Link>
    <button type="button" className="btn btn-primary me-2">Exames Marcados</button>
    <Link to="/agendarconsultas" style={{ textDecoration: 'none' }}> 
      <button type="button" className="btn btn-primary">Agendar consulta</button>
    </Link>
  </div>
);

// Configuração do calendário
const locales = { 'pt-BR': ptBR };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

const ehFimDeSemana = (date) => {
  const diaDaSemana = getDay(date);
  return diaDaSemana === 0 || diaDaSemana === 6;
};

const Agendarconsultas = () => {
  const minhasConsultas = [];
  const [diaSelecionado, setDiaSelecionado] = useState(null);
  
  // NOVOS ESTADOS: Para controlar os horários ocupados vindos do banco
  const [horariosOcupados, setHorariosOcupados] = useState([]);
  const [carregandoHorarios, setCarregandoHorarios] = useState(false);

  const areaHorariosRef = useRef(null);
  const navigate = useNavigate();

  // 1. Função que busca no Supabase os horários que já foram agendados no dia selecionado
  const buscarHorariosOcupados = async (dataSelecao) => {
    setCarregandoHorarios(true);
    setHorariosOcupados([]); // Limpa os horários guardados anteriormente

    const numDia = dataSelecao.getDate();
    const numMes = dataSelecao.getMonth() + 1;
    const numAno = dataSelecao.getFullYear();

    try {
      const { data, error } = await supabase
        .from('Agendamentos')
        .select('hora') // Busca apenas a coluna 'hora'
        .eq('dia', numDia)
        .eq('mes', numMes)
        .eq('ano', numAno)
        .eq('status', 'agendado'); // Apenas os que estão ativos

      if (error) {
        console.error("Erro ao buscar horários ocupados:", error.message);
      } else if (data) {
        // Extrai as horas do resultado (ex: ['08:20', '09:40'])
        const horasLista = data.map(agendamento => agendamento.hora);
        setHorariosOcupados(horasLista);
      }
    } catch (err) {
      console.error("Erro crítico na busca de horários:", err);
    } finally {
      setCarregandoHorarios(false);
    }
  };

  // 2. Modificação no useEffect para rolar a tela suavemente
  useEffect(() => {
    if (diaSelecionado && areaHorariosRef.current) {
      areaHorariosRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  }, [diaSelecionado]);

  // 3. Quando o usuário clica no dia, disparamos a busca no banco
  const handleSelecioneDia = (slotInfo) => {
    if (slotInfo && slotInfo.start) {
      if (ehFimDeSemana(slotInfo.start)) {
        alert("Finais de semana não estão disponíveis para agendamento. Por favor, escolha um dia útil.");
        setDiaSelecionado(null); 
        return false;
      }
      setDiaSelecionado(slotInfo.start);
      buscarHorariosOcupados(slotInfo.start); // DISPARA A BUSCA NO SUPABASE
    }
  };

  const handleDrillDown = (date) => {
    if (ehFimDeSemana(date)) return;
    setDiaSelecionado(date);
    buscarHorariosOcupados(date); // DISPARA A BUSCA NO SUPABASE
  };

  // Função original que gera os horários padrão do postinho
  const gerarHorarios = () => {
    const horarios = [];
    let hora = 8;
    let minuto = 0;
    while (hora < 12 || (hora === 12 && minuto === 0)) {
      const horaFormatada = String(hora).padStart(2, '0');
      const minutoFormatado = String(minuto).padStart(2, '0');
      horarios.push(`${horaFormatada}:${minutoFormatado}`);
      minuto += 20;
      if (minuto >= 60) {
        hora += 1;
        minuto = 0;
      }
    }
    return horarios;
  };

  // Filtra os horários: Só mantém na lista os horários que NÃO estão no array 'horariosOcupados'
  const listaDeHorariosDisponiveis = gerarHorarios().filter(
    (horario) => !horariosOcupados.includes(horario)
  );

  const customizarDias = (date) => {
    if (ehFimDeSemana(date)) {
      return {
        className: 'bg-light text-muted',
        style: { cursor: 'not-allowed', backgroundColor: '#f8f9fa', opacity: 0.5 }
      };
    }
    return {};
  };

  const handleAgendarHorario = async (horario) => {
    const numDia = diaSelecionado.getDate();             
    const numMes = diaSelecionado.getMonth() + 1;         
    const numAno = diaSelecionado.getFullYear();         

    try {
      const { error } = await supabase
        .from('Agendamentos')
        .insert([
          { 
            id_paciente: 1,      
            id_médico: 1,        
            hora: horario,       
            dia: numDia,           
            mes: numMes,           
            ano: numAno,           
            status: 'agendado'   
          }
        ]);

      if (error) {
        console.error('Erro ao salvar:', error.message);
        alert(`Não foi possível agendar: ${error.message}`);
      } else {
        navigate('/consulta-agendada', {
          state: { 
            diaExibicao: diaSelecionado.toLocaleDateString('pt-BR'), 
            horario: horario 
          }
        });
      }
    } catch (err) {
      console.error('Erro crítico:', err);
      alert('Erro de conexão ao tentar agendar.');
    }
  };

  return (
    <div className="mt-4">
      <h2>Escolha o dia da semana onde você deseja agendar sua consulta</h2>
      <h3>UBS</h3>
      <p>sua ubs</p>
      
      <div style={{ height: '600px' }} className="shadow-sm p-3 bg-white rounded border mt-3">
        <Calendar
          localizer={localizer}
          events={minhasConsultas}
          startAccessor="start"
          endAccessor="end"
          culture="pt-BR"
          toolbar={true}
          defaultDate={new Date()} 
          views={['month']}        
          selectable={true}
          longPressThreshold={10}
          onSelectSlot={handleSelecioneDia}
          onDrillDown={handleDrillDown}
          dayPropGetter={customizarDias}
          messages={{
            next: "Próximo",
            previous: "Anterior",
            today: "Hoje",
            month: "Mês",
          }}
        />
      </div>

      <div ref={areaHorariosRef} className="mt-4 p-4 bg-light rounded border shadow-sm text-center">
        {!diaSelecionado ? (
          <p className="text-muted m-0">👋 Selecione um dia útil no calendário acima para ver os horários disponíveis.</p>
        ) : carregandoHorarios ? (
          // Mensagem visual enquanto o Supabase responde
          <div>
            <div className="spinner-border text-primary mb-2" role="status"></div>
            <p className="text-muted m-0">Consultando horários livres no banco de dados...</p>
          </div>
        ) : (
          <div>
            <h4 className="text-primary mb-3">
              Horários disponíveis para o dia: {diaSelecionado.toLocaleDateString('pt-BR')}
            </h4>
            
            {listaDeHorariosDisponiveis.length === 0 ? (
              <div className="alert alert-warning m-0">
                ⚠️ Sentimos muito, mas todos os horários para este dia já estão preenchidos!
              </div>
            ) : (
              <div className="row g-2 justify-content-center row-cols-3 row-cols-sm-4 row-cols-md-6">
                {listaDeHorariosDisponiveis.map((horario) => (
                  <div key={horario} className="col">
                    <button 
                      className="btn btn-outline-primary w-100" 
                      type="button"
                      onClick={() => handleAgendarHorario(horario)}
                    >
                      {horario}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {listaDeHorariosDisponiveis.length > 0 && (
              <p className="small text-muted mt-3">Clique no horário desejado para prosseguir.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
const ConsultaAgendada = () => {
  const location = useLocation();
  const diaExibicao = location.state?.diaExibicao || 'X';
  const horario = location.state?.horario || 'Y';

  return (
    <div className="mt-5 p-5 bg-white border rounded shadow-sm text-center">
      <h2 className="text-success mb-3">✔️ Consulta Agendada!</h2>
      <p className="fs-4">
        Sua consulta foi agendada com sucesso para o dia <strong className="text-primary">{diaExibicao}</strong> às <strong className="text-primary">{horario}</strong>.
      </p>
      <p className="text-muted">Os dados foram confirmados e salvos no banco de dados.</p>
      
      <Link to="/agendamentos" className="btn btn-secondary mt-3">
        Voltar para Agendamentos
      </Link>
    </div>
  );
};

const ConsultasMarcadas = () => {
  const [minhasConsultas, setMinhasConsultas] = useState([]);
  const [carregando, setCarregando] = useState(true);

  // Função adaptada para buscar o histórico de agendamentos
  const carregarConsultasDoBanco = async () => {
    setCarregando(true);
    try {
      const { data, error } = await supabase
        .from('Agendamentos')
        .select('*') // Busca todas as colunas (id_consulta, dia, mes, ano, hora, status, etc.)
        .eq('id_paciente', 1) // Filtra pelas consultas do paciente logado (usando o ID 1 de teste)
        .eq('status', 'agendado'); // Traz apenas as que não foram canceladas

      if (error) {
        console.error("Erro ao buscar consultas marcadas:", error.message);
      } else if (data) {
        setMinhasConsultas(data); // Guarda a lista de agendamentos no estado
      }
    } catch (err) {
      console.error("Erro crítico ao carregar histórico:", err);
    } finally {
      setCarregando(false);
    }
  };

  // Executa a busca AUTOMATICAMENTE assim que a tela abre
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
        /* Lista os agendamentos encontrados em formato de lista/cards */
        <div className="list-group">
          {minhasConsultas.map((consulta) => (
            <div key={consulta.id_consulta || `${consulta.dia}-${consulta.hora}`} className="list-group-item list-group-item-action d-flex justify-content-between align-items-center mb-2 shadow-sm rounded border">
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
const FalarUBS = () => (
  <div className="mt-4">
    <h2>Falar com a UBS</h2>
    <p>Canais de atendimento e contato direto com a sua unidade.</p>
    <p>Horário de 8 da manhã até 5 da tarde de segunda a sexta</p>
    <p>Telefone: 2233-4466</p>
    <p>Se preferir nos envie uma mensagem</p>
    <a href='https://wa.me/5524988299581' target="_blank" rel="noopener noreferrer"><p>24988775544</p></a>
  </div>
);

const Historico = () => (
  <div className="mt-4">
    <h2>Meu Histórico</h2>
    <p>Histórico médico, receitas e atendimentos anteriores. Via API pelo SUS digital.</p>
  </div>
);

const Vacinas = () => (
  <div className="mt-4">
    <h2>Campanhas de Vacinação</h2>
    <p>Confira o calendário de vacinas e campanhas atuais. De acordo com o SUS</p>
    <div class="accordion" id="accordionPanelsStayOpenExample">
  <div class="accordion-item">
    <h2 class="accordion-header" id="panelsStayOpen-headingOne">
      <button class="accordion-button buttton-acordeon-tittle" type="button" data-bs-toggle="collapse" data-bs-target="#panelsStayOpen-collapseOne" aria-expanded="true" aria-controls="panelsStayOpen-collapseOne">
        Campanha Nacional de Vacinação contra a Influenza (Gripe)
      </button>
    </h2>
    <div id="panelsStayOpen-collapseOne" class="accordion-collapse collapse show" aria-labelledby="panelsStayOpen-headingOne">
      <div class="accordion-body">
        <strong>Informações</strong> <br></br>
        <i>Período Previsto/Realizado</i>
        <p>Geralmente de Março a Junho (com início e prorrogações variando por região)</p>
        <i>Público-Alvo Principal</i>
        <p>Grupos prioritários (idosos, trabalhadores da saúde, gestantes, crianças, etc.), estendida posteriormente à população geral conforme disponibilidade.</p>
        <i>Observações</i>
        <p>Proteção anual contra as cepas mais comuns do vírus.</p>     
      </div>
    </div>
  </div>
 
</div>
  </div>
);

function App() {
  return (
    <Router>
      <ul className="nav nav-tabs nav-style nav-justified">
        <li className="nav-item">
          <Link className="nav-link" to="/"><img src="img/user.png" className="icon-profile" alt="Perfil" /></Link>
        </li>
        <li className="nav-item"><Link className="nav-link menu-text" to="/">Página principal</Link></li>
        <li className="nav-item"><Link className="nav-link menu-text" to="/sobre">Dúvidas</Link></li>
        <li className="nav-item"><Link className="nav-link menu-text" to="/agendamentos">Agendamentos</Link></li>
        <li className="nav-item"><Link className="nav-link menu-text" to="/falar-ubs">Falar com a UBS</Link></li>
        <li className="nav-item"><Link className="nav-link menu-text" to="/historico">Meu histórico</Link></li>
        <li className="nav-item"><Link className="nav-link menu-text" to="/vacinas">Campanhas de vacinações</Link></li>
      </ul>

      <main className="container-fluid">
        <Routes>
          <Route path="/" element={<PaginaPrincipal />} />
          <Route path="/sobre" element={<Sobre />} />
          <Route path="/agendamentos" element={<Agendamentos />} />
          <Route path="/falar-ubs" element={<FalarUBS />} />
          <Route path="/historico" element={<Historico />} />
          <Route path="/vacinas" element={<Vacinas />} />
          <Route path="/agendarconsultas" element={<Agendarconsultas />} />
          <Route path="/consulta-agendada" element={<ConsultaAgendada />} />
          <Route path="/consultas-marcadas" element={<ConsultasMarcadas />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;