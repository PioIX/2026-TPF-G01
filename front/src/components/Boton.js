export default function Boton({ children, onClick, id, className }) {
  return (
    <button id={id} className={className} onClick={onClick}>
      {children}
    </button>
  );
}