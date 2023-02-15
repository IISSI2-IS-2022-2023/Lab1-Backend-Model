'use strict'

const RestaurantController = require('../controllers/RestaurantController')

module.exports = (options) => {
  const app = options.app

  app.route('/restaurants')
    .get(RestaurantController.index)

}
