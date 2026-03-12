'use client';

import { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle, 
  Download, User, Shield, Settings, Calendar, 
  Lock, Sigma, KeyRound
} from 'lucide-react';

// --- DATOS REALES ---
const initialCasinosData = [
  { id: 1, nombre: "CARTAGO", categoria: "GAMBLING", dia: "LUN", metaMensual: 645000000, metaUtilidad: 159000000 },
  { id: 2, nombre: "RULETA CARTAGO", categoria: "GAMBLING", dia: "LUN", metaMensual: 135000000, metaUtilidad: 30000000 },
  { id: 3, nombre: "ANSERMA", categoria: "GAMBLING", dia: "LUN", metaMensual: 420000000, metaUtilidad: 120000000 },
  { id: 4, nombre: "QUIMBAYA", categoria: "GAMBLING", dia: "LUN", metaMensual: 966000000, metaUtilidad: 258000000 },
  { id: 5, nombre: "RULETA QUIMBAYA", categoria: "GAMBLING", dia: "LUN", metaMensual: 240000000, metaUtilidad: 36000000 },
  { id: 6, nombre: "LA VIRGINIA", categoria: "GAMBLING", dia: "MAR", metaMensual: 795000000, metaUtilidad: 210000000 },
  { id: 7, nombre: "ROA", categoria: "GAMBLING", dia: "MAR", metaMensual: 330000000, metaUtilidad: 111000000 },
  { id: 8, nombre: "LA 29", categoria: "GAMBLING", dia: "MIER", metaMensual: 534000000, metaUtilidad: 126000000 },
  { id: 9, nombre: "IRRA", categoria: "SOCIEDADES", dia: "LUN", metaMensual: 279000000, metaUtilidad: 78000000 },
  { id: 10, nombre: "ARAUCA", categoria: "SOCIEDADES", dia: "LUN", metaMensual: 264000000, metaUtilidad: 78000000 },
  { id: 11, nombre: "CALLE 8 VITERBO", categoria: "SOCIEDADES", dia: "MAR", metaMensual: 420000000, metaUtilidad: 105000000 },
  { id: 12, nombre: "VITERBO", categoria: "SOCIEDADES", dia: "MAR", metaMensual: 705000000, metaUtilidad: 168000000 },
  { id: 13, nombre: "RULETA VITERBO", categoria: "SOCIEDADES", dia: "MAR", metaMensual: 540000000, metaUtilidad: 108000000 },
  { id: 14, nombre: "BELALCAZAR", categoria: "SOCIEDADES", dia: "MAR", metaMensual: 255000000, metaUtilidad: 78000000 },
  { id: 15, nombre: "RULETA BELALCAZAR", categoria: "SOCIEDADES", dia: "MAR", metaMensual: 84000000, metaUtilidad: 21000000 },
  { id: 16, nombre: "CUBA", categoria: "SOCIEDADES", dia: "MIER", metaMensual: 324000000, metaUtilidad: 81000000 },
  { id: 17, nombre: "RULETA CUBA", categoria: "SOCIEDADES", dia: "MIER", metaMensual: 114000000, metaUtilidad: 30000000 },
  { id: 18, nombre: "MARSELLA", categoria: "SOCIEDADES", dia: "MIER", metaMensual: 276000000, metaUtilidad: 72000000 },
  { id: 19, nombre: "RULETA MARSELLA", categoria: "SOCIEDADES", dia: "MIER", metaMensual: 120000000, metaUtilidad: 30000000 },
];

const generateRealData = () => {
  return {
    1: { utilidad: 53000000, fecha: "Mar 10, 17:00", locked: true },
    2: { utilidad: 10000000, fecha: "Mar 10, 17:00", locked: true },
    3: { utilidad: 40000000, fecha: "Mar 10, 17:00", locked: true },
    4: { utilidad: 86000000, fecha: "Mar 10, 17:00", locked: true },
    5: { utilidad: 12000000, fecha: "Mar 10, 17:00", locked: true },
    6: { utilidad: 70000000, fecha: "Mar 10, 17:00", locked: true },
    7: { utilidad: 37000000, fecha: "Mar 10, 17:00", locked: true },
    8: { utilidad: 42000000, fecha: "Mar 10, 17:00", locked: true },
    9: { utilidad: 26000000, fecha: "Mar 10, 17:00", locked: true },
    10: { utilidad: 26000000, fecha: "Mar 10, 17:00", locked: true },
    11: { utilidad: 35000000, fecha: "Mar 10, 17:00", locked: true },
    12: { utilidad: 56000000, fecha: "Mar 10, 17:00", locked: true },
    13: { utilidad: 36000000, fecha: "Mar 10, 17:00", locked: true },
    14: { utilidad: 26000000, fecha: "Mar 10, 17:00", locked: true },
    15: { utilidad: 7000000, fecha: "Mar 10, 17:00", locked: true },
    16: { utilidad: 27000000, fecha: "Mar 10, 17:00", locked: true },
    17: { utilidad: 10000000, fecha: "Mar 10, 17:00", locked: true },
    18: { utilidad: 24000000, fecha: "Mar 10, 17:00", locked: true },
    19: { utilidad: 10000000, fecha: "Mar 10, 17:00", locked: true },
  };
};

// Configuración de colores: Barra y Fondo
const initialMessagesConfig = [
  { id: 1, min: 0, max: 50, mensaje: "🚨 CRÍTICO: ¡Acción inmediata!", color: "text-red-400", bg: "bg-red-900/50", bar: "bg-red-500" },
  { id: 2, min: 50, max: 80, mensaje: "⚠️ ALERTA: Vamos lento.", color: "text-yellow-400", bg: "bg-yellow-900/50", bar: "bg-yellow-500" },
  { id: 3, min: 80, max: 99, mensaje: "🔵 BUEN RITMO: ¡Casi llegamos!", color: "text-blue-400", bg: "bg-blue-900/50", bar: "bg-blue-500" },
  // ÉXITO: Fondo Verde Sólido y Barra Verde Claro
  { id: 4, min: 99, max: 1000, mensaje: "✅ ÉXITO: ¡Meta cumplida!", color: "text-white", bg: "bg-green-500", bar: "bg-green-300" } 
];

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" className="inline-block mr-1 text-green-500">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

export default function DashboardApp() {
  const getInitialState = (key: string, defaultValue: any) => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(key);
      if (saved) return JSON.parse(saved);
    }
    return defaultValue;
  };

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [systemPin, setSystemPin] = useState(() => getInitialState('system_pin', '2026'));
  
  const [casinos, setCasinos] = useState(() => getInitialState('casinos_data', initialCasinosData));
  const [registros, setRegistros] = useState(() => {
    const saved = localStorage.getItem('casinos_registros');
    if (saved) return JSON.parse(saved);
    return generateRealData();
  });
  
  const [messagesConfig, setMessagesConfig] = useState(() => getInitialState('casinos_msgs', initialMessagesConfig));
  
  const [userRole, setUserRole] = useState('admin');
  const [selectedCasinoId, setSelectedCasinoId] = useState(1);
  const [inputs, setInputs] = useState({}); 
  const [diaActual, setDiaActual] = useState(10);
  const [filtroAdmin, setFiltroAdmin] = useState('TODOS');
  const [showConfig, setShowConfig] = useState(false);
  const [configTarget, setConfigTarget] = useState(null); 
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [activeInputId, setActiveInputId] = useState(null);

  useEffect(() => { localStorage.setItem('casinos_data', JSON.stringify(casinos)); }, [casinos]);
  useEffect(() => { localStorage.setItem('casinos_registros', JSON.stringify(registros)); }, [registros]);
  useEffect(() => { localStorage.setItem('casinos_msgs', JSON.stringify(messagesConfig)); }, [messagesConfig]);
  useEffect(() => { localStorage.setItem('system_pin', JSON.stringify(systemPin)); }, [systemPin]);

  const formatoPesos = (val) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(val);
  
  const getPromedioEsperado = (meta) => (meta / 30) * diaActual;
  const getPromedioDia = (meta) => meta / 30;

  const evaluarCasino = (casino) => {
    const registro = registros[casino.id] || { utilidad: 0, fecha: null, locked: false };
    const porcentajeReal = (registro.utilidad / casino.metaUtilidad) * 100;
    const promedioEsperado = getPromedioEsperado(casino.metaUtilidad);
    
    const config = messagesConfig.find(m => porcentajeReal >= m.min && porcentajeReal < m.max) || messagesConfig[0];
    
    return {
      ...casino,
      registro,
      porcentajeReal,
      promedioEsperado,
      promedioDia: getPromedioDia(casino.metaUtilidad),
      faltante: casino.metaUtilidad - registro.utilidad,
      mensaje: config.mensaje,
      color: config.color,
      bg: config.bg,
      barColor: config.bar,
      icono: porcentajeReal < 50 ? <TrendingDown /> : porcentajeReal >= 100 ? <CheckCircle /> : <TrendingUp />
    };
  };

  const handleLogin = () => {
    if (pinInput === systemPin) setIsAuthenticated(true);
    else { alert("PIN Incorrecto"); setPinInput(''); }
  };

  const openConfirmation = (id) => {
    const value = parseFloat(inputs[id]?.utilidad);
    if (!value || isNaN(value)) return alert("Ingresa un número válido.");
    setActiveInputId(id);
    setShowConfirmModal(true);
  };

  const confirmEntry = () => {
    const value = parseFloat(inputs[activeInputId]?.utilidad);
    const now = new Date();
    const fechaStr = now.toLocaleString('es-CO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

    setRegistros(prev => ({
        ...prev,
        [activeInputId]: {
          utilidad: value,
          fecha: fechaStr,
          locked: true 
        }
    }));
    
    setInputs(prev => ({ ...prev, [activeInputId]: { utilidad: '' } }));
    setShowConfirmModal(false);
    setActiveInputId(null);
  };

  const updateCasinoMeta = (id, field, value) => {
    setCasinos(prev => prev.map(c => c.id === id ? { ...c, [field]: parseFloat(value) || 0 } : c));
  };

  const casinosFiltrados = casinos.filter(c => {
    if (filtroAdmin === 'TODOS') return true;
    if (filtroAdmin === 'CRITICOS') return evaluarCasino(c).porcentajeReal < 50;
    if (filtroAdmin === 'EXITOSOS') return evaluarCasino(c).porcentajeReal >= 100;
    return c.categoria === filtroAdmin;
  });

  const totales = casinosFiltrados.reduce((acc, c) => {
    const evalC = evaluarCasino(c);
    return {
      metaVentas: acc.metaVentas + c.metaMensual,
      metaUtilidad: acc.metaUtilidad + c.metaUtilidad,
      utilidadReal: acc.utilidadReal + evalC.registro.utilidad
    };
  }, { metaVentas: 0, metaUtilidad: 0, utilidadReal: 0 });

  const exportarCSV = () => {
    let csv = "Local,Meta Ventas,Meta Utilidad,Utilidad Real,% Cumplimiento,Fecha Cierre\n";
    casinosFiltrados.forEach(c => {
      const data = evaluarCasino(c);
      csv += `${data.nombre},${data.metaMensual},${data.metaUtilidad},${data.registro.utilidad},${data.porcentajeReal.toFixed(2)}%,${data.registro.fecha || 'N/A'}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "reporte_casinos.csv";
    link.click();
  };
  
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#444 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
        <div className="z-10 text-center mb-8">
          <Shield className="w-16 h-16 mx-auto text-emerald-400 mb-4" />
          <h1 className="text-3xl font-bold">Casino Control</h1>
          <p className="text-gray-500 mt-2">Ingrese PIN de seguridad</p>
        </div>
        <div className="z-10 bg-gray-900 p-8 rounded-xl shadow-2xl border border-gray-800 w-11/12 max-w-sm">
          <div className="flex justify-center gap-2 mb-6">
            {[0,1,2,3].map((i) => (
              <div key={i} className={`w-4 h-4 rounded-full ${pinInput.length > i ? 'bg-emerald-400' : 'bg-gray-700'}`}></div>
            ))}
          </div>
          <input 
            type="password" 
            value={pinInput} 
            onChange={(e) => setPinInput(e.target.value.replace(/\D/g, '').slice(0,4))}
            className="w-full text-center text-2xl tracking-[1em] bg-gray-800 border border-gray-600 rounded px-4 py-3 mb-4 focus:outline-none focus:border-emerald-500"
            placeholder="****"
          />
          <button onClick={handleLogin} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded transition">
            Acceder
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white pb-20 p-4 md:p-8">
      
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-600 shadow-2xl w-11/12 max-w-sm text-center">
            <AlertTriangle className="mx-auto text-yellow-400 mb-4" size={40} />
            <h3 className="text-xl font-bold mb-2">¿Estás seguro?</h3>
            <p className="text-gray-400 text-sm mb-4">El valor de utilidad ingresado es <span className="text-white font-bold">{formatoPesos(parseFloat(inputs[activeInputId]?.utilidad))}</span>. Una vez aceptado, no podrás modificarlo.</p>
            <div className="flex gap-4 mt-6">
              <button onClick={() => setShowConfirmModal(false)} className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded font-bold">Cancelar</button>
              <button onClick={confirmEntry} className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded font-bold">Aceptar</button>
            </div>
          </div>
        </div>
      )}

      <nav className="mb-4 flex flex-col md:flex-row justify-between items-center gap-4 border-b border-gray-700 pb-4">
        <div className="flex items-center gap-3">
          <Shield className="text-emerald-500" size={32} />
          <div>
            <h1 className="text-2xl font-bold">Casino Control <span className="text-emerald-400">2026</span></h1>
            <p className="text-xs text-gray-500">Sistema Inteligente de Gestión</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-1 bg-gray-800 p-1 rounded-lg">
            <button onClick={() => setUserRole('admin')} className={`px-3 py-1 rounded text-sm flex items-center gap-1 ${userRole === 'admin' ? 'bg-emerald-600 text-white' : 'text-gray-400'}`}><Shield size={14}/> Admin</button>
            <button onClick={() => setUserRole('user')} className={`px-3 py-1 rounded text-sm flex items-center gap-1 ${userRole === 'user' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}><User size={14}/> Usuario</button>
          </div>

          {userRole === 'user' && (
            <select 
              className="bg-gray-800 border border-gray-600 text-white px-3 py-1 rounded text-sm"
              value={selectedCasinoId}
              onChange={(e) => setSelectedCasinoId(Number(e.target.value))}
            >
              {casinos.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          )}

          <div className="flex items-center gap-2 text-xs bg-gray-800 p-2 rounded border border-gray-700">
            <Calendar size={14} className="text-gray-400"/>
            <span>Día:</span>
            <input type="number" value={diaActual} onChange={(e) => setDiaActual(Number(e.target.value))} className="w-8 bg-gray-700 text-center rounded text-white text-xs" />
          </div>
        </div>
      </nav>

      {userRole === 'admin' && (
        <>
          <div className="mb-6 bg-gray-800 p-4 rounded-xl grid grid-cols-1 md:grid-cols-3 gap-4 border border-gray-700">
            <div className="text-center">
              <p className="text-xs text-gray-400 uppercase">Suma Metas Ventas</p>
              <p className="text-2xl font-bold text-white">{formatoPesos(totales.metaVentas)}</p>
            </div>
            <div className="text-center border-x border-gray-700">
              <p className="text-xs text-gray-400 uppercase">Suma Utilidad Esperada</p>
              <p className="text-2xl font-bold text-blue-400">{formatoPesos(totales.metaUtilidad)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-400 uppercase">Utilidad Real Acumulada</p>
              <p className="text-2xl font-bold text-emerald-400">{formatoPesos(totales.utilidadReal)}</p>
            </div>
          </div>

          <div className="mb-6 flex flex-wrap justify-between items-center gap-4">
            <div className="flex gap-2 flex-wrap">
              <button onClick={() => setFiltroAdmin('TODOS')} className={`px-3 py-1 rounded text-xs ${filtroAdmin === 'TODOS' ? 'bg-white text-gray-900' : 'bg-gray-700'}`}>Todos</button>
              <button onClick={() => setFiltroAdmin('GAMBLING')} className={`px-3 py-1 rounded text-xs ${filtroAdmin === 'GAMBLING' ? 'bg-white text-gray-900' : 'bg-gray-700'}`}>Gambling</button>
              <button onClick={() => setFiltroAdmin('SOCIEDADES')} className={`px-3 py-1 rounded text-xs ${filtroAdmin === 'SOCIEDADES' ? 'bg-white text-gray-900' : 'bg-gray-700'}`}>Sociedades</button>
              <button onClick={() => setFiltroAdmin('EXITOSOS')} className={`px-3 py-1 rounded text-xs ${filtroAdmin === 'EXITOSOS' ? 'bg-green-600 text-white' : 'bg-gray-700'}`}>Cumplidos</button>
            </div>
            
            <div className="flex gap-2">
              <button onClick={() => { setShowConfig(!showConfig); setConfigTarget(null); }} className="flex items-center gap-1 px-3 py-1 rounded text-xs bg-gray-700 hover:bg-gray-600 border border-gray-600">
                <Settings size={14}/> Config App
              </button>
              <button onClick={exportarCSV} className="flex items-center gap-1 px-4 py-1 rounded text-xs bg-emerald-600 hover:bg-emerald-500 font-semibold">
                <Download size={14}/> CSV
              </button>
            </div>
          </div>

          {showConfig && (
            <div className="mb-6 bg-gray-800 p-6 rounded-xl border border-emerald-500/50 shadow-lg">
              <div className="grid md:grid-cols-3 gap-8">
                <div>
                  <h3 className="text-lg font-bold mb-4 border-b border-gray-700 pb-2 flex items-center gap-2"><Sigma size={18}/> Configurar Metas</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                    {casinos.map(c => (
                      <div key={c.id} onClick={() => setConfigTarget(c.id)} className={`p-2 rounded cursor-pointer ${configTarget === c.id ? 'bg-emerald-900/50 border border-emerald-500' : 'bg-gray-700 hover:bg-gray-600'}`}>
                        <p className="font-semibold text-sm">{c.nombre}</p>
                        {configTarget === c.id && (
                          <div className="grid grid-cols-2 gap-2 mt-2" onClick={e => e.stopPropagation()}>
                            <div>
                              <label className="text-xs text-gray-400">Meta Ventas</label>
                              <input type="number" value={c.metaMensual} onChange={e => updateCasinoMeta(c.id, 'metaMensual', e.target.value)} className="w-full bg-gray-900 p-1 rounded text-sm text-white" />
                            </div>
                            <div>
                              <label className="text-xs text-gray-400">Meta Utilidad</label>
                              <input type="number" value={c.metaUtilidad} onChange={e => updateCasinoMeta(c.id, 'metaUtilidad', e.target.value)} className="w-full bg-gray-900 p-1 rounded text-sm text-white" />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold mb-4 border-b border-gray-700 pb-2">Mensajes Automáticos</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                    {messagesConfig.map((msg, idx) => (
                      <div key={msg.id} className="bg-gray-700 p-3 rounded">
                        <div className="flex gap-2 mb-2 text-xs">
                          <span>%:</span>
                          <input type="number" value={msg.min} onChange={(e) => { const n = [...messagesConfig]; n[idx].min = Number(e.target.value); setMessagesConfig(n); }} className="w-10 bg-gray-900 px-1 rounded" />
                          <span>a:</span>
                          <input type="number" value={msg.max} onChange={(e) => { const n = [...messagesConfig]; n[idx].max = Number(e.target.value); setMessagesConfig(n); }} className="w-10 bg-gray-900 px-1 rounded" />
                        </div>
                        <textarea 
                          className="w-full bg-gray-900 text-white p-2 rounded text-xs" 
                          rows={2} 
                          value={msg.mensaje} 
                          onChange={(e) => { const n = [...messagesConfig]; n[idx].mensaje = e.target.value; setMessagesConfig(n); }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                   <h3 className="text-lg font-bold mb-4 border-b border-gray-700 pb-2 flex items-center gap-2"><KeyRound size={18}/> Seguridad</h3>
                   <div className="space-y-4">
                      <div className="bg-gray-700 p-3 rounded">
                        <label className="text-xs text-gray-400 block mb-1">Cambiar PIN de Acceso</label>
                        <input 
                          type="password" 
                          value={systemPin} 
                          onChange={e => setSystemPin(e.target.value.replace(/\D/g, '').slice(0,4))}
                          className="w-full bg-gray-900 p-2 rounded text-lg tracking-widest text-center font-bold text-emerald-400"
                        />
                        <p className="text-xs text-gray-500 mt-1 text-center">PIN actual: {systemPin}</p>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {(userRole === 'admin' ? casinosFiltrados : casinos.filter(c => c.id === selectedCasinoId)).map(casino => {
          const data = evaluarCasino(casino);
          const isLocked = data.registro.locked;
          
          return (
            <div key={data.id} className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden shadow-lg flex flex-col">
              {/* Header Dinámico */}
              <div className={`p-4 ${data.bg} border-b border-gray-700 relative transition-colors duration-500`}>
                <img 
                  src="https://z-cdn-media.chatglm.cn/files/9a8f0b6a-4eb0-4355-958e-f0eba195dc97.png?auth_key=1873295030-16af9abaa2f147b5b6f8ada3e9491b35-0-ce3104328fea8a435aa665bd9b5b7482" 
                  alt="Ruleta" 
                  className="absolute top-2 left-2 w-10 h-10 rounded-full border-2 border-white shadow-md object-cover opacity-90"
                />

                <div className="flex justify-between items-start ml-10">
                  <span className="text-xs font-semibold text-white/80 uppercase ml-2">{data.categoria}</span>
                  {isLocked && <Lock size={14} className="text-white/80" />}
                </div>
                <h2 className="text-xl font-bold text-white text-center my-1 drop-shadow-md">{data.nombre}</h2>
                <div className="text-center mt-2">
                  <span className="text-xs text-white/80 block">Meta Ventas Mensual</span>
                  <span className="text-2xl font-bold text-white tracking-tight drop-shadow-md">{formatoPesos(data.metaMensual)}</span>
                </div>
              </div>

              <div className="p-5 flex-grow space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Último Cierre</p>
                    <p className="font-bold text-white text-xs">{data.registro.fecha || "Sin registro"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-400">Util. Esperada Día</p>
                    <p className="font-bold text-blue-400">{formatoPesos(data.promedioDia)}</p>
                  </div>
                </div>

                <div className="bg-gray-900 p-3 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-400 text-sm">Utilidad Meta</span>
                    <span className="font-bold text-white">{formatoPesos(data.metaUtilidad)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">Utilidad Real Acum.</span>
                    <span className="font-bold text-emerald-400">{formatoPesos(data.registro.utilidad)}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-gray-400 text-center mb-2">
                    Deberías llevar: <span className="font-bold text-yellow-300">{formatoPesos(data.promedioEsperado)}</span>
                  </p>

                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Inicio</span>
                    <span className="text-white font-bold">Día {diaActual}</span>
                    <span>Fin</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full relative">
                    <div className="absolute top-1/2 transform -translate-y-1/2 w-1 h-4 bg-blue-500 z-10" style={{ left: `${(diaActual/30)*100}%` }}></div>
                    {/* Barra de progreso dinámica */}
                    <div className={`h-full rounded-full transition-all duration-700 ${data.barColor}`} style={{ width: `${Math.min(data.porcentajeReal, 100)}%` }}></div>
                  </div>
                </div>

                <div className={`p-3 rounded border border-gray-600 ${data.bg} transition-colors duration-500`}>
                  <p className={`text-sm font-medium ${data.color}`}>{data.mensaje}</p>
                </div>

                {/* Input solo de Utilidad */}
                <div className="pt-2 border-t border-gray-700">
                  <label className="text-xs text-gray-500 block mb-1">Registrar Utilidad:</label>
                  <div className="flex gap-2">
                    <input
                      type="number" placeholder="$"
                      className="flex-1 bg-gray-700 text-white text-sm px-2 py-1 rounded border border-gray-600 focus:outline-none focus:border-emerald-500 disabled:opacity-50"
                      value={inputs[data.id]?.utilidad || ''}
                      onChange={(e) => setInputs(prev => ({ ...prev, [data.id]: { utilidad: e.target.value } }))}
                      disabled={isLocked && userRole === 'user'}
                    />
                    <button 
                      onClick={() => openConfirmation(data.id)} 
                      disabled={(isLocked && userRole === 'user') || !inputs[data.id]?.utilidad}
                      className="bg-emerald-600 hover:bg-emerald-500 px-3 py-1 rounded text-xs font-bold disabled:opacity-30"
                    > OK </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-gray-950 border-t border-gray-800 p-3 text-center text-xs text-gray-500 z-40">
        <div className="flex flex-col md:flex-row justify-center items-center gap-2">
          <span className="font-bold text-gray-400">Integración Tecnológica Avanzada ITA</span>
          <span className="hidden md:inline">|</span>
          <span>División Software - Automatización - AI</span>
          <span className="hidden md:inline">|</span>
          <span>2026 Pereira Colombia</span>
          <span className="hidden md:inline">|</span>
          <div className="flex items-center gap-1">
            <WhatsAppIcon />
            <span>3146539014</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
