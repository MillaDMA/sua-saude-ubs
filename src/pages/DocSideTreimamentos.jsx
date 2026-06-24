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

const Treinamentos = () => (
  <div className="mt-4">
  {/* Título da Seção alinhado com o padrão anterior */}
  <h2 className="fw-bold text-secondary mb-1">Treinamentos</h2>
  <p className="text-muted mb-4">Aqui ficam as informações sobre palestras e novas diretrizes .</p>

  {/* Card de Histórico no Mesmo Padrão Visual (Identidade Verde para Prontuário) */}
  <div className="card border-0 border-start border-success border-4 shadow-sm bg-white p-4">
    <div className="d-flex align-items-center mb-3">
      {/* Ícone de prontuário integrado */}
      <span className="fs-3 me-2">🏥</span>
      <h5 className="card-title fw-bold text-success mb-0">
        Eventos
      </h5>
    </div>
    
    <div className="card-text text-secondary lh-lg">
      <p className="mb-2">
        Atas de reuniões participadas também ficam aqui <strong>Consulte</strong>.
      </p>
      
      {/* Aviso de integração em tempo real */}
      <div className="alert alert-success d-flex align-items-center gap-2 py-2 px-3 mt-3 mb-0 small border-0 bg-success bg-opacity-10 text-success-emphasis">
        <span className="spinner-grow spinner-grow-sm text-success" role="status" aria-hidden="true"></span>
        <span>Nenhuma atualização encontrada.</span>
      </div>
    </div>
  </div>
</div>
);

export default Treinamentos;