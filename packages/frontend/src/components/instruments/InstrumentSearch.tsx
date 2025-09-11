import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { useDebounce } from '../../hooks/useDebounce';
import api, { endpoints } from '../../lib/api';
import Input from '../ui/Input';
import { FinancialInstrument } from '../../types/api';

interface InstrumentSearchProps {
  onSelect: (instrument: FinancialInstrument) => void;
}

const InstrumentSearch: React.FC<InstrumentSearchProps> = ({ onSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const { data: searchResults, isLoading } = useQuery(
    ['instrumentSearch', debouncedSearchTerm],
    async () => {
      if (!debouncedSearchTerm) {
        return [];
      }
      const response = await api.get(
        `${endpoints.instruments}/search?q=${debouncedSearchTerm}`
      );
      return response.data;
    },
    {
      enabled: !!debouncedSearchTerm,
    }
  );

  const handleSelect = (instrument: FinancialInstrument) => {
    setSearchTerm('');
    onSelect(instrument);
  };

  return (
    <div className="relative">
      <Input
        type="text"
        placeholder="Search for an instrument..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
      />
      {isLoading && <p>Loading...</p>}
      {searchResults && searchResults.length > 0 && (
        <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg mt-1">
          {searchResults.map((instrument: FinancialInstrument) => (
            <li
              key={instrument.id}
              className="px-4 py-2 cursor-pointer hover:bg-gray-100"
              onClick={() => handleSelect(instrument)}
            >
              {instrument.symbol} - {instrument.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default InstrumentSearch;
