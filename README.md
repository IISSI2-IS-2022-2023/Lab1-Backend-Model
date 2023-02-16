# Introduction
We will learn how to run a basic _Node.js_ HTTP server and setup our project structure using the _Express_ framework.
Secondly, we will understand how to create the Model of our project (from the MVC pattern) and learn how the _Sequelize_ package will help us creating the relational database schema and perform operations on the Maria Database.
## Prerequisites
* Keep in mind we are developing the backend software needed for DeliverUS project. Please, read project requirements found at:  https://github.com/IISSI2-IS-2022-2023/DeliverUS-Backend-2022-2023/blob/main/README.md
  * The template project includes EsLint configuration so it should auto-fix formatting problems as soon as a file is saved.


# Exercices

## 1. Accept GitHub Classroom assignment and clone
Accept the GitHub Classroom assignment to create your own repository based on this template (most likely you have already done it if you are reading these instructions.). Afterwards, clone your own repository by opening VScode and clone the base lab repository by opening Command Palette (Ctrl+Shift+P or F1) and `Git clone` this repository, or using the terminal and running
```PowerShell
git clone <url>
```

Alternatively, you can use the *Source Control* button in the left-sided bar and click on *Clone Repository* button. 

In case you are asked if you trust the author, please select yes.

It may be necessary to setup your git username by running the following commands on your terminal, in order to be able to commit and push:
```PowerShell
git config --global user.name "FIRST_NAME LAST_NAME"
git config --global user.email "MY_NAME@example.com"
```



## 2. Inspect project structure

You will find the following elements (some of them will appear in following labs):
* `package.json`: scripts for running the server and packages dependencies including express, sequelize and others. This file is usally created with `npm init`, but you can find it already in your cloned project.
    * In order to add more package dependencies you have to run `npm install packageName --save` or `npm install packageName --save-dev` for dependencies needed only for development environment (p. e. nodemon). To learn more about npm please refer to [its documentation](https://docs.npmjs.com/cli/v7/commands/npm).
* `package-lock.json`: install exactly the same dependencies in futures deployments. Notice that dependencies versions may change, so this file guarantees to download and deploy the exact same tree of dependencies.
* `backend.js`: run http server, setup connections to Mariadb and it will initialize various components
* `.env.example`: example environment variables.
* `models` folder: where models entities are defined
* `database` folder: where all the logic for creating and populating the database is located
    * `database/migrations` folder: where the database schema is defined
    * `database/seeders` folder: where database sample data is defined
* `routes` folder: where URIs are defined and referenced to middlewares and controllers
* `controllers` folder: where business logic is implemented, including operations to the database
    * `controllers/validation` folder: validation of data included in client requests. One validation file for each entity
* `middlewares` folder: various checks needed such as authorization, permissions and ownership.
* `config` folder: where some global config files are stored (to run migrations and seeders from cli)
* `example_api_client` folder: will store test requests to our Rest API
* `.vscode` folder: VSCode config for this project


## 3. Inspect and run backend.js
### 3.1. Environment values
We need an environment file including the credentials of our database. To this end make a copy of `.env.example` and name the new file as `.env` at the project root folder.
Replace the database connection values in order to match your database credentials.
It is important to notice that the file `.env` contains credentials to access your database so it **must not be pushed to your repository** (as specified in .gitignore).

NOTE: you need a database user and a database schema named `deliverus`. Check Lab0 and IISSI1 for more information.

### 3.2. Run HTTP server and connect to database
We will run our first version of the backend server. First we can inspect the operations that are needed:
* Importing modules:
```JavaScript
const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
dotenv.config()
const helmet = require('helmet')
const { Sequelize } = require('sequelize')
```
* Setup Express.js application and some middlewares for parsing requests as JSON Objects,  enabling [Cross-Origin Resource Sharing](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) (cors) or security ([helmet](https://helmetjs.github.io/))
```JavaScript
const app = express()
app.use(express.json())
app.use(cors())
app.use(helmet({ 
  crossOriginResourcePolicy: false // to allow image loading from public folder
}))
```

* Setup database connection
```JavaScript
const databaseHost = process.env.DATABASE_HOST
const databasePort = process.env.DATABASE_PORT
const databaseUsername = process.env.DATABASE_USERNAME
const databasePassword = process.env.DATABASE_PASSWORD
const databaseName = process.env.DATABASE_NAME

const sequelize = new Sequelize(databaseName, databaseUsername, databasePassword, {
  host: databaseHost,
  port: databasePort,
  dialect: 'mariadb'
})
```
* Connect to database and if success start the Express application (http server)
```JavaScript
sequelize.authenticate()
  .then(() => {
    console.info('INFO - Database connected.')
    const port = process.env.APP_PORT
    return app.listen(port)
  })
  .then((server) => {
    console.log('Deliverus listening at http://localhost:' + server.address().port)
  })
  .catch(err => {
    console.error('ERROR - Unable to connect to the database:', err)
  })
```

* Run backend.js by opening a Terminal (Ctrl+Shift+\`) and executing `npm install` (if not previously executed) and `npm start` and check terminal log. This command will launch `nodemon backend.js`, as defined in `package.json`; when using nodemon, each time you change and save some file of your project, it will stop and run it again, so it is very suitable for developing purposes.

You should read something like:
```PowerShell
[nodemon] starting `node backend.js`
Executing (default): SELECT 1+1 AS result
INFO - Database connected.
Deliverus listening at http://localhost:3000
```

* Alternatively you can run and debug your project by using the *Run and Debug* tool of VSCode. It can be found on the left-sided bar or by typing `shift+ctrl+D`, and selecting `Run Script: start` in the drop down list. Add a breakpoint at lines 33 and 36 of backend.js, and click on the play icon in the *Run and Debug* tool to debug this file. Inspect `server` and `error` variables respectively.

## 4. Migrations
Keep in mind the requirements described at: https://github.com/IISSI2-IS-2022-2023/DeliverUS-Backend-2022-2023/blob/main/README.md

And this is the Entity diagram proposed:

***

![alt text](https://user-images.githubusercontent.com/19324988/155347424-c2c87a8e-00f4-400e-8024-eca40a776c6a.png)

***

Migrations are a powerfull tool to keep your database schema and statuses tracked. During this subject, we will use them to create our database schema. Notice that you can find one migration for each entity: User, Restaurant, Product, Order (and ProductCategory + RestaurantCategory).
Each migration has two methods: `up` and `down`, that dictate how to perform the migration and undo it.
For our purposes, the `up` method will include the creation of each table and its fields, defining PrimaryKey and ForeignKeys.

You will find migrations' files completed for all entities but Restaurant.

### 4.1. Complete Create Restaurant migration
Please complete the code of the file `migrations\create_restaurant.js` in order to include the Resturant entity properties (**it is mandatory to name them as it is shown in the Entity Diagram**, specifically: name, description, address, postalCode, url, restaurantCategoryId, shippingCosts, email, logo, phone, createdAt, updatedAt, userId, status). Check Sequelize documentation for [Migrations Skeleton](https://sequelize.org/master/manual/migrations.html#migration-skeleton) and [DataTypes](https://sequelize.org/v5/manual/data-types.html); alternatively, you can check the Product migration for examples.

Keep in mind that relationships are implemented by using foreign keys. Check Restaurant relationships and define foreign key properties and how are referencing related tables. For instance, a Restaurant is related to RestarantCategory, so you may have to define the following foreign key:
```Javascript
restaurantCategoryId: {
  type: Sequelize.INTEGER,
  references: {
    model: {
      tableName: 'RestaurantCategories'
    },
    key: 'id'
  }
}

```

Once you have completed the Restaurant table migration, you should run migrations. To this end, a Command Line Interface (CLI) binary is available (named `sequelize-cli`). It uses the database connection details found at `config\config.js`.
To run migrations, execute them using npx (tool for running npm packages binaries) on the terminal:
```PowerShell
npx sequelize-cli db:migrate
```
After doing this, you should find created tables in your mariadb.

To undo migrations you can execute:
```PowerShell
npx sequelize-cli db:migrate:undo:all
```

More information about migrations can be found at: https://sequelize.org/master/manual/migrations.html

## 5. Seeders
Seed files are used to populate database tables with sample or test data. You can find them in the `seeders` folder. Notice that `restaurants_seeder.js` presumes a given naming for restaurants table fields.

You can run your seeders to populate the database by running:
```PowerShell
npx sequelize-cli db:seed:all
```

And you can undo them by running:
```PowerShell
npx sequelize-cli db:seed:undo:all
```

More information about seeders can be found at: https://sequelize.org/master/manual/migrations.html#creating-the-first-seed

---
If you make any changes to migrations or seeders, you can update the database by running the undo migrations, run migrations, and run seeders commands all at once using the `Rebuild database` task. To run this task, execute the `Run Task` command and select `Rebuild database`. You can see the command definition associated with this task in the `.vscode/tasks.json` file.


## 6. Models
Object Relational Mapping (ORM) is a software programming technique to bind business logic objects to data sources, so programmers can directly work with high-level objects in order to perform database operations seamlessly. Usually, objects that are related to database entities are called _Models_ and we work with them in order to interact with their corresponding database entities for standard CRUD (create, read, update and delete) operations. When using ORM tools you are provided with the following operations: create, findAll, update and destroy (among others).

Sequelize is a Node.js Object Relational Mapping tool that provides all the necessary tools for establishing connections to the database (as explained in [exercise 3.2](https://github.eii.us.es/IISSI2-IS/Lab1-Backend-Model/wiki#32-run-http-server-and-connect-to-database)), running migrations and seeders ([exercise 4](https://github.eii.us.es/IISSI2-IS/Lab1-Backend-Model/wiki#4-migrations) and [exercise 5](https://github.eii.us.es/IISSI2-IS/Lab1-Backend-Model/wiki#5-seeders)), defining models and perform operations.

You can find Models definitions for all entities at `models` folder. Each model is a class named after its corresponding table (but in singular) and extends the Model class from Sequelize.

### 6.1. Complete Restaurant model
Please complete the code of the file `models\restaurant.js` in order to include all the properties that match the corresponding fields of the Restaurants table.

Notice that we have also defined the relationships between Models. For instance, Restaurant model is related to RestaurantCategory, User, Product and Order. In order to define these relationships, we have to include the following method:

```Javascript
 static associate (models) {
      // define association here
      Restaurant.belongsTo(models.RestaurantCategory, { foreignKey: 'restaurantCategoryId', as: 'restaurantCategory' })
      Restaurant.belongsTo(models.User, { foreignKey: 'userId', as: 'user' })
      Restaurant.hasMany(models.Product, { foreignKey: 'restaurantId', as: 'products' })
      Restaurant.hasMany(models.Order, { foreignKey: 'restaurantId', as: 'orders' })
    }
```
On the other side of the relationship, you have to include the oposite relation For instance, you can find that a Product _belongsTo_ a Restaurant, or that a RestaurantCategory _hasMany_ Restaurant.

Finally, you can define methods that perform computations over the model. For instance, in the Restaurant model, you can find a method that computes and returns the average service time of a restaurant.
```Javascript
async getAverageServiceTime () {
      try {
        const orders = await this.getOrders()
        const serviceTimes = orders.filter(o => o.deliveredAt).map(o => moment(o.deliveredAt).diff(moment(o.createdAt), 'minutes'))
        return serviceTimes.reduce((acc, serviceTime) => acc + serviceTime, 0) / serviceTimes.length
      } catch (err) {
        return err
      }
    }
````

## 7. Test migrations, seeders and Restaurant model
In order to make a minimal test, we have included the following code at `controllers/RestaurantController.js` and `routes/RestaurantRoutes.js` (we will address the details of implementing routes and controllers in the next lab):
```Javascript
// RestaurantController.js
const models = require('../models')
const Restaurant = models.Restaurant
const RestaurantCategory = models.RestaurantCategory

exports.index = async function (req, res) {
  try {
    const restaurants = await Restaurant.findAll(
      {
        attributes: ['id', 'name', 'description', 'address', 'postalCode', 'url', 'shippingCosts', 'averageServiceMinutes', 'email', 'phone', 'logo', 'heroImage', 'status', 'restaurantCategoryId'],
        include:
      {
        model: RestaurantCategory,
        as: 'restaurantCategory'
      },
        order: [[{ model: RestaurantCategory, as: 'restaurantCategory' }, 'name', 'ASC']]
      }
    )
    res.json(restaurants)
  } catch (err) {
    res.status(500).send(err)
  }
}
```

```Javascript
// RestaurantRoutes.js
const RestaurantController = require('../controllers/RestaurantController')

module.exports = (options) => {
  const app = options.app

  app.route('/restaurants')
    .get(RestaurantController.index)
}
```

Notice that the `indexRestaurants` function performs a query to the model in order to retrieve all restaurants from the database, ordered by RestaurantCategory, and returns them as a JSON document. Next we define the endpoint `/restaurants` that answers to requests using the `indexRestaurants` function. 

In order to load all the routes defined in `routes` folder, we have included this code in `backend.js`:
```Javascript
const requireOptions = { app }
require('./routes/')(requireOptions)
```

Open ThunderClient extension (https://www.thunderclient.io/), and reload the collections by clicking on Collections → _**≡**_ menu→ reload. Collections are stored at `example_api_client

Click on Restaurants folder and you will find a simple GET ALL request. Run the request, it should return a _200 OK HTTP Status Code_ and a JSON with the Restaurants information.


# References
* Node.js docs: https://nodejs.org/en/docs/
* Express docs: https://expressjs.com/
* Sequelize docs: https://sequelize.org/master/manual/getting-started.html
* Cors: https://github.com/expressjs/cors
* Helmet: https://helmetjs.github.io/
* ThunderClient: https://www.thunderclient.io/
* JSON spec: https://www.json.org/json-en.html; (en español: https://www.json.org/json-es.html)
