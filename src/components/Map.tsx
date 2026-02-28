import { useEffect, useRef } from 'react'
import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import Cluster from 'ol/source/Cluster'
import OSM from 'ol/source/OSM'
import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'
import { fromLonLat, toLonLat } from 'ol/proj'
import { Style, Circle, Fill, Stroke, Text } from 'ol/style'
import type { Task } from '../types'

const activeColor = 'rgb(245, 158, 11)'   // amber
const completedColor = 'rgb(16, 185, 129)' // emerald
const inProgressColor = 'rgb(59, 130, 246)' // blue

function getColor(task: Task) {
  if (task.status === 'completed') return completedColor
  if (task.status === 'in_progress' || task.status === 'pending_verification')
    return inProgressColor
  return activeColor
}

interface MapProps {
  tasks: Task[]
  onTaskClick?: (task: Task) => void
  onMapClick?: (lat: number, lng: number) => void
  showClickToAdd?: boolean
}

export default function MapComponent({
  tasks,
  onTaskClick,
  onMapClick,
  showClickToAdd = false,
}: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<Map | null>(null)

  useEffect(() => {
    if (!mapRef.current) return

    const vectorSource = new VectorSource()
    const clusterSource = new Cluster({
      source: vectorSource,
      distance: 40,
    })

    const clusterStyle = (feature: import('ol/Feature').default) => {
      const size = feature.get('features')?.length ?? 1
      const color = size > 1 ? 'rgb(16, 185, 129)' : getColor(feature.get('features')?.[0]?.get('task') as Task)
      return new Style({
        image: new Circle({
          radius: size > 1 ? 18 : 12,
          fill: new Fill({ color }),
          stroke: new Stroke({ color: 'white', width: 2 }),
        }),
        text: size > 1 ? new Text({
          text: size.toString(),
          fill: new Fill({ color: 'white' }),
          font: 'bold 12px sans-serif',
        }) : undefined,
      })
    }

    const vectorLayer = new VectorLayer({
      source: clusterSource,
      style: clusterStyle,
    })

    const map = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({ source: new OSM() }),
        vectorLayer,
      ],
      view: new View({
        center: fromLonLat([37.6173, 55.7558]),
        zoom: 13,
      }),
    })

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          map.getView().setCenter(fromLonLat([pos.coords.longitude, pos.coords.latitude]))
        },
        () => {}
      )
    }

    mapInstanceRef.current = map
    return () => {
      map.setTarget(undefined)
      mapInstanceRef.current = null
    }
  }, [])

  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return

    const vectorSource = (map.getLayers().item(1) as VectorLayer<VectorSource>)
      .getSource() as Cluster
    const source = vectorSource.getSource()
    source.clear()

    tasks.forEach((task) => {
      const feature = new Feature({
        geometry: new Point(fromLonLat([task.lng, task.lat])),
        task,
      })
      feature.set('task', task)
      source.addFeature(feature)
    })
  }, [tasks])

  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return

    const handleClick = (e: import('ol/MapBrowserEvent').default) => {
      const feature = map.forEachFeatureAtPixel(e.pixel, (f) => f)
      if (feature) {
        const clusterFeatures = feature.get('features') as import('ol/Feature').default[] | undefined
        if (clusterFeatures?.length === 1 && onTaskClick) {
          const task = clusterFeatures[0].get('task') as Task
          if (task) onTaskClick(task)
        } else if (clusterFeatures && clusterFeatures.length > 1) {
          const geom = feature.getGeometry()
          if (geom) {
            map.getView().fit(geom.getExtent(), { padding: [50, 50, 50, 50], maxZoom: 15 })
          }
        }
      } else if (showClickToAdd && onMapClick) {
        const coord = map.getCoordinateFromPixel(e.pixel)
        if (coord) {
          const [lng, lat] = toLonLat(coord)
          onMapClick(lat, lng)
        }
      }
    }

    map.on('click', handleClick)
    return () => map.un('click', handleClick)
  }, [onTaskClick, onMapClick, showClickToAdd])

  return (
    <div
      ref={mapRef}
      className="w-full h-[500px] rounded-xl overflow-hidden border border-stone-200 shadow"
    />
  )
}
