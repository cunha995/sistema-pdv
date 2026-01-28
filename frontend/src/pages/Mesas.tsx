import React from 'react';
import QRCode from 'qrcode.react';

const mesas = [
  { id: 1, nome: 'Mesa 1' },
  { id: 2, nome: 'Mesa 2' },
  { id: 3, nome: 'Mesa 3' },
  { id: 4, nome: 'Mesa 4' }
];

const urlBase = window.location.origin;

const Mesas: React.FC = () => {
  return (
    <div className="mesas-main">
      <h1>Mesas</h1>
      <div className="mesas-list">
        {mesas.map(mesa => {
          const mesaUrl = `${urlBase}/mesa/${mesa.id}`;
          return (
            <div key={mesa.id} className="mesa-card">
              <div>{mesa.nome}</div>
              <QRCode value={mesaUrl} size={96} />
              <div style={{marginTop: 8}}>
                <a href={mesaUrl} target="_blank" rel="noopener noreferrer">
                  Abrir painel da mesa
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Mesas;
