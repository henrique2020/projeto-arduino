import './LoadingSpinner.css';

function LoadingSpinner() {
  return (
    <div className="loading-spinner-container" role="status" aria-label="Carregando">
      <div className="loading-spinner" />
    </div>
  );
}

export default LoadingSpinner;
