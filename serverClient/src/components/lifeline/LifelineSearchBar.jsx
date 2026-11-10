import React from 'react';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import './LifelineSearchBar.css';

export default function LifelineSearchBar({
  categories = [],
  selectedCategory,
  onCategoryChange,
  searchValue,
  onSearchValueChange,
  loading = false,
  onSubmit,
  onClear,
  quickSuggestions = [],
  onSelectSuggestion,
}) {
  return (
    <Paper variant="outlined" className="sc-lifeline-search-paper">
      <form onSubmit={onSubmit} className="sc-lifeline-search-form">
        <TextField
          select
          size="small"
          label="Lookup Parameter"
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="sc-lifeline-category-field"
        >
          {categories.map((c) => (
            <MenuItem key={c.id} value={c.id}>
              {c.label}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          size="small"
          label="Search Student / Payment Record"
          placeholder="Search by Order ID, Customer ID, Email, Phone, Txn ID, Ref ID..."
          value={searchValue}
          onChange={(e) => onSearchValueChange(e.target.value)}
          className="sc-lifeline-query-field"
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
              endAdornment: searchValue ? (
                <InputAdornment position="end">
                  <Tooltip title="Clear search">
                    <IconButton size="small" onClick={onClear} aria-label="Clear search">
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </InputAdornment>
              ) : null,
            },
          }}
        />

        <Button
          type="submit"
          variant="contained"
          disabled={loading}
          startIcon={<SearchIcon />}
          className="sc-lifeline-search-btn"
        >
          {loading ? 'Investigating...' : 'Investigate'}
        </Button>
      </form>

      {quickSuggestions.length > 0 && (
        <div className="sc-lifeline-quick-samples">
          <span className="sc-lifeline-quick-label">Recent Live Records:</span>
          {quickSuggestions.map((s) => (
            <Chip
              key={`${s.param}-${s.value}`}
              size="small"
              variant="outlined"
              clickable
              label={s.label}
              onClick={() => onSelectSuggestion && onSelectSuggestion(s.param, s.value)}
            />
          ))}
        </div>
      )}
    </Paper>
  );
}
