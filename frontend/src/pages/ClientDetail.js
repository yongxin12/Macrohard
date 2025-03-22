import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Title3,
  Body1,
  Card,
  CardHeader,
  Text,
  Table,
  TableHeader,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  Spinner,
} from '@fluentui/react-components';

const ClientDetail = () => {
  const { id } = useParams();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClientDetails = async () => {
      try {
        const response = await fetch(`http://localhost:8000/clients/${id}`);
        const data = await response.json();
        setClient(data.client);
        setLoading(false);
      } catch (err) {
        setError('Failed to load client details');
        setLoading(false);
      }
    };

    fetchClientDetails();
  }, [id]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="client-detail">
        <Title3>Error</Title3>
        <Body1>{error}</Body1>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="client-detail">
        <Title3>Client Not Found</Title3>
        <Body1>The requested client could not be found.</Body1>
      </div>
    );
  }

  return (
    <div className="client-detail">
      <Title3>Client Details</Title3>
      
      <Card style={{ marginTop: '20px' }}>
        <CardHeader header={<Text weight="semibold">Personal Information</Text>} />
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>{client.name}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Disability</TableCell>
              <TableCell>{client.disability}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Job Status</TableCell>
              <TableCell>{client.job_status}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default ClientDetail; 