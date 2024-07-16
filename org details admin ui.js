import React, { useEffect, useState } from 'react';
import MaterialReactTable from 'material-react-table';
import axios from 'axios';
import { Button, TextField } from '@mui/material';

const OrgDetailsTable = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOrgDetails();
  }, []);

  const fetchOrgDetails = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/org-details');
      setData(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleAddRow = async (newRow) => {
    try {
      const response = await axios.post('http://localhost:3000/api/org-details', newRow);
      setData([...data, response.data]);
    } catch (error) {
      console.error('Error adding row:', error);
    }
  };

  const handleUpdateRow = async (updatedRow) => {
    try {
      const response = await axios.put(`http://localhost:3000/api/org-details/${updatedRow.id}`, updatedRow);
      const updatedData = data.map(row => (row.id === updatedRow.id ? response.data : row));
      setData(updatedData);
    } catch (error) {
      console.error('Error updating row:', error);
    }
  };

  const handleDeleteRow = async (rowId) => {
    try {
      await axios.delete(`http://localhost:3000/api/org-details/${rowId}`);
      const updatedData = data.filter(row => row.id !== rowId);
      setData(updatedData);
    } catch (error) {
      console.error('Error deleting row:', error);
    }
  };

  const columns = [
    { accessorKey: 'org_name', header: 'Org Name' },
    { accessorKey: 'nick_name', header: 'Nick Name' },
    { accessorKey: 'widget_id', header: 'Widget ID' },
    { accessorKey: 'orientation', header: 'Orientation' },
  ];

  return (
    <MaterialReactTable
      columns={columns}
      data={data}
      isLoading={isLoading}
      editable={{
        onRowAdd: (newData) => handleAddRow(newData),
        onRowUpdate: (newData) => handleUpdateRow(newData),
        onRowDelete: (oldData) => handleDeleteRow(oldData.id),
      }}
    />
  );
};

export default OrgDetailsTable;
