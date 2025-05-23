import React, { useEffect, useState } from 'react'
import axios from 'axios'
import './SeriesCatalog.css'

function SeriesCatalog () {
  const [query, setQuery] = useState('')
  const [series, setSeries] = useState([])
  const [serieSeleccionada, setSerieSeleccionada] = useState(null)
  const [filtroGenero, setFiltroGenero] = useState('Todos')
  const [generosDisponibles, setGenerosDisponibles] = useState(['Todos'])
  const [seriesDestacadas, setSeriesDestacadas] = useState([])

  useEffect(() => {
    cargarSeriesDestacadas()
  }, [])

  const cargarSeriesDestacadas = async () => {
    try {
      const respuesta = await axios.get('https://api.tvmaze.com/shows?page=1')
      const destacadas = respuesta.data.slice(0, 12)
      setSeriesDestacadas(destacadas)
      const generos = new Set(destacadas.flatMap((s) => s.genres))
      setGenerosDisponibles(['Todos', ...Array.from(generos)])
    } catch (error) {
      console.error('Error al cargar series destacadas', error)
    }
  }

  const buscarSeries = async () => {
    try {
      const respuesta = await axios.get(`https://api.tvmaze.com/search/shows?q=${query}`)
      const resultados = respuesta.data.map((item) => item.show)
      setSeries(resultados)
      const generos = new Set(resultados.flatMap((s) => s.genres))
      setGenerosDisponibles(['Todos', ...Array.from(generos)])
    } catch (error) {
      console.error('Error en la búsqueda', error)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') buscarSeries()
  }

  const seriesFiltradas = filtroGenero === 'Todos'
    ? series
    : series.filter((s) => s.genres.includes(filtroGenero))

  const renderSerieCard = (serie) => (
    <div key={serie.id} className='series-card' onClick={() => setSerieSeleccionada(serie)}>
      <img src={serie.image?.medium || 'https://via.placeholder.com/210x295?text=No+Image'} alt={serie.name} />
      <h3>{serie.name}</h3>
      <p>{serie.genres.join(', ')}</p>
    </div>
  )

  return (
    <div className='catalog-container'>
      <h1 className='catalog-title'>🎬 Buscador de Series</h1>

      <div className='catalog-inputs'>
        <input
          type='text'
          value={query}
          placeholder='Escribe el nombre de una serie'
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button onClick={buscarSeries}>Buscar</button>

        {generosDisponibles.length > 1 && (
          <select value={filtroGenero} onChange={(e) => setFiltroGenero(e.target.value)}>
            {generosDisponibles.map((g, index) => (
              <option key={index} value={g}>{g}</option>
            ))}
          </select>
        )}
      </div>

      {series.length === 0 && seriesDestacadas.length > 0 && (
        <>
          <h2>⭐ Series destacadas</h2>
          <div className='series-grid'>
            {seriesDestacadas.map(renderSerieCard)}
          </div>
        </>
      )}

      {series.length > 0 && (
        <>
          <h2>🔍 Resultados</h2>
          <div className='series-grid'>
            {seriesFiltradas.map(renderSerieCard)}
          </div>
        </>
      )}

      {serieSeleccionada && (
        <div className='modal-overlay' onClick={() => setSerieSeleccionada(null)}>
          <div className='modal-content' onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSerieSeleccionada(null)}>✖</button>
            <h2>{serieSeleccionada.name}</h2>
            <img src={serieSeleccionada.image?.original || 'https://via.placeholder.com/400'} alt={serieSeleccionada.name} />
            <p><strong>Géneros:</strong> {serieSeleccionada.genres.join(', ')}</p>
            <p><strong>Resumen:</strong> <span dangerouslySetInnerHTML={{ __html: serieSeleccionada.summary }} /></p>
          </div>
        </div>
      )}
    </div>
  )
}

export default SeriesCatalog
