'use client';
/* eslint-disable @next/next/no-img-element */

// ============================================================================
// VERSIÓN: v1.7.3
// FECHA: 19 de Marzo de 2026
// DESCRIPCIÓN DE CAMBIOS OBLIGATORIOS:
// - CORRECCIÓN: Las tarjetas CONSOLIDADAS ahora sí toman dinámicamente el color 
//   del semáforo (Rojo, Amarillo, Verde) en lugar del azul fijo.
// - Se mantienen textos en una línea, tamaños iguales, gráfica modal en Row, 
//   indicadores laterales y fuente Serifa itálica.
// ============================================================================

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  TrendingUp, TrendingDown, CheckCircle, AlertTriangle, 
  Download, User, Shield, Settings, Calendar, 
  Sigma, KeyRound, LogOut, X, Smartphone,
  FileText, BarChart, Users, MessageSquareText, Save
} from 'lucide-react';

// --- INICIALIZAR SUPABASE ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// --- INTERFACES ---
interface Casino {
  id: number;
  nombre: string;
  categoria: string;
  dia: string;
  metaMensual: number;
  metaUtilidad: number;
  pin: string;
  utilidad: number; 
  ventasAcumuladas: number; 
  fecha: string | null;
  alertaCero: boolean;
  isConsolidado?: boolean; 
}

interface MensajeConfig {
  id: number;
  min: number;
  max: number;
  mensaje: string;
  color: string;
  bg: string;
  bar: string;
}

interface SubAdmin {
  id: number;
  pin: string;
  casinos: number[];
}

const initialMessagesConfig: MensajeConfig[] = [
  { id: 1, min: -1000, max: 90, mensaje: "Aceleren el ritmo operativo", color: "text-red-400", bg: "bg-red-900", bar: "bg-red-500" },
  { id: 2, min: 90, max: 100, mensaje: "Faltan pocos clientes", color: "text-yellow-400", bg: "bg-yellow-700", bar: "bg-yellow-500" },
  { id: 3, min: 100, max: 5000, mensaje: "Excelente turno comercial", color: "text-green-300", bg: "bg-green-800", bar: "bg-green-400" } 
];

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" className="inline-block mr-1 text-green-500">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

export default function DashboardApp() {
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  
  const [systemPin, setSystemPin] = useState('2026');
  const [casinos, setCasinos] = useState<Casino[]>([]);
  const [messagesConfig, setMessagesConfig] = useState<MensajeConfig[]>(initialMessagesConfig);
  const [subAdmins, setSubAdmins] = useState<SubAdmin[]>([]);
  
  const [userRole, setUserRole] = useState<'admin' | 'subadmin' | 'user'>('admin');
  const [loggedInUserPin, setLoggedInUserPin] = useState<string>(''); 
  const [loggedInSubCasinos, setLoggedInSubCasinos] = useState<number[]>([]); 
  
  const [inputs, setInputs] = useState<Record<number, { utilidad: string, ventas: string }>>({}); 
  const [diaActual, setDiaActual] = useState(1);
  const [filtroAdmin, setFiltroAdmin] = useState('TODOS');
  
  const [showConfig, setShowConfig] = useState(false);
  const [configTab, setConfigTab] = useState<'metas' | 'mensajes' | 'subadmins' | 'sistema'>('metas');
  const [configTarget, setConfigTarget] = useState<number | null>(null); 
  const [newSubPin, setNewSubPin] = useState('');
  const [newSubCasinos, setNewSubCasinos] = useState<number[]>([]);
  
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [activeInputId, setActiveInputId] = useState<number | null>(null);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [showCloseMonthModal, setShowCloseMonthModal] = useState(false);
  const [mesACerrar, setMesACerrar] = useState(new Date().toLocaleString('es-CO', { month: 'long' }).toUpperCase());
  
  const [activeGraphCasino, setActiveGraphCasino] = useState<Casino & ReturnType<typeof evaluarCasino> | null>(null);

  const fetchSupabaseData = async () => {
    setIsLoading(true);
    const { data: casinosData, error } = await supabase.from('casinos').select('*').order('id');
    if (casinosData) setCasinos(casinosData);
    if (error) console.error("Error cargando casinos:", error);

    const { data: configData } = await supabase.from('app_config').select('system_pin').eq('id', 1).single();
    if (configData) setSystemPin(configData.system_pin);
    
    setIsLoading(false);
  };

  useEffect(() => {
    setIsMounted(true);
    const today = new Date().getDate();
    setDiaActual(today);
    
    if (typeof window !== 'undefined') {
      const savedMsgs = localStorage.getItem('casinos_msgs_v17');
      if (savedMsgs) setMessagesConfig(JSON.parse(savedMsgs));
      
      const savedSubs = localStorage.getItem('casinos_subadmins_v17');
      if (savedSubs) setSubAdmins(JSON.parse(savedSubs));
    }

    fetchSupabaseData();

    const channel = supabase.channel('realtime-casinos').on('postgres_changes', { event: '*', schema: 'public', table: 'casinos' }, () => {
      fetchSupabaseData();
    }).subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  useEffect(() => {
    if (isMounted && typeof window !== 'undefined') {
      localStorage.setItem('casinos_msgs_v17', JSON.stringify(messagesConfig));
      localStorage.setItem('casinos_subadmins_v17', JSON.stringify(subAdmins));
    }
  }, [messagesConfig, subAdmins, isMounted]);

  const formatoPesos = (val: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(val);
  const getPromedioEsperado = (meta: number) => (meta / 30) * diaActual;

  const evaluarCasino = (casino: any) => {
    const metaV = Number(casino.metaMensual || 0);
    const metaU = Number(casino.metaUtilidad || 0);
    const utilAcumulada = Number(casino.utilidad || 0);
    const ventasAcum = Number(casino.ventasAcumuladas || 0);

    const promedioEsperado = getPromedioEsperado(metaU);
    const porcentajeMensual = metaU > 0 ? (utilAcumulada / metaU) * 100 : 0;
    const porcentajeVentas = metaV > 0 ? (ventasAcum / metaV) * 100 : 0;
    const rendimientoDiario = promedioEsperado > 0 ? (utilAcumulada / promedioEsperado) * 100 : (utilAcumulada > 0 ? 100 : 0);
    
    const faltanteParaCumplir = metaU - utilAcumulada;
    const faltanteVentas = metaV - ventasAcum;
    
    const config = messagesConfig.find(m => rendimientoDiario >= m.min && rendimientoDiario < m.max) || messagesConfig[0];

    return {
      ...casino,
      metaMensual: metaV,
      metaUtilidad: metaU,
      utilidad: utilAcumulada,
      ventasAcumuladas: ventasAcum,
      porcentajeMensual,
      porcentajeVentas,
      rendimientoDiario,
      promedioEsperado,
      faltanteParaCumplir,
      faltanteVentas,
      mensaje: config.mensaje,
      color: config.color,
      bg: config.bg, // CORRECCIÓN: Toma siempre el color del semáforo, incluso en consolidado
      barColor: config.bar,
    };
  };

  const handleLogin = () => {
    if (pinInput === systemPin) {
      setUserRole('admin');
      setIsAuthenticated(true);
      fetchSupabaseData();
    } else {
      const isSubAdmin = subAdmins.find(sa => sa.pin === pinInput);
      if (isSubAdmin) {
        setUserRole('subadmin');
        setLoggedInSubCasinos(isSubAdmin.casinos);
        setIsAuthenticated(true);
        fetchSupabaseData();
        return;
      }
      
      const existePIN = casinos.some(c => c.pin === pinInput);
      if (existePIN) {
        setUserRole('user');
        setLoggedInUserPin(pinInput); 
        setIsAuthenticated(true);
        fetchSupabaseData();
      } else {
        alert("PIN Incorrecto");
        setPinInput('');
      }
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPinInput('');
    setLoggedInUserPin('');
    setLoggedInSubCasinos([]);
    setShowReport(false);
    setShowConfig(false);
  };

  const openConfirmation = (id: number) => {
    const v = inputs[id]?.ventas;
    const u = inputs[id]?.utilidad;
    if ((v === '' || v === undefined) && (u === '' || u === undefined)) {
      return alert("Por favor ingresa al menos un valor (Ventas o Utilidad).");
    }
    setActiveInputId(id);
    setShowConfirmModal(true);
  };

  const confirmEntry = async () => {
    if (!activeInputId) return;
    const ventasToAdd = parseFloat(inputs[activeInputId]?.ventas || '0');
    const utilidadToAdd = parseFloat(inputs[activeInputId]?.utilidad || '0');
    const now = new Date();
    const fechaStr = now.toLocaleString('es-CO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
    const casinoActual = casinos.find(c => c.id === activeInputId);
    if (!casinoActual) return;

    const nuevasVentas = Number(casinoActual.ventasAcumuladas || 0) + ventasToAdd;
    const nuevaUtilidad = Number(casinoActual.utilidad || 0) + utilidadToAdd;
    const esCero = utilidadToAdd === 0 && ventasToAdd === 0;

    setCasinos(prev => prev.map(c => c.id === activeInputId ? { 
      ...c, ventasAcumuladas: nuevasVentas, utilidad: nuevaUtilidad, fecha: fechaStr 
    } : c));
    
    setInputs(prev => ({ ...prev, [activeInputId]: { utilidad: '', ventas: '' } }));
    setShowConfirmModal(false);
    setActiveInputId(null);

    await supabase.from('casinos').update({ 
      ventasAcumuladas: nuevasVentas, utilidad: nuevaUtilidad, fecha: fechaStr, alertaCero: esCero 
    }).eq('id', activeInputId);
  };

  const handleCerrarMes = async () => {
    const añoActual = new Date().getFullYear();
    const fechaCierreStr = new Date().toISOString();

    const { error: errorHistorial } = await supabase.from('historial_cierres').insert([
      { mes: mesACerrar, ano: añoActual, fecha_cierre: fechaCierreStr, datos_json: casinos }
    ]);

    if (errorHistorial) return alert("Error al guardar historial: " + errorHistorial.message);

    const resetPromises = casinos.map(c => 
      supabase.from('casinos').update({ utilidad: 0, ventasAcumuladas: 0, fecha: 'Mes Reiniciado' }).eq('id', c.id)
    );
    await Promise.all(resetPromises);

    alert(`Mes de ${mesACerrar} cerrado exitosamente. Datos guardados en el historial.`);
    setShowCloseMonthModal(false);
    setDiaActual(1);
    fetchSupabaseData(); 
  };

  const toggleSubCasino = (id: number) => {
    setNewSubCasinos(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  };

  const addSubAdmin = () => {
    if (newSubPin.length !== 4) return alert("El PIN debe tener 4 dígitos.");
    if (newSubCasinos.length === 0) return alert("Selecciona al menos un local.");
    
    const newId = Date.now();
    setSubAdmins([...subAdmins, { id: newId, pin: newSubPin, casinos: newSubCasinos }]);
    setNewSubPin('');
    setNewSubCasinos([]);
  };

  const removeSubAdmin = (id: number) => {
    setSubAdmins(subAdmins.filter(sa => sa.id !== id));
  };

  const updateMessageConfig = (id: number, field: string, value: string | number) => {
    setMessagesConfig(prev => prev.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const updateCasinoMeta = async (id: number, field: string, value: any) => {
    let finalValue: any = value;
    if (field !== 'pin' && field !== 'nombre' && field !== 'categoria' && field !== 'dia') {
      finalValue = parseFloat(value) || 0;
    }
    const updates: any = { [field]: finalValue };
    setCasinos(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    await supabase.from('casinos').update(updates).eq('id', id);
  };

  const handleSystemPinUpdate = async (newPin: string) => {
    setSystemPin(newPin);
    await supabase.from('app_config').update({ system_pin: newPin }).eq('id', 1);
  };

  const listaFiltradaVisual = casinos.filter(c => {
    if (userRole === 'admin') {
      if (filtroAdmin === 'TODOS') return true;
      const evalC = evaluarCasino(c);
      if (filtroAdmin === 'CRITICOS') return evalC.rendimientoDiario < 50;
      if (filtroAdmin === 'EXITOSOS') return evalC.rendimientoDiario >= 100;
      return c.categoria === filtroAdmin;
    }
    if (userRole === 'subadmin') {
       if (!loggedInSubCasinos.includes(c.id)) return false;
       if (filtroAdmin === 'TODOS') return true;
       return c.categoria === filtroAdmin; 
    }
    return c.pin === loggedInUserPin;
  });

  const getCasinosProcesados = () => {
    const gruposPorPin: Record<string, Casino[]> = {};
    listaFiltradaVisual.forEach(c => {
      if (!gruposPorPin[c.pin]) gruposPorPin[c.pin] = [];
      gruposPorPin[c.pin].push(c);
    });

    const listaFinal: Casino[] = [];

    Object.keys(gruposPorPin).forEach(pin => {
      const grupo = gruposPorPin[pin];
      if (grupo.length > 1) {
        const primerPalabra = grupo[0].nombre.split(' ')[0];
        const consolidado: Casino = {
          id: -(parseInt(pin) || Math.floor(Math.random()*10000)), 
          nombre: `CONSOLIDADO ${primerPalabra}`,
          categoria: 'GENERAL',
          dia: grupo[0].dia,
          metaMensual: grupo.reduce((sum, c) => sum + Number(c.metaMensual), 0),
          metaUtilidad: grupo.reduce((sum, c) => sum + Number(c.metaUtilidad), 0),
          pin: pin,
          utilidad: grupo.reduce((sum, c) => sum + Number(c.utilidad), 0),
          ventasAcumuladas: grupo.reduce((sum, c) => sum + Number(c.ventasAcumuladas || 0), 0),
          fecha: grupo.map(c => c.fecha).sort().reverse()[0] || 'N/A', 
          alertaCero: grupo.some(c => c.alertaCero),
          isConsolidado: true
        };
        listaFinal.push(consolidado);
      }
      listaFinal.push(...grupo);
    });

    return listaFinal;
  };

  const localesAMostrar = getCasinosProcesados();

  const calcularTotalesBase = (lista: Casino[]) => {
    return lista.reduce((acc, c) => {
      const evalC = evaluarCasino(c);
      return {
        metaVentas: acc.metaVentas + Number(evalC.metaMensual),
        ventasReales: acc.ventasReales + Number(evalC.ventasAcumuladas),
        metaUtilidad: acc.metaUtilidad + Number(evalC.metaUtilidad),
        utilidadReal: acc.utilidadReal + Number(evalC.utilidad)
      };
    }, { metaVentas: 0, ventasReales: 0, metaUtilidad: 0, utilidadReal: 0 });
  };

  const totalesVisuales = calcularTotalesBase(listaFiltradaVisual);
  const listaTodosLocales = casinos.filter(c => {
    if (userRole === 'admin') return true;
    if (userRole === 'subadmin') return loggedInSubCasinos.includes(c.id);
    return c.pin === loggedInUserPin;
  });
  
  const totalesGenerales = calcularTotalesBase(listaTodosLocales);
  const totalesGambling = calcularTotalesBase(listaTodosLocales.filter(c => c.categoria === 'GAMBLING'));
  const totalesSociedades = calcularTotalesBase(listaTodosLocales.filter(c => c.categoria === 'SOCIEDADES'));

  const porcentajeGlobalUtilidad = totalesGenerales.metaUtilidad > 0 ? (totalesGenerales.utilidadReal / totalesGenerales.metaUtilidad) * 100 : 0;
  const porcentajeTiempo = Math.round((diaActual / 30) * 100);

  const exportarCSV = () => {
    let csv = "Local,Meta Ventas,Ventas Reales,Meta Utilidad,Utilidad Real,Falta Para Cumplir %,Rendimiento Diario %,Fecha Cierre\n";
    localesAMostrar.filter(c => !c.isConsolidado).forEach(c => {
      const data = evaluarCasino(c);
      csv += `${data.nombre},${data.metaMensual},${data.ventasAcumuladas},${data.metaUtilidad},${data.utilidad},${data.faltanteParaCumplir},${data.rendimientoDiario.toFixed(2)}%,${data.fecha || 'N/A'}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "reporte_casinos.csv";
    link.click();
  };
  
  const InstallModal = () => (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[100] p-4">
      <div className="bg-gray-800 p-6 rounded-2xl border border-emerald-500/30 w-full max-w-md relative">
        <button onClick={() => setShowInstallModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={20}/></button>
        <div className="text-center mb-6">
          <Smartphone size={32} className="text-emerald-400 mx-auto mb-3" />
          <h3 className="text-xl font-bold text-white">Instalar Aplicación</h3>
        </div>
        <div className="space-y-4">
          <div className="bg-gray-900 p-4 rounded-xl border border-gray-700">
            <h4 className="font-bold text-emerald-400 mb-2">📱 En Android (Chrome)</h4>
            <ol className="text-sm text-gray-300 list-decimal list-inside">
              <li>Toca los <strong>3 puntitos</strong> arriba a la derecha.</li>
              <li>Selecciona <strong>"Agregar a la pantalla principal"</strong>.</li>
            </ol>
          </div>
          <div className="bg-gray-900 p-4 rounded-xl border border-gray-700">
            <h4 className="font-bold text-blue-400 mb-2">🍏 En iPhone (Safari)</h4>
            <ol className="text-sm text-gray-300 list-decimal list-inside">
              <li>Toca el botón <strong>Compartir</strong> (cuadro con flecha).</li>
              <li>Toca <strong>"Agregar a inicio"</strong> (ícono con un +).</li>
            </ol>
          </div>
        </div>
        <button onClick={() => setShowInstallModal(false)} className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-xl mt-6">Entendido</button>
      </div>
    </div>
  );

  if (!isMounted) return null;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center text-white relative p-4">
        {showInstallModal && <InstallModal />}
        <div className="absolute top-4 right-4 z-20">
           <button onClick={() => setShowInstallModal(true)} className="flex items-center gap-2 bg-gray-800 border border-emerald-500/50 text-emerald-400 px-4 py-2 rounded-full text-sm font-bold">
             <Smartphone size={16} /> Instalar App
           </button>
        </div>
        <div className="z-10 text-center mb-8">
          <Shield className="w-16 h-16 mx-auto text-emerald-400 mb-4" />
          <h1 className="text-3xl font-bold text-emerald-400">Casino Control</h1>
          <p className="text-gray-500 mt-2">Sistema Conectado a la Nube</p>
        </div>
        <div className="z-10 bg-gray-900 p-8 rounded-xl border border-gray-800 w-full max-w-sm">
          <input 
            type="password" 
            value={pinInput} 
            onChange={(e) => setPinInput(e.target.value.replace(/\D/g, '').slice(0,4))}
            className="w-full text-center text-2xl tracking-[1em] bg-gray-800 border border-gray-600 rounded px-4 py-3 mb-6 focus:outline-none focus:border-emerald-500"
            placeholder="****"
          />
          <button onClick={handleLogin} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-lg transition">
            Acceder
          </button>
        </div>
      </div>
    );
  }

  // REPORTE FINANCIERO (Sin Cambios)
  if (showReport && userRole !== 'user') {
    return (
      <div className="min-h-screen bg-gray-100 text-gray-900 p-4 md:p-8 animate-in fade-in duration-300">
         <div className="max-w-5xl mx-auto bg-white p-6 md:p-10 rounded-xl shadow-2xl relative print:shadow-none print:p-0">
            <button onClick={() => setShowReport(false)} className="absolute top-6 right-6 text-gray-500 hover:text-red-500 print:hidden flex items-center gap-1">
              <X size={20}/> Cerrar
            </button>
            <button onClick={() => window.print()} className="absolute top-6 right-28 bg-emerald-600 text-white px-4 py-2 rounded font-bold print:hidden">
              🖨️ Imprimir PDF
            </button>

            <div className="border-b-4 border-emerald-600 pb-6 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
               <div className="flex items-center gap-4">
                  <img src="https://z-cdn-media.chatglm.cn/files/9a8f0b6a-4eb0-4355-958e-f0eba195dc97.png?auth_key=1873295030-16af9abaa2f147b5b6f8ada3e9491b35-0-ce3104328fea8a435aa665bd9b5b7482" 
                       alt="Logo Ruleta" 
                       className="w-16 h-16 rounded-full border-2 border-emerald-600 shadow-md object-cover" />
                  <div>
                     <h1 className="text-3xl md:text-4xl font-black text-gray-900 uppercase tracking-tight">Reporte Financiero Casinos</h1>
                     <p className="text-gray-500 font-bold tracking-widest mt-1">División Financiera ITA - {new Date().getFullYear()}</p>
                  </div>
               </div>
               <div className="text-left md:text-right">
                  <p className="text-xl font-bold text-emerald-600">Día {diaActual} del Ciclo</p>
                  <p className="text-sm text-gray-500">Impresión: {new Date().toLocaleDateString('es-CO')}</p>
               </div>
            </div>

            <div className="space-y-6 mb-10">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="bg-gray-100 p-5 rounded-lg border-l-4 border-gray-400">
                    <h3 className="text-xs font-bold text-gray-500 uppercase mb-2">Total General - Ventas</h3>
                    <div className="flex justify-between items-end">
                       <div>
                          <p className="text-2xl font-black text-gray-800">{formatoPesos(totalesGenerales.ventasReales)}</p>
                          <p className="text-xs text-gray-500 mt-1">Meta: {formatoPesos(totalesGenerales.metaVentas)}</p>
                       </div>
                       <span className="text-lg font-bold text-emerald-600">{totalesGenerales.metaVentas > 0 ? ((totalesGenerales.ventasReales/totalesGenerales.metaVentas)*100).toFixed(1) : 0}%</span>
                    </div>
                 </div>
                 <div className="bg-blue-50 p-5 rounded-lg border-l-4 border-blue-500">
                    <h3 className="text-xs font-bold text-blue-500 uppercase mb-2">Total General - Utilidad</h3>
                    <div className="flex justify-between items-end">
                       <div>
                          <p className="text-2xl font-black text-blue-900">{formatoPesos(totalesGenerales.utilidadReal)}</p>
                          <p className="text-xs text-blue-600 mt-1">Meta: {formatoPesos(totalesGenerales.metaUtilidad)}</p>
                       </div>
                       <span className="text-lg font-bold text-blue-600">{porcentajeGlobalUtilidad.toFixed(1)}%</span>
                    </div>
                 </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
                   <h3 className="font-black text-gray-800 mb-4 border-b pb-2">Sector GAMBLING</h3>
                   <div className="space-y-3">
                     <div className="flex justify-between text-sm">
                       <span className="text-gray-500">Ventas Reales:</span>
                       <span className="font-bold text-emerald-600">{formatoPesos(totalesGambling.ventasReales)}</span>
                     </div>
                     <div className="flex justify-between text-sm">
                       <span className="text-gray-500">Utilidad Real:</span>
                       <span className="font-bold text-blue-600">{formatoPesos(totalesGambling.utilidadReal)}</span>
                     </div>
                     <div className="bg-gray-50 p-2 rounded text-xs text-center text-gray-500 mt-2">
                       Logro Utilidad: <strong className="text-gray-800">{totalesGambling.metaUtilidad > 0 ? ((totalesGambling.utilidadReal/totalesGambling.metaUtilidad)*100).toFixed(1) : 0}%</strong>
                     </div>
                   </div>
                 </div>
                 <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
                   <h3 className="font-black text-gray-800 mb-4 border-b pb-2">Sector SOCIEDADES</h3>
                   <div className="space-y-3">
                     <div className="flex justify-between text-sm">
                       <span className="text-gray-500">Ventas Reales:</span>
                       <span className="font-bold text-emerald-600">{formatoPesos(totalesSociedades.ventasReales)}</span>
                     </div>
                     <div className="flex justify-between text-sm">
                       <span className="text-gray-500">Utilidad Real:</span>
                       <span className="font-bold text-blue-600">{formatoPesos(totalesSociedades.utilidadReal)}</span>
                     </div>
                     <div className="bg-gray-50 p-2 rounded text-xs text-center text-gray-500 mt-2">
                       Logro Utilidad: <strong className="text-gray-800">{totalesSociedades.metaUtilidad > 0 ? ((totalesSociedades.utilidadReal/totalesSociedades.metaUtilidad)*100).toFixed(1) : 0}%</strong>
                     </div>
                   </div>
                 </div>
               </div>
            </div>

            <h2 className="text-xl font-bold text-gray-800 border-b-2 border-gray-200 pb-2 mb-4">Desglose de Locales</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse mb-10 min-w-max">
                 <thead>
                   <tr className="bg-gray-100 text-gray-600 text-sm">
                     <th className="p-3 border-b border-gray-300">Sede</th>
                     <th className="p-3 border-b border-gray-300">Ventas</th>
                     <th className="p-3 border-b border-gray-300">Utilidad</th>
                     <th className="p-3 border-b border-gray-300">Logro %</th>
                     <th className="p-3 border-b border-gray-300">Estado Diario</th>
                   </tr>
                 </thead>
                 <tbody>
                   {listaTodosLocales.map(c => {
                     const d = evaluarCasino(c);
                     return (
                       <tr key={d.id} className="border-b border-gray-200 text-sm hover:bg-gray-50">
                         <td className="p-3 font-bold text-gray-800">{d.nombre}</td>
                         <td className="p-3 text-gray-600">{formatoPesos(d.ventasAcumuladas)}</td>
                         <td className="p-3 font-bold text-blue-700">{formatoPesos(d.utilidad)}</td>
                         <td className="p-3 font-bold">{d.porcentajeMensual.toFixed(1)}%</td>
                         <td className={`p-3 font-bold ${d.rendimientoDiario < 90 ? 'text-red-500' : (d.rendimientoDiario >= 100 ? 'text-green-500' : 'text-yellow-500')}`}>
                           {d.rendimientoDiario < 90 ? 'Crítico' : (d.rendimientoDiario >= 100 ? 'Óptimo' : 'Alerta')}
                         </td>
                       </tr>
                     )
                   })}
                 </tbody>
              </table>
            </div>
         </div>
      </div>
    );
  }

  const abonoVentas = parseFloat(inputs[activeInputId!]?.ventas || '0');
  const abonoUtilidad = parseFloat(inputs[activeInputId!]?.utilidad || '0');

  return (
    <div className="min-h-screen bg-gray-900 text-white pb-20 p-4 md:p-8">
      {showInstallModal && <InstallModal />}
      
      {/* MODAL GRÁFICA INDIVIDUAL */}
      {activeGraphCasino && (
        <div className="fixed inset-0 z-[150] flex flex-col p-4 md:p-8 animate-in fade-in zoom-in duration-300">
           
           <div className={`absolute inset-0 ${activeGraphCasino.bg} opacity-90 backdrop-blur-xl transition-colors duration-500`}></div>
           
           <div className="relative z-10 flex flex-col h-full">
               <div className="flex justify-between items-center border-b border-white/20 pb-4 mb-4">
                  <div>
                    <h2 className="text-3xl md:text-5xl font-black text-white uppercase drop-shadow-md">{activeGraphCasino.nombre}</h2>
                    <p className="text-white/80 font-bold tracking-widest mt-1">Análisis de Utilidad: Meta vs Realidad</p>
                  </div>
                  <button onClick={() => setActiveGraphCasino(null)} className="bg-black/30 text-white hover:bg-red-600 hover:text-white p-3 rounded-xl transition backdrop-blur-md border border-white/10">
                    <X size={32} />
                  </button>
               </div>
               
               <div className="flex justify-center gap-8 md:gap-24 items-end mt-4 h-full pb-10">
                  
                  {/* Barra META */}
                  <div className="flex flex-col items-center">
                     <div className="text-center mb-4">
                        <p className="text-[10px] md:text-sm text-white/60 font-bold uppercase tracking-widest leading-tight">Meta de<br/>Utilidad</p>
                        <p className="text-lg md:text-3xl font-black text-white">{formatoPesos(activeGraphCasino.metaUtilidad)}</p>
                     </div>
                     <div className="w-16 md:w-24 h-[40vh] md:h-[50vh] bg-black/40 rounded-t-xl border border-white/20 border-b-0 relative shadow-2xl">
                        <div className="absolute bottom-0 w-full h-full bg-white/20 rounded-t-xl shadow-[inset_-5px_0_15px_rgba(0,0,0,0.6)]"></div>
                     </div>
                  </div>

                  {/* Barra ACUMULADO REAL */}
                  <div className="flex flex-col items-center">
                     <div className="text-center mb-4">
                        <p className="text-[10px] md:text-sm text-blue-300 font-bold uppercase tracking-widest leading-tight">Total<br/>Acumulado</p>
                        <p className="text-lg md:text-3xl font-black text-blue-300">{formatoPesos(activeGraphCasino.utilidad)}</p>
                     </div>
                     <div className="w-16 md:w-24 h-[40vh] md:h-[50vh] bg-black/40 rounded-t-xl border border-white/20 border-b-0 relative shadow-2xl">
                        
                        {/* MARCADOR DÍA */}
                        <div className="absolute left-[-55px] md:left-[-75px] flex items-center gap-1 z-20" style={{ bottom: `${Math.min((diaActual / 30) * 100, 100)}%` }}>
                           <span className="text-[10px] md:text-sm text-white font-bold">Día {diaActual}</span>
                           <div className="w-4 h-px bg-white"></div>
                        </div>

                        {/* BARRA LLENADO */}
                        <div className="absolute bottom-0 w-full rounded-t-xl transition-all duration-1000 flex justify-center shadow-[inset_-5px_0_15px_rgba(0,0,0,0.6)]"
                             style={{ 
                               height: `${Math.min(activeGraphCasino.porcentajeMensual, 100)}%`,
                               background: activeGraphCasino.utilidad >= activeGraphCasino.metaUtilidad ? 'linear-gradient(to top, #047857, #34d399)' : 'linear-gradient(to top, #1e3a8a, #3b82f6)'
                             }}>
                           
                           {/* PORCENTAJE */}
                           <div className="absolute -top-6 w-full text-center">
                              <span className={`text-[11px] md:text-sm font-black ${activeGraphCasino.color} drop-shadow-md`}>{activeGraphCasino.porcentajeMensual.toFixed(1)}%</span>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>

               {/* RECUADRO MOTIVACIONAL */}
               <div className="mb-4 w-full max-w-xl mx-auto border border-white/30 rounded-xl p-4 bg-black/30 backdrop-blur-md shadow-lg text-center">
                  <p className={`text-sm md:text-base font-serif italic font-light tracking-wide ${activeGraphCasino.color}`}>
                     {activeGraphCasino.mensaje}
                  </p>
               </div>

           </div>
        </div>
      )}

      {/* CONFIRMAR INGRESO */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-600 w-full max-w-sm text-center">
             <AlertTriangle className="mx-auto text-yellow-400 mb-4" size={48} />
             <h3 className="text-xl font-bold mb-4">Confirmar Cierre</h3>
             <div className="bg-gray-900 p-4 rounded-lg mb-6 border border-gray-700">
               <p className="text-gray-400 text-sm mb-2">Se sumarán a los acumulados:</p>
               <p className="text-emerald-400 font-bold mb-1">Ventas: {formatoPesos(abonoVentas)}</p>
               <p className="text-blue-400 font-bold">Utilidad: {formatoPesos(abonoUtilidad)}</p>
             </div>
             <div className="flex gap-4">
               <button onClick={() => setShowConfirmModal(false)} className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded font-bold">Cancelar</button>
               <button onClick={confirmEntry} className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded font-bold">Sí, Sumar</button>
             </div>
          </div>
        </div>
      )}

      {/* CIERRE DE MES */}
      {showCloseMonthModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 p-6 rounded-xl border border-red-500 w-full max-w-sm text-center shadow-[0_0_20px_rgba(239,68,68,0.5)]">
             <Save className="mx-auto text-red-500 mb-4" size={48} />
             <h3 className="text-xl font-bold mb-2">Guardar y Reiniciar Mes</h3>
             <p className="text-gray-400 text-sm mb-4">
               Esta acción guardará una copia de seguridad en el historial y <span className="text-white font-bold underline">borrará las ventas y utilidades</span> actuales para empezar de cero.
             </p>
             <div className="bg-gray-900 p-4 rounded-lg mb-6 border border-gray-700 text-left">
               <label className="text-xs text-gray-500 block mb-1">Mes que estás cerrando:</label>
               <input type="text" value={mesACerrar} onChange={(e) => setMesACerrar(e.target.value)} className="w-full bg-gray-800 border border-gray-600 p-2 rounded text-white font-bold" />
             </div>
             <div className="flex gap-4">
               <button onClick={() => setShowCloseMonthModal(false)} className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded font-bold">Cancelar</button>
               <button onClick={handleCerrarMes} className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-500 rounded font-bold">Cerrar Mes</button>
             </div>
          </div>
        </div>
      )}

      {/* NAVBAR */}
      <nav className="mb-4 flex flex-col md:flex-row justify-between items-center gap-4 border-b border-gray-700 pb-4">
        <div className="flex items-center gap-3">
          <Shield className="text-emerald-500" size={32} />
          <div>
            <h1 className="text-2xl font-bold">Casino Control <span className="text-emerald-400">2026</span></h1>
            <p className="text-xs text-gray-500">🟢 En línea - BD Sincronizada</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-3 bg-gray-800 p-2 rounded-lg border border-gray-700">
            {userRole === 'admin' ? (
              <span className="text-emerald-400 flex items-center gap-1 text-sm font-bold"><Shield size={16}/> ADMIN</span>
            ) : userRole === 'subadmin' ? (
              <span className="text-purple-400 flex items-center gap-1 text-sm font-bold"><Users size={16}/> SUB-ADMIN</span>
            ) : (
              <span className="text-blue-400 flex items-center gap-1 text-sm font-bold"><User size={16}/> Local</span>
            )}
            <div className="w-px h-4 bg-gray-600"></div>
            <button onClick={handleLogout} className="text-gray-400 hover:text-red-400 flex items-center gap-1 text-xs">
              <LogOut size={14} /> Salir
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs bg-gray-800 p-2 rounded border border-gray-700">
            <Calendar size={14} className="text-gray-400"/>
            <span>Día:</span>
            <input type="number" min="1" max="31" value={diaActual} onChange={(e) => setDiaActual(Number(e.target.value))} className="w-10 bg-gray-700 text-center rounded text-white text-xs px-1" />
          </div>
        </div>
      </nav>

      {/* PANEL ADMIN Y SUBADMIN */}
      {(userRole === 'admin' || userRole === 'subadmin') && (
        <>
          <div className="mb-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 text-center transition-all duration-300">
              <p className="text-[10px] text-gray-400 uppercase mb-1">Total Meta Ventas</p>
              <p className="text-lg font-bold text-white">{formatoPesos(totalesVisuales.metaVentas)}</p>
            </div>
            <div className="bg-gray-800 p-4 rounded-xl border border-emerald-900 text-center transition-all duration-300">
              <p className="text-[10px] text-emerald-400 uppercase mb-1">Ventas Reales</p>
              <p className="text-lg font-bold text-emerald-400">{formatoPesos(totalesVisuales.ventasReales)}</p>
            </div>
            <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 text-center transition-all duration-300">
              <p className="text-[10px] text-gray-400 uppercase mb-1">Total Meta Utilidad</p>
              <p className="text-lg font-bold text-white">{formatoPesos(totalesVisuales.metaUtilidad)}</p>
            </div>
            <div className="bg-gray-800 p-4 rounded-xl border border-blue-900 text-center transition-all duration-300">
              <p className="text-[10px] text-blue-400 uppercase mb-1">Utilidad Real Hoy</p>
              <p className="text-lg font-bold text-blue-400">{formatoPesos(totalesVisuales.utilidadReal)}</p>
            </div>
          </div>

          <div className="mb-6 flex flex-wrap justify-between items-center gap-4">
            <div className="flex gap-2 flex-wrap bg-gray-800 p-1 rounded-lg border border-gray-700">
              <button onClick={() => setFiltroAdmin('TODOS')} className={`px-4 py-1 rounded text-xs font-bold transition-colors ${filtroAdmin === 'TODOS' ? 'bg-white text-gray-900 shadow' : 'text-gray-400 hover:text-white'}`}>Todos</button>
              <button onClick={() => setFiltroAdmin('GAMBLING')} className={`px-4 py-1 rounded text-xs font-bold transition-colors ${filtroAdmin === 'GAMBLING' ? 'bg-emerald-500 text-white shadow' : 'text-gray-400 hover:text-emerald-400'}`}>Gambling</button>
              <button onClick={() => setFiltroAdmin('SOCIEDADES')} className={`px-4 py-1 rounded text-xs font-bold transition-colors ${filtroAdmin === 'SOCIEDADES' ? 'bg-blue-500 text-white shadow' : 'text-gray-400 hover:text-blue-400'}`}>Sociedades</button>
            </div>
            
            <div className="flex gap-2">
              <button onClick={() => setShowReport(true)} className="flex items-center gap-1 px-4 py-1 rounded text-xs bg-blue-700 hover:bg-blue-600 font-bold border border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]">
                <FileText size={14}/> Reporte Financiero
              </button>
              
              {userRole === 'admin' && (
                <button onClick={() => { setShowConfig(!showConfig); setConfigTarget(null); setConfigTab('metas'); }} className={`flex items-center gap-1 px-4 py-1 rounded text-xs font-bold border transition-colors ${showConfig ? 'bg-white text-gray-900 border-white' : 'bg-gray-700 hover:bg-gray-600 text-white border-gray-600'}`}>
                  <Settings size={14}/> Configuración
                </button>
              )}
              <button onClick={exportarCSV} className="flex items-center gap-1 px-4 py-1 rounded text-xs bg-emerald-600 hover:bg-emerald-500 font-semibold">
                <Download size={14}/> CSV
              </button>
            </div>
          </div>

          {/* PANEL CONFIGURADOR */}
          {showConfig && userRole === 'admin' && (
            <div className="mb-6 bg-gray-800 p-6 rounded-xl border border-emerald-500/50 shadow-lg relative animate-in slide-in-from-top-4 duration-300">
              <button onClick={() => setShowConfig(false)} className="absolute top-4 right-4 bg-red-600/20 text-red-400 flex items-center gap-1 px-3 py-1 rounded hover:bg-red-600 hover:text-white transition">
                <X size={16} /> Cerrar Config
              </button>
              
              <div className="flex gap-2 mb-6 border-b border-gray-700 pb-2 overflow-x-auto">
                 <button onClick={() => setConfigTab('metas')} className={`px-4 py-2 rounded-t-lg text-sm font-bold flex items-center gap-2 ${configTab === 'metas' ? 'bg-emerald-900/50 text-emerald-400 border-b-2 border-emerald-500' : 'text-gray-400 hover:text-white'}`}><Sigma size={16}/> Metas y Locales</button>
                 <button onClick={() => setConfigTab('mensajes')} className={`px-4 py-2 rounded-t-lg text-sm font-bold flex items-center gap-2 ${configTab === 'mensajes' ? 'bg-yellow-900/50 text-yellow-400 border-b-2 border-yellow-500' : 'text-gray-400 hover:text-white'}`}><MessageSquareText size={16}/> Motivación y Semáforo</button>
                 <button onClick={() => setConfigTab('subadmins')} className={`px-4 py-2 rounded-t-lg text-sm font-bold flex items-center gap-2 ${configTab === 'subadmins' ? 'bg-purple-900/50 text-purple-400 border-b-2 border-purple-500' : 'text-gray-400 hover:text-white'}`}><Users size={16}/> Sub-Administradores</button>
                 <button onClick={() => setConfigTab('sistema')} className={`px-4 py-2 rounded-t-lg text-sm font-bold flex items-center gap-2 ${configTab === 'sistema' ? 'bg-blue-900/50 text-blue-400 border-b-2 border-blue-500' : 'text-gray-400 hover:text-white'}`}><KeyRound size={16}/> Sistema y Cierre</button>
              </div>

              {configTab === 'metas' && (
                <div className="space-y-2 max-h-80 overflow-y-auto pr-2 grid md:grid-cols-2 gap-4">
                  {casinos.map(c => (
                    <div key={c.id} onClick={() => setConfigTarget(c.id)} className={`p-3 rounded cursor-pointer border ${configTarget === c.id ? 'bg-emerald-900/50 border-emerald-500' : 'bg-gray-700 hover:bg-gray-600 border-transparent'}`}>
                      <div className="flex justify-between items-center">
                        <p className="font-bold text-sm text-white">{c.nombre}</p>
                        <span className="text-xs bg-gray-900 px-2 py-1 rounded text-gray-400">PIN: {c.pin}</span>
                      </div>
                      {configTarget === c.id && (
                        <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-gray-600" onClick={e => e.stopPropagation()}>
                          <div className="col-span-2">
                            <label className="text-xs text-gray-400">PIN de Acceso Local</label>
                            <input type="text" maxLength={4} value={c.pin} onChange={e => updateCasinoMeta(c.id, 'pin', e.target.value.replace(/\D/g, ''))} className="w-full bg-gray-900 p-2 rounded text-sm text-center font-bold" />
                          </div>
                          <div>
                            <label className="text-xs text-gray-400">Meta Ventas</label>
                            <input type="number" value={c.metaMensual} onChange={e => updateCasinoMeta(c.id, 'metaMensual', e.target.value)} className="w-full bg-gray-900 p-2 rounded text-sm text-white font-bold" />
                          </div>
                          <div>
                            <label className="text-xs text-gray-400">Meta Utilidad</label>
                            <input type="number" value={c.metaUtilidad} onChange={e => updateCasinoMeta(c.id, 'metaUtilidad', e.target.value)} className="w-full bg-gray-900 p-2 rounded text-sm text-white font-bold" />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {configTab === 'mensajes' && (
                <div className="space-y-6">
                  <p className="text-sm text-gray-400">Edita los rangos de porcentaje (Rendimiento Diario) y el mensaje que verá el personal de cada local en su pantalla.</p>
                  {messagesConfig.map(msg => (
                    <div key={msg.id} className="bg-gray-700 p-4 rounded-xl border border-gray-600">
                       <div className="flex gap-4 mb-3 items-center">
                         <div className={`w-4 h-4 rounded-full ${msg.id === 1 ? 'bg-red-500' : msg.id === 2 ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                         <h4 className="font-bold text-white text-sm">Rango {msg.id === 1 ? 'Crítico' : msg.id === 2 ? 'Alerta' : 'Éxito'}</h4>
                       </div>
                       <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div>
                            <label className="text-xs text-gray-400">Mínimo %</label>
                            <input type="number" value={msg.min} onChange={e => updateMessageConfig(msg.id, 'min', Number(e.target.value))} className="w-full bg-gray-900 p-2 rounded text-white font-bold" />
                          </div>
                          <div>
                            <label className="text-xs text-gray-400">Máximo %</label>
                            <input type="number" value={msg.max} onChange={e => updateMessageConfig(msg.id, 'max', Number(e.target.value))} className="w-full bg-gray-900 p-2 rounded text-white font-bold" />
                          </div>
                          <div className="md:col-span-2">
                            <label className="text-xs text-gray-400">Texto Motivacional / Alerta</label>
                            <input type="text" value={msg.mensaje} onChange={e => updateMessageConfig(msg.id, 'mensaje', e.target.value)} className="w-full bg-gray-900 p-2 rounded text-white font-bold" />
                          </div>
                       </div>
                    </div>
                  ))}
                </div>
              )}

              {configTab === 'subadmins' && (
                <div className="grid md:grid-cols-2 gap-8">
                   <div>
                     <h4 className="font-bold text-purple-400 mb-4 border-b border-gray-700 pb-2">Crear Nuevo Sub-Administrador</h4>
                     <label className="text-xs text-gray-400 block mb-1">Nuevo PIN (4 Dígitos)</label>
                     <input type="text" maxLength={4} value={newSubPin} onChange={e => setNewSubPin(e.target.value.replace(/\D/g, ''))} className="w-full bg-gray-900 p-2 rounded text-center text-xl tracking-[1em] mb-4 text-white" placeholder="****"/>
                     
                     <label className="text-xs text-gray-400 block mb-2">Asignar Locales (Selecciona varios):</label>
                     <div className="bg-gray-900 p-3 rounded max-h-40 overflow-y-auto mb-4 border border-gray-700 space-y-2">
                        {casinos.map(c => (
                          <label key={c.id} className="flex items-center gap-2 cursor-pointer text-sm hover:bg-gray-800 p-1 rounded">
                             <input type="checkbox" checked={newSubCasinos.includes(c.id)} onChange={() => toggleSubCasino(c.id)} className="w-4 h-4 accent-purple-500" />
                             {c.nombre}
                          </label>
                        ))}
                     </div>
                     <button onClick={addSubAdmin} className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 rounded transition">Crear Sub-Admin</button>
                   </div>

                   <div>
                     <h4 className="font-bold text-white mb-4 border-b border-gray-700 pb-2">Sub-Administradores Activos</h4>
                     {subAdmins.length === 0 ? (
                       <p className="text-sm text-gray-500 italic">No hay sub-administradores creados.</p>
                     ) : (
                       <div className="space-y-3 max-h-64 overflow-y-auto">
                         {subAdmins.map(sa => (
                           <div key={sa.id} className="bg-gray-700 p-3 rounded border border-gray-600 flex justify-between items-center">
                              <div>
                                <p className="font-bold text-purple-400 tracking-widest">PIN: {sa.pin}</p>
                                <p className="text-xs text-gray-400">{sa.casinos.length} locales asignados</p>
                              </div>
                              <button onClick={() => removeSubAdmin(sa.id)} className="bg-red-600/20 text-red-400 p-2 rounded hover:bg-red-600 hover:text-white transition"><X size={16}/></button>
                           </div>
                         ))}
                       </div>
                     )}
                   </div>
                </div>
              )}

              {configTab === 'sistema' && (
                <div className="grid md:grid-cols-2 gap-8">
                   <div className="bg-gray-700 p-6 rounded-xl border border-blue-500/30">
                     <h4 className="font-bold text-blue-400 mb-2 flex items-center gap-2"><KeyRound size={18}/> Master PIN</h4>
                     <label className="text-xs text-gray-400 block mb-2">Cambiar clave del Administrador Principal</label>
                     <input type="password" value={systemPin} onChange={e => handleSystemPinUpdate(e.target.value.replace(/\D/g, '').slice(0,4))} className="w-full bg-gray-900 p-3 rounded text-2xl tracking-[1em] text-center text-blue-400 focus:outline-none focus:border-blue-500 border border-transparent" />
                   </div>
                   
                   <div className="bg-red-900/20 p-6 rounded-xl border border-red-500/30 text-center flex flex-col justify-center">
                     <h4 className="font-bold text-red-400 text-lg mb-2 flex items-center justify-center gap-2"><Save size={20}/> Cierre Financiero</h4>
                     <p className="text-xs text-gray-400 mb-4">Guarda la data en el Historial DB y reinicia ventas y utilidades a $0 conservando las metas establecidas.</p>
                     <button onClick={() => setShowCloseMonthModal(true)} className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-lg text-sm flex items-center justify-center gap-2 transition shadow-[0_0_15px_rgba(239,68,68,0.5)]">
                       Cerrar Mes y Reiniciar
                     </button>
                   </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* TARJETAS DE LOCALES */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-12">
        {localesAMostrar.map(casino => {
          const data = evaluarCasino(casino);
          const porcentajeTiempo = Math.round((diaActual / 30) * 100);
          const rentabilidad = data.ventasAcumuladas > 0 ? (data.utilidad / data.ventasAcumuladas) * 100 : 0;

          return (
            <div key={data.id} className={`bg-gray-800 rounded-2xl border ${data.isConsolidado ? 'border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.3)]' : 'border-gray-700'} overflow-hidden shadow-xl flex flex-col relative`}>
              
              <div className={`p-4 ${data.bg} border-b border-black/20 relative transition-colors duration-500`}>
                {!data.isConsolidado && (
                  <img src="https://z-cdn-media.chatglm.cn/files/9a8f0b6a-4eb0-4355-958e-f0eba195dc97.png?auth_key=1873295030-16af9abaa2f147b5b6f8ada3e9491b35-0-ce3104328fea8a435aa665bd9b5b7482" alt="Logo" className="absolute top-2 left-2 w-10 h-10 rounded-full border-2 border-white shadow-md object-cover opacity-90"/>
                )}
                
                <button onClick={() => setActiveGraphCasino(data)} className="absolute top-2 right-2 bg-black/20 hover:bg-black/40 text-white p-2 rounded-lg transition backdrop-blur-sm shadow border border-white/10">
                  <BarChart size={20} />
                </button>

                <div className={`flex justify-between items-center ${!data.isConsolidado ? 'ml-12' : ''} mr-10`}>
                  <span className="text-[10px] font-bold bg-black/20 px-2 py-1 rounded uppercase tracking-wider">{data.categoria}</span>
                  <span className="text-xs font-bold text-white/70">{data.fecha || 'Sin cierres'}</span>
                </div>
                
                <h2 className="text-2xl font-black text-center text-white mt-4 mb-1 tracking-tight uppercase">{data.nombre}</h2>
                
                <div className="text-center mb-2">
                   <span className="text-[10px] font-bold bg-black/40 text-emerald-400 border border-emerald-500/30 px-2 py-1 rounded uppercase tracking-wider">
                     Rentabilidad: {rentabilidad.toFixed(1)}%
                   </span>
                </div>

                {data.isConsolidado && (
                  <p className="text-center text-xs font-bold bg-white/20 inline-block px-3 py-1 rounded-full mx-auto w-max mb-2 shadow">⭐ VISTA GLOBAL</p>
                )}
              </div>

              <div className="p-6 flex-grow flex flex-col justify-between">
                
                <div>
                  <div className="grid grid-cols-2 gap-3 text-sm mb-2">
                    <div>
                      <p className="text-gray-400 text-[11px] uppercase">Meta de Ventas</p>
                      <p className="font-bold text-white">{formatoPesos(data.metaMensual)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-400 text-[11px] uppercase">Acumulado Ventas</p>
                      <p className="font-bold text-emerald-400 text-lg">{formatoPesos(data.ventasAcumuladas)}</p>
                    </div>
                  </div>

                  <div className="flex justify-end text-[10px] text-gray-400 px-1 mb-6 mt-1 items-center gap-1">
                    <span>Falta para ventas: <span className={`font-bold text-lg ${data.faltanteVentas <= 0 ? 'text-green-400' : 'text-red-400'}`}>{formatoPesos(Math.max(0, data.faltanteVentas))}</span></span>
                  </div>
                  
                  <div className="h-2 bg-gray-900 rounded-full relative mb-5">
                     <div className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 flex flex-col items-center z-10" style={{ left: `${porcentajeTiempo}%` }}>
                       <span className="text-emerald-400 text-[10px] font-bold absolute bottom-full mb-1 bg-gray-900/80 px-1 rounded border border-emerald-500/30 whitespace-nowrap shadow-lg">
                         Logro Ventas: {data.porcentajeVentas.toFixed(1)}%
                       </span>
                       <div className="w-1 h-5 bg-emerald-500 rounded"></div>
                     </div>
                     <div className="h-full bg-emerald-500 transition-all duration-1000 rounded-full" style={{ width: `${Math.min(data.porcentajeVentas, 100)}%` }}></div>
                  </div>

                  <div className="border-t border-gray-700 my-4"></div>

                  <div className="grid grid-cols-2 gap-3 text-sm mb-2">
                    <div>
                      <p className="text-gray-400 text-[11px] uppercase">Meta Utilidad</p>
                      <p className="font-bold text-blue-400">{formatoPesos(data.metaUtilidad)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-400 text-[11px] uppercase">Total Acumulado</p>
                      <p className="font-bold text-white text-lg">{formatoPesos(data.utilidad)}</p>
                    </div>
                  </div>

                  <div className="flex justify-between text-[11px] px-1 mb-6 mt-1 items-center">
                    <span className="text-gray-400">Deberías llevar: <span className="text-blue-300 font-bold text-lg">{formatoPesos(data.promedioEsperado)}</span></span>
                    <span className="text-gray-400 text-right">Falta cumplir: <span className={`font-bold text-lg ${data.faltanteParaCumplir <= 0 ? 'text-green-400' : 'text-red-400'}`}>{formatoPesos(Math.max(0, data.faltanteParaCumplir))}</span></span>
                  </div>

                  <div className="h-2 bg-gray-900 rounded-full relative mb-6">
                    <div className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 flex flex-col items-center z-10" style={{ left: `${porcentajeTiempo}%` }}>
                      <span className="text-blue-400 text-[10px] font-bold absolute bottom-full mb-1 bg-gray-900/80 px-1 rounded border border-blue-500/30 whitespace-nowrap shadow-lg">
                        Logro Utilidad: {data.porcentajeMensual.toFixed(1)}% | Día {diaActual}
                      </span>
                      <div className="w-1 h-5 bg-blue-500 rounded"></div>
                    </div>
                    <div className={`h-full ${data.barColor} transition-all duration-1000 rounded-full`} style={{ width: `${Math.min(data.porcentajeMensual, 100)}%` }}></div>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-center p-3 rounded-lg mb-4 bg-gray-900 border border-gray-700">
                    <span className={`text-sm font-serif italic font-light ${data.color} text-center`}>{data.mensaje}</span>
                  </div>

                  {!data.isConsolidado && (
                    <div className="bg-gray-900/80 p-3 rounded-xl border border-gray-600">
                      <label className="text-[10px] text-emerald-400 font-bold uppercase block mb-3 text-center">Cierre de Turno</label>
                      
                      <div className="space-y-2 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400 w-16">Ventas:</span>
                          <input
                            type="number" placeholder="$ Ingresar Ventas"
                            className="flex-1 bg-gray-800 text-white px-3 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-emerald-500 text-sm"
                            value={inputs[data.id]?.ventas || ''}
                            onChange={(e) => setInputs((prev) => ({ ...prev, [data.id]: { ...prev[data.id], ventas: e.target.value } }))}
                          />
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400 w-16">Utilidad:</span>
                          <input
                            type="number" placeholder="$ Ingresar Utilidad"
                            className="flex-1 bg-gray-800 text-white px-3 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500 text-sm"
                            value={inputs[data.id]?.utilidad || ''}
                            onChange={(e) => setInputs((prev) => ({ ...prev, [data.id]: { ...prev[data.id], utilidad: e.target.value } }))}
                          />
                        </div>
                      </div>

                      <button 
                        onClick={() => openConfirmation(data.id)}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-lg text-sm transition shadow-lg"
                      >
                        Guardar Datos del Turno
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <footer className="fixed bottom-0 left-0 right-0 bg-gray-950 border-t border-gray-800 p-4 text-center z-40">
        <div className="flex flex-col md:flex-row justify-center items-center gap-2 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
          <span>ITA - Integración Tecnológica Avanzada 2026</span>
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