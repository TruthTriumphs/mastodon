// app/javascript/flavours/glitch/features/community_directory/admin/index.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createCategory } from '../../../actions/community_directory';
//import { useHistory } from 'react-router-dom';



const CommunityDirectoryAdmin = () => {
  const dispatch = useDispatch();
  

  const categories = useSelector(state => state.getIn(['community_directory', 'categories'], []));
  const loading = useSelector(state => state.getIn(['community_directory', 'loading'], false));

  const [name, setName] = useState('');
  const [status, setStatus] = useState('');
  const [creating, setCreating] = useState(false);

  // Load categories on mount
  useEffect(() => {
    // You can dispatch fetchCategories() here if you want auto-refresh
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setCreating(true);
    setStatus('');

    try {
      const result = await dispatch(createCategory(name.trim()));
      
      const successMsg = `✅ Category "${name}" created successfully!\n\nGenerating files and migration...`;
      setStatus(successMsg);

      // Auto redirect to the new category after short delay
      setTimeout(() => {
        history.push(`/directories/${name}`);
      }, 1800);

      setName('');
    } catch (err) {
      setStatus(`❌ Failed: ${err.message || 'Unknown error'}`);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="status">
      <h1>🛠️ Community Directory Admin</h1>
      <p className="lead">Create and manage dynamic community sections</p>

      {/* Create Form */}
      <div className="mb-5">
        <h3>Create New Category</h3>
        <form onSubmit={handleCreate} className="mb-4">
          <div className="field mb-4">
            <label>Category Name (singular, lowercase only)</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value.toLowerCase())}
              placeholder="artists"
              className="search__input w-100"
              disabled={creating}
            />
            <p className="text-muted small">This will create: community_artists table + feature folder</p>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={creating || !name.trim()}
          >
            {creating ? 'Creating Category & Files...' : 'Create New Category'}
          </button>
        </form>
      </div>

      {status && (
        <div className={`status mt-3 mb-4 ${status.includes('✅') ? 'success' : 'error'}`}>
          {status}
        </div>
      )}

      {/* Existing Categories */}
      <div>
        <h3>Existing Categories ({categories.size})</h3>
        
        {categories.size > 0 ? (
          <div className="status-list">
            {categories.map(cat => {
              const catName = cat.get('name');
              return (
                <div key={catName} className="status d-flex justify-content-between align-items-center p-3">
                  <div>
                    <strong>{cat.get('humanized') || catName}</strong>
                    <small className="text-muted ms-2">({catName})</small>
                  </div>
                  <button
                    onClick={() => history.push(`/directories/${catName}`)}
                    className="btn btn-primary btn-sm"
                  >
                    Manage →
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-muted">No categories yet. Create your first one above.</p>
        )}
      </div>
    </div>
  );
};

export default CommunityDirectoryAdmin;
