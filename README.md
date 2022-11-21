# Node.js client for RavenDB NoSQL Database

[![NPM](https://nodei.co/npm/ravendb.png?compact=true)](https://nodei.co/npm/ravendb/)

[![build status](https://github.com/ravendb/ravendb-nodejs-client/workflows/tests/node/badge.svg?branch=v5.2)](https://github.com/ravendb/ravendb-nodejs-client/actions) [![Known Vulnerabilities](https://snyk.io/test/github/ravendb/ravendb-nodejs-client/badge.svg)](https://snyk.io/test/github/ravendb/ravendb-nodejs-client)


## Installation

```bash
npm install --save ravendb
```

## Releases and Changelog - [click here](https://github.com/ravendb/ravendb-nodejs-client/releases)

## Documentation

Please find the official documentation on [RavenDB Documentation](https://ravendb.net/docs/article-page/latest/nodejs/client-api/what-is-a-document-store) page.

## Getting started

1. Require the `DocumentStore` class from the ravendb package
```javascript
const { DocumentStore } = require('ravendb');
```
or (using ES6 / Typescript imports)
```javascript
import { DocumentStore } from 'ravendb';
```

2. Initialize the document store (you should have a single DocumentStore instance per application)
```javascript
const store = new DocumentStore('http://live-test.ravendb.net', 'databaseName');
store.initialize();
```

3. Open a session
```javascript
const session = store.openSession();
```

4. Call `saveChanges()` when you're done
```javascript
session
 .load('users/1-A') // Load document
 .then((user) => {
   user.password = PBKDF2('new password'); // Update data 
 })
 .then(() => session.saveChanges()) // Save changes
 .then(() => {
     // Data is now persisted
     // You can proceed e.g. finish web request
  });
```

## Supported asynchronous call types

Most methods on the session object are asynchronous and return a Promise.  
Either use `async & await` or `.then()` with callback functions.

1. async / await
```javascript
const session = store.openSession();
let user = await session.load('users/1-A');
user.password = PBKDF2('new password');
await session.saveChanges();
```

2. .then & callback functions
```javascript
session.load('Users/1-A')
    .then((user) => {
        user.password = PBKDF2('new password');
    })
    .then(() => session.saveChanges())
    .then(() => {
        // here session is complete
    });
```

>##### Related tests:
> <small>[async and await](https://github.com/ravendb/ravendb-nodejs-client/blob/1ba6c71a9c49bc5be17a4bed2c6b8d363d7c52bf/test/Documents/ReadmeSamples.ts#L54)</small>  
> <small>[then and callbacks](https://github.com/ravendb/ravendb-nodejs-client/blob/1ba6c71a9c49bc5be17a4bed2c6b8d363d7c52bf/test/Documents/ReadmeSamples.ts#L71)</small>

## CRUD example

### Store documents

```javascript
let product = {
    id: null,
    title: 'iPhone X',
    price: 999.99,
    currency: 'USD',
    storage: 64,
    manufacturer: 'Apple',
    in_stock: true,
    last_update: new Date('2017-10-01T00:00:00')
};

await session.store(product, 'products/1-A');
console.log(product.id); // products/1-A
await session.saveChanges();
```

>##### Related tests:
> <small>[store()](https://github.com/ravendb/ravendb-nodejs-client/blob/1ba6c71a9c49bc5be17a4bed2c6b8d363d7c52bf/test/Documents/SessionApiTests.ts#L21)</small>  
> <small>[ID generation - session.store()](https://github.com/ravendb/ravendb-nodejs-client/blob/1ba6c71a9c49bc5be17a4bed2c6b8d363d7c52bf/test/Documents/IdGeneration.ts#L9)</small>  
> <small>[store document with @metadata](https://github.com/ravendb/ravendb-nodejs-client/blob/1ba6c71a9c49bc5be17a4bed2c6b8d363d7c52bf/test/Issues/RDBC_213.ts#L16)</small>  
> <small>[storing docs with same ID in same session should throw](https://github.com/ravendb/ravendb-nodejs-client/blob/1ba6c71a9c49bc5be17a4bed2c6b8d363d7c52bf/test/Ported/TrackEntityTest.ts#L62)</small>

### Load documents

```javascript
const product = await session.load('products/1-A');
console.log(product.title); // iPhone X
console.log(product.id);    // products/1-A
```

> ##### Related tests:
> <small>[load()](https://github.com/ravendb/ravendb-nodejs-client/blob/1ba6c71a9c49bc5be17a4bed2c6b8d363d7c52bf/test/Documents/SessionApiTests.ts#L64)</small>

### Load documents with include

```javascript
// users/1
// {
//      "name": "John",
//      "kids": ["users/2", "users/3"]
// }

const session = store.openSession();
const user1 = await session
    .include("kids")
    .load("users/1");
    // Document users/1 and all docs referenced in "kids"
    // will be fetched from the server in a single request.

const user2 = await session.load("users/2"); // this won't call server again

assert.ok(user1);
assert.ok(user2);
assert.equal(session.advanced.numberOfRequests, 1);
```

>##### Related tests:
> <small>[can load with includes](https://github.com/ravendb/ravendb-nodejs-client/blob/1ba6c71a9c49bc5be17a4bed2c6b8d363d7c52bf/test/Ported/Documents/LoadTest.ts#L29)</small>  
> <small>[loading data with include](https://github.com/ravendb/ravendb-nodejs-client/blob/1ba6c71a9c49bc5be17a4bed2c6b8d363d7c52bf/test/Documents/ReadmeSamples.ts#L127)</small>  
> <small>[loading data with passing includes](https://github.com/ravendb/ravendb-nodejs-client/blob/1ba6c71a9c49bc5be17a4bed2c6b8d363d7c52bf/test/Documents/ReadmeSamples.ts#L147)</small>

### Update documents

```javascript
let product = await session.load('products/1-A');
product.in_stock = false;
product.last_update = new Date();
await session.saveChanges();
// ...
product = await session.load('products/1-A');
console.log(product.in_stock);    // false
console.log(product.last_update); // the current date
```

>##### Related tests:
> <small>[update document](https://github.com/ravendb/ravendb-nodejs-client/blob/1ba6c71a9c49bc5be17a4bed2c6b8d363d7c52bf/test/Documents/ReadmeSamples.ts#L168)</small>  
> <small>[update document metadata](https://github.com/ravendb/ravendb-nodejs-client/blob/1ba6c71a9c49bc5be17a4bed2c6b8d363d7c52bf/test/Issues/RDBC_213.ts#L35)</small>

### Delete documents

1. Using entity
```javascript
let product = await session.load('products/1-A');
await session.delete(product);
await session.saveChanges();

product = await session.load('products/1-A');
console.log(product); // null
```

2. Using document ID
```javascript
await session.delete('products/1-A');
```

>##### Related tests:
> <small>[delete doc by entity](https://github.com/ravendb/ravendb-nodejs-client/blob/1ba6c71a9c49bc5be17a4bed2c6b8d363d7c52bf/test/Ported/DeleteTest.ts#L20)</small>  
> <small>[delete doc by ID](https://github.com/ravendb/ravendb-nodejs-client/blob/1ba6c71a9c49bc5be17a4bed2c6b8d363d7c52bf/test/Ported/DeleteTest.ts#L38)</small>  
> <small>[onBeforeDelete is called before delete by ID](https://github.com/ravendb/ravendb-nodejs-client/blob/1ba6c71a9c49bc5be17a4bed2c6b8d363d7c52bf/test/Ported/Issues/RavenDB_15492.ts#L16)</small>  
> <small>[cannot delete untracked entity](https://github.com/ravendb/ravendb-nodejs-client/blob/1ba6c71a9c49bc5be17a4bed2c6b8d363d7c52bf/test/Ported/TrackEntityTest.ts#L20)</small>  
> <small>[loading deleted doc returns null](https://github.com/ravendb/ravendb-nodejs-client/blob/1ba6c71a9c49bc5be17a4bed2c6b8d363d7c52bf/test/Ported/TrackEntityTest.ts#L32)</small>

## Query documents

1. Use `query()` session method:  
Query by collection:  
```javascript
const query = session.query({ collection: 'products' });
```
Query by index name:  
```javascript
const query = session.query({ indexName: 'productsByCategory' });
```
Query by index:  
```javascript
const query = session.query(Product, Product_ByName);
```
Query by entity type:  
```javascript
import { User } from "./models";
const query = session.query(User);
```

2. Build up the query - apply search conditions, set ordering, etc.  
   Query supports chaining calls:
```javascript
query
    .waitForNonStaleResults()
    .usingDefaultOperator('AND')
    .whereEquals('manufacturer', 'Apple')
    .whereEquals('in_stock', true)
    .whereBetween('last_update', new Date('2022-11-01T00:00:00'), new Date())
    .orderBy('price');
```

3. Execute the query to get results:
```javascript
const results = await query.all(); // get all results
// ...
const firstResult = await query.first(); // gets first result
// ...
const single = await query.single();  // gets single result 
```

### Query methods overview

#### selectFields() - projections using a single field
```javascript
// RQL
// from users select name

// Query
const userNames = await session.query({ collection: "users" })
    .selectFields("name")
    .all();

// Sample results
// John,Stefanie,Thomas
```

>##### Related tests:
> <small>[projections single field](https://github.com/ravendb/ravendb-nodejs-client/blob/1ba6c71a9c49bc5be17a4bed2c6b8d363d7c52bf/test/Documents/ReadmeSamples.ts#L322)</small>  
> <small>[query single property](https://github.com/ravendb/ravendb-nodejs-client/blob/1ba6c71a9c49bc5be17a4bed2c6b8d363d7c52bf/test/Ported/QueryTest.ts#L231)</small>  
> <small>[retrieve camel case with projection](https://github.com/ravendb/ravendb-nodejs-client/blob/1ba6c71a9c49bc5be17a4bed2c6b8d363d7c52bf/test/Documents/CustomKeyCaseConventionsTests.ts#L288)</small>  
> <small>[can_project_id_field](https://github.com/ravendb/ravendb-nodejs-client/blob/1ba6c71a9c49bc5be17a4bed2c6b8d363d7c52bf/test/Ported/Issues/RavenDB_14811.ts#L58)</small>  

#### selectFields() - projections using multiple fields
```javascript
// RQL
// from users select name, age

// Query
await session.query({ collection: "users" })
    .selectFields([ "name", "age" ])
    .all();

// Sample results
// [ { name: 'John', age: 30 },
//   { name: 'Stefanie', age: 25 },
//   { name: 'Thomas', age: 25 } ]
```

>##### Related tests:
> <small>[projections multiple fields](https://github.com/ravendb/ravendb-nodejs-client/blob/1ba6c71a9c49bc5be17a4bed2c6b8d363d7c52bf/test/Documents/ReadmeSamples.ts#L328)</small>  
> <small>[query with projection](https://github.com/ravendb/ravendb-nodejs-client/blob/1ba6c71a9c49bc5be17a4bed2c6b8d363d7c52bf/test/Ported/QueryTest.ts#L318)</small>  
> <small>[retrieve camel case with projection](https://github.com/ravendb/ravendb-nodejs-client/blob/1ba6c71a9c49bc5be17a4bed2c6b8d363d7c52bf/test/Documents/CustomKeyCaseConventionsTests.ts#L288)</small>  
> <small>[can_project_id_field](https://github.com/ravendb/ravendb-nodejs-client/blob/1ba6c71a9c49bc5be17a4bed2c6b8d363d7c52bf/test/Ported/Issues/RavenDB_14811.ts#L58)</small>  

#### distinct()
```javascript
// RQL
// from users select distinct age

// Query
await session.query({ collection: "users" })
    .selectFields("age")
    .distinct()
    .all();

// Sample results
// [ 30, 25 ]
```

>##### Related tests:
> <small>[distinct](https://github.com/ravendb/ravendb-nodejs-client/blob/1ba6c71a9c49bc5be17a4bed2c6b8d363d7c52bf/test/Documents/ReadmeSamples.ts#L334)</small>  
> <small>[query distinct](https://github.com/ravendb/ravendb-nodejs-client/blob/1ba6c71a9c49bc5be17a4bed2c6b8d363d7c52bf/test/Ported/QueryTest.ts#L350)</small>

#### whereEquals() / whereNotEquals()
```javascript
// RQL
// from users where age = 30 

// Query
await session.query({ collection: "users" })
    .whereEquals("age", 30)
    .all();

// Saple results
// [ User {
//    name: 'John',
//    age: 30,
//    kids: [...],
//    registeredAt: 2017-11-10T23:00:00.000Z } ]
```

>##### Related tests:
> <small>[where equals](https://github.com/ravendb/ravendb-nodejs-client/blob/1ba6c71a9c49bc5be17a4bed2c6b8d363d7c52bf/test/Documents/ReadmeSamples.ts#L341)</small>  
> <small>[where not equals](https://github.com/ravendb/ravendb-nodejs-client/blob/1ba6c71a9c49bc5be17a4bed2c6b8d363d7c52bf/test/Ported/QueryTest.ts#L451)</small>

#### whereIn()
```javascript
// RQL
// from users where name in ("John", "Thomas")

// Query
await session.query({ collection: "users" })
    .whereIn("name", ["John", "Thomas"])
    .all();

// Sample results
// [ User {
//     name: 'John',
//     age: 30,
//     registeredAt: 2017-11-10T23:00:00.000Z,
//     kids: [...],
//     id: 'users/1-A' },
//   User {
//     name: 'Thomas',
//     age: 25,
//     registeredAt: 2016-04-24T22:00:00.000Z,
//     id: 'users/3-A' } ]
```

>##### Related tests:
> <small>[where in]()(https://github.com/ravendb/ravendb-nodejs-client/blob/1ba6c71a9c49bc5be17a4bed2c6b8d363d7c52bf/test/Documents/ReadmeSamples.ts#L347)</small>  
> <small>[query with where in](https://github.com/ravendb/ravendb-nodejs-client/blob/1ba6c71a9c49bc5be17a4bed2c6b8d363d7c52bf/test/Ported/QueryTest.ts#L256)</small>


#### whereStartsWith() / whereEndsWith()
```javascript
// RQL
// from users where startsWith(name, 'J')

// Query
await session.query({ collection: "users" })
    .whereStartsWith("name", "J")
    .all();

// Sample results
// [ User {
//    name: 'John',
//    age: 30,
//    kids: [...],
//    registeredAt: 2017-11-10T23:00:00.000Z } ]
```

>##### Related tests:
> <small>[query with where clause](https://github.com/ravendb/ravendb-nodejs-client/blob/1ba6c71a9c49bc5be17a4bed2c6b8d363d7c52bf/test/Ported/QueryTest.ts#L148)</small>

#### whereBetween()
```javascript
// RQL
// from users where registeredAt between '2016-01-01' and '2017-01-01'

// Query
await session.query({ collection: "users" })
    .whereBetween("registeredAt", new Date(2016, 0, 1), new Date(2017, 0, 1))
    .all();

// Sample results
// [ User {
//     name: 'Thomas',
//     age: 25,
//     registeredAt: 2016-04-24T22:00:00.000Z,
//     id: 'users/3-A' } ]
```

>##### Related tests:
> <small>[where between](https://github.com/ravendb/ravendb-nodejs-client/blob/1ba6c71a9c49bc5be17a4bed2c6b8d363d7c52bf/test/Documents/ReadmeSamples.ts#L353)</small>  
> <small>[query with where between](https://github.com/ravendb/ravendb-nodejs-client/blob/1ba6c71a9c49bc5be17a4bed2c6b8d363d7c52bf/test/Ported/QueryTest.ts#L265)</small>

#### whereGreaterThan() / whereGreaterThanOrEqual() / whereLessThan() / whereLessThanOrEqual()
```javascript
// RQL
// from users where age > 29

// Query
await session.query({ collection: "users" })
    .whereGreaterThan("age", 29)
    .all();

// Sample results
// [ User {
//   name: 'John',
//   age: 30,
//   registeredAt: 2017-11-10T23:00:00.000Z,
//   kids: [...],
//   id: 'users/1-A' } ]
```

>##### Related tests:
> <small>[where greater than](https://github.com/ravendb/ravendb-nodejs-client/blob/1ba6c71a9c49bc5be17a4bed2c6b8d363d7c52bf/test/Documents/ReadmeSamples.ts#L359)</small>  
> <small>[query with where less than](https://github.com/ravendb/ravendb-nodejs-client/blob/1ba6c71a9c49bc5be17a4bed2c6b8d363d7c52bf/test/Ported/QueryTest.ts#L275)</small>  
> <small>[query with where less than or equal](https://github.com/ravendb/ravendb-nodejs-client/blob/1ba6c71a9c49bc5be17a4bed2c6b8d363d7c52bf/test/Ported/QueryTest.ts#L285)</small>  
> <small>[query with where greater than](https://github.com/ravendb/ravendb-nodejs-client/blob/1ba6c71a9c49bc5be17a4bed2c6b8d363d7c52bf/test/Ported/QueryTest.ts#L294)</small>  
> <small>[query with where greater than or equal](https://github.com/ravendb/ravendb-nodejs-client/blob/1ba6c71a9c49bc5be17a4bed2c6b8d363d7c52bf/test/Ported/QueryTest.ts#L304)</small>  

#### whereExists()
Checks if the field exists.
```javascript
// RQL
// from users where exists("age")

// Query
await session.query({ collection: "users" })
    .whereExists("kids")
    .all();

// Sample results
// [ User {
//   name: 'John',
//   age: 30,
//   registeredAt: 2017-11-10T23:00:00.000Z,
//   kids: [...],
//   id: 'users/1-A' } ]
```

>##### Related tests:
> <small>[where exists](https://github.com/ravendb/ravendb-nodejs-client/blob/1ba6c71a9c49bc5be17a4bed2c6b8d363d7c52bf/test/Documents/ReadmeSamples.ts#L365)</small>  
> <small>[query where exists](https://github.com/ravendb/ravendb-nodejs-client/blob/1ba6c71a9c49bc5be17a4bed2c6b8d363d7c52bf/test/Ported/QueryTest.ts#L503)</small>

#### containsAny() / containsAll()
```javascript
// RQL
// from users where kids in ('Mara')

// Query
await session.query({ collection: "users" })
    .containsAll("kids", ["Mara", "Dmitri"])
    .all();

// Sample results
// [ User {
//   name: 'John',
//   age: 30,
//   registeredAt: 2017-11-10T23:00:00.000Z,
//   kids: ["Dmitri", "Mara"]
//   id: 'users/1-A' } ]
```

>##### Related tests:
> <small>[where contains any](https://github.com/ravendb/ravendb-nodejs-client/blob/1ba6c71a9c49bc5be17a4bed2c6b8d363d7c52bf/test/Documents/ReadmeSamples.ts#L371)</small>  
> <small>[queries with contains](https://github.com/ravendb/ravendb-nodejs-client/blob/1ba6c71a9c49bc5be17a4bed2c6b8d363d7c52bf/test/Ported/ContainsTest.ts#L19)</small>

#### search()
Perform full-text search.
```javascript
// RQL
// from users where search(kids, 'Mara')

// Query
await session.query({ collection: "users" })
    .search("kids", "Mara Dmitri")
    .all();

// Sample results
// [ User {
//   name: 'John',
//   age: 30,
//   registeredAt: 2017-11-10T23:00:00.000Z,
//   kids: ["Dmitri", "Mara"]
//   id: 'users/1-A' } ]
```

>##### Related tests:
> <small>[search()](https://github.com/ravendb/ravendb-nodejs-client/blob/1ba6c71a9c49bc5be17a4bed2c6b8d363d7c52bf/test/Documents/ReadmeSamples.ts#L377)</small>  
> <small>[query search with or](https://github.com/ravendb/ravendb-nodejs-client/blob/1ba6c71a9c49bc5be17a4bed2c6b8d363d7c52bf/test/Ported/QueryTest.ts#L362)</small>  
> <small>[query_CreateClausesForQueryDynamicallyWithOnBeforeQueryEvent](https://github.com/ravendb/ravendb-nodejs-client/blob/1ba6c71a9c49bc5be17a4bed2c6b8d363d7c52bf/test/Ported/QueryTest.ts#L30)</small>  

#### openSubclause() / closeSubclause()
```javascript
// RQL
// from users where exists(kids) or (age = 25 and name != Thomas)

// Query
await session.query({ collection: "users" })
    .whereExists("kids")
    .orElse()
    .openSubclause()
        .whereEquals("age", 25)
        .whereNotEquals("name", "Thomas")
    .closeSubclause()
    .all();

// Sample results
// [ User {
//     name: 'John',
//     age: 30,
//     registeredAt: 2017-11-10T23:00:00.000Z,
//     kids: ["Dmitri", "Mara"]
//     id: 'users/1-A' },
//   User {
//     name: 'Stefanie',
//     age: 25,
//     registeredAt: 2015-07-29T22:00:00.000Z,
//     id: 'users/2-A' } ]
```

>##### Related tests:
> <small>[subclause](https://github.com/ravendb/ravendb-nodejs-client/blob/1ba6c71a9c49bc5be17a4bed2c6b8d363d7c52bf/test/Documents/ReadmeSamples.ts#L384)</small>  
> <small>[working with subclause](https://github.com/ravendb/ravendb-nodejs-client/blob/1ba6c71a9c49bc5be17a4bed2c6b8d363d7c52bf/test/Ported/Issues/RavenDB_5669.ts#L40)</small>

#### not()
```javascript
// RQL
// from users where age != 25

// Query
await session.query({ collection: "users" })
    .not()
    .whereEquals("age", 25)
    .all();

// Sample results
// [ User {
//   name: 'John',
//   age: 30,
//   registeredAt: 2017-11-10T23:00:00.000Z,
//   kids: ["Dmitri", "Mara"]
//   id: 'users/1-A' } ]
```

>##### Related tests:
> <small>[not()](https://github.com/ravendb/ravendb-nodejs-client/blob/1ba6c71a9c49bc5be17a4bed2c6b8d363d7c52bf/test/Documents/ReadmeSamples.ts#L395)</small>  
> <small>[query where not](https://github.com/ravendb/ravendb-nodejs-client/blob/1ba6c71a9c49bc5be17a4bed2c6b8d363d7c52bf/test/Ported/QueryTest.ts#L451)</small>

#### orElse() / andAlso()
```javascript
// RQL
// from users where exists(kids) or age < 30

// Query
await session.query({ collection: "users" })
    .whereExists("kids")
    .orElse()
    .whereLessThan("age", 30)
    .all();

// Sample results
//  [ User {
//     name: 'John',
//     age: 30,
//     registeredAt: 2017-11-10T23:00:00.000Z,
//     kids: [ 'Dmitri', 'Mara' ],
//     id: 'users/1-A' },
//   User {
//     name: 'Thomas',
//     age: 25,
//     registeredAt: 2016-04-24T22:00:00.000Z,
//     id: 'users/3-A' },
//   User {
//     name: 'Stefanie',
//     age: 25,
//     registeredAt: 2015-07-29T22:00:00.000Z,
//     id: 'users/2-A' } ]
```

>##### Related tests:
> <small>[orElse](https://github.com/ravendb/ravendb-nodejs-client/blob/1ba6c71a9c49bc5be17a4bed2c6b8d363d7c52bf/test/Documents/ReadmeSamples.ts#L402)</small>  
> <small>[working with subclause](https://github.com/ravendb/ravendb-nodejs-client/blob/1ba6c71a9c49bc5be17a4bed2c6b8d363d7c52bf/test/Ported/Issues/RavenDB_5669.ts#L40)</small>

#### usingDefaultOperator()
If neither `andAlso()` nor `orElse()` is called then the default operator between the query filtering conditions will be `AND` .  
You can override that with `usingDefaultOperator` which must be called before any other where conditions.
```javascript
// RQL
// from users where exists(kids) or age < 29

// Query
await session.query({ collection: "users" })
    .usingDefaultOperator("OR") // override the default 'AND' operator
    .whereExists("kids")
    .whereLessThan("age", 29)
    .all();

// Sample results
//  [ User {
//     name: 'John',
//     age: 30,
//     registeredAt: 2017-11-10T23:00:00.000Z,
//     kids: [ 'Dmitri', 'Mara' ],
//     id: 'users/1-A' },
//   User {
//     name: 'Thomas',
//     age: 25,
//     registeredAt: 2016-04-24T22:00:00.000Z,
//     id: 'users/3-A' },
//   User {
//     name: 'Stefanie',
//     age: 25,
//     registeredAt: 2015-07-29T22:00:00.000Z,
//     id: 'users/2-A' } ]
```

>##### Related tests:
> <small>[set default operator](https://github.com/ravendb/ravendb-nodejs-client/blob/1ba6c71a9c49bc5be17a4bed2c6b8d363d7c52bf/test/Documents/ReadmeSamples.ts#L409)</small>  
> <small>[AND is used when default operator is not set](https://github.com/ravendb/ravendb-nodejs-client/blob/1ba6c71a9c49bc5be17a4bed2c6b8d363d7c52bf/test/Issues/RDBC_649.ts#L36)</small>  
> <small>[set default operator to OR](https://github.com/ravendb/ravendb-nodejs-client/blob/1ba6c71a9c49bc5be17a4bed2c6b8d363d7c52bf/test/Issues/RDBC_649.ts#L45)</small>  

#### orderBy() / orderByDesc() / orderByScore() / randomOrdering()
```javascript
// RQL
// from users order by age

// Query
await session.query({ collection: "users" })
    .orderBy("age")
    .all();

// Sample results
// [ User {
//     name: 'Stefanie',
//     age: 25,
//     registeredAt: 2015-07-29T22:00:00.000Z,
//     id: 'users/2-A' },
//   User {
//     name: 'Thomas',
//     age: 25,
//     registeredAt: 2016-04-24T22:00:00.000Z,
//     id: 'users/3-A' },
//   User {
//     name: 'John',
//     age: 30,
//     registeredAt: 2017-11-10T23:00:00.000Z,
//     kids: [ 'Dmitri', 'Mara' ],
//     id: 'users/1-A' } ]
```

>##### Related tests:
> <small>[orderBy()](https://github.com/ravendb/ravendb-nodejs-client/blob/1ba6c71a9c49bc5be17a4bed2c6b8d363d7c52bf/test/Documents/ReadmeSamples.ts#L419)</small>  
> <small>[orderByDesc()](https://github.com/ravendb/ravendb-nodejs-client/blob/1ba6c71a9c49bc5be17a4bed2c6b8d363d7c52bf/test/Documents/ReadmeSamples.ts#L429)</small>  
> <small>[query random order](https://github.com/ravendb/ravendb-nodejs-client/blob/1ba6c71a9c49bc5be17a4bed2c6b8d363d7c52bf/test/Ported/QueryTest.ts#L451)</small>  
> <small>[order by AlphaNumeric](https://github.com/ravendb/ravendb-nodejs-client/blob/1ba6c71a9c49bc5be17a4bed2c6b8d363d7c52bf/test/Ported/QueryTest.ts#L548)</small>  
> <small>[query with boost - order by score](https://github.com/ravendb/ravendb-nodejs-client/blob/1ba6c71a9c49bc5be17a4bed2c6b8d363d7c52bf/test/Ported/QueryTest.ts#L517)</small>

#### take()
Limit the number of query results.
```javascript
// RQL
// from users order by age

// Query
await session.query({ collection: "users" })
    .orderBy("age") 
    .take(2) // only the first 2 entries will be returned
    .all();

// Sample results
// [ User {
//     name: 'Stefanie',
//     age: 25,
//     registeredAt: 2015-07-29T22:00:00.000Z,
//     id: 'users/2-A' },
//   User {
//     name: 'Thomas',
//     age: 25,
//     registeredAt: 2016-04-24T22:00:00.000Z,
//     id: 'users/3-A' } ]
```

>##### Related tests:
> <small>[take()](https://github.com/ravendb/ravendb-nodejs-client/blob/1ba6c71a9c49bc5be17a4bed2c6b8d363d7c52bf/test/Documents/ReadmeSamples.ts#L439)</small>  
> <small>[query skip take](https://github.com/ravendb/ravendb-nodejs-client/blob/1ba6c71a9c49bc5be17a4bed2c6b8d363d7c52bf/test/Ported/QueryTest.ts#L385)</small>  
> <small>[canUseOffsetWithCollectionQuery](https://github.com/ravendb/ravendb-nodejs-client/blob/1ba6c71a9c49bc5be17a4bed2c6b8d363d7c52bf/test/Ported/Issues/RavenDB_17551.ts#L17)</small>

#### skip()
Skip a specified number of results from the start.
```javascript
// RQL
// from users order by age

// Query
await session.query({ collection: "users" })
    .orderBy("age") 
    .take(1) // return only 1 result
    .skip(1) // skip the first result, return the second result
    .all();

// Sample results
// [ User {
//     name: 'Thomas',
//     age: 25,
//     registeredAt: 2016-04-24T22:00:00.000Z,
//     id: 'users/3-A' } ]
```

>##### Related tests:
> <small>[skip()](https://github.com/ravendb/ravendb-nodejs-client/blob/1ba6c71a9c49bc5be17a4bed2c6b8d363d7c52bf/test/Documents/ReadmeSamples.ts#L449)</small>  
> <small>[query skip take](https://github.com/ravendb/ravendb-nodejs-client/blob/1ba6c71a9c49bc5be17a4bed2c6b8d363d7c52bf/test/Ported/QueryTest.ts#L385)</small>  
> <small>[canUseOffsetWithCollectionQuery](https://github.com/ravendb/ravendb-nodejs-client/blob/1ba6c71a9c49bc5be17a4bed2c6b8d363d7c52bf/test/Ported/Issues/RavenDB_17551.ts#L17)</small>  

#### Getting query statistics
Use the `statistics()` method to obtain query statistics.  
```javascript
// Query
let stats: QueryStatistics;
const results = await session.query({ collection: "users" })
    .whereGreaterThan("age", 29)
    .statistics(s => stats = s)
    .all();

// Sample results
// QueryStatistics {
//   isStale: false,
//   durationInMs: 744,
//   totalResults: 1,
//   skippedResults: 0,
//   timestamp: 2018-09-24T05:34:15.260Z,
//   indexName: 'Auto/users/Byage',
//   indexTimestamp: 2018-09-24T05:34:15.260Z,
//   lastQueryTime: 2018-09-24T05:34:15.260Z,
//   resultEtag: 8426908718162809000 }
```

>##### Related tests:
> <small>[can get stats](https://github.com/ravendb/ravendb-nodejs-client/blob/1ba6c71a9c49bc5be17a4bed2c6b8d363d7c52bf/test/Documents/ReadmeSamples.ts#L458)</small>  

#### all() / first() / single() / count()
`all()` - returns all results

`first()` - first result only

`single()` - first result, throws error if there's more entries

`count()` - returns the number of entries in the results (not affected by `take()`)

>##### Related tests:
> <small>[query first and single](https://github.com/ravendb/ravendb-nodejs-client/blob/1ba6c71a9c49bc5be17a4bed2c6b8d363d7c52bf/test/Ported/QueryTest.ts#L467)</small>  
> <small>[query count](https://github.com/ravendb/ravendb-nodejs-client/blob/1ba6c71a9c49bc5be17a4bed2c6b8d363d7c52bf/test/Ported/QueryTest.ts#L834)</small>

### Attachments

#### Store attachments
```javascript
const doc = new User({ name: "John" });

// track entity
await session.store(doc);

// get read stream or buffer to store
const fileStream = fs.createReadStream("../photo.png");

// store attachment using entity
session.advanced.attachments.store(doc, "photo.png", fileStream, "image/png");

// OR using document ID
session.advanced.attachments.store(doc.id, "photo.png", fileStream, "image/png");

await session.saveChanges();
```

#### Get attachments
```javascript
const attachment = await session.advanced.attachments.get(documentId, "photo.png")
// attachment.details contains information about the attachment:
//     { 
//       name: 'photo.png',
//       documentId: 'users/1-A',
//       contentType: 'image/png',
//       hash: 'MvUEcrFHSVDts5ZQv2bQ3r9RwtynqnyJzIbNYzu1ZXk=',
//       changeVector: '"A:3-K5TR36dafUC98AItzIa6ow"',
//       size: 4579 
//     }

// attachment.data is a Readable https://nodejs.org/api/stream.html#stream_class_stream_readable
attachment.data
    .pipe(fs.createWriteStream("photo.png"))
    .on("finish", () => next());
```

#### Check if attachment exists
```javascript
await session.advanced.attachments.exists(doc.id, "photo.png");
// true

await session.advanced.attachments.exists(doc.id, "not_there.avi");
// false
```

#### Get attachment names
```javascript
// use a loaded entity to determine attachments' names
await session.advanced.attachments.getNames(doc);
// [ { name: 'photo.png',
//     hash: 'MvUEcrFHSVDts5ZQv2bQ3r9RwtynqnyJzIbNYzu1ZXk=',
//     contentType: 'image/png',
//     size: 4579 } ]
```

### TimeSeries

#### Store time series
```javascript
// create document with time series
const session = store.openSession();
await session.store({ name: "John" }, "users/1");
const tsf = session.timeSeriesFor("users/1", "heartbeat");
tsf.append(new Date(), 120);
await session.saveChanges();
```

#### Get time series for document
```javascript
// load time series by document by given name
const session = store.openSession();
const tsf = session.timeSeriesFor("users/1", "heartbeat");
const heartbeats = await tsf.get();
```

### Bulk Insert

```javascript
// create bulk insert instance using DocumentStore instance
const bulkInsert = store.bulkInsert();

// insert your documents
for (const name of ["Anna", "Maria", "Miguel", "Emanuel", "Dayanara", "Aleida"]) {
    const user = new User({ name });
    await bulkInsert.store(user);
}
// User { name: 'Anna', id: 'users/1-A' }
// User { name: 'Maria', id: 'users/2-A' }
// User { name: 'Miguel', id: 'users/3-A' }
// User { name: 'Emanuel', id: 'users/4-A' }
// User { name: 'Dayanara', id: 'users/5-A' }
// User { name: 'Aleida', id: 'users/6-A' }

// flush data and finish
await bulkInsert.finish();
```

### Changes API

Listen for database changes e.g. document changes.

```javascript
const changes = store.changes();
const docsChanges = changes.forAllDocuments();

docsChanges.on("data", change => {
// { type: 'Put',
//   id: 'users/1-A',
//   collectionName: 'Users',
//   changeVector: 'A:2-QCawZTDbuEa4HUBORhsWYA' }
});

docsChanges.on("error", err => {
    // handle errors
})

{
    const session = store.openSession();
    await session.store(new User({ name: "Starlord" }));
    await session.saveChanges();
}

// ...
// dispose changes instance once you're done
changes.dispose();
```

### Streaming

#### Stream documents with ID prefix
```javascript
const userStream = await session.advanced.stream("users/");
// stream() method returns a Readable 

userStream.on("data", user => {
    // User { name: 'Anna', id: 'users/1-A' }
});
userStream.on("error", err => {
    // handle errors
})
```

#### Stream query results
```javascript
// create a query
const query = session.query({ collection: "users" }).whereGreaterThan("age", 29);

let stats;
// stream() returns a Readable 
// get query stats passing a stats callback to stream() method
const queryStream = await session.advanced.stream(query, _ => stats = _);

queryStream.on("data", user => {
    // User { name: 'Anna', id: 'users/1-A' }
});

// get stats using an event listener
queryStream.once("stats", stats => {
// { resultEtag: 7464021133404493000,
//   isStale: false,
//   indexName: 'Auto/users/Byage',
//   totalResults: 1,
//   indexTimestamp: 2018-10-01T09:04:07.145Z }
});

queryStream.on("error", err => {
    // handle errors
});
```

### Revisions

NOTE: Please make sure revisions are enabled before trying one of the below.

```javascript
const session = store.openSession();
const user = {
    name: "Marcin",
    age: 30,
    pet: "users/4"
};

await session.store(user, "users/1");
await session.saveChanges();

// modify the document to create a new revision
user.name = "Roman";
user.age = 40;
await session.saveChanges();

// get revisions
const revisions = await session.advanced.revisions.getFor("users/1");
// [ { name: 'Roman',
//     age: 40,
//     pet: 'users/4',
//     '@metadata': [Object],
//     id: 'users/1' },
//   { name: 'Marcin',
//     age: 30,
//     pet: 'users/4',
//     '@metadata': [Object],
//     id: 'users/1' } ]
```

### Suggestions

```javascript
// users collection
// [ User {
//     name: 'John',
//     age: 30,
//     registeredAt: 2017-11-10T23:00:00.000Z,
//     kids: [Array],
//     id: 'users/1-A' },

// and a static index like:
class UsersIndex extends AbstractJavaScriptIndexCreationTask {
    constructor() {
        super();
        this.map(User, doc => {
            return {
                name: doc.name
            }
        });
        this.suggestion("name");
    }
}

// ...

const session = store.openSession();
const suggestionQueryResult = await session.query(User, UsersIndex)
    .suggestUsing(x => x.byField("name", "Jon"))
    .execute();
// { name: { name: 'name', suggestions: [ 'john' ] } }
```

### Advanced patching

```javascript
session.advanced.increment("users/1", "age", 1);
// increments *age* field by 1

session.advanced.patch("users/1", "underAge", false);
// sets *underAge* field to *false*

await session.saveChanges();
```

### Subscriptions

```javascript
// create a subscription
const subscriptionName = await store.subscriptions.create({
    query: "from users where age >= 30"
});

// get subscription worker for your subscription
const subscription = store.subscriptions.getSubscriptionWorker({ subscriptionName });

subscription.on("error", err => {
    // handle errors
});

subscription.on("batch", (batch, callback) => {
    try {
        // do batch processing on batch.items
        // batch.items:
        // [ Item {
        //     changeVector: 'A:2-r6nkF5nZtUKhcPEk6/LL+Q',
        //     id: 'users/1-A',
        //     rawResult:
        //      { name: 'John',
        //        age: 30,
        //        registeredAt: '2017-11-11T00:00:00.0000000',
        //        kids: [Array],
        //        '@metadata': [Object],
        //        id: 'users/1-A' },
        //     rawMetadata:
        //      { '@collection': 'Users',
        //        '@nested-object-types': [Object],
        //        'Raven-Node-Type': 'User',
        //        '@change-vector': 'A:2-r6nkF5nZtUKhcPEk6/LL+Q',
        //        '@id': 'users/1-A',
        //        '@last-modified': '2018-10-18T11:15:51.4882011Z' },
        //     exceptionMessage: undefined } ]
        // ...

        // call the callback, once you're done
        callback();
    } catch(err) {
        // if processing fails for a particular batch
        // pass the error to the callback
        callback(err);
    }
});
```

## Using object literals for entities

In order to comfortably use object literals as entities set the function getting collection name based on the content of the object - `store.conventions.findCollectionNameForObjectLiteral()`.

```javascript
const store = new DocumentStore(urls, database);
store.conventions.findCollectionNameForObjectLiteral = entity => entity["collection"];
// ...
store.initialize();
```

This needs to be done *before* an `initialize()` call on `DocumentStore` instance. If you fail to do so, your entites will land up in *@empty* collection having an *UUID* for an ID. E.g.

## Using classes for entities

1. Define your model as class. Attributes should be just public properties:
```javascript
export class Product {
  constructor(
    id = null,
    title = '',
    price = 0,
    currency = 'USD',
    storage = 0,
    manufacturer = '',
    in_stock = false,
    last_update = null
  ) {
    Object.assign(this, {
      title,
      price,
      currency,
      storage,
      manufacturer,
      in_stock,
      last_update: last_update || new Date()
    });
  }
}
```

2. To store a document pass its instance to `store()`. Collection name will be detected automatically using entity's class name.
```javascript
import { Product } from "./models";

let product = new Product(
  null, 'iPhone X', 999.99, 'USD', 64, 'Apple', true, new Date('2017-10-01T00:00:00'));

product = await session.store(product);
console.log(product instanceof Product);         // true
console.log(product.id.includes('products/'));   // true
await session.saveChanges();
```

3. When loading document, you can use `session.load()`. Pass class constructor as a second argument:
```javascript
let product = await session.load('products/1-A', Product);
console.log(product instanceof Product);    // true
console.log(product.id);                    // Products/1-A
```

*NOTE: To limit passing class constructors around, register the type in document store's conventions like so:*
```javascript
import { Product } from "./models";
const store = new DocumentStore(url, dbName);
store.conventions.registerEntityType(Product);

// ...

let product = await session.load('products/1-A');
console.log(product instanceof Product);    // true
console.log(product.id);                    // Products/1-A
```

4. When querying documents, you pass class constructor as `documentType` option of `session.query({ ... })`:
```javascript
let products = await session.query({
  collection: 'products',
  documentType: Product // you can drop this if type has been registered in conventions using store.conventions.registerEntityType()
}).all();

products.forEach((product) => {
  console.log(product instanceof Product); // true
  console.log(product.id.includes('Products/')); // true
});
```

## Usage with TypeScript

TypeScript typings are embedded into the package (see `types` property in `package.json`).

```typescript

// file models/product.ts

export class Product {
  constructor(
    public id: string = null,
    public title: string = '',
    public price: number = 0,
    public currency: string = 'USD',
    public storage: number = 0,
    public manufacturer: string = '',
    public in_stock: boolean = false,
    public last_update: Date = null
  ) {}
}

// file app.ts
import {Product} from "models/product";
import {DocumentStore, IDocumentStore, IDocumentSession, IDocumentQuery, DocumentConstructor, QueryOperators} from 'ravendb';

const store: IDocumentStore = new DocumentStore('url', 'database name');
store.conventions.registerEntityType(Product);
let session: IDocumentSession;

store.initialize();

(async (): Promise<void> => {
  let product = new Product(
    null, 'iPhone X', 999.99, 'USD', 64, 'Apple', true, new Date('2017-10-01T00:00:00')
  );

  await session.store<Product>(product);
  await session.saveChanges();
  console.log(product instanceof Product); // true
  console.log(product.id.includes('products/')); // true

  product = await session.load<Product>('products/1-A');
  console.log(product instanceof Product); // true
  console.log(product.id); // products/1-A

  let products: Product[] = await session
    .query<Product>({ collection: 'Products' })
    .waitForNonStaleResults()
    .whereEquals('manufacturer', 'Apple')
    .whereEquals('in_stock', true)
    .whereBetween('last_update', new Date('2017-10-01T00:00:00'), new Date())
    .whereGreaterThanOrEqual('storage', 64)
    .all();

  products.forEach((product: Product): void => {
    console.log(product instanceof Product); // true
    console.log(product.id.includes('products/')); // true
  });
})();
```

## Working with secured server

1. Fill auth options object. Pass contents of the pem/pfx certificate, specify its type and (optionally) a passphrase:
```javascript
const {DocumentStore, Certificate} = require('ravendb');

const certificate = `
-----BEGIN CERTIFICATE-----
...
-----END CERTIFICATE-----
-----BEGIN RSA PRIVATE KEY-----
...
-----END RSA PRIVATE KEY-----
`;

let authOptions = {
  certificate,
  type: "pem",
  password: "my passphrase" // optional  
};
``` 

PFX certificates content should be passed as `Buffer` object:

```javascript
const {DocumentStore} = require('ravendb');
const fs = require('fs');

const certificate = './cert.pfx';

let authOptions = {
  certificate: fs.readFileSync(certificate),
  type: "pfx",
  password: 'my passphrase' // optional  
};
``` 

2. Pass auth options as third argument to `DocumentStore` constructor:

```javascript
let store = new DocumentStore('url', 'databaseName', authOptions);
store.initialize();
```

## Building

```bash
npm install
npm run build
```

## Running tests

```bash
# To run the suite one needs to set the following environment variables:
# 
# - the location of RavenDB server binary:
# RAVENDB_TEST_SERVER_PATH="C:\\work\\test\\Server\\Raven.Server.exe" 
#
# - certificate path for tests requiring secure server
# RAVENDB_TEST_SERVER_CERTIFICATE_PATH="C:\\work\\test\\cluster.server.certificate.pfx"
#
# - certificate hostname 
# RAVENDB_TEST_SERVER_HOSTNAME="a.nodejstest.development.run"
#
npm test 
```
