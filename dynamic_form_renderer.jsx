// app/javascript/flavours/glitch/features/community_directory/components/dynamic_form_renderer.jsx
import React from 'react';

const DynamicFormRenderer = ({ formConfig, formData, onChange, errors = {} }) => {
  const fields = formConfig.get('fields') || [];

  return (
    <>
      {fields.map((field, index) => {
        const name = field.get('db_name');
        const label = field.get('label') || name.humanize();
        const widget = field.get('widget') || 'text';
        const required = field.get('required') || false;
        const options = field.get('options') || [];
        const fieldError = errors[name];

        let inputElement;

        switch (widget) {
          case 'textarea':
            inputElement = (
              <textarea
                name={name}
                value={formData[name] || ''}
                onChange={(e) => onChange(name, e.target.value)}
                className={`form-control ${fieldError ? 'is-invalid' : ''}`}
                required={required}
                rows={4}
              />
            );
            break;

          case 'select':
            inputElement = (
              <select
                name={name}
                value={formData[name] || ''}
                onChange={(e) => onChange(name, e.target.value)}
                className={`form-control ${fieldError ? 'is-invalid' : ''}`}
                required={required}
              >
                <option value="">Select an option...</option>
                {options.map((opt, i) => (
                  <option key={i} value={opt}>{opt}</option>
                ))}
              </select>
            );
            break;

          case 'checkboxes':
            inputElement = (
              <div className={`checkbox-group ${fieldError ? 'is-invalid' : ''}`}>
                <div className="checkbox-group-label">
                  {label} {required && <span className="text-danger">*</span>}
                </div>
                {options.map((opt, i) => (
                  <label key={i} className="form-check form-check-inline">
                    <input
                      type="checkbox"
                      checked={(formData[name] || []).includes(opt)}
                      onChange={(e) => {
                        const current = formData[name] || [];
                        const newVal = e.target.checked
                          ? [...current, opt]
                          : current.filter(v => v !== opt);
                        onChange(name, newVal);
                      }}
                    />
                    <span className="form-check-label">{opt}</span>
                  </label>
                ))}
                {fieldError && <div className="invalid-feedback d-block mt-1">{fieldError}</div>}
              </div>
            );
            break;

          case 'radio':
            // New: Radio button support
            inputElement = (
              <div className={`radio-group ${fieldError ? 'is-invalid' : ''}`}>
                <div className="radio-group-label">
                  {label} {required && <span className="text-danger">*</span>}
                </div>
                {options.map((opt, i) => (
                  <label key={i} className="form-check form-check-inline">
                    <input
                      type="radio"
                      name={name}
                      value={opt}
                      checked={formData[name] === opt}
                      onChange={(e) => onChange(name, e.target.value)}
                      className={fieldError ? 'is-invalid' : ''}
                    />
                    <span className="form-check-label">{opt}</span>
                  </label>
                ))}
                {fieldError && <div className="invalid-feedback d-block mt-1">{fieldError}</div>}
              </div>
            );
            break;

          default: // text, date, etc.
            inputElement = (
              <input
                type={widget === 'date' ? 'date' : 'text'}
                name={name}
                value={formData[name] || ''}
                onChange={(e) => onChange(name, e.target.value)}
                className={`form-control ${fieldError ? 'is-invalid' : ''}`}
                required={required}
              />
            );
        }

        // Render non-checkbox/radio fields
        if (widget !== 'checkboxes' && widget !== 'radio') {
          return (
            <div key={index} className="field mb-4">
              <label className="form-label">
                {label}
                {required && <span className="text-danger"> *</span>}
              </label>
              {inputElement}
              {fieldError && <div className="invalid-feedback d-block">{fieldError}</div>}
            </div>
          );
        }

        // Checkbox and Radio groups are self-contained
        return <div key={index} className="mb-4">{inputElement}</div>;
      })}
    </>
  );
};

export default DynamicFormRenderer;