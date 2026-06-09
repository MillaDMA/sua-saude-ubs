import React from 'react';
import { Link } from 'react-router-dom';
// Nota: Os imports de Calendar e date-fns só são necessários se você 
// for usar o calendário NESTE arquivo. Se não for, pode removê-los.

const Agendamentos = () => {
    return (
        <div className="mt-4 text-center">
            <h2>Meus Agendamentos</h2>
            <p>Consulte suas consultas marcadas ou agende a próxima consulta</p>
            
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
};

export default Agendamentos;