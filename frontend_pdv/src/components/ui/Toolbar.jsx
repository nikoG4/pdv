import React, { useState, useEffect } from 'react'
import { Button } from './button';
import { SearchIcon } from './icons';
import { Input } from './input';

const Toolbar = ({ dataArray, setDataArray, searchableColumns, buttons }) => {

    const [searchQuery, setSearchQuery] = useState('');


    const handleSearch = (event) => {
        const searchQuery = event.target.value;
        setSearchQuery(searchQuery);

        const filtered = dataArray.filter((data) => 
            searchableColumns.some(column => data[column] && data[column].toString().toLowerCase().includes(searchQuery.toLowerCase())) 
        );
        
        setDataArray(filtered);
    };

    return (
        <div className="flex justify-between items-center">
            <div className="relative w-80">
                <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Búsqueda"
                    value={searchQuery}
                    onChange={handleSearch} // Escuchar cambios en el input
                    className="w-full bg-background shadow-none appearance-none pl-8 md:w-2/3 lg:w-3/3"
                />
            </div>
            {
                buttons.map((button) => (
                    <Button variant="primary" onClick={button.onClick} key={button.label}>
                        {button.icon}
                        {button.label}
                    </Button>
                ))
            }
        </div>
    );
}

export default Toolbar;
