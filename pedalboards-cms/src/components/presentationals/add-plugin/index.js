// Dependencies
import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Tooltip } from 'react-tippy';
import PropTypes from 'prop-types';

// Style
import 'react-tippy/dist/tippy.css';
import "./style.scss";

// Services
import { PedalboardsService } from 'services';

export default class AddPlugin extends Component {
  static propTypes = {
    edit: PropTypes.bool,
    brand: PropTypes.string,
    categories: PropTypes.arrayOf(PropTypes.string),
    controlPorts: PropTypes.arrayOf(PropTypes.shape({
      default: PropTypes.number,
      max: PropTypes.number,
      min: PropTypes.number,
      name: PropTypes.string
    })),
    description: PropTypes.string,
    label: PropTypes.string,
    name: PropTypes.string,
    screenshotUrl: PropTypes.string,
    uri: PropTypes.string
  }

  static defaultValue = {
    edit: false
  }

  constructor(props) {
    super(props);
    this.state = {
      controlPorts: [{
        name: "Blend 1",
        default: 0.25,
        max: 0.00,
        min: 1.00
      }, {
        name: "Blend 2",
        default: 0.25,
        max: 0.00,
        min: 1.00
      }]
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.controlPorts !== prevProps.controlPorts) {
      this.setState({
        controlPorts: this.props.controlPorts
      })
    }
  }

  handleFormSubmit = event => {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    formData.append("controlPorts", JSON.stringify(this.state.controlPorts, null, 2));
    formData.append("author", JSON.stringify({
      avatarUrl: "",
      name: ""
    }, null, 2));

    (this.props.edit ?
      PedalboardsService.updatePlugin(formData) :
      PedalboardsService.createPlugin(formData)
    ).then(response => {
      form.reset();
    });
  }

  handleFormCPSubmit = event => {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);

    let cp = {};
    for (let d of formData.entries()) {
      cp[d[0]] = d[1];
    }
    this.setState(prevState => ({
      controlPorts: [
        ...prevState.controlPorts,
        cp
      ]
    }), () => form.reset())
  }

  removeControlPort = index => {
    this.setState(prevState => ({
      controlPorts: prevState.controlPorts.filter((controlPorts, i) => index !== i)
    }))
  }

  render() {
    return (
      <section className="add-plugin">
        <header>
          <h1>Ajouter un plugin</h1>
        </header>
        <main>
          <form
            onSubmit={this.handleFormSubmit}
            encType="multipart/form-data"
            ref={this.mainFormRef}>
            <div className="row">
              <input type="text" name="name" placeholder="Name" required />
              <input
                type="text"
                name="label"
                placeholder="Label"
                defaultValue={this.props.label}
                required
              />
            </div>
            <div className="row">
              <input
                type="text"
                name="uri"
                placeholder="URI"
                defaultValue={this.props.uri}
                required
              />
              <input
                type="text"
                name="version"
                placeholder="Version"
                defaultValue={this.props.version}
                required
              />
            </div>
            <div className="row">
              <input
                type="text"
                name="brand"
                placeholder="Brand"
                defaultValue={this.props.brand}
                required />
              <input
                type="text"
                name="categories"
                placeholder="Categorie A, categorie B, categorie C, etc."
                defaultValue={this.props.categories ? this.props.categories.join(', ') : ''}
                required
              />
            </div>
            <div className="row">
              <textarea
                placeholder="Description"
                name="description"
                defaultValue={this.props.description}
                required></textarea>
            </div>
            <div className="row">
              <input type="file" name="image" className="btn bg-primary" required />
            </div>
            <div className='create-btn-container'>
              <Tooltip
                title="Click to create the plugin"
                position="left">
                <button
                  type="submit"
                  className="btn bg-primary"><FontAwesomeIcon icon={faPlus} /> {this.props.edit ? 'Update' : 'Create'}</button>
              </Tooltip>
            </div>
          </form>
          <div className="control-ports">
            <header>
              <h2>Control ports</h2>
            </header>
            <form
              onSubmit={this.handleFormCPSubmit}
              ref={this.CPRef}>
              <table>
                <thead>
                  <tr>
                    {['Name', 'Default', 'Max', 'Min', 'Action'].map((label, index) => <th key={index}>{label}</th>)}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <Tooltip
                        title="Enter a name"
                        position="bottom">
                        <input
                          type="text"
                          name="name"
                          placeholder="name" required />
                      </Tooltip>
                    </td>
                    <td>
                      <Tooltip
                        title="Enter a default value. Eg. 6.1"
                        position="bottom">
                        <input
                          type="text"
                          name="default"
                          placeholder="default"
                          required />
                      </Tooltip>
                    </td>
                    <td>
                      <Tooltip
                        title="Enter a maximal value. Eg. 12.8"
                        position="bottom">
                        <input
                          type="text"
                          name="max"
                          placeholder="max"
                          required />
                      </Tooltip>
                    </td>
                    <td>
                      <Tooltip
                        title="Enter a minimal value. Eg. 1.2"
                        position="bottom">
                        <input
                          type="text"
                          name="min"
                          placeholder="min"
                          required />
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
                  {this.state.controlPorts.map((cp, index) => (
                    <tr key={index}>
                      <td>{cp.name}</td>
                      <td>{cp.default}</td>
                      <td>{cp.max}</td>
                      <td>{cp.min}</td>
                      <td>
                        <Tooltip
                          title={"Click to remove " + cp.name}
                          position="left"
                        >
                          <button
                            type="button"
                            className="btn bg-secondary"
                            onClick={() => this.removeControlPort(index)}
                          ><FontAwesomeIcon icon={faTrash} /></button>
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
    )
  }
}