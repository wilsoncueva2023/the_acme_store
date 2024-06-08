const express = require('express');
const app = express();
const morgan = require('morgan');

const {
  client,
  createTables,
  createUser,
  createProduct,
  fetchUsers,
  fetchProducts,
  createFavorite,
  fetchFavorites,
  destroyFavorite
} = require('./db');

app.use(express.json());
app.use(morgan('dev'));

app.get('/api/users', async (req, res, next) => {
  try {
    const users = await fetchUsers();
    res.send(users);
  } catch (error) {
    next(error);
  }
});

app.get('/api/products', async (req, res, next) => {
  try {
    const products = await fetchProducts();
    res.send(products);
  } catch (error) {
    next(error);
  }
});

const init = async () => {
  try {
    await client.connect();
    await createTables();

    const [alice, bob, charlie, apple, banana, cherry] = await Promise.all([
      createUser({ username: 'alice', password: 'alice@100' }),
      createUser({ username: 'bob', password: 'bob@200' }),
      createUser({ username: 'charlie', password: 'charlie@300' }),
      createProduct({ name: 'apple' }),
      createProduct({ name: 'banana' }),
      createProduct({ name: 'cherry' })
    ]);

    console.log(await fetchUsers());
    console.log(await fetchProducts());

    await Promise.all([
      createFavorite({ user_id: alice.id, product_id: apple.id }),
      createFavorite({ user_id: bob.id, product_id: banana.id }),
      createFavorite({ user_id: charlie.id, product_id: cherry.id }),
      createFavorite({ user_id: charlie.id, product_id: apple.id })
    ]);

    console.log(`CURL -X POST localhost:3000/api/users/${charlie.id}/favorites -d '{"product_id":"${banana.id}"}' -H 'Content-Type:application/json'`);
    console.log(`CURL -X DELETE localhost:3000/api/users/${charlie.id}/favorites/${charlie.id}`);

    const port = process.env.PORT || 3000;
    app.listen(port, () => console.log(`listening on port ${port}`));
  } catch (error) {
    console.error(error);
  }
};

init();
