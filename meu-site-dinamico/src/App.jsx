import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import ptBR from 'date-fns/locale/pt-BR';
import 'react-big-calendar/lib/css/react-big-calendar.css'; 
import { useState, useRef, useEffect } from 'react';
import React from 'react';

// IMPORTAÇÃO CRÍTICA FALTANTE:
import { createClient } from '@supabase/supabase-js';


const PaginaLogin = () => {
  const navigate = useNavigate();
  
  // ESTADOS DO COMPONENTE
  const [perfil, setPerfil] = useState('paciente'); // 'paciente' ou 'medico'
  const [documentoDigitado, setDocumentoDigitado] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [mensagemErro, setMensagemErro] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setCarregando(true);
    setMensagemErro('');

    try {
      console.log(`🔐 Tentando logar perfil [${perfil}] com Documento:`, documentoDigitado.trim());

      // Faz a consulta na tabela única de usuários criada no seu banco
      const { data, error } = await supabase
        .from('usuarios') // Certifique-se de que o nome está idêntico (maiúsculas/minúsculas) no Supabase
        .select('*')
        .eq('Documento', documentoDigitado.trim())
        .eq('password', senha)
        .eq('perfil', perfil)
        .single();

      if (error || !data) {
        console.warn("⚠️ Falha na busca por usuário:", error?.message || "Nenhum registro encontrado");
        setMensagemErro(`⚠️ ${perfil === 'paciente' ? 'CPF' : 'CRM'} ou senha incorretos para este perfil.`);
      } else {
        console.log("🎉 Usuário autenticado com sucesso na tabela usuarios:", data);
        
        // 🔑 Guarda o ID único do registro e o perfil na sessão do navegador
        localStorage.setItem('id_usuario_logado', data.id);
        localStorage.setItem('perfil_usuario', data.perfil);
        
        console.log("💾 ID salvo no localStorage com sucesso:", localStorage.getItem('id_usuario_logado'));

        // Vai direto para a dashboard principal
        navigate('/inicio');
      }
    } catch (err) {
      console.error("Erro crítico no login:", err);
      setMensagemErro('❌ Erro ao tentar conectar ao servidor.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card shadow" style={{ width: '24rem' }}>
        <div className="card-header bg-primary text-white text-center fw-bold fs-5">
          Sua Saúde - Portal de Acesso
        </div>
        
        <div className="card-body">
          {/* SELETOR DE PERFIL (Abas) */}
          <div className="btn-group w-100 mb-4" role="group">
            <button
              type="button"
              className={`btn ${perfil === 'paciente' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => {
                setPerfil('paciente');
                setDocumentoDigitado('');
                setMensagemErro('');
              }}
              disabled={carregando}
            >
              👤 Sou Paciente
            </button>
            <button
              type="button"
              className={`btn ${perfil === 'medico' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => {
                setPerfil('medico');
                setDocumentoDigitado('');
                setMensagemErro('');
              }}
              disabled={carregando}
            >
              🩺 Sou Médico
            </button>
          </div>

          {/* MENSAGEM DE ERRO */}
          {mensagemErro && (
            <div className="alert alert-danger py-2 text-center small" role="alert">
              {mensagemErro}
            </div>
          )}

          <form onSubmit={handleLogin}>
            {/* CAMPO DINÂMICO PARA O DOCUMENTO */}
            <div className="mb-3">
              <label htmlFor="inputDocumento" className="form-label fw-bold">
                {perfil === 'paciente' ? 'CPF do Paciente' : 'CRM do Médico'}
              </label>
              <input 
                type="text" 
                className="form-control" 
                id="inputDocumento" 
                placeholder={perfil === 'paciente' ? 'Digite seu CPF' : 'Digite seu CRM'} 
                value={documentoDigitado}
                onChange={(e) => setDocumentoDigitado(e.target.value)}
                required 
                disabled={carregando}
              />
            </div>

            {/* CAMPO DA SENHA COM O BOTÃO DE EXIBIR */}
            <div className="mb-3">
              <label htmlFor="inputPassword" className="form-label fw-bold">Senha</label>
              <div className="input-group">
                <input 
                  type={mostrarSenha ? "text" : "password"} 
                  className="form-control" 
                  id="inputPassword" 
                  placeholder="Digite sua senha" 
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required 
                  disabled={carregando}
                />
                <button 
                  className="btn btn-outline-secondary" 
                  type="button"
                  onClick={() => setMostrarSenha(!mostrarSenha)} 
                  disabled={carregando}
                  title={mostrarSenha ? "Esconder senha" : "Mostrar senha"}
                >
                  {mostrarSenha ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {/* BOTÃO DE ENTRAR */}
            <div className="d-grid gap-2 mb-3">
              <button type="submit" className="btn btn-primary" disabled={carregando}>
                {carregando ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Autenticando...
                  </>
                ) : (
                  `Entrar como ${perfil === 'paciente' ? 'Paciente' : 'Médico'}`
                )}
              </button>
            </div>
          </form>

          <hr />

          <div className="text-center">
            <p className="small text-muted mb-2">Novo por aqui? Clique no botão abaixo para se cadastrar</p>
            <button 
              type="button" 
              className="btn btn-outline-secondary btn-sm w-100"
              onClick={() => alert('Tela de cadastro em desenvolvimento!')}
              disabled={carregando}
            >
              Criar uma Conta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Informações do Supabase

const supabaseUrl = 'https://oeuvczlnrkigikudxczz.supabase.co';
const supabaseKey = 'sb_publishable_PGBklwDlyNTaArBwTw7HLw_kWM7c-zK'; 

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true, // 🔑 ISSO DAQUI garante que a sessão fique salva no navegador
    autoRefreshToken: true,
  }
});

const PaginaPrincipal = () => {
  const [nomePaciente, setNomePaciente] = useState('');
  const [urlMaps, setUrlMaps] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [erroLocalizacao, setErroLocalizacao] = useState(false);

  useEffect(() => {
    const inicializarPagina = async () => {
      // --- 1. BUSCA O NOME DO PACIENTE LOGADO VIA LOCALSTORAGE ---
      try {
        const idUsuarioLogado = localStorage.getItem('id_usuario_logado');
        console.log("🔍 [TESTE LOG] ID do usuário vindo do localStorage:", idUsuarioLogado);

        if (idUsuarioLogado) {
          // 🔑 Trocamos os nomes das colunas por '*' para o Supabase não quebrar com o acento de 'id_usuário' na URL
          const { data: todosPacientes, error: dbError } = await supabase
            .from('Tabela pacientes')   
            .select('*'); 

          console.log("📊 [TESTE LOG] Dados brutos recebidos da tabela:", todosPacientes);

          if (dbError) {
            console.error("🚨 [TESTE LOG] Erro retornado pela tabela:", dbError.message);
          }

          if (todosPacientes && todosPacientes.length > 0) {
  // Limpa o ID que veio do localStorage removendo espaços vazios nas pontas
  const idLimpoLocalStorage = String(idUsuarioLogado).trim().toLowerCase();

  const pacienteEncontrado = todosPacientes.find((p) => {
    // Procura por qualquer variação do nome da coluna de ID no objeto do banco
    const idBancoBruto = p['id_usuário'] || p['id_usuario'] || p.id_usuario;
    
    if (!idBancoBruto) return false;

    // Limpa o ID do banco da mesma forma
    const idBancoLimpo = String(idBancoBruto).trim().toLowerCase();

    // Compara se um ID está contido no outro ou se são idênticos
    return idBancoLimpo === idLimpoLocalStorage || idBancoLimpo.includes(idLimpoLocalStorage);
  });

  if (pacienteEncontrado) {
    // Captura o nome testando variações de maiúsculas/minúsculas da coluna
    const nomeEncontrado = pacienteEncontrado['Nome completo'] || pacienteEncontrado['Nome Completo'] || pacienteEncontrado.Nome_completo;
    
    console.log("🎉 [TESTE LOG] Sucesso total! Nome encontrado:", nomeEncontrado);
    setNomePaciente(nomeEncontrado);
  } else {
    console.warn("⚠️ [TESTE LOG] Os IDs não casaram na comparação direta. IDs disponíveis no banco:", 
      todosPacientes.map(p => p['id_usuário'] || p['id_usuario'])
    );
  }

          } else {
            console.warn("⚠️ [TESTE LOG] A tabela retornou totalmente vazia do banco.");
          }
        } else {
          console.warn("⚠️ [TESTE LOG] Nenhum ID encontrado no localStorage. Faça login primeiro!");
        }
      } catch (err) {
        console.error("💥 [TESTE LOG] Erro crítico no bloco JavaScript:", err);
      }

      // --- 2. GEOLOCALIZAÇÃO ---
      if (!navigator.geolocation) {
        setCarregando(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUrlMaps(`https://www.google.com/maps/search/?api=1&query=posto+de+saude+ubs&center=${latitude},${longitude}`);
          setCarregando(false);
        },
        (error) => {
          console.error("Erro de geolocalização:", error);
          setErroLocalizacao(true);
          setCarregando(false);
        }
      );
    };

    inicializarPagina();
  }, []);
  return (
    <div className="mt-4 home">
      <h2>Bem-vindo, <span className="text-primary">{nomePaciente || 'paciente'}</span>!!</h2>
      
      {/* CAROUSEL */}
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
      
      {/* SEÇÃO DO BOTÃO DE BUSCA DA UBS */}
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

const Meusdados = () => {
  // Estados para armazenar os campos do formulário
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [telefone, setTelefone] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    const buscarDadosPaciente = async () => {
      try {
        const idUsuarioLogado = localStorage.getItem('id_usuario_logado');
        console.log("🔍 [FORM LOG] ID do localStorage:", idUsuarioLogado);
        
        if (!idUsuarioLogado) {
          setErro('Nenhum usuário logado encontrado. Faça o login novamente.');
          setCarregando(false);
          return;
        }

        // Busca todos os dados da tabela para evitar problemas com acentos na URL
        const { data: todosPacientes, error: dbError } = await supabase
          .from('Tabela pacientes')
          .select('*');

        if (dbError) {
          throw dbError;
        }

        console.log("📊 [FORM LOG] Dados brutos vindos do banco:", todosPacientes);

        if (todosPacientes && todosPacientes.length > 0) {
          // Procura o paciente correspondente usando a mesma lógica que funcionou na principal
          const pacienteEncontrado = todosPacientes.find((p) => {
            const idBancoBruto = p['id_usuário'] || p['id_usuario'] || p.id_usuario;
            return String(idBancoBruto).trim().toLowerCase() === String(idUsuarioLogado).trim().toLowerCase();
          });

          if (pacienteEncontrado) {
            console.log("🎉 [FORM LOG] Registro do paciente encontrado no banco:", pacienteEncontrado);

            // 1. Nome Completo (Já sabemos que no banco está 'Nome completo')
            setNome(pacienteEncontrado['Nome completo'] || '');

            // 2. CPF (Testa variações comuns de escrita)
            // Se no seu banco a coluna se chamar 'cpf_paciente' ou 'Nº CPF', mude aqui embaixo:
            setCpf(pacienteEncontrado['CPF'] || pacienteEncontrado['cpf'] || pacienteEncontrado['Cpf'] || 'Não encontrado');

            // 3. Telefone (Testa variações comuns de escrita)
            setTelefone(pacienteEncontrado['Telefone'] || pacienteEncontrado['telefone'] || pacienteEncontrado['Celular'] || 'Não encontrado');

            // 4. Data de Nascimento (Testa variações comuns de escrita)
            setDataNascimento(pacienteEncontrado['Data de Nascimento'] || pacienteEncontrado['data_nascimento'] || pacienteEncontrado['Nascimento'] || '');
            
          } else {
            setErro('Seu perfil de paciente não foi localizado no banco de dados.');
          }
        } else {
          setErro('Nenhum registro de paciente encontrado no servidor.');
        }
      } catch (err) {
        console.error('Erro ao carregar dados do formulário:', err);
        setErro('Erro crítico ao conectar com o banco de dados.');
      } finally {
        setCarregando(false);
      }
    };

    buscarDadosPaciente();
  }, []);

  if (carregando) {
    return (
      <div className="d-flex align-items-center justify-content-center p-5">
        <div className="spinner-border text-primary me-2" role="status"></div>
        <span>Carregando suas informações...</span>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="alert alert-danger my-4 text-center" role="alert">
        ⚠️ {erro}
      </div>
    );
  }

  return (
    <div className="container mt-4" style={{ maxWidth: '600px' }}>
      <div className="card shadow-sm">
        <div className="card-header bg-primary text-white fw-bold fs-5 text-center">
          🗂️ Meus Dados Cadastrais
        </div>
        <div className="card-body p-4">
          <p className="text-muted small text-center mb-4">
            Abaixo estão as suas informações registradas no sistema da UBS.
          </p>

          <form onSubmit={(e) => e.preventDefault()}>
            {/* CAMPO NOME */}
            <div className="mb-3">
              <label htmlFor="formNome" className="form-label fw-bold text-secondary">
                Nome Completo
              </label>
              <input
                type="text"
                className="form-control bg-light"
                id="formNome"
                value={nome}
                readOnly
              />
            </div>

            {/* CAMPO CPF */}
            <div className="mb-3">
              <label htmlFor="formCpf" className="form-label fw-bold text-secondary">
                CPF
              </label>
              <input
                type="text"
                className="form-control bg-light"
                id="formCpf"
                value={cpf}
                readOnly
              />
            </div>

            <div className="row">
              {/* CAMPO TELEFONE */}
              <div className="col-md-6 mb-3">
                <label htmlFor="formTelefone" className="form-label fw-bold text-secondary">
                  Telefone / Celular
                </label>
                <input
                  type="text"
                  className="form-control bg-light"
                  id="formTelefone"
                  value={telefone}
                  readOnly
                />
              </div>

              {/* CAMPO DATA DE NASCIMENTO */}
              <div className="col-md-6 mb-3">
                <label htmlFor="formDataNasc" className="form-label fw-bold text-secondary">
                  Data de Nascimento
                </label>
                <input
                  type="text"
                  className="form-control bg-light"
                  id="formDataNasc"
                  value={dataNascimento}
                  readOnly
                />
              </div>
            </div>

            <hr className="my-4" />

            {/* AVISO DO SISTEMA */}
            <div className="text-center">
              <span className="badge bg-secondary p-2 small">
                🔒 Dados protegidos pela recepção da UBS
              </span>
              <p className="text-muted mt-2" style={{ fontSize: '11px' }}>
                Para alterar qualquer informação acima, por favor, compareça à sua UBS portando um documento oficial com foto.
              </p>
            </div>
          </form>
        </div>
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
          .from('Documentos_necessarios') 
          .select('id_documento, nome_documento, descrição_documento'); 

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
  <div className="mt-4 text-center">
    <h2>Meus Agendamentos</h2>
    <p>Consulte suas consultas marcadas ou agende a próxima consulta</p>
    
    {/* 1. d-flex: define o modo flex
      2. flex-column: empilha no mobile (padrão)
      3. flex-md-row: muda para linha apenas em telas médias ou maiores (desktop)
      4. align-items-center: centraliza verticalmente no modo coluna
      5. gap-3: espaçamento entre botões
    */}
    <div className="d-flex flex-column flex-md-row align-items-center justify-content-center gap-3">
      
      <Link to="/consultas-marcadas" style={{ textDecoration: 'none' }}>
        <button type="button" className="btn btn-primary">Consultas Marcadas</button>
      </Link>
      
      <Link to="/exames-marcados" style={{ textDecoration: 'none' }}>
        <button type="button" className="btn btn-primary">Exames Marcados</button>
      </Link>
      
      <Link to="/agendarconsultas" style={{ textDecoration: 'none' }}> 
        <button type="button" className="btn btn-primary">Agendar consulta</button>
      </Link>
      
    </div>
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
  
  // ESTADOS: Para controlar os horários ocupados vindos do banco
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

  // 🚀 FUNÇÃO ATUALIZADA: Cria a consulta e envia o ID para a tela de sintomas
 const handleAgendarHorario = async (horario) => {
    const numDia = diaSelecionado.getDate();             
    const numMes = diaSelecionado.getMonth() + 1;         
    const numAno = diaSelecionado.getFullYear();         

    try {
      // 1. Faz o insert forçando o retorno de todas as colunas da linha criada
      const { data, error } = await supabase
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
        ])
        .select('*'); // 🔑 Mudamos para '*' para garantir que o Supabase retorne a linha inteira com o ID

      if (error) {
        console.error('Erro ao salvar no Supabase:', error.message);
        alert(`Não foi possível agendar: ${error.message}`);
        return;
      }

      if (data && data.length > 0) {
        // 🔑 CORREÇÃO AQUI: Mudado de data[0].id para data[0].id_consulta
        const idGerado = data[0].id_consulta; 
        console.log("🎉 Consulta criada com sucesso! ID:", idGerado);
        
        localStorage.setItem('ultimo_id_consulta', idGerado);
        
        navigate('/consulta-agendada', {
          state: { 
            diaExibicao: diaSelecionado.toLocaleDateString('pt-BR'), 
            horario: horario,
            idConsulta: idGerado 
          }
        });
      
      } else {
        // Se por algum motivo o banco inseriu mas o select veio vazio, buscamos o último inserido por segurança
        console.warn("⚠️ O banco não retornou o ID na hora. Redirecionando com verificação alternativa...");
        navigate('/consulta-agendada', {
          state: { 
            diaExibicao: diaSelecionado.toLocaleDateString('pt-BR'), 
            horario: horario
          }
        });
      }
    } catch (err) {
      console.error('Erro crítico no processo de agendamento:', err);
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

const ConsultaAgendada = () => {
  const location = useLocation();
  const diaExibicao = location.state?.diaExibicao || 'X';
  const horario = location.state?.horario || 'Y';
  
  // 🔑 CAPTURA INTELIGENTE DO ID: 
  // Tenta pegar da navegação. Se não achar, pega o que salvamos no localStorage!
  const idConsulta = location.state?.idConsulta || localStorage.getItem('ultimo_id_consulta');

  const [sintomas, setSintomas] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [statusSintomas, setStatusSintomas] = useState('');

  const confirmarAgendamento = () => {
    const mensagem = `Olá! Sua consulta está confirmada!\nData: ${diaExibicao}\nHorário: ${horario}\nDocumentos necessários: RG e Cartão do SUS.`;
    const numero = "5524988299581"; 
    const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;
    window.open(url, '_blank');
  };

  
  const salvarSintomasNoBanco = async () => {
    if (!idConsulta) {
      setStatusSintomas('erro');
      console.error("❌ Erro: O ID da consulta não foi localizado.");
      return;
    }

    setSalvando(true);
    setStatusSintomas('');

    try {
      const { error } = await supabase
        .from('Agendamentos')
        .update({ queixa_sintomas: sintomas })
        .eq('id_consulta', idConsulta); // 🔑 CORREÇÃO AQUI: Mudado de 'id' para 'id_consulta' para bater com o seu banco!

      if (error) {
        console.error("🚨 Detalhes do erro no Supabase:", error.message);
        setStatusSintomas('erro');
      } else {
        setStatusSintomas('sucesso');
        localStorage.removeItem('ultimo_id_consulta'); 
      }
    } catch (err) {
      console.error("Erro crítico ao tentar salvar sintomas:", err);
      setStatusSintomas('erro');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: '600px' }}>
      <div className="p-5 bg-white border rounded shadow-sm text-center">
        <h2 className="text-success mb-3">✔️ Consulta Agendada!</h2>
        <p className="fs-4">
          Sua consulta foi agendada com sucesso para o dia <strong className="text-primary">{diaExibicao}</strong> às <strong className="text-primary">{horario}</strong>.
        </p>
        <p className="text-muted mb-4">Os dados essenciais foram confirmados e salvos no sistema.</p>

        <hr />

        {/* ESPAÇO PARA O PACIENTE RELATAR OS SINTOMAS */}
        <div className="my-4 text-start p-3 bg-light rounded border">
          <label htmlFor="textSintomas" className="form-label fw-bold text-primary">
            🩺 Deseja adiantar o que está sentindo? (Opcional)
          </label>
          <p className="small text-muted mb-2">
            Escreva brevemente seus sintomas (ex: dor de cabeça, febre, tosse). Isso ajuda o médico a se preparar para o seu atendimento.
          </p>
          
          <textarea
            className="form-control mb-2"
            id="textSintomas"
            rows="3"
            placeholder="Digite aqui o que você está sentindo..."
            value={sintomas}
            onChange={(e) => setSintomas(e.target.value)}
            disabled={salvando || statusSintomas === 'sucesso'}
            maxLength={300}
          />
          
          <div className="d-flex justify-content-between align-items-center">
            <span className="small text-muted">{sintomas.length}/300 caracteres</span>
            
            {statusSintomas !== 'sucesso' && (
              <button 
                className="btn btn-primary btn-sm"
                onClick={salvarSintomasNoBanco}
                disabled={salvando || !sintomas.trim()}
              >
                {salvando ? "Salvando..." : "Salvar Sintomas"}
              </button>
            )}
          </div>

          {/* Feedbacks Visuais do Salvamento */}
          {statusSintomas === 'sucesso' && (
            <div className="alert alert-success mt-2 py-2 small text-center mb-0">
              🎉 Sintomas adicionados ao seu prontuário com sucesso!
            </div>
          )}
          {statusSintomas === 'erro' && (
            <div className="alert alert-danger mt-2 py-2 small text-center mb-0">
              ❌ Erro ao salvar sintomas. Tente novamente.
            </div>
          )}
        </div>

        <hr />

        {/* BOTÕES DE AÇÃO */}
        <div className="d-grid gap-2 mt-4">
          <button className="btn btn-success py-2 fw-bold" onClick={confirmarAgendamento}>
            Enviar confirmação via WhatsApp
          </button>
          
          <Link to="/agendamentos" className="btn btn-outline-secondary mt-2">
            Voltar para Agendamentos
          </Link>
        </div>
      </div>
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
// Lembre-se de verificar os caminhos dos seus componentes importados aqui em cima, por exemplo:
// import PaginaLogin from './PaginaLogin';
// import PaginaPrincipal from './PaginaPrincipal';
// ... etc

// Este componente serve para monitorar a rota atual e decidir se mostra o menu
function ConteudoDoApp() {
  const location = useLocation();

  // Define que a barra de navegação NÃO deve aparecer se a rota for exatamente "/" (Tela de Login)
  const escondeNavbar = location.pathname === '/';

  return (
    <>
      {/* A Navbar só será renderizada se NÃO for a página de login */}
      {!escondeNavbar && (
        <nav className="navbar navbar-expand-md navbar-light bg-primary">
          <div className="container-fluid">
            
            {/* Botão Hambúrguer - Só aparece no mobile por causa do navbar-expand-md */}
            <button 
              className="navbar-toggler mx-auto" 
              type="button" 
              data-bs-toggle="collapse" 
              data-bs-target="#meuMenu"
              aria-controls="meuMenu"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon"></span>
            </button>

            <div className="collapse navbar-collapse" id="meuMenu">
              <ul className="navbar-nav mx-auto"> 
                <li className="nav-item">
                  {/* AJUSTE: Link do perfil agora vai para /inicio */}
                  <Link className="nav-link" to="/Meusdados">
                    <img src="img/user.png" className="icon-profile" alt="Perfil" style={{width: '30px'}} />
                  </Link>
                </li>
                {/* AJUSTE: Página principal agora aponta para /inicio */}
                <li className="nav-item"><Link className="nav-link" to="/inicio">Página principal</Link></li>
                <li className="nav-item"><Link className="nav-link" to="/sobre">Dúvidas</Link></li>
                <li className="nav-item"><Link className="nav-link" to="/agendamentos">Agendamentos</Link></li>
                <li className="nav-item"><Link className="nav-link" to="/falar-ubs">Falar com a UBS</Link></li>
                <li className="nav-item"><Link className="nav-link" to="/historico">Meu histórico</Link></li>
                <li className="nav-item"><Link className="nav-link" to="/vacinas">Campanhas de vacinações</Link></li>
                {/* Opcional: Um botão para deslogar e voltar para a tela de login */}
                <li className="nav-item"><Link className="nav-link text-white-50" to="/">Sair</Link></li>
              </ul>
            </div>
          </div>
        </nav>
      )}

      {/* Miolo do site onde os componentes de cada página são injetados */}
      <main className="container-fluid">
        <Routes>
          {/* Rota raiz '/' agora é estritamente a sua nova página de login */}
          <Route path="/" element={<PaginaLogin />} />
          
          {/* A Página Principal mudou para '/inicio' para o Menu não aparecer no Login */}
          <Route path="/inicio" element={<PaginaPrincipal />} />
          
          {/* Suas outras rotas continuam iguaizinhas */}
          <Route path="/Meusdados" element={<Meusdados />} />
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
    </>
  );
}

// O componente App principal apenas envelopa tudo com o BrowserRouter (Router)
function App() {
  return (
    <Router>
      <ConteudoDoApp />
    </Router>
  );
}

export default App;