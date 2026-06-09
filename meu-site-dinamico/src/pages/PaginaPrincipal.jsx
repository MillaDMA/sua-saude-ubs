import { useState, useEffect } from 'react';

const PaginaPrincipal = () => {
    const [urlMaps, setUrlMaps] = useState('');
    const [carregando, setCarregando] = useState(true);
    const [erroLocalizacao, setErroLocalizacao] = useState(false);

    useEffect(() => {
        if (!navigator.geolocation) {
            setCarregando(false);
            setErroLocalizacao(true);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                // Formato correto para abrir o mapa no Google Maps
                // O formato correto para busca de locais no Google Maps via URL
                setUrlMaps(`https://www.google.com/maps/search/UBS/@${latitude},${longitude},14z`);
                setCarregando(false);
            },
            (error) => {
                console.error("Erro:", error);
                setErroLocalizacao(true);
                setCarregando(false);
            }
        );
    }, []);

    return (
        <div className="mt-4 home">
            <h2>Bem-vindo, paciente!</h2>
            
            <div className="d-grid gap-2 mt-4">
                {carregando ? (
                    <button className="btn btn-primary" disabled>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Obtendo localização...
                    </button>
                ) : erroLocalizacao ? (
                    <button className="btn btn-warning" onClick={() => window.location.reload()}>
                        Tentar novamente (Permita o acesso à localização)
                    </button>
                ) : (
                    <a href={urlMaps} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                        Postinho mais próximo
                    </a>
                )}
            </div>
        </div>
    );
};

export default PaginaPrincipal;