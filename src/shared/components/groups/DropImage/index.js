import { Component } from 'react'
import PropTypes from 'prop-types'
import Dropzone from 'react-dropzone'
import { formActions, alertActions } from 'shared/actions'
import { Flexbox, Icon } from 'shared/components/elements'
import classes from './style.scss'
import theme from 'theme'
import { StyleSheet, css } from 'aphrodite'

class DropImage extends Component {
  constructor(props) {
    super(props)

    this.state = {
      pending: false,
    }
    this.styles = StyleSheet.create({
      dropzone: {
        background: (props.imageUrl || props.defaultImage) ? `url(${encodeURI(props.imageUrl) || props.defaultImage}) no-repeat center center` : this.props.backgroundColor || theme.color.white,
        backgroundSize: "cover",
        height: props.height || "100%",
        width: props.width || "100%",
      },
    })
    this.onDrop = this.onDrop.bind(this)
  }

  handleError(e, a) {
    console.log(e, a);

  }

  onDrop (acceptedFiles, rejectedFiles) {
    const acceptedFile = acceptedFiles[0]
    const rejectedFile = rejectedFiles[0]

    if (rejectedFile) {
      let message
      if (rejectedFile.size > 2*1000*1000) {
        message = "Maximum file size is 2MB"
      } else if (!rejectedFile.type.includes("image/")) {
        message = "File must be an image"
      } else {
        message = "Unknown error"
      }

      alertActions.newAlert({
        title: "Failed to upload:",
        message: message,
        level: "DANGER",
      })

    } else {
      this.setState({pending: true})
      this.props.onStart && this.props.onStart(acceptedFile, rejectedFile)
      formActions.uploadFile(acceptedFile)
      .then((fileUrl) => {
        this.setState({pending: false})
        this.props.onSuccess && this.props.onSuccess(fileUrl)
      })
      .catch((err) => {
        console.log(err);
        this.setState({pending: false})
        this.props.onFailure && this.props.onFailure(err)
      })
      //clear url from browser memory to avoid memory leak
      window.URL.revokeObjectURL(acceptedFile.preview)

    }
  }

  render() {
    return (
      <Flexbox align="center" direction="column" justify="center" className={this.props.className || ""}>
        <Dropzone
          disabled={this.state.pending}
          className={`${css(this.styles.dropzone)} ${classes.dropzone}`}
          multiple={false}
          onDrop={this.onDrop}
          style={this.props.style}
          maxSize={2*1000*1000} //2MB
          accept="image/*"
        >
          <Flexbox align="center" direction="column">
            <div>{this.props.label}</div>
            {this.state.pending ? <Icon color="black" name="spinner" /> : <Icon color="black" name="picture-o" />}
          </Flexbox>
        </Dropzone>
      </Flexbox>
    )
  }
}

DropImage.propTypes = {
  defaultImage: PropTypes.string,
  height: PropTypes.string,
  imageUrl: PropTypes.string,
  label: PropTypes.string,
  style: PropTypes.object,
  width: PropTypes.string,
}

export default DropImage
