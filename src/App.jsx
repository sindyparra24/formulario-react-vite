import { useEffect, useState } from 'react'
import './App.css'

const CITIES = ['Guayaquil','Quito','Cuenca','Milagro','Manta','Loja']
const API = import.meta.env.VITE_API_URL || 'http://localhost:4000'

const emptyForm = {
  dni: '',
  nombres: '',
  apellidos: '',
  fechaNacimiento: '',
  genero: 'F',
  ciudad: 'Guayaquil'
}

export default function App(){
  const [form, setForm] = useState(emptyForm)
  const [personas, setPersonas] = useState([])
  const [editId, setEditId] = useState(null)
  const [error, setError] = useState('')
  const [ok, setOk] = useState('')

  async function load(){
    try{
      const res = await fetch(`${API}/api/personas`)
      if(!res.ok) throw new Error('Error al cargar lista')
      const data = await res.json()
      setPersonas(data)
    }catch(e){
      setError('No se pudo cargar la lista. Verifica que el backend esté corriendo.')
    }
  }

  useEffect(()=>{ load() },[])

  function onChange(e){
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  function validate(){
    if(!/^\d{10}$/.test(form.dni)) return 'DNI debe tener 10 dígitos'
    if(form.nombres.trim().length < 2) return 'Nombres mínimos 2 caracteres'
    if(form.apellidos.trim().length < 2) return 'Apellidos mínimos 2 caracteres'
    if(!form.fechaNacimiento) return 'Selecciona fecha'
    const d = new Date(form.fechaNacimiento)
    const min = new Date('1900-01-01'); const max = new Date()
    if(d < min || d > max) return 'Fecha fuera de rango'
    return ''
  }

  async function onSubmit(e){
    e.preventDefault()
    const msg = validate()
    if(msg){ setError(msg); setOk(''); return }
    setError('')

    const method = editId ? 'PUT' : 'POST'
    const url = editId ? `${API}/api/personas/${editId}` : `${API}/api/personas`
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
    if(!res.ok){
      const err = await res.json().catch(()=>({}))
      setOk('')
      setError(err?.message || 'Error en el guardado')
      return
    }
    await load()
    setForm(emptyForm)
    setEditId(null)
    setOk(editId ? 'Registro actualizado' : 'Registro creado')
    setTimeout(()=>setOk(''), 1800)
  }

  function edit(p){
    setForm({
      dni: p.dni,
      nombres: p.nombres,
      apellidos: p.apellidos,
      fechaNacimiento: p.fechaNacimiento?.slice(0,10),
      genero: p.genero,
      ciudad: p.ciudad
    })
    setEditId(p._id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function removeItem(id){
    if(!confirm('¿Eliminar registro?')) return
    await fetch(`${API}/api/personas/${id}`, { method: 'DELETE' })
    await load()
  }

  return (
    <div className="page">
      {/* HERO */}
      <header className="hero">
        <div className="hero-inner">
          <div className="brand">MUNDO MARVEL</div>
          <h1 className="title">FORMULARIO DE REGISTRO</h1>
          <p className="subtitle">Regístrate para tener más información sobre tu superhéroe favorito.</p>
        </div>
        <div className="hero-shine" />
      </header>

      {/* BLOQUE CENTRADO */}
      <main className="container">
        <section className="card">
          <h2 className="card-title">{editId ? 'Editar registro' : 'Nuevo registro'}</h2>

          {error && <div className="alert error">{error}</div>}
          {ok && <div className="alert ok">{ok}</div>}

          <form onSubmit={onSubmit} className="form-grid">
            <label>
              <span>DNI</span>
              <input name="dni" value={form.dni} onChange={onChange} required pattern="\d{10}" placeholder="10 dígitos" />
            </label>

            <label>
              <span>Nombres</span>
              <input name="nombres" value={form.nombres} onChange={onChange} required placeholder="Ej: Peter" />
            </label>

            <label>
              <span>Apellidos</span>
              <input name="apellidos" value={form.apellidos} onChange={onChange} required placeholder="Ej: Parker" />
            </label>

            <label>
              <span>Fecha de nacimiento</span>
              <input type="date" name="fechaNacimiento" value={form.fechaNacimiento} onChange={onChange} required />
            </label>

            <fieldset className="radios">
              <legend>Género</legend>
              {['F','M','O'].map(g => (
                <label key={g} className="radio">
                  <input type="radio" name="genero" value={g} checked={form.genero===g} onChange={onChange} /> {g}
                </label>
              ))}
            </fieldset>

            <label>
              <span>Ciudad</span>
              <select name="ciudad" value={form.ciudad} onChange={onChange}>
                {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>

            <div className="actions">
              <button className="btn primary" type="submit">{editId ? 'Actualizar' : 'Guardar'}</button>
              {editId && (
                <button className="btn ghost" type="button" onClick={()=>{ setForm(emptyForm); setEditId(null); setError(''); setOk(''); }}>
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="card">
          <h2 className="card-title">Registros</h2>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>DNI</th><th>Nombres</th><th>Apellidos</th><th>Fecha Nac.</th><th>Género</th><th>Ciudad</th><th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {personas.length === 0 && (
                  <tr><td colSpan="7" className="empty">No hay registros todavía.</td></tr>
                )}
                {personas.map(p => (
                  <tr key={p._id}>
                    <td>{p.dni}</td>
                    <td>{p.nombres}</td>
                    <td>{p.apellidos}</td>
                    <td>{p.fechaNacimiento?.slice(0,10)}</td>
                    <td>{p.genero}</td>
                    <td>{p.ciudad}</td>
                    <td className="row-actions">
                      <button className="btn small" onClick={()=>edit(p)}>Editar</button>
                      <button className="btn small danger" onClick={()=>removeItem(p._id)}>Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <footer className="footer">
        <span>© Derechos reservados — Sindy Parra 2025</span>
      </footer>
    </div>
  )
}
