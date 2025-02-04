import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { CopyIcon, TrashIcon } from '../DataDisplay/Icons';

const TableCard = ({
  table,
  apiToken,
  docId,
  selectedColumnAttributes,
  selectedRowAttributes,
  onRemove,
  onTableDataChange, // Callback to update parent
}) => {
  const [rowCount, setRowCount] = useState('1'); // Default to "1 Row"
  const [tableData, setTableData] = useState({ columns: [], rows: [] });
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch column data when the table is selected
  useEffect(() => {
    const fetchColumns = async () => {
      setIsLoading(true);
      setError('');
      try {
        console.log(`Fetching columns for table ${table.id}...`);
        const response = await axios.get(
          `https://coda.io/apis/v1/docs/${docId}/tables/${table.id}/columns`,
          { headers: { Authorization: `Bearer ${apiToken}` } }
        );
        const filteredColumns = filterData(response.data.items, selectedColumnAttributes);
        setTableData((prev) => ({ ...prev, columns: filteredColumns }));
        onTableDataChange(table.id, { columns: filteredColumns, rows: tableData.rows }); // Update parent
      } catch (err) {
        console.error(`Error fetching columns for table ${table.id}:`, err);
        setError('Failed to fetch columns. Please check your inputs and try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchColumns();
  }, [apiToken, docId, table.id, selectedColumnAttributes]);

  // Fetch row data when rowCount changes
  useEffect(() => {
    const fetchRows = async () => {
      setIsLoading(true);
      setError('');
      try {
        if (rowCount === '0') {
          // For "Columns Only", set rows to an empty array
          setTableData((prev) => ({ ...prev, rows: [] }));
          onTableDataChange(table.id, { columns: tableData.columns, rows: [] }); // Update parent
          return;
        }

        console.log(`Fetching rows for table ${table.id} with rowCount: ${rowCount}...`);
        const limit = rowCount === 'All' ? undefined : parseInt(rowCount, 10);
        const response = await axios.get(
          `https://coda.io/apis/v1/docs/${docId}/tables/${table.id}/rows`,
          {
            headers: { Authorization: `Bearer ${apiToken}` },
            params: { limit, valueFormat: 'simpleWithArrays' },
          }
        );
        const filteredRows = filterData(response.data.items, selectedRowAttributes);
        setTableData((prev) => ({ ...prev, rows: filteredRows }));
        onTableDataChange(table.id, { columns: tableData.columns, rows: filteredRows }); // Update parent
      } catch (err) {
        console.error(`Error fetching rows for table ${table.id}:`, err);
        setError('Failed to fetch rows. Please check your inputs and try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRows();
  }, [apiToken, docId, table.id, rowCount, selectedRowAttributes]);

  // Handle copying table data
  const handleCopyTableData = () => {
    const filteredData = {
      columns: filterData(tableData.columns, selectedColumnAttributes),
      rows: filterData(tableData.rows, selectedRowAttributes),
    };
    navigator.clipboard.writeText(JSON.stringify(filteredData, null, 2));
    alert('Table data copied to clipboard!');
  };

  // Filter data based on selected attributes
  const filterData = (data, selectedAttributes) => {
    return data.map((item) => {
      // Log the row data before filtering
      console.log('Row data before filtering:', item);

      // Filter the item based on selected attributes
      const filteredItem = Object.fromEntries(
        Object.entries(item)
          .filter(([key]) => selectedAttributes.includes(key))
          .map(([key, value]) => {
            // If the key is "values" and it's an object, filter out empty string values
            if (key === 'values' && typeof value === 'object' && value !== null) {
              const filteredValues = Object.fromEntries(
                Object.entries(value).filter(([, val]) => val !== '')
              );
              return [key, filteredValues];
            }
            return [key, value];
          })
          .filter(([, value]) => value !== null && value !== '' && value !== undefined)
      );

      // Log the row data after filtering
      console.log('Row data after filtering:', filteredItem);

      return filteredItem;
    });
  };

  // Row selector options
  const rowOptions = [
    { label: 'Columns Only', value: '0', color: 'gray' },
    { label: '1 Row', value: '1', color: 'gray' },
    { label: 'All Rows', value: 'All', color: 'gray' },
  ];

  return (
    <div className="bg-white p-4 border rounded-lg shadow-md mb-4">
      {/* Table Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-md font-semibold">{table.name}</h3>
          <p className="text-sm text-gray-500">{table.rowCount} rows</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleCopyTableData}
            className="text-gray-500 hover:text-gray-700"
            title="Copy Table Data"
          >
            <CopyIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => onRemove(table.id)}
            className="text-gray-500 hover:text-gray-700"
            title="Remove Table"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Num. Rows Selector */}
      <div className="mt-4">
        <div className="flex space-x-2">
          {rowOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setRowCount(option.value)}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                rowCount === option.value
                  ? `bg-gray-700 text-white`
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Preview Section */}
      <div className="mt-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center text-sm text-blue-500 hover:text-blue-600"
        >
          <span>Preview</span>
          {isExpanded ? (
            <ChevronDown className="ml-2 h-4 w-4" />
          ) : (
            <ChevronRight className="ml-2 h-4 w-4" />
          )}
        </button>

        {isExpanded && (
          <div className="mt-4">
            {isLoading ? (
              <div className="animate-pulse space-y-2">
                <div className="bg-gray-200 h-4 rounded"></div>
                <div className="bg-gray-200 h-4 rounded"></div>
                <div className="bg-gray-200 h-4 rounded"></div>
              </div>
            ) : (
              <div className="text-left font-mono text-sm bg-gray-50 p-4 rounded-md overflow-x-auto max-h-60">
                <pre>
                  {JSON.stringify(
                    {
                      columns: filterData(tableData.columns, selectedColumnAttributes),
                      rows: filterData(tableData.rows, selectedRowAttributes),
                    },
                    null,
                    2
                  )}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="mt-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm">
          Error: {error}
        </div>
      )}
    </div>
  );
};

export default TableCard;