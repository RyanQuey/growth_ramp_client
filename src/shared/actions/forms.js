import uuidv4 from 'uuid/v4'
import {
  SET_PARAMS,
  FORM_PERSISTED,
  CLEAR_PARAMS,
} from 'constants/actionTypes'

//TODO probably make nested object like this in reducer
export const setParams = (component, form, params) => {
  const payload = {
    component,
    form,
    params,
  }

  store.dispatch({type: SET_PARAMS, payload })
}

export const uploadFile = (file) => {
  return new Promise((resolve, reject) => {
    const formData = new FormData()
    //rename to ensure unique path
    let newName = `${file.name}-${uuidv4()}`
    //NOTE: using the File API might make incompatibility with old IE11, Edge 16, old android
    let namedFile = new File([file], newName, {type: file.type})

    formData.append("fileToUpload", namedFile)
    formData.append("user", store.getState().user)
    axios.post("/upload", formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    })
    .then((result) => {
      const uploadedFile = result.data
      console.log("uploaded stuff");
      console.log(uploadedFile);

      return resolve(uploadedFile)
    })
    .catch((err) => {
      console.log("fail to upload");
      console.log(err);
      return reject(err)
    })

  })
}

export const formPersisted = (component, form) => {
  store.dispatch({
    type: FORM_PERSISTED,
    payload: {
      component,
      form,
    },
  })
}
export const clearParams = () => {
  store.dispatch({type: CLEAR_PARAMS})
}
