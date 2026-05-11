import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchResources } from '../../../actions/community_directory';
import ResourceCard from '../components/resource_card';
import { Link } from 'react-router-dom';

const CommunityDirectoryCategory = ({ match }) => {
  const { category } = match.params || {};
  const dispatch = useDispatch();

  const resources = useSelector(state => state.getIn(['community_directory', 'resources'], []));
  const formConfig = useSelector(state => state.getIn(['community_directory', 'formConfig'], {}));
  const loading = useSelector(state => state.getIn(['community_directory', 'loading'], false));
  const error = useSelector(state => state.getIn(['community_directory', 'error']));

  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({});

  const debounceRef = React.useRef(null);

  const performSearch = useCallback((searchQuery, currentFilters) => {
    if (!category) return;
    dispatch(fetchResources(category, searchQuery));
  }, [dispatch, category]);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      performSearch(query, filters);
    }, 500);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, filters, performSearch]);

  const handleSearchChange = (e) => setQuery(e.target.value);

  const handleFilterChange = (fieldName, checked) => {
    setFilters(prev => ({ ...prev, [fieldName]: checked }));
  };

  const searchableFields = formConfig.get('fields')?.filter(f => f.get('searchable')) || [];

  if (error) {
    return <div className="status error">Error loading {category}: {error}</div>;
  }

  if (!category) {
    return <div className="status error">Category not specified.</div>;
  }

  return (
    <div className="community-directory-category">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>{category.humanize?.() || category}</h1>
        
        {/* Add New Entry Button */}
        <Link
          to={`/directories/${category}/new`}
          className="btn btn-primary"
        >
          + Add New Entry
        </Link>
      </div>

      <p className="lead mb-4">Discover and contribute to the {category} community directory</p>

      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder={`Search ${category.humanize?.() || category}...`}
          value={query}
          onChange={handleSearchChange}
          className="search__input w-100"
          disabled={loading}
        />
      </div>

      {/* Filters */}
      {searchableFields.length > 0 && (
        <div className="filters mb-4 p-3 border rounded">
          <h5 className="mb-3">Filters</h5>
          <div className="d-flex flex-wrap gap-3">
            {searchableFields.map(field => {
              const name = field.get('db_name');
              return (
                <div key={name} className="form-check">
                  <input
                    type="checkbox"
                    id={`filter-${name}`}
                    checked={!!filters[name]}
                    onChange={e => handleFilterChange(name, e.target.checked)}
                    className="form-check-input"
                    disabled={loading}
                  />
                  <label htmlFor={`filter-${name}`} className="form-check-label">
                    {field.get('label') || name.humanize?.()}
                  </label>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {loading && <div className="loading-bar">Searching...</div>}

      {/* Results */}
      {!loading && (
        <div className="status-list">
          {resources.size > 0 ? (
            resources.map(resource => (
              <ResourceCard 
                key={resource.get('id')} 
                resource={resource} 
                category={category} 
              />
            ))
          ) : (
            <div className="status">
              <p className="text-muted">
                No entries found {query && `for "${query}"`}.
                {Object.keys(filters).length > 0 && ' Try adjusting your filters.'}
              </p>
              <Link to={`/directories/${category}/new`} className="btn btn-primary mt-3">
                Be the first to add an entry →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CommunityDirectoryCategory;
