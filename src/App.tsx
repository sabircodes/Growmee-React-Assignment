import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Checkbox } from 'primereact/checkbox';
import { Paginator } from 'primereact/paginator';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import 'primeicons/primeicons.css';


type Artwork = {
  id: number;
  title: string;
  artist_display: string;
};
const App: React.FC = () => {
  const pageSize = 12; // Rows per page
  const [artworks, setArtworks] = useState<Artwork[]>([]); // Artwork data
  const [selectedIds, setSelectedIds] = useState<number[]>([]); // Selected IDs
  const [loading, setLoading] = useState<boolean>(false); // Loader state
  const [totalRecords, setTotalRecords] = useState<number>(0); // Total API records
  const [page, setPage] = useState<number>(0); // Current page
  const [inputVisible, setInputVisible] = useState<boolean>(false); // Input visibility toggle
  const [inputValue, setInputValue] = useState<string>(""); // Input value
  const [selectAllChecked, setSelectAllChecked] = useState<boolean>(false); // Select all checkbox state

 
  useEffect(() => {
    fetchArtworks();
  }, [page]);

  
  const fetchArtworks = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://api.artic.edu/api/v1/artworks?page=${page + 1}&limit=${pageSize}`
      );
      const data = await response.json();
      setArtworks(data.data || []);
      setTotalRecords(data.pagination?.total || 0);
      setSelectAllChecked(false); 
    } catch (error) {
      console.error("Error fetching artworks:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle pagination changes
  const onPageChange = (event: { page: number }) => {
    setPage(event.page);
  };

  
  const toggleSelectAll = () => {
    setSelectAllChecked(!selectAllChecked);
  };

 
  const toggleCheckbox = (id: number) => {
    setSelectedIds((prevSelectedIds) =>
      prevSelectedIds.includes(id)
        ? prevSelectedIds.filter((selectedId) => selectedId !== id)
        : [...prevSelectedIds, id]
    );
  };

  

const handleInputSubmit = async () => {
  const numRows = parseInt(inputValue, 10);

  // Validate input
  if (isNaN(numRows) || numRows <= 0) {
      console.error("Invalid input value");
      return;
  }

  let newSelectedIds: number[] = [];
  let rowsFetched = 0;
  let currentPage = page;

  while (rowsFetched < numRows) {
      let currentArtworks = artworks;

      // If we're not on the current page, fetch new page data
      if (currentPage !== page || rowsFetched > 0) {
          try {
              const response = await fetch(
                  `https://api.artic.edu/api/v1/artworks?page=${currentPage + 1}&limit=${pageSize}`
              );
              const data = await response.json();
              currentArtworks = data.data;
          } catch (error) {
              console.error("Error fetching artworks:", error);
              break;
          }
      }

      // Add IDs from the current page
      for (let i = 0; i < currentArtworks.length; i++) {
          if (rowsFetched >= numRows) break;
          newSelectedIds.push(currentArtworks[i].id);
          rowsFetched++;
      }

      currentPage++; // Move to the next page
  }

  // Update state
  setSelectedIds(newSelectedIds);
  setPage(Math.floor((numRows - 1) / pageSize));

  // Reset input
  setInputValue("");
  setInputVisible(false);
};


  return (
    <div className="p-20">
      
      <DataTable value={artworks} loading={loading}>
       
        <Column
          header={
            <div className="flex items-center gap-4">
              
              <Checkbox
                checked={selectAllChecked}
                onChange={toggleSelectAll}
              />

              <span>ID</span>

              
              <Button
                icon={inputVisible ? "pi pi-angle-up" : "pi pi-angle-down"}
                className="p-button-text p-button-sm m-0"
                onClick={() => setInputVisible(!inputVisible)}
              />
              {inputVisible && (
                <div className="flex flex-col gap-2 border-2 p-shadow-3 p-mt-2 p-p-2">
                 
                  <div>
                    <InputText
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Enter rows to select"
                      className="p-inputtext-sm p-mb-2"
                    />
                  </div>
                 
                  <div>
                    <Button
                      label="Submit"
                      className="p-button-primary p-button-sm"
                      onClick={handleInputSubmit}
                    />
                  </div>
                </div>
              )}
              </div>
              }
              body={(rowData) => (
            <div className="flex items-center gap-2">
              
              <Checkbox
                checked={selectedIds.includes(rowData.id)}
                onChange={() => toggleCheckbox(rowData.id)}
              />
              <span>{rowData.id}</span>
            </div>
          )}
        />
      
        <Column field="title" header="Name" />
        <Column field="category_titles" header="Category" />
      </DataTable>

     
      <Paginator
        first={page * pageSize}
        rows={pageSize}
        totalRecords={totalRecords}
        onPageChange={onPageChange}
        className="mt-4"
      />
    </div>
  );
};




export default App;
