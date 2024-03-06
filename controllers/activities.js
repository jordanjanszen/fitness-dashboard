const Activity = require('../models/Activity');

async function index (req, res) {
    const activities = await Activity.find({});
    res.render('./activities', {activities: activities, title: "My Activities"});
};

module.exports = {
    index,
}