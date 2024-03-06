
async function index (req, res) {
    res.render('./auth', { title: "Auth"});
};

module.exports = {
    index,
}