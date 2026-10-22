// Dependencies
import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Tooltip } from 'react-tippy';
import PropTypes from 'prop-types';

// Style
import 'react-tippy/dist/tippy.css';
import './style.scss';

// Components
import RequestError from 'components/request-error';

// Services
import { PedalboardService } from 'services';

// Helpers
import { RequestHelper } from 'helpers';

// Constants
import { IMAGE_FIELD } from './constants';

// Utils
import { readControlPorts, removeEmptyImage } from './utils';

/**
 * Form that creates a plugin, or edits the plugin it is given. Every prop is optional: without
 * them, it is an empty create form.
 */
export default class AddPlugin extends Component {
  static propTypes = {
    /** Edits the plugin instead of creating one. @default false */
    edit: PropTypes.bool,
    /** Id of the edited plugin: an edit without it sends nothing */
    id: PropTypes.string,
    /** Name of the plugin, its title in the list. @default '' */
    name: PropTypes.string,
    /** Maker of the plugin. @default '' */
    brand: PropTypes.string,
    /** Categories of the plugin, shown joined by commas. @default [] */
    categories: PropTypes.arrayOf(PropTypes.string),
    /**
     * Control ports of the plugin. Without them, a new plugin starts with two samples and an edited
     * one with none.
     */
    controlPorts: PropTypes.arrayOf(PropTypes.shape({
      default: PropTypes.number,
      max: PropTypes.number,
      min: PropTypes.number,
      name: PropTypes.string
    })),
    /** Text that presents the plugin. @default '' */
    description: PropTypes.string,
    /** Short label of the plugin. @default '' */
    label: PropTypes.string,
    /** URI that identifies the plugin. @default '' */
    uri: PropTypes.string,
    /** Version of the plugin. @default '' */
    version: PropTypes.string
  };

  constructor(props) {
    super(props);
    this.state = {
      controlPorts: readControlPorts(props),
      errorMessage: ''
    };
  }

  componentDidUpdate(prevProps) {
    const { controlPorts, edit } = this.props;

    if (controlPorts !== prevProps.controlPorts) {
      this.setState({
        controlPorts: readControlPorts({ controlPorts, edit })
      });
    }
  }

  handleFormSubmit = (event) => {
    event.preventDefault();

    const form = event.target;
    const formData = removeEmptyImage(new FormData(form));
    const {
      state: { controlPorts },
      props: { edit = false, id }
    } = this;
    const isEditWithoutId = edit && !id;

    if (isEditWithoutId) return;

    formData.append('controlPorts', JSON.stringify(controlPorts, null, 2));

    // The edit leaves the author out, so the plugin keeps its own, and keeps the fields as typed
    if (edit) {
      PedalboardService.updatePlugin(id, formData).then(this.clearError, this.showError);
      return;
    }

    formData.append('author', JSON.stringify({
      avatarUrl: '',
      name: ''
    }, null, 2));

    PedalboardService.createPlugin(formData).then(() => {
      form.reset();
      this.clearError();
    }, this.showError);
  }

  clearError = () => {
    this.setState({ errorMessage: '' });
  }

  showError = (error) => {
    this.setState({ errorMessage: RequestHelper.readErrorMessage(error) });
  }

  handleFormCPSubmit = (event) => {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);

    const cp = {};
    for (const d of formData.entries()) {
      cp[d[0]] = d[1];
    }
    this.setState(prevState => ({
      controlPorts: [
        ...prevState.controlPorts,
        cp
      ]
    }), () => form.reset());
  }

  removeControlPort = (index) => {
    this.setState(prevState => ({
      controlPorts: prevState.controlPorts.filter((controlPorts, i) => index !== i)
    }));
  }

  render() {
    const {
      state: { controlPorts, errorMessage },
      props: {
        name = '',
        label = '',
        uri = '',
        version = '',
        brand = '',
        categories = [],
        description = '',
        edit = false
      }
    } = this;

    return (
      <section className="add-plugin">
        <header>
          <h1>{edit ? 'Modifier le plugin' : 'Ajouter un plugin'}</h1>
        </header>
        <main>
          <form
            onSubmit={this.handleFormSubmit}
            encType="multipart/form-data"
            ref={this.mainFormRef}
          >
            <div className="row">
              <input
                type="text"
                name="name"
                placeholder="Name"
                defaultValue={name}
                required
              />
              <input
                type="text"
                name="label"
                placeholder="Label"
                defaultValue={label}
                required
              />
            </div>
            <div className="row">
              <input
                type="text"
                name="uri"
                placeholder="URI"
                defaultValue={uri}
                required
              />
              <input
                type="text"
                name="version"
                placeholder="Version"
                defaultValue={version}
                required
              />
            </div>
            <div className="row">
              <input
                type="text"
                name="brand"
                placeholder="Brand"
                defaultValue={brand}
                required
              />
              <input
                type="text"
                name="categories"
                placeholder="Categorie A, categorie B, categorie C, etc."
                defaultValue={Array.isArray(categories) ? categories.join(', ') : ''}
                required
              />
            </div>
            <div className="row">
              <textarea
                placeholder="Description"
                name="description"
                defaultValue={description}
                required
              />
            </div>
            <div className="row">
              <input
                type="file"
                name={IMAGE_FIELD}
                className="btn bg-primary"
                required={!edit}
              />
            </div>
            <RequestError message={errorMessage} />
            <div className="create-btn-container">
              <Tooltip
                title={edit ? 'Click to update the plugin' : 'Click to create the plugin'}
                position="left"
              >
                <button
                  type="submit"
                  className="btn bg-primary"
                >
                  <FontAwesomeIcon icon={faPlus} />
                  {' '}
                  {edit ? 'Update' : 'Create'}

                </button>
              </Tooltip>
            </div>
          </form>
          <div className="control-ports">
            <header>
              <h2>Control ports</h2>
            </header>
            <form
              onSubmit={this.handleFormCPSubmit}
              ref={this.CPRef}
            >
              <table>
                <thead>
                  <tr>
                    {['Name', 'Default', 'Max', 'Min', 'Action'].map((tableName, index) => <th key={index}>{tableName}</th>)}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <Tooltip
                        title="Enter a name"
                        position="bottom"
                      >
                        <input
                          type="text"
                          name="name"
                          placeholder="name"
                          required
                        />
                      </Tooltip>
                    </td>
                    <td>
                      <Tooltip
                        title="Enter a default value. Eg. 6.1"
                        position="bottom"
                      >
                        <input
                          type="text"
                          name="default"
                          placeholder="default"
                          required
                        />
                      </Tooltip>
                    </td>
                    <td>
                      <Tooltip
                        title="Enter a maximal value. Eg. 12.8"
                        position="bottom"
                      >
                        <input
                          type="text"
                          name="max"
                          placeholder="max"
                          required
                        />
                      </Tooltip>
                    </td>
                    <td>
                      <Tooltip
                        title="Enter a minimal value. Eg. 1.2"
                        position="bottom"
                      >
                        <input
                          type="text"
                          name="min"
                          placeholder="min"
                          required
                        />
                      </Tooltip>
                    </td>
                    <td>
                      <Tooltip
                        title="Click to add new control port"
                        position="left"
                      >
                        <button type="submit" className="btn bg-secondary"><FontAwesomeIcon icon={faPlus} /></button>
                      </Tooltip>
                    </td>
                  </tr>
                  {controlPorts.map((cp, index) => (
                    <tr key={index}>
                      <td>{cp.name}</td>
                      <td>{cp.default}</td>
                      <td>{cp.max}</td>
                      <td>{cp.min}</td>
                      <td>
                        <Tooltip
                          title={`Click to remove ${cp.name}`}
                          position="left"
                        >
                          <button
                            type="button"
                            className="btn bg-secondary"
                            onClick={() => this.removeControlPort(index)}
                          >
                            <FontAwesomeIcon icon={faTrash} />

                          </button>
                        </Tooltip>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </form>
          </div>
        </main>
      </section>
    );
  }
}
