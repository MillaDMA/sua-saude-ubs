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
import { createClient } from '@supabase/supabase-js';
import ServicoInterno from './DocSideServicoInterno';
const AgendaDoMedico = () => (
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
          <small className="text-muted text-wrap d-block">Veja datas, horários das suas consultas </small>
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
          <span className="fs-1">💻</span>
          <span className="fw-bold fs-5">Serviço interno</span>
          <small className="text-muted text-wrap d-block">Consulte reuniões e outros compromissos senão atendimento.</small>
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
          <span className="fs-1">🧠</span>
          <span className="fw-bold fs-5 text-white">Treinamentos</span>
          <small className="text-white text-opacity-75 text-wrap d-block">Novas diretivas e  alinhamentos administrativos</small>
        </button>
      </Link>
    </div>

  </div>
</div>
);

export default AgendaDoMedico;