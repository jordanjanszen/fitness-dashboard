var express = require('express');
var router = express.Router();
var axios = require('axios');

const activitiesController = require('../controllers/activities');

router.get('/', activitiesController.index);

router.get('/activities', async (req, res) => {
    try {
      // Assuming the access token is available in the request object
      const accessToken = req.user.accessToken; // Adjust this based on your authentication setup
  
      // Make the API request to Strava to get activities
      const response = await axios.get('https://www.strava.com/api/v3/athlete/activities', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
  
      const activities = response.data;
      res.json(activities);
    } catch (error) {
      console.error('Error fetching Strava activities:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

module.exports = router;