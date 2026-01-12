import { useState, useEffect } from 'react';
import { Search, MapPin, Radio } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Station, TrainWithDetails } from '../types/database';
import SearchResults from './SearchResults';

interface HomePageProps {
  onTrainSelect: (trainId: string) => void;
}

export default function HomePage({ onTrainSelect }: HomePageProps) {
  const [searchType, setSearchType] = useState<'number' | 'route' | 'line'>('number');
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceStation, setSourceStation] = useState('');
  const [destinationStation, setDestinationStation] = useState('');
  const [selectedLine, setSelectedLine] = useState('');
  const [stations, setStations] = useState<Station[]>([]);
  const [searchResults, setSearchResults] = useState<TrainWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    fetchStations();
  }, []);

  const fetchStations = async () => {
    const { data } = await supabase
      .from('stations')
      .select('*')
      .order('name');

    if (data) {
      setStations(data);
    }
  };

  const handleSearch = async () => {
    setIsLoading(true);
    setHasSearched(true);

    let query = supabase
      .from('trains')
      .select(`
        *,
        source_station:stations!trains_source_station_id_fkey(*),
        destination_station:stations!trains_destination_station_id_fkey(*),
        location:train_locations(*)
      `)
      .eq('is_active', true);

    if (searchType === 'number' && searchQuery) {
      query = query.or(`train_number.ilike.%${searchQuery}%,train_name.ilike.%${searchQuery}%`);
    } else if (searchType === 'route' && sourceStation && destinationStation) {
      query = query
        .eq('source_station_id', sourceStation)
        .eq('destination_station_id', destinationStation);
    } else if (searchType === 'line' && selectedLine) {
      query = query.eq('line', selectedLine);
    }

    const { data } = await query;

    if (data) {
      const trainsWithLocation = data.map(train => ({
        ...train,
        source_station: Array.isArray(train.source_station) ? train.source_station[0] : train.source_station,
        destination_station: Array.isArray(train.destination_station) ? train.destination_station[0] : train.destination_station,
        location: Array.isArray(train.location) && train.location.length > 0 ? train.location[0] : undefined
      }));
      setSearchResults(trainsWithLocation);
    }

    setIsLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-3">
              <Radio className="w-10 h-10 text-blue-600" />
              <h1 className="text-4xl font-bold text-gray-800">Train Tracker</h1>
            </div>
            <p className="text-gray-600">Real-time train location tracking and status updates</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex gap-2 mb-6 border-b">
              <button
                onClick={() => setSearchType('number')}
                className={`flex-1 py-3 px-4 font-medium transition-colors ${
                  searchType === 'number'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Search className="w-4 h-4 inline mr-2" />
                Train Number/Name
              </button>
              <button
                onClick={() => setSearchType('route')}
                className={`flex-1 py-3 px-4 font-medium transition-colors ${
                  searchType === 'route'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <MapPin className="w-4 h-4 inline mr-2" />
                Source & Destination
              </button>
              <button
                onClick={() => setSearchType('line')}
                className={`flex-1 py-3 px-4 font-medium transition-colors ${
                  searchType === 'line'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Radio className="w-4 h-4 inline mr-2" />
                Railway Line
              </button>
            </div>

            <div className="space-y-4">
              {searchType === 'number' && (
                <div>
                  <input
                    type="text"
                    placeholder="Enter train number or name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
              )}

              {searchType === 'route' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Source Station
                    </label>
                    <select
                      value={sourceStation}
                      onChange={(e) => setSourceStation(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    >
                      <option value="">Select source...</option>
                      {stations.map((station) => (
                        <option key={station.id} value={station.id}>
                          {station.name} ({station.code})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Destination Station
                    </label>
                    <select
                      value={destinationStation}
                      onChange={(e) => setDestinationStation(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    >
                      <option value="">Select destination...</option>
                      {stations.map((station) => (
                        <option key={station.id} value={station.id}>
                          {station.name} ({station.code})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {searchType === 'line' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Railway Line
                  </label>
                  <select
                    value={selectedLine}
                    onChange={(e) => setSelectedLine(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value="">Select line...</option>
                    <option value="Central">Central Line</option>
                    <option value="Western">Western Line</option>
                    <option value="Harbour">Harbour Line</option>
                  </select>
                </div>
              )}

              <button
                onClick={handleSearch}
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Searching...' : 'Search Trains'}
              </button>
            </div>
          </div>

          {hasSearched && (
            <SearchResults
              trains={searchResults}
              onTrainSelect={onTrainSelect}
              isLoading={isLoading}
            />
          )}
        </div>
      </div>
    </div>
  );
}
