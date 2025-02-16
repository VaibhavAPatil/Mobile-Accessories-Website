const productModel = require("../../models/productModel");
const vendorModel = require("../../models/vendorModel");

const uploadFile = require("../Amazom S3 Bucket/bucketController");

const {
  emptyBody,
  isValidString,
  validTrim,
  isNotProvided,
  isValidImage,
  isValidObjectId,
} = require("../../utils/validators");

const updateProduct = async (req, res) => {
  try {
    let { productId, userId } = req.params;

    const decodedToken = req.verifyed;

    if (!isValidObjectId(userId))
      return res
        .status(403)
        .send({ status: false, message: "please login again" });
    let isCorrectUser = await bcrypt.compare(userId, decodedToken.userId);

    if (!isCorrectUser)
      return res
        .status(403)
        .send({ status: false, message: "please login again" });

    const checkVendor = await vendorModel
      .findById(userId)
      .select({ isSuspended: 1, isApproved: 1 })
      .lean();
    if (!checkVendor)
      return res
        .status(401)
        .send({ status: false, message: "only vendors can add products" });
    if (checkVendor.isSuspended)
      return res.status(401).send({
        status: false,
        message: "Your account is suspended. Plese connect the admin",
      });
    if (!checkVendor.isApproved)
      return res
        .status(401)
        .send({ status: false, message: "Your are still not approved." });

    let data = req.body;
    if (emptyBody(data))
      return res
        .status(400)
        .send({ status: false, message: "provide some data" });

    if (!productId)
      return res
        .status(400)
        .send({ status: false, message: "provide Product Id" });

    if (!isValidObjectId(productId))
      return res
        .status(400)
        .send({ status: false, message: "provide a valid Product Id" });

    let productsDetails = await productModel
      .findOne({
        _id: productId,
        isDeleted: false,
      })
      .lean();
    if (!productsDetails)
      return res
        .status(404)
        .send({ status: false, message: "Product Not Found" });
    if (emptyBody(data))
      return res
        .status(400)
        .send({ status: false, message: "provide some data" });

    let {
      title,
      description,
      price,
      isFreeShipping,
      compatible_models,
      category,
      available_Quantity,
    } = data;
    data.isDeleted = false;
    if (title || title === "") {
      title = validTrim(title);
      if (!isNotProvided(title))
        return res
          .status(400)
          .send({ status: false, message: "provide the title" });
      if (!isValidString(title))
        return res
          .status(400)
          .send({ status: false, message: "provide valid title" });
      data.title = title;
      let isUniqueTitle = await productModel.findOne({ title: data.title });
      if (isUniqueTitle) {
        return res
          .status(400)
          .send({ status: false, message: "This title is being used already" });
      }
    }

    if (description || description === "") {
      description = validTrim(description);
      if (!isNotProvided(description))
        return res
          .status(400)
          .send({ status: false, message: "provide the description" });
      if (!isValidString(description))
        return res
          .status(400)
          .send({ status: false, message: "provide valid description" });
      data.description = description;
    }

    if (price || price === "") {
      price = validTrim(price);
      if (!isNotProvided(price))
        return res
          .status(400)
          .send({ status: false, message: "price cannot be empty" });

      if (!Number(price))
        return res.status(400).send({
          status: false,
          message: "price should be in valid number format",
        });
      if (price <= 0)
        return res
          .status(400)
          .send({ status: false, message: "product can not be free" });
      data.price = Number(price).toFixed(2);
    }

    if (available_Quantity) {
      price = validTrim(available_Quantity);
      if (!isNotProvided(available_Quantity))
        return res.status(400).send({
          status: false,
          message: "available_Quantity cannot be empty",
        });

      if (!Number(available_Quantity))
        return res.status(400).send({
          status: false,
          message: "available_Quantity should be in valid number format",
        });
      if (available_Quantity < 0)
        return res.status(400).send({
          status: false,
          message: "available_Quantity can not be negative",
        });
      data.available_Quantity = Number(available_Quantity);
    }
    if (isFreeShipping) {
      let a = ["true", "false"];
      isFreeShipping = validTrim(isFreeShipping);
      if (!a.includes(isFreeShipping))
        return res
          .status(400)
          .send({ status: false, message: "type should be in true or false" });
      isFreeShipping = isFreeShipping;
    }

    if (compatible_models) {
      compatible_models = JSON.parse(compatible_models);
      for (let eachModel of compatible_models) {
        let final = validTrim(eachModel);
        if (final == "")
          return res.status(400).send({
            status: false,
            message: "empty model name cannot be provided",
          });
      }
      compatible_models = compatible_models;
    }
    if (category) {
      category = JSON.parse(category);
      for (let eachModel of category) {
        let final = validTrim(eachModel);
        if (final == "")
          return res.status(400).send({
            status: false,
            message: "empty model name cannot be provided",
          });
      }
      category = category;
    }

    let files = req.files;
    if (files.length > 0) {
      if (!files.every((v) => isValidImage(v.originalname) == true))
        return res
          .status(400)
          .send({ status: false, message: "provide a valid image" });

      let productImagePromises = await files.map((img) =>
        uploadFile(img, "product/")
      );
      productImage = await Promise.all(productImagePromises);
    }

    let updateData = await productModel.findByIdAndUpdate(productId, data, {
      new: true,
    });
    if (!updateData)
      return res
        .status(404)
        .send({ status: true, message: "Product Not Found" });
    return res.status(200).send({
      status: true,
      message: "Updated  Successfully",
      data: updateData,
    });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

module.exports = updateProduct;
