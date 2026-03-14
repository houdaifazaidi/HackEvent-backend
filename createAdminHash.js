const bcrypt = require("bcrypt");


const generateAdminHash = async (password) => {

  const hash = await bcrypt.hash(password, 10);

  console.log("Admin password hash:", hash);

};



console.log(generateAdminHash("admin123"));