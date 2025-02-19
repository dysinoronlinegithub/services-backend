const expressAsyncHandler = require("express-async-handler");
const { UserProfile } = require("../models/user-profile");
const fs = require("fs");
const mongoose = require("mongoose");

const uploadFile = expressAsyncHandler(async (req, res) => {
  if (req.file == undefined) {
    throw new Error({ msg: "No file selected!" });
  } else {
    const id = req.params.userid;
    const fileProperties = req.file;
    fileProperties.byUser = id;
    const file = new UserProfile(fileProperties);
    const path = process.env.FILE_PATH + file.path;
    file.path = path;

    let result;
    const userProfile = await UserProfile.findOne({ byUser: id });
    if (userProfile) {
      //delete old record from db
      const userId = new mongoose.Types.ObjectId(id);
      const resultDelete = await UserProfile.deleteOne({
        byUser: userId,
      });
      //delete image profile in directory
      fs.unlinkSync(userProfile.path);
      //save new record in db
      result = await file.save();
    } else {
      //save new reord in db
      result = await file.save();
    }
    return res.json(result);
  }
});

const getFile = expressAsyncHandler(async (req, res) => {
  const id = req.params.userid;
  const file = await UserProfile.findOne({ byUser: id });
  return res.sendFile(file.path);
});

module.exports = { uploadFile, getFile };
