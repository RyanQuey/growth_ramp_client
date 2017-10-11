import PropTypes from 'prop-types'
import { Field } from 'shared/components/elements'
import classnames from 'classnames'
import styles from './styles.scss'

const FieldSet = (props) => {
	const {
		className,
		fieldClassName,
		fields,
		labelClassName,
		legend,
		legendClassName
	} = props

	const renderLegend = () => (
		legend
			? <legend className={classnames(legendClassName, styles.legend)}>{legend}</legend>
			: ''
	)

	const renderFields = () => (
		fields.map(field => (
			<div className={`clearfix ${styles.fieldWrapper}`} key={field.name}>
				<label className={labelClassName} htmlFor={field.name}>{field.label}</label>
				<Field
					className={fieldClassName}
					data={field.data}
					name={field.name}
					placeholder={field.placeholder}
					type={field.type}
					validate={field.validate}
				/>
			</div>
		))
	)

	return (
		<fieldset className={classnames(className, styles.fieldset)}>
			{renderLegend()}
			{renderFields()}
		</fieldset>
	)
}

FieldSet.propTypes = {
	className: PropTypes.string,
	fieldClassName: PropTypes.string,
	fields: PropTypes.arrayOf(PropTypes.shape({
		label: PropTypes.string,
		name: PropTypes.string.isRequired,
		type: PropTypes.string.isRequired,
		validate: PropTypes.arrayOf(PropTypes.string),

		data: PropTypes.arrayOf(PropTypes.object), // for dropdown only
		textField: PropTypes.string, // for dropdown only
		valueField: PropTypes.string, // for dropdown only
	})),
	labelClassName: PropTypes.string,
	labelOnLeft: PropTypes.bool,
	legend: PropTypes.string,
	legendClassName: PropTypes.string,
}

FieldSet.defaultProps = {
	className: `col-sm-6`,
	fieldClassName: 'col-xs-7 col-md-8',
	labelClassName: 'col-xs-5 col-md-4',
	labelOnLeft: true,
}

export default FieldSet
