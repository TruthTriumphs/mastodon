// app/javascript/flavours/glitch/features/community_directory/edit/index.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchResource, updateResource } from '../../../actions/community_directory';
import DynamicFormRenderer from '../components/dynamic_form_renderer';
import { useHistory } from 'react-router-dom';

const CommunityDirectoryEdit = ({ match }) => {
  const { category, id } = match.params || {};
  const dispatch = useDispatch();
  const history = useHistory();

  const resource = useSelector(state => state.getIn(['community_directory', 'currentResource']));
  const formConfig = useSelector(state => state.getIn(['community_directory', 'formConfig'], {}));
  const loading = useSelector(state => state.getIn(['community_directory', 'loading'], false));
  const error = useSelector(state => state.getIn(['community_directory', 'error']));

  const [formData, setFormData] = useState({});
  const [formErrors, setFormErrors] = useState({});
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Fetch resource
  useEffect(() => {
    if (category && id) {
      dispatch(fetchResource(category, id));
    }
  }, [dispatch, category, id]);

  // Populate form when resource loads
  useEffect(() => {
    if (resource) {
      const data = {};
      const metadata = resource.get('metadata') || [];
      metadata.forEach(field => {
        try {
          const name = field.get('db_name');
          if (name) data[name] = resource.get(name);
        } catch (e) {
          console.warn(`Error populating field ${field.get('db_name')}:`, e);
        }
      });
      setFormData(data);
    }
  }, [resource]);

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const errors = {};
    const fields = formConfig.get('fields') || [];

    fields.forEach(field => {
      const name = field.get('db_name');
      const required = field.get('required') || false;
      const value = formData[name];

      if (required) {
        if (Array.isArray(value)) {
          if (value.length === 0) errors[name] = 'This field is required';
        } else if (!value || String(value).trim() === '') {
          errors[name] = 'This field is required';
        }
      }
    });

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    dispatch(updateResource(category, id, formData))
      .then(() => {
        setSubmitSuccess(true);
        setTimeout(() => {
          history.push(`/directories/${category}/${id}`);
        }, 1200);
      })
      .catch(err => console.error('Update failed:', err));
  };

  if (error) return <div className="status error">Error: {error}</div>;
  if (!category || !id) return <div className="status error">Missing category or ID.</div>;
  if (loading || !resource) return <div className="loading-bar">Loading edit form...</div>;

  return (
    <div className="community-directory-edit">
      <h1>Edit {resource.get('display_name') || 'Entry'}</h1>

      {submitSuccess && (
        <div className="status success">✅ Changes saved successfully! Redirecting...</div>
      )}

      <form onSubmit={handleSubmit}>
        <DynamicFormRenderer 
          formConfig={formConfig} 
          formData={formData} 
          onChange={handleChange}
          errors={formErrors}
        />

        <div className="mt-5">
          <button 
            type="submit" 
            className="btn btn-primary btn-block"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>

      <div className="mt-4">
        <a href={`/directories/${category}/${id}`} className="btn btn-link">
          ← Cancel and Return to Details
        </a>
      </div>
    </div>
  );
};

export default CommunityDirectoryEdit;
