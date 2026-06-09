import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Necessário para navegar após o agendamento
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import ptBR from 'date-fns/locale/pt-BR';
import { supabase } from './supaBaseClient.jsx';

// Configuração do calendário (fora do componente para não recriar a cada render)
const locales = { 'pt-BR': ptBR };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

// Função auxiliar de fim de semana (fora do componente)
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

    useEffect(() => {
        if (diaSelecionado && areaHorariosRef.current) {
        areaHorariosRef.current.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
        }
    }, [diaSelecionado]);

    // Quando o usuário clica no dia, disparamos a busca no banco
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

    export default Agendarconsultas;