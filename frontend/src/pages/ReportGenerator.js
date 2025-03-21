import React from 'react';
import {
  Title3,
  Body1,
  Button,
} from '@fluentui/react-components';

const ReportGenerator = () => {
  return (
    <div className="report-generator">
      <Title3>Report Generator</Title3>
      <Body1>Generate reports for client progress and outcomes.</Body1>
      <Button appearance="primary" style={{ marginTop: '10px' }}>Generate Report</Button>
    </div>
  );
};

export default ReportGenerator; 