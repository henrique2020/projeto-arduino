import { useNavigate } from 'react-router-dom';
import logo from '../../assets/ArduinoStocksLogoComNome.png';
import './HomeScreen.css';

interface NavigationCard {
  title: string;
  description: string;
  route: string;
}

const navigationCards: NavigationCard[] = [
  {
    title: 'Itens Cadastrados',
    description: 'Visualize e gerencie todos os itens registrados no sistema, incluindo edição e controle de estoque.',
    route: '/itens-cadastrados',
  },
  {
    title: 'Itens Pendentes de Cadastro',
    description: 'Veja os itens que foram escaneados pelo Arduino e aguardam o cadastro completo com nome e valor.',
    route: '/itens-pendentes',
  },
  {
    title: 'Histórico de movimentações',
    description: 'Consulte o histórico de todas as movimentações de estoque realizadas, incluindo adições e subtrações.',
    route: '/historico',
  },
];

function HomeScreen() {
  const navigate = useNavigate();

  return (
    <div className="home-screen">
      <img src={logo} alt="Arduino Stocks" className="home-screen__logo" />
      <div className="home-screen__cards">
        {navigationCards.map((card) => (
          <button
            key={card.route}
            className="home-screen__card"
            onClick={() => navigate(card.route)}
            aria-label={`Navegar para ${card.title}`}
            type="button"
          >
            <h2 className="home-screen__card-title">{card.title}</h2>
            <p className="home-screen__card-description">{card.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

export default HomeScreen;
