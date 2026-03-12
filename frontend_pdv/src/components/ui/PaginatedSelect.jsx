import React, { useEffect, useState } from 'react';
import Select from 'react-select';

const PaginatedSelect = ({
  loadOptions, // Función para cargar opciones
  label, // Etiqueta para el campo
  placeholder = 'Selecciona una opción', // Placeholder
  isMulti = false, // Soporte para selección múltiple
  ...props // Otras props que se pueden pasar al selector
}) => {
  const [options, setOptions] = useState([]);
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchOptions = async () => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);

    try {
      const newOptions = await loadOptions(page); // Llama a la función para cargar opciones
      setOptions((prev) => [...prev, ...newOptions]);

      // Ajusta esta lógica según tu API para determinar si hay más opciones
      if (newOptions.length < 10) {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error fetching options:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOptions();
  }, [page]);

  const handleScroll = (event) => {
    const bottom = event.target.scrollHeight === event.target.scrollTop + event.target.clientHeight;
    if (bottom) {
      setPage((prev) => prev + 1); // Incrementa la página si se ha llegado al fondo
    }
  };

  return (
    <div onScroll={handleScroll} style={{ maxHeight: '300px', overflowY: 'auto' }}>
      {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
      <Select
        options={options}
        isLoading={isLoading}
        isMulti={isMulti}
        placeholder={placeholder}
        {...props} // Pasa otras props al componente Select
      />
    </div>
  );
};

export default PaginatedSelect;
