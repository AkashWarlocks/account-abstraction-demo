const express = require('express');
const controller = require('../controller/index')

const router = express.Router();

router.post('/create-account', controller.createAccount);
router.post('/view-ad', controller.viewAd)
module.exports = router;