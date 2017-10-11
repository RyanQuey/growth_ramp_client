import React, { Component } from 'react'
// import { connect } from 'react-redux'

export default class ForgotPassword extends Component {
	componentDidMount() {
		this.state.sent = false;
		this.state.params = {};
	}

	handleSubmit(e) {
		e.preventDefault()
		this.setState({ pending: true })

		const sendData = { email: this.state.email }

		$.post("/api/resetPassword", sendData)
		.then(() => {
			this.setState({ sent: true, pending: false })

			if (typeof this.props.onSuccess === 'function') {
				this.props.onSuccess()
			}
		})
		.catch((data) => {
			let error = "Invalid e-mail or password."
			if (data && data.responseText) {
				try {
					const stuff = JSON.parse(data.responseText)
					error = stuff.error || stuff.message || error;
				} catch (e) {
					// do nothin' ... my favorite!
				}
			}

			this.setState({ pending: false })
			// Store("notify").set({ title: "Error logging in", message: error, level: "error" });
		});
	}

	cancel(e) {
		e.preventDefault();

		if (typeof this.props.onCancel === 'function') {
			this.props.onCancel();
		}
	}

	render() {
		if (this.state.sent) {
			return (
				<div>
					{/* <Shared.Components.AlertWithIcon>
						Instructions have been sent to your e-mail.  If you do not receive an e-mail, you may need to create an account.
					</Shared.Components.AlertWithIcon> */}
					{ this.props.showCancel ? (
						<div className="row">
							<div className="col-xs-6 col-xs-offset-3">
								<span className="btn btn-default btn-block" onClick={this.cancel}>OK</span>
							</div>
						</div>
					) : ("")
				 }
				</div>
			)
		}

		return (
			<form onSubmit={this.handleSubmit} style={{ marginTop: '10px' }}>
				<div className="form-group has-feedback">
					<label>Enter the e-mail address you used to sign-up</label>
					<input type="email" className="form-control" placeholder="Enter your e-mail" data-key="email" onChange={this.handleParam} />
					<span className="glyphicon glyphicon-envelope form-control-feedback" />
				</div>
				<div className="row">
					<div className="col-xs-6">
						{ this.props.showCancel ? (
							<span className="btn btn-default btn-block" onClick={this.cancel}>{ this.state.sent ? "OK" : "Cancel" }</span>
						) : ("") }
					</div>
					<div className="col-xs-6">
						{this.state.pending ? (
							<button disabled="true" className="btn btn-primary btn-block btn-flat"><i className="fa fa-spinner fa-spin fa-lg" /></button>
						) : (
							<button type="submit" className="btn btn-primary btn-block btn-flat">Reset Password</button>
						)}
					</div>
				</div>
			</form>
		)
	}
}
