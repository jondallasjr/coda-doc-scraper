import React from 'react';
import { CopyIcon, LoadingSpinner } from '../DataDisplay/Icons';

const TableListView = ({
  tables,
  selectedTables,
  setSelectedTables,
  onCopyTable,
  onSelectRowsOption,
  rowOptions,
  selectedRowCounts,
  isCopying
}) => {
  const handleSelectTable = (tableId) => {
    const newSelectedTables = new Set(selectedTables);
    
    if (newSelectedTables.has(tableId)) {
      newSelectedTables.delete(tableId);
    } else {
      newSelectedTables.add(tableId);
    }
    
    setSelectedTables(newSelectedTables);
  };

  const handleSelectAll = () => {
    if (selectedTables.size === tables.length) {
      // Deselect all if all are already selected
      setSelectedTables(new Set());
    } else {
      // Select all tables
      setSelectedTables(new Set(tables.map(table => table.id)));
    }
  };

  return (
    <div className="bg-white p-6 border rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">Available Tables</h2>
        <button
          onClick={handleSelectAll}
          className="px-3 py-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
        >
          {selectedTables.size === tables.length ? 'Deselect All' : 'Select All'}
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <span className="sr-only">Select</span>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Table Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rows
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Modified
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Data To Include
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <span className="sr-only">Copy</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tables.map((table) => (
              <tr 
                key={table.id}
                className={selectedTables.has(table.id) ? 'bg-blue-50' : 'hover:bg-gray-50'}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    id={`table-${table.id}`}
                    checked={selectedTables.has(table.id)}
                    onChange={() => handleSelectTable(table.id)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <label htmlFor={`table-${table.id}`} className="font-medium text-gray-900">
                    {table.name}
                  </label>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {table.rowCount}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(table.updatedAt || Date.now()).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex space-x-2">
                    {rowOptions.map((option) => (
                      <button
                        key={`${table.id}-${option.value}`}
                        onClick={() => onSelectRowsOption(table.id, option.value)}
                        disabled={!selectedTables.has(table.id)}
                        className={`px-2 py-1 rounded-md text-xs font-medium ${
                          selectedTables.has(table.id) && selectedRowCounts[table.id] === option.value
                            ? 'bg-gray-700 text-white'
                            : !selectedTables.has(table.id)
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => onCopyTable(table.id)}
                    disabled={!selectedTables.has(table.id) || isCopying[table.id]}
                    className={`p-1 rounded-md ${!selectedTables.has(table.id) ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}
                    title="Copy Table JSON"
                  >
                    {isCopying[table.id] ? (
                      <LoadingSpinner className="h-5 w-5 text-blue-500" />
                    ) : (
                      <CopyIcon className="h-5 w-5" />
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {tables.length === 0 && (
        <div className="text-center py-6 text-gray-500">
          No tables found. Enter your API Token and Document ID to load tables.
        </div>
      )}
    </div>
  );
};

export default TableListView;