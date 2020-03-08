import bodyParser from 'body-parser';
import express, { Request, Response } from 'express';
import { deleteLocalFiles, filterImageFromURL } from './util/util';

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;

  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  // @TODO1 IMPLEMENT A RESTFUL ENDPOINT
  // GET /filteredimage?image_url={{URL}}
  // endpoint to filter an image from a public url.
  // IT SHOULD
  //    1
  //    1. validate the image_url query
  //    2. call filterImageFromURL(image_url) to filter the image
  //    3. send the resulting file in the response
  //    4. deletes any files on the server on finish of the response
  // QUERY PARAMATERS
  //    image_url: URL of a publicly accessible image
  // RETURNS
  //   the filtered image file [!!TIP res.sendFile(filteredpath); might be useful]

  /**************************************************************************** */

  //! END @TODO1

  // Root Endpoint
  // Displays a simple message to the user
  app.get("/", async (req, res) => {
    res.send("try GET /filteredimage?image_url={{}}")
  });

  app.get("/filteredimage", async (req: Request, res: Response) => {
    let { image_url } = req.query;

    if (!image_url) {
      return res.status(400).send({ error: "image_url is required", status: 400 });
    }

    if (!isURL(image_url) || !isIMG(image_url)) {
      return res.status(406).send({ error: "URL is not valid.", status: 500 })
    }

    try {
      const imagelUrl = await filterImageFromURL(image_url)
      res.status(200).sendFile(imagelUrl, (error) => {
        deleteLocalFiles([imagelUrl])
        if (error) {
          res.status(422).send("The server has encountered an error while returning the filtered image.")
        }
      });
    } catch (error) {
      return res.status(500).send({ error: "Internal error. ", status: 500 })
    }
  });

  const isURL = (imageURL: string) => {
    var pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
      '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
    return !!pattern.test(imageURL);
  }

  const isIMG = (imageURL: string) => {
    return (imageURL.match(/\.(jpeg|jpg|gif|png)$/) != null);
  }

  // Start the Server
  app.listen(port, () => {
    console.log(`server running http://localhost:${port}`);
    console.log(`press CTRL+C to stop server`);
  });
})();