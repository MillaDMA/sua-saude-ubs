
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
        
        {/* Substituí todos os 'class' por 'className' */}
        <div className="accordion" id="accordionPanelsStayOpenExample">
            <div className="accordion-item">
                <h2 className="accordion-header" id="panelsStayOpen-headingOne">
                    <button className="accordion-button buttton-acordeon-tittle" type="button" data-bs-toggle="collapse" data-bs-target="#panelsStayOpen-collapseOne" aria-expanded="true" aria-controls="panelsStayOpen-collapseOne">
                        Campanha Nacional de Vacinação contra a Influenza (Gripe)
                    </button>
                </h2>
                <div id="panelsStayOpen-collapseOne" className="accordion-collapse collapse show" aria-labelledby="panelsStayOpen-headingOne">
                    <div className="accordion-body">
                        <strong>Informações</strong> <br />
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

    export {FalarUBS, Historico, Vacinas};