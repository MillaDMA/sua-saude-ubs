import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import ptBR from 'date-fns/locale/pt-BR';
import 'react-big-calendar/lib/css/react-big-calendar.css'; 
import { useState, useRef, useEffect } from 'react';

// Páginas estáticas do sistema
const PaginaPrincipal = () => (
  <div className="mt-4">
    <h2>Painel Principal</h2>
    <p>Aqui fica o conteúdo da sua página principal do "Sua Saúde".</p>
  </div>
);

const Sobre = () => (
  <div className="mt-4">
    <h2>Sobre o Aplicativo</h2>
    <p>Informações sobre o projeto e utilidades do app.</p>
  </div>
);

const Agendamentos = () => (
  <div className="mt-4">
    <h2>Meus Agendamentos</h2>
    <p>Consulte suas consultas marcadas ou agende a próxima consulta</p>
    <button type="button" className="btn btn-primary me-2">Consultas Marcadas</button>
    <Link to="/agendarconsultas" style={{ textDecoration: 'none' }}> 
      <button type="button" className="btn btn-primary">Agendar consulta</button>
    </Link>
  </div>
);

// Configuração de localização do calendário
const locales = {
  'pt-BR': ptBR,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// Função auxiliar global para detecção de fins de semana (0 = Domingo, 6 = Sábado)
const ehFimDeSemana = (date) => {
  const diaDaSemana = getDay(date);
  return diaDaSemana === 0 || diaDaSemana === 6;
};

// Componente de Agendamento
// COMPONENTE: Agendarconsultas (Bloqueio definitivo por JavaScript e CSS)
const Agendarconsultas = () => {
  const minhasConsultas = [];
  const [diaSelecionado, setDiaSelecionado] = useState(null);
  const areaHorariosRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (diaSelecionado && areaHorariosRef.current) {
      areaHorariosRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  }, [diaSelecionado]);

  // Intercepta e bloqueia a seleção de qualquer slot no fim de semana
  const handleSelecioneDia = (slotInfo) => {
    if (slotInfo && slotInfo.start) {
      if (ehFimDeSemana(slotInfo.start)) {
        alert("Finais de semana não estão disponíveis para agendamento. Por favor, escolha um dia útil.");
        setDiaSelecionado(null); 
        return false; // Cancela a ação no calendário
      }
      setDiaSelecionado(slotInfo.start);
    }
  };

  // Bloqueia o duplo clique ou ação de "entrar" no dia se for fim de semana
  const handleDrillDown = (date) => {
    if (ehFimDeSemana(date)) {
      return; // Ignora completamente
    }
    setDiaSelecionado(date);
  };

  // Mantém a estilização cinza e desativada visualmente
  const customizarDias = (date) => {
    if (ehFimDeSemana(date)) {
      return {
        className: 'bg-light text-muted',
        style: {
          cursor: 'not-allowed',
          backgroundColor: '#f8f9fa',
          opacity: 0.5
        }
      };
    }
    return {};
  };

  const handleAgendarHorario = (horario) => {
    const diaFormatado = diaSelecionado.toLocaleDateString('pt-BR');
    navigate('/consulta-agendada', {
      state: { dia: diaFormatado, horario: horario }
    });
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
          toolbar={false} 
          defaultDate={new Date()} 
          views={['month']}        
          selectable={true}
          longPressThreshold={10}
          onSelectSlot={handleSelecioneDia} // Modificado com validação estrita
          onDrillDown={handleDrillDown}     // Modificado para não abrir o dia no fim de semana
          dayPropGetter={customizarDias}
          messages={{
            next: "Próximo",
            previous: "Anterior",
            today: "Hoje",
            month: "Mês",
            week: "Semana",
            day: "Dia",
          }}
        />
      </div>

      <div 
        ref={areaHorariosRef} 
        className="mt-4 p-4 bg-light rounded border shadow-sm text-center"
      >
        {!diaSelecionado ? (
          <p className="text-muted m-0">
            👋 Selecione um dia útil no calendário acima para ver os horários disponíveis.
          </p>
        ) : (
          <div>
            <h4 className="text-primary mb-3">
              Horários para o dia: {diaSelecionado.toLocaleDateString('pt-BR')}
            </h4>
            
            <div className="d-flex justify-content-center gap-2 flex-wrap">
              <button className="btn btn-outline-primary btn-lg" onClick={() => handleAgendarHorario('08:00')}>08:00</button>
              <button className="btn btn-outline-primary btn-lg" onClick={() => handleAgendarHorario('09:30')}>09:30</button>
              <button className="btn btn-outline-primary btn-lg" onClick={() => handleAgendarHorario('11:00')}>11:00</button>
              <button className="btn btn-outline-primary btn-lg" onClick={() => handleAgendarHorario('14:00')}>14:00</button>
            </div>
            
            <p className="small text-muted mt-3">Clique no horário desejado para prosseguir.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Componente de Confirmação de Sucesso
const ConsultaAgendada = () => {
  const location = useLocation();
  const dia = location.state?.dia || 'X';
  const horario = location.state?.horario || 'Y';

  return (
    <div className="mt-5 p-5 bg-white border rounded shadow-sm text-center">
      <h2 className="text-success mb-3">✔️ Consulta Agendada!</h2>
      <p className="fs-4">
        Sua consulta foi agendada com sucesso para o dia <strong className="text-primary">{dia}</strong> às <strong className="text-primary">{horario}</strong>.
      </p>
      <p className="text-muted">Você receberá em breve uma mensagem com mais informações.</p>
      
      <Link to="/agendamentos" className="btn btn-secondary mt-3">
        Voltar para Agendamentos
      </Link>
    </div>
  );
};

const FalarUBS = () => (
  <div className="mt-4">
    <h2>Falar com a UBS</h2>
    <p>Canais de atendimento e contato direto com a sua unidade.</p>
    <p>Horário de 8 da manhã até 5 da tarde de segunda a sexta</p>
    <p>Telefone: 2233-4466</p>
    <p>Se preferir nos evie uma mensagem</p>
    <a href='https://wa.me/5524988299581'><p>24988775544</p></a>
  </div>
);

const Historico = () => (
  <div className="mt-4">
    <h2>Meu Histórico</h2>
    <p>Histórico médico, receitas e atendimentos anteriores.</p>
  </div>
);

const Vacinas = () => (
  <div className="mt-4">
    <h2>Campanhas de Vacinação</h2>
    <p>Confira o calendário de vacinas e campanhas atuais.</p>
  </div>
);

// Componente Principal da Aplicação
function App() {
  return (
    <Router>
      <ul className="nav nav-tabs nav-style nav-justified">
        <li className="nav-item">
          <Link className="nav-link" to="/"><img src="img/user.png" className="icon-profile" alt="Perfil" /></Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link menu-text" to="/">Página principal</Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link menu-text" to="/sobre">Sobre o aplicativo</Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link menu-text" to="/agendamentos">Agendamentos</Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link menu-text" to="/falar-ubs">Falar com a UBS</Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link menu-text" to="/historico">Meu histórico</Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link menu-text" to="/vacinas">Campanhas de vacinações</Link>
        </li>
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
        </Routes>
      </main>
    </Router>
  );
}

export default App;