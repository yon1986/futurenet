export const transferir = async (
  usuarioID: string,
  cantidadWLD: number,
  tipo: 'retiro' | 'deposito',
  montoQ: number
) => {
  try {
    const respuesta = await fetch('/api/transferir', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ usuarioID, cantidadWLD, tipo, montoQ }),
    });

    const data = await respuesta.json();
    return data;
  } catch (error) {
    console.error('Error llamando a transferir:', error);
    return { ok: false, error: 'No se pudo conectar con el servidor' };
  }
};
