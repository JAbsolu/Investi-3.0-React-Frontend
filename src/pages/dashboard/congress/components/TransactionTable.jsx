import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  TableSortLabel,
  Box
} from '@mui/material';
import { teal, red, grey } from '@mui/material/colors';
import { FaExternalLinkAlt } from 'react-icons/fa';

const TransactionTable = ({ transactions, title, isCompact = false }) => {
  const [orderBy, setOrderBy] = useState('disclosureDate');
  const [order, setOrder] = useState('desc');

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const sortedTransactions = [...transactions].sort((a, b) => {
    let aVal = a[orderBy];
    let bVal = b[orderBy];
    
    // Handle date sorting
    if (orderBy.includes('Date')) {
      aVal = new Date(aVal);
      bVal = new Date(bVal);
    }
    
    if (order === 'asc') {
      return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    } else {
      return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
    }
  });

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  const handleLinkClick = (link) => {
    if (link) {
      window.open(link, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <TableContainer 
      component={Paper}
      sx={{
        backgroundColor: '#1a1a1a',
        border: `1px solid ${teal[800]}`,
        borderRadius: 2,
      }}
    >
      <Table size={isCompact ? "small" : "medium"}>
        <TableHead>
          <TableRow sx={{ backgroundColor: '#0d0d0d' }}>
            <TableCell sx={{ color: teal[300], fontWeight: 600 }}>
              <TableSortLabel
                active={orderBy === 'firstName'}
                direction={orderBy === 'firstName' ? order : 'asc'}
                onClick={() => handleSort('firstName')}
                sx={{ color: teal[300] }}
              >
                Member
              </TableSortLabel>
            </TableCell>
            <TableCell sx={{ color: teal[300], fontWeight: 600 }}>
              <TableSortLabel
                active={orderBy === 'symbol'}
                direction={orderBy === 'symbol' ? order : 'asc'}
                onClick={() => handleSort('symbol')}
                sx={{ color: teal[300] }}
              >
                Symbol
              </TableSortLabel>
            </TableCell>
            {!isCompact && (
              <TableCell sx={{ color: teal[300], fontWeight: 600 }}>Asset</TableCell>
            )}
            <TableCell sx={{ color: teal[300], fontWeight: 600 }}>
              <TableSortLabel
                active={orderBy === 'type'}
                direction={orderBy === 'type' ? order : 'asc'}
                onClick={() => handleSort('type')}
                sx={{ color: teal[300] }}
              >
                Type
              </TableSortLabel>
            </TableCell>
            <TableCell sx={{ color: teal[300], fontWeight: 600 }}>
              <TableSortLabel
                active={orderBy === 'amount'}
                direction={orderBy === 'amount' ? order : 'asc'}
                onClick={() => handleSort('amount')}
                sx={{ color: teal[300] }}
              >
                Amount
              </TableSortLabel>
            </TableCell>
            <TableCell sx={{ color: teal[300], fontWeight: 600 }}>
              <TableSortLabel
                active={orderBy === 'transactionDate'}
                direction={orderBy === 'transactionDate' ? order : 'asc'}
                onClick={() => handleSort('transactionDate')}
                sx={{ color: teal[300] }}
              >
                {isCompact ? 'Date' : 'Transaction Date'}
              </TableSortLabel>
            </TableCell>
            {!isCompact && (
              <TableCell sx={{ color: teal[300], fontWeight: 600 }}>
                <TableSortLabel
                  active={orderBy === 'disclosureDate'}
                  direction={orderBy === 'disclosureDate' ? order : 'asc'}
                  onClick={() => handleSort('disclosureDate')}
                  sx={{ color: teal[300] }}
                >
                  Disclosure Date
                </TableSortLabel>
              </TableCell>
            )}
            <TableCell sx={{ color: teal[300], fontWeight: 600 }}>Link</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedTransactions.map((transaction, index) => {
            const isPurchase = transaction.type?.toLowerCase() === 'purchase';
            const typeColor = isPurchase ? teal[500] : red[500];
            
            return (
              <TableRow 
                key={index}
                sx={{
                  '&:hover': {
                    backgroundColor: '#222222',
                  },
                }}
              >
                <TableCell sx={{ color: 'white' }}>
                  <Box>
                    <Box sx={{ fontWeight: 600, fontSize: isCompact ? '0.85rem' : '1rem' }}>
                      {transaction.firstName} {transaction.lastName}
                    </Box>
                    <Box sx={{ fontSize: '0.75rem', color: grey[500] }}>
                      {transaction.district && `${transaction.district} • `}
                      {transaction.owner && transaction.owner}
                    </Box>
                  </Box>
                </TableCell>
                <TableCell sx={{ color: 'white' }}>
                  {transaction.symbol && (
                    <Chip
                      label={transaction.symbol}
                      size="small"
                      sx={{
                        backgroundColor: teal[600],
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '0.75rem',
                      }}
                    />
                  )}
                </TableCell>
                {!isCompact && (
                  <TableCell sx={{ color: grey[300], maxWidth: 200 }}>
                    <Box sx={{ 
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {transaction.assetDescription}
                    </Box>
                    <Box sx={{ fontSize: '0.75rem', color: grey[500] }}>
                      {transaction.assetType}
                    </Box>
                  </TableCell>
                )}
                <TableCell>
                  <Chip
                    label={transaction.type}
                    size="small"
                    sx={{
                      backgroundColor: typeColor,
                      color: 'white',
                      fontWeight: 600,
                      fontSize: isCompact ? '0.7rem' : '0.75rem',
                    }}
                  />
                </TableCell>
                <TableCell sx={{ color: teal[400], fontWeight: 600, fontSize: isCompact ? '0.85rem' : '1rem' }}>
                  {transaction.amount}
                </TableCell>
                <TableCell sx={{ color: grey[400], fontSize: isCompact ? '0.8rem' : '0.9rem' }}>
                  {formatDate(transaction.transactionDate)}
                </TableCell>
                {!isCompact && (
                  <TableCell sx={{ color: grey[400] }}>
                    {formatDate(transaction.disclosureDate)}
                  </TableCell>
                )}
                <TableCell>
                  {transaction.link && (
                    <IconButton
                      size="small"
                      onClick={() => handleLinkClick(transaction.link)}
                      sx={{
                        color: teal[400],
                        '&:hover': {
                          color: teal[300],
                          backgroundColor: 'rgba(0, 150, 136, 0.1)',
                        },
                      }}
                    >
                      <FaExternalLinkAlt size={isCompact ? 12 : 14} />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TransactionTable;
