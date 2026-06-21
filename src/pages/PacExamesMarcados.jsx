import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import ptBR from 'date-fns/locale/pt-BR';
import 'react-big-calendar/lib/css/react-big-calendar.css'; 
import { createClient } from '@supabase/supabase-js';
import ConsultasMarcadasPorMedico from './pages/DocSideConsultasMarcadas';
import AgendaDoMedico from './pages/DocSideAgenda';
import Treinamentos from './pages/DocSideTreimamentos';
import { useState, useEffect, useRef } from 'react';
import HistoricoDeAtendimentos from './pages/HistoricoDeAtendimentos';
import ServicoInterno from './pages/DocSideServicoInterno';
import './App.css'; // Ou o nome do seu arquivo CSS


// Configuração do Supabase (Ajuste as chaves se necessário)
const supabaseUrl = 'https://oeuvczlnrkigikudxczz.supabase.co';
const supabaseKey = 'sb_publishable_PGBklwDlyNTaArBwTw7HLw_kWM7c-zK'; 
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true, // ISSO DAQUI garante que a sessão fique salva no navegador
    autoRefreshToken: true,
  }
});

const ExamesMarcados = () => {
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
    <div className="container mt-4">
      <h2>Meus Exames Marcados</h2>
      {loading ? <p>Carregando...</p> : (
        <div className="row">
          {exames.length > 0 ? (
            exames.map((item, index) => {
              // Extração segura do nome do exame (JSONB)
              const nomeExame = item.exames_requisitados?.nome || "Exame Requisitado";
              
              // Acesso correto ao nome do médico via join
              const nomeMedico = item.Tabela_medicos?.["Nome completo"] || "Não informado";
              
              // Montagem manual da data para evitar "Invalid Date"
              const dataFormatada = (item.dia && item.mes && item.ano) 
                ? `${item.dia}/${item.mes}/${item.ano}` 
                : "Data não definida";

              return (
                <div className="col-md-4 mb-3" key={index}>
                  <div className="card h-100 shadow-sm">
                    <div className="card-body">
                      <h5 className="card-title text-primary">{nomeExame}</h5>
                      <p className="card-text mb-1">
                        <strong>Médico:</strong> {nomeMedico}
                      </p>
                      <p className="card-text">
                        <small className="text-muted">Pedido em: {dataFormatada}</small>
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-12">
              <p className="text-muted">Você não possui exames requisitados no momento.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};	

export default ExamesMarcados;