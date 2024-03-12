let controller = {}
const { createAccount, viewAd } = require("../utils/biconomy")

controller.createAccount = async(req,res,next)=>{
    try {
        let address = await createAccount();
        res.status(200).send({status:'OK', address: address})
    } catch (error) {
        next(error)
    }
    
}

controller.viewAd = async(req,res,next) => {
    try {
        let data = await viewAd(); 
        res.status(200).send({status:'OK', data: data})
    } catch (error) {
        next(error)
    }
}

module.exports = controller
