import uuidv4 from 'uuid/v4'
import {
  SET_PARAMS,
  SET_OPTIONS,
  FORM_PERSISTED,
  CLEAR_PARAMS,
} from 'constants/actionTypes'

//TODO probably make nested object like this in reducer
export const setParams = (component, form, params, dirty = true) => {
  const payload = {
    component,
    form,
    params,
    dirty,
  }

  store.dispatch({type: SET_PARAMS, payload })
}

export const setOptions = (component, form, options) => {
  const payload = {
    component,
    form,
    options,
  }

  store.dispatch({type: SET_OPTIONS, payload })
}

export const uploadFile = (file) => {
  return new Promise((resolve, reject) => {
    const formData = new FormData()
    //rename to ensure unique path, and will work as link AND for background image
    let newName = `${uuidv4()}-${file.name.replace(/\(,|\/|\s|\?|:|@|&|=|\+|#\)+/g, "_")}`
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

      return resolve(uploadedFile)
    })
    .catch((err) => {
      console.log("fail to upload");
      console.error(err);
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


//basically, the post you are working on will reflect the same data it had, and params are ready to persisted if you update again
//other campaign params is set too; each "form" is a campaign attribute
export const matchCampaignStateToRecord = () => {
console.log("now running");

  const campaign = Helpers.safeDataPath(store.getState(), `currentCampaign`, {})
console.log(campaign.id);
  const campaignPosts = campaign.posts || []
  //convert to object for easy getting/setting
  const postObj = campaignPosts.reduce((acc, post) => {
    acc[post.id] = post
    return acc
  }, {})

  setParams("EditCampaign", "posts", postObj, false)
  delete campaign.posts //will not be updating posts on that part of the state, so don't want to confuse things; just remove it
  setParams("EditCampaign", "other", campaign, false)
}

