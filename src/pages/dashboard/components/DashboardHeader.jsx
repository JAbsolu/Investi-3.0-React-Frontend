import { HiOutlineMenu } from "react-icons/hi";
import { AutoAwesome, RemoveRedEye } from '@mui/icons-material';
import SearchBar from './SearchBar';
import { useNavigate } from 'react-router-dom';
import { min } from "d3";

const DashboardHeader = ({
  isSmallScreen,
  handleDrawerToggle,
  stock,
  setStock,
  handleSearchOnEnter,
  onAddToWishlist
}) => {
  const navigate = useNavigate();

  return (
    <>
      {/* Mobile Navigation & Search */}
      {isSmallScreen && (
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={handleDrawerToggle}
            className="p-1.5 text-teal-400 hover:bg-teal-400/10 rounded-md transition-colors"
          >
            <HiOutlineMenu size={18} />
          </button>
          
          <SearchBar 
            handleSearchOnEnter={handleSearchOnEnter}
            onChange={(e) => setStock(e.target.value?.trim())}
            ticker={stock}
            setTicker={setStock}
            placeholder="Search ticker..."
            mobile={true}
          />
        </div>
      )}

      {/* Action Bar */}
      <div className={`flex items-center mb-4 ${isSmallScreen ? 'justify-between' : 'justify-start gap-2'}`}>
      {/* Desktop Search */}
      {!isSmallScreen && (
        <div className="flex-1 max-w-full">
          <SearchBar 
            handleSearchOnEnter={handleSearchOnEnter}
            onChange={(e) => setStock(e.target.value?.trim())}
            ticker={stock}
            setTicker={setStock}
            placeholder="Search ticker..."
          />
        </div>
      )}

      {/* Watch Button */}
      <button
        onClick={onAddToWishlist}
        className="flex items-center gap-2 border-2 border-zinc-800 text-zinc-400 px-3 py-2 rounded text-sm hover:bg-teal-400/10 hover:border-teal-700 transition-colors"
      >
        {/* <RemoveRedEye className="text-base" /> */}
        {!isSmallScreen && 'Add to Watchlist'}
      </button>
    </div>
    </>
  );
};

export default DashboardHeader;