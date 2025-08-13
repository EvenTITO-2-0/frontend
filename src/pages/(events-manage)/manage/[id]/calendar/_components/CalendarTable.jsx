import { useState } from 'react'

export default function CalendarTable({}) {
  const [tipo, setTipo] = useState("Slot");
  const [duracion, setDuracion] = useState(120);
  const [presentaciones, setPresentaciones] = useState(6);
  const [agenda, setAgenda] = useState([
    { start: "9:00 AM", end: "10:00 AM", tipo: "Break" },
    { start: "10:00 AM", end: "13:00 PM", tipo: "Slot" },
    { start: "13:00 PM", end: "14:00 PM", tipo: "Break" }
  ]);
  const handleAgregar = () => {
    // Just creating a placeholder time range for the new item
    // In a real app, you'd calculate times based on previous entries
    const newItem = {
      start: "14:00 PM",
      end: "15:00 PM",
      tipo: tipo
    };
    setAgenda([...agenda, newItem]);
  };
  const handleRemove = (index) => {
    setAgenda(agenda.filter((_, i) => i !== index));
  };

  return (
    <div style={{ display: "flex", padding: "20px" }}>
      {/* Left Column */}
      <div style={{ marginRight: "20px", flex: 1 }}>
        <h3>Agregar item</h3>
        <div>
          <label>Tipo</label>
          <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
            <option value="Slot">Slot</option>
            <option value="Break">Break</option>
            <option value="Plenaria">Plenaria</option>
          </select>
        </div>
        <div>
          <label>Duración (minutos)</label>
          <input
            type="number"
            value={duracion}
            onChange={(e) => setDuracion(Number(e.target.value))}
          />
        </div>
        <div>
          <label>Cantidad de presentaciones</label>
          <input
            type="number"
            value={presentaciones}
            onChange={(e) => setPresentaciones(Number(e.target.value))}
          />
        </div>
        <button onClick={handleAgregar}>Agregar</button>
      </div>

      {/* Right Column */}
      <div style={{ flex: 2 }}>
        <h3>Agenda</h3>
        <div>
          {agenda.map((item, index) => (
            <div key={index} style={{ border: "1px solid #ccc", margin: "5px", padding: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>
                {item.start} - {item.end} <strong>{item.tipo}</strong>
              </span>
              <button onClick={() => handleRemove(index)}>X</button>
            </div>
          ))}
        </div>
        <button>Continuar</button>
      </div>
    </div>
  );
}