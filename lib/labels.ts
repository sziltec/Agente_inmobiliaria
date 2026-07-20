// Traducciones de enums del esquema, compartidas entre el dashboard y la tabla de prospectos.
export const channelNames: Record<string, string> = {
  WHATSAPP: "WhatsApp",
  MESSENGER: "Messenger",
  INSTAGRAM: "Instagram",
};

export const statusNames: Record<string, string> = {
  NEW: "Nuevo",
  QUALIFYING: "Cualificando",
  QUALIFIED: "Cualificado",
  DISQUALIFIED: "Descartado",
};

export const operationNames: Record<string, string> = {
  BUY: "Compra",
  RENT: "Alquiler",
  SELL: "Venta",
  APPRAISAL: "Tasación",
};

export const roleNames: Record<string, string> = {
  ADMIN: "Administrador",
  AGENT: "Agente",
};

export const dealStatusNames: Record<string, string> = {
  OPEN: "Abierto",
  WON: "Ganado",
  LOST: "Perdido",
};
