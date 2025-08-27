import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton
} from '@mui/material';
import { teal, red, grey } from '@mui/material/colors';
import { FaExternalLinkAlt, FaCalendarAlt, FaDollarSign } from 'react-icons/fa';

const TransactionCard = ({ transaction }) => {
  const {
    symbol,
    disclosureDate,
    transactionDate,
    firstName,
    lastName,
    office,
    district,
    owner,
    assetDescription,
    assetType,
    type,
    amount,
    link
  } = transaction;

  const isPurchase = type?.toLowerCase() === 'purchase';
  const typeColor = isPurchase ? teal[500] : red[500];

  const handleLinkClick = (e) => {
    e.stopPropagation();
    if (link) {
      window.open(link, '_blank', 'noopener,noreferrer');
    }
  };

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

  return (
    <Card
      sx={{
        backgroundColor: '#1a1a1a',
        border: `1px solid ${teal[800]}`,
        borderRadius: 2,
        mb: 2,
        '&:hover': {
          borderColor: teal[600],
          backgroundColor: '#222222',
        },
      }}
    >
      <CardContent sx={{ p: 2 }}>
        {/* Header with Member Name and Symbol */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 600, fontSize: '1rem' }}>
              {firstName} {lastName}
            </Typography>
            <Typography variant="caption" sx={{ color: teal[400] }}>
              {office} {district && `(${district})`}
            </Typography>
          </Box>
          {symbol && (
            <Chip
              label={symbol}
              size="small"
              sx={{
                backgroundColor: teal[600],
                color: 'white',
                fontWeight: 'bold',
              }}
            />
          )}
        </Box>

        {/* Asset Description */}
        <Typography
          variant="body2"
          sx={{
            color: grey[300],
            mb: 1,
            fontWeight: 500,
          }}
        >
          {assetDescription}
        </Typography>

        {/* Transaction Details */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          <Chip
            label={type}
            size="small"
            sx={{
              backgroundColor: typeColor,
              color: 'white',
              fontWeight: 600,
            }}
          />
          {owner && (
            <Chip
              label={owner}
              size="small"
              variant="outlined"
              sx={{
                borderColor: grey[600],
                color: grey[400],
              }}
            />
          )}
          <Chip
            label={assetType}
            size="small"
            variant="outlined"
            sx={{
              borderColor: grey[600],
              color: grey[400],
            }}
          />
        </Box>

        {/* Amount and Dates */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <FaDollarSign size={12} color={teal[400]} />
            <Typography variant="caption" sx={{ color: teal[400], fontWeight: 600 }}>
              {amount}
            </Typography>
          </Box>
        </Box>

        {/* Dates and Link */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="caption" sx={{ color: grey[500], display: 'block' }}>
              Transaction: {formatDate(transactionDate)}
            </Typography>
            <Typography variant="caption" sx={{ color: grey[500], display: 'block' }}>
              Disclosed: {formatDate(disclosureDate)}
            </Typography>
          </Box>
          {link && (
            <IconButton
              size="small"
              onClick={handleLinkClick}
              sx={{
                color: teal[400],
                '&:hover': {
                  color: teal[300],
                  backgroundColor: 'rgba(0, 150, 136, 0.1)',
                },
              }}
            >
              <FaExternalLinkAlt size={14} />
            </IconButton>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default TransactionCard;
