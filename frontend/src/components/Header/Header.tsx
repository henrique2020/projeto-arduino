import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import logo from '../../assets/ArduinoStocksLogo.png';
import { HamburgerMenu } from '../HamburgerMenu/HamburgerMenu';
import './Header.css';

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => {
    setMenuOpen((prev) => !prev);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <header className="header">
      <img src={logo} alt="FH Estoques" className="header__logo" />
      <button
        className="header__hamburger"
        onClick={toggleMenu}
        aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
        aria-expanded={menuOpen}
      >
        <span className="header__hamburger-icon" />
        <span className="header__hamburger-icon" />
        <span className="header__hamburger-icon" />
      </button>
      <HamburgerMenu
        isOpen={menuOpen}
        onClose={closeMenu}
        currentPath={location.pathname}
      />
    </header>
  );
}
