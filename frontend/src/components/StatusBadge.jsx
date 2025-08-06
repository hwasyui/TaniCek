import React from 'react';
import { Tag } from 'antd';

const statusColorMap = {
  active: 'green',
  inactive: 'gold',
  error: 'red',
  maintenance: 'blue',
  unknown: 'default',
};

export function StatusBadge({ status }) {
    
  const color = statusColorMap[status?.toLowerCase()] || 'default';
  return <Tag color={color} style={{ fontWeight: 500 }}>{status || 'Unknown'}</Tag>;
}
