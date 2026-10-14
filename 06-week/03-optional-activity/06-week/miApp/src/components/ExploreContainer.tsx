import './ExploreContainer.css';

interface ContainerProps { }

const ExploreContainer: React.FC<ContainerProps> = () => {
  return (
    <div id="container">
      <strong>¡Hola! Soy Lilly Puentes y esta es mi primera app con Ionic React</strong>
      <p>Semana 6 · Programación Móvil · CORHUILA 2026-B. Explora los <a target="_blank" rel="noopener noreferrer" href="https://ionicframework.com/docs/components">componentes de Ionic</a></p>
    </div>
  );
};

export default ExploreContainer;
