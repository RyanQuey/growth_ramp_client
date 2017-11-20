import { Component } from 'react'
import PropTypes from 'prop-types'
import Dropzone from 'react-dropzone'
import { formActions } from 'shared/actions'
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
        background: (props.imageUrl || props.defaultImage) ? `url(${props.imageUrl || props.defaultImage}) no-repeat center center` : this.props.backgroundColor || theme.color.white,
        backgroundSize: "cover",
        height: props.height || "100%",
        width: props.width || "100%",
      },
    })
    this.onDrop = this.onDrop.bind(this)
  }

  onDrop (acceptedFiles, rejectedFiles) {
    console.log('acceptedFiles', acceptedFiles)
    console.log('rejectedFiles', rejectedFiles)

    const acceptedFile = acceptedFiles[0]
    const rejectedFile = rejectedFiles[0]

    this.props.onStart && this.props.onStart(acceptedFile, rejectedFile)
    formActions.uploadFile(acceptedFile)
    .then((fileUrl) => {
      this.props.onSuccess && this.props.onSuccess(fileUrl)
    })
    .catch((err) => {
      console.log(err);
      this.props.onFailure && this.props.onFailure(err)
    })
    //clear url from browser memory to avoid memory leak
    window.URL.revokeObjectURL(acceptedFile.preview)

    //only use one file per DZ, so can set background to preview
  }

  render() {
    return (
      <Flexbox align="center" direction="column" justify="center" className={this.props.className || ""}>
        <Dropzone
          className={`${css(this.styles.dropzone)} ${classes.dropzone}`}
          multiple={false}
          onDrop={this.onDrop}
          style={this.props.style}
        >
          <Flexbox align="center" direction="column">
            <div>{this.props.label}</div>
            <Icon color="black" name="picture-o" />
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
