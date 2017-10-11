import { STATES } from 'shared/constants'

import { Component } from 'react'
import { connect } from 'react-redux'

export default class StateSelect extends Component {
	constructor(props) {
		super(props)

		this.state = {
			errors: []
		}

		this.handleChange = this.handleChange.bind(this)
	}


	handleChange(e) {
		const value = e.target.value;
		let errors = this.state.errors || [];

		if (this.props.validate) {
			this.props.validate.forEach(function (v) {
				if (!this.validations[v](value, this.props.customTest)) {
					errors.push(v);
				}
			})
			errors = [];
		}

		this.setState({ errors, value });
		// TODO: handle errors using actions (?)
		this.props.onChange(e, errors);
	}

	componentWillReceiveProps(props) {
		if (this.props.value && this.props.value != this.state.value) {
			this.setState({ value: this.props.value });
		}
	}

	render() {
		const abbrev = Object.keys(STATES);
		const errors = this.state.errors || [];

		return (
			<select ref={this.props.ref || ''} data-key={this.props['data-key']} className={`${this.props.className || ''} ${(errors.length > 0) ? "error" : ""} input-component`} value={this.state.value} placeholder={this.props.placeholder || ''} onChange={this.handleChange}>
				<option value={this.props.defaultValue || ''}>{this.props.defaultText || 'Select'}</option>
				{abbrev.map((a) => {
					return (
						<option key={`state-${a}`} value={a}>{STATES[a]}</option>
					);
				})}
			</select>
		);
	}
}
