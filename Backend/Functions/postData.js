const connection = require('../Services/Connection')

module.exports = async function postData(req, res){
    console.log(req.body.name);
    console.log(req.body.age);

    return res.send("Data received!!!");
}