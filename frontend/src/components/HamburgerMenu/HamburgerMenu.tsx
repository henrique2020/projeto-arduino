import { useNavigate } from 'react-router-dom';
import './HamburgerMenu.css';

interface HamburgerMenuProps {
  isOpen: boolean;
  onClose: () => void;
  currentPath: string;
}

interface NavItem {
  label: string;
  path: string;
}

const navItems: NavItem[] = [
  { label: 'Itens Cadastrados', path: '/itens-cadastrados' },
  { label: 'Itens Pendentes de Cadastro', path: '/itens-pendentes' },
  { label: 'Histórico de movimentações', path: '/historico' },
];

export function HamburgerMenu({ isOpen, onClose, currentPath }: HamburgerMenuProps) {
  const navigate = useNavigate();

  const handleNavClick = (path: string) => {
    navigate(path);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="hamburger-menu__overlay" onClick={onClose}>
      <nav
        className="hamburger-menu"
        aria-label="Menu de navegação"
        onClick={(e) => e.stopPropagation()}
      >
        <ul className="hamburger-menu__list">
          {navItems.map((item) => (
            <li key={item.path} className="hamburger-menu__item">
              <button
                className={`hamburger-menu__link${currentPath === item.path ? ' hamburger-menu__link--active' : ''}`}
                onClick={() => handleNavClick(item.path)}
                aria-current={currentPath === item.path ? 'page' : undefined}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
