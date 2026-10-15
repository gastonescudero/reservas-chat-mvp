export const BUSINESS = { name: 'Estudio Demo', welcome: '¡Hola! Soy el asistente de Estudio Demo. ¿En qué te puedo ayudar?' };
export const FAQS = [
  { q: '¿Cuáles son los horarios?', a: 'Atendemos de lunes a sábado, de 9 a 18 hs, con pausa de 13 a 15 hs.', keys: ['horario', 'hora', 'abren', 'cierran'] },
  { q: '¿Dónde están ubicados?', a: 'Estamos en Av. Pellegrini 1234, Rosario (dirección de ejemplo).', keys: ['donde', 'dónde', 'ubic', 'direcci'] },
  { q: '¿Cuánto cuestan los servicios?', a: 'Los precios figuran al elegir un servicio en la reserva.', keys: ['precio', 'cuesta', 'cuanto', 'cuánto', 'valor'] },
  { q: '¿Puedo cancelar una reserva?', a: 'Sí, avisanos con al menos 24 hs de anticipación.', keys: ['cancel'] },
];
export function answerFor(text: string): string | null {
  const t = text.toLowerCase();
  return FAQS.find((f) => f.keys.some((k) => t.includes(k)))?.a ?? null;
}
