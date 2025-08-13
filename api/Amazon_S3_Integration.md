# Reason

I have very little hope I will actually remember the steps I took to complete the Amazon s3 task.

Below is a step by step breakdown of the process, inspired by [this video](https://www.youtube.com/watch?v=eQAIojcArRY&t=996s)

## Quick Setup

If you just want to setup on your local machine S3 access, go to [Bucket Access](#bucket-access) and copy and paste the `.env` variables into your `.env` file. The `ACCESS_KEY` and `SECRET_ACCESS_KEY` and `BUCKET_NAME` are not in this file for _obvious_ reasons(hiding bucket name might just me being paranoid). If the `SECRET_ACCESS_KEY` ends up getting _lost_, then I will have to make a new **IAM** user, so please let me know.

Next install the npm packages if you haven't done this setup before. This way you install the packages in [Express Server File Handling](#express-server-file-handling) and [Amazon S3 SDK](#amazon-s3-sdk).

```bash
npm install
```

Thats it! You can now run requests to the Amazon S3 bucket, and our PostgreSQL DB. If you run into any issues, please reach out to me @EmmanuelR21.

## Bucket Access

1. Our bucket is essentially the storage DB that holds the images and video files. The media files are known as **"Objects"**
2. There is an Amazon **IAM** user known as `echo-cache`, which has 3 permissions(given by a custom policy I created), they are:
   1. `PUT` object to DB. (They do not call it POST for some reason)
   2. `GET` object from DB.
   3. `DELETE` object from DB.

**_IMPORTANT: To be able to use the user within our express server, the following PRIVATE keys must be used in an `.env` file:_**

```env
BUCKET_NAME='capstone-2-echo-cache'
BUCKET_REGION='us-east-2'
ACCESS_KEY=''
SECRET_ACCESS_KEY=''
```

## Express Server File Handling

Our express server will not understand how to deal with `multipart/form-data`(This is the `Content-Type` of the media we send through the `<input type="file"/>`) by default, so we will need to use a middleware known as `multer`. We will also need `sharp` which is a package we will use for image/video resizing. `sharp` isn't strictly necessary but it would be nice to have all of our video and image formats in a portrait mode.

```bash
npm install multer sharp # sharp is not strictly required
```

Next put in some of these important variables. **NOTE:** that the `crypto` variable is imported from a built in Javascript library, so there should be no need to install `crypto`. It will be used later for unique ID creation.

```javascript
const multer = require("multer");
const crypto = require("crypto");
const sharp = require("sharp"); // To create a resized image, for example to put images into portrait mode.

const storage = multer.memoryStorage(); //This designates the server to store the media in memory, instead of on disk.
const upload = multer({ storage: storage });
```

Our `upload` variable will be used later in our route as a middleware.

## Amazon S3 SDK

After having created an access point to the bucket, now what is needed is to install to the express server `@aws-sdk/client-s3` for creating `POST` request to our Bucket, and `@aws-sdk/s3-request-presigner` for `GET` requests to the Bucket:

```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

After installing, paste these variables into the header of the file, these will all serve a purpose for our `GET`, `POST` and `DELETE`:

```javascript
const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectsCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
```

Next, we will need to create an `s3Client` using our `.env` variables:

```javascript
const bucketName = process.env.BUCKET_NAME;
const bucketRegion = process.env.BUCKET_REGION;
const accessKey = process.env.ACCESS_KEY;
const secretAccessKey = process.env.SECRET_ACCESS_KEY;

const s3 = new S3Client({
  credentials: {
    accessKeyId: accessKey,
    secretAccessKey: secretAccessKey,
  },
  region: bucketRegion,
});
```

### Quick **IMPORTANT** note

Its important I clarify a few things:

1. Our Amazon s3 bucket exists on my AWS account, with a free tier for 3 months more or less, or until my credits run out, which I have ample enough for our testing phase. Please see number 3 :)
2. The Sequelize related models functions/method names are all guesswork for now, as I have not fully implemented the activity within our own DB. I will update with proper naming, and behavior when it gets implemented officially.
3. There is **NO** validation being done right now. In theory someone could upload a zetabyte of horse videos and my AWS account bill will go 📈. _Please_ do **NOT** do this and be cautious on the size of content you are uploading. If we reach double digits in GB's, please let me know you are doing this so I can monitor my usage on AWS. Thanks :)!
4. I did not keep security in mind when developing the routes as I was moving quickly to develop the rough idea. I will update this as we continue developing the routes.

### Posting to our Bucket

```javascript
/*
- upload.array() will take an array of "files" named "media". The name "media" can be literally anything, just depends on what you name the array of files being sent from the client.
- upload.array() will store the file buffers in req.files when it is done.
*/
router.post(
  "/",
  [authenticateJWT, upload.array("media", 10)],
  async (req, res) => {
    // We use UUID's to prevent file name collision, which will overwrite one file over the other. We will also use it to retrieve the media later so we store it in our Postgres DB.
    const image_uuids = [];
    // S3 does not allow you to upload several files at once, so we have to loop
    for (let i = 0; i < req.files.length; i++) {
      const buffer = await sharp(req.files[i].buffer)
        .resize({ height: 1920, width: 1080, fit: "contain" })
        .toBuffer(); //This is for resizing an image to portrait mode. The image wont get affected, but black bars will fill the gaps.
      const uniqueImgId = crypto.randomUUID();
      const params = {
        Bucket: bucketName,
        Key: uniqueImgId,
        Body: buffer, //This is strictly for image resizing, if uploading videos you would have to use req.files[i].buffer and or use another package to resize the video.
        ContentType: req.files[i].mimetype,
      };

      const command = new PutObjectCommand(params);
      // The following uses the s3Client variable we made earlier, to store to the AWS DB bucket
      await s3.send(command);
      // Upon successful completion we also save the UUID in our array
      image_uuids.push(uniqueImgId);
    }
    await Echoes.create({
      /*
    Include here all relevant info for creating the echo
    */
      image_uuids,
    });

    res.send(post);
  },
);
```

### Getting from our Bucket

```javascript
router.get("/:id", authenticateJWT, async (req, res) => {
  const echo = await Echo.getByPk(echoId);
  const signed_urls = [];
  for (let i = 0; i < echo.image_uuids.length; i++) {
    const objectParams = {
      Bucket: bucketName,
      Key: echo.image_uuids[i],
    };
    const command = new GetObjectCommand(objectParams);
    const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
    signed_urls.push(url);
  }
  // I prefer this method as opposed to using Sequelize's "update" method, as the AWS signed url is rather long, and might throw an error to the server (although it will still attach itself properly)
  echo.signed_urls = signed_urls;
  res.send(echo);
});
```

### Deleting from our Bucket

```javascript
router.delete("/:id", async (req, res) => {
  const echoId = req.params.id;
  const echo = await Echo.findByPk(echoId);
  const params = {
    Bucket: bucketName,
    // Takes an array called "Objects" which will have the array of the multiple uuids, to delete all at once.
    Delete: {
      Objects: echo.uuids.map((uuid) => ({ Key: uuid })),
    },
  };
  // Delete multiple objects from the bucket
  const command = new DeleteObjectsCommand(params);
  await s3.send(command);

  // Sequelize deletes from our db here
  await echo.destroy();
  res.send({});
});
```

## Final Note

I'm so happy I'm done with this 😭
