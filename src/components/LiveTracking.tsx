import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { Icon } from 'leaflet';
import { ArrowLeft, Clock, MapPin, Gauge } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { TrainWithDetails, Station } from '../types/database';
import 'leaflet/dist/leaflet.css';

interface LiveTrackingProps {
  trainId: string;
  onBack: () => void;
}

const trainIcon = new Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiMxRTQwQUYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cmVjdCB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHg9IjQiIHk9IjMiIHJ4PSIyIi8+PHBhdGggZD0iTTQgMTFoMTYiLz48cGF0aCBkPSJNMTIgM3YxOCIvPjxjaXJjbGUgY3g9IjgiIGN5PSIxNSIgcj0iMSIvPjxjaXJjbGUgY3g9IjE2IiBjeT0iMTUiIHI9IjEiLz48L3N2Zz4=',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});

const stationIcon = new Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSIjRUY0NDQ0IiBzdHJva2U9IiNGRkZGRkYiIHN0cm9rZS13aWR0aD0iMiI+PGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iOCIvPjwvc3ZnPg==',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, -10],
});

export default function LiveTracking({ trainId, onBack }: LiveTrackingProps) {
  const [train, setTrain] = useState<TrainWithDetails | null>(null);
  const [routeStations, setRouteStations] = useState<Station[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTrainDetails();
    const interval = setInterval(fetchTrainDetails, 5000);
    return () => clearInterval(interval);
  }, [trainId]);

  const fetchTrainDetails = async () => {
    const { data: trainData } = await supabase
      .from('trains')
      .select(`
        *,
        source_station:stations!trains_source_station_id_fkey(*),
        destination_station:stations!trains_destination_station_id_fkey(*)
      `)
      .eq('id', trainId)
      .maybeSingle();

    if (trainData) {
      const { data: locationData } = await supabase
        .from('train_locations')
        .select(`
          *,
          current_station:stations!train_locations_current_station_id_fkey(*),
          next_station:stations!train_locations_next_station_id_fkey(*)
        `)
        .eq('train_id', trainId)
        .maybeSingle();

      setTrain({
        ...trainData,
        source_station: Array.isArray(trainData.source_station) ? trainData.source_station[0] : trainData.source_station,
        destination_station: Array.isArray(trainData.destination_station) ? trainData.destination_station[0] : trainData.destination_station,
        location: locationData || undefined,
        current_station: locationData?.current_station?.[0] || locationData?.current_station,
        next_station: locationData?.next_station?.[0] || locationData?.next_station,
      });

      const { data: stations } = await supabase
        .from('stations')
        .select('*')
        .eq('line', trainData.line)
        .order('sequence_order');

      if (stations) {
        setRouteStations(stations);
      }
    }

    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading train details...</p>
        </div>
      </div>
    );
  }

  if (!train || !train.location) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Train details not available</p>
          <button
            onClick={onBack}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const mapCenter: [number, number] = [train.location.latitude, train.location.longitude];
  const routeCoordinates: [number, number][] = routeStations.map(s => [s.latitude, s.longitude]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Search
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="h-[500px] relative">
                  <MapContainer
                    center={mapCenter}
                    zoom={12}
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {routeCoordinates.length > 0 && (
                      <Polyline
                        positions={routeCoordinates}
                        color="#3B82F6"
                        weight={3}
                        opacity={0.5}
                      />
                    )}

                    {routeStations.map((station) => (
                      <Marker
                        key={station.id}
                        position={[station.latitude, station.longitude]}
                        icon={stationIcon}
                      >
                        <Popup>
                          <div className="text-sm">
                            <strong>{station.name}</strong>
                            <br />
                            <span className="text-gray-600">{station.code}</span>
                          </div>
                        </Popup>
                      </Marker>
                    ))}

                    <Marker position={mapCenter} icon={trainIcon}>
                      <Popup>
                        <div className="text-sm">
                          <strong>{train.train_name}</strong>
                          <br />
                          Train #{train.train_number}
                          <br />
                          <span className="text-gray-600">
                            Speed: {train.location.speed.toFixed(0)} km/h
                          </span>
                        </div>
                      </Popup>
                    </Marker>
                  </MapContainer>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-1">
                  {train.train_name}
                </h2>
                <p className="text-gray-600 mb-4">Train #{train.train_number}</p>

                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                    <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-600 mb-1">Current Station</p>
                      <p className="font-semibold text-gray-800">
                        {train.current_station?.name || 'Unknown'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                    <MapPin className="w-5 h-5 text-green-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-600 mb-1">Next Station</p>
                      <p className="font-semibold text-gray-800">
                        {train.next_station?.name || 'Unknown'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                    <Clock className="w-5 h-5 text-orange-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-600 mb-1">ETA</p>
                      <p className="font-semibold text-gray-800">
                        {train.location.eta_minutes} minutes
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <Gauge className="w-5 h-5 text-gray-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-600 mb-1">Current Speed</p>
                      <p className="font-semibold text-gray-800">
                        {train.location.speed.toFixed(0)} km/h
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="font-semibold text-gray-800 mb-3">Route Information</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">From:</span>
                    <span className="font-medium text-gray-800">
                      {train.source_station?.name}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">To:</span>
                    <span className="font-medium text-gray-800">
                      {train.destination_station?.name}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Line:</span>
                    <span className="font-medium text-gray-800">{train.line}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Status:</span>
                    <span
                      className={`font-medium ${
                        train.status === 'On Time' ? 'text-green-600' : 'text-orange-600'
                      }`}
                    >
                      {train.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm text-blue-800">
                  <strong>Live Tracking:</strong> Location updates every 5 seconds
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
