import { useNavigate } from 'react-router-dom';
import './BackArrow.css';

interface BackArrowProps {
  to: string;
  label?: string;
}

function BackArrow({ to, label = 'Voltar' }: BackArrowProps) {
  const navigate = useNavigate();

  return (
    <button
      className="back-arrow"
      onClick={() => navigate(to)}
      aria-label={label}
      type="button"
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M19 12H5" />
        <path d="M12 19l-7-7 7-7" />
      </svg>
    </button>
  );
}

export default BackArrow;
