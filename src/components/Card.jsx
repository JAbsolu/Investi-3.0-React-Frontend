import React from 'react';
import {
  Card as MuiCard,
  CardContent,
  CardHeader,
  CardActions,
  CardMedia,
  Typography,
  Button,
  Avatar,
  Box,
  Divider
} from '@mui/material';
import { styled } from '@mui/material/styles';

// Styled Card with hover effects and customization
const StyledCard = styled(MuiCard)(({ theme, clickable, hoverable }) => ({
  transition: 'all 0.3s ease-in-out',
  cursor: clickable ? 'pointer' : 'default',
  ...(hoverable && {
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: theme.shadows[8],
    },
  }),
}));

const Card = ({
  // Content props
  title,
  subtitle,
  content,
  image,
  imageHeight = 140,
  avatar,
  // Layout props
  variant = 'outlined',
  elevation = 1,
  size = 'medium',
  orientation = 'vertical',
  // Styling props
  sx = {},
  className,
  // Behavioral props
  clickable = false,
  hoverable = false,
  disabled = false,
  // Action props
  onCardClick,
  primaryAction,
  secondaryActions = [],
  headerAction,
  // Advanced props
  children,
  showDivider = false,
  maxWidth,
  // Header props
  headerProps = {},
  contentProps = {},
  actionsProps = {},
}) => {
  // Size configurations
  const sizeConfigs = {
    small: {
      titleVariant: 'h6',
      subtitleVariant: 'body2',
      contentVariant: 'body2',
      padding: 1.5,
    },
    medium: {
      titleVariant: 'h5',
      subtitleVariant: 'body2',
      contentVariant: 'body1',
      padding: 2,
    },
    large: {
      titleVariant: 'h4',
      subtitleVariant: 'body1',
      contentVariant: 'body1',
      padding: 3,
    },
  };
  
  const config = sizeConfigs[size];
  // Handle card click
  const handleCardClick = (event) => {
    if (clickable && onCardClick && !disabled) {
      onCardClick(event);
    }
  };
  
  // Determine if we should show header
  const showHeader = title || subtitle || avatar || headerAction;
  
  // Determine if we should show actions
  const showActions = primaryAction || secondaryActions.length > 0;
  
  return (
    <StyledCard
      variant={variant}
      elevation={variant === 'outlined' ? 0 : elevation}
      clickable={clickable}
      hoverable={hoverable}
      onClick={handleCardClick}
      sx={{
        opacity: disabled ? 0.6 : 1,
        pointerEvents: disabled ? 'none' : 'auto',
        maxWidth: maxWidth,
        width: '100%',
        ...(orientation === 'horizontal' && {
          display: 'flex',
          flexDirection: 'row',
        }),
        ...sx,
      }}
      className={className}
    >
      {/* Card Media */}
      {image && (
        <CardMedia
          component="img"
          height={imageHeight}
          image={image}
          alt={title || 'Card image'}
          sx={{
            ...(orientation === 'horizontal' && {
              width: 200,
              height: 'auto',
            }),
          }}
        />
      )}
      
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
        }}
      >
        {/* Card Header */}
        {showHeader && (
          <CardHeader
            avatar={
              avatar && (
                typeof avatar === 'string' ? (
                  <Avatar src={avatar} />
                ) : (
                  avatar
                )
              )
            }
            action={headerAction}
            title={
              title && (
                <Typography variant={config.titleVariant} component="h2">
                  {title}
                </Typography>
              )
            }
            subheader={
              subtitle && (
                <Typography variant={config.subtitleVariant} color="text.secondary">
                  {subtitle}
                </Typography>
              )
            }
            sx={{ pb: showDivider ? 1 : config.padding }}
            {...headerProps}
          />
        )}
        
        {/* Divider */}
        {showDivider && showHeader && <Divider />}
        
        {/* Card Content */}
        {(content || children) && (
          <CardContent
            sx={{
              padding: config.padding,
              '&:last-child': { paddingBottom: config.padding },
              ...(orientation === 'horizontal' && {
                flex: 1,
              }),
            }}
            {...contentProps}
          >
            {content && (
              <Typography variant={config.contentVariant} color="text.primary">
                {content}
              </Typography>
            )}
            {children}
          </CardContent>
        )}
        
        {/* Card Actions */}
        {showActions && (
          <CardActions
            sx={{
              padding: config.padding,
              paddingTop: 0,
              justifyContent: 'space-between',
            }}
            {...actionsProps}
          >
            <Box sx={{ display: 'flex', gap: 1 }}>
              {secondaryActions.map((action, index) => (
                <Button
                  key={index}
                  size="small"
                  variant={action.variant || 'text'}
                  color={action.color || 'primary'}
                  onClick={action.onClick}
                  disabled={action.disabled}
                  startIcon={action.icon}
                >
                  {action.label}
                </Button>
              ))}
            </Box>
            
            {primaryAction && (
              <Button
                size="small"
                variant={primaryAction.variant || 'contained'}
                color={primaryAction.color || 'primary'}
                onClick={primaryAction.onClick}
                disabled={primaryAction.disabled}
                endIcon={primaryAction.icon}
              >
                {primaryAction.label}
              </Button>
            )}
          </CardActions>
        )}
      </Box>
    </StyledCard>
  );
};

export default Card;