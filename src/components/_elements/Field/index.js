import { Field as ReduxField } from 'redux-form'
import PropTypes from 'prop-types'
import {
	alphaNumeric,
	email,
	maxLength,
	minLength,
	minValue,
	number,
	phoneNumber,
	required,
} from 'utils/formValidators'

import styles from './styles.scss'

// eslint-disable-next-line
const validateField = ({ className, input, label, type, meta: { touched, error, warning } }) => (
	<div className={className}>
		<input className={styles.field} {...input} placeholder={label} type={type} />
		{touched &&
			((error && <span>{error}</span>) ||
				(warning && <span>{warning}</span>)
			)
		}
	</div>
)

const Field = (props) => {

	let validators = []

	if (props.validate) {
		validators = props.validate.map((validator) => {
			switch (validator) {
			case 'alphaNumeric':
				return alphaNumeric
			case 'email':
				return email
			case 'maxLength':
				return maxLength
			case 'minLength':
				return minLength
			case 'minValue':
				return minValue
			case 'number':
				return number
			case 'phoneNumber':
				return phoneNumber
			case 'required':
				return required
			}
		})
	}

	if (props.type === 'select') {
		return (
			<div className={props.className}>
				<ReduxField component="select" {...props} className={styles.field}>
					<option />
					{props.data.map(data => (
						<option key={data.value} value={data.value}>
							{data.text}
						</option>
					))}
				</ReduxField>
			</div>
		)
	}

	return <ReduxField component={validateField} {...props} validate={validators} />
}

Field.propTypes = {
	className: PropTypes.string,
	data: PropTypes.array,
	type: PropTypes.string,
	validate: PropTypes.arrayOf(PropTypes.string),
}


export default Field
