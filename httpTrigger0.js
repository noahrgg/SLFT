const { app } = require('@azure/functions');

var multipart = require("parse-multipart");
const { BlobServiceClient } = require("@azure/storage-blob");
const connectionstring = process.env["AZURE_STORAGE_CONNECTION_STRING"];
const account = "sfttriggerstorage";


module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    var boundary = multipart.getBoundary(req.headers['content-type']);

    var body = req.body;

    var parts = multipart.Parse(body, boundary);

    var username = req.headers['username'];

    var filetype = parts[0].type;

    if (filetype == "image/png") {
        ext = "png";
    } else if (filetype == "image/jpeg") {
        ext = "jpeg";
    } else {
        username = "invalidimage"
        ext = "";
    }
    
    var result = await uploadBlob(parts, username, ext);
}


async function uploadBlob(img, username, filetype){

    const blobServiceClient = await BlobServiceClient.fromConnectionString(connectionstring);

    const container = "images";
    const containerClient = await blobServiceClient.getContainerClient(container);

    const blobName = username + "." + filetype;

    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    const uploadBlobResponse = await blockBlobClient.upload(img[0].data, img[0].data.length);
}

async function loadFile(event){
    console.log("Got picture!");
    var image = document.getElementById("output");

    image.src = URL.createObjectURL(event.target.files[0])
}


async function handle(event) {
    event.preventDefault();
    document.getElementById("output").src = "img/logo.png";
    console.log("Loading picture");
    var username = document.getElementById("username").value;
    if (username.includes(' ') == true || username == '') {
      alert("Invalid username. A username cannot contain a space.");
      window.location.reload();
      return;
    }

    document.getElementById("upload").src = "img/doneupload.gif";
    $('#submit').html(`Thank you for your image, use "${username}" to receive your pdf.`);

    var myform = document.getElementById("image-form");
        var payload = new FormData(myform);

        console.log("Posting your image...");
        const resp = await fetch("https://bunnimage1.azurewebsites.net/api/uploadTrigger?code=Ia/3vNYiimrORzxaZRGlmdm695dnnSpCP0qd7R1k1WaUeRO2JUfGtg==", {
            method: 'POST',
            headers: {
                'username' : username
            },
            body: payload
        });

        var data = await resp.json();
        console.log(data);
        console.log("Blob has been stored successfully!")
}

/*app.http('httpTrigger0', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log(`Http function processed request for url "${request.url}"`);

        const name = request.query.get('name') || await request.text() || 'world';

        return { body: `Hello, ${name}!` };
    }
});
*/