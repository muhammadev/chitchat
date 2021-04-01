const Message = require("../../models/Message");

module.exports = (req, res) => {
    const { id } = req.params;

    console.log("trying to fetch chat of this one: ", id);
    // all messages from/to this id
    Message
        .find({$or: [{from: id}, {to: id}]})
        .populate("from", "_id username fullname")
        .populate("to", "_id fullname username")
        .exec((err, messages) => {
            if (err) {
                console.log("couldn't find messages of this user");
                return res.status(404).send();
            }
    
            // console.log("found some chat here: ", messages);
            res.status(200).send({messages});
        })
}