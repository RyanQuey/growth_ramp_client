import { Component } from 'react';
import classes from './style.scss'

class Checkbox extends Component {
  handleChange (value, e) {
    if (typeof this.props.onChange !== 'undefined') {
      this.props.onChange(!value, e);
    }
  }

  render (){
    let checked = this.props.value;
    if (typeof checked === 'string') {
      checked = checked === 'true';
    }

    return (
      <div className={`${classes.checkbox} ${checked ? 'checked' : ''}`} onClick={this.handleChange.bind(this, checked)}>
        <i className={`fa fa-lg ${checked ? 'fa-check-square-o' : 'fa-square-o'}`} />
      </div>
    );
  }
}

export default Checkbox
