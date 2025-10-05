# Secure Vault APP 

In this project, we created a react app where we can store any personal or sensitive information securely  
we are encrypting(using AES cipher) everything in app, if you want to see the original information you have to decrypt the
info first by filling the key(which is stored securely directly after hashing using SHA-256 at client's side)  
You should remember this key there is no changing key option. If you forgot this key, your info will be list. Because we are not storing key directly.

You can check out our project here: [Secure Vault](https://secure-vault1.vercel.app/)


In the project directory, you should run the following two commands:  
  
### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

