// Dependencies
import React, { Component } from 'react';

// CSS
import "./style.scss";

export default class AddPlugin extends Component {
  constructor(props) {
    super(props);
    this.state = {
      controlPorts: [{
        name: "Blend",
        default: 0.25,
        max: 0.00,
        min: 1.00
      }, {
        name: "Blend",
        default: 0.25,
        max: 0.00,
        min: 1.00
      }]
    }
  }

  render() {
    return (
      <section className="add-plugin">
        <header>
          <h1>Ajouter un plugin</h1>
          <button type="button" className="btn bg-primary">Upload screebshot</button>
        </header>
        <main>
          <form>
            <div className="row">
              <input type="text" name="name" placeholder="Name" required />
              <input type="text" name="brand" placeholder="Brand" required />
            </div>
            <div className="row">
              <input
                type="text"
                name="categories"
                placeholder="Categorie A, categorie B, categorie C, etc."
                required
              />
            </div>
            <div className="row">
              <textarea placeholder="Description" required></textarea>
            </div>
          </form>
          <div className="control-ports">
            <h2>Control port</h2>
            <table>
              <thead>
                <tr>
                  {['Name', 'Default', 'Max', 'Min', ''].map(label => <th>{label}</th>)}
                </tr>
              </thead>
              <tbody>
                {this.state.controlPorts.map(cp => (
                  <tr>
                    <td>{cp.name}</td>
                    <td>{cp.default}</td>
                    <td>{cp.max}</td>
                    <td>{cp.min}</td>
                    <td>
                      <button
                        type="button"
                        className="btn bg-secondary"
                      >X</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button
              type="button"
              className="btn bg-primary"
            >Add control ports</button>
          </div>
        </main>
      </section>
    )
  }
}