// Dependencies
import React, { Component } from 'react';

// Components
import { AddPlugin } from 'components/presentationals';

// Services
import { PedalboardsService } from 'services';

export default class EditPlugin extends Component {
  constructor(props) {
    super(props);
    this.state = {
      plugin: {}
    }
  }
  componentDidMount() {
    const id = this.props.match ? this.props.match.params.id : null;
    if (id) {
      PedalboardsService.getPlugin(id)
        .then(response => {
          console.log("response : ", response.data);
          this.setState({
            plugin: response.data
          })
        })
    }

  }

  render() {
    return <AddPlugin edit {...this.state.plugin} />
  }
}