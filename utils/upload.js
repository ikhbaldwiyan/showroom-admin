const { cloudinary } = require("../.config/storage/storage")


const uploadImage = async (file, folder) => {

  const { fieldname, originalname, mimetype, path, size } = file

  const result = {
    success: false,
    message: null
  }

  try {

    const options = {
      folder: `${folder}s/`,
      use_filename: true,
      unique_filename: true
    }

    const image = await cloudinary.uploader.upload(path, options)

    result.success = true
    result.image = image
    
  } catch (error) {
    result.message = error.message
  }

  return result
}

module.exports = {
  uploadImage
}