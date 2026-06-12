import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import React from 'react';

import { createClient } from '@supabase/supabase-js';
const supabaseUrl = 'https://oeuvczlnrkigikudxczz.supabase.co';
const supabaseKey = 'sb_publishable_PGBklwDlyNTaArBwTw7HLw_kWM7c-zK'; 
const supabase = createClient(supabaseUrl, supabaseKey);

const ConsultasMarcadasPorMedico = () => {
  const [minhasConsultas, setMinhasConsultas] = useState([]);
  const [carregando, setCarregando] = useState(true);

  // Função adaptada para buscar as consultas baseadas no usuário do médico logado
  const carregarConsultasDoBanco = async () => {
    setCarregando(true);
    try {
      // Passo 1: Pegar o ID do usuário (UUID do Auth/Login)
      const idUsuarioLogado = localStorage.getItem('id_usuario_logado'); 

      if (!idUsuarioLogado) {
        console.error("❌ [DEBUG] Nenhum usuário logado encontrado no localStorage.");
        setCarregando(false);
        return;
      }

      console.log("➡️ [DEBUG 1] Buscando o perfil do médico para o usuário UUID:", idUsuarioLogado);

      // Passo 2: Buscar o ID numérico do médico na tabela 'Tabela_medicos'
      const { data: dadosMedico, error: erroMedico } = await supabase
        .from('Tabela_medicos')
        .select('id_medico')
        .eq('id_usuario', idUsuarioLogado)
        .maybeSingle(); 

      if (erroMedico) {
        console.error("❌ [DEBUG ERRO] Falha ao buscar na Tabela_medicos:", erroMedico.message);
        setCarregando(false);
        return;
      }

      if (!dadosMedico) {
        console.warn("⚠️ [DEBUG AVISO] Nenhum médico encontrado com esse id_usuario.");
        setCarregando(false);
        return;
      }

      // Captura o ID real do médico
      const idMedicoReal = dadosMedico.id_medico;
      console.log("🎉 [DEBUG 2] Sucesso! O id_medico deste usuário é:", idMedicoReal);

      // Passo 3: Buscar os agendamentos diretos do médico
      const { data: consultas, error: erroAgendamentos } = await supabase
        .from('Agendamentos')
        .select('*')
        .eq('id_medico', idMedicoReal) 
        .eq('status', 'agendado');

      if (erroAgendamentos) {
        console.error("❌ [DEBUG ERRO] Falha ao buscar agendamentos:", erroAgendamentos.message);
        setCarregando(false);
        return;
      }

    // Passo 4: Buscar os nomes dos pacientes de forma combinada
      if (consultas && consultas.length > 0) {
        // Extrai os IDs de paciente válidos da lista de agendamentos
        const idsPacientes = consultas.map(c => c.id_paciente).filter(Boolean);

        // Busca na Tabela pacientes usando aspas duplas por causa do espaço no nome da coluna
        const { data: pacientes, error: erroPacientes } = await supabase
          .from('Tabela pacientes')
          .select('"Id paciente", "Nome completo"')
          .in('"Id paciente"', idsPacientes);

        if (erroPacientes) {
          console.error("❌ [DEBUG ERRO] Falha ao buscar nomes dos pacientes:", erroPacientes.message);
          setMinhasConsultas(consultas);
          return;
        }

        // 🔍 LOG DE INSPEÇÃO: Vamos ver exatamente como o Supabase está nomeando as propriedades
        console.log("👀 [INSPEÇÃO] Dados brutos recebidos da tabela de pacientes:", pacientes);

        // Cria o mapa de correspondência aceitando as duas variações de chave (com ou sem aspas litéricas)
        const mapaPacientes = {};
        if (pacientes) {
          pacientes.forEach(p => {
            // Tenta pegar o ID usando a propriedade com espaço puro ou com aspas embutidas
            const idPacienteReal = p["Id paciente"] || p['"Id paciente"'] || p.id_paciente;
            const nomeCompleto = p["Nome completo"] || p['"Nome completo"'];
            
            if (idPacienteReal) {
              mapaPacientes[idPacienteReal] = nomeCompleto;
            }
          });
        }

        console.log("🗺️ [INSPEÇÃO] Mapa de pacientes gerado:", mapaPacientes);

        // Injeta o nome tratado dentro de cada objeto de consulta
        const consultasComNomes = consultas.map(consulta => {
          console.log(`Checking ID: ${consulta.id_paciente} contra o mapa`, mapaPacientes[consulta.id_paciente]);
          return {
            ...consulta,
            nome_paciente_tratado: mapaPacientes[consulta.id_paciente] || `Paciente #${consulta.id_paciente}`
          };
        });

        console.log("🍏 [DEBUG 3] Consultas finais enviadas para o estado:", consultasComNomes);
        setMinhasConsultas(consultasComNomes);
      } else {
        setMinhasConsultas([]);
      }

    } catch (err) {
      console.error("💥 Erro crítico no fluxo de carregamento:", err);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarConsultasDoBanco();
  }, []);

  return (
    <div className="mt-4 p-4 bg-white border rounded shadow-sm">
      {/* Título com padrão visual limpo */}
      <h3 className="fw-bold text-secondary mb-1">📋 Minhas Consultas Agendadas</h3>
      <p className="text-muted mb-4">Abaixo estão os pacientes agendados para o seu perfil de atendimento.</p>

      {carregando ? (
        <div className="text-center py-4">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="text-muted mt-2">Buscando seus pacientes no sistema...</p>
        </div>
      ) : minhasConsultas.length === 0 ? (
        <div className="alert alert-info text-center py-3" role="alert">
          Você não tem nenhuma consulta marcada com seus pacientes no momento.
        </div>
      ) : (
        /* Lista os agendamentos do médico logado */
        <div className="d-flex flex-column gap-3">
          {minhasConsultas.map((consulta) => (
            <div 
              key={consulta.id_consulta || `${consulta.dia}-${consulta.hora}`} 
              className="card border-0 border-start border-primary border-4 shadow-sm bg-light p-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3"
            >
              <div>
                <h5 className="fw-bold text-success mb-2">✔️ Consulta Confirmada</h5>
                <p className="mb-1 text-dark">
                  Data: <strong>{String(consulta.dia).padStart(2, '0')}/{String(consulta.mes).padStart(2, '0')}/{consulta.ano}</strong>
                </p>
                <p className="mb-2 text-secondary small">
                  Horário: <strong className="text-primary">{consulta.hora}</strong>
                </p>
                
                {/* Bloco de sintomas estruturado */}
                <div className="bg-white p-2 rounded border small text-secondary mt-1">
                  <strong>Sintomas relatados:</strong> {consulta.queixa_sintomas || "Nenhum sintoma específico relatado."}
                </div>
              </div>

              {/* Badges de status organizados */}
              <div className="d-flex flex-row flex-md-column gap-2 align-items-start justify-content-start">
                <span className="badge bg-primary px-3 py-2 rounded-pill fs-7">
                  Status: {consulta.status}
                </span>
                
                {/* 👤 Aqui aparece o nome completo do paciente mapeado no Passo 4 */}
                <span className="badge bg-secondary bg-opacity-10 text-dark border px-3 py-2 rounded-pill fs-7 fw-bold">
                  👤 Paciente: {consulta.nome_paciente_tratado}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ConsultasMarcadasPorMedico;