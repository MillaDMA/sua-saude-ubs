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
import ComponenteNovoExames from './pages/PacExamesMarcados';



// Configuração do Supabase (Ajuste as chaves se necessário)
const supabaseUrl = 'https://oeuvczlnrkigikudxczz.supabase.co';
const supabaseKey = 'sb_publishable_PGBklwDlyNTaArBwTw7HLw_kWM7c-zK'; 
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true, // ISSO DAQUI garante que a sessão fique salva no navegador
    autoRefreshToken: true,
  }
});


const formatarNomeCompleto = (nome) => {
  if (!nome) return '';
  const conectores = ['de', 'da', 'do', 'das', 'dos', 'e'];

  return nome
    .toLowerCase()
    .split(' ')
    .filter(palavra => palavra !== '')
    .map((palavra) => {
      if (conectores.includes(palavra)) return palavra;
      return palavra.charAt(0).toUpperCase() + palavra.slice(1);
    })
    .join(' ');
};

const PaginaSingin = () => {
  const navigate = useNavigate();

  // 1. ESTADOS PARA CAPTURAR OS DADOS DO FORMULÁRIO
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [telefone, setTelefone] = useState('');
  const [dataNasc, setDataNasc] = useState(''); // Estado para a data
  const [password, setPassword] = useState(''); 
  
  // ESTADOS PARA O ENDEREÇO
  const [bairro, setBairro] = useState('');
  const [rua, setRua] = useState('');
  const [numero, setNumero] = useState('');

  const [carregando, setCarregando] = useState(false);

  // 2. FUNÇÃO QUE DISPARA AO SUBMITAR O FORMULÁRIO
 // 2. FUNÇÃO QUE DISPARA AO SUBMITAR O FORMULÁRIO
  const handleCadastro = async (e) => {
    e.preventDefault();

    if (!nome || !cpf || !password || !bairro || !rua || !numero || !telefone) {
      alert("Por favor, preencha todos os campos obrigatórios, incluindo o telefone.");
      return;
    }

    setCarregando(true);

    try {
      // =================================================================
      // TRATAMENTO DOS DADOS: Nome e Telefone
      // =================================================================
      // Formata o nome para deixar as iniciais em Maiúsculo (Title Case)
      const nomeFormatado = formatarNomeCompleto(nome);

      // Remove tudo o que não for número do telefone (parênteses, espaços, traços)
      const apenasNumeros = telefone.replace(/\D/g, '');

      // Validação simples para garantir que tem pelo menos o DDD + número mínimo
      if (apenasNumeros.length < 10) {
        throw new Error("Por favor, insira um telefone válido com DDD.");
      }

      // Captura os 2 primeiros dígitos como DDD e o restante como o número do telefone
      const dddExtraido = apenasNumeros.substring(0, 2);
      const telefoneExtraido = apenasNumeros.substring(2);


      // =================================================================
      // ETAPA 1: Registrar o CPF e Senha na tabela "Usuarios"
      // =================================================================
      const { data: dadosUsuario, error: erroUsuario } = await supabase
        .from('usuarios')
        .insert([
          {
            Documento: cpf,
            password: password,
            perfil: 'paciente'
          }
        ])
        .select('id')
        .single();

      if (erroUsuario) throw new Error(`Erro ao criar credenciais (Usuarios): ${erroUsuario.message}`);
      
      const idUsuarioGerado = dadosUsuario.id;


      // =================================================================
      // ETAPA 2: Salvar os dados detalhados na tabela "Tabela pacientes"
      // =================================================================
      const { error: erroPaciente } = await supabase
        .from('Tabela pacientes')
        .insert([
          {
            "id_usuario": idUsuarioGerado, 
            "Nome completo": nomeFormatado, // Usando o nome transformado aqui!
            "CPF": cpf,
            "Bairro": bairro,
            "Rua": rua,
            "Número da casa": numero,
            "data_nascimento": dataNasc
          }
        ]);

      if (erroPaciente) throw new Error(`Erro ao salvar dados do paciente: ${erroPaciente.message}`);


      // =================================================================
      // ETAPA 3: Salvar o Telefone desmembrado na tabela "telefones"
      // =================================================================
      const { error: erroTelefone } = await supabase
        .from('telefones') 
        .insert([
          {
            "id_usuario": idUsuarioGerado, 
            "ddd": dddExtraido,
            "telefone": telefoneExtraido
          }
        ]);

      if (erroTelefone) throw new Error(`Erro ao salvar telefone do paciente: ${erroTelefone.message}`);


      // =================================================================
      // ETAPA 4: Finalização e Redirecionamento
      // =================================================================
      alert("🎉 Cadastro realizado com sucesso! Você será redirecionado.");
      navigate('/'); 

    } catch (err) {
      console.error("💥 Erro no processo de salvamento:", err);
      
      // Tratamento amigável para o caso de CPF duplicado
      if (err.message && err.message.includes("usuarios_cpf_key")) {
        alert("⚠️ Este CPF já está cadastrado no sistema!");
      } else {
        alert(err.message || "Falha ao realizar o cadastro. Tente novamente.");
      }
    } finally {
      setCarregando(false);
    }
  };
  return (
    <div className="container mt-5" style={{ maxWidth: '600px' }}>
      <div className="card shadow border-0 p-4 bg-white rounded">
        <h3 className="fw-bold text-center text-primary mb-2">🔐 Cadastro de Novo Paciente</h3>
        <p className="text-muted text-center mb-4">Crie sua conta para agendar e visualizar suas consultas.</p>

        <form onSubmit={handleCadastro}>
          {/* CAMPO NOME */}
          <div className="mb-3">
            <label htmlFor="formNome" className="form-label fw-bold text-secondary">
              Nome Completo
            </label>
            <input
              type="text"
              className="form-control"
              id="formNome"
              placeholder="Digite seu nome completo"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              disabled={carregando}
              required
            />
          </div>

          {/* CAMPO CPF */}
          <div className="mb-3">
            <label htmlFor="formCpf" className="form-label fw-bold text-secondary">
              CPF (Será seu documento de acesso)
            </label>
            <input
              type="text"
              className="form-control"
              id="formCpf"
              placeholder="000.000.000-00"
              value={cpf}
              onChange={(e) => setCpf(e.target.value)}
              disabled={carregando}
              required
            />
          </div>

          {/* NOVA LINHA: TELEFONE E NASCIMENTO */}
          <div className="row g-3">
            {/* CAMPO TELEFONE */}
            <div className="col-12 col-md-6 mb-3">
              <label htmlFor="formTelefone" className="form-label fw-bold text-secondary">
                Telefone / Celular
              </label>
              <input
                type="text"
                className="form-control"
                id="formTelefone"
                placeholder="(00) 00000-0000"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                disabled={carregando}
              />
            </div>

            {/* CAMPO DATA DE NASCIMENTO */}
            <div className="col-12 col-md-6 mb-3">
              <label htmlFor="formDataNasc" className="form-label fw-bold text-secondary">
                Data de Nascimento
              </label>
              <input
                type="date"
                className="form-control"
                id="formDataNasc"
                value={dataNasc}
                onChange={(e) => setDataNasc(e.target.value)}
                disabled={carregando}
              />
            </div>
          </div>

          {/* ====== NOVA SEÇÃO RESIDENCIAL ADICIONADA ====== */}
          <div className="border p-3 rounded mb-3 bg-light text-start">
            <p className="fw-bold text-primary mb-2">📍 Endereço Residencial</p>
            
            {/* LINHA PARA RUA E NÚMERO */}
            <div className="row g-2 mb-2">
              <div className="col-8">
                <label htmlFor="formRua" className="form-label small fw-bold text-secondary mb-1">Rua / Logradouro</label>
                <input
                  type="text"
                  className="form-control"
                  id="formRua"
                  placeholder="Ex: Av. Principal"
                  value={rua}
                  onChange={(e) => setRua(e.target.value)}
                  disabled={carregando}
                  required
                />
              </div>
              <div className="col-4">
                <label htmlFor="formNumero" className="form-label small fw-bold text-secondary mb-1">Número</label>
                <input
                  type="text"
                  className="form-control"
                  id="formNumero"
                  placeholder="Ex: 123"
                  value={numero}
                  onChange={(e) => setNumero(e.target.value)}
                  disabled={carregando}
                  required
                />
              </div>
            </div>

            {/* CAMPO BAIRRO */}
            <div className="mb-1">
              <label htmlFor="formBairro" className="form-label small fw-bold text-secondary mb-1">Bairro</label>
              <input
                type="text"
                className="form-control"
                id="formBairro"
                placeholder="Digite o seu bairro"
                value={bairro}
                onChange={(e) => setBairro(e.target.value)}
                disabled={carregando}
                required
              />
            </div>
          </div>
          {/* ============================================== */}

          {/* CAMPO SENHA */}
          <div className="mb-3">
            <label htmlFor="formPassword" className="form-label fw-bold text-secondary">
              Crie uma Senha de Acesso
            </label>
            <input
              type="password"
              className="form-control"
              id="formPassword"
              placeholder="Digite uma senha numérica ou textual"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={carregando}
              required
            />
          </div>

          {/* BOTÕES DE AÇÃO */}
          <div className="d-grid gap-2 mt-4">
            <button 
              type="submit" 
              className="btn btn-primary fw-bold" 
              disabled={carregando}
            >
              {carregando ? "Processando cadastro..." : "Concluir Cadastro"}
            </button>
            <button 
              type="button" 
              className="btn btn-light border text-secondary btn-sm"
              onClick={() => navigate('/')} 
              disabled={carregando}
            >
              Já tenho cadastro (Fazer Login)
            </button>
          </div>

          <hr className="my-4" />

          {/* AVISO DO SISTEMA */}
          <div className="text-center">
            <span className="badge bg-secondary p-2 small">
              🔒 Dados protegidos pela recepção da UBS
            </span>
            <p className="text-muted small mt-2">
              Para alterar qualquer informação cadastrada posteriormente, por favor, compareça à sua UBS portando um documento oficial com foto.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

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
    // 1. O container garante que a tela ganhe margens laterais no mobile e centraliza verticalmente com o vh-100
    <div className="container-fluid d-flex justify-content-center align-items-center vh-100 bg-light px-3">
      
      {/* 2. O sistema de grid ativa o cálculo dinâmico do Bootstrap */}
      <div className="row w-100 justify-content-center">
        
        {/* 🔑 O SEGREDO DA RESPONSIVIDADE AQUI:
            col-12: Em celulares, ocupa o espaço horizontal total disponível.
            No style, usamos maxWidth: '384px' para que em computadores ele NUNCA passe do tamanho elegante que você definiu originalmente.
        */}
        <div className="col-12" style={{ maxWidth: '384px' }}>
          
          {/* O Card agora se molda ao tamanho da coluna automaticamente */}
          <div className="card shadow w-100">
            <div className="card-header bg-primary text-white text-center fw-bold fs-5">
              Sua Saúde - Portal de Acesso
            </div>
            
            <div className="card-body p-4" style={{ boxSizing: 'border-box' }}>
  
  {/* 1. SELETOR DE PERFIL (BOTÕES SUPERIORES BLINDADOS) */}
  <div className="d-flex w-100 mb-4" style={{ display: 'flex !important', width: '100% !important', gap: '8px', boxSizing: 'border-box' }}>
    <button
      type="button"
      className={`btn ${perfil === 'paciente' ? 'btn-primary' : 'btn-outline-primary'}`}
      onClick={() => {
        setPerfil('paciente');
        setDocumentoDigitado('');
        setMensagemErro('');
      }}
      disabled={carregando}
      style={{
        flex: '1',
        width: '50%',
        maxWidth: '50%',
        minWidth: '0',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        fontSize: '14px',
        padding: '8px 4px',
        boxSizing: 'border-box'
      }}
    >
      👤 Paciente
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
      style={{
        flex: '1',
        width: '50%',
        maxWidth: '50%',
        minWidth: '0',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        fontSize: '14px',
        padding: '8px 4px',
        boxSizing: 'border-box'
      }}
    >
     🩺 Médico
    </button>
  </div>

  {/* MENSAGEM DE ERRO */}
  {mensagemErro && (
    <div className="alert alert-danger py-2 text-center small" role="alert">
      {mensagemErro}
    </div>
  )}

  <form onSubmit={handleLogin} style={{ width: '100%' }}>
    {/* 2. CAMPO DINÂMICO PARA O DOCUMENTO */}
    <div className="mb-3 text-center">
      <label htmlFor="inputDocumento" className="form-label fw-bold d-block mb-2">
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
        style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}
      />
    </div>

    {/* 3. CAMPO DA SENHA TOTALMENTE BLINDADO CONTRA CSS EXTERNO */}
    <div className="mb-3" style={{ position: 'relative', width: '100%', boxSizing: 'border-box' }}>
  <label htmlFor="inputPassword" className="form-label fw-bold d-block text-center mb-2">
    Senha
  </label>
  
  {/* Container relativo que segura o input e o ícone juntos */}
  <div style={{ position: 'relative', width: '100%' }}>
    <input 
      type={mostrarSenha ? "text" : "password"} 
      className="form-control" 
      id="inputPassword" 
      placeholder="Digite sua senha" 
      value={senha}
      onChange={(e) => setSenha(e.target.value)}
      required 
      disabled={carregando}
      style={{ 
        width: '100%',
        paddingRight: '40px', /* Abre espaço na direita para o texto não ficar embaixo do olho */
        boxSizing: 'border-box',
        height: '42px'
      }}
    />
    
    {/* Botão invisível posicionado cirurgicamente no canto direito interno */}
    <button 
      className="btn" 
      type="button"
      onClick={() => setMostrarSenha(!mostrarSenha)} 
      disabled={carregando}
      title={mostrarSenha ? "Esconder senha" : "Mostrar senha"}
      style={{ 
        position: 'absolute',
        right: '10px',
        top: '50%',
        transform: 'translateY(-50%)',
        border: 'none',
        background: 'none',
        padding: '0',
        margin: '0',
        width: '24px',  /* Tamanho reduzido e controlado do botão */
        height: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 5,
        fontSize: '16px', /* Controla o tamanho do emoji do olho */
        boxShadow: 'none'
      }}
    >
      {mostrarSenha ? "🙈" : "👁️"}
    </button>
  </div>
</div>

    {/* BOTÃO DE ENTRAR */}
    <div className="mb-3 mt-4" style={{ width: '100%' }}>
      <button 
        type="submit" 
        className="btn btn-primary w-100" 
        disabled={carregando}
        style={{ width: '100%', display: 'block', boxSizing: 'border-box' }}
      >
        {carregando ? 'Autenticando...' : `Entrar como ${perfil === 'paciente' ? 'Paciente' : 'Médico'}`}
      </button>
    </div>
  </form>

  <hr />

  <div className="text-center" style={{ width: '100%' }}>
  <p className="small text-muted mb-2">Novo por aqui? Clique no botão abaixo para se cadastrar</p>
  <button 
    type="button" 
    className="btn btn-outline-secondary btn-sm w-100"
    onClick={() => navigate('/cadastro')} // Agora ele redireciona em vez de abrir o alert
    disabled={carregando}
    style={{ width: '100%', boxSizing: 'border-box' }}
  >
    Criar uma Conta
  </button>
</div>
</div>
            
          </div>

        </div>
      </div>
    </div>
  );
};

// Informações do Supabase



const PaginaPrincipal = () => {
  const [nomePaciente, setNomePaciente] = useState('');
  const [urlMaps, setUrlMaps] = useState('');
  const [carregando, setCarregando] = useState(true); // Controla o carregamento inicial do Supabase
  const [buscandoLocalizacao, setBuscandoLocalizacao] = useState(false); // Controla o clique do botão de GPS
  const [erroLocalizacao, setErroLocalizacao] = useState(false);

  useEffect(() => {
    const inicializarPagina = async () => {
      setCarregando(true);
      
      try {
        // --- 1. BUSCA O ID E O PERFIL DO USUÁRIO VIA LOCALSTORAGE ---
        const idUsuarioLogado = localStorage.getItem('id_usuario_logado');
        const perfilUsuario = localStorage.getItem('perfil_usuario'); 
        
        console.log(`🔍 [TESTE LOG] Usuário ID: ${idUsuarioLogado} | Perfil: ${perfilUsuario}`);

        if (!idUsuarioLogado || !perfilUsuario) {
          console.warn("⚠️ [TESTE LOG] Dados de sessão incompletos no localStorage. Faça login novamente.");
          setCarregando(false);
          return;
        }

        // --- 2. DEFINIÇÃO DINÂMICA DA TABELA E DA COLUNA ---
        const nomeTabela = perfilUsuario === 'medico' ? 'Tabela_medicos' : 'Tabela pacientes';
        const colunaFiltro = 'id_usuario'; 

        // --- 3. BUSCA INTELIGENTE NO SUPABASE ---
        const { data: perfilEncontrado, error: dbError } = await supabase
          .from(nomeTabela)   
          .select('*')
          .eq(colunaFiltro, idUsuarioLogado)
          .maybeSingle(); 

        if (dbError) {
          console.error(`🚨 [TESTE LOG] Erro ao buscar na tabela [${nomeTabela}]:`, dbError.message);
          setCarregando(false);
          return;
        }

        // --- 4. MAPEAMENTO E TRATAMENTO DO RESULTADO ---
        if (perfilEncontrado) {
          const nomeEncontrado = 
            perfilEncontrado['Nome completo'] || 
            perfilEncontrado['Nome Completo'] || 
            perfilEncontrado.Nome_completo ||
            perfilEncontrado.nome; 
          
          console.log(`🎉 [TESTE LOG] Sucesso! Dados carregados da [${nomeTabela}]:`, nomeEncontrado);
          setNomePaciente(nomeEncontrado); 
        } else {
          console.warn(`⚠️ [TESTE LOG] Nenhum vínculo encontrado na tabela [${nomeTabela}] para o ID de usuário: ${idUsuarioLogado}`);
        }

      } catch (err) {
        console.error("💥 [TESTE LOG] Erro crítico no bloco JavaScript:", err);
      } finally {
        setCarregando(false);
      }
    };

    inicializarPagina();
  }, []);

  // --- NOVA FUNÇÃO: BUSCA UBS MAIS PRÓXIMA ---
  const buscarUbsMaisProxima = () => {
    setBuscandoLocalizacao(true);
    setErroLocalizacao(false);

    if (!navigator.geolocation) {
      // Se o navegador não der suporte, abre o mapa com uma busca genérica por UBS
      const urlGenerica = 'https://www.google.com/maps/search/UBS+mais+proxima/';
      setUrlMaps(urlGenerica);
      setBuscandoLocalizacao(false);
      window.open(urlGenerica, '_blank', 'noopener,noreferrer');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        // Cria a URL focada nas coordenadas exatas buscando UBS ao redor
        const urlComCoordenadas = `https://www.google.com/maps/search/UBS/@${latitude},${longitude},14z`;
        
        setUrlMaps(urlComCoordenadas);
        setBuscandoLocalizacao(false);
        
        // Abre imediatamente a aba com as UBSs próximas
        window.open(urlComCoordenadas, '_blank', 'noopener,noreferrer');
      },
      (error) => {
        console.error("Erro ao obter geolocalização:", error);
        setErroLocalizacao(true);
        setBuscandoLocalizacao(false);
        
        // Se der erro (ex: usuário negou o GPS), abre uma busca geral por proximidade estimada do IP
        const urlAlternativa = 'https://www.google.com/maps/search/UBS+mais+proxima/';
        window.open(urlAlternativa, '_blank', 'noopener,noreferrer');
      },
      {
        enableHighAccuracy: true,
        timeout: 8000, // Espera até 8 segundos pela resposta do GPS
        maximumAge: 0
      }
    );
  };

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
      
      {/* SEÇÃO DO BOTÃO DE BUSCA DA UBS MODIFICADA */}
      <div className="d-grid gap-2 button-search mt-4">
        <p className="text-center">Precisa de ajuda?</p>
        
        {buscandoLocalizacao ? (
          <button className="btn btn-primary" type="button" disabled>
            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            Obtendo localização...
          </button>
        ) : erroLocalizacao ? (
          <button 
            type="button" 
            onClick={buscarUbsMaisProxima}
            className="btn btn-warning d-flex align-items-center justify-content-center"
          >
            Erro ao obter GPS. Tentar novamente?
          </button>
        ) : (
          <button 
            type="button" 
            onClick={buscarUbsMaisProxima}
            className="btn btn-primary d-flex align-items-center justify-content-center"
          >
            Postinho mais próximo
          </button>
        )}
      </div>
    </div>
  );
};


const Meusdados = () => {
  // Estados para armazenar os campos do formulário
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState(''); // Exibirá o CPF para pacientes ou o CRM para médicos
  const [telefone, setTelefone] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [perfil, setPerfil] = useState(''); // Estado para sabermos o perfil atual no JSX

  useEffect(() => {
    const buscarDadosUsuario = async () => {
      try {
        const idUsuarioLogado = localStorage.getItem('id_usuario_logado');
        const perfilUsuario = localStorage.getItem('perfil_usuario'); // Ex: 'medico' ou 'paciente'
        setPerfil(perfilUsuario || 'paciente');
        
        console.log("🔍 [FORM LOG] ID do localStorage:", idUsuarioLogado);
        console.log("👤 [FORM LOG] Perfil do usuário:", perfilUsuario);
        
        if (!idUsuarioLogado) {
          setErro('Nenhum usuário logado encontrado. Faça o login novamente.');
          setCarregando(false);
          return;
        }

        // 1. Define qual tabela principal vai consultar baseado no perfil do usuário
        const tabelaAlvo = perfilUsuario === 'medico' ? 'Tabela_medicos' : 'Tabela pacientes';
        console.log(`📂 [FORM LOG] Buscando dados principais na tabela: ${tabelaAlvo}`);

        const { data: todosRegistros, error: dbError } = await supabase
          .from(tabelaAlvo)
          .select('*');

        if (dbError) {
          throw dbError;
        }

        console.log(`📊 [FORM LOG] Dados brutos vindos da ${tabelaAlvo}:`, todosRegistros);

        if (todosRegistros && todosRegistros.length > 0) {
          // 2. Procura o usuário correspondente pelo ID logado
          const registroEncontrado = todosRegistros.find((r) => {
            const idBancoBruto = r['id_usuario'] || r['id_usuário'] || r.id_usuario;
            return String(idBancoBruto).trim().toLowerCase() === String(idUsuarioLogado).trim().toLowerCase();
          });

          if (registroEncontrado) {
            console.log("🎉 [FORM LOG] Registro principal localizado:", registroEncontrado);

            // --- BUSCA SECUNDÁRIA: TABELA DE TELEFONE ---
            let telefoneFormatado = 'Não encontrado';
            try {
              const { data: dadosTelefone, error: telError } = await supabase
                .from('telefones') // Nome idêntico ao do seu banco do Supabase
                .select('*');

              if (!telError && dadosTelefone) {
                const telEncontrado = dadosTelefone.find(t => {
                  const idTelBanco = t['id_usuario'] || t['id_usuário'] || t.id_usuario;
                  return String(idTelBanco).trim().toLowerCase() === String(idUsuarioLogado).trim().toLowerCase();
                });

                if (telEncontrado) {telefone
                  const ddd = telEncontrado['ddd'] || '';
                  const num = telEncontrado['telefone'] || '';
                  telefoneFormatado = ddd ? `(${ddd}) ${num}` : num;
                }
              }
            } catch (e) {
              console.warn("⚠️ [FORM LOG] Erro ao buscar telefone na tabela secundária:", e);
            }
            // --------------------------------------------

            // 3. Mapeamento de dados de acordo com o perfil
            if (perfilUsuario === 'medico') {
              setNome(registroEncontrado['Nome completo'] || '');
              setCpf(registroEncontrado['CRM'] || 'CRM não informado');
              setTelefone(telefoneFormatado);
              setDataNascimento(''); 
            } else {
              setNome(registroEncontrado['Nome completo'] || '');
              setCpf(registroEncontrado['CPF'] || registroEncontrado['cpf'] || registroEncontrado['Cpf'] || 'Não encontrado');
              
              const telOriginalPaciente = registroEncontrado['Telefone'] || registroEncontrado['telefone'] || registroEncontrado['Celular'];
              setTelefone(telOriginalPaciente || telefoneFormatado);
              
              setDataNascimento(registroEncontrado['Data de Nascimento'] || registroEncontrado['data_nascimento'] || registroEncontrado['Nascimento'] || '');
            }
            
          } else {
            setErro(`Seu perfil de ${perfilUsuario === 'medico' ? 'médico' : 'paciente'} não foi localizado no banco de dados.`);
          }
        } else {
          setErro('Nenhum registro encontrado no servidor.');
        }
      } catch (err) {
        console.error('Erro ao carregar dados do formulário:', err);
        setErro('Erro crítico ao conectar com o banco de dados.');
      } finally {
        setCarregando(false);
      }
    };

    buscarDadosUsuario();
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

            {/* CAMPO CPF / CRM (Muda o rótulo dinamicamente) */}
            <div className="mb-3">
              <label htmlFor="formCpf" className="form-label fw-bold text-secondary">
                {perfil === 'medico' ? 'CRM' : 'CPF'}
              </label>
              <input
                type="text"
                className="form-control bg-light"
                id="formCpf"
                value={cpf}
                readOnly
              />
            </div>

            <div className="row g-3">
              {/* CAMPO TELEFONE */}
              <div className={`col-12 ${perfil === 'medico' ? 'col-md-12' : 'col-md-6'} mb-3`}>
                <label htmlFor="formTelefone" className="form-label fw-bold text-secondary">
                  Telefone / Celular
                </label>
                <input
                  type="text"
                  className="form-control bg-light"
                  id="formTelefone"
                  value={telefone || "Não encontrado"}
                  readOnly
                />
              </div>

              {/* CAMPO DATA DE NASCIMENTO (Renderiza apenas se for Paciente) */}
              {perfil !== 'medico' && (
                <div className="col-12 col-md-6 mb-3">
                  <label htmlFor="formDataNasc" className="form-label fw-bold text-secondary">
                    Data de Nascimento
                  </label>
                  <input
                    type="text"
                    className="form-control bg-light"
                    id="formDataNasc"
                    value={dataNascimento ? dataNascimento.split('-').reverse().join('/') : ""}
                    readOnly
                  />
                </div>
              )}
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
   <div className="mt-5">
  {/* Título da Seção mais refinado */}
  <h2 className="fw-bold text-secondary mb-1">Dúvidas Frequentes</h2>
  <p className="text-muted mb-4">Informações sobre o projeto, utilidades do app e documentos necessários.</p>

  {/* Card Informativo Blindado */}
  <div className="card border-0 border-start border-primary border-4 shadow-sm bg-white p-4">
    <div className="d-flex align-items-center mb-3">
      {/* Ícone de documento para chamar a atenção visual */}
      <span className="fs-3 me-2">📋</span>
      <h5 className="card-title fw-bold text-primary mb-0">
        Documentos necessários para consultas
      </h5>
    </div>
    
    <div className="card-text text-secondary lh-lg">
      <p className="mb-2">
        Para consultas regulares, é obrigatório apresentar um <strong>documento de identificação com foto</strong> e o <strong>cartão do SUS</strong>.
      </p>
      <div className="alert alert-warning d-flex align-items-center gap-2 py-2 px-3 mt-3 mb-0 small">
        <span>💡</span>
        <span><strong>Atenção especialistas:</strong> Se a sua consulta for com algum especialista, não se esqueça de trazer também a sua <strong>guia de encaminhamento</strong>.</span>
      </div>
    </div>
  </div>
</div>
      
  );
};

const Agendamentos = () => (
  <div className="mt-5 text-center">
  {/* Título da Seção padronizado */}
  <h2 className="fw-bold text-secondary mb-1">Meus Agendamentos</h2>
  <p className="text-muted mb-4">Consulte seus compromissos marcados ou realize um novo agendamento na rede.</p>
  
  {/* Container responsivo: 1 coluna no mobile, 3 colunas em telas médias/grandes */}
  <div className="row g-3 justify-content-center">
    
    {/* CARD 1: Consultas Marcadas */}
    <div className="col-12 col-md-4">
      <Link to="/consultas-marcadas" style={{ textDecoration: 'none' }}>
        <button 
          type="button" 
          className="btn btn-outline-primary bg-white shadow-sm w-100 p-4 border-2 h-100 d-flex flex-column align-items-center justify-content-center gap-2 transition-card"
        >
          <span className="fs-1">🗓️</span>
          <span className="fw-bold fs-5">Consultas Marcadas</span>
          <small className="text-muted text-wrap d-block">Veja datas, horários e médicos dos seus agendamentos.</small>
        </button>
      </Link>
    </div>

    {/* CARD 2: Exames Marcados */}
    <div className="col-12 col-md-4">
      <Link to="/exames-marcados" style={{ textDecoration: 'none' }}>
        <button 
          type="button" 
          className="btn btn-outline-primary bg-white shadow-sm w-100 p-4 border-2 h-100 d-flex flex-column align-items-center justify-content-center gap-2 transition-card"
        >
          <span className="fs-1">🧪</span>
          <span className="fw-bold fs-5">Exames Marcados</span>
          <small className="text-muted text-wrap d-block">Consulte o local e o preparo dos seus exames agendados.</small>
        </button>
      </Link>
    </div>

    {/* CARD 3: Novo Agendamento (Destacado em Azul Sólido) */}
    <div className="col-12 col-md-4">
      <Link to="/agendarconsultas" style={{ textDecoration: 'none' }}>
        <button 
          type="button" 
          className="btn btn-primary shadow-sm w-100 p-4 h-100 d-flex flex-column align-items-center justify-content-center gap-2"
        >
          <span className="fs-1">➕</span>
          <span className="fw-bold fs-5 text-white">Agendar Consulta</span>
          <small className="text-white text-opacity-75 text-wrap d-block">Marque um novo atendimento médico ou especialista.</small>
        </button>
      </Link>
    </div>

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


const encontrarMedicoParaAgendamento = async (numDiaSemana, horario, numDia, numMes, numAno) => {
  try {
    // 1. Padronização segura do horário
    const horarioFormatado = horario.length === 5 ? `${horario}:00` : horario;
    
    console.log("--- INÍCIO DA BUSCA ---");
    console.log("Parâmetros:", { numDiaSemana, horarioFormatado, numDia, numMes, numAno });

    // 2. BUSCA DE ESCALA (Com tratamento para possível erro de formato)
    const { data: escalados, error: erroEscala } = await supabase
      .from('Tabela_escala_equipe_ubs')
      .select('id_medico, hora_inicio, hora_fim') // Selecionamos horas para depuração
      .eq('dia_semana', numDiaSemana)
      .lte('hora_inicio', horarioFormatado)
      .gte('hora_fim', horarioFormatado);

    if (erroEscala) throw erroEscala;
    
    console.log("Médicos encontrados na escala:", escalados);
    
    // Se não encontrou, tentamos diagnosticar o motivo
    if (!escalados || escalados.length === 0) {
      console.warn("Nenhum médico encontrado. Verifique se o dia_semana no banco é o mesmo que:", numDiaSemana);
      return null;
    }

    const idsEscalados = escalados.map(e => e.id_medico);

    // 3. CONSULTA DE AGENDAMENTOS (Usando .select('id_medico') otimizado)
    const { data: jaMarcados, error: erroAgendamentos } = await supabase
      .from('Agendamentos')
      .select('id_medico')
      .in('id_medico', idsEscalados)
      .eq('dia', numDia)
      .eq('mes', numMes)
      .eq('ano', numAno)
      .eq('hora', horario);

    if (erroAgendamentos) throw erroAgendamentos;

    // 4. LÓGICA DE RODÍZIO (Balanceamento de carga)
    const ocupacao = idsEscalados.map(id => {
      const total = jaMarcados 
        ? jaMarcados.filter(consulta => consulta.id_medico === id).length 
        : 0;
      return { id_medico: id, total };
    });

    // Ordena pelo total de agendamentos (menor para maior)
    ocupacao.sort((a, b) => a.total - b.total);
    
    const medicoEscolhido = ocupacao[0].id_medico;
    console.log("Médico selecionado para o rodízio:", medicoEscolhido);
    
    return medicoEscolhido;

  } catch (err) {
    console.error("Erro crítico no processo de rodízio:", err);
    return null;
  }
};

  // --- 2. Agora o handleAgendarHorario consegue chamar a função acima ---
  const handleAgendarHorario = async (horario) => {
    const numDia = diaSelecionado.getDate();
    const numMes = diaSelecionado.getMonth() + 1;
    const numAno = diaSelecionado.getFullYear();
    const diaSemana = diaSelecionado.getDay();

    try {
  // 1. Verificação de sessão
  const idUsuarioLogado = localStorage.getItem('id_usuario_logado');
  if (!idUsuarioLogado) {
    alert("Sua sessão expirou. Faça login novamente.");
    return;
  }

  // 2. Busca do ID do paciente no banco
  const { data: dadosPaciente, error: erroPaciente } = await supabase
    .from('Tabela pacientes')
    .select('"Id paciente"')
    .eq('id_usuario', idUsuarioLogado)
    .maybeSingle();

  if (erroPaciente || !dadosPaciente) {
    alert("Não foi possível identificar seu perfil de paciente.");
    return;
  }

  // CORREÇÃO: Extração segura do ID do paciente
  const idPacienteReal = dadosPaciente["Id paciente"];

  // 3. Busca do médico via rodízio automático
  const idMedicoEscolhido = await encontrarMedicoParaAgendamento(diaSemana, horario, numDia, numMes, numAno);

  if (!idMedicoEscolhido) {
    alert("Não há médicos escalados disponíveis para este horário.");
    return;
  }

  // 4. Inserção do novo agendamento
  const { data, error } = await supabase
    .from('Agendamentos')
    .insert([
      { 
        id_paciente: idPacienteReal, 
        id_medico: idMedicoEscolhido,
        hora: horario,       
        dia: numDia,        
        mes: numMes,        
        ano: numAno,        
        status: 'agendado'   
      }
    ])
    .select('*'); 

  if (error) throw error;

  // 5. Finalização e redirecionamento
  const idGerado = data[0]?.id_consulta;
  if (idGerado) {
    localStorage.setItem('ultimo_id_consulta', idGerado);
  }
  
  navigate('/consulta-agendada', {
    state: { 
      diaExibicao: diaSelecionado.toLocaleDateString('pt-BR'), 
      horario: horario,
      idConsulta: idGerado 
    }
  });

} catch (err) {
  console.error('Erro crítico no processo de agendamento:', err);
  alert('Erro ao tentar agendar: ' + (err.message || "Tente novamente mais tarde."));
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

  // 1. Busca os agendamentos ativos vinculados ao paciente logado
  const carregarConsultasDoBanco = async () => {
    setCarregando(true);
    try {
      // Pega o UUID gerado no login (o mesmo usado na tela de agendamento)
      const idUsuarioLogado = localStorage.getItem('id_usuario_logado'); 

      if (!idUsuarioLogado) {
        console.warn("Nenhum usuário logado encontrado no localStorage.");
        return;
      }

      // Busca o ID numérico real na 'Tabela pacientes' correspondente ao UUID
      const { data: dadosPaciente, error: erroPaciente } = await supabase
        .from('Tabela pacientes')
        .select('"Id paciente"') // Aspas duplas devido ao espaço no nome da coluna
        .eq('id_usuario', idUsuarioLogado)
        .maybeSingle();

      if (erroPaciente || !dadosPaciente) {
        console.error("❌ Erro ao buscar id do paciente para listagem:", erroPaciente?.message);
        return;
      }

      const idPacienteReal = dadosPaciente["Id paciente"];
      console.log(`📋 Carregando consultas para o Paciente ID numérico: ${idPacienteReal}`);

      // Faz a busca no Supabase filtrando pelo ID numérico real encontrado
      const { data, error } = await supabase
        .from('Agendamentos') 
        .select('*') 
        .eq('id_paciente', idPacienteReal)
        .eq('status', 'agendado'); 

      if (error) {
        console.error("Erro ao buscar consultas marcadas:", error.message);
      } else if (data) {
        // Ordena por horário/data se necessário
        setMinhasConsultas(data); 
      }
    } catch (err) {
      console.error("Erro crítico ao carregar histórico:", err);
    } finally {
      setCarregando(false);
    }
  };

  // 2. Função para o paciente cancelar o agendamento diretamente na sua tela
  const handleCancelarConsulta = async (idConsulta) => {
    const confirmar = window.confirm("Tem certeza que deseja cancelar esta consulta?");
    if (!confirmar) return;

    try {
      const { error } = await supabase
        .from('Agendamentos')
        .update({ status: 'cancelado' })
        .eq('id_consulta', idConsulta);

      if (error) throw new Error(error.message);

      alert("❌ Consulta cancelada com sucesso!");
      
      // Atualiza a lista na tela para fazer o agendamento sumir
      carregarConsultasDoBanco(); 
    } catch (err) {
      console.error("Erro ao cancelar consulta:", err);
      alert("Falha ao cancelar a consulta.");
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
        /* Lista os agendamentos encontrados em formato de cards */
        <div className="list-group">
          {minhasConsultas.map((consulta) => (
            <div 
              key={consulta.id_consulta || `${consulta.dia}-${consulta.hora}`} 
              className="list-group-item list-group-item-action d-flex justify-content-between align-items-center mb-2 shadow-sm rounded border p-3"
            >
              <div>
                <h5 className="mb-1 text-success">✔️ Consulta Confirmada</h5>
                <p className="mb-1 text-muted">
                  Data: <strong>{String(consulta.dia).padStart(2, '0')}/{String(consulta.mes).padStart(2, '0')}/{consulta.ano}</strong>
                </p>
                <small>Horário: <strong className="text-primary">{consulta.hora}</strong></small>
              </div>
              
              {/* Lado Direito: Status e Ação de Cancelamento */}
              <div className="d-flex flex-column align-items-end gap-2">
                <span className="badge bg-primary rounded-pill p-2">Status: {consulta.status}</span>
                <button 
                  type="button" 
                  className="btn btn-outline-danger btn-sm fw-bold mt-1"
                  onClick={() => handleCancelarConsulta(consulta.id_consulta)}
                >
                  ❌ Cancelar Consulta
                </button>
              </div>
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
        .eq('id_consulta', idConsulta); 
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


     <div className="mt-5">
  {/* Título da Seção mais refinado */}
  <h2 className="fw-bold text-secondary mb-1">Falar com a UBS</h2>
  <p className="text-muted mb-4">Informações sobre o projeto, utilidades do app e documentos necessários.</p>

  {/* Card Informativo Blindado */}
  <div className="card border-0 border-start border-primary border-4 shadow-sm bg-white p-4">
    <div className="d-flex align-items-center mb-3">
      {/* Ícone de documento para chamar a atenção visual */}
      <span className="fs-3 me-2">📞</span>
      <h5 className="card-title fw-bold text-primary mb-0">
        Entre em contato conosco
      </h5>
    </div>
    <div className="card-text text-secondary lh-lg">
      <p className="mb-2"></p>
        <p>Canais de atendimento e contato direto com a sua unidade.</p>
    <p>Telefone: 2233-4466</p>
    <p>Se preferir nos envie uma mensagem</p>
    <a href='https://wa.me/5524988299581' target="_blank" rel="noopener noreferrer"><p>24988775544</p></a> 
      <div className="alert alert-warning d-flex align-items-center gap-2 py-2 px-3 mt-3 mb-0 small">
        <span>💡</span>
        <span><strong><p>Horário de 8 da manhã até 5 da tarde de segunda a sexta</p></strong>.</span>
      </div>
    </div>
  </div>
</div>
  </div>
);

const Historico = () => (
  <div className="mt-4">
  {/* Título da Seção alinhado com o padrão anterior */}
  <h2 className="fw-bold text-secondary mb-1">Meu Histórico</h2>
  <p className="text-muted mb-4">Histórico médico, receitas e atendimentos anteriores. Via API pelo SUS digital.</p>

  {/* Card de Histórico no Mesmo Padrão Visual (Identidade Verde para Prontuário) */}
  <div className="card border-0 border-start border-success border-4 shadow-sm bg-white p-4">
    <div className="d-flex align-items-center mb-3">
      {/* Ícone de prontuário integrado */}
      <span className="fs-3 me-2">🏥</span>
      <h5 className="card-title fw-bold text-success mb-0">
        Prontuário Integrado SUS Digital
      </h5>
    </div>
    
    <div className="card-text text-secondary lh-lg">
      <p className="mb-2">
        Seus dados de consultas recentes, exames realizados e receitas emitidas na rede pública são sincronizados automaticamente com a base nacional do <strong>SUS Digital</strong>.
      </p>
      
      {/* Aviso de integração em tempo real */}
      <div className="alert alert-success d-flex align-items-center gap-2 py-2 px-3 mt-3 mb-0 small border-0 bg-success bg-opacity-10 text-success-emphasis">
        <span className="spinner-grow spinner-grow-sm text-success" role="status" aria-hidden="true"></span>
        <span>Conexão ativa: Exibindo as últimas atualizações vinculadas ao seu <strong>CPF</strong>.</span>
      </div>
    </div>
  </div>
</div>
);

const Vacinas = () => (
  <div className="mt-4">
  {/* Título da Seção no padrão dos anteriores */}
  <h2 className="fw-bold text-secondary mb-1">Campanhas de Vacinação</h2>
  <p className="text-muted mb-4">Confira o calendário de vacinas e campanhas atuais. De acordo com o SUS.</p>

  {/* Accordion com sombra suave para combinar com os cards */}
  <div className="accordion shadow-sm" id="accordionVacinas">
    <div className="accordion-item border-light">
      <h2 className="accordion-header" id="panelsStayOpen-headingOne">
        <button 
          className="accordion-button fw-bold text-primary bg-white" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#panelsStayOpen-collapseOne" 
          aria-expanded="true" 
          aria-controls="panelsStayOpen-collapseOne"
        >
          💉 Campanha Nacional contra a Influenza (Gripe)
        </button>
      </h2>
      
      <div id="panelsStayOpen-collapseOne" className="accordion-collapse collapse show" aria-labelledby="panelsStayOpen-headingOne">
        <div className="accordion-body text-secondary bg-white lh-lg">
          
          {/* Item 1: Período */}
          <div className="mb-3">
            <span className="badge bg-primary bg-opacity-10 text-primary mb-1 px-2 py-1">
              📅 Período Estimado
            </span>
            <p className="mb-0 ps-1 text-dark">Geralmente de Março a Junho (com início e prorrogações variando por região).</p>
          </div>

          {/* Item 2: Público-Alvo */}
          <div className="mb-3">
            <span className="badge bg-success bg-opacity-10 text-success mb-1 px-2 py-1">
              👥 Público-Alvo Principal
            </span>
            <p className="mb-0 ps-1 text-dark">Grupos prioritários (idosos, trabalhadores da saúde, gestantes, crianças, etc.), estendida posteriormente à população geral conforme a disponibilidade de doses.</p>
          </div>

          {/* Item 3: Observações */}
          <div>
            <span className="badge bg-secondary bg-opacity-10 text-secondary mb-1 px-2 py-1">
              💡 Observações
            </span>
            <p className="mb-0 ps-1 text-muted small">Proteção anual atualizada contra as cepas mais comuns e recentes do vírus.</p>
          </div>

        </div>
      </div>
    </div>
  </div>
</div>
);

function ConteudoDoApp() {
  const location = useLocation();

  // Define que a barra de navegação NÃO deve aparecer se a rota for exatamente "/" (Tela de Login)
  const escondeNavbar = location.pathname === '/';

  return (
    <>
      {/* A Navbar só será renderizada se NÃO for a página de login */}
      {!escondeNavbar && (
        <nav className="navbar navbar-expand-lg navbar-dark shadow-sm" style={{ backgroundColor: '#0B2545' }}>
  <div className="container-fluid">
    
    {/* Botão Hambúrguer para Mobile ajustado para o modo dark */}
    <button 
      className="navbar-toggler" 
      type="button" 
      data-bs-toggle="collapse" 
      data-bs-target="#meuMenu" 
      aria-controls="meuMenu" 
      aria-expanded="false" 
      aria-label="Alternar navegação"
    >
      <span className="navbar-toggler-icon"></span>
    </button>

    <div className="collapse navbar-collapse" id="meuMenu">
  
      <ul className="navbar-nav mx-auto align-items-center gap-2"> 
        
        {/* ÍCONE DE PERFIL */}
        <li className="nav-item">
          <Link className="nav-link p-1" to="/Meusdados" title="Meus Dados">
            <img 
              src="img/user.png" 
              className="icon-profile" 
              alt="Perfil" 
              style={{ width: '30px', height: '30px', filter: 'brightness(0) invert(1)' }} 
            />
          </Link>
        </li>
        
        {/* LINKS DO MENU (Todos herdando texto branco de alta visibilidade) */}
        <li className="nav-item">
          <Link className="nav-link text-white fw-medium" to="/inicio">Página principal</Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link text-white fw-medium" to="/sobre">Dúvidas</Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link text-white fw-medium" to="/agendamentos">Agendamentos</Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link text-white fw-medium" to="/falar-ubs">Falar com a UBS</Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link text-white fw-medium" to="/historico">Meu histórico</Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link text-white fw-medium" to="/vacinas">Campanhas de vacinações</Link>
        </li>
        <li className="nav-item ms-md-3">
          <Link 
            className="nav-link btn btn-danger btn-sm text-white px-3 py-1 mt-2 mt-md-0 fw-bold" 
            to="/"
            style={{ minWidth: '70px' }}
          >
            Sair
          </Link>
        </li>

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
          <Route path="/cadastro" element={<PaginaSingin />} />
          
          {/* A Página Principal mudou para '/inicio' para o Menu não aparecer no Login */}
          <Route path="/inicio" element={<PaginaPrincipal />} />
          
          {/* Suas outras rotas continuam iguaizinhas */}
          <Route path="/Meusdados" element={<Meusdados />} />
          <Route path="/sobre" element={<Sobre />} />

              <Route 
      path="/agendamentos"
      element={
        localStorage.getItem('perfil_usuario') === 'medico' 
          ? <AgendaDoMedico/> 
          : <Agendamentos />
      } 
    />
          <Route path="/falar-ubs" element={<FalarUBS />} />
          <Route path="/vacinas" element={<Vacinas/>} />
          <Route path="/historico" element={
              localStorage.getItem('perfil_usuario') === 'medico' 
                ? <HistoricoDeAtendimentos />       // Médico consultas realizadas
                : <Historico/>    // Paciente vê seu histórico do SUS
            }/>
          <Route 
            path="/agendarconsultas"
            element={
              localStorage.getItem('perfil_usuario') === 'medico' 
                ? <Treinamentos />       // Médico vê Treinamentos
                : <Agendarconsultas />    // Paciente vê Agendar Consultas
            }
          />
          <Route path="/consulta-agendada" element={<ConsultaAgendada />} />
          <Route 
      path="/consultas-marcadas" 
      element={
        localStorage.getItem('perfil_usuario') === 'medico' 
          ? <ConsultasMarcadasPorMedico /> 
          : <ConsultasMarcadas />
      } 
    />
    <Route path="/exames-marcados" element={localStorage.getItem('perfil_usuario') === 'medico' 
          ? <ServicoInterno /> 
          : < ComponenteNovoExames  />} />
    
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