import { useLocation, Link } from 'react-router-dom';

const ConsultaAgendada = () => {
    const location = useLocation();
    const diaExibicao = location.state?.diaExibicao || 'X';
    const horario = location.state?.horario || 'Y';

    // 1. A função fica aqui fora do return
    const confirmarAgendamento = () => {
        const mensagem = `Olá! Sua consulta está confirmada!\nData: ${diaExibicao}\nHorário: ${horario}\nDocumentos necessários: RG e Cartão do SUS.`;
        
        // Substitua pelo número real ou uma variável vinda do state
        const numero = "5524988299581"; 
        const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;
        
        window.open(url, '_blank');
    };

    return (
        <div className="mt-5 p-5 bg-white border rounded shadow-sm text-center">
        <h2 className="text-success mb-3">✔️ Consulta Agendada!</h2>
        <p className="fs-4">
            Sua consulta foi agendada com sucesso para o dia <strong className="text-primary">{diaExibicao}</strong> às <strong className="text-primary">{horario}</strong>.
        </p>
        <p className="text-muted">Os dados foram confirmados e salvos no banco de dados.</p>

        {/* 2. Botão que chama a função */}
        <div className="d-grid gap-2 mt-4">
            <button className="btn btn-success" onClick={confirmarAgendamento}>
            Enviar confirmação via WhatsApp
            </button>
            
            <Link to="/agendamentos" className="btn btn-secondary mt-2">
            Voltar para Agendamentos
            </Link>
        </div>
        </div>
    );
    };

    export default ConsultaAgendada;
    