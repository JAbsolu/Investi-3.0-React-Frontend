import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton
} from '@mui/material';
import { teal, red, grey, amber } from '@mui/material/colors';
import { FaExternalLinkAlt, FaCalendarAlt, FaDollarSign, FaCrown } from 'react-icons/fa';
import StockDetailsModal from '../../components/StockDetailsModal';
import { useIsPremium } from '../../../../hooks/isPremium';
import Paywall from '../../components/Paywall';
import { useNavigate } from 'react-router-dom';

const TransactionCard = ({ index, transaction, wishlist = [], addToWishlist }) => {
  const [stockModalOpen, setStockModalOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const { hasPremiumAccess } = useIsPremium();
  // const [showPaywall, setShowPaywall] = useState(false);

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

  const navigate = useNavigate();

  const isPurchase = type?.toLowerCase() === 'purchase';
  const typeColor = isPurchase ? teal[500] : red[500];

  const handleLinkClick = (e) => {
    e.stopPropagation();
    if (link) {
      window.open(link, '_blank', 'noopener,noreferrer');
    }
  };

  const handleStockClick = (e) => {
    e.stopPropagation();
    if (symbol) {
      setSelectedStock({
        symbol: symbol,
        name: assetDescription || symbol
      });
      setStockModalOpen(true);
    }
  };

  const handleModalClose = () => {
    setStockModalOpen(false);
    setSelectedStock(null);
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
        backgroundColor: '#0d0d0d',
        border: `1px solid ${teal[800]}`,
        borderRadius: 3,
        mb: 2,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        '&:hover': {
          borderColor: teal[500],
          backgroundColor: '#1a1a1a',
          boxShadow: '0 6px 20px rgba(0, 0, 0, 0.4)',
        },
      }}
      onClick={!hasPremiumAccess && index >= 5 ? () => navigate('/dashboard/plans') : handleStockClick}
    >
      <CardContent sx={{ p: 3 }}>
        {/* Header with Member Name and Symbol */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 600, fontSize: '1.1rem' }}>
              {firstName} {lastName}
            </Typography>
            <Typography variant="caption" sx={{ color: teal[300], fontWeight: 500 }}>
              {office} {district && `(${district})`}
            </Typography>
          </Box>
          {symbol && (
            <Chip
              icon={!hasPremiumAccess && index >= 5 && <FaCrown color="black" size={12} />}
              label={!hasPremiumAccess && index >= 5 ? "UPGRADE" : symbol}
              size="small"
              sx={{
                backgroundColor: !hasPremiumAccess && index >= 5 ? amber[600] : teal[500],
                color: !hasPremiumAccess && index >= 5 ? 'black' : 'white',
                fontWeight: 'bold',
                fontSize: '0.75rem',
                px: 1,
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: teal[400],
                  transform: 'translateY(-1px)',
                },
                transition: 'all 0.2s ease',
              }}
            />
          )}
        </Box>

        {/* Asset Description */}
        <Typography
          variant="body2"
          sx={{
            color: grey[200],
            mb: 2,
            fontWeight: 500,
            lineHeight: 1.4,
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
              fontSize: '0.7rem',
            }}
          />
          {owner && (
            <Chip
              label={owner}
              size="small"
              variant="outlined"
              sx={{
                borderColor: teal[600],
                color: teal[200],
                fontSize: '0.7rem',
              }}
            />
          )}
          <Chip
            label={assetType}
            size="small"
            variant="outlined"
            sx={{
              borderColor: grey[500],
              color: grey[300],
              fontSize: '0.7rem',
            }}
          />
        </Box>

        {/* Amount and Dates */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <FaDollarSign size={14} color={teal[400]} />
            <Typography variant="body2" sx={{ color: teal[300], fontWeight: 600 }}>
              {amount}
            </Typography>
          </Box>
        </Box>

        {/* Dates and Link */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="caption" sx={{ color: grey[400], display: 'block', fontSize: '0.75rem' }}>
              Transaction: {formatDate(transactionDate)}
            </Typography>
            <Typography variant="caption" sx={{ color: grey[400], display: 'block', fontSize: '0.75rem' }}>
              Disclosed: {formatDate(disclosureDate)}
            </Typography>
          </Box>
          {link && (
            <IconButton
              size="small"
              onClick={handleLinkClick}
              sx={{
                color: teal[400],
                backgroundColor: 'rgba(20, 184, 166, 0.1)',
                border: `1px solid ${teal[700]}`,
                '&:hover': {
                  color: teal[200],
                  backgroundColor: 'rgba(20, 184, 166, 0.2)',
                  borderColor: teal[500],
                },
              }}
            >
              <FaExternalLinkAlt size={14} />
            </IconButton>
          )}
        </Box>
      </CardContent>

      {/* Stock Details Modal */}
      <StockDetailsModal
        open={stockModalOpen}
        onClose={handleModalClose}
        stock={selectedStock}
        wishlist={wishlist}
        addToWishlist={addToWishlist}
      />

      {/* Paywall Modal */}
      {/* <Paywall
        open={showPaywall}
        onClose={() => setShowPaywall(false)}
      /> */}
    </Card>
  );
};

export default TransactionCard;
