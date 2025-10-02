import { FaSearch } from "react-icons/fa";

const SearchBar = ({ handleSearchOnEnter, ticker, setTicker, placeholder }) => {
    return (
        <div className="relative min-w-[70%] w-[100%] self-start">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-teal-400 text-sm z-10" />
            <input
                type="text"
                placeholder={placeholder}
                value={ticker}
                onChange={(e) => setTicker(e.target.value)}
                onKeyDown={handleSearchOnEnter}
                className="w-full bg-zinc-900 text-white placeholder-gray-400 pl-10 pr-4 py-2 
                         border-2 border-zinc-800 rounded-md focus:outline-none focus:border-teal-800
                         text-sm"
            />
        </div>
    );
};

export default SearchBar;