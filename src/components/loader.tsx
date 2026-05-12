const LoaderComponent = ({
  className = "min-h-screen",
}: {
  className?: string;
}) => {
  const pathData =
    "M 0 0 L 100 0 L 100 100 L 0 100 Z M 82 13 L 82 35 L 70 35 L 70 24 L 36 24 L 57 49 L 36 75 L 70 75 L 70 64 L 82 64 L 82 86 L 18 86 L 18 76 L 41 49 L 18 22 L 18 13 Z";

  return (
    <div
      className={`flex flex-col items-center justify-center overflow-hidden m-0 ${className}`}
    >
      {/* Estilos específicos para la animación del SVG */}
      <style>{`
        @keyframes minimalistFlow {
          from {
            stroke-dashoffset: 800;
          }
          to {
            stroke-dashoffset: 0;
          }
        }

        .trace-line {
          stroke-dasharray: 80 320;
          animation: minimalistFlow 2.5s linear infinite;
          stroke-linecap: square;
        }
      `}</style>

      {/* Contenedor del SVG */}
      <div className="w-60 h-60 flex items-center justify-center">
        <svg viewBox="-2 -2 104 104" className="w-full h-full">
          {/* Capa Base: Guía sutil */}
          <path
            d={pathData}
            fill="none"
            className="stroke-primary/20" /* <-- El cambio clave: Adaptable al tema */
            strokeWidth="1"
            fillRule="evenodd"
          />

          {/* Capa Activa: Línea de trazado animada */}
          <path
            className="trace-line stroke-primary"
            d={pathData}
            fill="none"
            strokeWidth="1.5"
            fillRule="evenodd"
          />
        </svg>
      </div>
    </div>
  );
};

export default LoaderComponent;
